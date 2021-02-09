local BaseData = require("app.data.BaseData")
local StatisticsTotal = class("StatisticsTotal", BaseData)

local schema = {}
schema["unitStatistics"] = {"table", {}}
schema["petStatistics"] = {"table", {}}
StatisticsTotal.schema = schema
local HeroSkillEffect = require("app.config.hero_skill_effect")

function StatisticsTotal:ctor()
    StatisticsTotal.super.ctor(self)
    self._buffTable = {} --记录一下globelID，用于计算伤害
    self._buffTalbePet = {} --神兽buff的globelID
end

function StatisticsTotal:clear()
    self:setUnitStatistics({})
    self:setPetStatistics({})
end

function StatisticsTotal:parseStatistics(waveData, reportData)
    self._leftName = reportData:getLeftName()
    self._rightName = reportData:getRightName()
    self._leftOfficerLevel = reportData:getAttackOfficerLevel()
    self._rightOfficerLevel = reportData:getDefenseOfficerLevel()
    local unitList = waveData:getUnits()
    local finalUnit = waveData:getFinalUnits()
    self:initStatistics(unitList, finalUnit)

    local pets = waveData:getPets()
    self:initPetsStatistics(pets)

    local roundList = waveData:getRounds()
    for i = 1, #roundList do
        local roundData = roundList[i]
        for i = 1, #roundData.attacks do
            local attackData = roundData.attacks[i]
            self:_parseOneAttack(attackData)
        end
    end
end

function StatisticsTotal:_addAngerByConfig(configId, count, statistics)
    local configData = HeroSkillEffect.get(configId)
    assert(configData, "not buff effect id = " .. configId)
    if configData.buff_sum ~= 0 then
        statistics:addStatistics(configData.buff_sum, count, configData.buff_sum_txt)
    end
end

function StatisticsTotal:_calcAnger(attack)
    --之后要根据angerdata里面的id来选择统计的人头
    local attackId = attack.stageId
    local statistics = self:getUnitStatisticsById(attackId)
    for i = 1, #attack.angers do
        local data = attack.angers[i]
        if data.showType ~= 0 then
            self:_addAngerByConfig(data.configId, data.value, statistics)
        end
    end
end

function StatisticsTotal:_calcDamage(attack)
    local statistics = self:getUnitStatisticsById(attack.stageId)
    for i = 1, #attack.targets do
        local attackInfo = attack.targets[i]
        local damage = attackInfo.damage
        statistics:updateValue(damage.type, damage.value)
    end
    for i = 1, #attack.addTargets do
        local addAttackInfo = attack.addTargets[i]
        local damage = addAttackInfo.damage
        statistics:updateValue(damage.type, damage.value)
    end
end

function StatisticsTotal:_calcBattleEffects(attack)
    for i = 1, #attack.battleEffects do
        local data = attack.battleEffects[i]
        local statistics = self:getUnitStatisticsById(data.attackId)
        local damage = data.damage
        statistics:updateValue(damage.type, damage.value)
    end
end

--添加buff统计
function StatisticsTotal:_calcBuffs(attack)
    for i = 1, #attack.addBuffs do
        local data = attack.addBuffs[i]
        local atkId = data.attackId
        if atkId and atkId == 0 then
            atkId = attack.stageId
        end
        local statistics = self:getUnitStatisticsById(atkId)
        assert(
            statistics,
            "error attack statistics info " .. tostring(attack.isPet) .. attack.petCamp .. "   " .. atkId
        )
        self._buffTable[data.globalId] = atkId
        local configData = HeroSkillEffect.get(data.configId)
        assert(configData, "not buff effect id = " .. data.configId)
        if configData.buff_sum ~= 0 then
            statistics:addStatistics(configData.buff_sum, 1, configData.buff_sum_txt)
        end
    end
end

--buff伤害统计
function StatisticsTotal:_calcBuffEffect(attack)
    for i = 1, #attack.buffEffects do
        local data = attack.buffEffects[i]
        local attackUnit, attackPet, configId = self:_getStatisticsUnitByBuffGlobalId(data.globalId)
        if attackUnit then
            -- assert(attackUnit, "no unit has global id = "..data.globalId)
            local damage = data.damage
            attackUnit:updateValue(damage.type, damage.value)
        end
        if attackPet then
            local configData = HeroSkillEffect.get(configId)
            assert(configData, "not buff effect id = " .. configId)
            if configData.buff_sum ~= 0 then
                attackPet:addStatistics(configData.buff_sum, 1, configData.buff_sum_txt)
            end
        end
    end
end

function StatisticsTotal:_parsePetAttack(attack)
    self:_calcPetAnger(attack)
    self:_calcPetBuffs(attack)
    self:_calcBuffEffect(attack)
    self:_calcBattleEffectsPet(attack)
end

function StatisticsTotal:_calcBattleEffectsPet(attack)
    for i = 1, #attack.battleEffects do
        local data = attack.battleEffects[i]
        local petCamp = math.floor(data.attackId / 100)
        local petId = data.petId
        local petStatistics = self:getPetStatisticsbyId(petCamp, petId)
        local configData = HeroSkillEffect.get(data.configId)
        if configData.buff_sum ~= 0 then
            petStatistics:addStatistics(configData.buff_sum, 1, configData.buff_sum_txt)
        end
    end
end

