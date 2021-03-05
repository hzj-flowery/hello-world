--
-- 所有组队数据
-- Author: zhanglinsen
-- Date: 2018-08-30 10:05:31
-- 
local BaseData = require("app.data.BaseData")
local GroupsData = class("GroupsData", BaseData)

local GroupsConst = require("app.const.GroupsConst")
local GroupsUnitData = require("app.data.GroupsUnitData")
local GroupsUserData = require("app.data.GroupsUserData")
local GroupsMyMemberData = require("app.data.GroupsMyMemberData")
local GroupsDataHelper = require("app.utils.data.GroupsDataHelper")
local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
local UIActionHelper = require("app.utils.UIActionHelper")
local GroupsViewHelper = require("app.scene.view.groups.GroupsViewHelper")

local schema = {}
schema["tipInvite"]   = {"boolean", true} --是否提示邀请
GroupsData.schema = schema

function GroupsData:ctor(properties)
	GroupsData.super.ctor(self, properties)

	self._groupsUnitList = {}  --组队活动列表
	self._myGroupData = nil  --我的组队数据

	self._recvGetTeamList = G_NetworkManager:add(MessageIDConst.ID_S2C_GetTeamList, handler(self, self._s2cGetTeamList))  --//获取队伍列表信息
	self._recvUpdateTeamInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateTeamInfo, handler(self, self._s2cUpdateTeamInfo)) --//更新队伍列表信息
	self._recvCreateTeam = G_NetworkManager:add(MessageIDConst.ID_S2C_CreateTeam, handler(self, self._s2cCreateTeam)) --//创建队伍
	self._recvUpdateMyTeam = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateMyTeam, handler(self, self._s2cUpdateMyTeam)) --//更新自己队伍信息 如果之前不再队伍中立刻加入队伍
	self._recvApplyTeam = G_NetworkManager:add(MessageIDConst.ID_S2C_AppTeam, handler(self, self._s2cApplyTeam)) --//申请加入队伍
	self._recvLeaveTeam = G_NetworkManager:add(MessageIDConst.ID_S2C_LeaveTeam, handler(self, self._s2cLeaveTeam)) --//离开队伍
	self._recvChangeTeamSet = G_NetworkManager:add(MessageIDConst.ID_S2C_ChangeTeamSet, handler(self, self._s2cChangeTeamSet)) --//改变队伍设置
	self._recvTransferLeader = G_NetworkManager:add(MessageIDConst.ID_S2C_TransferLeader, handler(self, self._s2cTransferLeader)) --//转让队长
	self._recvAppTransferLeader = G_NetworkManager:add(MessageIDConst.ID_S2C_AppTransferLeader, handler(self, self._s2cAppTransferLeader)) --//请求带队
	self._recvAppTransferLeaderNotice = G_NetworkManager:add(MessageIDConst.ID_S2C_AppTransferLeaderNotice, handler(self, self._s2cAppTransferLeaderNotice)) --//请求带队通知
	self._recvOpTransferLeader = G_NetworkManager:add(MessageIDConst.ID_S2C_OpTransferLeader, handler(self, self._s2cOpTransferLeader)) --//审批请求带队
	self._recvInviteJoinTeamNotice = G_NetworkManager:add(MessageIDConst.ID_S2C_InviteJoinTeamNotice, handler(self, self._s2cInviteJoinTeamNotice)) --//邀请好友组队通知
	self._recvOpInviteJoinTeam = G_NetworkManager:add(MessageIDConst.ID_S2C_OpInviteJoinTeam, handler(self, self._s2cOpInviteJoinTeam)) --//审批邀请好友组队
	self._recvTeamTips = G_NetworkManager:add(MessageIDConst.ID_S2C_TeamTips, handler(self, self._s2cTeamTips)) --//各种消息
	self._recvTeamEnterScene = G_NetworkManager:add(MessageIDConst.ID_S2C_TeamEnterScene, handler(self, self._s2cTeamEnterScene)) --//组队进入玩法场景
	self._recvOpEnterScene = G_NetworkManager:add(MessageIDConst.ID_S2C_OpEnterScene, handler(self, self._s2cOpEnterScene)) --//组队进入玩法场景确认操作
	self._recvSyncApplyTeamList = G_NetworkManager:add(MessageIDConst.ID_S2C_SyncAppTeamList, handler(self, self._s2cSyncApplyTeamList)) --//同步申请队伍列表
end

