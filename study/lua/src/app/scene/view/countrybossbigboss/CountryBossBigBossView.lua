
-- Author: nieming
-- Date:2018-05-09 15:45:36
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local CountryBossBigBossView = class("CountryBossBigBossView", ViewBase)
local TopBarStyleConst = require("app.const.TopBarStyleConst")
local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")
local CountryBossConst = require("app.const.CountryBossConst")
local BullectScreenConst = require("app.const.BullectScreenConst")
local UserDataHelper = require("app.utils.UserDataHelper")

function CountryBossBigBossView:waitEnterMsg(callBack, param)
	if param then
		local bossId, isNeedRequestEnter = unpack(param)
		if isNeedRequestEnter then
			local function onMsgCallBack()
				callBack()
			end
			G_UserData:getCountryBoss():c2sEnterCountryBoss()
			G_UserData:getAuction():c2sGetAllAuctionInfo()
			local signal = G_SignalManager:add(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS, onMsgCallBack)
			return signal
		else
			callBack()
		end
	else
		callBack()
	end
end

function CountryBossBigBossView:ctor(bossId, isNeedRequestEnter)
	--csb bind var name
	self._btnFight = nil  --Button
	self._btnIntercept  = nil  --Button
	self._commonChat = nil  --CommonMiniChat
	self._nodeBlood = nil  --SingleNode
	self._nodeReward = nil  --SingleNode
	self._panelDesign = nil  --Panel
	self._rankParentNode = nil  --SingleNode
	self._topbarBase = nil  --CommonTopbarBase


	self._fightCd = CountryBossHelper.getStage3AttackCd()
	self._interceptCd = CountryBossHelper.getStage3InterceptCd()
	self._bossId = bossId
	self._isNeedRequestEnter = isNeedRequestEnter
	local cfg = CountryBossHelper.getBossConfigById(self._bossId)
	self._battleBackgroundId = cfg.battle_scene
	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("CountryBossBigBossView", "countrybossbigboss"),
		binding = {
			_btnFight = {
				events = {{event = "touch", method = "_onBtnFight"}}
			},
			_btnIntercept = {
				events = {{event = "touch", method = "_onBtnIntercept"}}
			},
		},
	}
	CountryBossBigBossView.super.ctor(self, resource, self._battleBackgroundId)
end

-- Describle：
function CountryBossBigBossView:onCreate()
	self._topbarBase:setImageTitle("txt_sys_com_sanguozhanji")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_GOLD_GACHA, true)
	self._topbarBase:hideBG()
	self:_makeBackGroundBottom()
	self._danmuPanel = self._commonChat:getPanelDanmu()
	self._danmuPanel:addClickEventListenerEx(handler(self,self._onBtnDanmu))
	self._danmuPanel:setVisible(true)
	G_BulletScreenManager:setBulletScreenOpen(BullectScreenConst.COUNTRY_BOSS_TYPE,true)
	self:_updateBulletScreenBtn(BullectScreenConst.COUNTRY_BOSS_TYPE)

	self:_initWidget()
	self:_initAvatar()

	if self._isNeedRequestEnter then
		self._topbarBase:setCallBackOnBack(function()
			G_SceneManager:popScene()
			G_SceneManager:showScene("countryboss", true)
		end)
	end
end

-- Describle：
function CountryBossBigBossView:onEnter()
	self._signalFightBoss = G_SignalManager:add(SignalConst.EVENT_ATTACK_COUNTRY_BOSS_SUCCESS, handler(self, self._onEventBattle))
	self._signalInterceptList = G_SignalManager:add(SignalConst.EVENT_INTERCEPT_COUNTRY_BOSS_LIST_SUCCESS, handler(self, self._onEventInteceptList))
	self._signalSyncBossUser = G_SignalManager:add(SignalConst.EVENT_SYNC_COUNTRY_BOSS_USER_SUCCESS, handler(self, self._onEventSyncIntercept))
	self._signalSyncBoss = G_SignalManager:add(SignalConst.EVENT_SYNC_COUNTRY_BOSS_SUCCESS, handler(self, self._onEventSyncBoss))
	self._signalUserList = G_SignalManager:add(SignalConst.EVENT_GET_MAX_COUNTRY_BOSS_LIST_SUCCESS, handler(self, self._onEventGetAttackUserList))
	self._signalBulletNotice   = G_SignalManager:add(SignalConst.EVENT_BULLET_SCREEN_POST, handler(self, self._onEventBulletNotice))
	self._signalGetAuctionInfo = G_SignalManager:add(SignalConst.EVENT_GET_ALL_AUCTION_INFO, handler(self, self._onEventGetAuctionInfo))
	self._signalRecvFlushData = G_SignalManager:add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(self, self._onEventRecvFlushData))
	self._signalEnter = G_SignalManager:add(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS, handler(self, self._onEventEnter))
	self._signalForeground = G_SignalManager:add(SignalConst.EVENT_MAY_ENTER_FOREGROUND, handler(self, self._onEventForeground))

	if self._isBulletOpen then
		G_BulletScreenManager:setBulletScreenOpen(BullectScreenConst.COUNTRY_BOSS_TYPE,true)
	end
	self:_refreshView()
	CountryBossHelper.popGoAuction()
