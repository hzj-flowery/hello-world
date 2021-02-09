-- EffectGfxMoving

-- desc 第节点设计目的在于使用自定义的配置文件（通常位于res/moving/目录下）播放自定义动画

local EffectGfxMoving = class("EffectGfxMoving", function() return display.newNode() end)
local EffectHelper = require("app.effect.EffectHelper")
local EffectController = require("app.effect.EffectController")
local defaultDouble = 1
local effectDesignInterval = 1/30 -- 动画设计时的FPS速度
local Path = require("app.utils.Path")

function EffectGfxMoving:ctor(effectJsonName, effectFunction, eventHandler)
    
    self:setCascadeOpacityEnabled(true)
    
    -- effectJson名称
    self._effectJsonName = effectJsonName
    
    -- json路径
    self._effectJsonPath = "moving/"..effectJsonName
    -- 解析json并保存起来
    self._effectJson = EffectHelper.decodeJsonFile(self._effectJsonPath..".json")
    

    -- 节点回调
    self._effectFunction = effectFunction
    
    -- 事件处理函数
    self._eventHandler = eventHandler
    

    -- 倍数
    self._double = defaultDouble
   
    -- 自动释放标记，指的是在effect播放完毕会是否自动释放，默认不自动释放
    self._autoRelease = false

    -- 是否播放完毕
    self._isDone = false

    self:reset()

    self._totalDt = 0
 
    --默认显示第一帧
    self:_step()


end

function EffectGfxMoving:play()

    --self:setNodeEventEnabled(true)
    self:scheduleUpdateWithPriorityLua(handler(self, self._update),0)
    
    -- 开启update循环
    --self:scheduleUpdate()

    self._played = true
    
end

function EffectGfxMoving:gotoAndPlay(gotoIndex)

   -- self:setNodeEventEnabled(true)
   self:scheduleUpdate()
    self:scheduleUpdateWithPriorityLua(handler(self, self._update),0)
    
    if type(gotoIndex) == "number" then
        for i=1, gotoIndex do
            self:_step()
        end
    end

    -- 开启update循环
    

    self._played = true
    
end

function EffectGfxMoving:reset()
    
    -- 清空step数组
    self._effectStepArr = {}
     -- 特效显示节点    
    self._effectNodes = {}
    -- 帧数计数
    self._frameIndex = 1

    --是否暂停中
    self._paused = false

    self._played = false
end

function EffectGfxMoving:isPlaying()
    return self._played and not self._paused
end

function EffectGfxMoving:stop()
    self:unscheduleUpdate()
end

function EffectGfxMoving:pause()
    self._paused = true
end

function EffectGfxMoving:resume()
    self._paused = false
end

function EffectGfxMoving:setDouble(double)
    assert(double and double > 0, "double could not be nil and negative !")
    self._double = double
end

function EffectGfxMoving:isDone()
    return self._isDone
end

function EffectGfxMoving:_update(dt)
    if self._paused then
        return
    end

   self._totalDt = self._totalDt + dt -- 毫秒
      

   -- 计算实际上应该播放多少帧
   local extraInterval = effectDesignInterval/self._double
   local frames = math.floor(self._totalDt/extraInterval)
   if frames > self._double  then frames = math.floor(self._double) end

   for i=1, frames do
       if self._paused then
            break
       end
       if not self:isRunning() then
           break
       end
       self._totalDt = self._totalDt - extraInterval
       if not self:_step() then
            self._isDone = true
            if self._autoRelease then
                self:runAction(cc.RemoveSelf:create())
            end
            break
       end
   end
end


function EffectGfxMoving:_step()
    local fx = "f"..self._frameIndex
    local effectJson = self._effectJson

    -- 用来保存effectStep数据用数组
    self._effectStepArr = self._effectStepArr or {}
    for k, v in pairs(effectJson) do
        if k ~= "events" then
            self._effectStepArr[k] = self._effectStepArr[k] or self:_effectStep(k, v)
            self._effectStepArr[k](self._frameIndex)
        end
    end

    if self._eventHandler and effectJson.events[fx] ~= nil then
        self._eventHandler(effectJson.events[fx], self._frameIndex, self)
    end
    
    self._frameIndex = self._frameIndex + 1

    if effectJson.events[fx] == "forever" then
        self._frameIndex = 0
    elseif effectJson.events[fx] == "finish" then
        self:unscheduleUpdate()
        return false
    end

    return true
end

