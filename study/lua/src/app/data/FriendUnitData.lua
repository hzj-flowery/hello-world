-- Author: nieming
-- Date:2017-12-26 17:45:03
-- Describle：

local BaseData = require("app.data.BaseData")
local FriendUnitData = class("FriendUnitData", BaseData)
local UserDataHelper = require("app.utils.UserDataHelper")
local schema = {}
schema["id"] = {"number", 0}
schema["name"] = {"string", ""}
schema["level"] = {"number", 0}
schema["vip"] = {"number", 0}
schema["power"] = {"number", 0}
schema["online"] = {"number", 0}
schema["canGivePresent"] = {"boolean", false}
schema["canGetPresent"] = {"boolean", false}
schema["guild_name"] = {"string", ""}
schema["friend_count"] = {"number", 0}
schema["office_level"] = {"number", 0}
schema["base_id"] = {"number", 0}
schema["covertId"] = {"number", 0}
schema["playerShowInfo"] = {"table", nil}
schema["head_frame_id"] = {"number",0}
--schema
FriendUnitData.schema = schema


function FriendUnitData:ctor(properties)
	FriendUnitData.super.ctor(self, properties)
end

function FriendUnitData:clear()

end

function FriendUnitData:reset()

end

function FriendUnitData:updateData(messageData)
	self:setId(messageData.id)
	self:setName(messageData.name)
	self:setLevel(messageData.level)
	self:setVip(messageData.vip)
	self:setPower(messageData.power)
	self:setOnline(messageData.online)

	local present = rawget(messageData, "present")
	if present then
		self:setCanGivePresent(present)
	end
	local getpresent = rawget(messageData, "getpresent")
	if getpresent then
		self:setCanGetPresent(getpresent)
	end
	local base_id = rawget(messageData, "base_id")
	if base_id then
		self:setBase_id(base_id)
	end

	local guild_name = rawget(messageData, "guild_name")
	if guild_name then
		self:setGuild_name(guild_name)
	end

	local friend_count = rawget(messageData, "friend_count")
	if friend_count then
		self:setFriend_count(friend_count)
	end

	local office_level = rawget(messageData, "office_level")
	if office_level then
		self:setOffice_level(office_level)
	end

	local covertId,playerShowInfo = UserDataHelper.convertAvatarId(messageData)
	if covertId then
		self:setCovertId(covertId)
	end
	self:setPlayerShowInfo(playerShowInfo)
	
	local head_frame_id = rawget(messageData,"head_frame_id")
	if head_frame_id then
		self:setHead_frame_id(head_frame_id)
	end

end



return FriendUnitData
