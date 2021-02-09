--排行榜
local CampRaceRankNode = class("CampRaceRankNode")
local CampRaceRankCell = require("app.scene.view.campRace.CampRaceRankCell")
local CampRaceHelper = require("app.scene.view.campRace.CampRaceHelper")

function CampRaceRankNode:ctor(target)
    self._target = target
    self._imageCountry = nil
    self._imageRankTitle = nil
    self._listRank = nil
    self._textMyPoint = nil
    self._textMyRank = nil
    self._textMyName = nil
    self:_init()
end

function CampRaceRankNode:_init()
    self._imageCountry = ccui.Helper:seekNodeByName(self._target, "ImageCountry")
    self._imageRankTitle = ccui.Helper:seekNodeByName(self._target, "ImageRankTitle")
    self._listRank = ccui.Helper:seekNodeByName(self._target, "ListRank")
    cc.bind(self._listRank, "ScrollView")
    self._listRank:setTemplate(CampRaceRankCell)
    self._listRank:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
    self._listRank:setCustomCallback(handler(self, self._onItemTouch))
    self._textMyPoint = ccui.Helper:seekNodeByName(self._target, "TextMyPoint")
    self._textMyRank = ccui.Helper:seekNodeByName(self._target, "TextMyRank")
    self._textMyName = ccui.Helper:seekNodeByName(self._target, "TextMyName")

    self:_setMyInfo()
    self:_setTitle()
end

function CampRaceRankNode:onEnter()
end

function CampRaceRankNode:onExit()
end

function CampRaceRankNode:_setMyInfo()
    local myName = G_UserData:getBase():getName()
    self._textMyName:setString(myName)
    local myOfficerLevel = G_UserData:getBase():getOfficer_level()
    self._textMyName:setColor(Colors.getOfficialColor(myOfficerLevel)) 
end

function CampRaceRankNode:_setTitle()
    local camp = G_UserData:getCampRaceData():getMyCamp()

    local smallCamps = {4, 1, 3, 2}
	local campSmall = Path.getTextSignet("img_com_camp0"..smallCamps[camp])
    self._imageCountry:loadTexture(campSmall)
    
    local titleEnd = {"", "b", "c", "d"}
    local titleText = Path.getTextCampRace("txt_camp_01"..titleEnd[camp])
    self._imageRankTitle:loadTexture(titleText)
end

function CampRaceRankNode:setRankData(rankData)
    self._rankData = rankData
    self._listRank:clearAll()
    self._listRank:resize(#rankData)
end

function CampRaceRankNode:refreshMyRank()
    local camp = G_UserData:getCampRaceData():getMyCamp()
    local preRankData = G_UserData:getCampRaceData():getPreRankWithCamp(camp)
    local myRank = preRankData:getSelf_rank()
    self._textMyRank:setString(myRank)
    local myPoint = preRankData:getSelf_score()
    self._textMyPoint:setString(myPoint)
end

function CampRaceRankNode:_onItemUpdate(item, index)
    item:updateUI(index+1, self._rankData[ index+1 ] )
end

function CampRaceRankNode:_onItemSelected(item, index)
end

return CampRaceRankNode