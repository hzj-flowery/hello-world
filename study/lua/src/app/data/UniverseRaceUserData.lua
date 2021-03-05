
--真武战神选手数据
local BaseData = require("app.data.BaseData")
local UniverseRaceUserData = class("UniverseRaceUserData", BaseData)
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
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
schema["head_frame_id"] = {"number", 0}

schema["eliminated"] = {"boolean", false} -- 是否已经被淘汰
UniverseRaceUserData.schema = schema

function UniverseRaceUserData:ctor(properties)
	UniverseRaceUserData.super.ctor(self, properties)
	self._heroDatas = {}
	self._heroList = {}
	self._position = 0
end

function UniverseRaceUserData:clear()
	
end

function UniverseRaceUserData:reset()
	self._heroDatas = {}
	self._heroList = {}
end

function UniverseRaceUserData:updateData(userData)
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

function UniverseRaceUserData:getHeroDataWithId(heroId)
	return self._heroDatas[heroId]
end

function UniverseRaceUserData:getHeroList()
	return self._heroList
end

function UniverseRaceUserData:getCovertIdAndLimitLevel()
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

function UniverseRaceUserData:updatePosition(position)
	local lastPosition = self._position
	self._position = position
	if lastPosition > 0 and lastPosition ~= self._position then
		G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_USER_POSITION_CHANGE, self:getUser_id(), lastPosition, position)
	end
end

function UniverseRaceUserData:getPosition()
	return self._position
end

function UniverseRaceUserData:getRound()
	local round = G_UserData:getUniverseRace():getRoundWithPosition(self._position)
	return round
end

return UniverseRaceUserData