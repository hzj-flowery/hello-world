--武将模块数据封装类

local HeroDataHelper = {}

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local EquipDataHelper = require("app.utils.data.EquipDataHelper")
local TreasureDataHelper = require("app.utils.data.TreasureDataHelper")
local InstrumentDataHelper = require("app.utils.data.InstrumentDataHelper")
local AttributeConst = require("app.const.AttributeConst")
local TeamConst = require("app.const.TeamConst")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local PetDataHelper = require("app.utils.data.PetDataHelper")
local SilkbagDataHelper = require("app.utils.data.SilkbagDataHelper")
local HeroConst = require("app.const.HeroConst")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")
local HistoryHeroDataHelper = require("app.utils.data.HistoryHeroDataHelper")
local TacticsDataHelper = require("app.utils.data.TacticsDataHelper")

-----------------------------------------------------------------------

function HeroDataHelper.getHeroConfig(id)
	local info = require("app.config.hero").get(id)
	assert(info, string.format("hero config can not find id = %d", id))
	return info
end

function HeroDataHelper.getHeroResConfig(id)
	local info = require("app.config.hero_res").get(id)
	assert(info, string.format("hero_res config can not find id = %d", id))
	return info
end

function HeroDataHelper.getHeroYokeConfig(id)
	local info = require("app.config.hero_fate").get(id)
	assert(info, string.format("hero_fate config can not find id = %d", id))
	return info
end

function HeroDataHelper.getHeroFriendConfig(id)
	local info = require("app.config.hero_friend").get(id)
	assert(info, string.format("hero_friend config can not find friend_id = %d", id))
	return info
end

function HeroDataHelper.getSameCountryHeroes(id, color)
	local list = {}
	local country = HeroDataHelper.getHeroConfig(id).country
	local config = require("app.config.hero")
	local len = config.length()
	for i = 1, len do
		local info = config.indexOf(i)
		if info.country==country and (color==nil or color==info.color) and info.is_show==1 then
			table.insert(list, info.id)
		end
	end
	return list
end

function HeroDataHelper.getHeroAwakenConfig(id, awakeCost)
	local info = require("app.config.hero_awaken").get(id, awakeCost)
	assert(info, string.format("hero_awaken config can not find id = %d, awaken_cost = %d", id, awakeCost))
	return info
end

function HeroDataHelper.getHeroLevelupConfig(level, templet)
	local info = require("app.config.hero_levelup").get(level, templet)
	assert(info, string.format("hero_levelup can not find level = %d, templet = %d", level, templet))
	return info
end

function HeroDataHelper.getHeroRankConfig(id, rank, limit, limitRed)
	limitRed = limitRed or 0
	local config = require("app.config.hero_rank").get(id, rank, limit, limitRed)
	-- assert(config, string.format("hero_rank config can not find id = %d, rank = %d", id, rank))
	return config
end

function HeroDataHelper.getHeroRankCostConfig(rank, templet)
	local config = require("app.config.hero_rank_cost").get(rank, templet)
	assert(config, string.format("hero_rank_cost config can not find rank = %d, templet = %d", rank, templet))
	return config
end

function HeroDataHelper.getHeroLimitSizeConfig(id, limitLevel)
	local config = require("app.config.hero_limit_size").get(id, limitLevel)
	-- assert(config, string.format("hero_limit_size config can not find id = %d, limitLevel = %d", id, limitLevel))
	return config
end

function HeroDataHelper.getHeroRedLimitSizeConfig(id, limitRedLevel)
	local config = require("app.config.hero_red_limit_size").get(id, limitRedLevel)
	-- assert(config, string.format("hero_limit_size config can not find id = %d, limitLevel = %d", id, limitLevel))
	return config
end

function HeroDataHelper.getHeroLimitCostConfig(limitLevel, limitLevelRed)
	limitLevelRed = limitLevelRed or 0
	local config = require("app.config.hero_limit_cost").get(limitLevel, limitLevelRed)
	assert(config, string.format("hero_limit_cost config can not find limit_level = %d", limitLevel))
	return config
end

function HeroDataHelper.getHeroYokeIdsByConfig(baseId)
	local result = {}
	local info = HeroDataHelper.getHeroConfig(baseId)
	for i = 1, HeroConst.HERO_YOKE_MAX do
		local fateId = info["fate_" .. i]
		if fateId > 0 then
			table.insert(result, fateId)
		end
	end
	return result
end

function HeroDataHelper.getLimitDataType(unitData)
	local config = unitData:getConfig()
	local limitLevel = unitData:getLimit_level()
	local limitRedLevel = unitData:getLimit_rtg()
	if config.color==6 and config.limit_red==1 then
		return HeroConst.HERO_LIMIT_TYPE_GOLD_ORG
	elseif config.color==5 and limitLevel==3 and config.limit_red==1 then
		return HeroConst.HERO_LIMIT_TYPE_GOLD_RED
	else
		return HeroConst.HERO_LIMIT_TYPE_RED
	end
end

--获取缘分数据
function HeroDataHelper.getHeroKarmaData(heroConfig)
	local data = {}

	for i = 1, HeroConst.HERO_KARMA_MAX do
		local friendId = heroConfig["friend_" .. i]
		if friendId > 0 then
			local friendConfig = HeroDataHelper.getHeroFriendConfig(friendId)
			local unitData = {}
			unitData["id"] = friendConfig.friend_id
			unitData["karmaName"] = friendConfig.friend_name
			local heroIds = {}
			for i = 1, 3 do
				local heroId = friendConfig["hero_id_" .. i]
				if heroId > 0 then
					table.insert(heroIds, heroId)
				end
			end
			unitData["heroIds"] = heroIds
			unitData["attrId"] = friendConfig.talent_attr
			unitData["attrName"] = require("app.config.attribute").get(friendConfig.talent_attr).cn_name
			unitData["attrValue"] = tonumber(friendConfig.talent_value / 10) --表中填的是千分比
			unitData['cond1'] = friendConfig.friend_cond1
			unitData['cond2'] = friendConfig.friend_cond2

			table.insert(data, unitData)
		end
	end

	return data
end

--名将册（缘分）显示与否
-- 1.界限突破等级
-- 2.以人物等级来定
-- 3.官衔达到一定级别
function HeroDataHelper.getReachCond(heroData, cond1, cond2, level, officialLevel)
	if cond1 == "" and cond2 == "" then
		return true
	end
	local condArray = {}
	if cond1 ~= "" then
		table.insert(condArray, string.split(cond1, "|"))
	end
	if cond2 ~= "" then
		table.insert(condArray, string.split(cond2, "|"))
	end

	local reach = true
	for i = 1, #condArray do
		local condType = tonumber(condArray[i][1])
		local condValue = tonumber(condArray[i][2])
		if condType == 1 then
			-- 1.界限突破等级
			reach = reach and heroData:getLimit_level() >= condValue
		elseif condType == 2 then
			-- 2.以主角等级来定
			if not level then
				level = G_UserData:getBase():getLevel()
			end
			reach = reach and level >= condValue
		elseif condType == 3 then
			-- 3.官衔达到一定级别
			if not officialLevel then
				officialLevel = G_UserData:getBase():getOfficer_level()
			end
			reach = reach and officialLevel >= condValue
		end
	end
	return reach
end

--根据武将BaseId获取是否显示羁绊角标
function HeroDataHelper.isShowYokeMark(baseId)
	local isIn = G_UserData:getHero():isInListWithBaseId(baseId)
	if isIn then --如果已经有了，就算了
		return false
	end

	local ret = HeroDataHelper.isHaveYokeWithHeroBaseId(baseId)
	return ret
end

--根据武将BaseId获取是否有羁绊关系
function HeroDataHelper.isHaveYokeWithHeroBaseId(baseId)
	local heroFateMap = G_UserData:getHero():getHeroFateMap()
	local fateIds = heroFateMap[baseId]
	if fateIds then
		for i, fateId in ipairs(fateIds) do
			local fateConfig = HeroDataHelper.getHeroYokeConfig(fateId)
			local heroId = fateConfig.hero_id
			if G_UserData:getTeam():isInBattleWithBaseId(heroId) then
				return true
			end
		end
	end
	return false
end

--根据武将BaseId获取是否有缘分关系
function HeroDataHelper.isHaveKarmaWithHeroBaseId(baseId)
	local isHaved = G_UserData:getKarma():isHaveHero(baseId)
	if isHaved then --如果已经有过此武将
		return false
	end

	local heroBaseIds = G_UserData:getTeam():getHeroBaseIdsInBattle()
	for i, heroBaseId in ipairs(heroBaseIds) do
		local heroConfig = HeroDataHelper.getHeroConfig(heroBaseId)
		local data = HeroDataHelper.getHeroKarmaData(heroConfig)
		for j, one in ipairs(data) do
			for k, id in ipairs(one.heroIds) do
				if baseId == id then
					return true
				end
			end
		end
	end

	return false
end

-- 根据宝物ID判断与上阵武将是否有羁绊关系
function HeroDataHelper.isHaveYokeToBattleWarriorByTreasureId(treasureId)
	local bYoke = false
	local heroBaseIds = G_UserData:getTeam():getHeroBaseIdsInBattle()
	for index, heroId in ipairs(heroBaseIds) do
		if TreasureDataHelper.isHaveYokeBetweenHeroAndTreasured(heroId, treasureId) then
			bYoke = true
			break
		end
	end
	return bYoke
end

--根据武将BaseId获取是否有缘分关系
--返回 {{heroId = 激活武将id, karmaData = 缘分属性数据},{heroId = , karmaData = } }
function HeroDataHelper.getActivateKarmaInfoWithHeroBaseId(baseId)
	local returnData = {}
	local isHaved = G_UserData:getKarma():isHaveHero(baseId)
	if isHaved then --如果已经有过此武将
		return returnData
	end

	local heroBaseIds = G_UserData:getTeam():getHeroBaseIdsInBattle()
	for i, heroBaseId in ipairs(heroBaseIds) do
		local heroConfig = HeroDataHelper.getHeroConfig(heroBaseId)
		local data = HeroDataHelper.getHeroKarmaData(heroConfig)
		for j, one in ipairs(data) do
			for k, id in ipairs(one.heroIds) do
				if baseId == id then
					table.insert(returnData, {heroId = heroBaseId, karmaData = one})
					break
				end
			end
		end
	end
	return returnData
end

--根据武将BaseId获取缘分信息
function HeroDataHelper.getKarmaInfoWithHeroBaseId(baseId)
	local result = {}
	local heroConfig = HeroDataHelper.getHeroConfig(baseId)

	local data = HeroDataHelper.getHeroKarmaData(heroConfig)
	local heroBaseIds = G_UserData:getKarma():getHero_base_id()
	for i, one in ipairs(data) do
		for j, id in ipairs(one.heroIds) do
			for k, heroBaseId in ipairs(heroBaseIds) do
				if id == heroBaseId then
					table.insert(result, one)
				end
			end
		end
	end
	return result
end

--获取主角升级当前等级所需经验
function HeroDataHelper.getUserLevelUpExp(lastLevel)
	local level = lastLevel or G_UserData:getBase():getLevel()
	local roleConfig = require("app.config.role").get(level)
	local exp = roleConfig.exp

	return exp
end

--根据等级获取升级到此等级所需的经验
function HeroDataHelper.getHeroNeedExpWithLevel(templet, level)
	local needExp = 0
	for i = 1, level - 1 do
		local exp = HeroDataHelper.getHeroLevelUpExp(i, templet)
		needExp = needExp + exp
	end

	return needExp
end

--根据经验获取对应可以升到的等级
function HeroDataHelper.getCanReachLevelWithExp(totalExp, templet)
	local level = 1
	local exp = 0
	while exp <= totalExp do
		local temp = HeroDataHelper.getHeroLevelUpExp(level, templet)
		exp = exp + temp
		level = level + 1
	end
	return level - 1
end

--获取升当前等级所需经验
function HeroDataHelper.getHeroLevelUpExp(level, templet)
	local config = HeroDataHelper.getHeroLevelupConfig(level, templet)
	return config.exp
end

