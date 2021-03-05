--
-- Author: Liangxu
-- Date: 2017-04-28 10:29:08
-- 武将重生
local ViewBase = require("app.ui.ViewBase")
local RebornHeroLayer = class("RebornHeroLayer", ViewBase)
local RebornHeroNode = require("app.scene.view.recovery.RebornHeroNode")
local PopupRecoveryPreview = require("app.scene.view.recovery.PopupRecoveryPreview")
local RecoveryConst = require("app.const.RecoveryConst")
local AudioConst = require("app.const.AudioConst")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

function RebornHeroLayer:ctor(sceneId)
	self._fileNode = nil --武将
	self._buttonReborn = nil --重生按钮
	self._textTip = nil --提示字

	local resource = {
		file = Path.getCSB("RebornHeroLayer", "recovery"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonReborn = {
				events = {{event = "touch", method = "_onButtonRebornClicked"}},
			},
		},
	}
	RebornHeroLayer.super.ctor(self, resource, sceneId)
end

function RebornHeroLayer:onCreate()
	self._buttonReborn:setString(Lang.get("reborn_btn"))
	self._textTip:setString(Lang.get("recovery_tip_2"))
	self._node = RebornHeroNode.new(self._fileNode, handler(self, self._onClickAdd), handler(self, self._onClickDelete))

	self._fileNodeCost:showResName(true, Lang.get("reborn_cost_title"))
	local costCount = RecoveryDataHelper.getRebornCostCount()
	self._fileNodeCost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount)
	self._fileNodeCost:setTextColor(Colors.DARK_BG_ONE)
end

function RebornHeroLayer:onEnter()
	self._signalHeroReborn = G_SignalManager:add(SignalConst.EVENT_HERO_REBORN_SUCCESS, handler(self, self._heroRebornSuccess))
	self:setRebornHeroData(nil)
	self:_updateView()
end

function RebornHeroLayer:onExit()
	self._signalHeroReborn:remove()
	self._signalHeroReborn = nil
end

function RebornHeroLayer:initInfo()
	self:setRebornHeroData(nil)
	self:_updateView()
end

function RebornHeroLayer:_updateView()
	local heroData = self:getRebornHeroData()
	if heroData then
		local baseId = heroData:getBase_id()
		local limitLevel = heroData:getLimit_level()
		local limitRedLevel = heroData:getLimit_rtg()
		self._node:updateInfo(baseId, limitLevel, limitRedLevel)
	else
		self._node:updateInfo(nil)
	end
end

function RebornHeroLayer:_onButtonRebornClicked()
	local heroData = self:getRebornHeroData()
	if heroData == nil then
		G_Prompt:showTip(Lang.get("reborn_no_hero_tip"))
		return
	end
	local popupRecoveryPreview = PopupRecoveryPreview.new(heroData, RecoveryConst.RECOVERY_TYPE_2, handler(self, self._doReborn))
	popupRecoveryPreview:openWithAction()
end

function RebornHeroLayer:_doReborn()
	local costCount = RecoveryDataHelper.getRebornCostCount()
	local success, popFunc = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount)
	if not success then
		return
	end

	local recoveryId = self._rebornHeroData:getId()
	G_UserData:getHero():c2sHeroReborn(recoveryId)
	self._buttonReborn:setEnabled(false)
end

function RebornHeroLayer:_onClickAdd()
	local PopupChooseHeroHelper = require("app.ui.PopupChooseHeroHelper")
	local isEmpty = PopupChooseHeroHelper.checkIsEmpty(PopupChooseHeroHelper.FROM_TYPE7)
	if isEmpty then
		G_Prompt:showTip(Lang.get("hero_popup_list_empty_tip"..PopupChooseHeroHelper.FROM_TYPE7))
	else
		local popup = require("app.ui.PopupChooseHero").new()
		local callBack = handler(self,self._onChooseHero)
		popup:setTitle(Lang.get("recovery_choose_hero_title"))
		popup:updateUI(PopupChooseHeroHelper.FROM_TYPE7, callBack)
		popup:openWithAction()
	end
end

function RebornHeroLayer:_onClickDelete()
	self:setRebornHeroData(nil)
end

function RebornHeroLayer:_heroRebornSuccess(eventName, awards)
	require("app.utils.data.RecoveryDataHelper").sortAward(awards)
    self:_playEffect(awards)
end

function RebornHeroLayer:_playEffect(awards)
	local function effectFunction(effect)
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "start" then
			G_EffectGfxMgr:applySingleGfx(self._fileNode, "smoving_zhuangbei", nil, nil, nil)
		elseif event == "play" then
			self._fileNode:setVisible(false)
		elseif event == "finish" then
			local PopupGetRewards = require("app.ui.PopupGetRewards").new()
    		PopupGetRewards:showRewards(awards)
    		self:_resetHeroNode()
    		self._buttonReborn:setEnabled(true)
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_chongsheng", effectFunction, eventFunction , false)
	G_AudioManager:playSoundWithId(AudioConst.SOUND_HERO_REBORN) --播音效
end

function RebornHeroLayer:_resetHeroNode()
	self._fileNode:setVisible(true)
	self:setRebornHeroData(nil)
	self:_updateView()
end

function RebornHeroLayer:setRebornHeroData(data)
	self._rebornHeroData = data
end

function RebornHeroLayer:getRebornHeroData()
	return self._rebornHeroData
end

function RebornHeroLayer:_onChooseHero(heroId)
	local data = G_UserData:getHero():getUnitDataWithId(heroId)
	self:setRebornHeroData(data)
	self:_updateView()
end

return RebornHeroLayer