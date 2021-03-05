import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { TowerRankBaseData } from "./TowerRankBaseData";
import { SignalConst } from "../const/SignalConst";

export interface TowerRankData {
    getSelfRank(): number
    setSelfRank(value: number): void
    getLastSelfRank(): number
    getRankDatas(): Object
    setRankDatas(value: Object): void
    getLastRankDatas(): Object
}
let schema = {};
schema['selfRank'] = [
    'number',
    0
];
schema['rankDatas'] = [
    'object',
    []
];
export class TowerRankData extends BaseData {
    public static schema = schema;

    _listenerTowerRank;

    constructor(properties?) {
        super(properties);
        this._listenerTowerRank = G_NetworkManager.add(MessageIDConst.ID_S2C_GetTowerStarRank, this._recvGetRank.bind(this));
    }
    public clear() {
        this._listenerTowerRank.remove();
        this._listenerTowerRank = null;
    }
    public reset() {
        this.setSelfRank(0);
        this.setRankDatas([]);
    }
    public updateData(data) {
        this.reset();
        let rankDatas = [];
        if (data.hasOwnProperty('ranks')) {
            for (let i = 0; i < data.ranks.length; i++) {
                let rankBaseData = new TowerRankBaseData(data.ranks[i]);
                rankDatas.push(rankBaseData);
            }
        }
        this.setRankDatas(rankDatas);
        this.setSelfRank(data.self_rank);
    }
    public c2sGetTowerStarRank() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetTowerStarRank, {});
    }
    public _recvGetRank(id, message) {
        if (message.ret == 1) {
            this.updateData(message);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TOWER_RANK);
    }
}
