--回收模块数据封装类

local RecoveryDataHelper = {}
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local ParameterIDConst = require("app.const.ParameterIDConst")

function RecoveryDataHelper.formatRecoveryCost(info, type, value, size)
	if info[type] == nil then
		info[type] = {}
	end
	if info[type][value] == nil then
		info[type][value] = 0
	end
	info[type][value] = info[type][value] + size
end

function RecoveryDataHelper.mergeRecoveryCost(tarInfo, srcInfo)
	for type, unit in pairs(srcInfo) do
		for value, size in pairs(unit) do
			RecoveryDataHelper.formatRecoveryCost(tarInfo, type, value, size)
		end
	end
end

function RecoveryDataHelper.convertToList(info)
	local result = {}
	for type, unit in pairs(info) do
		for value, size in pairs(unit) do
			table.insert(result, {type = type, value = value, size = size})
		end
	end
	return result
end

--转换同名卡
--tarType: 1代币 2碎片
function RecoveryDataHelper.convertSameCard(type, value, size, tarType)
	local fragmentId = 0
	if type == TypeConvertHelper.TYPE_HERO then
		local info = require("app.config.hero").get(value)
		assert(info, string.format("hero config can not find id = %d", value))
		fragmentId = info.fragment_id
	elseif type == TypeConvertHelper.TYPE_EQUIPMENT then
		local info = require("app.config.equipment").get(value)
		assert(info, string.format("equipment config can not find id = %d", value))
		fragmentId = info.fragment_id
	elseif type == TypeConvertHelper.TYPE_TREASURE then
		local info = require("app.config.treasure").get(value)
		assert(info, string.format("treasure config can not find id = %d", value))
		fragmentId = info.fragment
	elseif type == TypeConvertHelper.TYPE_INSTRUMENT then
		local info = require("app.config.instrument").get(value)
		assert(info, string.format("instrument config can not find id = %d", value))
		fragmentId = info.fragment_id
	elseif type == TypeConvertHelper.TYPE_PET then
		local info = require("app.config.pet").get(value)
		assert(info, string.format("pet config can not find id = %d", value))
		fragmentId = info.fragment_id
	elseif type == TypeConvertHelper.TYPE_HORSE then
		local info = require("app.config.horse").get(value)
		assert(info, string.format("pet config can not find id = %d", value))
		fragmentId = info.fragment_id
	elseif type == TypeConvertHelper.TYPE_HORSE_EQUIP then
		local info = require("app.config.horse_equipment").get(value)
		assert(info, string.format("horse_equipment config can not find id = %d", value))
		fragmentId = info.fragment_id
	end
	local fragmentInfo = require("app.config.fragment").get(fragmentId)
	assert(fragmentInfo, string.format("fragment config can not find id = %d", fragmentId))

	local result = {}
	if tarType == 1 then
		for i = 1, size do
			if fragmentInfo.recycle_size > 0 then
				local num = fragmentInfo.fragment_num * fragmentInfo.recycle_size
				RecoveryDataHelper.formatRecoveryCost(result, fragmentInfo.recycle_type, fragmentInfo.recycle_value, num)
			end
		end
	elseif tarType == 2 then
		for i = 1, size do
			RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_FRAGMENT, fragmentId, fragmentInfo.fragment_num)
		end
	end
	return result
end

--返还物品排序
function RecoveryDataHelper.sortAward(awards)
	local type2Sort = {
		[TypeConvertHelper.TYPE_RESOURCE] 	= 1,
		[TypeConvertHelper.TYPE_FRAGMENT] 	= 2,
		[TypeConvertHelper.TYPE_HERO] 		= 3,
		[TypeConvertHelper.TYPE_EQUIPMENT] 	= 4,
		[TypeConvertHelper.TYPE_TREASURE] 	= 5,
		[TypeConvertHelper.TYPE_INSTRUMENT] = 6,
		[TypeConvertHelper.TYPE_AVATAR] 	= 7,
		[TypeConvertHelper.TYPE_ITEM] 		= 8,
		[TypeConvertHelper.TYPE_GEMSTONE] 	= 9,
		[TypeConvertHelper.TYPE_PET]	    = 10,
		[TypeConvertHelper.TYPE_SILKBAG]    = 11,
		[TypeConvertHelper.TYPE_HORSE]      = 12,
		[TypeConvertHelper.TYPE_HISTORY_HERO] = 13,
		[TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON] = 14,
		[TypeConvertHelper.TYPE_HORSE_EQUIP] = 15,
	}
	local function isSilver(data)
		if data.type == TypeConvertHelper.TYPE_RESOURCE and data.value == DataConst.RES_GOLD then
			return true
		else
			return false
		end
	end
	local function sortFunc(a, b)
		local silverA = isSilver(a) and 1 or 0
		local silverB = isSilver(b) and 1 or 0
		if silverA ~= silverB then --银两排在最后
			return silverA < silverB
		elseif a.type ~= b.type then
			return type2Sort[a.type] < type2Sort[b.type]
		else
			return a.value < b.value
		end
	end
	table.sort(awards, sortFunc)
end

function RecoveryDataHelper.getRebornCostCount()
	local count = tonumber(require("app.config.parameter").get(ParameterIDConst.REBORN_COST).content)
	return count
end

-- @Role 	当前可以显示的回收项
function RecoveryDataHelper.getShowFuncRecovery()
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local data = {}
	for index = 1, FunctionConst.TOTAL_RECOVERY_NUM do
		if LogicCheckHelper.funcIsShow(FunctionConst["FUNC_RECOVERY_TYPE"..index]) then
			table.insert(data, index)
		end
	end
	
	return data
end

return RecoveryDataHelper