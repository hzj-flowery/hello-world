--
-- Author: hyl
-- Date: 2019-10-11 14:20:20
-- 跨服军团boss

local ViewBase = require("app.ui.ViewBase")
local CrossWorldBossView = class("CrossWorldBossView", ViewBase)

local HomelandConst = require("app.const.HomelandConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TopBarStyleConst = require("app.const.TopBarStyleConst")
local CrossWorldBossConst = require("app.const.CrossWorldBossConst")
local AudioConst = require("app.const.AudioConst")

local CrossWorldBossPlayerAvatarNode = import(".CrossWorldBossPlayerAvatarNode")
local CrossWorldBossAvatarNode = import(".CrossWorldBossAvatarNode")
local CrossWorldBossRankNode = import(".CrossWorldBossRankNode")
local CrossWorldBossHelper = import(".CrossWorldBossHelper")
local scheduler = require("cocos.framework.scheduler")
local CrossBossParameter = require("app.config.cross_boss_parameter")

local HomelandBuffIcon = require("app.scene.view.homeland.HomelandBuffIcon")

function CrossWorldBossView:waitEnterMsg(callBack)
	local function onMsgCallBack(id, message)
        dump(message)
		callBack()
	end
	G_UserData:getCrossWorldBoss():c2sEnterCrossWorldBoss()
    local signal = G_SignalManager:add(SignalConst.EVENT_CROSS_WORLDBOSS_GET_INFO, onMsgCallBack)
	return signal
end

function CrossWorldBossView:ctor(type, index)
    self._playerAvatars = {}
    self._curBossId = 0

    self._curUiState = 0
    self._curBossState = CrossWorldBossConst.BOSS_NORMAL_STATE

    self._curActivityState = CrossWorldBossConst.ACTIVITY_STATE_NULL

    self._curBgmId = 0
    self._chargeTipsImg = {}
    self._chargeTime = 0

    self._chargeIndex = 0 -- 当前蓄力的次数

	local resource = {
		file = Path.getCSB("CrossWorldBossView", "crossworldboss"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_commonBtnRight = {
				events = {{event = "touch", method = "_onBtnRight"}}
			},
			_commonBtnLeft = {
				events = {{event = "touch", method = "_onBtnLeft"}}
            },
            _panelAvatar = {
                events = {{event = "touch", method = "_onAvatarPanelClick"}}
            },
		}
    }

	CrossWorldBossView.super.ctor(self, resource)
end

function CrossWorldBossView:onCreate()
	--self._topbarBase:setImageTitle("txt_sys_com_hecheng")
    self._topbarBase:setItemListVisible(false)

    self._nodeLeft:removeAllChildren()
    self._nodeLeft:addChild(CrossWorldBossRankNode.new())

    --self._nodeLeft:setPositionX(G_ResolutionManager:getBangOffset())
    local offset = G_ResolutionManager:getBangOffset()
    if offset and offset > 0 then
        self._nodeLeft:setPositionX(2)
    end

    self._danmuPanel = self._commonChat:getPanelDanmu()
    self._danmuPanel:addClickEventListenerEx(handler(self, self._onBtnDanmu))

    --G_AudioManager:stopMusic()
    
    G_BulletScreenManager:setBulletScreenOpen(9, true)
    G_BulletScreenManager:setBulletScreenOpen(8, true)
    G_UserData:getBulletScreen():setBulletScreenOpen(9, true)
    G_UserData:getBulletScreen():setBulletScreenOpen(8, true)
	
    self:_updateBulletScreenBtn(9)
    
    if not CrossWorldBossHelper.checkIsTodayOver() then
        local userId = G_UserData:getBase():getId()
        local data = G_StorageManager:load("crossbossdata"..userId) or {}
        local currTime = G_ServerTime:getTime()
        data["day"] = os.date("%d", currTime)
        G_StorageManager:save("crossbossdata"..userId, data)
    end

    self._imgHelpBtn:addClickEventListenerEx(handler(self, self._onHelpBtn))

    self._homelandBuff = HomelandBuffIcon.new(self._buffIcon)
end

function CrossWorldBossView:onEnter()
    self._signalEnterBossInfo = G_SignalManager:add(SignalConst.EVENT_CROSS_WORLDBOSS_GET_INFO, handler(self, self._onEventGetInfo))
    self._signalAttackBoss = G_SignalManager:add(SignalConst.EVENT_CROSS_WORLDBOSS_ATTACK_BOSS, handler(self, self._onEventAttackWorldBoss))
    self._signalBulletNotice   = G_SignalManager:add(SignalConst.EVENT_BULLET_SCREEN_POST, handler(self, self._onEventBulletNotice))
    self._signalGetGrabPoint = G_SignalManager:add(SignalConst.EVENT_CROSS_WORLDBOSS_GET_GRAB_POINT, handler(self, self._onEventGrabCrossWorldBossPoint))
    self._signalStateChange = G_SignalManager:add(SignalConst.EVENT_CROSS_WORLDBOSS_STATE_CHANGE, handler(self, self._onEventBossStateChange))
    self._signalGetAuctionInfo = G_SignalManager:add(SignalConst.EVENT_GET_ALL_AUCTION_INFO, handler(self, self._onEventGetAuctionInfo))
    self._signalUpdateBossInfo = G_SignalManager:add(SignalConst.EVENT_CROSS_WORLDBOSS_UPDATE_BOSS, handler(self, self._onEventGetInfo))
    self._signalHomelandBuffEmpty = G_SignalManager:add(SignalConst.EVENT_HOME_LAND_BUFF_EMPTY, handler(self, self._onEventHomelandBuffEmpty))

    local oldIsBossOpen = self._isBossOpen
    self._isBossOpen = G_UserData:getCrossWorldBoss():isBossStart()

    if self._isBossOpen == false and oldIsBossOpen == true then
        -- 这里防止进入战斗后玩法结束无法拉取拍卖信息的问题
        G_UserData:getCrossWorldBoss():c2sEnterCrossWorldBoss()
        G_UserData:getAuction():c2sGetAllAuctionInfo()--拉去一下拍卖数据
    end

    if self._isBossOpen == true then
        local userId = G_UserData:getBase():getId()
        local data = G_StorageManager:load("crossbossdata"..userId) or {}
        data["showNotice"] = "0"
        G_StorageManager:save("crossbossdata"..userId, data)
    end

    self._preChargeTime = string.split(CrossWorldBossHelper.getParameterStr("charge_start_time"), "|")

    self:_initChargeTimeInfo()

    self:_initWeekBossState()

    self:_initAvatarPanel()

    self:_initDayAndNight()

    self:_initCampPanel()

    self:_startRefreshHandler()

    self:_checkShowDlg()

    self:_onRefreshTick()

    self._homelandBuff:updateOneBuffById(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_24)
end

function CrossWorldBossView:onExit()
    self._signalAttackBoss:remove()
    self._signalAttackBoss = nil
    self._signalBulletNotice:remove()
    self._signalBulletNotice = nil
    self._signalGetGrabPoint:remove()
    self._signalGetGrabPoint = nil
    self._signalStateChange:remove()
    self._signalStateChange = nil
    self._signalGetAuctionInfo:remove()
    self._signalGetAuctionInfo = nil
    self._signalEnterBossInfo:remove()
    self._signalEnterBossInfo = nil
    self._signalUpdateBossInfo:remove()
    self._signalUpdateBossInfo = nil
    self._signalHomelandBuffEmpty:remove()
    self._signalHomelandBuffEmpty = nil
    
    self:_endRefreshHandler()
    self:_endLoadingBarAction()
    self:_endWeekCountDown()

    --如果进入战斗界面，则弹幕系统内容不清空
	local runningScene = G_SceneManager:getTopScene()
	if runningScene and runningScene:getName() ~= "fight" then
		--关闭弹幕，弹出场景
		logWarn("G_BulletScreenManager:clearBulletLayer()")
        G_BulletScreenManager:clearBulletLayer()
        
        --G_AudioManager:stopMusic()
	end

    self._panelAvatar:removeAllChildren()
    self._playerAvatars = {}
end

function CrossWorldBossView:_onEventHomelandBuffEmpty()
    self._homelandBuff:updateOneBuffById(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_24)
end

function CrossWorldBossView:_onHelpBtn(  )
    local UIPopupHelper = require("app.utils.UIPopupHelper")
	UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_CROSS_WORLD_BOSS)
