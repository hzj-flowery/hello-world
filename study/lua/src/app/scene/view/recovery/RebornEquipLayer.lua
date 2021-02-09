--
-- Author: Liangxu
-- Date: 2017-04-28 10:34:00
-- 装备重生
local ViewBase = require("app.ui.ViewBase")
local RebornEquipLayer = class("RebornEquipLayer", ViewBase)
local RebornEquipNode = require("app.scene.view.recovery.RebornEquipNode")
local PopupRecoveryPreview = require("app.scene.view.recovery.PopupRecoveryPreview")
local RecoveryConst = require("app.const.RecoveryConst")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

function RebornEquipLayer:ctor(sceneId)

	self._fileNode = nil --武将
	self._buttonReborn = nil --重生按钮
	self._textTip = nil --提示字

	local resource = {
		file = Path.getCSB("RebornEquipLayer", "recovery"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonReborn = {
				events = {{event = "touch", method = "_onButtonRebornClicked"}},
			},
		},
	}
	RebornEquipLayer.super.ctor(self, resource, sceneId)
end

function RebornEquipLayer:onCreate()
	self._buttonReborn:setString(Lang.get("reborn_btn"))
	self._textTip:setString(Lang.get("recovery_tip_4"))
	self._node = RebornEquipNode.new(self._fileNode, handler(self, self._onClickAdd), handler(self, self._onClickDelete))

	self._fileNodeCost:showResName(true, Lang.get("reborn_cost_title"))
	local costCount = RecoveryDataHelper.getRebornCostCount()
	self._fileNodeCost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount)
	self._fileNodeCost:setTextColor(Colors.DARK_BG_ONE)
end

function RebornEquipLayer:onEnter()
	self._signalEquipReborn = G_SignalManager:add(SignalConst.EVENT_EQUIP_REBORN_SUCCESS, handler(self, self._equipRebornSuccess))
	self:setRebornEquipData(nil)
	self:_updateView()
end

function RebornEquipLayer:onExit()
	self._signalEquipReborn:remove()
	self._signalEquipReborn = nil
end

function RebornEquipLayer:initInfo()
	self:setRebornEquipData(nil)
	self:_updateView()
end

function RebornEquipLayer:_updateView()
	local data = self:getRebornEquipData()
	if data then
		local baseId = data:getBase_id()
		self._node:updateInfo(baseId)
	else
		self._node:updateInfo(nil)
	end
end

function RebornEquipLayer:_onButtonRebornClicked()
	local data = self:getRebornEquipData()
	if data == nil then
		G_Prompt:showTip(Lang.get("reborn_no_equip_tip"))
		return
	end
	local popupRecoveryPreview = PopupRecoveryPreview.new(data, RecoveryConst.RECOVERY_TYPE_4, handler(self, self._doReborn))
	popupRecoveryPreview:openWithAction()
end

function RebornEquipLayer:_doReborn()
	local costCount = RecoveryDataHelper.getRebornCostCount()
	local success, popFunc = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount)
	if not success then
		return
	end
	
	local recoveryId = self._rebornEquipData:getId()
	G_UserData:getEquipment():c2sEquipmentReborn(recoveryId)
	self._buttonReborn:setEnabled(false)
end

function RebornEquipLayer:_onClickAdd()
	local PopupChooseEquipHelper = require("app.ui.PopupChooseEquipHelper")
	local popup = require("app.ui.PopupChooseEquip").new()
	local callBack = handler(self, self._onChooseEquip)
	popup:setTitle(Lang.get("recovery_choose_equip_title"))
	popup:updateUI(PopupChooseEquipHelper.FROM_TYPE3, callBack, result)
	popup:openWithAction()
end

function RebornEquipLayer:_onClickDelete()
	self:setRebornEquipData(nil)
end

function RebornEquipLayer:_equipRebornSuccess(eventName, awards)
	require("app.utils.data.RecoveryDataHelper").sortAward(awards)
	self:_playEffect(awards)
end

function RebornEquipLayer:_playEffect(awards)
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
    		self:_resetEquipNode()
    		self._buttonReborn:setEnabled(true)
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_chongsheng", effectFunction, eventFunction , false)
end

function RebornEquipLayer:_resetEquipNode()
	self._fileNode:setVisible(true)
	self:setRebornEquipData(nil)
	self:_updateView()
end

function RebornEquipLayer:setRebornEquipData(data)
	self._rebornEquipData = data
end

function RebornEquipLayer:getRebornEquipData()
	return self._rebornEquipData
end

function RebornEquipLayer:_onChooseEquip(equipId)
	local data = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
	self:setRebornEquipData(data)
	self:_updateView()
end

return RebornEquipLayer