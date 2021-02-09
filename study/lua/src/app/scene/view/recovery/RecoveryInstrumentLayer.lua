--
-- Author: Liangxu
-- Date: 2017-9-19 14:04:36
-- 神兵回收
local ViewBase = require("app.ui.ViewBase")
local RecoveryInstrumentLayer = class("RecoveryInstrumentLayer", ViewBase)
local RecoveryInstrumentNode = require("app.scene.view.recovery.RecoveryInstrumentNode")
local PopupRecoveryPreview = require("app.scene.view.recovery.PopupRecoveryPreview")
local RecoveryConst = require("app.const.RecoveryConst")

function RecoveryInstrumentLayer:ctor(sceneId)
	self._fileNode1 = nil --神兵回收单件
	self._fileNode2 = nil
	self._fileNode3 = nil 
	self._fileNode4 = nil 
	self._fileNode5 = nil 
	self._buttonAutoAdd = nil --自动添加按钮
	self._buttonRecovery = nil --回收按钮
	self._textTip = nil --提示字

	local resource = {
		file = Path.getCSB("RecoveryInstrumentLayer", "recovery"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonAutoAdd = {
				events = {{event = "touch", method = "_onButtonAutoAddClicked"}},
			},
			_buttonRecovery = {
				events = {{event = "touch", method = "_onButtonRecoveryClicked"}},
			},
		},
	}
	RecoveryInstrumentLayer.super.ctor(self, resource, sceneId)
end

function RecoveryInstrumentLayer:onCreate()
	for i = 1, 5 do
		self["_node"..i] = RecoveryInstrumentNode.new(self["_fileNode"..i], i, handler(self, self._onClickAdd), handler(self, self._onClickDelete))
	end
	self._buttonAutoAdd:setString(Lang.get("recovery_btn_auto_add"))
	self._buttonRecovery:setString(Lang.get("recovery_btn_recovery"))
	self._textTip:setString(Lang.get("recovery_tip_7"))
end

function RecoveryInstrumentLayer:onEnter()
	self._signalInstrumentRecovery = G_SignalManager:add(SignalConst.EVENT_INSTRUMENT_RECYCLE_SUCCESS, handler(self, self._instrumentRecoverySuccess))

	self._recoveryInstrumentList = {}
	self:_updateView()
end

function RecoveryInstrumentLayer:onExit()
	self._signalInstrumentRecovery:remove()
	self._signalInstrumentRecovery = nil
end

function RecoveryInstrumentLayer:initInfo()
	self._recoveryInstrumentList = {}
	self:_updateView()
end

function RecoveryInstrumentLayer:_resetInstrumentNode()
	for i = 1, 5 do
		self["_node"..i]:reset()

	end
	self._recoveryInstrumentList = {}
	self:_updateView()
end

function RecoveryInstrumentLayer:_updateView()
	for i = 1, 5 do
		local data = self:getInstrumentWithIndex(i)
		if data then
			self["_node"..i]:updateInfo(data:getBase_id(), data:getLimit_level())
		else
			self["_node"..i]:updateInfo(nil)
		end
	end
end

function RecoveryInstrumentLayer:_onButtonAutoAddClicked()
	local list = G_UserData:getInstrument():getRecoveryAutoList()
	if #list == 0 then
		G_Prompt:showTip(Lang.get("recovery_auto_add_no_instrument"))
		return
	end
	for i = 1, 5 do
		local instrumentData = self:getInstrumentWithIndex(i)
		if instrumentData == nil then
			for j, data in ipairs(list) do
				if not self:checkIsAdded(data) then
					self:insertInstrument(i, data)
					break
				end
			end
		end
	end

	self:_updateView()
end

function RecoveryInstrumentLayer:_onButtonRecoveryClicked()
	local count = self:getInstrumentCount()
	if count <= 0 then
		G_Prompt:showTip(Lang.get("recovery_no_instrument_tip"))
		return
	end
	local popupRecoveryPreview = PopupRecoveryPreview.new(self._recoveryInstrumentList, RecoveryConst.RECOVERY_TYPE_7, handler(self, self._doRecovery))
	popupRecoveryPreview:openWithAction()
