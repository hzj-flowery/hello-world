-- @Author panhoa
-- @Date 8.1.2019
-- @Role

local ViewBase = require("app.ui.ViewBase")
local warringHurtHP = class("warringHurtHP", ViewBase)


function warringHurtHP:ctor()
    local resource = {
		file = Path.getCSB("warringHurtHP", "guildCrossWar"),
	}
	warringHurtHP.super.ctor(self, resource)
end

function warringHurtHP:onCreate()
end

function warringHurtHP:onEnter()
end

function warringHurtHP:onExit()
end

-- @Role	Update Hurt
-- @Param	
function warringHurtHP:updateUI(hurtNum)
    self["_hurtNum"]:setString(hurtNum)
end



return warringHurtHP