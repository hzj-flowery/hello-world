-- 
-- Author: JerryHe
-- Date: 2019-02-20
-- Desc: 战报分析转换，根据类别，转换为不同的内容
-- 

local ReportParseRoundHelper    = {}

local ReportParseStatistics     = require("app.fight.reportParse.ReportParseStatistics")
local ReportParseTool           = require("app.fight.reportParse.ReportParseTool")

local SEQUENCE_BUFF_EFFECTS     = 1                     -- 攻击前，角色身上的buff状态
local SEQUENCE_DEL_BUFF_BEFORE  = 2                     -- 攻击前，角色要移除的buff状态
local SEQUENCE_DEL_BUFF_MIDDLE  = 3                     -- 第一次攻击，移除得buff

local SEQUENCE_ATTACK       = 4                     -- 开始攻击
local SEQUENCE_ADD_TARGET   = 5                     -- 攻击附加目标
local SEQUENCE_ANGERS       = 6                     -- 攻击完成引起的怒气变化
local SEQUENCE_ADD_BUFFS    = 7                     -- 攻击完成添加的BUFF
local SEQUENCE_DEL_BUFFS    = 8                     -- 攻击完成移除的buff
local SEQUENCE_BATTLE_EFFECT= 9                     -- 战斗中展示的BUFF

local SEQUENCE_DROP_REWARD  = 20                    -- 战斗完成掉落的奖励

-- 按照占位排序
local function compWithCell(a,b)
    if a == nil or b == nil then
        return true
    end

    if a.targetCountry and b.targetCountry then
        if a.targetCountry == b.targetCountry then
            return a.targetCell < b.targetCell
        else
            return a.targetCountry < b.targetCountry
        end
    else
        return a.targetCell < b.targetCell
    end
end

function ReportParseRoundHelper.convertObjectByParam(paramType,param)
    local _temp = ReportParseRoundHelper._buildConvertData(paramType,param)
    assert(_temp ~= nil,"Report analyse type error,type name is "..tostring(paramType))

    return _temp
end

function ReportParseRoundHelper._buildConvertData(paramType,params)
    for key, value in pairs(ReportParseRoundHelper) do
        local retfunc = ReportParseRoundHelper["_convert_"..paramType]
        if type(retfunc) == "function" then
            return retfunc(params)
        end
    end
    return {}
end

function ReportParseRoundHelper._convert_battle_attack(params)
    if params.attackInfo.isPet then
        return ReportParseRoundHelper._convert_pet_battle_attack(params)
    else
        return ReportParseRoundHelper._convert_unit_battle_attack(params)
    end
end

-- 返回添加buff对象
function ReportParseRoundHelper._convert_add_buffs(params)
    local object        = {}
    object.objSequence  = SEQUENCE_ADD_BUFFS
    object.addBuffs     = {}

    for i, v in ipairs(params.attackInfo[params.key]) do
        local temp      = {}
        temp.effectId   = v.buff_id
        temp.skillId    = v.skill_id
        temp.skillInfo  = require("app.config.hero_skill_active").get(temp.skillId)
        temp.showType   = v.show_type
        temp.round      = v.round
        temp.stageId    = ReportParseTool.getStageId(v.member.order_pos)
        temp.attackId   = ReportParseTool.getStageId(v.add_member.order_pos)
        temp.unitInfo   = params.targets.members[temp.stageId]
        temp.isResist   = false                     --todo Jerry 这里缺少逻辑
        temp.targetCountry  = math.floor(temp.stageId / 100)
        temp.targetCell     = temp.stageId % 10
        temp.attackCountry  = math.floor(temp.attackId / 100)
        temp.attackCell     = temp.attackId % 10

        temp.globalId   = ReportParseTool.getNumByBit(v.new_id_and_remove_id, 1, 16)
        temp.removeId   = ReportParseTool.getNumByBit(v.new_id_and_remove_id, 17, 16)           -- 这个只有顶掉之前buff才有用

        if params.buffTable then
            params.buffTable[temp.globalId] = temp
        end

        -- 这里更新buff信息，主要是记录次数
        ReportParseStatistics.updateBuff(temp.stageId,temp.globalId,v.round)

        table.insert(object.addBuffs,temp)
    end

    -- 对目标排序
    table.sort(object.addBuffs,compWithCell)

    object.printObjectInfo = function (self,result)
        for i, buffInfo in ipairs(self.addBuffs) do
            local attackId          = buffInfo.attackId             --发动者stageId
            local targetId          = buffInfo.stageId              --被动者stageId
            local skillId           = buffInfo.skillId              --技能id
            local effectId          = buffInfo.effectId             --效果id
            local round             = buffInfo.round                --生效回合数
            -- local showTime          = buffInfo.showTime             --展示时机
            local isResist          = buffInfo.isResist             --是否被抵抗
            local targetCell        = buffInfo.targetCell
            local targetCountry     = buffInfo.targetCountry
            local attackCountry     = buffInfo.attackCountry
            local attackCell        = buffInfo.attackCell

            local resistName        = ReportParseTool.getResistName(isResist)

            local param             = {
                targetCountry = targetCountry,attackCountry = attackCountry,attackCell = attackCell,
                targetCell = targetCell,effectId = effectId,round = round
            }

            if attackCell == 0 then
                -- 神兽，取值后，cell是0
                table.insert(result,{key = "txt_report_fight_battle_add_buff_pet",param = param})
            else
                table.insert(result,{key = "txt_report_fight_battle_add_buff",param = param})
            end
        end
    end

    return object
