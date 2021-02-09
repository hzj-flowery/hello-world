--结算组件基类
local ComponentBase = class("SummaryComponentBase", function()
	return cc.Node:create()
end)

function ComponentBase:ctor()
    self._isStart = false
    self._isFinish = false
end

function ComponentBase:start()
    self._isStart = true
    self._isFinish = false
end

function ComponentBase:onFinish()
    self._isFinish = true
end

function ComponentBase:isFinish()
    return self._isFinish
end

function ComponentBase:isStart()
    return self._isStart
end

function ComponentBase:checkEnd(event)
    if event == "finish" then
        self:onFinish()
    end
end

function ComponentBase:update(f)
end

return ComponentBase