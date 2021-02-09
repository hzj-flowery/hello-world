--预赛
local ViewBase = require("app.ui.ViewBase")
local CampRacePreMatch = class("CampRacePreMatch", ViewBase)
local CampRaceRankNode = require("app.scene.view.campRace.CampRaceRankNode")
local CampRacePreDetailNode = require("app.scene.view.campRace.CampRacePreDetailNode")
local SchedulerHelper = require ("app.utils.SchedulerHelper")
local CampRaceHelper = require("app.scene.view.campRace.CampRaceHelper")
local CampRaceConst = require("app.const.CampRaceConst")
local PvpProParameter = require("app.config.pvppro_parameter")
local CampSummaryNode = require("app.scene.view.campRace.CampSummaryNode")
local AudioConst = require("app.const.AudioConst")

function CampRacePreMatch:ctor()
	local resource = {
		file = Path.getCSB("CampRacePreMatch", "campRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		}
	}
    CampRacePreMatch.super.ctor(self, resource)
end

function CampRacePreMatch:onCreate()
	self:_initData()
	self:_initView()
end

function CampRacePreMatch:_initData()
	self._curCamp = 0
	self._targetTime = 0
	self._playerData1 = nil
	self._playerData2 = nil
	self._isBye = nil			--是否轮空
	self._isFinish = false --预赛是否结束了
	self._timeOfPerRound = CampRaceHelper.getGameTime(CampRaceConst.STATE_PRE_MATCH) --每轮比赛时间
end

function CampRacePreMatch:_initView()
	self._nodeRank = CampRaceRankNode.new(self._rankNode)
	for i = 1, 2 do 
		self["_playerNode"..i] = CampRacePreDetailNode.new(i)
		self["_player"..i]:addChild(self["_playerNode"..i])
	end
	self._playerNode1:setEmbattleEnable(true) --左侧能布阵
	self._playerNode2:setEmbattleEnable(false) --右侧不能
	cc.bind(self._commonChat, "CommonMiniChat")
end

function CampRacePreMatch:onEnter()
	self._signalGetCampRaceFormation = G_SignalManager:add(SignalConst.EVENT_GET_CAMP_RACE_FORMATION, handler(self, self._onEventGetFormation))
	self._signalGetCampRaceRank = G_SignalManager:add(SignalConst.EVENT_GET_CAMP_RACE_RANK, handler(self, self._onEventGetRank))  --预赛排行榜
	self._signalUpdateCampRaceFormation = G_SignalManager:add(SignalConst.EVENT_UPDATE_CAMP_RACE_FORMATION, handler(self, self._onEventUpdateFormation))
	self._signalCampBattleResult = G_SignalManager:add(SignalConst.EVENT_CAMP_BATTLE_RESULT, handler(self, self._onEventCampBattleResult))
end

function CampRacePreMatch:onExit()
	self:_stopCountDown()
	self._signalGetCampRaceFormation:remove()
    self._signalGetCampRaceFormation = nil
    self._signalGetCampRaceRank:remove()
    self._signalGetCampRaceRank = nil
    self._signalUpdateCampRaceFormation:remove()
    self._signalUpdateCampRaceFormation = nil
    self._signalCampBattleResult:remove()
    self._signalCampBattleResult = nil
end

function CampRacePreMatch:onShow()
	self._playerNode1:setEmbattleEnable(true)
	self:_startCountDown()
end

function CampRacePreMatch:onHide()
	self:_stopCountDown()
end

function CampRacePreMatch:updateInfo()
	self._curCamp = G_UserData:getCampRaceData():getMyCamp()
	local campList = {self._curCamp}

	G_UserData:getCampRaceData():c2sGetCampRaceRank(campList)
	G_UserData:getCampRaceData():c2sGetCampRaceFormation(self._curCamp, G_UserData:getBase():getId())
end

function CampRacePreMatch:_updateData()
	self._isFinish = false
	self._playerData1, self._playerData2 = G_UserData:getCampRaceData():getCurMatchPlayersWithCamp(self._curCamp)
	if G_UserData:getCampRaceData():getFinalStatusByCamp(self._curCamp) == CampRaceConst.PLAY_OFF_ROUND1 then
		self._isFinish = true
	end

	if self._isFinish then
		
	else
		if self._playerData1 and self._playerData2 then 
			self._isBye = false
		else
			self._isBye = true
		end
		local startTime = G_UserData:getCampRaceData():getCurMatchStartTimeWithCamp(self._curCamp)
		self._targetTime = startTime + self._timeOfPerRound
	end
end

function CampRacePreMatch:_startCountDown()
	self:_stopCountDown()
	self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._updateCountDown), 1)
	self:_updateCountDown()