--根据等级获取此级基础属性
function HeroDataHelper.getBasicAttrWithLevel(heroConfig, level)
	local templet = heroConfig.lvup_cost
	local atk = heroConfig.atk_base
	local pdef = heroConfig.pdef_base
	local mdef = heroConfig.mdef_base
	local hp = heroConfig.hp_base
	local growAtk = heroConfig.atk_grow
	local growPdef = heroConfig.pdef_grow
	local growMdef = heroConfig.mdef_grow
	local growHp = heroConfig.hp_grow
	local hitBase = heroConfig.hit_base
	local noHitBase = heroConfig.no_hit_base
	local critBase = heroConfig.crit_base
	local noCritBase = heroConfig.no_crit_base

	for i = 1, level - 1 do
		local config = HeroDataHelper.getHeroLevelupConfig(i, templet)
		local ratio = config.ratio
		atk = atk + math.floor(growAtk * ratio / 1000)
		pdef = pdef + math.floor(growPdef * ratio / 1000)
		mdef = mdef + math.floor(growMdef * ratio / 1000)
		hp = hp + math.floor(growHp * ratio / 1000)
	end

	local result = {}
	result[AttributeConst.ATK] = atk
	result[AttributeConst.PD] = pdef
	result[AttributeConst.MD] = mdef
	result[AttributeConst.HP] = hp
	result[AttributeConst.HIT] = hitBase
	result[AttributeConst.NO_HIT] = noHitBase
	result[AttributeConst.CRIT] = critBase
	result[AttributeConst.NO_CRIT] = noCritBase

	return result
end

--获取突破消耗
function HeroDataHelper.getHeroBreakMaterials(heroUnitData)
	local rankLevel = heroUnitData:getRank_lv()
	local templet = heroUnitData:getConfig().rank_cost
	local config = HeroDataHelper.getHeroRankCostConfig(rankLevel, templet)

	local result = {}
	local card = config.card
	if card > 0 then
		table.insert(result, {type = TypeConvertHelper.TYPE_HERO, value = heroUnitData:getBase_id(), size = card})
	end
	for i = 1, 2 do
		local type = config["type_" .. i]
		local value = config["value_" .. i]
		local size = config["size_" .. i]
		if size > 0 then
			table.insert(result, {type = type, value = value, size = size})
		end
	end
	return result
end

--获取突破等级限制
function HeroDataHelper.getHeroBreakLimitLevel(heroUnitData)
	local rankLevel = heroUnitData:getRank_lv()
	local templet = heroUnitData:getConfig().rank_cost
	local config = HeroDataHelper.getHeroRankCostConfig(rankLevel, templet)
	return config.level
end

function HeroDataHelper.getBreakCostWithRank(rank, templet)
	local rankCostConfig = HeroDataHelper.getHeroRankCostConfig(rank, templet)

	local needLevel = rankCostConfig.level
	local card = rankCostConfig.card
	local type1 = rankCostConfig.type_1
	local value1 = rankCostConfig.value_1
	local size1 = rankCostConfig.size_1
	return {needLevel = needLevel, card = card, type1 = type1, value1 = value1, size1 = size1}
end

--获取突破最大等级
function HeroDataHelper.getHeroBreakMaxLevel(heroUnitData)
	local level = heroUnitData:getLevel()
	local templet = heroUnitData:getConfig().rank_cost
	local rankMax = heroUnitData:getConfig().rank_max
	for i = 1, rankMax do
		local info = HeroDataHelper.getHeroRankCostConfig(i, templet)
		if level < info.level then
			return i
		end
	end
	return rankMax
end

--根据等级获取突破等级对应的属性值
function HeroDataHelper.getBreakAttr(heroUnitData, addRank)
	addRank = addRank or 0
	local baseId = heroUnitData:getBase_id()
	local rank = heroUnitData:getRank_lv() + addRank
	local rankMax = heroUnitData:getConfig().rank_max
	if rank > rankMax then
		return nil --到顶级了
	end
	local limitLevel = heroUnitData:getLimit_level()
	local limitRedLevel = heroUnitData:getLimit_rtg()
	local result = HeroDataHelper.getBreakAttrWithBaseIdAndRank(baseId, rank, limitLevel, limitRedLevel)
	return result
end

function HeroDataHelper.getBreakAttrWithBaseIdAndRank(baseId, rank, limitLevel, limitRedLevel)
	local atk = 0
	local pdef = 0
	local mdef = 0
	local hp = 0
	local atkper = 0
	local pdper = 0
	local mdper = 0
	local hpper = 0

	for i = 1, rank do
		local heroRankConfig = HeroDataHelper.getHeroRankConfig(baseId, i, limitLevel, limitRedLevel)
		atk = atk + heroRankConfig.atk_break
		pdef = pdef + heroRankConfig.pdef_break
		mdef = mdef + heroRankConfig.mdef_break
		hp = hp + heroRankConfig.hp_break
		atkper = atkper + heroRankConfig.atkper_break
		pdper = pdper + heroRankConfig.pdefper_break
		mdper = mdper + heroRankConfig.mdefper_break
		hpper = hpper + heroRankConfig.hpper_break
	end

	local result = {}
	result[AttributeConst.ATK] = atk
	result[AttributeConst.PD] = pdef
	result[AttributeConst.MD] = mdef
	result[AttributeConst.HP] = hp
	result[AttributeConst.ATK_PER] = atkper --攻击加成
	result[AttributeConst.PD_PER] = pdper --物防加成
	result[AttributeConst.MD_PER] = mdper --法防加成
	result[AttributeConst.HP_PER] = hpper --生命加成

	return result
end

--获取界限突破对应的属性值
function HeroDataHelper.getLimitAttr(heroUnitData, tempLimitLevel, tempLimitRedLevel)
	local result = {}
	local heroBaseId = heroUnitData:getBase_id()
	local limitLevel = tempLimitLevel or heroUnitData:getLimit_level()
	local limitRedLevel = tempLimitRedLevel or heroUnitData:getLimit_rtg()
	-- 武将红升金界限属性
	if limitRedLevel>0 then
		for i = 0, limitRedLevel do
			local attrInfo = HeroDataHelper.getLimitSingleAttr(heroBaseId, i, HeroConst.HERO_LIMIT_TYPE_GOLD)
			AttrDataHelper.appendAttr(result, attrInfo)
		end
	end
	-- 武将橙升红界限属性
	if limitLevel>0 then
		for i = 0, limitLevel do
			local attrInfo = HeroDataHelper.getLimitSingleAttr(heroBaseId, i, HeroConst.HERO_LIMIT_TYPE_RED)
			AttrDataHelper.appendAttr(result, attrInfo)
		end
	end

	return result
end

function HeroDataHelper.getLimitSingleAttr(heroBaseId, limitLevel, limitType)
	local result = {}
	local config
	if limitType==HeroConst.HERO_LIMIT_TYPE_GOLD then
		config = HeroDataHelper.getHeroRedLimitSizeConfig(heroBaseId, limitLevel)
	else
		config = HeroDataHelper.getHeroLimitSizeConfig(heroBaseId, limitLevel)
	end
	if config == nil then
		return result
	end
	for j = 1, 4 do
		local attrType = config["type_" .. j]
		local attrValue = config["size_" .. j]
		if attrType > 0 then
			AttrDataHelper.formatAttr(result, attrType, attrValue)
		end
	end
	return result
end

-- 将武将红升金特殊材料转换为通用材料
function HeroDataHelper.convertLimitRedCost(heroUnitData, type, value)
	if type==99 then
		if value==1 then
			local id = heroUnitData:getBase_id()
			return TypeConvertHelper.TYPE_HERO, id
		elseif value==2 then
			local id = heroUnitData:getBase_id()
			local list = HeroDataHelper.getSameCountryHeroes(id, 7) 	-- 同阵营金将
			return TypeConvertHelper.TYPE_HERO, list[1]
		end
	else
		return type, value
	end
end

function HeroDataHelper.getLimitCostConfigKey(index)
	local res = {}
	if index==5 then
		res.name = "special_name"
		res.type = "special_type"
		res.value = "special_value"
		res.size = "special_size"
		res.consume = "special_consume"
	else
		res.name = "name_" .. index
		res.type = "type_" .. index
		res.value = "value_" .. index
		res.size = "size_" .. index
		res.consume = "consume_" .. index
	end
	return res
end

function HeroDataHelper._getAllLimitCost(heroUnitData, limitRed)
	local result = {}
	local exp = 0

	for key = HeroConst.HERO_LIMIT_COST_KEY_1, HeroConst.HERO_LIMIT_COST_KEY_6 do
		if key == HeroConst.HERO_LIMIT_COST_KEY_1 then
			exp = exp + heroUnitData:getLimitCostCountWithKey(key, limitRed)
		else
			local info = HeroDataHelper.getHeroLimitCostConfig(0, limitRed)
			local configKey = HeroDataHelper.getLimitCostConfigKey(key)
			local type = info[configKey.type]
			local value = info[configKey.value]
			if type==99 and value==1 then 	-- 转换自身胚子，金将不处理
				type = TypeConvertHelper.TYPE_HERO
				value = heroUnitData:getBase_id()
			end
			if type~=99 then
				local size = heroUnitData:getLimitCostCountWithKey(key, limitRed)
				if size > 0 then
					RecoveryDataHelper.formatRecoveryCost(result, type, value, size)
				end
			end
		end
	end

	local index
	if limitRed==0 then
		index = heroUnitData:getLimit_level()
	else
		index = heroUnitData:getLimit_rtg()
	end
	for i = 1, index do
		local config = HeroDataHelper.getHeroLimitCostConfig(i - 1, limitRed)
		exp = exp + config.size_1

		for j = HeroConst.HERO_LIMIT_COST_KEY_2, HeroConst.HERO_LIMIT_COST_KEY_6 do
			local configKey = HeroDataHelper.getLimitCostConfigKey(j)
			local type = config[configKey.type]
			local value = config[configKey.value]
			if type==99 and value==1 then 	-- 转换自身胚子，金将不处理
				type = TypeConvertHelper.TYPE_HERO
				value = heroUnitData:getBase_id()
			end
			if type~=99 then
				local size = config[configKey.size]
				if size > 0 then
					RecoveryDataHelper.formatRecoveryCost(result, type, value, size)
				end
			end
		end

		RecoveryDataHelper.formatRecoveryCost(result, config.break_type, config.break_value, config.break_size)
	end

	return result, exp
end

--获取界限突破的消耗，去掉金将
function HeroDataHelper.getAllLimitCostWithoutGold(heroUnitData)
	local res, exp = HeroDataHelper.getAllLimitCost(heroUnitData)
	local result = {}
	for k,v in pairs(res) do
		if k==TypeConvertHelper.TYPE_HERO then
			result[k] = {}
			for kk,vv in pairs(v) do
				if HeroDataHelper.getHeroConfig(kk).color~=7 then
					result[k][kk] = vv
				end
			end
		else
			result[k] = v
		end
	end
	return result, exp
end

--获取界限突破的消耗
function HeroDataHelper.getAllLimitCost(heroUnitData)
	local result = {}
	local exp = 0

	local unionResult = function(result, tmp)
		for k,v in pairs(tmp) do
			result[k] = result[k] or {}
			for kk,vv in pairs(v) do
				result[k][kk] = result[k][kk] or 0
				result[k][kk] = result[k][kk] + vv
			end
		end
		return result
	end

	local config = heroUnitData:getConfig()
	local limitLevel = heroUnitData:getLimit_level()
	local limitRedLevel = heroUnitData:getLimit_rtg()
	if config.color==6 then
		local r, e = HeroDataHelper._getAllLimitCost(heroUnitData, 1)
		unionResult(result, r)
		exp = exp+e
	else
		local r, e = HeroDataHelper._getAllLimitCost(heroUnitData, 0)
		unionResult(result, r)
		exp = exp+e
		local r, e = HeroDataHelper._getAllLimitCost(heroUnitData, 2)
		unionResult(result, r)
		exp = exp+e
	end
	local costHero = heroUnitData:getRtg_cost_hero()
	for k,v in pairs(costHero) do
		local type = TypeConvertHelper.TYPE_HERO
		local value = v.Key
		local size = v.Value
		-- 只用服务器的金将数据
		if HeroDataHelper.getHeroConfig(value).color==7 then
			RecoveryDataHelper.formatRecoveryCost(result, type, value, size)
		end
	end

	return result, exp
end

--是否达到了rank要求，想升级到界限等级limitLevel
function HeroDataHelper.isReachLimitRank(heroUnitData)
	local limitLevel = heroUnitData:getLimit_level()
	local limitRedLevel = heroUnitData:getLimit_rtg()
	local curRank = heroUnitData:getRank_lv()
	local config = heroUnitData:getConfig()

	local lv, type
	if config.limit_red==0 or (config.color==5 and limitLevel<3) then
		lv = limitLevel
		type = HeroConst.HERO_LIMIT_TYPE_RED
	else
		lv = limitRedLevel
		if config.color==6 then
			type = HeroConst.HERO_LIMIT_TYPE_GOLD_ORG
		else
			type = HeroConst.HERO_LIMIT_TYPE_GOLD_RED
		end
	end
	local config2 = HeroDataHelper.getHeroLimitCostConfig(lv, type)

	local rank = config2.rank
	if curRank >= rank then
		return true, rank
	else
		return false, rank
	end
end

