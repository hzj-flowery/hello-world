local CommonExploreEventBG = class("CommonExploreEventBG")


local EXPORTED_METHODS = {
    "addCloseEventListener",
    "setTitle",
    "addEvent",
}

function CommonExploreEventBG:ctor()
	self._target = nil
	self._textTitle = nil
	self._btnClose = nil
    self._nodeEvent = nil
end

function CommonExploreEventBG:_init()
	self._textTitle = ccui.Helper:seekNodeByName(self._target, "Text_title")
	self._btnClose = ccui.Helper:seekNodeByName(self._target, "Button_close")
    self._nodeEvent = ccui.Helper:seekNodeByName(self._target, "Node_event")
end

function CommonExploreEventBG:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonExploreEventBG:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonExploreEventBG:update(param)
	
end

--
function CommonExploreEventBG:addCloseEventListener(callback)
	self._btnClose:addClickEventListenerEx(callback, true, nil, 0)
end

--
function CommonExploreEventBG:setTitle(s)
	self._textTitle:setString(s)
end

function CommonExploreEventBG:addEvent(eventNode)
    self._nodeEvent:addChild(eventNode)
end


return CommonExploreEventBG