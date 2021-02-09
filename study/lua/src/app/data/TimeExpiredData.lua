--时间过期类，BaseData的基类
-- 重置时间，小时为单位
local TimeConst = require("app.const.TimeConst")
local TimeExpiredData = class("TimeExpiredData")

--一天的秒数
TimeExpiredData.SECONDS_ONE_DAY = 86400
TimeExpiredData.SECONDS_ONE_WEEK = 604800


TimeExpiredData.RESET_TYPE_WEEKLY = 1
TimeExpiredData.RESET_TYPE_DAILY = 0
TimeExpiredData.RESET_TYPE_NONE = 2--不重置


function TimeExpiredData:ctor()
	-- 数据是否过期，默认当然是没有过期了
	self._isExpired = false
	-- 上次更新时间，一开始直接取服务器时间，这里可能是本地的时间，因为服务器时间还没有更新到，不过先不管
	self._lastUpdateTime  = 0 --[[self._lastUpdateTime = os.time()]]
	self._resetType = TimeExpiredData.RESET_TYPE_DAILY
	self._defaultResetTime = TimeConst.RESET_TIME

	--logWarn(self.class.__cname.." _resetType")
end

function TimeExpiredData:setResetTime(time)	
	self._defaultResetTime = time
end

--[[
	数据是否过期，这里指的是是否过了重置时间了
	resetTime重置的时间(可选，默认是凌晨4点)
	return 返回是否过期

function TimeExpiredData:isExpired(resetTime)
	
	local resetTime = resetTime ~= nil and resetTime or TimeExpiredData.RESET_TIME

	if not self._isExpired then

		-- 当前服务器时间
		local curTime = G_ServerTime:getTime()

		if curTime > self._lastUpdateTime then
			-- 重置时间换算成秒数
			local resetSeconds = resetTime * 3600
			-- 上一次更新是否距离今天0点的时间（秒数）
			local lastSeconds = G_ServerTime:secondsFromToday(self._lastUpdateTime)
			-- 今天已过秒数
			local hasSeconds = G_ServerTime:secondsFromToday(curTime)
			-- 得出下一次更新时间
			local nextUpdateTime = self._lastUpdateTime - lastSeconds + resetSeconds + (lastSeconds > resetSeconds and TimeExpiredData.SECONDS_ONE_DAY or 0)

			-- 是否过期就看当前时间是否大于下一次更新时间了
			self._isExpired = curTime >= nextUpdateTime
		end
	end

	local function showErrorTip( ... )
		-- body
		G_Prompt:showTip(Lang.get("common_text_reset_time_tip"))
	end
	return self._isExpired, showErrorTip
end
]]


--[[
	重置过期标识,拉到服务器数据时调用
]]
function TimeExpiredData:resetTime(time)
	self._isExpired = false
	self._lastUpdateTime = time or G_ServerTime:getTime()
end


--[===================[
	数据是否过期，这里指的是是否过了重置时间了
	@resetTime重置的时间(可选，默认是凌晨4点)
	@return 返回是否过期
]===================]

function TimeExpiredData:isExpired(resetTime)
	self._resetType = self._resetType or TimeExpiredData.RESET_TYPE_DAILY--预防没初始化（父类没调用子类的构造）
	if self._resetType == TimeExpiredData.RESET_TYPE_NONE then
		return false
	end
	--无值时使用通用的时间
	local resetTime = resetTime ~= nil and resetTime or self._defaultResetTime
	resetTime = resetTime or TimeConst.RESET_TIME
	--logWarn(self.class.__cname.." call isExpired "..tostring(self._isExpired).." "..self._lastUpdateTime)
	if not self._isExpired then
		-- 当前服务器时间
		local curTime = G_ServerTime:getTime()
		--logWarn(self.class.__cname.." currtime "..curTime)
		if self._lastUpdateTime == 0 then
			self._isExpired = true
			--logWarn(self.class.__cname.." lastUpdateTime == 0  ")
		elseif curTime > self._lastUpdateTime then
			local nextUpdateTime = 0 
			if self._resetType == TimeExpiredData.RESET_TYPE_DAILY then
				nextUpdateTime = self:_calNextExpiredTimeOfDaily(resetTime,self._lastUpdateTime)
			elseif  self._resetType == TimeExpiredData.RESET_TYPE_WEEKLY then
				nextUpdateTime = self:_calNextExpiredTimeOfWeekly(1,resetTime,self._lastUpdateTime)
			end
			-- 是否过期就看当前时间是否大于下一次更新时间了
			self._isExpired = curTime >= nextUpdateTime--TODO是否需要多加几秒，以免服务器还没过期
			--logWarn(self.class.__cname.." judge isExpired  "..curTime.."  "..nextUpdateTime .. "  "..self._lastUpdateTime)
		end
	end
	local function showErrorTip( ... )
		-- body
		G_Prompt:showTip(Lang.get("common_text_reset_time_tip"))
	end
	--logWarn(self.class.__cname.." call end "..tostring(self._isExpired))
	return self._isExpired,showErrorTip
