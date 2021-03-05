-- 
-- Author: JerryHe
-- Date: 2019-02-21
-- Desc: 新版战报解析逻辑
-- 

local BaseData = require("app.data.BaseData")
local ReportParseManager = class("ReportParseManager", BaseData)

local WaveData = require("app.fight.report.WaveData")

local ReportLang                = require("app.fight.reportParse.ReportLang")
local ReportParseRoundHelper    = require("app.fight.reportParse.ReportParseRoundHelper")
local ReportParseRoleHelper     = require("app.fight.reportParse.ReportParseRoleHelper")
local ReportParseTool           = require("app.fight.reportParse.ReportParseTool")
local ReportParseStatistics     = require("app.fight.reportParse.ReportParseStatistics")

local schema = {}
schema["fightType"] = {"number", 0}     --战斗模式
schema["win"] = {"boolean", false}      --是否胜利
schema["leftName"] = {"string", ""}     --左方名字
schema["rightName"] = {"string", ""}    --右方名字
schema["skillIds"] = {"table", {}}      --使用技能
schema["maxRoundNum"] = {"number", 0}   --最大回合数
schema["attackOfficerLevel"] = {"number", 0}    --左边官衔等级
schema["defenseOfficerLevel"] = {"number", 0}   --右方官衔等级
schema["attack_hurt"] = {"number", 0}       --我方总伤害
schema["statisticsTotal"] = {"table", {}}   --统计
schema["star"] = {"number", 0}              --星数
schema["loseType"] = {"number", 0}         --失败的时候，对面剩余的人数 1人的时候 type1， 其余type2

ReportParseManager.schema = schema

local ATTACK_NORMAL     = 1         -- 正常攻击
local ATTACK_ADDITION   = 2         -- 追击等
local ATTACK_NONE       = 3         -- 无法攻击，什么buff都没有
local ATTACK_NONE_2     = 4         -- 无法攻击，有伤害
local ATTACK_NORMAL_2   = 5         -- 小乔让某个吴国角色行动的，也算正常攻击，但是不计算在行动步数内。
local ATTACK_BACK       = 6         -- 反击

function ReportParseManager:ctor(properties)  
    ReportParseManager.super.ctor(self, peoperties)
end

function ReportParseManager:clear()
    self:setWaves({})
    self:setFightType(0)
    self:setWin(false)
    self:setLeftName("")
    self:setRightName("")
    self:setSkillIds({})
    self:setStar(0)

    self:setRounds({})
end

-- 新版解析需要的内容
function ReportParseManager:_initData(data,isFalseReport)
    self._data          = data              -- 传入进来的战报数据
    self._isFalseReport = isFalseReport

    self._targets       = {}
    self._targets["members"]    = {}        -- 初始对象
    self._targets["pets"]       = {}        -- 初始神兽
    self._targets["members_final"]  = {}    -- 最终存活的对象

    self._reportTable   = {}                -- 战报保存的key/param，打印战报时，通过ReportLang，替换
    self._objectList    = {}                -- 战报解析时的对象

    self._buffTable     = {}                -- 存放全局buff

    self._lastAttack    = nil               -- 记录上一次攻击，由谁发起

    self._saveNextStageId  = nil       -- 保存需要打印的角色
end

