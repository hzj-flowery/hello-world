local CommonSweepNode = class("CommonSweepNode")

local EXPORTED_METHODS = {
    "setTitle",
    "getSize",
}

function CommonSweepNode:ctor()
	self._target = nil
end

function CommonSweepNode:_init()
    self._textTitle = ccui.Helper:seekNodeByName(self._target, "TextTitle")
    self._nodeBG = ccui.Helper:seekNodeByName(self._target, "NodeBG")
end

function CommonSweepNode:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonSweepNode:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonSweepNode:setTitle(s)
    self._textTitle:setString(s)
end

function CommonSweepNode:getSize()
    return self._nodeBG:getContentSize()
end

return CommonSweepNode