end

function CrossWorldBossView:_onBtnDanmu( ... )
	-- body
	logWarn("CrossWorldBossView:_onBtnDanmu")
	local bulletOpen = G_UserData:getBulletScreen():isBulletScreenOpen(9)
    G_UserData:getBulletScreen():setBulletScreenOpen(9, not bulletOpen)
    G_UserData:getBulletScreen():setBulletScreenOpen(8, not bulletOpen)
	
	self:_updateBulletScreenBtn(9)
end

function CrossWorldBossView:_updateBulletScreenBtn( bulletType )
	-- body
	self._danmuPanel:getSubNodeByName("Node_1"):setVisible(false)
	self._danmuPanel:getSubNodeByName("Node_2"):setVisible(false)
	local bulletOpen = G_UserData:getBulletScreen():isBulletScreenOpen(bulletType)	
	if bulletOpen == true then
		self._danmuPanel:getSubNodeByName("Node_1"):setVisible(true)
		G_BulletScreenManager:showBulletLayer()
	else
		self._danmuPanel:getSubNodeByName("Node_2"):setVisible(true)
		G_BulletScreenManager:hideBulletLayer()
	end
end

function CrossWorldBossView:_initCampPanel(  )
    local selfCamp = G_UserData:getCrossWorldBoss():getSelf_camp()

    if selfCamp and selfCamp ~= 0 then
        self._nextTips:setVisible(false)
        self._campInfo:setVisible(true)

        local myCampIconPath = CrossWorldBossHelper.getCampIconPathById(selfCamp)
        self._imageMy:loadTexture(myCampIconPath)

        local bossId = G_UserData:getCrossWorldBoss():getBoss_id()
        local bossInfo = CrossWorldBossHelper.getBossConfigInfo(bossId)

		if bossInfo then
			local pozhaoCamp = CrossWorldBossHelper.getPozhaoCampByBossId(bossInfo.id)
			local pozhaoCampIconPath = CrossWorldBossHelper.getCampIconPathById(pozhaoCamp)
			self._imagePoZhao:loadTexture(pozhaoCampIconPath)
		end
    else
        self._nextTips:setVisible(true)
        self._campInfo:setVisible(false)
    end
end

function CrossWorldBossView:_updateBossAvatar()
    if self._bossAvatar then
        self._bossAvatar:setBossStamina()

        -- local bossState = G_UserData:getCrossWorldBoss():getState()
        -- self._bossAvatar:changeBossState(bossState)
    end
end

function CrossWorldBossView:_onEventGetInfo(id, message)
    self:_updateBossAvatar()
    --self:_updatePlayerAvatars()
	self:_checkShowDlg()
end

function CrossWorldBossView:_onEventGetAuctionInfo(id, message)
	self:_checkShowDlg()
end

--进入时，检查是否需要弹出跳转提示框
function CrossWorldBossView:_checkShowDlg()
	--是否显示弹框
	logWarn("CrossWorldBossView:_checkShowDlg show !!!!!!!!!!! start")

	--军团拍卖活动是否结束
	local AuctionConst = require("app.const.AuctionConst")
	local isAuctionWorldEnd = G_UserData:getAuction():isAuctionShow(AuctionConst.AC_TYPE_CROSS_WORLD_BOSS)
	if isAuctionWorldEnd == false then
		logWarn("CrossWorldBossView:_showGuildDlg  isAuctionWorldEnd = false ")
		--return
	end

	if G_UserData:getCrossWorldBoss():needShopPromptDlg() == true then
		logWarn("CrossWorldBossView:_checkShowDlg show !!!!!!!!!!! enter")
		local isInGuild = G_UserData:getGuild():isInGuild()
		if isInGuild then
            self:_showGuildDlg()
        else
            self:_showPersonalDlg()
		end
	end	
end

function CrossWorldBossView:_showPersonalDlg()
	logWarn("CrossWorldBossView:_showGuildDlg !!!!!!!!!!!")
	local personalRank = G_UserData:getCrossWorldBoss():getEndNoticeValue("rank")

	local personDlg = Lang.get("crossworldboss_reward_finish_show1", {
		rank = personalRank,
	})

	--跳转到拍卖界面
	local function onBtnGo()
        -- local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
        -- WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_AUCTION)
        G_SceneManager:replaceCurrentScene("auction")
	end	
	
	--世界boss结束，清空弹幕
	G_BulletScreenManager:clearBulletLayer()

	local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("worldboss_popup_title1"), personDlg,onBtnGo)
	PopupSystemAlert:setCheckBoxVisible(false)
	PopupSystemAlert:showGoButton(Lang.get("worldboss_go_btn2"))
	PopupSystemAlert:setCloseVisible(true)
	PopupSystemAlert:openWithAction()
