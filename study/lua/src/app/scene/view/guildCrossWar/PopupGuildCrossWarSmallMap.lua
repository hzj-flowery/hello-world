local PopupBase = require("app.ui.PopupBase")
local PopupGuildCrossWarSmallMap = class("PopupGuildCrossWarSmallMap", PopupBase)
local GuildCrossWarConst = require("app.const.GuildCrossWarConst")
local GuildCrossWarHelper = import(".GuildCrossWarHelper")
local UTF8 = require("app.utils.UTF8")
local scheduler = require("cocos.framework.scheduler")


function PopupGuildCrossWarSmallMap:ctor()
    self._imageMapBG    = nil --背景图

	local resource = {
		file = Path.getCSB("PopupGuildCrossWarSmallMap", "guildCrossWar"),
	}
	PopupGuildCrossWarSmallMap.super.ctor(self, resource, false, false)
end

function PopupGuildCrossWarSmallMap:onCreate()
    self._buttonClose:addClickEventListenerEx(handler(self, self._onClickButton))
end

function PopupGuildCrossWarSmallMap:_onClickButton( sender )
	self:close()
end

function PopupGuildCrossWarSmallMap:onEnter()
    G_UserData:getGuildCrossWar():c2sBrawlGuildsMap()
    
    self:_updateCityOccupied()
    self:scheduleUpdateWithPriorityLua(handler(self, self._update), 0)
end

function PopupGuildCrossWarSmallMap:onExit()
    self:unscheduleUpdate()
end

function PopupGuildCrossWarSmallMap:updateSelf(selfPosX, selfPosY )
    GuildCrossWarHelper.updateSelfNode(self._imageMapBG, selfPosX, selfPosY, false)
end

function PopupGuildCrossWarSmallMap:updateSelfGuildNumber(userList)
    GuildCrossWarHelper.updateSelfGuildMemeber(self._imageMapBG, userList)
end

-- @Role    Update Occupied-City
function PopupGuildCrossWarSmallMap:_updateGuildFlag(pointData, key, value)
    local pointOccupied = self["_imageMapBG"]:getChildByName("guildFlag" ..key)
    if pointOccupied == nil then
        pointOccupied = GuildCrossWarHelper.createGuildFlag(key)
        pointOccupied:setName("guildFlag" ..key)
        pointOccupied:setPosition(cc.p(pointData.name_x * GuildCrossWarConst.CAMERA_SCALE_SMALL, 
                                        pointData.name_y * GuildCrossWarConst.CAMERA_SCALE_SMALL))
        self["_imageMapBG"]:addChild(pointOccupied, 10000)
    end

    if value:getGuild_id() > 0 and value:getGuild_name() ~= "" then 
        pointOccupied:setVisible(true)
    else
        pointOccupied:setVisible(false)
    end

    GuildCrossWarHelper.updateGuildFlag(pointOccupied, key, value)
    GuildCrossWarHelper.updateGuildName(pointOccupied, key, value)
    GuildCrossWarHelper.updateServerName(pointOccupied, key, value)
end

-- @Role    Update Fight-City
function PopupGuildCrossWarSmallMap:_updateFightFlag(pointData, key, value)
    if pointData.type == 2 then
        local pointFight = self["_imageMapBG"]:getChildByName("fightFlag" ..key)
        if pointFight == nil then
            pointFight = GuildCrossWarHelper.createFightFlag(key)
            pointFight:setName("fightFlag" ..key)
            pointFight:setPosition(cc.p(pointData.name_x * GuildCrossWarConst.CAMERA_SCALE_SMALL, 
                                        pointData.name_y * GuildCrossWarConst.CAMERA_SCALE_SMALL))
            self["_imageMapBG"]:addChild(pointFight, 10000)
        end
        pointFight:setVisible(value:getHp() ~= 0 and value:getHp() ~= value:getMax_hp())
    end
end

-- @Role    Update Occupied-City
function PopupGuildCrossWarSmallMap:_updateCityOccupied()
    local pointMap = G_UserData:getGuildCrossWar():getCityMap()
    for key, value in pairs(pointMap) do
        local pointData = GuildCrossWarHelper.getWarCfg(key)
        self:_updateGuildFlag(pointData, key, value)
        self:_updateFightFlag(pointData, key, value)
    end
end

-- @Role    实时渲染
function PopupGuildCrossWarSmallMap:_update(dt)
    self:_updateCityOccupied()
end


return PopupGuildCrossWarSmallMap
