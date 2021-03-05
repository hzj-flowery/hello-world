import { ActivityBaseData } from "./ActivityBaseData";
import { BaseData } from './BaseData';
import { G_UserData, G_ConfigLoader, G_NetworkManager, G_ServiceManager, G_SignalManager } from '../init';
import { ActivityConst } from '../const/ActivityConst';
import { MessageIDConst } from "../const/MessageIDConst";
import { DataConst } from "../const/DataConst";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import { FunctionConst } from "../const/FunctionConst";
export interface RechargeRebateData {
    getBaseActivityData(): ActivityBaseData
    setBaseActivityData(value: ActivityBaseData): void
    getLastBaseActivityData(): ActivityBaseData
}
let schema = {};
schema['baseActivityData'] = [
    'object',
    {}
];
export class RechargeRebateData extends BaseData {

    public static schema = schema;
    _curRechargeInfo;
    _isTakenRebate;
    _allRebates;
    _startTime;
    _signalRecvGetCurrentRechargeRebate;
    _signalRecvGetRechargeRebateInfo;
    _signalRecvGetRechargeRebateAward;
    _curRechargeNum;

    constructor(properties?) {
        super(properties)
        let activityBaseData = new ActivityBaseData();
        activityBaseData.initData({ id: ActivityConst.ACT_ID_RECHARGE_REBATE });
        this.setBaseActivityData(activityBaseData);
        this._curRechargeInfo = null;
        this._isTakenRebate = null;
        this._allRebates = null;
        this._startTime = null;
        this._signalRecvGetCurrentRechargeRebate = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCurrentRechargeRebate, this._s2cGetCurrentRechargeRebate.bind(this));
        this._signalRecvGetRechargeRebateInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetRechargeRebateInfo, this._s2cGetRechargeRebateInfo.bind(this));
        this._signalRecvGetRechargeRebateAward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetRechargeRebateAward, this._s2cGetRechargeRebateAward.bind(this));
    }
    public clear() {
        this._signalRecvGetCurrentRechargeRebate.remove();
        this._signalRecvGetCurrentRechargeRebate = null;
        this._signalRecvGetRechargeRebateInfo.remove();
        this._signalRecvGetRechargeRebateInfo = null;
        this._signalRecvGetRechargeRebateAward.remove();
        this._signalRecvGetRechargeRebateAward = null;
    }
    public reset() {
        this._curRechargeInfo = null;
        this._isTakenRebate = null;
        this._allRebates = null;
        this._startTime = null;
    }
    public getCurRechargeNum(isForceGet) {
        if (isForceGet) {
            this.c2sGetCurrentRechargeRebate();
            return;
        }
        if (this._curRechargeNum) {
            return this._curRechargeNum;
        }
        this.c2sGetCurrentRechargeRebate();
    }
    public isNotTakenRebate() {
        if (this._isTakenRebate != null) {
            return this._isTakenRebate != 1;
        }
        return false;
    }
    public getRebateInfo() {
        let totalMoney = 0;
        let totalReturnMoney = 0;
        let totalReturnVip = 0;
        for (let k in this._allRebates) {
            let v = this._allRebates[k];
            totalMoney = totalMoney + v.money;
            totalReturnMoney = totalReturnMoney + v.returnMoney;
            totalReturnVip = totalReturnVip + v.returnVipExp;
        }
        let awards = [
            {
                type: TypeConvertHelper.TYPE_RESOURCE,
                value: DataConst.RES_DIAMOND,
                size: totalReturnMoney
            },
            {
                type: TypeConvertHelper.TYPE_RESOURCE,
                value: DataConst.RES_VIP,
                size: totalReturnVip
            }
        ];
        return [
            this._startTime,
            totalMoney,
            awards
        ];
    }
    public hasRedPoint() {
        let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_RECHARGE_REBATE });
        if (showed) {
            return false;
        }
        return true;
    }
    public c2sGetCurrentRechargeRebate() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetCurrentRechargeRebate, {});
    }
    public _s2cGetCurrentRechargeRebate(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let rebates = message['rebates'];
        if (rebates) {
            this._curRechargeNum = {};
            this._curRechargeNum.money = rebates.money;
            this._curRechargeNum.returnMoney = rebates.returnMoney;
            this._curRechargeNum.returnVipExp = rebates.returnVipExp;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GET_CURRENT_RECHARGE_REBATE_SUCCESS);
    }
    public c2sGetRechargeRebateInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetRechargeRebateInfo, {});
    }
    public _s2cGetRechargeRebateInfo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._isTakenRebate = null;
        let is_taken = message['is_taken'];
        if (is_taken) {
            this._isTakenRebate = is_taken;
        }
        this._allRebates = [];
        let rebates = message['rebates'];
        if (rebates) {
            for (let k in rebates) {
                let v = rebates[k];
                let single:any = {};
                single.money = v.money;
                single.returnMoney = v.returnMoney;
                single.returnVipExp = v.returnVipExp;
                this._allRebates.push(single);
            }
        }
        this._startTime = 0;
        let start_time = message['start_time'];
        if (start_time) {
            this._startTime = start_time;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_RECHARGE_REBATE);
        G_SignalManager.dispatch(SignalConst.EVENT_GET_RECHARGE_REBATE_INFO_SUCCESS);
    }
    public c2sGetRechargeRebateAward() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetRechargeRebateAward, {});
    }
    public _s2cGetRechargeRebateAward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let award = message['award'];
        if (!award) {
            award = {};
        }
        this._isTakenRebate = 1;
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_RECHARGE_REBATE);
        G_SignalManager.dispatch(SignalConst.EVENT_GET_RECHARGE_REBATE_AWARD_SUCCESS, award);
    }
}
