export class Unit {
    stageId = 0; //战场id
    configId = 0; //表id
    camp = 0; //队伍
    cell = 0; //坐标
    maxHp = 0; //最大血量
    hp = 0; //血量
    anger = 0; //怒气
    rankLevel = 0; //突破等级
    monsterId = 0; //怪物id
    isLeader = false; //是否是主角
    limitLevel = 0; //界限突破等级
    limitRedLevel = 0; //红升金界限突破等级
    showMark: number[] = [] //展示的buff， 1，桃园结义
    protect = 0;
}


export class BattleStar {
    //历代名将
    id = 0;   //英雄id
    rank = 0; //突破等级
    stageId =0; //所有者id
}

export class Damage {
    type = 0;  //伤害类型; 1 扣血 2 加血
    value = 0;  //伤害真实数值
    showValue = 0  //展示数量
    pType = 0;  //护盾加减类型, 1 扣  2加
    protect = 0; //护盾增加或者减少（根据type）
}

//宠物
export class Pet {
    camp = 0;  //阵营
    configId = 0;  //表id
    star = 0  //星级
}

//奖励
export class Award {
    type = 0;  //掉落类型
    value = 0;  //掉落id
    size = 0  //掉落数量
}

//伤害
export class Hurt {
    hurtId = 0;  //1 闪避 2 暴击 3 招架 4 无敌  5 吸收
    hurtValue = 0  //5 6 中用作具体的数值
}

//目标
export class Target {
    stageId = 0;  //战场id
    isAlive = true;  //是否死亡
    awards: Award[] = []  //掉落 Award
    hurts: Hurt[] = [];  //攻击修正
    type = 0;  //事件类型
    value = 0;  //数值
    // actualValue = 0;    //真正的加减血量
    damage: Damage = new Damage();
}

// 附加目标
export class AddTarget {
    stageId = 0;  //战场id
    attackStageId = 0;  //给予分摊的将的id
    isAlive = true;  //是否死亡
    showType = 0;  //展示 0普通 1桃园结义 2转移伤害 3溢出伤害治疗 4溢出治疗
    type = 0;  //事件类型
    value = 0;  //数值
    // actualValue = 0  //真实加减血血量
    damage: Damage = new Damage();
}

//怒气变化
export class AngerChange {
    stageId = 0;  // 战场id
    showType = 0;  // 0正常，1需要提示
    type = 0;  // 1; 扣，2加
    configId = 0;  // buff表现id
    value = 0;  // 变化数值
    resist = false;  // 是否被免疫
    showTime = 99  // 展示时机
}

//全局buff，战斗中展示
export class BattleEffect {
    stageId = 0;  //buff拥有者的全局id
    attackId = 0;  //释放者id
    configId = 0;  //表id
    skillId = 0;  //技能id
    petId = 0;  //神兽id
    isAlive = true;  //是否存活
    // type = 0;  //1扣血 2 加血
    // value = 0;  //具体数值
    // actualValue = 0  //真实加减血血量
    damage: Damage = new Damage();
    buffEndOps: BuffEndOp[] = [];
}

//buff 附加的结构体
export class BuffEndOp {
    stageId = 0;  //受益者的id
    isAlive = true;  //是否死亡
    type = 0;  //删除buff后触发的效果， 1:加血 2:减血 3:加怒 4:减怒
    // value = 0;  //触发效果的数值
    // actualValue = 0  //真实加减血血量
    damage: Damage = new Damage();
}

//buff结构体
export class Buff {
    globalId = 0;  //唯一id
    stageId = 0;  //buff拥有者的全局id
    configId = 0;  //表id
    removeId = 0;  //顶掉buff的全局id
    isResist = false;  //是否被抵抗
    showTime = 99;  //展示时机
    attackId = 0;  //释放buff者id
    skillId = 0;  //导致buff技能的id
    // type = 0;            //删除buff后触发的效果， 1:加血 2:减怒
    // value = 0;           //触发效果的数值
    round = 0;  //回合数
    buffEndOps: BuffEndOp[] = []  //触发的buff结束效果
    petId = 0;
    buffConfig: any = null;
}

