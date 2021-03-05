local CommonButton = import(".CommonButton")
local CommonButtonNormal = class("CommonButtonNormal", CommonButton)

function CommonButtonNormal:ctor()
	CommonButtonNormal.super.ctor(self)
end

function CommonButtonNormal:setEnabled(e)
	self._button:setEnabled(e)
	self._desc:setColor(e and Colors.BUTTON_ONE_NORMAL or Colors.BUTTON_ONE_DISABLE)
	--self._desc:enableOutline(e and Colors.BUTTON_ONE_NORMAL_OUTLINE or Colors.BUTTON_ONE_DISABLE_OUTLINE, 2)
end

return CommonButtonNormal