function GroupsData:clear()
	self._recvGetTeamList:remove()
	self._recvGetTeamList = nil
	self._recvUpdateTeamInfo:remove()
	self._recvUpdateTeamInfo = nil
	self._recvCreateTeam:remove()
	self._recvCreateTeam = nil
	self._recvUpdateMyTeam:remove()
	self._recvUpdateMyTeam = nil
	self._recvApplyTeam:remove()
	self._recvApplyTeam = nil
	self._recvLeaveTeam:remove()
	self._recvLeaveTeam = nil
	self._recvChangeTeamSet:remove()
	self._recvChangeTeamSet = nil
	self._recvTransferLeader:remove()
	self._recvTransferLeader = nil
	self._recvAppTransferLeader:remove()
	self._recvAppTransferLeader = nil
	self._recvAppTransferLeaderNotice:remove()
	self._recvAppTransferLeaderNotice = nil
	self._recvOpTransferLeader:remove()
	self._recvOpTransferLeader = nil
	self._recvInviteJoinTeamNotice:remove()
	self._recvInviteJoinTeamNotice = nil
	self._recvOpInviteJoinTeam:remove()
	self._recvOpInviteJoinTeam = nil
	self._recvTeamTips:remove()
	self._recvTeamTips = nil
	self._recvTeamEnterScene:remove()
	self._recvTeamEnterScene = nil
	self._recvOpEnterScene:remove()
	self._recvOpEnterScene = nil
	self._recvSyncApplyTeamList:remove()
	self._recvSyncApplyTeamList = nil

    self:reset()
end

function GroupsData:reset()
	self._groupsUnitList = {}
	self:_clearMyGroupData()
	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_DATA_CLEAR)
end

--我的队伍数据
function GroupsData:getMyGroupData()
	return self._myGroupData
end

function GroupsData:_clearMyGroupData()
	if self._myGroupData then
		self._myGroupData:clear()
		self._myGroupData = nil
	end
end

--组队活动数据
function GroupsData:getGroupsUnitData(teamType)
	local unitData = self._groupsUnitList[teamType]
	return unitData
end

--通过队伍Id获取队伍数据
function GroupsData:_getMemberDataById(teamId)
	for _, unit in pairs(self._groupsUnitList) do
		local memberData = unit:getMemberData(teamId)
		if memberData then
			return memberData
		end
	end
	return nil
end

--自己是否是队长
function GroupsData:isSelfLeader()
	if self._myGroupData == nil then
		return false
	end
	local memberData = self._myGroupData:getGroupData()
	local is = memberData:checkLeaderIsSelf()
	return is
end

--是否在活动场景中
function GroupsData:isInActiveScene()
	if self._myGroupData == nil then
		logWarn(" GroupsData:isInActiveScene _myGroupData  =========== false" )
		return false
	end
	local memberData = self._myGroupData:getGroupData()
	local is = memberData:isIs_scene()
	if is == false then
		logWarn("GroupsData:isInActiveScene memberData:isIs_scene  =========== false" )
		return false
	end
	
	return true
end

function GroupsData:hasRedPoint()
	if self._myGroupData then
		local applyListCount = self._myGroupData:getApplyListCount()
		if applyListCount > 0 then
			return true
		end
	end
	return false
end

--=========================协议部分=============================================
--请求活动的组队信息
function GroupsData:c2sGetTeamsList(teamType)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetTeamList, {
		team_type = teamType
	})
end

--获取组队信息
function GroupsData:_s2cGetTeamList(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local teamType = rawget(message, "team_type") or 0
	local teams = rawget(message, "teams") or {}
	local appteams = rawget(message, "appteams") or {}

	local unitData = GroupsUnitData.new()
	unitData:updateData(teams)
	unitData:updateApplicationTime(appteams)
	self._groupsUnitList[teamType] = unitData

	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_LIST_GET, teamType)
end

--更新组队信息
function GroupsData:_s2cUpdateTeamInfo(id, message)
	local update = rawget(message, "update")
	local delId = rawget(message, "del") or 0
	local delTeamType = rawget(message, "del_team_type")

	local teamType = 0
	if update then
		teamType = rawget(update, "team_type")
		local unitData = self:getGroupsUnitData(teamType)
		if unitData then
			unitData:updateData({update})
		end
	end
	if delId ~= 0 then
		teamType = delTeamType
		local unitData = self:getGroupsUnitData(teamType)
		if unitData then
			unitData:removeGroupData(delId)
		end
	end	
	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_LIST_UPDATE, teamType)
