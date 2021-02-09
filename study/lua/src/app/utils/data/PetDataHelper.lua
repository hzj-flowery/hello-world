--宠物模块数据封装类

local PetDataHelper = {}

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local AttributeConst = require("app.const.AttributeConst")
local TeamConst = require("app.const.TeamConst")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local PetConfig = require("app.config.pet")

-----------------------------------------------------------------------

function PetDataHelper.getPetStarConfig(id, star)
	local config = require("app.config.pet_star").get(id, star)
	assert(config, string.format("pet_star config can not find id = %d, rank = %d", id, star))
	return config
end

function PetDataHelper.getPetMapConfig(petMapId)
	-- body
	local config = require("app.config.pet_map").get(petMapId)
	assert(config, string.format("pet_map config can not find id = %d", petMapId))
	return config
end

function PetDataHelper.getPetStarCostConfig(star, templet, isRed)
	local config = require("app.config.pet_star_cost").get(star, templet, isRed)
	assert(config, string.format("pet_star_cost config can not find star = %d, templet = %d", star, templet))
	return config
end

function PetDataHelper.getPetLevelupConfig(level, templet)
	local info = require("app.config.pet_exp").get(level, templet)
	assert(info, string.format("pet_exp can not find level = %d, templet = %d", level, templet))
	return info
end

function PetDataHelper.getPetLimitConfig(id)
	local config = require("app.config.pet_limit").get(id)
	assert(config, string.format("pet_limit config can not find id = %d", id))
	return config
end

--获取神兽列表上限
function PetDataHelper.getPetListLimitCount()
	local level = G_UserData:getBase():getLevel()
	local info = require("app.config.role").get(level)
	assert(info, string.format("role config can not find level = %d", level))

	return info.pet_limit
end

function PetDataHelper.getParameterValue(keyIndex)
	local parameter = require("app.config.parameter")
	for i = 1, parameter.length() do
		local value = parameter.indexOf(i)
		if value.key == keyIndex then
			return tonumber(value.content)
		end
	end
	assert(false, " can't find key index in parameter " .. keyIndex)
end

--isOnlyBase，只计算基础属性
function PetDataHelper.getPetHelpAttr(isOnlyBase)
	local AttrDataHelper = require("app.utils.data.AttrDataHelper")
	local UserDataHelper = require("app.utils.UserDataHelper")
	local result = {}
	local attrList = {}
	local petList = G_UserData:getTeam():getPetIdsInHelp()

	local pet_help_percent = PetDataHelper.getParameterValue("pet_huyou_percent") / 1000
	for i, petId in ipairs(petList) do
		local petUnit = G_UserData:getPet():getUnitDataWithId(petId)
		local param = {
			unitData = petUnit
		}
		local attrAll = {}
		if isOnlyBase then
			attrAll = UserDataHelper.getPetTotalBaseAttr(param)
		else
			attrAll = UserDataHelper.getPetTotalAttr(param)
		end

		for key, value in pairs(attrAll) do
			if key ~= AttributeConst.PET_BLESS_RATE then
				local blessRate = attrAll[AttributeConst.PET_BLESS_RATE]
				local valueAdd = math.floor(value * pet_help_percent / 6) --护佑加成是数值除以6
				attrAll[key] = valueAdd
			end
		end

		AttrDataHelper.appendAttr(result, attrAll)
	end
	local function filterAttr(key)
		-- body
		if key == AttributeConst.PET_BLESS_RATE or key == AttributeConst.PET_ALL_ATTR or key == AttributeConst.HIT then
			return true
		end

		return false
	end
	for key, value in pairs(result) do
		if filterAttr(key) == false then
			table.insert(attrList, {type = key, value = value})
		end
	end
	table.sort(
		attrList,
		function(item1, item2)
			return item1.type < item2.type
		end
	)

	return result, attrList
end

function PetDataHelper.getPetMapAttr(...)
	-- body
	local AttrDataHelper = require("app.utils.data.AttrDataHelper")
	local pet_map = require("app.config.pet_map")
	local result = {}

	local attrList = {}
	for loop = 1, pet_map.length() do
		local petMapData = pet_map.indexOf(loop)
		if PetDataHelper.isPetMapAct(petMapData) then
			local attrAll = {}
			for i = 1, 4 do
				local attrType = petMapData["attribute_type_" .. i]
				local attrValue = petMapData["attribute_value_" .. i]
				if attrType > 0 then
					attrAll[attrType] = attrAll[attrType] or 0
					attrAll[attrType] = attrAll[attrType] + attrValue
				end
			end

			AttrDataHelper.appendAttr(result, attrAll)
		end
	end

	for key, value in pairs(result) do
		table.insert(attrList, {type = key, value = value})
	end
	table.sort(
		attrList,
		function(item1, item2)
			-- body
			return item1.type < item2.type
		end
	)
	return result, attrList
