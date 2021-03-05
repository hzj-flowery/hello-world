--聊天设置页面
local PopupBase = require("app.ui.PopupBase")
local PopupChatSetting = class("PopupChatSetting", PopupBase)
local Path = require("app.utils.Path")
local UIHelper  = require("yoka.utils.UIHelper")
local CSHelper  = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst	 = require("app.const.DataConst")
local ChatConst  = require("app.const.ChatConst")

PopupChatSetting.CHECK_BOX_NUM = 7--复选框数量

function PopupChatSetting:ctor( title, callback)
	self._title = title or Lang.get("chat_popup_title_chat_setting") 
	self._callback = callback
	self._commonButtonSmallNormal = nil --
    self._commonResourceInfo = nil

	local resource = {
		file = Path.getCSB("PopupChatSetting", "chat"),
		binding = {
		}
	}
	PopupChatSetting.super.ctor(self, resource, true)
end

--
function PopupChatSetting:onCreate()
	self:setName("PopupChatSetting")
	self._commonNodeBk:setTitle(self._title)
	self._commonButtonSmallNormal:setString(Lang.get("common_btn_name_confirm"))
    self._commonButtonSmallNormal:addClickEventListenerEx(handler(self, self.onBtnOk))
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))

	self:_initCheckbox()
	self:_refreshCheckbox()
end

function PopupChatSetting:_initCheckbox()
	for i = 1,PopupChatSetting.CHECK_BOX_NUM,1 do
		local checkBox = self["_checkBox"..i]
		checkBox:setTag(i)
		checkBox:addEventListener(handler(self,self._onClickCheckBox))
	end
end

function PopupChatSetting:_refreshCheckbox()
	for i = 1,PopupChatSetting.CHECK_BOX_NUM,1 do
		local checkBox = self["_checkBox"..i]
		local checkValue = G_UserData:getChat():getChatSetting():getCheckBoxValue(i)
		if checkValue == 1 then
			checkBox:setSelected(true)
		else
			checkBox:setSelected(false)
		end
	end
end

function PopupChatSetting:_onClickCheckBox(sender)

	local checkboxData = {}
	for i = 1,PopupChatSetting.CHECK_BOX_NUM,1 do
		local checkBox = self["_checkBox"..i]
		table.insert(checkboxData, checkBox:isSelected() and 1 or 0 )
	end
	G_UserData:getChat():getChatSetting():saveSettingValue("checkbox",checkboxData)

	local checkValue01 = G_UserData:getChat():getChatSetting():getCheckBoxValue(ChatConst.SETTING_KEY_AUTO_VOICE_WORLD)
	local checkValue02 = G_UserData:getChat():getChatSetting():getCheckBoxValue(ChatConst.SETTING_KEY_AUTO_VOICE_GANG)
	if  checkValue01 ~= 1 then
		G_UserData:getChat():clearWorldAutoPlayVoiceList()
	end

	if checkValue02 ~= 1 then
		G_UserData:getChat():clearGuildAutoPlayVoiceList()
	end

	
end



function PopupChatSetting:setBtnEnable(enable)
	self._commonButtonSmallNormal:setEnabled(enable)
end

function PopupChatSetting:setBtnText(text)
	self._commonButtonSmallNormal:setString(text)
end

function PopupChatSetting:updateUI()
end

function PopupChatSetting:_onInit()
end

function PopupChatSetting:onEnter()
end

function PopupChatSetting:onExit()
end

function PopupChatSetting:onBtnOk()
	local isBreak
	if self._callback then
		isBreak = self._callback()
	end
	if not isBreak then
		self:close()
	end
end

function PopupChatSetting:onBtnCancel()
	if not isBreak then
		self:close()
	end
end

return PopupChatSetting