--根据突破等级，获取需要的界限等级
--比如：要想激活突破等级rank，需要达到界限等级多少？
function HeroDataHelper.getNeedLimitLevelWithRank(rank, limitLevelRed)
	local rankList = {5,8,10,12}
	limitLevelRed = limitLevelRed or 0
	local Config = require("app.config.hero_limit_cost")
	local len = Config.length()
	for i = 1, len do
		local info = Config.indexOf(i)
		if info.limit_level_red==limitLevelRed then
			if limitLevelRed == 0 then
				if rank<=info.rank then
					return info.limit_level+1
				end
			else
				local index = 1
				for j=1,#rankList do
					if rank<=rankList[j] then
						return j
					end
				end
			end
		end
	end
	return nil
end

--获取觉醒对应属性值
function HeroDataHelper.getAwakeAttr(heroUnitData, addLevel)
	local tempLevel = addLevel or 0
	local result = {}
	local awakeLevel = heroUnitData:getAwaken_level() + tempLevel
	local awakeCost = heroUnitData:getConfig().awaken_cost
	local attrInfo1 = HeroDataHelper.getHeroAwakeLevelAttr(awakeLevel, awakeCost)
	local attrInfo2 = {}
	if tempLevel == 0 then
		attrInfo2 = HeroDataHelper.getHeroAwakeCurGemstoneAttr(heroUnitData)
	end

	AttrDataHelper.appendAttr(result, attrInfo1)
	AttrDataHelper.appendAttr(result, attrInfo2)

	return result
end

--获取觉醒天赋对应属性
function HeroDataHelper.getAwakeTalentAttr(heroUnitData)
	local result = {}
	local awakeLevel = heroUnitData:getAwaken_level()
	local awakeCost = heroUnitData:getConfig().awaken_cost
	for i = 0, awakeLevel do
		local info = HeroDataHelper.getHeroAwakenConfig(i, awakeCost)
		for j = 1, 4 do
			local attrType = info["talent_attribute_type" .. j]
			if attrType > 0 then
				local attrValue = info["talent_attribute_value" .. j]
				AttrDataHelper.formatAttr(result, attrType, attrValue)
			end
		end
	end

	return result
end

--获取变身卡对应属性
function HeroDataHelper.getAvatarAttr(heroUnitData)
	local result = {}
	if not heroUnitData:isLeader() then
		return result
	end
	if not G_UserData:getBase():isEquipAvatar() then
		return result
	end

	local avatarId = G_UserData:getBase():getAvatar_id()
	local unitData = G_UserData:getAvatar():getUnitDataWithId(avatarId)
	local baseId = unitData:getBase_id()
	local baseAttr = AvatarDataHelper.getAvatarBaseAttr(baseId)
	AttrDataHelper.appendAttr(result, baseAttr)

	return result
end

--变身卡假战力
function HeroDataHelper.getAvatarPower(heroUnitData)
	local result = {}
	if not heroUnitData:isLeader() then
		return result
	end
	if not G_UserData:getBase():isEquipAvatar() then
		return result
	end

	local avatarId = G_UserData:getBase():getAvatar_id()
	local unitData = G_UserData:getAvatar():getUnitDataWithId(avatarId)
	local power = unitData:getConfig().fake

	result[AttributeConst.AVATAR_EQUIP_POWER] = power
	return result
end

--获取变身卡天赋属性
-- function HeroDataHelper.getAvatarTalentAttr(heroUnitData)
-- 	local result = {}
-- 	if not G_UserData:getBase():isEquipAvatar() then
-- 		return result
-- 	end

-- 	local avatarId = G_UserData:getBase():getAvatar_id()
-- 	local unitData = G_UserData:getAvatar():getUnitDataWithId(avatarId)
-- 	local templet = unitData:getConfig().levelup_cost
-- 	local allInfo = AvatarDataHelper.getAllTalentInfo(templet)
-- 	for i, info in ipairs(allInfo) do
-- 		if unitData:getLevel() >= info.level then
-- 			local target = info.talent_target
-- 			if target == 1 and heroUnitData:isLeader() then --对自己
-- 				for j = 1, 2 do
-- 					local attrId = info["talent_attr_"..j]
-- 					local attrValue = info["talent_value_"..j]
-- 					AttrDataHelper.formatAttr(result, attrId, attrValue)
-- 				end
-- 			elseif target == 2 then --对上阵武将
-- 				for j = 1, 2 do
-- 					local attrId = info["talent_attr_"..j]
-- 					local attrValue = info["talent_value_"..j]
-- 					AttrDataHelper.formatAttr(result, attrId, attrValue)
-- 				end
-- 			end
-- 		end
-- 	end

-- 	return result
-- end

--获取变身卡图鉴属性
function HeroDataHelper.getAvatarShowAttr(heroUnitData)
	local result = {}
	local allInfo = AvatarDataHelper.getAllOwnAvatarShowInfo()
	for i, info in ipairs(allInfo) do
		local target = info.talent_target
		if target == 1 and heroUnitData:isLeader() then
			for j = 1, 4 do
				local attrId = info["talent_attr_" .. j]
				local attrValue = info["talent_value_" .. j]
				AttrDataHelper.formatAttr(result, attrId, attrValue)
			end
		elseif target == 2 then
			for j = 1, 4 do
				local attrId = info["talent_attr_" .. j]
				local attrValue = info["talent_value_" .. j]
				AttrDataHelper.formatAttr(result, attrId, attrValue)
			end
		end
	end

	return result
end

--变身卡图鉴假战力
function HeroDataHelper.getAvatarShowPower(heroUnitData)
	local result = {}
	local power = 0
	local allInfo = AvatarDataHelper.getAllOwnAvatarShowInfo()
	for i, info in ipairs(allInfo) do
		local target = info.talent_target
		if target == 1 and heroUnitData:isLeader() then
			power = power + info.fake
		elseif target == 2 then
			power = power + info.fake
		end
	end

	result[AttributeConst.AVATAR_POWER] = power
	return result
end

--锦囊属性
function HeroDataHelper.getSilkbagAttr(heroUnitData)
	local result = {}
	local userLevel = G_UserData:getBase():getLevel()
	local pos = heroUnitData:getPos()
	local heroBaseId = heroUnitData:getAvatarToHeroBaseId()
	local heroRank = heroUnitData:getRank_lv()
	local isInstrumentMaxLevel = G_UserData:getInstrument():isInstrumentLevelMaxWithPos(pos)
	local heroLimit = heroUnitData:getLeaderLimitLevel()
	local heroRedLimit = heroUnitData:getLeaderLimitRedLevel()
	local silkbagIds = G_UserData:getSilkbagOnTeam():getIdsOnTeamWithPos(pos)
	for i, silkbagId in ipairs(silkbagIds) do
		local unitData = G_UserData:getSilkbag():getUnitDataWithId(silkbagId)
		local baseId = unitData:getBase_id()
		local isEffective =
			SilkbagDataHelper.isEffectiveSilkBagToHero(baseId, heroBaseId, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit)
		if isEffective then
			local attr = SilkbagDataHelper.getAttrWithId(baseId, userLevel)
			AttrDataHelper.appendAttr(result, attr)
		end
	end

	return result
end

--锦囊假战力
function HeroDataHelper.getSilkbagPower(heroUnitData)
	local result = {}
	local power = 0
	local pos = heroUnitData:getPos()
	local heroBaseId = heroUnitData:getAvatarToHeroBaseId()
	local heroRank = heroUnitData:getRank_lv()
	local isInstrumentMaxLevel = G_UserData:getInstrument():isInstrumentLevelMaxWithPos(pos)
	local heroLimit = heroUnitData:getLeaderLimitLevel()
	local heroRedLimit = heroUnitData:getLeaderLimitRedLevel()
	local silkbagIds = G_UserData:getSilkbagOnTeam():getIdsOnTeamWithPos(pos)
	for i, silkbagId in ipairs(silkbagIds) do
		local unitData = G_UserData:getSilkbag():getUnitDataWithId(silkbagId)
		local baseId = unitData:getBase_id()
		local isEffective =
			SilkbagDataHelper.isEffectiveSilkBagToHero(baseId, heroBaseId, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit)
		if isEffective then
			local info = SilkbagDataHelper.getSilkbagConfig(baseId)
			power = power + info.fake
		end
	end

	result[AttributeConst.SILKBAG_POWER] = power
	return result
end

--获取装备属性
function HeroDataHelper.getEquipAttr(pos, isPower)
	local result = {}

	if pos == nil or pos == 0 then
		return result
	end

	local equipIds = G_UserData:getBattleResource():getEquipIdsWithPos(pos)
	for i, equipId in ipairs(equipIds) do
		local equipData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
		local attrInfo = EquipDataHelper.getEquipAttrInfo(equipData)
		AttrDataHelper.appendAttr(result, attrInfo)
		local jadeAttr = EquipDataHelper.getEquipJadeAttrInfo(equipData, G_UserData:getBase():getLevel(), isPower)
		AttrDataHelper.appendAttr(result, jadeAttr)
	end

	local suitAttr = EquipDataHelper.getEquipSuitAttr(equipIds, pos)
	AttrDataHelper.appendAttr(result, suitAttr)

	return result
end

--获取宝物属性
function HeroDataHelper.getTreasureAttr(pos, isPower)
	local result = {}

	if pos == nil or pos == 0 then
		return result
	end

	local treasureIds = G_UserData:getBattleResource():getTreasureIdsWithPos(pos)
	for i, treasureId in ipairs(treasureIds) do
		local treasureData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
		local attrInfo = TreasureDataHelper.getTreasureAttrInfo(treasureData)
		AttrDataHelper.appendAttr(result, attrInfo)
		local jadeAttr = TreasureDataHelper.getTreasureJadeAttrInfo(treasureData, G_UserData:getBase():getLevel(), isPower)
		AttrDataHelper.appendAttr(result, jadeAttr)
	end
	return result
end

--获取神兵属性
function HeroDataHelper.getInstrumentAttr(pos)
	local result = {}

	if pos == nil or pos == 0 then
		return result
	end

	local instrumentIds = G_UserData:getBattleResource():getInstrumentIdsWithPos(pos)
	for i, instrumentId in ipairs(instrumentIds) do
		local instrumentData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
		local attrInfo = InstrumentDataHelper.getInstrumentAttrInfo(instrumentData)
		AttrDataHelper.appendAttr(result, attrInfo)
	end
	return result
end

--获取大师属性
function HeroDataHelper.getMasterAttr(pos)
	local result = {}

	if pos == nil or pos == 0 then
		return result
	end

	local strengthenEquipInfo = EquipDataHelper.getMasterEquipStrengthenInfo(pos)
	local strengthenEquipAttr = strengthenEquipInfo.curAttr

	local refineEquipInfo = EquipDataHelper.getMasterEquipRefineInfo(pos)
	local refineEquipAttr = refineEquipInfo.curAttr

	local strengthenTreasureInfo = TreasureDataHelper.getMasterTreasureUpgradeInfo(pos)
	local strengthenTreasureAttr = strengthenTreasureInfo.curAttr

	local refineTreasureInfo = TreasureDataHelper.getMasterTreasureRefineInfo(pos)
	local refineTreasureAttr = refineTreasureInfo.curAttr

	AttrDataHelper.appendAttr(result, strengthenEquipAttr)
	AttrDataHelper.appendAttr(result, refineEquipAttr)
	AttrDataHelper.appendAttr(result, strengthenTreasureAttr)
	AttrDataHelper.appendAttr(result, refineTreasureAttr)

	return result
end

--获取官衔属性
function HeroDataHelper.getOfficialAttr(level)
	local result = {}
	local OfficialRank = require("app.config.official_rank")
	for i = 0, level do
		local info = OfficialRank.get(i)
		assert(info, string.format("official_rank config can not find id = %d", i))
		for j = 1, 4 do --有4组属性
			local attrType = info["attribute_type" .. j]
			local attrValue = info["attribute_value" .. j]
			AttrDataHelper.formatAttr(result, attrType, attrValue)
		end
	end

	return result
end

--获取神树战力
function HeroDataHelper.getHomelandPower()
	local result = {}
	local power = HomelandHelp.getAllPower()
	result[AttributeConst.HOMELAND_POWER] = power
	return result
end

--获取官衔战力
function HeroDataHelper.getOfficialPower(level)
	local result = {}
	local OfficialRank = require("app.config.official_rank")
	local power = 0
	for i = 1, level do
		local info = OfficialRank.get(i)
		assert(info, string.format("official_rank config can not find id = %d", i))
		power = power + info.all_combat
	end
	result[AttributeConst.OFFICAL_POWER] = power
	return result
end

