local Entity = require("app.fight.Entity")
local Projectile = class("Projectile", Entity)

--
function Projectile:ctor(skillPlay, targets, pos, attackId)
	Projectile.super.ctor(self)
	self._skillPlay = skillPlay
	self._targets = targets
	self._pos = pos
	self._zOrderFix = 4000
	self._attackId = attackId
	self._needRotation = true
end

function Projectile:createActor(path)
    local resId = self._skillPlay.bullet_res_id
    -- print("bullet_res_id = "..resId)
    --local type = self._skillPlay.bullet_res_type    
    self._actor = require("app.fight.views.ProjectileActor").new(resId, 1)
	return self._actor
end
--
function Projectile:onStateFinish(state)
	if state.__cname == "StateProjectileMove" then
		for i,v in ipairs(self._targets) do
			v.unit:hitPlay(self._skillPlay, v.info, nil, true, self._attackId)
		end
		self:remove()
	end
end


function Projectile:start()
	-- local StateMove = require("app.fight.states.StateMove")
    local speed = self._skillPlay.bullet_speed
	local height = self._skillPlay.bullet_curve_height
	local StateProjectileMove = require("app.fight.states.StateProjectileMove")
	local move = StateProjectileMove.new(self, height, speed, self._pos)
	-- local move = StateMove.new(self, self._skillPlay.bullet_type, "effect", speed, self._pos)
	self:addState(move)
end

--
function Projectile:update(f)
	Projectile.super.update(self, f)
end

--
function Projectile:setAction(name, loop)
	self._actor:setAction(name, loop)
end


return Projectile