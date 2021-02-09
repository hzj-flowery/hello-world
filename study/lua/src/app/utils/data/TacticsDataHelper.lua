-- 
-- Author: Wangyu
-- Date: 2020年2月10日18:26:24
-- 战法数据帮助类
local TacticsDataHelper = {}
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local TacticsConst = require("app.const.TacticsConst")
local ParameterIDConst = require("app.const.ParameterIDConst")
local SilkbagDataHelper = require("app.utils.data.SilkbagDataHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local AttributeConst = require("app.const.AttributeConst")

function TacticsDataHelper.getTacticsConfig(id)
	local info = require("app.config.tactics").get(id)
	assert(info, string.format("tactics config can not find id = %d", id))
	return info
end

function TacticsDataHelper.getTacticsHeroConfig(tacticsId, heroId)
	local info = require("app.config.tactics_hero").get(tacticsId, heroId)
	assert(info, string.format("tactics_hero config can not find tactics_id = %d, hero_id = %d", tacticsId, heroId))
	return info
end

function TacticsDataHelper.getTacticsParameter(keyIndex)
    local TacticsParameter = require("app.config.tactics_parameter")
    for i=1, TacticsParameter.length() do
        local territoryData = TacticsParameter.indexOf(i)
        if territoryData.key == keyIndex then
            return territoryData.content
        end
    end
    assert(false," can't find key index in TacticsParameter "..keyIndex)
    return nil
end

function TacticsDataHelper.getTacticsStudyConfig(id)
	local info = require("app.config.tactics_study").get(id)
	assert(info, string.format("tactics_study config can not find id = %d", id))
	return info
end

-- 判断适配武将类型是否为特殊
function TacticsDataHelper.isSpecialSuitableHeroType(suitType)
	local isSpecial = false
	if suitType==TacticsConst.SUIT_TYPE_FEMALE or suitType==TacticsConst.SUIT_TYPE_MALE
		or suitType==TacticsConst.SUIT_TYPE_ALL or suitType==TacticsConst.SUIT_TYPE_JOINT then
		isSpecial = true
	end
	return isSpecial
end

-- 生效逻辑，跟锦囊一样
TacticsDataHelper.getLimitRankForEffective = SilkbagDataHelper.getLimitRankForEffective
TacticsDataHelper.getLimitLevelForEffective = SilkbagDataHelper.getLimitLevelForEffective
TacticsDataHelper.getRedLimitLevelForEffective = SilkbagDataHelper.getRedLimitLevelForEffective

TacticsDataHelper.isEffectiveWithHeroRankAndInstrument = SilkbagDataHelper.isEffectiveWithHeroRankAndInstrument

-- 获取生效字符串，如刘备+7
function TacticsDataHelper._getEffectiveStr(tacticsBaseId, hid, heroBaseId)
	local info = TacticsDataHelper.getTacticsHeroConfig(tacticsBaseId, hid)
	local limitRank = TacticsDataHelper.getLimitRankForEffective(info)
	local limitLevel = TacticsDataHelper.getLimitLevelForEffective(info)
	local limitRedLevel = TacticsDataHelper.getRedLimitLevelForEffective(info)
	local heroInfo = require("app.utils.data.HeroDataHelper").getHeroConfig(heroBaseId)
	
	local strLimit = heroInfo.name
	if limitRank then
		if limitRank > 0 then
			strLimit = strLimit .. Lang.get("tactics_effective_rank", {rank = limitRank})
		end
	elseif info.effective_5 == 1 then
		local instrumentMaxLevel = require("app.config.instrument").get(heroInfo.instrument_id).level_max
		strLimit = strLimit .. Lang.get("tactics_effective_instrument", {level = instrumentMaxLevel})
	elseif limitLevel > 0 then
		if heroInfo.limit == 1 then
			strLimit = strLimit .. Lang.get("tactics_effective_limit" .. limitLevel)
		end
	elseif limitRedLevel > 0 then
		if heroInfo.limit_red == 1 then
			strLimit = strLimit .. Lang.get("tactics_effective_limit_red" .. limitRedLevel)
		end
	end
	return strLimit
end

-- 根据武将uid获取对应的tactics_hero配置
function TacticsDataHelper.getTacticsHeroConfigWithHeroId(tacticsBaseId, heroId)
	local config = require("app.config.tactics_hero")
	local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
	local heroBaseId = heroUnitData:getAvatarToHeroBaseId()
	local info = config.get(tacticsBaseId, heroBaseId)
	if not info then
		local heroInfo = heroUnitData:getConfig()
		local len = config.length()
		for i=1,len do
			local item = config.indexOf(i)
			if item.tactics_id==tacticsBaseId then
				if item.hero_id==heroBaseId then
					return item
				elseif item.hero_id==TacticsConst.SUIT_TYPE_ALL then
					return item
				elseif item.hero_id==TacticsConst.SUIT_TYPE_MALE and heroInfo.gender==1 then
					return item
				elseif item.hero_id==TacticsConst.SUIT_TYPE_FEMALE and heroInfo.gender==2 then
					return item
				elseif item.hero_id==TacticsConst.SUIT_TYPE_JOINT and heroInfo.skill_3_type~=0 then
					return item
				end
			end
		end
	end
	return info
end

-- 是否生效
function TacticsDataHelper.isEffectiveTacticsToHero(tacticsBaseId, pos)
	local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
	local info = TacticsDataHelper.getTacticsHeroConfigWithHeroId(tacticsBaseId, heroId)
	if info==nil then
		return false
	end

	local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
	local heroRank = heroUnitData:getRank_lv()
	local isInstrumentMaxLevel = G_UserData:getInstrument():isInstrumentLevelMaxWithPos(pos)
	local heroLimit = heroUnitData:getLeaderLimitLevel()
	local heroRedLimit = heroUnitData:getLeaderLimitRedLevel()

	local isEffective, limitRank, isEffectiveForInstrument, limitLevel, limitRedLevel =
		TacticsDataHelper.isEffectiveWithHeroRankAndInstrument(info, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit)

	return isEffective, limitRank, isEffectiveForInstrument, limitLevel --第二个false表示对应武将不生效，而不是rank等级不够或神兵等级不够
end

-- 获取战法适用武将信息
function TacticsDataHelper.getTacticsSuitInfo()
	local tacticsConfig = require("app.config.tactics")
	local len = tacticsConfig.length()
	local heroConfig = require("app.config.hero")
	local hlen = heroConfig.length()
	local tacticsMapConfig = require("app.config.tactics_hero")
	local resList = {}
	for i = 1, len do
		local tacticsInfo = tacticsConfig.indexOf(i)
		if tacticsInfo.gm>0 then
			local mapId = tacticsInfo.mapping
			local mlen = tacticsMapConfig.length()
			local heroIdList = {}
			for mi=1, mlen do
				local minfo = tacticsMapConfig.indexOf(mi)
				if minfo.tactics_id==mapId then
					table.insert(heroIdList, minfo.hero_id)
				end
			end
			local heroIds = {}
			local tmpLimitStrs = {}
			local suitType = TacticsConst.SUIT_TYPE_NONE
			for _,heroId in ipairs(heroIdList) do
				if not TacticsDataHelper.isSpecialSuitableHeroType(heroId) then
					table.insert(heroIds, heroId)
					local str = TacticsDataHelper._getEffectiveStr(tacticsInfo.id, heroId, heroId)
					table.insert( tmpLimitStrs,str )
				else
					suitType = heroId
					if heroId == TacticsConst.SUIT_TYPE_ALL then --全武将
						for i = 1, hlen do
							local info = heroConfig.indexOf(i)
							if info.type == 1 then --主角
								table.insert(heroIds, info.id)
								local str = TacticsDataHelper._getEffectiveStr(tacticsInfo.id, heroId, info.id)
								table.insert( tmpLimitStrs,str )
							elseif info.type == 2 and info.color >= 4 then --品质筛选武将
								table.insert(heroIds, info.id)
								local str = TacticsDataHelper._getEffectiveStr(tacticsInfo.id, heroId, info.id)
								table.insert( tmpLimitStrs,str )
							end
						end
					elseif heroId == TacticsConst.SUIT_TYPE_MALE then --男武将
						for i = 1, hlen do
							local info = heroConfig.indexOf(i)
							if info.type == 1 and info.gender == 1 then --男主角
								table.insert(heroIds, info.id)
								local str = TacticsDataHelper._getEffectiveStr(tacticsInfo.id, heroId, info.id)
								table.insert( tmpLimitStrs,str )
							elseif info.type == 2 and info.gender == 1 and info.color >= 4 then --品质筛选男武将
								table.insert(heroIds, info.id)
								local str = TacticsDataHelper._getEffectiveStr(tacticsInfo.id, heroId, info.id)
								table.insert( tmpLimitStrs,str )
							end
						end
					elseif heroId == TacticsConst.SUIT_TYPE_FEMALE then --女武将
						for i = 1, hlen do
							local info = heroConfig.indexOf(i)
							if info.type == 1 and info.gender == 2 then --女主角
								table.insert(heroIds, info.id)
								local str = TacticsDataHelper._getEffectiveStr(tacticsInfo.id, heroId, info.id)
								table.insert( tmpLimitStrs,str )
							elseif info.type == 2 and info.gender == 2 and info.color >= 4 then --品质筛选女武将
								table.insert(heroIds, info.id)
								local str = TacticsDataHelper._getEffectiveStr(tacticsInfo.id, heroId, info.id)
								table.insert( tmpLimitStrs,str )
							end
						end
					elseif heroId == TacticsConst.SUIT_TYPE_JOINT then 	-- 合击武将
						for i = 1, hlen do
							local info = heroConfig.indexOf(i)
							if info.type == 2 and info.skill_3_type ~= 0 and info.color >= 4 then --品质筛选合击武将
								table.insert(heroIds, info.id)
								local str = TacticsDataHelper._getEffectiveStr(tacticsInfo.id, heroId, info.id)
								table.insert( tmpLimitStrs,str )
							end
						end
					end
				end
			end
			local limitStrs = {}
			-- 去重
			local limitStrMap = {}
			for i,v in ipairs(tmpLimitStrs) do
				if not limitStrMap[v] then
					limitStrMap[v] = i
					table.insert(limitStrs, v)
				end
			end
			resList[tacticsInfo.id] = {heroIds=heroIds, limitStrs=limitStrs, suitType=suitType}
		end
	end
	return resList
end

-- 获取战法位解锁条件
--   返回武将品质和数量
function TacticsDataHelper.getTacticsPosUnlockParam(pos)
	local color = 0
	local num = 0
	local cost = 0
	if pos==1 then
		return color, num, cost
	end
	local info = TacticsDataHelper.getTacticsParameter(TacticsConst["PARAM_UNLCOK_"..pos])
	if info then
		local tab = string.split(info, "|")
		color = tonumber(tab[1])
		num = tonumber(tab[2])
		cost = tonumber(tab[3])
	end
	
    return color, num, cost
end

-- 获取战法互斥map
--   key为战法id，value为true
function TacticsDataHelper.getMutexMap(id)
	local config = TacticsDataHelper.getTacticsConfig(id)
	local info = config.mutex
	local map = {}
	if info~="" and info~="0" then
		for i,v in ipairs(string.split(info, "|")) do
			map[tonumber(v)] = true
		end
	end
	return map
end

-- 获取战法品质图片路径
function TacticsDataHelper.getTacticsColorPath(tacticsUnitData)
	local color = tacticsUnitData:getConfig().color
	local colorPath = TacticsConst["ICON_COLOR_PATH_" .. color] or TacticsConst.ICON_COLOR_PATH_5
	return colorPath
end

-- 是否可解锁
function TacticsDataHelper.isCanUnlocked(tacticsUnitData)
	if tacticsUnitData:isUnlocked() then
		return false
	end
	local UserDataHelper = require("app.utils.UserDataHelper")
	local materrials = TacticsDataHelper.getUnlockedMaterials(tacticsUnitData)
	for i,v in ipairs(materrials) do
		local num = UserDataHelper.getSameCardCount(v.type, v.value)
		if num<v.size then
			return false
		end
	end
	return true
end

-- 解锁需要的资源
function TacticsDataHelper.getUnlockedMaterials(tacticsUnitData)
	local materials = {}
	
	if tacticsUnitData:isUnlocked() then
		return materials
	end
	local heroIdMap = {}
	local heroIdOrder = {}
	for i=1,4 do
		local heroId = tacticsUnitData:getStudyConfig()["unlock_hero"..i]
		if heroId~=0 then
			if heroIdMap[heroId] then
				heroIdMap[heroId] = heroIdMap[heroId] + 1
			else
				heroIdMap[heroId] = 1
				table.insert(heroIdOrder, heroId)
			end
		end
	end
	for _,heroId in ipairs(heroIdOrder) do
		local num = heroIdMap[heroId]
		table.insert(materials, {type=TypeConvertHelper.TYPE_HERO, value=heroId, size=num})
	end
	return materials
end

-- 根据品质获取战法数量
function TacticsDataHelper.getTacticsNumInfoByColor(color)
	local tacticsConfig = require("app.config.tactics")
	local totalNum = 0
	local len = tacticsConfig.length()
	for i = 1, len do
		local tacticsInfo = tacticsConfig.indexOf(i)
		if tacticsInfo.color == color and tacticsInfo.gm>0 then
			totalNum=totalNum+1
		end
	end
	local list = G_UserData:getTactics():getTacticsList(TacticsConst.GET_LIST_TYPE_STUDIED)
	local num = 0
	for i,v in ipairs(list) do
		if v:getConfig().color==color then
			num = num+1
		end
	end
	return num, totalNum
end

-- 获取战法界面tab图片路径
function TacticsDataHelper.getTacticsTabImgPath(index, isSel)
    local color = index+4
	local sel = isSel and 1 or 2
	local path = TacticsConst["TAB_COLOR_"..color.."_"..sel]
	return path
end


function TacticsDataHelper.getAttrSingleInfo(unitData)
	local info = unitData:getConfig()
	local result = {}

	-- 属性
	-- AttrDataHelper.formatAttr(result, AttributeConst.ATK, info.atk)

	return result
end

function TacticsDataHelper.getPowerSingleInfo(unitData)
	local info = unitData:getConfig()
	local result = {}

	AttrDataHelper.formatAttr(result, AttributeConst.TACTICS_POWER, info.fake)

	return result
end

return TacticsDataHelper