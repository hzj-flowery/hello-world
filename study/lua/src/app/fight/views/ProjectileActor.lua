local ProjectileActor = class("ProjectileActor", function()
	return cc.Node:create()
end)

local FightConfig = require("app.fight.Config")
local Path = require("app.utils.Path")
--
function ProjectileActor:ctor(name, type)
    if type == 1 then
	-- action
		local spine = require("yoka.node.HeroSpineNode").new()
    	spine:setScale(FightConfig.SCALE_ACTOR)
	    self._animation = require("app.fight.views.Animation").new(spine)
	    self:addChild(self._animation)
	    self._animation:setAsset(Path.getFightEffectSpine(name))
    elseif type == 2 then
        
    end
end

--
function ProjectileActor:setAction(name, loop)
	self._animation:setAnimation(name, loop, true)
end

--
function ProjectileActor:setTowards(towards)
    --print("effectTowards = "..towards)
    self._animation:setScaleX(towards == FightConfig.campLeft and 1 or -1)
end

return ProjectileActor