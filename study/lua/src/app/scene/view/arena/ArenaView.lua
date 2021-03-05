--竞技场主页面
local ViewBase = require("app.ui.ViewBase")
local ArenaView = class("ArenaView", ViewBase)
local ArenaScrollNode = require("app.scene.view.arena.ArenaScrollNode")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIPopupHelper = require("app.utils.UIPopupHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local PopupArenaSweep = require("app.scene.view.arena.PopupArenaSweep")
local AudioConst = require("app.const.AudioConst")
local ArenaConst = require("app.const.ArenaConst")

function ArenaView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
	end
	G_UserData:getArenaData():c2sGetArenaInfo()
	local signal = G_SignalManager:add(SignalConst.EVENT_ARENA_GET_ARENA_INFO, onMsgCallBack)
	return signal
end

function ArenaView:ctor()
	self._nodeScrollView = nil
	self._myHeroAvatarNode = nil
	self._needRequest = false
	self._popRankUpInfo = nil

	local resource = {
		file = Path.getCSB("ArenaView", "arena"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_btnRank = {
				events = {{event = "touch", method = "_onBtnRank"}}
			},
			_btnReport = {
				events = {{event = "touch", method = "_onBtnReport"}}
			},
			_btnPeek = {
				events = {{event = "touch", method = "_onBtnPeek"}}
			},
			_btnTeam = {
				events = {{event = "touch", method = "_onBtnEmbattle"}}
			},
			_btnShop = {
				events = {{event = "touch", method = "_onBtnShop"}}
			},
			_btnAddTimes = {
				events = {{event = "touch", method = "_onAddTimes"}}
			}
		}
	}
	self:setName("ArenaView")
	ArenaView.super.ctor(self, resource, 120)
end

function ArenaView:onCreate()
	--

	self._topbarBase:setImageTitle("txt_sys_com_jingjichang")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_ARENA)
	self._panelRtMid:addClickEventListenerEx(handler(self, self._onAddTimes))

	self._btnPeek:updateUI(FunctionConst.FUNC_ARENA_PEEK)
	self._btnShop:updateUI(FunctionConst.FUNC_ARENA_SHOP)
	self._btnReport:updateUI(FunctionConst.FUNC_ARENA_REPORT)
	self._btnRank:updateUI(FunctionConst.FUNC_ARENA_RANK)
	self._btnTeam:updateUI(FunctionConst.FUNC_TEAM, nil, "txt_main_enter_group2" )
	-----------------------------------------------------------------
	self._areaScrollNode = ArenaScrollNode.new()

	local posX = self._nodeScrollView:getPositionX()

	--self._nodeScrollView:setPositionX(posX - self._areaScrollNode:getScrollContentSize().width)
	self._nodeScrollView:addChild(self._areaScrollNode)

	self._arenaFuncConst = require("app.config.function_cost").get(DataConst.VIP_FUNC_TYPE_ARENA_TIMES)
	assert(self._arenaFuncConst, "can not find funcion_cost cfg by id " .. DataConst.VIP_FUNC_TYPE_ARENA_TIMES)

	self._panelTouch:setVisible(false)
	self._imageBG:setVisible(false)

	self:_updateAreaUI(true, false)
	--self:addChild(self._touchLayer)
end

function ArenaView:_updateTopPanel()
	local myArenaData = G_UserData:getArenaData():getMyArenaData()
	local rank = myArenaData.rank
	local rankDesc = tostring(myArenaData.rank)
	local isFirst = G_UserData:getArenaData():getArenaFirstBattle()
	if isFirst == 1 then
		rank = 0
	end
	if rank == 0 then
		rankDesc = Lang.get("arena_rank_zero")
	end

	self._textMyTopRank:setString(rankDesc)

	self._textTimes:setString(myArenaData.arenaCount .. "/" .. self._arenaFuncConst.free_count)
