-- Author: nieming
-- Date:2018-01-30 10:12:03
-- Describle：军团答题
local ViewBase = require("app.ui.ViewBase")
local GuildAnswerView = class("GuildAnswerView", ViewBase)
local GuildAnswerConst = require("app.const.GuildAnswerConst")
local GuildAnswerHelper = require("app.scene.view.guildAnswer.GuildAnswerHelper")
local CSHelper = require("yoka.utils.CSHelper")
local TabScrollView = require("app.utils.TabScrollView")

function GuildAnswerView:waitEnterMsg(callBack)
	local function onMsgCallBack(id, answerData)
		callBack()
	end
	G_UserData:getGuildAnswer():c2sEnterGuildAnswer()

	return G_SignalManager:add(SignalConst.EVENT_ENTER_GUILD_ANSWER_SUCCESS, onMsgCallBack)
end

function GuildAnswerView:ctor()
	--csb bind var name
	self._chatMini = nil --CommonMiniChat
	self._clientParent = nil --SingleNode
	self._commonPop = nil --
	self._rankListView = nil --ScrollView
	self._rankListViewBottom = nil --SingleNode
	self._rankTipRichNode = nil --SingleNode
	self._rankTitle = nil --Text
	self._rankRewardListViewItem = nil
	self._commonHelp = nil

	self._isFinished = false

	self._curState = GuildAnswerConst.ANSWER_INIT

	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("GuildAnswerView", "guildAnswer")
	}
	GuildAnswerView.super.ctor(self, resource)
end
-- waitEnterMsg 默认播放动画 参数不好修改 重载方法
function GuildAnswerView:openWithAction()
	self:open()
end
-- Describle：
function GuildAnswerView:onCreate()
	self._commonPop:setTitle(Lang.get("lang_guild_answer_title"))
	self._commonPop:addCloseEventListener(handler(self, self._onButtonClose))
	self._commonHelp:updateUI(FunctionConst.FUNC_GUILD_ANSWER)
	self:_initRankTab()
	self:_initRankListView()
	self:_initBottomInfo()

	-- local rankAwardTips = ccui.RichText:createRichTextByFormatString2(Lang.get("lang_guild_answer_rank_award_tip"), Colors.DARK_BG_THREE, 20)
	-- rankAwardTips:setAnchorPoint(cc.p(0, 0.5))
	-- self._rankTipRichNode:addChild(rankAwardTips)
	-- self:_updateRankRewardInfo()
end

function GuildAnswerView:_initBottomInfo()
	-- body
	local rankListBottomInfo = require("app.scene.view.guildAnswer.RankListViewCell").new()
	rankListBottomInfo:setAnchorPoint(cc.p(0, 0))
	self._rankListViewBottom:addChild(rankListBottomInfo)
	self._rankListBottomInfo = rankListBottomInfo
	self._rankListBottomInfo:setImageBgVisible(false)
end

function GuildAnswerView:_initRankTab()
	self._curSelectTabIndex = 0
	local param = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		offset = 2,
		textList = {Lang.get("lang_guild_answer_rank_tab_guild"), Lang.get("lang_guild_answer_rank_tab_person")}
	}
	self._nodeTabRoot:recreateTabs(param)
end

function GuildAnswerView:_onTabSelect(index, sender)
	if self._curSelectTabIndex == index then
		return
	end
	self._curSelectTabIndex = index

	self:_updateRankTopState(self._curSelectTabIndex == GuildAnswerConst.RANK_PERSON)

	self:_updateRankList()
end

-- Describle：
function GuildAnswerView:onEnter()
	self._enterSignal =
		G_SignalManager:add(SignalConst.EVENT_ENTER_GUILD_ANSWER_SUCCESS, handler(self, self._updateAnswerData))
	self._rankChangeSignal =
		G_SignalManager:add(SignalConst.EVENT_GUILD_ANSWER_PUBLIC_SUCCESS, handler(self, self._onRankChange))
	self._signalGetAuctionInfo =
		G_SignalManager:add(SignalConst.EVENT_GET_ALL_AUCTION_INFO, handler(self, self._onEventGetAuctionInfo))
	self:_updateAnswerData()
end

-- Describle：
function GuildAnswerView:onExit()
	self._enterSignal:remove()
	self._enterSignal = nil

	self._rankChangeSignal:remove()
	self._rankChangeSignal = nil

	self._signalGetAuctionInfo:remove()
	self._signalGetAuctionInfo = nil
end

