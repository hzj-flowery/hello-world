
-- Author: Liangxu
-- Date: 2019-10-28
--
local ViewBase = require("app.ui.ViewBase")
local UniverseRaceBattleLayer = class("UniverseRaceBattleLayer", ViewBase)
local UniverseRaceBattlePlayerNode = require("app.scene.view.universeRace.UniverseRaceBattlePlayerNode")
local CSHelper  = require("yoka.utils.CSHelper")
local SchedulerHelper = require ("app.utils.SchedulerHelper")
local UniverseRaceConst = require("app.const.UniverseRaceConst")
local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")

function UniverseRaceBattleLayer:ctor(parentView)
	self._parentView = parentView

	local resource = {
		file = Path.getCSB("UniverseRaceBattleLayer", "universeRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		},
	}
	UniverseRaceBattleLayer.super.ctor(self, resource, 2)
end

function UniverseRaceBattleLayer:onCreate()
	self:_initData()
    self:_initView()
end

function UniverseRaceBattleLayer:_initData()
	self._avatars = {
        [1] = {},
        [2] = {},
    }
    self._index = 0
    self._targetTime = 0
    self._canEmbattle = true
    self._curRaceState = 0
    for i = 1, 2 do
        self["_userData"..i] = nil
    end
    self._matchData = nil
    self._isMatchFinish = false --本场比赛是否已经结束
    self._curWatchPos = 0
    self._curReportId = 0
	self._showMoveTip = false
end

function UniverseRaceBattleLayer:_initView()
	self._playerInfo = UniverseRaceBattlePlayerNode.new(self._nodePlayerInfo)

    for i = 1, 2 do
        self["_panelPlayer"..i]:addTouchEventListener(handler(self, self._onTouchEvent))
        self["_panelPlayer"..i]:setEnabled(false)
    end

    self._ImageCountBG:setVisible(false)
	cc.bind(self._commonChat,"CommonMiniChat")
end

function UniverseRaceBattleLayer:onEnter()
    self._signalChangeEmbattleSuccess = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_CHANGE_EMBATTLE_SUCCESS, handler(self, self._onEventChangeEmbattleSuccess))
    self._signalEmbattleUpdateSuccess = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_EMBATTlE_UPDATE, handler(self, self._onEventEmbattleUpdateSuccess))
    self._signalSingleRaceUpdatePkInfo = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_UPDATE_PK_INFO_SUCCESS, handler(self, self._onEventRaceUpdatePkInfo))
    
	self:_startCountDown()
end

function UniverseRaceBattleLayer:onExit()
	self:_stopCountDown()
    self:onHide()
	self._nodeCount:removeChildByName("CountDownEffect")
	
    self._signalChangeEmbattleSuccess:remove()
    self._signalChangeEmbattleSuccess = nil
    self._signalEmbattleUpdateSuccess:remove()
    self._signalEmbattleUpdateSuccess = nil
    self._signalSingleRaceUpdatePkInfo:remove()
    self._signalSingleRaceUpdatePkInfo = nil
end

function UniverseRaceBattleLayer:onShow()
    self._signalGetBattleReport = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_GET_REPORT, handler(self, self._onEventGetReport)) --此Layer显示时才接受事件
end

function UniverseRaceBattleLayer:onHide()
    if self._signalGetBattleReport then
        self._signalGetBattleReport:remove()
        self._signalGetBattleReport = nil
    end
end

function UniverseRaceBattleLayer:updateInfo()
	self:_updateData()
    self:_updateView()
    self:_updateAvatars()
end

function UniverseRaceBattleLayer:_updateData()
    self._curWatchPos = G_UserData:getUniverseRace():getCurWatchPos()
    print( "UniverseRaceBattleLayer:_updateData()----------", self._curWatchPos )
    self:_updateUserData()
    self:_updateFinishState()
    self:_updateMatchData()
    self:_updateTime()
end

function UniverseRaceBattleLayer:_updateUserData()
    local prePos = G_UserData:getUniverseRace():getPrePosOfPos(self._curWatchPos)
    for i = 1, 2 do
        local pos = prePos[i]
        self["_userData"..i] = G_UserData:getUniverseRace():getUserDataWithPosition(pos)
    end
end

function UniverseRaceBattleLayer:_updateFinishState()
    if self._userData1 and self._userData2 then
        local groupReportData = G_UserData:getUniverseRace():getGroupReportData(self._curWatchPos)
        if groupReportData then
            local isMatchEnd = groupReportData:isMatchEnd()
            self._isMatchFinish = isMatchEnd
        else
            self._isMatchFinish = false
        end
    else
        self._isMatchFinish = true
    end
