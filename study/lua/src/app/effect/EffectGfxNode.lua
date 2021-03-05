
-- EffectGfxNode.lua

--[=========================[
    
    特效播放类

    旨在使用自定义的配置文件（effect_xxx.json，通常位于res/effect/目录下）播放自定义动画
    
    --内部结构如下:

    -- *EffectGfxNode(key1)    (存放于self._playingSublayers)
    -- *EffectGfxNode(key2)    (存放于self._playingSublayers)
    -- *clippingNode(key3)  (存放于self._maskNodes)
    -- **stencilNode(key3)(clippingNode的stencil)   (存放于self._maskStencilNodes) 
    -- ***stencil(key3)(遮罩的实际样子,是stencilNode的子节点)   (存放于self._playingSublayers) 

]=========================]

local defaultDouble = 1
local effectDesignInterval = 1/30 -- 动画设计时的FPS速度

local reservedKeys = {events=true, scale=true, png=true}

local EffectHelper = require("app.effect.EffectHelper")
local EffectController = require("app.effect.EffectController")
local EffectGfxNode = class("EffectGfxNode", function()
    return display.newNode()
end)

local function isTypeOfEffectGfxNode(o)   
    if o.__isEffectGfxNode ~= nil and o.__isEffectGfxNode  then
        return true
    end
    return false
end

local function debugPrint(str)
   --print(str)
end


local function decodeJsonFile(jsonFileName)
    
    local jsonString=cc.FileUtils:getInstance():getStringFromFile(jsonFileName)
--    local jsonString = CCFileUtils:sharedFileUtils():getEncryptFileData(jsonFileName)
    assert(jsonString, "Could not read the json file with path: "..tostring(jsonFileName))
    
    local jsonConfig = json.decode(jsonString)
    assert(jsonConfig, "Invalid json string: "..tostring(jsonString).." with name: "..tostring(jsonFileName))
    
    return jsonConfig
end


function EffectGfxNode:ctor(effectJsonName, eventHandler, colorOffset, resourceIniter, EffectGfxNodeCreator)
    
    debugPrint("create EffectGfxNode:" .. tostring(effectJsonName))

    self.__isEffectGfxNode = true
    -- effectJson名称
    self._effectJsonName = effectJsonName


    self._playingSublayers = {}   --当前播放过程用的所有sub元件
    self._subLastStartFrame = {}  --每一个sub元件上一个关键帧的ID

    --跟遮罩有关的
    self._maskNodes = {}  --clipingnode
    self._maskStencilNodes = {} --stencil的父节点


    -- 事件处理函数
    self._eventHandler = eventHandler
    
    -- 帧数计数
    self._frameIndex = 1
    -- 倍数
    self._double = defaultDouble
    
    --通过截取帧数播放
    self.gotoPlayData = nil;--{main = 0 , max = 0 , callBack = nil, isRepeat = false};

    self:setCascadeOpacityEnabled(true)
    self:setCascadeColorEnabled(true)

    -- 根节点
    self._rootNode = display.newNode()
    self:addChild(self._rootNode)
    self._rootNode:setCascadeOpacityEnabled(true)
    self._rootNode:setCascadeColorEnabled(true)

    self._colorOffset = colorOffset or cc.c4f(0, 0, 0, 0)

    self._totalDt = 0

    self._played = false

    -- 是否播放完毕
    self._isDone = false

    ----下面3个缓存只存在根节点的EffectGfxNode才有用
    self._spriteFrames = {}     -- sprite frame缓存
    self._resourceList = {}     --plist是否已加载
    self._jsonList = {}         -- 持有的所有JSON文件


    --下面这个不仅存在于根节点
    self._poolSublayers = {}  --sub元件回收池
        
    -- 自动释放标记，指的是在effect播放完毕会是否自动释放，默认不自动释放
    self._autoRelease = false

    --加载素材
    if resourceIniter ~= nil then
        self._resourceIniter = resourceIniter
    else
        local _defaultResourceIniter  = {
            jsonGetter = EffectHelper.jsonGetter,
            pngIniter  = EffectHelper.pngGetter,
            framesGetter = EffectHelper.framesGetter,
            cacheJson = {},
        }

        self._resourceIniter = _defaultResourceIniter
    end


    self._effectJson = self._resourceIniter.jsonGetter(self._resourceIniter,self._effectJsonName)
    self._resourceIniter.pngIniter(self._resourceIniter, self._effectJsonName)
    self._EffectGfxNodeCreator = EffectGfxNodeCreator

    --默认第一帧
    self:_step()
