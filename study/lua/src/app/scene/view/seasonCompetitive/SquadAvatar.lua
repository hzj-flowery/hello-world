-- @Author panhoa
-- @Date 8.24.2018
-- @Role SquadAvatar

local ViewBase = require("app.ui.ViewBase")
local SquadAvatar = class("SquadAvatar", ViewBase)

function SquadAvatar:ctor()
    self._commonHeroAvatar  = nil   -- avatar
    self._heroId            = nil   -- heroId

    local resource = {
		file = Path.getCSB("SquadAvatar", "seasonCompetitive"),

	}
	SquadAvatar.super.ctor(self, resource)
end

function SquadAvatar:onCreate()
    --
end

function SquadAvatar:onEnter()
    --
end

function SquadAvatar:onExit()
    --
end

-- @Role Update avatar Info
function SquadAvatar:updateUI(heroId, limitLevel)
    --
    self._commonHeroAvatar:updateUI(heroId, "", false, limitLevel)
    self._heroId = heroId
end

-- @Role Show effect
function SquadAvatar:showAvatarEffect(bShow)
    --
    self._commonHeroAvatar:showAvatarEffect(true)
end

-- @Role Scale
function SquadAvatar:setScale(scale)
    --
    self._commonHeroAvatar:setScale(scale)
end

-- @Role Get HeroId
function SquadAvatar:getHeroId()
    --
    return self._heroId
end

-- @Role Play idle
function SquadAvatar:playAnimationNormal()
	-- body
	self._commonHeroAvatar:setAniTimeScale(1)
	self._commonHeroAvatar:setAction("idle", true)
end

-- @Role Set opacity
function SquadAvatar:setOpacity(opacity)
    return self._commonHeroAvatar:setOpacity(opacity)
end

-- @Role
function SquadAvatar:getSpine()
    return self._commonHeroAvatar
end

-- @Role trun
function SquadAvatar:turnBack(bTrue)
    self._commonHeroAvatar:turnBack(bTrue)
end

return SquadAvatar
