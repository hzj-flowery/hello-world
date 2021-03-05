local CommonPopupSmall = class("CommonPopupSmall")


local EXPORTED_METHODS = {
    "addCloseEventListener",
    "setTitle",
	"hideCloseBtn",
    "hideBtnBg",
    "showCloseBtn"
}

function CommonPopupSmall:ctor()
	self._target = nil
	self._textTitle = nil
	self._btnClose = nil
end

function CommonPopupSmall:_init()
	self._textTitle = ccui.Helper:seekNodeByName(self._target, "Text_title")
	self._btnClose = ccui.Helper:seekNodeByName(self._target, "Button_close")

end

function CommonPopupSmall:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPopupSmall:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonPopupSmall:update(param)

end

--
function CommonPopupSmall:addCloseEventListener(callback)
	self._btnClose:addClickEventListenerEx(callback, true, nil, 0)
end

--
function CommonPopupSmall:setTitle(s)
	self._textTitle:setString(s)
end

function CommonPopupSmall:hideCloseBtn()
	self._btnClose:setVisible(false)
end

function CommonPopupSmall:showCloseBtn()
	self._btnClose:setVisible(true)
end

function CommonPopupSmall:hideBtnBg()
    local imageBtnBg = ccui.Helper:seekNodeByName(self._target, "ImageBtnBg")
    if imageBtnBg then
        imageBtnBg:setVisible(false)
    end
end


return CommonPopupSmall
