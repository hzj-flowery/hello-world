
-- Author: zhanglinsen
-- Date:2018-09-18 17:04:49
-- Describle：

local GroupsTipBar = require("app.ui.GroupsTipBar")
local GroupsMainNode = class("GroupsMainNode", GroupsTipBar)
local GroupsConst = require("app.const.GroupsConst")
local GroupsDataHelper = require("app.utils.data.GroupsDataHelper")

function GroupsMainNode:ctor()
	GroupsMainNode.super.ctor(self)
end

function GroupsMainNode:onCreate()
	self._userData = nil
	self._type = 0
	self._teamId = 0

	GroupsMainNode.super.onCreate(self)
end

function GroupsMainNode:onEnter()
	self._signalJoinInfoChange = G_SignalManager:add(SignalConst.EVENT_GROUP_OP_INVITE_JOIN_GROUP, handler(self, self._onOpInviteJoinGroup))
	self._signalApproveInfoChange = G_SignalManager:add(SignalConst.EVENT_GROUP_APPROVE_APPLY_SUCCESS, handler(self, self._onOpApproveChange))
	self._signalOutSideState = G_SignalManager:add(SignalConst.EVENT_GROUP_OUTSIDE_STATE, handler(self, self._onOutSideState))
	self._signalDataClear = G_SignalManager:add(SignalConst.EVENT_GROUP_DATA_CLEAR, handler(self, self._onDataClear))
	self:_updateTips()
end

function GroupsMainNode:onExit()
	self._signalJoinInfoChange:remove()
	self._signalJoinInfoChange = nil
	self._signalApproveInfoChange:remove()
	self._signalApproveInfoChange = nil
	self._signalOutSideState:remove()
	self._signalOutSideState = nil
	self._signalDataClear:remove()
	self._signalDataClear = nil
end

function GroupsMainNode:_updateTips()
	local isTip = G_UserData:getGroups():isTipInvite()
	local isSelected = not isTip
	self._checkBoxTip:setSelected(isSelected)
end

function GroupsMainNode:setParam(userData, type, teamId)
	self._userData = userData
	self._type = type or 0
	self._teamId = teamId or 0
end


function GroupsMainNode:slideOut(data, filterViewNames)
	if G_SceneManager:getRunningSceneName() == "guildTrain" and not G_UserData:getGuild():getTrainEndState() then
		return
	end

	GroupsMainNode.super.slideOut(self,data,filterViewNames)
end



function GroupsMainNode:_onOpInviteJoinGroup(event, teamId, op)
	if self._teamId == teamId then
		if op == GroupsConst.NO then
			G_Prompt:showTip(Lang.get("groups_tips_12"))
		end
		self:closeWindow()
	end
end

function GroupsMainNode:_onOpApproveChange(event, userId, op)
	if self._userData:getUser_id() == userId then
		self:closeWindow()
	end
end

function GroupsMainNode:_onOutSideState(event)
	if self._type == GroupsConst.APPLY then --离队了，申请提示消失
		self:closeWindow()
	end
end

function GroupsMainNode:_onDataClear(event)
	self:removeFromParent()
end

function GroupsMainNode:onBtnCancel()
	local userId = self._userData:getUser_id()
	if self._type == GroupsConst.APPLY then
		local myGroupData = G_UserData:getGroups():getMyGroupData()
		if myGroupData then
			myGroupData:c2sApproveTeam(userId, GroupsConst.NO)
		end
	elseif self._type == GroupsConst.INVITE then
		G_UserData:getGroups():c2sOpInviteJoinTeam(userId, GroupsConst.NO, self._teamId)
	end
end

function GroupsMainNode:onBtnOk()
	local userId = self._userData:getUser_id()
	if self._type == GroupsConst.APPLY then
		local myGroupData = G_UserData:getGroups():getMyGroupData()
		if myGroupData then
			myGroupData:c2sApproveTeam(userId, GroupsConst.OK)
		end
	elseif self._type == GroupsConst.INVITE then
		G_UserData:getGroups():c2sOpInviteJoinTeam(userId, GroupsConst.OK, self._teamId)
	end
end

function GroupsMainNode:onCheckBoxClicked()
	local isTip = G_UserData:getGroups():isTipInvite()
	G_UserData:getGroups():setTipInvite(not isTip)
	self:_updateTips()
end

return GroupsMainNode