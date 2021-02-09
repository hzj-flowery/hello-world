local NotifycationManager = class("NotifycationManager")
local notification = require("app.config.notification")
--
function NotifycationManager:ctor()
	self._list = {}
end

--
function NotifycationManager:_init()
	self._list = {}

	local currTime = os.time()
	local openDay = G_UserData:getBase():getOpenServerDayNum()	--开服天数
	local seconds = G_ServerTime:secondsFromToday(currTime)	--今天已经经过的时间
	local level = G_UserData:getBase():getLevel()
	local todayZero = currTime - seconds		--今天的零点
	local checkDay = 6
	local len = notification.length()
	for i = 1, len do 
		local info = notification.indexOf(i)
		if level >= info.lv_min and level <= info.lv_max then 
			if openDay + checkDay >= info.day_min and openDay <= info.day_max then 
				local infoDays = self:_convertDayStr(info.week, todayZero, checkDay)
				for _, v in pairs(infoDays) do 
					local start_time = v + self:_convertTimeStrToSecond(info.start_time)
					if start_time > currTime then 
						local delta = start_time
						self._list[#self._list+1] = 
						{
							seconds = start_time,
							title = info.time_txt,
							msg = info.chat_before
						}
					end
				end
			end 
		end
	end
end

--
function NotifycationManager:registerNotifycation()
	--
	self:cancelAllNotifycation()
	if G_ConfigManager:isNotification() then
	    --
		self:_init()
		for i,info in ipairs(self._list) do
			G_NativeAgent:registerLocalNotification(info.seconds - os.time(), info.title, info.msg)
		end
	end
end

--
function NotifycationManager:cancelAllNotifycation()
	G_NativeAgent:cancelAllLocalNotifications()
end

function NotifycationManager:_convertDayStr(dayStr, todayZero, checkDay)
	local days = {}
	local strDay = string.split(dayStr, "|")
	for k, v in pairs(strDay) do 
		table.insert(days, tonumber(v))
	end
	local notifyDay = {}		--需要通知的日期的零点
	for i = 0, checkDay do 
		local time = todayZero + i*86400
		local timeData = os.date("*t", time)
		local weedDay = timeData.wday-1
		if weedDay == 0 then 
			weedDay = 7				--处理周末的情况
		end
		for _, v in pairs(days) do 
			if v == weedDay then 
				table.insert(notifyDay, time)
			end
		end
	end
	return notifyDay
end

--
function NotifycationManager:_convertTimeStrToSecond(timeStr)
	local second = 0
	local secondRates = {3600,60,1}
	local strArr = string.split(timeStr,"|")--self:_split(timeStr,"|")
	for k,v in ipairs(strArr) do
		local number = tonumber(v)
		if number and secondRates[k] then
			second = second + secondRates[k]*number
		end
	end
	return second
end

return NotifycationManager