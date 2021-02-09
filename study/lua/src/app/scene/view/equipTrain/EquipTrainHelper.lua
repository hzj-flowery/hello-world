--
-- Author: Liangxu
-- Date: 2017-04-19 19:49:40
-- 装备培养帮助类
local EquipTrainHelper = {}
local Equipment = require("app.config.equipment")
local EquipmentLimitup = require("app.config.equipment_limitup")
local EquipmentRefine = require("app.config.equipment_refine")
local LimitCostConst = require("app.const.LimitCostConst")
local EquipmentLimitup = require("app.config.equipment_limitup")
local EquipmentLevelup = require("app.config.equipment_levelup")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

EquipTrainHelper.JADE_ATTR_ORDER = {
    [1] = 4,
    [2] = 2,
    [3] = 1,
    [4] = 3
}

--检查功能开启
function EquipTrainHelper.isOpen(funcId)
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOpen, des = LogicCheckHelper.funcIsOpened(funcId)
    if not isOpen then
        G_Prompt:showTip(des)
        return false
    end
    return true
end

-- 界限突破后装备名称
function EquipTrainHelper.getLimitUpEquipName(equipId)
    local afterId = Equipment.get(equipId).potential_after
    local name = ""
    if afterId then
        name = Equipment.get(afterId).name
    end
    return name
end

-- 界限突破标题资源
function EquipTrainHelper.getLimitUpTitleRes(baseId)
    local config = Equipment.get(baseId)
    assert(config, "not found equipment config in equipment by " .. baseId)
    local afterId = config.potential_after
    if afterId == 0 then
        return ""
    end
    local afterSuitId = Equipment.get(afterId).suit_id
    if afterSuitId == 2001 then -- 四神
        return Path.getTextLimit("txt_limit_06d")
    elseif afterSuitId == 3001 then -- 八荒
        return Path.getTextLimit("txt_limit_06e")
    else
        return ""
    end
end

-- 获取当前装备数据
function EquipTrainHelper.getCurEquipUnitData()
    local equipOnlyId = G_UserData:getEquipment():getCurEquipId() -- 装备唯一id
    if not equipOnlyId then
        return
    end
    return G_UserData:getEquipment():getEquipmentDataWithId(equipOnlyId)
end

-- 获取界限突破需要消耗的总物资信息
function EquipTrainHelper.getLimitUpCostInfo()
    local unitData = EquipTrainHelper.getCurEquipUnitData()
    return EquipTrainHelper.getLimitUpCostInfoByUnitData(unitData)
end

function EquipTrainHelper.getLimitUpCostInfoByUnitData(unitData)
    if not unitData then
        return {}
    end
    local equipId = unitData:getBase_id() -- 道具id
    local refineLevel = unitData:getR_level()
    local equipConfig = unitData:getConfig()
    local curTemplateId = equipConfig.levelup_templet
    local afterId = equipConfig.potential_after
    local afterConfig = Equipment.get(afterId)
    if not afterConfig then
        return {}
    end
    local afterTemplateId = afterConfig.levelup_templet
    local refineCost = 0
    -- if refineLevel > 0 then
    --     for level = 0, refineLevel - 1 do
    --         local refineConfig = EquipmentRefine.get(level, curTemplateId)
    --         local refineConfigAfter = EquipmentRefine.get(level, afterTemplateId)
    --         refineCost = refineCost + (refineConfigAfter.exp - refineConfig.exp)
    --     end
    -- end
    local limitupTempleteId = equipConfig.limitup_templet_id -- 界限突破模板
    local limitUpConfig = EquipmentLimitup.get(limitupTempleteId)

    local costInfo = {}
    -- costInfo["size_" .. LimitCostConst.LIMIT_COST_KEY_1] = refineCost + 1 -- 精炼石消耗
    costInfo["size_" .. LimitCostConst.LIMIT_COST_KEY_2] = limitUpConfig.cost_equipment
    costInfo["size_" .. LimitCostConst.LIMIT_COST_KEY_3] = limitUpConfig.resource_size_1
    costInfo["size_" .. LimitCostConst.LIMIT_COST_KEY_4] = limitUpConfig.resource_size_2

    -- costInfo["type_" .. LimitCostConst.LIMIT_COST_KEY_1] = TypeConvertHelper.TYPE_ITEM
    costInfo["type_" .. LimitCostConst.LIMIT_COST_KEY_2] = TypeConvertHelper.TYPE_EQUIPMENT
    costInfo["type_" .. LimitCostConst.LIMIT_COST_KEY_3] = TypeConvertHelper.TYPE_ITEM
    costInfo["type_" .. LimitCostConst.LIMIT_COST_KEY_4] = TypeConvertHelper.TYPE_ITEM

    costInfo["value_" .. LimitCostConst.LIMIT_COST_KEY_2] = equipId
    costInfo["value_" .. LimitCostConst.LIMIT_COST_KEY_3] = limitUpConfig.resource_id_1
    costInfo["value_" .. LimitCostConst.LIMIT_COST_KEY_4] = limitUpConfig.resource_id_2

    -- costInfo["consume_" .. LimitCostConst.LIMIT_COST_KEY_1] = limitUpConfig.consume_refinestone
    costInfo["consume_" .. LimitCostConst.LIMIT_COST_KEY_2] = limitUpConfig.consume_equipment
    costInfo["consume_" .. LimitCostConst.LIMIT_COST_KEY_3] = limitUpConfig.resource_consume_1
    costInfo["consume_" .. LimitCostConst.LIMIT_COST_KEY_4] = limitUpConfig.resource_consume_2
    return costInfo