end

-- 返回删除buff对象
function ReportParseRoundHelper._convert_del_buff(params)
    local object        = {}
    object.objSequence  = SEQUENCE_DEL_BUFFS
    object.delBuffs     = {}
    for i, v in ipairs(params.attackInfo[params.key]) do
        local temp      = {}
        temp.effectId   = v.buff_id
        temp.skillId    = v.skill_id
        temp.skillInfo  = require("app.config.hero_skill_active").get(temp.skillId)
        temp.showType   = v.show_type
        temp.round      = v.round
        temp.stageId    = ReportParseTool.getStageId(v.member.order_pos)
        temp.attackId   = ReportParseTool.getStageId(v.add_member.order_pos)
        temp.unitInfo   = params.targets.members[temp.stageId]
        temp.targetCountry    = math.floor(temp.stageId / 100)
        temp.targetCell = temp.stageId % 10
        temp.isResist   = false                     --todo Jerry 这里缺少逻辑

        temp.globalId   = ReportParseTool.getNumByBit(v.new_id_and_remove_id, 1, 16)

        -- 这里更新buff信息，主要是记录次数
        ReportParseStatistics.removeBuff(temp.stageId,temp.globalId)

        table.insert(object.delBuffs,temp)
    end

    -- 对目标排序
    table.sort(object.delBuffs,compWithCell)

    object.printObjectInfo = function (self,result)
        for i, buffInfo in ipairs(self.delBuffs) do
            -- local attackId          = buffInfo.attackId             --发动者stageId
            local targetId          = buffInfo.stageId              --被动者stageId
            -- local skillId           = buffInfo.skillId              --技能id
            local effectId          = buffInfo.configId             --效果id
            -- local round             = buffInfo.round                --生效回合数
            -- local showTime          = buffInfo.showTime             --展示时机
            local isResist          = buffInfo.isResist             --是否被抵抗
            local targetCell        = buffInfo.targetCell
            local targetCountry     = buffInfo.targetCountry

            local param             = {
                targetCountry = targetCountry,
                targetCell = targetCell,targetName = buffInfo.unitInfo.name,effectId = buffInfo.effectId
            }

            table.insert(result,{key = "txt_report_fight_battle_del_buf",param = param})
        end
    end

    return object
end

-- 死亡掉落
function ReportParseRoundHelper._convert_awards(params)
    -- logWarn("ReportParseRoundHelper._convert_awards")
    -- dump(params)
    local object        = {}
    object.rewards      = {}

    object.printObjectInfo = function (self,result)
        for rewardType, rewards in pairs(self.rewards) do
            for rewardId, rewardNum in pairs(rewards) do
                local TypeConvertHelper = require("app.utils.TypeConvertHelper")
                local good = TypeConvertHelper.convert(rewardType, rewardId, rewardNum)

                local param = {rewardStr = good.name.."+"..good.size}
                table.insert(result,{key = "txt_report_fight_drop_reward",param = param})
            end
        end
    end

    local function parseDropRewards()
        local temp  = {}
        for i, target in ipairs(params) do
            local rewards   = target.awards
            for index, info in ipairs(rewards) do
                temp[info.type] = temp[info.type] or {}
                temp[info.type][info.value] = temp[info.type][info.value] or 0
                temp[info.type][info.value] = temp[info.type][info.value] + info.size
            end
        end

        return temp
    end

    object.rewards = parseDropRewards()

    return object
end

