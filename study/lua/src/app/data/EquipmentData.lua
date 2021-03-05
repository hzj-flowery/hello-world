--
-- Author: Liangxu
-- Date: 2017-04-06 11:28:23
-- 装备数据
local BaseData = require("app.data.BaseData")
local EquipmentData = class("EquipmentData", BaseData)
local EquipmentUnitData = require("app.data.EquipmentUnitData")
local UserDataHelper = require("app.utils.UserDataHelper")

local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")

local schema = {}
schema["curEquipId"] = {"number", 0} --当前选中的装备Id
EquipmentData.schema = schema

function EquipmentData:ctor(properties)
    EquipmentData.super.ctor(self, properties)

    self._equipmentList = {}

    self._recvGetEquipment =
        G_NetworkManager:add(MessageIDConst.ID_S2C_GetEquipment, handler(self, self._s2cGetEquipment))
    self._recvAddFightEquipment =
        G_NetworkManager:add(MessageIDConst.ID_S2C_AddFightEquipment, handler(self, self._s2cAddFightEquipment))
    self._recvClearFightEquipment =
        G_NetworkManager:add(MessageIDConst.ID_S2C_ClearFightEquipment, handler(self, self._s2cClearFightEquipment))
    self._recvUpgradeEquipment =
        G_NetworkManager:add(MessageIDConst.ID_S2C_UpgradeEquipment, handler(self, self._s2cUpgradeEquipment))
    self._recvRefineEquipment =
        G_NetworkManager:add(MessageIDConst.ID_S2C_RefineEquipment, handler(self, self._s2cRefineEquipment))
    self._recvEquipmentRecycle =
        G_NetworkManager:add(MessageIDConst.ID_S2C_EquipmentRecycle, handler(self, self._s2cEquipmentRecycle))
    self._recvEquipmentReborn =
        G_NetworkManager:add(MessageIDConst.ID_S2C_EquipmentReborn, handler(self, self._s2cEquipmentReborn))
    self._recvSuperUpgradeEquipment =
        G_NetworkManager:add(MessageIDConst.ID_S2C_SuperUpgradeEquipment, handler(self, self._s2cSuperUpgradeEquipment))
    self._recvEquipmentLimitCost =
        G_NetworkManager:add(MessageIDConst.ID_S2C_EquipmentLimitCost, handler(self, self._s2cEquipmentLimitCost))
end

function EquipmentData:clear()
    self._recvGetEquipment:remove()
    self._recvGetEquipment = nil
    self._recvAddFightEquipment:remove()
    self._recvAddFightEquipment = nil
    self._recvClearFightEquipment:remove()
    self._recvClearFightEquipment = nil
    self._recvUpgradeEquipment:remove()
    self._recvUpgradeEquipment = nil
    self._recvRefineEquipment:remove()
    self._recvRefineEquipment = nil
    self._recvEquipmentRecycle:remove()
    self._recvEquipmentRecycle = nil
    self._recvEquipmentReborn:remove()
    self._recvEquipmentReborn = nil
    self._recvSuperUpgradeEquipment:remove()
    self._recvSuperUpgradeEquipment = nil
    self._recvEquipmentLimitCost:remove()
    self._recvEquipmentLimitCost = nil
end

--创建临时装备数据
function EquipmentData:createTempEquipUnitData(baseId)
    local baseData = {}
    baseData.id = 1
    baseData.base_id = baseId or 1
    baseData.level = 1
    baseData.exp = 1
    baseData.star = 1
    baseData.rank = 1
    baseData.money = 1
    baseData.time = 1
    baseData.user_id = 1
    baseData.r_level = 0
    baseData.r_exp = 1
    baseData.all_exp = 1
    local unitData = EquipmentUnitData.new()
    unitData:updateData(baseData)
    unitData:setIsUserEquip(false)

    return unitData
end

function EquipmentData:reset()
    self._equipmentList = {}
end

function EquipmentData:_setEquipmentData(data)
    self:_updateChange(self._equipmentList["k_" .. tostring(data.id)], data)
    self._equipmentList["k_" .. tostring(data.id)] = nil
    local unitData = EquipmentUnitData.new()
    unitData:updateData(data)
    self._equipmentList["k_" .. tostring(data.id)] = unitData
end

function EquipmentData:_s2cGetEquipment(id, message)
    self._equipmentList = {}
    local equipmentList = rawget(message, "equipments") or {}
    for i, data in ipairs(equipmentList) do
        self:_setEquipmentData(data)
    end
end

