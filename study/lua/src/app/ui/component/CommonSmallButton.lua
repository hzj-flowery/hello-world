--
-- Author: Liangxu
-- Date: 2017-02-20 20:33:25
--
local CommonButton = import(".CommonButton")
local CommonSmallButton = class("CommonSmallButton", CommonButton)

function CommonSmallButton:ctor()
	CommonSmallButton.super.ctor(self)
end

function CommonSmallButton:setEnabled(e)
	self._button:setEnabled(e)
	self._desc:setColor(e and Colors.COLOR_BUTTON_LITTLE or Colors.COLOR_BUTTON_LITTLE_GRAY)
	self._desc:enableOutline(e and Colors.COLOR_BUTTON_LITTLE_OUTLINE or Colors.COLOR_BUTTON_LITTLE_GRAY_OUTLINE, 2)
end

return CommonSmallButton