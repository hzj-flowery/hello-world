
-- Author: nieming
-- Date:2018-05-09 15:45:32
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local CountryBossMain = class("CountryBossMain", ViewBase)
local TopBarStyleConst = require("app.const.TopBarStyleConst")
local CountryBossConst = require("app.const.CountryBossConst")
local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")
local UIActionHelper = require("app.utils.UIActionHelper")

function CountryBossMain:waitEnterMsg(callBack, param)
	if param then
		local isNotNeedRequest = unpack(param)
		if isNotNeedRequest then
			callBack()
			return
		end
	end
	local function onMsgCallBack()
		callBack()
	end
	G_UserData:getCountryBoss():c2sEnterCountryBoss()
	G_UserData:getAuction():c2sGetAllAuctionInfo()
    local signal = G_SignalManager:add(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS, onMsgCallBack)
	return signal
end

function CountryBossMain:ctor(isNotNeedRequest)
	--csb bind var name
	self._awardNode = nil  --SingleNode
	self._bossNodeParent = nil  --SingleNode
	self._btnRule = nil  --CommonHelp
	self._commonChat = nil  --CommonMiniChat
	self._countDownLabel = nil  --Text
	self._countDownTime = nil  --Text
	self._panelDesign = nil  --Panel
	self._rankParentNode = nil  --SingleNode
	self._topbarBase = nil  --CommonTopbarBase

	self._isFirstEnter = true
	self._curStage = nil


	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("CountryBossMain", "countryboss"),

	}
	CountryBossMain.super.ctor(self, resource)
end


-- Describle：
function CountryBossMain:onCreate()
	self._topbarBase:setImageTitle("txt_sys_com_sanguozhanji")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_GOLD_GACHA, true)
	self._topbarBase:hideBG()
	self._btnRule:updateUI(FunctionConst.FUNC_COUNTRY_BOSS)
	self:_initBoss()
	self:_initWidget()

end

-- Describle：
function CountryBossMain:onEnter()
	self._signalSyncBoss = G_SignalManager:add(SignalConst.EVENT_SYNC_COUNTRY_BOSS_SUCCESS, handler(self, self._onEventSyncBoss))
	self._signalGetAuctionInfo = G_SignalManager:add(SignalConst.EVENT_GET_ALL_AUCTION_INFO, handler(self, self._onEventGetAuctionInfo))
	self._signalRecvFlushData = G_SignalManager:add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(self, self._onEventRecvFlushData))
	self._signalEnter = G_SignalManager:add(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS, handler(self, self._onEventEnter))
	self._signalForeground = G_SignalManager:add(SignalConst.EVENT_MAY_ENTER_FOREGROUND, handler(self, self._onEventForeground))

	self:_refreshView()
	CountryBossHelper.popGoAuction()
end
-- Describle：
function CountryBossMain:onExit()
	self._signalSyncBoss:remove()
	self._signalSyncBoss = nil
	self._signalGetAuctionInfo:remove()
	self._signalGetAuctionInfo = nil
	self._signalRecvFlushData:remove()
	self._signalRecvFlushData = nil
	self._signalEnter:remove()
	self._signalEnter = nil
	self._signalForeground:remove()
	self._signalForeground = nil
end

function CountryBossMain:_initWidget ()
	-- body...
	self._commonCountDown:setCountdownLableParam({color = Colors.DARK_BG_THREE, outlineColor = Colors.BRIGHT_BG_OUT_LINE_TWO})
	self._commonCountDown:setEndLabelParam({color = Colors.DARK_BG_THREE, outlineColor = Colors.BRIGHT_BG_OUT_LINE_TWO})
	self._commonCountDown:setCountdownTimeParam({color = Colors.BRIGHT_BG_RED, outlineColor = Colors.BRIGHT_BG_OUT_LINE_TWO})

	local StageWidget = require("app.scene.view.countryboss.StageWidget")
	self._stageWidget = StageWidget.new(self, handler(self, self._onStageChangeCallback))
end

function CountryBossMain:_onEventSyncBoss()
	self:_refreshView()
end


function CountryBossMain:_initBoss()
	local GuildBossInfoConfig = require("app.config.guild_boss_info")
	local CountryBossCityUnitNode = require("app.scene.view.countryboss.CountryBossCityUnitNode")
	local CountryBossHeroUnitNode = require("app.scene.view.countryboss.CountryBossHeroUnitNode")
	local indexs = GuildBossInfoConfig.index()
	self._bossLists = {}
	for k in pairs(indexs) do
		local cfg = GuildBossInfoConfig.get(k)
		local unitNode
		if cfg.type == 2 then
			unitNode = CountryBossHeroUnitNode.new(cfg)
		else
			unitNode = CountryBossCityUnitNode.new(cfg)
		end
		unitNode:setPosition(cc.p(cfg.x, cfg.y))
		self._bossNodeParent:addChild(unitNode)
		self._bossLists[cfg.id] = unitNode
	end
end


