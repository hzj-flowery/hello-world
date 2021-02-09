--人物移动类
local State = require("app.fight.states.State")
local StateMove = class("StateMove", State)

local Engine = require("app.fight.Engine")

local bezierat = function (a, b, c, d, t)
	return (math.pow(1-t,3) * a +  3*t*(math.pow(1-t,2))*b +  3*math.pow(t,2)*(1-t)*c + math.pow(t,3)*d );
end

local bezierFix = function(posStart, posMid, posEnd, t)
    return (math.pow(1-t,2)*posStart + 2*t*(1-t)*posMid + math.pow(t, 2)*posEnd)
end

local bezierAngle = function(posStart, posEnd, t)
    return posStart + (posEnd - posStart)*t
end

StateMove.TYPE_MOVE = "type_move"
StateMove.TYPE_BEZIER = "type_bezier"

StateMove.BACK_ATTACK = "back_attack"
StateMove.BACK_HIT = "back_hit"
StateMove.ENTER_STAGE = "enter_stage"
StateMove.PETS_ENTER = "pets_enter"

--
function StateMove:ctor(entity, moveType, action, speed, endPosition, back_type, cameraTargetPos) --isback 
	StateMove.super.ctor(self, entity)

	self._bezier = nil
	self._distance = nil
	self._startPosition = nil
	self._endPosition = endPosition
	self._moveType = nil
	if moveType == 1 then
		self._moveType = StateMove.TYPE_MOVE
	elseif moveType == 2 then
		self._moveType = StateMove.TYPE_BEZIER
	elseif moveType == 3 then
	end
    self._elapsed = 0
	self._action = action
	-- print("1112233 move action = ", action, self._entity.stageID)
    self._speed = speed
    self._backType = back_type
	self._cameraTargetPos = cameraTargetPos
    self._callback = nil
    
    if self._backType ~= StateMove.BACK_HIT then
        self._bShowName = false
    end
end

function StateMove:getMoveType()
	return self._moveType
end

function StateMove:setCallback(callback)
	self._callback = callback
end

--
function StateMove:start()
    StateMove.super.start(self)
	--取消合击伙伴等待状态
	local partner = nil
	partner = self._entity._partner
	if partner and self._backType == StateMove.BACK_ATTACK then
		partner:startCombineSkill()
	end

	self._elapsed = 0
	self._distance = nil
	self._bezier = nil
	self._startPosition = cc.p(self._entity:getPosition())

	self._maxDistance = cc.pGetDistance(self._startPosition, self._endPosition)

	-- local time = self._maxDistance/self._speed

	self._positionDelta = cc.pSub(self._endPosition, self._startPosition)
	
	local moveAngle = math.atan2(self._endPosition.y - self._startPosition.y, self._endPosition.x - self._startPosition.x)
	if math.cos(moveAngle) > 0 then
		self._entity:setTowards(1)
	else
		self._entity:setTowards(2)
	end


	if self._moveType == StateMove.TYPE_BEZIER then
		local mp = cc.pMidpoint(self._startPosition, self._endPosition)
		local posY = self._startPosition.y
		if self._endPosition.y > posY then
			posY = self._endPosition.y
		end
		mp.y = posY + 300

		self._bezier = {
	        cc.p(0, 0),
	        cc.pSub(mp, self._startPosition),
	        cc.pSub(self._endPosition,self._startPosition),
	    }
	end

	self._entity:setAction(self._action, true)


	-- --摄像机移动
	if self._cameraTargetPos then
		local isBack = false
		if self._backType == StateMove.BACK_ATTACK then
			isBack = true
		end
		local time = self._maxDistance / self._speed
		local cameraPos = cc.p(self._cameraTargetPos.x, self._cameraTargetPos.y)
		Engine.getEngine():addCameraState(cameraPos, time, isBack)
	end
end

--
function StateMove:getBezierDuration(bezier, duration)
	local xa = 0
    local xb = bezier[1].x
    local xc = bezier[2].x
    local xd = bezier[3].x

    local ya = 0;
    local yb = bezier[1].y
    local yc = bezier[2].y
    local yd = bezier[3].y
    local t = 0
    local dis = 0
    local last = cc.p(0, 0)
    while t < 1 do
    	t = t + 1/30
    	if t < 1 then
    		t = 1
    	end

    	local cur = cc.p(bezierat(xa, xb, xc, xd, t), bezierat(ya, yb, yc, yd, t))
    	dis = dis + cc.pGetDistance(last, cur)
    end
    
    local ti = 1/30/duration
	return math.floor(ti*dis*100) / 100
end

--
function StateMove:getBezierPosition(bezier, t)
    local xa = bezier[1].x
    local xb = bezier[2].x
    local xc = bezier[3].x

    local ya = bezier[1].y
    local yb = bezier[2].y
    local yc = bezier[3].y

    local posx1 = bezierAngle(xa, xb, t) 
    local posy1 = bezierAngle(ya, yb, t)
    local posx2 = bezierAngle(xb, xc, t)
    local posy2 = bezierAngle(yb, yc, t)

    local angle = math.atan2(posy2-posy1, posx2-posx1)
    local angleRet = -math.floor(angle*180/3.14)

    return bezierFix(xa, xb, xc, t), bezierFix(ya, yb, yc, t), angleRet
end

--
function StateMove:update(f)
	if self._start and self._finish == false then
		if self._distance == nil then
			self._distance = 0
		else
			self._distance = self._distance + self._speed
		end

		local t = self._distance / self._maxDistance
		t = t > 1 and 1 or t

		--
		local height = 0
		local newPos = cc.pAdd(self._startPosition, cc.pMul(self._positionDelta, t))
		if self._moveType == StateMove.TYPE_BEZIER then
            local posx, posy, angle = self:getBezierPosition(self._bezier, t)
			local p = cc.pAdd(self._startPosition, cc.p(posx, posy))
			height = p.y - newPos.y
			if self._entity:needRotation() then
				self._entity:setTowards(1)
            	self._entity:setRotation(angle)
			end
		end

		self._entity:setPosition(newPos.x, newPos.y)
		self._entity:setHeight(height)
		-- if self._entity.stageID == 104 then
		-- 	print("1112233 entity now pos = ", newPos.x, newPos.y)
		-- end
        if t == 1 then
			self:onFinish()
		end
	end
end

--
function StateMove:onFinish()
	-- if self._backType == StateMove.ENTER_STAGE then
        -- self._entity.signalStartCG:dispatch("enterStage")
        -- 分发进场放到wait里面去，配合金将入场表现
	-- end
	if self._backType == StateMove.BACK_HIT then
		
	end
	if self._backType == StateMove.BACK_ATTACK then
		self._entity:setAction("idle", true)
		if self._entity.isPet then 
			self._entity:fade(false)
		end
	end
	if self._callback then
		self._callback()
	end
	self._entity:setTowards(self._entity.camp)
	StateMove.super.onFinish(self)

end


return StateMove