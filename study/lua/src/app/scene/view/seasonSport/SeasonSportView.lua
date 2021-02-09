-- @Author panhoa
-- @Date 8.16.2018
-- @Role SeasonSportView(Layer)

local ViewBase = require("app.ui.ViewBase")
local SeasonSportView = class("SeasonSportView", ViewBase)
local PopupAlert = require("app.ui.PopupAlert")
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")
local MatchSuccessPlayerInfoPanel = require("app.scene.view.seasonSport.MatchSuccessPlayerInfoPanel")


function SeasonSportView:ctor()
	self._panelCenter = nil
	self._panelBottom = nil
	self._topBar 	= nil
	self._commonChat= nil
	self._commonHelp= nil
	self._commonTip	= nil
	self._btnRank 	= nil			-- 赛季排行
	self._btnReport = nil			-- 战报
	self._btnMatch 	= nil			-- 匹配点击事件
	self._imageMatchSuccess =nil
	self._centerNode= nil
	self._imageHighest = nil		-- 王者5星以上
	self._textHighest  = nil
	self._effectSpineHuiZhnagNode = nil

	self._btnSilkConfig = nil
	self._textRemaining = nil
	self._textSeasonTime= nil
	self._imageWaitBack = nil
	self._imageWaiting  = nil
	self._textWaiting	= nil
	self._cancelMatch	= nil
	self._panelNewer	= nil
	self._effectSpine   = nil
	self._popupAlert	= nil

	self._popupSeasonRewardsTip = nil-- 赛季奖励弹窗
	self._popupSuspendTimeView  = nil-- 对手超时弹窗
	self._popupOfflineView		= nil-- 本方断线弹窗
	self._textPeriodCountDown = nil -- 当前阶段倒计时
	self._btnSeasonRewards 	  = nil
	self._isWaiting     = false		-- 匹配等待显示
	self._suspendTime	= 0			-- 禁赛时间
	self._interval      = 1			-- 匹配计时

    local resource = {
        file = Path.getCSB("SeasonSportView", "seasonSport"),
		size = G_ResolutionManager:getDesignSize(),
        binding = {
			_btnSeasonAwards = {
				events = {{event = "touch", method = "_gotoSeasonAwards"}}
			},
			_btnRank = {
				events = {{event = "touch", method = "_gotoSeasonRank"}}
			},
			_btnReport = {
				events = {{event = "touch", method = "_gotoSeasonReport"}}
			},
			_commonHelp = {
				events = {{event = "touch", method = "_gotoDesc"}}
			},
			_commonTip = {
				events = {{event = "touch", method = "_gotoTip"}}
			},
			_btnSeasonShop = {
				events = {{event = "touch", method = "_gotoSeasonShop"}}
			},
			_btnSeasonRewards = {
				events = {{event = "touch", method = "_gotoSeasonRewards"}}
			},
			_btnSilkConfig = {
				events = {{event = "touch", method = "_gotoSilkConfig"}}
			},
			_btnMatch = {
				events = {{event = "touch", method = "_gotoMatch"}}
			},
			_cancelMatch = {
				events = {{event = "touch", method = "_gotoCancelMatch"}}
			},
		}
    }
	self:setName("SeasonSportView")
    SeasonSportView.super.ctor(self, resource, 2002)
end

-- @Role Get Connected-Info while Entry(Obsolutly in SeasonSportView.lua
function SeasonSportView:waitEnterMsg(callBack)
	local function onMsgCallBack(id, message)
		callBack()
	end

	G_UserData:getSeasonSport():c2sFightsEntrance()
	local signal = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_ENTRY_SUCCESS, onMsgCallBack)
	return signal
end

function SeasonSportView:onCreate()
	self._topBar:setImageTitle("txt_sys_com_wangzhezhizhan")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topBar:updateUI(TopBarStyleConst.STYLE_SEASONSPORT)
	self._topBar:setCallBackOnBack(handler(self, self._onReturnBack))

	self._imageHighest:setVisible(false)
	self:_initDanView()
	self:_createHuiZhangSpine()
end

function SeasonSportView:_initNewerView()
	local curStage =  G_UserData:getSeasonSport():getSeason_Stage()
    self._imageDivision:loadTexture(Path.getTextSignet(SeasonSportConst.SEASON_STAGE_TIP[curStage]))
