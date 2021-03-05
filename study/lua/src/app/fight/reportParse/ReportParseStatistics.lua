-- 
-- Author: JerryHe
-- Date: 2019-02-27
-- Desc: 战报解析过程中需要用到的内容
-- 

local ReportParseStatistics     = {}

ReportParseStatistics.stateInfo     = {}
ReportParseStatistics.moveSteps     = {}
ReportParseStatistics.attackSequences   = {{},{}}
ReportParseStatistics.attackCell    = {0,0}         -- 记录阵营攻击位
ReportParseStatistics.lastAttackCountry     = nil   -- 记录上一个攻击阵营
ReportParseStatistics.attackAgain   = {false,false} -- 记录是否可以再行动（目前只针对小乔，让其他吴国武将多行动一次的逻辑）
ReportParseStatistics.unitMoveInfo  = {{},{}}       -- 记录角色行动记录
ReportParseStatistics.indexInfo     = {0,0}         -- 记录战斗轮次

function ReportParseStatistics.initStates(units)
    ReportParseStatistics.stateInfo = {}

    local temp = {}
    for i, unitInfo in ipairs(units) do
        temp[unitInfo.stageId]             = {}
        temp[unitInfo.stageId].hp          = unitInfo.hp
        temp[unitInfo.stageId].maxHp       = unitInfo.maxHp 
        temp[unitInfo.stageId].anger       = unitInfo.anger
        temp[unitInfo.stageId].buffs       = {}
    end

    ReportParseStatistics.stateInfo     = temp
end

function ReportParseStatistics.updateHp(stageId,hp,hpType)
    assert(ReportParseStatistics.stateInfo[stageId] ~= nil,"角色"..stageId.."没有存放状态信息")

    if not hpType or hpType == 0 then
        return
    end

    local factor = 1
    if hpType == 1 then
        factor = -1
    end
    ReportParseStatistics.stateInfo[stageId].hp   = ReportParseStatistics.stateInfo[stageId].hp + hp * factor
    if ReportParseStatistics.stateInfo[stageId].hp <= 0 then
        ReportParseStatistics.stateInfo[stageId].hp = 0
    end

    if ReportParseStatistics.stateInfo[stageId].hp > ReportParseStatistics.stateInfo[stageId].maxHp then
        ReportParseStatistics.stateInfo[stageId].hp = ReportParseStatistics.stateInfo[stageId].maxHp
    end
end

function ReportParseStatistics.updateAnger(stageId,anger,angerType)
    assert(ReportParseStatistics.stateInfo[stageId] ~= nil,"角色"..stageId.."没有存放状态信息")

    local factor = 1
    if angerType == 1 then
        factor = -1
    end
    ReportParseStatistics.stateInfo[stageId].anger   = ReportParseStatistics.stateInfo[stageId].anger + anger * factor
    if ReportParseStatistics.stateInfo[stageId].anger <= 0 then
        ReportParseStatistics.stateInfo[stageId].anger = 0
    end
end

function ReportParseStatistics.insertBuff(stageId,globalId,leftNum)
    ReportParseStatistics.stateInfo[stageId].buffs[globalId] = leftNum
end

function ReportParseStatistics.updateBuff(stageId,globalId,buffNum)
    ReportParseStatistics.stateInfo[stageId].buffs[globalId] = ReportParseStatistics.stateInfo[stageId].buffs[globalId] or 0
    ReportParseStatistics.stateInfo[stageId].buffs[globalId] = ReportParseStatistics.stateInfo[stageId].buffs[globalId] + buffNum
    if ReportParseStatistics.stateInfo[stageId].buffs[globalId] < 0 then
        ReportParseStatistics.stateInfo[stageId].buffs[globalId] = 0
    end
end

function ReportParseStatistics.removeBuff(stageId,globalId)
    if ReportParseStatistics.stateInfo[stageId] and ReportParseStatistics.stateInfo[stageId].buffs[globalId] then
        ReportParseStatistics.stateInfo[stageId].buffs[globalId] = nil
    end
end

function ReportParseStatistics.removeAllBuff(stageId)
    ReportParseStatistics.stateInfo[stageId].buffs  = {}
end

