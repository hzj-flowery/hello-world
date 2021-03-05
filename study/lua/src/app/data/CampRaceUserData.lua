local BaseData = require("app.data.BaseData")
local CampRaceUserData = class("CampRaceUserData", BaseData)

local schema = {}
schema["id"] = {"number", 0}
schema["base_id"] = {"number", 0}
schema["avatar_base_id"] = {"number", 0}
schema["name"] = {"string", ""}
schema["officer_level"] = {"number", 0}
schema["score"] = {"number", 0}
schema["power"] = {"number", 0}
CampRaceUserData.schema = schema

function CampRaceUserData:ctor(properties)
    CampRaceUserData.super.ctor(self, properties)
end

function CampRaceUserData:clear()

end

function CampRaceUserData:reset()
	
end

function CampRaceUserData:getCoverId()
	local avartarBaseId = self:getAvatar_base_id()
	local coverId = self:getBase_id()
	if avartarBaseId > 0 then
		coverId = require("app.utils.data.AvatarDataHelper").getAvatarConfig(avartarBaseId).hero_id
	end
	return coverId
end

function CampRaceUserData:getLimitLevel()
	local limitLevel = 0
	local heroBaseId = self:getBase_id()
	local info = require("app.utils.data.HeroDataHelper").getHeroConfig(heroBaseId)
	if info.type == 1 then --主角
		local avatarBaseId = self:getAvatar_base_id()
		local limit = require("app.utils.data.AvatarDataHelper").getAvatarConfig(avatarBaseId).limit
		if limit == 1 then
			return require("app.const.HeroConst").HERO_LIMIT_RED_MAX_LEVEL
		end
	end
	return limitLevel
end

function CampRaceUserData:getLimitRedLevel()
	local limitRedLevel = 0
	local heroBaseId = self:getBase_id()
	local info = require("app.utils.data.HeroDataHelper").getHeroConfig(heroBaseId)
	if info.type == 1 then --主角
		local avatarBaseId = self:getAvatar_base_id()
		-- 变身卡暂不支持红升金
		-- local limit = require("app.utils.data.AvatarDataHelper").getAvatarConfig(avatarBaseId).limit
		-- if limit == 1 then
		-- 	return require("app.const.HeroConst").HERO_LIMIT_RED_MAX_LEVEL
		-- end
	end
	return limitRedLevel
end

return CampRaceUserData