//dot 类buff 效果
export class BuffEffect {
    globalId = 0;  //唯一id
    // type = 0;  //1扣血 2 加血 3 加怒气
    // value = 0;  //具体数值
    // actualValue = 0  //真实加减血血量
    damage: Damage = new Damage();
    isAlive = true  //是否死亡
}

//具体攻击（一次攻击）
export class Attack {
    stageId = 0;  //攻击者唯一id
    skillId = 0;  //使用技能id
    camp = 0;  //攻击者阵营
    isAlive = true;  //攻击者是否存活
    awards: Award[] = []  //攻击者死亡掉落
    newUnits: Unit[] = [];  //新单位
    petCamp = 0;  //如果是宠物攻击，宠物阵营
    isPet = false;  //是否是宠物发动攻击
    isHistory = false;  //是否是历代名将回合
    // petCamp = 0;  //宠物攻击阵营
    petId = 0;  //宠物baseid
    hisCamp = 0;  //历代名将阵营
    hisId = 0;  //历代名将id
    //
    targets: Target[] = [];  //受击目标 Target
    addTargets: AddTarget[] = [];  //附加目标（桃园结义锦囊）
    angers: AngerChange[] = [];  //怒气变化
    buffEffects: BuffEffect[] = [];  //战斗前展示buff
    battleEffects: BattleEffect[] = [];  //全局buff效果，战斗中展示
    delBuffsBefore: Buff[] = [];  //减少buff，攻击前减少buff
    delBuffsMiddle: Buff[] = [];  //第一次攻击删除的buff
    addBuffs: Buff[] = [];  //增加buff，攻击完成后附加buff
    delBuffs: Buff[] = [];  //删除buff，攻击完成后消失buff
    finalHp = []; //最终血量
    stars = []; //历代名将
}

//回合
export class Round {
    index = 0;  //回合数
    attacks: Attack[] = [];  //攻击者 Attack
    angers: AngerChange[] = [];  //round结束后的怒气buff
    buffs:Buff[] = []; //回合开始前的buff
    stars = []; //回合开始前的历代名将
    battleEffects:BattleEffect[] = [];  //回合开始前的加减血
}

export class WaveData {

    private units: Unit[] = []; //单位unit
    private pets: Pet[] = []; //宠物单位
    //private battleStar: BattleStar[] = []; //历代名将
    private finalUnits: Unit[] = []; //最终单位
    private rounds: Round[] = []; //回合
    private initBuff: Buff[] = []; //初始buff
    private first: number = 0; //先手
    private firstEnter: number[] = []; //初始上场
    private enterStage = []; //分批入场
    private petsBuff: BuffEffect[] = [];
    private _starIds: number[] = [];

    public get starIds(): number[] {
        return this._starIds;
    }
    

    public getUnits() {
        return this.units;
    }

    public getPets() {
        return this.pets;
    }

    public getFinalUnits() {
        return this.finalUnits;
    }

    public getRounds() {
        return this.rounds;
    }

    public getFirstEnter() {
        return this.firstEnter;
    }

    public getEnterStage() {
        return this.enterStage;
    }

    public getInitBuff() {
        return this.initBuff;
    }

    public getPetsBuff() {
        return this.petsBuff;
    }

    private getNumByBit(number: number, bitStart: number, bitLength: number): number {
        let bitNumber: string = number.toString(2);
        let bit0: string = "";
        for (let i = 0; i < 32 - bitNumber.length; i++) {
            bit0 += "0"
        }
        bitNumber = bit0 + bitNumber;
        return parseInt(bitNumber.substr(bitStart, bitLength), 2);
    }

    private getStageId(attackPos): number {
        let atkOrder: number = this.getNumByBit(attackPos, 0, 16)
        let atkPos: number = this.getNumByBit(attackPos, 16, 16)
        let id: number = atkOrder * 100 + atkPos;
        return id;
    }