end



-- Describle：
function CountryBossBigBossView:onExit()
	self._signalFightBoss:remove()
	self._signalFightBoss = nil

	self._signalInterceptList:remove()
	self._signalInterceptList = nil

	self._signalSyncBossUser:remove()
	self._signalSyncBossUser = nil

	self._signalSyncBoss:remove()
	self._signalSyncBoss = nil

	self._signalUserList:remove()
	self._signalUserList = nil

	self._signalBulletNotice:remove()
	self._signalBulletNotice = nil

	self._signalGetAuctionInfo:remove()
	self._signalGetAuctionInfo = nil

	self._signalRecvFlushData:remove()
	self._signalRecvFlushData = nil

	self._signalEnter:remove()
	self._signalEnter = nil

	self._signalForeground:remove()
	self._signalForeground = nil

	local runningScene = G_SceneManager:getTopScene()
	if runningScene and runningScene:getName() ~= "fight" then
		--关闭弹幕，弹出场景
		logWarn("G_BulletScreenManager:clearBulletLayer()")
		G_BulletScreenManager:clearBulletLayer()
		--G_UserData:getBulletScreen():setBulletScreenOpen(1, false)
	end
end

function CountryBossBigBossView:_initWidget()
	local BloodNode = require("app.scene.view.countryboss.BloodNode")
	local AwardNode = require("app.scene.view.countryboss.AwardNode")
	local RankNode = require("app.scene.view.countryboss.RankNode")
	--血条
	self._bloodWidget = BloodNode.new(self._bossId)
	self._nodeBlood:addChild(self._bloodWidget)
	--排行
	self._rankWidget = RankNode.new(self._bossId)
	self._rankParentNode:addChild(self._rankWidget)
	--奖励
	self._awardWidget = AwardNode.new(self._bossId)
	self._nodeReward:addChild(self._awardWidget)
	--挑战按钮
	local FightBtn = require("app.scene.view.countryboss.FightBtn")
	self._fightWidget = FightBtn.new(self._fightTextImage, self._fightCountdown, function()
		return self._fightCd + G_UserData:getCountryBoss():getChallenge_boss_time2()
	end, self._fightCountdownBg)
	--拦截按钮
	self._interceptWidget = FightBtn.new(self._InterceptTextImage, self._InterceptCountdown, function()
		return self._interceptCd + G_UserData:getCountryBoss():getChallenge_boss_user()
	end, self._InterceptCountdownBg)

	--user 站位
	local AvatarPostion = require("app.scene.view.countrybossbigboss.AvatarPostion")
	self._avatarPosition = AvatarPostion.new(self._nodeAvatarParent)

	local StageWidget = require("app.scene.view.countryboss.StageWidget")
	self._stageWidget = StageWidget.new(self, handler(self, self._onStageChangeCallback))


	self._commonCountDown:setCountdownLableParam({color = Colors.DARK_BG_THREE, outlineColor = Colors.BRIGHT_BG_OUT_LINE_TWO})
	self._commonCountDown:setEndLabelParam({color = Colors.DARK_BG_THREE, outlineColor = Colors.BRIGHT_BG_OUT_LINE_TWO})
	self._commonCountDown:setCountdownTimeParam({color = Colors.BRIGHT_BG_RED, outlineColor = Colors.BRIGHT_BG_OUT_LINE_TWO})

end


-- Describle：
function CountryBossBigBossView:_onBtnFight()
	-- body
	local bossData = G_UserData:getCountryBoss():getBossDataById(self._bossId)
	if not bossData then
		return
	end
	if bossData:isBossDie() then
		G_Prompt:showTip(CountryBossHelper.getKillTip(self._bossId))
		return
	end
	if CountryBossHelper.getStage() ~= CountryBossConst.STAGE3 then
		G_Prompt:showTip(Lang.get("country_boss_fight_time_end"))
		return
	end
	if not self._fightWidget:canFight() then
		G_Prompt:showTip(Lang.get("country_boss_fight_cd"))
		return
	end
	G_UserData:getCountryBoss():c2sAttackCountryBoss(self._bossId)
end
-- Describle：
function CountryBossBigBossView:_onBtnIntercept ()
	-- body
	local bossData = G_UserData:getCountryBoss():getBossDataById(self._bossId)
	if not bossData then
		return
	end
	if bossData:isBossDie() then
		G_Prompt:showTip(CountryBossHelper.getKillTip(self._bossId))
		return
	end

	if not self._interceptWidget:canFight() then
		G_Prompt:showTip(Lang.get("country_boss_intercept_cd"))
		return
	end
	G_UserData:getCountryBoss():c2sInterceptCountryBossList(self._bossId)