end

function PetDataHelper.getPetMapPower()
	local pet_map = require("app.config.pet_map")
	local result = {}
	local power = 0
	for loop = 1, pet_map.length() do
		local petMapData = pet_map.indexOf(loop)
		if PetDataHelper.isPetMapAct(petMapData) then
			power = power + petMapData.all_combat
		end
	end
	result[AttributeConst.PET_POWER] = power
	return result
end

--根据等级获取此级基础属性,过滤掉不需要显示的
function PetDataHelper.getPetBasicAttrWithLevelFilter(petCfg, level)
	local templet = petCfg.color
	local atk = petCfg.atk_base
	local pdef = petCfg.pdef_base
	local mdef = petCfg.mdef_base
	local hp = petCfg.hp_base
	local growAtk = petCfg.atk_grow
	local growPdef = petCfg.pdef_grow
	local growMdef = petCfg.mdef_grow
	local growHp = petCfg.hp_grow
	local hitBase = petCfg.hit_base
	local blessingRate = petCfg.blessing_rate

	for i = 1, level - 1 do
		local config = PetDataHelper.getPetLevelupConfig(i, templet)
		local ratio = config.ratio
		atk = atk + math.floor(growAtk * ratio / 1000)
		pdef = pdef + math.floor(growPdef * ratio / 1000)
		mdef = mdef + math.floor(growMdef * ratio / 1000)
		hp = hp + math.floor(growHp * ratio / 1000)
	end

	local result = {}
	result[AttributeConst.ATK_FINAL] = atk
	result[AttributeConst.PD_FINAL] = pdef
	result[AttributeConst.MD_FINAL] = mdef
	result[AttributeConst.HP_FINAL] = hp
	result[AttributeConst.PET_BLESS_RATE] = blessingRate

	return result
end

--根据等级获取此级基础属性
function PetDataHelper.getPetBasicAttrWithLevel(petCfg, level)
	local templet = petCfg.color
	local atk = petCfg.atk_base
	local pdef = petCfg.pdef_base
	local mdef = petCfg.mdef_base
	local hp = petCfg.hp_base
	local growAtk = petCfg.atk_grow
	local growPdef = petCfg.pdef_grow
	local growMdef = petCfg.mdef_grow
	local growHp = petCfg.hp_grow
	local hitBase = petCfg.hit_base
	local blessingRate = petCfg.blessing_rate
	--local noHitBase = petCfg.no_hit_base
	--local critBase = petCfg.crit_base
	--local noCritBase = petCfg.no_crit_base

	for i = 1, level - 1 do
		local config = PetDataHelper.getPetLevelupConfig(i, templet)
		local ratio = config.ratio
		atk = atk + math.floor(growAtk * ratio / 1000)
		pdef = pdef + math.floor(growPdef * ratio / 1000)
		mdef = mdef + math.floor(growMdef * ratio / 1000)
		hp = hp + math.floor(growHp * ratio / 1000)
	end

	local result = {}
	result[AttributeConst.ATK_FINAL] = atk
	result[AttributeConst.PD_FINAL] = pdef
	result[AttributeConst.MD_FINAL] = mdef
	result[AttributeConst.HP_FINAL] = hp
	--result[AttributeConst.HIT] = hitBase -- 命中必须填，服务器写死1000

	--result[AttributeConst.NO_HIT] = noHitBase
	--result[AttributeConst.CRIT] = critBase
	result[AttributeConst.PET_BLESS_RATE] = blessingRate
	--result[AttributeConst.NO_CRIT] = noCritBase

	return result
end

--获取神兽升级时实际品质
function PetDataHelper.getPetUpgradeQuality(unitData)
	local config = unitData:getConfig()
	local initial_star = unitData:getInitial_star()

	if config.potential_before > 0 and initial_star == 0 then
		--突破前的config
		local oldConfig = require("app.config.pet").get(config.potential_before)
		return oldConfig.color
	end
	return config.color
end

--根据等级获取升级到此等级所需的经验
function PetDataHelper.getPetNeedExpWithLevel(level, templet)
	local needExp = 0
	for i = 1, level - 1 do
		local exp = PetDataHelper.getPetLevelUpExp(i, templet)
		needExp = needExp + exp
	end
	return needExp
end

