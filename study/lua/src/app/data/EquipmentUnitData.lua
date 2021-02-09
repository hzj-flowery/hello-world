--
-- Author: Liangxu
-- Date: 2017-04-06 14:17:45
-- 装备单元数据
local BaseData = require("app.data.BaseData")
local EquipmentUnitData = class("EquipmentUnitData", BaseData)

local schema = {}
schema["id"] = {"number", 0} --唯一Id
schema["base_id"] = {"number", 0} --静态表Id
schema["level"] = {"number", 0} --强化等级
schema["star"] = {"number", 0} --星级
schema["rank"] = {"number", 0} --品质
schema["money"] = {"number", 0} --强化消耗的钱
schema["time"] = {"number", 0} --获得时间
schema["user_id"] = {"number", 0} --玩家id
schema["r_level"] = {"number", 0} --精炼等级
schema["r_exp"] = {"number", 0} --精炼经验
schema["all_exp"] = {"number", 0} --精炼消耗的经验
schema["config"] = {"table", {}} --配置表信息
schema["yokeRelation"] = {"boolean", false} --是否有羁绊关系
schema["materials"] = {"table", {}} -- 界限突破消耗材料
schema["recycle_materials"] = {"table", {}} -- 界限突破回收材料、
schema["jades"] = {"table", {}} -- 装备玉石、
schema["change"] = {"number", 0} --装备是否有重新强化或精炼过
schema["last_jades"] = {"table", {}}
EquipmentUnitData.schema = schema

function EquipmentUnitData:ctor(properties)
    EquipmentUnitData.super.ctor(self, properties)
    self._isUser = true
end

function EquipmentUnitData:clear()
end

function EquipmentUnitData:reset()
end

function EquipmentUnitData:updateData(data)
    self:backupJades()
    self:setProperties(data)
    local config = require("app.config.equipment").get(data.base_id)
    assert(config, "equipmentConfig can't find base_id = " .. tostring(data.base_id))
    self:setConfig(config)
end

function EquipmentUnitData:getPos()
    local id = self:getId()
    local data = G_UserData:getBattleResource():getEquipDataWithId(id)
    if data then
        return data:getPos()
    else
        return nil
    end
end

function EquipmentUnitData:getSlot()
    local id = self:getId()
    local data = G_UserData:getBattleResource():getEquipDataWithId(id)
    if data then
        return data:getSlot()
    else
        return nil
    end
end

function EquipmentUnitData:isInBattle()
    local id = self:getId()
    local data = G_UserData:getBattleResource():getEquipDataWithId(id)
    if data == nil then
        return false
    else
        return true
    end
end

-- 是否镶嵌玉石
function EquipmentUnitData:isInjectJadeStone()
    local jades = self:getJades()
    for i = 1, #jades do
        if jades[i] > 0 then
            return true
        end
    end
    return false
end

--是否强化过
function EquipmentUnitData:isDidStrengthen()
    return self:getLevel() > 1
end

--是否精炼过
function EquipmentUnitData:isDidRefine()
    return self:getR_level() > 0
end

--是否养成过
function EquipmentUnitData:isDidTrain()
    local isDidStrengthen = self:isDidStrengthen()
    local isDidRefine = self:isDidRefine()
    if isDidStrengthen or isDidRefine then
        return true
    else
        return false
    end
end

-- 获取相应槽位获取玉石系统id
function EquipmentUnitData:getJadeSysIds()
    local jadeSysIds = {}
    local jades = self:getJades()
    for i = 1, #jades do
        if jades[i] > 0 then
            local unitData = G_UserData:getJade():getJadeDataById(jades[i])
            jadeSysIds[i] = unitData:getConfig().id
        else
            jadeSysIds[i] = 0
        end
    end
    return jadeSysIds
end

--------------------------------------------------
---TODO：因该是通过ID==0来判断
function EquipmentUnitData:setIsUserEquip(isUser)
    self._isUser = isUser
