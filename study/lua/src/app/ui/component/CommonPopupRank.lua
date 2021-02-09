local CommonPopupRank = class("CommonPopupRank")


local EXPORTED_METHODS = {
    "addCloseEventListener",
    "setTitle"
}

function CommonPopupRank:ctor()
	self._target = nil
	self._textTitle = nil
	self._btnClose = nil
end

function CommonPopupRank:_init()
	self._textTitle = ccui.Helper:seekNodeByName(self._target, "Text_title")
	self._btnClose = ccui.Helper:seekNodeByName(self._target, "Button_close")
end

function CommonPopupRank:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPopupRank:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonPopupRank:update(param)
	
end

--
function CommonPopupRank:addCloseEventListener(callback)
	self._btnClose:addClickEventListenerEx(callback, true, nil, 0)
end

--
function CommonPopupRank:setTitle(s)
	self._textTitle:setString(s)
end


return CommonPopupRank