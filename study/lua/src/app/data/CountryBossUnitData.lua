-- Author: nieming
-- Date:2018-05-09 17:35:00
-- Describle：

local BaseData = require("app.data.BaseData")
local CountryBossUnitData = class("CountryBossUnitData", BaseData)
local CountryBossRankUnitData = require("app.data.CountryBossRankUnitData")
local schema = {}
--schema
schema["boss_id"] = {"number", 0}
schema["max_hp"] = {"number", 0}
schema["now_hp"] = {"number", 0}
schema["boss_rank"] = {"table", {}}
schema["self_rank"] = {"table", nil}
CountryBossUnitData.schema = schema


function CountryBossUnitData:ctor(properties)
	CountryBossUnitData.super.ctor(self, properties)
end

function CountryBossUnitData:isBossDie()
	return self:getNow_hp() <= 0
end


function CountryBossUnitData:getRankFirst()
	local rankDatas = self:getBoss_rank()
	for k, v in pairs(rankDatas) do
		if v:getRank() == 1 then
			return v
		end
	end
	return nil
end

function CountryBossUnitData:getMyRankInfo()
	local self_rank = self:getSelf_rank()
	if self_rank then
		return self_rank
	end


	local myGuildName = ""
	local myGuild= G_UserData:getGuild():getMyGuild()
	if myGuild then
		myGuildName = myGuild:getName()
	end
	-- local ranks = self:getBoss_rank()
	-- for k, v in pairs(ranks) do
	-- 	if v:getGuild_name() == myGuildName then
	-- 		return v
	-- 	end
	-- end

	local rankData = CountryBossRankUnitData.new()
	rankData:setProperties({
		hurt_rate = 0,
		guild_name = myGuildName
	})
	return rankData
end

function CountryBossUnitData:updateData(message)
	local boss_id = rawget(message, "boss_id")
	if boss_id then
		self:setBoss_id(boss_id)
	end

	local max_hp = rawget(message, "max_hp")
	if max_hp then
		self:setMax_hp(max_hp)
	end

	local now_hp = rawget(message, "now_hp")
	if now_hp then
		self:setNow_hp(now_hp)
	end

	local boss_rank = rawget(message, "boss_rank")
	if boss_rank then
		local ranks = {}
		for k, v in pairs(boss_rank) do
			local rankData = CountryBossRankUnitData.new()
			rankData:setProperties(v)
			table.insert(ranks, rankData)
		end
		table.sort(ranks, function(a, b)
			return a:getRank() < b:getRank()
		end)
		self:setBoss_rank(ranks)
	end

	local self_rank = rawget(message, "self_rank")
	if self_rank then
		local rankData = CountryBossRankUnitData.new()
		rankData:setProperties(self_rank)
		self:setSelf_rank(rankData)
	end
end

function CountryBossUnitData:clear()

end

function CountryBossUnitData:reset()

end



return CountryBossUnitData
