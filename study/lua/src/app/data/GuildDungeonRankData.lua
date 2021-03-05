
local BaseData = require("app.data.BaseData")
local GuildDungeonRankData = class("GuildDungeonRankData", BaseData)

local schema = {}
schema["guild_id"] = {"number", 0}
schema["rank"]     = {"number",0} 
schema["name"] 	   = {"string",""}
schema["point"]    = {"number",0}
schema["num"] 	   = {"number",0}
GuildDungeonRankData.schema = schema

function GuildDungeonRankData:ctor()
	GuildDungeonRankData.super.ctor(self)
end

function GuildDungeonRankData:clear()

end

function GuildDungeonRankData:reset()
end

function GuildDungeonRankData:initData(message)
	 self:setProperties(message)
end



return GuildDungeonRankData

