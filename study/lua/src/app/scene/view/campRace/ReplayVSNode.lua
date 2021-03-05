local ReplayVSNode = class("ReplayVSNode")

local TextHelper = require("app.utils.TextHelper")

function ReplayVSNode:ctor(target, replay, round)
    self._target = target
    self._replay = replay
    self._round = round
    self._nodeUp = nil
    self._nodeDown = nil
    -- self._imageCount = nil
    self._btnLook = nil
    self:_init()
end

function ReplayVSNode:_init()
    self._nodeUp = ccui.Helper:seekNodeByName(self._target, "NodeUp")
    for i = 1, 6 do
        local heroIcon = self._nodeUp:getSubNodeByName("Hero"..i)
        cc.bind(heroIcon,"CommonHeroIcon")
    end
    self._nodeDown = ccui.Helper:seekNodeByName(self._target, "NodeDown")
    for i = 1, 6 do
        local heroIcon = self._nodeDown:getSubNodeByName("Hero"..i)
        cc.bind(heroIcon,"CommonHeroIcon")
    end
    -- self._imageCount = ccui.Helper:seekNodeByName(self._target, "ImageCount")
    self._txtCampCount = ccui.Helper:seekNodeByName(self._target,"TextCampCount")
    self._txtCampCount:setVisible(true)
    self._btnLook = ccui.Helper:seekNodeByName(self._target, "BtnLook")
    cc.bind(self._btnLook, "CommonButtonLevel1Highlight")
    self._btnLook:addClickEventListenerEx(handler(self, self._onWatchClick))

    self:_refreshUI()
end

function ReplayVSNode:_refreshUI()
    if self._replay then
        self:_refreshHeros()
        self._target:setVisible(true)
        self:_refreshPlayer()
        self:_refreshWinPos()
        self:_refreshRound()
        self._btnLook:setString(Lang.get("camp_play_report"))
    else
        self._target:setVisible(false)
    end
end

function ReplayVSNode:_refreshHeros()
    local left, right = self._replay:getHeroInfoList()
    for i, v in pairs(left) do 
        self:_refreshSingleHero(1, i, v)
    end

    for i, v in pairs(right) do 
        self:_refreshSingleHero(2, i, v)
    end
end

function ReplayVSNode:_refreshPlayer()
    local upPlayer = G_UserData:getCampRaceData():getUserByPos(self._replay:getCamp(), self._replay:getPos1())
    local downPlayer = G_UserData:getCampRaceData():getUserByPos(self._replay:getCamp(), self._replay:getPos2())
    local function updatePlayer(node, player, power)
        local textName = ccui.Helper:seekNodeByName(node, "TextName")
        textName:setString(player:getName())
        textName:setColor(Colors.getOfficialColor(player:getOfficer_level()))
        local textPower = ccui.Helper:seekNodeByName(node, "TextPower")
        local strPower = TextHelper.getAmountText3(power)
        textPower:setString(strPower)
    end
    updatePlayer(self._nodeUp, upPlayer, self._replay:getLeft_power())
    updatePlayer(self._nodeDown, downPlayer, self._replay:getRight_power())
end

function ReplayVSNode:_refreshWinPos()
    local nodes = {
        self._nodeUp,
        self._nodeDown,
    }
    local images = {}
    for i = 1, 2 do 
        local winImage = nodes[i]:getSubNodeByName("ImageWin")
        winImage:setVisible(false)
        images[i] = winImage
    end
    local winPos = self._replay:getWin_pos()
    if winPos == self._replay:getPos1() then 
        images[1]:setVisible(true)
    elseif winPos == self._replay:getPos2() then 
        images[2]:setVisible(true)
    end
end

function ReplayVSNode:_refreshRound()
    -- local image = Path.getTextCampRace("txt_camp_bt0"..self._round)
    -- self._imageCount:loadTexture(image)
    self._txtCampCount:setString(Lang.get("camp_round_name_"..self._round))
end

function ReplayVSNode:_refreshSingleHero(camp, pos, heroInfo)
    local node = self._nodeUp
    if camp == 2 then
        node = self._nodeDown 
    end
    local heroId = heroInfo.heroId
    local limitLevel = heroInfo.limitLevel
    local limitRedLevel = heroInfo.limitRedLevel
    local heroIcon = node:getSubNodeByName("Hero"..pos)
    if heroId > 0 then
        heroIcon:updateUI(heroId, nil, limitLevel, limitRedLevel)
        heroIcon:showHeroUnknow(false)
    else
        heroIcon:showHeroUnknow(true)
    end
end

function ReplayVSNode:_onWatchClick()
    G_UserData:getCampRaceData():c2sGetBattleReport(self._replay:getReport_id())
end

return ReplayVSNode