-- 返回全局buff对象
function ReportParseRoundHelper._convert_battle_effects(params)
    -- logWarn("_convert_battle_effects")
    -- dump(params)
    -- dump(params.attackInfo[params.key])
    local object        = {}
    object.targets      = {}
    object.objSequence  = SEQUENCE_BATTLE_EFFECT

    local list          = {{},{},{}}        -- 分别存放类别0，类别1，类别2的对象

    local tableData     = params.attackInfo[params.key]
    if tableData then
        for i, data in ipairs(tableData) do
            local temp      = {}
            temp.buffType   = data.type or 0        -- 1减血，2加血，默认是0（可能是延迟性的buff，比如中毒)
            temp.showValue  = data.value or 0       -- 显示部分
            temp.actualValue    = data.actual_value or 0    --实际部分
            temp.attackId   = ReportParseTool.getStageId(data.attack_member.order_pos) 
            temp.targetId   = ReportParseTool.getStageId(data.member.order_pos) 
            temp.skillId    = data.skill_id
            temp.buffId     = data.buff_id
            temp.isAlive    = data.is_live

            temp.attackCountry  = math.floor(temp.attackId / 100)
            temp.attackCell     = temp.attackId % 10

            if temp.attackId % 100 == 0 then
                -- 神兽触发的
                temp.petId      = data.pet_id

                temp.petInfo    = params.targets.pets[temp.attackCountry][temp.petId]
            else
                -- 非神兽触发的
                temp.attackInfo = params.targets.members[temp.attackId]
            end

            temp.targetCountry  = math.floor(temp.targetId / 100)
            temp.targetCell     = temp.targetId % 10
            temp.targetInfo     = params.targets.members[temp.targetId]

            if temp.skillId and temp.skillId ~= 0 then
                temp.skillInfo  = require("app.config.hero_skill_active").get(temp.skillId)
            end

            if temp.buffId and temp.buffId ~= 0 then
                temp.effectInfo = require("app.config.hero_skill_effect").get(temp.buffId)
            end

            -- 更新血量
            ReportParseStatistics.updateHp(temp.targetId,temp.actualValue,temp.buffType)
            local stateInfo     = ReportParseStatistics.getStateInfo(temp.targetId)
            temp.leftHp         = stateInfo.hp

            if temp.leftHp <= 0 then
                -- 玩家阵亡了，清除身上所有buff
                ReportParseStatistics.removeAllBuff(temp.targetId)
            end

            table.insert(list[temp.buffType + 1],temp)
        end
    end

    -- 对目标排序
    for i, v in ipairs(list) do
        table.sort(list[i],compWithCell)
        table.insertto(object.targets,list[i])
    end

    object.printObjectInfo = function(self,result)
        for i, data in ipairs(self.targets) do
            if data.buffType ~= 0 then
                local aliveName = ReportParseTool.getAliveName(data.isAlive)
                if data.petId then
                    local param     = {
                        attackCountry = data.attackCountry,targetCountry = data.targetCountry,
                        petName = data.petInfo.config.name,petId = data.petId,skillId = data.skillId,
                        targetCell = data.targetCell,targetName = data.targetInfo.name,
                        damage1 = data.showValue,damage2 = data.actualValue,aliveName = aliveName,
                        leftHp = data.leftHp,
                    }

                    table.insert(result,{key = "txt_report_fight_battle_effects_pet_"..data.buffType,param = param})

                else
                    -- 武将
                    local param     = {
                        attackCountry = data.attackCountry,targetCountry = data.targetCountry,
                        attackCell = data.attackCell,attackName = data.attackInfo.name,buffId = data.buffId,
                        targetCell = data.targetCell,targetName = data.targetInfo.name,damage1 = data.showValue,damage2 = data.actualValue,
                        aliveName = aliveName,leftHp = data.leftHp,
                    }

                    table.insert(result,{key = "txt_report_fight_battle_effects_"..data.buffType,param = param})
                end
            else
                -- 非加血，减血，逻辑 todo Jerry
                -- logWarn("battle_effects， type = 0")
                -- dump(data)

                local param     = {
                    targetCountry = data.targetCountry,targetCell = data.targetCell, buffId = data.buffId,
                }

                table.insert(result,{key = "txt_report_fight_battle_effects_no_hurt",param = param})
            end
        end
    end

    return object
end

