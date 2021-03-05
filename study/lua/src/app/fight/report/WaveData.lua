local BaseData = require("app.data.BaseData")
local WaveData = class("WaveData", BaseData)

--基本结构
--单位
local Unit = {
    stageId = 0, --战场id
    configId = 0, --表id
    camp = 0, --队伍
    cell = 0, --坐标
    maxHp = 0, --最大血量
    hp = 0, --血量
    anger = 0, --怒气
    rankLevel = 0, --突破等级
    monsterId = 0, --怪物id
    isLeader = false, --是否是主角
    limitLevel = 0, --界限突破等级
    limitRedLevel = 0, -- 红升金界限突破等级
    showMark = {}, --展示的buff， 1，桃园结义
    protect = 0 --护盾
}

local battleStar = {
    --历代名将
    id = 0, --英雄id
    rank = 0, --突破等级
    stageId = 0 --所有者id
}

local Damage = {
    type = 0, --伤害类型, 1 扣血 2 加血
    value = 0, --伤害真实数值
    showValue = 0, --展示数量
    pType = 0, --护盾加减类型, 1 扣，2 加
    protect = 0 --护盾增加或者减少（根据type）
}

--宠物
local Pet = {
    camp = 0, --阵营
    configId = 0, --表id
    star = 0 --星级
}

--奖励
local Award = {
    type = 0, --掉落类型
    value = 0, --掉落id
    size = 0 --掉落数量
}

--伤害
local Hurt = {
    hurtId = 0, --1 闪避 2 暴击 3 招架 4 无敌  5 吸收
    hurtValue = 0 --5 6 中用作具体的数值
}

--目标
local Target = {
    stageId = 0, --战场id
    isAlive = true, --是否死亡
    awards = {}, --掉落 Award
    hurts = {}, --攻击修正
    -- type = 0, --事件类型
    -- value = 0, --数值
    -- actualValue = 0,   --真正的加减血量
    damage = clone(Damage)
}

-- 附加目标
local AddTarget = {
    stageId = 0, --战场id
    attackStageId = 0, --给予分摊的将的id
    isAlive = true, --是否死亡
    showType = 0, --展示 0普通 1桃园结义 2转移伤害 3溢出伤害治疗 4溢出治疗
    -- type = 0, --事件类型
    -- value = 0, --数值
    -- actualValue = 0 --真实加减血血量
    damage = clone(Damage)
}

--怒气变化
local AngerChange = {
    stageId = 0, -- 战场id
    showType = 0, -- 0正常，1需要提示
    type = 0, -- 1, 扣，2加
    configId = 0, -- buff表现id
    value = 0, -- 变化数值
    resist = false, -- 是否被免疫
    showTime = 99 -- 展示时机
}

--全局buff，战斗中展示
local BattleEffect = {
    stageId = 0, --buff拥有者的全局id
    attackId = 0, --释放者id
    configId = 0, --表id
    skillId = 0, --技能id
    petId = 0, --神兽id
    isAlive = true, --是否存活
    -- type = 0, --1扣血 2 加血
    -- value = 0, --具体数值
    -- actualValue = 0 --真实加减血血量
    damage = clone(Damage),
    buffEndOps = {}
}

--buff 附加的结构体
local BuffEndOp = {
    stageId = 0, --受益者的id
    isAlive = true, --是否死亡
    type = 0, --删除buff后触发的效果， 1:加血 2:减血 3:加怒 4:减怒
    -- value = 0, --触发效果的数值
    -- actualValue = 0 --真实加减血血量
    damage = clone(Damage)
}

--buff结构体
local Buff = {
    globalId = 0, --唯一id
    stageId = 0, --buff拥有者的全局id
    configId = 0, --表id
    removeId = 0, --顶掉buff的全局id
    isResist = false, --是否被抵抗
    showTime = 99, --展示时机
    attackId = 0, --释放buff者id
    skillId = 0, --导致buff技能的id
    -- type = 0,           --删除buff后触发的效果， 1:加血 2:减怒
    -- value = 0,          --触发效果的数值
    round = 0, --回合数
    buffEndOps = {}, --触发的buff结束效果
    petId = 0
}

