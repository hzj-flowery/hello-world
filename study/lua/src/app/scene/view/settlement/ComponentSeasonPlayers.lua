local ComponentBase = require("app.scene.view.settlement.ComponentBase")
local ComponentSeasonPlayers = class("ComponentSeasonPlayers", ComponentBase)
local CSHelper  = require("yoka.utils.CSHelper")
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")


function ComponentSeasonPlayers:ctor(battleData, position) 
    self._battleData = battleData
    self:setPosition(position)
    ComponentSeasonPlayers.super.ctor(self)
end

function ComponentSeasonPlayers:start()
    ComponentSeasonPlayers.super.start(self)
    self:_createAnim()
end

function ComponentSeasonPlayers:_createCsbNode()
    local panel = CSHelper.loadResourceNode(Path.getCSB("PanelSeasonPlayers", "settlement"))
    self._imageOwnResult = ccui.Helper:seekNodeByName(panel, "ImageOwnResult")
    self._imageOwnSword = ccui.Helper:seekNodeByName(panel, "ImageOwnSword")
    self._imageOwnTitle = ccui.Helper:seekNodeByName(panel, "ImageOwnTitle")
    self._imageOwnStar = ccui.Helper:seekNodeByName(panel, "ImageOwnStar")
    self._textOwnServerId = ccui.Helper:seekNodeByName(panel, "TextOwnServerId")
    self._textOwnPlayerName = ccui.Helper:seekNodeByName(panel, "TextOwnPlayerName")

    self._imageOtherResult = ccui.Helper:seekNodeByName(panel, "ImageOtherResult")
    self._imageOtherSword = ccui.Helper:seekNodeByName(panel, "ImageOtherSword")
    self._imageOtherTitle = ccui.Helper:seekNodeByName(panel, "ImageOtherTitle")
    self._imageOtherStar = ccui.Helper:seekNodeByName(panel, "ImageOtherStar")
    self._textOtherServerId = ccui.Helper:seekNodeByName(panel, "TextOtherServerId")
    self._textOtherPlayerName = ccui.Helper:seekNodeByName(panel, "TextOtherPlayerName")

   
    local ownDanInfo = self._battleData.ownDanInfo
    local otherDanInfo = self._battleData.otherDanInfo
    local leftInfo = {}
    local rightInfo = {}
    if ownDanInfo.isProir then
        leftInfo = ownDanInfo
        rightInfo = otherDanInfo
    else
        leftInfo = otherDanInfo
        rightInfo = ownDanInfo
    end

	if not leftInfo or rawget(leftInfo,"star") == nil then
		return panel
    end
    if not rightInfo or rawget(rightInfo,"star") == nil then
		return panel
	end
    
	if rawget(leftInfo, "officialLevel") == nil or rawget(leftInfo,"star") == 0 then
		return panel
    end
    
    if rawget(rightInfo, "officialLevel") == nil or rawget(rightInfo,"star") == 0 then
		return panel
	end

    local ownColor   =   Colors.getOfficialColor(leftInfo.officialLevel)
    local otherColor =   Colors.getOfficialColor(rightInfo.officialLevel)
    local ownStarInfo = SeasonSportHelper.getDanInfoByStar(leftInfo.star)
    local ownDan = tonumber(SeasonSportHelper.getDanInfoByStar(leftInfo.star).rank_1)
    local otherDan = tonumber(SeasonSportHelper.getDanInfoByStar(rightInfo.star).rank_1)
    local otherStarInfo = SeasonSportHelper.getDanInfoByStar(rightInfo.star)

    self._imageOwnSword:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_DANFLAG[ownDan]))
    self._imageOwnTitle:loadTexture(Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[ownDan]))
    self._imageOwnStar:loadTexture(Path.getSeasonStar(ownStarInfo.name_pic))

    if string.match(leftInfo.sid, "(%a+%d+)") ~= nil then
        local nameStr = (string.match(leftInfo.sid, "(%a+%d+)") ..".")
        self._textOwnServerId:setString(nameStr)
    else
        self._textOwnServerId:setString(leftInfo.sid)
    end
    local targetPosX = (self._textOwnServerId:getPositionX() + self._textOwnServerId:getContentSize().width
                                                             + SeasonSportConst.POSITION_PLAYERNAME_OFFSETX/2)
	self._textOwnPlayerName:setPositionX(targetPosX)
    self._textOwnPlayerName:setString(leftInfo.name)
    self._textOwnPlayerName:setColor(ownColor)

    self._imageOtherSword:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_DANFLAG[otherDan]))
    self._imageOtherTitle:loadTexture(Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[otherDan]))
    self._imageOtherStar:loadTexture(Path.getSeasonStar(otherStarInfo.name_pic))
    
    self._textOtherPlayerName:setString(rightInfo.name)
    self._textOtherPlayerName:setColor(otherColor)

    if string.match(rightInfo.sid, "(%a+%d+)") ~= nil then
        local nameStr = (string.match(rightInfo.sid, "(%a+%d+)") ..".")
        self._textOtherServerId:setString(nameStr)
    else
        self._textOtherServerId:setString(rightInfo.sid)
    end
    local targetPosX = (self._textOtherPlayerName:getPositionX() - self._textOtherPlayerName:getContentSize().width
                                                                 - SeasonSportConst.POSITION_PLAYERNAME_OFFSETX/2)
	self._textOtherServerId:setPositionX(targetPosX)


    if ownDanInfo.isProir then
        if self._battleData.is_win then
            self._imageOwnResult:loadTexture(Path.getTextSignet("txt_shengli01"))
            self._imageOtherResult:loadTexture(Path.getTextSignet("txt_lose01"))
        else
            self._imageOwnResult:loadTexture(Path.getTextSignet("txt_lose01"))
            self._imageOtherResult:loadTexture(Path.getTextSignet("txt_shengli01"))
        end
    else
        if self._battleData.is_win then
            self._imageOtherResult:loadTexture(Path.getTextSignet("txt_shengli01"))
            self._imageOwnResult:loadTexture(Path.getTextSignet("txt_lose01"))
        else
            self._imageOtherResult:loadTexture(Path.getTextSignet("txt_lose01"))
            self._imageOwnResult:loadTexture(Path.getTextSignet("txt_shengli01"))
        end        
    end

    return panel
end

function ComponentSeasonPlayers:_createAnim()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "pingjia" then
            local node = self:_createCsbNode()
            return node
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_win_pingjia", effectFunction, handler(self, self.checkEnd) , false)
end

return ComponentSeasonPlayers
