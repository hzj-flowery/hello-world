local CommonDetailWindow = class("CommonDetailWindow")


local EXPORTED_METHODS = {
    "addClickEventListenerEx",
	"hideCloseBtn",
	"getListView"
}

function CommonDetailWindow:ctor()
	self._target = nil
	self._btnClose = nil
end

function CommonDetailWindow:_init()
	
	self._btnClose = ccui.Helper:seekNodeByName(self._target, "Button_close")
	self._listView = ccui.Helper:seekNodeByName(self._target, "ListView")


end

function CommonDetailWindow:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonDetailWindow:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonDetailWindow:addClickEventListenerEx(callback)
	self._btnClose:addClickEventListenerEx(callback, true, nil, 0)
end


function CommonDetailWindow:hideCloseBtn()
	self._btnClose:setVisible(false)
end

function CommonDetailWindow:getListView()
	return self._listView
end

return CommonDetailWindow