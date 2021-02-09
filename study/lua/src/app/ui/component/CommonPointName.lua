-- @Author  panhoa
-- @Date  3.20.2019
-- @Role 
local CommonPointName = class("CommonPointName")

local EXPORTED_METHODS = {
    "updateUI",
}

function CommonPointName:ctor()
	self._target = nil
end

function CommonPointName:_init()
	self._imageBg   = ccui.Helper:seekNodeByName(self._target, "Image_BackGround")
	self._textName  = ccui.Helper:seekNodeByName(self._target, "Text_Name")
end

function CommonPointName:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPointName:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonPointName:updateUI(name)
    self._textName:setString(name)
end


return CommonPointName