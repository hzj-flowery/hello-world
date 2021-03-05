local CommonTowerChoose = class("CommonTowerChoose")


local EXPORTED_METHODS = {
    "addCloseEventListener",
    "setTitle"
}

function CommonTowerChoose:ctor()
	self._target = nil
	self._textTitle = nil
	self._btnClose = nil
end

function CommonTowerChoose:_init()
	self._textTitle = ccui.Helper:seekNodeByName(self._target, "Text_title")
	self._btnClose = ccui.Helper:seekNodeByName(self._target, "Button_close")
end

function CommonTowerChoose:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonTowerChoose:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonTowerChoose:update(param)
	
end

--
function CommonTowerChoose:addCloseEventListener(callback)
	self._btnClose:addClickEventListenerEx(callback, true, nil, 0)
end

--
function CommonTowerChoose:setTitle(s)
	self._textTitle:setString(s)
end


return CommonTowerChoose