function ReportParseStatistics.getStateInfo(stageId)
    assert(ReportParseStatistics.stateInfo[stageId] ~= nil,"角色"..stageId.."没有存放状态信息")
    return ReportParseStatistics.stateInfo[stageId]
end

-- 跟行动次数有关（追击/反击等，不计算在内）
function ReportParseStatistics.getMoveSteps(stageId)
    return ReportParseStatistics.moveSteps[stageId] or 0
end

function ReportParseStatistics.updateMoveSteps(stageId)
    ReportParseStatistics.moveSteps[stageId] = ReportParseStatistics.moveSteps[stageId] or 0
    ReportParseStatistics.moveSteps[stageId] = ReportParseStatistics.moveSteps[stageId] + 1
end

---------------------------
-- 初始化玩家角色出手顺序
function ReportParseStatistics.initAttackSequence(members)
    ReportParseStatistics.attackSequences   = {{},{}}

    local temp1             = {}
    local temp2             = {}
    for k, v in pairs(members) do
        if k < 200 then
            table.insert(temp1,v.stageId)
        else
            table.insert(temp2,v.stageId)
        end
    end

    local function comp(a,b)
        return a < b
    end

    table.sort(temp1,comp)
    table.sort(temp2,comp)

    ReportParseStatistics.attackSequences[1]    = temp1
    ReportParseStatistics.attackSequences[2]    = temp2
end

function ReportParseStatistics.getAttackSequence()
    return ReportParseStatistics.attackSequences
end

-- 寻找当前攻击位，下一个可攻击的角色stageId(必须是活着的)
function ReportParseStatistics.getNextAttackStageId(country,curStageId)
    for i, stageId in ipairs(ReportParseStatistics.attackSequences[country]) do
        if stageId > curStageId then
            local stageInfo = ReportParseStatistics.getStateInfo(stageId)
            if stageInfo.hp > 0 then
                return stageId
            end
        end
    end

    return nil
end
---------------------

-- 阵营行动位置
function ReportParseStatistics.getLastAttackCell(country)
    return ReportParseStatistics.attackCell[country]
end

function ReportParseStatistics.updateAttackCell(country,cell)
    ReportParseStatistics.attackCell[country]   = cell
    ReportParseStatistics.lastAttackCountry     = country
end

-- 上一个攻击阵营，神兽不计算在内
function ReportParseStatistics.getLastAttackCountry()
    return ReportParseStatistics.lastAttackCountry
end
-- 武将再行动逻辑
function ReportParseStatistics.updateAttackAgain(country,state,forceUpdate)
    if not country then
        return
    end

    if not forceUpdate and not ReportParseStatistics.attackAgain[country] then
        ReportParseStatistics.attackAgain[country] = state
    else
        ReportParseStatistics.attackAgain[country] = state
    end
end

function ReportParseStatistics.checkAttackAgain(country)
    return ReportParseStatistics.attackAgain[country] 
end

function ReportParseStatistics.updateUnitMoveInfo(country,attackId)
    ReportParseStatistics.unitMoveInfo[country][attackId]   = true
end

function ReportParseStatistics.checkUnitMoved(country,attackId)
    return ReportParseStatistics.unitMoveInfo[country][attackId]
end

-- 更新战斗轮次
function ReportParseStatistics.updateIndexInfo()
    ReportParseStatistics.indexInfo[2] = ReportParseStatistics.indexInfo[2] + 1
end

function ReportParseStatistics.setIndexInfo(roundIndex,attackIndex)
    ReportParseStatistics.indexInfo[1] = roundIndex
    ReportParseStatistics.indexInfo[2] = attackIndex
end

function ReportParseStatistics.getIndexInfo()
    return ReportParseStatistics.indexInfo
end

-- 清除所有暂存逻辑
function ReportParseStatistics.clearReportParseStatistics()
    ReportParseStatistics.lastAttackCountry     = nil
    ReportParseStatistics.attackCell            = {0,0}

    ReportParseStatistics.moveSteps             = {}

    ReportParseStatistics.unitMoveInfo          = {{},{}}

    ReportParseStatistics.indexInfo             = {0,0}
end

return ReportParseStatistics