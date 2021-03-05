local UpdateUIHelper = {}

function UpdateUIHelper.updateButtonEnabled(button,text,e)
	button:setEnabled(e)
	text:setColor(e and Colors.COLOR_BUTTON_LITTLE or Colors.COLOR_BUTTON_LITTLE_GRAY)
	text:enableOutline(e and Colors.COLOR_BUTTON_LITTLE_OUTLINE or Colors.COLOR_BUTTON_LITTLE_GRAY_OUTLINE, 2)
end


return UpdateUIHelper