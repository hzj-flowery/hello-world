local PopupBase = require("app.ui.PopupBase")
local PopupGiftCode = class("PopupGiftCode", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
function PopupGiftCode:ctor()
    self._btnOk = nil
	self._popBG = nil
    self._imageInput  = nil
    self._editBox = nil
	local resource = {
		file = Path.getCSB("PopupInput", "common"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "onButton"}}
			},
			_btnCancel = {
				events = {{event = "touch", method = "_onCancelButton"}}
			}

		}
	}
	PopupGiftCode.super.ctor(self, resource, false)
end

function PopupGiftCode:onCreate()
	self._btnOk:setString(Lang.get("common_btn_name_confirm"))
	self._btnCancel:setString(Lang.get("common_btn_name_cancel"))
	self._popBG:setTitle(Lang.get("gift_code_title"))
    self._popBG:addCloseEventListener(handler(self, self._onClickClose))

    local InputUtils = require("app.utils.InputUtils")
	self._editBox = InputUtils.createInputView(
		{
			bgPanel = self._imageInput,
			fontSize = 22,
            fontColor = Colors.BRIGHT_BG_ONE,
            placeholderFontColor = Colors.INPUT_PLACEHOLDER,
			maxLength = 18,
		}
	)
end

function PopupGiftCode:onEnter()
    self._signalGiftCodeReward = G_SignalManager:add(SignalConst.EVENT_GIFT_CODE_REWARD, handler(self,self._onEventGiftCodeReward))
end

function PopupGiftCode:onExit()
	self._signalGiftCodeReward:remove()
	self._signalGiftCodeReward = nil
end

function PopupGiftCode:_onEventGiftCodeReward(event,message)
    self:_onShowRewardItems(message)
    self:close()

end

function PopupGiftCode:onButton()
    local code = self._editBox:getText()
    code = string.trim(code)
    if code == "" then
         G_Prompt:showTip(Lang.get("gift_code_input_placeholder"))
         return
    end
    G_UserData:getBase():c2sGetGameGiftBag(code)

end

function PopupGiftCode:_onCancelButton()
	 self:close()
end

function PopupGiftCode:_onShowRewardItems(message)
    local awards = rawget(message, "awards")
	if awards then
		if not (#awards==1 and TypeConvertHelper.getTypeClass(awards[1].type) == nil)  then-- 只有一个通用框的时候 不弹
			local popupGetRewards = require("app.ui.PopupGetRewards").new()
			popupGetRewards:showRewards(awards)
		end
		G_Prompt:showTip(Lang.get("exchange_success"))
	end
end

function PopupGiftCode:_onClickClose()
	self:close()
end

return PopupGiftCode
