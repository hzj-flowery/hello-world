local PopupInput = require("app.ui.PopupInput")
local PopupAccountActivation = class("PopupAccountActivation", PopupInput)

local URL = "http://qm.qq.com/cgi-bin/qm/qr?k=vOV-QgQ7AVocbswXnqOqK4WoceT7Z32u"

function PopupAccountActivation:ctor(okCallback,cancelCallback,title,hint,tip,placeholderStr,maxLength)
    self._btnAddQQ = nil
    self._nodeRich = nil
	local resource = {
		file = Path.getCSB("PopupAccountActivation", "common"),
	}
	PopupAccountActivation.super.ctor(self, okCallback,cancelCallback,title,hint,tip,placeholderStr,maxLength)
end

function PopupAccountActivation:onInitCsb()
	local resource = {
		file = Path.getCSB("PopupAccountActivation", "common"),
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

function PopupAccountActivation:onCreate()
    PopupAccountActivation.super.onCreate(self)
    self._btnAddQQ:setString("")
    self._btnAddQQ:addClickEventListenerEx(handler(self,self._onAddQQButtonClick))
    local richText = Lang.get("account_verify_code_add_qq_group",
			{
            color1 =  Colors.colorToNumber(Colors.SYSTEM_TARGET_RED),
            color2 =  Colors.colorToNumber(Colors.BRIGHT_BG_TWO)
            })
    self:_createProgressRichText(richText)

    self:setBtnOkName(Lang.get("account_verify_code_ok_btn"))
    self:onlyShowOkButton()
end


--创建富文本
function PopupAccountActivation:_createProgressRichText(richText)
	self._nodeRich:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(0.5,0.5))
    self._nodeRich:addChild(widget)
end

function PopupAccountActivation:_onAddQQButtonClick(render)
    G_NativeAgent:openURL(URL)
end


return PopupAccountActivation