--根据标记创建node
function EffectGfxMoving:_createNodeBySymbol(symbol)
    -- print("1112233 create symbol name = ", symbol)
    local node = nil
    local strArray = string.split(symbol, "_")
    if strArray[1] == "effect" then
        return self:_createEffectNode(strArray, symbol)
    elseif strArray[1] == "spine" then
        return self:_createSpineNode(strArray)
    elseif strArray[1] == "lizi" then
        return self:_createParticleNode(strArray)
    end
    return node
end

--创建effect(effect_xnamex_copy1)
function EffectGfxMoving:_createEffectNode(strArray, symbol)
    local node = nil
    local lastCount = strArray[#strArray]
    local effectName = nil
    if string.find(lastCount, "copy") then      --如果结尾有copy字样，则说明是需要重复使用的特效，去掉copy拿到前面的就是特效名字
        effectName = "effect"
        for i = 2, #strArray-1 do
            effectName = effectName.."_"..strArray[i]
        end
    else
        effectName = symbol
    end
    assert(effectName, "no effect "..symbol)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    node = EffectGfxNode.new(effectName)
    node:play()
    return node
end

--创建spine(spine_xnamex_xanimx_1_copy1)
function EffectGfxMoving:_createSpineNode(strArray)
    local node = nil
    local spineName = strArray[2]
    local namePlus = strArray[3]
    local isBigSpine = false
    if namePlus == "big" then 
        spineName = spineName
        isBigSpine = true
    end
    local index = 3 
    if isBigSpine then 
        index = 4
    end
    local spineAnim = strArray[index]
    local spineFlag = not (strArray[index+1] and tonumber(strArray[index+1]) == 1)

    local spinePath = Path.getEffectSpine(spineName)
    if isBigSpine then 
        spinePath = Path.getStorySpine(spineName)
        print("1112233 spine path = ", spinePath)
    end
    local isExit = G_SpineManager:isSpineExist(spinePath)
    node = require("yoka.node.SpineNode").new(1, cc.size(500, 640))
    if isExit == false then
        spinePath = Path.getSpine(spineName)
        node = require("yoka.node.HeroSpineNode").new() --spine/目录下的资源使用要和HeroSpineNode统一，防止复用引起的比例错误
    end
    
    node:setAsset(spinePath)
    node:setAnimation(spineAnim, spineFlag)
    return node
end

--创建粒子特效(lizi_xnamex_copy1)
function EffectGfxMoving:_createParticleNode(strArray)
    local path = ""
    local lastCount = strArray[#strArray]
    if string.find(lastCount, "copy") then      --如果结尾有copy字样，则说明是需要重复使用的特效，去掉copy拿到前面的就是特效名字
        table.remove(strArray, #strArray)
    end
    table.remove(strArray, 1)
    for k,v in ipairs(strArray) do
        path = path .. v
        if k ~= #strArray then
            path = path .. "_"
        end
    end

    local node = cc.ParticleSystemQuad:create(Path.getParticle(path))
    node:setPositionType(1)
    node:resetSystem()
    return node
end

function EffectGfxMoving:_effectStep(key, effectLayer)
    local lastFrameStart = nil  
    -- 这里的effectNode表示实际显示的节点
    local effectNode = self._effectNodes[key]
--    assert(effectNode, "the "..key.." node could not be nil !")
    
    return function(frameIndex)
        
        local fx = "f"..frameIndex
 
        if lastFrameStart or effectLayer[fx] then

            if not self._effectNodes[key] then
                effectNode = self:_createNodeBySymbol(key)
                if not effectNode then
                    effectNode = self._effectFunction(key)
                end
                assert(effectNode, "the "..key.." node could not be nil !")
                self:addChild(effectNode, effectLayer.order)
                self._effectNodes[key] = effectNode
            end
            
            -- 初次使用，则显示effectNode
            if not lastFrameStart then effectNode:setVisible(true) end
            
            if effectLayer[fx] and effectLayer[fx].remove then
                effectNode:setVisible(false)
                lastFrameStart = nil
                return
            end
            
            if effectLayer[fx] then lastFrameStart = frameIndex end
            
            if lastFrameStart == frameIndex then
                local start = effectLayer[fx].start
                EffectController.keyUpdate(effectNode, effectLayer, frameIndex )
                if start.png then
                    effectNode:setDisplayFrame(display.newSpriteFrame(start.png)) 
                end
            else
                EffectController.keyInterUpdate(effectNode, effectLayer, frameIndex, lastFrameStart)
            end
        end
    end
end

--[=================[

    是否自动释放，默认不自动

    @param auto 是否自动释放，boolean

]=================]

function EffectGfxMoving:setAutoRelease(auto)
    self._autoRelease = auto
end


return EffectGfxMoving
