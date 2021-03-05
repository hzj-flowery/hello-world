local BaseData = require("app.data.BaseData")
local CampRacePreRankData = class("CampRacePreRankData", BaseData)
local CampRaceUserData = require("app.data.CampRaceUserData")

local schema = {}
schema["camp"] = {"number", 0}
schema["self_rank"] = {"number", 0}
schema["self_score"] = {"number", 0}
CampRacePreRankData.schema = schema

function CampRacePreRankData:ctor(properties)
    CampRacePreRankData.super.ctor(self, properties)
    self._rankDatas = {}
end

function CampRacePreRankData:clear()

end

function CampRacePreRankData:reset()
	self._rankDatas = {}
end

function CampRacePreRankData:updateData(data)
	self:backupProperties()
	self:setProperties(data)

	self._rankDatas = {}
	local ranks = rawget(data, "ranks") or {}
	for i, rank in ipairs(ranks) do
		local userData = CampRaceUserData.new(rank)
		table.insert(self._rankDatas, userData)
	end
end

function CampRacePreRankData:getRankDatas()
	return self._rankDatas
end

function CampRacePreRankData:getRankChange()
	local lastRank = self:getLastSelf_rank()
	local curRank = self:getSelf_rank()
	local change = curRank - lastRank
	return change
end

function CampRacePreRankData:getScoreChange()
	local lastScore = self:getLastSelf_score()
	local curScore = self:getSelf_score()
	local change = curScore - lastScore
	return change
end

--上一场的胜负
function CampRacePreRankData:isLastWin()
	local scoreChange = self:getScoreChange()
	return scoreChange > 0
end

return CampRacePreRankData