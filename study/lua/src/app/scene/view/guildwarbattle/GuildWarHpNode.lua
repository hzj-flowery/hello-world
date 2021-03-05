



-- Author: �û�����
-- Date:2018-07-19 15:24:31
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local GuildWarHpNode = class("GuildWarHpNode", ViewBase)
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")


function GuildWarHpNode:ctor(cityId,config)
	self._cityId = cityId
	self._config = config

    self._imageBarBG = nil
    self._barGreen = nil
    self._textPercent = nil
    self._progressRing = nil

	local resource = {
		file = Path.getCSB("GuildWarHpNode", "guildwarbattle"),
		binding = {
		},
	}
	GuildWarHpNode.super.ctor(self, resource)
end

-- Describle：
function GuildWarHpNode:onCreate()
    local clickPointX,clickPointY = self._config.clickPos.x,self._config.clickPos.y --GuildWarDataHelper.decodePoint(self._config.click_point)
	local x,y = self._config.x,self._config.y
	self:setPosition(x,y + 180)
	--self:setPosition(clickPointX,clickPointY- 53) 

    --self:_createProgress()
end



-- Describle：
function GuildWarHpNode:onEnter()
end

-- Describle：
function GuildWarHpNode:onExit()
end


function GuildWarHpNode:syn()
	local nowWarWatch = G_UserData:getGuildWar():getWarWatchById(self._cityId,self._config.point_id)
	local maxHp = self._config.build_hp
	local hp = maxHp
	if  nowWarWatch then
		 hp = nowWarWatch:getWatch_value() 
	end
	self:updateInfo(hp,maxHp)
	self:setVisible(hp > 0 )
end


function GuildWarHpNode:updateInfo(hp,maxHP)
    local percent = math.floor(hp * 100 /maxHP)
    self._barGreen:setPercent(percent)   
	--[[
    self._progressRing:setPercentage(percent/2 + 50)   
	]]
    local strPercent = Lang.get("guildwar_building_hp_percent",{value = percent})
    self._textPercent:setString(strPercent)

end


function GuildWarHpNode:_createProgress()
	local pic = Path.getGuildWar("img_war_com03b")
	self._progressRing = cc.ProgressTimer:create(cc.Sprite:create(pic))
	self._progressRing:setReverseDirection(false)
	local size = self._panelCut:getContentSize()
	self._progressRing:setPosition(size.width*0.5,0)
	self._progressRing:setRotation(90)
     self._panelCut:addChild(self._progressRing)
end


function GuildWarHpNode:getPointId()
	return self._config.point_id
end



return GuildWarHpNode