end

function CrossWorldBossView:_showGuildDlg()
	local guildCount =  G_UserData:getCrossWorldBoss():getEndNoticeValue("number")
	if guildCount == nil then
		logWarn("CrossWorldBossView:_showGuildDlg guildCount is nil")
		return
	end
	
	logWarn("CrossWorldBossView:_showGuildDlg !!!!!!!!!!!")
	local guildPoint = G_UserData:getCrossWorldBoss():getEndNoticeValue("integral")
	local guildRank = G_UserData:getCrossWorldBoss():getEndNoticeValue("rank")
	local guildPrestige = G_UserData:getCrossWorldBoss():getEndNoticeValue("prestige")

	local personDlg = Lang.get("crossworldboss_reward_finish_show2", {
		point = guildPoint,
		count = guildCount,
		guildRank = guildRank,
		guildExp = guildPrestige,
	})

	--跳转到拍卖界面
	local function onBtnGo()
        -- local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
        -- WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_AUCTION)
        G_SceneManager:replaceCurrentScene("auction")
	end	
	
	--世界boss结束，清空弹幕
	G_BulletScreenManager:clearBulletLayer()

	local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("worldboss_popup_title1"), personDlg,onBtnGo)
	PopupSystemAlert:setCheckBoxVisible(false)
	PopupSystemAlert:showGoButton(Lang.get("worldboss_go_btn2"))
	PopupSystemAlert:setCloseVisible(true)
	PopupSystemAlert:openWithAction()
end

function CrossWorldBossView:_onEventBulletNotice(id, message)
    dump(message)

    if message == nil then
        return
    end

    local user = rawget(message, "user") or {}
    local userData = {}
    userData.userId = user.user_id or 0
    
	if userData.userId == 0 or userData.userId == G_UserData:getBase():getId() then
		return
	end
    
	local avatar = self._playerAvatars[userData.userId]
	if avatar then 
		if avatar:isAttacking() == false then
            avatar:doAttack(nil, self._bossAvatar, message.color)
		end
	end
end

function CrossWorldBossView:_onEventBossStateChange(  )
    print("_onEventBossStateChange")
    local newState = G_UserData:getCrossWorldBoss():getState()
    print("newState "..newState)

    local oldBossState = self._curBossState
    self._curBossState = newState

    -- UI 状态转换
    if newState == CrossWorldBossConst.BOSS_NORMAL_STATE then
        self:_changeToNormalState(oldBossState)
        G_AudioManager:playMusicWithId(AudioConst.SOUND_CROSS_NORMAL_STATE_BG)
        self._curBgmId = AudioConst.SOUND_CROSS_NORMAL_STATE_BG
        self:_setLoadingBarTimeAdd()
    elseif newState == CrossWorldBossConst.BOSS_CHARGE_STATE then
        self._chargeIndex = self._chargeIndex + 1
        self:_changeToChargeState()
        G_AudioManager:playMusicWithId(AudioConst.SOUND_CROSS_CHARGE_STATE_BG)
        self._chargeTime = 0
        self._curBgmId = AudioConst.SOUND_CROSS_CHARGE_STATE_BG
    elseif newState == CrossWorldBossConst.BOSS_WEAK_STATE then
        self:_playPozhaoSuccEffect()
        G_AudioManager:playSoundWithId(AudioConst.SOUND_CROSS_SHIELD_BREAK_SUCC)
        self:_changeToWeekState()
        G_AudioManager:playMusicWithId(AudioConst.SOUND_CROSS_NORMAL_STATE_BG)
        self._curBgmId = AudioConst.SOUND_CROSS_NORMAL_STATE_BG
        self:_setLoadingBarTimeAdd()
    end


    --Boss状态转换
    self._bossAvatar:changeBossState(newState)
end

function CrossWorldBossView:_changeToNormalState(oldBossState)
    print("_changeToNormalState")

    self:_changeToDay()

    if oldBossState == CrossWorldBossConst.BOSS_CHARGE_STATE then
        --破招失败
        print("破招失败")
        self:_pozhaoFailedAction()

        G_AudioManager:playSoundWithId(AudioConst.SOUND_CROSS_SHIELD_BREAK_FAILED)
    else
        self:_gotoNormalAttackPos()
    end
end

function CrossWorldBossView:_playPozhaoSuccEffect(  )
    self._pozhaoEffectNode:removeAllChildren()	
    G_EffectGfxMgr:createPlayMovingGfx(self._pozhaoEffectNode, "moving_pofang_pozhao", nil, nil, true)
end

function CrossWorldBossView:_changeToChargeState(  )
    print("_changeToChargeState")
    self:_changeToNight()
    self:_gotoSuperAttackPos()
end

function CrossWorldBossView:_changeToWeekState(  )
    print("_changeToWeekState")
    self:_changeToDay()
    self:_beginWeekCountDown()
end

-- 虚弱状态结束后服务器不一定会通知客户端，在进入界面后要判断下状态是否结束
function CrossWorldBossView:_initWeekBossState(  )
    if self._curBossState == CrossWorldBossConst.BOSS_WEAK_STATE then
        local stateStartTime = G_UserData:getCrossWorldBoss():getState_startTime()
        local curTime = G_ServerTime:getTime()
        local stateContinueTime = CrossWorldBossHelper.getParameterValue("weak_last_time")

        self._weekTime = stateStartTime + stateContinueTime - curTime
        self._weekTime = math.min(self._weekTime, stateContinueTime)

        if self._weekTime <= 0 then
            G_UserData:getCrossWorldBoss():setState(CrossWorldBossConst.BOSS_NORMAL_STATE)
        end
    end
end

