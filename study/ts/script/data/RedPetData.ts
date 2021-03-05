import { FunctionConst } from "../const/FunctionConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { G_NetworkManager, G_SignalManager } from "../init";
import { handler } from "../utils/handler";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";
import { BaseData } from "./BaseData";


export interface RedPetData {  
    getFree_times():number
    setFree_times(data:number):void
    getFree_cd():number
    setFree_cd(data:number):void
    getOrange_pool_id():object
    setOrange_pool_id(data:object):void
    getSchedule():object
    setSchedule(data:object):void
   }

var schema = {};
schema['free_times'] = [
    'number',
    0
];
schema['free_cd'] = [
    'number',
    0
];
schema['orange_pool_id'] = [
    'table',
    {}
];
schema['schedule'] = [
    'table',
    {}
];

export class RedPetData extends BaseData{
    static schema = schema;
    name =  'RedPetData';
    private _recvRedPetInfo:any;
    private _recvGachaRedPet:any;
    private _recvRefreshRedPet:any;
    constructor(properties?) {
        super(properties);
        this._recvRedPetInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_PokemonEntry, handler(this, this._s2cGetRedPetInfo));
        this._recvGachaRedPet = G_NetworkManager.add(MessageIDConst.ID_S2C_PokemonGacha, handler(this, this._s2cGachaRedPet));
        this._recvRefreshRedPet = G_NetworkManager.add(MessageIDConst.ID_S2C_PokemonRefresh, handler(this, this._s2cRedPetRefresh));
    }
    clear() {
        this._recvRedPetInfo.remove();
        this._recvRedPetInfo = null;
        this._recvGachaRedPet.remove();
        this._recvGachaRedPet = null;
        this._recvRefreshRedPet.remove();
        this._recvRefreshRedPet = null;
    }
    reset() {
    }
    isActivityOpen() {
        return LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_RED_PET)[0];
    }
    c2sGetRedPetInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_PokemonEntry, {});
    }
    _s2cGetRedPetInfo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var info = message['pokemon'];
        if (info) {
            this.setFree_times(info['free_times'] || 0);
            this.setFree_cd(info['free_cd'] || 0);
            this.setOrange_pool_id(info['orange_pool_id'] || {});
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GET_RED_PET_INFO);
    }
    c2sGachaRedPet(type, id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_PokemonGacha, {
            gacha_type: type,
            pool_id: id
        });
    }
    _s2cGachaRedPet(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var info = message['pokemon'];
        if (info) {
            this.setFree_times(info['free_times']|| 0);
            this.setFree_cd(info['free_cd'] || 0);
            this.setOrange_pool_id(info['orange_pool_id'] || {});
        }
        var awards = message['awards'];
        G_SignalManager.dispatch(SignalConst.EVENT_GACHA_RED_PET, awards);
    }
    c2sRedPetRefresh() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_PokemonRefresh, {});
    }
    _s2cRedPetRefresh(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var info = message['pokemon'];
        if (info) {
            this.setFree_times(info['free_times'] || 0);
            this.setFree_cd(info['free_cd'] || 0);
            this.setOrange_pool_id(info['orange_pool_id'] || {});
        }
        G_SignalManager.dispatch(SignalConst.EVENT_REFRESH_RED_PET);
    }
};