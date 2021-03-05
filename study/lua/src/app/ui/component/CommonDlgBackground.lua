

local CommonDlgBackground = class("CommonDlgBackground")

local EXPORTED_METHODS = {
}

function CommonDlgBackground:ctor()
	self._target = nil
end

function CommonDlgBackground:_init()
	self._imageDay = ccui.Helper:seekNodeByName(self._target, "Image_day")
    self._imageNight = ccui.Helper:seekNodeByName(self._target, "Image_night")
    self._panelContent = ccui.Helper:seekNodeByName(self._target, "Panel_content")

    local size = G_ResolutionManager:getDesignSize(),
    self._panelContent:setContentSize(cc.size(display.width, display.height))

    local function  isNight( ... )
        local hour = G_ServerTime:getCurrentHHMMSS(G_ServerTime:getTime())
        dump(hour)
        -- body
        if hour >= 18 and hour <= 23 then
            return true
        end
        if hour >= 0 and hour <= 5 then
            return true
        end
    end
    self._imageDay:setVisible(true)
    self._imageNight:setVisible(false)
    if isNight() then
        self._imageDay:setVisible(false)
        self._imageNight:setVisible(true)
    end
end

function CommonDlgBackground:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonDlgBackground:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonDlgBackground:updateUI(functionId)
    self._functionId = functionId
end

function CommonDlgBackground:updateLangName(langName)
    self._langName = langName
end


return CommonDlgBackground