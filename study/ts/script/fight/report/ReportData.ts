import { WaveData } from "./WaveData";
import { StatisticsTotal } from "./StatisticsTotal";
import { BaseData } from "../../data/BaseData";
import { G_UserData } from "../../init";
import { UserBaseData } from "../../data/UserBaseData";

export class ReportData extends BaseData {

    waves: WaveData[] = [];
    fightType = 0;
    win = false;
    leftName = "";
    rightName = "";
    skillIds: number[] = [];
    maxRoundNum = 0;
    attackOfficerLevel = 0;
    defenseOfficerLevel = 0;
    attack_hurt = 0;
    statisticsTotal: StatisticsTotal = new StatisticsTotal();
    star = 0;
    loseType = 0;
    private _starIds = [];

    public getStarIds() {
        return this._starIds;
    }

    protected data = {

    }

    public getWaves() {
        return this.waves;
    }

    public getSkillIds() {
        return this.skillIds;
    }

    public getMaxRoundNum() {
        return this.maxRoundNum;
    }

    public getLeftName() {
        return this.leftName;
    }

    public getRightName() {
        return this.rightName;
    }

    public getAttackOfficerLevel() {
        return this.attackOfficerLevel;
    }

    public getDefenseOfficerLevel() {
        return this.defenseOfficerLevel;
    }

    public getAttack_hurt() {
        return this.attack_hurt;
    }

    public getIsWin() {
        return this.win;
    }
    
    public getStar() {
        return this.star;
    }

    public getLoseType() {
        return this.loseType;
    }

    public getStatisticsTotal(): StatisticsTotal {
        return this.statisticsTotal;
    }

    public clear() {

    }

    public setReport(data, isFalseReport) {

        let waves: WaveData[] = [];
        if (data.waves) {
            for (let i = 0; i < data.waves.length; i++) {
                let wave: WaveData = new WaveData();
                wave.setWaveData(data.waves[i]);
                waves.push(wave);
            }
        }
        this.waves = waves;

        if (data.pk_type) {
            this.fightType = data.pk_type;
        }

        if (data.is_win) {
            this.win = data.is_win;
        }

        if (data.skill_ids) {
            let skillIds = [];
            for (let i = 0; i < data.skill_ids.length; i++) {
                skillIds.push(data.skill_ids[i]);
            }
            this.skillIds = skillIds;
        }

        if (data.attack_name) {
            this.leftName = data.attack_name;
        }

        if (isFalseReport) {
            this.leftName = G_UserData.getBase().getName();
            this.leftName = "";
        }

        if (data.defense_name) {
            this.rightName = data.defense_name;
        }

        if (data.max_round_num) {
            this.maxRoundNum = data.max_round_num;
        }

        if (data.attack_officer_level) {
            this.attackOfficerLevel = data.attack_officer_level;
        }

        if (data.defense_officer_level) {
            this.defenseOfficerLevel = data.defense_officer_level;
        }

        if (data.attack_hurt) {
            this.attack_hurt = data.attack_hurt;
        }

        if (!isFalseReport) {

            let statistics = new StatisticsTotal();
            let lastWave: WaveData = this.waves[this.waves.length - 1];
            statistics.parseStatistics(lastWave.getUnits(), lastWave.getFinalUnits(), lastWave.getPets(), lastWave.getRounds(),
                this.leftName, this.rightName, this.attackOfficerLevel, this.defenseOfficerLevel
            )
            this.statisticsTotal = statistics;
        }

        if (this.win) {
            let lastWave: WaveData = this.waves[this.waves.length - 1];
            let startCount = lastWave.getUnitsByCamp(1);
            let finalCount = lastWave.getFinalUnitsByCamp(1)
            let diff = startCount - finalCount
            if (diff == 0)
                this.star = 3;
            else if (diff == 1)
                this.star = 2;
            else
                this.star = 1;
        }

        else {
            let lastWave: WaveData = this.waves[this.waves.length - 1];
            let finalCount = lastWave.getFinalUnitsByCamp(2);
            if (finalCount == 1)
                this.loseType = 1;
            else
                this.loseType = 2;
        }
        var starIds = [];
        if (data.star_base_ids) {
            for (var _ in data.star_base_ids) {
                var val = data.star_base_ids[_];
               starIds.push(val);
            }
            this._starIds = (starIds);
        }
        // if rawget(data, "is_end") then
        // return true
    }
}