end

--请求创建队伍
function GroupsData:c2sCreateTeam(teamType)
	G_NetworkManager:send(MessageIDConst.ID_C2S_CreateTeam, {
		team_type = teamType
	})
end

--创建队伍信息
function GroupsData:_s2cCreateTeam(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	
	local team = rawget(message, "team")
	local myGroupData = GroupsMyMemberData.new()
	myGroupData:updateData(team)
	self._myGroupData = myGroupData

	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_MY_GROUP_CHAT_CHANGE)
	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_CREATE_SUCCESS)
end

--更新我的队伍信息
function GroupsData:_s2cUpdateMyTeam(id, message)
	local team = rawget(message, "team")
	local isOnline = rawget(message, "is_online")
	
	if isOnline then
		self:reset()
		G_SignalManager:dispatch(SignalConst.EVENT_GROUP_DATA_RESET)
	end

	if team then
		if self._myGroupData == nil then
			self._myGroupData = GroupsMyMemberData.new()
			--我的队伍刚产生，所以要清除我对该队伍的申请时间
			local teamInfo = rawget(team, "team")
			local teamId = teamInfo.team_id
			local memberData = self:_getMemberDataById(teamId)
			if memberData then
				memberData:setApplyEndTime(0)
			end
		end
		self._myGroupData:updateData(team)
	else
		self:_clearMyGroupData()
		G_SignalManager:dispatch(SignalConst.EVENT_GROUP_MY_GROUP_CHAT_CHANGE)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_MY_GROUP_INFO_UPDATE)
end

--请求加入队伍
function GroupsData:c2sApplyTeam(teamType, teamId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_AppTeam, {
		team_type = teamType,
		team_id = teamId,
	})
end

--
function GroupsData:_s2cApplyTeam(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local teamId = rawget(message, "team_id") or 0 --申请的队伍id 如果快速加入则为0
	local appTeam = rawget(message, "app_team") or {}
	local teamType = rawget(message, "team_type") or 0

	local unitData = self:getGroupsUnitData(teamType)
	if unitData then
		for i, id in ipairs(appTeam) do
			local memberData = unitData:getMemberData(id)
			if memberData then
				local refuseJoinTime = GroupsDataHelper.getTeamInfoConfig(teamType).refuse_join_time
			    local currTime = G_ServerTime:getTime()
				memberData:setApplyEndTime(currTime + refuseJoinTime)
				memberData:startCountDown()
			end
		end
	end
	
	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_APPLY_JOIN_SUCCESS, teamType)

	if #appTeam == 0 then
		G_Prompt:showTip(Lang.get("groups_tips_28"))
	else
		if teamId == 0 then
			G_Prompt:showTip(Lang.get("groups_tips_20"))
		else
			G_Prompt:showTip(Lang.get("groups_tips_1"))
		end
	end
end

--请求离开队伍	 0:正常退出 1：队长解散
function GroupsData:c2sLeaveTeam(leaveType)
	G_NetworkManager:send(MessageIDConst.ID_C2S_LeaveTeam, {
		leave_type = leaveType
	})
end

--离开队伍信息  0:正常退出 1：队长解散
function GroupsData:_s2cLeaveTeam(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	self:_clearMyGroupData()
	local leaveType = rawget(message, "leave_type") or 0
	if leaveType == GroupsConst.NORMAL_QUIT then
		G_Prompt:showTip(Lang.get("groups_tips_3"))
	elseif leaveType == GroupsConst.LEADER_DISSOLVE then
		G_Prompt:showTip(Lang.get("groups_tips_4"))
	end

	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_LEAVE_SUCCESS)
	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_OUTSIDE_STATE)
	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_MY_GROUP_CHAT_CHANGE)
end

--改变队伍设置
function GroupsData:c2sChangeTeamSet(teamTarget, minLevel, maxLevel, teamAuto)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ChangeTeamSet, {
		team_target = teamTarget,
		min_level = minLevel,
		max_level = maxLevel,
		team_auto = teamAuto,
	})
end

--改变队伍设置结果
function GroupsData:_s2cChangeTeamSet(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local teamTarget = rawget(message, "team_target")
	local maxLevel = rawget(message, "max_level")
	local minLevel = rawget(message, "min_level")
	local teamAuto = rawget(message, "team_auto")

	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_SET_CHANGE_SUCCESS)
end

