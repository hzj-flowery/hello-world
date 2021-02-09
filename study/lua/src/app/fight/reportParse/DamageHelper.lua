--被攻击者伤害分析

local DamageHelper = {}
DamageHelper._exports = {} --输出的字符串
DamageHelper._targetInfo = {} --被攻击数据

DamageHelper._roundIndex = 0

local function getNumByBit(number, bitStart, bitLength)
    local bitNumber = bit.tobits(number)
    local bitTbl = {}
    for i = 1, bitLength do
        bitTbl[i] = bitNumber[33 - bitStart - bitLength + i] or 0
    end
    return bit.tonumb(bitTbl)
end

local function getStageId(attackPos)
    local atkOrder = getNumByBit(attackPos, 1, 16)
    local atkPos = getNumByBit(attackPos, 17, 16)
    return atkOrder * 100 + atkPos
end

function DamageHelper.parseAttackDatas(attackDatas)
    attackDatas = attackDatas or {}
    for i, attackData in ipairs(attackDatas) do
        DamageHelper.parseAttackData(attackData)
    end
    DamageHelper._roundIndex = DamageHelper._roundIndex + 1
    DamageHelper._formatExport("\n\n\n----------更换轮次:"..DamageHelper._roundIndex.."-----------\n\n\n")

    DamageHelper._makeParseFile(202)
end

function DamageHelper.parseAttackData(attackData)
    DamageHelper._attackIndex = 0
    local attackStageId = getStageId(attackData.attack_pos.order_pos)

    local attackInfos = rawget(attackData, "attack_infos") or {}
    local attackAddInfos = rawget(attackData, "attack_add_infos") or {}
    local buffEffects = rawget(attackData, "buff_effects") or {}
    local battleEffects = rawget(attackData, "battle_effects") or {}

    DamageHelper._parseAttackInfos(attackInfos)
    DamageHelper._parseAttackAddInfos(attackAddInfos)
    DamageHelper._parseBuffEffects(buffEffects, attackStageId)
    DamageHelper._parseBattleEffects(battleEffects)

    DamageHelper._attackIndex = DamageHelper._attackIndex + 1
    DamageHelper._formatExport("\n\n----------更换攻击:"..DamageHelper._attackIndex.."-----------\n\n")
end

function DamageHelper._setInfoWithStageId(stageId, info)
    DamageHelper._targetInfo[stageId] = info
end

function DamageHelper._getInfoWithStageId(stageId)
    if DamageHelper._targetInfo[stageId] == nil then
        DamageHelper._targetInfo[stageId] = {hp = 8003600, protect = 2881296}
    end
    
    return DamageHelper._targetInfo[stageId]
end

function DamageHelper._setExportWithStageId(stageId, str)
    DamageHelper._exports[stageId] = str
end

function DamageHelper._getExportWithStageId(stageId)
    if DamageHelper._exports[stageId] == nil then
        DamageHelper._exports[stageId] = ""
    end
    return DamageHelper._exports[stageId]
end

function DamageHelper._parseAttackInfos(attackInfos)
    for i, attackInfo in ipairs(attackInfos) do
        local stageId = getStageId(attackInfo.defense_member.order_pos)
        local info = DamageHelper._getInfoWithStageId(stageId)
        local str = DamageHelper._getExportWithStageId(stageId)

        local damageType = attackInfo.type
        local damageValue = attackInfo.actual_value or attackInfo.value or 0
        local damagePType = attackInfo.type
        local damageProtect = attackInfo.protect or 0
        
        local ratio = 0
        if damageType == 1 then
            ratio = -1 --扣血
        elseif damageType == 2 then
            ratio = 1 --加血
        end
        local pRatio = 0
        if damagePType == 1 then
            pRatio = -1 --扣血
        elseif damagePType == 2 then
            pRatio = 1 --加血
        end
        info.hp = info.hp + damageValue*ratio
        info.protect = info.protect + damageProtect*pRatio
        DamageHelper._setInfoWithStageId(stageId, info)

        local strParam = "[AttackInfo]血量 = "..info.hp..", 护盾 = "..info.protect..
                            ", 扣血 = "..damageValue*ratio..", 扣护盾 = "..damageProtect*pRatio.."\n"
        str = str..strParam
        DamageHelper._setExportWithStageId(stageId, str)
    end
end

function DamageHelper._parseAttackAddInfos(attackAddInfos)
    for i, attackAddInfo in ipairs(attackAddInfos) do
        local stageId = getStageId(attackAddInfo.defense_member.order_pos)
        local info = DamageHelper._getInfoWithStageId(stageId)
        local str = DamageHelper._getExportWithStageId(stageId)

        local damageType = attackAddInfo.type
        local damageValue = attackAddInfo.actual_value or attackAddInfo.value or 0
        local damagePType = attackAddInfo.type
        local damageProtect = attackAddInfo.protect or 0
        
        local ratio = 0
        if damageType == 1 then
            ratio = -1 --扣血
        elseif damageType == 2 then
            ratio = 1 --加血
        end
        local pRatio = 0
        if damagePType == 1 then
            pRatio = -1 --扣血
        elseif damagePType == 2 then
            pRatio = 1 --加血
        end
        info.hp = info.hp + damageValue*ratio
        info.protect = info.protect + damageProtect*pRatio
        DamageHelper._setInfoWithStageId(stageId, info)

        local strParam = "[AttackAddInfo]血量 = "..info.hp..", 护盾 = "..info.protect..
                            ", 扣血 = "..damageValue*ratio..", 扣护盾 = "..damageProtect*pRatio.."\n"
        str = str..strParam
        DamageHelper._setExportWithStageId(stageId, str)
    end
