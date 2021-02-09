import { BaseData } from './BaseData';
import { ActivityBaseData } from './ActivityBaseData';
import { Slot } from '../utils/event/Slot';
import { G_SignalManager, G_NetworkManager, G_ConfigLoader, G_UserData } from '../init';
import { SignalConst } from '../const/SignalConst';
import { MessageIDConst } from '../const/MessageIDConst';
import { ActivityConst } from '../const/ActivityConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { FunctionConst } from '../const/FunctionConst';
let schema = {};
schema['baseActivityData'] = [
    'object',
    {}
];
export interface ActivityMonthCardData {
    getBaseActivityData(): ActivityBaseData
    setBaseActivityData(value: ActivityBaseData): void
    getLastBaseActivityData(): ActivityBaseData
}
export class ActivityMonthCardData extends BaseData {

    public static schema = schema;
    public _monthCardConfigList;
    public _signalRechargeGetInfo: Slot;
    public _s2cUseMonthlyCardListener: Slot;

    constructor(properties?) {
        super(properties);
        super(properties)
        this._monthCardConfigList = null;
        this._signalRechargeGetInfo = G_SignalManager.add(SignalConst.EVENT_RECHARGE_GET_INFO, this._onEventRechargeGetInfo.bind(this));
        this._s2cUseMonthlyCardListener = G_NetworkManager.add(MessageIDConst.ID_S2C_UseMonthlyCard, this._s2cUseMonthlyCard.bind(this));
        let activityBaseData = new ActivityBaseData();
        activityBaseData.initData({ id: ActivityConst.ACT_ID_MONTHLY_CARD });
        this.setBaseActivityData(activityBaseData);
    }
    public clear() {
        super.clear();
        this._signalRechargeGetInfo.remove();
        this._signalRechargeGetInfo = null;
        this._s2cUseMonthlyCardListener.remove();
        this._s2cUseMonthlyCardListener = null;
        this.getBaseActivityData().clear();
    }
    public reset() {
        super.reset();
        this._monthCardConfigList = null;
        this.getBaseActivityData().reset();
    }
    public _onEventRechargeGetInfo(event, id, message) {
        this.getBaseActivityData().setHasData(true);
        this.resetTime();
    }
    public _s2cUseMonthlyCard(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            if (message.ret == MessageErrorConst.RET_MONTH_CARD_NOT_AVAILABLE || message.ret == MessageErrorConst.RET_MONTH_CARD_NOT_USE) {
                G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_MONTH_CARD_NOT_AVAILABLE, message.ret);
            }
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_MONTH_CARD_GET_REWARD, id, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_MONTHLY_CARD });
    }
    public _createMonthCardCfgListFromConfig() {
        let monthCardCfgList = [];
        let VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
        let size = VipPay.length();
        let config = null;
        for (let i = 0; i < size; i += 1) {
            config = VipPay.indexOf(i);
            if (config.card_type == ActivityConst.MONTH_CARD_VIP_PAY_TYPE) {
                monthCardCfgList.push(config);
            }
        }
        return monthCardCfgList;
    }
    public getMonthCardDataById(id) {
        let rechargeData = G_UserData.getRechargeData().getRechargeUnitDataById(id);
        return rechargeData;
    }
    public getMonthCardCfgList() {
        if (!this._monthCardConfigList) {
            this._monthCardConfigList = this._createMonthCardCfgListFromConfig();
        }
        return this._monthCardConfigList;
    }
    public pullData() {
        G_UserData.getRechargeData().pullData();
    }
    public resetData() {
        this.pullData();
        this.setNotExpire();
    }
    public c2sUseMonthlyCard(payId) {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_UseMonthlyCard, { id: payId });
    }
    public hasRedPoint() {
        return this._hasBuyResPoint() || this.hasRewardNotReceived();
    }
    public _hasBuyResPoint() {
        let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_WELFARE, {
            actId: ActivityConst.ACT_ID_MONTHLY_CARD,
            '0': 'buyMonthCardHint'
        });
        if (showed) {
            return false;
        }
        return !this.hasBuyCard();
    }
    public hasBuyCard() {
        let monthCardList = this.getMonthCardCfgList();
        for (let k in monthCardList) {
            let data = monthCardList[k];
            let cardData = this.getMonthCardDataById(data.id);
            if (cardData && cardData.getRemainDay() > 0) {
                return true;
            }
        }
        return false;
    }
    public hasRewardNotReceived() {
        let monthCardList = this.getMonthCardCfgList();
        for (let k in monthCardList) {
            let data = monthCardList[k];
            let cardData = this.getMonthCardDataById(data.id);
            if (cardData && cardData.isCanReceive()) {
                return true;
            }
        }
        return false;
    }
}