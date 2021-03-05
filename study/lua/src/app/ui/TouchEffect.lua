local TouchEffect = class("TouchEffect", cc.Layer)
local EventDispatcher = cc.Director:getInstance():getEventDispatcher()
--
function TouchEffect:ctor()
    --
    self._emitter = cc.ParticleSystemQuad:create("particle/particle_touch.plist")
    if self._emitter then
        self:addChild(self._emitter)
        self._emitter:stopSystem()
    end

    G_TopLevelNode:addToTouchEffectLevel(self)
end

--
function TouchEffect:clear()
    if self._listener then
        EventDispatcher:removeEventListener(self._listener)
        self._listener = nil
    end
    G_TopLevelNode:remove(self)
end

--
function TouchEffect:start()
    if self._listener == nil then
        local listener = cc.EventListenerTouchOneByOne:create()
        listener:setSwallowTouches(false)
        listener:registerScriptHandler(handler(self, self._onTouchBegan), cc.Handler.EVENT_TOUCH_BEGAN)
        listener:registerScriptHandler(handler(self, self._onTouchMoved), cc.Handler.EVENT_TOUCH_MOVED)
        listener:registerScriptHandler(handler(self, self._onTouchEnded), cc.Handler.EVENT_TOUCH_ENDED)
        listener:registerScriptHandler(handler(self, self._onTouchCancelled), cc.Handler.EVENT_TOUCH_CANCELLED)
        EventDispatcher:addEventListenerWithSceneGraphPriority(listener, self)
        self._listener = listener
    end
end

--
function TouchEffect:_onTouchBegan(touch, event)
    if self._emitter then
        local locationInNode = self:convertToNodeSpace(touch:getLocation())
        self._emitter:resetSystem()
        self._emitter:setPosition(locationInNode)
        return true
    end

    return false
end

--
function TouchEffect:_onTouchMoved(touch, event)
    if self._emitter then
        local locationInNode = self:convertToNodeSpace(touch:getLocation())
        self._emitter:setPosition(locationInNode)
    end
end

--
function TouchEffect:_onTouchEnded(touch, event)
    if self._emitter then
        self._emitter:stopSystem()
    end
end

--
function TouchEffect:_onTouchCancelled(touch, event)
    if self._emitter then
        self._emitter:stopSystem()
    end
end

return TouchEffect