local ViewBase = require("app.ui.ViewBase")
local ActivitySubView = class("ActivitySubView", ViewBase)

function ActivitySubView:ctor(resource)
	self._actTitle = nil
    self._isInShow = false
    ActivitySubView.super.ctor(self, resource)
end

function ActivitySubView:enterModule()
    self._isInShow = true
end

function ActivitySubView:exitModule()
    self._isInShow = false
end

function ActivitySubView:isInShow()
    return self._isInShow
end

function ActivitySubView:setTitle(str)
    self._actTitle:setTitle(str)
end

return ActivitySubView