end

function RecoveryInstrumentLayer:_doRecovery()
	local recoveryId = {}
	for k, data in pairs(self._recoveryInstrumentList) do
		table.insert(recoveryId, data:getId())
	end
	G_UserData:getInstrument():c2sInstrumentRecycle(recoveryId)
	self:_setBtnEnable(false)
end

function RecoveryInstrumentLayer:_setBtnEnable(enable)
	self._buttonAutoAdd:setEnabled(enable)
	self._buttonRecovery:setEnabled(enable)
end

function RecoveryInstrumentLayer:_onClickAdd()
	local PopupCheckInstrumentHelper = require("app.ui.PopupCheckInstrumentHelper")
	local popup = require("app.ui.PopupCheckInstrument").new(self)
	local callBack = handler(self, self._updateView)
	popup:updateUI(PopupCheckInstrumentHelper.FROM_TYPE1, callBack)
	popup:openWithAction()
end

function RecoveryInstrumentLayer:_onClickDelete(pos)
	self._recoveryInstrumentList[pos] = nil
end

function RecoveryInstrumentLayer:_instrumentRecoverySuccess(eventName, awards)
	require("app.utils.data.RecoveryDataHelper").sortAward(awards)
	self:_playInstrumentFlyEffect(awards)
end

function RecoveryInstrumentLayer:_playInstrumentFlyEffect(awards)
	local function callback()
		self:_playShake(awards)
	end
	local finishPlayed = false
	for i = 1, 5 do
		local data = self:getInstrumentWithIndex(i)
		if data then
			local finishCallback = nil
			if finishPlayed == false then --结束特效只播一次
				finishCallback = callback
				finishPlayed = true
			end
			self["_node"..i]:playFlyEffect(self._nodeFlyTarget, finishCallback)
		end
	end
end

function RecoveryInstrumentLayer:_playShake(awards)
	-- G_EffectGfxMgr:applySingleGfx(self._imageLu, "smoving_zhuangbei", nil, nil, nil)
	self:_playLight(awards)
end

function RecoveryInstrumentLayer:_playLight(awards)
	local function effectFunction(effect)
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "finish" then
			local PopupGetRewards = require("app.ui.PopupGetRewards").new()
    		PopupGetRewards:showRewards(awards)

    		self:_resetInstrumentNode()
    		self:_setBtnEnable(true)
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_huishou", effectFunction, eventFunction , false)
end

function RecoveryInstrumentLayer:getInstrumentWithIndex(pos)
	return self._recoveryInstrumentList[pos]
end

function RecoveryInstrumentLayer:insertInstrument(pos, data)
	if self._recoveryInstrumentList[pos] == nil then
		self._recoveryInstrumentList[pos] = data
	end
end

function RecoveryInstrumentLayer:deleteInstrumentWithId(instrumentId)
	for k, data in pairs(self._recoveryInstrumentList) do
		if data:getId() == instrumentId then
			self._recoveryInstrumentList[k] = nil
			break
		end
	end
end

function RecoveryInstrumentLayer:checkIsMaxCount()
	local nowCount = self:getInstrumentCount()
	return nowCount >= RecoveryConst.RECOVERY_INSTRUMENT_MAX
end

function RecoveryInstrumentLayer:getInstrumentCount()
	local count = 0
	for k, data in pairs(self._recoveryInstrumentList) do
		if data ~= nil then
			count = count + 1
		end
	end
	return count
end

function RecoveryInstrumentLayer:checkIsAdded(instrumentData)
	if instrumentData == nil then
		return false
	end

	for k, data in pairs(self._recoveryInstrumentList) do
		if instrumentData:getId() == data:getId() then
			return true
		end
	end
	return false
end

return RecoveryInstrumentLayer