-- 返回战斗前展示buff
function ReportParseRoundHelper._convert_buff_effects(params)
    -- logWarn("_conver_buff_effects")
    -- dump(params)
    -- dump(params.attackInfo[params.key])

    local object        = {}
    object.objSequence  = SEQUENCE_BUFF_EFFECTS
    object.roundIndex   = params.roundIndex
    object.attackIndex  = params.attackIndex
    -- object.stageId      = getNumByBit(params.attackInfo.attack_hero_info, 17, 16)
    object.stageId      = ReportParseTool.getStageId(params.attackInfo.attack_pos.order_pos)
    object.stageCountry = math.floor(object.stageId / 100)
    object.stageCell    = object.stageId % 10
    object.unitInfo     = params.targets.members[object.stageId]
    object.isAlive      = params.attackInfo.is_live
    object.targets      = {}

    local tableData     = params.attackInfo[params.key]
    if tableData then
        for i, data in ipairs(tableData) do
            local temp          = {}
            temp.showValue      = data.value
            temp.actualValue    = data.actual_value
            temp.type           = data.type                 -- 1 掉血，2 加血
            temp.globalId       = data.id                   
            temp.buffId         = 0

            if params.buffTable then
                local buffInfo  = params.buffTable[temp.globalId]
                temp.buffId     = buffInfo.effectId
                temp.buffAttackCountry  = buffInfo.attackCountry
                temp.buffAttackCell     = buffInfo.attackCell
            end

            -- 更新血量
            ReportParseStatistics.updateHp(object.stageId,temp.actualValue,temp.type)
            ReportParseStatistics.updateBuff(object.stageId,temp.globalId,-1)
            local stateInfo     = ReportParseStatistics.getStateInfo(object.stageId)
            temp.leftHp         = stateInfo.hp
            temp.leftBuffNum    = stateInfo.buffs[temp.globalId] or 0

            if temp.leftHp <= 0 then
                ReportParseStatistics.removeAllBuff(object.stageId)
            end

            table.insert(object.targets,temp)
        end
    end

    object.printObjectInfo = function(self,result)
        for i, data in ipairs(object.targets) do
            local aliveName = ReportParseTool.getAliveName(self.isAlive)

            local param     = {
                attackCountry = self.stageCountry,targetCell = self.stageCell,
                targetName = self.unitInfo.name,buffId = data.buffId,damage1 = data.showValue,
                damage2 = data.actualValue,aliveName = aliveName,leftHp = data.leftHp,
                buffLeftNum = data.leftBuffNum,buffAttackCountry = data.buffAttackCountry,
                buffAttackCell = data.buffAttackCell,
            }

            local key = "txt_report_fight_buff_effects_"..data.type
            if data.buffAttackCell == 0 then
                key = "txt_report_fight_buff_effects_pets_"..data.type
            end

            table.insert(result,{key = key,param = param})
        end
    end

    -- logWarn("_conver_buff_effects")
    -- dump(object)

    return object
end

-- 战斗前移除的buff
function ReportParseRoundHelper._convert_del_buff_before(params)
    -- logWarn("_convert_del_buff_before")
    -- dump(params)
    -- dump(params.attackInfo[params.key])

    local object        = {}
    object.objSequence  = SEQUENCE_DEL_BUFF_BEFORE
    object.roundIndex   = params.roundIndex
    object.attackIndex  = params.attackIndex
    object.unitInfo     = params.targets.members[object.stageId]
    object.targets      = {}

    local tableData     = params.attackInfo[params.key]
    if tableData then
        for i, data in ipairs(tableData) do
            local temp          = {}
            temp.buffId         = data.buff_id
            temp.stageId        = ReportParseTool.getStageId(data.member.order_pos)
            temp.targetCountry  = math.floor(temp.stageId / 100)
            temp.targetCell     = temp.stageId % 10
            temp.unitInfo       = params.targets.members[temp.stageId]

            temp.globalId       = ReportParseTool.getNumByBit(data.new_id_and_remove_id, 1, 16)

            -- 这里更新buff信息，主要是记录次数
            ReportParseStatistics.removeBuff(temp.stageId,temp.globalId)

            table.insert(object.targets,temp)
        end
    end

    -- 对目标进行排序
    table.sort(object.targets,compWithCell)

    object.printObjectInfo = function(self,result)
        for i, data in ipairs(self.targets) do

            local param     = {
                attackCountry = data.targetCountry,targetCell = data.targetCell,targetName = data.unitInfo.name,buffId = data.buffId
            }

            table.insert(result,{key = "txt_report_fight_del_buff_before",param = param})
        end
    end

    return object
end

-- 第一次攻击前移除buff，比如使用曹操锦囊，移除对方无敌
function ReportParseRoundHelper._convert_del_buff_middle(params)
    -- logWarn("_convert_del_buff_middle")
    -- dump(params.attackInfo[params.key])
    -- dump(params)

    local object        = {}
    object.objSequence  = SEQUENCE_DEL_BUFF_MIDDLE
    object.roundIndex   = params.roundIndex
    object.attackIndex  = params.attackIndex
    object.attackId     = ReportParseTool.getStageId(params.attackInfo.attack_pos.order_pos)
    object.attackCountry= math.floor(object.attackId / 100)
    object.attackCell   = object.attackId % 10
    object.unitInfo     = params.targets.members[object.attackId]
    object.targets      = {}
    
    local tableData     = params.attackInfo[params.key]
    if tableData then
        for i, data in ipairs(tableData) do
            local temp      = {}
            temp.buffId     = data.buff_id
            temp.targetId   = ReportParseTool.getStageId(data.member.order_pos)
            temp.targetCountry  = math.floor(temp.targetId / 100)
            temp.targetCell = temp.targetId % 10
            temp.unitInfo   = params.targets.members[temp.targetId]

            temp.globalId       = ReportParseTool.getNumByBit(data.new_id_and_remove_id, 1, 16)

            -- 这里更新buff信息，主要是记录次数
            ReportParseStatistics.removeBuff(temp.stageId,temp.globalId)

            table.insert(object.targets,temp)
        end
    end

    -- 对目标进行排序
    table.sort(object.targets,compWithCell)

    object.printObjectInfo = function(self,result)
        for i, data in ipairs(self.targets) do
            local param     = {
                attackCountry = self.attackCountry,targetCountry = data.targetCountry,attackCell = self.attackCell,attackName = self.unitInfo.name,
                targetCell = data.targetCell,targetName = data.unitInfo.name,buffId = data.buffId,
            }

            table.insert(result,{key = "txt_report_fight_del_buff_middle",param = param})
        end
    end

    return object