function CrossWorldBossView:_beginWeekCountDown(  )
    local stateStartTime = G_UserData:getCrossWorldBoss():getState_startTime()
    local curTime = G_ServerTime:getTime()
    local stateContinueTime = CrossWorldBossHelper.getParameterValue("weak_last_time")

    self._weekTime = stateStartTime + stateContinueTime - curTime
    self._weekTime = math.min(self._weekTime, stateContinueTime)

    self._bossAvatar:setWeekCountdownLabel(self._weekTime)

    self:_endWeekCountDown()

	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self.weekCountDownHandler ~= nil then
        return 
    end
    
    if self._weekTime > 0 then
        self.weekCountDownHandler = SchedulerHelper.newSchedule(handler(self,self._weekCountDown), 1)
    end
end

function CrossWorldBossView:_weekCountDown(  )
    self._bossAvatar:setWeekCountdownLabel(self._weekTime)
    
    if self._weekTime == 0 then
        self:_endWeekCountDown()
        self:_changeToNormalState()
        self._bossAvatar:changeBossState(CrossWorldBossConst.BOSS_NORMAL_STATE)
        G_UserData:getCrossWorldBoss():setState(CrossWorldBossConst.BOSS_NORMAL_STATE)
        return
    end

    self._weekTime = self._weekTime - 1
end

function CrossWorldBossView:_endWeekCountDown(  )
    local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self.weekCountDownHandler ~= nil then
		SchedulerHelper.cancelSchedule(self.weekCountDownHandler)
		self.weekCountDownHandler = nil
	end
end

--抢夺其他玩家
function CrossWorldBossView:_onEventGrabCrossWorldBossPoint(id, message)
    local reportId = rawget(message, "report") 

	local function enterFightView(message)
		local ReportParser = require("app.fight.report.ReportParser")
		local battleReport = G_UserData:getFightReport():getReport()
        local reportData = ReportParser.parse(battleReport)
        
        local curState = G_UserData:getCrossWorldBoss():getState()
        local battleData = require("app.utils.BattleDataHelper").parseCrossWorldBossPoint(message, curState == CrossWorldBossConst.BOSS_CHARGE_STATE)
        
        G_SceneManager:showScene("fight", reportData, battleData)
        
        --进入战斗后，返回，则重新拉boss信息
	    G_UserData:getCrossWorldBoss():c2sEnterCrossWorldBoss()
    end
    
	G_SceneManager:registerGetReport(reportId, function() enterFightView(message) end)
end

--攻击boss
function CrossWorldBossView:_onEventAttackWorldBoss(id, message)
	--dump(message)    
    local battleReport = rawget(message, "report") 
    if battleReport == nil then
        print("battleReport == nil")
        -- 追击阵营攻击没有战报
        local roleAvatar = self._playerAvatars[G_UserData:getBase():getId()]
        if roleAvatar then
            roleAvatar:doAttack(nil, self._bossAvatar)
        else
            print("roleAvatar is nil")
        end

        G_UserData:getCrossWorldBoss():c2sEnterCrossWorldBoss()

        return
    end

    print("battleReport ~= nil")

    local function onFinish()
        print("onFinish")
		local ReportParser = require("app.fight.report.ReportParser")
        local reportData = ReportParser.parse(battleReport)
        
        local curState = G_UserData:getCrossWorldBoss():getState()
        local battleData = require("app.utils.BattleDataHelper").parseCrossWorldBossFight(message, curState == CrossWorldBossConst.BOSS_CHARGE_STATE)

        G_SceneManager:showScene("fight", reportData, battleData)
        
		--进入战斗后，返回，则重新拉去世界boss信息
		G_UserData:getCrossWorldBoss():c2sEnterCrossWorldBoss()
	end
	
    local roleAvatar = self._playerAvatars[G_UserData:getBase():getId()]
    if roleAvatar then
        roleAvatar:doAttack(onFinish, nil, nil, true)
    else
        print("roleAvatar is nil")
    end
end

function CrossWorldBossView:_initDayAndNight ()
    local bossState = G_UserData:getCrossWorldBoss():getState()

    self._imageDayBg1:stopAllActions()
    self._imageDayBg2:stopAllActions()
    self._imageDayBg3:stopAllActions()

    self._imageNightBg1:stopAllActions()
    self._imageNightBg2:stopAllActions()
    self._imageNightBg3:stopAllActions()

    if bossState == CrossWorldBossConst.BOSS_NORMAL_STATE or bossState == CrossWorldBossConst.BOSS_WEAK_STATE then
        self._curUiState = CrossWorldBossConst.CROSS_BOSS_UI_DAY

        self._imageDayBg1:setOpacity(255)
        self._imageDayBg2:setOpacity(255)
        self._imageDayBg3:setOpacity(255)
        self._imageNightBg1:setOpacity(0)
        self._imageNightBg2:setOpacity(0)
        self._imageNightBg3:setOpacity(0)

        if self._isBossOpen and self._curBgmId ~= AudioConst.SOUND_CROSS_NORMAL_STATE_BG then
            G_AudioManager:playMusicWithId(AudioConst.SOUND_CROSS_NORMAL_STATE_BG)
            self._curBgmId = AudioConst.SOUND_CROSS_NORMAL_STATE_BG
        end
    else
        self._curUiState = CrossWorldBossConst.CROSS_BOSS_UI_NIGHT

        self._imageDayBg1:setOpacity(0)
        self._imageDayBg2:setOpacity(0)
        self._imageDayBg3:setOpacity(0)
        self._imageNightBg1:setOpacity(255)
        self._imageNightBg2:setOpacity(255)
        self._imageNightBg3:setOpacity(255)

        if self._isBossOpen and self._curBgmId ~= AudioConst.SOUND_CROSS_CHARGE_STATE_BG then
            G_AudioManager:playMusicWithId(AudioConst.SOUND_CROSS_CHARGE_STATE_BG)
            self._curBgmId = AudioConst.SOUND_CROSS_CHARGE_STATE_BG
        end
    end

    self._nightChangeEffect:removeAllChildren()	
    self._dayChangeEffect:removeAllChildren()	
    
    self:_playSceneIdleEffect()
end

function CrossWorldBossView:_changeToNight(  )
    if self._curUiState == CrossWorldBossConst.CROSS_BOSS_UI_NIGHT then
        return
    end

    self._curUiState = CrossWorldBossConst.CROSS_BOSS_UI_NIGHT

    self._imageDayBg1:setOpacity(255)
    self._imageDayBg2:setOpacity(255)
    self._imageDayBg3:setOpacity(255)

    self._imageNightBg1:setOpacity(0)
    self._imageNightBg2:setOpacity(0)
    self._imageNightBg3:setOpacity(0)

    self._imageDayBg1:runAction(cc.FadeOut:create(1))
    self._imageDayBg2:runAction(cc.FadeOut:create(1))
    self._imageDayBg3:runAction(cc.FadeOut:create(1))

    self._imageNightBg1:runAction(cc.FadeIn:create(1))
    self._imageNightBg2:runAction(cc.FadeIn:create(1))
    self._imageNightBg3:runAction(cc.FadeIn:create(1))

    self:_playChangeToNightEffect()