--dot 类buff 效果
local BuffEffect = {
    globalId = 0, --唯一id
    -- type = 0, --1扣血 2 加血 3 加怒气
    -- value = 0, --具体数值
    -- actualValue = 0 --真实加减血血量
    damage = clone(Damage),
    isAlive = true --是否死亡
}

--具体攻击（一次攻击）
local Attack = {
    stageId = 0, --攻击者唯一id
    skillId = 0, --使用技能id
    camp = 0, --攻击者阵营
    isAlive = true, --攻击者是否存活
    awards = {}, --攻击者死亡掉落
    newUnits = {}, --新单位
    petCamp = 0, --如果是宠物攻击，宠物阵营
    isPet = false, --是否是宠物发动攻击
    isHistory = false, --是否是历代名将回合
    petCamp = 0, --宠物攻击阵营
    petId = 0, --宠物baseid
    hisCamp = 0, --历代名将阵营
    hisId = 0, --历代名将id
    --
    targets = {}, --受击目标 Target
    addTargets = {}, --附加目标（桃园结义锦囊）
    angers = {}, --怒气变化
    buffEffects = {}, --战斗前展示buff
    battleEffects = {}, --全局buff效果，战斗中展示
    delBuffsBefore = {}, --减少buff，攻击前减少buff
    delBuffsMiddle = {}, --第一次攻击删除的buff
    addBuffs = {}, --增加buff，攻击完成后附加buff
    delBuffs = {}, --删除buff，攻击完成后消失buff
    finalHp = {}, --最终血量
    stars = {} --历代名将
}

--回合
local Round = {
    index = 0, --回合数
    attacks = {}, --攻击者 Attack
    angers = {}, --round结束后的怒气buff
    buffs = {}, --回合开始前的buff
    stars = {}, --回合开始前的历代名将
    battleEffects = {} --回合开始前的加减血
}

local schema = {}
schema["units"] = {"table", {}} --单位unit
schema["pets"] = {"talbe", {}} --宠物单位
-- schema["battleStar"] = {"table", {}} --历代名将
schema["finalUnits"] = {"table", {}} --最终单位
schema["rounds"] = {"table", {}} --回合
schema["initBuff"] = {"table", {}} --初始buff
schema["first"] = {"number", 0} --先手
schema["firstEnter"] = {"table", {}} --初始上场
schema["enterStage"] = {"table", {}} --分批入场
schema["petsBuff"] = {"table", {}}
WaveData.schema = schema

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

function WaveData:ctor(properties)
    WaveData.super.ctor(self, peoperties)
end

function WaveData:clear()
    self:setUnits({})
    self:setPets({})
    self:setFinalUnits({})
    -- self:setBattleStar({})
    self:setRounds({})
    self:setFirst(0)
    self:setInitBuff({})
    self:setFirstEnter({})
    self:setEnterStage({})
    self:setPetsBuff({})
end

--根据服务器数据创建unit
local function makeUnit(data)
    local unit = clone(Unit)
    unit.camp = data.camp
    unit.configId = data.knight_id
    unit.cell = data.pos
    unit.stageId = data.camp * 100 + data.pos --stage_id 规则 阵营*100+pos 我方101-106，对方201-206
    unit.maxHp = data.max_hp
    unit.hp = data.hp
    unit.anger = data.anger
    unit.rankLevel = data.rank_lv
    unit.monsterId = data.monster_id
    unit.isLeader = data.is_leader
    unit.limitLevel = data.limit_lv
    unit.limitRedLevel = data.rtg_lv
    unit.protect = data.protect or 0
    if rawget(data, "show_mark") then
        for i = 1, #data.show_mark do
            table.insert(unit.showMark, data.show_mark[i])
        end
    end
    return unit
