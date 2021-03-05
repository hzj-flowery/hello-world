local PopupBase = require("app.ui.PopupBase")
local PopupAlert = class("PopupAlert", PopupBase)
local Path = require("app.utils.Path")

function PopupAlert:ctor(title, content, callbackOK, callbackCancel,callbackExit)
	--
	self._title = title
	self._content = content
	self._callbackOK = callbackOK
	self._callbackCancel = callbackCancel
	self._callbackExit = callbackExit
	--
	local resource = {
		file = Path.getCSB("PopupAlert", "common"),
		binding = {
		}
	}
	PopupAlert.super.ctor(self, resource)
end

--
function PopupAlert:onCreate()
	-- title
	self._popupBG:setTitle(self._title or Lang.get("common_title_notice"))
	self._popupBG:hideCloseBtn()
	self._popupBG:addCloseEventListener(handler(self,self.onButtonCancel))
	self._btnOK:addClickEventListenerExDelay(handler(self,self.onButtonOK), 100)
	self._btnCancel:addClickEventListenerExDelay(handler(self,self.onButtonCancel), 100)
	-- button
	self._btnOK:setString(Lang.get("common_btn_sure"))
	self._btnCancel:setString(Lang.get("common_btn_cancel"))
	self._listView:setVisible(false)

	local start, stop = string.find(self._content, "%[.*%]")
	logWarn("PopupAlert ______________"..tostring(start).."   "..tostring(stop).."  "..string.len(self._content))
	if  not start or start ~= 1 or stop ~= string.len(self._content) then


		local size = self._descBG:getContentSize()
		logWarn(self._content)
		self._textDesc = cc.Label:createWithTTF(self._content, Path.getCommonFont(), 22)
		self._textDesc:setColor(Colors.SEASON_SILKUNLOCKCONTENT_TEXT)
		self._textDesc:setMaxLineWidth(size.width)
		self._textDesc:setLineBreakWithoutSpace(true)
		self._textDesc:setPosition(size.width*0.5, size.height*0.5)
		self._descBG:addChild(self._textDesc)
		self._textDesc:setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER )
		self._textDesc:setLineSpacing(10)
	else
		local size = self._descBG:getContentSize()
		local sizeTemp = cc.size(size.width,0)
		self._textDesc = ccui.RichText:createWithContent(self._content)
		self._textDesc:setAnchorPoint(cc.p(0.5, 0.5))
		self._textDesc:setContentSize(sizeTemp)
		self._textDesc:ignoreContentAdaptWithSize(false)
		self._textDesc:setVerticalSpace(10)--
		self._textDesc:setPosition(size.width*0.5, size.height*0.5)
		self._descBG:addChild(self._textDesc)


	end


end

function PopupAlert:setCloseCallBack(callback)
	self._closeCallBack = callback
end

function PopupAlert:setOKBtn(str)
	self._btnOK:setString(str)
end

function PopupAlert:setBtnStr(str,str2)
	self._btnOK:setString(str)
	self._btnCancel:setString(str2)
end

--
function PopupAlert:onEnter()

end

function PopupAlert:onExit()

end

function PopupAlert:onlyShowOkButton()
	local posX = self._popupBG:getPositionX()
	self._btnCancel:setVisible(false)
	self._btnOK:setPositionX(posX)
end

--
function PopupAlert:onButtonOK()
	local isBreak = nil
	if self._closeCallBack then
		self._closeCallBack()
	end
	if self._callbackOK then
		isBreak = self._callbackOK()
	end
	if not isBreak then
		self:close()
	end
end

function PopupAlert:setCloseVisible(needShow )
	self._popupBG:setCloseVisible(needShow)
end

function PopupAlert:onButtonCancel()
	if self._closeCallBack then
		self._closeCallBack()
	end
	if self._callbackCancel then
		self._callbackCancel()
	end
	self:close()
end

function PopupAlert:onClose()

	if self._closeCallBack then
		self._closeCallBack()
	end
    if self._callbackExit then
		self._callbackExit()
	end

end
function PopupAlert:addRichTextList(paramList)
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


function PopupAlert:addRichTextType2(content, defaultColor, fontSize, YGap, alignment)
	local UIHelper = require("yoka.utils.UIHelper")
	local richText = UIHelper.createMultiAutoCenterRichText(content, defaultColor, fontSize, YGap, alignment)
	local size = self._descBG:getContentSize()
	richText:setAnchorPoint(cc.p(0.5, 0.5))
	richText:setPosition(size.width*0.5, size.height*0.5)
	self._descBG:addChild(richText)
end


return PopupAlert
