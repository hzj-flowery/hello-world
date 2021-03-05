--
-- Author: Liangxu
-- Date: 2018-8-27
-- 战马模块数据封装类

local HorseDataHelper = {}
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local AttributeConst = require("app.const.AttributeConst")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local HorseConst = require("app.const.HorseConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HorseEquipDataHelper = require("app.utils.data.HorseEquipDataHelper")

function HorseDataHelper.getHorseConfig(id)
	local info = require("app.config.horse").get(id)
	assert(info, string.format("horse config can not find id = %d", id))
	return info
end

function HorseDataHelper.getHorseStarConfig(id, star)
	local info = require("app.config.horse_star").get(id, star)
	assert(info, string.format("horse_star config can not find id = %d, star = %d", id, star))
	return info
end

function HorseDataHelper.getHorseName(id, star)
	local info = HorseDataHelper.getHorseStarConfig(id, star)
	return info.name
end

function HorseDataHelper.getCostSingleInfo(id, star)
	local info = HorseDataHelper.getHorseStarConfig(id, star)
	local result = {}

	for i = 1, 2 do
		local type = info["type_"..i]
		local value = info["value_"..i]
		local size = info["size_"..i]
		RecoveryDataHelper.formatRecoveryCost(result, type, value, size)
	end

	return result
end

function HorseDataHelper.getAttrSingleInfo(id, star)
	local info = HorseDataHelper.getHorseStarConfig(id, star)
	local result = {}

	AttrDataHelper.formatAttr(result, AttributeConst.ATK, info.atk)
	AttrDataHelper.formatAttr(result, AttributeConst.PD, info.pdef)
	AttrDataHelper.formatAttr(result, AttributeConst.MD, info.mdef)
	AttrDataHelper.formatAttr(result, AttributeConst.HP, info.hp)
	AttrDataHelper.formatAttr(result, AttributeConst.HIT, info.hit)
    AttrDataHelper.formatAttr(result, AttributeConst.NO_CRIT, info.no_crit)

	return result
end

function HorseDataHelper.getSkillAttrSingleInfo(id, star)
	local info = HorseDataHelper.getHorseStarConfig(id, star)
	local result = {}
	AttrDataHelper.formatAttr(result, info.skill_type1, info.skill_size1)
	return result
end

function HorseDataHelper.getHorseAttrInfo(horseData, addStar, horseEquipList)
	local result = {}
	local tempStar = addStar or 0
	local id = horseData:getBase_id()
	local star = horseData:getStar() + tempStar

	if star > HorseConst.HORSE_STAR_MAX then --等级超过了最大等级，返回空
		return nil
	end

    local result = HorseDataHelper.getAttrSingleInfo(id, star)
    
    -- 获取战马已经穿上的战马装备列表，并根据每一个装备的属性，加到战马上面
    -- local equipList = G_UserData:getHorseEquipment():getEquipedEquipListWithHorseId(horseData:getId())
    local equipList = horseEquipList
    if not horseEquipList then
        equipList = G_UserData:getHorseEquipment():getEquipedEquipListWithHorseId(horseData:getId())
    end
    for k, unitData in pairs(equipList) do
        local equipBaseId = unitData:getBase_id()
        local equipData = HorseEquipDataHelper.getHorseEquipConfig(equipBaseId)
        for i = 1, 4 do           --装备最多有4种属性
            local attrType = equipData["attribute_type_"..i]
            if attrType ~= 0 then
                local attrValue = equipData["attribute_value_"..i]
                if attrType == AttributeConst.DEF then
                    -- 如果是防御，特殊处理下，把防御值，转换为物防+法防
                    AttrDataHelper.formatAttr(result, AttributeConst.PD, attrValue)
                    AttrDataHelper.formatAttr(result, AttributeConst.MD, attrValue)
                else
                    AttrDataHelper.formatAttr(result, attrType, attrValue)
                end
            end
        end
    end
	return result
end

function HorseDataHelper.getHorseSkillAttrInfo(horseData, addStar)
	local result = {}
	local tempStar = addStar or 0
	local id = horseData:getBase_id()
	local star = horseData:getStar() + tempStar

	if star > HorseConst.HORSE_STAR_MAX then --等级超过了最大等级，返回空
		return nil
	end

	local result = HorseDataHelper.getSkillAttrSingleInfo(id, star)
	return result
end

function HorseDataHelper.getEffectWithBaseId(baseId)
	local result = nil
	local info = HorseDataHelper.getHorseConfig(baseId)
	local moving = info.moving
	if moving ~= "0" then
		result = string.split(moving,"|")
	end
	return result
end

function HorseDataHelper.getHeroBaseIdWithHorseId(horseId)
	local heroUnitData = HorseDataHelper.getHeroDataWithHorseId(horseId)
	if heroUnitData == nil then
		return nil
	end
	
	local heroBaseId = heroUnitData:getBase_id()
	return heroBaseId
end

function HorseDataHelper.getHeroDataWithHorseId(horseId)
	local data = G_UserData:getBattleResource():getHorseDataWithId(horseId)
	if data == nil then
		return nil
	end
	
	local heroId = G_UserData:getTeam():getHeroIdWithPos(data:getPos())
	local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
	return heroUnitData
end

--获取战马天赋信息
function HorseDataHelper.getHorseTalentInfo(id)
	local result = {}

	for i = 1, HorseConst.HORSE_STAR_MAX do
		local info = HorseDataHelper.getHorseStarConfig(id, i)
		local temp = {star = info.star, des = info.talent_description, name = info.talent_name}
		table.insert(result, temp)
	end

	return result
end

--获取战马列表上限
function HorseDataHelper.getHorseListLimitCount()
	local level = G_UserData:getBase():getLevel()
	local info = require("app.config.role").get(level)
	assert(info, string.format("role config can not find level = %d", level))

	return info.horse_limit
end

--判断是否要提示战马升星
function HorseDataHelper.isPromptHorseUpStar(horseData)
	local isStarLimit = horseData:isStarLimit()
	if isStarLimit then
		return false --达到最大级了
	end

	local canUpStar = true
	local materialInfo = HorseDataHelper.getCostSingleInfo(horseData:getBase_id(), horseData:getStar())
	local materialList = RecoveryDataHelper.convertToList(materialInfo)
	for i, info in ipairs(materialList) do
		if info.type == TypeConvertHelper.TYPE_HORSE then
			local myCount = require("app.utils.UserDataHelper").getSameCardCount(info.type, info.value, horseData:getId())
			local needCount = info.size
			local isReachCondition = myCount >= needCount
			canUpStar = canUpStar and isReachCondition
		elseif info.type == TypeConvertHelper.TYPE_RESOURCE then
			local isOk = require("app.utils.LogicCheckHelper").enoughMoney(info.size)
			canUpStar = canUpStar and isOk
		end
	end
	
	return canUpStar
end

function HorseDataHelper.getHorseUpStarCostInfo(horseData)
	local result = {}
	local id = horseData:getBase_id()
	local star = horseData:getStar()
	for i = 1, star-1 do
		local info = HorseDataHelper.getCostSingleInfo(id, i)
		RecoveryDataHelper.mergeRecoveryCost(result, info)
	end
	
	return result
end

function HorseDataHelper.getHorseUpStarMaterial(horseData)
	local temp = {}
	local id = horseData:getBase_id()
	local star = horseData:getStar()
	local info = HorseDataHelper.getCostSingleInfo(id, star)
	for type, unit in pairs(info) do
		if type ~= TypeConvertHelper.TYPE_RESOURCE then
			for value, size in pairs(unit) do
				RecoveryDataHelper.formatRecoveryCost(temp, type, value, size)
			end
		end
	end
	local result = RecoveryDataHelper.convertToList(temp)
	return result
end

function HorseDataHelper.getHorseUpStarMoney(horseData)
	local temp = {}
	local id = horseData:getBase_id()
	local star = horseData:getStar()
	local info = HorseDataHelper.getCostSingleInfo(id, star)
	for type, unit in pairs(info) do
		if type == TypeConvertHelper.TYPE_RESOURCE then
			for value, size in pairs(unit) do
				RecoveryDataHelper.formatRecoveryCost(temp, type, value, size)
			end
		end
	end
	local result = RecoveryDataHelper.convertToList(temp)
	return result[1]
end

function HorseDataHelper.getHorseRecoveryPreviewInfo(datas)
	local result = {}
	local info = {}
	for k, unitData in pairs(datas) do
		local cost1 = HorseDataHelper.getHorseUpStarCostInfo(unitData)
		local baseId = unitData:getBase_id()
		RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_HORSE, baseId, 1) --本卡
		RecoveryDataHelper.mergeRecoveryCost(info, cost1)
	end
	--将同名卡转化为代币
	local currency = {}
	for type, unit in pairs(info) do
		if type == TypeConvertHelper.TYPE_HORSE then
			for value, size in pairs(unit) do
				local temp = RecoveryDataHelper.convertSameCard(type, value ,size, 1)
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

