local ViewBase = require("app.ui.ViewBase")
local FightView = class("FightView", ViewBase)

local FightHelper = require("app.scene.view.fight.FightHelper")
local FightConfig = require("app.fight.Config")
local Engine = require("app.fight.Engine")
local BuffManager = require("app.fight.BuffManager")
local FightSignalConst = require("app.fight.FightSignalConst")
local FightSignalManager = require("app.fight.FightSignalManager")
local SchedulerHelper = require ("app.utils.SchedulerHelper")
local AudioConst = require("app.const.AudioConst")
local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local FunctionConst = require("app.const.FunctionConst")
local StoryTouch = require("app.config.story_touch")
local HeroShow = require("app.scene.view.heroShow.HeroShow")
local MonsterTalk = require("app.config.monster_talk")
local BattleDataHelper = require("app.utils.BattleDataHelper")
local StoryChatConst = require("app.const.StoryChatConst")

function FightView:ctor( report, battleData, useInitData, isPopStageView)
	self._report = report

	self._statisticsData = report:getStatisticsTotal()
	if useInitData then 
		self._battleData = BattleDataHelper.initBaseData(battleData)  
	else
		self._battleData = battleData
	end
	self._scheduler = nil	

	self._isPopStageView = isPopStageView

	self._fightUI = nil		--战斗ui
	self._fightStart = nil	--战斗开始动画
	self._fightEnd = nil	--战斗结束动画

	self._dropCount = 0		--掉落数量
	self._totalHurt = 0		--总计伤害
	self._double = 1		--倍速

	self._isJumpEnd = false		--是否是点击跳过
	self._hasSlowAction = false		--是否播放慢动作

	self._signalExitFight = nil		--popFightScene监听
	self._signalReplay = nil		--replay信号
	FightHelper.processData(self._battleData, self._report)
	self:setName("FightView")
    FightView.super.ctor(self)
    
    
end

function FightView:onCreate()
	local size = G_ResolutionManager:getDesignCCSize()
	self:setContentSize(G_ResolutionManager:getDesignSize())

    self._scene = require("app.fight.Scene").new(self._battleData.background[1])		--刚开始的时候，输入场景1号
    self._scene:setPosition(size.width*0.5, size.height*0.5)
    self:addChild(self._scene)

    self._engine = Engine.create(self._scene)
	self._buffManager = BuffManager.create(self._engine)
	local report = clone(self._report)
	self._engine:startWithPreload(report)
	self._fightSignalManager = FightSignalManager.create()
	self._scheduler = SchedulerHelper.newSchedule(handler(self,self._update), 0.1)

	-- self._listenerEngine = self._engine.signal:add(handler(self, self._onFightSignal))	--剥离从engine的监听
	-- self._listenerEngineUnitDie = self._engine.signalUnitDie:add(handler(self, self._onUnitDie))
	self._fightUI = require("app.scene.view.fight.FightUI").new()
	self:addChild(self._fightUI)
	self._fightUI:setLocalZOrder(1000)
	self._fightUI:setPosition(G_ResolutionManager:getDesignCCPoint())
	self._fightUI:setVisible(false)
	self._fightUI:hideTotalHurt()
	self._fightUI:setJumpVisible(self._battleData.needShowJump)

	self._hasNotice = false 	--是否提示过
	-- self:_checkTalkConfig()
	FightHelper.checkMonsterTalk(self._battleData.monsterTeamId, self._battleData.star)
end



function FightView:onEnter()
	if not self._battleData.ignoreBgm then
		if self._battleData.bgm and self._battleData.bgm > 0  then
			G_AudioManager:playMusicWithId(self._battleData.bgm)
		else
			G_AudioManager:playMusicWithId(AudioConst.MUSIC_FIGHT)
		end
	end
	logWarn("music "..self._battleData.bgm )
	
	--战斗界面申请新手触摸
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN)
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)

	self._signalReplay = G_SignalManager:add(SignalConst.EVENT_BATTLE_REPLAY,handler(self, self._replayBattle))
	-- self:_refreshSpeed()
	self:_initSpeed()

	self._listenerSignal = self._fightSignalManager:addListenerHandler(handler(self, self._onSignalEvent))
	self._signalExitFight = G_SignalManager:add(SignalConst.EVENT_EXIT_FIGHT, handler(self, self._onExitFight))

	logWarn("FightView")
	-- dump(self._battleData)
end

