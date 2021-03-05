local PopupBase = require("app.ui.PopupBase")
local PopupInput = class("PopupInput", PopupBase)

function PopupInput:ctor(okCallback,cancelCallback,title,hint,tip,placeholderStr,maxLength, maxLenTip)
    self._okCallback = okCallback
    self._cancelCallback = cancelCallback
    self._title = title
    self._hint = hint
    self._tip = tip
    self._placeholderStr = placeholderStr
	self._maxLength = maxLength or 28

    self._btnOk = nil
	self._popBG = nil
    self._imageInput  = nil
    self._editBox = nil
    self._textHint = nil
	self._maxLenTip = maxLenTip
	PopupInput.super.ctor(self, nil, false)
end

function PopupInput:onInitCsb()
	local resource = {
		file = Path.getCSB("PopupInput", "common"),
		binding = {
            _btnCancel = {
                events = {{event = "touch", method = "_onClickCancelButton"}}
            },
			_btnOk = {
				events = {{event = "touch", method = "_onClickOkButton"}}
			}
		}
	}
   if resource then
         local CSHelper = require("yoka.utils.CSHelper")
        CSHelper.createResourceNode(self, resource)
    end
end


function PopupInput:onCreate()
    self._btnCancel:setString(Lang.get("common_btn_name_cancel"))
	self._btnOk:setString(Lang.get("common_btn_name_confirm"))
	self._popBG:setTitle(self._title or Lang.get("account_verify_code_title"))
    self._popBG:addCloseEventListener(handler(self, self._onClickCancelButton))

    self._textHint:setString(self._hint or Lang.get("account_verify_code_hint"))

    local InputUtils = require("app.utils.InputUtils")
	self._editBox = InputUtils.createInputView(
		{
			bgPanel = self._imageInput,
			fontSize = 22,
            fontColor = Colors.BRIGHT_BG_ONE,
            placeholderFontColor = Colors.INPUT_PLACEHOLDER,
			maxLength = self._maxLength,
            placeholder =  self._placeholderStr or Lang.get("account_verify_code_input_placeholder"),
			maxLenTip = self._maxLenTip
		}
	)
end

function PopupInput:onEnter()
    self._signalPopupClose = G_SignalManager:add(SignalConst.EVENTT_POPUP_CLOSE, handler(self, self._onEventPopupClose))
end

function PopupInput:onExit()
    self._signalPopupClose:remove()
    self._signalPopupClose = nil
end

function PopupInput:_onEventPopupClose(event)
    self:close()
end

function PopupInput:_onClickCancelButton()
    if self._cancelCallback then
         self._cancelCallback()
    end
    self:close()
end

function PopupInput:setBtnOkName(name)
	if self._btnOk and name then
    	self._btnOk:setString(name)
	end
end

function PopupInput:onlyShowOkButton()
	local posX = self._popBG:getPositionX()
    self._btnCancel:setVisible(false)
	self._btnOk:setPositionX(posX)
end

function PopupInput:_onClickOkButton()
    local code = self._editBox:getText()
    code = string.trim(code)
    if code == "" then
         G_Prompt:showTip(self._tip or Lang.get("account_verify_code_input_placeholder"))
         return
    end
    local isBreak = nil
    if self._okCallback then
         isBreak = self._okCallback(code)
    end

    if not isBreak then
        self:close()
    end
end

function PopupInput:_onClickClose()
	self:close()
end


return PopupInput
