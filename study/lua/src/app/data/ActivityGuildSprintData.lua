--百大军团活动
--@Author:Conley

local BaseData = require("app.data.BaseData")
local ActivityGuildSprintData = class("ActivityGuildSprintData", BaseData)
local ActivityGuildSprintRankUnitData = require("app.data.ActivityGuildSprintRankUnitData")
local TimeLimitActivityConst = require("app.const.TimeLimitActivityConst")
local schema = {}
schema["guild_rank"] 	= {"number",0}
schema["hasData"] 	= {"boolean",false}--是否从服务器取到了数据

ActivityGuildSprintData.schema = schema

function ActivityGuildSprintData:ctor(properties)
	ActivityGuildSprintData.super.ctor(self, properties)

	self._showGuilds = {}

   	self._signalGetSevenDaysSprintGuild = G_NetworkManager:add(MessageIDConst.ID_S2C_GetSevenDaysSprintGuild, handler(self, self._s2cGetSevenDaysSprintGuild))
	self._signalGetSevenDaysSprintGuildRank = G_NetworkManager:add(MessageIDConst.ID_S2C_GetSevenDaysSprintGuildRank, handler(self, self._s2cGetSevenDaysSprintGuildRank))
	self._signalCommonZeroNotice = G_SignalManager:add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(self, self._onEventCommonZeroNotice))
end

-- 清除
function ActivityGuildSprintData:clear()
    self._signalGetSevenDaysSprintGuild:remove()
	self._signalGetSevenDaysSprintGuild = nil

    self._signalGetSevenDaysSprintGuildRank:remove()
	self._signalGetSevenDaysSprintGuildRank = nil

	self._signalCommonZeroNotice:remove()
	self._signalCommonZeroNotice = nil
end

-- 重置
function ActivityGuildSprintData:reset()
	self._showGuilds = {}
	self:setHasData(false)
end

function ActivityGuildSprintData:_onEventCommonZeroNotice(event,hour)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_ACTIVITY)
end

function ActivityGuildSprintData:c2sGetSevenDaysSprintGuild()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetSevenDaysSprintGuild, {})
end


function ActivityGuildSprintData:c2sGetSevenDaysSprintGuildRank()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetSevenDaysSprintGuildRank, {})
end


function ActivityGuildSprintData:_s2cGetSevenDaysSprintGuild(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

--[[
	repeated GuildRankData show_guilds = 2;
	optional uint32 guild_rank = 3;
]]

	self:setHasData(true)

	self:resetTime()
	self:setProperties(message)

	self._showGuilds = {}
	local showGuilds = rawget(message,"show_guilds") or {}
	for k,v in ipairs(showGuilds) do
		local data = ActivityGuildSprintRankUnitData.new()
		data:initData(v)
		self._showGuilds[v.rank] = data
	end

    G_SignalManager:dispatch(SignalConst.EVENT_ACTIVITY_GUILD_SPRINT_INFO,message)
end

function ActivityGuildSprintData:_s2cGetSevenDaysSprintGuildRank(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local rankUnitDataList = {}
	local ranks = rawget(message,"ranks") or {}
	for k,v in ipairs(ranks) do
		local data = ActivityGuildSprintRankUnitData.new()
		data:initData(v)
		table.insert(rankUnitDataList,data)
	end
	local myRank = rawget(message,"rank") or 0
	
    G_SignalManager:dispatch(SignalConst.EVENT_ACTIVITY_GUILD_SPRINT_GET_RANK_LIST,rankUnitDataList,myRank)
end

function ActivityGuildSprintData:pullData()
	self:c2sGetSevenDaysSprintGuild()
end


function ActivityGuildSprintData:getShowGuilds()
	return self._showGuilds
end

function ActivityGuildSprintData:getActivityConfigData()
	local TimeLimitActivityConst = require("app.const.TimeLimitActivityConst")
 	local  actUnitData =  G_UserData:getTimeLimitActivity():getSprintActUnitData(TimeLimitActivityConst.ACTIVITY_TYPE_GUILD_SPRINT )
	return actUnitData
end

function ActivityGuildSprintData:hasSeeActivity()
    local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
		FunctionConst.FUNC_ACTIVITY,{actId = TimeLimitActivityConst.ACTIVITY_TYPE_GUILD_SPRINT,
			actType = TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT}
    )
	if showed then
		return false
	end
	return true
end

--返回：红点,新活动,非新活动的红点
function ActivityGuildSprintData:hasRedPoint()
	local actConfigData = self:getActivityConfigData()
	if not actConfigData then
		return false,false,false
	end
	local red = actConfigData:isActivityOpen() and self:hasSeeActivity()
	return red,red,false
end

function ActivityGuildSprintData:hasActivityCanVisible()
	local actConfigData = self:getActivityConfigData()
	if not actConfigData then
		return false
	end
	return actConfigData:isActivityOpen()
end



return ActivityGuildSprintData