--根据经验获取对应可以升到的等级
function PetDataHelper.getPetCanReachLevelWithExp(totalExp, templet)
	local level = 1
	local exp = 0
	while exp < totalExp do
		local temp = PetDataHelper.getPetLevelUpExp(level, templet)
		exp = exp + temp
		level = level + 1
	end
	return level - 1
end

--获取升当前等级所需经验
function PetDataHelper.getPetLevelUpExp(level, templet)
	local config = PetDataHelper.getPetLevelupConfig(level, templet)
	return config.exp
end

--获取升星消耗
function PetDataHelper.getPetBreakMaterials(petUnitData)
	local starLevel = petUnitData:getStar()
	local templet = petUnitData:getLvUpCost()
	local isRed = petUnitData:getIsRed()
	local config = PetDataHelper.getPetStarCostConfig(starLevel, templet, isRed)

	local result = {}
	local card = config.card
	local after_card = config.potential_card

	local initial_star = petUnitData:getInitial_star()

	if initial_star > 0 then
		if card > 0 then
			table.insert(result, {type = TypeConvertHelper.TYPE_PET, value = petUnitData:getBase_id(), size = card})
		end
	else
		if after_card > 0 then
			table.insert(
				result,
				{type = TypeConvertHelper.TYPE_PET, value = petUnitData:getConfig().potential_before, size = after_card}
			)
		elseif card > 0 then
			table.insert(result, {type = TypeConvertHelper.TYPE_PET, value = petUnitData:getBase_id(), size = card})
		end
	end

	for i = 1, 2 do
		local type = config["type_" .. i]
		local value = config["value_" .. i]
		local size = config["size_" .. i]
		if size > 0 then
			table.insert(result, {type = type, value = value, size = size})
		end
	end

	--获取界限突破后升星需要的道具（pet表potential_value）和数量（pet_star_cost表special_size）
	local petConfig = petUnitData:getConfig()
	if petConfig.potential_before > 0 then
		--是界限突破后的神兽
		local itemArray = string.split(petConfig.potential_value, "|")
		local type = tonumber(itemArray[1])
		local value = tonumber(itemArray[2])
		if type and value and config.special_size > 0 then
			table.insert(result, {type = type, value = value, size = config.special_size})
		end
	end
	return result
end

--获取突破等级限制
function PetDataHelper.getPetBreakLimitLevel(petUnitData)
	local rankLevel = petUnitData:getStar()
	local templet = petUnitData:getLvUpCost()
	local isRed = petUnitData:getIsRed()
	local config = PetDataHelper.getPetStarCostConfig(rankLevel, templet, isRed)
	return config.lv
end

function PetDataHelper.getPetBreakCostWithStar(rank, templet)
	local rankCostConfig = PetDataHelper.getPetStarCostConfig(rank, templet, false)

	local needLevel = rankCostConfig.lv
	local card = rankCostConfig.card
	local type1 = rankCostConfig.type_1
	local value1 = rankCostConfig.value_1
	local size1 = rankCostConfig.size_1
	return {needLevel = needLevel, card = card, type1 = type1, value1 = value1, size1 = size1}
end

--获取升星最大等级
function PetDataHelper.getPetBreakMaxLevel(petUnitData)
	local level = petUnitData:getLevel()
	local quality = petUnitData:getQuality()
	local rankMax = petUnitData:getConfig().star_max
	local initial_star = petUnitData:getInitial_star()
	local isRed = petUnitData:getIsRed()

	for i = initial_star, rankMax do
		local info = PetDataHelper.getPetStarCostConfig(i, quality, isRed)
		if level < info.lv then
			return i
		end
	end
	return rankMax
end

function PetDataHelper.getPetBreakShowAttr(petUnitData, addStar)
	addStar = addStar or 0
	local baseId = petUnitData:getBase_id()
	local starLevel = petUnitData:getStar() + addStar
	local allUp = 0
	local initial_star = petUnitData:getInitial_star()
	
	dump(starLevel)
	for i = initial_star, starLevel do
		local petStarConfig = PetDataHelper.getPetStarConfig(baseId, i)
		local ratio = petStarConfig.up_show
		dump(ratio)
		allUp = allUp + ratio
	end

	local result = {}
	result[AttributeConst.PET_ALL_ATTR] = allUp

	return result
end