    private makeUnit(data): Unit {
        let unit: Unit = new Unit();
        unit.camp = data.camp;
        unit.configId = data.knight_id;
        unit.cell = data.pos;
        unit.stageId = data.camp * 100 + data.pos; //stage_id 规则 阵营 * 100 + pos 我方101 - 106，对方201 - 206
        unit.maxHp = parseInt(data.max_hp);
        unit.hp = parseInt(data.hp);
        unit.anger = data.anger;
        unit.rankLevel = data.rank_lv;
        unit.monsterId = data.monster_id;
        unit.isLeader = data.is_leader;
        unit.limitLevel = data.limit_lv;
        unit.limitRedLevel = data.rtg_lv;
        unit.protect = data.protect || 0;
        unit.showMark = [];
        if (data.show_mark) {
            for (let i = 0; i < data.show_mark.length; i++) {
                unit.showMark.push(data.show_mark[i]);
            }
        }
        return unit;
    }

    private makePet(data): Pet {
        let pet: Pet = new Pet();
        pet.camp = data.camp
        pet.configId = data.pet_base_id
        pet.star = data.pet_star
        return pet
    }

    private makeBattleStar(data): BattleStar {
        let star: BattleStar = new BattleStar();
        star.id = data.star_base_id;
        star.rank = data.star_rank_level;
        star.stageId = data.camp * 100 + data.pos;
        return star
    }

    private createUnits(members) {
        let unitList: Unit[] = [];
        for (let i = 0; i < members.length; i++) {
            let unit = this.makeUnit(members[i]);
            unitList.push(unit);
        }
        this.units = unitList;
    }

    public getUnitsByCamp(camp) {
        let count = 0;
        for (let i = 0; i < this.units.length; i++) {
            if (this.units[i].camp == camp) {
                count += 1;
            }
        }
        return count;
    }

    //finalUnitList
    private createFinalUnits(members) {
        let unitList: Unit[] = [];
        for (let i = 0; i < members.length; i++) {
            let unit: Unit = this.makeUnit(members[i]);
            unitList.push(unit);
        }
        this.finalUnits = unitList;
    }

    public getFinalUnitsByCamp(camp) {
        let count = 0;
        for (let i = 0; i < this.finalUnits.length; i++) {
            if (this.finalUnits[i].camp == camp) {
                count += 1;
            }
        }
        return count;
    }

    //创建buff
    private makeBuff(data) {
        let buff: Buff = new Buff();
        // buff.globalId = data.id
        // newid(16):moveid(16)
        buff.globalId = this.getNumByBit(data.new_id_and_remove_id, 0, 16);
        // buff.stageId = data.member.order * 100 + data.member.pos
        buff.stageId = this.getStageId(data.member.order_pos);
        buff.configId = data.buff_id;
        buff.removeId = this.getNumByBit(data.new_id_and_remove_id, 16, 16);
        // buff.isResist = data.is_resist
        buff.showTime = data.show_type;
        buff.round = data.round;
        if (data.end_op) {
            for (let i = 0; i < data.end_op.length; i++) {
                let opData = data.end_op[i]
                let op: BuffEndOp = new BuffEndOp();
                // op.stageId = opData.member.order * 100 + opData.member.pos
                op.stageId = this.getStageId(opData.member.order_pos);
                op.type = opData.type;
                //op.value = opData.value;
                op.damage.value = opData.actual_value || opData.value;
                op.damage.showValue = opData.value;
                op.damage.pType = opData.type;
                op.damage.protect = opData.protect || 0;

                if (opData.is_live) {
                    op.isAlive = opData.is_live;
                }
                // op.damage.type = data.type
                // op.damage.value = opData.actual_value || opData.value;
                // op.damage.showValue = opData.value;

                buff.buffEndOps.push(op);
            }
        }
        if (data.add_member) {
            // buff.attackId = data.add_member.order * 100 + data.add_member.pos
            buff.attackId = this.getStageId(data.add_member.order_pos);
            if (buff.attackId % 100 == 0) {
                buff.petId = data.pet_id
            }
            buff.skillId = data.skill_id
        }
        return buff;
    }



    // 初始化buff列表
    private createInitBuff(buffs) {
        let buffList: Buff[] = []
        for (let i = 0; i < buffs.length; i++) {
            let buff: Buff = this.makeBuff(buffs[i]);
            buffList.push(buff);
        }
        this.initBuff = buffList;
    }


