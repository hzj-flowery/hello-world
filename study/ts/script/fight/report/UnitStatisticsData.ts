import { StatisticsData } from "./StatisticsData"
import { G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { Lang } from "../../lang/Lang";

export class UnitStatisticsData {
    public stageId = 0  //站位
    heroId = 0  //英雄Id
    configData: any;
    damage = 0  //伤害
    heal = 0  //治疗
    statistics: StatisticsData[] = []  //buff统计
    //  buffIds[]        //由改武将所上的全局id

    color = 0
    name = ""  //名字
    officerLevel = 0  //官衔，如果是主角
    alive = false  //是否存活
    player = false  //是否是主角
    limit = 0
    limitRed = 0

    public getConfigData() {
        return this.configData;
    }

    public getStatistics() {
        return this.statistics;
    }

    public getName() {
        return this.name;
    }

    public getOfficerLevel() {
        return this.officerLevel;
    }

    public isPlayer() {
        return this.player;
    }

    public getColor() {
        return this.color;
    }

    public getLimit() {
        return this.limit;
    }

    public isAlive() {
        return this.alive;
    }

    public getStageId() {
        return this.stageId;
    }

    public getLimitRed() {
        return this.limitRed;
    }

    constructor(stageId, heroId, playerName, monsterId, rankLevel,
        officerLevel, isAlive, isLeader, limit, limitRed) {
        this.stageId = stageId;
        this.heroId = heroId;
        this.configData = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(heroId)

        if (monsterId == 0) {
            if (isLeader) {
                this.name = playerName;
                this.officerLevel = officerLevel;
                this.player = true;
            }
            else {
                this.name = this.configData.name;
                if (limitRed == 4) {
                    this.color = 7;
                } else if (limit == 3) {
                    this.color = 6;
                } else {
                    this.color = this.configData.color;
                }
            }
            if (rankLevel != 0) {
                let name = this.name;
                if (this.configData.color == 7 && this.configData.type != 1) // 金将、
                    name = name + " " + Lang.get("goldenhero_train_text") + rankLevel;
                else
                    name = name + "+" + rankLevel
                this.name = name;
            }
        }
        else {
            this.updateMonsterInfo(monsterId)
        };

        this.alive = isAlive;
        this.limit = limit;
        this.limitRed = limitRed;
    }

    public clear() {

    }

    public updateMonsterInfo(monsterId) {
        let config = G_ConfigLoader.getConfig(ConfigNameConst.MONSTER).get(monsterId);
        this.name = config.name;
        let color = config.color
        if (color < 2)
            color = 2
        this.color = color;
    }

    //更新伤害，治疗数值
    public updateValue(type, value) {
        if (type == 1)
            this.addDamage(value)
        else if (type == 2)
            this.addHeal(value)
    }

    public addDamage(damage) {
        this.damage += damage;
    }

    public addHeal(heal) {
        this.heal = heal;
    }

    public addStatistics(type, count, description) {
        for (let i = 0; i < this.statistics.length; i++) {
            if (this.statistics[i].type == type){
                this.statistics[i].addCount(count)
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
            return this.damage
    }
}