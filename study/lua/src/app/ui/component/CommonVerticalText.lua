
local CommonVerticalText = class("CommonVerticalText")

local EXPORTED_METHODS = {
    "setString",
    "setTextPosition",
}

function CommonVerticalText:ctor()
	self._target = nil
end

function CommonVerticalText:_init()
	self._image = ccui.Helper:seekNodeByName(self._target, "Image")
	self._text = ccui.Helper:seekNodeByName(self._target, "Text")
end

function CommonVerticalText:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonVerticalText:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonVerticalText:setString(txt)
    self._text:setString(txt)
    self._target:setVisible(txt ~= "")
end

function CommonVerticalText:setTextPosition(pos)
    self._text:setPosition(pos)
end

return CommonVerticalText