function HorseDataHelper.getHorseRebornPreviewInfo(data)
	local result = {}
	local info = {}
	
	local cost1 = HorseDataHelper.getHorseUpStarCostInfo(data)
	local baseId = data:getBase_id()
	RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_HORSE, baseId, 1) --本卡
	RecoveryDataHelper.mergeRecoveryCost(info, cost1)
	
	local currency = {}
	for type, unit in pairs(info) do
		if type == TypeConvertHelper.TYPE_HORSE then
			for value, size in pairs(unit) do
				local temp = RecoveryDataHelper.convertSameCard(type, value ,size, 2)
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

function HorseDataHelper.isEffectiveHorseToHero(horseId, heroBaseId)
	local heroIds, isSuitAll = G_UserData:getHorse():getHeroIdsWithHorseId(horseId)
	if isSuitAll then
		return true
	else
		for i, heroId in ipairs(heroIds) do
			if heroId == heroBaseId then
				return true
			end
		end
		return false
	end
end

function HorseDataHelper.getHeroNameByFilter(heroBaseIds)
	local isLeaderExist = false
	local result = {}

	for i, heroBaseId in ipairs(heroBaseIds) do
		local info = require("app.utils.data.HeroDataHelper").getHeroConfig(heroBaseId)
		if info.type == 1 then --主角
			if not isLeaderExist then
				table.insert(result, info.name .. Lang.get("horse_suit_ride_heros_leader")) --（未变身）
				isLeaderExist = true
			end
		else
			table.insert(result, info.name)
		end
	end

	return result
