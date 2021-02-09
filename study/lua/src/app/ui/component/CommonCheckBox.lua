local CommonCheckBox = class("CommonCheckBox")

local EXPORTED_METHODS = {
    "setString",
    "setSelected",
    "setTouchEnabled",
    "isSelected",
    "setChangeCallBack",
}
function CommonCheckBox:ctor()
	self._target = nil
    self._moduleName = nil
	self._textNoShow = nil
	self._checkBox = nil
end

function CommonCheckBox:_init()
	self._textNoShow = ccui.Helper:seekNodeByName(self._target, "TextNoShow")
	self._checkBox = ccui.Helper:seekNodeByName(self._target, "CheckBox")
    self._checkBox:addEventListener(handler(self, self._onBtnCheckBox))
end

function CommonCheckBox:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonCheckBox:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonCheckBox:_onBtnCheckBox(sender)
	local isCheck = sender:isSelected()
	dump(isCheck)
    if self._callback then
        self._callback(isCheck)
    end
    -- local UserDataHelper = require("app.utils.UserDataHelper")
	-- if self._moduleName and self._moduleName ~= "" then
	-- 	dump(self._moduleName)
	-- 	UserDataHelper.setPopModuleShow(self._moduleName,isCheck)
	-- end
end

function CommonCheckBox:setChangeCallBack(callback)
    self._callback = callback
end

function CommonCheckBox:setSelected(selected)
    self._checkBox:setSelected(selected)
end
function CommonCheckBox:setTouchEnabled(enable)
    self._checkBox:setTouchEnabled(enable)
end

function CommonCheckBox:isSelected()
    local isCheck = self._checkBox:isSelected()
    return isCheck
end
function CommonCheckBox:setString(str)
	self._textNoShow:setString(str)
end

return CommonCheckBox