--转让队长	
function GroupsData:c2sTransferLeader(userId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_TransferLeader, {
		user_id = userId,
	})
end

--转让队长结果
function GroupsData:_s2cTransferLeader(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local userId = rawget(message, "user_id") or 0

	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_TRANSFER_LEADER_SUCCESS, userId)
end

--请求自己带队
function GroupsData:c2sAppTransferLeader()
	G_NetworkManager:send(MessageIDConst.ID_C2S_AppTransferLeader, {

	})
end

function GroupsData:_s2cAppTransferLeader(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	
	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_REQUEST_TRANSFER_LEADER_TO_ME)
end

--请求带队消息
function GroupsData:_s2cAppTransferLeaderNotice(id, message)
	local userId = rawget(message, "user_id")
	local userName = rawget(message, "user_name")

	if self._myGroupData then
		local teamType = self._myGroupData:getGroupData():getTeam_type()
		local typeCfg = GroupsDataHelper.getTeamInfoConfig(teamType)
		local agreeTime = typeCfg.agree_time
		local endTime = agreeTime + G_ServerTime:getTime()
		GroupsViewHelper.popupAppTransferLeaderNotice(userId, userName, endTime)
	end
end

--审批请求带队
function GroupsData:c2sOpTransferLeader(userId, op)
	G_NetworkManager:send(MessageIDConst.ID_C2S_OpTransferLeader, {
		user_id = userId,
		op = op
	})
end

--审批请求带队结果
function GroupsData:_s2cOpTransferLeader(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local op = rawget(message, "op")
	local userId = rawget(message, "user_id")
	
	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_OP_TRANSFER_LEADER, op, userId)
end

--接到邀请组队通知
function GroupsData:_s2cInviteJoinTeamNotice(id, message)
	local user = rawget(message, "user")
	local teamId = rawget(message, "team_id")
	local teamType = rawget(message, "team_type")
	local teamTarget = rawget(message, "team_target")

	local userData = GroupsUserData.new()
	userData:updateData(user)
	local refuseTime = GroupsDataHelper.getTeamInfoConfig(teamType).refuse_time
    local currTime = G_ServerTime:getTime()
    userData:setInviteEndTime(currTime + refuseTime)
	GroupsViewHelper.pushInvite(userData, teamId, teamType, teamTarget)
end

--审批邀请好友组队
function GroupsData:c2sOpInviteJoinTeam(userId, op, teamId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_OpInviteJoinTeam, {
		user_id = userId,
		op = op,
		team_id = teamId
	})
end

--审批邀请好友组队结果
function GroupsData:_s2cOpInviteJoinTeam(id, message)
	-- if message.ret ~= MessageErrorConst.RET_OK then
	-- 	return
	-- end

	local op = rawget(message, "op")
	local teamId = rawget(message, "team_id")
	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_OP_INVITE_JOIN_GROUP, teamId, op)
end

