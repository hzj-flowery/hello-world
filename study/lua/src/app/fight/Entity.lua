local Entity = class("Entity")
local FightConfig = require("app.fight.Config")
local PrioritySignal = require("yoka.event.PrioritySignal")

--
function Entity:ctor(data)
	self._actor = nil
	self._remove = false
	self._states = {}
	self._scale = {1, 1}
	self._scaleFrame = {1, 1}
	self._scaleLast = {1, 1}
	self._towards = FightConfig.campLeft
	self._position = {0, 0}
	self._positionFrame = {0, 0}
	self._positionLast = {0, 0}

	self._height = 0
	self._heightFrame = 0
	self._heightLast = 0
	self.signalStateFinish = PrioritySignal.new("string")
	self.signalBuff = PrioritySignal.new("string")
	self.signalStartCG = PrioritySignal.new("string")
	self.signalStateWait = PrioritySignal.new("string")

    self._zOrderFix = 0

    self._billBoard = nil	--信息展示牌

	self._needRotation = false
	self._isMotion = true
end

function Entity:needRotation()
	return self._needRotation
end

--
function Entity:createActor(path)
	
end

function Entity:createBillBoard()

end

function Entity:getBillBoard()
    return self._billBoard
end

function Entity:showBillBoard(isShow)
    if self._billBoard then
        self._billBoard:setVisible(isShow)
    end
end

--
function Entity:isRemove()
	return self._remove
end

--
function Entity:remove()
	self._remove = true
end

--
function Entity:getActor()
	return self._actor
end

--
function Entity:addState(state)
    self._states[#self._states+1] = state
    --print("addState = "..state.__cname)
end

--
function Entity:setState(state)
	self:clearState()
    self:addState(state)
end

--
function Entity:clearState()
    if #self._states ~= 0 then 
        if not self._states[#self._states]:isFinish() then
            self._states[#self._states]:onFinish()
        end
    end
	self._states = {}
end

--
function Entity:getState()
	if #self._states > 0 then
		local state = self._states[1]
		return state.__cname
	end

	return ""
end

function Entity:isStateStart(stateName)
	if #self._states > 0 then
		local state = self._states[1]
		if state.__cname == stateName and state:isStart() then
			return true
		end
	end

	return false
end

--
function Entity:onStateFinish(state)
end

--
function Entity:update(f)
	self._positionLast[1] = self._position[1]
	self._positionLast[2] = self._position[2]
	self._scaleLast[1] = self._scale[1]
	self._scaleLast[2] = self._scale[2]
	self._heightLast = self._height
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
function Entity:updateFrame(f)
	if not self._isMotion then
		f = 1
		self._isMotion = true
	end
	if self._positionFrame[1] ~= self._position[1] 
		or self._positionFrame[2] ~= self._position[2] 
		or self._heightFrame ~= self._height then

		self._positionFrame[1] = self._positionLast[1] + (self._position[1] - self._positionLast[1]) * f
		self._positionFrame[2] = self._positionLast[2] + (self._position[2] - self._positionLast[2]) * f
		self._heightFrame = self._heightLast + (self._height - self._heightLast) * f
		if self._actor then
			self._actor:setScale(FightConfig.getScale(self._positionFrame[2]+self._heightFrame))
			self._actor:setLocalZOrder(-checkint(self._positionFrame[2]) + self._zOrderFix)
			self._actor:setPosition((self._positionFrame[1]), (self._positionFrame[2]+self._heightFrame))
		end
	end

	if self._scaleFrame[1] ~= self._scale[1]
		or self._scaleFrame[2] ~= self._scale[2] then
		self._scaleFrame[1] = self._scaleLast[1] + (self._scale[1] - self._scaleLast[1]) * f
        self._scaleFrame[2] = self._scaleLast[2] + (self._scale[2] - self._scaleLast[2]) * f
        if self._actor then
            self._actor:setScale(self._scaleFrame[1], self._scaleFrame[2])
        end
	end
end

--获得zorderfix
function Entity:getZOrderFix()
	return self._zOrderFix
end

--设置zorderfix，合击时把对应武将提前
function Entity:setZOrderFix(zOrder)
    self._zOrderFix = zOrder
    if self._actor then 
        self._actor:setLocalZOrder(-checkint(self._positionFrame[2]) + self._zOrderFix)
    end
end

--
function Entity:getTowards()
	return self._towards
end

--
function Entity:setTowards(t)
	self._towards = t
	if self._actor then
		-- if self.stageID == 102 then
		-- 	print("1112233 set towards",t)
		-- end
		self._actor:setTowards(t)
	end
end

--
function Entity:setScale(x, y)
	self._scale[1] = x
	self._scale[2] = y
end

--
function Entity:getScale()
	return self._scale[1], self._scale[2]
end

--
function Entity:getPosition()
	return self._position[1], self._position[2]
end

--
function Entity:setPosition(x, y)
	self._position[1] = x
	self._position[2] = y
end

--
function Entity:setHeight(height)
	self._height = height
end

--
function Entity:getHeight()
	return self._height
end

--
function Entity:setRotation(r)
    if self._actor then
		self._actor:setRotation(r)
	end
end

--
function Entity:setMotion(motion)
	self._isMotion = motion
end

--获得小伙伴
function Entity:getPartner()
	return nil
end

--给actor赋空值
function Entity:clearActor()
    self._actor = nil
end

return Entity