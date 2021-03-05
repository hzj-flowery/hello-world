local Animation = class("Animation", function()
	return cc.Node:create()
end)

local fileUtils = cc.FileUtils:getInstance()

--
function Animation:ctor(spine)
    self:setCascadeOpacityEnabled(true)
    self:setCascadeColorEnabled(true)
	self.tracks = {}
    self.trackIndex = 0

    self._name = ""

    self._animName = ""
    self._spine = spine
    self:addChild(self._spine)
end

--
function Animation:getAnimationName()
    return self._name
end

--
function Animation:setAsset(path)
	self._spine:setAsset(path)
end

--
function Animation:getSpine()
    return self._spine
end

--
function Animation:resetSkeletonPose()
    self._spine:resetSkeletonPose()
end

--
function Animation:removeSelf()
    self:removeFromParent()
end

--
function Animation:setAnimation(name, loop, reset)
    if (self._animName == "idle" or self._animName == "dizzy" ) and name == self._animName then
        return
    end
    local loopAction = loop
    if name == "idle" or name == "dizzy" then
        loopAction = true
    end
    self._animName = name
    return self._spine:setAnimation(name, loopAction, reset)
end

--
function Animation:isAnimationExist(name)
    return self._spine:isAnimationExist(name)
end

--
function Animation:setAnimationWithCallback(name, reset, callback)
    self._spine:setAnimation(name, false, reset)
    self._spine.signalComplet:addOnce(function() callback() end)
end


return Animation