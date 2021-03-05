import { BaseData } from "./BaseData";
import { GuildCrossWarConst } from "../const/GuildCrossWarConst";
import { Lang } from "../lang/Lang";
import { GuildCrossWarHelper } from "../scene/view/guildCrossWar/GuildCrossWarHelper";

export interface GuildCrossWarBossUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getHp(): number
    setHp(value: number): void
    getLastHp(): number
    getMax_hp(): number
    setMax_hp(value: number): void
    getLastMax_hp(): number
    getConfig(): Object
    setConfig(value: Object): void
    getLastConfig(): Object
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['hp'] = [
    'number',
    0
];
schema['max_hp'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];
export class GuildCrossWarBossUnitData extends BaseData {

    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public updateData(data) {
        this.setProperties(data);
    }
    public getCurState() {
        function getState() {
            if (this.getHp() == this.getMax_hp() && this.getMax_hp() > 0) {
                cc.log('getState 111');
                return [
                    GuildCrossWarConst.BOSS_STATE_IDLE,
                    Lang.get('guild_cross_war_bossstate_2')
                ];
            } else if (this.getHp() > 0 && this.getHp() < this.getMax_hp()) {
                cc.log('getState 222');
                return [
                    GuildCrossWarConst.BOSS_STATE_PK,
                    Lang.get('guild_cross_war_bossstate_2')
                ];
            } else if (this.getHp() <= 0) {
                cc.log('getState 333');
                return [
                    GuildCrossWarConst.BOSS_STATE_DEATH,
                    Lang.get('guild_cross_war_bossstate_2')
                ];
            }
        }
        cc.log('GuildCrossWarBossUnitData:getCurState 111');
        cc.log(this.getHp());
        cc.log(this.getMax_hp());
        let [ state, _ ] = GuildCrossWarHelper.getCurCrossWarStage();
        cc.log(state);
        if (GuildCrossWarConst.ACTIVITY_STAGE_1 == state) {
            cc.log('GuildCrossWarBossUnitData:getCurState 222');
            return [
                GuildCrossWarConst.BOSS_STATE_IDLE,
                Lang.get('guild_cross_war_bossstate_1')
            ];
        } else if (GuildCrossWarConst.ACTIVITY_STAGE_2 == state) {
            cc.log('GuildCrossWarBossUnitData:getCurState 333');
            let curState = getState(), strDesc;
            cc.log(curState);
            return [
                curState,
                strDesc
            ];
        } else {
            cc.log('GuildCrossWarBossUnitData:getCurState 444');
            return [
                GuildCrossWarConst.BOSS_STATE_DEATH,
                ''
            ];
        }
    }
}
