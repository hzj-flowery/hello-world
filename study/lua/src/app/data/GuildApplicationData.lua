--
-- Author: Liangxu
-- Date: 2017-06-13 14:24:40
-- 军团申请数据
local BaseData = require("app.data.BaseData")
local GuildApplicationData = class("GuildApplicationData", BaseData)

local schema = {}
schema["uid"] = {"number", 0}
schema["name"] = {"string", ""}
schema["power"] = {"number", 0}
schema["offline"] = {"number", 0}
schema["base_id"] = {"number", 0}
schema["rank_lv"] = {"number", 0}
schema["level"] = {"number", 0}
schema["officer_level"] = {"number", 0}
schema["avatar"] = {"number", 0}
schema["player_info"] 	= {"table",nil} --玩家信息
schema["head_frame_id"] = {"number",0}

GuildApplicationData.schema = schema

function GuildApplicationData:ctor(properties)
	GuildApplicationData.super.ctor(self, properties)

	local covertId,playerInfo = require("app.utils.UserDataHelper").convertAvatarId(properties)
	self:setPlayer_info(playerInfo)
end

function GuildApplicationData:clear()
	
end

function GuildApplicationData:reset()
	
end

return GuildApplicationData