    // 创建buffEffect
    private makeBuffEffect(data) {
        let buffEffect: BuffEffect = new BuffEffect();
        buffEffect.globalId = data.id;

        buffEffect.damage.type = data.type;
        buffEffect.damage.value = data.actual_value || data.value;
        buffEffect.damage.showValue = data.value;
        buffEffect.damage.pType = data.type
        buffEffect.damage.protect = data.protect || 0
        return buffEffect;
    }

    // 神兽入场buff
    private createPetsBuff(buffs) {
        let buffList: BuffEffect[] = [];
        for (let i = 0; i < buffs.length; i++) {
            let buff: BuffEffect = this.makeBuffEffect(buffs[i]);
            buffList.push(buff);
        }
        this.petsBuff = buffList;
    }


    // 创建怒气变化
    private makeAngerChange(data) {
        let angerChange: AngerChange = new AngerChange();
        // angerChange.stageId = data.member.order * 100 + data.member.pos
        angerChange.stageId = this.getStageId(data.member.order_pos);
        // angerChange.showType = data.stype
        // angerChange.type = data.type

        // stype(16): showtype(16)
        angerChange.showType = this.getNumByBit(data.stype_and_show_type, 0, 16);
        angerChange.type = data.type

        angerChange.configId = data.buff_id
        angerChange.value = data.value
        // angerChange.resist = data.is_resist
        angerChange.showTime = this.getNumByBit(data.stype_and_show_type, 16, 16);
        return angerChange;
    }

    // 创建battleEffect
    private makeBattleEffect(data, isPet?) {
        let battleEffect: BattleEffect = new BattleEffect();
        // battleEffect.stageId = data.member.order * 100 + data.member.pos
        battleEffect.stageId = this.getStageId(data.member.order_pos);

        // if data.member.pos == 0 then
        // battleEffect.petId = data.pet_id
        // end

        // battleEffect.attackId = data.attack_member.order * 100 + data.attack_member.pos
        battleEffect.attackId = this.getStageId(data.attack_member.order_pos);
        if (battleEffect.attackId % 100 == 0) {
            battleEffect.petId = data.pet_id;
        }
        battleEffect.configId = data.buff_id;
        // battleEffect.type = data.type
        // battleEffect.value = data.value
        battleEffect.skillId = data.skill_id;
        if (data.is_live) {
            battleEffect.isAlive = data.is_live;
        }


        // 伤害记录成一个结构
        battleEffect.damage.type = data.type;
        battleEffect.damage.value = data.actual_value || data.value || 0;
        battleEffect.damage.showValue = data.value || 0;
        battleEffect.damage.pType = data.type;
        battleEffect.damage.protect = data.protect || 0;

        let endOp = data.end_op;
        if (endOp) {
            for (let i = 0; i < endOp.length; i++) {
                let opData = data.end_op[i];
                let op: BuffEndOp = new BuffEndOp();
                // op.stageId = opData.member.order * 100 + opData.member.pos
                op.stageId = this.getStageId(opData.member.order_pos);
                op.type = opData.type;
                // op.value = opData.value
                if (opData.is_live) {
                    op.isAlive = opData.is_live;
                }

                op.damage.value = opData.actual_value || opData.value;
                op.damage.showValue = opData.value;
                op.damage.pType = op.type;
                op.damage.protect = opData.protect || 0;
                battleEffect.buffEndOps.push(op);
            }
        }

        return battleEffect;
    }


    // 创建附加目标
    private makeAddTarget(data) {
        let target: AddTarget = new AddTarget();
        // target.stageId = data.defense_member.order * 100 + data.defense_member.pos
        target.stageId = this.getStageId(data.defense_member.order_pos);
        // target.attackStageId = data.attack_member.order * 100 + data.attack_member.pos
        target.attackStageId = this.getStageId(data.attack_member.order_pos);
        // target.type = data.type
        // target.value = data.value
        target.isAlive = data.is_live;
        target.showType = data.show_type;

        // 伤害记录成一个结构
        target.damage.type = data.type
        target.damage.value = data.actual_value || data.value;
        target.damage.showValue = data.value;
        target.damage.pType = data.type;
        target.damage.protect = data.protect || 0;

        return target;
    }


