--
-- Author: Liangxu
-- Date: 2017-9-19 14:28:02
-- 神兵重生
local ViewBase = require("app.ui.ViewBase")
local RebornInstrumentLayer = class("RebornInstrumentLayer", ViewBase)
local RebornInstrumentNode = require("app.scene.view.recovery.RebornInstrumentNode")
local PopupRecoveryPreview = require("app.scene.view.recovery.PopupRecoveryPreview")
local RecoveryConst = require("app.const.RecoveryConst")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

function RebornInstrumentLayer:ctor(sceneId)
	self._fileNode = nil --武将
	self._buttonReborn = nil --重生按钮
	self._textTip = nil --提示字

	local resource = {
		file = Path.getCSB("RebornInstrumentLayer", "recovery"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonReborn = {
				events = {{event = "touch", method = "_onButtonRebornClicked"}},
			},
		},
	}
	RebornInstrumentLayer.super.ctor(self, resource, sceneId)
end

function RebornInstrumentLayer:onCreate()
	self._buttonReborn:setString(Lang.get("reborn_btn"))
	self._textTip:setString(Lang.get("recovery_tip_8"))
	self._node = RebornInstrumentNode.new(self._fileNode, handler(self, self._onClickAdd), handler(self, self._onClickDelete))

	self._fileNodeCost:showResName(true, Lang.get("reborn_cost_title"))
	local costCount = RecoveryDataHelper.getRebornCostCount()
	self._fileNodeCost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount)
	self._fileNodeCost:setTextColor(Colors.DARK_BG_ONE)
end

function RebornInstrumentLayer:onEnter()
	self._signalInstrumentReborn = G_SignalManager:add(SignalConst.EVENT_INSTRUMENT_REBORN_SUCCESS, handler(self, self._instrumentRebornSuccess))
	self:setRebornInstrumentData(nil)
	self:_updateView()
end

function RebornInstrumentLayer:onExit()
	self._signalInstrumentReborn:remove()
	self._signalInstrumentReborn = nil
end

function RebornInstrumentLayer:initInfo()
	self:setRebornInstrumentData(nil)
	self:_updateView()
end

function RebornInstrumentLayer:_updateView()
	local data = self:getRebornInstrumentData()
	if data then
		local baseId = data:getBase_id()
		local limitLevel = data:getLimit_level()
		self._node:updateInfo(baseId, limitLevel)
	else
		self._node:updateInfo(nil)
	end
end

function RebornInstrumentLayer:_onButtonRebornClicked()
	local data = self:getRebornInstrumentData()
	if data == nil then
		G_Prompt:showTip(Lang.get("reborn_no_instrument_tip"))
		return
	end
	local popupRecoveryPreview = PopupRecoveryPreview.new(data, RecoveryConst.RECOVERY_TYPE_8, handler(self, self._doReborn))
	popupRecoveryPreview:openWithAction()
end

function RebornInstrumentLayer:_doReborn()
	local costCount = RecoveryDataHelper.getRebornCostCount()
	local success, popFunc = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount)
	if not success then
		return
	end
	
	local recoveryId = self._rebornInstrumentData:getId()
	G_UserData:getInstrument():c2sInstrumentReborn(recoveryId)
	self._buttonReborn:setEnabled(false)
end

function RebornInstrumentLayer:_onClickAdd()
	local PopupChooseInstrumentHelper = require("app.ui.PopupChooseInstrumentHelper")
	local popup = require("app.ui.PopupChooseInstrument").new()
	local callBack = handler(self, self._onChooseInstrument)
	popup:setTitle(Lang.get("recovery_choose_instrument_title"))
	popup:updateUI(PopupChooseInstrumentHelper.FROM_TYPE3, callBack, result)
	popup:openWithAction()
end

function RebornInstrumentLayer:_onClickDelete()
	self:setRebornInstrumentData(nil)
end

function RebornInstrumentLayer:_instrumentRebornSuccess(eventName, awards)
	require("app.utils.data.RecoveryDataHelper").sortAward(awards)
	self:_playEffect(awards)
end

function RebornInstrumentLayer:_playEffect(awards)
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
    		self:_resetInstrumentNode()
    		self._buttonReborn:setEnabled(true)
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_chongsheng", effectFunction, eventFunction , false)
end

function RebornInstrumentLayer:_resetInstrumentNode()
	self._fileNode:setVisible(true)
	self:setRebornInstrumentData(nil)
	self:_updateView()
end

function RebornInstrumentLayer:setRebornInstrumentData(data)
	self._rebornInstrumentData = data
end

function RebornInstrumentLayer:getRebornInstrumentData()
	return self._rebornInstrumentData
end

function RebornInstrumentLayer:_onChooseInstrument(instrumentId)
	local data = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
	self:setRebornInstrumentData(data)
	self:_updateView()
end

return RebornInstrumentLayer