end


function EffectGfxNode:_reset()
    self._frameIndex = 1

    for key, sub in pairs(self._playingSublayers) do
        EffectHelper.deleteSub(key,  sub)
        self._poolSublayers[key] = sub
    end
    self._subLastStartFrame = {}
    self._playingSublayers = {}
    self._maskNodes = {}  
    self._maskStencilNodes = {} 
end


function EffectGfxNode:gotoPlay(data)
    self.gotoPlayData = data;
    --第一次play不需要重置, 以后需要
    if self._played then
        -- 重置帧数
        self._frameIndex = self.gotoPlayData.min
         -- 清空节点
        for key, sub in pairs(self._playingSublayers) do
            EffectHelper.deleteSub(key,  sub)
            self._poolSublayers[key] = sub
        end

        self._subLastStartFrame = {}
        self._playingSublayers = {}
        self._maskNodes = {}  
        self._maskStencilNodes = {}
    else
        self._played = true

    end

    self._paused = false
    
    self:scheduleUpdate()
    -- 开启update循环
    self:scheduleUpdateWithPriorityLua(handler(self, self._update),0)

    for k, sub in pairs(self._playingSublayers) do
        if isTypeOfEffectGfxNode(sub) then
            sub:play()
        end
    end
    
    
end

function EffectGfxNode:play()
 
    --第一次play不需要重置, 以后需要
    if self._played then
        -- 重置帧数
        self:_reset()
    else
        self._played = true
    end


    self._paused = false

    -- 开启update循环
    self:scheduleUpdateWithPriorityLua(handler(self, self._update), 0)
    --self:scheduleUpdate()
 
    for k, sub in pairs(self._playingSublayers) do
         if isTypeOfEffectGfxNode(sub) then
            sub:play()
         end
    end
end

function EffectGfxNode:stop()
    self:unscheduleUpdate()
    
    for i, sub in pairs(self._playingSublayers) do
        if isTypeOfEffectGfxNode(sub) then
            sub:stop()
         end
    end
end

function EffectGfxNode:pause()
    self._paused = true
    for i, sub in pairs(self._playingSublayers) do
        if isTypeOfEffectGfxNode(sub) then
            sub:pause()
         end
    end
end

function EffectGfxNode:resume()
    self._paused = false
    for i, sub in pairs(self._playingSublayers) do
        if isTypeOfEffectGfxNode(sub) then
            sub:resume()
         end
    end
end

function EffectGfxNode:gotoAndStop(n)
    self:_reset()
    for n=1, n do 
        self:_step()
    end

    self:stop()
    
end



function EffectGfxNode:setDouble(double)
    assert(double and double > 0, "double could not be nil and negative !")
    self._double = double
end



function EffectGfxNode:getEffectGfxNode(key)
    --dump(self._playingSublayers)
    return self._playingSublayers[key]    
end

function EffectGfxNode:isPlaying()
    --dump(self._playingSublayers)
    return self._played and not self._paused
end

function EffectGfxNode:isDone()
    return self._isDone
end

