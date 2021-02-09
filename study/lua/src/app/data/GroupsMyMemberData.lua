--
-- 我的组队队伍数据
-- Author: zhanglinsen
-- Date: 2018-08-30 10:05:31
-- 
local BaseData = require("app.data.BaseData")
local GroupsMyMemberData = class("GroupsMyMemberData", BaseData)
local GroupsMemberData = require("app.data.GroupsMemberData")
local GroupsUserData = require("app.data.GroupsUserData")
local GroupsInviteData = require("app.data.GroupsInviteData")
local GroupsPreSceneData = require("app.data.GroupsPreSceneData")
local GroupsConst = require("app.const.GroupsConst")
local GroupsDataHelper = require("app.utils.data.GroupsDataHelper")
local GroupsViewHelper = require("app.scene.view.groups.GroupsViewHelper")

local schema = {}
schema["team_auto"] 		 = {"boolean", false} --//是否自动加入
GroupsMyMemberData.schema = schema

function GroupsMyMemberData:ctor(properties)
	GroupsMyMemberData.super.ctor(self, properties)
	self._groupData = nil --自己的队伍数据
	self._applyList = {} --队长时 申请队伍玩家列表
	self._inviteList = {} --我邀请过玩家列表
	self._preSceneInfo = nil --进入场景前准备信息
    self._lastUserCount = 0 --记录成员数量

	self._recvUpdateTeamApplyList = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateTeamAppList, handler(self, self._s2cUpdateTeamApplyList)) --//更新队伍申请列表信息
	self._recvSyncInviteList = G_NetworkManager:add(MessageIDConst.ID_S2C_SyncInviteList, handler(self, self._s2cSyncInviteList)) --//新加入队伍同步邀请好友列表
	self._recvInviteJoinTeam = G_NetworkManager:add(MessageIDConst.ID_S2C_InviteJoinTeam, handler(self, self._s2cInviteJoinTeam)) --//邀请好友组队
	self._recvApproveTeam = G_NetworkManager:add(MessageIDConst.ID_S2C_ApproveTeam, handler(self, self._s2cApproveTeam)) --//审批申请
	self._recvUpdateEnterSceneState = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateEnterSceneState, handler(self, self._s2cUpdateEnterSceneState)) --//组队进入玩法场景确认通知
	self._recvTeamKick = G_NetworkManager:add(MessageIDConst.ID_S2C_TeamKick, handler(self, self._s2cTeamKick)) --//踢出队伍
	self._recvTeamChangeMemberNo = G_NetworkManager:add(MessageIDConst.ID_S2C_TeamChangeMemberNo, handler(self, self._s2cTeamChangeMemberNo)) --//转换站位
end

function GroupsMyMemberData:clear()
	self:reset()

	self._recvUpdateTeamApplyList:remove()
	self._recvUpdateTeamApplyList = nil
	self._recvSyncInviteList:remove()
	self._recvSyncInviteList = nil
	self._recvInviteJoinTeam:remove()
	self._recvInviteJoinTeam = nil
	self._recvApproveTeam:remove()
	self._recvApproveTeam = nil
	self._recvUpdateEnterSceneState:remove()
	self._recvUpdateEnterSceneState = nil
	self._recvTeamKick:remove()
	self._recvTeamKick = nil
	self._recvTeamChangeMemberNo:remove()
	self._recvTeamChangeMemberNo = nil
end

function GroupsMyMemberData:reset()
	self._groupData = nil --自己的队伍数据
	self._applyList = {} --队长时 申请队伍玩家列表
	self._inviteList = {} --我邀请过玩家列表
	self._preSceneInfo = nil --进入场景前准备信息
    self._lastUserCount = 0 --记录成员数量
end

--自己队伍数据
function GroupsMyMemberData:getGroupData()
	return self._groupData
end

--队长时 申请队伍玩家列表
function GroupsMyMemberData:getApplyList()
	return self._applyList
end

function GroupsMyMemberData:getApplyListCount()
	local count = 0
	for k, v in pairs(self._applyList) do
		count = count + 1
	end
	return count
end

--队长时 申请队伍玩家列表
function GroupsMyMemberData:getInviteList()
	return self._inviteList
end

function GroupsMyMemberData:getInviteListCount()
	local count = 0
	for k, v in pairs(self._inviteList) do
		count = count + 1
	end
	return count
end

function GroupsMyMemberData:getPreSceneInfo()
	return self._preSceneInfo
end

--更新组队信息
--@param myData 队伍信息
function GroupsMyMemberData:updateData(message)
	local teamAuto = rawget(message, "team_auto")
	local team = rawget(message, "team")
	self:setTeam_auto(teamAuto)
	if self._groupData == nil then
		self._groupData = GroupsMemberData.new()
	end
	self._groupData:updateData(team)
	self:_checkPopupEnterTip()
end

--检测是否要弹框
function GroupsMyMemberData:_checkPopupEnterTip()
    local count = self._groupData:getUserCount()
    local diffCount = count - self._lastUserCount
    self._lastUserCount = count

    --记录数量，只在数量有变化时，才判断
    if diffCount ~= 0 and self._groupData:isSelfGroup() and not self._groupData:isIs_scene() and self._groupData:isFull() and self._groupData:checkLeaderIsSelf() then
        GroupsViewHelper.popupEnterActiveScene(self._groupData)
        G_SignalManager:dispatch(SignalConst.EVENT_GROUP_MEMBER_REACH_FULL)
    end
end

