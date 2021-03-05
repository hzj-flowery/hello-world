local PopupInput = require("app.ui.PopupInput")
local PopupInputSecretKey = class("PopupInputSecretKey", PopupInput)


function PopupInputSecretKey:ctor(successCallBack,cancelCallback)
    self._successCallBack = successCallBack
	local resource = {
		file = Path.getCSB("PopupInputSecretKey", "common"),
	}
	PopupInputSecretKey.super.ctor(self, handler(self, self._onVerfySecretKey),cancelCallback,
        Lang.get("login_input_secret_key_title"),Lang.get("login_input_secret_key_content"),
        Lang.get("login_input_secret_key_null_tip"),Lang.get("login_input_secret_key_placeholder"),8)
end

function PopupInputSecretKey:onInitCsb()
	local resource = {
		file = Path.getCSB("PopupInputSecretKey", "common"),
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


function PopupInputSecretKey:_onVerfySecretKey(txt)
    local ServerConst = require("app.const.ServerConst")
    if ServerConst.hasMatchedSecretKey(txt) then
        if self._successCallBack then
            self._successCallBack()
        end
        return false
    end
     G_Prompt:showTip( Lang.get("login_input_secret_key_wrong_tip"))
    return true
end

return PopupInputSecretKey
