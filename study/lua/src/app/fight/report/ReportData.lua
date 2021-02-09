local BaseData = require("app.data.BaseData")
local ReportData = class("ReportData", BaseData)

local WaveData = require("app.fight.report.WaveData")

local schema = {}
schema["waves"] = {"table", {}} --波次
schema["fightType"] = {"number", 0} --战斗模式
schema["win"] = {"boolean", false} --是否胜利
schema["leftName"] = {"string", ""} --左方名字
schema["rightName"] = {"string", ""} --右方名字
schema["skillIds"] = {"table", {}} --使用技能
schema["maxRoundNum"] = {"number", 0} --最大回合数
schema["attackOfficerLevel"] = {"number", 0} --左边官衔等级
schema["defenseOfficerLevel"] = {"number", 0} --右方官衔等级
schema["attack_hurt"] = {"number", 0} --我方总伤害
schema["statisticsTotal"] = {"table", {}} --统计
schema["star"] = {"number", 0} --星数
schema["loseType"] = {"number", 0} --失败的时候，对面剩余的人数 1人的时候 type1， 其余type2
schema["starIds"] = {"table", {}} --历代名将id
ReportData.schema = schema

function ReportData:ctor(properties)
    ReportData.super.ctor(self, peoperties)
end

function ReportData:clear()
    self:setWaves({})
    self:setFightType(0)
    self:setWin(false)
    self:setLeftName("")
    self:setRightName("")
    self:setSkillIds({})
    self:setStar(0)
end

function ReportData:setReport(data, isFalseReport)
    local waves = {}
    if rawget(data, "waves") then
        for i = 1, #data.waves do
            local wave = WaveData.new()
            wave:setWaveData(data.waves[i])
            table.insert(waves, wave)
        end
        self:setWaves(waves)
    end

    if rawget(data, "pk_type") then
        self:setFightType(data.pk_type)
    end

    if rawget(data, "is_win") then
        self:setWin(data.is_win)
    end

    local skillIds = {}
    if rawget(data, "skill_ids") then
        for _, val in pairs(data.skill_ids) do
            table.insert(skillIds, val)
        end
        self:setSkillIds(skillIds)
    end

    if rawget(data, "attack_name") then
        self:setLeftName(data.attack_name)
    end
    if isFalseReport then
        self:setLeftName(G_UserData:getBase():getName())
    end

    if rawget(data, "defense_name") then
        self:setRightName(data.defense_name)
    end

    if rawget(data, "max_round_num") then
        self:setMaxRoundNum(data.max_round_num)
    end

    if rawget(data, "attack_officer_level") then
        self:setAttackOfficerLevel(data.attack_officer_level)
    end

    if rawget(data, "defense_officer_level") then
        self:setDefenseOfficerLevel(data.defense_officer_level)
    end

    if rawget(data, "attack_hurt") then
        self:setAttack_hurt(data.attack_hurt)
    end

	-- 防止假战报点统计报错
    -- if not isFalseReport then
        local statistics = require("app.fight.report.StatisticsTotal").new()
        statistics:parseStatistics(waves[#waves], self)
        self:setStatisticsTotal(statistics)
    -- end

    if self:isWin() then
        local lastWave = waves[#waves]
        local startCount = lastWave:getUnitsByCamp(1)
        local finalCount = lastWave:getFinalUnitsByCamp(1)
        local diff = startCount - finalCount
        if diff == 0 then
            self:setStar(3)
        elseif diff == 1 then
            self:setStar(2)
        else
            self:setStar(1)
        end
    else
        local lastWave = waves[#waves]
        local finalCount = lastWave:getFinalUnitsByCamp(2)
        if finalCount == 1 then
            self:setLoseType(1)
        else
            self:setLoseType(2)
        end
    end

    local starIds = {}
    if rawget(data, "star_base_ids") then
        for _, val in pairs(data.star_base_ids) do
            table.insert(starIds, val)
        end
        self:setStarIds(starIds)
    end

    -- if rawget(data, "is_end") then
    -- return true
    -- end
end

return ReportData