end

-- 返回怒气变化对象
function ReportParseRoundHelper._convert_angers(params)
    -- logWarn("解析怒气")
    -- dump(params)
    local angersInfo    = params.attackInfo[params.key]
    -- dump(angersInfo)

    local object        = {}
    object.objSequence  = SEQUENCE_ANGERS
    object.angers       = {}

    local list          = {{},{}}
    for i, info in ipairs(angersInfo) do
        local temp      = {}
        temp.effectId   = info.buff_id
        temp.angerType  = info.type
        temp.angerValue = info.value
        temp.stageId    = ReportParseTool.getStageId(info.member.order_pos)                --stageId
        temp.unitInfo   = params.targets.members[temp.stageId]
        temp.resist     = false 
        temp.targetCountry    = math.floor(temp.stageId / 100)
        temp.targetCell = temp.stageId % 10

        -- 暂存
        list[temp.targetCountry][temp.angerType] = list[temp.targetCountry][temp.angerType] or {}
        table.insert(list[temp.targetCountry][temp.angerType],temp)

        -- 更新怒气
        ReportParseStatistics.updateAnger(temp.stageId,temp.angerValue,temp.angerType)
        local stateInfo = ReportParseStatistics.getStateInfo(temp.stageId)
        
        temp.leftAnger  = stateInfo.anger
    end

    local function sortTargets()
        -- 对目标进行排序
        local function comp(a,b)
            if a.targetCell < b.targetCell then
                return true
            end

            if a.targetCell == b.targetCell then
                if a.angerType == 1 then
                    return a.leftAnger > b.leftAnger
                else
                    return a.leftAnger < b.leftAnger
                end
            end

            return false
        end

        for i1, countryInfo in ipairs(list) do
            for i2, v in ipairs(countryInfo) do
                table.sort(v,comp)
                table.insertto(object.angers,v)
            end
        end
    end

    sortTargets()

    object.printObjectInfo = function (self,result)
        -- logWarn("打印怒气变化")
        -- dump(self.angers)
        for i, target in ipairs(self.angers) do
            local stageId       = target.stageId
            local angerType     = target.angerType           -- 1减 2加
            local angerValue    = target.angerValue          -- 变化值
            local continue      = target.resist             -- 是否持续
            local effectId      = target.effectId           -- 表现id
            local targetCountry       = target.targetCountry            --阵营
            local targetCell          = target.targetCell               --位置
            local leftAnger     = target.leftAnger          -- 剩余怒气
            -- local targetInfo    = unitList[stageId]

            local continueName  = ReportParseTool.getContinueName(continue)

            local param         = {
                leftAnger = leftAnger,targetCountry = targetCountry,targetCell = targetCell,targetName = target.unitInfo.name,angerValue = angerValue,
            }

            table.insert(result,{key = "txt_report_fight_battle_anger_change_"..angerType,param = param})
        end
    end

    return object
end

-- 返回历史武将对象
function ReportParseRoundHelper._attack_infos_history(params,attackType)
    
end