function CountryBossMain:_upadteStage()
	local curStage = self._stageWidget:updateStage()
	if curStage == CountryBossConst.STAGE1 then
		self:_closeMeeting()
		local _, endTime = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE1)
		--倒计时结束 需要 刷新界面
		--切入后台 也可以保证 阶段正确
		self._commonCountDown:startCountDown(Lang.get("country_boss_countdown_label1"), endTime)
		self:_startShowSmallBossFirstRank()
	elseif curStage == CountryBossConst.STAGE2 then
		self:_stopPlayFirstRank()
		self:_showMeeting()
		local _, endTime = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE2)
		self._commonCountDown:startCountDown(Lang.get("country_boss_countdown_label2"), endTime)
	elseif curStage == CountryBossConst.STAGE3 then
		self:_startShowBigBossFirstRank()
		self:_closeMeeting()
		local _, endTime = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE3)
		self._commonCountDown:startCountDown(Lang.get("country_boss_countdown_label3"), endTime)
	else
		self:_stopPlayFirstRank()
		if CountryBossHelper.isShowTodayEndOrNextOpen() then
			self._commonCountDown:setEndLabelString(Lang.get("country_boss_countdown_label6"))
		else
			self._commonCountDown:startCountDown(Lang.get("country_boss_countdown_label5"), CountryBossHelper.getNextOpenTime())
		end
		self:_closeMeeting()
	end
end

function CountryBossMain:_onEventForeground()
	G_UserData:getCountryBoss():c2sEnterCountryBoss()
end

function CountryBossMain:_onStageChangeCallback(curStage)
	logWarn("CountryBossMain _onStageChangeCallback "..curStage)
	self:_refreshView()

	if curStage == CountryBossConst.STAGE1 then
		G_UserData:getCountryBoss():c2sEnterCountryBoss()
	elseif curStage == CountryBossConst.STAGE2 then
		G_UserData:getCountryBoss():c2sEnterCountryBoss()
	elseif curStage == CountryBossConst.STAGE3 then
		-- 确保投票结果正确
		G_UserData:getCountryBoss():c2sEnterCountryBoss()
		-- CountryBossHelper.popGoFightBigBoss()
	elseif curStage == CountryBossConst.NOTOPEN then
		--延后1秒拉拍卖 确保可以拉到数据
		local scheduler = require("cocos.framework.scheduler")
		scheduler.performWithDelayGlobal(function()
			G_UserData:getAuction():c2sGetAllAuctionInfo()
		end, 1.2)
	end
end

function CountryBossMain:_onEventEnter()
	self:_refreshView()
	CountryBossHelper.popGoFightBigBoss()
end

-- function CountryBossMain:_
function CountryBossMain:_refreshView()
	self:_upadteStage()
	for k, v in pairs(self._bossLists) do
		v:updateUI()
	end
end


function CountryBossMain:_onEventGetAuctionInfo()
	CountryBossHelper.popGoAuction()
end

function CountryBossMain:_showMeeting()
	if self._meetingPop then
		return
	end

	if not CountryBossHelper.anyoneBossUnlock() then
		logWarn("not boss unlock")
		return
	end

	local CountryBossMeetingLayout = require("app.scene.view.countryboss.CountryBossMeetingLayout")
	self._meetingPop = CountryBossMeetingLayout.new()
    self._meetingPopParent:addChild(self._meetingPop)
end

function CountryBossMain:_closeMeeting()
	if self._meetingPop then
		self._meetingPopParent:removeAllChildren()
		self._meetingPop = nil
	end
end

function CountryBossMain:_onEventRecvFlushData()
	G_UserData:getCountryBoss():c2sEnterCountryBoss()
end


function CountryBossMain:_stopPlayFirstRank()
	for k, v in pairs(self._bossLists) do
		v:stopPlayFirstRankName()
	end
	self:stopAllActions()
	self._isStartPlayFirstRankSmall = false
	self._isStartPlayFirstRankBig = false
end

function CountryBossMain:_startShowSmallBossFirstRank()
	if self._isStartPlayFirstRankSmall then
		return
	end
	self:stopAllActions()
	self._showFirstRankTable = {}
	local initList = CountryBossHelper.getBossConfigListByType(1)
	for k, v in pairs(initList) do
		table.insert(self._showFirstRankTable, v.id)
	end
	self._showFirstRankIndex = 1
	self._isStartPlayFirstRankSmall = true

	self:_nextShowFirstRank()
end


function CountryBossMain:_startShowBigBossFirstRank()
	if self._isStartPlayFirstRankBig then
		return
	end
	self:stopAllActions()
	self._showFirstRankTable = {}
	local initList = CountryBossHelper.getBossConfigListByType(2)
	for k, v in pairs(initList) do
		self._showFirstRankTable[v.group] = v.id
	end
	self._isStartPlayFirstRankBig = true
	self._showFirstRankIndex = 1
	self:_nextShowFirstRank()
end



function CountryBossMain:_nextShowFirstRank(queue)
	local maxIndex = #self._showFirstRankTable
	local isFind = false
	for i = self._showFirstRankIndex, self._showFirstRankIndex + maxIndex - 1 do
		local index = i
		if index > maxIndex then
			index = index - maxIndex
		end

		if not CountryBossHelper.isBossDie(self._showFirstRankTable[index]) then
			self._showFirstRankIndex = index + 1
			local node = self._bossLists[self._showFirstRankTable[index]]
			if node then
				node:playFirstRankName()
			end
			isFind = true
			break
		end
	end

	if not isFind then
		logWarn("================ all boss is die")
		self:stopAllActions()
		return
	end

	local action = UIActionHelper.createDelayAction(4, function()
		self:_nextShowFirstRank(queue)
	end)
	self:runAction(action)
end




return CountryBossMain
