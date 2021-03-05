local StateCamera = class("StateCamera")
local Engine = require("app.fight.Engine")

function StateCamera:ctor(targetViewport, time, isback)
    self._targetViewport = targetViewport                   --目标锚点
    self._startViewport = Engine.getEngine():getViewport()   --开始锚点
    self._maxDistance = nil     --最大距离
    self._positionDelta = nil   --距离delta
    self._distance = nil        --当前距离
    self._scene = scene         --场景
    self._time = time           --到达时间
    self._speed = nil           --速度
    self.isBack = isback        --是否是回来的时候
    
    self._finish = false        
    self._start = false
end

--
function StateCamera:start()
    self._start = true
	self._maxDistance = cc.pGetDistance(self._startViewport, self._targetViewport)
	self._positionDelta = cc.pSub(self._targetViewport, self._startViewport)
    self._speed = self._maxDistance/self._time
end

--
function StateCamera:update(f)
	if self._start and self._finish == false then
		if self._distance == nil then
			self._distance = 0
		else
			self._distance = self._distance + self._speed
		end
		
		local t = self._distance / self._maxDistance
		t = t > 1 and 1 or t

        -- print("state camera time = ",t)
		--
		local viewport = cc.pAdd(self._startViewport, cc.pMul(self._positionDelta, t))
        if viewport then
            Engine.getEngine():setViewport(viewport)
        end

		if t == 1 then
			self:onFinish()
		end
	end
end

function StateCamera:onFinish()
    self._finish = true
    if self._targetViewport.x == 0 and self._targetViewport.y == 0 then
        local Engine = require("app.fight.Engine")
        local view = Engine.getEngine():getView()
        view:showSkill3Layer(false)       
    end
end

function StateCamera:isFinish()
    return self._finish
end

function StateCamera:isStart()
    return self._start
end

return StateCamera