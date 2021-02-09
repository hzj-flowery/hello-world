local ViewBase = require("app.ui.ViewBase")
local UpdateView = class("UpdateView", ViewBase)

function UpdateView:ctor()
	local resource = {
		file = Path.getCSB("UpdateView", "login"),
        size = G_ResolutionManager:getDesignSize()
	}
	UpdateView.super.ctor(self, resource)
end

function UpdateView:onCreate()
	self._lasttime = 0
	self._times = 0
	self._speed = "0"
	self._version = "unknown"
	self._loadingBar:setPercent(0)
	self._totalSize = 0
	self._loadingLabel:setString("")
end

function UpdateView:setPercent(percent)
	self._loadingBar:setPercent(percent)

	--local cur = string.format("%.2f", self._totalSize * percent / 100)
	--local max = string.format("%.2f", self._totalSize)
	if self._lasttime == 0 then self._lasttime = timer:gets()-1 end
	local t = math.ceil(timer:gets() - self._lasttime)
	if t > self._times then
		self._times = t
		self._speed = string.format("%.2fMB/s", self._totalSize * percent / 100 / self._times)
	end

	self._loadingLabel:setString(Lang.get("login_update_download", 
	{
		max = string.format("%.2f", self._totalSize), 
		speed = self._speed, 
		version = self._version
	}))
end

function UpdateView:setTotalSize(size)
	self._totalSize = size
end

function UpdateView:setProgressString(txt)
	self._loadingLabel:setString(txt)
end

function UpdateView:setProgressPercent(percent)
	self._loadingBar:setPercent(percent)
end

--
function UpdateView:showView(version)
	self._version = version or "unknown"
	self:setVisible(true)
end

--
function UpdateView:hideView()
	self:setVisible(false)
end

return UpdateView