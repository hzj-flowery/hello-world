--8强季后赛
local ViewBase = require("app.ui.ViewBase")
local CampRacePlayOff = class("CampRacePlayOff", ViewBase)

local CSHelper  = require("yoka.utils.CSHelper")
local SchedulerHelper = require ("app.utils.SchedulerHelper")
local CampRaceHelper = require("app.scene.view.campRace.CampRaceHelper")
local FunctionConst = require("app.const.FunctionConst")
local CampRaceConst = require("app.const.CampRaceConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local TextHelper = require("app.utils.TextHelper")
local PopupSystemAlert = require("app.ui.PopupSystemAlert")
local CampRacePlayerInfoNode = require("app.scene.view.campRace.CampRacePlayerInfoNode")

function CampRacePlayOff:ctor(sceneId)
    sceneId = sceneId or 2
	local resource = {
		file = Path.getCSB("CampRacePlayOff", "campRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
            _btnBest8 = {
				events = {{event = "touch", method = "_onBest8Click"}}
            },
            _buttonBet1 = {
                events = {{event = "touch", method = "_onBetClick1"}}
            },
            _buttonBet2 = {
                events = {{event = "touch", method = "_onBetClick2"}}
            },
		}
	}
    CampRacePlayOff.super.ctor(self, resource, sceneId)
end

function CampRacePlayOff:onCreate()
    self:_initData()
    self:_initView()
end

function CampRacePlayOff:_initData()
    self._playerData1 = nil
    self._playerData2 = nil
    self._avatars = {
        [1] = {},
        [2] = {},
    }
    self._index = 0
    self._targetTime = 0
    self._timeOfPerRound = CampRaceHelper.getGameTime(CampRaceConst.STATE_PLAY_OFF)
    self._canEmbattle = true
end

function CampRacePlayOff:_initView()
    for i = 1, 2 do
        self["_playerInfoPanel"..i] = CampRacePlayerInfoNode.new(self["_nodePlayerInfo"..i], i)
        self["_nodePlayerInfo"..i]:setVisible(false)
    end

    self._panelPlayer1:addTouchEventListener(handler(self, self._onTouchEvent))
    self._panelPlayer1:setEnabled(false)

    for i = 1, 2 do
        self["_buttonBet"..i]:setString(Lang.get("camp_bet_btn"))
        local textTip = ccui.RichText:createWithContent(Lang.get("camp_bet_win_award", {count = CampRaceHelper.getBetReward()}))
        local imageSize = self["_imageBetBg"..i]:getContentSize()
        textTip:setPosition(cc.p(imageSize.width/2, imageSize.height/2))
        self["_imageBetBg"..i]:addChild(textTip)
    end

    self._ImageCountBG:setVisible(false)
    cc.bind(self._commonChat,"CommonMiniChat")
    self._btnBest8:updateUI(FunctionConst.FUNC_CAMP_RACE_DATE)

    self._popupCampMap = nil
end

function CampRacePlayOff:onEnter()
    self._signalGetLastRank = G_SignalManager:add(SignalConst.EVENT_GET_LAST_RANK, handler(self, self._onEventGetLastRank)) --8强赛对阵，如果没有比赛就是上次的赛况
    self._signalGetCampRaceFormation = G_SignalManager:add(SignalConst.EVENT_GET_CAMP_RACE_FORMATION, handler(self, self._onEventGetFormation))
    self._signalUpdateCampRaceFormation = G_SignalManager:add(SignalConst.EVENT_UPDATE_CAMP_RACE_FORMATION, handler(self, self._onEventUpdateFormation))
    self._signalAddBattleReport = G_SignalManager:add(SignalConst.EVENT_ADD_RACE_BATTLE_REPORT, handler(self, self._onEventAddBattleReport)) --被广播了战报
    self._signalUpdateState = G_SignalManager:add(SignalConst.EVENT_CAMP_UPDATE_STATE, handler(self, self._onEventUpdateState))
    self._signalCampBetSuccess = G_SignalManager:add(SignalConst.EVENT_CAMP_BET_SUCCESS, handler(self, self._onEventCampBetSuccess))
    self._signalCampUpdateBet = G_SignalManager:add(SignalConst.EVENT_CAMP_UPDATE_BET, handler(self, self._onEventCampUpdateBet))
end

function CampRacePlayOff:onExit()
    self:_stopCountDown()

    self._signalGetLastRank:remove()
    self._signalGetLastRank = nil
    self._signalGetCampRaceFormation:remove()
    self._signalGetCampRaceFormation = nil
    self._signalUpdateCampRaceFormation:remove()
    self._signalUpdateCampRaceFormation = nil
    self._signalAddBattleReport:remove()
    self._signalAddBattleReport = nil
    self._signalUpdateState:remove()
    self._signalUpdateState = nil
    self._signalCampBetSuccess:remove()
    self._signalCampBetSuccess = nil
    self._signalCampUpdateBet:remove()
    self._signalCampUpdateBet = nil
end

function CampRacePlayOff:onShow()
    self._canEmbattle = true
    self._panelDesign:setVisible(true)
    self:_startCountDown()
end

function CampRacePlayOff:onHide()
    self:_stopCountDown()
end

function CampRacePlayOff:updateInfo()
    self._camp = G_UserData:getCampRaceData():findCurWatchCamp()
    G_UserData:getCampRaceData():c2sGetCampRaceLastRank(self._camp)
end

function CampRacePlayOff:_onEventGetLastRank(eventName, camp)
    if self._popupCampMap then
        return
    end
    if G_UserData:getCampRaceData():getStatus() ~= CampRaceConst.STATE_PLAY_OFF then
        return
    end
    if G_UserData:getCampRaceData():getFinalStatusByCamp(camp) == CampRaceConst.PLAY_OFF_ROUND_ALL then
        self:_openPopupMap()
        return
    end

    local curWatchUserId = G_UserData:getCampRaceData():findWatchUserIdWithCamp(camp)
    G_UserData:getCampRaceData():setCurWatchUserId(curWatchUserId)
    G_UserData:getCampRaceData():c2sGetCampRaceFormation(camp, curWatchUserId)
end

function CampRacePlayOff:_onEventGetFormation(eventName, camp)
    self._camp = camp
    self:_updateData()
    self:_updateView()
    G_SignalManager:dispatch(SignalConst.EVENT_CAMP_RACE_UPDATE_TITLE)
end

function CampRacePlayOff:_onEventUpdateFormation(eventName, camp, index)
    if self._camp ~= camp then
        return
    end
    self._playerData1, self._playerData2 = G_UserData:getCampRaceData():getCurMatchPlayersWithCamp(self._camp)
    self:_updateAvatarWithSide(index)
end

function CampRacePlayOff:_updateData()
    self._playerData1, self._playerData2 = G_UserData:getCampRaceData():getCurMatchPlayersWithCamp(self._camp)
    if self._playerData1 and self._playerData1:getWin_num() >= 2 then
        self._playerData2 = nil
    elseif self._playerData2 and self._playerData2:getWin_num() >= 2 then
        self._playerData1 = nil
    end
    local startTime = G_UserData:getCampRaceData():getCurMatchStartTimeWithCamp(self._camp)
    self._targetTime = startTime + self._timeOfPerRound
end

function CampRacePlayOff:_updateView()
    self._textChampionTip:setVisible(false)
    self._panelDesign:setVisible(true)
    self:_updateRound()
    self:_refreshPlayerInfo()
    self._canEmbattle = true
    self:_updateAvatars()
    self:_updateBet()
end

function CampRacePlayOff:_startCountDown()
    self:_stopCountDown()
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._updateCountDown), 1)
    self:_updateCountDown()
