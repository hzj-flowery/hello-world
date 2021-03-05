import { BaseData } from './BaseData';
import { CountryBossRankUnitData } from './CountryBossRankUnitData';
import { G_UserData } from '../init';
import { ArraySort } from '../utils/handler';
let schema = {};
schema['boss_id'] = [
    'number',
    0
];

schema['max_hp'] = [
    'number',
    0
];

schema['now_hp'] = [
    'number',
    0
];

schema['boss_rank'] = [
    'object',
    {}
];

schema['self_rank'] = [
    'object',
    null
];

export interface CountryBossUnitData {
    getBoss_id(): number
    setBoss_id(value: number): void
    getLastBoss_id(): number
    getMax_hp(): number
    setMax_hp(value: number): void
    getLastMax_hp(): number
    getNow_hp(): number
    setNow_hp(value: number): void
    getLastNow_hp(): number
    getBoss_rank(): CountryBossRankUnitData[]
    setBoss_rank(value: CountryBossRankUnitData[]): void
    getLastBoss_rank(): CountryBossRankUnitData[]
    getSelf_rank(): CountryBossRankUnitData
    setSelf_rank(value: CountryBossRankUnitData): void
    getLastSelf_rank(): CountryBossRankUnitData
}
export class CountryBossUnitData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties)
    }
    public isBossDie() {
        return this.getNow_hp() <= 0;
    }
    public getRankFirst() {
        let rankDatas = this.getBoss_rank();
        for (let k in rankDatas) {
            let v = rankDatas[k];
            if (v.getRank() == 1) {
                return v;
            }
        }
        return null;
    }
    public getMyRankInfo() {
        let self_rank = this.getSelf_rank();
        if (self_rank) {
            return self_rank;
        }
        let myGuildName = '';
        let myGuild = G_UserData.getGuild().getMyGuild();
        if (myGuild) {
            myGuildName = myGuild.getName();
        }
        let rankData = new CountryBossRankUnitData();
        rankData.setProperties({
            hurt_rate: 0,
            guild_name: myGuildName
        });
        return rankData;
    }
    public updateData(message) {
        let boss_id = message['boss_id'];
        if (boss_id) {
            this.setBoss_id(boss_id);
        }
        let max_hp = message['max_hp'];
        if (max_hp) {
            this.setMax_hp(max_hp);
        }
        let now_hp = message['now_hp'];
        if (now_hp) {
            this.setNow_hp(now_hp);
        }
        let boss_rank = message['boss_rank'];
        if (boss_rank) {
            let ranks = [];
            for (let k in boss_rank) {
                let v = boss_rank[k];
                let rankData = new CountryBossRankUnitData();
                rankData.setProperties(v);
                ranks.push(rankData);
            }
            ArraySort(ranks, function (a, b) {
                return a.getRank() < b.getRank();
            })
            this.setBoss_rank(ranks);
        }
        let self_rank = message['self_rank'];
        if (self_rank) {
            let rankData = new CountryBossRankUnitData();
            rankData.setProperties(self_rank);
            this.setSelf_rank(rankData);
        }
    }
}