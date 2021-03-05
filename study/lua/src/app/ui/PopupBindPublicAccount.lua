local PopupBase = require("app.ui.PopupBase")
local PopupBindPublicAccount = class("PopupBindPublicAccount", PopupBase)

function PopupBindPublicAccount:ctor()
	local resource = {
		file = Path.getCSB("PopupBindPublicAccount", "common"),
		binding = {
			_buttonCopy = {
				events = {{event = "touch", method = "_onClickCopyButton"}}
			}
		}
	}
	PopupBindPublicAccount.super.ctor(self, resource)
end

function PopupBindPublicAccount:onCreate()
	self._popupBg:setTitle(Lang.get("public_account_bind_title"))
	self._popupBg:addCloseEventListener(handler(self, self._onClickClose))
	self._buttonCopy:setString(Lang.get("copy_bind_code_btn"))
end

function PopupBindPublicAccount:onEnter()
	self._signalGetWeChatBindCode = G_SignalManager:add(SignalConst.EVENT_GET_WECHAT_BIND_CODE, handler(self, self._getWeChatBindCode))
	G_UserData:getBase():c2sGetWeChatBindCode()
end

function PopupBindPublicAccount:onExit()
	self._signalGetWeChatBindCode:remove()
	self._signalGetWeChatBindCode = nil
end

function PopupBindPublicAccount:_getWeChatBindCode()
	self:_updateNumber()
end

function PopupBindPublicAccount:_updateNumber()
	local code = G_UserData:getBase():getBindCode()
	self._textNumber:setString(code)
end

function PopupBindPublicAccount:_onClickCopyButton()
	local code = self._textNumber:getString()
	G_NativeAgent:clipboard(code)
	G_Prompt:showTip(Lang.get("copy_bind_code_success_tip"))
end

function PopupBindPublicAccount:_onClickClose()
	self:close()
end

return PopupBindPublicAccount