function ReportParseManager:setReport(data, isFalseReport)

    self:_initData(data)

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
    -- if isFalseReport then
    --     self:setLeftName(G_UserData:getBase():getName())
    -- end

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
    
    -- if not isFalseReport then
    --     local statistics = require("app.fight.report.StatisticsTotal").new()
    --     statistics:parseStatistics(waves[#waves], self)
    --     self:setStatisticsTotal(statistics)
    -- end

    self:_parseReport()
    self:_initResultInfo()
end

function ReportParseManager:_initResultInfo()
    local startCount    = 0
    local finalCount    = 0
    for k, v in pairs(self._targets["members"]) do
        startCount = startCount + 1
    end

    for k, v in pairs(self._targets["members_final"]) do
        finalCount = finalCount + 1
    end
    
    if self:isWin() then
        local diff = startCount - finalCount 
        if diff == 0 then 
            self:setStar(3)
        elseif diff == 1 then
            self:setStar(2) 
        else
            self:setStar(1) 
        end
    else
        if finalCount == 1 then
            self:setLoseType(1)
        else
            self:setLoseType(2)
        end
    end
end

function ReportParseManager:_parseReport()
    -- 开始
    self:_saveParseVariables("txt_report_print_begin")

    -- 输赢
    if self:isWin() then
        self:_saveParseVariables("txt_report_fight_result_win")
    else
        self:_saveParseVariables("txt_report_fight_result_lose")
    end

    -- 总波次
    self:_saveParseVariables("txt_report_fight_wave_num",{waveNum = #self._data.waves})

    self._waves     = {}

    for i, waveData in ipairs(self._data.waves) do

        self._waves[i]  = {}
        -- 每一波次
        self:_saveParseVariables("txt_report_fight_wave_index",{waveIndex = i})

        -- 先出手一方
        self:_saveParseVariables("txt_report_fight_first_order",{attackCountry = waveData.first_order})

        self:_convertToDifParser(waveData)
    end

    for i, object in ipairs(self._objectList) do
        if object.printObjectInfo then
            object:printObjectInfo(self._reportTable)
        end
    end

    self:_saveParseVariables("txt_report_fight_over")

    -- 最终存活插入尾部
    table.insert(self._objectList,self._finalMembers)
    self._finalObj:printObjectInfo(self._reportTable)

    self:_saveParseVariables("txt_report_print_end")
    -- self:_printAllReportParse()

    self:_saveReportParse()
end

function ReportParseManager:_convertToDifParser(waveData)
    -- 解析角色出生
    local membersObj    = ReportParseRoleHelper.convertObjectByParam("members",{data = waveData.members,leftName = self:getLeftName(),rightName = self:getRightName()})
    self._targets["members"] = membersObj.members
    table.insert(self._objectList,membersObj)

    -- 最终存活角色
    self._finalObj      = ReportParseRoleHelper.convertObjectByParam("members_final",{data = waveData.members_final,leftName = self:getLeftName(),rightName = self:getRightName()})
    self._targets["members_final"] = self._finalObj.members

    -- 解析神兽出生
    local petsObj       = ReportParseRoleHelper.convertObjectByParam("pets",{data = waveData.pets})
    self._targets["pets"] = {{},{}}
    for country, petCountrys in pairs(petsObj.members) do
        for petId, petInfo in pairs(petCountrys) do
            self._targets["pets"][country][petId] = petInfo
        end
    end
    table.insert(self._objectList,petsObj)

    -- 记录左右阵营角色出手顺序列表
    ReportParseStatistics.initAttackSequence(membersObj.members)

    -- -- 解析战斗信息
    self:_parseBattleRound(waveData.rounds,waveData.first_order)

    -- 记录波次中的角色/神兽/最终存活的角色
    local waveCount     = #self._waves
    self._waves[waveCount].members          = membersObj.members
    self._waves[waveCount].pets             = petsObj.members
    self._waves[waveCount].members_final    = self._finalObj.members
end

function ReportParseManager:getAllReport()
    return self._reportTable
end

-- 打印存放的内容
function ReportParseManager:_printAllReportParse()
    logWarn("---------------所有战报全部生成，现在开始打印---------------")
    for i, info in ipairs(self._reportTable) do
        if info.param then
            for k, v in pairs(info.param) do
                if type(v) == "boolean" then
                    if v then
                        info.param[k] = ReportLang.get("txt_report_fight_"..k)
                    else
                        info.param[k] = ReportLang.get("txt_report_fight_not_"..k)
                    end
                end
            end
        end
        local str = ReportLang.get(info.key,info.param)
        logWarn(str)
    end
end

-- 保存解析后的战报到本地
function ReportParseManager:_saveReportParse()
    local str = ""
    for i, info in ipairs(self._reportTable) do
        if info.param then
            for k, v in pairs(info.param) do
                if type(v) == "boolean" then
                    if v then
                        info.param[k] = ReportLang.get("txt_report_fight_"..k)
                    else
                        info.param[k] = ReportLang.get("txt_report_fight_not_"..k)
                    end
                end
            end
        end
        str = str.."\n"..ReportLang.get(info.key,info.param)
        -- logWarn(str)
    end

    local dateStr = os.date("%Y-%m-%d-%H-%M-%S",os.time())
    G_StorageManager:saveString("ReportParse_"..dateStr.."_.lua", str)
end

-- 存放待打印的字符串及参数
function ReportParseManager:_saveParseVariables(key,param)
    local temp      = {}
    temp.key        = key
    temp.param      = param
    table.insert(self._reportTable,temp)
end

function ReportParseManager:_sortObjects(a,b)
    if a == nil or b == nil then
        return false
    elseif a.objSequence == nil or b.objSequence == nil then
        return false
    elseif a.objSequence < b.objSequence then
        return true
    else
        return false
    end
end

-- 打印每轮战斗信息
function ReportParseManager:_parseBattleRound(rounds,firstOrder)
    local saveList          = {}

    for roundIndex, roundList in ipairs(rounds) do
        
        -- 清除暂存数据
        ReportParseStatistics.clearReportParseStatistics()

        -- 初始化轮次，以后变更，都在使用时，自动增加
        ReportParseStatistics.setIndexInfo(roundIndex,1)

        local temp                  = {}
        for attackIndex, attackInfo in ipairs(roundList.attacks) do

            local attackId      = ReportParseTool.getStageId(attackInfo.attack_pos.order_pos)   
            local attackType,addStageId     = self:_parseAttackAdditionMove(attackInfo,roundList.attacks,attackIndex,roundIndex)

            -- 正常解析部分
            local list = self:_parseNormalAttack(attackInfo,attackType)

            if attackType == ATTACK_NONE and addStageId then
                self:_addUnitControlledInfo(addStageId,true)
            end

            if self._saveNextStageId and self._saveNextStageId == attackId then
                -- 有伤害，无法行动的逻辑，需要延迟到当前角色的伤害被触发后，添加到尾部
                self:_addUnitControlledInfo(self._saveNextStageId)
                self._saveNextStageId = nil
            end

            -- 记录每轮次，所有对象，并保存
            table.insertto(temp,list)
        end

        -- 记录所有轮次
        table.insert(saveList,temp)
    end

    self._waves[#self._waves].rounds    = saveList
end

function ReportParseManager:_parseNormalAttack(attackInfo,moveType)
    local indexInfo     = ReportParseStatistics.getIndexInfo()

    local list          = {}
    for key, info in pairs(attackInfo) do
        local params    = {
            targets     = self._targets,keyInfo = info,attackInfo = attackInfo,
            roundIndex  = indexInfo[1],attackIndex = indexInfo[2],key = key,
            buffTable   = self._buffTable,moveType = moveType,
        }

        local object        = ReportParseRoundHelper.convertObjectByParam(key,params)
        if object and object.objSequence then
            table.insert(list,object)
        end

        if object and object.makeOtherAttackAgain then
            local attackAgain,attackCountry = object:makeOtherAttackAgain()
            ReportParseStatistics.updateAttackAgain(attackCountry,attackAgain)
        end
    end

    if #list > 0 and moveType ~= ATTACK_ADDITION and moveType ~= ATTACK_BACK then
        -- 只有正常攻击，添加xx轮xx次攻击文本；反击/追击类，不加xx轮xx次攻击文本；被控制的另外添加逻辑
        local objectStart   = ReportParseRoundHelper.convertObjectByParam("attack_start",{})
        table.insert(self._objectList,objectStart)
    end

    -- 要做一次排序，对象是无序的，有可能先处理的是add_buff，后处理attack
    table.sort(list,handler(self,self._sortObjects))

    table.insertto(self._objectList,list)

    -- 保存每轮结束后，行动次数
    self:_addMoveStepInfo(attackInfo,moveType)

    return list
end

function ReportParseManager:_updateCurrentAttackInfo(curCountry,curCell,curAttackId)
    if ReportParseStatistics.checkUnitMoved(curCountry,curAttackId) then
        return
    end
    ReportParseStatistics.updateUnitMoveInfo(curCountry,curAttackId)
    ReportParseStatistics.updateAttackCell(curCountry,curCell)
    ReportParseStatistics.updateMoveSteps(curAttackId)
end

-- 检查本次行动后，是否需要增加额外行动
-- 正常攻击1；追击等2；被控制，无法攻击3，有伤害无法攻击4；小乔让吴国武将行动5；被动行动6；
-- 参数：1当前攻击内容，2整个轮次内容，3当前攻击序号
function ReportParseManager:_parseAttackAdditionMove(attackInfo,roundAttacks,attackIndex)
    local attackType    = ReportParseTool.getNumByBit(attackInfo.attack_hero_info, 1, 8)
    if attackType == 1 or attackType == 2 then
        return ATTACK_NORMAL
    end

    local curAttackId   = ReportParseTool.getStageId(attackInfo.attack_pos.order_pos)    
    local curCountry    = math.floor(curAttackId / 100)
    local curCell       = curAttackId % 10

    if not attackInfo.skill_id or attackInfo.skill_id == 0 then
        -- 被动全局buff引起的，如闪电劈人，毒人，烧人；
        ReportParseStatistics.updateAttackCell(curCountry,curCell)

        return ATTACK_NORMAL
    end

    if attackInfo.type == 2 then
        -- 被动行动（夏侯惇，小乔等），不作为新的攻击序号，也不作为角色行动一次
        return ATTACK_BACK
    end

    local skillId   = attackInfo.skill_id
    local skillInfo = require("app.config.hero_skill_active").get(skillId)
    if skillInfo.skill_type == 4 then
        -- 被动技能，如赵云的辅助攻击/周瑜的反间等，不作为角色行动一次
        return ATTACK_ADDITION
    end

    if ReportParseStatistics.getLastAttackCell(curCountry) == 0 then
        
        local enemyValidResult,nextStageId = self:_checkEnemyUnitIsValid(curAttackId,curCountry,curCell,roundAttacks,attackIndex,skillInfo)
        if enemyValidResult then
            return enemyValidResult,nextStageId
        end

        self:_updateCurrentAttackInfo(curCountry,curCell,curAttackId)

        return ATTACK_NORMAL
    end

    if ReportParseStatistics.checkUnitMoved(curCountry,curAttackId) then
        -- 如果当前角色已经行动过了
        if ReportParseStatistics.checkAttackAgain(curCountry) then
            -- 
            local curUnit   = self._targets.members[curAttackId]
            -- if curUnit.config.country == 3 and curUnit.id ~= 304 then
            if ReportParseTool.checkUnitCanAttackAgain(curUnit) then
                -- 小乔能让其他非吴国武将再次行动一次，但是不包括小乔自己或者小乔变身卡
                ReportParseStatistics.updateAttackAgain(curCountry,false,true)

                -- ReportParseStatistics.updateMoveSteps(curAttackId)
                local enemyValidResult,nextStageId = self:_checkEnemyUnitIsValid(curAttackId,curCountry,curCell,roundAttacks,attackIndex,skillInfo)
                if enemyValidResult then
                    return enemyValidResult,nextStageId
                end

                ReportParseStatistics.updateMoveSteps(curAttackId)

                return ATTACK_NORMAL_2
            end
        end

        -- 本轮攻击中，当前角色已经行动过了，本次行动肯定只是追击
        return ATTACK_ADDITION
    end

    -- logWarn("本次是正常攻击，并且不是神兽/历代名将，需要判断地方阵营后面，是否有对位角色能行动")
    local enemyValidResult,nextStageId = self:_checkEnemyUnitIsValid(curAttackId,curCountry,curCell,roundAttacks,attackIndex,skillInfo)
    if enemyValidResult then
        return enemyValidResult,nextStageId
    end

    -- 当前行动的角色，需要判断是否是小乔赋予吴国武将额外行动的逻辑
    -- 如果当前角色已经行动过了
    if ReportParseStatistics.checkAttackAgain(curCountry) then
        local curUnit   = self._targets.members[curAttackId]
        -- if curUnit.config.country == 3 and curUnit.id ~= 304 then
        if ReportParseTool.checkUnitCanAttackAgain(curUnit) then
            -- 小乔能让其他非吴国武将再次行动一次，但是不包括小乔自己或者小乔变身卡
            ReportParseStatistics.updateAttackAgain(curCountry,false,true)

            ReportParseStatistics.updateMoveSteps(curAttackId)

            return ATTACK_NORMAL_2
        end
    end

    -- 默认正常攻击
    self:_updateCurrentAttackInfo(curCountry,curCell,curAttackId)
    return ATTACK_NORMAL
end

-- 检查下一个该行动的敌方角色，是否存在，并且符合预期
function ReportParseManager:_checkEnemyUnitIsValid(curAttackId,curCountry,curCell,roundAttacks,attackIndex,skillInfo)
    local enemyCountry      = curCountry % 2 + 1
    local enemyLastCell     = ReportParseStatistics.getLastAttackCell(enemyCountry)
    local enemyLastStageId  = 100 * enemyCountry + enemyLastCell
    local nextEnemyStageId  = ReportParseStatistics.getNextAttackStageId(enemyCountry,enemyLastStageId)

    if not nextEnemyStageId then
        -- logWarn("下一个角色stageId不存在，说明，对方都攻击完了")
        self:_updateCurrentAttackInfo(curCountry,curCell,curAttackId)

        return ATTACK_NORMAL
    end

    -- 有下一个角色，寻找下面的攻击角色中，第一个人物是否是该角色，如果是，说明正常；如果不是，说明该角色被控了，无法行动，需要特殊处理下
    local function getNextEnemyInfo()
        local firstStageId      = nil
        local firstInfo         = nil
        for i = attackIndex + 1, #roundAttacks do
            local aInfo         = roundAttacks[i]
            local aType         = ReportParseTool.getNumByBit(aInfo.attack_hero_info, 1, 8)
            local attackId      = ReportParseTool.getStageId(aInfo.attack_pos.order_pos)   
            if aType ~= 1 and aType ~= 2 then
                
                if aInfo.skill_id ~= 0 then
                    
                    local skillInfo = require("app.config.hero_skill_active").get(aInfo.skill_id)

                    if skillInfo.skill_type ~= 4 then
                        -- 被控制了，有可能触发对方被动技能解救，这时不算
                        firstStageId    = attackId
                        firstInfo       = aInfo
                        break
                    end
                end
            end
        end

        return firstStageId,firstInfo
    end

    local function saveInfo()
        -- 更新敌对角色行动信息
        ReportParseStatistics.updateAttackCell(enemyCountry,nextEnemyStageId % 10)

        -- 更新当前行动角色信息
        self:_updateCurrentAttackInfo(curCountry,curCell,curAttackId)
    end

    local nextStageId,nextInfo = getNextEnemyInfo()
    if nextStageId and nextStageId == curAttackId then
        -- 下一个攻击角色，还是自己，那肯定是追击逻辑，当前逻辑是正常攻击
        self:_updateCurrentAttackInfo(curCountry,curCell,curAttackId)
        return ATTACK_NORMAL
    end

    if not nextStageId then
        saveInfo()
        return ATTACK_NONE,nextEnemyStageId
    end

    if nextStageId == nextEnemyStageId and #nextInfo.attack_infos <= 0 then
        saveInfo()

        self._saveNextStageId   = nextEnemyStageId
        return ATTACK_NONE_2,nextEnemyStageId
    end

    if nextStageId ~= nextEnemyStageId then
        local nextCountry   = math.floor(nextStageId / 100)
        local nextUnit      = self._targets.members[nextStageId]
        local curUnit       = self._targets.members[curAttackId]
        local makeAttackAgain   = ReportParseTool.checkMakeAttackAgain(curUnit,skillInfo)
        local unitCanAgain      = ReportParseTool.checkUnitCanAttackAgain(nextUnit)
        if  makeAttackAgain and unitCanAgain then
            self:_updateCurrentAttackInfo(curCountry,curCell,curAttackId)
            return ATTACK_NORMAL
        end

        saveInfo()
        return ATTACK_NONE,nextEnemyStageId
    end

    return nil
end

-- 添加角色被控制无法出手信息
function ReportParseManager:_addUnitControlledInfo(stageId,needTitle)
    if needTitle then
        local objectStart   = ReportParseRoundHelper.convertObjectByParam("attack_start",{})
        table.insert(self._objectList,objectStart)
    end

    local unitControlled    = ReportParseRoundHelper.convertObjectByParam("unit_controlled",{stageId = stageId,buffTable   = self._buffTable})
    table.insert(self._objectList,unitControlled)
end

-- 添加角色行动次数/剩余怒气信息
function ReportParseManager:_addMoveStepInfo(attackInfo,attackType)
    if attackType ~= ATTACK_NORMAL and attackType ~= ATTACK_NORMAL_2 then
        -- 正常行动才计算
        return
    end

    local objectEnd     = ReportParseRoundHelper.convertObjectByParam("attack_end",{attackInfo = attackInfo})
    if objectEnd and objectEnd.printObjectInfo then
        table.insert(self._objectList,objectEnd)
    end
end

return ReportParseManager