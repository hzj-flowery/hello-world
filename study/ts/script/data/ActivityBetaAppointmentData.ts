import { BaseData } from './BaseData';
import { G_NetworkManager, G_UserData, G_SignalManager } from '../init';
import { MessageIDConst } from '../const/MessageIDConst';
import { ActivityConst } from '../const/ActivityConst';
import { ActivityBaseData } from './ActivityBaseData';
import { Slot } from '../utils/event/Slot';
import { FunctionConst } from '../const/FunctionConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { SignalConst } from '../const/SignalConst';
let schema = {};
schema['baseActivityData'] = [
    'object',
    {}
];
export interface ActivityBetaAppointmentData {
    getBaseActivityData(): ActivityBaseData;
    setBaseActivityData(value: ActivityBaseData);
    getLastBaseActivityData(): ActivityBaseData;
}
export class ActivityBetaAppointmentData extends BaseData {

    public static schema = schema;

    public _signalRecvCommonPhoneOrder: Slot;

    constructor (properties?) {
        super(properties);
        let activityBaseData = new ActivityBaseData();
        activityBaseData.initData({ id: ActivityConst.ACT_ID_BETA_APPOINTMENT });
        this.setBaseActivityData(activityBaseData);
        this._signalRecvCommonPhoneOrder = G_NetworkManager.add(MessageIDConst.ID_S2C_CommonPhoneOrder, this._s2cCommonPhoneOrder.bind(this));
    }

    public hasRedPoint () {
        let state = G_UserData.getBase().getOrder_state();
        let isAlreadyOrder = state != 0;
        if (isAlreadyOrder) {
            return false;
        }
        let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_BETA_APPOINTMENT });
        if (showed) {
            return false;
        }
        return true;
    }
    public clear () {
        this._signalRecvCommonPhoneOrder.remove();
        this._signalRecvCommonPhoneOrder = null;
    }
    public reset () {
    }
    public c2sCommonPhoneOrder (phone_num) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_CommonPhoneOrder, { phone_num: phone_num });
    }
    public _s2cCommonPhoneOrder (id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let awards = message['awards'] || {};
        G_UserData.getBase().setOrder_state(1);
        G_SignalManager.dispatch(SignalConst.EVENT_COMMON_PHONE_ORDER_SUCCESS, awards);
    }
}