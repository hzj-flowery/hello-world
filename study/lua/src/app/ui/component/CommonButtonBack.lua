local CommonButtonBack = class("CommonButtonBack")

local EXPORTED_METHODS = {
    "addClickEventListenerEx",
}

--
function CommonButtonBack:ctor()
	self._target = nil
	self._button = nil
end

--
function CommonButtonBack:_init()
	self._button = ccui.Helper:seekNodeByName(self._target, "Button")
end

--
function CommonButtonBack:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

--
function CommonButtonBack:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonButtonBack:addClickEventListenerEx(callback)
	self._button:addClickEventListenerEx(callback, true, nil, 0)
end


return CommonButtonBack