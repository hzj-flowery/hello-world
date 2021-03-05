--
-- Author: Liangxu
-- Date: 2017-05-16 16:04:30
-- 宝物重生
local ViewBase = require("app.ui.ViewBase")
local RebornTreasureLayer = class("RebornTreasureLayer", ViewBase)
local RebornTreasureNode = require("app.scene.view.recovery.RebornTreasureNode")
local PopupRecoveryPreview = require("app.scene.view.recovery.PopupRecoveryPreview")
local RecoveryConst = require("app.const.RecoveryConst")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

function RebornTreasureLayer:ctor(sceneId)
	self._fileNode = nil --武将
	self._buttonReborn = nil --重生按钮
	self._textTip = nil --提示字

	local resource = {
		file = Path.getCSB("RebornTreasureLayer", "recovery"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonReborn = {
				events = {{event = "touch", method = "_onButtonRebornClicked"}},
			},
		},
	}
	RebornTreasureLayer.super.ctor(self, resource, sceneId)
end

function RebornTreasureLayer:onCreate()
	self._buttonReborn:setString(Lang.get("reborn_btn"))
	self._textTip:setString(Lang.get("recovery_tip_6"))
	self._node = RebornTreasureNode.new(self._fileNode, handler(self, self._onClickAdd), handler(self, self._onClickDelete))

	self._fileNodeCost:showResName(true, Lang.get("reborn_cost_title"))
	local costCount = RecoveryDataHelper.getRebornCostCount()
	self._fileNodeCost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount)
	self._fileNodeCost:setTextColor(Colors.DARK_BG_ONE)
end

function RebornTreasureLayer:onEnter()
	self._signalTreasureReborn = G_SignalManager:add(SignalConst.EVENT_TREASURE_REBORN_SUCCESS, handler(self, self._treasureRebornSuccess))
	self:setRebornTreasureData(nil)
	self:_updateView()
end

function RebornTreasureLayer:onExit()
	self._signalTreasureReborn:remove()
	self._signalTreasureReborn = nil
end

function RebornTreasureLayer:initInfo()
	self:setRebornTreasureData(nil)
	self:_updateView()
end

function RebornTreasureLayer:_updateView()
	local data = self:getRebornTreasureData()
	if data then
		local baseId = data:getBase_id()
		self._node:updateInfo(baseId)
	else
		self._node:updateInfo(nil)
	end
end

function RebornTreasureLayer:_onButtonRebornClicked()
	local data = self:getRebornTreasureData()
	if data == nil then
		G_Prompt:showTip(Lang.get("reborn_no_treasure_tip"))
		return
	end
	local popupRecoveryPreview = PopupRecoveryPreview.new(data, RecoveryConst.RECOVERY_TYPE_6, handler(self, self._doReborn))
	popupRecoveryPreview:openWithAction()
end

function RebornTreasureLayer:_doReborn()
	local costCount = RecoveryDataHelper.getRebornCostCount()
	local success, popFunc = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount)
	if not success then
		return
	end
	
	local recoveryId = self._rebornTreasureData:getId()
	G_UserData:getTreasure():c2sRebornTreasure(recoveryId)
	self._buttonReborn:setEnabled(false)
end

function RebornTreasureLayer:_onClickAdd()
	local PopupChooseTreasureHelper = require("app.ui.PopupChooseTreasureHelper")
	local popup = require("app.ui.PopupChooseTreasure").new()
	local callBack = handler(self, self._onChooseTreasure)
	popup:setTitle(Lang.get("recovery_choose_treasure_title"))
	popup:updateUI(PopupChooseTreasureHelper.FROM_TYPE3, callBack, result)
	popup:openWithAction()
end

function RebornTreasureLayer:_onClickDelete()
	self:setRebornTreasureData(nil)
end

function RebornTreasureLayer:_treasureRebornSuccess(eventName, awards)
	require("app.utils.data.RecoveryDataHelper").sortAward(awards)
	self:_playEffect(awards)
end

function RebornTreasureLayer:_playEffect(awards)
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
    		self:_resetTreasureNode()
    		self._buttonReborn:setEnabled(true)
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_chongsheng", effectFunction, eventFunction , false)
end

function RebornTreasureLayer:_resetTreasureNode()
	self._fileNode:setVisible(true)
	self:setRebornTreasureData(nil)
	self:_updateView()
end

function RebornTreasureLayer:setRebornTreasureData(data)
	self._rebornTreasureData = data
end

function RebornTreasureLayer:getRebornTreasureData()
	return self._rebornTreasureData
end

function RebornTreasureLayer:_onChooseTreasure(treasureId)
	local data = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
	self:setRebornTreasureData(data)
	self:_updateView()
end

return RebornTreasureLayer