function GuildAnswerView:_updateAnswerData(id, answerData)
	self._answerData = G_UserData:getGuildAnswer():getAnswerData()
	self:_stateChange()
	self:_updateRankRewardInfo()
end
--状态切换
function GuildAnswerView:_stateChange()
	if not GuildAnswerHelper.isTodayOpen() then
		self._curState = GuildAnswerConst.ANSWER_END
		self:_stateEnd()
		return
	end

	local curTime = G_ServerTime:getTime()
	print("curTime "..curTime)

	self._clientParent:removeAllChildren()
	local startTime = GuildAnswerHelper.getGuildAnswerStartTime()
	print("startTime "..startTime)
	local oldState = self._curState
	--无题目数据数据
	if #self._answerData.questions == 0 then
		logWarn("====================questions is empty")
		self._curState = GuildAnswerConst.ANSWER_END
		self:_stateEnd()
	elseif curTime < startTime then
		self._curState = GuildAnswerConst.ANSWER_END
		self:_stateEnd()
	else
		local totalTime = GuildAnswerHelper.getGuildAnswerTotalTime()
		print("totalTime "..totalTime)
		if curTime >= startTime + totalTime or self._isFinished == true then
			self._curState = GuildAnswerConst.ANSWER_END
			self:_stateEnd()
		elseif self._isFinished == false then
			self._curState = GuildAnswerConst.ANSWER_ING
			self:_stateIng()
		end
	end
	-- 获取拍卖数据  判断是否需要显示前往拍卖
	--if oldState ~= self._curState and self._curState == GuildAnswerConst.ANSWER_END then
		-- logDebug("====================get acution data")
		-- G_UserData:getAuction():c2sGetAllAuctionInfo()
	--end
end

function GuildAnswerView:_getRankListData()
	if self._answerData and self._answerData.ranks then
		if self._curSelectTabIndex == GuildAnswerConst.RANK_PERSON then
			return self._answerData.ranks.person
		else
			return self._answerData.ranks.guild
		end
	end
	return {}
end

function GuildAnswerView:_onRankChange(id, ranks)
	if not self._answerData then
		return
	end
	self._answerData.ranks = ranks
	self:_updateRankList()
end

function GuildAnswerView:_onEventGetAuctionInfo()
	-- body
	self:_checkShowDlg()
end
--如果没发现 我的公会数据 构造一个空的
function GuildAnswerView:_constructionMyGuildRankData()
	local myGuild = G_UserData:getGuild():getMyGuild()
	local myGuildName = ""
	if myGuild then
		myGuildName = myGuild:getName()
	end
	local GuildAnswerRankUnitData = require("app.data.GuildAnswerRankUnitData")
	local data = GuildAnswerRankUnitData.new()
	data:setName(myGuildName)
	return data
end

--如果没发现 我的公会数据 构造一个空的
function GuildAnswerView:_constructionMyPersonRankData()
	local name = G_UserData:getBase():getName()
	local GuildAnswerRankUnitData = require("app.data.GuildAnswerRankUnitData")
	local data = GuildAnswerRankUnitData.new()
	data:setName(name)
	return data
end

function GuildAnswerView:_updateMyRankInfo()
	local rankData = self:_getRankListData()
	local isFind = false
	local myRankData = nil
	if self._curSelectTabIndex == GuildAnswerConst.RANK_PERSON then
		local userId = G_UserData:getBase():getId()
		for _, v in pairs(rankData) do
			if v:getUser_id() == userId then
				isFind = true
				myRankData = v
				break
			end
		end
		if not isFind then
			myRankData = self:_constructionMyPersonRankData()
		end
	else
		local guildId = GuildAnswerHelper.getGuildId()
		for _, v in pairs(rankData) do
			if v:getGuild_id() == guildId then
				isFind = true
				myRankData = v
				break
			end
		end
		if not isFind then
			myRankData = self:_constructionMyGuildRankData()
		end
	end
	self._rankListBottomInfo:updateUI(myRankData, true)
	if myRankData:getPoint() == 0 then
		self._rankListBottomInfo:setScoreEmpty()
	end
end

