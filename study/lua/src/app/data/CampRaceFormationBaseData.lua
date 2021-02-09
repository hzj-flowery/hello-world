local BaseData = require("app.data.BaseData")
local CampRaceFormationBaseData = class("CampRaceFormationBaseData", BaseData)

local schema = {}
schema["hero_id"] = {"number", 0}
schema["hero_base_id"] = {"number", 0}
schema["avartar_base_id"] = {"number", 0}
schema["rank_level"] = {"number", 0}
schema["limit_rank_level"] = {"number", 0}
schema["limit_rtg"] = {"number", 0}
CampRaceFormationBaseData.schema = schema

function CampRaceFormationBaseData:ctor(properties)
	CampRaceFormationBaseData.super.ctor(self, properties)
end

function CampRaceFormationBaseData:clear()
	
end

function CampRaceFormationBaseData:reset()
	
end

function CampRaceFormationBaseData:getCoverId()
	local avartarBaseId = self:getAvartar_base_id()
	local coverId = self:getHero_base_id()
	if avartarBaseId > 0 then
		coverId = require("app.utils.data.AvatarDataHelper").getAvatarConfig(avartarBaseId).hero_id
	end
	return coverId
end

function CampRaceFormationBaseData:getLimitLevel()
	local limitLevel = self:getLimit_rank_level()
	local heroBaseId = self:getHero_base_id()
	local info = require("app.utils.data.HeroDataHelper").getHeroConfig(heroBaseId)
	if info.type == 1 then --主角
		local avatarBaseId = self:getAvartar_base_id()
		local limit = require("app.utils.data.AvatarDataHelper").getAvatarConfig(avatarBaseId).limit
		if limit == 1 then
			return require("app.const.HeroConst").HERO_LIMIT_RED_MAX_LEVEL
		end
	end
	return limitLevel
end

function CampRaceFormationBaseData:getLimitRedLevel()
	local limitRedLevel = self:getLimit_rtg()
	local heroBaseId = self:getHero_base_id()
	local info = require("app.utils.data.HeroDataHelper").getHeroConfig(heroBaseId)
	if info.type == 1 then --主角
		local avatarBaseId = self:getAvartar_base_id()
		-- 变身卡暂不支持红升金
		-- local limit = require("app.utils.data.AvatarDataHelper").getAvatarConfig(avatarBaseId).limit
		-- if limit == 1 then
		-- 	return require("app.const.HeroConst").HERO_LIMIT_RED_MAX_LEVEL
		-- end
	end
	return limitRedLevel
end

return CampRaceFormationBaseData