end

function EquipmentUnitData:isUserEquip()
    return self._isUser
end

-- 是否界限突破过
function EquipmentUnitData:isLimitUp()
    local bres = false
    for k, v in pairs(self:getMaterials()) do
        if v > 0 then
            bres = true
        end
    end
    if #self:getRecycle_materials() > 0 then
        bres = true
    end
    return bres
end

-- 是否为白板装备
function EquipmentUnitData:isBlackPlat()
    local flag = self:getMoney() == 0
    flag = flag and self:getAll_exp() == 0
    flag = flag and #self:getRecycle_materials() == 0
    flag = flag and not self:isDidTrain()
    for k, v in pairs(self:getMaterials()) do
        flag = flag and v == 0
    end
    for k, v in pairs(self:getJades()) do
        flag = flag and v == 0
    end
    return flag
end

-- 判断是否已经镶嵌了两颗同玉石
function EquipmentUnitData:isHaveTwoSameJade(jadeId)
    local jadeUnit = G_UserData:getJade():getJadeDataById(jadeId)
    local slots = {}
    if not jadeUnit then
        return false
    end
    local jades = self:getJades()
    local count = 0
    for i = 1, #jades do
        if jades[i] > 0 then
            local unitData = G_UserData:getJade():getJadeDataById(jades[i])
            if jadeUnit:getConfig().id == unitData:getConfig().id then
                count = count + 1
                slots[i] = true
            end
        end
    end
    return count >= 2, slots
end

function EquipmentUnitData:backupJades()
    local lastJade = {}
    local jades = self:getJades()
    for i = 1, #jades do
        table.insert(lastJade, jades[i])
    end
    self:setLast_jades(lastJade)
end

-- 属性玉石是否镶嵌满
function EquipmentUnitData:isFullAttrJade()
    local config = self:getConfig()
    if config.suit_id == 0 then
        return false
    end
    local slotinfo = string.split(config.inlay_type, "|")
    local jades = self:getJades()
    for i = 2, #slotinfo do
        if tonumber(slotinfo[i]) > 0 then
            if jades[i] == 0 then
                return false
            else
                if not self:isActiveJade(jades[i]) then
                    return false
                end
            end
        end
    end
    return true
end

-- 玉石是否生效
function EquipmentUnitData:isActiveJade(id)
    local unitData = G_UserData:getJade():getJadeDataById(id)
    local UserDataHelper = require("app.utils.UserDataHelper")
    local _, heroBaseId = UserDataHelper.getHeroBaseIdWithEquipId(self:getId())
    local isSuitable = unitData:isSuitableHero(heroBaseId)
    return isSuitable
end

-- 所有玉石是否镶嵌满
function EquipmentUnitData:isFullJade()
    local config = self:getConfig()
    local slotinfo = string.split(config.inlay_type, "|")
    if tonumber(slotinfo[1]) == 0 then
        return false
    end
    local jades = self:getJades()
    for i = 1, #slotinfo do
        if tonumber(slotinfo[i]) > 0 then
            if jades[i] == 0 then
                return false
            else
                if not self:isActiveJade(jades[i]) then
                    return false
                end
            end
        end
    end
    return true
end

-- 设置查看用户数据时的装备玉石sys_id
function EquipmentUnitData:setUserDetailJades(slot, sysId)
    self._userDetailJades = self._userDetailJades or {}
    self._userDetailJades[slot] = sysId
end

function EquipmentUnitData:getUserDetailJades()
    return self._userDetailJades 
end

function EquipmentUnitData:getJadeSlotNums()
    local config = self:getConfig()
    if config.suit_id == 0 then
        return 0
    end
    local count = 0
    local slotinfo = string.split(config.inlay_type, "|")
    for _, value in pairs(slotinfo) do
        if tonumber(value) > 0 then
            count = count + 1
        end
    end
    return count
end
-------------------------------------------

return EquipmentUnitData