end

function CrossWorldBossView:_changeToDay(  )
    if self._curUiState == CrossWorldBossConst.CROSS_BOSS_UI_DAY then
        return
    end

    self._curUiState = CrossWorldBossConst.CROSS_BOSS_UI_DAY

    self._imageDayBg1:setOpacity(0)
    self._imageDayBg2:setOpacity(0)
    self._imageDayBg3:setOpacity(0)

    self._imageNightBg1:setOpacity(255)
    self._imageNightBg2:setOpacity(255)
    self._imageNightBg3:setOpacity(255)

    
    self._imageDayBg1:runAction(cc.FadeIn:create(1))
    self._imageDayBg2:runAction(cc.FadeIn:create(1))
    self._imageDayBg3:runAction(cc.FadeIn:create(1))

    self._imageNightBg1:runAction(cc.FadeOut:create(1))
    self._imageNightBg2:runAction(cc.FadeOut:create(1))
    self._imageNightBg3:runAction(cc.FadeOut:create(1))

    self:_playChangeToDayEffect()
end

function CrossWorldBossView:_playSceneIdleEffect(  )
    local function eventFunction(event, frameIndex, movingNode)
        if event == "finish" then
        end
    end

    self._sceneIdleEffect:removeAllChildren()	
    G_EffectGfxMgr:createPlayMovingGfx(self._sceneIdleEffect, "moving_kuafuboss_changjing", nil, nil, true)
end

function CrossWorldBossView:_playChangeToDayEffect(  )
    self._nightChangeEffect:removeAllChildren()	
    G_EffectGfxMgr:createPlayMovingGfx(self._nightChangeEffect, "moving_kuafuboss_yunleng2", nil, nil, true)


    self._dayChangeEffect:removeAllChildren()	
    G_EffectGfxMgr:createPlayMovingGfx(self._dayChangeEffect, "moving_kuafuboss_yunnuan1", nil, nil, true)
end

function CrossWorldBossView:_playChangeToNightEffect(  )
    self._dayChangeEffect:removeAllChildren()	
    G_EffectGfxMgr:createPlayMovingGfx(self._dayChangeEffect, "moving_kuafuboss_yunnuan2", nil, nil, true)

    self._nightChangeEffect:removeAllChildren()	
    G_EffectGfxMgr:createPlayMovingGfx(self._nightChangeEffect, "moving_kuafuboss_yunleng1", nil, nil, true)
end

function CrossWorldBossView:_initAvatarPanel()
    self._panelAvatar:removeAllChildren()

    self:_initBossNode()
    self:_initPlayerAvatars()
end

function CrossWorldBossView:_initBossNode()
    local bossId = CrossWorldBossHelper.getBossHeroId()
    local bossInfo = require("app.config.hero").get(bossId)

    self._bossAvatar = CrossWorldBossAvatarNode.new()
    self._panelAvatar:addChild(self._bossAvatar)

    if bossInfo == nil then
        --assert(bossInfo, "bossInfo is nil")
        return
    end

    self._bossHead:updateHero(0, bossId)

    self._textBossName:setString(bossInfo.name)


    local bossPos = G_UserData:getCrossWorldBoss():getBossPos()
    self._bossAvatar:setPosition(bossPos)
    self._bossAvatar:changeZorderByPos()
    self._bossAvatar:setBossCampIcon()

    self._bossAvatar:setBossStamina()

    local bossState = G_UserData:getCrossWorldBoss():getState()
    print("bossState "..bossState)


    local bossConfigInfo = CrossWorldBossHelper.getBossInfo()
    self._bossAvatar:updateBaseId(bossConfigInfo.spine)

    self._curBossState = bossState
    self._bossAvatar:changeBossState(bossState)

    if bossState == CrossWorldBossConst.BOSS_WEAK_STATE then
        self:_beginWeekCountDown()
    end
end

function CrossWorldBossView:_initPlayerAvatars()
    local normalPosArray = G_UserData:getCrossWorldBoss():getNormalPos()
    local pozhenPosArray = G_UserData:getCrossWorldBoss():getPozhenPos()   -- 破阵攻击位置
    local pozhenPosNum = #pozhenPosArray


    local bossState = G_UserData:getCrossWorldBoss():getState()
    local usersInfo = G_UserData:getCrossWorldBoss():getUsers()

    local bossId = G_UserData:getCrossWorldBoss():getBoss_id()

    if bossId == nil or bossId == 0 then
        return
    end

    local bossInfo = CrossWorldBossHelper.getBossConfigInfo(bossId)
    local pozhaoCamp = CrossWorldBossHelper.getPozhaoCampByBossId(bossInfo.id)

    for k, v in pairs(usersInfo) do
        if k > #normalPosArray then
            return
        end

        local avatar = CrossWorldBossPlayerAvatarNode.new()

        if bossState ~= CrossWorldBossConst.BOSS_NORMAL_STATE and k <= pozhenPosNum and pozhaoCamp == v.camp then
            avatar:setPos(pozhenPosArray[k][1])
            avatar:setIdlePos(normalPosArray[k][1])
            avatar:setPozhenPos(pozhenPosArray[k][1])
            avatar:setHitdownIndex(pozhenPosArray[k][2])
        else
            avatar:setPos(normalPosArray[k][1])
            avatar:setIdlePos(normalPosArray[k][1])
            avatar:setPozhenPos(nil)
            avatar:setHitdownIndex(normalPosArray[k][2])
        end

        avatar:setIsPozhaoCamp(pozhaoCamp == v.camp)
        avatar:updatePlayerInfo(v)
        avatar:setName("avatar"..k)

        self._playerAvatars[v.userId] = avatar
        self._panelAvatar:addChild(avatar)
    end
end

