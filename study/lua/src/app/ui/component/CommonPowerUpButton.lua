local CommonPowerUpButton = class("CommonPowerUpButton")


local EXPORTED_METHODS = {
    "setTouchFunc",
    "setIcon",
    "setFuncName",
    "getTouchNode",
}

function CommonPowerUpButton:ctor()
    self._imageIcon = nil
    self._imageRing = nil
    self._imageTouch = nil
    self._stringTitle = nil
    self._touchFunc = nil
end

function CommonPowerUpButton:_init()
    self._imageIcon = ccui.Helper:seekNodeByName(self._target, "Image_Icon")
    self._imageRing = ccui.Helper:seekNodeByName(self._target, "Image_Ring")
    self._imageTouch = ccui.Helper:seekNodeByName(self._target, "Image_Touch")
    self._imageTouch:addClickEventListenerEx(handler(self, self._callback), true, nil, 0)
    self._stringTitle = ccui.Helper:seekNodeByName(self._target, "String_Title")
end

function CommonPowerUpButton:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPowerUpButton:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonPowerUpButton:setTouchFunc(func)
    self._touchFunc = func
end

function CommonPowerUpButton:setFuncName(str)
    self._stringTitle:setString(str)
end

function CommonPowerUpButton:setIcon(icon)
    self._imageIcon:loadTexture(icon)
    self._imageIcon:ignoreContentAdaptWithSize(true)
end

function CommonPowerUpButton:_callback(sender)
    if self._touchFunc then
        self._touchFunc(sender)
    end
end

function CommonPowerUpButton:getTouchNode()
    return self._imageTouch
end


return CommonPowerUpButton