--获取天赋战力
function HeroDataHelper.getTalentPower(heroUnitData, tempRank)
	local result = {}

	local heroBaseId = heroUnitData:getBase_id()
	local rank = heroUnitData:getRank_lv() + tempRank
	local limitLevel = heroUnitData:getLimit_level()
	local limitRedLevel = heroUnitData:getLimit_rtg()
	local power = 0
	for i = 0, rank do
		local info = HeroDataHelper.getHeroRankConfig(heroBaseId, i, limitLevel, limitRedLevel)
		power = power + info.fake_power
	end
	result[AttributeConst.TALENT_POWER] = power
	return result
end

--获取缘分对应属性值增加比例
function HeroDataHelper.getKarmaAttrRatio(heroConfig)
	local result = {}
	for i = 1, HeroConst.HERO_KARMA_MAX do
		local friendId = heroConfig["friend_" .. i]
		if friendId > 0 then
			if G_UserData:getKarma():isActivated(friendId) then
				local friendConfig = HeroDataHelper.getHeroFriendConfig(friendId)
				local attrId = friendConfig.talent_attr
				local attrValue = friendConfig.talent_value
				AttrDataHelper.formatAttr(result, attrId, attrValue)
			end
		end
	end
	return result
end

function HeroDataHelper.getYokeAttrRatio(heroUnitData)
	local heroConfig = heroUnitData:getConfig()
	local result = {}
	for i = 1, HeroConst.HERO_YOKE_MAX do
		local fateId = heroConfig["fate_" .. i]
		if fateId > 0 then
			if heroUnitData:isActivatedYoke(fateId) then
				local fateConfig = HeroDataHelper.getHeroYokeConfig(fateId)
				for i = 1, 2 do
					local attrId = fateConfig["talent_attr_" .. i]
					local attrValue = fateConfig["talent_value_" .. i]
					AttrDataHelper.formatAttr(result, attrId, attrValue)
				end
			end
		end
	end

	return result
end

function HeroDataHelper.getTalentAttr(heroUnitData, rank, notTalent)
	local result = {}

	if notTalent == true then
		return result
	end

	local heroBaseId = heroUnitData:getAvatarToHeroBaseId()
	local limitLevel = heroUnitData:getLimit_level()
	local limitRedLevel = heroUnitData:getLimit_rtg()
	if heroUnitData:isLeader() then
		limitLevel = heroUnitData:getLeaderLimitLevel()
		limitRedLevel = heroUnitData:getLeaderLimitRedLevel()
	end
	for i = 1, rank do
		local info = HeroDataHelper.getHeroRankConfig(heroBaseId, i, limitLevel, limitRedLevel)
		if info then
			local target = info.talent_target
			if target == 1 then --对自己
				for j = 1, 2 do
					local attrId = info["talent_attr_" .. j]
					local attrValue = info["talent_value_" .. j]
					AttrDataHelper.formatAttr(result, attrId, attrValue)
				end
			end
		end
	end

	if heroUnitData:isInBattle() then
		local heroIds = G_UserData:getTeam():getHeroIdsInBattle()
		for i, id in ipairs(heroIds) do
			local unit = G_UserData:getHero():getUnitDataWithId(id)
			local baseId = unit:getAvatarToHeroBaseId()
			local limitLevel = unit:getLimit_level()
			local limitRedLevel = unit:getLimit_rtg()
			if unit:isLeader() then
				limitLevel = unit:getLeaderLimitLevel()
				limitRedLevel = unit:getLeaderLimitRedLevel()
			end
			local rLv = unit:getRank_lv()
			for j = 1, rLv do
				local info = HeroDataHelper.getHeroRankConfig(baseId, j, limitLevel, limitRedLevel)
				if info then
					local tar = info.talent_target
					if tar == 2 then --对上阵武将
						for k = 1, 2 do
							local attrId = info["talent_attr_" .. k]
							local attrValue = info["talent_value_" .. k]
							AttrDataHelper.formatAttr(result, attrId, attrValue)
						end
					end
				end
			end
		end
	end

	return result
end

--光环类属性
function HeroDataHelper.getHaloAttr(heroUnitData, rank)
	local result = {}

	local heroBaseId = heroUnitData:getAvatarToHeroBaseId()
	local limitLevel = heroUnitData:getLeaderLimitLevel()
	local limitRedLevel = heroUnitData:getLeaderLimitRedLevel()
	for i = 1, rank do
		local info = HeroDataHelper.getHeroRankConfig(heroBaseId, i, limitLevel, limitRedLevel)
		if info then
			for k = 1, 2 do
				local haloTarget = info["halo_target_" .. k]
				if haloTarget == 1 then --对自己
					local attrId = info["halo_attr_" .. k]
					local attrValue = info["halo_value_" .. k]
					AttrDataHelper.formatAttr(result, attrId, attrValue)
				end
			end
		end
	end

	if heroUnitData:isInBattle() then
		local heroIds = G_UserData:getTeam():getHeroIdsInBattle()
		for i, id in ipairs(heroIds) do
			local unit = G_UserData:getHero():getUnitDataWithId(id)
			local baseId = unit:getAvatarToHeroBaseId()
			local limitLevel = unit:getLimit_level()
			local limitRedLevel = unit:getLimit_rtg()
			if unit:isLeader() then
				limitLevel = unit:getLeaderLimitLevel()
				limitRedLevel = unit:getLeaderLimitRedLevel()
			end
			local rLv = unit:getRank_lv()
			for j = 1, rLv do
				local info = HeroDataHelper.getHeroRankConfig(baseId, j, limitLevel, limitRedLevel)
				if info then
					for k = 1, 2 do
						local haloTarget = info["halo_target_" .. k]
						if haloTarget == 2 then --对上阵武将
							local attrId = info["halo_attr_" .. k]
							local attrValue = info["halo_value_" .. k]
							AttrDataHelper.formatAttr(result, attrId, attrValue)
						end
					end
				end
			end
		end
	end

	return result
end

--神兵天赋属性
function HeroDataHelper.getInstrumentTalentAttr(pos)
	local result = {}
	if pos == nil or pos == 0 then
		return result
	end

	local instrumentIds = G_UserData:getBattleResource():getInstrumentIdsWithPos(pos)
	for i, instrumentId in ipairs(instrumentIds) do
		local instrumentData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
		local templet = instrumentData:getAdvacneTemplateId()
		local level = instrumentData:getLevel()
		for j = 1, level do
			local info = require("app.config.instrument_level").get(j, templet)
			assert(info, string.format("instrument_level config can not find level = %d, templet = %d", j, templet))
			local target = info.talent_target
			if target == 1 then --对自己
				for k = 1, 2 do
					local attrId = info["talent_attr_" .. k]
					local attrValue = info["talent_value_" .. k]
					AttrDataHelper.formatAttr(result, attrId, attrValue)
				end
			end
		end

		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
		local heroBaseId = heroUnitData:getAvatarToHeroBaseId()
		local heroConfig = HeroDataHelper.getHeroConfig(heroBaseId)
		local instrumentBaseId = heroConfig.instrument_id
		local instrumentConfig = require("app.config.instrument").get(instrumentBaseId)
		if level >= instrumentConfig.unlock then
			local haloTarget = instrumentConfig.halo_target
			if haloTarget == 1 then
				local attrId = instrumentConfig.halo_attr
				local attrValue = instrumentConfig.halo_value
				AttrDataHelper.formatAttr(result, attrId, attrValue)
			end
		end
	end

	local heroIds = G_UserData:getTeam():getHeroIds()
	for i, id in ipairs(heroIds) do
		if id > 0 then
			local instrumentIds = G_UserData:getBattleResource():getInstrumentIdsWithPos(i)
			for j, instrumentId in ipairs(instrumentIds) do
				local instrumentData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
				local templet = instrumentData:getAdvacneTemplateId()
				local level = instrumentData:getLevel()
				for k = 1, level do
					local info = require("app.config.instrument_level").get(k, templet)
					assert(info, string.format("instrument_level config can not find level = %d, templet = %d", k, templet))
					local target = info.talent_target
					if target == 2 then --对其它人
						for m = 1, 2 do
							local attrId = info["talent_attr_" .. m]
							local attrValue = info["talent_value_" .. m]
							AttrDataHelper.formatAttr(result, attrId, attrValue)
						end
					end
				end

				local heroUnitData = G_UserData:getHero():getUnitDataWithId(id)
				local heroBaseId = heroUnitData:getAvatarToHeroBaseId()
				local heroConfig = HeroDataHelper.getHeroConfig(heroBaseId)
				local instrumentBaseId = heroConfig.instrument_id
				local instrumentConfig = require("app.config.instrument").get(instrumentBaseId)
				if level >= instrumentConfig.unlock then
					local haloTarget = instrumentConfig.halo_target
					if haloTarget == 2 then
						local attrId = instrumentConfig.halo_attr
						local attrValue = instrumentConfig.halo_value
						AttrDataHelper.formatAttr(result, attrId, attrValue)
					end
				end
			end
		end
	end

	return result
end

--获取总属性
--[[param = {
		heroUnitData, 武将数据
		addLevel, 增加强化的等级
		addRank, 增加突破的等级
		notTalent, 不计算天赋
		notAddPer, 不算属性加成（例如将攻击加成x%算入攻击值）
	}--]]
function HeroDataHelper.getTotalAttr(param)
	local result = HeroDataHelper.getTotalBaseAttr(param)
	AttrDataHelper.processDefAndAddition(result)

	return result
end

--获取总基础属性（没有额外处理防御和加成）
function HeroDataHelper.getTotalBaseAttr(param)
	local result = {}
	local heroUnitData = param.heroUnitData
	local tempLevel = param.addLevel or 0
	local tempRank = param.addRank or 0
	local level = heroUnitData:getLevel() + tempLevel
	local rank = heroUnitData:getRank_lv() + tempRank

	local attr1 = HeroDataHelper.getBasicAttrWithLevel(heroUnitData:getConfig(), level)
	local attr2 = HeroDataHelper.getBreakAttr(heroUnitData, tempRank)
	local attr3 = HeroDataHelper.getLimitAttr(heroUnitData)
	local attr4 = HeroDataHelper.getAwakeAttr(heroUnitData)
	local attr5 = HeroDataHelper.getEquipAttr(heroUnitData:getPos())
	local attr6 = HeroDataHelper.getTreasureAttr(heroUnitData:getPos())
	local attr7 = HeroDataHelper.getInstrumentAttr(heroUnitData:getPos())
	local attr8 = HeroDataHelper.getMasterAttr(heroUnitData:getPos())
	local attr9 = HeroDataHelper.getOfficialAttr(G_UserData:getBase():getOfficialLevel())
	local attr10 = HeroDataHelper.getKarmaAttrRatio(heroUnitData:getConfig())
	local attr11 = HeroDataHelper.getYokeAttrRatio(heroUnitData)
	local attr12 = HeroDataHelper.getTalentAttr(heroUnitData, rank, param.notTalent)
	local attr13 = HeroDataHelper.getInstrumentTalentAttr(heroUnitData:getPos())
	local attr14 = HeroDataHelper.getAwakeTalentAttr(heroUnitData)
	local attr15 = HeroDataHelper.getAvatarAttr(heroUnitData)
	local attr16 = HeroDataHelper.getAvatarShowAttr(heroUnitData)
	local attr17 = PetDataHelper.getPetHelpAttr(true)
	local attr18 = PetDataHelper.getPetMapAttr()
	local attr19 = HeroDataHelper.getSilkbagAttr(heroUnitData)
	local attr20 = HomelandHelp.getHomelandAttr() --神兽家园属性计算
	local attr21 = HeroDataHelper.getHaloAttr(heroUnitData, rank)
	local attr22 = HeroDataHelper.getHorseAttr(heroUnitData:getPos())
	local attr23 = HeroDataHelper.getHorsePhotoAttr()
	local attr24 = HeroDataHelper.getHistoryHeroAttr(heroUnitData:getPos())
    local attr25 = HeroDataHelper.getTacticsAttr(heroUnitData:getPos())
    local attr26 = HeroDataHelper.getBoutAttr(heroUnitData:getPos())

	-- dump(attr1, "____________________________________1")
	-- dump(attr2, "____________________________________2")
	-- dump(attr3, "____________________________________3")
	-- dump(attr4, "____________________________________4")
	-- dump(attr5, "____________________________________5")
	-- dump(attr6, "____________________________________6")
	-- dump(attr7, "____________________________________7")
	-- dump(attr8, "____________________________________8")
	-- dump(attr9, "____________________________________9")
	-- dump(attr10, "____________________________________10")
	-- dump(attr11, "____________________________________11")
	-- dump(attr12, "____________________________________12")
	-- dump(attr13, "____________________________________13")
	-- dump(attr14, "____________________________________14")
	-- dump(attr15, "____________________________________15")
	-- dump(attr16, "____________________________________16")
	-- dump(attr17, "____________________________________17")
	-- dump(attr18, "____________________________________18")
	-- dump(attr19, "____________________________________19")
	-- dump(attr20, "____________________________________20")

	AttrDataHelper.appendAttr(result, attr1)
	AttrDataHelper.appendAttr(result, attr2)
	AttrDataHelper.appendAttr(result, attr3)
	AttrDataHelper.appendAttr(result, attr4)
	AttrDataHelper.appendAttr(result, attr5)
	AttrDataHelper.appendAttr(result, attr6)
	AttrDataHelper.appendAttr(result, attr7)
	AttrDataHelper.appendAttr(result, attr8)
	AttrDataHelper.appendAttr(result, attr9)
	AttrDataHelper.appendAttr(result, attr10)
	AttrDataHelper.appendAttr(result, attr11)
	AttrDataHelper.appendAttr(result, attr12)
	AttrDataHelper.appendAttr(result, attr13)
	AttrDataHelper.appendAttr(result, attr14)
	AttrDataHelper.appendAttr(result, attr15)
	AttrDataHelper.appendAttr(result, attr16)
	AttrDataHelper.appendAttr(result, attr17)
	AttrDataHelper.appendAttr(result, attr18)
	AttrDataHelper.appendAttr(result, attr19)
	AttrDataHelper.appendAttr(result, attr20)
	AttrDataHelper.appendAttr(result, attr21)
	AttrDataHelper.appendAttr(result, attr22)
	AttrDataHelper.appendAttr(result, attr23)
	AttrDataHelper.appendAttr(result, attr24)
    AttrDataHelper.appendAttr(result, attr25)
    AttrDataHelper.appendAttr(result, attr26)
	return result
