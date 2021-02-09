
-- Author: nieming
-- Date:2018-05-09 15:45:39
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local CountryBossSmallBossView = class("CountryBossSmallBossView", ViewBase)
local TopBarStyleConst = require("app.const.TopBarStyleConst")
local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")
local CountryBossConst = require("app.const.CountryBossConst")



function CountryBossSmallBossView:ctor(bossId)

	--csb bind var name
	self._btnFight = nil  --Button
	self._commonChat = nil  --CommonMiniChat
	self._heroAvatar = nil  --CommonStoryAvatar
	self._nodeBlood = nil  --SingleNode
	self._nodeReward = nil  --SingleNode
	self._panelDesign = nil  --Panel
	self._rankParentNode = nil  --SingleNode
	self._topbarBase = nil  --CommonTopbarBase

	self._bossId = bossId
	local cfg = CountryBossHelper.getBossConfigById(self._bossId)
	self._cd = CountryBossHelper.getStage1AttackCd()
	self._battleBackgroundId = cfg.battle_scene
	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("CountryBossSmallBossView", "countrybosssmallboss"),
		binding = {
			_btnFight = {
				events = {{event = "touch", method = "_onBtnFight"}}
			},
		},
	}
	CountryBossSmallBossView.super.ctor(self, resource, self._battleBackgroundId)
end

-- Describle：
function CountryBossSmallBossView:onCreate()
	self._topbarBase:setImageTitle("txt_sys_com_sanguozhanji")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_GOLD_GACHA, true)
	self._topbarBase:hideBG()
	self:_makeBackGroundBottom()
	self:_initWidget()
	local cfg = CountryBossHelper.getBossConfigById(self._bossId)
	self._heroAvatar:updateUI(cfg.hero_id)
	self._heroAvatar:setScale(0.8)
	self._recordBossDieState = self:_isCurBossDie()
end

-- Describle：
function CountryBossSmallBossView:onEnter()
	self._signalFightBoss = G_SignalManager:add(SignalConst.EVENT_ATTACK_COUNTRY_BOSS_SUCCESS, handler(self, self._onEventBattle))
	self._signalSyncBoss = G_SignalManager:add(SignalConst.EVENT_SYNC_COUNTRY_BOSS_SUCCESS, handler(self, self._onEventSyncBoss))
	self._signalRecvFlushData = G_SignalManager:add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(self, self._onEventRecvFlushData))
	self._signalEnter = G_SignalManager:add(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS, handler(self, self._onEventEnter))
	self._signalForeground = G_SignalManager:add(SignalConst.EVENT_MAY_ENTER_FOREGROUND, handler(self, self._onEventForeground))

	self:_refreshView()
end

-- Describle：
function CountryBossSmallBossView:onExit()
	self._signalFightBoss:remove()
	self._signalFightBoss = nil

	self._signalSyncBoss:remove()
	self._signalSyncBoss = nil

	self._signalRecvFlushData:remove()
	self._signalRecvFlushData = nil

	self._signalEnter:remove()
	self._signalEnter = nil

	self._signalForeground:remove()
	self._signalForeground = nil
end

function CountryBossSmallBossView:_initWidget()
	local BloodNode = require("app.scene.view.countryboss.BloodNode")
	local AwardNode = require("app.scene.view.countryboss.AwardNode")
	local RankNode = require("app.scene.view.countryboss.RankNode")

	self._bloodWidget = BloodNode.new(self._bossId)
	self._nodeBlood:addChild(self._bloodWidget)

	self._rankWidget = RankNode.new(self._bossId)
	self._rankParentNode:addChild(self._rankWidget)

	self._awardWidget = AwardNode.new(self._bossId)
	self._nodeReward:addChild(self._awardWidget)

	local FightBtn = require("app.scene.view.countryboss.FightBtn")
	self._fightWidget = FightBtn.new(self._fightTextImage, self._fightCountdown, function()
		return self._cd + G_UserData:getCountryBoss():getChallenge_boss_time1()
	end, self._InterceptCountdownBg)

	local StageWidget = require("app.scene.view.countryboss.StageWidget")
	self._stageWidget = StageWidget.new(self, handler(self, self._onStageChangeCallback))

	self._commonCountDown:setCountdownLableParam({color = Colors.DARK_BG_THREE, outlineColor = Colors.BRIGHT_BG_OUT_LINE_TWO})
	self._commonCountDown:setEndLabelParam({color = Colors.DARK_BG_THREE, outlineColor = Colors.BRIGHT_BG_OUT_LINE_TWO})
	self._commonCountDown:setCountdownTimeParam({color = Colors.BRIGHT_BG_RED, outlineColor = Colors.BRIGHT_BG_OUT_LINE_TWO})
