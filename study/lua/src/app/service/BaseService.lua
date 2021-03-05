local BaseService = class("BaseService")

function BaseService:ctor()
    self._start = nil
    self._isInModule = false
    self:stop()
end

function BaseService:start()
    self._start = true
end

function BaseService:stop()
    self._start = false
end

function BaseService:isStart()
    return self._start
end

function BaseService:tick()
end

function BaseService:enterModule()
    self._isInModule = true
end

function BaseService:exitModule()
    self._isInModule = false
end

function BaseService:isInModule()
    return self._isInModule
end
--添加一个清理 清理一些残留数据
function BaseService:clear()

end
--service manage clear 之后 调用start  用于重置一些数据数据
function BaseService:initData()

end

return BaseService