function FightView:onExit()
	logWarn("FightView:onExit")
	
	self._engine:stop()
	Engine.clear()

	BuffManager.clear()
	self._report:clear()

	if self._scheduler then
		SchedulerHelper.cancelSchedule(self._scheduler)
		self._scheduler = nil
	end
	if self._listenerEngine then
		self._listenerEngine:remove()
		self._listenerEngine = nil
	end
	if self._listenerSignal then 
		self._listenerSignal:remove()
		self._listenerSignal = nil
	end
	--战斗界面申请新手触摸
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END)

	local sharedScheduler = cc.Director:getInstance():getScheduler()
	sharedScheduler:setTimeScale(1)

	self._signalExitFight:remove()
	self._signalExitFight = nil

	self._signalReplay:remove()
    self._signalReplay = nil
end

function FightView:_resetFightSignal()
	if self._fightSignalManager then
		self._fightSignalManager:clear()
		self._fightSignalManager = nil
	end
	self._fightSignalManager = FightSignalManager.create()
	if self._listenerSignal then 
		self._listenerSignal:remove()
		self._listenerSignal = nil
	end
	self._listenerSignal = self._fightSignalManager:addListenerHandler(handler(self, self._onSignalEvent))
end

function FightView:_replayBattle()
	self._engine:stop()
	Engine.clear()
	BuffManager.clear()

	self._isJumpEnd = false

	self._fightStart:removeFromParent()
	self._fightStart = nil

	self._scene:removeFromParent()
	self._scene = nil

	local size = G_ResolutionManager:getDesignCCSize()
    self._scene = require("app.fight.Scene").new(self._battleData.background[1])		--刚开始的时候，输入场景1号
    self._scene:setPosition(size.width*0.5, size.height*0.5)
	self:addChild(self._scene)
	
	self._fightUI:setVisible(false)
	self._fightUI:hideTotalHurt()
	self._fightUI:setJumpVisible(true)

    self._engine = Engine.create(self._scene)
	self._buffManager = BuffManager.create(self._engine)
	local report = clone(self._report)
	self._engine:startWithPreload(report)
	self:_resetFightSignal()

	self:_initSpeed()
	
end

function FightView:_onExitFight()
	G_SceneManager:fightScenePop()

	if self._isPopStageView then
		G_SceneManager:popScene()
	end
end

function FightView:_update(f)
	if self._fightUI then
		self._fightUI:update(f)
	end
end

-- function FightView:_checkTalkConfig()
-- 	local win = self._report:isWin()
-- 	if self._battleData.monsterTeamId ~= 0 then
-- 		--检查怪物talk
-- 		local count = MonsterTalk.length()
-- 		local userLevel = G_UserData:getBase():getLevel()
-- 		for i = 1, count do
-- 			local talkConfig = MonsterTalk.indexOf(i)
-- 			if userLevel > talkConfig.lv_min and userLevel <= talkConfig.lv_max then
-- 				if talkConfig.teamid == self._battleData.monsterTeamId then
-- 					if not win then
-- 						self._engine:addLoseTalk(talkConfig)
-- 					end
-- 					if talkConfig.battle == "9" then		--9是任意情况
-- 						self._engine:addMonsterTalk(talkConfig)
-- 					else
-- 						local star = string.split(talkConfig.battle, "|")
-- 						for i, v in pairs(star) do
-- 							if tonumber(v) == self._battleData.star then
-- 								self._engine:addMonsterTalk(talkConfig)
-- 								break
-- 							end
-- 						end
-- 					end
-- 				end
-- 			end
-- 		end
-- 	end
-- end

function FightView:_initSpeed()
	local double, showUI = FightHelper.getFightSpeed()
	self:_changeSpeed(double)
	self._fightUI:setSpeedCallback(handler(self, self._changeSpeedClick))
	self._fightUI:setSpeedVisible(showUI)	
end

function FightView:_changeSpeed(targetSpeed, isManual)
	self._double = targetSpeed
	local speed = FightConfig["SPEED_DOUBLE_"..self._double]
	self._engine:changeBattleSpeed(speed)
	self._fightUI:refreshSpeed(self._double)

	if isManual then 
		FightHelper.writeSpeedFile(self._double, isManual)
	end
end

function FightView:_changeSpeedClick()
	local ret, nextSpeed, errMsg = FightHelper.checkNextSpeed(self._double)
	if ret then
		self:_changeSpeed(nextSpeed, true)
	else 
		if self._hasNotice then 
			self:_changeSpeed(nextSpeed, true)
			self._hasNotice = false
		else
			G_Prompt:showTip(errMsg)
			self._hasNotice = true
		end
	end