end
--
function ArenaView:onEnter()
	local runningScene = G_SceneManager:getRunningScene()
	runningScene:addGetUserBaseInfoEvent()

	G_AudioManager:playMusicWithId(AudioConst.MUSIC_PVP)
	self._signalChallengeArena =
		G_SignalManager:add(SignalConst.EVENT_ARENA_FIGHT_COUNT, handler(self, self._onEventGetChallengeArena))
	self._signalBuyArenaCount =
		G_SignalManager:add(SignalConst.EVENT_ARENA_BUY_COUNT, handler(self, self._onEventGetBuyArenaCount))
	self._signalGetArenaInfo =
		G_SignalManager:add(SignalConst.EVENT_ARENA_GET_ARENA_INFO, handler(self, self._onGetArenaInfo))

	self._signalRedPointUpdate =
		G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventRedPointUpdate))

	self._signalPopupWinAward =
		G_SignalManager:add(SignalConst.EVENT_ARENA_WIN_POPUP_AWARD, handler(self, self._onEventPopupWinAward))

	if self._needRequest then
		G_UserData:getArenaData():c2sGetArenaInfo()
		self._needRequest = false
	else
		--抛出新手事件出新手事件
		G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, "ArenaView player enter")
	end

	self:_onEventRedPointUpdate()
end

function ArenaView:onExit()
	self._signalChallengeArena:remove()
	self._signalChallengeArena = nil
	self._signalBuyArenaCount:remove()
	self._signalBuyArenaCount = nil
	self._signalGetArenaInfo:remove()
	self._signalGetArenaInfo = nil

	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil

	self._signalPopupWinAward:remove()
	self._signalPopupWinAward = nil

	self._battleData = nil
end

function ArenaView:_onBtnShop()
	local FunctionConst = require("app.const.FunctionConst")
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_ARENA_SHOP)
end

function ArenaView:_onBtnEmbattle()
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	local FunctionConst = require("app.const.FunctionConst")
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_TEAM_SLOT1)
end

function ArenaView:_onBtnRank()
	-- local PopupArenaRank = require("app.scene.view.arena.PopupArenaRank").new()
	-- PopupArenaRank:openWithAction()
	G_SceneManager:showDialog("app.scene.view.arena.PopupArenaRank")
end

function ArenaView:_onBtnReport()
	--G_SceneManager:showDialog("app.scene.view.arena.PopupArenaReport")
	local PopupArenaReport = require("app.scene.view.arena.PopupArenaReport").new()
	PopupArenaReport:openWithAction()
end

function ArenaView:_onBtnPeek()
	G_SceneManager:showDialog("app.scene.view.arena.PopupArenaPeek")
	--local PopupArenaPeek = require("app.scene.view.arena.PopupArenaPeek").new()
	--PopupArenaPeek:openWithAction()
end

function ArenaView:_onClickHeroAvatar(playerInfo, isClickBtn)
	if self._panelTouch:isVisible() == true then
		return
	end

	isClickBtn = isClickBtn or false
	logWarn("ArenaView:_onClickHeroAvatar(playerInfo)")
	assert(playerInfo, "playerInfo is null")

	local myArenaData = G_UserData:getArenaData():getMyArenaData()
	local myRank = myArenaData.rank

	if myRank == playerInfo.rank then
		G_Prompt:showTip(Lang.get("arena_challeng_rank_no_self"))
		return
	end

	-- 20名内可挑战
	if playerInfo.rank <= 3 then
		if myRank > 20 then --玩家排名在20名以内才能挑战
			G_Prompt:showTip(Lang.get("arena_challeng_rank_no_enough", {rank = 20}))
			return
		end
	end

	--点击单个角色挑战
	local message = {
		rank = playerInfo.rank,
		num = 1
	}

	--点击扫荡按钮
	if isClickBtn then
		message = {
			rank = playerInfo.rank,
			num = 5
		}
	end

	if myArenaData.arenaCount == 0 then
		self:_onAddTimes()
		--G_Prompt:showTip(Lang.get("arena_challeng_times_no_enough"))
		return
	end

	self._targetUserId = playerInfo.uid
	G_UserData:getArenaData():c2sChallengeArena(message)
