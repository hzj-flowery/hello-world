-- 
-- Author: JerryHe
-- Date: 2019-03-04
-- Desc: 战报解析工具类
-- 

local ReportLang        = require("app.fight.reportParse.ReportLang")

local ReportParseTool   = {}


function ReportParseTool.getNumByBit(number, bitStart, bitLength)
    local bitNumber = bit.tobits(number)
    local bitTbl = {}
    for i = 1, bitLength do
        bitTbl[i] = bitNumber[33 - bitStart - bitLength + i] or 0
    end
    return bit.tonumb(bitTbl)
end

function ReportParseTool.getStageId(attackPos)
    local atkOrder = ReportParseTool.getNumByBit(attackPos, 1, 16)
    local atkPos = ReportParseTool.getNumByBit(attackPos, 17, 16)
    return atkOrder * 100 + atkPos
end

-- 获得技能名：普攻/技能/合击
function ReportParseTool.getSkillName(skillType)
    return ReportLang.get("txt_report_fight_attack_way_"..skillType)
end

-- 是否存活
function ReportParseTool.getAliveName(isAlive)
    if isAlive then
        return ReportLang.get("txt_report_fight_isAlive")
    end

    return ReportLang.get("txt_report_fight_not_isAlive")
end

-- 是否持续
function ReportParseTool.getContinueName(continue)
    if continue then
        return ReportLang.get("txt_report_fight_continue")
    end

    return ReportLang.get("txt_report_fight_not_continue")
end

-- 是否抵抗
function ReportParseTool.getResistName(resist)
    if resist then
        return ReportLang.get("txt_report_fight_resist")
    end

    return ReportLang.get("txt_report_fight_not_resist")
end

-- 获得阵营剩余未移动的角色，以及当前是第几个移动
function ReportParseTool.getCountryMoveUnit(country,seqIndex)

    local ReportParseStatistics = require("app.fight.reportParse.ReportParseStatistics")
    local sequences             = ReportParseStatistics.getAttackSequence()

    local idList                = sequences[country]
    if #idList < seqIndex then
        logWarn(" 当前阵营 "..country..", 第 "..seqIndex.." 个可行动的角色不存在 ")
        return nil
    end

    local stageId               = idList[seqIndex]

    local stateInfo             = ReportParseStatistics.getStateInfo(stageId)
    if stateInfo == nil or stateInfo.hp <= 0 then
        return nil
    end

    logWarn(" 当前阵营 "..country..", 第 "..seqIndex.." 个可行动的角色是 "..tostring(stageId))
    return stageId
end

-- 判断当前行动是否是小乔（界限3）的技能
function ReportParseTool.checkMakeAttackAgain(curUnit,skillInfo)
    if curUnit.config.country == 3 and curUnit.id == 304 and curUnit.limitLv >= 3 and skillInfo.skill_type >= 2 and skillInfo.skill_type <= 3 then
        return true
    end

    return false
end

function ReportParseTool.checkUnitCanAttackAgain(curUnit)
    if curUnit.config.country == 3 and curUnit.id ~= 304 then
        return true
    end

    return false
end

return ReportParseTool