end

--获取援军位的信息
--[[return info =
			{
				lock, --是否锁住
				heroId, --武将唯一Id
				level, --开启等级
				comment, --等级不足时的飘字
			}
--]]
function HeroDataHelper.getPartnersInfo(secondHeroDatas)
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local info = {}
	for i = 1, 8 do
		local isOpen, des, levelInfo = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_REINFORCEMENTS_SLOT" .. i])
		local level = levelInfo.level
		local lock = not isOpen
		local heroData = secondHeroDatas[i]
		local comment = des
		table.insert(info, {lock = lock, heroData = heroData, level = level, comment = comment})
	end

	return info
end

--获取援军位的信息（查看玩家用）
function HeroDataHelper.getPartnersInfoByUserDetail(secondHeroDatas)
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local info = {}
	for i = 1, 8 do
		local lock = false --查看别人，都认为没锁
		local heroData = secondHeroDatas[i]
		table.insert(info, {lock = lock, heroData = heroData})
	end

	return info
end

--获取当前阵容已经激活的羁绊总数
function HeroDataHelper.getActivatedYokeTotalCount(heroDatas)
	local totalCount = 0
	for i, data in ipairs(heroDatas) do
		local count = data:getActivedYokeCount()
		totalCount = totalCount + count
	end
	return totalCount
end

--获取当前阵容的羁绊总览信息
function HeroDataHelper.getYokeOverviewInfo(heroDatas)
	local info = {}
	for i, data in ipairs(heroDatas) do
		if i ~= 1 then --主角的信息不显示
			local baseId = data:getBase_id()
			local activatedCount = data:getActivedYokeCount()
			local totalCount = data:getYokeTotalCount()
			local limitLevel = data:getLimit_level()
			local limitRedLevel = data:getLimit_rtg()
			table.insert(
				info,
				{baseId = baseId, activatedCount = activatedCount, totalCount = totalCount, limitLevel = limitLevel, limitRedLevel=limitRedLevel}
			)
		end
	end

	return info
end

--获取当前阵容的羁绊详细信息
function HeroDataHelper.getYokeDetailInfo(heroDatas)
	local info = {}
	for i, data in ipairs(heroDatas) do
		local heroYoke = HeroDataHelper.getHeroYokeInfo(data)
		if heroYoke then
			table.insert(info, heroYoke)
		end
	end
	return info
end

function HeroDataHelper.getHeroYokeInfo(heroUnitData)
	local function sortFun(a, b)
		local activeA = a.isActivated and 1 or 0
		local activeB = b.isActivated and 1 or 0
		if activeA ~= activeB then
			return activeA > activeB
		else
			return a.id < b.id
		end
	end

	local heroConfig = heroUnitData:getConfig()
	local heroBaseId = heroUnitData:getBase_id()
	local yokeInfo = {}
	for i = 1, HeroConst.HERO_YOKE_MAX do
		local fateId = heroConfig["fate_" .. i]
		if fateId > 0 and HeroDataHelper.isYokeShow(fateId, heroUnitData) then
			local yokeUnit = HeroDataHelper.getYokeUnitInfoWithId(fateId, heroUnitData)
			table.insert(yokeInfo, yokeUnit)
		end
	end

	table.sort(yokeInfo, sortFun)

	local heroYoke = nil
	if #yokeInfo > 0 then
		heroYoke = {
			heroBaseId = heroBaseId,
			yokeInfo = yokeInfo
		}
	end
	return heroYoke
end
-- 判断羁绊是否显示，装备上则必显示，否则只有level达到才显示
function HeroDataHelper.isYokeShow(fateId, heroUnitData)
	local isActivated = heroUnitData:isUserHero() and heroUnitData:isActivatedYoke(fateId)
	if isActivated then
		return true
	end
	local fateConfig = HeroDataHelper.getHeroYokeConfig(fateId)
	local level = fateConfig.level or 0
	local gameUserLevel = G_UserData:getBase():getLevel()
	if gameUserLevel>=level then
		return true
	end
	return false
end

--根据羁绊Id获取单个羁绊信息
function HeroDataHelper.getYokeUnitInfoWithId(fateId, heroUnitData)
	local fateConfig = HeroDataHelper.getHeroYokeConfig(fateId)

	local isActivated = heroUnitData:isUserHero() and heroUnitData:isActivatedYoke(fateId)

	local name = fateConfig.fate_name
	local heroIds = {}
	local majorHeroId = fateConfig.hero_id
	if majorHeroId > 0 then
		table.insert(heroIds, majorHeroId)
	end
	for i = 1, 4 do
		local heroId = fateConfig["hero_id_" .. i]
		if heroId > 0 then
			table.insert(heroIds, heroId)
		end
	end
	local attrInfo = {}
	for i = 1, 2 do
		local attrId = fateConfig["talent_attr_" .. i]
		if attrId > 0 then
			local attrValue = fateConfig["talent_value_" .. i]
			local info = {attrId = attrId, attrValue = attrValue}
			table.insert(attrInfo, info)
		end
	end

	local result = {
		id = fateId,
		isActivated = isActivated,
		isShowColor = heroUnitData:isUserHero(),
		name = name,
		fateType = fateConfig.fate_type,
		heroIds = heroIds,
		attrInfo = attrInfo
	}

	return result
end

--根据武将BaseId获取该武将上阵后可激活羁绊的数量
--beReplacedId，被替换的武将baseId，
--willInReinforcement, 将要进入援军位
--notCheckReinforcement，不检查援军位
--此处逻辑有些混乱。。后续优化
function HeroDataHelper.getWillActivateYokeCount(baseId, beReplacedId, willInReinforcement, notCheckReinforcement)
	local count = 0
	local info = {}

	if G_UserData:getTeam():isInBattleWithBaseId(baseId) then
		return count, info
	end

	if not notCheckReinforcement then --如果该武将已经在援军位上了
		local isIn = G_UserData:getTeam():isInReinforcementsWithBaseId(baseId)
		if isIn then
			return count, info
		end
	end

	local heroFateMap = G_UserData:getHero():getHeroFateMap()
	local fateIds = heroFateMap[baseId]
	if fateIds then
		for i, fateId in ipairs(fateIds) do
			local fateConfig = HeroDataHelper.getHeroYokeConfig(fateId)
			local heroId = fateConfig.hero_id
			local isCal = false --是否符合计算的条件
			if willInReinforcement == true then
				isCal = G_UserData:getTeam():isInBattleWithBaseId(heroId)
			else
				isCal = G_UserData:getTeam():isInBattleWithBaseId(heroId) or baseId == heroId
			end
			if isCal then --只计算阵容中武将的羁绊
				local ids = {}
				if heroId > 0 then
					table.insert(ids, heroId)
				end
				for j = 1, 4 do
					local id = fateConfig["hero_id_" .. j]
					if id > 0 then
						table.insert(ids, id)
					end
				end

				local isOk = true
				for j, id in ipairs(ids) do
					local isIn =
						(id ~= beReplacedId) and
						(G_UserData:getTeam():isInBattleWithBaseId(id) or G_UserData:getTeam():isInReinforcementsWithBaseId(id) or
							id == baseId)
					isOk = isOk and isIn
				end

				if isOk then
					count = count + 1
					local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId)
					table.insert(info, {heroParam = heroParam, yokeName = fateConfig.fate_name, fateId = fateId})
				end
			end
		end
	end

	return count, info
end

----------------------------------------------武将回收部分---------------------------------------------------------------------
--折算武将经验为杜康酒
function HeroDataHelper.convertHeroExp(expCount)
	local itemExp1 = require("app.config.item").get(DataConst.ITEM_HERO_LEVELUP_MATERIAL_1).item_value
	local itemExp2 = require("app.config.item").get(DataConst.ITEM_HERO_LEVELUP_MATERIAL_2).item_value
	local itemExp3 = require("app.config.item").get(DataConst.ITEM_HERO_LEVELUP_MATERIAL_3).item_value
	local itemExp4 = require("app.config.item").get(DataConst.ITEM_HERO_LEVELUP_MATERIAL_4).item_value

	local expItem = {
		count1 = 0,
		count2 = 0,
		count3 = 0,
		count4 = 0
	}

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
				DataConst["ITEM_HERO_LEVELUP_MATERIAL_" .. i],
				expItem["count" .. i]
			)
		end
	end

	return result
end

--获取武将升级的总消耗
function HeroDataHelper.getAllLevelUpCost(unitData)
	local expCount = unitData:getExp() --经验
	local result = HeroDataHelper.convertHeroExp(expCount)

	return result
end

-- 是否为纯红将
function HeroDataHelper.isPureHeroRed(heroUnitData)
    local isColor = heroUnitData:getConfig().color == 6
    local isLeader = heroUnitData:isLeader()
    return isColor and not isLeader and heroUnitData:getLimit_level() == 0
end

--获取武将突破的总消耗
function HeroDataHelper.getAllBreakCost(unitData)
	local HeroGoldHelper = require("app.scene.view.heroGoldTrain.HeroGoldHelper")
	if HeroGoldHelper.isPureHeroGold(unitData) then
		return HeroDataHelper.getGoldBreakCost(unitData)
	else
		return HeroDataHelper.getNormalBreakCost(unitData)
	end
end

function HeroDataHelper.getGoldBreakCost(unitData)
	local result = {}
	local rank = unitData:getRank_lv()
	local HeroGoldHelper = require("app.scene.view.heroGoldTrain.HeroGoldHelper")
	for i = 0, rank - 1 do
		local costConfig = HeroGoldHelper.getCostConfig(i)
		local cardNum = costConfig.cost_hero
		if cardNum > 0 then
			local heroBaseId = unitData:getBase_id()
			RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_HERO, heroBaseId, cardNum)
		end
		local breakSize = costConfig.break_size
		if breakSize > 0 then
			RecoveryDataHelper.formatRecoveryCost(result, costConfig.break_type, costConfig.break_value, breakSize)
		end
		local exp = costConfig.size_2
		local expRes = HeroDataHelper.convertHeroExp(exp)
		RecoveryDataHelper.mergeRecoveryCost(result, expRes)
		for j = 3, 4 do
			local size = costConfig["size_" .. j]
			if size > 0 then
				local type = costConfig["type_" .. j]
				local value = costConfig["value_" .. j]
				RecoveryDataHelper.formatRecoveryCost(result, type, value, size)
			end
		end
	end
	local gold_res = unitData:getGold_res()
	for _, res in pairs(gold_res) do
		if res.Key == 1 then -- 同名卡
			if res.Value > 0 then
				local heroBaseId = unitData:getBase_id()
				RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_HERO, heroBaseId, res.Value)
			end
		elseif res.Key == 2 then -- 杜康
			if res.Value then
				local exp = res.Value
				local expRes = HeroDataHelper.convertHeroExp(exp)
				RecoveryDataHelper.mergeRecoveryCost(result, expRes)
			end
		else
			if res.Value > 0 then
				local costConfig = HeroGoldHelper.getCostConfig(rank)
				RecoveryDataHelper.formatRecoveryCost(
					result,
					costConfig["type_" .. res.Key],
					costConfig["value_" .. res.Key],
					res.Value
				)
			end
		end
	end
	return result
end

