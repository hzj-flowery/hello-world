// export class Unit {
//     stage_id = 0; 							//唯一id
//     cfg_id = 0;  							//表id
//     camp = 0; 								//队伍
//     cell = 0; 								//坐标
//     max_hp = 0; 							//最大血量
//     hp = 0; 								//血量
//     anger = 0; 									//怒气
//     rank_lv = 0;                            //突破等级
//     monsterId = 0;                          //如果是怪物的话，怪物id
// }

// export class Award {
//     ttype = 0; 								//掉落类型
//     value = 0; 								//掉落id
//     size = 0 								//掉落数量
// }

// export class Hurt {
//     hurt_id = 0;                            //1 闪避 2 暴击 3 招架 4 无敌 5 反弹 6吸血
//     hurt_value = 0;                         //5 6 代表具体的数值
// }

// export class Target {
//     stage_id = 0; 							//目标唯一id
//     ttype = 0; 								//事件类型
//     value = 0; 								//数值
//     isAlive = true; 								//是否死亡
//     awards: Award[] = []; 							//掉落 Award
//     hurts: Hurt[] = []                             //攻击修正
// }

// export class AngerChange {
//     stage_id = 0;                           // 唯一id
//     stype = 0;                     //0正常，1需要提示
//     type = 0;                     //1; 扣，2加
//     cfg_id = 0;                     //buff表现id
//     value = 0;                    //变化数值
//     resist = false;                      //是否被免疫
// }

// export class Attack {
//     stage_id = 0; 							//攻击者唯一id
//     skill_id = 0; 							//使用技能id
//     camp = 0;                               //攻击者阵营
//     targets: Target[] = []; 							//受击目标 Target
//     angers: AngerChange[] = [];                            //怒气变化

//     buff_effects: Buff[] = [];                      //战斗前展示buff
//     battle_effects: BattleEffect[] = [];                    //全局buff效果，战斗中展示

//     del_buffs_before: Buff[] = [];                   //减少buff，攻击前减少buff

//     add_buffs: Buff[] = [];                         //增加buff，攻击完成后附加buff
//     del_buffs: Buff[] = [];                         //删除buff，攻击完成后消失buff

//     isAlive = true;
// }

// export class Round {
//     index = 0; 								//回合数
//     attacks: Attack[] = []; 							//攻击者 Attack
// }

// export class BattleEffect {
//     stage_id = 0;               //buff拥有者的全局id
//     cfg_id = 0;                 //表id 
//     type = 0;                   //1扣血 2 加血
//     value = 0;                  //具体数值
// }

// export class Buff {
//     global_id = 0;      //唯一id
//     stage_id = 0;       //buff拥有者的全局id
//     cfg_id = 0;         //表id  
//     remove_id = 0;      //顶掉buff的全局id
//     is_resist = false;  //是否被抵抗
//     buff_type = 0;       //1扣血 2 加血 3 加怒气
//     value = 0;              //具体数值
// }

// export class Wave {
//     index = 0; 								//波次
//     units: Unit[] = [];                               //单位 Unit
//     rounds: Round[] = []; 							//回合 Round
//     first = 0;
//     lname = "";
//     rname = "";
// }

// export class Report {
//     waves: Wave[] = [];
//     fight_type = 0; 						//战斗模式
//     win = false;							//是否胜利
//     first = 0;								//先手
//     lname = "";								//名字
//     rname = "";								//名字
// }

// ////////////////////////////////////////////////////////////////////////////////////////-
// //战报数据
// ////////////////////////////////////////////////////////////////////////////////////////-

// export class BattleReportParser {

//     public parse(report) {
//         // 战报
//         // assert(type(report) == "table"; "Invalid battleReport: "..tostring(report))
//         let result: Report = new Report();

//         //输入基本信息
//         result.fight_type = report.pk_type;
//         result.win = report.is_win;
//         //result.first = report.first_order
//         result.lname = report.attack_name;
//         result.rname = report.defense_name;

//         //解析wave
//         result.waves = this.parseWaveInfo(report.waves);
//         return result;
//     }


//     private parseWaveInfo(waveReport): Wave[] {

//         let waves: Wave[] = [];
//         for (let i = 0; i < waveReport.length; i++) {
//             let wave = new Wave();
//             wave.index = i;
//             wave.units = this.parseUnitInfo(waveReport[i].members);
//             wave.rounds = this.parseBattleOneRound(waveReport[i].rounds);
//             waves.push(wave);
//         }
//         return waves;
//     }

//     private parseUnitInfo(unitReport): Unit[] {
//         let units: Unit[] = [];

//         for (let i = 0; i < unitReport.length; i++) {
//             units.push(this.makeUnit(unitReport[i]));
//         }
//         return units;
//     }

//     private makeUnit(heroData): Unit {
//         let unit: Unit = new Unit();
//         unit.camp = heroData.camp;
//         unit.cfg_id = heroData.knight_id;
//         unit.cell = heroData.pos;
//         unit.stage_id = heroData.camp * 100 + heroData.pos; //stage_id 规则 阵营*100+pos 我方101-106，对方201-206
//         unit.max_hp = heroData.max_hp;
//         unit.hp = heroData.hp;
//         unit.anger = heroData.anger;
//         unit.rank_lv = heroData.rank_lv;
//         unit.monsterId = heroData.monster_id;
//         return unit;
//     }

