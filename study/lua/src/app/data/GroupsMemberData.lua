--
-- 单个队伍数据
-- Author: zhanglinsen
-- Date: 2018-08-30 10:05:31
-- 
local BaseData = require("app.data.BaseData")
local GroupsMemberData = class("GroupsMemberData", BaseData)
local GroupsConst = require("app.const.GroupsConst")
local GroupsUserData = require("app.data.GroupsUserData")
local GroupsDataHelper = require("app.utils.data.GroupsDataHelper")
local SchedulerHelper = require("app.utils.SchedulerHelper")

local schema = {}
schema["team_id"]            = {"number", 0}
schema["team_type"]          = {"number", 0}
schema["team_target"]        = {"number", 0}
schema["min_level"]          = {"number", 0}
schema["max_level"]          = {"number", 0}
schema["team_leader"]        = {"number", 0}
schema["members"]            = {"table", {}}
schema["is_scene"]           = {"boolean", false}
schema["applyEndTime"]       = {"number", 0} --申请截止时间戳
GroupsMemberData.schema = schema

function GroupsMemberData:ctor(properties)
	GroupsMemberData.super.ctor(self, properties)
    self._userList = {} --成员列表
    self._countDownHandler = nil
end

function GroupsMemberData:clear()
    self._userList = {}
end

function GroupsMemberData:reset()
	self._userList = {}
end

--更新队伍信息
function GroupsMemberData:updateData(data)
    self._userList = {}
    self:setProperties(data)
    local members = rawget(data, "members") or {}
    for i, member in ipairs(members) do
        local user = rawget(member, "user")
        local teamNo = rawget(member, "team_no") or 0
        local userData = GroupsUserData.new()
        userData:updateData(user)
        self._userList[teamNo] = userData
    end
end

--自己是否是队长
function GroupsMemberData:checkLeaderIsSelf()
    local selfId = G_UserData:getBase():getId()
    local leaderId = self:getTeam_leader()
    return selfId == leaderId
end

--此队伍是否是自己的队伍
function GroupsMemberData:isSelfGroup()
    local myGroupData = G_UserData:getGroups():getMyGroupData()
    if myGroupData then
        local selfTeamId = myGroupData:getGroupData():getTeam_id()
        local teamId = self:getTeam_id()
        return selfTeamId == teamId
    end
    return false
end

--队长名字
function GroupsMemberData:getLeaderName()
    local leaderId = self:getTeam_leader()
    for k, data in pairs(self._userList) do
        if data:getUser_id() == leaderId then
            return data:getName()
        end
    end
    return ""
end

--获取该位置玩家信息
function GroupsMemberData:getUserDataWithLocation(location)
    return self._userList[location]
end

function GroupsMemberData:getUserData(userId)
    for k, data in pairs(self._userList) do
        if data:getUser_id() == userId then
            return data
        end
    end
    return nil
end

--是否已经结束申请
function GroupsMemberData:isEndApply()
    local endTime = self:getApplyEndTime()
    local time = G_ServerTime:getLeftSeconds(endTime)
    return time <= 0
end

--队员列表
function GroupsMemberData:getUserList()
    return self._userList
end

function GroupsMemberData:getUserCount()
    local count = 0
    for k, data in pairs(self._userList) do
        count = count + 1
    end
    return count
end

--删除队员
--@param userId 队伍信息
function GroupsMemberData:removeUserById(userId)
    for k, data in pairs(self._userList) do
        if data:getUser_id() == userId then
            self._userList[k] = nil
        end
    end
end

--人员是否满了
function GroupsMemberData:isFull()
    local count = self:getUserCount()
    return count >= GroupsConst.MAX_PLAYER_SIZE
end

function GroupsMemberData:startCountDown()
    self:_endCountDown()

    local nowTime = G_ServerTime:getTime()
    local endTime = self:getApplyEndTime()
    local interval = endTime - nowTime
    if interval > 0 then
        self._countDownHandler = SchedulerHelper.newScheduleOnce(handler(self, self._onEndApply), interval)
    end
end

function GroupsMemberData:_endCountDown()
    if self._countDownHandler then
        SchedulerHelper.cancelSchedule(self._countDownHandler)
        self._countDownHandler = nil
    end
end

--结束申请时间到了
function GroupsMemberData:_onEndApply()
    local teamType = self:getTeam_type()
    local teamId = self:getTeam_id()
    G_SignalManager:dispatch(SignalConst.EVENT_GROUP_APPLY_JOIN_TIME_OUT, teamType, teamId)
end

return GroupsMemberData