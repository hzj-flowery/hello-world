local CommonPopupStageBG = class("CommonPopupStageBG")


local EXPORTED_METHODS = {
    "addCloseEventListener",
    "setTitle",
}

function CommonPopupStageBG:ctor()
	self._target = nil
	self._textTitle = nil
	self._btnClose = nil
end

function CommonPopupStageBG:_init()
	self._textTitle = ccui.Helper:seekNodeByName(self._target, "Text_title")
	self._btnClose = ccui.Helper:seekNodeByName(self._target, "Button_close")
end

function CommonPopupStageBG:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPopupStageBG:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonPopupStageBG:update(param)
	
end

--
function CommonPopupStageBG:addCloseEventListener(callback)
	self._btnClose:addClickEventListenerEx(callback, true, nil, 0)
end

--
function CommonPopupStageBG:setTitle(s)
	self._textTitle:setString(s)
end


return CommonPopupStageBG