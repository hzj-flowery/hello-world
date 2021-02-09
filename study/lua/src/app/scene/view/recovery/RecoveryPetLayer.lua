--
-- Author: Liangxu
-- Date: 2017-04-27 18:04:31
-- 武将回收
local ViewBase = require("app.ui.ViewBase")
local RecoveryPetLayer = class("RecoveryPetLayer", ViewBase)
local RecoveryPetNode = require("app.scene.view.recovery.RecoveryPetNode")
local PopupRecoveryPreview = require("app.scene.view.recovery.PopupRecoveryPreview")
local RecoveryConst = require("app.const.RecoveryConst")

function RecoveryPetLayer:ctor(sceneId)

	self._fileNode1 = nil --武将回收单件1
	self._fileNode2 = nil --武将回收单件2
	self._fileNode3 = nil --武将回收单件3
	self._fileNode4 = nil --武将回收单件4
	self._fileNode5 = nil --武将回收单件5
	self._buttonAutoAdd = nil --自动添加按钮
	self._buttonRecovery = nil --回收按钮
	self._textTip = nil --提示字

	local resource = {
		file = Path.getCSB("RecoveryPetLayer", "recovery"),
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
	RecoveryPetLayer.super.ctor(self, resource, sceneId)
end

function RecoveryPetLayer:onCreate()
	for i = 1, 5 do
		self["_node"..i] = RecoveryPetNode.new(self["_fileNode"..i], i, handler(self, self._onClickAdd), handler(self, self._onClickDelete))
	end
	self._targetPos = cc.p(self._nodeFlyTarget:getPosition())

	self._buttonAutoAdd:setString(Lang.get("recovery_btn_auto_add"))
	self._buttonRecovery:setString(Lang.get("recovery_btn_recovery"))
	self._textTip:setString(Lang.get("recovery_tip_"..RecoveryConst.RECOVERY_TYPE_9))
	self._showRedPoint = false
end

function RecoveryPetLayer:onEnter()
	self._signalPetRecovery =  G_SignalManager:add(SignalConst.EVENT_PET_RECOVERY_SUCCESS,handler(self, self._petRecoverySuccess))
	

	self._recoveryPetList = {}
	self:_updateView()
	self:updateRedPoint()
end

function RecoveryPetLayer:onExit()
	self._signalPetRecovery:remove()
	self._signalPetRecovery = nil
end

function RecoveryPetLayer:initInfo()
	self._recoveryPetList = {}
	self:_updateView()
end

function RecoveryPetLayer:_resetPetNode()
	for i = 1, 5 do
		self["_node"..i]:reset()

	end
	self._recoveryPetList = {}
	self:_updateView()
end

function RecoveryPetLayer:_updateView()
	for i = 1, 5 do
		local petData = self:getPetWithIndex(i)
		if petData then
			self["_node"..i]:updateInfo(petData:getBase_id())
		else
			self["_node"..i]:updateInfo(nil)
		end
	end
end

function RecoveryPetLayer:_onButtonAutoAddClicked()
	local list = G_UserData:getPet():getRecoveryAutoList()
	if #list == 0 then
		G_Prompt:showTip(Lang.get("recovery_auto_add_no_pet"))
		return
	end
	for i = 1, 5 do
		local petData = self:getPetWithIndex(i)
		if petData == nil then
			for j, data in ipairs(list) do
				if not self:checkIsAdded(data) then
					self:insertPet(i, data)
					break
				end
			end
		end
	end

	self:_updateView()
	self:setRedPoint(false)
	self:updateRedPoint()
end

function RecoveryPetLayer:_onButtonRecoveryClicked()
	local count = self:getPetCount()
	if count <= 0 then
		G_Prompt:showTip(Lang.get("recovery_no_pet_tip"))
		return
	end
	local popupRecoveryPreview = PopupRecoveryPreview.new(self._recoveryPetList, RecoveryConst.RECOVERY_TYPE_9, handler(self, self._doRecovery))
	popupRecoveryPreview:openWithAction()
end

function RecoveryPetLayer:_doRecovery()
	local recoveryId = {}
	for k, data in pairs(self._recoveryPetList) do
		table.insert(recoveryId, data:getId())
	end
	G_UserData:getPet():c2sPetRecycle(recoveryId)
	self:_setBtnEnable(false)
end

function RecoveryPetLayer:_setBtnEnable(enable)
	self._buttonAutoAdd:setEnabled(enable)
	self._buttonRecovery:setEnabled(enable)
end

function RecoveryPetLayer:_onClickAdd()
	local PopupCheckPetHelper = require("app.ui.PopupCheckPetHelper")
	local popup = require("app.ui.PopupCheckPet").new(self)
	local callBack = handler(self, self._updateView)
	popup:updateUI(PopupCheckPetHelper.FROM_TYPE2, callBack)
	popup:openWithAction()
end

function RecoveryPetLayer:_onClickDelete(pos)
	self._recoveryPetList[pos] = nil
end

function RecoveryPetLayer:_petRecoverySuccess(eventName, awards)
	require("app.utils.data.RecoveryDataHelper").sortAward(awards)
	self:_playPetFlyEffect(awards)
end

function RecoveryPetLayer:_playPetFlyEffect(awards)
	local function callback()
		self:_playShake(awards)
	end
	local finishPlayed = false
	for i = 1, 5 do
		local data = self:getPetWithIndex(i)
		if data then
			local finishCallback = nil
			if finishPlayed == false then --结束特效只播一次
				finishCallback = callback
				finishPlayed = true
			end
			self["_node"..i]:playFlyEffect(finishCallback)
		end
	end
end

function RecoveryPetLayer:_playShake(awards)
	self:_playLight(awards)
end

function RecoveryPetLayer:_playLight(awards)
	local PopupGetRewards = require("app.ui.PopupGetRewards").new()
	PopupGetRewards:showRewards(awards)
	self:_resetPetNode()
	self:_setBtnEnable(true)
	self:updateRedPoint()
end

function RecoveryPetLayer:getPetWithIndex(pos)
	return self._recoveryPetList[pos]
end

function RecoveryPetLayer:insertPet(pos, petData)
	if self._recoveryPetList[pos] == nil then
		self._recoveryPetList[pos] = petData
	end
end

function RecoveryPetLayer:deletePetWithPetId(petId)
	for k, data in pairs(self._recoveryPetList) do
		if data:getId() == petId then
			self._recoveryPetList[k] = nil
			break
		end
	end
end

function RecoveryPetLayer:checkIsMaxCount()
	local nowCount = self:getPetCount()
	return nowCount >= RecoveryConst.RECOVERY_PET_MAX
end

function RecoveryPetLayer:getPetCount()
	local count = 0
	for k, data in pairs(self._recoveryPetList) do
		if data ~= nil then
			count = count + 1
		end
	end
	return count
end

function RecoveryPetLayer:checkIsAdded(petData)
	if petData == nil then
		return false
	end

	for k, data in pairs(self._recoveryPetList) do
		if petData:getId() == data:getId() then
			return true
		end
	end
	return false
end

function RecoveryPetLayer:getPetData()
	return self._recoveryPetList
end

function RecoveryPetLayer:updateRedPoint()
	self._buttonAutoAdd:showRedPoint(self._showRedPoint)
end

function RecoveryPetLayer:setRedPoint(show)
	self._showRedPoint = show
end

return RecoveryPetLayer