end

local function makePet(data)
    local pet = clone(Pet)
    pet.camp = data.camp
    pet.configId = data.pet_base_id
    pet.star = data.pet_star
    return pet
end

local function makeBattleStar(data)
    local star = clone(battleStar)
    star.id = data.star_base_id
    star.rank = data.star_rank_level
    star.stageId = data.camp * 100 + data.pos
    return star
end

--unitlist,传入members
function WaveData:createUnits(members)
    local unitList = {}
    for i, v in pairs(members) do
        local unit = makeUnit(v)
        table.insert(unitList, unit)
    end
    self:setUnits(unitList)
end

function WaveData:getUnitsByCamp(camp)
    local units = self:getUnits()
    local count = 0
    for i, v in pairs(units) do
        if v.camp == camp then
            count = count + 1
        end
    end
    return count
end

--finalUnitList
function WaveData:createFinalUnits(members)
    local unitList = {}
    for i, v in pairs(members) do
        local unit = makeUnit(v)
        table.insert(unitList, unit)
    end
    self:setFinalUnits(unitList)
end

function WaveData:getFinalUnitsByCamp(camp)
    local units = self:getFinalUnits()
    local count = 0
    for i, v in pairs(units) do
        if v.camp == camp then
            count = count + 1
        end
    end
    return count
end

--创建buff
local function makeBuff(data)
    local buff = clone(Buff)
    -- buff.globalId = data.id
    --newid(16):moveid(16)
    buff.globalId = getNumByBit(data.new_id_and_remove_id, 1, 16)
    -- buff.stageId = data.member.order*100 + data.member.pos
    buff.stageId = getStageId(data.member.order_pos)
    buff.configId = data.buff_id
    buff.removeId = getNumByBit(data.new_id_and_remove_id, 17, 16)
    -- buff.isResist = data.is_resist
    buff.showTime = data.show_type
    buff.round = data.round
    if rawget(data, "end_op") then
        for i = 1, #data.end_op do
            local opData = data.end_op[i]
            local op = clone(BuffEndOp)
            -- op.stageId = opData.member.order*100 + opData.member.pos
            op.stageId = getStageId(opData.member.order_pos)
            op.type = opData.type
            op.damage.value = opData.actual_value or opData.value
            op.damage.showValue = opData.value
            op.damage.pType = opData.type
            op.damage.protect = opData.protect or 0

            if rawget(opData, "is_live") ~= nil then
                op.isAlive = opData.is_live
            end

            table.insert(buff.buffEndOps, op)
        end
    end
    if rawget(data, "add_member") then
        -- buff.attackId = data.add_member.order*100 + data.add_member.pos
        buff.attackId = getStageId(data.add_member.order_pos)
        if buff.attackId % 100 == 0 then
            buff.petId = data.pet_id
        end
        buff.skillId = data.skill_id
    end
    return buff
end

--初始化buff列表
function WaveData:createInitBuff(buffs)
    local buffList = {}
    for i = 1, #buffs do
        local buff = makeBuff(buffs[i])
        table.insert(buffList, buff)
    end
    self:setInitBuff(buffList)
end

--创建buffEffect
local function makeBuffEffect(data)
    local buffEffect = clone(BuffEffect)
    buffEffect.globalId = data.id

    buffEffect.damage.type = data.type
    buffEffect.damage.value = data.actual_value or data.value
    buffEffect.damage.showValue = data.value
    buffEffect.damage.pType = data.type
    buffEffect.damage.protect = data.protect or 0

    return buffEffect
end

--神兽入场buff
function WaveData:createPetsBuff(buffs)
    local buffList = {}
    for i = 1, #buffs do
        local buff = makeBuffEffect(buffs[i])
        table.insert(buffList, buff)
    end
    self:setPetsBuff(buffList)
end

