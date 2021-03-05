
local BaseData = require("app.data.BaseData")
local GuildDungeonMemberPoint = class("GuildDungeonMemberPoint", BaseData)

local schema = {}
schema["user_id"] = {"number", 0}
schema["point"]     = {"number",0} 

GuildDungeonMemberPoint.schema = schema

function GuildDungeonMemberPoint:ctor()
	GuildDungeonMemberPoint.super.ctor(self)
end

function GuildDungeonMemberPoint:clear()

end

function GuildDungeonMemberPoint:reset()
end


function GuildDungeonMemberPoint:initData(message)
	 self:setProperties(message)
end

return GuildDungeonMemberPoint