end

--获得竞技场信息
--[[
	message S2C_GetArenaInfo {
	required uint32 ret = 1;
	optional uint64 user_id = 2; //玩家ID
	optional uint32 rank = 3; //当前排名
	optional uint32 max_rank = 4; //历史最高排名
	optional uint32 arena_cnt = 5; //剩余挑战次数
	repeated ArenaToChallengeUser to_challenge_list= 6; //对手列表
}
]]
function ArenaView:_updateAreaUI(needJump, needAnimation)
	local playerList = G_UserData:getArenaData():getArenaChallengeList()

	dump(playerList)

	local myArenaData = G_UserData:getArenaData():getMyArenaData()
	if self._myHeroAvatar then
		self._myHeroAvatar:updateAvatar(myArenaData, handler(self, self._onClickMyAvatar))
		self._myHeroAvatar:checkFristBattle()
	else
		self._myHeroAvatarNode:removeAllChildren()
		local myHeroAvatar = require("app.scene.view.arena.ArenaHeroAvatar").new()
		myHeroAvatar:updateAvatar(myArenaData, handler(self, self._onClickMyAvatar))
		myHeroAvatar:checkFristBattle()
		self._myHeroAvatarNode:addChild(myHeroAvatar)
		self._myHeroAvatar = myHeroAvatar
	end

	logWarn("update heroList")
	self._areaScrollNode:updateHeroList(playerList, handler(self, self._onClickHeroAvatar), needJump, needAnimation)

	self:_updateTopPanel()
end

function ArenaView:_onClickMyAvatar()
end

function ArenaView:_onAddTimes(sender)
	local vipInfo = G_UserData:getVip():getVipFunctionDataByType(self._arenaFuncConst.vip_function_id)
	local buyLimit = vipInfo.value

	local myArenaData = G_UserData:getArenaData():getMyArenaData()

	local buyCount = myArenaData.buyCount --服务器从0开始，客户端应该+1
	--dump(buyCount)
	local needGold = UserDataHelper.getPriceAdd(self._arenaFuncConst.price_id, buyCount + 1)

	local function callBackFunction()
		local success, popFunc = LogicCheckHelper.enoughCash(needGold)
		if success then
			local message = {
				id = self._arenaFuncConst.id
			}
			G_UserData:getArenaData():c2sBuyCommonCount(self._arenaFuncConst.id)
		else
			popFunc()
		end
	end

	local isModuleShow = G_UserData:getPopModuleShow("arenaBuyBattleTimes")
	if isModuleShow and isModuleShow == true then
		return
	end
	local VipFunctionIDConst = require("app.const.VipFunctionIDConst")
	local timesOut =
		LogicCheckHelper.vipTimesOutCheck(VipFunctionIDConst.VIP_FUNC_ID_ARENA, buyCount, Lang.get("arena_no_reset_count"))
	if not timesOut then
		local resultTimes = buyLimit - buyCount
		local buyTimesAlert = Lang.get("arena_buytimes_alert", {count = needGold, leftcount = resultTimes})
		local PopupSystemAlert =
			require("app.ui.PopupSystemAlert").new(Lang.get("arena_buytimes_notice"), buyTimesAlert, callBackFunction)
		PopupSystemAlert:openWithAction()
		PopupSystemAlert:setCheckBoxVisible(false)
		PopupSystemAlert:setModuleName("arenaBuyBattleTimes")
	end
	--[[
    if  buyCount >= buyLimit then
        G_Prompt:showTip(vipInfo.hint1)

    else
		local resultTimes = buyLimit - buyCount
		local buyTimesAlert = Lang.get("arena_buytimes_alert", {count = needGold, leftcount = resultTimes})
		local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("arena_buytimes_notice"),buyTimesAlert,callBackFunction)
		PopupSystemAlert:openWithAction()
		PopupSystemAlert:setCheckBoxVisible(false)
		PopupSystemAlert:setModuleName("arenaBuyBattleTimes")
    end
	]]