end

-- 获取界限突破消耗物资名称资源id
function EquipTrainHelper.getLimitUpCostNameResIds()
    local unitData = EquipTrainHelper.getCurEquipUnitData()
    if not unitData then
        return {}
    end
    local equipId = unitData:getBase_id() -- 道具id
    local limitupTempleteId = Equipment.get(equipId).limitup_templet_id -- 界限突破模板
    local costNames = {}
    costNames[LimitCostConst.LIMIT_COST_KEY_1] = "txt_limit_01c"
    costNames[LimitCostConst.LIMIT_COST_KEY_2] = "txt_limit_02c"
    costNames[LimitCostConst.LIMIT_COST_KEY_3] = limitupTempleteId == 1 and "txt_limit_03" or "txt_limit_01d"
    costNames[LimitCostConst.LIMIT_COST_KEY_4] = limitupTempleteId == 1 and "txt_limit_04" or "txt_limit_02d"
    return costNames
end

-- 通过道具id获取消耗的装备唯一id
function EquipTrainHelper.getCostEquipId(value)
    local ids = G_UserData:getEquipment():getEquipmentIdsWithBaseId(value)
    local count = #ids
    for i = 1, count do
        local data = G_UserData:getEquipment():getEquipmentDataWithId(ids[i])
        if (not data:isInBattle()) and data:isBlackPlat() then
            return ids[i]
        end
    end
end

-- 是否所有的突破资源都已经满了
function EquipTrainHelper.equipLimitUpIsAllFull()
    local unitData = EquipTrainHelper.getCurEquipUnitData()
    return EquipTrainHelper.equipLimitUpIsAllFullByUnitData(unitData)
end

function EquipTrainHelper.equipLimitUpIsAllFullByUnitData(unitData)
    if not unitData then
        return false
    end
    local materials = unitData:getMaterials()
    local info = EquipTrainHelper.getLimitUpCostInfoByUnitData(unitData)
    for i = LimitCostConst.LIMIT_COST_KEY_2, LimitCostConst.LIMIT_COST_KEY_4 do
        local size = info["size_" .. LimitCostConst["LIMIT_COST_KEY_" .. i]]
        if size == nil then
            return false
        end
        -- if i == LimitCostConst.LIMIT_COST_KEY_1 and info["size_" .. LimitCostConst["LIMIT_COST_KEY_" .. i]] == 1 then
        --     info["size_" .. LimitCostConst["LIMIT_COST_KEY_" .. i]] = 0
        -- end
        if materials[LimitCostConst["LIMIT_COST_KEY_" .. i]] < info["size_" .. LimitCostConst["LIMIT_COST_KEY_" .. i]] then
            return false
        end
    end
    return true
end

--
function EquipTrainHelper.getConfigByBaseId(baseId)
    local config = Equipment.get(baseId)
    assert(config, "not found config by base_id " .. baseId)
    return config
end

-- 界限突破消耗银两
function EquipTrainHelper.getLimitUpCoinCost()
    local unitData = EquipTrainHelper.getCurEquipUnitData()
    return EquipTrainHelper.getLimitUpCoinCostByUnitData(unitData)
end

