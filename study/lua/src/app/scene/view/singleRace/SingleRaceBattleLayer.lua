--
-- Author: Liangxu
-- Date: 2018-11-26
-- 跨服个人竞技战斗界面
local ViewBase = require("app.ui.ViewBase")
local SingleRaceBattleLayer = class("SingleRaceBattleLayer", ViewBase)
local SingleRaceBattlePlayerNode = require("app.scene.view.singleRace.SingleRaceBattlePlayerNode")
local CSHelper  = require("yoka.utils.CSHelper")
local SchedulerHelper = require ("app.utils.SchedulerHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local PopupSystemAlert = require("app.ui.PopupSystemAlert")
local SingleRaceConst = require("app.const.SingleRaceConst")

function SingleRaceBattleLayer:ctor(parentView)
	self._parentView = parentView

	local resource = {
		file = Path.getCSB("SingleRaceBattleLayer", "singleRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonBet1 = {
                events = {{event = "touch", method = "_onBetClick1"}}
            },
            _buttonBet2 = {
                events = {{event = "touch", method = "_onBetClick2"}}
            },
		},
	}
	SingleRaceBattleLayer.super.ctor(self, resource, 17)
end

function SingleRaceBattleLayer:onCreate()
	self:_initData()
    self:_initView()
end

function SingleRaceBattleLayer:_initData()
	self._avatars = {
        [1] = {},
        [2] = {},
    }
    self._index = 0
    self._targetTime = 0
    self._canEmbattle = true
    for i = 1, 2 do
        self["_userData"..i] = nil
        self["_userPos"..i] = 0
    end
    self._matchData = nil
    self._isMatchFinish = false --本场比赛是否已经结束
    self._curWatchPos = 0
    self._popupAlert = nil
    self._popupAlertSingal = nil
    self._curReportId = 0
end

function SingleRaceBattleLayer:_initView()
	self._playerInfo = SingleRaceBattlePlayerNode.new(self._nodePlayerInfo)

    for i = 1, 2 do
        self["_panelPlayer"..i]:addTouchEventListener(handler(self, self._onTouchEvent))
        self["_panelPlayer"..i]:setEnabled(false)
        self["_buttonBet"..i]:setString(Lang.get("camp_bet_btn"))
    end

    self._ImageCountBG:setVisible(false)
	cc.bind(self._commonChat,"CommonMiniChat")
end

function SingleRaceBattleLayer:onEnter()
    self._signalSupportSuccess = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_SUPPORT_SUCCESS, handler(self, self._onEventSupportSuccess))
    self._signalChangeEmbattleSuccess = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_CHANGE_EMBATTLE_SUCCESS, handler(self, self._onEventChangeEmbattleSuccess))
    self._signalEmbattleUpdateSuccess = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_EMBATTlE_UPDATE, handler(self, self._onEventEmbattleUpdateSuccess))
    self._signalSingleRaceUpdatePkInfo = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_UPDATE_PK_INFO_SUCCESS, handler(self, self._onEventRaceUpdatePkInfo))
    
	self:_startCountDown()
end

function SingleRaceBattleLayer:onExit()
    if self._popupAlert then
        self._popupAlert:close()
    end
	self:_stopCountDown()
    self:onHide()
    self._nodeCount:removeChildByName("CountDownEffect")
    self._signalSupportSuccess:remove()
    self._signalSupportSuccess = nil
    self._signalChangeEmbattleSuccess:remove()
    self._signalChangeEmbattleSuccess = nil
    self._signalEmbattleUpdateSuccess:remove()
    self._signalEmbattleUpdateSuccess = nil
    self._signalSingleRaceUpdatePkInfo:remove()
    self._signalSingleRaceUpdatePkInfo = nil
end

function SingleRaceBattleLayer:onShow()
    self._signalGetBattleReport = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_GET_REPORT, handler(self, self._onEventGetReport)) --此Layer显示时才接受事件