end

function ArenaView:_onEventGetBuyArenaCount(id, message)
	if message.ret ~= 1 then
		return
	end

	G_Prompt:showTip(Lang.get("arena_buy_times_succ"))
	local funcId = message.id
	if funcId == DataConst.VIP_FUNC_TYPE_ARENA_TIMES then
		self:_updateTopPanel()
	end
end

function ArenaView:_onEventRedPointUpdate(id, message)
	local RedPointHelper = require("app.data.RedPointHelper")
	--local redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARENA, "atkRP")
	local redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARENA, "defRP")
	local redValue3 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARENA, "peekRP")
	local redValue4 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "arenaShop")
	--self._
	local function updateRedPoint(node, value)
		local redPoint = node:getSubNodeByName("RedPoint")
		redPoint:setVisible(value)
	end
	updateRedPoint(self._btnReport, redValue2)
	updateRedPoint(self._btnPeek, redValue3)
	updateRedPoint(self._btnShop, redValue4)
	--updateRedPoint(self._btnAward, redValue4)
end

function ArenaView:_onEventPopupWinAward(...)
	-- body
	if self._popRankUpInfo and self._popRankUpInfo.oldData then
		logWarn("show win PopupRankUpReward")
		local function onCloseCall(...)
			-- body
			logWarn(" self._panelTouch:setVisible(false) ")
			self._panelTouch:setVisible(false)
			self._popRankUpInfo = nil
			self._targetUserId = nil
		end

		local PopupRankUpReward = require("app.scene.view.arena.PopupRankUpReward").new(self._popRankUpInfo, onCloseCall)
		PopupRankUpReward:openWithAction()
		self:_updateAreaUI(true, true)
		--抛出新手事件出新手事件
		G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, "ArenaView PopupRankUpReward")
	end
end
function ArenaView:_onGetArenaInfo(id, message)
	--先播放踢人动画
	if self._popRankUpInfo and self._popRankUpInfo.oldData then
		self._myHeroAvatar:playWinEffect()
	else
		self:_updateAreaUI(false, false)
	end
end

--[[
	optional BattleReport battle_report = 1;//战报(只会在战一次的时候传)
	repeated Award rewards = 2; //战斗奖励
	optional uint32 old_rank = 3; //老排名(只会在战一次的时候传)
	optional uint32 new_rank = 4; //新排名(只会在战一次的时候传)
	optional bool result = 5;//true- 赢 false- 输 (战5次时用)
	repeated Award turnover_rewards = 6;//翻拍奖励
]]
function ArenaView:_enterFightView(message)
	local arenaFight = clone(message.arena_fight[1])
	arenaFight.battle_report = G_UserData:getFightReport():getReport()
	local ReportParser = require("app.fight.report.ReportParser")
	local reportData = ReportParser.parse(arenaFight.battle_report)
	local battleData = require("app.utils.BattleDataHelper").parseArenaData(arenaFight, "img_mline_map01")

	G_SceneManager:showScene("fight", reportData, battleData)
	self._needRequest = true

	local firstBattle = rawget(message, "first_battle")
	if firstBattle == 1 then
		battleData.oldRank = 0
	end

	local oldAvatar = self._areaScrollNode:getAvatarNodeById(self._targetUserId)

	local maxRankReward = rawget(message, "max_rank_reward") or {}
	if battleData.newRank > 0 and #maxRankReward > 0 then
		self._popRankUpInfo = {
			award = maxRankReward[1],
			oldRank = battleData.oldRank,
			newRank = battleData.newRank,
			oldData = oldAvatar:getArenaPlayer()
		}

		self._panelTouch:setVisible(true)
	end
end

