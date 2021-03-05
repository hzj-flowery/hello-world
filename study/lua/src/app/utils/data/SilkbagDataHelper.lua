-- 
-- Author: Liangxu
-- Date: 2018-3-1 17:34:41
-- 锦囊数据帮助类
local SilkbagDataHelper = {}
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local SilkbagConst = require("app.const.SilkbagConst")
local ParameterIDConst = require("app.const.ParameterIDConst")

function SilkbagDataHelper.getSilkbagConfig(id)
	local info = require("app.config.silkbag").get(id)
	assert(info, string.format("silkbag config can not find id = %d", id))
	return info
end

function SilkbagDataHelper.getSilkMappingConfig(silkId, heroId)
	local info = require("app.config.silk_mapping").get(silkId, heroId)
	assert(info, string.format("silk_mapping config can not find silk_id = %d, hero_id = %d", silkId, heroId))
	return info
end

function SilkbagDataHelper.getAttrWithId(id, userLevel)
	local tempLevel = tonumber(require("app.config.parameter").get(ParameterIDConst.SILKBAG_START_LV).content)
	local result = {}
	local info = SilkbagDataHelper.getSilkbagConfig(id)
	for i = 1, 2 do
		local attrType = info["type"..i]
		local attrSize = info["size"..i]
		local growth = info["growth"..i]
		local ratio = math.max(userLevel-tempLevel, 0)
		local attrValue = attrSize + (growth * ratio)
		AttrDataHelper.formatAttr(result, attrType, attrValue)
	end
	return result
end

function SilkbagDataHelper.getHeroIconsData()
	local result = {}

	local heroIds = G_UserData:getTeam():getHeroIds()
	for i, heroId in ipairs(heroIds) do
		if heroId > 0 then
			local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel = AvatarDataHelper.getShowHeroBaseIdByCheck(unitData)
			local info = {
				type = TypeConvertHelper.TYPE_HERO, 
				value = heroBaseId, 
				funcId = FunctionConst["FUNC_TEAM_SLOT"..i],
				id = heroId,
				limitLevel = avatarLimitLevel or unitData:getLimit_level(),
				limitRedLevel = arLimitLevel or unitData:getLimit_rtg()
			}
			table.insert(result, info)
		end
	end

	return result
end

function SilkbagDataHelper.isEffectiveSilkBagToHero(silkbagId, heroBaseId, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit)
	local silkbagInfo = SilkbagDataHelper.getSilkbagConfig(silkbagId)
	local strHero = silkbagInfo.hero
	if strHero == tostring(SilkbagConst.ALL_HERO_ID) then --999，认为都生效
		return true
	end
	if strHero == tostring(SilkbagConst.ALL_MALE_ID) and require("app.utils.data.HeroDataHelper").getHeroConfig(heroBaseId).gender == 1 then
		return true
	end
	if strHero == tostring(SilkbagConst.ALL_FEMALE_ID) and require("app.utils.data.HeroDataHelper").getHeroConfig(heroBaseId).gender == 2 then
		return true
	end

	local heroIds = G_UserData:getSilkbag():getHeroIdsWithSilkbagId(silkbagId)
	local silkId = silkbagInfo.mapping
	for i, heroId in ipairs(heroIds) do
		if heroId == heroBaseId then
			local info = SilkbagDataHelper.getSilkMappingConfig(silkId, heroBaseId)
			local isEffective, limitRank, isEffectiveForInstrument, limitLevel, limitRedLevel =
				SilkbagDataHelper.isEffectiveWithHeroRankAndInstrument(info, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit)
			return isEffective, limitRank, isEffectiveForInstrument, limitLevel
		end
	end
	return false, false --第二个false表示对应武将不生效，而不是rank等级不够或神兵等级不够
end

function SilkbagDataHelper.isEffectiveWithHeroRankAndInstrument(info, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit)
	local isRankEffective = false --突破等级是否达到
	local isInstrumentEffective = false --神兵是否达到
	local isLimitEffective = false --界限等级是否达到
	local isRedLimitEffective = false -- 红升金界限是否达到
	
	heroRedLimit = heroRedLimit or 0

	local limitRank = SilkbagDataHelper.getLimitRankForEffective(info)
	if limitRank then
		if heroRank >= limitRank then
			isRankEffective = true
		else
			isRankEffective = false
		end
	else
		isRankEffective = false
	end

	local isEffectiveForInstrument = info.effective_5 == 1 --对神兵生效
	if isEffectiveForInstrument and isInstrumentMaxLevel then
	 	isInstrumentEffective = true
	end

	local limitLevel = SilkbagDataHelper.getLimitLevelForEffective(info)
	if limitLevel > 0 then
		if heroLimit >= limitLevel then
			isLimitEffective = true
		else
			isLimitEffective = false
		end
	else
		isLimitEffective = false
	end

	local limitRedLevel = SilkbagDataHelper.getRedLimitLevelForEffective(info)
	if limitRedLevel > 0 then
		if heroRedLimit >= limitRedLevel then
			isRedLimitEffective = true
		else
			isRedLimitEffective = false
		end
	else
		isRedLimitEffective = false
	end

	local isEffective = isRankEffective or isInstrumentEffective or isLimitEffective or isRedLimitEffective
	return isEffective, limitRank, isEffectiveForInstrument, limitLevel, limitRedLevel
end

function SilkbagDataHelper.getLimitRankForEffective(info)
	local effectIndex2Rank = {0, 5, 8, 10} --生效对应的突破等级
	local limitRank = nil
	for i, rank in ipairs(effectIndex2Rank) do
		local effective = info["effective_"..i]
		if effective == 1 then
			limitRank = rank
			break
		end
	end
	return limitRank
end

--获取锦囊对应生效的界限等级
function SilkbagDataHelper.getLimitLevelForEffective(info)
	local effectIndex2Level = {
		[6] = 1,
		[7] = 2,
		[8] = 3
	}
	local limitLevel = 0
	for i = 6, 8 do
		local effective = info["effective_"..i]
		if effective == 1 then
			limitLevel = effectIndex2Level[i]
			break
		end
	end
	return limitLevel
end

-- 获取锦囊对应生效的红升金界限等级
function SilkbagDataHelper.getRedLimitLevelForEffective(info)
	local effectIndex2Level = {
		[9] = 1,
		[10] = 2,
		[11] = 3,
		[12] = 4
	}
	local limitRedLevel = 0
	for i = 9, 12 do
		local effective = info["effective_"..i]
		if effective == 1 then
			limitRedLevel = effectIndex2Level[i]
			break
		end
	end
	return limitRedLevel
end


--获取播放的Effect
function SilkbagDataHelper.getEffectWithBaseId(baseId)
	local result = nil
	local info = SilkbagDataHelper.getSilkbagConfig(baseId)
	local moving = info.moving
	if moving ~= "0" and moving ~= "" then
		result = string.split(moving, "|")
	end
	return result
end

return SilkbagDataHelper