end

function CampRacePlayOff:_stopCountDown()
    if self._scheduleHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleHandler)
        self._scheduleHandler = nil
    end
end

function CampRacePlayOff:_updateRound()
    local round = G_UserData:getCampRaceData():getCurMatchRoundWithCamp(self._camp)
    self._textRound:setString(Lang.get("camp_round", {count = round}))
end

function CampRacePlayOff:_updateAvatars()
    for i = 1, 2 do 
        self:_updateAvatarWithSide(i)
    end
end

function CampRacePlayOff:_updateAvatarWithSide(side)
    local playerData = self["_playerData"..side]
    if playerData then
        local formation = playerData:getFormation()
        for index, id in pairs(formation) do
            local hero = playerData:getHeroDataById(id)
            if hero then
                if not self._avatars[side][index] then 
                    local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common")) 
                    self["_panelPlayer"..side]:addChild(avatar, index * 10)
                    self._avatars[side][index] = avatar
                end
                local baseId = hero:getCoverId()
                local limitLevel = hero:getLimitLevel()
                local limitRedLevel = hero:getLimitRedLevel()
                self._avatars[side][index]:updateUI(baseId, nil, nil, limitLevel, nil, nil, limitRedLevel)
                self._avatars[side][index]:setVisible(true)
            else
                if self._avatars[side][index] then
                    self._avatars[side][index]:setVisible(false)
                end
            end
        end
        self:_resetAvatarPos(side)
    else
        self:_setAvatarEmpty(side)
    end
