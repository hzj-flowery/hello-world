
local CommoRedPointNum = class("CommoRedPointNum")

local EXPORTED_METHODS = {
    "showNum",
}

function CommoRedPointNum:ctor()
	self._target = nil
	
end

function CommoRedPointNum:_init()
	self._imageRedPoint = ccui.Helper:seekNodeByName(self._target, "ImageRedPoint")
	self._textNum = ccui.Helper:seekNodeByName(self._target, "TextNum")
end

function CommoRedPointNum:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommoRedPointNum:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommoRedPointNum:showNum(num)
    self._textNum:setString(tostring(num))
end

return CommoRedPointNum