--创建怒气变化
local function makeAngerChange(data)
    local angerChange = clone(AngerChange)
    -- angerChange.stageId = data.member.order*100 + data.member.pos
    angerChange.stageId = getStageId(data.member.order_pos)
    -- angerChange.showType = data.stype
    -- angerChange.type = data.type

    --stype(16):showtype(16)
    angerChange.showType = getNumByBit(data.stype_and_show_type, 1, 16)
    angerChange.type = data.type

    angerChange.configId = data.buff_id
    angerChange.value = data.value
    -- angerChange.resist = data.is_resist
    angerChange.showTime = getNumByBit(data.stype_and_show_type, 17, 16)
    return angerChange
end

--创建battleEffect
local function makeBattleEffect(data, isPet)
    local battleEffect = clone(BattleEffect)
    -- battleEffect.stageId = data.member.order*100 + data.member.pos
    battleEffect.stageId = getStageId(data.member.order_pos)
    -- if data.member.pos == 0 then
    --     battleEffect.petId = data.pet_id
    -- end

    -- battleEffect.attackId = data.attack_member.order*100 + data.attack_member.pos
    battleEffect.attackId = getStageId(data.attack_member.order_pos)
    if battleEffect.attackId % 100 == 0 then
        battleEffect.petId = data.pet_id
    end
    battleEffect.configId = data.buff_id
    -- battleEffect.type = data.type
    -- battleEffect.value = data.value
    battleEffect.skillId = data.skill_id
    if rawget(data, "is_live") ~= nil then
        battleEffect.isAlive = data.is_live
    end

    --伤害记录成一个结构
    battleEffect.damage.type = data.type
    battleEffect.damage.value = data.actual_value or data.value or 0
    battleEffect.damage.showValue = data.value or 0
    battleEffect.damage.pType = data.type
    battleEffect.damage.protect = data.protect or 0

    local endOp = rawget(data, "end_op")
    if endOp then
        for i = 1, #endOp do
            local opData = data.end_op[i]
            local op = clone(BuffEndOp)
            -- op.stageId = opData.member.order*100 + opData.member.pos
            op.stageId = getStageId(opData.member.order_pos)
            op.type = opData.type
            -- op.value = opData.value
            if rawget(opData, "is_live") ~= nil then
                op.isAlive = opData.is_live
            end

            op.damage.value = opData.actual_value or opData.value
            op.damage.showValue = opData.value
            op.damage.pType = op.type
            op.damage.protect = opData.protect or 0

            table.insert(battleEffect.buffEndOps, op)
        end
    end

    return battleEffect
end

--创建附加目标
local function makeAddTarget(data)
    local target = clone(AddTarget)
    -- target.stageId = data.defense_member.order*100 + data.defense_member.pos
    target.stageId = getStageId(data.defense_member.order_pos)
    -- target.attackStageId = data.attack_member.order*100 + data.attack_member.pos
    target.attackStageId = getStageId(data.attack_member.order_pos)
    -- target.type = data.type
    -- target.value = data.value
    target.isAlive = data.is_live
    target.showType = data.show_type

    --伤害记录成一个结构
    target.damage.type = data.type
    target.damage.value = data.actual_value or data.value
    target.damage.showValue = data.value
    target.damage.pType = data.type
    target.damage.protect = data.protect or 0

    return target
end

--创建目标
local function makeTarget(data)
    local target = clone(Target)
    -- target.stageId = data.defense_member.order*100 + data.defense_member.pos
    target.stageId = getStageId(data.defense_member.order_pos)

    --伤害记录成一个结构
    target.damage.type = data.type
    target.damage.value = data.actual_value or data.value
    target.damage.showValue = data.value
    target.damage.pType = data.type
    target.damage.protect = data.protect or 0

    target.isAlive = data.is_live
    if rawget(data, "hurt_infos") then
        for i = 1, #data.hurt_infos do
            local hurt = clone(Hurt)
            hurt.hurtId = data.hurt_infos[i].id
            hurt.hurtValue = data.hurt_infos[i].value
            table.insert(target.hurts, hurt)
        end
    end

    if rawget(data, "awards") then
        for _, v in pairs(data.awards) do
            local award = clone(Award)
            award.type = v.type
            award.value = v.value
            award.size = v.size
            table.insert(target.awards, award)
        end
    end
    return target
