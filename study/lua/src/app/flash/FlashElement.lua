local FlashElement = class("FlashElement")

local function lerpf(src, target, t)
    return (src + t * (target - src))
end

local FlashElement = class("FlashElement")
function FlashElement:ctor(helper, towards, info, baseScaleX, baseScaleY)
    self._helper = helper
    self._layerInfo = info
    self._frames = self._layerInfo.frames
    self._name = self._layerInfo.name 
    self._entity = nil 
    self._lastFrame = nil 
    self._towards = towards == 1 and 1 or -1
    self._baseScale = {baseScaleX, baseScaleY}
end

function FlashElement:update(f)
    local frame = self._frames[tostring(f)]
    if frame ~= nil then 
        if self._entity == nil then 
            self._entity = self._helper:createSymbol(self._name, self._layerInfo.extras)
        end
        local start = self._helper:getStartPosition()
        if self._entity then
            self._entity:setPosition(start.x + checkint(frame.x*self._towards), start.y + checkint(frame.y))
            if self._name ~= "shadow" then 
                self._entity:setPositionY(start.y + checkint(y) + checkint(height))
                self._entity:setRotation(frame.rotation)
                self._entity:setScale(frame.scaleX*self._baseScale[1], frame.scaleY*self._baseScale[2])
            end
        end
        self._lastFrame = frame
    end
    
    if self._lastFrame ~= nil then 
        if self._lastFrame.isMotion == true then 
            local n = self._lastFrame.id + self._lastFrame.duration
            local nextFrame = self._frames[tostring(n)]
            if nextFrame then 
                local start = self._helper:getStartPosition()
                local t = (f - self._lastFrame.id) / self._lastFrame.duration
				local x = lerpf(self._lastFrame.x, nextFrame.x, t)
				local y = lerpf(self._lastFrame.y, nextFrame.y, t)
				local height = lerpf(self._lastFrame.height, nextFrame.height, t)   --高度是相对于y来说的补充
				local scaleX = lerpf(self._lastFrame.scaleX, nextFrame.scaleX, t)
				local scaleY = lerpf(self._lastFrame.scaleY, nextFrame.scaleY, t)
                local rotation = lerpf(self._lastFrame.rotation, nextFrame.rotation, t)  
                
                self._entity:setPosition(start.x + checkint(x*self._towards), start.y + checkint(y))
                if self._name ~= "shadow" then 
                    self._entity:setPositionY(start.y + checkint(y) + checkint(height))
                    self._entity:setRotation(rotation*self._towards)
                    self._entity:setScale(scaleX*self._baseScale[1], scaleY*self._baseScale[2])
                end
            end
        end
    end
end

return FlashElement