end

function SeasonSportView:_initWaitingView(bVisible)
	self._imageWaitBack:setVisible(bVisible)
	self._imageWaiting:setVisible(bVisible)
	self._textWaiting:setVisible(bVisible)
	self._cancelMatch:setVisible(bVisible)
	self._imageMatchSuccess:setVisible(false)
	self._imageMatchSuccess:setOpacity(230)
	self._panelCenter:setVisible(true)
	self._panelBottom:setVisible(true)
	self._btnMatch:setVisible(not bVisible)
end

-- @Role 	Init DanView
function SeasonSportView:_initDanView()
	for index = 1, 5 do
		self["_imageStar"..index]:setVisible(false)
	end
end

function SeasonSportView:_closeRewardsTip()
	self._popupSeasonRewardsTip = nil
end

-- @Role 	Goto SeasonAwards
function SeasonSportView:_gotoSeasonAwards(snnder)
	if self._popupSeasonRewardsTip ~= nil then
		self._popupSeasonRewardsTip:closeView()
		self._popupSeasonRewardsTip = nil
		return
	end
	self._popupSeasonRewardsTip = require("app.scene.view.seasonSport.PopupSeasonRewardsTip").new(handler(self, self._closeRewardsTip))
	self._popupSeasonRewardsTip:open()
end

-- @Role  	Goto RankView 
function SeasonSportView:_gotoSeasonRank(sender)
	G_SceneManager:showDialog("app.scene.view.seasonSport.PopupSeasonRankView")
end

-- @Role 	Goto Report
function SeasonSportView:_gotoSeasonReport(sender)
	G_SceneManager:showDialog("app.scene.view.seasonSport.PopupOwnFightReportView")
end

-- @Role 	Goto Desc
function SeasonSportView:_gotoDesc(sender)
	local UIPopupHelper = require("app.utils.UIPopupHelper")
	UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_SEASONSOPRT)
end

-- @Role 	Goto Tip
function SeasonSportView:_gotoTip(sender)
	local popup = require("app.scene.view.seasonSport.PopupSeasonTip").new(cc.p(280, 135))
	popup:open()
end

-- @Role 	Goto Shop
function SeasonSportView:_gotoSeasonShop(sender)
	if G_UserData:getSeasonSport():getMatchSuccess() then
		return
	end

	if self._imageWaitBack:isVisible() then
		self._interval = 0
		G_UserData:getSeasonSport():c2sFightsCancel()
	end
	G_UserData:getSeasonSport():setMatchSuccess(false)
	G_SceneManager:showScene("seasonShop")
end

-- @Role 	Goto SeasonRewards
function SeasonSportView:_gotoSeasonRewards(sender)
	G_SceneManager:showDialog("app.scene.view.seasonSport.PopupSeasonDailyRewards")
end

-- @Role 	Goto SilhConfig
function SeasonSportView:_gotoSilkConfig(sender)
	G_SceneManager:showDialog("app.scene.view.seasonSilk.PopupSeasonSilk")
end

-- @Role 	Goto match
function SeasonSportView:_gotoMatch(sender)
    if not G_UserData:getBase():isIs_white_list() then
        local bWaiting, time = SeasonSportHelper.getWaitingTime()
        if bWaiting then
            local strTips = Lang.get("season_notstart_waiting")..time
            G_Prompt:showTip(strTips)
            return
        end
    end

    if self._isWaiting then
        G_Prompt:showTip(Lang.get("season_match_waiting"))
        return
    end

	self._suspendTime = G_UserData:getSeasonSport():getSuspendTime()
	if tonumber(G_ServerTime:getLeftSeconds(self._suspendTime)) > 0 then
		local PopupSuspendTimeView = require("app.scene.view.seasonSport.PopupSuspendTimeView").new()
        local dropStar = G_UserData:getSeasonSport():getOwnCDOutAndDropStar()
        if dropStar > 0 then
			local strTitle = Lang.get("season_suspend_title")
			local strContent = Lang.get("season_suspend_contentdrop", {num = dropStar})
			local strContentEnd = Lang.get("season_suspend_contentdropsecond")
			local strButton  = Lang.get("season_suspend_back")
			PopupSuspendTimeView:setCustomText(strTitle, strContent, strButton, strContentEnd, 0)
		else
			local strTitle = Lang.get("season_suspend_title")
			local strContent = Lang.get("season_suspend_content")
			local strButton  = Lang.get("season_suspend_back")
			PopupSuspendTimeView:setCustomText(strTitle, strContent, strButton, nil, 0)
		end
		PopupSuspendTimeView:open()
		return
	end

	G_UserData:getSeasonSport():setOwnCDOutAndDropStar(0)
	G_UserData:getSeasonSport():c2sFightsInitiate()
