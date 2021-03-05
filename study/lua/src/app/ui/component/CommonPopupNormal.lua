local CommonPopupNormal = class("CommonPopupNormal")


local EXPORTED_METHODS = {
    "addCloseEventListener",
    "setTitle",
}

function CommonPopupNormal:ctor()
	self._target = nil
	self._textTitle = nil
	self._btnClose = nil
end

function CommonPopupNormal:_init()
	self._textTitle = ccui.Helper:seekNodeByName(self._target, "Text_title")
	self._btnClose = ccui.Helper:seekNodeByName(self._target, "Button_close")
end

function CommonPopupNormal:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPopupNormal:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonPopupNormal:update(param)
	
end

--
function CommonPopupNormal:addCloseEventListener(callback)
	self._btnClose:addClickEventListenerEx(callback, true, nil, 0)
end

--
function CommonPopupNormal:setTitle(s)
	self._textTitle:setString(s)
end

return CommonPopupNormal