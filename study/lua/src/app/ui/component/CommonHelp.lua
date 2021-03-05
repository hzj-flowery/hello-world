

local CommonHelp = class("CommonHelp")

local EXPORTED_METHODS = {
    "updateUI",
    "updateLangName",
    "addClickEventListenerEx",
}

function CommonHelp:ctor()
	self._target = nil
    self._functionId = nil
    self._langName = nil
    self._param = nil
end

function CommonHelp:_init()
	self._button = ccui.Helper:seekNodeByName(self._target, "Button")
    self._button:addClickEventListenerEx( handler(self, self._onClickIntro), true, nil, 0)
end

function CommonHelp:addClickEventListenerEx( func )
    -- body
    self._button:addClickEventListenerEx( func, true, nil, 0)
end

function CommonHelp:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHelp:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonHelp:updateUI(functionId, param)
    self._functionId = functionId
    self._param = param
end

function CommonHelp:updateLangName(langName)
    self._langName = langName
end

function CommonHelp:_onClickIntro()
   -- if not self._functionId  and not self._langName then
    --    return 
   -- end
    local UIPopupHelper = require("app.utils.UIPopupHelper")
    if self._functionId then
        UIPopupHelper.popupHelpInfo(self._functionId, self._param)
    elseif self._langName then    
        UIPopupHelper.popupHelpInfoByLangName(self._langName)
    end

    
end



return CommonHelp