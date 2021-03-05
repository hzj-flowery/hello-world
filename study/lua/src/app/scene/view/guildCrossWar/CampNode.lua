-- @Author panhoa
-- @Role
-- @Date 10.12.2019

local ViewBase = require("app.ui.ViewBase")
local CampNode = class("CampNode", ViewBase)
local GuildCrossWarHelper = import(".GuildCrossWarHelper")


function CampNode:ctor(pointId)
    self._pointId = pointId

    local resource = {
		file = Path.getCSB("CampNode", "guildCrossWar"),
	}
	CampNode.super.ctor(self, resource)
end

function CampNode:onCreate()
    self:_createBlink()
    self:_registerEvent()
end

function CampNode:onEnter()
end

function CampNode:onExit()
end

-- @Role    Create Blink
function CampNode:_createBlink( ... )
    -- body
    local UIActionHelper = require("app.utils.UIActionHelper")
	UIActionHelper.playBlinkEffect(self._resource, {opacity1 = 200, opacity2 = 255})
end

-- @Role    Camp Click
function CampNode:_registerEvent( ... )
    self._camption:addClickEventListenerEx(function( ... )
        -- body
        local __, isJoin = GuildCrossWarHelper.isGuildCrossWarEntry()
        if not isJoin then
            G_Prompt:showTip(Lang.get("guild_cross_war_deputyanull"))
            return
        end
        if not G_UserData:getGuild():_isDeputyAbovePosition() then
            G_Prompt:showTip(Lang.get("guild_cross_war_deputyabove"))
            return
        end

        local PopupCampView = require("app.scene.view.guildCrossWar.PopupCampView")
        local popupCampView = PopupCampView.new(self._pointId)
        popupCampView:openWithAction()
    end)
end



return CampNode