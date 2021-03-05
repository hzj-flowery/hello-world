local SpineNode = class("SpineNode", function()
	return cc.Node:create()
end)

local fileUtils = cc.FileUtils:getInstance()
local PrioritySignal = require("yoka.event.PrioritySignal")

--
function SpineNode:ctor(scale, size)
    self:enableNodeEvents()
    self:setCascadeOpacityEnabled(true)
    self:setCascadeColorEnabled(true)

    self._timeScale = 1
	self._spine = nil
    self._animationName = nil
    self._animationLoop = nil
    self._scale = scale or 1
    self._size = size
    self._registerSpineEventHandler = false

    self.signalLoad = PrioritySignal.new("string")
    self.signalStart = PrioritySignal.new("string")
    self.signalEnd = PrioritySignal.new("string")
    self.signalComplet = PrioritySignal.new("string")
    self.signalEvent = PrioritySignal.new("string")
end

--
function SpineNode:setSize(size)
    self._size = size
    if self._spine then
        self._spine:setContentSize(self._size)
        self._spine:setAnchorPoint(cc.p(0.5, 0))
    end
end

--
function SpineNode:setAsset(path)
    -- reset
    self:_unregisterSpineEvent()
    self:removeAllChildren(true)
    self._animationName = nil
    self._animationLoop = nil
    self._spine = nil

    -- load
    local ret = G_SpineManager:addSpineAsync(path, self._scale, function ()
        local spineAni = G_SpineManager:createSkeleton(path)
        assert(spineAni, "Could not load the spine with path: "..tostring(path))
        if spineAni then
            spineAni:setToSetupPose()

            self:addChild(spineAni)
            self._spine = spineAni

            if self._size then
                self:setSize(self._size)
            end

            self:_registerSpineEvent()

            if self._animationName ~= nil then
                self:setAnimation(self._animationName, self._animationLoop)
            end

            self._spine:setTimeScale(self._timeScale)
            self.signalLoad:dispatch("load")
        end
    end, self)

end

--
function SpineNode:_registerSpineEvent()
    if self._spine then
        if not self._registerSpineEventHandler then
            self._registerSpineEventHandler = true
        
            --
            self._spine:registerSpineEventHandler(function (event)
                self.signalStart:dispatch(event.trackIndex)
            end, sp.EventType.ANIMATION_START)

            --
            self._spine:registerSpineEventHandler(function (event)
                self.signalEnd:dispatch(event.trackIndex)
            end, sp.EventType.ANIMATION_END)
            
            --
            self._spine:registerSpineEventHandler(function (event)
                self.signalComplet:dispatch(event.trackIndex, 
                                            event.loopCount)
            end, sp.EventType.ANIMATION_COMPLETE)

            --
            self._spine:registerSpineEventHandler(function (event)
                self.signalEvent:dispatch(event.trackIndex, 
                                            event.eventData.name, 
                                            event.eventData.intValue, 
                                            event.eventData.floatValue, 
                                            event.eventData.stringValue)
            end, sp.EventType.ANIMATION_EVENT)
        end
    end
end

--
function SpineNode:_unregisterSpineEvent()
    if self._registerSpineEventHandler then
        self._registerSpineEventHandler = false
        if self._spine then
            self._spine:unregisterSpineEventHandler(sp.EventType.ANIMATION_START)

            --
            self._spine:unregisterSpineEventHandler(sp.EventType.ANIMATION_END)
            
            --
            self._spine:unregisterSpineEventHandler(sp.EventType.ANIMATION_COMPLETE)

            --
            self._spine:unregisterSpineEventHandler(sp.EventType.ANIMATION_EVENT)
        end
    end
end

--
function SpineNode:onEnter()
    self:_registerSpineEvent()
end

--
function SpineNode:onExit()
    self:_unregisterSpineEvent()
    G_SpineManager:removeSpineLoadHandlerByTarget(self)
end

--
function SpineNode:onCleanup()
    self:_unregisterSpineEvent()
    G_SpineManager:removeSpineLoadHandlerByTarget(self)
    self._spine = nil
end

--
function SpineNode:getSpine()
    return self._spine
end

--
function SpineNode:resetSkeletonPose()
    if self._spine ~= nil then
        self._spine:setToSetupPose()
        self._spine:clearTracks()
    end
end

--
function SpineNode:removeSelf()
    self:removeFromParent()
end

--
function SpineNode:setAnimation(name, loop, reset)
    self._animationName = name
    self._animationLoop = loop
    if self._spine then
        if reset ~= nil and reset == true then
            self:resetSkeletonPose()
        end
        self._spine:setAnimation(0, name, loop)
        self._spine:update(1/30)
    end
end

--
function SpineNode:setTimeScale(time)
    self._timeScale = time
    if self._spine then
        self._spine:setTimeScale(time)
    end
end

--检查动作是否存在
function SpineNode:isAnimationExist(name)
    if self._spine then
        return self._spine:isAnimationExist(name)
    end
    return false
end

--获得动作长度
function SpineNode:getAnimationDuration(name)
    local duration = self._spine:getAnimationDuration(name)
end

function SpineNode:getAnimationName( ... )
    -- body
    return self._animationName
end
return SpineNode