end

-- @Role 	Cancel match
function SeasonSportView:_gotoCancelMatch(sender)
	if G_UserData:getSeasonSport():getMatchSuccess() then
		return
	end
	G_UserData:getSeasonSport():c2sFightsCancel()
end

-- @Role Enter
function SeasonSportView:onEnter()
	self._signalEnterSignal       = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_ENTRY_SUCCESS, handler(self, self._onEventEnterSeasonSuccess))	-- 进入赛季
	self._signalMatchimg 	      = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_MATCHING, handler(self, self._onEventMatchimg))					-- 正在匹配
	self._signalMatchSuccess      = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_FIGHT_MATCH, handler(self, self._onEventMatchSuccess))			-- 匹配成功
	self._signalMatchTimeOut      = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_MATCH_TIMEOUT, handler(self, self._onEventMatchTimeOut))			-- 匹配超时
	self._signalCancelMatchs      = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_CANCEL_MATCH, handler(self, self._onEventCancelMatch))			-- 取消匹配
	self._signalGetSeasonRewards  = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_AWARDS, handler(self, self._onEventGetSeasonRewards))				-- 领取赛季奖励后
	self._signalUpdateRedPoints   = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventUpdateRedPoint))					-- 刷新红点
	self._signalListnerSeasonStart= G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_START, handler(self, self._onEventListnerSeasonStart))			-- 监听赛季开始
	self._signalListnerSeasonEnd  = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_END, handler(self, self._onEventListnerSeasonEnd))				-- 监听赛季结束
	self._signalCancelWhileSeeRP  = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_CANCEL_MATCHWHILEREPORT, handler(self, self._onEventCancelMatchWhileSeeRP))-- 查看战报时取消匹配

	self:_updateSeasonView()
	self:_updateOtherCDOut()
	self:scheduleUpdateWithPriorityLua(handler(self, self._update), 0)
end

function SeasonSportView:onExit()
	self._signalEnterSignal:remove()
	self._signalMatchimg:remove()
	self._signalMatchSuccess:remove()
	self._signalMatchTimeOut:remove()
	self._signalCancelMatchs:remove()
	self._signalUpdateRedPoints:remove()
	self._signalGetSeasonRewards:remove()
	self._signalListnerSeasonStart:remove()
	self._signalListnerSeasonEnd:remove()
	self._signalCancelWhileSeeRP:remove()
	
	self._signalEnterSignal  = nil
	self._signalMatchimg	   = nil
	self._signalMatchSuccess = nil
	self._signalMatchTimeOut = nil
	self._signalCancelMatchs  = nil 
	self._signalUpdateRedPoints = nil
	self._signalGetSeasonRewards = nil
	self._signalListnerSeasonStart = nil
	self._signalListnerSeasonEnd = nil
	self._isWaiting    = false
	self._signalCancelWhileSeeRP = nil
end

-- @Role 	主界面返回取消匹配
function SeasonSportView:_onReturnBack()
	if G_UserData:getSeasonSport():getMatchSuccess() then
		return
	end
	if self._imageWaitBack:isVisible() then
		self._interval = 0
		G_UserData:getSeasonSport():c2sFightsCancel()
	end
	G_UserData:getSeasonSport():setMatchSuccess(false)
	G_SceneManager:popScene()
end

-- @Role 	赛季开始重新拉取 	
function SeasonSportView:_onEventListnerSeasonStart()
	G_UserData:getSeasonSport():c2sFightsEntrance()
end

-- @Role 	赛季结束重新拉取
function SeasonSportView:_onEventListnerSeasonEnd()
	G_UserData:getSeasonSport():c2sFightsEntrance()
