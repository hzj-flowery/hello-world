--@Author:Conley

local BaseData = require("app.data.BaseData")
local TimeConst = require("app.const.TimeConst")
local ExpireStateData = class("ExpireStateData", BaseData)

--一天的秒数
ExpireStateData.SECONDS_ONE_DAY = 86400
ExpireStateData.SECONDS_ONE_WEEK = 604800


ExpireStateData.RESET_TYPE_WEEKLY = 1
ExpireStateData.RESET_TYPE_DAILY = 0
ExpireStateData.RESET_TYPE_NONE = 2--不重置

local schema = {}
schema["dataExpired"] 		    = {"boolean", false}
schema["lastUpdateTime"]    = {"number", 0}
schema["resetType"] 		= {"number", 0}--0 每天，1 每周
ExpireStateData.schema = schema

function ExpireStateData:ctor(properties)
	ExpireStateData.super.ctor(self, properties)
	-- 数据是否过期，默认当然是没有过期了
	self:setDataExpired(false)
	-- 上次更新时间，一开始直接取服务器时间，这里可能是本地的时间，因为服务器时间还没有更新到，不过先不管
	self:setLastUpdateTime(0)--self:setLastUpdateTime(G_ServerTime:getTime())
end

--[===================[
	数据是否过期，这里指的是是否过了重置时间了
	@resetTime重置的时间(可选，默认是凌晨4点)
	@return 返回是否过期
]===================]

function ExpireStateData:isExpired(resetTime)
	if self:getResetType() == ExpireStateData.RESET_TYPE_NONE then
		return false
	end
	--无值时使用通用的时间
	local resetTime = resetTime ~= nil and resetTime or TimeConst.RESET_TIME

	if not self:isDataExpired() then
		-- 当前服务器时间
		local curTime = G_ServerTime:getTime()
		if self.lastUpdateTime_ == 0 then
			self:setDataExpired(true)
		elseif curTime > self.lastUpdateTime_ then
			local nextUpdateTime = 0 
			if self:getResetType() == ExpireStateData.RESET_TYPE_DAILY then
				nextUpdateTime = self:_calNextExpiredTimeOfDaily(resetTime,self.lastUpdateTime_)
			elseif  self:getResetType() == ExpireStateData.RESET_TYPE_WEEKLY then
				nextUpdateTime = self:_calNextExpiredTimeOfWeekly(1,resetTime,self.lastUpdateTime_)
			end
			-- 是否过期就看当前时间是否大于下一次更新时间了
			self:setDataExpired(curTime >= nextUpdateTime)
		end

	end

	return self:isDataExpired()
end

--@resetTime:重置时间，不传使用默认时间
--@isAccordingCurrTime:是否依照当前时间类算过期时间,默认参照数据刷新时间（0时则参数当前时间）
--@return：返回0永远不过期
function ExpireStateData:getExpiredTime(resetTime,isAccordingCurrTime)
	if self:getResetType() == ExpireStateData.RESET_TYPE_NONE then
		return 0
	end
	--无值时使用通用的时间
	local resetTime = resetTime ~= nil and resetTime or TimeConst.RESET_TIME	
	-- 当前服务器时间
	local curTime = G_ServerTime:getTime()
	local lastUpdateTime = isAccordingCurrTime and curTime or math.min(self.lastUpdateTime_,curTime)
	if lastUpdateTime == 0 then
		lastUpdateTime = curTime
	end

	local nextUpdateTime = 0 
	if self:getResetType() == ExpireStateData.RESET_TYPE_DAILY then
		nextUpdateTime = self:_calNextExpiredTimeOfDaily(resetTime,lastUpdateTime)
	elseif  self:getResetType() == ExpireStateData.RESET_TYPE_WEEKLY then
		nextUpdateTime = self:_calNextExpiredTimeOfWeekly(1,resetTime,lastUpdateTime)
	end
	return nextUpdateTime
end

--计算每天重置的过期时间
function ExpireStateData:_calNextExpiredTimeOfDaily(resetTime,lastUpdateTime)
	-- 重置时间换算成秒数
	local resetSeconds = resetTime * 3600
	-- 上一次更新距离今天0点的时间（秒数）
	local lastSeconds = G_ServerTime:secondsFromToday(lastUpdateTime)
	local nextUpdateTime = lastUpdateTime - lastSeconds + resetSeconds + (lastSeconds > resetSeconds and ExpireStateData.SECONDS_ONE_DAY or 0)
	--[[
		logWarn("lastSeconds:"..tostring(lastSeconds))
		logWarn("resetSeconds   :"..tostring(resetSeconds))
		logWarn("lastUpdateTime:"..tostring(self.lastUpdateTime_))
		logWarn("curTimeTime   :"..tostring(curTime))
		logWarn("nextUpdateTime:"..tostring(nextUpdateTime))
	]]
	return nextUpdateTime
end

--计算每周重置的过期时间
function ExpireStateData:_calNextExpiredTimeOfWeekly(resetWeekDay, resetTime,lastUpdateTime )
	local resetSeconds = resetTime * 3600
	local daySeconds = 24 * 3600
	local todayPassedSeconds = G_ServerTime:secondsFromToday(lastUpdateTime)
	local weekDay = tonumber(os.date("%w",lastUpdateTime))
	if weekDay == 0 then
		weekDay = 7
	end
    local weekPassedSeconds = todayPassedSeconds + (weekDay-1) * daySeconds
	local weekResetSeconds = (resetWeekDay-1) * daySeconds + resetSeconds
	local nextUpdateTime = lastUpdateTime - weekPassedSeconds + weekResetSeconds + (weekPassedSeconds > weekResetSeconds and ExpireStateData.SECONDS_ONE_WEEK or 0)
	return nextUpdateTime
end

function ExpireStateData:updateTime(time)
	self:setDataExpired(false)
	self:setLastUpdateTime(time or G_ServerTime:getTime())
end

function ExpireStateData:setNotExpire()
	--多补几秒
	self:updateTime(G_ServerTime:getTime() + TimeConst.SET_EXPIRE_EXTRA_SECOND)
end

function ExpireStateData:reset()
	self:setDataExpired(true)
	self:setLastUpdateTime(0)
end

-- 清除
function ExpireStateData:clear()
end

return ExpireStateData