-- local ViewBase = require("app.ui.ViewBase")
local FightView = require("app.scene.view.fight.FightView")
local FirstFightView = class("FirstFightView", FightView)
local Engine = require("app.fight.Engine")
local FightSignalManager = require("app.fight.FightSignalManager")
local FightSignalConst = require("app.fight.FightSignalConst")
local BuffManager = require("app.fight.BuffManager")
local scheduler = require("cocos.framework.scheduler")
local AudioConst = require("app.const.AudioConst")
local StoryTouch = require("app.config.story_touch")
local HeroShow = require("app.scene.view.heroShow.HeroShow")
local StoryChatConst = require("app.const.StoryChatConst")

FirstFightView.CONFIG = 
{
	report = "fake_report_0",
	-- report = "fight_report",
    background = 1,
    showJump = false,
    showBossId = 0,
	battleType = 1,
	chapterId = 100100,
	battleSpeed = 1,
	noStartCG = true,
}

function FirstFightView:ctor(callback)
    local report = require("app.config."..FirstFightView.CONFIG.report)
	local ReportParser = require("app.fight.report.ReportParser")
	self._report = ReportParser.parse(report)
    self._fightUI = nil
    self._fightStart = nil
    self._scheduler = nil
    self._totalHurt = 0
	self._callback = callback
	local battleData = {
		stageId = FirstFightView.CONFIG.chapterId,
		battleType = FirstFightView.CONFIG.battleType,
		noStartCG = FirstFightView.CONFIG.noStartCG,
	}
    FirstFightView.super.ctor(self, self._report, battleData)
	self:setName("FirstFightView")
	self._double = FirstFightView.CONFIG.battleSpeed
end

function FirstFightView:onCreate()
	-- local size = cc.size(math.min(1136, display.width), math.min(640, display.height))
	local size = G_ResolutionManager:getDesignCCSize()
	self:setContentSize(G_ResolutionManager:getDesignSize())
	self._size = size

    self._scene = require("app.fight.Scene").new(FirstFightView.CONFIG.background)
    self._scene:setPosition(size.width*0.5, size.height*0.5)
    self:addChild(self._scene)   

   
    self._engine = Engine.create(self._scene)
    self._buffManager = BuffManager.create(self._engine)
	self._engine:startWithPreload(self._report, handler(self, self._removeStartCloud))

	self._fightSignalManager = FightSignalManager.create()

    self._scheduler = scheduler.scheduleGlobal(handler(self, self._update), 0.1)
    self._fightUI = require("app.scene.view.fight.FightUI").new()
    self:addChild(self._fightUI)
    self._fightUI:setPosition(CC_DESIGN_RESOLUTION.width*0.5, CC_DESIGN_RESOLUTION.height*0.5)
	self._fightUI:setPanelVisible(false)
	self._fightUI:setJumpStoryVisible(true)

	self:_createStartCloud()
end

function FirstFightView:onEnter()
	G_AudioManager:playMusicWithId(AudioConst.MUSIC_FIGHT)
	self._engine:changeBattleSpeed(FirstFightView.CONFIG.battleSpeed)
	self._listenerSignal = self._fightSignalManager:addListenerHandler(handler(self, self._onSignalEvent))
end

function FirstFightView:onExit()
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

function FirstFightView:_update(f)
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
function FirstFightView:showSummary()
	if self._callback then
		self._callback()
		return
	end
	G_SceneManager:popScene()
end

--每波开始检查对面的武将需要展示的情况
function FirstFightView:_checkHeroShow(waveId)

    local showId = FirstFightView.CONFIG.showBossId
    if showId == 0 then
		self:_heroShowEnd(waveId)
		return
    end

	if waveId == self._engine:getWaveCount() then
		local heroShow = require("app.scene.view.heroShow.HeroShow")
		heroShow = HeroShow.create(showId, function() self:_heroShowEnd(waveId) end, true, true)
		return true
	end
	return false
end

--检查开始时候引导
function FirstFightView:_SIGNAL_CHECK_LEAD()
	local Engine = require("app.fight.Engine")
	Engine.getEngine():startBattle()
	self._fightUI:setVisible(true)
end


function FirstFightView:_SIGNAL_FINISH_WAVE(waveId)
	self:showSummary()
end

--开始对话
function FirstFightView:_startStoryChat(storyTouch, callback)
	local storyChat = require("app.scene.view.storyChat.PopupStoryChat").new(storyTouch, callback)
	storyChat:open()
	local function jumpFunc()
		self._engine:jumpToEnd()
	end
	storyChat:setJumpCallback(jumpFunc)
end

function FirstFightView:_createStartCloud()
	self._nodeCloud = cc.Node:create()
	self:addChild(self._nodeCloud)

	local MainUIHelper =  require("app.scene.view.main.MainUIHelper")
	local config = MainUIHelper.getCurrShowSceneConfig()

	local s = config.load--"res/ui3/login/img_loginloading3.jpg"
	if cc.FileUtils:getInstance():isFileExist("channel_login.jpg") then
		s = "channel_login.jpg"
	end
	local picBack = display.newSprite(s)
	picBack:setAnchorPoint(cc.p(0.5, 0.5))
	picBack:setPosition(G_ResolutionManager:getDesignCCPoint())
	self._nodeCloud:addChild(picBack)
	G_WaitingMask:showWaiting(true)
end

function FirstFightView:_removeStartCloud()
	self._nodeCloud:removeFromParent()
	G_WaitingMask:showWaiting(false)
end

return FirstFightView
