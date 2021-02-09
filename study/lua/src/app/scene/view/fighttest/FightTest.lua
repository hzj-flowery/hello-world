local FightView = require("app.scene.view.fight.FightView")
local FightTest = class("FightTest", FightView)
local Engine = require("app.fight.Engine")
local BuffManager = require("app.fight.BuffManager")
local scheduler = require("cocos.framework.scheduler")
local AudioConst = require("app.const.AudioConst")
local StoryTouch = require("app.config.story_touch")
local HeroShow = require("app.scene.view.heroShow.HeroShow")
local FightSignalConst = require("app.fight.FightSignalConst")
local FightSignalManager = require("app.fight.FightSignalManager")
local SchedulerHelper = require ("app.utils.SchedulerHelper")

FightTest.CONFIG = 
{
	report = "fight_report",
    background = 15,
    showJump = true,
    showBossId = 0,
	startChatId = 0,
	battleType = 1,
	chapterId = 0,
	battleSpeed = 1,
	noStartCG = false,
}

function FightTest:ctor()
	local ReportParser = require("app.fight.report.ReportParser")
	local FileUtils = cc.FileUtils:getInstance()
	local path = FileUtils:getWritablePath() ..  "fake_reports/"..FightTest.CONFIG.report..".lua"
	local str = FileUtils:getStringFromFile(path)
	local fakeReport = load(str)()
	self._report = ReportParser.parse(fakeReport, true)
    self._fightUI = nil
    self._fightStart = nil
    self._scheduler = nil
	self._totalHurt = 0
	local battleData = {
		stageId = FightTest.CONFIG.chapterId,
		battleType = FightTest.CONFIG.battleType,
		noStartCG = FightTest.CONFIG.noStartCG,
	}
    FightTest.super.ctor(self, self._report, battleData)
	self:setName("FightTest")
	self._double = FightTest.CONFIG.battleSpeed
end

function FightTest:onCreate()

	local size = G_ResolutionManager:getDesignCCSize()
	self:setContentSize(G_ResolutionManager:getDesignSize())

    self._scene = require("app.fight.Scene").new(FightTest.CONFIG.background)
    self._scene:setPosition(size.width*0.5, size.height*0.5)
    self:addChild(self._scene)

    self._engine = Engine.create(self._scene)
	self._buffManager = BuffManager.create(self._engine)
	self._engine:startWithPreload(self._report)
	self._fightSignalManager = FightSignalManager.create()
	self._scheduler = SchedulerHelper.newSchedule(handler(self,self._update), 0.1)

	-- self._listenerEngine = self._engine.signal:add(handler(self, self._onFightSignal))	--剥离从engine的监听
	-- self._listenerEngineUnitDie = self._engine.signalUnitDie:add(handler(self, self._onUnitDie))
	self._fightUI = require("app.scene.view.fight.FightUI").new()
	self:addChild(self._fightUI)
	self._fightUI:setPosition(G_ResolutionManager:getDesignCCPoint())
	self._fightUI:setVisible(false)
	self._fightUI:hideTotalHurt()
	self._fightUI:setJumpVisible(self._battleData.needShowJump)

	self._hasNotice = false 	--是否提示过
end

function FightTest:onEnter()
	G_AudioManager:playMusicWithId(AudioConst.MUSIC_FIGHT)
	self._engine:changeBattleSpeed(FightTest.CONFIG.battleSpeed)
	self._listenerSignal = self._fightSignalManager:addListenerHandler(handler(self, self._onSignalEvent))
end

function FightTest:onExit()
	self._engine:stop()
	Engine.clear()

	BuffManager.clear()
	self._report:clear()

	if self._scheduler then
		scheduler.unscheduleGlobal(self._scheduler)
		self._scheduler = nil
	end
	if self._listenerSignal then
		self._listenerSignal:remove()
		self._listenerSignal = nil
	end
end

function FightTest:_update(f)
	if self._fightStart and self._fightStart:isFinish() then
		self._fightStart:removeFromParent()
		self._fightStart = nil
		self._fightUI:setVisible(true)
	end
	if self._fightUI then
		self._fightUI:update(f)
	end
end

--结算
function FightTest:showSummary()
	G_SceneManager:popScene()
	-- self:_xingcaiIn()
end

--每波开始检查对面的武将需要展示的情况
function FightTest:_checkHeroShow(waveId)
    local showId = FightTest.CONFIG.showBossId
    if showId == 0 then
		self:_heroShowEnd(waveId)
		return
    end

	if waveId == self._engine:getWaveCount() then
		local heroShow = require("app.scene.view.heroShow.HeroShow")
		heroShow = HeroShow.create(showId, function() self:_heroShowEnd(waveId) end, true, true)
	else 
		self:_heroShowEnd(waveId)
	end
	
end

-- --检查开始时候引导
function FightTest:_SIGNAL_CHECK_LEAD()
	local Engine = require("app.fight.Engine")
	Engine.getEngine():startBattle()
	self._fightUI:setVisible(true)
end

function FightTest:_SIGNAL_RUN_MAP_FINISH()
end

return FightTest
