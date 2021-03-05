
local ViewBase = require("app.ui.ViewBase")
local RebornHistoryHeroLayer = class("RebornHistoryHeroLayer", ViewBase)
local RebornHistoryHeroNode = require("app.scene.view.recovery.RebornHistoryHeroNode")
local PopupRecoveryPreview = require("app.scene.view.recovery.PopupRecoveryPreview")
local RecoveryConst = require("app.const.RecoveryConst")
local AudioConst = require("app.const.AudioConst")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

function RebornHistoryHeroLayer:ctor(sceneId)
	self._fileNode = nil --武将
	self._buttonReborn = nil --重生按钮
	self._textTip = nil --提示字

	local resource = {
		file = Path.getCSB("RebornHistoryHeroLayer", "recovery"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonReborn = {
				events = {{event = "touch", method = "_onButtonRebornClicked"}},
			},
		},
	}
	RebornHistoryHeroLayer.super.ctor(self, resource, sceneId)
end

function RebornHistoryHeroLayer:onCreate()
	self._buttonReborn:setString(Lang.get("reborn_btn"))
	self._textTip:setString(Lang.get("recovery_tip_13"))
	self._node = RebornHistoryHeroNode.new(self._fileNode, handler(self, self._onClickAdd), handler(self, self._onClickDelete))

	self._fileNodeCost:showResName(true, Lang.get("reborn_cost_title"))
	local costCount = RecoveryDataHelper.getRebornCostCount()
	self._fileNodeCost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount)
	self._fileNodeCost:setTextColor(Colors.DARK_BG_ONE)
end

function RebornHistoryHeroLayer:onEnter()
	self._signalHistoricalHeroReborn = G_SignalManager:add(SignalConst.EVENT_HISTORY_HERO_REBORN_SUCCESS, handler(self, self._heroRebornSuccess))
	self:setRebornHeroData(nil)
	self:_updateView()
end

function RebornHistoryHeroLayer:onExit()
	self._signalHistoricalHeroReborn:remove()
	self._signalHistoricalHeroReborn = nil
end

function RebornHistoryHeroLayer:initInfo()
	self:setRebornHeroData(nil)
	self:_updateView()
end

function RebornHistoryHeroLayer:_updateView()
	local heroData = self:getRebornHeroData()
	if heroData then
		local baseId = heroData:getSystem_id()
		self._node:updateInfo(baseId)
	else
		self._node:updateInfo(nil)
	end
end

function RebornHistoryHeroLayer:_onButtonRebornClicked()
	local heroData = self:getRebornHeroData()
	if heroData == nil then
		G_Prompt:showTip(Lang.get("reborn_no_historicalhero_tip"))
		return
	end
	local popupRecoveryPreview = PopupRecoveryPreview.new(heroData, RecoveryConst.RECOVERY_TYPE_13, handler(self, self._doReborn))
	popupRecoveryPreview:openWithAction()
end

function RebornHistoryHeroLayer:_doReborn()
	local costCount = RecoveryDataHelper.getRebornCostCount()
	local success, popFunc = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount)
	if not success then
		return
	end

	local recoveryId = self._rebornHeroData:getId()
	dump(recoveryId)
	G_UserData:getHistoryHero():c2sStarReborn(recoveryId)
	self._buttonReborn:setEnabled(false)
end

function RebornHistoryHeroLayer:_onClickAdd()
	local bornHero = G_UserData:getHistoryHero():getCanRebornHisoricalHero()
	if next(bornHero) == nil then
		G_Prompt:showTip(Lang.get("historyhero_popup_empty"))
	else
		-- Show-Dialog
		local HistoryHeroConst = require("app.const.HistoryHeroConst")
		local PopupChooseHistoricalItemView = require("app.scene.view.historyhero.PopupChooseHistoricalItemView").new(
														HistoryHeroConst.TAB_TYPE_REBORN, nil, handler(self, self._onChooseHero))
		PopupChooseHistoricalItemView:open()
	end
end

function RebornHistoryHeroLayer:_onClickDelete()
	self:setRebornHeroData(nil)
end

function RebornHistoryHeroLayer:_heroRebornSuccess(eventName, awards)
	require("app.utils.data.RecoveryDataHelper").sortAward(awards)
    self:_playEffect(awards)
end

function RebornHistoryHeroLayer:_playEffect(awards)
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

function RebornHistoryHeroLayer:_resetHeroNode()
	self._fileNode:setVisible(true)
	self:setRebornHeroData(nil)
	self:_updateView()
end

function RebornHistoryHeroLayer:setRebornHeroData(data)
	self._rebornHeroData = data
end

function RebornHistoryHeroLayer:getRebornHeroData()
	return self._rebornHeroData
end

function RebornHistoryHeroLayer:_onChooseHero(uniqueId)
	local data = G_UserData:getHistoryHero():getHisoricalHeroValueById(uniqueId)
	self:setRebornHeroData(data)
	self:_updateView()
end

return RebornHistoryHeroLayer