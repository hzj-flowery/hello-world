import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { SiegeRankBaseData } from "./SiegeRankBaseData";
import { SignalConst } from "../const/SignalConst";
import { SiegeGuildRankBaseData } from "./SiegeGuildRankBaseData";

export interface SiegeRankData {
    getSelfRank(): number
    setSelfRank(value: number): void
    getLastSelfRank(): number
    getSelfGuildRank(): number
    setSelfGuildRank(value: number): void
    getLastSelfGuildRank(): number
    getRankDatas(): Object
    setRankDatas(value: Object): void
    getLastRankDatas(): Object
    getGuildRankDatas(): Object
    setGuildRankDatas(value: Object): void
    getLastGuildRankDatas(): Object
}
let schema = {};
schema['selfRank'] = [
    'number',
    0
];
schema['selfGuildRank'] = [
    'number',
    0
];
schema['rankDatas'] = [
    'object',
    []
];
schema['guildRankDatas'] = [
    'object',
    []
];
export class SiegeRankData extends BaseData {
    public static schema = schema;
    _listenerRank;
    _listenerGuildRank;
    constructor(properties?) {
        super(properties);
        this._listenerRank = G_NetworkManager.add(MessageIDConst.ID_S2C_GetRebelArmyHurtRank, this._s2cGetRebelArmyHurtRank.bind(this));
        this._listenerGuildRank = G_NetworkManager.add(MessageIDConst.ID_S2C_GetRebelArmyGuildHurtRank, this._s2cGetRebelArmyGuildHurtRank.bind(this));
    }
    public clear() {
        this._listenerRank.remove();
        this._listenerRank = null;
        this._listenerGuildRank.remove();
        this._listenerGuildRank = null;
    }
    public reset() {
        this.setSelfRank(0);
        this.setRankDatas([]);
        this.setSelfGuildRank(0);
        this.setGuildRankDatas([]);
    }
    public _updatePersonData(data) {
        let rankDatas = [];
        if (data.hasOwnProperty('ranks')) {
            for (let i = 0; i < data.ranks.length; i++) {
                let rankBaseData = new SiegeRankBaseData(data.ranks[i]);
                rankDatas.push(rankBaseData);
            }
        }
        this.setRankDatas(rankDatas);
        this.setSelfRank(data.self_rank);
    }
    public c2sGetRebelArmyHurtRank() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetRebelArmyHurtRank, {});
    }
    public _s2cGetRebelArmyHurtRank(id, message) {
        if (message.ret != 1) {
            return;
        }
        this._updatePersonData(message);
        G_SignalManager.dispatch(SignalConst.EVENT_SIEGE_RANK);
    }
    public _updateGuildData(data) {
        let rankDatas = [];
        if (data.hasOwnProperty('ranks')) {
            for (let i = 0; i < data.ranks.length; i++) {
                let siegeGuildRankBaseData = new SiegeGuildRankBaseData(data.ranks[i]);
                rankDatas.push(siegeGuildRankBaseData);
            }
        }
        this.setGuildRankDatas(rankDatas);
        this.setSelfGuildRank(data.self_rank);
    }
    public c2sGetRebelArmyGuildHurtRank() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetRebelArmyGuildHurtRank, {});
    }
    public _s2cGetRebelArmyGuildHurtRank(id, message) {
        if (message.ret != 1) {
            return;
        }
        this._updateGuildData(message);
        G_SignalManager.dispatch(SignalConst.EVENT_SIEGE_GUILD_RANK);
    }
}
