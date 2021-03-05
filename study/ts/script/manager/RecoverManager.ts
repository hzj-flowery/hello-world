import { DataConst } from "../const/DataConst"
import { assert } from "../utils/GlobleFunc"
import { G_ServerTime, G_SignalManager, G_ConfigLoader } from "../init"
import { SignalConst } from "../const/SignalConst"
import { ConfigNameConst } from "../const/ConfigNameConst"
import { handler } from "../utils/handler"
import { UserDataHelper } from "../utils/data/UserDataHelper"
import { TypeConvertHelper } from "../utils/TypeConvertHelper"

class RecoverUnit {
    public static UNIT_VIT = { id: DataConst.RES_VIT, resId: DataConst.RES_VIT } //体力回复
    public static UNIT_SPIRIT = { id: DataConst.RES_SPIRIT, resId: DataConst.RES_SPIRIT }  //精力回复
    public static UNIT_TOWER_COUNT = { id: DataConst.RES_TOWER_COUNT, resId: DataConst.RES_TOWER_COUNT }    //爬塔次数回复
    public static UNIT_TOKEN = { id: DataConst.RES_TOKEN, resId: DataConst.RES_TOKEN }  //剿匪令牌
    public static UNIT_ARMY_FOOD = { id: DataConst.RES_ARMY_FOOD, resId: DataConst.RES_ARMY_FOOD }        //兵粮 
    public static UNIT_MINE_TOKEN = { id: DataConst.RES_MINE_TOKEN, resId: DataConst.RES_MINE_TOKEN }     //矿战战斗令牌
    constructor(recoverType: any) {
        this._resId = recoverType.resId;
        this._unitId = recoverType.id;
        this._unitInfo = G_ConfigLoader.getConfig(ConfigNameConst.RECOVER).get(this._unitId);
      //assert((this._unitInfo, 'app.cfg.recover can\'t find unit by id ' + this._unitId);
        var remainTime = UserDataHelper.getRefreshTime(this._resId) - G_ServerTime.getTime();
        this._recoverTime = this._unitInfo.recover_time;
        this._remainTime = remainTime;
        // cc.warn('RecoverUnit:ctor remainTime : ' + remainTime);
        this._count = 0;
        this._start();
    }

    private _recoverTime;
    private _resId;
    private _unitId;
    private _unitInfo;
    private _remainTime;
    private _count;
    private _isRunning;

    _start() {
        var currValue = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, this._resId);
        if (currValue >= this._unitInfo.time_limit) {
            return;
        }
        this._isRunning = true;
    }
    public setUpdate() {
        var recoverTime = this._unitInfo.recover_time;
        var remainTime = UserDataHelper.getRefreshTime(this._resId) - G_ServerTime.getTime();
        if (remainTime < 0) {
            return;
        }
        this._count = (recoverTime - remainTime % recoverTime) % recoverTime + 1;
        if (remainTime % recoverTime == 0) {
            this._onRecover();
            var senderToServerTalbe = {
                recoverTime: UserDataHelper.getRefreshTime(this._resId),
                serverTime: G_ServerTime.getTime(),
                currResId: this._resId,
                currValue: UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, this._resId),
                needAddValue: remainTime % recoverTime
            };
        }
    }
    _onRecover() {
        var recoverTime = this._unitInfo.recover_time;
        var remainTime = UserDataHelper.getRefreshTime(this._resId) - G_ServerTime.getTime();
        var currValue = UserDataHelper.getServerRecoverNum(this._resId);
        var addValue = this._unitInfo.time_limit - Math.ceil(remainTime / recoverTime) - currValue;
        currValue = currValue + addValue;
        if (currValue <= this._unitInfo.time_limit) {
            UserDataHelper.updateRecorverNum(this._resId, currValue);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RECV_RECOVER_INFO, 'From RecoverManager');
        cc.warn('RecoverUnit:_onRecover() resId: %d  currValue: %d', this._resId, currValue);
        if (currValue >= this._unitInfo.time_limit) {
            this.stop();
        }
    }
    stop() {
        this._isRunning = false;
    }
    isRunning() {
        return this._isRunning;
    }
    getRemainCount() {
        var count = this._count || 0;
        return this._unitInfo.recover_time - count;
    }
    getMaxLimit() {
        return this._unitInfo.time_limit;
    }
    getResId() {
        return this._resId;
    }
    getConfig() {
        return this._unitInfo;
    }


}
export default class RecoverManager {
    public INDEX_VIT = 1;
    public INDEX_SPIRIT = 2;
    public INDEX_TOWER_COUNT = 3;
    public INDEX_TOKEN = 4;

    constructor() {
        this._recoverUnits = [];
        this._signalRecvRecoverInfo = G_SignalManager.add(SignalConst.EVENT_RECV_RECOVER_INFO, handler(this, this._onUserDataUpdate));
        cc.director.getScheduler().enableForTarget(this);
        this.reset();
    }
    private _recoverUnits: Array<RecoverUnit> = [];
    private _signalRecvRecoverInfo;

    clear() {
        for (var i = 0; i < this._recoverUnits.length; i++) {
            var recoverUnit = this._recoverUnits[i];
            if (recoverUnit) recoverUnit.stop();
        }
        this._recoverUnits = [];
        cc.director.getScheduler().unschedule(this._setUpdate, this);
    }
    reset() {
        this.clear();
        this._recoverUnits[1] = new RecoverUnit(RecoverUnit.UNIT_VIT);
        this._recoverUnits[2] = new RecoverUnit(RecoverUnit.UNIT_SPIRIT);
        this._recoverUnits[3] = new RecoverUnit(RecoverUnit.UNIT_TOWER_COUNT);
        this._recoverUnits[4] = new RecoverUnit(RecoverUnit.UNIT_TOKEN);
        this._recoverUnits[5] = new RecoverUnit(RecoverUnit.UNIT_ARMY_FOOD);
        this._recoverUnits[6] = new RecoverUnit(RecoverUnit.UNIT_MINE_TOKEN);

        cc.director.getScheduler().schedule(this._setUpdate, this, 1);
    }

    private _setUpdate() {
        for (var i = 0; i < this._recoverUnits.length; i++) {
            var recoverUnit = this._recoverUnits[i];
            if (recoverUnit && recoverUnit.isRunning()) {
                recoverUnit.setUpdate();
            }
        }
    }

    getRecoverUnit(index) {
        return this._recoverUnits[index];
    }
    getRecoverLimitByResId(resId) {
        for (var i in this._recoverUnits) {
            var unit = this._recoverUnits[i];
            if (unit.getResId() == resId) {
                return unit.getMaxLimit();
            }
        }
        return 0;
    }
    _onUserDataUpdate(_, param) {
        if (param == 'From RecoverManager') {
            return;
        }
        this.reset();
    }

}