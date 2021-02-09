--
-- Author: Liangxu
-- Date: 2019-7-29
-- Buff
local CommonBuff = class("CommonBuff")

local EXPORTED_METHODS = {
    "updateUI",
}

function CommonBuff:ctor()
	self._target = nil
end

function CommonBuff:_init()
	-- self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	-- self._textValue = ccui.Helper:seekNodeByName(self._target, "TextValue")
end

function CommonBuff:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonBuff:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonBuff:updateUI()
    
end

return CommonBuff