function EquipTrainHelper.getLimitUpCoinCostByUnitData(unitData)
    if not unitData then
        return 0
    end

    local config = unitData:getConfig()
    local curTemplateId = config.levelup_templet
    local curlevel = unitData:getLevel()
    if config.potential_after == 0 then
        return 0
    end
    local configAfter = EquipTrainHelper.getConfigByBaseId(config.potential_after)
    local afterTemplateId = configAfter.levelup_templet
    local coinCost = 0
    for lv = 1, curlevel - 1 do
        local levelupConfig = EquipmentLevelup.get(lv, curTemplateId)
        local levelupConfigAfter = EquipmentLevelup.get(lv, afterTemplateId)
        coinCost = coinCost + (levelupConfigAfter.silver - levelupConfig.silver)
    end

    return math.floor(coinCost * 0.689) -- 固定系数
end

-- 是否有相应的消耗材料
function EquipTrainHelper.isHaveLimitUpCostMaterials(key)
    local unitData = EquipTrainHelper.getCurEquipUnitData()
    return EquipTrainHelper.isHaveLimitUpCostMaterialsByUnitData(key, unitData)
end

function EquipTrainHelper.isHaveLimitUpCostMaterialsByUnitData(key, unitData)
    local DataConst = require("app.const.DataConst")
    if not unitData then
        return false
    end
    local info = EquipTrainHelper.getLimitUpCostInfoByUnitData(unitData)
    local curCount = unitData:getMaterials()[key]
    local maxSize = info["size_" .. key]
    if not maxSize then
        return false
    end
    local isFull = curCount >= maxSize
    if not isFull then
        local count =
            require("app.utils.UserDataHelper").getNumByTypeAndValue(info["type_" .. key], info["value_" .. key]) +
            curCount
        if count >= maxSize then
            return true, isFull
        end
    end
    return false, isFull
end

-- 是否可以界限突破
function EquipTrainHelper.canLimitUp(baseId)
    local config = EquipTrainHelper.getConfigByBaseId(baseId)
    if config.suit_id > 0 then
        return true
    end
    return false
end

-- 装备界限红点
function EquipTrainHelper.isNeedRedPoint()
    local unitData = EquipTrainHelper.getCurEquipUnitData()
    return EquipTrainHelper.isNeedRedPointByUnitData(unitData)
end

-- 装备界限红点
function EquipTrainHelper.isNeedRedPointByUnitData(unitData)
    local isRed = false
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE4)
    if not isOpen then
        return isRed
    end
    for key = LimitCostConst.LIMIT_COST_KEY_2, LimitCostConst.LIMIT_COST_KEY_4 do
        local isHave = EquipTrainHelper.isHaveLimitUpCostMaterialsByUnitData(key, unitData)
        isRed = isRed or isHave
    end
    local UserDataHelper = require("app.utils.UserDataHelper")
    local isAllFull = EquipTrainHelper.equipLimitUpIsAllFullByUnitData(unitData)
    local strSilver = EquipTrainHelper.getLimitUpCoinCostByUnitData(unitData)
    local haveCoin = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, 2) -- 银币数量
    local isEnough = haveCoin >= strSilver
    isRed = isRed or (isAllFull and isEnough)
    return isRed
end

-- function EquipTrainHelper.limitUpRefineExp(base_Id, refineLevel)
--     local equipConfig = Equipment.get(base_Id)
--     if not equipConfig then
--         return 0
--     end
--     local curTemplateId = equipConfig.levelup_templet
--     local afterId = equipConfig.potential_after
--     local afterConfig = Equipment.get(afterId)
--     if not afterConfig then
--         return 0
--     end
--     local afterTemplateId = afterConfig.levelup_templet
--     local refineCost = 0
--     if refineLevel > 0 then
--         for level = 0, refineLevel - 1 do
--             local refineConfig = EquipmentRefine.get(level, curTemplateId)
--             local refineConfigAfter = EquipmentRefine.get(level, afterTemplateId)
--             refineCost = refineCost + (refineConfigAfter.exp - refineConfig.exp)
--         end
--     end

--     return refineCost + 1 -- 精炼石消耗
-- end

-- 获取可显示的tab数量
function EquipTrainHelper.getShowEquipTrainTab()
    local EquipConst = require("app.const.EquipConst")
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local data = {}
    local curUnitData = EquipTrainHelper.getCurEquipUnitData()
    for index = 1, EquipConst.EQUIP_TRAIN_MAX_TAB do
        if LogicCheckHelper.funcIsShow(FunctionConst["FUNC_EQUIP_TRAIN_TYPE" .. index]) then
            if index == EquipConst.EQUIP_TRAIN_LIMIT then --
                if EquipTrainHelper.canLimitUp(curUnitData:getBase_id()) then
                    table.insert(data, index)
                end
            else
                table.insert(data, index)
            end
        end
    end
    
    return data