function HeroDataHelper.getNormalBreakCost(unitData)
	local result = {}
	local rank = unitData:getRank_lv()
	local rTemplet = unitData:getConfig().rank_cost
	for i = 0, rank - 1 do
		local rankInfo = HeroDataHelper.getHeroRankCostConfig(i, rTemplet)
		local cardNum = rankInfo.card
		if cardNum > 0 then
			local heroBaseId = unitData:getBase_id()
			RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_HERO, heroBaseId, cardNum)
		end
		for j = 1, 2 do
			local size = rankInfo["size_" .. j]
			if size > 0 then
				local type = rankInfo["type_" .. j]
				local value = rankInfo["value_" .. j]
				RecoveryDataHelper.formatRecoveryCost(result, type, value, size)
			end
		end
	end

	return result
end

--获取武将觉醒的总消耗
function HeroDataHelper.getAllAwakeCost(unitData)
	local result = {}
	local info = unitData:getAwaken_slots()
	for i, itemId in ipairs(info) do
		if itemId > 0 then
			RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_GEMSTONE, itemId, 1)
		end
	end

	local awakeLevel = unitData:getAwaken_level()
	local awakeCost = unitData:getConfig().awaken_cost
	for i = 0, awakeLevel - 1 do
		local awakeInfo = HeroDataHelper.getHeroAwakenConfig(i, awakeCost)

		--同名卡
		local cardNum = awakeInfo.card
		if cardNum > 0 then
			local heroBaseId = unitData:getBase_id()
			RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_HERO, heroBaseId, cardNum)
		end
		--材料
		if awakeInfo.stuff_size > 0 then
			RecoveryDataHelper.formatRecoveryCost(result, awakeInfo.stuff_type, awakeInfo.stuff_value, awakeInfo.stuff_size)
		end
		--花费
		if awakeInfo.cost_size > 0 then
			RecoveryDataHelper.formatRecoveryCost(result, awakeInfo.cost_type, awakeInfo.cost_value, awakeInfo.cost_size)
		end
		--宝石
		for j = 1, 4 do
			local stoneValue = awakeInfo["gemstone_value" .. j]
			if stoneValue > 0 then
				RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_GEMSTONE, stoneValue, 1)
			end
		end
	end

	return result
end

--获取武将回收预览信息
function HeroDataHelper.getHeroRecoveryPreviewInfo(heroDatas)
	local result = {}
	local info = {}
	local expCount = 0
	for k, unitData in pairs(heroDatas) do
		local exp1 = unitData:getExp()
		local cost2 = HeroDataHelper.getAllBreakCost(unitData)
		local cost3 = HeroDataHelper.getAllAwakeCost(unitData)
		local cost4, exp2 = HeroDataHelper.getAllLimitCost(unitData)
		expCount = expCount + exp1 + exp2

		local heroBaseId = unitData:getBase_id()
		RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_HERO, heroBaseId, 1) --本卡
		RecoveryDataHelper.mergeRecoveryCost(info, cost2)
		RecoveryDataHelper.mergeRecoveryCost(info, cost3)
		RecoveryDataHelper.mergeRecoveryCost(info, cost4)
	end
	local costExp = HeroDataHelper.convertHeroExp(expCount) --先算经验值总和，再转化为酒
	RecoveryDataHelper.mergeRecoveryCost(info, costExp)

	--将同名卡转化为代币
	local currency = {}
	for type, unit in pairs(info) do
		if type == TypeConvertHelper.TYPE_HERO then
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

--获取武将重生预览信息
function HeroDataHelper.getHeroRebornPreviewInfo(data)
	local result = {}
	local info = {}

	local exp1 = data:getExp()
	local cost2 = HeroDataHelper.getAllBreakCost(data)
	local cost3 = HeroDataHelper.getAllAwakeCost(data)
	local cost4, exp2 = HeroDataHelper.getAllLimitCost(data)

	local heroBaseId = data:getBase_id()
	RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_HERO, heroBaseId, 1) --本卡
	RecoveryDataHelper.mergeRecoveryCost(info, cost2)
	RecoveryDataHelper.mergeRecoveryCost(info, cost3)
	RecoveryDataHelper.mergeRecoveryCost(info, cost4)

	local expCount = exp1 + exp2
	local costExp = HeroDataHelper.convertHeroExp(expCount) --先算经验值总和，再转化为酒
	RecoveryDataHelper.mergeRecoveryCost(info, costExp)

	--将同名卡转化为碎片
	local fragments = {}
	for type, unit in pairs(info) do
		if type == TypeConvertHelper.TYPE_HERO then
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

--==================================================================================================

--计算战力（属性部分）
function HeroDataHelper.getHeroPowerAttr(param)
	local result = HeroDataHelper.getHeroPowerBaseAttr(param)
	AttrDataHelper.processDefAndAddition(result)

	return result
end

function HeroDataHelper.getHeroPowerBaseAttr(param)
	local result = {}

	local heroUnitData = param.heroUnitData
	local tempLevel = param.addLevel or 0
	local tempRank = param.addRank or 0
	local level = heroUnitData:getLevel() + tempLevel
	local rank = heroUnitData:getRank_lv() + tempRank

	local attr1 = HeroDataHelper.getBasicAttrWithLevel(heroUnitData:getConfig(), level)
	local attr2 = HeroDataHelper.getBreakAttr(heroUnitData, tempRank)
	local attr3 = HeroDataHelper.getLimitAttr(heroUnitData)
	local attr4 = HeroDataHelper.getAwakeAttr(heroUnitData)
	local attr5 = HeroDataHelper.getEquipAttr(heroUnitData:getPos(), true)
	local attr6 = HeroDataHelper.getTreasureAttr(heroUnitData:getPos(), true)
	local attr7 = HeroDataHelper.getInstrumentAttr(heroUnitData:getPos())
	local attr8 = HeroDataHelper.getMasterAttr(heroUnitData:getPos())
	local attr9 = HeroDataHelper.getKarmaAttrRatio(heroUnitData:getConfig())
	local attr10 = HeroDataHelper.getYokeAttrRatio(heroUnitData)
	local attr11 = HeroDataHelper.getOfficialPower(G_UserData:getBase():getOfficialLevel())
	local attr12 = HeroDataHelper.getTalentPower(heroUnitData, tempRank)
	local attr13 = HeroDataHelper.getInstrumentTalentAttr(heroUnitData:getPos())
	local attr14 = HeroDataHelper.getAwakeTalentAttr(heroUnitData)
	local attr15 = HeroDataHelper.getAvatarPower(heroUnitData)
	local attr16 = HeroDataHelper.getAvatarShowPower(heroUnitData)
	local attr17 = PetDataHelper.getPetHelpAttr(true)
	local attr18 = PetDataHelper.getPetMapPower()
	local attr19 = HeroDataHelper.getSilkbagPower(heroUnitData)
	local attr20 = HeroDataHelper.getHomelandPower()
	local attr21 = HeroDataHelper.getHaloAttr(heroUnitData, rank)
	local attr22 = HeroDataHelper.getHorsePower(heroUnitData:getPos())
	local attr23 = HeroDataHelper.getHorsePhotoPower()
	local attr24 = HeroDataHelper.getHistoryHeroPower(heroUnitData:getPos())
    local attr25 = HeroDataHelper.getTacticsPower(heroUnitData:getPos())
    local attr26 = HeroDataHelper.getBoutPower(heroUnitData:getPos())

	AttrDataHelper.appendAttr(result, attr1)
	AttrDataHelper.appendAttr(result, attr2)
	AttrDataHelper.appendAttr(result, attr3)
	AttrDataHelper.appendAttr(result, attr4)
	AttrDataHelper.appendAttr(result, attr5)
	AttrDataHelper.appendAttr(result, attr6)
	AttrDataHelper.appendAttr(result, attr7)
	AttrDataHelper.appendAttr(result, attr8)
	AttrDataHelper.appendAttr(result, attr9)
	AttrDataHelper.appendAttr(result, attr10)
	AttrDataHelper.appendAttr(result, attr11)
	AttrDataHelper.appendAttr(result, attr12)
	AttrDataHelper.appendAttr(result, attr13)
	AttrDataHelper.appendAttr(result, attr14)
	AttrDataHelper.appendAttr(result, attr15)
	AttrDataHelper.appendAttr(result, attr16)
	AttrDataHelper.appendAttr(result, attr17)
	AttrDataHelper.appendAttr(result, attr18)
	AttrDataHelper.appendAttr(result, attr19)
	AttrDataHelper.appendAttr(result, attr20)
	AttrDataHelper.appendAttr(result, attr21)
	AttrDataHelper.appendAttr(result, attr22)
	AttrDataHelper.appendAttr(result, attr23)
	AttrDataHelper.appendAttr(result, attr24)
    AttrDataHelper.appendAttr(result, attr25)
    AttrDataHelper.appendAttr(result, attr26)

	return result
end

--判断是否有空阵位(开启，但没上武将)
function HeroDataHelper.isHaveEmptyPos()
	for i = 1, 6 do
		local state = G_UserData:getTeam():getStateWithPos(i)
		if state == TeamConst.STATE_OPEN then
			return true
		end
	end
	return false
end

--判断是否有空援军位
function HeroDataHelper.isHaveEmptyReinforcementPos()
	local secondHeroDatas = G_UserData:getTeam():getHeroDataInReinforcements()
	local info = HeroDataHelper.getPartnersInfo(secondHeroDatas)
	for i, one in ipairs(info) do
		if not one.lock and one.heroData == nil then
			return true
		end
	end
	return false
end

--判断是否要提示武将升级
function HeroDataHelper.isPromptHeroUpgrade(heroUnitData)
	local userLevel = G_UserData:getBase():getLevel()
	local roleInfo = require("app.config.role").get(userLevel)
	assert(roleInfo, string.format("role config can not find level = %d", userLevel))

	local recommendLevel = roleInfo.recommend_hero_lv
	local level = heroUnitData:getLevel()
	if level >= recommendLevel then --已经达到了推荐等级
		return false
	end

	--判断材料
	local itemExp = 0
	for i = 1, 4 do
		local itemId = DataConst["ITEM_HERO_LEVELUP_MATERIAL_" .. i]
		local count = require("app.utils.UserDataHelper").getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemId)
		local itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId)
		local exp = itemParam.cfg.item_value
		itemExp = itemExp + (exp * count)
	end
	local totalExp = heroUnitData:getExp() + itemExp
	local heroConfig = heroUnitData:getConfig()
	local templet = heroConfig.lvup_cost
	local needExp = HeroDataHelper.getHeroNeedExpWithLevel(templet, level + 1)
	if totalExp < needExp then --不够升级的不提示红点
		return false
	end

	return true
end

--判断是否要提示武将突破
function HeroDataHelper.isPromptHeroBreak(heroUnitData)
	local rankLevel = heroUnitData:getRank_lv()
	local rankMax = heroUnitData:getConfig().rank_max

	if rankLevel >= rankMax then
		return false
	end

	local costInfo = HeroDataHelper.getHeroBreakMaterials(heroUnitData)
	for i, info in ipairs(costInfo) do
		if info.type == TypeConvertHelper.TYPE_HERO then --同名卡
			local sameCardNum = #G_UserData:getHero():getSameCardCountWithBaseId(heroUnitData:getBase_id())
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

	local needLevel = HeroDataHelper.getHeroBreakLimitLevel(heroUnitData)
	local myLevel = heroUnitData:getLevel()
	if myLevel < needLevel then --等级检测
		return false
	end

	return true
end

--判断是否要提示武将觉醒
function HeroDataHelper.isPromptHeroAwake(heroUnitData)
	local isCanAwake = heroUnitData:isCanAwake()
	if not isCanAwake then
		return false
	end
	local enoughLevel = require("app.scene.view.heroTrain.HeroTrainHelper").checkAwakeIsEnoughLevel(heroUnitData)
	if not enoughLevel then
		return false
	end

	local isCanEquip = HeroDataHelper.isCanHeroAwakeEquip(heroUnitData)
	local isCanAwake = HeroDataHelper.isCanHeroAwake(heroUnitData)
	return isCanEquip or isCanAwake
end

--判断是否要提示武将界限突破
function HeroDataHelper.isPromptHeroLimit(heroUnitData)
	local isAllFull = true
	for key = HeroConst.HERO_LIMIT_COST_KEY_1, HeroConst.HERO_LIMIT_COST_KEY_6 do
		local isOk, isFull = HeroDataHelper.isPromptHeroLimitWithCostKey(heroUnitData, key)
		isAllFull = isAllFull and isFull
		if isOk then
			return true
		end
	end
	if isAllFull then
		local limitDataType = HeroDataHelper.getLimitDataType(heroUnitData)
		local lv
		if limitDataType==HeroConst.HERO_LIMIT_TYPE_RED then
			lv = heroUnitData:getLimit_level()
		else
			lv = heroUnitData:getLimit_rtg()
		end

		local info = HeroDataHelper.getHeroLimitCostConfig(lv, limitDataType)
		local isOk = require("app.utils.LogicCheckHelper").enoughMoney(info.break_size)
		if isOk then
			return true
		end
	end

	return false
