
-- Author: �û�����
-- Date:2018-07-19 15:24:31
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local GuildWarBuildingNode = class("GuildWarBuildingNode", ViewBase)
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")


function GuildWarBuildingNode:ctor(zorderHelepr,cityId,config)
	self._zorderHelepr = zorderHelepr
	self._cityId = cityId
	self._config = config
	self._warWatch = clone( G_UserData:getGuildWar():getWarWatchById(self._cityId,self._config.point_id)
	) 
	self._imagePoint = nil  --ImageView


	self._GuildWarBuildingHpNode = nil

	local resource = {
		file = Path.getCSB("GuildWarBuildingNode", "guildwarbattle"),

	}
	GuildWarBuildingNode.super.ctor(self, resource)
end

-- Describle：
function GuildWarBuildingNode:onCreate()



	local x,y = self._config.x,self._config.y
	self:setPosition(x,y)
	self._imagePoint:ignoreContentAdaptWithSize(true)
	self._imagePoint:loadTexture(Path.getGuildWar(self._config.city_pic ))
	


	self:setLocalZOrder(self._zorderHelepr:getZOrder(x,y))
end



-- Describle：
function GuildWarBuildingNode:onEnter()
end

-- Describle：
function GuildWarBuildingNode:onExit()
end


function GuildWarBuildingNode:syn()
	local nowWarWatch = G_UserData:getGuildWar():getWarWatchById(self._cityId,self._config.point_id)

	local maxHp = self._config.build_hp
	local hp = maxHp
	local oldHp = maxHp
	if self._warWatch  then
		oldHp = self._warWatch:getWatch_value() 
	end
	if  nowWarWatch then
		 hp = nowWarWatch:getWatch_value() 
	end

	if hp <= 0 then
		self._imagePoint:loadTexture(Path.getGuildWar(self._config.city_pic_break ))--破损图片
	else	
		self._imagePoint:loadTexture(Path.getGuildWar(self._config.city_pic ))--破损图片	
	end

	self._warWatch = nowWarWatch--clone(nowWarWatch)
end


--做受击动作
function GuildWarBuildingNode:doHitAction()
	
end

function GuildWarBuildingNode:stopHitAction()
end

function GuildWarBuildingNode:getPointId()
	return self._config.point_id
end



return GuildWarBuildingNode