end

function EquipTrainHelper.copyEquipData(object)
    local lookup_table = {}
    local function _copy(object)
        if type(object) ~= "table" then
            return object
        elseif lookup_table[object] then
            return lookup_table[object]
        end
        local new_table = {}
        lookup_table[object] = new_table
        for index, value in pairs(object) do
            new_table[_copy(index)] = _copy(value)
        end
        return setmetatable(new_table, getmetatable(object))
    end

    return _copy(object)
end

-- 是否有可装备和更好的玉石
function EquipTrainHelper.haveBetterAndCanEquipJade(equipId, jadeId, slot)
    local params = {}
    if jadeId and jadeId > 0 then
        params.jadeId = jadeId
    end
    if slot > 1 then
        params.property = 2
    else
        params.property = 1
    end
    local equipUnitData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
    if not equipUnitData:isInBattle() then
        return false, false
    end
    params.equipBaseId = equipUnitData:getBase_id()
    params.equipId = equipId
    params.hideWear = true
    local jade = G_UserData:getJade()
    local jadeUnitData = jade:getJadeDataById(jadeId)
    local better = false
    local list = jade:getJadeListByEquip(params, FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)
    local UserDataHelper = require("app.utils.UserDataHelper")
    local _, heroBaseId = UserDataHelper.getHeroBaseIdWithEquipId(equipId)
    local isHave = EquipTrainHelper._isHaveSuitable(heroBaseId, list, equipUnitData)
    if jadeUnitData then
        if not jadeUnitData:isSuitableHero(heroBaseId) then
            better = #list > 0 and isHave
        end
        for i = 1, #list do
            if better then
                break
            end
            if
                list[i]:getConfig().color > jadeUnitData:getConfig().color and
                    not equipUnitData:isHaveTwoSameJade(list[i]:getId()) and
                    list[i]:isSuitableHero(heroBaseId)
             then
                better = true
            end
        end
    end
    return #list > 0 and isHave, better
end

function EquipTrainHelper._isHaveSuitable(heroBaseId, list, equipUnitData)
    local isHave = false
    for i = 1, #list do
        if list[i]:isSuitableHero(heroBaseId) and not equipUnitData:isHaveTwoSameJade(list[i]:getId()) then
            isHave = true
        end
    end
    return isHave
end

-- 玉石红点
function EquipTrainHelper.needJadeRedPoint(equipId)
    local needRed = false
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)
    if not isOpen then
        return needRed
    end
    local equipUnitData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
    if not equipUnitData:isInBattle() then
        return needRed
    end
    local jades = equipUnitData:getJades()
    local slotList = string.split(equipUnitData:getConfig().inlay_type, "|")
    for i = 1, #jades do
        if tonumber(slotList[i]) > 0 then
            local isHave, haveBetter = EquipTrainHelper.haveBetterAndCanEquipJade(equipId, jades[i], i)
            if jades[i] == 0 then
                needRed = needRed or isHave
            end
            needRed = needRed or haveBetter
            if needRed then
                return needRed
            end
        end
    end
    return needRed
end

-- 获取装备玉石属性
function EquipTrainHelper.getEquipJadeAttr(unitData)
    local jades = unitData:getJades()
    local EquipJadeHelper = require("app.scene.view.equipmentJade.EquipJadeHelper")
    local attrInfo = {}
    for i = 1, #jades do
        if jades[i] > 0 then
            local jadeUnitData = G_UserData:getJade():getJadeDataById(jades[i])
            local cfg = jadeUnitData:getConfig()
            local _, heroBaseId = jadeUnitData:getEquipHeroBaseId()
            local isSuitable = jadeUnitData:isSuitableHero(heroBaseId)
            table.insert(
                attrInfo,
                {
                    order = i,
                    type = cfg.type,
                    value = EquipJadeHelper.getRealAttrValue(cfg, G_UserData:getBase():getLevel()),
                    property = cfg.property,
                    description = cfg.description,
                    isSuitable = isSuitable
                }
            )
        end
    end
    table.sort(
        attrInfo,
        function(t1, t2)
            return t1.order > t2.order
        end
    )
    return attrInfo
end

return EquipTrainHelper
