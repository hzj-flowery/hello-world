local PopupBase = require("app.ui.PopupBase")
local PopupSystemAlert = class("PopupSystemAlert", PopupBase)
local Path = require("app.utils.Path")

function PopupSystemAlert:ctor(title, content, callbackOK, callbackCancel, isClickOtherClose,isNotCreateShade)
	--
	self._title = title
	self._content = content
	self._descBG = nil
	self._callbackOK = callbackOK
	self._callbackCancel = callbackCancel
	self._callbackClose = nil
	self._callbackCheckeBox = nil
	self._listView = nil
	self._isCheck = nil

	local resource = {
		file = Path.getCSB("PopupSystemAlert", "common"),
		binding = {
			_btnGo = {
				events = {{event = "touch", method = "onButtonGo"}}
			},
		}
	}
	PopupSystemAlert.super.ctor(self, resource,isClickOtherClose,isNotCreateShade)
end

--
function PopupSystemAlert:onCreate()
	-- title
	self._popBG:setTitle(self._title or Lang.get("common_title_notice"))
	self._popBG:hideCloseBtn()
	self._popBG:addCloseEventListener(handler(self,self.onButtonClose))

	self._btnOk:addClickEventListenerExDelay(handler(self,self.onButtonOK), 100)
	self._btnCancel:addClickEventListenerExDelay(handler(self,self.onButtonCancel), 100)

	self._listView:setVisible(false)
	-- button
	--self._btnOK:setState(CommonButton.STATE_ATTENTION)
	self._btnOk:setString(Lang.get("common_btn_sure"))
	--self._btnCancel:setState(CommonButton.STATE_NORMAL)
	self._btnCancel:setString(Lang.get("common_btn_cancel"))

	self._checkBox:addEventListener(handler(self, self.onBtnCheckBox))
	self._checkBox:setSelected(false)
	-- desc
	local size = self._descBG:getContentSize()
	local sizeTemp = cc.size(size.width,0)
	if self._content then
		self._textDesc = ccui.RichText:createWithContent(self._content)
		self._textDesc:setAnchorPoint(cc.p(0.5, 0.5))
		self._textDesc:setVerticalSpace(10)--
		self._textDesc:setContentSize(sizeTemp)
		self._textDesc:ignoreContentAdaptWithSize(false)
		self._textDesc:setPosition(size.width*0.5, size.height*0.5)
		self._descBG:addChild(self._textDesc)
	end
end
-- 手动换行  ----
function PopupSystemAlert:setContentWithRichTextType2(content, defaultColor, fontSize, YGap, alignment)
	if self._textDesc then
		self._textDesc:setVisible(false)
	end
	local UIHelper = require("yoka.utils.UIHelper")
	local richText = UIHelper.createMultiAutoCenterRichText(content, defaultColor, fontSize, YGap, alignment)
	local size = self._descBG:getContentSize()
	richText:setAnchorPoint(cc.p(0.5, 0.5))
	richText:setPosition(size.width*0.5, size.height*0.5)
	self._descBG:addChild(richText)
end

--自动换行
function PopupSystemAlert:setContentWithRichTextType3(content, defaultColor, fontSize, YGap)
	if self._textDesc then
		self._textDesc:setVisible(false)
	end
	local richtext = ccui.RichText:createRichTextByFormatString2(content, defaultColor, fontSize)
	richtext:ignoreContentAdaptWithSize(false)
	richtext:setVerticalSpace(YGap)
	richtext:setAnchorPoint(cc.p(0.5, 0.5))
	richtext:setContentSize(cc.size(450,0))--高度0则高度自适应
	richtext:formatText()
	local size = self._descBG:getContentSize()
	richtext:setPosition(size.width*0.5, size.height*0.5)
	self._descBG:addChild(richtext)
end
--
function PopupSystemAlert:onEnter()

end

function PopupSystemAlert:onExit()

end

function PopupSystemAlert:setBtnOk(okName)
	self._btnOk:setString(okName)
end

function PopupSystemAlert:setBtnCancel(cancelName)
	self._btnCancel:setString(cancelName)
end

function PopupSystemAlert:showGoButton(goName)
	self._btnOk:setVisible(false)
	self._btnCancel:setVisible(false)
	self._btnGo:setVisible(true)
	if goName then
		self._btnGo:setString(goName)
	end
end
--
function PopupSystemAlert:onButtonClose()
	if self._callbackClose then
		self._callbackClose()
		self:close()
	else
		self:onButtonCancel()	
	end
end

function PopupSystemAlert:onButtonOK()
	self:_updateCheckBox()
	if self._callbackOK then
		self._callbackOK()
	end

	self:close()
end

function PopupSystemAlert:onButtonCancel()
	if self._callbackCancel then
		self._callbackCancel()
	end
	self:close()
end

function PopupSystemAlert:setCloseCallback( callbackClose )
	self._callbackClose = callbackClose
end

function PopupSystemAlert:setCloseVisible(needShow)
	-- body

	self._popBG:setCloseVisible(needShow)



end

function PopupSystemAlert:setCheckBoxCallback(callback)
	self._callbackCheckeBox = callback
end

function PopupSystemAlert:onBtnCheckBox(sender)

	local isCheck = sender:isSelected()

	if self._callbackCheckeBox then
		self._callbackCheckeBox(isCheck)
	end

	self._isCheck = isCheck
end

function PopupSystemAlert:_updateCheckBox()
	local isCheck = self._isCheck
	if isCheck == nil then
		return
	end
	local UserDataHelper = require("app.utils.UserDataHelper")
	if self._moduleName and self._moduleName ~= "" then
		dump(self._moduleName)
		dump(isCheck)
		UserDataHelper.setPopModuleShow(self._moduleName,isCheck)
	end

end

function PopupSystemAlert:onButtonGo(sender)
	if self._callbackOK then
		self._callbackOK()
	end
	self:close()
end

function PopupSystemAlert:setCheckBoxVisible(visible)
	self._checkBox:setVisible(visible)
	self._itemNoShow:setVisible(visible)
end


function PopupSystemAlert:setModuleName(moduleDataName)
	self._moduleName = moduleDataName
end

function PopupSystemAlert:addRichTextList(paramList)
	for i, value in ipairs(paramList) do
	   local node = ccui.Widget:create()
	   node:setAnchorPoint(cc.p(0,0))
       local richText = ccui.RichText:createWithContent(value)
	   node:setContentSize(cc.size(0,30))
	   node:addChild(richText)
	   richText:setAnchorPoint(cc.p(0.5,0))
       self._listView:pushBackCustomItem(node)
    end
	self._listView:setVisible(true)

	self._listView:adaptWithContainerSize()
	local contentSize = self._descBG:getContentSize()
	self._listView:setPosition(cc.p(contentSize.width*0.5, contentSize.height*0.5))
end

return PopupSystemAlert
