
--
-- Author: Liangxu
-- Date: 2018-8-29
-- 战马回收
local ViewBase = require("app.ui.ViewBase")
local RecoveryHorseLayer = class("RecoveryHorseLayer", ViewBase)
local RecoveryHorseNode = require("app.scene.view.recovery.RecoveryHorseNode")
local PopupRecoveryPreview = require("app.scene.view.recovery.PopupRecoveryPreview")
local RecoveryConst = require("app.const.RecoveryConst")

function RecoveryHorseLayer:ctor(sceneId)
	self._fileNode1 = nil
	self._fileNode2 = nil
	self._fileNode3 = nil
	self._fileNode4 = nil
	self._fileNode5 = nil
	self._buttonAutoAdd = nil --自动添加按钮
	self._buttonRecovery = nil --回收按钮
	self._textTip = nil --提示字

	local resource = {
		file = Path.getCSB("RecoveryHorseLayer", "recovery"),
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
	
	RecoveryHorseLayer.super.ctor(self, resource, sceneId)
end

function RecoveryHorseLayer:onCreate()
	for i = 1, 5 do
		self["_node"..i] = RecoveryHorseNode.new(self["_fileNode"..i], i, handler(self, self._onClickAdd), handler(self, self._onClickDelete))
	end
	self._targetPos = cc.p(self._nodeFlyTarget:getPosition())

	self._buttonAutoAdd:setString(Lang.get("recovery_btn_auto_add"))
	self._buttonRecovery:setString(Lang.get("recovery_btn_recovery"))
	self._textTip:setString(Lang.get("recovery_tip_11"))
	self._showRedPoint = false
end

function RecoveryHorseLayer:onEnter()
	self._signalHorseRecovery = G_SignalManager:add(SignalConst.EVENT_HORSE_RECYCLE_SUCCESS, handler(self, self._horseRecoverySuccess))
	
	self._recoveryHorseList = {}
	self:_updateView()
	self:updateRedPoint()
end

function RecoveryHorseLayer:onExit()
	self._signalHorseRecovery:remove()
	self._signalHorseRecovery = nil
end

function RecoveryHorseLayer:initInfo()
	self._recoveryHorseList = {}
	self:_updateView()
end

function RecoveryHorseLayer:_resetHorseNode()
	for i = 1, 5 do
		self["_node"..i]:reset()

	end
	self._recoveryHorseList = {}
	self:_updateView()
end

function RecoveryHorseLayer:_updateView()
	for i = 1, 5 do
		local horseData = self:getHorseWithIndex(i)
		if horseData then
			self["_node"..i]:updateInfo(horseData)
		else
			self["_node"..i]:updateInfo(nil)
		end
	end
end

function RecoveryHorseLayer:_onButtonAutoAddClicked()
	local list = G_UserData:getHorse():getRecoveryAutoList()
	if #list == 0 then
		G_Prompt:showTip(Lang.get("recovery_auto_add_no_horse"))
		return
	end
	for i = 1, 5 do
		local horseData = self:getHorseWithIndex(i)
		if horseData == nil then
			for j, data in ipairs(list) do
				if not self:checkIsAdded(data) then
					self:insertHorse(i, data)
					break
				end
			end
		end
	end

	self:_updateView()
	self:setRedPoint(false)
	self:updateRedPoint()
end

function RecoveryHorseLayer:_onButtonRecoveryClicked()
	local count = self:getHorseCount()
	if count <= 0 then
		G_Prompt:showTip(Lang.get("recovery_no_horse_tip"))
		return
	end
	local popupRecoveryPreview = PopupRecoveryPreview.new(self._recoveryHorseList, RecoveryConst.RECOVERY_TYPE_11, handler(self, self._doRecovery))
	popupRecoveryPreview:openWithAction()
end

function RecoveryHorseLayer:_doRecovery()
	local recoveryId = {}
	for k, data in pairs(self._recoveryHorseList) do
		table.insert(recoveryId, data:getId())
	end
	G_UserData:getHorse():c2sWarHorseReclaim(recoveryId)
	self:_setBtnEnable(false)
end

function RecoveryHorseLayer:_setBtnEnable(enable)
	self._buttonAutoAdd:setEnabled(enable)
	self._buttonRecovery:setEnabled(enable)
end

function RecoveryHorseLayer:_onClickAdd()
	local PopupCheckHorseHelper = require("app.ui.PopupCheckHorseHelper")
	local popup = require("app.ui.PopupCheckHorse").new(self)
	local callBack = handler(self, self._updateView)
	popup:updateUI(PopupCheckHorseHelper.FROM_TYPE1, callBack)
	popup:openWithAction()
end

function RecoveryHorseLayer:_onClickDelete(pos)
	self._recoveryHorseList[pos] = nil
end

function RecoveryHorseLayer:_horseRecoverySuccess(eventName, awards)
	require("app.utils.data.RecoveryDataHelper").sortAward(awards)
	self:_playHorseFlyEffect(awards)
end

function RecoveryHorseLayer:_playHorseFlyEffect(awards)
	local function callback()
		self:_playShake(awards)
	end
	local finishPlayed = false
	for i = 1, 5 do
		local data = self:getHorseWithIndex(i)
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

function RecoveryHorseLayer:_playShake(awards)
	self:_playLight(awards)
end

function RecoveryHorseLayer:_playLight(awards)
	local PopupGetRewards = require("app.ui.PopupGetRewards").new()
	PopupGetRewards:showRewards(awards)
	self:_resetHorseNode()
	self:_setBtnEnable(true)
	self:updateRedPoint()
end

function RecoveryHorseLayer:getHorseWithIndex(pos)
	return self._recoveryHorseList[pos]
end

function RecoveryHorseLayer:insertHorse(pos, heroData)
	if self._recoveryHorseList[pos] == nil then
		self._recoveryHorseList[pos] = heroData
	end
end

function RecoveryHorseLayer:deleteHorseWithId(horseId)
	for k, data in pairs(self._recoveryHorseList) do
		if data:getId() == horseId then
			self._recoveryHorseList[k] = nil
			break
		end
	end
end

function RecoveryHorseLayer:checkIsMaxCount()
	local nowCount = self:getHorseCount()
	return nowCount >= RecoveryConst.RECOVERY_HORSE_MAX
end

function RecoveryHorseLayer:getHorseCount()
	local count = 0
	for k, data in pairs(self._recoveryHorseList) do
		if data ~= nil then
			count = count + 1
		end
	end
	return count
end

function RecoveryHorseLayer:checkIsAdded(horseData)
	if horseData == nil then
		return false
	end

	for k, data in pairs(self._recoveryHorseList) do
		if horseData:getId() == data:getId() then
			return true
		end
	end
	return false
end

function RecoveryHorseLayer:getHorseData()
	return self._recoveryHorseList
end

function RecoveryHorseLayer:updateRedPoint()
	self._buttonAutoAdd:showRedPoint(self._showRedPoint)
end

function RecoveryHorseLayer:setRedPoint(show)
	self._showRedPoint = show
end

return RecoveryHorseLayer