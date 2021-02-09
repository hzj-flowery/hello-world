
--
-- Author: Liangxu
-- Date: 2018-8-29
-- 战马重生
local ViewBase = require("app.ui.ViewBase")
local RebornHorseLayer = class("RebornHorseLayer", ViewBase)
local RebornHorseNode = require("app.scene.view.recovery.RebornHorseNode")
local PopupRecoveryPreview = require("app.scene.view.recovery.PopupRecoveryPreview")
local RecoveryConst = require("app.const.RecoveryConst")
local AudioConst = require("app.const.AudioConst")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

function RebornHorseLayer:ctor(sceneId)
	self._fileNode = nil
	self._buttonReborn = nil --重生按钮
	self._textTip = nil --提示字

	local resource = {
		file = Path.getCSB("RebornHorseLayer", "recovery"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonReborn = {
				events = {{event = "touch", method = "_onButtonRebornClicked"}},
			},
		},
	}
	RebornHorseLayer.super.ctor(self, resource, sceneId)
end

function RebornHorseLayer:onCreate()
	self._buttonReborn:setString(Lang.get("reborn_btn"))
	self._textTip:setString(Lang.get("recovery_tip_12"))
	self._node = RebornHorseNode.new(self._fileNode, handler(self, self._onClickAdd), handler(self, self._onClickDelete))

	self._fileNodeCost:showResName(true, Lang.get("reborn_cost_title"))
	local costCount = RecoveryDataHelper.getRebornCostCount()
	self._fileNodeCost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount)
	self._fileNodeCost:setTextColor(Colors.DARK_BG_ONE)
end

function RebornHorseLayer:onEnter()
	self._signalHorseReborn = G_SignalManager:add(SignalConst.EVENT_HORSE_REBORN_SUCCESS, handler(self, self._horseRebornSuccess))
	self:setRebornHorseData(nil)
	self:_updateView()
end

function RebornHorseLayer:onExit()
	self._signalHorseReborn:remove()
	self._signalHorseReborn = nil
end

function RebornHorseLayer:initInfo()
	self:setRebornHorseData(nil)
	self:_updateView()
end

function RebornHorseLayer:_updateView()
	local horseData = self:getRebornHorseData()
	if horseData then
		self._node:updateInfo(horseData)
	else
		self._node:updateInfo(nil)
	end
end

function RebornHorseLayer:_onButtonRebornClicked()
	local horseData = self:getRebornHorseData()
	if horseData == nil then
		G_Prompt:showTip(Lang.get("reborn_no_hero_tip"))
		return
	end
	local popupRecoveryPreview = PopupRecoveryPreview.new(horseData, RecoveryConst.RECOVERY_TYPE_12, handler(self, self._doReborn))
	popupRecoveryPreview:openWithAction()
end

function RebornHorseLayer:_doReborn()
	local costCount = RecoveryDataHelper.getRebornCostCount()
	local success, popFunc = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount)
	if not success then
		return
	end

	local recoveryId = self._rebornHorseData:getId()
	G_UserData:getHorse():c2sWarHorseReborn(recoveryId)
	self._buttonReborn:setEnabled(false)
end

function RebornHorseLayer:_onClickAdd()
	local PopupChooseHorseHelper = require("app.ui.PopupChooseHorseHelper")
	local isEmpty = PopupChooseHorseHelper.checkIsEmpty(PopupChooseHorseHelper.FROM_TYPE3)
	if isEmpty then
		G_Prompt:showTip(Lang.get("horse_popup_list_empty_tip"..PopupChooseHorseHelper.FROM_TYPE3))
	else
		local popup = require("app.ui.PopupChooseHorse").new()
		local callBack = handler(self,self._onChooseHorse)
		popup:setTitle(Lang.get("recovery_choose_horse_title"))
		popup:updateUI(PopupChooseHorseHelper.FROM_TYPE3, callBack)
		popup:openWithAction()
	end
end

function RebornHorseLayer:_onClickDelete()
	self:setRebornHorseData(nil)
end

function RebornHorseLayer:_horseRebornSuccess(eventName, awards)
	require("app.utils.data.RecoveryDataHelper").sortAward(awards)
    self:_playEffect(awards)
end

function RebornHorseLayer:_playEffect(awards)
	local function effectFunction(effect)
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "start" then
			G_EffectGfxMgr:applySingleGfx(self._fileNode, "smoving_zhuangbei", nil, nil, nil)
		elseif event == "play" then
			self._fileNode:setVisible(false)
		elseif event == "finish" then
			local popup = require("app.ui.PopupGetRewards").new()
    		popup:showRewards(awards)
    		self:_resetHorseNode()
    		self._buttonReborn:setEnabled(true)
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_chongsheng", effectFunction, eventFunction , false)
	G_AudioManager:playSoundWithId(AudioConst.SOUND_HERO_REBORN) --播音效
end

function RebornHorseLayer:_resetHorseNode()
	self._fileNode:setVisible(true)
	self:setRebornHorseData(nil)
	self:_updateView()
end

function RebornHorseLayer:setRebornHorseData(data)
	self._rebornHorseData = data
end

function RebornHorseLayer:getRebornHorseData()
	return self._rebornHorseData
end

function RebornHorseLayer:_onChooseHorse(horseId)
	local data = G_UserData:getHorse():getUnitDataWithId(horseId)
	self:setRebornHorseData(data)
	self:_updateView()
end

return RebornHorseLayer