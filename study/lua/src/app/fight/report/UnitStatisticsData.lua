--每个单位的统计
local BaseData = require("app.data.BaseData")
local UnitStatisticsData = class("UnitStatisticsData", BaseData)
local Hero = require("app.config.hero")
local Monster = require("app.config.monster")

local schema = {}
schema["stageId"] = {"number", 0} --站位
schema["heroId"] = {"number", 0} --英雄Id
schema["configData"] = {"table", {}}
schema["damage"] = {"number", 0} --伤害
schema["heal"] = {"number", 0} --治疗
schema["statistics"] = {"table", {}} --buff统计
-- schema["buffIds"] = {"table", {}}       --由改武将所上的全局id

schema["color"] = {"number", 0}
schema["name"] = {"string", ""} --名字
schema["officerLevel"] = {"number", 0} --官衔，如果是主角
schema["alive"] = {"boolean", false} --是否存活
schema["player"] = {"boolean", false} --是否是主角
schema["limit"] = {"number", 0}
schema["limitRed"] = {"number", 0}  -- 红升金界限突破
UnitStatisticsData.schema = schema

function UnitStatisticsData:ctor(
    stageId,
    heroId,
    playerName,
    monsterId,
    rankLevel,
    officerLevel,
    isAlive,
    isLeader,
    limit,
    limitRed)
    UnitStatisticsData.super.ctor(self)
    self:setStageId(stageId)
    self:setHeroId(heroId)
    local configData = Hero.get(heroId)
    assert(configData, "wrong hero id = " .. heroId)
    self:setConfigData(configData)
    if monsterId == 0 then
        if isLeader then
            self:setName(playerName)
            self:setOfficerLevel(officerLevel)
            self:setPlayer(true)
        else
            self:setName(configData.name)
            if limitRed==4 then
                self:setColor(7)
            elseif limit==3 then
                self:setColor(6)
            else
                self:setColor(configData.color)
            end
        end
        if rankLevel ~= 0 then
            local name = self:getName()
            if configData.color == 7 and configData.type ~= 1 then -- 金将、
                name = name .. " " .. Lang.get("goldenhero_train_text") .. rankLevel
            else
                name = name .. "+" .. rankLevel
            end
            self:setName(name)
        end
    else
        self:_updateMonsterInfo(monsterId)
    end
    self:setAlive(isAlive)
    self:setLimit(limit)
    self:setLimitRed(limitRed)
end

function UnitStatisticsData:clear()
    self:setStageId(0)
    self:heroId(0)
    self:setDamage(0)
    self:setHeal(0)
    self:setStatistics({})
    -- self:setBuffIds({})
    self:setConfigData({})
    self:setName("")
    self:setOfficerLevel(0)
    self:setColor(0)
    self:setPlayer(false)
    self:setPet(false)
    self:setPetCamp(0)
    self:setLimit(0)
    self:setLimitRed(0)
end

function UnitStatisticsData:_updateMonsterInfo(monsterId)
    local config = Monster.get(monsterId)
    assert(config, "wrong monster id = " .. monsterId)
    self:setName(config.name)
    local color = config.color
    if color < 2 then
        color = 2
    end
    self:setColor(color)
end

--更新伤害，治疗数值
function UnitStatisticsData:updateValue(type, value)
    if type == 1 then
        self:_addDamage(value)
    elseif type == 2 then
        self:_addHeal(value)
    end
end

function UnitStatisticsData:_addDamage(damage)
    local nowDamage = self:getDamage()
    nowDamage = nowDamage + damage
    self:setDamage(nowDamage)
end

function UnitStatisticsData:_addHeal(heal)
    local nowHeal = self:getHeal()
    nowHeal = nowHeal + heal
    self:setHeal(nowHeal)
end

function UnitStatisticsData:addStatistics(type, count, description)
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

-- function UnitStatisticsData:addBuffId(globalId)
--     local idList = self:getBuffIds()
--     table.insert(idList, globalId)
--     self:setBuffIds(idList)
-- end

function UnitStatisticsData:addBuffValue(type, value)
end

--根据英雄类型，获得治疗或者伤害
function UnitStatisticsData:getStatisticsDamage()
    local sumType = self:getConfigData().sum_type
    if sumType == 1 then
        return self:getHeal()
    else
        return self:getDamage()
    end
end

return UnitStatisticsData