end

--结算
function FightView:showSummary()

	--进入结算界面,引导步骤+1
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,"FightView:showSummary")
	--中断后触发引导，与战斗关卡有关的引导触发。
	--这里是先步骤+1的原因是，可能引导处于中断状态，start是将引导激活。
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_START,self.__cname)
	self._fightUI:closeChatUI()	--关闭聊天弹出的各种窗口
	self._fightUI:setVisible(false)
	local isWin = self._report:isWin()
	local totalHurt = self._report:getAttack_hurt()
	if self._battleData.totalHurt ~= 0 then 
		totalHurt = self._battleData.totalHurt
	end
	local Settlement = require("app.scene.view.settlement.Settlement")
	local upValue = nil
	local panelSettlement = Settlement.createSettleMent(self._battleData, isWin, nil, totalHurt, self._statisticsData)
	--如果是flash，结算的话不会返回这个panel，以下代码是针对老结算的
	if panelSettlement then
		local UserCheck = require("app.utils.logic.UserCheck")
		local levelUp, upValue = UserCheck.isLevelUp()
		if not levelup then
			upValue = 0
		end
		self:addChild(panelSettlement)	
	end
end

--开始对话
function FightView:_startStoryChat(storyTouch, callback)
	local storyChat = require("app.scene.view.storyChat.PopupStoryChat").new(storyTouch, callback)
	storyChat:open()
end

--星彩进入
function FightView:_xingcaiIn()
	local function firstChat()
		local xingcaiTalk = 91105
		self:_startStoryChat(xingcaiTalk, handler(self, self.showSummary))
	end
	self._engine:createNewUnit(106, 216, "win", firstChat)
end

--检查对话 
function FightView:_checkStoryChat(checkType, waveId, heroId, callback)
	-- --类型不是主线副本，不出对话
	-- local notChatType = true
	-- if self._battleData.battleType == BattleDataHelper.BATTLE_TYPE_NORMAL_DUNGEON or
	-- 	self._battleData.battleType == BattleDataHelper.BATTLE_TYPE_FAMOUS or 
	-- 	self._battleData.battleType == BattleDataHelper.BATTLE_TYPE_GENERAL then 
	-- 		notChatType = false
	-- end
	-- if notChatType then
	-- 	if callback then
	-- 		callback()
	-- 	end
	-- 	return
	-- end
	local waveId = self._engine:getWaveId()
	local function dispatchEnd(checkType, waveId, touch)
		if checkType == StoryChatConst.TYPE_BEFORE_FIGHT then
			self._fightSignalManager:dispatchSignal(FightSignalConst.SIGNAL_STORY_OPEN_CHAT_END)
		else
			self._fightSignalManager:dispatchSignal(FightSignalConst.SIGNAL_UNIT_CHAT_END, checkType, waveId)
		end
	end

	-- if not callback then 
	-- 	callback = dispatchEnd
	-- end

	if not FightHelper.checkIsChatType(self._battleData.battleType) then 
		dispatchEnd(checkType)
		return 
	end

	--已经通关的不出动画
	if self._battleData.alreadyPass then
		dispatchEnd(checkType)
		return
	end

	local storyTouch = FightHelper.checkStoryChat(checkType, waveId, self._battleData.stageId, self._report:isWin(), heroId)
	if storyTouch then 
		self:_startStoryChat(storyTouch, function() dispatchEnd(checkType, waveId) end)
		return
	end
	dispatchEnd(checkType, waveId) 

	--检测是否有对话
	-- local hasChat = false
	-- local count = StoryTouch.length()
	-- for i = 1, count do
	-- 	local touch = StoryTouch.indexOf(i)
	-- 	--检查章节,类型
	-- 	if self._battleData.stageId == touch.control_value1 and touch.control_type == checkType then
	-- 		if checkType == StoryChatConst.TYPE_BEFORE_FIGHT then			--战斗前
	-- 			if touch.control_value2 == waveId then
	-- 				self:_startStoryChat(touch.story_touch, callback)
	-- 				hasChat = true
	-- 			end
	-- 		elseif checkType == StoryChatConst.TYPE_WIN then				--胜利结束
	-- 			if self._report:isWin() and touch.control_value2 == waveId then
	-- 				if waveId == 2 and self._battleData.stageId == 100101 then		--第一场第二波结束，做特殊处理
	-- 					self:_startStoryChat(touch.story_touch, handler(self,self._xingcaiIn))
	-- 				else
	-- 					self:_startStoryChat(touch.story_touch, callback)
	-- 				end
					
	-- 				hasChat = true
	-- 			end		
	-- 		elseif checkType == StoryChatConst.TYPE_MONSTER_DIE then		--怪物死亡
	-- 			if heroId == touch.hero_id then
	-- 				self._engine:stop()
	-- 				self:_startStoryChat(touch.story_touch, handler(self, self._startEngine))
	-- 				hasChat = true
	-- 			end	
	-- 		elseif checkType == StoryChatConst.TYPE_START_ATTACK then		--攻击前，这边waveid是回合数
	-- 			if heroId == touch.hero_id and waveId == touch.control_value2 then
	-- 				self:_startStoryChat(touch.story_touch, callback)
	-- 				hasChat = true
	-- 			end
	-- 		elseif checkType == StoryChatConst.TYPE_ENTER_STAGE then		--跳入之后对话
	-- 			if heroId == touch.hero_id then
	-- 				self:_startStoryChat(touch.story_touch, callback)
	-- 				hasChat = true
	-- 			end
	-- 		end
	-- 	end 
	-- end
	-- if not hasChat then
	-- 	callback()
	-- end
