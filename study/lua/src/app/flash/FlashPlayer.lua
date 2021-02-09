local FlashElement = require("app.flash.FlashElement")
local SchedulerHelper = require("app.utils.SchedulerHelper")
local FlashPlayer = class("FlashPlayer")

local effectDesignInterval = 1/30 -- 动画设计时的FPS速度


--对应参数
-- unit实体， 影子， 动画， 朝向， 通用avatar， 重播， 每次播完的回掉
function FlashPlayer:ctor(entity, shadow, ani, towards, commonAvatar, isLoop, callback)
    self._frame = 0
    self._totalDt = 0
	self._startPosition = cc.p(0, 0)
    
    local str = cc.FileUtils:getInstance():getStringFromFile(ani)
    self._data = json.decode(str)
    assert(self._data, string.format("StateFlash - Load ani json \"%s\" failed", ani))
    self._ani = ani

    self._entity = entity
    local scaleX = self._entity:getScaleX()
    local scaleY = self._entity:getScaleY()

    self._shadow = shadow
    self._towards = towards
    self._commonAvatar = commonAvatar
    self._effects = {}

    self._layers = {}
    for i, v in pairs(self._data.layers) do 
        local layer = FlashElement.new(self, self._towards, v, scaleX, scaleY)
        table.insert(self._layers, layer)
    end

    self._finish = false 
    self._start = false
    self._scheduler = nil
    self._isLoop = isLoop
    self._callback = callback
    self._enableSound = true 
end

function FlashPlayer:setSoundEnable(e)
    self._enableSound = e
end

function FlashPlayer:getStartPosition()
    return self._startPosition
end

function FlashPlayer:start()
    self._start = true
    self._totalDt = 0

    if self._commonAvatar then
        self._commonAvatar:scheduleUpdateWithPriorityLua(handler(self, self._update),0)
    end
    
    --self._scheduler = SchedulerHelper.newSchedule(handler(self,self._update), 0.03)
end

function FlashPlayer:createSymbol(name, extras)
    if name == "body" then 
        return self._entity
    elseif name == "shadow" then 
        return self._shadow
    end

    local effect = nil
    if not extras then 
        effect = self:_createEffect(name, true)
    end
    effect = self:_createEffect(name)
    return effect
end

function FlashPlayer:_createEffect(name, isExtras)
    if not self._commonAvatar then 
        return 
    end
    if self._effects[name] then 
        return self._effects[name]
    end
    local towards = self._towards 
    if isExtras then 
        towards = 1
    end

    local effect = require("yoka.node.SpineNode").new(1)
    local path = Path.getFightEffectSpine(name)
   
    effect:setAsset(path)
    effect.signalComplet:addOnce(function() 
        effect:resetSkeletonPose()
        -- effect:removeSelf()
    end)
    effect:setAnimation("effect")
    effect:setScaleX(towards)
    effect:setCascadeOpacityEnabled(true)
	effect:setCascadeColorEnabled(true)
    self._commonAvatar:addChild(effect)
    effect:setLocalZOrder(self._entity:getLocalZOrder()-1)
    self._effects[name] = effect
    return effect
end

function FlashPlayer:_onFinish()
    self._finish = true

    if self._commonAvatar then 
        self._commonAvatar:setAction("idle", true)
    else 
        self._entity:setAnimation("idle", true)
    end
    if self._commonAvatar then
        self._commonAvatar:unscheduleUpdate()
        self._commonAvatar = nil
    end

    self._entity:setPosition(cc.p(0, 0))
    --self._shadow:setPosition(cc.p(0, 0))

    for i, v in pairs(self._effects) do 
        v:removeSelf()
    end
end

function FlashPlayer:finish()
    self:_onFinish()
end

function FlashPlayer:_update(dt)
    if self._start == true and self._finish == false then
        local events = self._data.events
        local event = events[tostring(self._frame)]
        if event ~= nil then 
            for i, v in ipairs(event) do 
                --只处理播放动作以及声音
                if v.type == "animation" then   
                    if self._commonAvatar then 
                        self._commonAvatar:setAction(v.value1)
                    else 
                        self._entity:setAnimation(v.value1)
                    end
				elseif v.type == "sound" and self._enableSound then
    				G_AudioManager:playSound(Path.getFightSound(v.value1))
				end
            end
        end
    end

    for i, v in ipairs(self._layers) do 
        v:update(self._frame)
    end

    self._totalDt = self._totalDt + dt -- 毫秒
    local frames = math.floor(self._totalDt/effectDesignInterval)
    self._frame = frames
    if self._frame  >= self._data.frameCount then 
        if self._isLoop then
            self._frame = 0 
            self._totalDt = 0
        else
            self:_onFinish()
        end
        if self._callback then 
            self._callback()
        end
    end
end


return FlashPlayer