end

function SingleRaceBattleLayer:onHide()
    if self._signalGetBattleReport then
        self._signalGetBattleReport:remove()
        self._signalGetBattleReport = nil
    end
end

function SingleRaceBattleLayer:updateInfo()
	self:_updateData()
    self:_updateView()
    self:_updateAvatars()
end

function SingleRaceBattleLayer:_updateData()
    self._curWatchPos = G_UserData:getSingleRace():getCurWatchPos()
    print( "SingleRaceBattleLayer:_updateData()----------", self._curWatchPos )
    self:_updateUserData()
    self:_updateFinishState()
    self:_updateMatchData()
    self:_updateTime()
end

function SingleRaceBattleLayer:_updateUserData()
    local preIndex = G_UserData:getSingleRace():getPreIndexOfPosition(self._curWatchPos)
    for i = 1, 2 do
        local index = preIndex[i]
        self["_userData"..i] = G_UserData:getSingleRace():getUserDataWithPosition(index)
        self["_userPos"..i] = index
    end
end

function SingleRaceBattleLayer:_updateFinishState()
    if self._userData1 and self._userData2 then
        local isMatchEnd = G_UserData:getSingleRace():isMatchEndWithPosition(self._curWatchPos)
        self._isMatchFinish = isMatchEnd
    else
        self._isMatchFinish = true
    end
end

function SingleRaceBattleLayer:_updateMatchData()
    self._matchData = G_UserData:getSingleRace():getMatchDataWithPosition(self._curWatchPos)
    assert(self._matchData, string.format("self._matchData is nil, curWatchPos = %d", self._curWatchPos))
end

function SingleRaceBattleLayer:_updateTime()
    if self._isMatchFinish then
        return
    end
    self._targetTime = G_UserData:getSingleRace():getRound_begin_time()
    local intervalPerRound = SingleRaceConst.getIntervalPerRound()
    local nowTime = G_ServerTime:getTime()
    while self._targetTime <= nowTime do
        self._targetTime = self._targetTime + intervalPerRound
    end
end

function SingleRaceBattleLayer:_updateView()
    self:_updateRound()
	self:_updatePlayerInfo()
    self._canEmbattle = true
    self:_updateBet()
    self:_updateBetCount()
end

function SingleRaceBattleLayer:_startCountDown()
    self:_stopCountDown()
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._updateCountDown), 1)
    self:_updateCountDown()
end

function SingleRaceBattleLayer:_stopCountDown()
    if self._scheduleHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleHandler)
        self._scheduleHandler = nil
    end
end

function SingleRaceBattleLayer:_updateCountDown()
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

function SingleRaceBattleLayer:_playCountDownEffect(countDownTime)
    local index = countDownTime
    local effectNode = nil
    if index >= 1 and index <= 3 then
        effectNode = G_EffectGfxMgr:createPlayGfx(self._nodeCount, "effect_jingjijishi_"..index, nil, true)
    elseif index == 0 then
        self._canEmbattle = false
        effectNode = G_EffectGfxMgr:createPlayGfx(self._nodeCount, "effect_jingjijishi_suoding", nil, true)
    end
    effectNode:setName("CountDownEffect")
end

function SingleRaceBattleLayer:_updateRound()
    local roundDes = ""
    local titleDes = ""
    if self._isMatchFinish then
        titleDes = Lang.get("single_race_match_end")
    else
        local round = G_UserData:getSingleRace():getCurMatchIndexByPos(self._curWatchPos)
        roundDes = Lang.get("camp_round", {count = round})
        titleDes = Lang.get("single_race_match_countdown")
    end
    self._textRound:setString(roundDes)
    self._textOpenTitle:setString(titleDes)
end