end

--每波开始检查对面的武将需要展示的情况
function FightView:_checkHeroShow(waveId)
	--最后一波才展示boss,第一次通关，表里面填了showboss
	if not self._battleData.alreadyPass and self._battleData.showBossId ~= 0 and waveId == self._engine:getWaveCount() then	
		local heroShow = require("app.scene.view.heroShow.HeroShow")
		heroShow = HeroShow.create(self._battleData.showBossId, function() self:_heroShowEnd(waveId) end, true, false)
	else 
		self:_heroShowEnd(waveId)
	end
end

--展示结束后 或者没有展示
function FightView:_heroShowEnd(waveId)
	self._fightSignalManager:dispatchSignal(FightSignalConst.SIGNAL_SHOW_HERO_END, waveId)
end

--下一波,如果有新的一波，设置波次
function FightView:_nextWave()
	self._engine:setupWave()
	self._isJumpEnd = false
end

function FightView:_startEngine()
	self._engine:start()
end

function FightView:_showStartCG()
	if self._battleData.noStartCG then
		self._fightSignalManager:dispatchSignal(FightSignalConst.SIGNAL_CHECK_LEAD)
	else
		self._fightStart = require("app.scene.view.fight.FightStart").new(self._battleData, FightConfig["SPEED_DOUBLE_"..self._double])
		self:addChild(self._fightStart)
	end
end

function FightView:showEndCG(callback)
	-- self._engine:changeBattleSpeed(0.5)
	self._fightEnd = require("app.scene.view.fight.FightEnd").new(callback)
	self:addChild(self._fightEnd)
end

--战斗流程，入场，show敌方武将（如需要），对话，开始CG，打，结束慢动作（如果需要），结算
---------------------------------------------信号处理函数--------------------------------------------------------
--处理信号
function FightView:_onSignalEvent(s, ...)
	local funcName = nil
	for key, value in pairs(FightSignalConst) do
		if string.find(key, "SIGNAL_") and value == s then
			funcName = "_"..key
		end
	end
	if funcName then
		local func = self[funcName]
		if func then 
			func(self, ...)
		end
	end	
end

--波次开始
function FightView:_SIGNAL_START_WAVE(waveId)
	self._hasSlowAction = false
	self:_checkHeroShow(waveId)
end

--展示完英雄
function FightView:_SIGNAL_SHOW_HERO_END(waveId)
	self:_checkStoryChat(StoryChatConst.TYPE_BEFORE_FIGHT, waveId, 0)
end

--开场对话结束
function FightView:_SIGNAL_STORY_OPEN_CHAT_END()
	self:_showStartCG()
end

--开始战斗
function FightView:_startBattle()
	self._engine:startBattle()
	self._fightUI:setVisible(true)
	if CONFIG_HIDE_FIGHT_UI then 
		self._fightUI:setPanelVisible(false)
	end
end