-- 装备是否有重新强化或精炼过
function EquipmentData:_updateChange(curData, newData)
    newData.change = 0
    if not curData then
        return
    end
    newData.change = curData:getChange()
    if curData:getMoney() ~= newData.money and newData.money > 0 then
        newData.change = 1 -- 强化过
        return
    end
    -- local re1 = EquipTrainHelper.limitUpRefineExp(curData:getBase_id(), curData:getR_level())
    -- local re2 = EquipTrainHelper.limitUpRefineExp(curData:getBase_id(), newData.r_level)

    -- local per1 = re1 == 1 and 1 or math.min(100, math.floor(curData:getMaterials()[1] / re1 * 100))
    -- local per2 = re2 == 1 and 1 or math.min(100, math.floor(newData.materials[1] / re2 * 100))
    -- -- logWarn("EquipmentData:_updateChange " .. per1 .. " " .. per2)
    -- if per1 > per2 then
    --     if newData.change == 1 then
    --         newData.change = 3 --两者都有
    --     else
    --         newData.change = 2 -- 精炼过
    --     end
    --     return
    -- end
    newData.change = 0
end

--
function EquipmentData:getEquipmentIdsWithBaseId(base_id)
    local ids = {}
    for i, data in pairs(self._equipmentList) do
        if data:getBase_id() == base_id and data:getId() ~= self:getCurEquipId() then
            table.insert(ids, data:getId())
        end
    end
    return ids
end

function EquipmentData:getEquipmentDataWithId(id)
    return self._equipmentList["k_" .. tostring(id)]
end

function EquipmentData:updateData(data)
    if data == nil or type(data) ~= "table" then
        return
    end
    if self._equipmentList == nil then
        return
    end
    for i = 1, #data do
        self:_setEquipmentData(data[i])
    end
end

function EquipmentData:insertData(data)
    if data == nil or type(data) ~= "table" then
        return
    end
    if self._equipmentList == nil then
        return
    end
    for i = 1, #data do
        self:_setEquipmentData(data[i])
    end
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_EQUIP)
end

function EquipmentData:deleteData(data)
    if data == nil or type(data) ~= "table" then
        return
    end
    if self._equipmentList == nil then
        return
    end
    for i = 1, #data do
        local id = data[i]
        self._equipmentList["k_" .. tostring(id)] = nil
    end
end

function EquipmentData:getEquipTotalCount()
    local count = 0
    for k, v in pairs(self._equipmentList) do
        count = count + 1
    end
    return count
end

function EquipmentData:getEquipIdWithBaseId(baseId)
    for k, data in pairs(self._equipmentList) do
        if data:getBase_id() == baseId then
            return data:getId()
        end
    end
    return nil
end

--获取排序后的装备列表数据
function EquipmentData:getListDataBySort()
    local result = {}
    local wear = {} --已穿戴
    local noWear = {} --未穿戴

    local function sortFun1(a, b)
        local configA = a:getConfig()
        local configB = b:getConfig()
        if configA.color ~= configB.color then
            return configA.color > configB.color
        elseif configA.potential ~= configB.potential then
            return configA.potential > configB.potential
        elseif a:getLevel() ~= b:getLevel() then
            return a:getLevel() > b:getLevel()
        elseif a:getR_level() ~= b:getR_level() then
            return a:getR_level() > b:getR_level()
        else
            return configA.id < configB.id
        end
    end

    local function sortFun2(a, b)
        local configA = a:getConfig()
        local configB = b:getConfig()
        if configA.color ~= configB.color then
            return configA.color > configB.color
        elseif configA.potential ~= configB.potential then
            return configA.potential > configB.potential
        elseif a:getLevel() ~= b:getLevel() then
            return a:getLevel() > b:getLevel()
        elseif a:getR_level() ~= b:getR_level() then
            return a:getR_level() > b:getR_level()
        else
            return configA.id < configB.id
        end
    end

    for k, data in pairs(self._equipmentList) do
        local isInBattle = data:isInBattle()
        if isInBattle then
            table.insert(wear, data)
        else
            table.insert(noWear, data)
        end
    end

    table.sort(wear, sortFun1)
    table.sort(noWear, sortFun2)

    for i, data in ipairs(wear) do
        table.insert(result, data:getId())
    end

    for i, data in ipairs(noWear) do
        table.insert(result, data:getId())
    end

    return result
end

