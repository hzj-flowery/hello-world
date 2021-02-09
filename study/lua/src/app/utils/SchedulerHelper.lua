
-- SchedulerHelper

--[====================[
	
	定时器类

    主要是使用scheduler的机制

]====================]

local scheduler = require("cocos.framework.scheduler")

local SchedulerHelper = {}

--[====================[

	新建一个倒计时
	
	@param countdown 倒计时总时长
	@param interval 倒计时的步长，也就是每一次倒计时递进所用时间
	@param stepFun 倒计时的递进通知函数
	@param stepOverFun 倒计时结束的通知函数
	@param key 倒计时的关键key，用于在倒计时结束的时候传递给结束函数

	@return 返回倒计时的句柄

]====================]

function SchedulerHelper.newCountdown(countdown, interval, stepFun, stepOverFun, key)

	assert(type(countdown) == "number", "Invalid scheduler countdown: "..tostring(countdown))
	assert(type(interval) == "number", "Invalid scheduler interval: "..tostring(interval))

	assert(not stepFun or type(stepFun) == "function", "Invalid scheduler stepFun: "..tostring(stepFun))
	assert(not stepOverFun or type(stepOverFun) == "function", "Invalid scheduler stepOverFun: "..tostring(stepOverFun))

	assert(countdown >= 0 and interval >= 0 and countdown >= interval,
		string.format("Invalid countdown(%d), interval(%d)", countdown, interval))

	-- 如果倒计时的时长为0，则直接调用结束函数
	if countdown == 0 then
		if stepOverFun then
			stepOverFun(key)
			return
		end
	end

	-- 默认步长为倒计时的时长
	interval = interval ~= 0 and interval or countdown

	-- 总时长
	local remainDuration = countdown
	-- 计时器
	local time = 0

	local schedulerHandler = nil

	schedulerHandler = scheduler.scheduleGlobal(function(dt)

		-- 累计时长
		time = time + dt
		-- 扣除时间
		remainDuration = remainDuration - dt

		-- 看看时间累计是否超过步长，如果超过则传递当前周期所花时间（time），然后是剩余时间（remainDuration）
		if time > interval and stepFun then
			-- 通知递进函数
			stepFun(time, remainDuration, key)
			-- 要扣除一个步长长度。这里不考虑一次性累计多个步长的可能
			time = time - interval
		end

		if remainDuration <= 0 then
			if stepOverFun then
				stepOverFun(key)
			end
			if schedulerHandler then
				SchedulerHelper.cancelCountdown(schedulerHandler)
			end
		end

	end, 0)

	return schedulerHandler

end

--[====================[

	取消一个倒计时
	
	@param handler 倒计时的句柄

]====================]

function SchedulerHelper.cancelCountdown(handler)

	assert(handler, "Invalid countdown scheduler handler: "..tostring(handler))

	scheduler.unscheduleGlobal(handler)

end

--[====================[

	新建一个计划任务
	
	@param callback 计时回调
	@param interval 时间间隔

	@return 返回计划任务句柄

]====================]

function SchedulerHelper.newSchedule(callback, interval)

	assert(callback, "The callback could not be nil !")
	assert(interval and interval >= 0, "The interval could not nil or negative !")

	-- 内部计时器，计算累计时间用
	local time = 0

	return scheduler.scheduleGlobal(function(dt)

		time = time + dt

		if time >= interval then
			-- 时间到了，通知一声
			callback(interval, dt)
			-- 要扣除一个步长长度。这里不考虑一次性累计多个步长的可能
			time = time - interval
		end

	end, 0)

end

--[====================[

	取消计划任务
	
	@param handler 计划任务的句柄

]====================]

function SchedulerHelper.cancelSchedule(handler)

	if handler then
		scheduler.unscheduleGlobal(handler)
	end
end

--[====================[

	新建一个计划任务，只执行一次，执行完毕后会自动清理。
	可以代替node:performWithDelay，这个是要求node被加入到渲染树当中的
	
	@param callback 计时回调
	@param interval 时间间隔

	@return 返回计划任务句柄

]====================]

function SchedulerHelper.newScheduleOnce(callback, interval)

	local schdulerHandler = nil

	schdulerHandler = SchedulerHelper.newSchedule(function()
		
		if callback then
			callback()
		end

		SchedulerHelper.cancelSchedule(schdulerHandler)

	end, interval)
	
	return schdulerHandler
end

return SchedulerHelper

