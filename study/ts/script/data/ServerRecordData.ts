import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { SignalConst } from "../const/SignalConst";
import { ServerRecordConst } from "../const/ServerRecordConst";
import { bit } from "../utils/bit";

export class ServerRecordData extends BaseData{
    constructor(){
        super();
        this._s2cServerRecordNotifyListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ServerRecordNotify, this._s2cServerRecordNotify.bind(this));
    }
    private _data;
    private _s2cServerRecordNotifyListener;
    public clear() {
        this._s2cServerRecordNotifyListener.remove();
        this._s2cServerRecordNotifyListener = null;
    }
    reset() {
    }
    _s2cServerRecordNotify(id, message) {
        this._data = {};
        var records = message['records'] || {};
        for (var k in records) {
            var v = records[k];
            this._data['key_' + (v.Key)] = v.Value;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SERVER_RECORD_CHANGE);
    }
    getRecordById(id) {
        return this._data['key_' + (id)] || 0;
    }
    isEmergencyClose(shift) {
        var value = this.getRecordById(ServerRecordConst.KEY_EMERGENCY);
        // var b = bit.brshift(value, shift);
        // var result = bit.band(b, 1);
        // return result == 1;
        console.log("bit 没有翻译--------");
        return false;
    }

}