end

function DamageHelper._parseBuffEffects(buffEffects, stageId)
    for i, buffEffect in ipairs(buffEffects) do
        local info = DamageHelper._getInfoWithStageId(stageId)
        local str = DamageHelper._getExportWithStageId(stageId)

        local damageType = buffEffect.type
        local damageValue = buffEffect.actual_value or buffEffect.value or 0
        local damagePType = buffEffect.type
        local damageProtect = buffEffect.protect or 0

        local ratio = 0
        if damageType == 1 then
            ratio = -1 --扣血
        elseif damageType == 2 then
            ratio = 1 --加血
        end
        local pRatio = 0
        if damagePType == 1 then
            pRatio = -1 --扣血
        elseif damagePType == 2 then
            pRatio = 1 --加血
        end
        info.hp = info.hp + damageValue*ratio
        info.protect = info.protect + damageProtect*pRatio
        DamageHelper._setInfoWithStageId(stageId, info)

        local strParam = "[BuffEffect]血量 = "..info.hp..", 护盾 = "..info.protect..
                            ", 扣血 = "..damageValue*ratio..", 扣护盾 = "..damageProtect*pRatio.."\n"
        str = str..strParam
        DamageHelper._setExportWithStageId(stageId, str)
    end
end

function DamageHelper._parseBattleEffects(battleEffects)
    for i, battleEffect in ipairs(battleEffects) do
        local stageId = getStageId(battleEffect.member.order_pos)
        local info = DamageHelper._getInfoWithStageId(stageId)
        local str = DamageHelper._getExportWithStageId(stageId)

        local damageType = battleEffect.type
        local damageValue = battleEffect.actual_value or battleEffect.value or 0
        local damagePType = battleEffect.type
        local damageProtect = battleEffect.protect or 0

        local ratio = 0
        if damageType == 1 then
            ratio = -1 --扣血
        elseif damageType == 2 then
            ratio = 1 --加血
        end
        local pRatio = 0
        if damagePType == 1 then
            pRatio = -1 --扣血
        elseif damagePType == 2 then
            pRatio = 1 --加血
        end
        info.hp = info.hp + damageValue*ratio
        info.protect = info.protect + damageProtect*pRatio
        DamageHelper._setInfoWithStageId(stageId, info)

        local opDatas = rawget(battleEffect, "end_op") or {}
        DamageHelper._parseEndOp(opDatas)

        local strParam = "[BattleEffect]血量 = "..info.hp..", 护盾 = "..info.protect..
                            ", 扣血 = "..damageValue*ratio..", 扣护盾 = "..damageProtect*pRatio.."\n"
        str = str..strParam
        DamageHelper._setExportWithStageId(stageId, str)
    end
end

function DamageHelper._parseEndOp(opDatas)
    for i, opData in ipairs(opDatas) do
        local stageId = getStageId(opData.member.order_pos)
        local info = DamageHelper._getInfoWithStageId(stageId)
        local str = DamageHelper._getExportWithStageId(stageId)

        local damageType = opData.type
        local damageValue = opData.actual_value or opData.value or 0
        local damagePType = opData.type
        local damageProtect = opData.protect or 0

        local ratio = 0
        if damageType == 1 then
            ratio = -1 --扣血
        elseif damageType == 2 then
            ratio = 1 --加血
        end
        local pRatio = 0
        if damagePType == 1 then
            pRatio = -1 --扣血
        elseif damagePType == 2 then
            pRatio = 1 --加血
        end
        info.hp = info.hp + damageValue*ratio
        info.protect = info.protect + damageProtect*pRatio
        DamageHelper._setInfoWithStageId(stageId, info)
    end
end

--输出某个位置的受伤害数据
function DamageHelper._makeParseFile(stageId)
    local totalStr = ""
    local info = DamageHelper._getInfoWithStageId(stageId)
    local strExport = DamageHelper._getExportWithStageId(stageId)

    local finalStr = "最终扣血总量 = "..info.hp.."\n".."最终扣护盾总量 = "..info.protect

    totalStr = strExport.."\n\n------------------\n"..finalStr
    G_StorageManager:saveString("fight_damage_info.lua", totalStr)
end

function DamageHelper._formatExport(split)
    for k, export in pairs(DamageHelper._exports) do
        local str = export..split
        DamageHelper._exports[k] = str
    end
end

return DamageHelper