--根据等级获取突破等级对应的属性值
function PetDataHelper.getPetBreakAttr(petUnitData, addStar)
	addStar = addStar or 0
	local baseId = petUnitData:getBase_id()
	local star = petUnitData:getStar() + addStar
	local starMax = petUnitData:getConfig().star_max
	if star > starMax then
		return nil --到顶级了
	end
	local baseAttr = PetDataHelper.getPetBasicAttrWithLevel(petUnitData:getConfig(), petUnitData:getLevel())

	dump(baseAttr)
	local result = PetDataHelper.getPetBreakAttrWithBaseIdAndStar(baseId, baseAttr, star)

	dump(result)
	return result
end

function PetDataHelper.getPetBreakAttrWithBaseIdAndStar(baseId, baseAttr, starLevel)
	local allUp = 0
	local pdef = 0
	local mdef = 0
	local hp = 0
	local atk = 0
	local petConfigInfo = PetConfig.get(baseId)
	local initial_star = petConfigInfo.initial_star
	starLevel = math.max(starLevel, initial_star)
	dump(starLevel)
	for i = initial_star, starLevel do
		local petStarConfig = PetDataHelper.getPetStarConfig(baseId, i)
		local ratio = petStarConfig.up
		dump(ratio)
		allUp = allUp + ratio
		atk = atk + math.floor(baseAttr[AttributeConst.ATK_FINAL] * ratio / 1000)
		pdef = pdef + math.floor(baseAttr[AttributeConst.PD_FINAL] * ratio / 1000)
		mdef = mdef + math.floor(baseAttr[AttributeConst.MD_FINAL] * ratio / 1000)
		hp = hp + math.floor(baseAttr[AttributeConst.HP_FINAL] * ratio / 1000)
	end

	local result = {}
	dump(allUp)
	result[AttributeConst.PET_ALL_ATTR] = allUp
	result[AttributeConst.ATK_FINAL] = atk
	result[AttributeConst.PD_FINAL] = pdef
	result[AttributeConst.MD_FINAL] = mdef
	result[AttributeConst.HP_FINAL] = hp
	dump(result)
	return result
end

function PetDataHelper.getPetTotalBaseAttr(param)
	local result = {}

	local unitData = param.unitData
	local tempLevel = param.addLevel or 0
	local tempRank = param.addRank or 0
	local level = unitData:getLevel() + tempLevel
	local rank = unitData:getStar() + tempRank
	local petConfig = unitData:getConfig()
	local attr1 = PetDataHelper.getPetBasicAttrWithLevel(unitData:getConfig(), level)
	local attr2 = PetDataHelper.getPetBreakAttr(unitData, tempRank)
	local AttrDataHelper = require("app.utils.data.AttrDataHelper")

	AttrDataHelper.appendAttr(result, attr1)
	AttrDataHelper.replaceAttr(result, attr2)

	return result
end

function PetDataHelper.getPetTotalAttr(param)
	local result = PetDataHelper.getPetTotalBaseAttr(param)
	AttrDataHelper.processDef(result)
	AttrDataHelper.processAddition(result)

	return result
end

function PetDataHelper.getPetFragment(petId)
	local UserDataHelper = require("app.utils.UserDataHelper")
	local petUnit = G_UserData:getPet():getUnitDataWithId(petId)
	if petUnit == nil then
		return 0, 0
	end

	local fragmentId = petUnit:getFragmentId()
	local curr = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
	local itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
	local max = itemParam.cfg.fragment_num

	return curr, max
end

function PetDataHelper.getPetSkillIds(baseId, star)
	local result = {}
	local petStarConfig = PetDataHelper.getPetStarConfig(baseId, star)
	for i = 1, 2 do
		local skillId = petStarConfig["skill" .. i]
		--result[i] = skillId
		if skillId > 0 then
			table.insert(result, skillId)
		end
	end
	return result
end

function PetDataHelper.isReachStarLimit(petUnitData)
	local starMax = petUnitData:getConfig().star_max
	local starLevel = petUnitData:getStar()
	local isReachLimit = starLevel >= starMax --是否抵达上限
	return isReachLimit
	-- body
end

--宠物是否激活
function PetDataHelper.isPetMapAct(petMapData)
	-- body
	local state = G_UserData:getPet():getPetMapState(petMapData.id)
	if state == 2 then
		return true
	end
	return false
end

--转化字符串, 将百分比高亮
function PetDataHelper.convertAttrAppendDesc(desc, percent)
	-- body
	local TextHelper = require("app.utils.TextHelper")
	local contents = TextHelper.parseConfigText(desc)

	local fontColor = Colors.colorToNumber(Colors.BRIGHT_BG_TWO)
	local richContents = {}

	for i, content in ipairs(contents) do
		local text = content.content
		local color = fontColor
		local message = text
		if text == "percent" then
			color = Colors.colorToNumber(Colors.BRIGHT_BG_GREEN)
			message = "" .. percent .. "%"
		end
		table.insert(
			richContents,
			{
				type = "text",
				msg = message,
				color = color,
				fontSize = 18,
				opacity = 255
			}
		)
	end

	return richContents