function EffectGfxNode:_update(dt)

    if self._paused then
        return
    end
    self._totalDt = self._totalDt + dt -- 毫秒
    

     -- 计算实际上应该播放多少帧
     local extraInterval = effectDesignInterval/self._double
     local frames = math.floor(self._totalDt/extraInterval)

     if self._double >= 1 and frames > self._double  then frames = math.floor(self._double) end

     for i=1, frames do
        if self._paused then
            break
        end
        if not self:isRunning() then
            break
        end

        self._totalDt = self._totalDt - extraInterval
        if not self:_step() then

            -- 播放完毕了
            self._isDone = true

            if self._autoRelease then
                self:runAction(cc.RemoveSelf:create())
            end
            break
        end
         
     end
    
end




function EffectGfxNode:_step()
    local fx = "f"..self._frameIndex
    local effectJson = self._effectJson
   -- print("step.." .. tostring(_effectJsonName))


    -- 用来保存effectStep数据用数组
    --self._effectStepArr = self._effectStepArr or {}
    for k, v in pairs(effectJson) do
        if not reservedKeys[k] then
            self:_stepSub(k,  self._frameIndex)
        end
    end

    if self._eventHandler and effectJson.events[fx] then
        self._eventHandler(effectJson.events[fx], self._frameIndex, self)
    end

    if self._frameIndex == nil then 
        return false
    end

    self._frameIndex = self._frameIndex + 1

    if(self.gotoPlayData and self._frameIndex >= self.gotoPlayData.max) then
        if(self.gotoPlayData.isRepeat) then
            self._frameIndex = self.gotoPlayData.min;
        else
            self:unscheduleUpdate()
            if(self.gotoPlayData.callBack) then
                self.gotoPlayData.callBack();
            end
            self.gotoPlayData = nil;
        end
        
        return self.gotoPlayData.isRepeat
    else
        if effectJson.events[fx] == "forever" then
            self._frameIndex = 1
        elseif effectJson.events[fx] == "finish" then
            self:unscheduleUpdate()
            return false
        end
    end
    return true
end

function EffectGfxNode:_stepSub(key, frameIndex)
    local lastFrameStart = self._subLastStartFrame[key]
    local playingSub = self._playingSublayers[key]
    local subInfo = self._effectJson[key]
    local fx = "f" .. frameIndex

    -- local function removeSubNode()
    --     if subInfo[fx] and subInfo[fx].remove then
    --         if playingSub == nil then
    --             debugPrint("??" .. tostring(lastFrameStart) .."," .. fx .. "," .. key)
    --         else
    --             lastFrameStart = nil
    --             EffectHelper.deleteSub(key,  playingSub )
    --             self._poolSublayers[key] = playingSub
    --             self._playingSublayers[key] = nil
    --             self._subLastStartFrame[key] = nil
    --         end
    --         return true
    --     end
    --     return false
    -- end

    if lastFrameStart or subInfo[fx] then
        -- if removeSubNode() == true then
        --     return
        -- end
        if subInfo[fx] and subInfo[fx].remove then 
            if  playingSub == nil then 
            else
                lastFrameStart = nil 
                EffectHelper.deleteSub(key, playingSub)
                self._poolSublayers[key] = playingSub
                self._playingSublayers[key] = nil
                self._subLastStartFrame[key] = nil
            end
            return true
        end

        if subInfo[fx] then 
            self._subLastStartFrame[key] = frameIndex 
            lastFrameStart = frameIndex
        end
        
        if lastFrameStart == frameIndex then
            if not playingSub then
                if self._poolSublayers[key] then
                    playingSub = self._poolSublayers[key]
                    playingSub:setVisible(true)
                else
                    local parentNode = self:_getParentNode(subInfo)
                    playingSub = EffectHelper.createSub(self,parentNode, key, subInfo, fx)
                end
                self._playingSublayers[key] = playingSub
                --if this is graphics sub, and it has firstFrame attr, need to step it n frames
                if isTypeOfEffectGfxNode(playingSub) and subInfo['first_frame'] then
                    playingSub:gotoAndStop(subInfo['first_frame'])
                end
                if self:isPlaying() and isTypeOfEffectGfxNode(playingSub) then
                    playingSub:play()
                end
            end

            if not playingSub then
                logError("??!!!!!!!!!!" .. ",impossible ..playingsub is nil " .. fx .. "," .. key)
                return
            end

            --这里的createSprite不是如字面那样创建sprite了，而是setSpriteFrame了
            local start = subInfo[fx].start
            if start.png and start.png ~= "" then 
                EffectHelper.spriteGetter(self,start.png, playingSub, key)
            end

            EffectController.keyUpdate(playingSub, subInfo, frameIndex)
        else
            EffectController.keyInterUpdate(playingSub, subInfo,frameIndex, lastFrameStart)
        end
    end
