
local BaseData = require("app.data.BaseData")
local GuildDungeonInfoData = class("GuildDungeonInfoData", BaseData)

local BattleUserData = require("app.data.BattleUserData")

local schema = {}
schema["rank"] = {"number", 0}
--schema["dungeon"] 	= {"table",nil} 

GuildDungeonInfoData.schema = schema

function GuildDungeonInfoData:ctor()
	GuildDungeonInfoData.super.ctor(self)

	self._dungeon = nil
end

function GuildDungeonInfoData:clear()
end

function GuildDungeonInfoData:reset()
	self._dungeon = nil
end

function GuildDungeonInfoData:initData(message)
	 self:setProperties(message)

	 local battleUserData = BattleUserData.new()
	 battleUserData:updateData(message.dungeon)
	 self._dungeon = battleUserData
end

function GuildDungeonInfoData:getDungeon()
	return self._dungeon
end

return GuildDungeonInfoData