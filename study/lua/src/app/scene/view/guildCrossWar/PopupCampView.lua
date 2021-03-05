-- Author: Panhoa
-- Date:
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupCampView = class("PopupCampView", PopupBase)
local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")


function PopupCampView:ctor(cityId)
    self._cityId = cityId
	self._buttonProclaim = nil 
	self._panelBg = nil

	local resource = {
		file = Path.getCSB("PopupCampView", "guildCrossWar"),
		binding = {
			_buttonProclaim = {
				events = {{event = "touch", method = "_onButtonProclaim"}}
			},
		},
	}
	PopupCampView.super.ctor(self, resource)
end

function PopupCampView:onCreate()
	self._panelBg:setTitle(Lang.get("popupTitle"))
	self._panelBg:addCloseEventListener(handler(self, self._onCloseClick))
	self._buttonProclaim:setString(Lang.get("guild_cross_war_camptitle"))
end

function PopupCampView:onEnter()
    self:_refreshCityName()
end

function PopupCampView:onExit()
end

function PopupCampView:_onCloseClick()
    self:closeWithAction()
end

function PopupCampView:_onButtonProclaim()
    local stageInfo = GuildCrossWarHelper.getCurActStage()
    if not stageInfo or stageInfo.stage ~= 1 then
        G_Prompt:showTip(Lang.get("guild_cross_war_campover"))
        return
    end
    G_UserData:getGuildCrossWar():c2sBrawlGuildsStation(self._cityId)
    self:closeWithAction()
end

function PopupCampView:_refreshCityName()
    local config = GuildCrossWarHelper.getWarCfg(self._cityId)
    self._panelBg:setTitle(config.point_name)
end


return PopupCampView