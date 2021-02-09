--
-- 组队玩家数据
-- Author: zhanglinsen
-- Date: 2018-08-30 10:05:31
-- 
local BaseData = require("app.data.BaseData")
local GroupsUserData = class("GroupsUserData", BaseData)
local GroupsConst = require("app.const.GroupsConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local SchedulerHelper = require("app.utils.SchedulerHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local HeroConst = require("app.const.HeroConst")

local schema = {}
schema["user_id"] 				= {"number", 0} --成员id
schema["base_id"] 				= {"number", 0} --
schema["avatar_base_id"] 		= {"number", 0} --动画id
schema["name"] 				    = {"string", ""} --玩家昵称
schema["office_level"] 	        = {"number", 0} --官衔
schema["level"] 			    = {"number", 0} --玩家等级
schema["power"] 			    = {"number", 0} --战力
schema["guild_name"] 			= {"string", ""} --玩家军团
schema["title"]                 = {"number", 0}   -- 称号
schema["head_frame_id"]         = {"number",0} -- 头像框
--交互数据
schema["covertId"]              = {"number", 0}
schema["limitLevel"]            = {"number", 0} --变身卡界限等级（橙变红）
schema["applyEndTime"]          = {"number", 0} --申请结束时间戳
schema["inviteEndTime"]         = {"number", 0} --邀请结束时间戳
schema["confirmEnterScene"]   = {"boolean", false} --是否确认进入场景
GroupsUserData.schema = schema

function GroupsUserData:ctor(properties)
    GroupsUserData.super.ctor(self, properties)
    self._countDownHandler = nil
end

function GroupsUserData:clear()
	self:_endCountDown()
end

function GroupsUserData:reset()
    
end

--是否已经结束申请
function GroupsUserData:isEndApply()
    local endTime = self:getApplyEndTime()
    local time = G_ServerTime:getLeftSeconds(endTime)
    return time <= 0
end

--是否结束邀请
function GroupsUserData:isEndInvite()
    local endTime = self:getInviteEndTime()
    local time = G_ServerTime:getLeftSeconds(endTime)
    return time <= 0
end

function GroupsUserData:updateData(data)
    self:setProperties(data)
    
    local covertId, table = UserDataHelper.convertAvatarId(data)
	if covertId and table then
		self:setCovertId(covertId)
        local avatarBaseId = table.avatarBaseId
        if avatarBaseId > 0 then
            local limit = AvatarDataHelper.getAvatarConfig(avatarBaseId).limit
            if limit == 1 then
                self:setLimitLevel(HeroConst.HERO_LIMIT_RED_MAX_LEVEL)
            end
        end
	end
end

--是否是自己
function GroupsUserData:isSelf()
    local selfId = G_UserData:getBase():getId()
    local userId = self:getUser_id()
    return selfId == userId
end

--是否是队长
function GroupsUserData:isLeader()
    local myMemberData = G_UserData:getGroups():getMyGroupData()
    if myMemberData then
        local memberData = myMemberData:getGroupData()
        local leaderId = memberData:getTeam_leader()
        local userId = self:getUser_id()
        return leaderId == userId
    end
    
    return false
end

function GroupsUserData:startCountDown()
    self:_endCountDown()

    local nowTime = G_ServerTime:getTime()
    local endTime = self:getApplyEndTime()
    local interval = endTime - nowTime
    if interval > 0 then
        self._countDownHandler = SchedulerHelper.newScheduleOnce(handler(self, self._onEndApply), interval)
    end
end

function GroupsUserData:_endCountDown()
    if self._countDownHandler then
        SchedulerHelper.cancelSchedule(self._countDownHandler)
        self._countDownHandler = nil
    end
end

--结束申请时间到了
function GroupsUserData:_onEndApply()
    local userId = self:getUser_id()
    local myMemberData = G_UserData:getGroups():getMyGroupData()
    if myMemberData then
        myMemberData:removeApplyDataWithId(userId)
    end
    
    G_SignalManager:dispatch(SignalConst.EVENT_GROUP_APPLY_TIME_OUT, userId)
end

--是否加入了军团
function GroupsUserData:isInGuild()
    local name = self:getGuild_name()
    return name ~= ""
end

return GroupsUserData