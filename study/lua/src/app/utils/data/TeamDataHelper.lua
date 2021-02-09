--
-- Author: Liangxu
-- Date: 2017-05-27 17:33:39
-- 阵容数据帮助类
local TeamDataHelper = {}

--在某个阵位上是否有某个装备
--pos:阵位
--baseId：装备静态Id
function TeamDataHelper.isHaveEquipInPos(baseId, pos)
	local equipIds = G_UserData:getBattleResource():getEquipIdsWithPos(pos)
	for i, id in ipairs(equipIds) do
		local equipData = G_UserData:getEquipment():getEquipmentDataWithId(id)
		local equipBaseId = equipData:getBase_id()
		if equipBaseId == baseId then
			return true
		end
	end
	return false
end

function TeamDataHelper.getOpenLevelWithId(funcId)
	assert(funcId, string.format("FunctionConst can not find funcId be nil "))

	local config = require("app.config.function_level").get(funcId)
	assert(config, string.format("function_level config can not find id = %d", funcId))
	
	return config.level
end

--获取pos阵位上的武将baseId
function TeamDataHelper.getHeroBaseIdWithPos(pos)
	local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
	local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
	local baseId = unitData:getBase_id()
	return baseId
end

--获取开启阵位的数量
function TeamDataHelper.getTeamOpenCount()
	local count = 0
	for i = 1, 6 do
		local isOpen = require("app.utils.LogicCheckHelper").funcIsOpened(FunctionConst["FUNC_TEAM_SLOT"..i])
		if isOpen then
			count = count + 1
		end
	end
	return count
end

return TeamDataHelper