function CrossWorldBossView:_updatePlayerAvatars(  )
    local normalPosArray = G_UserData:getCrossWorldBoss():getNormalPos()
    local pozhenPosArray = G_UserData:getCrossWorldBoss():getPozhenPos()   -- 破阵攻击位置
    local pozhenPosNum = #pozhenPosArray


    local bossState = G_UserData:getCrossWorldBoss():getState()
    local usersInfo = G_UserData:getCrossWorldBoss():getUsers()

    for k, v in pairs(usersInfo) do
        local avatar = self._playerAvatars[v.userId]
        if avatar == nil then
            avatar = CrossWorldBossPlayerAvatarNode.new()
            self._playerAvatars[v.userId] = avatar
            self._panelAvatar:addChild(avatar)
            avatar:updatePlayerInfo(v)
            avatar:setName("avatar"..k)
        end

        if bossState ~= CrossWorldBossConst.BOSS_NORMAL_STATE and k <= pozhenPosNum then
            avatar:setPos(pozhenPosArray[k])
            avatar:setIdlePos(normalPosArray[k])
            avatar:setPozhenPos(pozhenPosArray[k])
        else
            avatar:setPos(normalPosArray[k])
            avatar:setIdlePos(normalPosArray[k])
            avatar:setPozhenPos(nil)
        end
    end
end

function CrossWorldBossView:_onBtnRight(  )
    local isOpen = G_UserData:getCrossWorldBoss():isBossStart()
	if isOpen == false then
		G_Prompt:showTip(Lang.get("worldboss_no_open"))
		return
	end

	if CrossWorldBossHelper.checkBossFight() == false then
		return
	end

	G_UserData:getCrossWorldBoss():c2sAttackCrossWorldBoss()
end


function CrossWorldBossView:_startRefreshHandler()
	self:_endRefreshHandler()

	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return 
    end
    
    self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick), 1)
end

function CrossWorldBossView:_endRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end

-- 客户端自己算的蓄力状态时间，只用于播放蓄力前10秒时的预告音效
function CrossWorldBossView:_isInChargeTime(currTime, startTime)
    for k, v in pairs(self._preChargeTime) do
        if currTime - startTime == tonumber(v) - 10 then
            return true
        end
    end

    return false
end

function CrossWorldBossView:_initChargeTimeInfo()
    self._chargeTimePoint = {}

    local chargeTimePointCfg = CrossWorldBossHelper.getParameterStr("charge_start_time")
    local chargeTimePointArray = string.split(chargeTimePointCfg, "|")

    local startTime = G_UserData:getCrossWorldBoss():getStart_time()
    local endTime = G_UserData:getCrossWorldBoss():getEnd_time()
    local currTime = G_ServerTime:getTime()

    self._chargeLastTime = CrossWorldBossHelper.getParameterValue("charge_last_time")
    self._chargeTimes = #self._chargeTimePoint

    self._panelChargeStar:removeAllChildren()

    self._chargeTipsImg = {}

    for k, v in pairs(chargeTimePointArray) do
        table.insert( self._chargeTimePoint, tonumber(v) )

        local percent = (tonumber(v) + (k - 1) * self._chargeTimes) / (endTime - startTime)
        local xPos = (1 - percent) * 435 -- 进度条长度

        local uiImage = ccui.ImageView:create(Path.getCrossBossImage("icon_cross_boss_mark"))
        uiImage:setPosition(xPos, 13)
        uiImage:setAnchorPoint(cc.p(0.5, 0.5))
        table.insert( self._chargeTipsImg, uiImage )
        self._panelChargeStar:addChild(uiImage)
    end

    local pastTime = currTime - startTime

    self._chargeIndex = 0  -- 第几个蓄力状态

    local isStart = G_UserData:getCrossWorldBoss():isBossStart()

    for k, v in pairs(self._chargeTimePoint) do
        if pastTime >= v then
            self._chargeIndex = k
        end
    end

    for k, v in pairs(self._chargeTipsImg) do
        v:setVisible(isStart)
        if (self._chargeIndex >= k and self._curBossState ~= CrossWorldBossConst.BOSS_CHARGE_STATE) or 
           (self._chargeIndex >  k and self._curBossState == CrossWorldBossConst.BOSS_CHARGE_STATE) then
            v:setColor(cc.c3b(100, 100, 100))
        else
            v:setColor(cc.c3b(255, 255, 255))
        end
    end

    if self._curBossState == CrossWorldBossConst.BOSS_CHARGE_STATE then
        self._chargeTime = pastTime - self._chargeTimePoint[self._chargeIndex]
    else
        self._chargeTime = 0
    end
    
    self:_setLoadingBarTimeAdd()
end

