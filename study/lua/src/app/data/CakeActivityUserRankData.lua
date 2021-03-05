-- Author: Liangxu
-- Date: 2019-5-5
-- 蛋糕活动个人排行榜信息

local BaseData = require("app.data.BaseData")
local CakeActivityUserRankData = class("CakeActivityUserRankData", BaseData)
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")

local schema = {}
schema["user_id"] = {"number", 0}
schema["rank"] = {"number", 9999} --初始排行定个很低的数
schema["name"] = {"string", ""}
schema["point"] = {"number", 0}
schema["office_level"] = {"number", 0}
schema["server_id"] = {"number", 0}
schema["server_name"] = {"string", ""}
schema["head_frame_id"] = {"number", 0}
schema["base_id"] = {"number", 0}
schema["avater_base_id"] = {"number", 0}
CakeActivityUserRankData.schema = schema

function CakeActivityUserRankData:ctor(properties)
	CakeActivityUserRankData.super.ctor(self, properties)

end

function CakeActivityUserRankData:reset()
	
end

function CakeActivityUserRankData:clear()

end

function CakeActivityUserRankData:updateData(data)
	self:backupProperties()
	self:setProperties(data)
end

function CakeActivityUserRankData:getCovertIdAndLimitLevel()
	local covertId = self:getBase_id()
	local limitLevel = 0
	local avatarBaseId = self:getAvater_base_id()
	if avatarBaseId > 0 then
		local info = AvatarDataHelper.getAvatarConfig(avatarBaseId)
		covertId = info.hero_id
		if info.limit == 1 then
			limitLevel = require("app.const.HeroConst").HERO_LIMIT_RED_MAX_LEVEL
		end
	end
	
	return covertId, limitLevel
end

--变化趋势的资源名
function CakeActivityUserRankData:getChangeResName()
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

return CakeActivityUserRankData