--
-- Author：JerryHe
-- Date： 2019-01-22
-- Desc：战马装备control
--
local HorseEquipDataHelper = {}
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local AttributeConst = require("app.const.AttributeConst")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local function sortHorseEquip(a, b)
    local configA = a:getConfig()
    local configB = b:getConfig()
    if configA.color ~= configB.color then
        return configA.color > configB.color
    else
        return configA.id < configB.id
    end
end

function HorseEquipDataHelper.getHorseEquipConfig(id)
    local info = require("app.config.horse_equipment").get(id)
    assert(info, string.format("horse config can not find id = %d", id))
    return info
end

-- 获取所有战马装备列表（装备的放前，未装备的放后）
function HorseEquipDataHelper.getAllHorseEquipList(horseEquipList)
    local result = {}
    local wear = {} --已穿戴
    local noWear = {} --未穿戴

    for k, unit in pairs(horseEquipList) do
        local horseId = unit:getHorse_id()
        if horseId == 0 then
            table.insert(noWear, unit)
        else
            local horseUnitData = G_UserData:getHorse():getUnitDataWithId(horseId)
            if horseUnitData:isInBattle() then
                table.insert(wear, unit)
            else
                table.insert(noWear, unit)
            end
        end
    end

    table.sort(wear, sortHorseEquip)
    table.sort(noWear, sortHorseEquip)

    table.insertto(result,wear)
    table.insertto(result,noWear)

    return result
end

-- 获得孔位上的战马装备列表
-- 有三个返回值：全部，未装备的，已装备的
function HorseEquipDataHelper.getReplaceHorseEquipListWithSlot(horseEquipList, slot,horseId)
    local result = {}
    local noWear = {}
    local wear = {}

    for k, unit in pairs(horseEquipList) do
        if unit:getConfig().type == slot then
            local curHorseId = unit:getHorse_id()
            if curHorseId == 0 then
                table.insert(noWear, unit)
            else
                if not horseId then
                    table.insert(wear, unit)
                elseif horseId ~= curHorseId then
                    table.insert(wear, unit)
                end
            end
        end
    end
    table.sort(wear, sortHorseEquip)
    table.sort(noWear, sortHorseEquip)

    for i, data in ipairs(noWear) do
        table.insert(result, data)
    end
    for i, data in ipairs(wear) do
        table.insert(result, data)
    end

    return result, noWear, wear
end

-- 获得所有能回收的战马装备列表
-- 返回结果：所有未被装备到战马上的装备，按照颜色排序（小的放前），相同的按照id排序，保证低级别的先出现在回收列表
function HorseEquipDataHelper.getAllRecoveryHorseEquipList(horseEquipList,lowLevel)
    local result = {}
    for k, equipUnitData in pairs(horseEquipList) do
        if equipUnitData:getHorse_id() == 0 then
            if lowLevel then
                if equipUnitData:getConfig().color <= 4 then
                    -- 低品质的不包括橙色以上
                    table.insert(result, equipUnitData)
                end
            else
                table.insert(result, equipUnitData)
            end
        end
    end

    table.sort(result, sortHorseEquip)

    return result
end

-- 返回某马匹穿上的装备列表
function HorseEquipDataHelper.getEquipedEquipListWithHorseId(horseId, horseEquipList)
    local result = {}
    for k, equipUnitData in pairs(horseEquipList) do
        if equipUnitData:getHorse_id() == horseId then
            table.insert(result, equipUnitData)
        end
    end

    table.sort(result,sortHorseEquip)

    return result
end

-- 返回某马匹身上某个孔位对应的装备信息
function HorseEquipDataHelper.getEquipedEquipinfoWithHorseIdAndSlot(horseId,slot,horseEquipList)
    for k, equipUnitData in pairs(horseEquipList) do
        if equipUnitData:getHorse_id() == horseId then
            if equipUnitData:getConfig().type == slot then
                return equipUnitData
            end
        end
    end

    return nil
end

-- 获得战马装备回收奖励预览
function HorseEquipDataHelper.getHorseEquipRecoveryPreviewInfo(datas)
    local result = {}
    local info = {}
    for k, unitData in pairs(datas) do
        local baseId = unitData:getBase_id()
        RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_HORSE_EQUIP, baseId, 1) --本卡
    end

    --将同名卡转化为代币
	local currency = {}
	for type, unit in pairs(info) do
		if type == TypeConvertHelper.TYPE_HORSE_EQUIP then
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
            table.insert(result, { type = type, value = value, size = size })
        end
    end

    RecoveryDataHelper.sortAward(result)
    return result
end

-- 获得战马装备属性
function HorseEquipDataHelper.getHorseEquipAttrInfo(equipData)
	local result = {}
	local id = equipData:getBase_id()

	local result = HorseEquipDataHelper.getAttrSingleInfo(equipData:getConfig())
	return result
end

function HorseEquipDataHelper.getAttrSingleInfo(configData)
    local result = {}
    
    local attrNum = 4
    for i = 1, attrNum do
        local attrType = configData["attribute_type_"..i]
        if attrType ~= 0 then
            local attrValue = configData["attribute_value_"..i]
            AttrDataHelper.formatAttr(result, attrType, attrValue)
        end
    end

	return result
end

-- 某一装备，是否有更好的类型
function HorseEquipDataHelper.isHaveBetterHorseEquip(equipBaseId,horseEquipmentList)
    local configData = HorseEquipDataHelper.getHorseEquipConfig(equipBaseId)

    for k,equipData in pairs(horseEquipmentList) do
        if equipData:getHorse_id() == 0 then
            local config = equipData:getConfig()
            if config.type == configData.type and config.color > configData.color then
                return true
            end
        end
    end

    return false
end

-- 某一类别，是否有空闲的装备
function HorseEquipDataHelper.isHaveFreeHorseEquip(slot,horseEquipmentList)
    for k,equipData in pairs(horseEquipmentList) do
        if equipData:getHorse_id() == 0 and equipData:getConfig().type == slot then
            return true
        end
    end
    return false
end

return HorseEquipDataHelper