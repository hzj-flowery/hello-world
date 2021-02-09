import { Unit, Pet, Round, Attack } from "./WaveData";
import { UnitStatisticsData } from "./UnitStatisticsData";
import { UnitPetStatisticsData } from "./UnitPetStatisticsData";
import { G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";

export class StatisticsTotal {
    unitStatistics: UnitStatisticsData[] = [];
    petStatistics: UnitPetStatisticsData[] = [];

    _buffTable = [];
    _buffTalbePet = [];
    _leftName = "";
    _rightName = "";
    _leftOfficerLevel = 0;
    _rightOfficerLevel = 0;

    constructor() {
        this._buffTable = [] //记录一下globelID，用于计算伤害
        this._buffTalbePet = [] //神兽buff的globelID
    }


    public parseStatistics(units: Unit[], finalUnits: Unit[], pets: Pet[], rounds: Round[],
        leftName, rightName, attackOfficerLevel, defenseOfficerLevel) {
        this._leftName = leftName;
        this._rightName = rightName;
        this._leftOfficerLevel = attackOfficerLevel;
        this._rightOfficerLevel = defenseOfficerLevel;
        this.initStatistics(units, finalUnits);
        this.initPetsStatistics(pets);

        for (let i = 0; i < rounds.length; i++) {
            let roundData = rounds[i];
            for (let j = 0; j < roundData.attacks.length; j++) {
                let attackData = roundData.attacks[j];
                this.parseOneAttack(attackData);
            }
        }
    }

    private addAngerByConfig(configId, count, statistics) {
        let configData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(configId);
        if (configData.buff_sum != 0)
            statistics.addStatistics(configData.buff_sum, count, configData.buff_sum_txt)
    }

    private calcAnger(attack: Attack) {// 之后要根据angerdata里面的id来选择统计的人头
        let attackId = attack.stageId
        let statistics = this.getUnitStatisticsById(attackId)
        for (let i = 0; i < attack.angers.length; i++) {
            let data = attack.angers[i];
            if (data.showType != 0) {
                this.addAngerByConfig(data.configId, data.value, statistics)
            }
        }
    }

    private calcDamage(attack: Attack) {
        // console.log("calcDamage:",attack.stageId);
        let statistics: UnitStatisticsData = this.getUnitStatisticsById(attack.stageId)

        for (let i = 0; i < attack.targets.length; i++) {
            let attackInfo = attack.targets[i];
            let damage = attackInfo.damage;
            statistics.updateValue(damage.type, damage.value);
        }

        for (let i = 0; i < attack.addTargets.length; i++) {
            let attackInfo = attack.addTargets[i];
            let damage = attackInfo.damage;
            statistics.updateValue(damage.type, damage.value);
        }
    }
    private calcBattleEffects(attack) {
        for (let i = 0; i < attack.battleEffects.length; i++) {
            let data = attack.battleEffects[i];
            let statistics = this.getUnitStatisticsById(data.attackId)
            let damage = data.damage;
            statistics.updateValue(damage.type, damage.value)
        }
    }

    // 添加buff统计
    private calcBuffs(attack) {
        for (let i = 0; i < attack.addBuffs.length; i++) {
            let data = attack.addBuffs[i];
            let atkId = data.attackId;
            if (atkId && atkId == 0)
                atkId = attack.stageId;
            let statistics = this.getUnitStatisticsById(atkId)
            this._buffTable[data.globalId] = atkId;
            let configData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(data.configId);
            if (configData.buff_sum != 0)
                statistics.addStatistics(configData.buff_sum, 1, configData.buff_sum_txt)
        }
    }

    //buff伤害统计
    private calcBuffEffect(attack) {
        for (let i = 0; i < attack.buffEffects.length; i++) {
            let data = attack.buffEffects[i];
            let unitData = this.getStatisticsUnitByBuffGlobalId(data.globalId);
            let attackUnit = unitData.unit;
            let attackPet = unitData.unitPet;
            let configId = unitData.buffConfig;
            if (attackUnit) {
                let damage = data.damage
                attackUnit.updateValue(damage.type, damage.value)
            }
            if (attackPet) {
                let configData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(configId);
                if (configData.buff_sum != 0)
                    attackPet.addStatistics(configData.buff_sum, 1, configData.buff_sum_txt)
            }
        }
    }

    private parsePetAttack(attack) {
        this.calcPetAnger(attack)
        this.calcPetBuffs(attack)
        this.calcBuffEffect(attack)
        this.calcBattleEffectsPet(attack)
    }

    private calcBattleEffectsPet(attack) {
        for (let i = 0; i < attack.battleEffects.length; i++) {
            let data = attack.battleEffects[i]
            let petCamp = Math.floor(data.attackId / 100)
            let petId = data.petId
            let petStatistics = this.getPetStatisticsbyId(petCamp, petId)
            let configData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(data.configId);
            if (configData.buff_sum != 0)
                petStatistics.addStatistics(configData.buff_sum, 1, configData.buff_sum_txt)

        }
    }
    private calcPetAnger(attack) {

        for (let i = 0; i < attack.angers.length; i++) {
            let camp = attack.petCamp;
            let id = attack.petId;
            let petStatistics = this.getPetStatisticsbyId(camp, id)
            let data = attack.angers[i]
            var tarCamp = Math.floor(data.stageId / 100);
            if (data.type == 2 && camp != tarCamp) {
            } else {
                if (data.showType != 0) {
                    let configData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(data.configId);
                    if (configData.buff_sum != 0)
                        petStatistics.addStatistics(configData.buff_sum, data.value, configData.buff_sum_txt)
                }
            }
        }
    }


    private calcPetBuffs(attack) {
        for (let i = 0; i < attack.addBuffs.length; i++) {
            let data = attack.addBuffs[i]
            let camp = Math.floor(data.attackId / 100)
            let id = data.petId
            let petStatistics = this.getPetStatisticsbyId(camp, id)
            if (!petStatistics) {
                return;
            }
            this._buffTalbePet[data.globalId] = [
                camp,
                id,
                data.configId
            ]
            let configData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(data.configId);
            if (configData && configData.buff_sum != 0 && configData.buff_sum != 8) //麒麟这边上buff的时候不统计
                petStatistics.addStatistics(configData.buff_sum, 1, configData.buff_sum_txt)

        }
    }

    private parseOneAttack(attack: Attack) {// 神兽攻击不计入统计
        if (attack.isPet) {
            this.parsePetAttack(attack)
            return
        }
        if (attack.isHistory)
            return
        // 攻击目标的加减血
        this.calcDamage(attack)
        // 怒气统计
        this.calcAnger(attack)
        // 全局展示buff统计
        this.calcBattleEffects(attack)
        // 添加buff统计
        this.calcBuffs(attack)
        // buff伤害统计
        this.calcBuffEffect(attack)
    }
    private getUnitStatisticsById(stageId) {
        let list = this.unitStatistics;
        for (let i = 0; i < list.length; i++) {
            if (stageId == list[i].stageId)
                return list[i];
        }
    }

    private getPetStatisticsbyId(camp, petId) {
        let list = this.petStatistics;
        for (let i = 0; i < list.length; i++) {
            if (camp == list[i].petCamp && petId == list[i].configData.id)
                return list[i];
        }
    }

    private initStatistics(unitList, finalUnits) {
        let list = [];

        for (let i = 0; i < unitList.length; i++) {
            let name = this._leftName
            let officerLevel = this._leftOfficerLevel
            if (Math.floor(unitList[i].stageId / 100) == 2) {
                name = this._rightName
                officerLevel = this._rightOfficerLevel
            }
            let isAlive = false

            for (let j = 0; j < finalUnits.length; j++) {
                if (finalUnits[j].stageId == unitList[i].stageId) {
                    isAlive = true;
                    break;
                }
            }
            let newStatistics = new UnitStatisticsData(
                unitList[i].stageId,
                unitList[i].configId,
                name,
                unitList[i].monsterId,
                unitList[i].rankLevel,
                officerLevel,
                isAlive,
                unitList[i].isLeader,
                unitList[i].limitLevel,
                unitList[i].limitRedLevel
            )
            list.push(newStatistics);
        }
        this.unitStatistics = list;
    }
    private initPetsStatistics(petList) {
        let list = [];
        for (let i = 0; i < petList.length; i++) {
            let pet = new UnitPetStatisticsData(petList[i].camp, petList[i].configId, petList[i].star)
            list.push(pet);
        }
        this.petStatistics = list;
    }

    private getStatisticsUnitByBuffGlobalId(globalId) {
        let id = this._buffTable[globalId]
        // local camp, petId = self._buffTalbePet[globalId]

        let isPet = false;
        let buffConfig = null;
        let tbl = this._buffTable[globalId]
        if (!tbl) {
            tbl = this._buffTalbePet[globalId]
            isPet = true
        }
        if (!tbl) {
            return;
        }
        let unit, unitPet;
        if (isPet) {
            unitPet = this.getPetStatisticsbyId(tbl[1], tbl[2])
            buffConfig = tbl[3];
        }
        else
            unit = this.getUnitStatisticsById(id);
        return { unit: unit, unitPet: unitPet, buffConfig: buffConfig }
    }
    public getMaxDamage() {
        let maxDamage = 0
        let list = this.unitStatistics;
        for (let i = 0; i < list.length; i++) {
            let damage = list[i].getStatisticsDamage();
            if (damage > maxDamage)
                maxDamage = damage
        }
        return maxDamage
    }

    public getDataListByCamp(camp) {
        let ret = []
        let list = this.unitStatistics;
        for (let i = 0; i < list.length; i++) {
            if (Math.floor(list[i].stageId / 100) == camp)
                ret.push(list[i]);

        }

        ret.sort(function (a, b) {
            return a.getStageId - b.getStageId;
        })

        return ret
    }

    public getPetDataListByCamp(camp) {
        let ret = []
        let list = this.petStatistics;

        for (let i = 0; i < list.length; i++) {
            if (list[i].petCamp == camp)
                ret.push(list[i]);
        }
        ret.sort(
            function (a, b) {
                return b.getPetId() - a.getPetId();
            });
        return ret;
    }
}