-- 返回神兽战斗对象，多数内容和角色战斗相似，但是为了后面扩展，还是区分开来。
function ReportParseRoundHelper._attack_infos_pet(params,attackType)
    -- logWarn("_convert_attack_infos_pet")
    -- dump(params)

    local object        = {}
    object.objSequence  = SEQUENCE_ATTACK
    object.attackType   = attackType
    object.country      = ReportParseTool.getNumByBit(params.attackInfo.attack_hero_info, 9, 8)             --阵营
    object.id           = ReportParseTool.getNumByBit(params.attackInfo.attack_hero_info, 17, 16)           --神兽id
    object.skillId      = params.attackInfo.skill_id                                        --神兽技能id
    
    object.petInfo      = params.targets["pets"][object.country][object.id]
    object.skillInfo    = require("app.config.hero_skill_active").get(object.skillId)       --技能配置
    object.roundIndex   = params.roundIndex
    object.attackIndex  = params.attackIndex
    object.targets      = {}

    local tableData     = params.attackInfo[params.key]
    if tableData then
        for i, data in ipairs(tableData) do
            local temp  = {}
            temp.stageId    = ReportParseTool.getStageId(data.defense_member.order_pos)
            temp.country    = math.floor(temp.stageId / 100)
            temp.targetCell = temp.stageId % 10
            temp.unitInfo   = params.targets.members[temp.stageId]
            temp.showValue  = data.value
            temp.actualValue    = data.actual_value
            temp.isAlive    = data.is_live

            table.insert(object.targets,temp)
        end
    end

    -- 对目标进行排序
    table.sort(object.targets,compWithCell)

    object.printObjectInfo = function (self,result)

        -- logWarn(" 神兽攻击信息 ")
        -- dump(self.targets)

        if #self.targets > 0 then
            if self.targets[1].showValue > 0 or self.targets[1].actualValue > 0 then
                -- todo Jerry 这里暂时没走到，可能年兽会触发这段逻辑，待测试
                -- 神兽造成了血量的变化
                for i, data in ipairs(self.targets) do

                    -- local targetStageId     = ReportParseTool.getStageId(target.defense_member.order_pos)
                    -- local targetInfo        = params.targets.members[targetStageId]

                    -- local param     = {
                    --     roundIndex = self.roundIndex,attackIndex = self.attackIndex, petName = self.petInfo.config.name,
                    --     skillName = self.skillInfo.name,targetCell = targetStageId % 10,targetName = targetInfo.name,
                    --     damage1     = target.value,damage2 = target.actual_value,isAlive = target.is_live,skillId = self.skillId
                    -- }
                    local param     = {
                        petCountry  = self.country,petName = self.petInfo.config.name,
                        targetCell = data.targetCell,targetName = data.unitInfo.name,targetCountry = data.country,
                        damage1 = data.showValue,damage2 = data.actualValue,isAlive = data.isAlive,skillId = self.skillId
                    }

                    if target.type == 1 then
                        -- 减血

                        table.insert(result,{key = "txt_report_fight_battle_pet_damage",param = param})
                    elseif target.type == 2 then
                        -- 加血

                        table.insert(result,{key = "txt_report_fight_battle_pet_treat",param = param})
                    end
                end
            else
                local param         = {
                    petCountry = self.country,petName = self.petInfo.config.name,
                    targetNum = #self.targets,skillId = self.skillId
                }

                table.insert(result,{key = "txt_report_fight_battle_pet_start",param = param})
            end
        end
    end

    return object
end

