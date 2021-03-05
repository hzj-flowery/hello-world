local CommonButton = import(".CommonButton")
local CommonButtonHighLight = class("CommonButtonHighLight", CommonButton)

function CommonButtonHighLight:ctor()
	CommonButtonHighLight.super.ctor(self)
end

function CommonButtonHighLight:setEnabled(e)
	self._button:setEnabled(e)
	self._desc:setColor(e and Colors.BUTTON_ONE_NOTE or Colors.BUTTON_ONE_DISABLE)
	--self._desc:enableOutline(e and Colors.BUTTON_ONE_NOTE_OUTLINE or Colors.BUTTON_ONE_DISABLE_OUTLINE, 2)
end

return CommonButtonHighLight