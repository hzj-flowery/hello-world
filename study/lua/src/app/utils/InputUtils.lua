
local InputUtils = {}

local UTF8 = require("app.utils.UTF8")

function InputUtils.createInputView(param) 
    if not param or not param.bgPanel then
        return
	end

    param.fontSize = param.fontSize or 22
    param.fontColor  = param.fontColor or Colors.BRIGHT_BG_ONE
    param.placeholder = param.placeholder or ""
    param.placeholderFontColor  = param.placeholderFontColor or Colors.INPUT_PLACEHOLDER
    param.placeholderFontSize  = param.placeholderFontSize or param.fontSize
    param.inputMode = param.inputMode or cc.EDITBOX_INPUT_MODE_SINGLELINE
	param.inputFlag = param.inputFlag or cc.EDITBOX_INPUT_FLAG_SENSITIVE
    param.returnType = param.returnType or cc.KEYBOARD_RETURNTYPE_DONE
	param.maxLength = param.maxLength or 7
	param.maxLenTip = param.maxLenTip

    local contentSize = param.bgPanel:getContentSize()

    local editBox = ccui.EditBox:create(contentSize, Path.getUICommon("input_bg"))
	editBox:setCascadeOpacityEnabled(true)
    editBox:setFontName(Path.getCommonFont())
    editBox:setFontSize(param.fontSize)
    editBox:setPlaceHolder(param.placeholder)
    editBox:setPlaceholderFontColor(param.placeholderFontColor)
    editBox:setPlaceholderFontSize(param.placeholderFontSize)
    editBox:setFontColor(param.fontColor)
    editBox:setInputMode(param.inputMode)
	editBox:setInputFlag(param.inputFlag)

    editBox:setReturnType(param.returnType)
	editBox:setMaxLength(999)--param.maxLength
    editBox:setAnchorPoint(0, 0.5)
    editBox:setPositionY(contentSize.height * 0.5)

    param.bgPanel:addChild(editBox, 0)

	local onInputEvent = function(event, edit)
		logWarn("【editbox  "..event.." 】"..edit:getText())
		if event == "began" then
			if param.textLabel then
				edit:setText(param.textLabel:getString())
				param.textLabel:setVisible(false)
			end
			if param.textEmpty then
				 param.textEmpty:setVisible(false)
			end
		elseif event == "ended" then


			local text = edit:getText()
			if UTF8.utf8len (text)  > param.maxLength  then
				if param.maxLenTip then
					G_Prompt:showTip(param.maxLenTip)
					edit:setText("")
				else
					text = UTF8.utf8sub (text, 1, param.maxLength)
					edit:setText(text)
				end
			end


			if param.textLabel then
				param.textLabel:setVisible(true)
				param.textLabel:setString(edit:getText())
			end

			if param.textEmpty and edit:getText() == "" then
				 param.textEmpty:setVisible(true)
			end

		elseif event == "return" then
			--if param.textLabel then
				--param.textLabel:setVisible(true)
			--end
		elseif event == "changed" then

			--if param.textLabel then
				--param.textLabel:setString(edit:getText())
			--end

		end
		if param.inputEvent then
			param.inputEvent(event, edit)
		end
	end
	--if param.textLabel or param.inputEvent then
		editBox:registerScriptEditBoxHandler(onInputEvent)
	--end
	if param.textLabel then
		editBox:setOpacity(0)
	end
    return editBox
end

return InputUtils
