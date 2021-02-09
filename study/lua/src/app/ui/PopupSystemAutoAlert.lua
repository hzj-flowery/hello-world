local PopupBase = require("app.ui.PopupBase")
local PopupSystemAutoAlert = class("PopupSystemAutoAlert", PopupBase)
local Path = require("app.utils.Path")
local SchedulerHelper = require("app.utils.SchedulerHelper")

PopupSystemAutoAlert.OK  = 1 -- OK 按钮
PopupSystemAutoAlert.CANCEL  = 2 -- cancel 按钮
PopupSystemAutoAlert.GO  = 3 -- go 按钮

function PopupSystemAutoAlert:ctor(title, content, callbackOK, callbackCancel, isClickOtherClose,isNotCreateShade)
	self._title = title
	self._content = content
	self._descBG = nil
	self._callbackOK = callbackOK
	self._callbackCancel = callbackCancel
	self._callbackClose = nil
	self._listView = nil
	self._isCheck = nil

	local resource = {
		file = Path.getCSB("PopupSystemAlert", "common"),
		binding = {
			_btnGo = {
				events = {{event = "touch", method = "_onButtonGo"}}
			},
		}
	}
	PopupSystemAutoAlert.super.ctor(self, resource, isClickOtherClose, isNotCreateShade)
end

function PopupSystemAutoAlert:onCreate()
	self._countDownHandler = nil --倒计时计时器

	self._popBG:setTitle(self._title or Lang.get("common_title_notice"))
	self._popBG:hideCloseBtn()
	self._popBG:addCloseEventListener(handler(self, self._onButtonClose))

	self._btnOk:addClickEventListenerExDelay(handler(self, self._onButtonOK), 100)
	self._btnCancel:addClickEventListenerExDelay(handler(self, self._onButtonCancel), 100)

	self._listView:setVisible(false)
	self._btnOk:setString(Lang.get("common_btn_sure"))
	self._btnCancel:setString(Lang.get("common_btn_cancel"))
	self._btnOkName = Lang.get("common_btn_sure")
	self._btnCancelName = Lang.get("common_btn_cancel")

	self._checkBox:addEventListener(handler(self, self._onBtnCheckBox))
	self._checkBox:setSelected(false)
	
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

function PopupSystemAutoAlert:onEnter()
	
end

function PopupSystemAutoAlert:onExit()
	self:_stopCountDown()
end

-- 手动换行  ----
function PopupSystemAutoAlert:setContentWithRichTextType2(content, defaultColor, fontSize, YGap, alignment)
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
function PopupSystemAutoAlert:setContentWithRichTextType3(content, defaultColor, fontSize, YGap)
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


-- 设置自动模式  ----
function PopupSystemAutoAlert:setAutoContent(endTime, autoType)
	self._endTime = endTime
	self._autoType = autoType or PopupSystemAutoAlert.OK

	local autoBtn = self:getAutoBtn()
	if not autoBtn then 
		return 
	end
	self._autoBtnName = self:getAutoName()
	self:_startCountDown()
end

function PopupSystemAutoAlert:getAutoName()
	local btnName = ""
	if self._autoType == PopupSystemAutoAlert.OK then btnName = self._btnOkName end
	if self._autoType == PopupSystemAutoAlert.CANCEL then btnName = self._btnCancelName end
	if self._autoType == PopupSystemAutoAlert.GO then btnName = self._btnGoName end
	return btnName
end

function PopupSystemAutoAlert:getAutoBtn()
	local btn = nil
	if self._autoType == PopupSystemAutoAlert.OK then btn = self._btnOk end
	if self._autoType == PopupSystemAutoAlert.CANCEL then btn = self._btnCancel end
	if self._autoType == PopupSystemAutoAlert.GO then btn = self._btnGo end
	return btn
end

function PopupSystemAutoAlert:_startCountDown()
	self:_stopCountDown()
	self._countDownHandler = SchedulerHelper.newSchedule(handler(self, self._onCountDown), 1)
	self:_onCountDown()
end

function PopupSystemAutoAlert:_stopCountDown()
	if self._countDownHandler then
		SchedulerHelper.cancelSchedule(self._countDownHandler)
		self._countDownHandler = nil
	end
end

--更新
function PopupSystemAutoAlert:_onCountDown()
	local leftTime = G_ServerTime:getLeftSeconds(self._endTime)
	if leftTime < 0 then
		self:_stopCountDown()
		self:close()
	else
		local btn = self:getAutoBtn()
		btn:setString( self._autoBtnName .. "(" .. leftTime .."s)" )
	end
end

function PopupSystemAutoAlert:setBtnOk(okName)
	self._btnOk:setString(okName)
	self._btnOkName = okName
end

function PopupSystemAutoAlert:setBtnCancel(cancelName)
	self._btnCancel:setString(cancelName)
	self._btnCancelName = cancelName
end

function PopupSystemAutoAlert:showGoButton(goName)
	self._btnOk:setVisible(false)
	self._btnCancel:setVisible(false)
	self._btnGo:setVisible(true)
	if goName then
		self._btnGo:setString(goName)
	end
	self._btnGoName = goName
end
--
function PopupSystemAutoAlert:_onButtonClose()
	if self._callbackClose then
		self._callbackClose()
		self:close()
	else
		self:_onButtonCancel()	
	end
end

function PopupSystemAutoAlert:_onButtonOK()
	self:_updateCheckBox()
	if self._callbackOK then
		self._callbackOK()
	end

	self:close()
end

function PopupSystemAutoAlert:_onButtonCancel()
	if self._callbackCancel then
		self._callbackCancel()
	end
	self:close()
end

function PopupSystemAutoAlert:setCloseCallback( callbackClose )
	self._callbackClose = callbackClose
end

function PopupSystemAutoAlert:setCloseVisible(needShow)
	self._popBG:setCloseVisible(needShow)
end

function PopupSystemAutoAlert:_onBtnCheckBox(sender)
	local isCheck = sender:isSelected()
	self._isCheck = isCheck
end

function PopupSystemAutoAlert:_updateCheckBox()
	local isCheck = self._isCheck
	if isCheck == nil then
		return
	end
	local UserDataHelper = require("app.utils.UserDataHelper")
	if self._moduleName and self._moduleName ~= "" then
		UserDataHelper.setPopModuleShow(self._moduleName,isCheck)
	end
end

function PopupSystemAutoAlert:_onButtonGo(sender)
	if self._callbackOK then
		self._callbackOK()
	end
	self:close()
end

function PopupSystemAutoAlert:setCheckBoxVisible(visible)
	self._checkBox:setVisible(visible)
	self._itemNoShow:setVisible(visible)
end

function PopupSystemAutoAlert:setModuleName(moduleDataName)
	self._moduleName = moduleDataName
end

function PopupSystemAutoAlert:addRichTextList(paramList)
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

return PopupSystemAutoAlert
