import { G_NetworkManager, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import { ActivityConst } from "../const/ActivityConst";
import { BaseData } from "./BaseData";
import { RechargeMonthCardData } from "./RechargeMonthCardData";
import { FunctionConst } from "../const/FunctionConst";

export interface RechargeData {
}
let schema = {};
export class RechargeData extends BaseData {
    public static schema = schema;
        _rechargeDataList;
        _s2cGetRechargeListener;
        _s2cRechargeNoticeListener;

    constructor(properties?) {
        super(properties);
        this._rechargeDataList = {};
        this._s2cGetRechargeListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetRecharge, this._s2cGetRecharge.bind(this));
        this._s2cRechargeNoticeListener = G_NetworkManager.add(MessageIDConst.ID_S2C_RechargeNotice, this._s2cRechargeNotice.bind(this));
    }
    public clear() {
        this._s2cGetRechargeListener.remove();
        this._s2cGetRechargeListener = null;
        this._s2cRechargeNoticeListener.remove();
        this._s2cRechargeNoticeListener = null;
    }
    public reset() {
        this._rechargeDataList = {};
    }
    public _setRechargeUnitData(id, rechargeData) {
        this._rechargeDataList['k_' + String(id)] = rechargeData;
    }
    public _s2cGetRecharge(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.reset();
        let monthCardList = message['month_card'] || {};
        for (let k in monthCardList) {
            let monthlyCard = monthCardList[k];
            let data = new RechargeMonthCardData();
            data.initData(monthlyCard);
            this._setRechargeUnitData(monthlyCard.id, data);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RECHARGE_GET_INFO, id, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_FIRST_RECHARGE);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_MONTHLY_CARD });
    }
    public _s2cRechargeNotice(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RECHARGE_NOTICE, id, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_RECHARGE);
    }
    public getRechargeUnitDataById(id) {
        return this._rechargeDataList['k_' + String(id)];
    }
    public pullData() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetRecharge, {});
    }
}