-- 返回角色战斗对象
function ReportParseRoundHelper._attack_infos_unit(params,attackType)
    -- logWarn("_convert_attack_infos_unit")
    -- dump(params)
    -- dump(params.attackInfo[params.key])
    -- dump(params.attackInfo.battle_effects)
    -- dump(params.attackInfo.buff_effects)
    -- dump(params.attackInfo.add_buffs)

    local object        = {}
    object.objSequence  = SEQUENCE_ATTACK
    object.attackType   = attackType
    object.country      = ReportParseTool.getNumByBit(params.attackInfo.attack_hero_info, 9, 8)             --阵营
    object.stageId      = ReportParseTool.getStageId(params.attackInfo.attack_pos.order_pos)                --stageId
    object.skillId      = params.attackInfo.skill_id
    object.isAlive      = params.attackInfo.is_live     
    object.cell         = object.stageId % 10
    object.moveType     = params.moveType

    object.unitInfo     = params.targets["members"][object.stageId]
    object.skillInfo    = require("app.config.hero_skill_active").get(object.skillId)
    object.roundIndex   = params.roundIndex
    object.attackIndex  = params.attackIndex
    object.targets      = {}
    object.awards       = {}
    for k, v in pairs(params.attackInfo[params.key]) do

        local temp       = {}
        temp.showValue   = v.value
        temp.actualValue = v.actual_value or v.value
        temp.isAlive     = v.is_live
        temp.damageType  = v.type            --减血，2加血
        temp.stageId     = ReportParseTool.getStageId(v.defense_member.order_pos)
        temp.unitInfo    = params.targets.members[temp.stageId]
        temp.country     = math.floor(temp.stageId / 100)
        temp.targetCell  = temp.stageId % 10
        temp.hurtType    = nil
        if v.hurt_infos and #v.hurt_infos > 0 then
            temp.hurtType = v.hurt_infos[1].id
        end

        -- 解析掉落
        for i, info in ipairs(v.awards) do
            object.awards[info.type] = object.awards[info.type] or {}
            object.awards[info.type][info.value] = object.awards[info.type][info.value] or 0
            object.awards[info.type][info.value] = object.awards[info.type][info.value] + info.size
        end

        -- 更新血量，获取剩余血量
        ReportParseStatistics.updateHp(temp.stageId,temp.actualValue,temp.damageType)
        local stateInfo     = ReportParseStatistics.getStateInfo(temp.stageId)
        temp.leftHp         = stateInfo.hp

        if not temp.isAlive then
            -- 玩家阵亡了，清除身上所有buff
            ReportParseStatistics.removeAllBuff(temp.stageId)
        end
        
        table.insert(object.targets,temp)
    end

    -- 按照cell位置排序
    table.sort(object.targets,compWithCell)

    object.makeOtherAttackAgain = function(self)
        local unitId    = self.unitInfo.id
        local limitLv   = self.unitInfo.limitLv
        local skillType = self.skillInfo.skill_type

        if unitId == 304 and limitLv >= 3 and skillType >= 2 then
            -- logWarn("当前攻击角色：小乔，并且界限等级>= 3（突破等级>= 10），并且技能类型是技能攻击，则可以让其他吴国角色再次行动")
            return true,self.country
        end

        return false
    end

    object.printObjectInfo    = function (self,result)
        -- 发起玩家信息
        local attackTypeName    = ReportParseTool.getSkillName(self.skillInfo.skill_type)
        local aliveName         = ReportParseTool.getAliveName(self.isAlive)

        local param         = {
            attackCountry = self.country, attackCell = self.cell,
            unitName = self.unitInfo.config.name,attackTypeName = attackTypeName,skillId = self.skillId,aliveName = aliveName,
        }

        local key = "txt_report_fight_battle_unit_start"
        -- if self.attackType == 2 then
        if self.moveType == 2 then
            -- 追击
            key = "txt_report_fight_battle_unit_start_2"
        elseif self.moveType == 6 then
            -- 反击
            key = "txt_report_fight_battle_unit_start_6"
        end

        table.insert(result,{key = key,param = param})

        for i, defence in ipairs(self.targets) do

            local aliveName = ReportParseTool.getAliveName(defence.isAlive)
            if defence.damageType == 2 then
                -- 加血

                local param     = {
                    targetCountry = defence.country,enemyCell = defence.targetCell,
                    damage1 = defence.showValue,damage2 = defence.actualValue,leftHp = defence.leftHp,aliveName = aliveName,
                }

                table.insert(result,{key = "txt_report_fight_battle_unit_treat",param = param})            
            else
                -- 减血

                if defence.showValue == 0 and defence.actualValue == 0 then
                    local param = {
                        targetCountry = defence.country,enemyCell = defence.targetCell,enemyName = defence.unitInfo.name,
                        aliveName = aliveName,
                    }

                    if defence.hurtType then
                        table.insert(result,{key = "txt_report_fight_battle_unit_damage_fail_"..defence.hurtType,param = param})
                    else
                        -- todo Jerry 这里缺少没有伤害类型的逻辑
                        -- assert(false,"伤害类型 "..tostring(defence.hurtType)..", 没有实现 ")
                    end
                    
                else
                    if defence.hurtType then
                        local param     = {
                            targetCountry = defence.country,enemyCell = defence.targetCell,enemyName = defence.unitInfo.name,
                            damage1 = defence.showValue,damage2 = defence.actualValue,aliveName = aliveName,leftHp = defence.leftHp,
                        }
    
                        table.insert(result,{key = "txt_report_fight_battle_unit_damage_"..defence.hurtType,param = param})
                    else
                        local param     = {
                            targetCountry = defence.country,enemyCell = defence.targetCell,enemyName = defence.unitInfo.name,
                            damage1 = defence.showValue,damage2 = defence.actualValue,aliveName = aliveName,leftHp = defence.leftHp,
                        }
    
                        table.insert(result,{key = "txt_report_fight_battle_unit_damage_1",param = param})
                    end
                    
                end
            end
        end

        -- 掉落
        for rewardType, rewards in pairs(self.awards) do
            for rewardId, rewardNum in pairs(rewards) do
                local TypeConvertHelper = require("app.utils.TypeConvertHelper")
                local good = TypeConvertHelper.convert(rewardType, rewardId, rewardNum)

                local param = {rewardStr = good.name.."+"..good.size}
                table.insert(result,{key = "txt_report_fight_drop_reward",param = param})
            end
        end
    end

    return object
end

function ReportParseRoundHelper._convert_attack_infos(params)
    -- logWarn("解析攻击事件对象")
    -- dump(params)

    local attackType    = ReportParseTool.getNumByBit(params.attackInfo.attack_hero_info, 1, 8)
    if attackType == 1 then
        -- 神兽攻击
        return ReportParseRoundHelper._attack_infos_pet(params,attackType)
    elseif attackType == 2 then
        -- 历代名将攻击
        return ReportParseRoundHelper._attack_infos_history(params,attackType)
    else
        -- 角色攻击
        return ReportParseRoundHelper._attack_infos_unit(params,attackType)
    end
end

