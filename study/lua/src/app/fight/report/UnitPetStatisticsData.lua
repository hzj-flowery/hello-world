--每个单位的统计
local BaseData = require("app.data.BaseData")
local UnitPetStatisticsData = class("UnitPetStatisticsData", BaseData)
-- local Hero = require("app.config.hero")
-- local Monster = require("app.config.monster")
local Pet = require("app.config.pet")

local schema = {}
schema["petCamp"] = {"number", 0}       --阵营
schema["petId"] = {"number", 0}         --Id
schema["petStar"] = {"number", 0}       --星数
schema["configData"] = {"table", {}}

schema["damage"] = {"number", 0}        --伤害
schema["heal"] = {"number", 0}          --治疗
schema["statistics"] = {"table", {}}    --buff统计
-- schema["buffIds"] = {"table", {}}       --由改武将所上的全局id

UnitPetStatisticsData.schema = schema

function UnitPetStatisticsData:ctor(petCamp, petId, petStar)
    UnitPetStatisticsData.super.ctor(self)
    self:setPetCamp(petCamp)
    self:setPetId(petId)
    local configData = Pet.get(petId)
    assert(configData, "wrong pet id = "..petId)
    self:setConfigData(configData)
    self:setPetStar(petStar)
end

function UnitPetStatisticsData:clear()
    self:setPetCamp(0)
    self:setPetId(0)
    self:setPetStar(0)
    self:setConfigData({})
    self:setDamage(0)
    self:setHeal(0)
    self:setStatistics({})
    -- self:setBuffIds({})
end

--更新伤害，治疗数值
function UnitPetStatisticsData:updateValue(type, value)
    if type == 1 then
        self:_addDamage(value)
    elseif type == 2 then
        self:_addHeal(value)
    end
end

function UnitPetStatisticsData:_addDamage(damage)
    local nowDamage = self:getDamage()
    nowDamage = nowDamage + damage
    self:setDamage(nowDamage)
end

function UnitPetStatisticsData:_addHeal(heal)
    local nowHeal = self:getHeal()
    nowHeal = nowHeal + heal
    self:setHeal(nowHeal)
end

function UnitPetStatisticsData:addStatistics(type, count, description)
    local statistics = self:getStatistics()
    for i, v in pairs(statistics) do
        if v:getType() == type then
            v:addCount(count)
            return
        end
    end
    local newStatistic = require("app.fight.report.StatisticsData").new(type, description)
    newStatistic:addCount(count)
    table.insert(statistics, newStatistic)
    self:setStatistics(statistics)
end

-- function UnitPetStatisticsData:addBuffId(globalId)
--     local idList = self:getBuffIds()
--     print("1112233 push global id", globalId)
--     table.insert(idList, globalId)
--     self:setBuffIds(idList)
-- end

function UnitPetStatisticsData:addBuffValue(type, value)

end

--根据英雄类型，获得治疗或者伤害
function UnitPetStatisticsData:getStatisticsDamage()
    local sumType = self:getConfigData().sum_type
    if sumType == 1 then
        return self:getHeal()
    else 
        return self:getDamage()
    end
end

return UnitPetStatisticsData