end

function UniverseRaceBattleLayer:_updateMatchData()
    self._matchData = G_UserData:getUniverseRace():getMatchDataWithPosition(self._curWatchPos)
    assert(self._matchData, string.format("self._matchData is nil, curWatchPos = %d", self._curWatchPos))
end

function UniverseRaceBattleLayer:_updateTime()
    if self._isMatchFinish then
        return
    end
    self._targetTime = G_UserData:getUniverseRace():getRound_begin_time()
    local intervalPerRound = UniverseRaceConst.getIntervalPerRound()
    local nowTime = G_ServerTime:getTime()
    local curRaceState = UniverseRaceDataHelper.getRaceStateAndTime()
    if curRaceState == UniverseRaceConst.RACE_STATE_BREAK then --间歇状态，时间定为第一场的开始时间
        self._targetTime = self._targetTime + intervalPerRound
    else                                                        -- 进行中状态
        while self._targetTime <= nowTime do
            self._targetTime = self._targetTime + intervalPerRound
        end
    end
end

function UniverseRaceBattleLayer:_updateView()
    self:_updateRound()
	self:_updatePlayerInfo()
    self._canEmbattle = true
    self:_updateBetCount()
end

function UniverseRaceBattleLayer:_startCountDown()
    self:_stopCountDown()
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._updateCountDown), 1)
    self:_updateCountDown()
end

function UniverseRaceBattleLayer:_stopCountDown()
    if self._scheduleHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleHandler)
        self._scheduleHandler = nil
    end
end

function UniverseRaceBattleLayer:_updateCountDown()
    self._curRaceState = UniverseRaceDataHelper.getRaceStateAndTime()
	self:_updateMoveTip()
    if self._curRaceState == UniverseRaceConst.RACE_STATE_BREAK then
        self._textCount:setVisible(false)
        self._ImageCountBG:setVisible(false)
    else
        local countDownTime = self._targetTime - G_ServerTime:getTime() - 1
        if countDownTime >= 0 then
			self:_updateRound()
            local timeString = G_ServerTime:secToString(countDownTime)
            if countDownTime == 0 then
                timeString = ""
            end
            self._textCount:setVisible(countDownTime > 3)
            self._ImageCountBG:setVisible(countDownTime > 3)
            if countDownTime > 3 then
                self._textCount:setString(timeString)
            else
                self:_playCountDownEffect(countDownTime)
            end
        end
    end
end

function UniverseRaceBattleLayer:_playCountDownEffect(countDownTime)
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

function UniverseRaceBattleLayer:_updateRound()
    local roundDes = ""
    local titleDes = ""
    if self._isMatchFinish then
        titleDes = Lang.get("universe_race_match_end")
    else
		local raceState = UniverseRaceDataHelper.getRaceStateAndTime()
		if raceState == UniverseRaceConst.RACE_STATE_BREAK then
			titleDes = Lang.get("universe_race_match_guess")
		else
			local round = G_UserData:getUniverseRace():getCurMatchIndexByPos(self._curWatchPos)
			roundDes = Lang.get("camp_round", {count = round})
			titleDes = Lang.get("universe_race_match_countdown")
		end
    end
    self._textRound:setString(roundDes)
    self._textOpenTitle:setString(titleDes)
end

function UniverseRaceBattleLayer:_updatePlayerInfo()
    self._playerInfo:updateUI(self._curWatchPos)

    self._panelPlayer1:setEnabled(false)
    self._panelPlayer2:setEnabled(false)
    self._showMoveTip = false
    local selfId = G_UserData:getBase():getId()
    if self._userData1 and self._userData1:getUser_id() == selfId then 
        self._panelPlayer1:setEnabled(true)
		self._showMoveTip = true
    elseif self._userData2 and self._userData2:getUser_id() == selfId then
        self._panelPlayer2:setEnabled(true)
		self._showMoveTip = true
    end
end

function UniverseRaceBattleLayer:_updateMoveTip()
	if self._showMoveTip and self._curRaceState == UniverseRaceConst.RACE_STATE_ING then
		self._textMoveTip:setVisible(true)
	else
		self._textMoveTip:setVisible(false)
	end
end

function UniverseRaceBattleLayer:_updateBetCount()
    local prePos = G_UserData:getUniverseRace():getPrePosOfPos(self._curWatchPos)
    local supportData = G_UserData:getUniverseRace():getSupportSingleUnitDataWithPosition(self._curWatchPos)
    local supportId = supportData and supportData:getSupport() or 0
    local supportNums = {
        self._matchData:getAtk_user_support(),
        self._matchData:getDef_user_support(),
    }
    for i = 1, 2 do
        self["_textVoteCount"..i]:setString(supportNums[i])
        local isSupported = self["_userData"..i]:getUser_id() == supportId
        self["_imageBet"..i]:setVisible(isSupported)
    end