end

function CampRacePlayOff:_setAvatarEmpty(index)
    for i = 1, 6 do 
        if self._avatars[index][i]then
            self._avatars[index][i]:setVisible(false)
        end
    end
end

function CampRacePlayOff:_resetAvatarPos(pos)
    for i = 1, 6 do 
        if self._avatars[pos][i] then
            local posX, posY = self["_panelPlayer"..pos]:getSubNodeByName("ImageKnightPos"..i):getPosition()
            self._avatars[pos][i]:setPosition(cc.p(posX, posY))
            self._avatars[pos][i]:setLocalZOrder(i*10)
        end
    end
    self:_showHighLight(nil)
end

function CampRacePlayOff:_refreshPlayerInfo()
    for i = 1, 2 do
        local playerData = self["_playerData"..i]
        self["_playerInfoPanel"..i]:updateUI(playerData)
        self["_nodePlayerInfo"..i]:setVisible(true)
    end
    if self._playerData1 and self._playerData1:getUid() == G_UserData:getBase():getId() then 
        self._panelPlayer1:setEnabled(true)
        self._textTip:setVisible(true)
    else 
        self._panelPlayer1:setEnabled(false)
        self._textTip:setVisible(false)
    end
end

function CampRacePlayOff:_showHighLight(index)
    for i = 1, 6 do 
        local panel = self._panelPlayer1:getSubNodeByName("ImageKnightPos"..i)
        local image = panel:getSubNodeByName("ImageHighLight")
        if i == index then 
            image:setVisible(true)
        else 
            image:setVisible(false)
        end
    end
end

function CampRacePlayOff:_getIndexSelected(sender)
    local touchPos = sender:getTouchBeganPosition()
    for k, spine in pairs(self._avatars[1]) do
        local location = spine:getSpineHero():convertToNodeSpace(touchPos)
        local rect = spine:getSpineHero():getBoundingBox()
        if cc.rectContainsPoint(rect, location) then
            return k
        end
    end
    return nil
end

function CampRacePlayOff:_getIndexMoveOn(touchPos)
    for i = 1, 6 do 
        local panel = self._panelPlayer1:getSubNodeByName("ImageKnightPos"..i)
        local rect = panel:getBoundingBox()
        if cc.rectContainsPoint(rect, touchPos) then 
            return i 
        end
    end
    return nil
end

function CampRacePlayOff:_checkMoveHighLight(touchPos)
    if self._index == 0 then 
        return 
    end
    local nowIndex = self:_getIndexMoveOn(touchPos)
    self:_showHighLight(nowIndex)
end

function CampRacePlayOff:_moveSpinePos(position)
    local moveNode = self._avatars[1][self._index]  --只能移动左边
    moveNode:setPosition(position)
    moveNode:setLocalZOrder(100)
end

function CampRacePlayOff:_moveCanceled()
    self:_resetAvatarPos(1)
end