function ArenaView:_onEventGetChallengeArena(id, message)
	if message.ret ~= 1 then
		return
	end

	local fightNum = message.num
	if fightNum == 1 then
		local reportId = message.arena_fight[1].battle_report

		G_SceneManager:registerGetReport(
			reportId,
			function()
				self:_enterFightView(message)
			end
		)
	else
		local function getBattleAwardList(arenaFight)
			local fightResult = true
			local retList = {}
			for i, fightData in ipairs(arenaFight) do
				local rewardsItem = {}
				rewardsItem.rewards = rawget(fightData, "rewards") or {}
				rewardsItem.addRewards = rawget(fightData, "add_rewards") or nil

				fightResult = rawget(fightData, "result")
				rewardsItem.result = fightResult
				--rewardsItem.turnRewards = rawget(fightData, "turnover_rewards") or {}
				table.insert(retList, rewardsItem)
			end
			return retList, fightResult
		end
		--扫荡界面
		--local fightResult = rawget(message.arena_fight[1], "result")
		local rewardList, fightResult = getBattleAwardList(message.arena_fight)
		local popupArenaSweep = PopupArenaSweep.new(rewardList, fightResult)
		popupArenaSweep:openWithAction()
	end
	self:_updateTopPanel()
end

function ArenaView:_convertToWorldSpace(node, pos)
	local pos = pos or cc.p(0, 0)
	local worldPos = node:convertToWorldSpace(pos)
	return self:getSubNodeByName("Panel_root"):convertToNodeSpace(worldPos)
end

function ArenaView:onPlayerAttack(targetId, callback)
	-- body

	local aniAvatar = require("app.scene.view.arena.ArenaHeroAvatar").new()
	aniAvatar:updateAnimation(self._myHeroAvatar:getBaseId())
	aniAvatar:setName("attackAvatar")

	local function bezierBeginAction()
		local function onFinish()
			self._myHeroAvatarNode:setVisible(false)
			aniAvatar:playAnimation("moveahead")
		end
		local action = cc.CallFunc:create(onFinish)
		return action
	end

	local function makeBezierAction()
		local avatar = self._areaScrollNode:getAvatarNodeById(targetId)
		local endPos = self:_convertToWorldSpace(avatar)
		local startPos = self:_convertToWorldSpace(self._myHeroAvatarNode)
		if startPos then
			aniAvatar:setPosition(startPos)
		end

		local midPos =
			cc.p(endPos.x + (startPos.x - endPos.x) * 0.5, math.abs(startPos.y - endPos.y) * 0.5 + ArenaConst.BezierYOffset)
		local bezier = {
			startPos,
			midPos,
			endPos
		}
		local action1 = cc.BezierTo:create(ArenaConst.BezierTime, bezier)
		return action1
	end

	local function bezierFinishAction()
		local function onFinish()
			local avatar = self:getSubNodeByName("Panel_root"):getSubNodeByName("attackAvatar")
			--avatar:removeFromParent()
			avatar:playJumpEffect()
			avatar:playAnimation("attack")
			self:_playDropAction(targetId, callback)
		end
		local action = cc.CallFunc:create(onFinish)
		return action
	end
	local function dealyFunctionAction()
		local function delayFunc()
			local avatar = self:getSubNodeByName("Panel_root"):getSubNodeByName("attackAvatar")
			avatar:removeFromParent()
		end
		local action = cc.CallFunc:create(delayFunc)
		return action
	end

	local seqAction =
		cc.Sequence:create(
		bezierBeginAction(),
		makeBezierAction(),
		bezierFinishAction(),
		cc.DelayTime:create(ArenaConst.AttackDelay),
		dealyFunctionAction()
	)

	aniAvatar:runAction(seqAction)
	self:getSubNodeByName("Panel_root"):addChild(aniAvatar)
end