function CrossWorldBossView:_setLoadingBarTimeAdd()
    local currTime = G_ServerTime:getTime()
    local startTime = G_UserData:getCrossWorldBoss():getStart_time()
    local endTime = G_UserData:getCrossWorldBoss():getEnd_time()

    --local totalTime = endTime - startTime
    --local leftTime = endTime - currTime
    local pastTime = currTime - startTime

    local chargeDeltal = 0
    local toNextChargeTime = 0

    if self._chargeIndex == 0 then

    elseif self._chargeIndex == #self._chargeTimePoint then
        --chargeDeltal = self._chargeTimePoint[#self._chargeTimePoint]
        toNextChargeTime = endTime - currTime
    else
        chargeDeltal = self._chargeTimePoint[self._chargeIndex + 1] - self._chargeTimePoint[self._chargeIndex]
        toNextChargeTime = chargeDeltal - (pastTime - self._chargeTimePoint[self._chargeIndex])
    end

    self._addTime = 0

    if toNextChargeTime > 0 then
        self._addTime = self._chargeTime / toNextChargeTime
    end
end


function CrossWorldBossView:_updateTimeLoadingBar()
    local currTime = G_ServerTime:getTime()
    local startTime = G_UserData:getCrossWorldBoss():getStart_time()
    local endTime = G_UserData:getCrossWorldBoss():getEnd_time()

    local totalTime = endTime - startTime
    local leftTime = endTime - currTime
    --local pastTime = currTime - startTime

    for k, v in pairs(self._chargeTipsImg) do
        if (self._chargeIndex >= k and self._curBossState ~= CrossWorldBossConst.BOSS_CHARGE_STATE) or 
           (self._chargeIndex >  k and self._curBossState == CrossWorldBossConst.BOSS_CHARGE_STATE) then
            v:setColor(cc.c3b(100, 100, 100))
        else
            v:setColor(cc.c3b(255, 255, 255))
        end
    end

    --策划要求蓄力状态下时间进度条不变，蓄力状态结束后，进度条减短速度加快，要和不暂停的情况下减短速度一致
    if self._curBossState ~= CrossWorldBossConst.BOSS_CHARGE_STATE then
        self._chargeTime = math.max(0, self._chargeTime - self._addTime)
        local percent = (leftTime + self._chargeTime) / totalTime * 100
        --print("percent1 "..percent)
        self._loadingBarTime:setPercent(percent)
    elseif self._chargeTimePoint[self._chargeIndex] then
        self._chargeTime = self._chargeTime + 1
        local percent = (totalTime - self._chargeTimePoint[self._chargeIndex]) / totalTime * 100
        --print("percent2 "..percent)
        self._loadingBarTime:setPercent(percent)
    else

    end
end


-- 血条蓄力时间点标志渐入效果
function CrossWorldBossView:_playChargeTipsImgAction()
    if not self._chargeTipsImg then
        return
    end

    for k, v in pairs(self._chargeTipsImg) do
        v:setVisible(true)
        v:setOpacity(0)
        v:runAction(cc.FadeIn:create(1))
    end
end

function CrossWorldBossView:_onRefreshTick()
    self:_updateButton()
    
    local isBossOpen = G_UserData:getCrossWorldBoss():isBossStart()
    local currTime = G_ServerTime:getTime()
    local startTime = G_UserData:getCrossWorldBoss():getStart_time()
    local endTime = G_UserData:getCrossWorldBoss():getEnd_time()

    if isBossOpen then
        self._danmuPanel:setVisible(true)
        self._curActivityState = CrossWorldBossConst.ACTIVITY_STATE_BEGIN
        self._nodeProcess:setVisible(true)
        self._textTimeDesc:setString(Lang.get("worldboss_close_time_desc"))

        self._bossAvatar:setVisible(true)
        
		local endString, percent = CrossWorldBossHelper.getEndTime()
        self._textOverTime:setString(endString)

        self._notBeginCountdown:setVisible(false)

		--一开始boss关闭，然后开放，则重新拉去数据
		if self._isBossOpen ~= isBossOpen then
			G_SignalManager:dispatch(SignalConst.EVENT_CLEAR_GUILD_INVITE_NOTICE) -- 规避演武场景切换的bug
			G_UserData:getCrossWorldBoss():c2sEnterCrossWorldBoss()
            self._isBossOpen = isBossOpen
            
            G_AudioManager:playMusicWithId(AudioConst.SOUND_CROSS_NORMAL_STATE_BG)
            self._curBgmId = AudioConst.SOUND_CROSS_NORMAL_STATE_BG

            local userId = G_UserData:getBase():getId()
            local data = G_StorageManager:load("crossbossdata"..userId) or {}
            data["showNotice"] = "0"
            G_StorageManager:save("crossbossdata"..userId, data)

            self:_playChargeTipsImgAction()
        end
        
        self:_updateTimeLoadingBar()

        if self:_isInChargeTime(currTime, startTime) then
            G_AudioManager:playSoundWithId(AudioConst.SOUND_CROSS_PRE_CHARGE_SOUND)
        end
	else
		--从boss开始到关闭那一秒，重新拉取
		if self._isBossOpen ~= isBossOpen then
			self._isBossOpen = isBossOpen
			--boss结束，清空弹幕
            --G_BulletScreenManager:clearBulletLayer()
            local SchedulerHelper = require("app.utils.SchedulerHelper")
            SchedulerHelper.newScheduleOnce(function () 
                G_UserData:getCrossWorldBoss():c2sEnterCrossWorldBoss()
                G_UserData:getAuction():c2sGetAllAuctionInfo()--拉去一下拍卖数据
            end, 1)

            G_AudioManager:openMainMusic(true)
            --G_AudioManager:stopMusic()
            
            -- 结束后boss退出动作
            self._bossAvatar:doFadeOutAction()
        end

        local startString = CrossWorldBossHelper.getOpenTime()
        
        self._textTimeDesc:setString(Lang.get("worldboss_open_time_desc"))
        self._textOverTime:setString(startString)

        self._notBeginCountdown:setVisible(false)

        self._bossAvatar:hideBoss()

        if startTime > currTime then
            if startTime - currTime > 5 then  -- 开始时间大于5秒开始随机移动
                if self._curActivityState == CrossWorldBossConst.ACTIVITY_STATE_NULL then
                    self:_startRandomMove()
                end

                self._loadingBarTime:setPercent(0)

                local bossId = G_UserData:getCrossWorldBoss():getBoss_id()
                if bossId == nil or bossId == 0 or startTime - currTime > 86400 then
                    self._nodeProcess:setVisible(false)
                else
                    self._nodeProcess:setVisible(true)
                end

                self._curActivityState = CrossWorldBossConst.ACTIVITY_STATE_RANDOM_MOVE
            elseif self._curActivityState == CrossWorldBossConst.ACTIVITY_STATE_RANDOM_MOVE then   -- 开始时间小于5秒，准备开始
                self._curActivityState = CrossWorldBossConst.ACTIVITY_STATE_PREPARE
                self:_backToIdlePos()
                self._nodeProcess:setVisible(true)
                self:_startLoadingBarAction()
                self._bossAvatar:setVisible(true)
                self._bossAvatar:playAnimationOnce("coming")   -- 入场动画
            else
                self._curActivityState = CrossWorldBossConst.ACTIVITY_STATE_PREPARE
                self._nodeProcess:setVisible(true)
                self._bossAvatar:setVisible(true)
            end
        elseif currTime > endTime then    -- 已结束
            self._curActivityState = CrossWorldBossConst.ACTIVITY_STATE_END

            self._textTimeDesc:setVisible(false)
            self._textOverTime:setVisible(false)

            for k, v in pairs(self._chargeTipsImg) do
                v:setVisible(false)
            end

            self._loadingBarTime:setPercent(0)
            self._nodeProcess:setVisible(false)
        else
            self._nodeProcess:setVisible(false)
        end
	end
end

function CrossWorldBossView:_startLoadingBarAction()
    self:_endLoadingBarAction()

	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._loadingBarHandler ~= nil then
        return 
    end

    self._loadingBarPercent = 0
    self._loadingBarDeltal = 1 / 30 / 4
    self._loadingBarTime:setPercent(0)
    
    self._loadingBarHandler = SchedulerHelper.newSchedule(handler(self,self._updateLoadingBarAction), 1 / 30) 
end

function CrossWorldBossView:_updateLoadingBarAction()
    if self._loadingBarPercent >= 1 then
        self._loadingBarTime:setPercent(100)
        self:_endLoadingBarAction()
        return
    end

    self._loadingBarPercent = self._loadingBarPercent + self._loadingBarDeltal
    self._loadingBarTime:setPercent(self._loadingBarPercent * 100)
end

function CrossWorldBossView:_endLoadingBarAction()
    local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._loadingBarHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._loadingBarHandler)
		self._loadingBarHandler = nil
	end