end

function CountryBossBigBossView:_onEventBattle(event, message)
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

function CountryBossBigBossView:_onEventSyncIntercept()
	self._fightWidget:update()
end

function CountryBossBigBossView:_onEventSyncBoss()
	self:_refreshView()
end

function CountryBossBigBossView:_onEventEnter()
	self:_refreshView()
end

function CountryBossBigBossView:_refreshView()
	self._fightWidget:update()
	self._interceptWidget:update()
	self._bloodWidget:updateUI()
	self._rankWidget:updateUI()
	self._avatarPosition:updateBossState()
	self:_upadteStage()
	self:_checkBossDieStopBullet()
end

function CountryBossBigBossView:_checkBossDieStopBullet()

	if CountryBossHelper.isBossDie(self._bossId) then
		G_BulletScreenManager:clearBulletLayer()
	end
end


function CountryBossBigBossView:_onEventInteceptList()
	local PopupCountryBossIntercept = require("app.scene.view.countryboss.PopupCountryBossIntercept")
	local p = PopupCountryBossIntercept.new(self._bossId)
	p:openWithAction()
end


function CountryBossBigBossView:_upadteStage()
	local curStage = self._stageWidget:updateStage()
	if curStage == CountryBossConst.STAGE3 then
		local _, endTime = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE3)
		self._commonCountDown:startCountDown(Lang.get("country_boss_countdown_label3"), endTime)
		self._btnFight:setVisible(true)
		self._btnIntercept:setVisible(true)
	else
		self._btnFight:setVisible(false)
		self._btnIntercept:setVisible(false)
		self._commonCountDown:setEndLabelString(Lang.get("country_boss_countdown_label4"))
	end
end

function CountryBossBigBossView:_initAvatar()
	self._avatarPosition:addBoss(self._bossId)
	G_UserData:getCountryBoss():c2sGetMaxCountryBossList(self._bossId)
end

function CountryBossBigBossView:_onEventGetAttackUserList(id, userList)
	if not userList then
		return
	end
	for k , v in pairs(userList) do
		self._avatarPosition:addUserAvatar(v)
	end

end

function CountryBossBigBossView:_updateBulletScreenBtn( bulletType )
	-- body
	self._danmuPanel:getSubNodeByName("Node_1"):setVisible(false)
	self._danmuPanel:getSubNodeByName("Node_2"):setVisible(false)
	local bulletOpen = G_UserData:getBulletScreen():isBulletScreenOpen(bulletType)
	if bulletOpen == true then
		self._danmuPanel:getSubNodeByName("Node_1"):setVisible(true)
		G_BulletScreenManager:showBulletLayer()
		self._isBulletOpen = true
	else
		self._danmuPanel:getSubNodeByName("Node_2"):setVisible(true)
		G_BulletScreenManager:hideBulletLayer()
		self._isBulletOpen = false
	end
end

function CountryBossBigBossView:_onBtnDanmu( ... )
	-- body
	logWarn("CountryBossBigBossView:_onBtnDanmu")
	local bulletOpen = G_UserData:getBulletScreen():isBulletScreenOpen(BullectScreenConst.COUNTRY_BOSS_TYPE)
	G_UserData:getBulletScreen():setBulletScreenOpen(BullectScreenConst.COUNTRY_BOSS_TYPE, not bulletOpen)
	self:_updateBulletScreenBtn(BullectScreenConst.COUNTRY_BOSS_TYPE)
end

function CountryBossBigBossView:_onEventBulletNotice( id,message  )
    local user = rawget(message, "user") or {}
    local userData = {}
    userData.userId = user.user_id or 0
    userData.name = user.name
    userData.officialLevel = user.officer_level
    local covertId, param = UserDataHelper.convertAvatarId(user)
    userData.baseId = covertId
    userData.limitLevel = param.limitLevel

	if userData.userId == 0 then
		return
	end

	if userData.userId == G_UserData:getBase():getId() then
		return
	end
	self._avatarPosition:pushAttack(userData)
end


function CountryBossBigBossView:_onStageChangeCallback(curStage)
	logWarn("CountryBossBigBossView _onStageChangeCallback "..curStage)
	self:_refreshView()
	if curStage == CountryBossConst.NOTOPEN then
		G_BulletScreenManager:clearBulletLayer()
		local scheduler = require("cocos.framework.scheduler")
		scheduler.performWithDelayGlobal(function()
			G_UserData:getAuction():c2sGetAllAuctionInfo()
		end, 1.2)
	end
end

function CountryBossBigBossView:_onEventGetAuctionInfo()
	CountryBossHelper.popGoAuction()
end

function CountryBossBigBossView:_onEventRecvFlushData()
	G_UserData:getCountryBoss():c2sEnterCountryBoss()
end

function CountryBossBigBossView:_onEventForeground()
	G_UserData:getCountryBoss():c2sEnterCountryBoss()
end

return CountryBossBigBossView