function CampRacePlayOff:_moveEnded(endPos)
    local endIndex = self:_getIndexMoveOn(endPos)
    if not endIndex or not self._canEmbattle then
        self:_moveCanceled()
        return
    end
    local embattle = G_UserData:getTeam():getEmbattle()
    for index = 1, 6 do 
        if embattle[index] == endIndex then 
            embattle[index] = self._index
        elseif embattle[index] == self._index then 
            embattle[index] = endIndex
        end
    end
    G_UserData:getTeam():c2sChangeEmbattle(embattle)
end

function CampRacePlayOff:_recvReport(report)
    local player = self._playerData1
    if not player then 
        return 
    end
    local userPos = player:getPosition(self._camp)
    if report:getCamp() ~= self._camp then
        return
    end
    if userPos == report:getPos1() or userPos == report:getPos2() then
        G_UserData:getCampRaceData():c2sGetBattleReport(report:getReport_id())
        if self._popupCampMap then --如果八强图开着，关掉
            self._popupCampMap:close()
        end
    end
end

function CampRacePlayOff:_onTouchEvent(sender, state)
    if state == ccui.TouchEventType.began then
        local index = self:_getIndexSelected(sender)
        if index and self._canEmbattle then 
            self._index = index
            self:_showHighLight(index)
            local touchPos = self._panelPlayer1:convertToNodeSpace(sender:getTouchBeganPosition())
            self:_moveSpinePos(touchPos)
            return true
        end
        return false
	elseif state == ccui.TouchEventType.moved then
		if self._index ~= 0 then 
			local movePos = self._panelPlayer1:convertToNodeSpace(sender:getTouchMovePosition())
            self:_moveSpinePos(movePos)
            self:_checkMoveHighLight(movePos)
		end
	elseif state == ccui.TouchEventType.ended then
        if self._index ~= 0 then 
            local endPos = self._panelPlayer1:convertToNodeSpace(sender:getTouchEndPosition())
            self:_moveEnded(endPos)
            self._index = 0
		end
    elseif state == ccui.TouchEventType.canceled then
        if self._index ~= 0 then 
            self:_moveCanceled()
            self._index = 0
        end
	end
end

function CampRacePlayOff:_updateCountDown()
    local countDownTime = self._targetTime - G_ServerTime:getTime() - 1
	if countDownTime >= 0 then
		local timeString = G_ServerTime:secToString(countDownTime)
        if countDownTime == 0 then
            timeString = ""
        end
        self._textCount:setString(timeString)
        self._textCount:setVisible(true)
        self._ImageCountBG:setVisible(true)
        if countDownTime <= 3 then
            self._ImageCountBG:setVisible(false)
            self:_playCountDownEffect(countDownTime)
            self._textCount:setVisible(false)
        end
	end
end

function CampRacePlayOff:_playCountDownEffect(countDownTime)
    local index = countDownTime
    if index >= 1 and index <= 3 then
        G_EffectGfxMgr:createPlayGfx(self._nodeCount, "effect_jingjijishi_"..index, nil, true)
    elseif index == 0 then
        self._canEmbattle = false
        G_EffectGfxMgr:createPlayGfx(self._nodeCount, "effect_jingjijishi_suoding", nil, true)
    end
end

function CampRacePlayOff:_updateBet()
    self._nodeBet1:setVisible(false)
    self._nodeBet2:setVisible(false)
    local isMatching = G_UserData:getCampRaceData():isMatching()
    if isMatching then --正在比赛，不能押注
        return
    end
    if not G_UserData:getCampRaceData():isCanBetWithCamp(self._camp) then --非本阵营不能押
        return
    end
    if not self._playerData1 or not self._playerData2 then
        return
    end

    self._nodeBet1:setVisible(true)
    self._nodeBet2:setVisible(true)
    if G_UserData:getCampRaceData():isHaveBet() then --已经押注过了
        local betPos = G_UserData:getCampRaceData():getBetPosWithCamp(self._camp)
        for i = 1, 2 do 
            local player = self["_playerData"..i]
            local userPos = player:getPosition(self._camp)
            self["_imageBet"..i]:setVisible(userPos == betPos)
            self["_buttonBet"..i]:setVisible(false)
            self["_imageBetBg"..i]:setVisible(false)
        end
    else
        local curStatus = G_UserData:getCampRaceData():getCurStatusWithCamp(self._camp)
        if curStatus and curStatus:getRound() > 1 then
            self._nodeBet1:setVisible(false)
            self._nodeBet2:setVisible(false)
        else
            self._nodeBet1:setVisible(true)
            self._nodeBet2:setVisible(true)
            for i = 1, 2 do
                self["_imageBet"..i]:setVisible(false)
                self["_buttonBet"..i]:setVisible(true)
                self["_imageBetBg"..i]:setVisible(true)
            end
        end
    end