end

--创建一次攻击
local function makeAttack(data)
    local attack = clone(Attack)

    attack.stageId = getStageId(data.attack_pos.order_pos)
    attack.skillId = data.skill_id
    attack.isAlive = data.is_live
    attack.camp = math.floor(attack.stageId / 100)

    --  type(8):camp(8):id(16)
    -- HERO_TYPE_HERO uint32 = 0 // 武将
    -- HERO_TYPE_PET  uint32 = 1 // 神兽
    -- HERO_TYPE_STAR uint32 = 2 // 历代名将
    local type = getNumByBit(data.attack_hero_info, 1, 8)
    local camp = getNumByBit(data.attack_hero_info, 9, 8)
    local id = getNumByBit(data.attack_hero_info, 17, 16)
    if type == 1 then
        attack.isPet = true
        attack.petCamp = camp
        attack.petId = id
    elseif type == 2 then
        attack.isHistory = true
        attack.hisCamp = camp
        attack.hisId = id
    end

    if rawget(data, "attack_infos") then
        for i = 1, #data.attack_infos do
            local target = makeTarget(data.attack_infos[i])
            table.insert(attack.targets, target)
        end
    end

    if rawget(data, "attack_add_infos") then
        for i = 1, #data.attack_add_infos do
            local target = makeAddTarget(data.attack_add_infos[i])
            table.insert(attack.addTargets, target)
        end
    end

    if rawget(data, "add_buffs") then
        for i = 1, #data.add_buffs do
            local buff = makeBuff(data.add_buffs[i])
            table.insert(attack.addBuffs, buff)
        end
    end

    if rawget(data, "del_buff") then
        for i = 1, #data.del_buff do
            local buff = makeBuff(data.del_buff[i])
            table.insert(attack.delBuffs, buff)
        end
    end

    if rawget(data, "del_buff_before") then
        for i = 1, #data.del_buff_before do
            local buff = makeBuff(data.del_buff_before[i])
            table.insert(attack.delBuffsBefore, buff)
        end
    end

    if rawget(data, "del_buff_middle") then
        for i = 1, #data.del_buff_middle do
            local buff = makeBuff(data.del_buff_middle[i])
            table.insert(attack.delBuffsMiddle, buff)
        end
    end

    if rawget(data, "buff_effects") then
        for i = 1, #data.buff_effects do
            local buffEffect = makeBuffEffect(data.buff_effects[i])
            table.insert(attack.buffEffects, buffEffect)
        end
    end

    if rawget(data, "battle_effects") then
        for i = 1, #data.battle_effects do
            local battleEffect = makeBattleEffect(data.battle_effects[i], attack.isPet)
            table.insert(attack.battleEffects, battleEffect)
        end
    end

    if rawget(data, "angers") then
        for i = 1, #data.angers do
            local angerChange = makeAngerChange(data.angers[i])
            table.insert(attack.angers, angerChange)
        end
    end

    if rawget(data, "awards") then
        for _, val in pairs(data.awards) do
            local award = clone(Award)
            award.type = val.type
            award.value = val.value
            award.size = val.size
            table.insert(attack.awards, award)
        end
    end

    if rawget(data, "new_members") then
        for _, val in pairs(data.new_members) do
            local unit = makeUnit(val)
            table.insert(attack.newUnits, unit)
        end
    end

    if rawget(data, "final_hp") then
        for i = 1, 12 do
            local cell = {}
            if i < 7 then
                cell.id = 100 + i
            else
                cell.id = 200 + i - 6
            end
            cell.hp = data.final_hp[i] or 0
            table.insert(attack.finalHp, cell)
        end
    end

    if rawget(data, "stars") then
        for _, starData in pairs(data.stars) do
            local star = makeBattleStar(starData)
            table.insert(attack.stars, star)
        end
    end

    return attack