function ReportParseRoundHelper._convert_attack_add_infos(params)
    -- logWarn("_convert_attack_add_infos")
    -- dump(params)
    -- dump(params.attackInfo.attack_add_infos)
    -- dump(params.attackInfo.attack_infos)

    local object    = {}
    object.targets  = {}
    object.objSequence  = SEQUENCE_ADD_TARGET

    local cells     = {}

    for i, info in ipairs(params.attackInfo[params.key]) do
        local temp      = {}
        temp.attackId   = ReportParseTool.getStageId(info.attack_member.order_pos)
        temp.targetId   = ReportParseTool.getStageId(info.defense_member.order_pos)
        temp.isAlive    = info.is_live
        temp.showValue  = info.value
        temp.actualValue= info.actual_value

        temp.attackInfo = params.targets.members[temp.attackId]
        temp.targetInfo = params.targets.members[temp.targetId]

        temp.attackCell = temp.attackId % 10
        temp.targetCell = temp.targetId % 10

        -- 更新血量，获取剩余血量
        ReportParseStatistics.updateHp(temp.targetId,temp.actualValue,1)
        local stateInfo     = ReportParseStatistics.getStateInfo(temp.targetId)
        temp.leftHp         = stateInfo.hp

        -- table.insert(object.targets,temp)
        cells[temp.targetCell] = cells[temp.targetCell] or {}
        table.insert(cells[temp.targetCell],temp)
    end

    -- 此处有可能有多种掉血逻辑，不能简单排序，否则有可能引起掉血错乱，即后面血比前面多。
    -- 最多6个位置
    for i = 1, 6 do
        local list  = cells[i]
        if list then
            table.insertto(object.targets,list)
        end
    end
    
    object.printObjectInfo = function(self,result)
        for i, info in ipairs(self.targets) do
            local aliveName = ReportParseTool.getAliveName(info.isAlive)
            local param     = {
                targetCell1 = info.attackCell, targetCell2 = info.targetCell,aliveName = aliveName,
                damage1     = info.showValue,damage2 = info.actualValue,leftHp = info.leftHp,
            }

            table.insert(result,{key = "txt_report_fight_battle_add_target_damage_1",param = param})
        end
    end

    return object
end

-- 每轮次开始，特殊标记下，只为了打印战报时使用
function ReportParseRoundHelper._convert_attack_start(params)
    local indexInfo     = ReportParseStatistics.getIndexInfo()
    local object        = {}
    object.attackIndex  = indexInfo[2]
    object.roundIndex   = indexInfo[1]
    object.addition     = params.addition

    ReportParseStatistics.updateIndexInfo()

    object.printObjectInfo = function(self,result)
        local param     = {
            roundIndex = self.roundIndex,attackIndex = self.attackIndex
        }

        table.insert(result,{key = "txt_report_fight_round",param = param})
    end

    return object 
end

-- 每轮结束，打印双方阵营行动次数
function ReportParseRoundHelper._convert_attack_end(params)

    local attackType    = ReportParseTool.getNumByBit(params.attackInfo.attack_hero_info, 1, 8)
    if attackType == 1 or attackType == 2 then
        -- 神兽/历代名将，不打印行动次数
        return {}
    end

    local stageId       = ReportParseTool.getStageId(params.attackInfo.attack_pos.order_pos)    
    local moveStep      = ReportParseStatistics.getMoveSteps(stageId)

    if moveStep <= 0 then
        return {}
    end

    -- local hp            = ReportParseStatistics.getStateInfo(stageId).hp
    -- if hp <= 0 then
    --     return {}
    -- end

    local object    = {}
    object.stageId  = stageId
    object.moveStep = moveStep
    object.country  = math.floor(stageId / 100)
    object.cell     = stageId % 10

    local stageInfo     = ReportParseStatistics.getStateInfo(stageId)
    object.leftAnger    = stageInfo.anger

    object.printObjectInfo = function(self,result)
        local param = {
            country = self.country,cell = self.cell,moveStep = self.moveStep,leftAnger = self.leftAnger
        }

        table.insert(result,{key = "txt_report_fight_round_2",param = param})
    end

    return object
end

-- 添加被控制角色信息，只为打印战报
function ReportParseRoundHelper._convert_unit_controlled(params)
    -- logWarn("************* _convert_unit_controlled")
    -- dump(params)

    local object            = {}
    object.attackCountry    = math.floor(params.stageId / 100)
    object.attackCell       = params.stageId % 10
    object.buffs            = {}

    local buffTable         = ReportParseStatistics.getStateInfo(params.stageId).buffs

    for globalId, v in pairs(buffTable) do
        local buffInfo      = params.buffTable[globalId]
        table.insert(object.buffs,buffInfo)
    end

    object.printObjectInfo = function(self,result)
        for i, v in ipairs(self.buffs) do
            local param     = {
                country1 = self.attackCountry,cell1 = self.attackCell,country2 = v.attackCountry,cell2 = v.attackCell,buffId = v.effectId,
            }

            local key = "txt_report_fight_battle_unit_start_fail"
            if v.attackCell == 0 then
                key = "txt_report_fight_battle_unit_start_fail_pet"
            end

            table.insert(result,{key = key,param = param})
        end
    end

    return object
end

return ReportParseRoundHelper