--根据装备位置获取更换装备列表
function EquipmentData:getReplaceEquipmentListWithSlot(pos, slot)
    local result = {}
    local noWear = {}
    local wear = {}

    local function sortFun(a, b)
        local configA = a:getConfig()
        local configB = b:getConfig()
        local yokeA = a:isYokeRelation() == true and 1 or 0
        local yokeB = b:isYokeRelation() == true and 1 or 0
        if yokeA ~= yokeB then
            return yokeA > yokeB
        elseif configA.color ~= configB.color then
            return configA.color > configB.color
        elseif configA.potential ~= configB.potential then
            return configA.potential > configB.potential
        elseif a:getLevel() ~= b:getLevel() then
            return a:getLevel() > b:getLevel()
        elseif a:getR_level() ~= b:getR_level() then
            return a:getR_level() > b:getR_level()
        else
            return configA.id < configB.id
        end
    end

    local heroBaseId = UserDataHelper.getHeroBaseIdWithPos(pos)
    for k, unit in pairs(self._equipmentList) do
        if unit:getConfig().type == slot then
            local isYoke = UserDataHelper.isHaveYokeBetweenHeroAndEquip(heroBaseId, unit:getBase_id())
            unit:setYokeRelation(isYoke)
            local data = G_UserData:getBattleResource():getEquipDataWithId(unit:getId())
            if data then
                if data:getPos() ~= pos then
                    table.insert(wear, unit)
                end
            else
                table.insert(noWear, unit)
            end
        end
    end
    table.sort(wear, sortFun)
    table.sort(noWear, sortFun)

    for i, data in ipairs(noWear) do
        table.insert(result, data)
    end
    for i, data in ipairs(wear) do
        table.insert(result, data)
    end

    return result, noWear, wear
end

--获取装备回收列表
function EquipmentData:getRecoveryList()
    local result = {}

    local sortFun = function(a, b)
        local colorA = a:getConfig().color
        local colorB = b:getConfig().color
        local typeA = a:getConfig().type
        local typeB = b:getConfig().type
        local isTrainA = a:isDidTrain() and 1 or 0
        local isTrainB = b:isDidTrain() and 1 or 0

        if colorA ~= colorB then
            return colorA < colorB
        elseif typeA ~= typeB then
            return typeA < typeB
        elseif isTrainA ~= isTrainB then
            return isTrainA < isTrainB
        elseif a:getR_level() ~= b:getR_level() then
            return a:getR_level() < b:getR_level()
        elseif a:getLevel() ~= b:getLevel() then
            return a:getLevel() < b:getLevel()
        else
            return a:getBase_id() < b:getBase_id()
        end
    end

    for k, unit in pairs(self._equipmentList) do
        local color = unit:getConfig().color
        -- if color ~= 6 then --红色不可回收
        local isInBattle = unit:isInBattle()
        local isInjectJade = unit:isInjectJadeStone()
        if not isInBattle and not isInjectJade then
            table.insert(result, unit)
        end
        -- end
    end

    table.sort(result, sortFun)

    return result
end

--获取装备回收自动添加列表
function EquipmentData:getRecoveryAutoList()
    local result = {}

    local sortFun = function(a, b)
        local colorA = a:getConfig().color
        local colorB = b:getConfig().color
        local typeA = a:getConfig().type
        local typeB = b:getConfig().type
        local isTrainA = a:isDidTrain() and 1 or 0
        local isTrainB = b:isDidTrain() and 1 or 0

        if colorA ~= colorB then
            return colorA < colorB
        elseif typeA ~= typeB then
            return typeA < typeB
        elseif isTrainA ~= isTrainB then
            return isTrainA < isTrainB
        elseif a:getR_level() ~= b:getR_level() then
            return a:getR_level() < b:getR_level()
        elseif a:getLevel() ~= b:getLevel() then
            return a:getLevel() < b:getLevel()
        else
            return a:getBase_id() < b:getBase_id()
        end
    end

    for k, unit in pairs(self._equipmentList) do
        local color = unit:getConfig().color
        if color < 5 then
            local isInBattle = unit:isInBattle()
            local isInjectJade = unit:isInjectJadeStone()
            if not isInBattle and not isInjectJade then
                table.insert(result, unit)
            end
        end
    end

    table.sort(result, sortFun)

    return result
end