end

function CampRacePreMatch:_stopCountDown()
	if self._scheduleHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._scheduleHandler)
		self._scheduleHandler = nil
	end
end

function CampRacePreMatch:_updateRankList()
	local preRankData = G_UserData:getCampRaceData():getPreRankWithCamp(self._curCamp)
	local playerList = preRankData:getRankDatas()
	self._nodeRank:setRankData(playerList)
	self._nodeRank:refreshMyRank()
end

function CampRacePreMatch:_updatePlayers()
	self._playerNode1:updatePlayer(self._playerData1)
	self._playerNode2:updatePlayer(self._playerData2)
end

function CampRacePreMatch:_refreshUI()
	if self._isFinish then
		self._textPreMatchFinish:setVisible(true)
		self._nodeCountTitle:setVisible(false)
		self._nodeNoEnemyTitle:setVisible(false)
		self._nodeFight:setVisible(false)
		self._nodeNoEnemy:setVisible(false)
		self._textCount:setVisible(false)
	else
		self._textPreMatchFinish:setVisible(false)
		self._nodeCountTitle:setVisible(not self._isBye)
		self._nodeNoEnemyTitle:setVisible(self._isBye)
		self._nodeFight:setVisible(not self._isBye)
		self._nodeNoEnemy:setVisible(self._isBye)
		self._textCount:setVisible(true)
	end
end

function CampRacePreMatch:_updateRound()
	local round = G_UserData:getCampRaceData():getCurMatchRoundWithCamp(self._curCamp)
	self._textRound:setString(Lang.get("camp_race_pre_round", {count = round}))
	self._textRound:setVisible(not self._isFinish)
end

function CampRacePreMatch:_updateCountDown()
	local countDownTime = self._targetTime - G_ServerTime:getTime() - 1 --1秒是为最后锁定阵容预留的
	if countDownTime >= 0 then
		local timeString = G_ServerTime:secToString(countDownTime)
		if countDownTime == 0 then
			timeString = ""
		end
		self._textCount:setString(timeString)
		self._textCount:setVisible(true)
		if self._isBye == false then
			if countDownTime <= 3 then
				self:_playCountDownAnim(countDownTime)
				self._textCount:setVisible(false)
			end
		else 
			self._textCountNext:setString(timeString)
		end
	end
end

function CampRacePreMatch:_playCountDownAnim(countDownTime)		--倒计时
	local index = countDownTime
	if index >= 1 and index <= 3 then
        G_EffectGfxMgr:createPlayGfx(self._nodeFight, "effect_jingjijishi_"..index, nil, true)
    elseif index == 0 then
    	self._playerNode1:setEmbattleEnable(false)
        G_EffectGfxMgr:createPlayGfx(self._nodeFight, "effect_jingjijishi_suoding", nil, true)
    end
end