end



--@resetTime:重置时间，不传使用默认时间
--@isAccordingCurrTime:是否依照当前时间类算过期时间,默认参照数据刷新时间（0时则参数当前时间）
--@return：返回0永远不过期
function TimeExpiredData:getExpiredTime(resetTime,isAccordingCurrTime)
	self._resetType = self._resetType or TimeExpiredData.RESET_TYPE_DAILY--预防没初始化（父类没调用子类的构造）
	if self._resetType == TimeExpiredData.RESET_TYPE_NONE then
		return 0
	end
	--无值时使用通用的时间
	local resetTime = resetTime ~= nil and resetTime or self._defaultResetTime
	resetTime = resetTime or TimeConst.RESET_TIME
	-- 当前服务器时间
	local curTime = G_ServerTime:getTime()
	local lastUpdateTime = isAccordingCurrTime and curTime or math.min(self._lastUpdateTime,curTime)
	if lastUpdateTime == 0 then
		lastUpdateTime = curTime
	end

	local nextUpdateTime = 0 
	if self._resetType == TimeExpiredData.RESET_TYPE_DAILY then
		nextUpdateTime = self:_calNextExpiredTimeOfDaily(resetTime,lastUpdateTime)
	elseif  self._resetType == TimeExpiredData.RESET_TYPE_WEEKLY then
		nextUpdateTime = self:_calNextExpiredTimeOfWeekly(1,resetTime,lastUpdateTime)
	end
	return nextUpdateTime
end


--计算每天重置的过期时间
function TimeExpiredData:_calNextExpiredTimeOfDaily(resetTime,lastUpdateTime)
	-- 重置时间换算成秒数
	local resetSeconds = resetTime * 3600
	-- 上一次更新距离今天0点的时间（秒数）
	local lastSeconds = G_ServerTime:secondsFromToday(lastUpdateTime)
	local nextUpdateTime = lastUpdateTime - lastSeconds + resetSeconds + (lastSeconds >= resetSeconds and TimeExpiredData.SECONDS_ONE_DAY or 0)

	--logWarn(self.class.__cname.." resetSeconds   :"..tostring(resetSeconds))
	--logWarn(self.class.__cname.." lastUpdateTime:"..tostring(lastUpdateTime))
	--logWarn(self.class.__cname.." lastSeconds:"..tostring(lastSeconds))
	--logWarn(self.class.__cname.." nextUpdateTime:"..tostring(nextUpdateTime))

	return nextUpdateTime
end


--计算每周重置的过期时间
function TimeExpiredData:_calNextExpiredTimeOfWeekly(resetWeekDay, resetTime,lastUpdateTime )
	local resetSeconds = resetTime * 3600
	local daySeconds = 24 * 3600
	local todayPassedSeconds = G_ServerTime:secondsFromToday(lastUpdateTime)
	local weekDay = tonumber(os.date("%w",lastUpdateTime))
	if weekDay == 0 then
		weekDay = 7
	end
    local weekPassedSeconds = todayPassedSeconds + (weekDay-1) * daySeconds
	local weekResetSeconds = (resetWeekDay-1) * daySeconds + resetSeconds
	local nextUpdateTime = lastUpdateTime - weekPassedSeconds + weekResetSeconds + (weekPassedSeconds >= weekResetSeconds 
		and TimeExpiredData.SECONDS_ONE_WEEK or 0)
	return nextUpdateTime
end



function TimeExpiredData:updateTime(time)
	self._isExpired = false
	self._lastUpdateTime = time or G_ServerTime:getTime()
end

function TimeExpiredData:setNotExpire()
	--多补几秒
	self:updateTime(G_ServerTime:getTime() + TimeConst.SET_EXPIRE_EXTRA_SECOND)
end

function TimeExpiredData:reset()
	self._isExpired = true
	self._lastUpdateTime = 0
	--logWarn(self.class.__cname.." reset")
end

-- 清除
function TimeExpiredData:clear()
end

function TimeExpiredData:setResetType(resetType)
	--logWarn(self.class.__cname.." setResetType:"..tostring(resetType))
	self._resetType = resetType
end

return TimeExpiredData