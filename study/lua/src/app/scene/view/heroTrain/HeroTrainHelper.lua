--
-- Author: Liangxu
-- Date: 2017-03-16 19:43:01
-- 武将培养帮助类
local HeroTrainHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

--检查是否达到了觉醒要求等级
function HeroTrainHelper.checkAwakeIsEnoughLevel(heroUnitData)
	local limitLevel = UserDataHelper.getHeroAwakeLimitLevel(heroUnitData)
	if limitLevel == nil then
		return true, limitLevel --达到最大等级，认为满足了等级限制
	end
	local curLevel = heroUnitData:getLevel()
	local enough = curLevel >= limitLevel
	return enough, limitLevel
end

--判断是否达到了觉醒的初始等级
function HeroTrainHelper.checkIsReachAwakeInitLevel(heroUnitData)
	local initLevel = heroUnitData:getConfig().awaken_base
	local awakeCost = heroUnitData:getConfig().awaken_cost
	local info = UserDataHelper.getHeroAwakenConfig(initLevel, awakeCost)

	local limitLevel = info.level
	local curLevel = heroUnitData:getLevel()
	return curLevel >= limitLevel
end

return HeroTrainHelper
