import { BaseData } from "./BaseData";
import { Slot } from "../utils/event/Slot";
import { G_NetworkManager, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { StarRankBaseData } from "./StarRankBaseData";

export interface StarRankData {
    getSelfRank(): number
    setSelfRank(value: number): void
    getLastSelfRank(): number
    getStar(): number
    setStar(value: number): void
    getLastStar(): number
    getRankDatas(): Object
    setRankDatas(value: Object): void
    getLastRankDatas(): Object
}


let schema = {};
schema['selfRank'] = [
    'number',
    0
];
schema['star'] = [
    'number',
    0
];
schema['rankDatas'] = [
    'object',
    {}
];
export class StarRankData extends BaseData {

    public static schema = schema;
        _listenerStarRank : Slot;

    constructor(properties?) {
        super(properties);
        super(properties)
        this._listenerStarRank = G_NetworkManager.add(MessageIDConst.ID_S2C_GetStageStarRank, this._recvStarRank.bind(this));
    }
    public clear() {
        this._listenerStarRank.remove();
        this._listenerStarRank = null;
    }
    public reset() {
        this.setSelfRank(0);
        this.setRankDatas({});
    }
    public c2sGetStageStarRank(rankType) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetStageStarRank, { rank_type: rankType });
    }
    public _recvStarRank(id, message) {
        let ret = message.ret;
        if (message.ret == 1) {
            this.updateData(message);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CHAPTER_STAR_RANK, ret);
    }
    public updateData(data) {
        this.reset();
        let rankDatas = [];
        if (data.hasOwnProperty('ranks')) {
            for (let i = 0; i < data.ranks.length; i++) {
                let rankBaseData = new StarRankBaseData(data.ranks[i]);
                rankDatas.push(rankBaseData);
            }
        }
        this.setRankDatas(rankDatas);
        this.setSelfRank(data.self_rank);
        this.setStar(data.star);
    }
}