end

--是否要判断神兽更换红点的限制等级
function PetDataHelper.isReachCheckBetterColorPetRP(petUnitData)
	local ParameterIDConst = require("app.const.ParameterIDConst")
	local limitLevelStr = require("app.config.parameter").get(ParameterIDConst.CHANGE_LEVEL_MAX).content
	local limitLevel = tonumber(limitLevelStr)
	local UserCheck = require("app.utils.logic.UserCheck")

	if UserCheck.enoughLevel(limitLevel) then
		return false
	end
	return true
end

--是否有品质更好的神兽
function PetDataHelper.isHaveBetterColorPet(petUnitData)
	local petBaseId = petUnitData:getBase_id()
	local petColor = petUnitData:getConfig().color
	local petList = G_UserData:getPet():getReplaceDataBySort(petBaseId)
	for i, unit in ipairs(petList) do
		local color = unit:getConfig().color
		if color > petColor then
			return true
		end
	end
	return false
end

--是否要提示有品质更好的神兽
function PetDataHelper.isPromptPetBetterColor(petUnitData)
	--if PetDataHelper.isReachCheckBetterColorPetRP(petUnitData) == false then
	--	return false
	--end

	local isHave = PetDataHelper.isHaveBetterColorPet(petUnitData)
	return isHave
end

--判断是否要提示神兽升级
function PetDataHelper.isPromptPetUpgrade(petUnitData)
	local userLevel = G_UserData:getBase():getLevel()
	local roleInfo = require("app.config.role").get(userLevel)
	assert(roleInfo, string.format("role config can not find level = %d", userLevel))

	local recommendLevel = roleInfo.recommend_pet_lv
	local level = petUnitData:getLevel()
	if level >= recommendLevel then --已经达到了推荐等级
		return false
	end

	--判断材料
	local totalCount = 0
	for i = 1, 4 do
		local itemId = DataConst["ITEM_PET_LEVELUP_MATERIAL_" .. i]
		local count = require("app.utils.UserDataHelper").getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemId)
		totalCount = totalCount + count
	end
	if totalCount == 0 then
		return false
	end

	return true
end

function PetDataHelper.getPetStateStr(petUnitData)
	-- body
	local isBattle = G_UserData:getPet():isPetInBattle(petUnitData:getId())
	if isBattle then
		return Lang.get("pet_in_battle")
	end
	local isBless = G_UserData:getPet():isPetBless(petUnitData:getId())
	if isBless then
		return Lang.get("pet_break_bless")
	end
	return nil
end
--判断是否要提示神兽升星
function PetDataHelper.isPromptPetBreak(petUnitData)
	local starLevel = petUnitData:getStar()
	local starMax = petUnitData:getStarMax()

	if starLevel >= starMax then
		return false
	end

	local costInfo = PetDataHelper.getPetBreakMaterials(petUnitData)
	for i, info in ipairs(costInfo) do
		if info.type == TypeConvertHelper.TYPE_PET then --同名卡
			local petConfig = petUnitData:getConfig()
			local baseId = petUnitData:getBase_id()
			local initial_star = petUnitData:getInitial_star()

			if petConfig.potential_before > 0 and initial_star == 0 then
				-- 界限突破前的id
				baseId = petConfig.potential_before
			end
			local sameCardNum = #G_UserData:getPet():getSameCardCountWithBaseId(baseId)
			if info.size > sameCardNum then
				return false
			end
		elseif info.type == TypeConvertHelper.TYPE_ITEM then
			local itemNum = G_UserData:getItems():getItemNum(info.value)
			if info.size > itemNum then
				return false
			end
		elseif info.type == TypeConvertHelper.TYPE_RESOURCE then
			local enough = require("app.utils.LogicCheckHelper").enoughMoney(info.size) --此处保证是银币，直接检测银币
			if not enough then
				return false
			end
		end
	end

	local needLevel = PetDataHelper.getPetBreakLimitLevel(petUnitData)
	local myLevel = petUnitData:getLevel()
	if myLevel < needLevel then --等级检测
		return false
	end

	return true
end

--判断是否有空阵位(开启，但没上神兽)
function PetDataHelper.isHaveEmptyPetPos()
	for i = 1, 6 do
		local state = G_UserData:getTeam():getPetStateWithPos(i)
		if state == TeamConst.STATE_OPEN then
			return true
		end
	end
	return false