--竞技场下落特效
function ArenaView:_playDropAction(targetId, callBack)
	local avatar = self._areaScrollNode:getAvatarNodeById(targetId)

	local aniAvatar = require("app.scene.view.arena.ArenaHeroAvatar").new()
	aniAvatar:updateAnimation(avatar:getBaseId())
	aniAvatar:playAnimation("hitfall3")

	local function makeBezierAction()
		local startPos = self:_convertToWorldSpace(avatar)
		aniAvatar:setPosition(startPos.x, startPos.y)
		local endPos = cc.p(startPos.x - 50, -100)
		local midPos = cc.p(startPos.x - 50, startPos.y - 200)
		local bezier = {
			startPos,
			midPos,
			endPos
		}
		local action1 = cc.BezierTo:create(ArenaConst.BezierTime, bezier)
		return action1
	end

	local function bezierBeginAction()
		local function onFinish()
			local targetAvatar = self._areaScrollNode:getAvatarNodeById(targetId)
			targetAvatar:updateAvatar(G_UserData:getArenaData():getMyArenaData())

			targetAvatar:setVisible(true)
		end
		local action = cc.CallFunc:create(onFinish)
		return action
	end

	local function bezierFinishAction()
		local function onFinish()
			logWarn("bezierFinishAction")
			if callBack and type(callBack) == "function" then
				callBack()
			end
		end
		local action = cc.CallFunc:create(onFinish)
		return action
	end

	local seqAction = cc.Sequence:create(bezierBeginAction(), makeBezierAction(), bezierFinishAction())

	aniAvatar:runAction(seqAction)
	self:getSubNodeByName("Panel_root"):addChild(aniAvatar)
end

--竞技场进入特效
function ArenaView:onPlayerEnter(callback)
	local aniAvatar = require("app.scene.view.arena.ArenaHeroAvatar").new()
	aniAvatar:updateAnimation(self._myHeroAvatar:getBaseId())
	aniAvatar:setName("enterAvatar")

	local function bezierBeginAction()
		local function onFinish()
			local avatar = self._areaScrollNode:getSelfNode()
			avatar:setVisible(false)
			aniAvatar:playJumpEffect()
			self._myHeroAvatarNode:setVisible(false)
		end
		local action = cc.CallFunc:create(onFinish)
		return action
	end

	local function makeBezierAction()
		local avatar = self._areaScrollNode:getSelfNode()
		local starPos = self:_convertToWorldSpace(avatar)
		local endPos = self:_convertToWorldSpace(self._myHeroAvatarNode)
		aniAvatar:setPosition(starPos)
		local midPos =
			cc.p(endPos.x + (starPos.x - endPos.x) * 0.5, math.abs(starPos.y - endPos.y) * 0.5 + ArenaConst.BezierYOffset)
		local bezier = {
			starPos,
			midPos,
			endPos
		}
		local action1 = cc.BezierTo:create(ArenaConst.BezierTime, bezier)
		return action1
	end

	local function bezierFinishAction()
		local function onFinish()
			local avatar = self:getSubNodeByName("Panel_root"):getSubNodeByName("enterAvatar")
			aniAvatar:playJumpEffect()
		end
		local action = cc.CallFunc:create(onFinish)
		return action
	end

	local function dealyFunctionAction()
		local function delayFunc()
			self._myHeroAvatarNode:setVisible(true)
			local avatar = self:getSubNodeByName("Panel_root"):getSubNodeByName("enterAvatar")
			avatar:removeFromParent()
			if callback and type(callback) == "function" then
				callback()
			end
		end
		local action = cc.CallFunc:create(delayFunc)
		return action
	end

	local seqAction =
		cc.Sequence:create(
		bezierBeginAction(),
		cc.DelayTime:create(ArenaConst.BezierDelay),
		makeBezierAction(),
		bezierFinishAction(),
		cc.DelayTime:create(ArenaConst.BezierDelay),
		dealyFunctionAction()
	)
	aniAvatar:runAction(seqAction)

	self:getSubNodeByName("Panel_root"):addChild(aniAvatar)
	aniAvatar:playAnimation("moveahead")
	aniAvatar:turnBack()
end

return ArenaView
