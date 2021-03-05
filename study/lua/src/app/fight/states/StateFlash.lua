--
local Element = class("Element")
local FightConfig = require("app.fight.Config")

--
local function lerpf (src, target, t)
	return (src + t * (target - src))
end

--
function Element:ctor(helper, towards, info)
	self._helper = helper
	self._layerInfo = info
	self._frames = self._layerInfo.frames
	self._name = self._layerInfo.name
	self._entity = nil
	self._lastFrame = nil
	self._towards = towards == FightConfig.campLeft and 1 or -1
end

function Element:getFrameData(f)
	-- body
end

--
function Element:update(f)
	local frame = self._frames[tostring(f)]
	if frame ~= nil then
		--print(frame.id)
		if self._entity == nil then
			self._entity = self._helper:createSymbol(self._name, self._layerInfo.extras)
		end
		local start = self._helper:getStartPosition()
		if self._name == "body_2" then
			start = self._helper:getPartnerStartPosition()
		end
		self._entity:setPosition(start.x + checkint(frame.x*self._towards), start.y + checkint(frame.y))
		if self._name ~= "shadow" then
			if frame.isMotion == false then
				self._entity:setMotion(false)
			end
            self._entity:setHeight(checkint(frame.height))
			self._entity:setRotation(frame.rotation*self._towards)
			self._entity:setScale(frame.scaleX, frame.scaleY)
		end
		self._lastFrame = frame
	end

	if self._lastFrame ~= nil then
		if self._lastFrame.isMotion == true then
			local n = self._lastFrame.id + self._lastFrame.duration
			--print("isMotion = " .. f .. ", n = " .. n)
			local nextFrame = self._frames[tostring(n)]
			if nextFrame then
				local start = self._helper:getStartPosition()
				if self._name == "body_2" then
					start = self._helper:getPartnerStartPosition()
				end
				local t = (f - self._lastFrame.id) / self._lastFrame.duration
				local x = lerpf(self._lastFrame.x, nextFrame.x, t)
				local y = lerpf(self._lastFrame.y, nextFrame.y, t)
				local height = lerpf(self._lastFrame.height, nextFrame.height, t)
				local scaleX = lerpf(self._lastFrame.scaleX, nextFrame.scaleX, t)
				local scaleY = lerpf(self._lastFrame.scaleY, nextFrame.scaleY, t)
				local rotation = lerpf(self._lastFrame.rotation, nextFrame.rotation, t)

				self._entity:setPosition(start.x + checkint(x*self._towards), start.y + checkint(y))
				if self._name ~= "shadow" then
					self._entity:setHeight(checkint(height))
					self._entity:setRotation(rotation*self._towards)
					self._entity:setScale(scaleX, scaleY)
				end	
				--print("isMotion = " .. f)
			end
		end
	end
end

--
function Element:updateFrame(f)
	
end



--
local State = require("app.fight.states.State")
local StateFlash = class("StateFlash", State)
local Engine = require("app.fight.Engine")
--
function StateFlash:ctor(entity, ani)
	StateFlash.super.ctor(self, entity)
	--
	self._frame = 0
	self._startPosition = cc.p(0, 0)
	self._partnerStartPosition = cc.p(0, 0)
	--print("StateFlash = " .. ani)
	local str = cc.FileUtils:getInstance():getStringFromFile(ani)
	self._data = json.decode(str)
    assert(self._data, string.format("StateFlash - Load ani json \"%s\" failed", ani))
    self._ani = ani

	self._layers = {}
	for i,v in ipairs(self._data.layers) do
		local layer = Element.new(self, self._entity.camp, v)
		self._layers[#self._layers + 1] = layer
	end

	self._projectileCount = 0
	local events = self._data.events
	for _, event in pairs(events) do
		for _, v in pairs(event) do
			if v.value2 == "projectile" then
				self._projectileCount = self._projectileCount + 1
			end
		end
    end
end

--
function StateFlash:createSymbol(name, extras)
	if name == "body" then
		return self._entity
	elseif name == "shadow" then
		return self._entity:getShadow()
	elseif name == "body_2" then
		assert(self._entity:getPartner(), "no partner")
		return self._entity:getPartner()
	end

	-- create animation
	if extras and extras == "flip" then
		return Engine.getEngine():createEffect(name, self._entity:getZOrderFix())
	end
	return Engine.getEngine():createEffect(name, self._entity:getZOrderFix(), self._entity:getTowards())
end

--
function StateFlash:start()
	StateFlash.super.start(self)

	self._startPosition = cc.p(self._entity:getPosition())

	local partner = self._entity:getPartner()
	if partner then
		self._partnerStartPosition = cc.p(partner:getPosition())
	end
end

--
function StateFlash:getStartPosition()
	return self._startPosition
end

function StateFlash:getPartnerStartPosition()
	return self._partnerStartPosition
end

--
function StateFlash:update()
	if self._finish == false and self._start == true then

		--事件
        local events = self._data.events
        local event = events[tostring(self._frame)]
		if event ~= nil then
            for i,v in ipairs(event) do
                if v.type == "animation" then
                    self._entity:setAction(v.value1)
				elseif v.type == "animation_2" then
					assert(self._entity:getPartner(), "partner is nil")
					self._entity:getPartner():setAction(v.value1)
				elseif v.type == "hit" then
					self:onHitEvent(v.value2, v.value1, v.value3, v.value4)
                elseif v.type == "damage" then
					self:onDamageEvent(v.value1, v.value2)
				elseif v.type == "sound" then
					local speed = Engine.getEngine():getBattleSpeed()
    				G_AudioManager:playSound(Path.getFightSound(v.value1), speed)
				elseif v.type == "hpbar" then
					if "show" == v.value1 then
						self._entity:showBillBoard(true)
					elseif "hide" == v.value1 then
						self._entity:showBillBoard(false)
					end
				end
			end
		end

		for i,v in ipairs(self._layers) do
			v:update(self._frame)
		end

		self._frame = self._frame + 1
		if self._frame >= self._data.frameCount then
			self:onFinish()
			self:stop()
		end
	end
end

--
function StateFlash:onHitEvent(hitType, value1, value2, value3)
	
end

--
function StateFlash:onDamageEvent()
	
end

return StateFlash