--播放xx飞到角落
function FightView:_playFlySpeed(speed)
    local pic = Path.getBattleRes("btn_battle_acc0"..speed)
    local spriteSpeed = display.newSprite(pic)
    self:addChild(spriteSpeed)
    spriteSpeed:setPosition(G_ResolutionManager:getDesignCCPoint())

    local flyTime = 0.5
    local action1 = cc.MoveTo:create(flyTime, cc.p(0, 0))
    local action2 = cc.FadeOut:create(flyTime)
    local action3 = cc.ScaleTo:create(flyTime, 0.2)

    local actionSpawn = cc.Spawn:create(action1, action2, action3)
    local action4 = cc.RemoveSelf:create()
    local action = cc.Sequence:create(actionSpawn, action4)
    spriteSpeed:runAction(action)
end

--检查开始时候引导
function FightView:_SIGNAL_CHECK_LEAD()
	local function dispatchLeadEnd()
		self._fightSignalManager:dispatchSignal(FightSignalConst.SIGNAL_SPEED_ANIM_END)
	end
	local lead = FightHelper.checkSpeedLead()
	if not lead then 
		dispatchLeadEnd()
		return
	end
	local function eventFunc(event)
		if event == "fei" then 
			self:_playFlySpeed(lead)
		elseif event == "finish" then 
			dispatchLeadEnd()
		end
	end
	local effectName = ""
	if lead == 2 then 
		effectName = "moving_zhandoujiasu"
	elseif lead == 3 then 
		effectName = "moving_zhandoujiasu2"
	elseif lead == 4 then 
		effectName = "moving_zhandoujiasu3"
	end
	local effect = G_EffectGfxMgr:createPlayMovingGfx( self, effectName, nil, eventFunc , true )	
	effect:setPosition(G_ResolutionManager:getDesignCCPoint())	
	FightHelper.writeSpeedLead(lead)
end

--动画结束，开始战斗
function FightView:_SIGNAL_SPEED_ANIM_END()
	self:_startBattle()
end

--回合开始前，检查对话
function FightView:_SIGNAL_ATTACK_CHECK_CHAT()
	local round = self._engine:getBattleRound()	
	local attackId = self._engine:getAttackConfigId()
	self:_checkStoryChat(StoryChatConst.TYPE_START_ATTACK, round, attackId)
end

--攻击开始
function FightView:_SIGNAL_START_ATTACK()
	self._totalHurt = 0
end

--对话结束
function FightView:_SIGNAL_UNIT_CHAT_END(checkType)
	local waveId = self._engine:getWaveId()
	if checkType == StoryChatConst.TYPE_START_ATTACK then 
		self._fightSignalManager:dispatchSignal(FightSignalConst.SIGNAL_START_ATTACK)
	--如果是怪物死亡对话，会暂停引擎，所以需要启动
	elseif StoryChatConst.TYPE_MONSTER_DIE == checkType then 
		self._engine:start()
	elseif checkType == StoryChatConst.TYPE_WIN then	
				--胜利结束
		if self._report:isWin() then
			if waveId == 2 and self._battleData.stageId == 100101 and not self._battleData.alreadyPass then		--第一场第二波结束，做特殊处理
				self:_xingcaiIn()
				return 
			end
		end	
		local totalWave = self._engine:getWaveCount()	
		if waveId < totalWave then
			self:_nextWave()
		else
			if self._report:isWin() then
				self:showSummary()
			end
		end	
	end
end

--回合开始
function FightView:_SIGNAL_ROUND_START()
	self._fightUI:updateRound()
end

--伤害事件
function FightView:_SIGNAL_HURT_VALUE(value)
	self._totalHurt = self._totalHurt + value
	local damageType = -1
	if self._totalHurt > 0 then
		damageType = 1
	end
	self._fightUI:updateTotalHurt(self._totalHurt, damageType)
end

--最后慢动作
function FightView:_SIGNAL_DO_FINAL_SLOW()
	self._fightUI:setVisible(false)
	self._hasSlowAction = true
end

--攻击结束
function FightView:_SIGNAL_ATTACK_FINISH()
	self._fightUI:hideTotalHurt()
end

--合击技能
function FightView:_SIGNAL_IN_COMBINE()
	-- self._fightUI:setJumpVisible(true)	
end

--合击技能结束
function FightView:_SIGNAL_OUT_COMBINE()
	-- self._fightUI:setJumpVisible(true)
end

--掉落物品
function FightView:_SIGNAL_DROP_ITEM()
	self._dropCount = self._dropCount + 1
	self._fightUI:setItemCount(self._dropCount)
end

--跑图结束
function FightView:_SIGNAL_RUN_MAP_FINISH()
	local mapIndex = self._engine:getWaveId()
	self._scene:changeBG(self._battleData.background[mapIndex])
end

