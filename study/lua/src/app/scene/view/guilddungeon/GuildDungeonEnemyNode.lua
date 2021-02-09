
local ViewBase = require("app.ui.ViewBase")
local GuildDungeonEnemyNode = class("GuildDungeonEnemyNode", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")

function GuildDungeonEnemyNode:ctor()
	local resource = {
		file = Path.getCSB("GuildDungeonEnemyNode", "guildDungeon"),
		binding = {
		}
	}
	GuildDungeonEnemyNode.super.ctor(self, resource)
end

function GuildDungeonEnemyNode:onCreate()
    local GuildDungeonEnemyItemNode = require("app.scene.view.guilddungeon.GuildDungeonEnemyItemNode")
	self._listItemSource:setTemplate(GuildDungeonEnemyItemNode)
	self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))
end

function GuildDungeonEnemyNode:onEnter()
	self._signalGuildDungeonRecordSyn = G_SignalManager:add(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN, handler(self, self._onEventGuildDungeonRecordSyn))
	self._signalGuildDungeonMonsterGet = G_SignalManager:add(SignalConst.EVENT_GUILD_DUNGEON_MONSTER_GET, handler(self, self._onEventGuildDungeonMonsterGet))

	self:_updateList()
end

function GuildDungeonEnemyNode:onExit()
	self._signalGuildDungeonRecordSyn:remove()
	self._signalGuildDungeonRecordSyn = nil

	self._signalGuildDungeonMonsterGet:remove()
	self._signalGuildDungeonMonsterGet = nil
end

function GuildDungeonEnemyNode:_onEventGuildDungeonRecordSyn(event)
	self:_updateList()
end

function GuildDungeonEnemyNode:_onEventGuildDungeonMonsterGet(event)
	self:_updateList()
end


function GuildDungeonEnemyNode:updateView()
end

function GuildDungeonEnemyNode:_updateList()
	self._listData = UserDataHelper.getGuildDungeonMonsterList()
	self._listItemSource:clearAll()
	self._listItemSource:resize(#self._listData)
end

function GuildDungeonEnemyNode:_onItemUpdate(item, index)
	if self._listData[index + 1] then
		item:update(self._listData[index + 1],index + 1)
	end
end

function GuildDungeonEnemyNode:_onItemSelected(item, index)
end

function GuildDungeonEnemyNode:_onItemTouch(index)
end

return GuildDungeonEnemyNode 