end

-- message BattleOneRound {
-- 	optional uint32 round_index = 1;    //回合数
-- 	repeated BattleOneAttack attacks = 2;
-- 	repeated NewBattleMember new_members = 3;//分身情况 在回合开始的时候判断
-- 	optional uint32 wave_index = 4;
-- 	repeated BattleAnger angers = 5; //攻击后怒气变化 这些全部放在攻击事件里面 全局的效果
-- 	repeated BattleBuff add_buffs = 6;
--     repeated BattleStarShow stars = 7; // 历代名将
--     repeated BattleEffect battle_effects = 8;  //全局的buff效果
-- }

local function makeRound(data)
    local round = clone(Round)
    if rawget(data, "round_index") then
        round.index = data.round_index
    end

    if rawget(data, "attacks") then
        -- require("app.fight.reportParse.DamageHelper").parseAttackDatas(rawget(data, "attacks")) --伤害分析
        for i = 1, #data.attacks do
            local attack = makeAttack(data.attacks[i])
            table.insert(round.attacks, attack)
        end
    end

    if rawget(data, "angers") then
        for i = 1, #data.angers do
            local angerChange = makeAngerChange(data.angers[i])
            table.insert(round.angers, angerChange)
        end
    end

    if rawget(data, "add_buffs") then
        for i = 1, #data.add_buffs do
            local buff = makeBuff(data.add_buffs[i])
            table.insert(round.buffs, buff)
        end
    end

    if rawget(data, "stars") then
        for i = 1, #data.stars do 
            local star = makeBattleStar(data.stars[i])
            table.insert(round.stars, star)
        end
    end

    if rawget(data, "battle_effects") then
        for i = 1, #data.battle_effects do 
            local effect = makeBattleEffect(data.battle_effects)
            table.insert(round.battleEffects, effect)
        end
    end

    return round
end

function WaveData:setWaveData(data)
    if rawget(data, "members") then
        self:createUnits(data.members)
    end

    if rawget(data, "members_final") then
        self:createFinalUnits(data.members_final)
    end

    local rounds = {}
    if rawget(data, "rounds") then
        for i = 1, #data.rounds do
            local round = makeRound(data.rounds[i])
            table.insert(rounds, round)
        end
        self:setRounds(rounds)
    end

    if rawget(data, "first_order") then
        self:setFirst(data.first_order)
    end

    if rawget(data, "init_buff") then
        self:createInitBuff(data.init_buff)
    end

    if rawget(data, "pets_buff") then
        self:createPetsBuff(data.pets_buff)
    end

    if rawget(data, "first_enter") then
        local list = {}
        for i = 1, #data.first_enter do
            table.insert(list, data.first_enter[i])
        end
        self:setFirstEnter(list)
    end

    if rawget(data, "enter_stage") then
        local list = {}
        for i = 1, #data.enter_stage do
            table.insert(list, data.enter_stage[i])
        end
        self:setEnterStage(list)
    end

    if rawget(data, "pets") then
        local pets = {}
        for i = 1, #data.pets do
            local pet = makePet(data.pets[i])
            table.insert(pets, pet)
        end
        self:setPets(pets)
    end

    -- if rawget(data, "stars") then
    --     local stars = {}
    --     for i = 1, #data.stars do
    --         local star = makeBattleStar(data.stars[i])
    --         table.insert(stars, star)
    --     end
    --     self:setBattleStar(stars)
    -- end

    -- --假宠物
    -- local pets = {}
    -- local pet =
    -- {
    --     camp = 1,           --阵营
    --     configId = 1,       --表id
    --     star = 1,           --星级
    -- }
    -- table.insert(pets, pet)
    -- self:setPets(pets)
end

return WaveData