--todo 处理
--波次结束
function FightView:_SIGNAL_FINISH_WAVE(waveId)
	self._buffManager:clearAllBuff()
	-- local waveId = self._engine:getWaveId()
	-- local totalWave = self._engine:getWaveCount()
	-- if waveId ~= totalWave then 
	local waveId = self._engine:getWaveId()
	self:_checkStoryChat(StoryChatConst.TYPE_WIN, waveId, 0)
	-- end

-- 	self._buffManager:clearAllBuff()
-- 	local totalWave = self._engine:getWaveCount()
-- 	local waveId = self._engine:getWaveId()
-- 	if self._report:isWin() then 
-- 		local waveId = self._engine:getWaveId()
-- 		self:_checkStoryChat(StoryChatConst.TYPE_WIN, waveId, 0)
-- 	end

-- 	if self._isJumpEnd then
-- 		self:showSummary()
-- 	else
-- 		if not self._report:isWin() then
-- 			self:showSummary()
-- 			self._engine:checkMosterEndTalk()
-- 		else 
-- 			if not self._hasSlowAction then 
-- 				self:showSummary()
-- 			end
-- 		end
-- 	end
end

--播放合击flash
function FightView:_SIGNAL_PLAY_COMBINE_FLASH(flash)
	local function eventFunc(event)
		if event == "finish" then
			self._fightSignalManager:dispatchSignal(FightSignalConst.SIGNAL_COMBINE_SHOW_END)
		end
	end
	G_EffectGfxMgr:createPlayMovingGfx( self, flash, nil, eventFunc, true)	
end

-- 人物死亡
function FightView:_SIGNAL_UNIT_DIE(unitId)
	self:_checkStoryChat(StoryChatConst.TYPE_MONSTER_DIE, 0, unitId)
end

--跳入后检查对话
function FightView:_SIGNAL_JUMP_TALK(callback, heroId)
	self:_checkStoryChat(StoryChatConst.TYPE_ENTER_STAGE, 0, heroId, callback)
end

--播放胜负已分动画
function FightView:_SIGNAL_SHOW_ENDCG()
	local function checkLastChat()
		self:_checkStoryChat(StoryChatConst.TYPE_WIN, 0, 0)
	end
	if self._report:isWin() then
		self:showEndCG(checkLastChat)
	end
end

--检查跳过后结算
function FightView:_SIGNAL_JUMP_WAVE()
	self._isJumpEnd = true
	if not self._report:isWin() then
		self._engine:checkMosterEndTalk()
	end
end


--神兽释放技能
function FightView:_SIGNAL_PLAY_PET_SKILL(camp, anim, petId, color)
	if anim ~= "" then 
		self._fightUI:playSkillAnim(camp, anim, petId, color)
	end
end

function FightView:_SIGNAL_FIGHT_END()
	-- if self._report:isWin() then 
	-- 	local waveId = self._engine:getWaveId()
	-- 	self:_checkStoryChat(StoryChatConst.TYPE_WIN, waveId, 0)
	-- end

	if self._isJumpEnd then
		if self._report:isWin() then 
			local waveId = self._engine:getWaveId()
			self:_checkStoryChat(StoryChatConst.TYPE_WIN, waveId, 0)
		else
			self:showSummary()
		end
	else
		if not self._report:isWin() then
			self:showSummary()
			self._engine:checkMosterEndTalk()
		else 
			if not self._hasSlowAction then 
				self:showSummary()
			end
		end
	end
end

function FightView:_SIGNAL_HISTORY_SHOW(hisCamp, hisId, skillShowId, stageId)
	self._fightUI:playHistoryAnim(hisCamp, hisId, skillShowId, stageId)
end





-- --处理engine抛出的信号
-- function FightView:_onFightSignal(s, ...)
-- 	local funcName = nil
-- 	for key, value in pairs(Engine) do
-- 		if string.find(key, "SIGNAL_") and value == s then
-- 			funcName = "_"..key
-- 		end
-- 	end
-- 	if funcName then
-- 		local func = self[funcName]
-- 		assert(func, "has not func name = "..funcName)
-- 		func(self, ...)
-- 	end
-- end



-- --攻击开始
-- function FightView:_SIGNAL_START_ATTACK(callback)
-- 	self._totalHurt = 0
-- 	local round = self._engine:getBattleRound()	
-- 	local attackId = self._engine:getAttackConfigId()
-- 	self:_checkStoryChat(StoryChatConst.TYPE_START_ATTACK, round, attackId, callback)
-- end

return FightView
