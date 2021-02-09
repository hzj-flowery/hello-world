--
-- Author: Liangxu
-- Date: 2017-06-22 14:52:13
-- 军团宣言\公告修改弹框
local PopupBase = require("app.ui.PopupBase")
local PopupGuildAnnouncement = class("PopupGuildAnnouncement", PopupBase)
local TextHelper = require("app.utils.TextHelper")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local InputUtils = require("app.utils.InputUtils")

local MAX_COUNT = 50 --字数上限

function PopupGuildAnnouncement:ctor(onClick)
	self._maxInputLength = MAX_COUNT
	self._textInputType = nil
	self._placeholderTxt = Lang.get("guild_input_placeholder")
	self:setOnClickListener(onClick)
	PopupGuildAnnouncement.super.ctor(self, nil, false)
end

function PopupGuildAnnouncement:onInitCsb()
	local resource = {
		file = Path.getCSB("PopupGuildAnnouncement", "guild"),
		binding = {
			_buttonCancel = {
				events = {{event = "touch", method = "_onButtonCancel"}}
			},
			_buttonSave = {
				events = {{event = "touch", method = "_onButtonSave"}}
			},
		}
	}
	
   PopupGuildAnnouncement.super.onInitCsb(self,resource)
end

function PopupGuildAnnouncement:onCreate()
	self._panelBg:addCloseEventListener(handler(self, self._onClickClose))

	self._buttonCancel:setString(Lang.get("guild_btn_create_cancel"))
	self._buttonSave:setString(Lang.get("guild_btn_create_save"))

	self:_createInput()
end

function PopupGuildAnnouncement:setOnClickListener(onClick)
	self._onClick = onClick
end

function PopupGuildAnnouncement:setInputLength(length)
	self._maxInputLength = length
end

function PopupGuildAnnouncement:setPlaceHolderTxt(txt)
	self._placeholderTxt  = txt
end

function PopupGuildAnnouncement:setTextInputType(inputType)
	self._textInputType = inputType
end

function PopupGuildAnnouncement:_createInput()
	self._contentText = InputUtils.createInputView({
		bgPanel = self._textMessage,
		fontSize = 20,
		maxLength = self._maxInputLength,
		--inputMode = cc.EDITBOX_INPUT_MODE_ANY,
		inputEvent = handler(self, self._onInputContent),
	})
	self._contentText:setOpacity(0)

	
	local txt = G_UserData:getTextInput():getLastTextInputByType(self._textInputType)
	logWarn(" zzzzzzzzzzzzzzzz "..tostring(txt))
	if txt then
		logWarn(self._textInputType .." xxxxxxxxxxxxxxxx "..txt)
		self._contentText:setText(txt)
	end
	logWarn(" vvvvvvvvvvvvvvv ")
end

function PopupGuildAnnouncement:onEnter()
	self:_updateContent()
	self:_updateTip()
end

function PopupGuildAnnouncement:onExit()

end

function PopupGuildAnnouncement:setTitle(title)
	self._panelBg:setTitle(title)
end

function PopupGuildAnnouncement:setContent(content)
	self._contentText:setText(content)
end

function PopupGuildAnnouncement:_onButtonCancel()
	self:close()
end

function PopupGuildAnnouncement:_onButtonSave()
	local content = self._contentText:getText()
	local BlackList = require("app.utils.BlackList")
    content = BlackList.filterBlack(content) --过滤禁词
	--if TextHelper.isNameLegal(content, 0, self._maxInputLength) then
		if self._onClick then
			local isDeal = self._onClick(content)
			if isDeal == false then
				return
			end

			G_UserData:getTextInput():clearLastTextInputByType(self._textInputType)

			self:close()
		end
	--end
end

function PopupGuildAnnouncement:_onClickClose()
	local content = self._contentText:getText()

	G_UserData:getTextInput():setLastTextInputByType(self._textInputType,content)

	self:close()
end

function PopupGuildAnnouncement:_onInputContent(strEventName, pSender)
	local edit = pSender
	local strFmt
	if strEventName == "began" then

	elseif strEventName == "ended" then
		self:_updateContent()
		self:_updateTip()
	elseif strEventName == "return" then

	elseif strEventName == "changed" then
		self:_updateContent()
		self:_updateTip()
	end
end

function PopupGuildAnnouncement:_updateContent()
	local text = self._contentText:getText()
	if not text or text == "" then
		self._textMessage:setString(self._placeholderTxt)
		self._textMessage:setColor(Colors.INPUT_PLACEHOLDER)
	else
		self._textMessage:setString(text)
		self._textMessage:setColor(Colors.LIST_TEXT)
	end

end

function PopupGuildAnnouncement:_updateTip()
	local text = self._contentText:getText()
	text = string.trim(text)
	local len = string.utf8len(text)
	local lastCount = self._maxInputLength - len
	self._textTip:setString(Lang.get("guild_announcement_tip", {count = lastCount}))
end

return PopupGuildAnnouncement
