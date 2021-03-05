local CommonButton = import(".CommonButton")
local CommonBigButton = class("CommonBigButton", CommonButton)

function CommonBigButton:ctor()
	CommonBigButton.super.ctor(self)
end

function CommonBigButton:setEnabled(e)
	self._button:setEnabled(e)
	self._desc:setColor(e and Colors.COLOR_BUTTON_BIG or Colors.COLOR_BUTTON_BIG_GRAY)
	self._desc:enableOutline(e and Colors.COLOR_BUTTON_BIG_OUTLINE or Colors.COLOR_BUTTON_BIG_GRAY_OUTLINE, 2)
end

return CommonBigButton