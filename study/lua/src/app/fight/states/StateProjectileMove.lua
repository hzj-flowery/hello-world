--子弹移动类
local State = require("app.fight.states.State")
local StateProjectileMove = class("StateProjectileMove", State)

local bezierat = function (a, b, c, d, t)
	return (math.pow(1-t,3) * a +  3*t*(math.pow(1-t,2))*b +  3*math.pow(t,2)*(1-t)*c + math.pow(t,3)*d );
end

local bezierFix = function(posStart, posMid, posEnd, t)
    return (math.pow(1-t,2)*posStart + 2*t*(1-t)*posMid + math.pow(t, 2)*posEnd)
end

local bezierAngle = function(posStart, posEnd, t)
    return posStart + (posEnd - posStart)*t
end

StateProjectileMove.speedChange = 0.5

--
function StateProjectileMove:ctor(entity, height, speed, endPosition)
	StateProjectileMove.super.ctor(self, entity)
	self._bezier = nil
	self._distance = nil
	self._startPosition = nil
	self._endPosition = endPosition
    self._speed = speed
    self._height = height
end

--
function StateProjectileMove:start()
	StateProjectileMove.super.start(self)

	self._distance = nil
	self._bezier = nil
	self._startPosition = cc.p(self._entity:getPosition())

	self._maxDistance = cc.pGetDistance(self._startPosition, self._endPosition)
    self._needTurn = false
	-- local time = self._maxDistance/self._speed

	self._positionDelta = cc.pSub(self._endPosition, self._startPosition)
	
	local moveAngle = math.atan2(self._endPosition.y - self._startPosition.y, self._endPosition.x - self._startPosition.x)
	if math.cos(moveAngle) > 0 then
		self._entity:setTowards(1)
    else
        self._needTurn = true
		self._entity:setTowards(2)
	end


    local mp = cc.pMidpoint(self._startPosition, self._endPosition)
    if self._height ~= 0 then
        local posY = self._startPosition.y
        if self._endPosition.y > posY then
            posY = self._endPosition.y
        end
        mp.y = posY + self._height       
    end


    self._bezier = {
        cc.p(0, 0),
        cc.pSub(mp, self._startPosition),
        cc.pSub(self._endPosition,self._startPosition),
    }

    self._entity:setAction("effect", true)  --特效默认动作effect
end

--
function StateProjectileMove:getBezierPosition(bezier, t)
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
function StateProjectileMove:update(f)
	if self._start and self._finish == false then
		if self._distance == nil then
			self._distance = 0
		else
			self._distance = self._distance + self._speed
            self._speed = self._speed + StateProjectileMove.speedChange
		end

		local t = self._distance / self._maxDistance
		t = t > 1 and 1 or t

		--
		local height = 0
		local newPos = cc.pAdd(self._startPosition, cc.pMul(self._positionDelta, t))
        local posx, posy, angle = self:getBezierPosition(self._bezier, t)
        local p = cc.pAdd(self._startPosition, cc.p(posx, posy))
        height = p.y - newPos.y

        if self._needTurn then
            angle = angle - 180
        end
        self._entity:setRotation(angle)

		self._entity:setPosition(newPos.x, newPos.y)
		self._entity:setHeight(height)
		if t == 1 then
			self:onFinish()
		end
	end
end

function StateProjectileMove:onFinish()
    StateProjectileMove.super.onFinish(self)
end


return StateProjectileMove