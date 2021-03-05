local PopupBase = require("app.ui.PopupBase")
local PopupOffline = class("PopupOffline", PopupBase)
local Path = require("app.utils.Path")


function PopupOffline:ctor(content, isHideReconnect)
	--
	self._content = content
	self._isHideReconnect = isHideReconnect or true
	--
	local resource = {
		file = Path.getCSB("PopupOffLine", "common"),
		binding = {
			_btnRelogin = {
				events = {{event = "touch", method = "onButtonRelogin"}}
			},
			_btnReconnect = {
				events = {{event = "touch", method = "onButtonReconnect"}}
			}
		}
	}
	PopupOffline.super.ctor(self, resource, false)
end

--
function PopupOffline:onCreate()
	-- title
	self._textContent:setString(self._content)

	-- button
	self._btnRelogin:setString("重新登录")
	self._btnReconnect:setString("重新连接")
	if self._isHideReconnect then
		self._btnReconnect:setVisible(false)
		local sx = self._btnRelogin:getPositionX() + (self._btnReconnect:getPositionX() - self._btnRelogin:getPositionX()) / 2
		self._btnRelogin:setPositionX(sx)
	end
end


function PopupOffline:create(content, isReconnect)
	local popup = PopupOffline.new(content, isReconnect)
	popup:openWithAction()
	return popup
end


function PopupOffline:open()
	self:setPosition(G_ResolutionManager:getDesignCCPoint())
	G_TopLevelNode:addToOfflineLevel(self)
end

--
function PopupOffline:onEnter()
    
end

function PopupOffline:onExit()
    
end

function PopupOffline:setBtnString(okStr,cancelStr)
	--self._btnRelogin:setString("重新登录")
	--self._btnReconnect:setString("重新连接")
end

--
function PopupOffline:onButtonRelogin()
	self:close()
	G_GameAgent:returnToLogin()
end

function PopupOffline:onButtonReconnect()
	self:close()
	G_GameAgent:checkAndLoginGame()
end

return PopupOffline