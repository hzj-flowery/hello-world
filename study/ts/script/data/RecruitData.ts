import { G_NetworkManager, G_SignalManager, G_ServerTime, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { BaseData } from "./BaseData";
import { SignalConst } from "../const/SignalConst";
import ParameterIDConst from "../const/ParameterIDConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { bit } from "../utils/bit";

export interface RecruitData {
    getNormal_cnt(): number
    setNormal_cnt(value: number): void
    getLastNormal_cnt(): number
    getNormal_free_time(): number
    setNormal_free_time(value: number): void
    getLastNormal_free_time(): number
    getGold_cnt(): number
    setGold_cnt(value: number): void
    getLastGold_cnt(): number
    getRecruit_point(): number
    setRecruit_point(value: number): void
    getLastRecruit_point(): number
    getRecruit_point_get(): number
    setRecruit_point_get(value: number): void
    getLastRecruit_point_get(): number
    getGold_baodi_cnt(): number
    setGold_baodi_cnt(value: number): void
    getLastGold_baodi_cnt(): number
    getDaily_normal_cnt(): number
    setDaily_normal_cnt(value: number): void
    getLastDaily_normal_cnt(): number
    getDaily_gold_cnt(): number
    setDaily_gold_cnt(value: number): void
    getLastDaily_gold_cnt(): number
}
let schema = {};
schema['normal_cnt'] = [
    'number',
    0
];
schema['normal_free_time'] = [
    'number',
    0
];
schema['gold_cnt'] = [
    'number',
    0
];
schema['recruit_point'] = [
    'number',
    0
];
schema['recruit_point_get'] = [
    'number',
    0
];
schema['gold_baodi_cnt'] = [
    'number',
    0
];
schema['daily_normal_cnt'] = [
    'number',
    0
];
schema['daily_gold_cnt'] = [
    'number',
    0
];

export class RecruitData extends BaseData {
    public static schema = schema;
    _listenerRecruitInfo: any;
    _listenerRecruitNormal: any;
    _listenerRecruitGoldOne: any;
    _listenerRecruitGoldTen: any;
    _listenerRecruitPointGet: any;
    constructor() {
        super()
        this._listenerRecruitInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_RecruitInfo, this._s2cRecruitInfo.bind(this));
        this._listenerRecruitNormal = G_NetworkManager.add(MessageIDConst.ID_S2C_RecruitNormal, this._s2cRecruitNormal.bind(this));
        this._listenerRecruitGoldOne = G_NetworkManager.add(MessageIDConst.ID_S2C_RecruitGoldOne, this._s2cRecruitGoldOne.bind(this));
        this._listenerRecruitGoldTen = G_NetworkManager.add(MessageIDConst.ID_S2C_RecruitGoldTen, this._s2cRecruitGoldTen.bind(this));
        this._listenerRecruitPointGet = G_NetworkManager.add(MessageIDConst.ID_S2C_RecruitPointGet, this._s2cRecruitPointGet.bind(this));
    }


    clear() {
        this._listenerRecruitInfo.remove();
        this._listenerRecruitInfo = null;
        this._listenerRecruitNormal.remove();
        this._listenerRecruitNormal = null;
        this._listenerRecruitGoldOne.remove();
        this._listenerRecruitGoldOne = null;
        this._listenerRecruitGoldTen.remove();
        this._listenerRecruitGoldTen = null;
        this._listenerRecruitPointGet.remove();
        this._listenerRecruitPointGet = null;
    }
    reset() {
    }
    updateData(data) {
        this.setProperties(data);
        this.resetTime();
    }

    _s2cRecruitInfo(id, message) {
        this.updateData(message);
        G_SignalManager.dispatch(SignalConst.EVENT_RECRUIT_INFO, message);
    }
    c2sRecruitNormal(type) {
        if (this.isExpired() == true) {
            this.c2sRecruitInfo();
            return;
        }
        var message = { recruit_type: type };
        G_NetworkManager.send(MessageIDConst.ID_C2S_RecruitNormal, message);
    }
    _s2cRecruitNormal(id, message) {
        if (message.ret != 1) {
            return;
        }
        if (message.hasOwnProperty('recruit_info')) {
            this.updateData(message.recruit_info);
        }
        if (message.hasOwnProperty('awards')) {
            var generals = [];
            for (var i = 0; i < message.awards.length; i++) {
                var general = {
                    type: message.awards[i].type,
                    value: message.awards[i].value,
                    size: message.awards[i].size
                };
                generals.push(general)
            }
            G_SignalManager.dispatch(SignalConst.EVENT_RECRUIT_NORMAL, generals);
        }
    }
    c2sRecruitGoldOne(type) {
        if (this.isExpired() == true) {
            this.c2sRecruitInfo();
            return;
        }
        var message = { recruit_type: type };
        G_NetworkManager.send(MessageIDConst.ID_C2S_RecruitGoldOne, message);
    }
    _s2cRecruitGoldOne(id, message) {
        if (message.ret != 1) {
            return;
        }
        if (message.hasOwnProperty('recruit_info')) {
            this.updateData(message.recruit_info);
        }
        if (message.hasOwnProperty('awards')) {
            var generals = [];
            for (var i = 0; i < message.awards.length; i++) {
                var general = {
                    type: message.awards[i].type,
                    value: message.awards[i].value,
                    size: message.awards[i].size
                };
                generals.push(general);
            }
            G_SignalManager.dispatch(SignalConst.EVENT_RECRUIT_GOLD, generals);
        }
    }
    c2sRecruitGoldTen(type) {
        if (this.isExpired() == true) {
            this.c2sRecruitInfo();
            return;
        }
        var message = { recruit_type: type };
        G_NetworkManager.send(MessageIDConst.ID_C2S_RecruitGoldTen, message);
    }
    _s2cRecruitGoldTen(id: any, message: any) {
        if (message.ret != 1) {
            return;
        }
        if (message.hasOwnProperty('recruit_info')) {
            this.updateData(message.recruit_info);
        }
        if (message.hasOwnProperty('awards')) {
            var generals = new Array<any>();
            for (var i = 0; i < message.awards.length; i++) {
                var general = {
                    type: message.awards[i].type,
                    value: message.awards[i].value,
                    size: message.awards[i].size
                };
                generals.push(general);
            }
            G_SignalManager.dispatch(SignalConst.EVENT_RECRUIT_GOLD_TEN, generals);
        }
    }
    c2sRecruitInfo() {
        var message = {};
        G_NetworkManager.send(MessageIDConst.ID_C2S_RecruitInfo, message);
    }
    c2sRecruitPointGet(boxNum, boxId, index) {
        if (this.isExpired() == true) {
            this.c2sRecruitInfo();
            return;
        }
        var message = {
            box_num: boxNum,
            box_id: boxId,
            hero_num: index
        };
        G_NetworkManager.send(MessageIDConst.ID_C2S_RecruitPointGet, message);
    }
    _s2cRecruitPointGet(id, message) {
        if (message.ret != 1) {
            return;
        }
        if (message.hasOwnProperty('recruit_info')) {
            this.updateData(message.recruit_info);
        }
        if (message.hasOwnProperty('awards')) {
            var generals = [];
            for (var i = 0; i < message.awards.length; i++) {
                var general = {
                    type: message.awards[i].type,
                    value: message.awards[i].value,
                    size: message.awards[i].size
                };
                generals.push(general);
            }
            G_SignalManager.dispatch(SignalConst.EVENT_RECRUIT_POINT_GET, generals);
        }
    }
    hasFreeGoldCount() {
        if (this.getGold_cnt() == 0) {
            return true;
        }
    }
    hasFreeNormalCount() {
        var freeCount = this.getNormal_cnt();
        var lastRecuritTime = this.getNormal_free_time();
        var freeTime = lastRecuritTime + parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_TNTERVAL).content);
        var tblFreeCount = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_NORMAL_COUNT).content);
        if (freeCount < tblFreeCount && G_ServerTime.getTime() >= freeTime) {
            return true;
        }
    }

    hasBoxToGet() {
        var myPoint = this.getRecruit_point();
        var state = this.getRecruit_point_get();
        var boxPoint;

        var boxStates:any[] = bit.tobits(state);
        for (var i = 0; i < 3; i++) {
            boxPoint = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst['RECRUIT_BOX' + ((i + 1) + '_POINT')]).content);
            if (myPoint >= boxPoint) {
                if (!boxStates[i] || parseInt(boxStates[i]) == 0) {
                    return true;
                }
            }
        }
    }

    hasFreeCount() {
        var freeCount = this.getNormal_cnt();
        var tblFreeCount = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_NORMAL_COUNT).content);
        return freeCount < tblFreeCount;
    }
}