end

function CampRacePlayOff:_onBest8Click()
    self:_openPopupMap()
end

function CampRacePlayOff:_onBetClick1()
    self:_onBetClick(1)
end

function CampRacePlayOff:_onBetClick2()
    self:_onBetClick(2) 
end

function CampRacePlayOff:_onBetClick(index)
    local player = self["_playerData"..index]
    local userPos = player:getPosition(self._camp)

    local title = Lang.get("camp_bet_alart_title")
    local content = Lang.get("camp_bet_alart", {name = player:getName()})
    local function callback()
        local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, CampRaceHelper.getBetGold())
        if not success then
            return 
        end
        G_UserData:getCampRaceData():c2sCampRaceBet(self._camp, userPos)
    end
    local popup = PopupSystemAlert.new(title, content, callback)
    popup:setCheckBoxVisible(false)
    popup:openWithAction()
end

function CampRacePlayOff:_openPopupMap()
    if self._popupCampMap == nil then
        G_SceneManager:showDialog("app.scene.view.campRace.PopupCampMap", function(popupView)
            self._popupCampMap = popupView
            self._popupCampMapSignal = self._popupCampMap.signal:add(handler(self, self._onPopupCampMapClose))
            self._panelDesign:setVisible(false)
        end, self._camp)
    end
end

function CampRacePlayOff:_onPopupCampMapClose(event)
    if event == "close" then
        self._popupCampMap = nil
        if self._popupCampMapSignal then
            self._popupCampMapSignal:remove()
            self._popupCampMapSignal = nil
        end
        if G_UserData:getCampRaceData():getFinalStatusByCamp(self._camp) == CampRaceConst.PLAY_OFF_ROUND_ALL then --产生冠军了
            self._textChampionTip:setVisible(true)
            self._panelDesign:setVisible(false)
        else
            self._textChampionTip:setVisible(false)
            self._panelDesign:setVisible(true)
        end
    end
end

function CampRacePlayOff:_onEventAddBattleReport(eventName, report)
    self._canEmbattle = true
    self:_recvReport(report)
end

function CampRacePlayOff:_openPopupAlert()
    local popup = PopupSystemAlert.new(Lang.get("camp_lose_title"), Lang.get("camp_lose_content"))
    popup:showGoButton(Lang.get("fight_kill_comfirm"))
    popup:setCheckBoxVisible(false)
    popup:openWithAction()
end

function CampRacePlayOff:_onEventUpdateState(eventName, camp)
    if self._camp ~= camp then
        return
    end
    
    local curStatus = G_UserData:getCampRaceData():getCurStatusWithCamp(self._camp)
    if curStatus then
        print( "__________________CampRacePlayOff:_onEventUpdateState", self._camp, curStatus:getLastFinal_status(), curStatus:getFinal_status())
        if curStatus:isChangeFinalStatus() then
            self._camp = G_UserData:getCampRaceData():findCurWatchCamp()
            G_UserData:getCampRaceData():c2sGetCampRaceLastRank(self._camp)
        end
    end
end

function CampRacePlayOff:_onEventCampBetSuccess(eventName)
    G_Prompt:showTip(Lang.get("camp_bet_success"))
end

function CampRacePlayOff:_onEventCampUpdateBet(eventName)
    self:_updateBet()
end

return CampRacePlayOff
