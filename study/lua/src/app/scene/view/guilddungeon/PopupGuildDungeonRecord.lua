
local PopupBase = require("app.ui.PopupBase")
local PopupGuildDungeonRecord = class("PopupGuildDungeonRecord", PopupBase)
local GuildDungeonMemberNode = require("app.scene.view.guilddungeon.GuildDungeonMemberNode")
local GuildDungeonEnemyNode = require("app.scene.view.guilddungeon.GuildDungeonEnemyNode")
local GuildDungeonPlaybackNode = require("app.scene.view.guilddungeon.GuildDungeonPlaybackNode")
local UserDataHelper = require("app.utils.UserDataHelper")


PopupGuildDungeonRecord.TAB_ID_MEMBER_DATA = 1
PopupGuildDungeonRecord.TAB_ID_ENEMY_DATA = 2
PopupGuildDungeonRecord.TAB_ID_PLAYBACK = 3


function PopupGuildDungeonRecord:ctor()
	local resource = {
		file = Path.getCSB("PopupGuildDungeonRecord", "guildDungeon"),
		binding = {
		}
	}
	PopupGuildDungeonRecord.super.ctor(self, resource)
end

function PopupGuildDungeonRecord:onCreate()
	self._selectTabIndex = 0
	self._contentNodes = {}
	self._tabDatas = {}
	self._panelBg:setTitle(Lang.get("guilddungeon_record_title"))
	self._panelBg:addCloseEventListener(handler(self, self._onClickClose))
end

function PopupGuildDungeonRecord:_refreshTabs()
	local tabIndex = self._selectTabIndex
	self._tabDatas =  {PopupGuildDungeonRecord.TAB_ID_MEMBER_DATA ,
		PopupGuildDungeonRecord.TAB_ID_PLAYBACK}
	local param = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		offset = -2,
		textList = Lang.get("guilddungeon_tab_names") ,
	}
	self._tabGroup:recreateTabs(param)
	if tabIndex == 0 then
		self._tabGroup:setTabIndex(1)
	else
		self._selectTabIndex = 0
		tabIndex = math.min(#self._tabDatas,tabIndex)
		self._tabGroup:setTabIndex(tabIndex)
	end

end

function PopupGuildDungeonRecord:onEnter()
	self._signalGuildDungeonRecordSyn = G_SignalManager:add(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN, handler(self, self._onEventGuildDungeonRecordSyn))
	self._signalGuildDungeonMonsterGet = G_SignalManager:add(SignalConst.EVENT_GUILD_DUNGEON_MONSTER_GET, handler(self, self._onEventGuildDungeonMonsterGet))
	
	self:_refreshTabs()
    self:_refreshTotalPointData()
end

function PopupGuildDungeonRecord:onExit()
	self._signalGuildDungeonRecordSyn:remove()
	self._signalGuildDungeonRecordSyn = nil

	self._signalGuildDungeonMonsterGet:remove()
	self._signalGuildDungeonMonsterGet = nil
end

function PopupGuildDungeonRecord:_onEventGuildDungeonRecordSyn(event)
	self:_refreshTotalPointData()
end

function PopupGuildDungeonRecord:_onEventGuildDungeonMonsterGet(event)
	self:_refreshTotalPointData()
end

function PopupGuildDungeonRecord:_onTabSelect(index, sender)
	if self._selectTabIndex == index then
		return
	end
	self._selectTabIndex = index
	for k, node in pairs(self._contentNodes) do
		node:setVisible(false)
	end
	local curContent = self:_getCurNodeContent()
	if curContent then
		curContent:updateView()
		curContent:setVisible(true)
	end
end
	

function PopupGuildDungeonRecord:_getCurNodeContent()
	local tabId = self._tabDatas[self._selectTabIndex]
	local nodeContent = self._contentNodes[tabId]
	if nodeContent == nil then
		if tabId == PopupGuildDungeonRecord.TAB_ID_MEMBER_DATA then
			nodeContent = GuildDungeonMemberNode.new()
		elseif tabId == PopupGuildDungeonRecord.TAB_ID_ENEMY_DATA then
			nodeContent = GuildDungeonEnemyNode.new()
		elseif tabId == PopupGuildDungeonRecord.TAB_ID_PLAYBACK then
			nodeContent = GuildDungeonPlaybackNode.new()
		end
		self._nodeContent:addChild(nodeContent)
		self._contentNodes[tabId] = nodeContent
	end
	return nodeContent
end
  
function PopupGuildDungeonRecord:_onClickClose()
	self:close()
end

function PopupGuildDungeonRecord:_refreshTotalPointData()
   -- local totalPoint = UserDataHelper.getGuildDungeonTotalPoint()
    local remainCount = UserDataHelper.getGuildDungeonRemainTotalFightCount()

	local rankData = UserDataHelper.getMyGuildDungeonRankData()
    self._textPoint:setString(tostring(rankData:getPoint()))
    self._textCount:setString(tostring(remainCount))
end

return PopupGuildDungeonRecord