    // 创建目标
    private makeTarget(data) {
        let target: Target = new Target();
        // target.stageId = data.defense_member.order * 100 + data.defense_member.pos
        target.stageId = this.getStageId(data.defense_member.order_pos);
        // 伤害记录成一个结构
        target.damage.type = data.type;
        target.damage.value = data.actual_value || data.value;
        target.damage.showValue = data.value;
        target.damage.pType = data.type;
        target.damage.protect = data.protect || 0;

        target.isAlive = data.is_live;
        if (data.hurt_infos) {
            for (let i = 0; i < data.hurt_infos.length; i++) {
                let hurt: Hurt = new Hurt();
                hurt.hurtId = data.hurt_infos[i].id;
                hurt.hurtValue = data.hurt_infos[i].value;
                target.hurts.push(hurt);
            }
        }

        if (data.awards) {
            for (let i = 0; i < data.awards.length; i++) {
                let award: Award = new Award();
                award.type = data.awards[i].type;
                award.value = data.awards[i].value
                award.size = data.awards[i].size;
                target.awards.push(award);
            }
        }
        return target;
    }

    // 创建一次攻击
    private makeAttack(data) {
        let attack: Attack = new Attack();

        attack.stageId = this.getStageId(data.attack_pos.order_pos);
        attack.skillId = data.skill_id;
        attack.isAlive = data.is_live;
        attack.camp = Math.floor(attack.stageId / 100);

        // type(8): camp(8): id(16)
        // HERO_TYPE_HERO uint32 = 0 // 武将
        // HERO_TYPE_PET  uint32 = 1 // 神兽
        // HERO_TYPE_STAR uint32 = 2 // 历代名将
        let type = this.getNumByBit(data.attack_hero_info, 0, 8);
        let camp = this.getNumByBit(data.attack_hero_info, 8, 8);
        let id = this.getNumByBit(data.attack_hero_info, 16, 16);
        if (type == 1) {
            attack.isPet = true;
            attack.petCamp = camp;
            attack.petId = id
        }
        else if (type == 2) {
            attack.isHistory = true;
            attack.hisCamp = camp;
            attack.hisId = id;
        }

        if (data.attack_infos) {
            for (let i = 0; i < data.attack_infos.length; i++) {
                let target = this.makeTarget(data.attack_infos[i]);
                attack.targets.push(target);
            }
        }

        if (data.attack_add_infos) {
            for (let i = 0; i < data.attack_add_infos.length; i++) {
                let target: AddTarget = this.makeAddTarget(data.attack_add_infos[i]);
                attack.addTargets.push(target);
            }
        }

        if (data.add_buffs) {
            for (let i = 0; i < data.add_buffs.length; i++) {
                let buff: Buff = this.makeBuff(data.add_buffs[i]);
                attack.addBuffs.push(buff);
            }
        }

        if (data.del_buff) {
            for (let i = 0; i < data.del_buff.length; i++) {
                let buff: Buff = this.makeBuff(data.del_buff[i]);
                attack.delBuffs.push(buff);
            }
        }

        if (data.del_buff_before) {
            for (let i = 0; i < data.del_buff_before.length; i++) {
                let buff: Buff = this.makeBuff(data.del_buff_before[i]);
                attack.delBuffsBefore.push(buff);
            }
        }

        if (data.del_buff_middle) {
            for (let i = 0; i < data.del_buff_middle.length; i++) {
                let buff: Buff = this.makeBuff(data.del_buff_middle[i]);
                attack.delBuffsMiddle.push(buff);
            }
        }

        if (data.buff_effects) {
            for (let i = 0; i < data.buff_effects.length; i++) {
                let buffEffect: BuffEffect = this.makeBuffEffect(data.buff_effects[i]);
                attack.buffEffects.push(buffEffect);
            }
        }

        if (data.battle_effects) {
            for (let i = 0; i < data.battle_effects.length; i++) {
                let battleEffect = this.makeBattleEffect(data.battle_effects[i], attack.isPet);
                attack.battleEffects.push(battleEffect);
            }
        }

        if (data.angers) {
            for (let i = 0; i < data.angers.length; i++) {
                let angerChange = this.makeAngerChange(data.angers[i]);
                attack.angers.push(angerChange);
            }
        }

        if (data.awards) {
            for (let i = 0; i < data.awards.length; i++) {
                let award = new Award();
                award.type = data.awards[i].type;
                award.value = data.awards[i].value;
                award.size = data.awards[i].size;
                attack.awards.push(award);
            }
        }

        if (data.new_members) {
            for (let i = 0; i < data.new_members.length; i++) {
                let unit = this.makeUnit(data.new_members[i]);
                attack.newUnits.push(unit);
            }
        }

        if (data.final_hp) {
            for (let i = 0; i < 12; i++) {
                let cell: any;
                if (i < 7) {
                    cell.id = 100 + i;
                }
                else {
                    cell.id = 200 + i - 6;
                }
                cell.hp = data.final_hp[i] || 0
                attack.finalHp.push(cell);
            }
        }
        if (data.stars) {
            for (var _ in data.stars) {
                var starData = data.stars[_];
                var star = this.makeBattleStar(starData);
               attack.stars.push(star);
               this.pushStarIds(star.id);
            }
        }
        return attack
    }

