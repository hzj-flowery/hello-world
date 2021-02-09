local CommonCheckBoxAnymoreHint = class("CommonCheckBoxAnymoreHint")

local EXPORTED_METHODS = {
    "setModuleName",
}

function CommonCheckBoxAnymoreHint:ctor()
	self._target = nil
    self._moduleName = nil
	self._textNoShow = nil
	self._checkBox = nil
end

function CommonCheckBoxAnymoreHint:_init()
	self._textNoShow = ccui.Helper:seekNodeByName(self._target, "TextNoShow")
	self._checkBox = ccui.Helper:seekNodeByName(self._target, "CheckBox")
    self._checkBox:addEventListener(handler(self, self._onBtnCheckBox))
end

function CommonCheckBoxAnymoreHint:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonCheckBoxAnymoreHint:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonCheckBoxAnymoreHint:_onBtnCheckBox(sender)
	local isCheck = sender:isSelected()
	dump(isCheck)
	local UserDataHelper = require("app.utils.UserDataHelper")
	if self._moduleName and self._moduleName ~= "" then
		dump(self._moduleName)
		UserDataHelper.setPopModuleShow(self._moduleName,isCheck)
	end
end

function CommonCheckBoxAnymoreHint:setModuleName(moduleDataName)
	self._moduleName = moduleDataName
end

return CommonCheckBoxAnymoreHint