end

function PetDataHelper.getPetPowerFormula(attrInfo)
	local map = {}
	local AttrCfg = require("app.config.attribute")
	local length = AttrCfg.length()
	for i = 1, length do
		local info = AttrCfg.indexOf(i)
		local enName = info.en_name
		local upperEnName = string.upper(enName)
		local key = "#" .. upperEnName .. "#"
		local value = attrInfo[info.id] or 0

		if info.type == 2 then --是千分比数字
			value = value / 1000
		end
		map[key] = value
	end

	local formula = require("app.config.formula").get(4).formula
	for k, v in pairs(map) do
		formula = string.gsub(formula, k, v)
	end

	return formula
end

function PetDataHelper.getPetPower(petUnitData)
	local param = {unitData = petUnitData}
	local UserDataHelper = require("app.utils.UserDataHelper")
	local attrInfo = UserDataHelper.getPetTotalAttr(param)

	dump(attrInfo)
	local petConfig = petUnitData:getConfig()
	--去除基础属性
	attrInfo[AttributeConst.ATK_FINAL] = attrInfo[AttributeConst.ATK_FINAL] - petConfig.atk_base
	attrInfo[AttributeConst.PD_FINAL] = attrInfo[AttributeConst.PD_FINAL] - petConfig.pdef_base
	attrInfo[AttributeConst.MD_FINAL] = attrInfo[AttributeConst.MD_FINAL] - petConfig.mdef_base
	attrInfo[AttributeConst.HP_FINAL] = attrInfo[AttributeConst.HP_FINAL] - petConfig.hp_base
	--带上神兽战力
	attrInfo[AttributeConst.PET_EXTEND_POWER] = petConfig.combat_base
	AttrDataHelper.processSpecial(attrInfo)

	local formula = PetDataHelper.getPetPowerFormula(attrInfo)
	local power = AttrDataHelper.calPower(formula)
	--local petConfig = petUnitData:getConfig()
	--power = power + petConfig.combat_base

	return power
end

--计算战力（属性部分）
function PetDataHelper.getPetPowerAttr(param)
	local result = {}

	local unitData = param.unitData
	local tempLevel = param.addLevel or 0
	local tempRank = param.addRank or 0
	local level = unitData:getLevel() + tempLevel
	local rank = unitData:getStar() + tempRank

	local attr1 = PetDataHelper.getPetBasicAttrWithLevel(unitData:getConfig(), level)
	local attr2 = PetDataHelper.getPetBreakAttr(unitData, tempRank)

	AttrDataHelper.appendAttr(result, attr1)
	AttrDataHelper.appendAttr(result, attr2)
	AttrDataHelper.processDef(result)
	AttrDataHelper.processAddition(result)

	return result
end

--获取界限突破对应的属性值
function PetDataHelper.getPetLimitAttr(petUnitData, tempLimitLevel)
	local result = {}
	local heroBaseId = petUnitData:getBase_id()
	local limitLevel = tempLimitLevel or petUnitData:getLimit_level()
	for i = 0, limitLevel do
		local attrInfo = PetDataHelper.getLimitSingleAttr(heroBaseId, i)
		AttrDataHelper.appendAttr(result, attrInfo)
	end

	return result
end

----------------------------------------------神兽回收部分---------------------------------------------------------------------
--获取神兽升级的总消耗
function PetDataHelper.getAllPetLevelUpCost(unitData)
	local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
	local itemExp1 = require("app.config.item").get(DataConst.ITEM_PET_LEVELUP_MATERIAL_1).item_value
	local itemExp2 = require("app.config.item").get(DataConst.ITEM_PET_LEVELUP_MATERIAL_2).item_value
	local itemExp3 = require("app.config.item").get(DataConst.ITEM_PET_LEVELUP_MATERIAL_3).item_value
	local itemExp4 = require("app.config.item").get(DataConst.ITEM_PET_LEVELUP_MATERIAL_4).item_value

	local expItem = {
		count1 = 0,
		count2 = 0,
		count3 = 0,
		count4 = 0
	}
	local expCount = unitData:getExp() - unitData:getInital_exp() --经验

	while expCount >= itemExp1 do
		if expCount >= itemExp4 then
			expCount = expCount - itemExp4
			expItem.count4 = expItem.count4 + 1
		elseif expCount >= itemExp3 then
			expCount = expCount - itemExp3
			expItem.count3 = expItem.count3 + 1
		elseif expCount >= itemExp2 then
			expCount = expCount - itemExp2
			expItem.count2 = expItem.count2 + 1
		elseif expCount >= itemExp1 then
			expCount = expCount - itemExp1
			expItem.count1 = expItem.count1 + 1
		end
	end

	local result = {}
	for i = 1, 4 do
		if expItem["count" .. i] > 0 then
			RecoveryDataHelper.formatRecoveryCost(
				result,
				TypeConvertHelper.TYPE_ITEM,
				DataConst["ITEM_PET_LEVELUP_MATERIAL_" .. i],
				expItem["count" .. i]
			)
		end
	end

	return result
