
-- Author: Liangxu
-- Date: 2019-5-5
-- 蛋糕活动军团排行榜信息

local BaseData = require("app.data.BaseData")
local CakeActivityGuildRankData = class("CakeActivityGuildRankData", BaseData)

local schema = {}
schema["guild_id"] = {"number", 0}
schema["guild_name"] = {"string", ""}
schema["cake_level"] = {"number", 0}
schema["cake_exp"] = {"number", 0}
schema["rank"] = {"number", 9999} --初始排行定个很低的数
schema["server_id"] = {"number", 0}
schema["server_name"] = {"string", ""}
CakeActivityGuildRankData.schema = schema

function CakeActivityGuildRankData:ctor(properties)
	CakeActivityGuildRankData.super.ctor(self, properties)

end

function CakeActivityGuildRankData:reset()
	
end

function CakeActivityGuildRankData:clear()

end

function CakeActivityGuildRankData:updateData(data)
	self:backupProperties()
	self:setProperties(data)
end

--变化趋势的资源名
function CakeActivityGuildRankData:getChangeResName()
	local curRank = self:getRank()
	local lastRank = self:getLastRank()
	if curRank < lastRank then
		return "img_battle_arrow_up"
	elseif curRank == lastRank then
		return "img_battle_arrow_balance"
	else
		return "img_battle_arrow_down"
	end
end

return CakeActivityGuildRankData