end

--判断是否要提示武将界限红点（某个材料）
function HeroDataHelper.isPromptHeroLimitWithCostKey(heroUnitData, key)
	local isCanLimitBreak, limitType = heroUnitData:isCanLimitBreak()
	if not isCanLimitBreak then
		return false
	end

	if heroUnitData:isDidLimitToGold() then
		return false
	end
	if limitType==0 and heroUnitData:isDidLimitToRed() then
		return false
	end

	local isReach = HeroDataHelper.isReachLimitRank(heroUnitData)
	if not isReach then
		return false
	end

	local limitDataType = HeroDataHelper.getLimitDataType(heroUnitData)
	local lv
	if limitDataType==HeroConst.HERO_LIMIT_TYPE_RED then
		lv = heroUnitData:getLimit_level()
	else
		lv = heroUnitData:getLimit_rtg()
	end

	local info = HeroDataHelper.getHeroLimitCostConfig(lv, limitDataType)
	local curCount = heroUnitData:getLimitCostCountWithKey(key, limitDataType)
	local configKey = HeroDataHelper.getLimitCostConfigKey(key)

	local maxSize = info[configKey.size]

	local isFull = curCount >= maxSize
	if not isFull then
		if key == HeroConst.HERO_LIMIT_COST_KEY_1 then
			local ownExp = curCount
			for j = 1, 4 do
				local count =
					require("app.utils.UserDataHelper").getNumByTypeAndValue(
					TypeConvertHelper.TYPE_ITEM,
					DataConst["ITEM_HERO_LEVELUP_MATERIAL_" .. j]
				)
				local itemValue = require("app.config.item").get(DataConst["ITEM_HERO_LEVELUP_MATERIAL_" .. j]).item_value
				local itemExp = count * itemValue
				ownExp = ownExp + itemExp
				if ownExp >= maxSize then
					return true, isFull
				end
			end
		else
			local type, value = info[configKey.type], info[configKey.value]
			if type==99 then
				local baseId = heroUnitData:getBase_id()
				local count = curCount
				if value==1 then
					count = count + require("app.utils.UserDataHelper").getSameCardCount(TypeConvertHelper.TYPE_HERO, baseId)
				else
					local list = HeroDataHelper.getSameCountryHeroes(baseId, 7) 	-- 同阵营金将
					for i,v in ipairs(list) do
						count = count + require("app.utils.UserDataHelper").getSameCardCount(TypeConvertHelper.TYPE_HERO, v)
					end
				end
				if count >= maxSize then
					return true, isFull
				end
			else
				local count =
					require("app.utils.UserDataHelper").getSameCardCount(type, value) + curCount
				if count >= maxSize then
					return true, isFull
				end
			end
		end
	end
	return false, isFull
end

--判断是否可装备\合成觉醒道具
function HeroDataHelper.isCanHeroAwakeEquip(heroUnitData)
	local GemstoneConst = require("app.const.GemstoneConst")
	local info = HeroDataHelper.getHeroAwakeEquipState(heroUnitData)
	for i = 1, 4 do
		local state = info[i].state
		if state == GemstoneConst.EQUIP_STATE_1 or state == GemstoneConst.EQUIP_STATE_3 then
			return true
		end
	end
	return false
end

--判断是否满足了觉醒条件
function HeroDataHelper.isCanHeroAwake(heroUnitData)
	local GemstoneConst = require("app.const.GemstoneConst")
	local info = HeroDataHelper.getHeroAwakeEquipState(heroUnitData)
	for i = 1, 4 do
		local state = info[i].state
		if state ~= GemstoneConst.EQUIP_STATE_2 then
			return false
		end
	end

	local info = HeroDataHelper.getHeroAwakeMaterials(heroUnitData)
	for i, data in ipairs(info) do
		local myCount = require("app.utils.UserDataHelper").getSameCardCount(data.type, data.value)
		local needCount = data.size
		if myCount < needCount then
			return false
		end
	end

	--检查花费
	local costInfo = HeroDataHelper.getHeroAwakeCost(heroUnitData)
	local isOk = require("app.utils.LogicCheckHelper").enoughMoney(costInfo.size)
	if not isOk then
		return false
	end

	return true
end

--获取武将列表上限
function HeroDataHelper.getHeroListLimitCount()
	local level = G_UserData:getBase():getLevel()
	local info = require("app.config.role").get(level)
	assert(info, string.format("role config can not find level = %d", level))

	return info.hero_limit
end

------------------------------------觉醒部分------------------------------
--获取武将觉醒配置表信息
function HeroDataHelper.getHeroAwakeConfigInfo(heroUnitData, addLevel)
	local tempLevel = addLevel or 0
	local maxLevel = heroUnitData:getConfig().awaken_max
	local awakeLevel = heroUnitData:getAwaken_level() + tempLevel
	if awakeLevel > maxLevel then
		return nil --达到了最大等级
	end
	local awakeCost = heroUnitData:getConfig().awaken_cost
	local info = HeroDataHelper.getHeroAwakenConfig(awakeLevel, awakeCost)

	return info
end

--转化武将觉醒等级为x星x级
function HeroDataHelper.convertAwakeLevel(awakeLevel)
	local star = math.floor(awakeLevel / 10) --10级升1星
	local level = awakeLevel % 10
	return star, level
end

--根据当前觉醒等级找下一个激活天赋的等级
function HeroDataHelper.findNextAwakeLevel(level, awakenCost, maxLevel)
	local nextLevel = nil
	local attrInfo = {}
	local des = ""

	for i = level + 1, maxLevel do
		local info = HeroDataHelper.getHeroAwakenConfig(i, awakenCost)

		local isHave = info["talent_attribute_type1"] > 0
		if isHave then
			nextLevel = i
			des = info["talent_description"]
			for j = 1, 4 do
				local attrType = info["talent_attribute_type" .. j]
				if attrType > 0 then
					local attrValue = info["talent_attribute_value" .. j]
					attrInfo[attrType] = attrValue
				end
			end
			break
		end
	end

	return nextLevel, attrInfo, des
end

--获取武将觉醒装备栏状态
function HeroDataHelper.getHeroAwakeEquipState(heroUnitData)
	local result = {}

	local GemstoneConst = require("app.const.GemstoneConst")
	local gemstones = heroUnitData:getAwaken_slots()
	local info = HeroDataHelper.getHeroAwakeConfigInfo(heroUnitData)
	local enoughLevel = require("app.scene.view.heroTrain.HeroTrainHelper").checkAwakeIsEnoughLevel(heroUnitData)
	local isCanAwake = heroUnitData:isCanAwake()
	for i = 1, 4 do
		result[i] = {}
		if enoughLevel and isCanAwake then
			local needId = info["gemstone_value" .. i]
			if needId > 0 then --有需要的宝石
				result[i].needId = needId
				local stoneId = gemstones[i]
				if stoneId > 0 then
					result[i].state = GemstoneConst.EQUIP_STATE_2 --已装备
				else
					local unitData = G_UserData:getGemstone():getUnitDataWithId(needId)
					if unitData then
						result[i].state = GemstoneConst.EQUIP_STATE_1 --可装备
					else
						local gemstoneConfig = require("app.config.gemstone").get(needId)
						assert(gemstoneConfig, string.format("gemstone config can not find id = %d", needId))
						local fragmentId = gemstoneConfig.fragment_id
						if fragmentId > 0 and require("app.utils.UserDataHelper").isFragmentCanMerage(fragmentId) then
							result[i].state = GemstoneConst.EQUIP_STATE_3 --可合成
						else
							result[i].state = GemstoneConst.EQUIP_STATE_4 --无道具
						end
					end
				end
			else
				result[i].state = GemstoneConst.EQUIP_STATE_5 --上锁
			end
		else
			result[i].state = GemstoneConst.EQUIP_STATE_5 --上锁
		end
	end
	return result
end

--获取武将觉醒等级属性
function HeroDataHelper.getHeroAwakeLevelAttr(awakeLevel, awakeCost)
	local result = {}
	for i = 0, awakeLevel do
		local info = HeroDataHelper.getHeroAwakenConfig(i, awakeCost)
		for j = 1, 4 do
			local attrType = info["attribute_type" .. j]
			local attrValue = info["attribute_value" .. j]
			AttrDataHelper.formatAttr(result, attrType, attrValue)
		end
	end

	return result
end

--获取武将觉醒装备属性
function HeroDataHelper.getHeroAwakeEquipAttr(awakeLevel, awakeCost)
	local result = {}
	for i = 0, awakeLevel do
		local info = HeroDataHelper.getHeroAwakenConfig(i, awakeCost)
		for j = 1, 4 do
			local itemId = info["gemstone_value" .. j]
			if itemId > 0 then
				local attr = HeroDataHelper.getGemstoneAttr(itemId)
				AttrDataHelper.appendAttr(result, attr)
			end
		end
	end

	return result
end

--获取宝石属性
function HeroDataHelper.getGemstoneAttr(itemId)
	local result = {}
	local gemstoneInfo = require("app.config.gemstone").get(itemId)
	assert(gemstoneInfo, string.format("gemstone config can not find id = %d", itemId))
	for k = 1, 4 do
		local attrType = gemstoneInfo["attribute_type" .. k]
		local attrValue = gemstoneInfo["attribute_value" .. k]
		AttrDataHelper.formatAttr(result, attrType, attrValue)
	end
	return result
end

--获取武将当前装备上的宝石所带的属性
function HeroDataHelper.getHeroAwakeCurGemstoneAttr(heroUnitData)
	local result = {}
	local info = heroUnitData:getAwaken_slots()
	for i, itemId in ipairs(info) do
		if itemId > 0 then
			local attr = HeroDataHelper.getGemstoneAttr(itemId)
			AttrDataHelper.appendAttr(result, attr)
		end
	end

	return result
end

--获取武将觉醒材料
function HeroDataHelper.getHeroAwakeMaterials(heroUnitData)
	local result = {}

	local info = HeroDataHelper.getHeroAwakeConfigInfo(heroUnitData)

	local card = info["card"]
	if card > 0 then
		local cardType = TypeConvertHelper.TYPE_HERO
		local cardValue = heroUnitData:getBase_id()
		table.insert(result, {type = cardType, value = cardValue, size = card})
	end

	local stuffType = info["stuff_type"]
	if stuffType > 0 then
		local stuffValue = info["stuff_value"]
		local stuffSize = info["stuff_size"]
		table.insert(result, {type = stuffType, value = stuffValue, size = stuffSize})
	end

	return result
end

--获取武将觉醒花费
function HeroDataHelper.getHeroAwakeCost(heroUnitData)
	local result = nil

	local info = HeroDataHelper.getHeroAwakeConfigInfo(heroUnitData)
	local costType = info["cost_type"]
	if costType > 0 then
		local costValue = info["cost_value"]
		local costSize = info["cost_size"]
		result = {type = costType, value = costValue, size = costSize}
	end

	return result
end

--获取武将觉醒限制等级
function HeroDataHelper.getHeroAwakeLimitLevel(heroUnitData)
	local info = HeroDataHelper.getHeroAwakeConfigInfo(heroUnitData, 1) or {}
	local limitLevel = info.level
	return limitLevel
end

--获取觉醒天赋的描述信息
function HeroDataHelper.getHeroAwakeTalentDesInfo(heroUnitData)
	local awakeLevel = heroUnitData:getAwaken_level()
	local awakeCost = heroUnitData:getConfig().awaken_cost
	local awakeMax = heroUnitData:getConfig().awaken_max

	local result = {}

	for i = 0, awakeMax do
		local info = HeroDataHelper.getHeroAwakenConfig(i, awakeCost)

		local isHave = info["talent_attribute_type1"] > 0
		if isHave then
			local des = info["detail_description"]
			local isActive = (awakeLevel >= i)
			local temp = {des = des, isActive = isActive}
			table.insert(result, temp)
		end
	end

	return result
end