end

--获取神兽突破的总消耗
function PetDataHelper.getAllPetBreakCost(unitData)
	local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
	local result = {}
	local config = unitData:getConfig()
	local rank = unitData:getStar()
	local rTemplet = unitData:getLvUpCost()
	local heroBaseId = unitData:getBase_id()
	local initial_star = unitData:getInitial_star()

	if config.color == 6 and initial_star == 0 then --红色神兽
		heroBaseId = config.potential_before
	end

	local isRed = unitData:getIsRed()

	for i = initial_star, rank - 1 do
		local rankInfo = PetDataHelper.getPetStarCostConfig(i, rTemplet, isRed)
		local cardNum = rankInfo.card
		if config.color == 6 and initial_star == 0 then --红色神兽
			cardNum = rankInfo.potential_card
		end
		if cardNum > 0 then
			RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_PET, heroBaseId, cardNum)
		end
		for j = 1, 2 do
			local size = rankInfo["size_" .. j]
			if size > 0 then
				local type = rankInfo["type_" .. j]
				local value = rankInfo["value_" .. j]
				RecoveryDataHelper.formatRecoveryCost(result, type, value, size)
			end
		end
		
		--获取界限突破后升星需要的道具（pet表potential_value）和数量（pet_star_cost表special_size）
		if config.potential_before > 0 then
			--是界限突破后的神兽
			local itemArray = string.split(config.potential_value, "|")
			local type = tonumber(itemArray[1])
			local value = tonumber(itemArray[2])
			if type and value and rankInfo['special_size'] > 0 then
				RecoveryDataHelper.formatRecoveryCost(result, type, value, rankInfo['special_size'])
			end
		end
	end

	return result
end

function PetDataHelper.getAllPetLimitUpCost(unitData)
	local config = unitData:getConfig()
	local result = {}
	local exp = 0
	if config.color == 6 then --红色神兽
		-- local PetTrainHelper = require("app.scene.view.petTrain.PetTrainHelper")
		-- local LimitCostConst = require("app.const.LimitCostConst")
		-- local costInfo = PetTrainHelper.getLimitCostInfo(unitData)

		local materials = unitData:getRecycle_materials()
		for i, material in ipairs(materials) do
			RecoveryDataHelper.formatRecoveryCost(result, material.type, material.value, material.size)
		end
	else
		local recyMats = unitData:getRecycle_materials()
		for _, mat in pairs(recyMats) do
			RecoveryDataHelper.formatRecoveryCost(result, mat.type, mat.value, mat.size)
		end
	end
	return result, exp
end

--获取神兽回收预览信息
function PetDataHelper.getPetRecoveryPreviewInfo(heroDatas)
	local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
	local result = {}
	local info = {}
	for k, unitData in pairs(heroDatas) do
		local cost1 = PetDataHelper.getAllPetLevelUpCost(unitData)
		local cost2 = PetDataHelper.getAllPetBreakCost(unitData)
		local cost3 = PetDataHelper.getAllPetLimitUpCost(unitData)

		local petBaseId = unitData:getBase_id()
		local config = unitData:getConfig()
		local initial_star = unitData:getInitial_star()

		if config.color == 6 and initial_star == 0 then --红色神兽
			petBaseId = config.potential_before
		end
		RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_PET, petBaseId, 1) --本卡
		RecoveryDataHelper.mergeRecoveryCost(info, cost1)
		RecoveryDataHelper.mergeRecoveryCost(info, cost2)
		RecoveryDataHelper.mergeRecoveryCost(info, cost3)
	end

	--将同名卡转化为代币
	local currency = {}
	for type, unit in pairs(info) do
		if type == TypeConvertHelper.TYPE_PET then
			for value, size in pairs(unit) do
				local temp = RecoveryDataHelper.convertSameCard(type, value, size, 1)
				RecoveryDataHelper.mergeRecoveryCost(currency, temp)
			end
			info[type] = nil --清除同名卡
		end
	end
	RecoveryDataHelper.mergeRecoveryCost(info, currency)

	for type, unit in pairs(info) do
		for value, size in pairs(unit) do
			table.insert(result, {type = type, value = value, size = size})
		end
	end
	RecoveryDataHelper.sortAward(result)
	return result
