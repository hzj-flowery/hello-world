-- @Author panhoa
-- @Role
-- @Date 7.11.2019

local ViewBase = require("app.ui.ViewBase")
local CityNode = class("CityNode", ViewBase)
local GuildCrossWarHelper = import(".GuildCrossWarHelper")


function CityNode:ctor(pointId)
    self._btnCity = nil
    self._pointId = pointId     -- 据点Id

    local resource = {
		file = Path.getCSB("CityNode", "guildCrossWar"),
	}
	CityNode.super.ctor(self, resource)
end

function CityNode:onCreate()
    self:_initPosition()
    self._imageProc:setGlobalZOrder(100)
    self._monsterBlood2:setGlobalZOrder(100)
    self._monsterBlood1:setGlobalZOrder(100)
    self._percentText:setGlobalZOrder(100)
    self._occupiedImage:setGlobalZOrder(100)
    self._commonGuildFlag:setGlobalZOrder(100)
    self._cityName:setGlobalZOrder(100)
    
    self._cityName:setSwallowTouches(false)
    self._imageProc:setSwallowTouches(false)
    self._occupiedImage:setSwallowTouches(false)
    self["_monsterBlood1"]:setSwallowTouches(false)
    self["_monsterBlood2"]:setSwallowTouches(false)

    self._cityData = {
        serverId = "",
        guildName ="",
        curHp = 0
    }
end

function CityNode:onEnter()
end

function CityNode:onExit()
end

function CityNode:_initPosition( ... )
    local pos = GuildCrossWarHelper.getWarMapGridCenter(GuildCrossWarHelper.getWarCfg(self._pointId).boss_place)
    if pos == nil then
        return
    end
    self:setPosition(pos)
end

function CityNode:updateUI(picture)
    self._btnCity:loadTextureNormal(Path.getGuildCrossCity(picture))
    self._cityName:loadTexture(Path.getTextGuildCross("img_guild_cross_war_city" ..self._pointId))
    self._cityName:ignoreContentAdaptWithSize(true)
end

-- @Role    Update Cur's HP
function CityNode:_updateHp(unitData)
    if unitData == nil then
        self._imageProc:setVisible(false)
        return
    end

    if self._cityData.curHp == unitData:getHp() then
        return
    end

    self._cityData.curHp = unitData:getHp()
    local percent = string.format("%.2f", (100 * unitData:getHp() / unitData:getMax_hp()))
    if unitData:getHp() > 0 then
        self._percentText:setString(unitData:getHp() .."/" ..unitData:getMax_hp())
        self._imageProc:setVisible(true)
    else
        percent = 0
        self._percentText:setString(" ")
        self._imageProc:setVisible(false)
    end

    local percentNum = tonumber(percent) or 0
    self["_monsterBlood1"]:setPercent(percentNum)
    self["_monsterBlood2"]:setPercent(percentNum)
    self["_monsterBlood1"]:setVisible(not unitData:isSelfGuild())
    self["_monsterBlood2"]:setVisible(unitData:isSelfGuild())
end

-- @Role    Update Cur's Possession
function CityNode:updatePossession()
    local pointUnit = G_UserData:getGuildCrossWar():getCityDataById(self._pointId)
    if pointUnit ~= nil and pointUnit:getSname() ~= "" then
        self._occupiedImage:setVisible(true)
        self._commonGuildFlag:setVisible(true)

        if self._cityData.guildName ~= pointUnit:getGuild_name() then
            self._cityData.guildName = pointUnit:getGuild_name()
            self._commonGuildFlag:updateUI(pointUnit:getGuild_level(), pointUnit:getGuild_name())
        end
    else
        self._occupiedImage:setVisible(false)
        self._commonGuildFlag:setVisible(false)
    end

    self:_updateHp(pointUnit)

    if pointUnit and self._cityData.serverId ~= pointUnit:getSname() then
        self._cityData.serverId = pointUnit:getSname()
        self._occupiedNode:removeAllChildren()
        local richText = ccui.RichText:createRichTextByFormatString(
            self._cityData.serverId,
            {defaultColor = Colors.DARK_BG_THREE, defaultSize = 22, other ={[1] = {fontSize = 22}
        }})
        richText:setGlobalZOrder(100)
        self._occupiedNode:addChild(richText)
    end
end



return CityNode