function GroupsData:_s2cTeamTips(id, message)
	local tipsType = rawget(message, "tips_type")
	local userName = rawget(message, "user_name")
	local userId = rawget(message, "user_id")
	local param = rawget(message, "param")

	if tipsType == GroupsConst.STATE_KICK_OUT then --被踢出队伍
		self:_clearMyGroupData()
		G_SignalManager:dispatch(SignalConst.EVENT_GROUP_KICK_OUT)
		if param == 1 then
			G_Prompt:showTip(Lang.get("groups_tips_29"))
			G_SignalManager:dispatch(SignalConst.EVENT_GROUP_OUTSIDE_STATE, GroupsConst.OUTSIDE_REASON_1)
		else
			G_Prompt:showTip(Lang.get("groups_tips_6"))
			G_SignalManager:dispatch(SignalConst.EVENT_GROUP_OUTSIDE_STATE)
		end
	elseif tipsType == GroupsConst.STATE_REJECT_TRANSFER_LEADER then --被拒绝申请带队
		G_Prompt:showTip(Lang.get("groups_tips_5", {name = userName}))
		G_SignalManager:dispatch(SignalConst.EVENT_GROUP_REJECT_TRANSFER_LEADER)
		
	elseif tipsType == GroupsConst.STATE_DISSOLVE then --队伍被解散
		local isSelfLeader = self:isSelfLeader()
		self:_clearMyGroupData()
		G_SignalManager:dispatch(SignalConst.EVENT_GROUP_DISSOLVE)
		if param == 2 then
			G_Prompt:showTip(Lang.get("groups_tips_30", {name = userName}))
			G_SignalManager:dispatch(SignalConst.EVENT_GROUP_OUTSIDE_STATE, GroupsConst.OUTSIDE_REASON_2)
		else
			if isSelfLeader == false then
				G_Prompt:showTip(Lang.get("groups_tips_7", {name = userName}))
			end
			G_SignalManager:dispatch(SignalConst.EVENT_GROUP_OUTSIDE_STATE)
		end
	elseif tipsType == GroupsConst.STATE_REJECT_APPLY then --拒绝入队申请 
		G_Prompt:showTip(Lang.get("groups_tips_11", {name = userName}))
		local teamId = param
		local memberData = self:_getMemberDataById(teamId)
		if memberData then
			memberData:setApplyEndTime(0)
		end
		G_SignalManager:dispatch(SignalConst.EVENT_GROUP_REJECT_MY_APPLY)

	elseif tipsType == GroupsConst.STATE_REJECT_INVITE then  --xxx拒绝了您的组队邀请 
		G_Prompt:showTip(Lang.get("groups_tips_13", {name = userName}))
		if self._myGroupData then
			self._myGroupData:removeInviteDataById(userId)
			G_SignalManager:dispatch(SignalConst.EVENT_GROUP_REJECT_INVITE)
		end

	elseif tipsType == GroupsConst.STATE_AGREE_INVITE then --xxx接受了您的组队邀请（不显示 只消邀请）
		if self._myGroupData then
			self._myGroupData:removeInviteDataById(userId)
			G_SignalManager:dispatch(SignalConst.EVENT_GROUP_ACCEPT_INVITE)
		end

	elseif tipsType == GroupsConst.STATE_JOIN_GROUP then  --xxx成功加入队伍 
		G_Prompt:showTip(Lang.get("groups_tips_14", {name = userName}))
		if self._myGroupData then
			self._myGroupData:removeInviteDataById(userId)
			G_SignalManager:dispatch(SignalConst.EVENT_GROUP_JOIN_SUCCESS)
		end

	elseif tipsType == GroupsConst.STATE_JOIN_GROUP_LACK_TIME then   --xxx时间不足加入失败
		G_Prompt:showTip(Lang.get("groups_tips_21"))

	elseif tipsType == GroupsConst.STATE_CUT_TIME then  --进入皇陵时间减少
		G_Prompt:showTipOnTop(Lang.get("groups_tips_22", {second = param}))

	elseif tipsType == GroupsConst.STATE_GET_LEADER_SUCCEED then  --您已成功接任队长
		G_Prompt:showTip(Lang.get("groups_tips_23"))
		G_SignalManager:dispatch(SignalConst.EVENT_GROUP_GET_LEADER_SUCCESS)

	elseif tipsType == GroupsConst.STATE_SET_LEADER_SUCCEED then  --您已成功移交队长
		G_Prompt:showTip(Lang.get("groups_tips_24"))  
		G_SignalManager:dispatch(SignalConst.EVENT_GROUP_SET_LEADER_SUCCESS)
	end
end

--组队进入玩法场景
function GroupsData:c2sTeamEnterScene(teamType)
	G_NetworkManager:send(MessageIDConst.ID_C2S_TeamEnterScene, {
		team_type = teamType
	})
end

--组队进入玩法场景 结果 
function GroupsData:_s2cTeamEnterScene(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local teamType = rawget(message, "team_type")
end

--组队进入玩法场景确认操作
function GroupsData:c2sOpEnterScene(op)
	G_NetworkManager:send(MessageIDConst.ID_C2S_OpEnterScene, {
		op = op
	})
end

--组队进入玩法场景确认操作 结果
function GroupsData:_s2cOpEnterScene(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local op = rawget(message, "op")
	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_OP_ENTER_SCENE, op)
end

--同步申请队伍列表
function GroupsData:_s2cSyncApplyTeamList(id, message)
	local appTeamList = rawget(message, "app_team_list") or {}
	for i, info in ipairs(appTeamList) do
		local teamId = info.team_id
		local appTime = info.app_time
		local memberData = self:_getMemberDataById(teamId)
		if memberData then
			local teamType = memberData:getTeam_type()
			local refuseJoinTime = GroupsDataHelper.getTeamInfoConfig(teamType).refuse_join_time
			memberData:setApplyEndTime(appTime + refuseJoinTime)
		end
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GROUP_SYNC_APPLY_LIST)
end

return GroupsData