//     private parseBattleOneRound(battleRounds): Round[] {
//         //目前是简单的解析，以后复杂度上升的时候需要拆分
//         let rounds: Round[] = [];
//         for (let i = 0; i < battleRounds.length; i++) {
//             let roundData = battleRounds[i];
//             let round: Round = new Round();
//             round.index = roundData.round_index

//             for (let j = 0; j < roundData.length; j++) {
//                 let attackData = roundData.attacks[j];
//                 let attack: Attack = new Attack();
//                 attack.isAlive = attackData.is_live;
//                 attack.stage_id = attackData.attack_pos.order * 100 + attackData.attack_pos.pos;
//                 attack.skill_id = attackData.skill_id;
//                 //print("fdsa skillid = "..data.skill_id)
//                 attack.camp = attackData.attack_pos.order;
//                 attack.targets = [];
//                 for (let k = 0; k < attackData.attack_infos.length; k++) {
//                     let targetData = attackData.attack_infos[k];
//                     let target: Target = new Target();
//                     target = this.makeTarget(targetData);
//                     for (let l = 0; l < targetData.hurt_infos.length; l++) {
//                         target.hurts.push(this.makeHurt(targetData.hurt_infos[l]));
//                     }
//                     attack.targets.push(target);
//                 }

//                 if (attackData.add_buffs) {
//                     attack.add_buffs = [];
//                     for (let k = 0; k < attackData.add_buffs.length; k++) {
//                         attack.add_buffs.push(this.makebuff(attackData.add_buffs[k]));
//                     }
//                 }

//                 if (attackData.del_buffs) {
//                     attack.del_buffs = [];
//                     for (let k = 0; k < attackData.del_buffs.length; k++) {
//                         attack.add_buffs.push(this.makebuff(attackData.del_buffs[k]));
//                     }
//                 }

//                 if (attackData.del_buff_before) {
//                     attack.del_buffs_before = [];
//                     for (let k = 0; k < attackData.del_buff_before.length; k++) {
//                         attack.add_buffs.push(this.makebuff(attackData.del_buff_before[k]));
//                     }
//                 }

//                 if (attackData.buff_effects) {
//                     attack.buff_effects = [];
//                     for (let k = 0; k < attackData.buff_effects.length; k++) {
//                         attack.buff_effects.push(this.makebuffEffect(attackData.buff_effects[k]));
//                     }
//                 }

//                 if (attackData.angers) {
//                     attack.angers = [];
//                     for (let k = 0; k < attackData.angers.length; k++) {
//                         attack.angers.push(this.makeAngerChange(attackData.angers[i]));
//                     }
//                 }

//                 if (attackData.battle_effects) {
//                     attack.battle_effects = [];
//                     for (let k = 0; k < attackData.battle_effects.length; k++) {
//                         attack.battle_effects.push(this.makeBattleEffect(attackData.battle_effects[i]));
//                     }
//                 }

//                 round.attacks.push(attack);
//             }
//             rounds.push(round);
//         }
//         return rounds;
//     }

//     private makeTarget(targetData): Target {
//         let target: Target = new Target();
//         target.stage_id = targetData.defense_member.order * 100 + targetData.defense_member.pos;
//         target.ttype = targetData.type;
//         target.value = targetData.value;
//         target.isAlive = targetData.is_live;
//         target.hurts = [];
//         return target;
//     }

//     private makeHurt(hurtData): Hurt {
//         let hurt: Hurt = new Hurt();
//         hurt.hurt_id = hurtData.id;
//         hurt.hurt_value = hurtData.value;
//         return hurt;
//     }

//     private makebuff(buffData): Buff {
//         let buff: Buff = new Buff();
//         buff.global_id = buffData.id;
//         buff.cfg_id = buffData.buff_id;
//         buff.remove_id = buffData.remove_id;
//         buff.stage_id = buffData.member.order * 100 + buffData.member.pos;
//         buff.is_resist = buffData.is_resist;
//         return buff;
//     }

//     private makebuffEffect(buffEffectData): Buff {
//         let buff: Buff = new Buff();
//         buff.global_id = buffEffectData.id;
//         buff.buff_type = buffEffectData.type
//         buff.value = buffEffectData.value
//         return buff;
//     }

//     private makeAngerChange(angerChangeData): AngerChange {
//         let angerChange: AngerChange = new AngerChange();
//         angerChange.stage_id = angerChangeData.member.order * 100 + angerChangeData.member.pos;
//         angerChange.stype = angerChangeData.stype;
//         angerChange.cfg_id = angerChangeData.buff_id;
//         angerChange.type = angerChangeData.type;
//         angerChange.value = angerChangeData.value;
//         angerChange.resist = angerChangeData.is_resist;
//         return angerChange;
//     }

//     private makeBattleEffect(battleEffectData): BattleEffect {
//         let battleEffect: BattleEffect = new BattleEffect();
//         battleEffect.stage_id = battleEffectData.member.order * 100 + battleEffectData.member.pos;
//         battleEffect.cfg_id = battleEffectData.buff_id;
//         battleEffect.type = battleEffectData.type;
//         battleEffect.value = battleEffectData.value;
//         return battleEffect;
//     }
// }