    private pushStarIds(starId) {
        if (this._starIds.indexOf(starId) == -1) {
            this._starIds.push(starId);
        }
    }

    private makeRound(data) {
        let round = new Round();
        if (data.round_index) {
            round.index = data.round_index;
        }

        if (data.attacks) {
            for (let i = 0; i < data.attacks.length; i++) {
                let attack = this.makeAttack(data.attacks[i]);
                round.attacks.push(attack);
            }
        }

        if (data.angers) {
            for (let i = 0; i < data.angers.length; i++) {
                let angerChange = this.makeAngerChange(data.angers[i]);
                round.angers.push(angerChange);
            }
        }
        if (data.add_buffs) {
            for (var i = 0; i < data.add_buffs.length; i++) {
                var buff = this.makeBuff(data.add_buffs[i]);
                round.buffs.push(buff);
            }
        }
        if (data.stars) {
            for (var i = 0; i < data.stars.length; i++) {
                var star = this.makeBattleStar(data.stars[i]);
                round.stars.push(star);
                this.pushStarIds(star.id);
            }
        }
        if (data.battle_effects) {
            for (var i = 0; i < data.battle_effects.length; i++) {
                var effect = this.makeBattleEffect(data.battle_effects);
                round.battleEffects.push(effect);
            }
        }

        return round
    }

    public setWaveData(data) {

        if (data.members) {
            this.createUnits(data.members);
        }

        if (data.members_final) {
            this.createFinalUnits(data.members_final);
        }

        let rounds: Round[] = [];
        if (data.rounds) {
            for (let i = 0; i < data.rounds.length; i++) {
                let round = this.makeRound(data.rounds[i]);
                rounds.push(round);
            }
        }
        this.rounds = rounds;

        if (data.first_order) {
            this.first = data.first_order;
        }

        if (data.init_buff) {
            this.createInitBuff(data.init_buff);
        }

        if (data.pets_buff) {
            this.createPetsBuff(data.pets_buff);
        }

        if (data.first_enter) {
            let list: number[] = [];
            for (let i = 0; i < data.first_enter.length; i++) {
                list.push(data.first_enter[i]);
            }
            this.firstEnter = list;
        }

        if (data.enter_stage) {
            let list = [];
            for (let i = 0; i < data.enter_stage.length; i++) {
                list.push(data.enter_stage[i]);
            }
            this.enterStage = list;
        }

        if (data.pets) {
            let pets: Pet[] = [];
            for (let i = 0; i < data.pets.length; i++) {
                let pet = this.makePet(data.pets[i]);
                pets.push(pet);
            }
            this.pets = pets;
        }

        // if (data.stars) {
        //     let stars: BattleStar[] = [];
        //     for (let i = 0; i < data.stars.length; i++) {
        //         let star = this.makeBattleStar(data.stars[i]);
        //         stars.push(star);
        //     }
        //     this.battleStar = stars;
        // }

        // --假宠物
        // local pets = {}
        // local pet =
        //{
        // camp = 1, --阵营
        // configId = 1, --表id
        // star = 1, --星级
        // }
        // table.insert(pets, pet)
        // self: setPets(pets)
    }
}