end

function EffectGfxNode:_getParentNode(subInfo)
    local parentNode = self._rootNode
    if subInfo.mask then
        --这是被遮罩                
        parentNode = self:_getMaskParent(subInfo.mask)
    elseif subInfo.mask_info then
        -- 这是遮罩的stencil层
        parentNode = self:_getMaskStencil(key)
    end
    return parentNode
end


function EffectGfxNode:_getMaskParent(key)
    local effectJson = self._effectJson
    local node = self._maskNodes[key]
    if node ==nil then
        local maskInfo = effectJson[key]
        node  = CCClippingNode:create()   
        
        self._rootNode:addChild(node, maskInfo.order)
        self._maskNodes[key] = node

    end
    return node

end


function EffectGfxNode:_getMaskStencil(key)
    local effectJson = self._effectJson

    local node = self._maskStencilNodes[key]
    if node ==nil then

        local maskInfo = effectJson[key]
        node = display.newNode()
        local parent = self:_getMaskParent(key)
        if parent:getStencil() == nil then
            parent:setStencil(node)

            if maskInfo.mask_info.mask_type ~= "image" then
                --矩形遮罩 或者circle遮罩
            else
                --图形遮罩
                parent:setAlphaThreshold( 0.05 );
            end
        end
        self._maskStencilNodes[key] = node
    end
    return node
end



local function getColorOffset(color)
    return cc.c4f(color.red/255, color.green/255, color.blue/255, color.alpha/255)
end



function EffectGfxNode:onCleanup()
    for k,v in pairs(self._spriteFrames) do
        v:release()
    end
    self._spriteFrames = {}
    self._resourceList = {}
    self._jsonList = {}
    self._poolSublayers = {}
end

--[=================[

    是否自动释放，默认不自动

    @param auto 是否自动释放，boolean

]=================]

function EffectGfxNode:setAutoRelease(auto)

    self._autoRelease = auto

end

--[=================[

    设置颜色偏移，注意这里连所有注册的子节点都要设置

    @param colorOffset 颜色偏移值

]=================]

function EffectGfxNode:setColorOffset(colorOffset)

    for key, sub in pairs(self._playingSublayers) do
        local subColorOffset = sub:getColorOffset()
        sub:setColorOffset(cc.c4f(
            colorOffset.r + subColorOffset.r - self._colorOffset.r,
            colorOffset.g + subColorOffset.g - self._colorOffset.g,
            colorOffset.b + subColorOffset.b - self._colorOffset.b,
            colorOffset.a + subColorOffset.a - self._colorOffset.a
        ))
    end

    self._colorOffset = colorOffset

end

--[=================[

    获得颜色偏移值

    @return colorOffset 颜色偏移值

]=================]

function EffectGfxNode:getColorOffset()

    return self._colorOffset
    
end

function EffectGfxNode:setReOnEnter( ... )
    -- body
    if self:isPlaying() then
        self:scheduleUpdate()
        self:scheduleUpdateWithPriorityLua(handler(self, self._update), 0)
        for k, sub in pairs(self._playingSublayers) do
             if isTypeOfEffectGfxNode(sub) then
                sub:scheduleUpdate()
                sub:scheduleUpdateWithPriorityLua(handler(sub, sub._update))
             end
        end
    end
end

return EffectGfxNode