--获取装备重生列表
function EquipmentData:getRebornList()
    local result = {}

    local sortFun = function(a, b)
        local colorA = a:getConfig().color
        local colorB = b:getConfig().color
        local typeA = a:getConfig().type
        local typeB = b:getConfig().type
        local isTrainA = a:isDidTrain() and 1 or 0
        local isTrainB = b:isDidTrain() and 1 or 0

        if colorA ~= colorB then
            return colorA < colorB
        elseif typeA ~= typeB then
            return typeA < typeB
        elseif isTrainA ~= isTrainB then
            return isTrainA < isTrainB
        elseif a:getR_level() ~= b:getR_level() then
            return a:getR_level() < b:getR_level()
        elseif a:getLevel() ~= b:getLevel() then
            return a:getLevel() < b:getLevel()
        else
            return a:getBase_id() < b:getBase_id()
        end
    end

    for k, unit in pairs(self._equipmentList) do
        local color = unit:getConfig().color
        -- if color ~= 6 then --红色不可回收
        local isDidStrengthen = unit:isDidStrengthen()
        local isDidRefine = unit:isDidRefine()
        local islimit = unit:isLimitUp()
        if isDidStrengthen or isDidRefine or islimit then
            local isInBattle = unit:isInBattle()
            local isInjectJade = unit:isInjectJadeStone()
            if not isInBattle and not isInjectJade then
                table.insert(result, unit)
            end
        end
        -- end
    end

    table.sort(result, sortFun)

    return result
end

--判断是否有没穿戴的装备，且装备slot符合要求（红点机制）
function EquipmentData:isHaveEquipmentNotInPos(slot)
    for k, unit in pairs(self._equipmentList) do
        local pos = unit:getPos()
        if pos == nil and unit:getConfig().type == slot then
            return true
        end
    end
    return false
end

--判断是否有更好的装备（红点机制）
function EquipmentData:isHaveBetterEquip(pos, slot)
    local function isBetter(a, b) --retrun true: a比b好
        local colorA = a:getConfig().color
        local potentialA = a:getConfig().potential
        local levelA = a:getLevel()
        local rLevelA = a:getR_level()

        local colorB = b:getConfig().color
        local potentialB = b:getConfig().potential
        local levelB = b:getLevel()
        local rLevelB = b:getR_level()

        if colorA ~= colorB then
            return colorA > colorB
        elseif potentialA ~= potentialB then
            return potentialA > potentialB
        elseif levelA ~= levelB then
            return levelA > levelB
        elseif rLevelA ~= rLevelB then
            return rLevelA > rLevelB
        end
    end

    local equipId = G_UserData:getBattleResource():getResourceId(pos, 1, slot)
    if not equipId then
        return false
    end

    local equipData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
    if not equipData then
        return false
    end

    for k, unit in pairs(self._equipmentList) do
        local pos = unit:getPos()
        if pos == nil and unit:getConfig().type == slot then
            if isBetter(unit, equipData) then
                return true
            end
        end
    end
    return false
end

--==========================协议部分=======================================================
--穿装备
function EquipmentData:c2sAddFightEquipment(pos, slot, id)
    G_NetworkManager:send(
        MessageIDConst.ID_C2S_AddFightEquipment,
        {
            pos = pos,
            slot = slot,
            id = id
        }
    )
end

function EquipmentData:_s2cAddFightEquipment(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end

    local pos = rawget(message, "pos")
    local slot = rawget(message, "slot")
    local id = rawget(message, "id")

    local oldId = rawget(message, "old_id") or 0
    local oldPos = rawget(message, "old_pos") or 0
    local oldSlot = rawget(message, "old_slot") or 0

    G_UserData:getBattleResource():setEquipPosTable(pos, slot, id, oldId, oldPos, oldSlot)

    G_SignalManager:dispatch(SignalConst.EVENT_EQUIP_ADD_SUCCESS, oldId, pos, slot)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_EQUIP)
end

--脱装备
function EquipmentData:c2sClearFightEquipment(pos, slot)
    G_NetworkManager:send(
        MessageIDConst.ID_C2S_ClearFightEquipment,
        {
            pos = pos,
            slot = slot
        }
    )
end

function EquipmentData:_s2cClearFightEquipment(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end

    local pos = rawget(message, "pos")
    local slot = rawget(message, "slot")
    local oldId = rawget(message, "old_id")

    G_UserData:getBattleResource():clearEquipPosTable(pos, slot, oldId)

    G_SignalManager:dispatch(SignalConst.EVENT_EQUIP_CLEAR_SUCCESS, slot)
    -- G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_EQUIP)
end

--强化装备
function EquipmentData:c2sUpgradeEquipment(id, times)
    G_NetworkManager:send(
        MessageIDConst.ID_C2S_UpgradeEquipment,
        {
            id = id,
            times = times
        }
    )
end

