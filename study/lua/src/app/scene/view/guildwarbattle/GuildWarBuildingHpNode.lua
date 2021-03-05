



-- Author: �û�����
-- Date:2018-07-19 15:24:31
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local GuildWarBuildingHpNode = class("GuildWarBuildingHpNode", ViewBase)
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")


function GuildWarBuildingHpNode:ctor(cityId,config)
	self._cityId = cityId
	self._config = config

    self._imageBarBG = nil
    self._barGreen = nil
    self._textPercent = nil
    self._progressRing = nil

	local resource = {
		file = Path.getCSB("GuildWarBuildingHpNode", "guildwarbattle"),
		binding = {
		},
	}
	GuildWarBuildingHpNode.super.ctor(self, resource)
end

-- Describle：
function GuildWarBuildingHpNode:onCreate()
    local clickPointX,clickPointY = self._config.clickPos.x,self._config.clickPos.y --GuildWarDataHelper.decodePoint(self._config.click_point)
	local x,y = self._config.x,self._config.y
	local hpX,hpY = self._config.hp_x,self._config.hp_y
	self:setPosition(hpX,hpY)
	--self:setPosition(clickPointX,clickPointY- 53) 

    --self:_createProgress()
end



-- Describle：
function GuildWarBuildingHpNode:onEnter()
end

-- Describle：
function GuildWarBuildingHpNode:onExit()
end


function GuildWarBuildingHpNode:syn()
	local nowWarWatch = G_UserData:getGuildWar():getWarWatchById(self._cityId,self._config.point_id)
	local maxHp = self._config.build_hp
	local hp = maxHp
	if  nowWarWatch then
		 hp = nowWarWatch:getWatch_value() 
	end
	self:updateInfo(hp,maxHp)
	self:setVisible(hp > 0 )
end


function GuildWarBuildingHpNode:updateInfo(hp,maxHP)
    local percent = math.floor(hp * 100 /maxHP)
    self._barGreen:setPercent(percent)   
	--[[
    self._progressRing:setPercentage(percent/2 + 50)   
	]]
    local strPercent = Lang.get("guildwar_building_hp_percent",{value = percent})
    self._textPercent:setString(strPercent)

end


function GuildWarBuildingHpNode:_createProgress()
	local pic = Path.getGuildWar("img_war_com03b")
	self._progressRing = cc.ProgressTimer:create(cc.Sprite:create(pic))
	self._progressRing:setReverseDirection(false)
	local size = self._panelCut:getContentSize()
	self._progressRing:setPosition(size.width*0.5,0)
	self._progressRing:setRotation(90)
     self._panelCut:addChild(self._progressRing)
end


function GuildWarBuildingHpNode:getPointId()
	return self._config.point_id
end



return GuildWarBuildingHpNode