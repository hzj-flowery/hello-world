--
-- Author: Liangxu
-- Date: 2017-04-27 17:59:48
-- 装备回收
local ViewBase = require("app.ui.ViewBase")
local RecoveryEquipLayer = class("RecoveryEquipLayer", ViewBase)
local RecoveryEquipNode = require("app.scene.view.recovery.RecoveryEquipNode")
local PopupRecoveryPreview = require("app.scene.view.recovery.PopupRecoveryPreview")
local RecoveryConst = require("app.const.RecoveryConst")

function RecoveryEquipLayer:ctor(sceneId)

	self._fileNode1 = nil --装备回收单件1
	self._fileNode2 = nil --装备回收单件2
	self._fileNode3 = nil --装备回收单件3
	self._fileNode4 = nil --装备回收单件4
	self._fileNode5 = nil --装备回收单件5
	self._buttonAutoAdd = nil --自动添加按钮
	self._buttonRecovery = nil --回收按钮
	self._textTip = nil --提示字

	local resource = {
		file = Path.getCSB("RecoveryEquipLayer", "recovery"),
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
	RecoveryEquipLayer.super.ctor(self, resource, sceneId)
end

function RecoveryEquipLayer:onCreate()
	for i = 1, 5 do
		self["_node"..i] = RecoveryEquipNode.new(self["_fileNode"..i], i, handler(self, self._onClickAdd), handler(self, self._onClickDelete))
	end
	self._buttonAutoAdd:setString(Lang.get("recovery_btn_auto_add"))
	self._buttonRecovery:setString(Lang.get("recovery_btn_recovery"))
	self._textTip:setString(Lang.get("recovery_tip_3"))
end

function RecoveryEquipLayer:onEnter()
	self._signalEquipRecovery = G_SignalManager:add(SignalConst.EVENT_EQUIP_RECOVERY_SUCCESS, handler(self, self._equipRecoverySuccess))

	self._recoveryEquipList = {}
	self:_updateView()
end

function RecoveryEquipLayer:onExit()
	self._signalEquipRecovery:remove()
	self._signalEquipRecovery = nil
end

function RecoveryEquipLayer:initInfo()
	self._recoveryEquipList = {}
	self:_updateView()
end

function RecoveryEquipLayer:_resetEquipNode()
	for i = 1, 5 do
		self["_node"..i]:reset()

	end
	self._recoveryEquipList = {}
	self:_updateView()
end

function RecoveryEquipLayer:_updateView()
	for i = 1, 5 do
		local data = self:getEquipWithIndex(i)
		if data then
			self["_node"..i]:updateInfo(data:getBase_id())
		else
			self["_node"..i]:updateInfo(nil)
		end
	end
end

function RecoveryEquipLayer:_onButtonAutoAddClicked()
	local list = G_UserData:getEquipment():getRecoveryAutoList()
	if #list == 0 then
		G_Prompt:showTip(Lang.get("recovery_auto_add_no_equip"))
		return
	end
	for i = 1, 5 do
		local equipData = self:getEquipWithIndex(i)
		if equipData == nil then
			for j, data in ipairs(list) do
				if not self:checkIsAdded(data) then
					self:insertEquip(i, data)
					break
				end
			end
		end
	end

	self:_updateView()
end

function RecoveryEquipLayer:_onButtonRecoveryClicked()
	local count = self:getEquipCount()
	if count <= 0 then
		G_Prompt:showTip(Lang.get("recovery_no_equip_tip"))
		return
	end
	local popupRecoveryPreview = PopupRecoveryPreview.new(self._recoveryEquipList, RecoveryConst.RECOVERY_TYPE_3, handler(self, self._doRecovery))
	popupRecoveryPreview:openWithAction()
end

function RecoveryEquipLayer:_doRecovery()
	local recoveryId = {}
	for k, data in pairs(self._recoveryEquipList) do
		table.insert(recoveryId, data:getId())
	end
	G_UserData:getEquipment():c2sEquipmentRecycle(recoveryId)
	self:_setBtnEnable(false)
end

function RecoveryEquipLayer:_setBtnEnable(enable)
	self._buttonAutoAdd:setEnabled(enable)
	self._buttonRecovery:setEnabled(enable)
end

function RecoveryEquipLayer:_onClickAdd()
	local PopupCheckEquipHelper = require("app.ui.PopupCheckEquipHelper")
	local popup = require("app.ui.PopupCheckEquip").new(self)
	local callBack = handler(self, self._updateView)
	popup:updateUI(PopupCheckEquipHelper.FROM_TYPE1, callBack)
	popup:openWithAction()
end

function RecoveryEquipLayer:_onClickDelete(pos)
	self._recoveryEquipList[pos] = nil
end

function RecoveryEquipLayer:_equipRecoverySuccess(eventName, awards)
	require("app.utils.data.RecoveryDataHelper").sortAward(awards)
	self:_playEquipFlyEffect(awards)
end

function RecoveryEquipLayer:_playEquipFlyEffect(awards)
	local function callback()
		self:_playShake(awards)
	end
	local finishPlayed = false
	for i = 1, 5 do
		local data = self:getEquipWithIndex(i)
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

function RecoveryEquipLayer:_playShake(awards)
	self:_playLight(awards)
end

function RecoveryEquipLayer:_playLight(awards)
	local function effectFunction(effect)
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "finish" then
			local PopupGetRewards = require("app.ui.PopupGetRewards").new()
    		PopupGetRewards:showRewards(awards)

    		self:_resetEquipNode()
    		self:_setBtnEnable(true)
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_huishou", effectFunction, eventFunction , false)
end

function RecoveryEquipLayer:getEquipWithIndex(pos)
	return self._recoveryEquipList[pos]
end

function RecoveryEquipLayer:insertEquip(pos, data)
	if self._recoveryEquipList[pos] == nil then
		self._recoveryEquipList[pos] = data
	end
end

function RecoveryEquipLayer:deleteEquipWithId(equipId)
	for k, data in pairs(self._recoveryEquipList) do
		if data:getId() == equipId then
			self._recoveryEquipList[k] = nil
			break
		end
	end
end

function RecoveryEquipLayer:checkIsMaxCount()
	local nowCount = self:getEquipCount()
	return nowCount >= RecoveryConst.RECOVERY_EQUIP_MAX
end

function RecoveryEquipLayer:getEquipCount()
	local count = 0
	for k, data in pairs(self._recoveryEquipList) do
		if data ~= nil then
			count = count + 1
		end
	end
	return count
end

function RecoveryEquipLayer:checkIsAdded(equipData)
	if equipData == nil then
		return false
	end

	for k, data in pairs(self._recoveryEquipList) do
		if equipData:getId() == data:getId() then
			return true
		end
	end
	return false
end

return RecoveryEquipLayer