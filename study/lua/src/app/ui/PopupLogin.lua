local PopupBase = require("app.ui.PopupBase")
local PopupLogin = class("PopupLogin", PopupBase)
local Path = require("app.utils.Path")

function PopupLogin:ctor(callback)
	local resource = {
		file = Path.getCSB("PopupLogin", "common"),
		binding = {
			_btnSure = {
				events = {{event = "touch", method = "onButtonSure"}}
			},
			_btnCancel = {
				events = {{event = "touch", method = "onButtonCancel"}}
			}
		}
	}
	PopupLogin.super.ctor(self, resource)

	self._callback = callback
end

--
function PopupLogin:onCreate()
	--self._btnSure:setState(CommonButton.STATE_NORMAL)
	self._btnSure:setString(Lang.get("common_btn_sure"))

	--self._btnCancel:setState(CommonButton.STATE_NORMAL)
	self._btnCancel:setString(Lang.get("common_btn_cancel"))

	self._inputUser:setPlaceHolderColor(cc.c4b(0xff,0xff,0xff,0xaa))
    self._inputUser:setTextColor(cc.c4b( 0x89, 0x40, 0x13, 0xff))
    self._inputUser:setFocusEnabled(true)
    self._inputUser:setTouchSize(cc.size(200,33))
    self._inputUser:setupCursorAndListener(cc.c3b(255,255,255),handler(self,self.onInputEvent))

    self._inputPwd:setPlaceHolderColor(cc.c4b(0xff,0xff,0xff,0xaa))
    self._inputPwd:setTextColor(cc.c4b( 0x89, 0x40, 0x13, 0xff))
    self._inputPwd:setFocusEnabled(true)
    self._inputPwd:setTouchSize(cc.size(200,33))
    --self._inputPwd:setPasswordEnabled(true)
    self._inputPwd:setupCursorAndListener(cc.c3b(255,255,255),handler(self,self.onInputEvent))

    self._startY = self._resourceNode:getPositionY()
end

function PopupLogin:onInputEvent(txt,eventType)
	print(eventType)
    if(eventType==ccui.TextFiledEventType.attach_with_ime)then
        txt:setHighlighted(true)
        self:_upView()
    elseif(eventType==ccui.TextFiledEventType.detach_with_ime)then
        txt:setHighlighted(false)
        self:_downView()
    elseif(eventType==ccui.TextFiledEventType.insert_text)then
        
    elseif(eventType==ccui.TextFiledEventType.delete_backward)then
    
    end
end

function PopupLogin:_upView()
    if device.platform == "ios" or device.platform == "android" then
        self._resourceNode:stopAllActions()
        self._resourceNode:runAction(cc.MoveTo:create(0.15, 
        	cc.p(self._resourceNode:getPositionX(), self._startY + 100)))
    end
end

function PopupLogin:_downView()
    if device.platform == "ios" or device.platform == "android" then
        self._resourceNode:stopAllActions()
        self._resourceNode:runAction(cc.MoveTo:create(0.15, 
        	cc.p(self._resourceNode:getPositionX(), self._startY)))
    end
end

--
function PopupLogin:getUserName()
	return self._inputUser:getString()
end

--
function PopupLogin:getPassword()
	return self._inputPwd:getString()
end

--
function PopupLogin:onEnter()
    
end

function PopupLogin:onExit()
    
end

--
function PopupLogin:onButtonSure()
	local name = self:getUserName()
	local password = self:getPassword()
	if name == nil or name == "" then
		return
	end
	if self._callback then
		self._callback(name, password)
	end
	self:close()
end

function PopupLogin:onButtonCancel()
	self:close()
end

return PopupLogin