
--真武战神历代冠军数据
local BaseData = require("app.data.BaseData")
local UniverseRaceWinnerData = class("UniverseRaceWinnerData", BaseData)
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")

local schema = {}
schema["server_id"] = {"number", 0}
schema["server_name"] = {"string", ""}
schema["act_id"] = {"number", 0}
schema["power"] = {"number", 0}
schema["userId"] = {"number", 0}
schema["user_name"] = {"string", ""}
schema["base_id"] = {"number", 0}
schema["avater_base_id"] = {"number", 0}
schema["officer_lv"] = {"number", 0}
schema["head_frame_id"] = {"number", 0}
UniverseRaceWinnerData.schema = schema

function UniverseRaceWinnerData:ctor(properties)
	UniverseRaceWinnerData.super.ctor(self, properties)
end

function UniverseRaceWinnerData:clear()
	
end

function UniverseRaceWinnerData:reset()
	
end

function UniverseRaceWinnerData:updateData(data)
	self:setProperties(data)
end

function UniverseRaceWinnerData:getCovertIdAndLimitLevel()
	local covertId = self:getBase_id()
	local limitLevel = 0
	local limitRedLevel = 0
	local avatarBaseId = self:getAvater_base_id()
	if avatarBaseId > 0 then
		local info = AvatarDataHelper.getAvatarConfig(avatarBaseId)
		covertId = info.hero_id
		if info.limit == 1 then
			limitLevel = require("app.const.HeroConst").HERO_LIMIT_RED_MAX_LEVEL
		end
		-- 变身卡 暂不支持红升金
	end
	
	return covertId, limitLevel, limitRedLevel
end

return UniverseRaceWinnerData