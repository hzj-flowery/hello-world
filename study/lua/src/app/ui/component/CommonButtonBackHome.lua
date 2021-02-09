local CommonButtonBackHome = class("CommonButtonBackHome")

local EXPORTED_METHODS = {
    "addClickEventListenerEx",
}

--
function CommonButtonBackHome:ctor()
	self._target = nil
	self._button = nil
end

--
function CommonButtonBackHome:_init()
	self._button = ccui.Helper:seekNodeByName(self._target, "Button")
end

--
function CommonButtonBackHome:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

--
function CommonButtonBackHome:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonButtonBackHome:addClickEventListenerEx(callback)
	self._button:addClickEventListenerEx(callback, true, nil, 0)
end


return CommonButtonBackHome