end

function UniverseRaceBattleLayer:_updateAvatars()
    for i = 1, 2 do 
        self:_updateAvatarWithSide(i)
    end
end

function UniverseRaceBattleLayer:_updateAvatarWithSide(side)
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

function UniverseRaceBattleLayer:_setAvatarEmpty(side)
    for i = 1, 6 do 
        if self._avatars[side][i]then
            self._avatars[side][i]:setVisible(false)
        end
    end
end

function UniverseRaceBattleLayer:_resetAvatarPos(side)
    for i = 1, 6 do 
        if self._avatars[side][i] then
            local posX, posY = self["_panelPlayer"..side]:getSubNodeByName("ImageKnightPos"..i):getPosition()
            self._avatars[side][i]:setPosition(cc.p(posX, posY))
            self._avatars[side][i]:setLocalZOrder(i*10)
        end
    end
    self:_showHighLight(nil, side)
end

function UniverseRaceBattleLayer:_showHighLight(index, side)
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

function UniverseRaceBattleLayer:_getIndexSelected(sender, side)
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

function UniverseRaceBattleLayer:_getIndexMoveOn(touchPos, side)
    for i = 1, 6 do 
        local panel = self["_panelPlayer"..side]:getSubNodeByName("ImageKnightPos"..i)
        local rect = panel:getBoundingBox()
        if cc.rectContainsPoint(rect, touchPos) then 
            return i 
        end
    end
    return nil
end

function UniverseRaceBattleLayer:_checkMoveHighLight(touchPos, side)
    if self._index == 0 then 
        return 
    end
    local nowIndex = self:_getIndexMoveOn(touchPos, side)
    self:_showHighLight(nowIndex, side)
end

function UniverseRaceBattleLayer:_moveSpinePos(position, side)
    local moveNode = self._avatars[side][self._index]
    moveNode:setPosition(position)
    moveNode:setLocalZOrder(100)
end

function UniverseRaceBattleLayer:_moveCanceled(side)
    self:_resetAvatarPos(side)
end

function UniverseRaceBattleLayer:_moveEnded(endPos, side)
    local endIndex = self:_getIndexMoveOn(endPos, side)
    if not endIndex or not self._canEmbattle and self._curRaceState == UniverseRaceConst.RACE_STATE_ING then
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
    G_UserData:getUniverseRace():c2sUniverseRaceChangeEmbattle(userId, embattle)
end

function UniverseRaceBattleLayer:_onTouchEvent(sender, state)
    local side = 0
    local senderName = sender:getName()
    if senderName == "_panelPlayer1" then
        side = 1
    elseif senderName == "_panelPlayer2" then
        side = 2
    end
    if state == ccui.TouchEventType.began then
        local index = self:_getIndexSelected(sender, side)
        if index and self._canEmbattle and self._curRaceState == UniverseRaceConst.RACE_STATE_ING then 
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

function UniverseRaceBattleLayer:_onEventChangeEmbattleSuccess(eventName)
    self:_updateUserData()
    self:_updateAvatars()
end

function UniverseRaceBattleLayer:_onEventEmbattleUpdateSuccess(eventName, userData)
    for i = 1, 2 do
        if self["_userData"..i] and self["_userData"..i]:getUser_id() == userData:getUser_id() then
            self["_userData"..i] = userData
            self:_updateAvatars()
        end
    end
end

function UniverseRaceBattleLayer:_onEventRaceUpdatePkInfo(eventName, pkInfos, reports, isChangeRound)
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
        G_UserData:getUniverseRace():c2sGetBattleReport(curReportId)
        self._curReportId = curReportId
    elseif needUpdate then
        self:_updateData()
        self:_updateView()
        self:_updateAvatars()
        self._parentView:updateTitle()
    end
end

function UniverseRaceBattleLayer:_onEventGetReport(eventName, battleReport, id)
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
        local battleData = require("app.utils.BattleDataHelper").parseUniverseRace(leftName, rightName, leftOfficer, rightOfficer, winPos)
    
        G_SceneManager:showScene("fight", reportData, battleData)
    end

    if id == self._curReportId then
        logWarn(string.format("UniverseRaceBattleLayer:_onEventGetReport battleReport = %d", battleReport))
        G_SceneManager:registerGetReport(battleReport, function() enterFightView() end)
    end
end

return UniverseRaceBattleLayer