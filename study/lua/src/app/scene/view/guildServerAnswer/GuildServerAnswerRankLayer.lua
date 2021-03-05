-- Author: liushiyin
-- Date:2019-03-11 18:36:31
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local GuildServerAnswerRankLayer = class("GuildServerAnswerRankLayer", ViewBase)
local RankTabButton = import(".RankTabButton")
local GuildServerAnswerRankCell = import(".GuildServerAnswerRankCell")

local TAB_GUILD = 1
local TAB_PERSON = 2
local MAX_CELLS = 20

function GuildServerAnswerRankLayer:ctor()
	self._isFold1 = false
	self._tabSelect = TAB_GUILD

	local resource = {
		file = Path.getCSB("GuildServerAnswerRankLayer", "guildServerAnswer"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_imageArrow1 = {
				events = {{event = "touch", method = "_onButtonLeftArrow"}}
			}
		}
	}
	GuildServerAnswerRankLayer.super.ctor(self, resource)
end

-- Describle：
function GuildServerAnswerRankLayer:onCreate()
	self:_initUI()
	self:_initListItemSource()
end

-- Describle：
function GuildServerAnswerRankLayer:onEnter()
	self._signalEventGuildAnswerPublicSuccess =
		G_SignalManager:add(SignalConst.EVENT_GUILD_NEW_ANSWER_UPDATE_RANK, handler(self, self._onEventUpdateRankData))
	local ranks = G_UserData:getGuildServerAnswer():getRanks()
	self:_updateData(ranks)
	self:_updateView()
end

function GuildServerAnswerRankLayer:_updateData(ranks)
	self._guildRankData = ranks.guild
	self._personRankData = ranks.person
end

function GuildServerAnswerRankLayer:_initUI()
	self._btnGuild = RankTabButton.new(self._buttonTab1)
	self._btnPerson = RankTabButton.new(self._buttonTab2)
	self._btnGuild:addClickEventListenerEx(handler(self, self._onButtonGuildRank))
	self._btnPerson:addClickEventListenerEx(handler(self, self._onButtonPersonRank))
	self._btnGuild:setString(Lang.get("answer_rank_tab1"))
	self._btnPerson:setString(Lang.get("answer_rank_tab2"))
	self._btnGuild:setSelected(true)
	self._btnPerson:setSelected(false)

	self._myRankCell = GuildServerAnswerRankCell.new()
	self._myNode:addChild(self._myRankCell)
	self._myRankCell:setImageBg(Path.getAnswerImg("img_server_answer_01c"))
end

-- Describle：
function GuildServerAnswerRankLayer:onExit()
	self._signalEventGuildAnswerPublicSuccess:remove()
	self._signalEventGuildAnswerPublicSuccess = nil
end

function GuildServerAnswerRankLayer:_onEventUpdateRankData(id, ranks)
	self:_updateData(ranks)
	self:_updateView()
end

function GuildServerAnswerRankLayer:_initListItemSource()
	-- body
	local TabScrollView = require("app.utils.TabScrollView")
	local scrollViewParam = {
		template = GuildServerAnswerRankCell,
		updateFunc = handler(self, self._onListItemSourceItemUpdate),
		selectFunc = handler(self, self._onListItemSourceItemSelected),
		touchFunc = handler(self, self._onListItemSourceItemTouch)
	}
	self._tabListView = TabScrollView.new(self._listItemSource, scrollViewParam)
end

-- Describle：
function GuildServerAnswerRankLayer:_onListItemSourceItemUpdate(item, index)
	local rankData = self._guildRankData[index + 1]
	if self._tabSelect == TAB_PERSON then
		rankData = self._personRankData[index + 1]
	end
	item:setImageVisible(false)
	item:updateUI(rankData)
end

function GuildServerAnswerRankLayer:_updateView()
	local lineCount = 0
	local GuildServerAnswerHelper = require("app.scene.view.guildServerAnswer.GuildServerAnswerHelper")
	local myRankData, myGuildRankData =
		GuildServerAnswerHelper.getMyAndMyGuildRankData(self._personRankData, self._guildRankData)
	if self._tabSelect == TAB_GUILD then
		lineCount = math.min(#self._guildRankData, MAX_CELLS)
		self:_updateRankCell(myGuildRankData)
	else
		lineCount = math.min(#self._personRankData, MAX_CELLS)
		self:_updateRankCell(myRankData)
	end
	self._tabListView:updateListView(self._tabSelect, lineCount)
end

function GuildServerAnswerRankLayer:_updateRankCell(rankData)
	if rankData then
		self._myNode:setVisible(true)
		self._myRankCell:updateUI(rankData, true)
	else
		self._myNode:setVisible(false)
	end
end

function GuildServerAnswerRankLayer:_onButtonLeftArrow(sender)
	self._isFold1 = not self._isFold1
	self:stopAllActions()
	local posX = self._imageRankBg:getContentSize().width
	local callAction =
		cc.CallFunc:create(
		function()
			self._arrow:setScale(self._isFold1 and -1 or 1)
		end
	)
	local action =
		cc.MoveTo:create(0.3, cc.p(self._isFold1 and -posX * 0.5 or posX * 0.5, self._imageRankBg:getPositionY()))
	local runningAction = cc.Sequence:create(action, callAction)
	self._imageRankBg:runAction(runningAction)
end

function GuildServerAnswerRankLayer:_onButtonGuildRank()
	self._tabSelect = TAB_GUILD
	self._btnGuild:setSelected(true)
	self._btnPerson:setSelected(false)
	self:_updateView()
end

function GuildServerAnswerRankLayer:_onButtonPersonRank()
	self._tabSelect = TAB_PERSON
	self._btnPerson:setSelected(true)
	self._btnGuild:setSelected(false)
	self:_updateView()
end

return GuildServerAnswerRankLayer