function GuildAnswerView:_updateRankList()
	local rankData = self:_getRankListData()
	self._tabListView:updateListView(self._curSelectTabIndex, #rankData)
	self:_updateMyRankInfo()
end

function GuildAnswerView:_updateRankTopState(isPerson)
	self._rankTopGuild:setVisible(not isPerson)
	self._rankTopPerson:setVisible(isPerson)
end

function GuildAnswerView:_stateIng()
	self._rankTitle:setString(Lang.get("lang_guild_answer_rank_title_score"))
	local AnswerClientStart = require("app.scene.view.guildAnswer.AnswerClientStart")
	local client =
		AnswerClientStart.new(
		self._answerData.questions,
		function()
			G_UserData:getGuildAnswer():c2sEnterGuildAnswer()
			self._isFinished = true
		end
	)
	self._client = client
	self._clientParent:addChild(self._client)

	self:_updateRankTopState(self._curSelectTabIndex == GuildAnswerConst.RANK_PERSON)
	self:_updateRankList()
end

function GuildAnswerView:_stateEnd()
	self._rankTitle:setString(Lang.get("lang_guild_answer_rank_title_score"))
	local AnswerClientEnd = require("app.scene.view.guildAnswer.AnswerClientEnd")
	local client =
		AnswerClientEnd.new(
		function()
			G_UserData:getGuildAnswer():c2sEnterGuildAnswer()
		end,
		#self._answerData.questions == 0
	)
	self._client = client
	self._clientParent:addChild(self._client)

	self:_updateRankTopState(self._curSelectTabIndex == GuildAnswerConst.RANK_PERSON)

	self:_updateRankList()
end

function GuildAnswerView:_initRankListView()
	-- body

	local RankListViewCell = require("app.scene.view.guildAnswer.RankListViewCell")
	local scrollViewParam = {
		template = RankListViewCell,
		updateFunc = handler(self, self._onRankListViewItemUpdate),
		selectFunc = handler(self, self._onRankListViewItemSelected),
		touchFunc = handler(self, self._onRankListViewItemTouch)
	}

	self._tabListView = TabScrollView.new(self._rankListView, scrollViewParam)
end

-- Describle：
function GuildAnswerView:_onRankListViewItemUpdate(item, index)
	local ranksData = self:_getRankListData()
	local rankData = ranksData[index + 1]
	item:updateUI(rankData)
end

-- Describle：
function GuildAnswerView:_onRankListViewItemSelected(item, index)
end

-- Describle：
function GuildAnswerView:_onRankListViewItemTouch(index, params)
end

function GuildAnswerView:_updateRankRewardInfo()
	local rewards = GuildAnswerHelper.getPreviewRankRewards(G_UserData:getGuildAnswer():getRandomAward())
	self._rankRewardListViewItem:updateUI(rewards)
	self._rankRewardListViewItem:setMaxItemSize(5)
	self._rankRewardListViewItem:setListViewSize(380, 100)
	self._rankRewardListViewItem:setItemsMargin(2)
end

function GuildAnswerView:_checkShowDlg()
	if GuildAnswerHelper.isTodayShowEndDialog() then
		logWarn("====================today is show")
		return
	end
	local AuctionConst = require("app.const.AuctionConst")
	local isAuctionWorldEnd = G_UserData:getAuction():isAuctionShow(AuctionConst.AC_TYPE_GUILD_ANSWER_ID)
	if isAuctionWorldEnd == false then
		logWarn("====================Auction not open")
		return
	end
	local isInGuild = G_UserData:getGuild():isInGuild()
	if not isInGuild then
		logWarn("====================not in guild")
		return
	end
	self:_showEndDlg()
end

function GuildAnswerView:_showEndDlg()
	if self._answerData and self._answerData.endRank ~= 0 then
		local function onBtnGo()
			local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
			WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_AUCTION)
		end
		local PopupSystemAlert =
			require("app.ui.PopupSystemAlert").new(Lang.get("lang_guild_answer_popup_title1"), nil, onBtnGo)
		local content
		-- if self._answerData.endRank <= GuildAnswerHelper.getAuctionAwardRank() then
		content =
			Lang.get(
			"lang_guild_answer_award_tip1",
			{rank = self._answerData.endRank, exp = self._answerData.endExp, score = self._answerData.endScore}
		)
		-- else
		-- 	content = Lang.get("lang_guild_answer_award_tip2",{rank = self._answerData.endRank, score = self._answerData.endScore})
		-- end
		GuildAnswerHelper.setTodayShowDialogTime()
		PopupSystemAlert:setContentWithRichTextType3(content, Colors.BRIGHT_BG_TWO, 22, 10)
		PopupSystemAlert:setCheckBoxVisible(false)
		PopupSystemAlert:showGoButton(Lang.get("lang_guild_answer_popup_btn_goto"))
		PopupSystemAlert:setCloseVisible(true)
		PopupSystemAlert:openWithAction()
	end
end

function GuildAnswerView:_onButtonClose()
	G_SceneManager:popScene()
end

return GuildAnswerView
