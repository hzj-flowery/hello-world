local CommonPopupNotice = class("CommonPopupNotice")


local EXPORTED_METHODS = {
    "addCloseEventListener",
    "setTitle"
}

function CommonPopupNotice:ctor()
	self._target = nil
	self._textTitle = nil
	self._btnClose = nil
end

function CommonPopupNotice:_init()
	self._textTitle = ccui.Helper:seekNodeByName(self._target, "Text_title")
	self._btnClose = ccui.Helper:seekNodeByName(self._target, "Button_close")
end

function CommonPopupNotice:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPopupNotice:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonPopupNotice:update(param)
	
end

--
function CommonPopupNotice:addCloseEventListener(callback)
	self._btnClose:addClickEventListenerEx(callback, true, nil, 0)
end

--
function CommonPopupNotice:setTitle(s)
	self._textTitle:setString(s)
end


return CommonPopupNotice