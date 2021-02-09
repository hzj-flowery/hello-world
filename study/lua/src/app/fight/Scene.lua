local FightScene = class("FightScene", function()
	return cc.Node:create()
end)

function FightScene:ctor(background)
	self._background = background
	--
	self._position = {0, 0}
	self._positionFrame = {0, 0}
	self._positionLast = {0, 0}
	--
	self._vp = {0.5, 0.5}
	self._vpFrame = {0.5, 0.5}
	self._vpLast = {0.5, 0.5}
	--
	self._scale = {0, 0}
	self._scaleFrame = {0, 0}
	self._scaleLast = {0, 0}
	--
	self._states = {}

	--
	self._backContaienr = cc.Node:create()
	self._backContaienr:setAnchorPoint(cc.p(0.5, 0.5))

	self:addChild(self._backContaienr)

	--
	self._contaienr = cc.Node:create()
	self:addChild(self._contaienr)

	self._viewContaienr = cc.Node:create()
	self._viewContaienr:setAnchorPoint(cc.p(0.5, 0.5))
	local size = G_ResolutionManager:getDesignCCSize()
	self._viewContaienr:setContentSize(size)
	self._contaienr:addChild(self._viewContaienr)

	--
	self._view = require("app.fight.scene.SceneView").new()
	self._viewContaienr:addChild(self._view)
	self._view:setPosition(G_ResolutionManager:getDesignCCPoint())
	self._view:resetScene(self._background)

	--
	self._frontContaienr = cc.Node:create()

	self:addChild(self._frontContaienr)

	--
	self._viewport = require("app.fight.scene.Viewport").new(self, size.width, size.height)

	local PrioritySignal = require("yoka.event.PrioritySignal")
	self.signalStateFinish = PrioritySignal.new("string")
end

--
function FightScene:getView()
	return self._view
end

--
function FightScene:getFlashGround()
	return self._view:getFlashGround()
end

--
function FightScene:addEntity(entity)
	self._view:addEntityActor(entity)
end

--
function FightScene:removeEntity(entity)
	self._view:removeEntityActor(entity)
end

--
function FightScene:addTipView(view)
	self._view:addTipView(view)
end

--
function FightScene:addEntityByFront(entity)
	self._frontContaienr:addChild(entity)
end

--
function FightScene:removeEntityByFront(entity)
	self._frontContaienr:removeChild(entity)
end

function FightScene:stopFlash()
	self._viewport:stop()
	self._view:getFlashGround():setVisible(false)
	-- self._viewport:setVisible(false)
end



--
function FightScene:shake(ampX, ampY, atteCoef, timeCoef)
	self._view:shake(ampX, ampY, atteCoef, timeCoef)
end

--
function FightScene:tipHit(pos, value, crit)
	local tip = require("app.fight.views.HitTipView").new(value)
	self._view:addViewObject(tip)
	tip:setPosition(pos)
	tip:popup()
end

--
function FightScene:setViewport(pos)
	--计算锚点
	local sx = (pos.x + 568) / 1136
	local sy = (pos.y + 320) / 640
	-- print("FightScene:startViewport = " .. sx .. ", " .. sy)
	--self._viewContaienr:setAnchorPoint(cc.p(sx, sy))
	--self._viewContaienr:setPosition(pos)

	self._vp[1] = sx
	self._vp[2] = sy
end

--获取场景锚点
function FightScene:getViewport()
	local anchorPoint = self._viewContaienr:getAnchorPoint()
	local point = cc.p(1136*anchorPoint.x-568, 640*anchorPoint.y-320)
	return point
end


--
function FightScene:startFlashViewport(id, towards)
	self._viewport:start(id, towards)
end

--
function FightScene:setFlashPosition(x, y)
	self._position[1] = x
	self._position[2] = y
end

--
function FightScene:getFlashPosition()
	return self._position[1], self._position[2]
end

--
function FightScene:setFlashScale(x, y)
	self._scale[1] = x
	self._scale[2] = y
end

--
function FightScene:addState(state)
	self._states[#self._states+1] = state
end

--
function FightScene:setState(state)
	self._states = {}
	self:addState(state)
end

--
function FightScene:clearState()
	self._states = {}
end

--
function FightScene:getState()
	if #self._states > 0 then
		local state = self._states[1]
		return state.__cname
	end

	return ""
end

--
function FightScene:onStateFinish(state)
	if state.isBack then
		self.signalStateFinish:dispatch(state.__cname)
	end
end

--
function FightScene:update(f)
	self._viewport:update(f)
	self._positionLast[1] = self._position[1]
	self._positionLast[2] = self._position[2]

	self._vpLast[1] = self._vp[1]
	self._vpLast[2] = self._vp[2]

	self._scaleLast[1] = self._scale[1]
	self._scaleLast[2] = self._scale[2]

	if #self._states > 0 then
		local state = self._states[1]

		if state:isStart() == false then
			state:start()
		end
		state:update(f)
		if state:isFinish() then
			--print("state "..state.__cname.." is finished")
			table.remove(self._states, 1)
			self:onStateFinish(state)
		end
	end
end

--
function FightScene:updateFrame(f)
	--坐标
	if self._positionFrame[1] ~= self._position[1] 
		or self._positionFrame[2] ~= self._position[2] then

		self._positionFrame[1] = self._positionLast[1] + (self._position[1] - self._positionLast[1]) * f
		self._positionFrame[2] = self._positionLast[2] + (self._position[2] - self._positionLast[2]) * f

		--self._actor:setScale(FightConfig.getScale(self._positionFrame[2]))
		self._contaienr:setPosition((self._positionFrame[1]), (self._positionFrame[2]))
	end

	--锚点-摄像机中心点
	if self._vpFrame[1] ~= self._vp[1]
		or self._vpFrame[2] ~= self._vp[2] then
		self._vpFrame[1] = self._vpLast[1] + (self._vp[1] - self._vpLast[1]) * f
		self._vpFrame[2] = self._vpLast[2] + (self._vp[2] - self._vpLast[2]) * f
		self._viewContaienr:setAnchorPoint(cc.p(self._vpFrame[1], self._vpFrame[2]))
	end

	--缩放
	if self._scaleFrame[1] ~= self._scale[1]
		or self._scaleFrame[2] ~= self._scale[2] then
		self._scaleFrame[1] = self._scaleLast[1] + (self._scale[1] - self._scaleLast[1]) * f
		self._scaleFrame[2] = self._scaleLast[2] + (self._scale[2] - self._scaleLast[2]) * f
		self._contaienr:setScale(self._scaleFrame[1], self._scaleFrame[2])
	end
end

--增加cameramove状态
function FightScene:addCameraState(targetPos, time, isBack)
	local stateCamera = require("app.fight.scene.StateCamera").new(targetPos, time, isBack)
	self:addState(stateCamera)
end

--掉落
function FightScene:addDropItem(stageId, awards)
	self._view:addDrop(stageId, awards)	
end

function FightScene:changeBG(name)
	self._view:resetScene(name)
end

return FightScene