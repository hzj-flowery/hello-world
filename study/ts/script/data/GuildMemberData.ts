import { BaseData } from "./BaseData";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { G_UserData, G_ConfigLoader } from "../init";
import { VipDataHelper } from "../utils/data/VipDataHelper";
import { ConfigNameConst } from "../const/ConfigNameConst";
import VipFunctionIDConst from "../const/VipFunctionIDConst";
import ParameterIDConst from "../const/ParameterIDConst";
import { FunctionConst } from "../const/FunctionConst";

export interface GuildMemberData {
    getUid(): number
    setUid(value: number): void
    getLastUid(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getPosition(): number
    setPosition(value: number): void
    getLastPosition(): number
    getContribution(): number
    setContribution(value: number): void
    getLastContribution(): number
    getTime(): number
    setTime(value: number): void
    getLastTime(): number
    getOffline(): number
    setOffline(value: number): void
    getLastOffline(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getRank_lv(): number
    setRank_lv(value: number): void
    getLastRank_lv(): number
    getPower(): number
    setPower(value: number): void
    getLastPower(): number
    getWeek_contribution(): number
    setWeek_contribution(value: number): void
    getLastWeek_contribution(): number
    getVip(): number
    setVip(value: number): void
    getLastVip(): number
    getAvatar(): number
    setAvatar(value: number): void
    getLastAvatar(): number
    getOfficer_level(): number
    setOfficer_level(value: number): void
    getLastOfficer_level(): number
    getDungeon_point(): number
    setDungeon_point(value: number): void
    getLastDungeon_point(): number
    getActive_cnt(): number
    setActive_cnt(value: number): void
    getLastActive_cnt(): number
    getPlayer_info(): Object
    setPlayer_info(value: Object): void
    getLastPlayer_info(): Object
    getRankPower(): number
    setRankPower(value: number): void
    getLastRankPower(): number
    getHome_tree_level(): number
    setHome_tree_level(value: number): void
    getLastHome_tree_level(): number
    getTrain_daily_count(): number
    setTrain_daily_count(value: number): void
    getLastTrain_daily_count(): number
    getTrain_daily_acptcount(): number
    setTrain_daily_acptcount(value: number): void
    getLastTrain_daily_acptcount(): number
    getHead_frame_id(): number
    setHead_frame_id(value: number): void
    getLastHead_frame_id(): number
}
let schema = {};
schema['uid'] = [
    'number',
    0
];
schema['name'] = [
    'string',
    ''
];
schema['level'] = [
    'number',
    0
];
schema['position'] = [
    'number',
    0
];
schema['contribution'] = [
    'number',
    0
];
schema['time'] = [
    'number',
    0
];
schema['offline'] = [
    'number',
    0
];
schema['base_id'] = [
    'number',
    0
];
schema['rank_lv'] = [
    'number',
    0
];
schema['power'] = [
    'number',
    0
];
schema['week_contribution'] = [
    'number',
    0
];
schema['vip'] = [
    'number',
    0
];
schema['avatar'] = [
    'number',
    0
];
schema['officer_level'] = [
    'number',
    0
];
schema['dungeon_point'] = [
    'number',
    0
];
schema['active_cnt'] = [
    'number',
    0
];
schema['player_info'] = [
    'object',
    null
];
schema['rankPower'] = [
    'number',
    0
];
schema['home_tree_level'] = [
    'number',
    0
];
schema['train_daily_count'] = [
    'number',
    0
];
schema['train_daily_acptcount'] = [
    'number',
    0
];
schema['head_frame_id'] = [
    'number',
    0
];
let TRAIN_TYPE = {
    toSelf: 1,
    active: 2,
    passive: 3,
    unToSelf: 4,
    unActive: 5,
    unPassive: 6
};
export class GuildMemberData extends BaseData {

    public static schema = schema;
    _heros;
    _myInfo;
    _myTrainCount;
    _myAcpCount;
    _trainType;
    constructor(properties?) {
        super(properties);
        let [covertId,playerInfo] = UserDataHelper.convertAvatarId(properties);
        this.setPlayer_info(playerInfo);
        this._myInfo = G_UserData.getGuild().getMyMemberData();
        this._myTrainCount = this._myInfo != null && this._myInfo.getTrain_daily_count() || 0;
        this._myAcpCount = this._myInfo != null && this._myInfo.getTrain_daily_acptcount() || 0;
        if (properties.uid == G_UserData.getBase().getId()) {
            this._myTrainCount = properties.train_daily_count;
            this._myAcpCount = properties.train_daily_acptcount;
        }
        this.setTrainType(properties.level, properties.vip, properties.offline, properties.train_daily_count, properties.train_daily_acptcount);
        this._heros = this._createHeroList(properties.heros);
    }
    public clear() {
    }
    public reset() {
        this._myInfo = null;
        this._myTrainCount = 0;
    }
    public setTrainType(_curLevel, _curVip, _online, _trainCount, _acpCount, properties?) {
        let myLevel = G_UserData.getBase().getLevel();
        let myVip = G_UserData.getVip().getLevel();
        let difLevel = myLevel - _curLevel;
        let maxVip = Math.max(myVip, _curVip);
        let levelLimit = VipDataHelper.getVipCfgByTypeLevel(VipFunctionIDConst.VIP_FUNC_ID_TRAIN, maxVip).value;
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        let limitActive = Number(Parameter.get(ParameterIDConst.TRAIN_LIMIT_ACTIVE).content);
        let limitPassive = Number(Parameter.get(ParameterIDConst.TRAIN_LIMIT_PASSIVE).content);
        let activeCondition = difLevel >= levelLimit;
        let passiveCondition = difLevel <= -levelLimit;
        let unActiveCondition = difLevel < levelLimit && difLevel >= 0;
        let unPassiveCondition = difLevel > -levelLimit && difLevel < 0;
        if (this.isSelf()) {
            if (this._myAcpCount > 0) {
                this._trainType = TRAIN_TYPE.toSelf;
                return;
            } else {
                this._trainType = TRAIN_TYPE.unToSelf;
                return;
            }
        }
        let FuncLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL);
        if (_curLevel >= FuncLevelInfo.get(FunctionConst.FUNC_GUILD_TRAIN).show_level) {
            if (difLevel > 0) {
                if (_online == 0 && activeCondition && this._myTrainCount > 0 && _acpCount > 0) {
                    this._trainType = TRAIN_TYPE.active;
                    return;
                } else {
                    this._trainType = TRAIN_TYPE.unActive;
                    return;
                }
            } else {
                if (_online == 0 && passiveCondition && this._myAcpCount > 0 && _trainCount > 0) {
                    this._trainType = TRAIN_TYPE.passive;
                    return;
                } else {
                    this._trainType = TRAIN_TYPE.unPassive;
                    return;
                }
            }
        } else {
            this._trainType = TRAIN_TYPE.unActive;
            return;
        }
    }
    public getTrainType() {
        return this._trainType;
    }
    public _createHeroList(heros) {
        let newHeros = [];
        for (let k in heros) {
            let v = heros[k];
            newHeros.push(v);
        }
        return newHeros;
    }
    public getHeros() {
        return this._heros;
    }
    public isSelf() {
        let uid = this.getUid();
        let useId = G_UserData.getBase().getId();
        return uid == useId;
    }
    public isOnline() {
        let offline = this.getOffline();
        return offline == 0;
    }
}
