
local ViewBase = require("app.ui.ViewBase")
local GuildDungeonMemberNode = class("GuildDungeonMemberNode", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")

function GuildDungeonMemberNode:ctor()
	local resource = {
		file = Path.getCSB("GuildDungeonMemberNode", "guildDungeon"),
		binding = {
		}
	}
	GuildDungeonMemberNode.super.ctor(self, resource)
end

function GuildDungeonMemberNode:onCreate()
    local GuildDungeonMemberItemNode = require("app.scene.view.guilddungeon.GuildDungeonMemberItemNode")
	self._listItemSource:setTemplate(GuildDungeonMemberItemNode)
	self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))
end

function GuildDungeonMemberNode:onEnter()
	self._signalGuildDungeonRecordSyn = G_SignalManager:add(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN, handler(self, self._onEventGuildDungeonRecordSyn))
	self._signalGuildDungeonMonsterGet = G_SignalManager:add(SignalConst.EVENT_GUILD_DUNGEON_MONSTER_GET, handler(self, self._onEventGuildDungeonMonsterGet))

	self:_updateList()
end

function GuildDungeonMemberNode:onExit()
	self._signalGuildDungeonRecordSyn:remove()
	self._signalGuildDungeonRecordSyn = nil

	self._signalGuildDungeonMonsterGet:remove()
	self._signalGuildDungeonMonsterGet = nil
end

function GuildDungeonMemberNode:_onEventGuildDungeonRecordSyn(event)
	self:_updateList()
end

function GuildDungeonMemberNode:_onEventGuildDungeonMonsterGet(event)
	self:_updateList()
end

function GuildDungeonMemberNode:updateView()
end

function GuildDungeonMemberNode:_updateList()
	self._listData = UserDataHelper.getGuildDungeonMemberList()
	self._listItemSource:clearAll()
	self._listItemSource:resize(#self._listData)
end

function GuildDungeonMemberNode:_onItemUpdate(item, index)
	if self._listData[index + 1] then
		item:update(self._listData[index + 1],index + 1)
	end
end

function GuildDungeonMemberNode:_onItemSelected(item, index)
end

function GuildDungeonMemberNode:_onItemTouch(index)
end

return GuildDungeonMemberNode 