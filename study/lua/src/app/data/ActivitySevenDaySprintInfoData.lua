
local BaseData = require("app.data.BaseData")
local ActivitySevenDaySprintInfoData = class("ActivitySevenDaySprintInfoData", BaseData)

local schema = {}
schema["id"] = {"number", 0}     -- id
schema["sprint_type"] = {"number", 0} -- 类型
schema["name"] = {"string", ""} -- 活动名称
schema["function_id"] = {"number", 0} -- 开启等级
schema["is_work"] = {"number", 0} -- 是否生效
schema["open_day"] = {"number", 0}  -- 开启时间
schema["over_day"] = {"number", 0} -- 结束时间
schema["over_view_day"] = {"number", 0} -- 结束后显示时间
schema["order"] = {"number", 0} -- 页签排序
schema["activity_content_text"] = {"string", ""}-- 活动内容文本


ActivitySevenDaySprintInfoData.schema = schema

function ActivitySevenDaySprintInfoData:ctor(properties)
	ActivitySevenDaySprintInfoData.super.ctor(self)

	if properties then	
		self:updateData(properties)
	end
end

function ActivitySevenDaySprintInfoData:clear()
	
end

function ActivitySevenDaySprintInfoData:reset()
	
end

function ActivitySevenDaySprintInfoData:updateData(data)
	self:setProperties(data)
end


function ActivitySevenDaySprintInfoData:getType()
	return self:getSprint_type()
end

function ActivitySevenDaySprintInfoData:getDescription()
	local TimeLimitActivityConst = require("app.const.TimeLimitActivityConst")
	local des = self:getActivity_content_text()
	local actType = self:getSprint_type()
	local finalDes = des
	if actType == TimeLimitActivityConst.ACTIVITY_TYPE_GUILD_SPRINT  then
		finalDes = Lang.getTxt(des,{num = self:getOver_day()}) or ""
	end  
	return finalDes
end

function ActivitySevenDaySprintInfoData:isActivityCompetitionTimeEnd()
	local CommonConst = require("app.const.CommonConst")
	local openDays = G_UserData:getBase():getOpenServerDayNum()
	return openDays >= self:getOver_day() 
end
 
function ActivitySevenDaySprintInfoData:getActivityStartEndTime()
	local CommonConst = require("app.const.CommonConst")
	local TimeConst = require("app.const.TimeConst")
	local openServerTime = G_UserData:getBase():getServer_open_time()
	local openZeroTime = G_ServerTime:secondsFromZero(openServerTime,TimeConst.RESET_TIME_SECOND)
	local startTime = openZeroTime + (self:getOpen_day()-1) * (3600 *24)
	local endTime = openZeroTime + (self:getOver_view_day()-1) * (3600 *24)
	local competitionEndTime = openZeroTime + (self:getOver_day()-1) * (3600 *24)
	return startTime,endTime,competitionEndTime
end

function ActivitySevenDaySprintInfoData:isActivityOpen()
	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	local CommonConst = require("app.const.CommonConst")

	local isOpenCheckFunc = function()
		return self:getIs_work() == CommonConst.TRUE_VALUE and
			( self:getFunction_id()  == 0 and true or FunctionCheck.funcIsOpened(self:getFunction_id() ) )
	end
	if not isOpenCheckFunc() then
		return false
	end

	local openDays = G_UserData:getBase():getOpenServerDayNum()

	if openDays >= self:getOpen_day()  and openDays < self:getOver_view_day() then
		return true
	end
	return false
end

return ActivitySevenDaySprintInfoData