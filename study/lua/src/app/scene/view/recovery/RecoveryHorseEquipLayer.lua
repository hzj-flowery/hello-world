--
-- Author: JerryHe
-- Date: 2019-01-24
-- 战马装备回收
-- 
local ViewBase = require("app.ui.ViewBase")
local RecoveryHorseEquipLayer = class("RecoveryHorseEquipLayer", ViewBase)
local RecoveryHorseEquipNode = require("app.scene.view.recovery.RecoveryHorseEquipNode")
local PopupRecoveryPreview = require("app.scene.view.recovery.PopupRecoveryPreview")
local RecoveryConst = require("app.const.RecoveryConst")

function RecoveryHorseEquipLayer:ctor(sceneId)

	self._fileNode1 = nil --装备回收单件1
	self._fileNode2 = nil --装备回收单件2
	self._fileNode3 = nil --装备回收单件3
	self._fileNode4 = nil --装备回收单件4
	self._fileNode5 = nil --装备回收单件5
	self._buttonAutoAdd = nil --自动添加按钮
	self._buttonRecovery = nil --回收按钮
	self._textTip = nil --提示字

	local resource = {
		file = Path.getCSB("RecoveryHorseEquipLayer", "recovery"),
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
	RecoveryHorseEquipLayer.super.ctor(self, resource, sceneId)
end

function RecoveryHorseEquipLayer:onCreate()
	for i = 1, 5 do
		self["_node"..i] = RecoveryHorseEquipNode.new(self["_fileNode"..i], i, handler(self, self._onClickAdd), handler(self, self._onClickDelete))
	end
	self._buttonAutoAdd:setString(Lang.get("recovery_btn_auto_add"))
	self._buttonRecovery:setString(Lang.get("recovery_btn_recovery"))
	self._textTip:setString(Lang.get("recovery_tip_14"))
end

function RecoveryHorseEquipLayer:onEnter()
	self._signalHorseEquipRecovery = G_SignalManager:add(SignalConst.EVENT_HORSE_EQUIP_RECOVERY_SUCCESS, handler(self, self._horseEquipRecoverySuccess))

	self._recoveryEquipList = {}
	self:_updateView()
end

function RecoveryHorseEquipLayer:onExit()
	self._signalHorseEquipRecovery:remove()
	self._signalHorseEquipRecovery = nil
end

function RecoveryHorseEquipLayer:initInfo()
	self._recoveryEquipList = {}
	self:_updateView()
end

function RecoveryHorseEquipLayer:_resetEquipNode()
	for i = 1, 5 do
		self["_node"..i]:reset()

	end
	self._recoveryEquipList = {}
	self:_updateView()
end

function RecoveryHorseEquipLayer:_updateView()
	for i = 1, 5 do
		local data = self:getEquipWithIndex(i)
		if data then
			self["_node"..i]:updateInfo(data:getBase_id())
		else
			self["_node"..i]:updateInfo(nil)
		end
	end
end

function RecoveryHorseEquipLayer:_onButtonAutoAddClicked()
	local list = G_UserData:getHorseEquipment():getAllRecoveryHorseEquipments(true)
	if #list == 0 then
		G_Prompt:showTip(Lang.get("recovery_auto_add_no_horse_equip"))
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

function RecoveryHorseEquipLayer:_onButtonRecoveryClicked()
	local count = self:getEquipCount()
	if count <= 0 then
		G_Prompt:showTip(Lang.get("recovery_no_horse_equip_tip"))
		return
	end
	local popupRecoveryPreview = PopupRecoveryPreview.new(self._recoveryEquipList, RecoveryConst.RECOVERY_TYPE_14, handler(self, self._doRecovery))
	popupRecoveryPreview:openWithAction()
end

function RecoveryHorseEquipLayer:_doRecovery()
	local recoveryId = {}
	for k, data in pairs(self._recoveryEquipList) do
		table.insert(recoveryId, data:getId())
    end

	G_UserData:getHorseEquipment():c2sWarHorseEquipmentRecovery(recoveryId)
	self:_setBtnEnable(false)
end

function RecoveryHorseEquipLayer:_setBtnEnable(enable)
	self._buttonAutoAdd:setEnabled(enable)
	self._buttonRecovery:setEnabled(enable)
end

function RecoveryHorseEquipLayer:_onClickAdd()
	local PopupCheckHorseEquipHelper = require("app.ui.PopupCheckHorseEquipHelper")
	local popup = require("app.ui.PopupCheckHorseEquip").new(self)
	local callBack = handler(self, self._updateView)
	popup:updateUI(PopupCheckHorseEquipHelper.FROM_TYPE1, callBack)
	popup:openWithAction()
end

function RecoveryHorseEquipLayer:_onClickDelete(pos)
	self._recoveryEquipList[pos] = nil
end

function RecoveryHorseEquipLayer:_horseEquipRecoverySuccess(eventName, awards)
	require("app.utils.data.RecoveryDataHelper").sortAward(awards)
	self:_playEquipFlyEffect(awards)
end

function RecoveryHorseEquipLayer:_playEquipFlyEffect(awards)
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

function RecoveryHorseEquipLayer:_playShake(awards)
	self:_playLight(awards)
end

function RecoveryHorseEquipLayer:_playLight(awards)
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

function RecoveryHorseEquipLayer:getEquipWithIndex(pos)
	return self._recoveryEquipList[pos]
end

function RecoveryHorseEquipLayer:insertEquip(pos, data)
	if self._recoveryEquipList[pos] == nil then
		self._recoveryEquipList[pos] = data
	end
end

function RecoveryHorseEquipLayer:deleteEquipWithId(equipId)
	for k, data in pairs(self._recoveryEquipList) do
		if data:getId() == equipId then
			self._recoveryEquipList[k] = nil
			break
		end
	end
end

function RecoveryHorseEquipLayer:checkIsMaxCount()
	local nowCount = self:getEquipCount()
	return nowCount >= RecoveryConst.RECOVERY_HORSE_EQUIP_MAX
end

function RecoveryHorseEquipLayer:getEquipCount()
	local count = 0
	for k, data in pairs(self._recoveryEquipList) do
		if data then
			count = count + 1
		end
	end
	return count
end

function RecoveryHorseEquipLayer:checkIsAdded(equipData)
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

return RecoveryHorseEquipLayer