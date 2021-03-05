--
-- 进入场景前准备信息
-- Author: liangxu
-- Date: 2018-11-10
-- 
local BaseData = require("app.data.BaseData")
local GroupsPreSceneData = class("GroupsPreSceneData", BaseData)
local GroupsUserData = require("app.data.GroupsUserData")
local GroupsDataHelper = require("app.utils.data.GroupsDataHelper")

local schema = {}
schema["team_target"]	 = {"number", 0}
schema["first"] 		 = {"boolean", false} --是否第一次推送
schema["agreeTime"] 	 = {"number", 0} --同意截止时间
GroupsPreSceneData.schema = schema

function GroupsPreSceneData:ctor(properties)
	GroupsPreSceneData.super.ctor(self, properties)

	self._memberStates = {}
end

function GroupsPreSceneData:clear()
	
end

function GroupsPreSceneData:reset()
	self._memberStates = {}
end

function GroupsPreSceneData:updateData(data)
	local memberState = rawget(data, "member_state") or {}
	local teamTarget = rawget(data, "team_target") or 0
	local first = rawget(data, "first") or false

	self._memberStates = {}
	for i, info in ipairs(memberState) do
		local member = rawget(info, "member")
		local state = rawget(info, "state") --是否确认进入场景
		local user = rawget(member, "user")
		local teamNo = rawget(member, "team_no")
		local userData = GroupsUserData.new()
		userData:updateData(user)
		userData:setConfirmEnterScene(state)
		self._memberStates[teamNo] = userData
	end
	self:setTeam_target(teamTarget)
	self:setFirst(first)

	if first then
		local agreeTime = G_ServerTime:getTime() + GroupsDataHelper.getTeamTargetConfig(teamTarget).agree_activity_time
		self:setAgreeTime(agreeTime)
	end
end

function GroupsPreSceneData:getUserDataWithLocation(location)
	return self._memberStates[location]
end

function GroupsPreSceneData:getMemberCount()
	local count = 0
	for k, data in pairs(self._memberStates) do
		count = count + 1
	end
	return count
end

function GroupsPreSceneData:getAgreeCount()
	local count = 0
	for k, data in pairs(self._memberStates) do
		if data:isConfirmEnterScene() then
			count = count + 1
		end
	end
	return count
end

return GroupsPreSceneData