import { StatisticsData } from "./StatisticsData";
import { G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";

export class UnitPetStatisticsData {
    public petCamp = 0;        // 阵营
    petId = 0;          // Id
    petStar = 0;        // 星数
    public configData: any;
    damage = 0;         // 伤害
    heal = 0;           // 治疗
    statistics: StatisticsData[] = [];    // buff统计

    public getConfigData() {
        return this.configData;
    }

    public getStatistics() {
        return this.statistics;
    }

    public getPetCamp() {
        return this.petCamp;
    }

    public getPetId() {
        return this.petId;
    }

    public getPetStar() {
        return this.petStar;
    }

    public getDamage() {
        return this.damage;
    }

    public getHeal() {
        return this.heal;
    }

    constructor(petCamp, petId, petStar) {
        this.petCamp = petCamp;
        this.petId = petId;
        this.configData = G_ConfigLoader.getConfig(ConfigNameConst.PET).get(petId)
        this.petStar = petStar;
    }

    public clear() {

    }

    public updateValue(type, value) {
        if (type == 1) {
            this.addDamage(value)
        }
        else if (type == 2)
            this.addHeal(value)
    }


    public addDamage(damage) {
        this.damage += damage
    }


    public addHeal(heal) {
        this.heal += heal;
    }

    public addStatistics(type, count, description) {
        for (let i = 0; i < this.statistics.length; i++) {
            if (this.statistics[i].type == type) {
                this.statistics[i].addCount(count);
                return;
            }
        }

        let newStatistic = new StatisticsData(type, description)
        newStatistic.addCount(count)
        this.statistics.push(newStatistic);
    }

    public addBuffValue(type, value) {

    }

    // 根据英雄类型，获得治疗或者伤害
    public getStatisticsDamage() {
        let sumType = this.configData.sum_type;
        if (sumType == 1)
            return this.heal
        else
            return this.damage;
    }
} 