-- EffectGfxSingle

-- desc 第节点设计目的在于使用自定义的配置文件（通常位于res/moving/目录下）播放自定义动画

local EffectGfxSingle = class("EffectGfxSingle")

--ignoreAttr默认为空, 可以传哪些属性不做moving, 比如 position, opacity, scale, rotation


local defaultDouble = 1
local effectDesignInterval = 1/30 -- 动画设计时的FPS速度



function EffectGfxSingle:ctor(node, effectJsonName, eventHandler, ignoreAttr, startFrame)
    --self:setCascadeOpacityEnabled(true)
    
    -- effectJson名称
    self._effectJsonName = effectJsonName
    
    -- json路径
    self._effectJsonPath = "moving/"..effectJsonName

    -- 解析json并保存起来
    local jsonString = cc.FileUtils:getInstance():getStringFromFile(self._effectJsonPath..".json")  
    self._effectJson = json.decode(jsonString)
    
    -- 事件处理函数
    self._eventHandler = eventHandler

    --ignoreAttr默认为空, 可以传哪些属性不做moving, 比如 position, opacity, scale, rotation

    self._ignoreAttr = ignoreAttr or {}
    

    -- 倍数
    self._double = defaultDouble

    self._node = node

    -- 帧数计数
    self._frameIndex = 1


    self._lastFrameStart = 0

    self._startX = self._node:getPositionX()
    self._startY = self._node:getPositionY()
    --print("set starty " .. self._startY )
    self._startScaleX = self._node:getScaleX()
    self._startScaleY= self._node:getScaleY()

    self._startRotation = self._node:getRotation()
    self._startOpacity = self._node:getOpacity()

    self._totalDt = 0

    --默认显示第一帧
    self:_step()


    if startFrame == nil then
        startFrame = 1
    end
    self:gotoAndPlay(startFrame)

end

function EffectGfxSingle:play()

    -- 开启update循环
    --self._node:addNodeEventListener(cc.NODE_ENTER_FRAME_EVENT,handler(self, self._update))
    --self._node:scheduleUpdate()
    self._node:scheduleUpdateWithPriorityLua(handler(self, self._update),0)
end

--frame > 0
function EffectGfxSingle:gotoAndPlay(frame)
    self:play()

    for i=1, frame-1 do 
        self:_step()
    end
    
end

function EffectGfxSingle:stop()
    if self._node ~= nil then
        self._node:unscheduleUpdate()
        self._node = nil

    end
end


function EffectGfxSingle:_update(dt)
    self._totalDt = self._totalDt + dt -- 毫秒

     -- 计算实际上应该播放多少帧
     local extraInterval = effectDesignInterval/self._double
     local frames = math.floor(self._totalDt/extraInterval)
     if frames > self._double  then frames = math.floor(self._double) end

     for i=1, frames do
     
        self._totalDt = self._totalDt - extraInterval
        
        if not self:_step() then
             break
        end
         
     end

end


function EffectGfxSingle:_step()
    local fx = "f"..self._frameIndex
    local effectJson = self._effectJson

    self:_nodeStep()

    if self._eventHandler and effectJson.events[fx] ~= nil then
        self._eventHandler(effectJson.events[fx], self._frameIndex, self)
    end
    
    self._frameIndex = self._frameIndex + 1

    if effectJson.events[fx] == "forever" then
        self._frameIndex = 1
    elseif effectJson.events[fx] == "finish" then
        self:stop()
        return false
    end

    return true
end

function EffectGfxSingle:_nodeStep()
    
    local effectNode = self._node
    local targetKey = "target"
    local effectJson = self._effectJson
    local effectLayer = self._effectJson[targetKey]
    local frameIndex = self._frameIndex
        
    local fx = "f"..frameIndex

    if effectLayer[fx] then  self._lastFrameStart = frameIndex end

    local lastFrameStart =  self._lastFrameStart

    if lastFrameStart == frameIndex then
        
        local start = effectLayer[fx].start
        --ignoreAttr默认为空, 可以传哪些属性不做moving, 比如 position, opacity, scale, rotation
        if not self._ignoreAttr['position'] then
            effectNode:setPosition(start.dx + self._startX, start.dy + self._startY)
           -- print("set starty........... " .. (start.dy + self._startY) )

        end
        if not self._ignoreAttr['rotation'] then
           effectNode:setRotation(start.rotation)
        end 
        if not self._ignoreAttr['scale'] then
            effectNode:setScaleX(start.scaleX*self._startScaleX)
            effectNode:setScaleY(start.scaleY*self._startScaleY)
        end 
        if not self._ignoreAttr['opacity'] then
            effectNode:setOpacity(start.opacity)
        end 
        

    else
        local lastFx = "f"..lastFrameStart
        local start = effectLayer[lastFx].start
        local nextFrame = effectLayer[lastFx].nextFrame
        local frames = effectLayer[lastFx].frames
        if nextFrame then
            
            local percent = (frameIndex - lastFrameStart) / frames

            local nextStart = effectLayer[nextFrame].start
          
            -- 位置
            if not self._ignoreAttr['position'] then
               
                local startX=start.dx + self._startX
                local startY=start.dy + self._startY
                local nextX=nextStart.dx+ self._startX
                local nextY=nextStart.dy+ self._startY
                local targetX=startX+(nextX-startX)*percent
                local targetY=startY+(nextY-startY)*percent
                effectNode:setPosition(targetX,targetY) 
            end
            -- 旋转
            if not self._ignoreAttr['rotation'] then
               effectNode:setRotation(start.rotation + (nextStart.rotation - start.rotation) * percent)
            end 

            -- 拉伸
            if not self._ignoreAttr['scale'] then
                effectNode:setScaleX((start.scaleX + (nextStart.scaleX - start.scaleX) * percent)*self._startScaleX)
                effectNode:setScaleY((start.scaleY + (nextStart.scaleY - start.scaleY) * percent)*self._startScaleY)
            end 
            -- 透明度
            if not self._ignoreAttr['opacity'] then
                effectNode:setOpacity(start.opacity + (nextStart.opacity - start.opacity) * percent)
            end 
        end
    end
end



function EffectGfxSingle:reset()
    if self._node ~= nil then
        if not self._ignoreAttr['position'] then
            self._node:setPosition(self._startX, self._startY)
        end

        if not self._ignoreAttr['rotation'] then
            self._node:setRotation(self._startRotation)
        end

        if not self._ignoreAttr['scale'] then 
            self._node:setScaleX(self._startScaleX)
            self._node:setScaleY(self._startScaleY)
        end

        if not self._ignoreAttr['opacity'] then
            self._node:setOpacity(self._startOpacity)
        end 
    end
end


return EffectGfxSingle
