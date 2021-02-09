local Unit = {
	stage_id = 0, 							--唯一id
	cfg_id = 0,  							--表id
	camp = 0, 								--队伍
	cell = 0, 								--坐标
	max_hp = 0, 							--最大血量
	hp = 0, 								--血量
	anger = 0, 									--怒气
    rank_lv = 0,                            --突破等级
    monsterId = 0,                          --如果是怪物的话，怪物id
}

local Award = {
	ttype = 0, 								--掉落类型
	value = 0, 								--掉落id
	size = 0 								--掉落数量
}

local Hurt = {
    hurt_id = 0,                            --1 闪避 2 暴击 3 招架 4 无敌 5 反弹 6吸血
    hurt_value = 0,                         --5 6 代表具体的数值
}

local Target = {
	stage_id = 0, 							--目标唯一id
	ttype = 0, 								--事件类型
	value = 0, 								--数值
	isAlive = true, 								--是否死亡
	awards = {}, 							--掉落 Award
    hurts = {},                             --攻击修正
}

local AngerChange = {
    stage_id = 0,                           -- 唯一id
    stype = 0,                     --0正常，1需要提示
    type = 0,                     --1, 扣，2加
    cfg_id = 0,                     --buff表现id
    value = 0,                    --变化数值
    resist = false,                      --是否被免疫
}

local Attack = {
	stage_id = 0, 							--攻击者唯一id
	skill_id = 0, 							--使用技能id
    camp = 0,                               --攻击者阵营
	targets = {}, 							--受击目标 Target
    angers = {},                            --怒气变化

    buff_effects = {},                      --战斗前展示buff
    battle_effects = {},                    --全局buff效果，战斗中展示

    del_buffs_before = {},                   --减少buff，攻击前减少buff

    add_buffs = {},                         --增加buff，攻击完成后附加buff
    del_buffs = {},                         --删除buff，攻击完成后消失buff

    isAlive = true,
}

local Round = {
	index = 0, 								--回合数
	attacks = {} 							--攻击者 Attack
}

local BattleEffect = 
{
    stage_id = 0,               --buff拥有者的全局id
    cfg_id = 0,                 --表id 
    type = 0,                   --1扣血 2 加血
    value = 0,                  --具体数值
}

local Buff = {
    global_id = 0,      --唯一id
    stage_id = 0,       --buff拥有者的全局id
    cfg_id = 0,         --表id  
    remove_id = 0,      --顶掉buff的全局id
    is_resist = false,  --是否被抵抗
--
    buff_type = 0,       --1扣血 2 加血 3 加怒气
    value = 0,              --具体数值
}

local Wave = {
	index = 0, 								--波次
    units = {},                               --单位 Unit
	rounds = {}, 							--回合 Round
    first = 0,
    lname = "",
    rname = "",
}

local Report = {
	waves = {},
	fight_type = 0, 						--战斗模式
	win = false,							--是否胜利
	first = 0,								--先手
	lname = "",								--名字
	rname = "",								--名字
}

-----------------------------------------------------------------------------------------
--战报数据
-----------------------------------------------------------------------------------------

local battleReportParser = {}

function battleReportParser.parse(report)
	-- 战报
	assert(type(report) == "table", "Invalid battleReport: "..tostring(report))
    local result = clone(Report)
    result.report = report

    --输入基本信息
    result.fight_type = report.pk_type
    result.win = report.is_win
    --result.first = report.first_order
    result.lname = report.attack_name
    result.rname = report.defense_name

    --解析wave
    battleReportParser._parseWaveInfo(result)
    return result
end

function battleReportParser._parseWaveInfo(result)
    local report = result.report
    local waves = {}
    local waveData = report.waves
    for i = 1, #waveData do
        local singleWave = waveData[i]
        local wave = clone(Wave)
        wave.index = i
        battleReportParser._parseUnitInfo(wave, singleWave)
        battleReportParser._parseBattleOneRound(wave, singleWave)
        table.insert(waves, wave)
    end
    result.waves = waves
end

function battleReportParser._parseUnitInfo(wave, singleWave)
    for i = 1, #singleWave.members do
        local heroData = singleWave.members[i]
        local unit = battleReportParser._makeUnit(heroData)
        table.insert(wave.units, unit)
    end
end

