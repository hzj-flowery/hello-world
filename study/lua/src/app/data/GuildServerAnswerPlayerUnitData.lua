-- Author: nieming
-- Date:2018-01-30 15:04:00
-- Describle：

local BaseData = require("app.data.BaseData")
local GuildServerAnswerPlayerUnitData = class("GuildServerAnswerPlayerUnitData", BaseData)
local schema = {}
schema["user_id"] = {"number", 0} -- 用户id
schema["guild_id"] = {"number", 0}
schema["guild_name"] = {"string", ""}
schema["name"] = {"string", ""} -- 名称
schema["level"] = {"number", 0} -- 等级
schema["base_id"] = {"number", {}} --
schema["avatar_base_id"] = {"number", 0} --
schema["side"] = {"number", 0} -- 0
schema["sort"] = {"number", 0}
schema["security_times"] = {"number", 0}  -- 无敌盾次数

GuildServerAnswerPlayerUnitData.schema = schema

function GuildServerAnswerPlayerUnitData:ctor(properties)
	GuildServerAnswerPlayerUnitData.super.ctor(self, properties)
end

function GuildServerAnswerPlayerUnitData:clear()
end

function GuildServerAnswerPlayerUnitData:reset()
end

function GuildServerAnswerPlayerUnitData:updateData(properties)
	self:setProperties(properties)
	local myUser_id = G_UserData:getBase():getId()
	if self:getUser_id() == myUser_id then
		self:setSort(2)
	else
		self:setSort(1)
	end
end

function GuildServerAnswerPlayerUnitData:isSelf()
	local myUser_id = G_UserData:getBase():getId()
	return myUser_id == self:getUser_id()
end

return GuildServerAnswerPlayerUnitData