function SingleRaceBattleLayer:_updatePlayerInfo()
    self._playerInfo:updateUI(self._curWatchPos)

    self._panelPlayer1:setEnabled(false)
    self._panelPlayer2:setEnabled(false)
    self._textMoveTip:setVisible(false)
    local selfId = G_UserData:getBase():getId()
    if self._userData1 and self._userData1:getUser_id() == selfId then 
        self._panelPlayer1:setEnabled(true)
        self._textMoveTip:setVisible(true)
    elseif self._userData2 and self._userData2:getUser_id() == selfId then
        self._panelPlayer2:setEnabled(true)
        self._textMoveTip:setVisible(true)
    end
end

function SingleRaceBattleLayer:_updateBet()
    self._nodeBet1:setVisible(false)
    self._nodeBet2:setVisible(false)
    local isSelfEliminated = G_UserData:getSingleRace():isSelfEliminated()
    if isSelfEliminated == false then --没被淘汰，不能押注
        return
    end
    if not self._userData1 or not self._userData2 then
        return
    end

    self._nodeBet1:setVisible(true)
    self._nodeBet2:setVisible(true)
    if G_UserData:getSingleRace():isDidSupport() then --已经支持过了
        local betUserId = G_UserData:getSingleRace():getSupport_user_id()
        for i = 1, 2 do
            local userId = self["_userData"..i]:getUser_id()
            self["_imageBet"..i]:setVisible(betUserId == userId)
            self["_buttonBet"..i]:setVisible(false)
        end
    else
        local matchIndex = G_UserData:getSingleRace():getCurMatchIndexByPos(self._curWatchPos)
        if matchIndex > 1 then
            self._nodeBet1:setVisible(false)
            self._nodeBet2:setVisible(false)
        else
            self._nodeBet1:setVisible(true)
            self._nodeBet2:setVisible(true)
            
            for i = 1, 2 do
                self["_imageBet"..i]:setVisible(false)
                self["_buttonBet"..i]:setVisible(true)
            end
        end
    end
end

function SingleRaceBattleLayer:_updateBetCount()
    local supportNums = {
        self._matchData:getAtk_user_support(),
        self._matchData:getDef_user_support(),
    }
    for i = 1, 2 do
        local textTip = ccui.RichText:createWithContent(Lang.get("single_race_support_num", {num = supportNums[i]}))
        local imageSize = self["_imageBetBg"..i]:getContentSize()
        textTip:setPosition(cc.p(imageSize.width/2, imageSize.height/2))
        self["_imageBetBg"..i]:removeAllChildren()
        self["_imageBetBg"..i]:addChild(textTip)
    end
end

function SingleRaceBattleLayer:_updateAvatars()
    for i = 1, 2 do 
        self:_updateAvatarWithSide(i)
    end
end

function SingleRaceBattleLayer:_updateAvatarWithSide(side)
    local userData = self["_userData"..side]
    if userData then
        local formation = userData:getFormation()
        for index, id in pairs(formation) do
            local hero = userData:getHeroDataWithId(id)
            if hero then
                if not self._avatars[side][index] then 
                    local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common")) 
                    self["_panelPlayer"..side]:addChild(avatar, index * 10)
                    self._avatars[side][index] = avatar
                end
                local baseId = hero:getCoverId()
                local limitLevel = hero:getLimitLevel()
                local limitRedLevel = hero:getLimitRedLevel()
                local avatarBaseId = hero:getAvartar_base_id()
                self._avatars[side][index]:updateUI(baseId, nil, nil, limitLevel, nil, nil, limitRedLevel)
                self._avatars[side][index]:showAvatarEffect(avatarBaseId > 0)
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

function SingleRaceBattleLayer:_setAvatarEmpty(side)
    for i = 1, 6 do 
        if self._avatars[side][i]then
            self._avatars[side][i]:setVisible(false)
        end
    end
end

