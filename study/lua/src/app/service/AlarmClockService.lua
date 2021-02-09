--闹钟
local BaseService = require("app.service.BaseService")
local AlarmClockService = class("ActivityService",BaseService)



function AlarmClockService:ctor()
    AlarmClockService.super.ctor(self)
	self._clock = {}
    self._isTickStart = false
    self._oldTime = 0
    self:start()
end


function AlarmClockService:initData()
	-- 注册一个凌晨4点的闹钟 用于处理一些客户端数据清空的工作（严禁调用服务器api）
	local function registerCleanDataClock()
		local nextCleanDataClock = G_ServerTime:getNextCleanDataTime()
		self:registerAlarmClock("CLEAN_DATA_CLOCK", nextCleanDataClock, function()
			G_SignalManager:dispatch(SignalConst.EVENT_CLEAN_DATA_CLOCK)
			registerCleanDataClock()
		end)
	end
    -- 0点通知
    local function registerZeroClock()
		local nextZeroClock = G_ServerTime:getNextZeroTime()
		self:registerAlarmClock("ZERO_CLOCK", nextZeroClock, function()
			G_SignalManager:dispatch(SignalConst.EVENT_ZERO_CLOCK)
			registerZeroClock()
		end)
	end

	registerCleanDataClock()
    registerZeroClock()
end

function AlarmClockService:clear()
	self._clock = {}
    self._isTickStart = false
    self._oldTime = 0
end

function AlarmClockService:tick()
	local curTime = G_ServerTime:getTime()

    if not self._isTickStart then
        self._isTickStart = true
        self._oldTime = curTime
    end
    if curTime - self._oldTime > 15 then
        G_SignalManager:dispatch(SignalConst.EVENT_MAY_ENTER_FOREGROUND)
    end
    self._oldTime = curTime

	for k, v in pairs(self._clock) do
		if curTime >= v.time then
			self._clock[k] = nil
			v.callback()
		end
	end
end

function AlarmClockService:registerAlarmClock(tag, time, callback)
	if not tag or  not time or not callback then
		return
	end
	local temp = {}
	temp.time = time
	temp.callback = callback
	self._clock[tag] = temp
end

function AlarmClockService:deleteAlarmClock(tag)
	-- body
	self._clock[tag] = nil
end

return AlarmClockService