function EquipmentData:_s2cUpgradeEquipment(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end

    local times = rawget(message, "times") or 0 --强化次数
    local critTimes = rawget(message, "crit_times") or 0 --暴击次数
    local breakReason = rawget(message, "break_reason") or 0 --结束理由, 1钱不足，2到最大等级
    local level = rawget(message, "level") or 0 --强化后等级
    local crits = rawget(message, "crits") or {} --暴击日志
    local saveMoney = rawget(message, "save_money") or 0 --节省的钱

    local data = {
        times = times,
        critTimes = critTimes,
        breakReason = breakReason,
        level = level,
        crits = crits,
        saveMoney = saveMoney
    }

    G_SignalManager:dispatch(SignalConst.EVENT_EQUIP_UPGRADE_SUCCESS, data)
end

--精炼装备
function EquipmentData:c2sRefineEquipment(id, type, item)
    if item then
        G_NetworkManager:send(
            MessageIDConst.ID_C2S_RefineEquipment,
            {
                id = id,
                type = type,
                item = item
            }
        )
    else
        G_NetworkManager:send(
            MessageIDConst.ID_C2S_RefineEquipment,
            {
                id = id,
                type = type
            }
        )
    end
end

function EquipmentData:_s2cRefineEquipment(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end

    local rLevel = rawget(message, "r_level") or 0 --精炼后的等级
    local rExp = rawget(message, "r_exp") or 0 --精炼后的经验
    local subItem = rawget(message, "sub_item") or {} --所需要的精炼石

    local data = {
        rLevel = rLevel,
        rExp = rExp,
        subItem = subItem
    }

    G_SignalManager:dispatch(SignalConst.EVENT_EQUIP_REFINE_SUCCESS, data)
end

--装备回收
function EquipmentData:c2sEquipmentRecycle(equipIds)
    G_NetworkManager:send(
        MessageIDConst.ID_C2S_EquipmentRecycle,
        {
            equipment_id = equipIds
        }
    )
end

function EquipmentData:_s2cEquipmentRecycle(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end

    local awards = rawget(message, "awards") or {}
    G_SignalManager:dispatch(SignalConst.EVENT_EQUIP_RECOVERY_SUCCESS, awards)
end

--装备重生
function EquipmentData:c2sEquipmentReborn(equipId)
    G_NetworkManager:send(
        MessageIDConst.ID_C2S_EquipmentReborn,
        {
            equipment_id = equipId
        }
    )
end

function EquipmentData:_s2cEquipmentReborn(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end

    local awards = rawget(message, "awards") or {}
    G_SignalManager:dispatch(SignalConst.EVENT_EQUIP_REBORN_SUCCESS, awards)
end

--一键强化
function EquipmentData:c2sSuperUpgradeEquipment(pos)
    G_NetworkManager:send(
        MessageIDConst.ID_C2S_SuperUpgradeEquipment,
        {
            pos = pos
        }
    )
end

function EquipmentData:_s2cSuperUpgradeEquipment(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end

    local crits = rawget(message, "crits") or {}
    local saveMoney = rawget(message, "save_money") or 0
    G_SignalManager:dispatch(SignalConst.EVENT_EQUIP_SUPER_UPGRADE_SUCCESS, crits, saveMoney)
end

-- //宝物橙升红
-- message C2S_EquipmentLimitCost {
-- 	optional uint64 id = 1;  正在升阶的装备id唯一
-- 	optional uint32 index = 2; // 0 表示界限突破 1精炼石  2同名卡  3春秋  4战国
-- 	optional Item materials = 3; //升级材料
-- 	repeated uint64 cards = 4; //同名卡id唯一（多个）
-- }
function EquipmentData:c2sEquipmentLimitCost(_id, pos, subItem)
    G_NetworkManager:send(
        MessageIDConst.ID_C2S_EquipmentLimitCost,
        {
            id = _id,
            index = pos,
            materials = subItem,
            cards = {subItem.id}
        }
    )
end

-- message S2C_EquipmentLimitCost {
-- 	optional uint32 ret = 1;
-- 	optional uint32 index = 2;  --操作类型
-- }
function EquipmentData:_s2cEquipmentLimitCost(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end
    local index = rawget(message, "index")
    G_SignalManager:dispatch(SignalConst.EVENT_EQUIP_LIMIT_UP_PUT_RES, index)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE)
    if index == 2 then -- 同名卡
        G_SignalManager:dispatch(SignalConst.EVENT_UPDATE_EQUIPMENT_NUMS)
    end
end

return EquipmentData