function CampRacePreMatch:_playBattleAnim(isWin)	--开始动画
	local function eventFunc(event)
		if event == "shengli" then 
			self:_playWinAnim(isWin)
		elseif event == "jiesuan" then
			self:_playSummary()
		elseif event == "finish" then
			if G_UserData:getCampRaceData():getStatus() == CampRaceConst.STATE_PRE_MATCH then --防止进入决赛阶段后还请求数据（特效驱动，时机不受控制）
				G_UserData:getCampRaceData():c2sGetCampRaceFormation(self._curCamp, G_UserData:getBase():getId())
			end
		end
	end
	G_EffectGfxMgr:createPlayMovingGfx(self._nodeFight, "moving_zhenyingjingji_donghua", nil, eventFunc) 
end

function CampRacePreMatch:_playWinAnim(isWin)
	if isWin then
		G_EffectGfxMgr:createPlayGfx(self._nodeFight, "effect_jingji_shengli")
		G_AudioManager:playSoundWithId(AudioConst.SOUND_CAMP_RACE_PRE_WIN)
	else 
		G_EffectGfxMgr:createPlayGfx(self._nodeFight, "effect_jingji_shibai")
		G_AudioManager:playSoundWithId(AudioConst.SOUND_CAMP_RACE_PRE_LOSE)
	end
end

function CampRacePreMatch:_playSummary()	--名次变化,改坐标
	local function effectFunc(effect)
		if effect == "jifen_zi" then 
			local text = Lang.get("camp_point_change")
			local fontColor = Colors.getSummaryLineColor()
			local label = cc.Label:createWithTTF(text, Path.getFontW8(), 24)
			label:setColor(fontColor)
			return label
		elseif effect == "paiming_zi" then 
			local text = Lang.get("camp_rank_change")
			local fontColor = Colors.getSummaryLineColor()
			local label = cc.Label:createWithTTF(text, Path.getFontW8(), 24)
			label:setColor(fontColor)
			return label			
		elseif effect == "paiming" then 
			local node = CampSummaryNode.new()
			local preRankData = G_UserData:getCampRaceData():getPreRankWithCamp(self._curCamp)
			local nowRank = preRankData:getSelf_rank()
			local rankChange = preRankData:getRankChange()
			node:showRank(nowRank - rankChange, nowRank)
			return node
		elseif effect == "jifen" then
			local node = CampSummaryNode.new()
			local preRankData = G_UserData:getCampRaceData():getPreRankWithCamp(self._curCamp)
			local nowScore = preRankData:getSelf_score()
			local scoreChange = preRankData:getScoreChange()
			node:showPoint(nowScore, scoreChange)
			return node		
		end
	end
	local function eventFunc(event) 
		if event == "finish" then
			self._imageBlackBg:setVisible(false)
		end
	end

	self._imageBlackBg:setVisible(true)
	local effect = G_EffectGfxMgr:createPlayMovingGfx( self._nodeFight, "moving_zhenyingjingji_jiesuan", effectFunc, eventFunc, true) 
	effect:setPositionY(-135)
end

function CampRacePreMatch:_onEventGetFormation(eventName, camp)
	self._curCamp = camp
	self:_updateData()
    self:_updateRound()
	self:_updatePlayers()
	self:_refreshUI()
end

function CampRacePreMatch:_onEventUpdateFormation(eventName, camp, index)
	if self._curCamp ~= camp then
		return
	end

	self._playerData1, self._playerData2 = G_UserData:getCampRaceData():getCurMatchPlayersWithCamp(self._curCamp)
	self["_playerNode"..index]:updatePlayer(self["_playerData"..index])
end

function CampRacePreMatch:_onEventCampBattleResult(eventName, camp, win)
	if self._curCamp ~= camp then
		return
	end
	self:_playBattleAnim(win)
end

function CampRacePreMatch:_onEventGetRank(eventName)
	if G_UserData:getCampRaceData():getStatus() ~= CampRaceConst.STATE_PRE_MATCH then
        return
    end
    
	self:_updateRankList()
	self._playerNode1:setEmbattleEnable(true)

	if self._isBye then --轮空
		G_UserData:getCampRaceData():c2sGetCampRaceFormation(self._curCamp, G_UserData:getBase():getId())
		return
	end
end

return CampRacePreMatch 