--置换目标武将排序列表
function HeroDataHelper.getHeroTransformTarList(filterIds, tempData)
	local sortFun = function(a, b)
		local yokeCountA = a:getWillActivateYokeCount()
		local yokeCountB = b:getWillActivateYokeCount()
		if yokeCountA ~= yokeCountB then
			return yokeCountA > yokeCountB
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getRank_lv() ~= b:getRank_lv() then
			return a:getRank_lv() > b:getRank_lv()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	local isInFilter = function(unit)
		for i, filterId in ipairs(filterIds) do
			if filterId == unit:getBase_id() then
				return true
			end
		end
		return false
	end

	--检查界限突破的条件，如果待置换的武将是已经界限培养过的，则目标武将只能是开放界限突破的武将
	local checkLimitCondition = function(isDidLimit, isDidLimitRed, unit)
		if isDidLimit == false and isDidLimitRed == false then
			return true
		else
			if isDidLimitRed and unit:isCanLimitBreakRed() then
				return true
			elseif isDidLimit and unit:isCanLimitBreakOrange() then
				return true
			else
				return false
			end
		end
	end

	local result = {}
	local filterColor = tempData.color
	local isDidLimit = tempData.isDidLimit --是否培养过界限突破
	local isDidLimitRed = tempData.isDidLimitRed -- 是否培养过红升金界限突破
	local HeroConfig = require("app.config.hero")
	local len = HeroConfig.length()
	for i = 1, len do
		local info = HeroConfig.indexOf(i)
		local data = clone(tempData)
		data.baseId = info.id
		local unit = G_UserData:getHero():createTempHeroUnitData(data)
		local isTar = unit:isCanBeTranformTar() --是否能成为目标者
		local country = unit:getConfig().country
		local color = unit:getConfig().color
		local type = unit:getConfig().type
		if result[country] == nil then
			result[country] = {}
		end
		if type == 2 and isTar and color == filterColor and not isInFilter(unit) and checkLimitCondition(isDidLimit, isDidLimitRed, unit) then --同阵营，同品质色，过滤Id，判断界限突破的条件
			local yokeCount = HeroDataHelper.getWillActivateYokeCount(unit:getBase_id())
			unit:setWillActivateYokeCount(yokeCount)
			unit:setLimit_level(tempData.limit_level)
			unit:setLimit_rtg(tempData.limit_rtg)
			table.insert(result[country], unit)
		end
	end
	for k, temp in pairs(result) do
		table.sort(temp, sortFun)
	end

	return result
end

--是否有品质更好的武将
function HeroDataHelper.isHaveBetterColorHero(heroUnitData)
	local heroBaseId = heroUnitData:getBase_id()
	local heroColor = heroUnitData:getConfig().color
	local heroList = G_UserData:getHero():getReplaceDataBySort(heroBaseId)
	for i, unit in ipairs(heroList) do
		local color = unit:getConfig().color
		if color > heroColor then
			return true
		end
	end
	return false
end

--是否要判断武将更换红点的限制等级
function HeroDataHelper.isReachCheckBetterColorHeroRP(heroUnitData)
	local ParameterIDConst = require("app.const.ParameterIDConst")
	local limitLevelStr = require("app.config.parameter").get(ParameterIDConst.CHANGE_LEVEL_MAX).content
	local limitLevel = tonumber(limitLevelStr)
	local UserCheck = require("app.utils.logic.UserCheck")
	if heroUnitData:getConfig().type == 1 then --主角不判断
		return false
	end

	if UserCheck.enoughLevel(limitLevel) then
		return false
	end
	return true
end

--是否要提示有品质更好的武将
function HeroDataHelper.isPromptHeroBetterColor(heroUnitData)
	if HeroDataHelper.isReachCheckBetterColorHeroRP(heroUnitData) == false then
		return false
	end

	local isHave = HeroDataHelper.isHaveBetterColorHero(heroUnitData)
	return isHave
end

--获取上阵武将（含主角）等级平均值
function HeroDataHelper.getHeroInBattleAverageLevel()
	local totalLevel = 0
	local heroIds = G_UserData:getTeam():getHeroIds()
	for i, heroId in ipairs(heroIds) do
		if heroId > 0 then --主角排除
			local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local level = unitData:getLevel()
			totalLevel = totalLevel + level
		end
	end
	local count = require("app.utils.UserDataHelper").getTeamOpenCount()
	local average = math.floor(totalLevel / count)
	return average
end

--上阵武将（含主角）突破等级平均值
function HeroDataHelper.getHeroInBattleAverageRank()
	local totalRank = 0
	local heroIds = G_UserData:getTeam():getHeroIds()
	for i, heroId in ipairs(heroIds) do
		if heroId > 0 then
			local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local rank = unitData:getRank_lv()
			totalRank = totalRank + rank
		end
	end
	local count = require("app.utils.UserDataHelper").getTeamOpenCount()
	local average = math.floor(totalRank / count)
	return average
end

--上阵武将（含主角）觉醒等级平均值
function HeroDataHelper.getHeroInBattleAverageAwakeLevel()
	local totalLevel = 0
	local heroIds = G_UserData:getTeam():getHeroIds()
	for i, heroId in ipairs(heroIds) do
		if heroId > 0 then
			local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local level = unitData:getAwaken_level()
			totalLevel = totalLevel + level
		end
	end
	local count = require("app.utils.UserDataHelper").getTeamOpenCount()
	local average = math.floor(totalLevel / count)
	return average
end

function HeroDataHelper.getSkillIdsWithHeroData(unitData)
	local baseId = unitData:getBase_id()
	local rank = unitData:getConfig().type == 1 and unitData:getRank_lv() or 0
	local limitLevel = unitData:getLimit_level()
	local limitRedLevel = unitData:getLimit_rtg()
	local skillIds = HeroDataHelper.getSkillIdsWithBaseIdAndRank(baseId, rank, limitLevel, limitRedLevel)
	return skillIds
end

function HeroDataHelper.getSkillIdsWithBaseIdAndRank(baseId, rank, limitLevel, limitRedLevel)
	local result = {}
	local heroRankConfig = HeroDataHelper.getHeroRankConfig(baseId, rank, limitLevel, limitRedLevel)
	for i = 1, 3 do
		local skillId = heroRankConfig["rank_skill_" .. i]
		result[i] = skillId
	end
    if heroRankConfig["rank_skill_2"] == 0 and heroRankConfig["rank1_skill_2"] == 0 then
        result[2] = heroRankConfig["rank_passive_1"]
    end
	return result
end

--判断是都为主角
function HeroDataHelper.isLeaderWithHeroBaseId(baseId)
	local info = HeroDataHelper.getHeroConfig(baseId)
	return info.type == 1
end

--根据heroId获取对应颜色官衔的最低等级
function HeroDataHelper.getOfficialIdWithHeroId(baseId)
	local color = HeroDataHelper.getHeroConfig(baseId).color
	local OfficialRankConfig = require("app.config.official_rank")
	local len = OfficialRankConfig.length()
	for i = 1, len do
		local info = OfficialRankConfig.indexOf(i)
		if info.color == color then
			return info.id
		end
	end

	assert(false, string.format("official_rank can not find color = %d", color))
end

function HeroDataHelper.getOfficialNameWithHeroId(baseId)
	local officialId = HeroDataHelper.getOfficialIdWithHeroId(baseId)
	local info = require("app.config.official_rank").get(officialId)
	assert(info, string.format("official_rank can not find id = %d", officialId))

	return info.name
end

--获取觉醒道具预览信息
function HeroDataHelper.getAwakeGemstonePreviewInfo(unitData)
	local result = {}

	local previewLevel = 10 --预览未来10级
	local startLevel = unitData:getAwaken_level() + 1
	local awakeCost = unitData:getConfig().awaken_cost
	local awakenMax = unitData:getConfig().awaken_max
	local targetLevel = math.min(startLevel + previewLevel - 1, awakenMax)
	for i = startLevel, targetLevel do
		local id = i - 1
		local awakeInfo = HeroDataHelper.getHeroAwakenConfig(id, awakeCost)
		local one = {
			level = i,
			items = {}
		}
		for j = 1, 4 do
			local stoneValue = awakeInfo["gemstone_value" .. j]
			if stoneValue > 0 then
				local item = {type = TypeConvertHelper.TYPE_GEMSTONE, value = stoneValue, size = 1}
				table.insert(one.items, item)
			end
		end
		table.insert(result, one)
	end

	return result
end

--获取拥有的觉醒道具数量（包括碎片换算为整件）
function HeroDataHelper.getOwnCountOfAwakeGemstone(type, value)
	assert(
		type == TypeConvertHelper.TYPE_GEMSTONE,
		"HeroDataHelper.getOwnCountOfAwakeGemstone, type must be TypeConvertHelper.TYPE_GEMSTONE!!"
	)

	local gemstoneConfig = require("app.config.gemstone").get(value)
	assert(gemstoneConfig, string.format("gemstone config can not find id = %d", value))

	local fragmentId = gemstoneConfig.fragment_id
	local itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
	local config = itemParam.cfg
	local myNum = require("app.utils.UserDataHelper").getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
	local needNum = config.fragment_num

	local count1 = require("app.utils.UserDataHelper").getNumByTypeAndValue(type, value) --拥有的整件宝石的数量
	local count2 = math.floor(myNum / needNum)
	local ownCount = count1 + count2

	return ownCount
end

function HeroDataHelper.getHorseAttr(pos)
	local result = {}

	if pos == nil or pos == 0 then
		return result
	end

	local horseIds = G_UserData:getBattleResource():getHorseIdsWithPos(pos)
	for i, horseId in ipairs(horseIds) do
		local horseData = G_UserData:getHorse():getUnitDataWithId(horseId)
		local attrInfo = HorseDataHelper.getHorseAttrInfo(horseData)
		local skillAttrInfo = HorseDataHelper.getHorseSkillAttrInfo(horseData)
		AttrDataHelper.appendAttr(result, attrInfo)
		AttrDataHelper.appendAttr(result, skillAttrInfo)
	end
	return result
end

function HeroDataHelper.getHorsePower(pos)
	local result = {}
	local power = 0
	if pos == nil or pos == 0 then
		return result
	end
	local horseIds = G_UserData:getBattleResource():getHorseIdsWithPos(pos)
	for i, horseId in ipairs(horseIds) do
		local horsePower = G_UserData:getHorse():getHorsePowerWithId(horseId)
		power = power + horsePower
	end

	result[AttributeConst.HORSE_POWER] = power
	return result
end

-- 获得战马图鉴属性加成
function HeroDataHelper.getHorsePhotoAttr()
	local horsePhotoList = G_UserData:getHorse():getAllHorsePhotoAttrList()
	return horsePhotoList
end

-- 获得战马图鉴战力
function HeroDataHelper.getHorsePhotoPower()
	local horsePower = G_UserData:getHorse():getAllHorsePhotoPowerList()
	return horsePower
end

-- 获取历代名将属性加成
function HeroDataHelper.getHistoryHeroAttr(pos)
	local result = {}

	if pos == nil or pos == 0 then
		return result
	end

	local historyHeroIds = G_UserData:getHistoryHero():getHistoryHeroIds()

	local historyHeroData = G_UserData:getHistoryHero():getHisoricalHeroValueById(historyHeroIds[pos])
	if not historyHeroData then
		return result
	end

	local attrInfo = HistoryHeroDataHelper.getAttrSingleInfo(historyHeroData)
	AttrDataHelper.appendAttr(result, attrInfo)
	return result
end

-- 获取历代名将战力
function HeroDataHelper.getHistoryHeroPower(pos)
	local result = {}
	if pos == nil or pos == 0 then
		return result
	end

	local historyHeroIds = G_UserData:getHistoryHero():getHistoryHeroIds()

	local historyHeroData = G_UserData:getHistoryHero():getHisoricalHeroValueById(historyHeroIds[pos])
	if not historyHeroData then
		return result
	end

	local attrInfo = HistoryHeroDataHelper.getPowerSingleInfo(historyHeroData)
	AttrDataHelper.appendAttr(result, attrInfo)
	return result
end


-- 获取战法属性加成
function HeroDataHelper.getTacticsAttr(pos)
	local result = {}
	if pos == nil or pos == 0 then
		return result
	end

	local unitList = G_UserData:getTactics():getUnitDataListWithPos(pos)

	for _,unitData in ipairs(unitList) do
		local attrInfo = TacticsDataHelper.getAttrSingleInfo(unitData)
		AttrDataHelper.appendAttr(result, attrInfo)
	end
	return result
end

-- 获取战法战力
function HeroDataHelper.getTacticsPower(pos)
	local result = {}
	if pos == nil or pos == 0 then
		return result
	end

	local unitList = G_UserData:getTactics():getUnitDataListWithPos(pos)

	for _,unitData in ipairs(unitList) do
		local attrInfo = TacticsDataHelper.getPowerSingleInfo(unitData)
		AttrDataHelper.appendAttr(result, attrInfo)
    end
	return result
end

-- 获取阵法属性加成
function HeroDataHelper.getBoutAttr(pos)
	local result = {}
	if pos == nil or pos == 0 then
		return result
    end
    
    AttrDataHelper.appendAttr(result, G_UserData:getBout():getAttrSingleInfo())
	return result
end

-- 获取阵法战力
function HeroDataHelper.getBoutPower(pos)
	local result = {}
	if pos == nil or pos == 0 then
		return result
	end

    AttrDataHelper.appendAttr(result, G_UserData:getBout():getPowerSingleInfo())
	return result
end

return HeroDataHelper
