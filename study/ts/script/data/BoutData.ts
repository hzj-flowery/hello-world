import AttributeConst from "../const/AttributeConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { G_NetworkManager, G_SignalManager } from "../init";
import { BoutHelper } from "../scene/view/bout/BoutHelper";
import { bit } from "../utils/bit";
import { AttrDataHelper } from "../utils/data/AttrDataHelper";
import { unpack } from "../utils/GlobleFunc";
import { handler } from "../utils/handler";
import { table } from "../utils/table";
import { BaseData } from "./BaseData";
import { BoutUnit } from "./BoutUnit";

export interface BoutData {
    getBoutList(): Object
    setBoutList(value: Object): void
    getBoutAcquire(): Object
    setBoutAcquire(value: Object): void
}
var schema = {};
schema['boutList'] = [
    'object',
    {}
];
schema['boutAcquire'] = [
    'object',
    {}
];
export  class BoutData extends BaseData{
    name: 'BoutData';
    static schema = schema;
    private _boutInfo:any;
    private _msgGetBoutInfo:any;
    private _msgUnlockBout:any;
    constructor(properties?) {
        super(properties);
        this._boutInfo = BoutHelper.initBoutInfo();
        this._msgGetBoutInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetBoutInfo, handler(this, this._s2cGetBoutInfo));
        this._msgUnlockBout = G_NetworkManager.add(MessageIDConst.ID_S2C_UnlockBout, handler(this, this._s2cUnlockBout));
    }
    clear() {
        this._msgGetBoutInfo.remove();
        this._msgGetBoutInfo = null;
        this._msgUnlockBout.remove();
        this._msgUnlockBout = null;
    }
    reset() {
    }
    c2sGetBoutInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetBoutInfo, {});
    }
    _s2cGetBoutInfo(id, message) {
        if (!message['bout']) {
            G_SignalManager.dispatch(SignalConst.EVENT_BOUT_ENTRY, message);
            return;
        }
        this._checkCreateBoutUnit(message['bout']);
        G_SignalManager.dispatch(SignalConst.EVENT_BOUT_ENTRY, message);
    }
    c2sUnlockBout(id, pos, materials_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_UnlockBout, {
            id: id,
            pos: pos,
            materials_id: materials_id
        });
    }
    _s2cUnlockBout(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_BOUT_UNLOCKSUCCESS);
    }
    insertData(data) {
        if (typeof(data) != 'object' || unpack(data).length==0) {
            return;
        }
        this._checkCreateBoutUnit(data);
    }
    deleteData(data) {
        if (typeof(data) != 'object' || unpack(data).length==0) {
            return;
        }
        var boutList = this.getBoutList();
        for (let key in data) {
            var value = data[key];
            boutList[bit.brshift(value, 32)][bit.bit_and(value, 4294967295)] = null;
        }
    }
    updateData(data) {
        if (typeof(data) != 'object' || unpack(data).length==0) {
            return;
        }
        this._checkCreateBoutUnit(data);
    }
    getBoutInfo() {
        return this._boutInfo;
    }
    isMainRed() {
        var curBoutId = this.getCurBoutId();
        if (!this._boutInfo || !this._boutInfo[curBoutId]) {
            return false;
        }
        for (let i in this._boutInfo[curBoutId]) {
            var v = this._boutInfo[curBoutId][i];
            if (this.checkUnlocked(v.id, v.point)) {
                if (BoutHelper.isSpecialBoutPoint(v.id, v.point)) {
                    if (BoutHelper.isCanUnlockSBoutPoint(v.point)) {
                        return true;
                    }
                } else {
                    var [isRed,_] = BoutHelper.isEnoughConsume({
                            id: v.id,
                            pos: v.point
                        });
                    if (isRed) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    getCurBoutId() {
        var boutAcquire = this.getBoutAcquire();
        var curBoutId = table.maxn(boutAcquire);
        curBoutId = curBoutId > 0?curBoutId + 1:1;
        return cc.misc.clampf(curBoutId, 1, table.maxn(this._boutInfo));
    }
    getCurBoutPoints() {
        var curBoutId = this.getCurBoutId();
        if (this._boutInfo && this._boutInfo[curBoutId]) {
            return this._boutInfo[curBoutId];
        }
        return this._boutInfo[curBoutId - 1];
    }
    checkUnlocked(id, pos) {
        var boutList = this.getBoutList();
        if (!boutList[id]) {
            return true;
        }
        if (!boutList[id][pos]) {
            return true;
        }
        return false;
    }
    _checkCreateBoutUnit(data) {
        var boutList = this.getBoutList();
        var boutAcquire = this.getBoutAcquire();
        for (let key in data) {
            var value = data[key];
            if (typeof(boutList[value.id]) != 'object') {
                boutList[value.id] = {};
            }
            var boutUnit = new BoutUnit(value);
            boutList[value.id][value.pos] = boutUnit;
            if (!this.getBoutAcquire()[value.id] && boutUnit.isSpecialBoutPoint()) {
                boutAcquire[value.id] = boutUnit.isSpecialBoutPoint();
            }
        }
    }
    getAttrSingleInfo(boutList?) {
        var attrs = {};
        var boutList = boutList || this.getBoutList();
        for (let i in boutList) {
            var sigleBout = boutList[i];
            for (let j in sigleBout) {
                var value = sigleBout[j];
                var data = BoutHelper.getAttrbute(value.getId(), value.getPos());
                for (let k in data) {
                    var v = data[k];
                    if (!attrs[k]) {
                        attrs[k] = 0;
                    }
                    attrs[k] = attrs[k] + v;
                }
            }
        }
        return attrs;
    }
    getPowerSingleInfo(boutList?) {
        var result = {};
        var boutList = boutList || this.getBoutList();
        for (let i in boutList) {
            var sigleBout = boutList[i];
            for (let j in sigleBout) {
                var value = sigleBout[j];
                AttrDataHelper.formatAttr(result, AttributeConst.BOUT_POWER, value.getConfig().all_combat);
            }
        }
        return result;
    }
};