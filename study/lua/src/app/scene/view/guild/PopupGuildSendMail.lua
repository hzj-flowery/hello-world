
local PopupGuildAnnouncement = require("app.scene.view.guild.PopupGuildAnnouncement")
local PopupGuildSendMail = class("PopupGuildSendMail", PopupGuildAnnouncement)
local TextHelper = require("app.utils.TextHelper")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local InputUtils = require("app.utils.InputUtils")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst =  require("app.const.DataConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextInputConst = require("app.const.TextInputConst")

local MAX_COUNT = 150 --字数上限

function PopupGuildSendMail:ctor(onClick)
	PopupGuildSendMail.super.ctor(self, onClick)
end

function PopupGuildSendMail:onInitCsb()
	local resource = {
		file = Path.getCSB("PopupGuildSendMail", "guild"),
		binding = {
            _buttonSave = {
				events = {{event = "touch", method = "_onButtonSave"}}
			},
		}
	}
	local CSHelper = require("yoka.utils.CSHelper")
    CSHelper.createResourceNode(self, resource)

end

function PopupGuildSendMail:onCreate()
    self:setOnClickListener(handler(self,self._onSendMail))
    self:setInputLength(MAX_COUNT)
    self:setPlaceHolderTxt(Lang.get("guild_mail_empty_hint"))
    self:setTextInputType(TextInputConst.INPUT_TYPE_GUILD_MAIL)



    self._panelBg:setTitle(Lang.get("guild_pop_mail_title"))
    self._panelBg:addCloseEventListener(handler(self, self._onClickClose))
    self._buttonSave:setString(Lang.get("mail_send_msg"))

 

    local cost = UserDataHelper.getParameter(G_ParameterIDConst.GUILD_MAIL_COST)
    self._resCost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND,cost)
    self:_createInput()

  
end

function PopupGuildSendMail:_onSendMail(content)
    local cost = UserDataHelper.getParameter(G_ParameterIDConst.GUILD_MAIL_COST)
    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, cost)
    if not success then
        return false
    end
    if content == "" then
         G_Prompt:showTip(Lang.get("guild_mail_empty_hint"))
        return false
    end
    G_UserData:getMails():c2sMail(0,nil,content)

    return true
end

return PopupGuildSendMail