end

-- @Role 	刷新红点
function SeasonSportView:_onEventUpdateRedPoint()
	self:_updateRedPoint()
end

function SeasonSportView:_updateRedPoint()
	local redImg = self._btnSeasonRewards:getChildByName("RedPoint")
	if not redImg then
		local UIHelper  = require("yoka.utils.UIHelper")
		redImg = UIHelper.createImage({texture = Path.getUICommon("img_redpoint") })
		redImg:setName("RedPoint")
		redImg:setPosition(75, 80)
		self._btnSeasonRewards:addChild(redImg)
	end
	redImg:setVisible(G_UserData:getRedPoint():isSeasonDailyReward())
end

-- @Role 	徽章spine
function SeasonSportView:_createHuiZhangSpine()
	self._effectSpineHuiZhnagNode = require("yoka.node.SpineNode").new(1.0)
	self._effectSpineHuiZhnagNode:setAsset(Path.getSpine("huizhang"))
    self._effectSpineHuiZhnagNode:setVisible(false)
	self._effectSpine:addChild(self._effectSpineHuiZhnagNode)
end

-- @Role 	徽章Play spine
function SeasonSportView:_playHuiZhangSpine()
	local bUpgrade = false
	local dan = tonumber(SeasonSportHelper.getDanInfoByStar(self._curStar).rank_1)
	if self._curStar > 1 then
		local beforeStar = (self._curStar - 1)
		local beforeDan = tonumber(SeasonSportHelper.getDanInfoByStar(beforeStar).rank_1)
		local bUp = (dan - beforeDan) == 1 or false
		if G_UserData:getSeasonSport():getTimeOutCD() > 0 then
			if bUp then
				bUpgrade = G_UserData:getSeasonSport():getTimeOutCD() == 2 or false
			end
		end
	end

	local idle1 = SeasonSportConst.SEASON_REPORT_HUIZHNAG[dan][1]
	local idle2 = SeasonSportConst.SEASON_REPORT_HUIZHNAG[dan][2]
	self._effectSpineHuiZhnagNode:setVisible(true)
	if bUpgrade == false then
		self:_updateStarUI()
		self._effectSpineHuiZhnagNode:setVisible(true)
		self._effectSpineHuiZhnagNode:setAnimation(idle2, true)
	else
		self._effectSpineHuiZhnagNode:setAnimation(idle1, false)
		self._effectSpineHuiZhnagNode.signalComplet:addOnce(function()
			self._effectSpineHuiZhnagNode:setAnimation(idle2, true)
			self:_updateStarUI()
		end)
	end
end

-- @Role 	匹配动画特效
function SeasonSportView:_palyMatchedAnimation(rootNode)
	self._imageMatchSuccess:setVisible(true)
	self._panelCenter:setVisible(false)
	self._panelBottom:setVisible(false)

    local function effectFunction(effect)
		if effect == "wanjia1" then
			local node1 = MatchSuccessPlayerInfoPanel.new()
			node1:updateUI(1)
            return node1
		elseif effect == "wanjia2" then
			local node2 = MatchSuccessPlayerInfoPanel.new()
			node2:updateUI(2)
            return node2
		end
    end
    local function eventFunction(event)
        if event == "finish" then
			self._imageMatchSuccess:setVisible(false)
			self._panelCenter:setVisible(true)
			self._panelBottom:setVisible(true)
			G_UserData:getSeasonSport():setMatchSuccess(false)
			G_SceneManager:showScene("seasonCompetitive")
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx(self._centerNode, "moving_wuchabieduijue", effectFunction, eventFunction , false)
end