function SingleRaceBattleLayer:_resetAvatarPos(side)
    for i = 1, 6 do 
        if self._avatars[side][i] then
            local posX, posY = self["_panelPlayer"..side]:getSubNodeByName("ImageKnightPos"..i):getPosition()
            self._avatars[side][i]:setPosition(cc.p(posX, posY))
            self._avatars[side][i]:setLocalZOrder(i*10)
        end
    end
    self:_showHighLight(nil, side)
end

function SingleRaceBattleLayer:_showHighLight(index, side)
    for i = 1, 6 do 
        local panel = self["_panelPlayer"..side]:getSubNodeByName("ImageKnightPos"..i)
        local image = panel:getSubNodeByName("ImageHighLight")
        if i == index then 
            image:setVisible(true)
        else 
            image:setVisible(false)
        end
    end
end

function SingleRaceBattleLayer:_getIndexSelected(sender, side)
    local touchPos = sender:getTouchBeganPosition()
    for k, spine in pairs(self._avatars[side]) do
        local location = spine:getSpineHero():convertToNodeSpace(touchPos)
        local rect = spine:getSpineHero():getBoundingBox()
        if cc.rectContainsPoint(rect, location) then
            return k
        end
    end
    return nil
end

function SingleRaceBattleLayer:_getIndexMoveOn(touchPos, side)
    for i = 1, 6 do 
        local panel = self["_panelPlayer"..side]:getSubNodeByName("ImageKnightPos"..i)
        local rect = panel:getBoundingBox()
        if cc.rectContainsPoint(rect, touchPos) then 
            return i 
        end
    end
    return nil
end

function SingleRaceBattleLayer:_checkMoveHighLight(touchPos, side)
    if self._index == 0 then 
        return 
    end
    local nowIndex = self:_getIndexMoveOn(touchPos, side)
    self:_showHighLight(nowIndex, side)
end

function SingleRaceBattleLayer:_moveSpinePos(position, side)
    local moveNode = self._avatars[side][self._index]
    moveNode:setPosition(position)
    moveNode:setLocalZOrder(100)
end

function SingleRaceBattleLayer:_moveCanceled(side)
    self:_resetAvatarPos(side)
end

function SingleRaceBattleLayer:_moveEnded(endPos, side)
    local endIndex = self:_getIndexMoveOn(endPos, side)
    if not endIndex or not self._canEmbattle then
        self:_moveCanceled(side)
        return
    end
    local embattle = self["_userData"..side]:getEmbattle()
    for index = 1, 6 do 
        if embattle[index] == endIndex then 
            embattle[index] = self._index
        elseif embattle[index] == self._index then 
            embattle[index] = endIndex
        end
    end
    local userId = G_UserData:getBase():getId()
    G_UserData:getSingleRace():c2sSingleRaceChangeEmbattle(userId, embattle)
end

function SingleRaceBattleLayer:_onTouchEvent(sender, state)
    local side = 0
    local senderName = sender:getName()
    if senderName == "_panelPlayer1" then
        side = 1
    elseif senderName == "_panelPlayer2" then
        side = 2
    end
    if state == ccui.TouchEventType.began then
        local index = self:_getIndexSelected(sender, side)
        if index and self._canEmbattle then 
            self._index = index
            self:_showHighLight(index, side)
            local touchPos = sender:convertToNodeSpace(sender:getTouchBeganPosition())
            self:_moveSpinePos(touchPos, side)
            return true
        end
        return false
	elseif state == ccui.TouchEventType.moved then
		if self._index ~= 0 then 
			local movePos = sender:convertToNodeSpace(sender:getTouchMovePosition())
            self:_moveSpinePos(movePos, side)
            self:_checkMoveHighLight(movePos, side)
		end
	elseif state == ccui.TouchEventType.ended then
        if self._index ~= 0 then 
            local endPos = sender:convertToNodeSpace(sender:getTouchEndPosition())
            self:_moveEnded(endPos, side)
            self._index = 0
		end
    elseif state == ccui.TouchEventType.canceled then
        if self._index ~= 0 then 
            self:_moveCanceled(side)
            self._index = 0
        end
	end
