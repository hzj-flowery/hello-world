--
-- Author: Liangxu
-- Date: 2017-9-7 14:06:54
-- 神兵单元数据
local BaseData = require("app.data.BaseData")
local JadeStoneUnitData = class("JadeStoneUnitData", BaseData)

local schema = {}
schema["id"] = {"number", 0} --唯一Id
schema["sys_id"] = {"number", 0} --静态Id
schema["equipment_id"] = {"number", 0} --装备于哪件装备
schema["equiped_type"] = {"number", 0} --0:装备 1:宝物
schema["config"] = {"table", {}} --配置表信息

JadeStoneUnitData.schema = schema

function JadeStoneUnitData:ctor(properties)
    JadeStoneUnitData.super.ctor(self, properties)
end

function JadeStoneUnitData:clear()
end

function JadeStoneUnitData:reset()
end

function JadeStoneUnitData:updateData(data)
    self:setProperties(data)
    local config = require("app.config.jade").get(data.sys_id)
    assert(config, "jade config can not find id = " .. tostring(data.sys_id))
    self:setConfig(config)
end

-- 装备于那个英雄
function JadeStoneUnitData:getEquipHeroBaseId()
    if self:getEquipment_id() > 0 then
        local UserDataHelper = require("app.utils.UserDataHelper")
        if self:getEquiped_type() == 0 then --装备
            local heroBaseId, convertHeroBaseId = UserDataHelper.getHeroBaseIdWithEquipId(self:getEquipment_id())
            return heroBaseId, convertHeroBaseId
        elseif self:getEquiped_type() == 1 then --宝物
            local heroBaseId, convertHeroBaseId = UserDataHelper.getHeroBaseIdWithTreasureId(self:getEquipment_id())
            return heroBaseId, convertHeroBaseId
        end
    else
        return nil
    end
end

-- 装备于哪个武将
function JadeStoneUnitData:getEquipHeroBaseData()
    if self:getEquipment_id() > 0 then
        local UserDataHelper = require("app.utils.UserDataHelper")
        if self:getEquiped_type() == 0 then --装备
            local heroUnitData = UserDataHelper.getHeroDataWithEquipId(self:getEquipment_id())
            return heroUnitData
        elseif self:getEquiped_type() == 1 then --宝物
            local heroUnitData = UserDataHelper.getHeroDataWithTreasureId(self:getEquipment_id())
            return heroUnitData
        end
    else
        return nil
    end
end

-- 是否被装备镶嵌了
function JadeStoneUnitData:isInEquipment()
    return self:getEquipment_id() > 0
end

-- 是否适用于该装备
function JadeStoneUnitData:isSuitableEquipment(baseId)
    local suitableInfo = string.split(self:getConfig().equipment, "|")
    for i = 1, #suitableInfo do
        if tonumber(suitableInfo[i]) == baseId then
            return true
        end
    end
    return false
end

-- 是否适用于该宝物
function JadeStoneUnitData:isSuitableTreasure(baseId)
    local suitableInfo = string.split(self:getConfig().treasure, "|")
    for i = 1, #suitableInfo do
        if tonumber(suitableInfo[i]) == baseId then
            return true
        end
    end
    return false
end

-- 是否适用该武将
function JadeStoneUnitData:isSuitableHero(heroBaseId)
    local EquipJadeHelper = require("app.scene.view.equipmentJade.EquipJadeHelper")
    return EquipJadeHelper.isSuitableHero(self:getConfig(), heroBaseId)
end

function JadeStoneUnitData:getType()
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    return TypeConvertHelper.TYPE_JADE_STONE
end

return JadeStoneUnitData
