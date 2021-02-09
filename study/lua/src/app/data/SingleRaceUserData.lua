--跨服个人竞技选手数据
local BaseData = require("app.data.BaseData")
local SingleRaceUserData = class("SingleRaceUserData", BaseData)
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local SingleRaceConst = require("app.const.SingleRaceConst")
local CampRaceFormationBaseData = require("app.data.CampRaceFormationBaseData")

local schema = {}
schema["user_id"] = {"number", 0}
schema["user_name"] = {"string", ""}
schema["power"] = {"number", 0}
schema["base_id"] = {"number", 0}
schema["rank"] = {"number", 0}
schema["avatar_base_id"] = {"number", 0}
schema["officer_level"] = {"number", 0}
schema["server_id"] = {"number", 0}
schema["server_name"] = {"string", ""}
schema["formation"] = {"table", {}}
schema["embattle"] = {"table", {}}
schema["hero_data"] = {"table", {}}
SingleRaceUserData.schema = schema

function SingleRaceUserData:ctor(properties)
	SingleRaceUserData.super.ctor(self, properties)
	self._heroDatas = {}
	self._heroList = {}
end

function SingleRaceUserData:clear()
	
end

function SingleRaceUserData:reset()
	self._heroDatas = {}
	self._heroList = {}
end

function SingleRaceUserData:updateData(userData)
	self:setProperties(userData)

	self._heroDatas = {}
	self._heroList = {}
	local heroDatas = rawget(userData, "hero_data") or {}
	for i, data in ipairs(heroDatas) do
		local heroData = CampRaceFormationBaseData.new(data)
		local heroId = heroData:getHero_id()
		self._heroDatas[heroId] = heroData
		table.insert(self._heroList, heroData)
	end
end

function SingleRaceUserData:getHeroDataWithId(heroId)
	return self._heroDatas[heroId]
end

function SingleRaceUserData:getHeroList()
	return self._heroList
end

function SingleRaceUserData:getCovertIdAndLimitLevel()
	local covertId = self:getBase_id()
	local limitLevel = 0
	local limitRedLevel = 0
	local avatarBaseId = self:getAvatar_base_id()
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

function SingleRaceUserData:getMatchState()
	return SingleRaceConst.RESULT_STATE_ING
end

return SingleRaceUserData