-- @Role 	对方逃跑/CD超时弹窗
function SeasonSportView:_updateOtherCDOut()
	local function callBackClose()
		self._popupSuspendTimeView = nil
		G_UserData:getSeasonSport():setOtherCDOut(false)
	end

	local function callBackOffline()
		self._popupOfflineView = nil
		G_UserData:getSeasonSport():setSquadOffline(false)
	end

	if G_UserData:getSeasonSport():getOtherCDOut() and self._popupSuspendTimeView == nil then
		self._popupSuspendTimeView = require("app.scene.view.seasonSport.PopupSuspendTimeView").new()
		local strTitle = Lang.get("season_suspend_other_title")
		local strContent = Lang.get("season_suspend_other_content")
		local strButton  = Lang.get("season_suspend_other_back")
		self._popupSuspendTimeView:setCustomText(strTitle, strContent, strButton, nil, 30)
		self._popupSuspendTimeView:setCloseCallBack(callBackClose)
		self._popupSuspendTimeView:open()
	elseif G_UserData:getSeasonSport():isSquadOffline() and self._popupOfflineView == nil then
		self._popupOfflineView = require("app.scene.view.seasonSport.PopupSuspendTimeView").new()
		local strTitle = Lang.get("season_suspend_offline_title")
		local strContent = Lang.get("season_suspend_offline_content")
		local strButton  = Lang.get("season_suspend_other_back")
		self._popupOfflineView:setCustomText(strTitle, strContent, strButton, nil, 30)
		self._popupOfflineView:setCloseCallBack(callBackOffline)
		self._popupOfflineView:open()
	end
end

function SeasonSportView:_updateSeasonView()
	local bCancel = G_UserData:getSeasonSport():getCancelMatch()
	self:_initWaitingView(not bCancel)
	self:_initNewerView()

	self._suspendTime = G_UserData:getSeasonSport():getSuspendTime()
	self._seasonEndTime = G_UserData:getSeasonSport():getSeasonEndTime()

	local saesonLastDays = math.floor(G_ServerTime:getLeftSeconds(self._seasonEndTime) / SeasonSportConst.SEASON_COUNTDOWN)
	local curSeason = G_UserData:getSeasonSport():getCurSeason()
	local dateStr = (Lang.get("season_nexttime", {num = curSeason}) ..saesonLastDays)
	self._textSeasonTime:setString(dateStr)
	self:_updateRedPoint()
	self:_updateReport()
	self._curStar = G_UserData:getSeasonSport():getCurSeason_Star()
	self:_playHuiZhangSpine()
end

function SeasonSportView:_onEventEnterSeasonSuccess(id, message)
	self:_updateSeasonView()
end

-- @Role	Matching.. 
function SeasonSportView:_onEventMatchimg(id, message)
	self:_initWaitingView(true)
	self._interval = 1
	self._isWaiting = true
	G_UserData:getSeasonSport():setCancelMatch(false)
end

-- @Role 	Match TimeOut
function SeasonSportView:_onEventMatchTimeOut(id, message)
	self._interval 	= 1
	self._isWaiting = false
	self:_initWaitingView(false)

	local function callbackOK()
		G_UserData:getSeasonSport():c2sFightsInitiate()
	end
	local function callbackClose()
		self._popupAlert = nil
	end

	local content = Lang.get("season_matchout_content")
	local title = Lang.get("season_matchout_title")
	if self._popupAlert ~= nil then
		return
	end
	self._popupAlert = PopupAlert.new(title, content, callbackOK)
	self._popupAlert:setCloseCallBack(callbackClose)
	self._popupAlert:openWithAction()
end

-- @Role	Match success/TimeOut
function SeasonSportView:_onEventMatchSuccess(id, message)
	self._isWaiting = false
	self._interval = 1
	self:_initWaitingView(false)
	G_UserData:getSeasonSport():setTimeOutCD(0)
	G_UserData:getSeasonSport():setCancelMatch(true)

	self._centerNode:removeAllChildren()
	self:_palyMatchedAnimation()
end

-- @Role 	Cancel match
function SeasonSportView:_onEventCancelMatch(id, message)
	self._interval 	= 1
	self._isWaiting = false
	self:_initWaitingView(false)
end

-- @Role 	查看战报时取消匹配
function SeasonSportView:_onEventCancelMatchWhileSeeRP()
	if self._imageWaitBack:isVisible() then
		self._interval = 0
		G_UserData:getSeasonSport():c2sFightsCancel()
		G_UserData:getSeasonSport():setMatchSuccess(false)
	end
end

-- @Role 	Get SeasonSport
function SeasonSportView:_onEventGetSeasonRewards()
	local PopupBattleReportView = require("app.scene.view.seasonSport.PopupBattleReportView").new(false, true, true)
	PopupBattleReportView:open()--WithTarget()