end

function CrossWorldBossView:_updateButton()
	local isBossOpen = G_UserData:getCrossWorldBoss():isBossStart()
	local bossBtnName, rightVisible = CrossWorldBossHelper.getBossFightBtnName()
	self._commonBtnRight:setVisible(false)
    self._commonBtnLeft:setVisible(false)
    self._leftBtnDes:setVisible(false)
    self._rightBtnDes:setVisible(false)
    
    self._rightBtnContent:setVisible(rightVisible and isBossOpen)

	if isBossOpen == true then
		self._textBtnRight:setString(bossBtnName)
        self._commonBtnRight:setVisible(true)
        self._rightBtnDes:setVisible(true)
	end
	
    local userBtnName, leftVisible = CrossWorldBossHelper.getUserFightBtnName()
    self._leftBtnContent:setVisible(leftVisible and isBossOpen)

	if isBossOpen == true then
		self._textBtnLeft:setString(userBtnName)
        self._commonBtnLeft:setVisible(true)
        self._leftBtnDes:setVisible(true)
	end
end

function CrossWorldBossView:_onBtnLeft(  )
    if CrossWorldBossHelper.checkUserFight() == false then
		return
	end
	local isOpen = G_UserData:getCrossWorldBoss():isBossStart()
	if isOpen == true then
		G_SceneManager:showDialog("app.scene.view.crossworldboss.PopupCrossWorldBossRob")
	end
end

function CrossWorldBossView:_onAvatarPanelClick( sender,state )
    if self._curActivityState == CrossWorldBossConst.ACTIVITY_STATE_RANDOM_MOVE and 
       (state == ccui.TouchEventType.ended or not state) then
		local moveOffsetX = sender:getTouchEndPosition().x
        local moveOffsetY = sender:getTouchEndPosition().y
        
        local xBoundary = string.split(CrossWorldBossHelper.getParameterStr("x_boundary"), "|")
        local loweryBoundaryX = tonumber(xBoundary[1])
        local upperyBoundaryX = tonumber(xBoundary[2])

        local curMaxY = G_UserData:getCrossWorldBoss():getMaxYByX(math.ceil(moveOffsetX))

        local localPos = sender:convertToNodeSpace(cc.p(moveOffsetX, moveOffsetY))
        local localX = localPos.x
        local localY = localPos.y

        --print("moveOffsetX "..moveOffsetX.." moveOffsetY "..moveOffsetY)

        if localX >= loweryBoundaryX and localX <= upperyBoundaryX and 
           localY >= 0 and localY <= curMaxY then
            local roleAvatar = self._playerAvatars[G_UserData:getBase():getId()]
            if roleAvatar then
                local posX, posY = roleAvatar:getPosition()
                local t = math.sqrt(math.pow(localX - posX, 2) + math.pow(localY - posY, 2)) / 300
                roleAvatar:moveToPos(localX, localY, t, function (  )
                    roleAvatar:setIdleAction()        
                end)
            end
        end
	end
end


function CrossWorldBossView:_backToIdlePos(t)
    for k, v in pairs(self._playerAvatars) do 
        if v then
            v:backToIdlePos(t)
        end
    end
end

function CrossWorldBossView:_gotoSuperAttackPos()
    local superAttackPosArray = G_UserData:getCrossWorldBoss():getPozhenPos()
    local index = 1

    for k, avatar in pairs(self._playerAvatars) do
        if superAttackPosArray[index] and avatar and avatar:getIsPozhaoCamp() then
            avatar:moveToSuperAttackPos(superAttackPosArray[index][1])
            avatar:setHitdownIndex(superAttackPosArray[index][2])

            index = index + 1
        end
    end
end

function CrossWorldBossView:_gotoNormalAttackPos(  )
    for k, avatar in pairs(self._playerAvatars) do
        if avatar:getPozhenPos() then
            avatar:backToIdlePos()
        end
    end
end

function CrossWorldBossView:_pozhaoFailedAction(  )
    for k, avatar in pairs(self._playerAvatars) do
        if avatar then
            avatar:liedownAndGotoIdlepos()
        end
    end
end

function CrossWorldBossView:_startRandomMove(  )
    local param = {}

    local xBoundary = string.split(CrossWorldBossHelper.getParameterStr("x_boundary"), "|")
    param.loweryBoundaryX = tonumber(xBoundary[1])
    param.upperyBoundaryX = tonumber(xBoundary[2])

    local yBoundary = string.split(CrossWorldBossHelper.getParameterStr("y_boundary"), "|")
    param.loweryBoundaryY = tonumber(yBoundary[1])
    param.upperyBoundaryY = tonumber(yBoundary[2])

    local xMoveDis = string.split(CrossWorldBossHelper.getParameterStr("walk_x_boundary"), "|")
    param.lowerMoveDisX = tonumber(xMoveDis[1])
    param.upperMoveDisX = tonumber(xMoveDis[2])

    local yMoveDis = string.split(CrossWorldBossHelper.getParameterStr("walk_y_boundary"), "|")
    param.lowerMoveDisY = tonumber(yMoveDis[1])
    param.upperMoveDisY = tonumber(yMoveDis[2])

    local moveTime = string.split(CrossWorldBossHelper.getParameterStr("walk_speed"), "|")
    param.lowerTime = tonumber(moveTime[1])
    param.upperTime = tonumber(moveTime[2])

    local pauseTime = string.split(CrossWorldBossHelper.getParameterStr("walk_pause"), "|")
    param.lowerPauseTime = tonumber(pauseTime[1])
    param.upperPauseTime = tonumber(pauseTime[2])

    local userId = G_UserData:getBase():getId()

    for k, v in pairs(self._playerAvatars) do 
        if k ~= userId then
            v:beginRandowMove(param)
        end
    end
end

return CrossWorldBossView