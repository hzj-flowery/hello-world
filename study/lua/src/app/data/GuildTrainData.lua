local BaseData = require("app.data.BaseData")
local GuildTrainData = class("GuildTrainData", BaseData)
local HeroConst = require("app.const.HeroConst")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local SchedulerHelper = require("app.utils.SchedulerHelper")

local schema = {}
schema["user_id"] = {"number", 0}
schema["name"] = {"string", {}}
schema["office_level"]	  = {"number", 0}
schema["leader"]	  = {"number", 0}
schema["avatar_base_id"]	  = {"number", 0}
schema["title"]	  = {"number", 0}
schema["level"]	  = {"number", 0}
schema["avarta_base_id"]	  = {"number", 0}
schema["limit_level"]	  = {"number", 0}
schema["base_id"]	  = {"number", 0}
schema["officer_level"] = {"number",0}
-- 交互数据

schema["covertId"]              = {"number", 0}
schema["inviteEndTime"]         = {"number", 0} --邀请结束时间戳
schema["confirmEnterScene"]   = {"boolean", false} --是否确认进入场景


GuildTrainData.schema = schema

function GuildTrainData:ctor(properties)

	GuildTrainData.super.ctor(self, properties)

    local covertId, table = UserDataHelper.convertAvatarId(properties)
	if covertId and table then
		self:setCovertId(covertId)
        local avatarBaseId = table.avatarBaseId
        if avatarBaseId > 0 then
            local limit = AvatarDataHelper.getAvatarConfig(avatarBaseId).limit
            if limit == 1 then
                self:setLimit_level(HeroConst.HERO_LIMIT_RED_MAX_LEVEL)
            end
        end
	end

	self._countDownHandler = nil
end


--是否结束邀请
function GuildTrainData:isEndInvite()
    local endTime = self:getInviteEndTime()
    local time = G_ServerTime:getLeftSeconds(endTime)
    return time <= 0
end


function GuildTrainData:startCountDown()
    self:_endCountDown()

    local nowTime = G_ServerTime:getTime()
    local endTime = self:getInviteEndTime()
    local interval = endTime - nowTime
    if interval > 0 then
        self._countDownHandler = SchedulerHelper.newScheduleOnce(handler(self, self._onEndApply), interval)
    end
end

--结束申请时间到了
function GuildTrainData:_onEndApply()
    local userId = self:getUser_id()
    G_UserData:getGuild():c2sConfirmGuildTrain(userId,false)
end

function GuildTrainData:_endCountDown()
    if self._countDownHandler then
        SchedulerHelper.cancelSchedule(self._countDownHandler)
        self._countDownHandler = nil
    end
end


function GuildTrainData:clear()
	self:_endCountDown()
	
end

function GuildTrainData:reset()
	
end

return GuildTrainData