end

function CountryBossSmallBossView:_isCurBossDie()
	local bossData = G_UserData:getCountryBoss():getBossDataById(self._bossId)
	if not bossData then
		return
	end
	return bossData:isBossDie()
end

-- Describle：
function CountryBossSmallBossView:_onBtnFight()
	-- body
	local bossData = G_UserData:getCountryBoss():getBossDataById(self._bossId)
	if not bossData then
		return
	end
	if bossData:isBossDie() then
		G_Prompt:showTip(CountryBossHelper.getKillTip(self._bossId))
		return
	end

	if CountryBossHelper.getStage() ~= CountryBossConst.STAGE1 then
		G_Prompt:showTip(Lang.get("country_boss_fight_time_end"))
		return
	end

	if not self._fightWidget:canFight() then
		G_Prompt:showTip(Lang.get("country_boss_fight_cd"))
		return
	end
	G_UserData:getCountryBoss():c2sAttackCountryBoss(self._bossId)
end

function CountryBossSmallBossView:_onEventBattle(event, message)
	if(message == nil)then return end
    local battleReport = rawget(message, "report")
    if battleReport == nil then
        return
    end
	local ReportParser = require("app.fight.report.ReportParser")
    local reportData = ReportParser.parse(battleReport)
    local battleData = require("app.utils.BattleDataHelper").parseCountryBoss(message, self._battleBackgroundId)
    G_SceneManager:showScene("fight", reportData, battleData)
end

function CountryBossSmallBossView:_upadteStage()
	local curStage = self._stageWidget:updateStage()
	self._btnFight:setVisible(false)
	if curStage == CountryBossConst.STAGE1 then
		local _, endTime = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE1)
		self._commonCountDown:startCountDown(Lang.get("country_boss_countdown_label1"), endTime)
		self._btnFight:setVisible(true)
	elseif curStage == CountryBossConst.STAGE2 then
		local _, endTime = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE2)
		self._commonCountDown:startCountDown(Lang.get("country_boss_countdown_label2"), endTime)
	elseif curStage == CountryBossConst.STAGE3 then
		local _, endTime = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE3)
		self._commonCountDown:startCountDown(Lang.get("country_boss_countdown_label3"), endTime)
	else
		self._commonCountDown:setEndLabelString(Lang.get("country_boss_countdown_label4"))
	end
end

function CountryBossSmallBossView:_onStageChangeCallback(curStage)
	if curStage ~= CountryBossConst.STAGE1 then
		G_SceneManager:popScene()
		return
	end
	self:_refreshView()
end

function CountryBossSmallBossView:_onEventSyncBoss()
	self:_refreshView()
end

function CountryBossSmallBossView:_onEventEnter()
	self:_refreshView()
end


function CountryBossSmallBossView:_refreshView()
	self._fightWidget:update()
	self._bloodWidget:updateUI()
	self._rankWidget:updateUI()
	self:_gotoOtherCity()
	self:_upadteStage()
end


function CountryBossSmallBossView:_gotoOtherCity()
	local oldIsBossDie = self._recordBossDieState
	self._recordBossDieState = self:_isCurBossDie()
	if oldIsBossDie == false and self._recordBossDieState == true then
		local function onBtnGo()
	       G_SceneManager:popScene()
		end
		local cfg = CountryBossHelper.getBossConfigById(self._bossId)
		local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("country_boss_goto_fight_big_boss_title"), nil,onBtnGo)
		local content = Lang.get("country_boss_goto_fight_other_samll_boss", {name = cfg.name})
		PopupSystemAlert:setContentWithRichTextType3(content, Colors.BRIGHT_BG_TWO, 22, 10)
		PopupSystemAlert:setCheckBoxVisible(false)
		PopupSystemAlert:showGoButton(Lang.get("country_boss_goto_fight_btn_name"))
		PopupSystemAlert:setCloseVisible(true)
		PopupSystemAlert:openWithAction()
	end
end


function CountryBossSmallBossView:_onEventRecvFlushData()
	G_UserData:getCountryBoss():c2sEnterCountryBoss()
end

function CountryBossSmallBossView:_onEventForeground()
	G_UserData:getCountryBoss():c2sEnterCountryBoss()
end


return CountryBossSmallBossView
