local PopupBase = require("app.ui.PopupBase")
local PopupConfirm = class("PopupConfirm", PopupBase)
local Path = require("app.utils.Path")

function PopupConfirm:ctor(content, callback, title)
	--
	self._title = title or "重试"
	self._content = content
	self._callback = callback
	self._popBG = nil
	--
	local resource = {
		file = Path.getCSB("PopupConfirm", "common"),
		binding = {
		
		}
	}
	PopupConfirm.super.ctor(self, resource, false)
end


function PopupConfirm:onCreate()
	self._popBG:addBtnEventListener(handler(self,self.onButton))
    self._popBG:setBtnString(self._title)
	self._popBG:showCancelBtn(false)

	self._textDesc:setString(self._content)
end


function PopupConfirm:onEnter()
    
end

function PopupConfirm:onExit()
    
end


function PopupConfirm:onButton()
	local isBreak
	if self._callback then
		isBreak = self._callback()
	end
	if not isBreak then
		self:close()
	end
end


return PopupConfirm