end

function SingleRaceBattleLayer:_onBetClick1()
    self:_onBetClick(1)
end

function SingleRaceBattleLayer:_onBetClick2()
    self:_onBetClick(2) 
end

function SingleRaceBattleLayer:_onBetClick(index)
    local userData = self["_userData"..index]

    local title = Lang.get("camp_bet_alart_title")
    local content = Lang.get("camp_bet_alart", {name = userData:getUser_name()})
    local function callback()
        local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, SingleRaceConst.getBidCost())
        if not success then
            return 
        end
        local userId = userData:getUser_id()
        G_UserData:getSingleRace():c2sSingleRaceSupport(self._curWatchPos, userId)
    end
    self._popupAlert = PopupSystemAlert.new(title, content, callback)
    self._popupAlertSingal = self._popupAlert.signal:add(handler(self, self._onPopupAlertClose))
    self._popupAlert:setCheckBoxVisible(false)
    self._popupAlert:openWithAction()
end

function SingleRaceBattleLayer:_onPopupAlertClose(event)
    if event == "close" then
        self._popupAlert = nil
        if self._popupAlertSingal then
            self._popupAlertSingal:remove()
            self._popupAlertSingal = nil
        end
    end
end

function SingleRaceBattleLayer:_onEventSupportSuccess(eventName)
    G_Prompt:showTip(Lang.get("camp_bet_success"))
    self:_updateUserData()
    self:_updateBet()
end

function SingleRaceBattleLayer:_onEventChangeEmbattleSuccess(eventName)
    self:_updateUserData()
    self:_updateAvatars()
end

function SingleRaceBattleLayer:_onEventEmbattleUpdateSuccess(eventName, userData)
    for i = 1, 2 do
        if self["_userData"..i] and self["_userData"..i]:getUser_id() == userData:getUser_id() then
            self["_userData"..i] = userData
            self:_updateAvatars()
        end
    end
end

function SingleRaceBattleLayer:_onEventRaceUpdatePkInfo(eventName, pkInfos, reports, isChangeRound)
    local curReportId = 0
    for i, report in ipairs(reports) do
        local pos = rawget(report, "position")
        if pos == self._curWatchPos then
            curReportId = rawget(report, "report_id")
            break
        end
    end
    local needUpdate = false
    for i, info in ipairs(pkInfos) do
        local pos = rawget(info, "position")
        if pos == self._curWatchPos then
            needUpdate = true
            break
        end
    end
    
    if curReportId > 0 then
        G_UserData:getSingleRace():c2sGetBattleReport(curReportId)
        self._curReportId = curReportId
    elseif needUpdate or isChangeRound then
        self:_updateData()
        self:_updateView()
        self:_updateAvatars()
        self._parentView:updateTitle()
    end
end

function SingleRaceBattleLayer:_onEventGetReport(eventName, battleReport, id)
    local function enterFightView()
        local battleReport = G_UserData:getFightReport():getReport()
        local ReportParser = require("app.fight.report.ReportParser")
        local reportData = ReportParser.parse(battleReport)
        local leftName = reportData:getLeftName()
        local leftOfficer = reportData:getAttackOfficerLevel()
        local rightName = reportData:getRightName()
        local rightOfficer = reportData:getDefenseOfficerLevel()
        local winPos = 1 
        if not reportData:isWin() then 
            winPos = 2
        end
        local battleData = require("app.utils.BattleDataHelper").parseSingleRace(leftName, rightName, leftOfficer, rightOfficer, winPos)
    
        G_SceneManager:showScene("fight", reportData, battleData)
    end

    if id == self._curReportId then
        logWarn(string.format("SingleRaceBattleLayer:_onEventGetReport battleReport = %d", battleReport))
        G_SceneManager:registerGetReport(battleReport, function() enterFightView() end)
    end
end

return SingleRaceBattleLayer