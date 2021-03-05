local PopupBase = require("app.ui.PopupBase")
local PopupSystemAlertNoTitle = class("PopupSystemAlertNoTitle", PopupBase)

function PopupSystemAlertNoTitle:ctor(content, callbackOK, callbackCancel)
	self._content = content
	self._callbackOK = callbackOK
	self._callbackCancel = callbackCancel

    self._text = nil
    self._richPanel = nil

	local resource = {
		file = Path.getCSB("PopupSystemAlertNoTitle", "common"),
		binding = {
		}
	}
	PopupSystemAlertNoTitle.super.ctor(self, resource,false)
end


function PopupSystemAlertNoTitle:onCreate()
    self._popBG:addBtnEventListener(handler(self,self.onButtonOK),handler(self,self.onButtonCancel))
    self._popBG:setBtnString(Lang.get("common_btn_sure"),Lang.get("common_btn_cancel"))

    self._text:setString(self._content)

    --[[
	local size = self._richPanel:getContentSize()
	local sizeTemp = cc.size(size.width,0)
	self._textDesc = ccui.RichText:createWithContent(self._content)
	self._textDesc:setAnchorPoint(cc.p(0.5, 0.5))
	self._textDesc:setContentSize(sizeTemp)
	self._textDesc:ignoreContentAdaptWithSize(false)

	self._textDesc:setPosition(size.width*0.5, size.height*0.5)
	self._richPanel:addChild(self._textDesc)
    ]]
end


function PopupSystemAlertNoTitle:onEnter()
    
end

function PopupSystemAlertNoTitle:onExit()
    
end

function PopupSystemAlertNoTitle:setBtnString(okStr,cancelStr)
    if self._popBG then
        self._popBG:setBtnString(okStr,cancelStr)
    end
end


function PopupSystemAlertNoTitle:onButtonOK()
	if self._callbackOK then
		self._callbackOK()
	end
	self:close()
end

function PopupSystemAlertNoTitle:onButtonCancel()
	if self._callbackCancel then
		self._callbackCancel()
	end
	self:close()
end

return PopupSystemAlertNoTitle