



local ViewBase = require("app.ui.ViewBase")
local GuildWarUserHpNode = class("GuildWarUserHpNode", ViewBase)
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")



local HP_IMGS = {
    "img_war_member03e",
    "img_war_member03e",
    "img_war_member03e",
    "img_war_member03e",
    "img_war_member03e",
    "img_war_member03e",
    "img_war_member03d",
    "img_war_member03c",
    "img_war_member03b",
    "img_war_member03a",
}

function GuildWarUserHpNode:ctor()

    self._textPercent = nil
    self._imagePercent = nil

    
    self._colorProgress = nil

	local resource = {
		file = Path.getCSB("GuildWarUserHpNode", "guildwarbattle"),

	}
	GuildWarUserHpNode.super.ctor(self, resource)
end

function GuildWarUserHpNode:onCreate()
    self._imagePercent:ignoreContentAdaptWithSize(true)
end



-- Describle：
function GuildWarUserHpNode:onEnter()
end

-- Describle：
function GuildWarUserHpNode:onExit()
end


function GuildWarUserHpNode:updateInfo(hp,maxHP)
    local percent = math.floor(hp * 100 /maxHP)
  --  print("GuildWarUserHpNode ------------------ ",hp)
  
    if hp <= 0 then
        self._imagePercent:setVisible(false)
    else
        self._imagePercent:setVisible(true)
        self._imagePercent:setScaleX(percent*0.01)
    end
--[[
    self._colorProgress:setPercent(percent,false)
]]
    --local strPercent = Lang.get("guildwar_building_hp_percent",{value = percent})
    --self._textPercent:setString(strPercent)
end


return GuildWarUserHpNode