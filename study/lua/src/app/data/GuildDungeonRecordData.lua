
local BaseData = require("app.data.BaseData")
local GuildDungeonRecordData = class("GuildDungeonRecordData", BaseData)

local schema = {}
schema["player_id"] = {"number", 0}
schema["player_name"] = {"string",""} 
schema["player_officer"] = {"number",0}
schema["target_rank"] = {"number",0}
schema["target_id"] = {"number",0}
schema["target_name"] = {"string",""}
schema["target_officer"] = {"number",0}
schema["is_win"] = {"boolean",false}
schema["report_id"] = {"number",0}
schema["time"] = {"number",0}

GuildDungeonRecordData.schema = schema

function GuildDungeonRecordData:ctor()
	GuildDungeonRecordData.super.ctor(self)
end

function GuildDungeonRecordData:clear()

end

function GuildDungeonRecordData:reset()
end

function GuildDungeonRecordData:initData(message)
	 self:setProperties(message)
end

return GuildDungeonRecordData