end

--获取神兽重生预览信息
function PetDataHelper.getPetRebornPreviewInfo(data)
	local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
	local result = {}
	local info = {}

	local cost1 = PetDataHelper.getAllPetLevelUpCost(data)
	local cost2 = PetDataHelper.getAllPetBreakCost(data)
	local cost3 = PetDataHelper.getAllPetLimitUpCost(data)

	local petBaseId = data:getBase_id()
	local config = data:getConfig()
	local initial_star = data:getInitial_star()

	if config.color == 6 and initial_star == 0 then --红色神兽
		petBaseId = config.potential_before
	end
	RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_PET, petBaseId, 1) --本卡
	RecoveryDataHelper.mergeRecoveryCost(info, cost1)
	RecoveryDataHelper.mergeRecoveryCost(info, cost2)
	RecoveryDataHelper.mergeRecoveryCost(info, cost3)

	--将同名卡转化为碎片
	local fragments = {}
	for type, unit in pairs(info) do
		if type == TypeConvertHelper.TYPE_PET then
			for value, size in pairs(unit) do
				local temp = RecoveryDataHelper.convertSameCard(type, value, size, 2)
				RecoveryDataHelper.mergeRecoveryCost(fragments, temp)
			end
			info[type] = nil --清除同名卡
		end
	end
	RecoveryDataHelper.mergeRecoveryCost(info, fragments)

	for type, unit in pairs(info) do
		for value, size in pairs(unit) do
			table.insert(result, {type = type, value = value, size = size})
		end
	end
	RecoveryDataHelper.sortAward(result)
	return result
end

function PetDataHelper.getPetTeamRedPoint(...)
	-- body
	local RedPointHelper = require("app.data.RedPointHelper")
	local function checkPetUpgrade(petId)
		local petUnitData = G_UserData:getPet():getUnitDataWithId(petId)
		local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE1, petUnitData)
		return reach
	end

	local function checkPetBreak(petId)
		local petUnitData = G_UserData:getPet():getUnitDataWithId(petId)
		local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE2, petUnitData)
		return reach
	end

	local function checkPetLimit(petId)
		local petUnitData = G_UserData:getPet():getUnitDataWithId(petId)
		local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE3, petUnitData)
		return reach
	end

	local checkFuncs = {
		[FunctionConst.FUNC_PET_TRAIN_TYPE1] = checkPetUpgrade,
		[FunctionConst.FUNC_PET_TRAIN_TYPE2] = checkPetBreak,
		[FunctionConst.FUNC_PET_TRAIN_TYPE3] = checkPetLimit
	}

	--红点相关的
	local redPointFuncId = {
		FunctionConst.FUNC_PET_TRAIN_TYPE1,
		FunctionConst.FUNC_PET_TRAIN_TYPE2,
		FunctionConst.FUNC_PET_TRAIN_TYPE3,
	}

	local petIdList = G_UserData:getTeam():getPetIdsInHelp()
	for i, value in ipairs(petIdList) do
		for j, funcId in ipairs(redPointFuncId) do
			local func = checkFuncs[funcId]
			if value > 0 then
				local reach = func(value)
				if reach then
					return true
				end
			end
		end
	end

	local petBattleIdList = G_UserData:getTeam():getPetIdsInBattle()
	for i, value in ipairs(petBattleIdList) do
		for j, funcId in ipairs(redPointFuncId) do
			local func = checkFuncs[funcId]
			if value > 0 then
				local reach = func(value)
				if reach then
					return true
				end
			end
		end
	end

	return false
end

--获取神兽播放的Effect
function PetDataHelper.getPetEffectWithBaseId(baseId)
	local result = nil
	local info = require("app.config.pet").get(baseId)
	assert(info, string.format("pet config can not find id = %d", baseId))
	local moving = info.moving
	if moving ~= "0" then
		result = string.split(moving, "|")
	end
	return result
end

function PetDataHelper.playVoiceWithId(id)
	local info = require("app.config.pet").get(id)
	assert(info, string.format("pet config can not find id = %d", id))
	local voiceName = info.voice
	if voiceName ~= "" and voiceName ~= "0" then
		local res = Path.getHeroVoice(voiceName)
		G_AudioManager:playSound(res)
	end
end

return PetDataHelper
