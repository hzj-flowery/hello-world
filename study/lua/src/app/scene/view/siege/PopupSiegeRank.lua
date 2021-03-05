local PopupBase = require("app.ui.PopupBase")
local PopupSiegeRank = class("PopupSiegeRank", PopupBase)

local PopupSiegeRankCell = require("app.scene.view.siege.PopupSiegeRankCell")
local Hero = require("app.config.hero")
local Color = require("app.utils.Color")
local TabButtonGroup = require("app.utils.TabButtonGroup")
local RebelRankReward = require("app.config.rebel_rank_reward")

function PopupSiegeRank:ctor(personReward, guildReward)
    self._data = G_UserData:getSiegeRankData()	--排行数据
	self._personReward = personReward
	self._guildReward = guildReward

    self._rankBG = nil  --背景
	self._commonTabGroupSmallHorizon = nil

	self._textMyRank = nil		--我的排名
	self._rewardTitle = nil 	--排名奖励
	self._rankReward = nil		--奖励内容
	self._myRankIcon = nil		--排行icon
	self._listRank = nil		--排行list
	self._selectTabIndex = 1 	--初始切页

	--signal
	self._signalRank = nil			--叛军排行
	self._signalGuildRank = nil		--叛军工会排行

	self._rankData = nil
	self._type = nil 			

	local resource = {
		file = Path.getCSB("PopupSiegeRank", "siege"),
		binding = {
		}
	}
	PopupSiegeRank.super.ctor(self, resource)
end

function PopupSiegeRank:onCreate()
	self._rankBG:setTitle(Lang.get("siege_rank_title"))
	self._rankBG:addCloseEventListener(handler(self, self._onCloseClick))
	self:_initTab()
end

function PopupSiegeRank:onEnter()
	self:_refreshMyRank()
	self._signalRank = G_SignalManager:add(SignalConst.EVENT_SIEGE_RANK, handler(self, self._onEventSiegeRank))
	self._signalGuildRank = G_SignalManager:add(SignalConst.EVENT_SIEGE_GUILD_RANK, handler(self, self._onEventSiegeGuildRank))

	G_UserData:getSiegeRankData():c2sGetRebelArmyHurtRank()	--初始化的时候，显示个人排行
	local runningScene = G_SceneManager:getRunningScene()
	runningScene:addGetUserBaseInfoEvent()
end

function PopupSiegeRank:onExit()
	self._signalRank:remove()
	self._signalRank = nil
	self._signalGuildRank:remove()
	self._signalGuildRank = nil
end

function PopupSiegeRank:_onCloseClick()
    self:closeWithAction()
end

function PopupSiegeRank:_refreshMyRank()
	local myRank = G_UserData:getSiegeData():getUserRank()
	if myRank == 0 then
		self._textMyRank:setString(Lang.get("siege_rank_no_rank"))
		self._textMyRank:setVisible(true)
		self._myRankIcon:setVisible(false)
	elseif myRank < 4 then
		self._textMyRank:setVisible(false)
		self._myRankIcon:setVisible(true)
		self._myRankIcon:setRank(myRank)
	else
        self._textMyRank:setString(myRank)
		self._textMyRank:setVisible(true)
		self._myRankIcon:setVisible(false)
	end
	if myRank ~= 0 then
    	local reward = self._personReward
		if reward then
			self._rankReward:updateUI(reward.type,reward.value, reward.size) 
			self._rankReward:setVisible(true)
			self._rewardTitle:setVisible(true)
		end
	else
		self._rewardTitle:setVisible(false)
		self._rankReward:setVisible(false)
	end
end

function PopupSiegeRank:_refreshMyGuildRank()
	local myGuildRank = G_UserData:getSiegeData():getUserGuildRank()
	if myGuildRank == 0 then
		self._textMyRank:setString(Lang.get("siege_rank_no_rank"))
		self._textMyRank:setVisible(true)
        self._myRankIcon:setVisible(false)
	elseif myGuildRank < 4 then
        self._myRankIcon:setRank(myGuildRank)      
        self._textMyRank:setVisible(false)
        self._myRankIcon:setVisible(true)
	else
        self._textMyRank:setString(myGuildRank)
        self._textMyRank:setVisible(true)
        self._myRankIcon:setVisible(false)
	end
	if myGuildRank ~= 0 then
		local myRankString = tostring(myGuildRank)
		local reward = self._guildReward
		if reward then
			self._rankReward:updateUI(reward.type,reward.value, reward.size) 
			self._rankReward:setVisible(true)
			self._rewardTitle:setVisible(true)
		end
	else
		self._rewardTitle:setVisible(false)
		self._rankReward:setVisible(false)
	end
end

function PopupSiegeRank:_refreshPersonRank()
	self._listRank:clearAll()
	self._rankData = self._data:getRankDatas()
	self._type = PopupSiegeRankCell.TYPE_PERSON
	local listView = self._listRank
    listView:setTemplate(PopupSiegeRankCell)
    listView:setCallback(handler(self, self._onRankUpdate), handler(self, self._onItemSelected))
    listView:resize(#self._rankData)
end

function PopupSiegeRank:_refreshGuildRank()
	self._listRank:clearAll()
	self._rankData = self._data:getGuildRankDatas()
	self._type = PopupSiegeRankCell.TYPE_GUILD
	local listView = self._listRank
    listView:setTemplate(PopupSiegeRankCell)
    listView:setCallback(handler(self, self._onRankUpdate), handler(self, self._onItemSelected))
    listView:resize(#self._rankData)
end

function PopupSiegeRank:_onRankUpdate(item, index)
    local rankData = self._rankData
    if #rankData > 0 then
		item:refreshInfo(rankData[index+1], self._type)
	end
end

function PopupSiegeRank:_onItemSelected(item, index)

end

function PopupSiegeRank:_initTab()
	local param = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		offset = 2,
		textList = {Lang.get("siege_rank_type1"), Lang.get("siege_rank_type2")}
	}
	self._commonTabGroupSmallHorizon:recreateTabs(param)

	self:_refreshPersonRank()
end

function PopupSiegeRank:_onTabSelect(index)
	if self._selectTabIndex == index then
		return
	end
	self._selectTabIndex = index
	if index == 1 then			--个人排行
		G_UserData:getSiegeRankData():c2sGetRebelArmyHurtRank()
		self:_refreshMyRank()
	elseif index == 2 then		--军团排行
		G_UserData:getSiegeRankData():c2sGetRebelArmyGuildHurtRank()
		self:_refreshMyGuildRank()
	end
end

function PopupSiegeRank:_onEventSiegeRank()
	self:_refreshPersonRank()
end

function PopupSiegeRank:_onEventSiegeGuildRank()
	self:_refreshGuildRank()
end


return PopupSiegeRank