function battleReportParser._makeUnit(heroData) 
    local unit = clone(Unit)
    unit.camp = heroData.camp
    unit.cfg_id = heroData.knight_id
    unit.cell = heroData.pos
    unit.stage_id = heroData.camp*100 + heroData.pos --stage_id 规则 阵营*100+pos 我方101-106，对方201-206
    unit.max_hp = heroData.max_hp
    unit.hp = heroData.hp
    unit.anger = heroData.anger
    unit.rank_lv = heroData.rank_lv
    unit.monsterId = heroData.monster_id
    return unit
end

function battleReportParser._parseBattleOneRound(wave, singleWave)
--目前是简单的解析，以后复杂度上升的时候需要拆分
    local rounds = {}
    local battleRounds = singleWave.rounds
    for i = 1, #battleRounds do
        local roundData = battleRounds[i]
        local round = clone(Round)
        round.index = roundData.round_index
        for j = 1, #roundData.attacks do
            local data = roundData.attacks[j]
            local attack = clone(Attack)
            attack.isAlive = data.is_live
            attack.stage_id = data.attack_pos.order*100 + data.attack_pos.pos
            attack.skill_id = data.skill_id
            --print("fdsa skillid = "..data.skill_id)
            attack.camp = data.attack_pos.order
            for k = 1, #data.attack_infos do
                local targetData = data.attack_infos[k]
                local target = clone(Target)
                target.stage_id = targetData.defense_member.order*100 + targetData.defense_member.pos
                target.ttype = targetData.type
                target.value = targetData.value
				target.isAlive = targetData.is_live
                for key, val in pairs(targetData.hurt_infos) do
                    local hurt = clone(Hurt)
                    hurt.hurt_id = val.id
                    hurt.hurt_value = val.value
                    table.insert(target.hurts, hurt)
                end
                table.insert(attack.targets, target)
            end
            if data.add_buffs then
                for k = 1, #data.add_buffs do
                    local buffData = data.add_buffs[k] 
                    local buff = clone(Buff)
                    buff.global_id = buffData.id
                    buff.cfg_id = buffData.buff_id
                    buff.remove_id = buffData.remove_id
                    buff.stage_id = buffData.member.order*100 + buffData.member.pos
                    buff.is_resist = buffData.is_resist
                    table.insert(attack.add_buffs, buff)
                end
            end
            if data.del_buff then
                for k = 1, #data.del_buff do
                    local buffData = data.del_buff[k] 
                    local buff = clone(Buff)
                    buff.global_id = buffData.id
                    buff.cfg_id = buffData.buff_id
                    buff.remove_id = buffData.remove_id
                    buff.stage_id = buffData.member.order*100 + buffData.member.pos
                    buff.is_resist = buffData.is_resist
                    table.insert(attack.del_buffs, buff)
                end
            end
            if data.del_buff_before then
                for k = 1, #data.del_buff_before do
                    local buffData = data.del_buff_before[k] 
                    local buff = clone(Buff)
                    buff.global_id = buffData.id
                    buff.cfg_id = buffData.buff_id
                    buff.remove_id = buffData.remove_id
                    buff.stage_id = buffData.member.order*100 + buffData.member.pos
                    buff.is_resist = buffData.is_resist
                    table.insert(attack.del_buffs_before, buff)
                end
            end
            if data.buff_effects then
                for k = 1, #data.buff_effects do
                    local buffData = data.buff_effects[k]
                    local buff = clone(Buff)
                    buff.global_id = buffData.id
                    buff.buff_type = buffData.type
                    buff.value = buffData.value
                    table.insert(attack.buff_effects, buff)
                end
            end
            if data.angers then
                for k = 1, #data.angers do
                    local angerData = data.angers[k]
                    local anger = clone(AngerChange)
                    anger.stage_id = angerData.member.order*100 + angerData.member.pos
                    anger.stype = angerData.stype
                    anger.cfg_id = angerData.buff_id
                    anger.type = angerData.type
                    anger.value = angerData.value
                    anger.resist = angerData.is_resist
                    table.insert(attack.angers, anger)
                end
            end
            if data.battle_effects then
                for k = 1, #data.battle_effects do
                    local effectData = data.battle_effects[k]
                    local effect = clone(BattleEffect)
                    effect.stage_id = effectData.member.order*100 + effectData.member.pos
                    effect.cfg_id = effectData.buff_id
                    effect.type = effectData.type
                    effect.value = effectData.value
                    table.insert(attack.battle_effects, effect)
                end
            end
            table.insert(round.attacks, attack)
        end
        table.insert(rounds, round)
    end    
    wave.rounds = rounds
end

return battleReportParser