--是否邀请过该玩家
function GroupsMyMemberData:getInviteUserData(userId)
	return self._inviteList[userId]
end

--删除申请玩家
--@param userId 队伍信息
function GroupsMyMemberData:removeInviteDataById(userId)
	if self._inviteList[userId] then
		self._inviteList[userId]:clear()
		self._inviteList[userId] = nil
	end
end

function GroupsMyMemberData:removeApplyDataWithId(userId)
	if self._applyList[userId] then
		self._applyList[userId]:clear()
		self._applyList[userId] = nil
	end
end

--我的队伍里是否有某人
function GroupsMyMemberData:isExistUser(userId)
	local userData = self._groupData:getUserData(userId)
	if userData then
		return true
	else
		return false
	end
end

--奖励掉率是否增加
function GroupsMyMemberData:isAwardAdd()
	local count = self._groupData:getUserCount()
	if count <= 1 then --1个人不算
		return false
	end
	local userList = self._groupData:getUserList()
	local name = nil
	for k, userData in pairs(userList) do
		if userData:isInGuild() == false then --如果有人没加入军团，肯定不加奖励
			return false
		end
		if name == nil then
			name = userData:getGuild_name()
		end
		if name ~= userData:getGuild_name() then
			return false
		end
	end
	return true
end

--更新申请信息
function GroupsMyMemberData:_s2cUpdateTeamApplyList(id, message)
	local user = rawget(message, "update")
	local userId = rawget(user, "user_id")
	local userData = self._applyList[userId]
	if userData == nil then
		userData = GroupsUserData.new()
	end
	userData:updateData(user)
	local groupType = self._groupData:getTeam_type()
	local refuseJoinTime = GroupsDataHelper.getTeamInfoConfig(groupType).refuse_join_time
    local currTime = G_ServerTime:getTime()
    userData:setApplyEndTime(currTime + refuseJoinTime)
    userData:startCountDown()
	self._applyList[userId] = userData

	GroupsViewHelper.pushApply(userData)

	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_APPLY_LIST_UPDATE)
end

--新加入队伍同步邀请好友列表
function GroupsMyMemberData:_s2cSyncInviteList(id, message)
	local inviteList = rawget(message, "invite_list") or {}
	for i, data in ipairs(inviteList) do
		local inviteData = GroupsInviteData.new()
		inviteData:updateData(data)
		local userId = inviteData:getUser_id()
		self._inviteList[userId] = inviteData
    end

    G_SignalManager:dispatch(SignalConst.EVENT_GROUP_SYNC_INVITE_LIST)
end

--邀请好友组队
function GroupsMyMemberData:c2sInviteJoinTeam(userId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_InviteJoinTeam, {
		user_id = userId
	})
end

--邀请好友组队结果
function GroupsMyMemberData:_s2cInviteJoinTeam(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local userId = rawget(message, "user_id") or 0
	local groupType = self._groupData:getTeam_type()
	local info = GroupsDataHelper.getTeamInfoConfig(groupType)
	local inviteEndTime = info.refuse_time + G_ServerTime:getTime()

	local inviteData = GroupsInviteData.new()
	inviteData:setUser_id(userId)
	inviteData:setInvite_time(inviteEndTime)
	self._inviteList[userId] = inviteData

	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_INVITE_JOIN_GROUP_SUCCEED, userId)
end

--审批入队申请
function GroupsMyMemberData:c2sApproveTeam(userId, op)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ApproveTeam, {
		user_id = userId,
		op = op
	})
end

--入队申请结果
function GroupsMyMemberData:_s2cApproveTeam(id, message)
	-- if message.ret ~= MessageErrorConst.RET_OK then
	-- 	return
	-- end

	local userId = rawget(message, "user_id") or 0
	local op = rawget(message, "op")
	
	if userId ~= 0 then
		self:removeApplyDataWithId(userId)
	end

	if op == GroupsConst.NO then
		G_Prompt:showTip(Lang.get("groups_tips_10"))
	end

	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_APPROVE_APPLY_SUCCESS, userId, op)
end

--组队进入玩法场景确认通知 
function GroupsMyMemberData:_s2cUpdateEnterSceneState(id, message)
	if self._preSceneInfo == nil then
		self._preSceneInfo = GroupsPreSceneData.new()
	end
	self._preSceneInfo:updateData(message)
	if self._preSceneInfo:isFirst() then
		GroupsViewHelper.popupGroupsAgreementDlg()
	else
		G_SignalManager:dispatch(SignalConst.EVENT_GROUP_UPDATE_ENTER_SCENE_STATE)
	end
end

--踢出队伍
function GroupsMyMemberData:c2sTeamKick(userId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_TeamKick, {
		user_id = userId
	})
end

--踢出队伍 结果
function GroupsMyMemberData:_s2cTeamKick(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local userId = rawget(message, "user_id") or 0
	self._groupData:removeUserById(userId)
	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_MY_GROUP_KICK_USER)
	G_Prompt:showTip(Lang.get("groups_tips_8"))
end

--转换站位
function GroupsMyMemberData:c2sTeamChangeMemberNo(oldNo, newNo)
	G_NetworkManager:send(MessageIDConst.ID_C2S_TeamChangeMemberNo, {
		old_no = oldNo,
		new_no = newNo,
	})
end

--转换站位 结果
function GroupsMyMemberData:_s2cTeamChangeMemberNo(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_CHANGE_LOCATION_SUCCESS)
	G_Prompt:showTip(Lang.get("groups_tips_9"))
end

return GroupsMyMemberData