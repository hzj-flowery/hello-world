local Timeout = class("Timeout")
local scheduler = require("cocos.framework.scheduler")

--
function Timeout:ctor(startCallback, timeoutCallback, timeout)
    self._startCallback = startCallback
    self._timeoutCallback = timeoutCallback
    self._timeout = timeout
    self._finish = false
end

-- 启动
function Timeout:start()
    self._timer = scheduler.scheduleGlobal(function() 
        self:timeout()
    end, self._timeout)
    
    self._startCallback()
end

-- 超时
function Timeout:timeout()
    self:stop()
    self._timeoutCallback(self._finish)
end

-- 完成
function Timeout:finish()
    self._finish = true
    self:_clearTimer()
end

-- 停止
function Timeout:stop()
    self:_clearTimer()
end

--
function Timeout:_clearTimer()
    if self._timer then
        scheduler.unscheduleGlobal(self._timer)
        self._timer = nil
    end
end

return Timeout