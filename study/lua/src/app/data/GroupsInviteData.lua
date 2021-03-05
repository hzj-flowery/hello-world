--
-- 组队邀请数据
-- Author: liangxu
-- Date: 2018-11-7
-- 
local BaseData = require("app.data.BaseData")
local GroupsInviteData = class("GroupsInviteData", BaseData)
local SchedulerHelper = require("app.utils.SchedulerHelper")

local schema = {}
schema["user_id"] = {"number", 0}
schema["invite_time"] = {"number", 0}
GroupsInviteData.schema = schema

function GroupsInviteData:ctor(properties)
    GroupsInviteData.super.ctor(self, properties)
end

function GroupsInviteData:clear()
	self:_endCountDown()
end

function GroupsInviteData:reset()

end

function GroupsInviteData:updateData(data)
	self:setProperties(data)
	self:_startCountDown()
end

--是否已经过了邀请时间
function GroupsInviteData:isEndInvite()
	local endTime = self:getInvite_time()
    local time = G_ServerTime:getLeftSeconds(endTime)
    return time <= 0
end

function GroupsInviteData:_startCountDown()
    self:_endCountDown()

    local nowTime = G_ServerTime:getTime()
    local endTime = self:getInvite_time()
    local interval = endTime - nowTime
    if interval > 0 then
        self._countDownHandler = SchedulerHelper.newScheduleOnce(handler(self, self._onEndApply), interval)
    end
end

function GroupsInviteData:_endCountDown()
    if self._countDownHandler then
        SchedulerHelper.cancelSchedule(self._countDownHandler)
        self._countDownHandler = nil
    end
end

--结束申请时间到了
function GroupsInviteData:_onEndApply()
    local userId = self:getUser_id()
    local myMemberData = G_UserData:getGroups():getMyGroupData()
    if myMemberData then
        myMemberData:removeInviteDataById(userId)
    end
    
    G_SignalManager:dispatch(SignalConst.EVENT_GROUP_INVITE_TIME_OUT, userId)
end

return GroupsInviteData