end

-- @Role 	Report
function SeasonSportView:_updateReport()
	if G_UserData:getSeasonSport():isReceivedRewards() then
		local PopupBattleReportView = require("app.scene.view.seasonSport.PopupBattleReportView").new(true, false, true)
		PopupBattleReportView:open()--WithTarget()
	elseif G_UserData:getSeasonSport():getTimeOutCD() > 0 then
		local bWin = G_UserData:getSeasonSport():getTimeOutCD() == 2 or false
		local PopupBattleReportView = require("app.scene.view.seasonSport.PopupBattleReportView").new(bWin, true, false)
		PopupBattleReportView:open()--WithTarget()
		G_UserData:getSeasonSport():setTimeOutCD(0)
	end
end

-- @Role 	Update Star/Title
function SeasonSportView:_updateStarUI()
	local dan = SeasonSportHelper.getDanInfoByStar(self._curStar)
	local star_max = tonumber(dan.star_max)
	local curstar  = tonumber(dan.star2)
	self:_initDanView()

	-- 王者1级五星以上要特殊处理
	if tonumber(self._curStar) > SeasonSportConst.POSITION_HEIGHEST_KINGSTAR then
		self._imageHighest:setVisible(true)
		self._textHighest:setString(curstar)
		self._imageStarNum:loadTexture(Path.getSeasonStar(dan.name_pic))
		self._imageDanName:loadTexture(Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[tonumber(dan.rank_1)]))
		return
	end
	
	star_max = star_max > SeasonSportConst.SEASON_STAR_WANGZHE_MAX and SeasonSportConst.SEASON_STAR_WANGZHE_MAX or star_max	
	for index = 1, star_max do
		local slot = star_max == SeasonSportConst.SEASON_STAR_MAX and (index + 1) or index
		self["_imageStar"..slot]:setVisible(true)
		if index <= curstar then
			self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[1]))
		else
			self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2]))
		end
	end

	self._imageStarNum:loadTexture(Path.getSeasonStar(dan.name_pic))
	self._imageDanName:loadTexture(Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[tonumber(dan.rank_1)]))
end

-- @Role 	Update
function SeasonSportView:_update(dt)
	if self._imageWaitBack:isVisible() then
		self._textWaiting:setString(G_ServerTime:secCountToString(self._interval))
		self._interval = self._interval + dt
	end

	if SeasonSportConst.SEASON_COUNTDOWN > G_ServerTime:getLeftSeconds(self._seasonEndTime) then
		local curSeason = G_UserData:getSeasonSport():getCurSeason()
		local dateStr = (Lang.get("season_lasttime", {num = curSeason}) ..G_ServerTime:getLeftSecondsString(self._seasonEndTime, "00：00：00"))
		self._textSeasonTime:setString(dateStr)
	end

	local bWaiting, time = SeasonSportHelper.getWaitingTime()
	self._textRemaining:setString(bWaiting and Lang.get("season_peroid_start") or Lang.get("season_peroid_remain"))
	if bWaiting then
		if time ~= nil then
			self._textPeriodCountDown:setString(time)
			local remainingPosX = (self._textPeriodCountDown:getPositionX() - self._textPeriodCountDown:getContentSize().width
																		    - SeasonSportConst.POSITION_PLAYERNAME_OFFSETX/4)
			self._textRemaining:setPositionX(remainingPosX)
			local ganTanHaoPosX = (self._textRemaining:getPositionX() - self._textRemaining:getContentSize().width)
			self._imageGanTanHao:setPositionX(ganTanHaoPosX)
		end
	else
		if time ~= nil and time > 0 then
			self._textPeriodCountDown:setString(G_ServerTime:getLeftSecondsString(time, "00：00：00"))
			local remainingPosX = (self._textPeriodCountDown:getPositionX() - self._textPeriodCountDown:getContentSize().width
																		    - SeasonSportConst.POSITION_PLAYERNAME_OFFSETX/4)
			self._textRemaining:setPositionX(remainingPosX)
			local ganTanHaoPosX = (self._textRemaining:getPositionX() - self._textRemaining:getContentSize().width)
			self._imageGanTanHao:setPositionX(ganTanHaoPosX)
		end
	end
end


return SeasonSportView