end

function HorseDataHelper.playVoiceWithId(id)
	local voiceName = HorseDataHelper.getHorseConfig(id).voice
	if voiceName ~= "" and voiceName ~= "0" then
		local res = Path.getHeroVoice(voiceName)
		G_AudioManager:playSound(res)
	end
end

-- 获取战马图鉴具体信息
function HorseDataHelper.getHorseGroupConfig(id)
	local info = require("app.config.horse_group").get(id)
	assert(info, string.format("horse_group config can not find id = %d", id))
	return info
end

-- 新增激活战马图鉴的接口
function HorseDataHelper.doActiveHorsePhoto(photoId)
	G_UserData:getHorse():c2sActiveWarHorsePhoto(photoId)
end

-- 战马是否能回收，有装备的战马不能回收
function HorseDataHelper.isHorseRecoveryValid(horseId)
    local horseEquipList = G_UserData:getHorseEquipment():getHorseEquipmentList()
    for k, unitData in pairs(horseEquipList) do
        if unitData:getHorse_id() == horseId then
            return false
        end
    end

    return true
end

-- -- 判断战马是否已获取
-- function HorseDataHelper.isHorseValid(baseId,horseList)
--     for k, unitData in pairs(horseList) do
--         if unitData:getBase_id() == baseId then
--             return true
--         end
--     end

--     return false
-- end

-- 获得图鉴细节
function HorseDataHelper.getHorsePhotoDetailInfo(photoId,horseGroupList)
    for i, groupData in ipairs(horseGroupList) do
        if groupData.id == photoId then
            return groupData
        end
    end

    return nil
end

-- 获得图鉴需要的战马个数
function HorseDataHelper.getHorsePhotoNeedNum(photoId,horseGroupList)
    for i, groupData in ipairs(horseGroupList) do
        if groupData.id == photoId then
            local needNum = 0
            for i1 = 1, 2 do               -- 现在只有2个马
                if groupData["horse"..i1] ~= 0 then
                    needNum = needNum + 1
                end
            end
            return needNum
        end
    end

    return 0
end

-- 查看是否有战马图鉴可以激活
function HorseDataHelper.isHorsePhotoValid(horseStateList)
    for k, horseState in pairs(horseStateList) do
        if horseState.state == HorseConst.HORSE_PHOTO_VALID then
            return true
        end
    end

    return false
end

-- 获得所有战马图鉴的属性和
function HorseDataHelper.getAllHorsePhotoAttrList(stateList,groupList)
    local powerList = {}
    for i, stateInfo in ipairs(stateList) do
        if stateInfo.state == HorseConst.HORSE_PHOTO_DONE then
            local groupData = groupList[i]

            -- 每个图鉴，最多能增加4个属性
            for attrIndex = 1, 4 do
                local attrId = groupData["attribute_type_"..attrIndex]
                if attrId ~= 0 then
                    local value = groupData["attribute_value_"..attrIndex]
                    powerList[attrId] = powerList[attrId] or 0
                    powerList[attrId] = powerList[attrId] + value
                end
            end
        end
    end

    return powerList
end

-- 获得所有战马图鉴的战力和
function HorseDataHelper.getAllHorsePhotoPowerList(stateList,groupList)
	local result = {}
	local power = 0
    for i, stateInfo in ipairs(stateList) do
        if stateInfo.state == HorseConst.HORSE_PHOTO_DONE then
            local groupData = groupList[i]
			power = power + groupData.all_combat
        end
    end
	result[AttributeConst.HORSE_POWER] = power
    return result
end

return HorseDataHelper