function StatisticsTotal:_calcPetAnger(attack)
    for i = 1, #attack.angers do
        local camp = attack.petCamp
        local id = attack.petId
        local petStatistics = self:getPetStatisticsbyId(camp, id)
        local data = attack.angers[i]
        local tarCamp = math.floor(data.stageId / 100) --怒气受方的阵营
        if data.type == 2 and camp ~= tarCamp then --如果是加怒，并且加到对方阵营，那么不统计
            
        else
            if data.showType ~= 0 then
                local configData = HeroSkillEffect.get(data.configId)
                if configData.buff_sum ~= 0 then
                    petStatistics:addStatistics(configData.buff_sum, data.value, configData.buff_sum_txt)
                end
            end
        end
    end
end

function StatisticsTotal:_calcPetBuffs(attack)
    for i = 1, #attack.addBuffs do
        local data = attack.addBuffs[i]
        local camp = math.floor(data.attackId / 100)
        local id = data.petId
        local petStatistics = self:getPetStatisticsbyId(camp, id)
        if not petStatistics then 
            return 
        end
        self._buffTalbePet[data.globalId] = {
            camp,
            id,
            data.configId
        }
        local configData = HeroSkillEffect.get(data.configId)
        if configData and configData.buff_sum ~= 0 and configData.buff_sum ~= 8 then       --麒麟这边上buff的时候不统计
            petStatistics:addStatistics(configData.buff_sum, 1, configData.buff_sum_txt)
        end
    end
end

function StatisticsTotal:_parseOneAttack(attack)
    --神兽攻击不计入统计
    if attack.isPet then
        self:_parsePetAttack(attack)
        return
    end

    if attack.isHistory then
        return
    end

    --攻击目标的加减血
    self:_calcDamage(attack)
    --怒气统计
    self:_calcAnger(attack)
    --全局展示buff统计
    self:_calcBattleEffects(attack)
    --添加buff统计
    self:_calcBuffs(attack)
    --buff伤害统计
    self:_calcBuffEffect(attack)
end

function StatisticsTotal:getUnitStatisticsById(stageId)
    local list = self:getUnitStatistics()
    for i, v in pairs(list) do
        if stageId == v:getStageId() then
            return v
        end
    end
end

function StatisticsTotal:getPetStatisticsbyId(camp, petId)
    local list = self:getPetStatistics()
    for i, v in pairs(list) do
        if camp == v:getPetCamp() and petId == v:getConfigData().id then
            return v
        end
    end
end

function StatisticsTotal:initStatistics(unitList, finalUnits)
    local list = {}
    for _, v in pairs(unitList) do
        local name = self._leftName
        local officerLevel = self._leftOfficerLevel
        if math.floor(v.stageId / 100) == 2 then
            name = self._rightName
            officerLevel = self._rightOfficerLevel
        end
        local isAlive = false
        for _, unit in pairs(finalUnits) do
            if unit.stageId == v.stageId then
                isAlive = true
                break
            end
        end
        local newStatistics =
            require("app.fight.report.UnitStatisticsData").new(
            v.stageId,
            v.configId,
            name,
            v.monsterId,
            v.rankLevel,
            officerLevel,
            isAlive,
            v.isLeader,
            v.limitLevel,
            v.limitRedLevel
        )
        table.insert(list, newStatistics)
    end
    self:setUnitStatistics(list)
end

function StatisticsTotal:initPetsStatistics(petList)
    local list = {}
    for _, v in pairs(petList) do
        local pet = require("app.fight.report.UnitPetStatisticsData").new(v.camp, v.configId, v.star)
        table.insert(list, pet)
    end
    self:setPetStatistics(list)
end

function StatisticsTotal:_getStatisticsUnitByBuffGlobalId(globalId)
    -- local id = self._buffTable[globalId]
    -- local camp, petId = self._buffTalbePet[globalId]

    local isPet = false
    local buffConfig = nil
    local tbl = self._buffTable[globalId]
    if not tbl then
        tbl = self._buffTalbePet[globalId]
        isPet = true
    end
    if not tbl then 
        return 
    end
    local unit, unitPet
    if isPet then
        unitPet = self:getPetStatisticsbyId(tbl[1], tbl[2])
        buffConfig = tbl[3]
    else
        unit = self:getUnitStatisticsById(id)
    end
    return unit, unitPet, buffConfig
end

function StatisticsTotal:getMaxDamage()
    local maxDamage = 0
    local list = self:getUnitStatistics()
    for i, v in pairs(list) do
        local damage = v:getStatisticsDamage()
        if damage > maxDamage then
            maxDamage = damage
        end
    end
    return maxDamage
end

-- function StatisticsTotal:getMaxDamage(camp)
--     local maxDamage = 0
--     local list = self:getUnitStatistics()
--     for i, v in pairs(list) do
--         if camp == math.floor(v:getStageId()/100) then
--             -- local damage = v:getDamage()
--             -- if v:getConfigData().sum_type == 1 then
--             --     damage = v:getHeal()
--             -- end
--             local damage = v:getStatisticsDamage()
--             if damage > maxDamage then
--                 maxDamage = damage
--             end
--         end
--     end
--     return maxDamage
-- end

function StatisticsTotal:getDataListByCamp(camp)
    local ret = {}
    local list = self:getUnitStatistics()
    for i, v in pairs(list) do
        if math.floor(v:getStageId() / 100) == camp then
            table.insert(ret, v)
        end
    end
    table.sort(
        ret,
        function(a, b)
            return a:getStageId() < b:getStageId()
        end
    )
    return ret
end

function StatisticsTotal:getPetDataListByCamp(camp)
    local ret = {}
    local list = self:getPetStatistics()
    for i, v in pairs(list) do
        if v:getPetCamp() == camp then
            table.insert(ret, v)
        end
    end
    table.sort(
        ret,
        function(a, b)
            return a:getPetId() > b:getPetId()
        end
    )
    return ret
end

return StatisticsTotal
