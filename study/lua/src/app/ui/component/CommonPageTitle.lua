local CommonPageTitle = class("CommonPageTitle")

local EXPORTED_METHODS = {
    "setTitle",
}

function CommonPageTitle:ctor()
	self._target = nil
	self._textTitle = nil
end

function CommonPageTitle:_init()
	self._textTitle = ccui.Helper:seekNodeByName(self._target, "TextTitle")
end

function CommonPageTitle:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPageTitle:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonPageTitle:setTitle(s)
	self._textTitle:setString(s)
end

return CommonPageTitle