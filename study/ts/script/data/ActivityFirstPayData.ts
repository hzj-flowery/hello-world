import { BaseData } from './BaseData';
import { Slot } from '../utils/event/Slot';
import { G_SignalManager, G_UserData, G_ConfigLoader, G_GameAgent, G_ServerListManager, G_ServerTime } from '../init';
import { SignalConst } from '../const/SignalConst';
import { FunctionConst } from '../const/FunctionConst';
import { ConfigNameConst } from '../const/ConfigNameConst';
import CommonConst from '../const/CommonConst';
import { assert } from '../utils/GlobleFunc';
export interface ActivityFirstPayData {
}
export class ActivityFirstPayData extends BaseData {

    public static schema = {};

    public _signalActivityRechargeAwardUpdate: Slot;
    public _signalActivityRechargeAwardGetInfo: Slot;

    constructor(properties?) {
        super(properties);
        this._signalActivityRechargeAwardUpdate = G_SignalManager.add(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_UPDATE, this._onEventActivityRechargeAwardUpdate.bind(this));
        this._signalActivityRechargeAwardGetInfo = G_SignalManager.add(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_GET_INFO, this._onEventActivityRechargeAwardGetInfo.bind(this));
    }
    public clear() {
        this._signalActivityRechargeAwardUpdate.remove();
        this._signalActivityRechargeAwardUpdate = null;
        this._signalActivityRechargeAwardGetInfo.remove();
        this._signalActivityRechargeAwardGetInfo = null;
    }
    public reset() {
    }
    public _onEventActivityRechargeAwardGetInfo(event, id, message) {
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_FIRST_RECHARGE);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_FIRST_RECHARGE);
    }
    public _onEventActivityRechargeAwardUpdate(event, id, message) {
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_FIRST_RECHARGE);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_FIRST_RECHARGE);
    }

    public c2sActRechargeAward(id) {
        G_UserData.getActivityRechargeAward().c2sActRechargeAward(id);
    }
    public pullData() {
        G_UserData.getActivityRechargeAward().pullData();
    }
    public isHasData() {
        return G_UserData.getActivityRechargeAward().isHasData();
    }
    public isReachReceiveCondition(id) {
        const openTime = G_UserData.getBase().getServer_open_time()
        const end_time = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(2015).content;
        let configName = ConfigNameConst.FIRST_PAY;
        if (openTime >= end_time) configName = ConfigNameConst.FIRST_CHARGE_NEW;
        
        var FirstPay = G_ConfigLoader.getConfig(configName);;
        var config = FirstPay.get(id);
        assert(config, 'first_pay can not find id ' + (id));
        var count = G_UserData.getBase().getRecharge_total();
        var jadeCount = G_UserData.getBase().getRecharge_jade_bi();
        var fakeRechargeCount = G_UserData.getBase().getRecharge_fake_total();
        return count >= config.charge || fakeRechargeCount >= config.charge;

    }

    public isRewardDate(id) {
        const openTime = G_UserData.getBase().getServer_open_time()
        const end_time = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(2015).content;
        if (openTime < end_time) return true;
        const configName = ConfigNameConst.FIRST_CHARGE_NEW;
        let FirstPay = G_ConfigLoader.getConfig(configName);
        let config = FirstPay.get(id);
        const now = G_ServerTime.getTime();
        const rechargeTime = G_UserData.getActivityRechargeAward()._rechargeTimeData[config.charge_index] ?? now;
        if (G_ServerTime.differenceInDays(rechargeTime, now) >= (config.Day - 1)) {
            return true;
        } else {
            return false;
        }
    }

    public hasReceive(id) {
        let status = G_UserData.getActivityRechargeAward().getRecordById(id);
        return status == CommonConst.RECEIVE_HAS;
    }
    public canReceive(id) {
        if (this.isReachReceiveCondition(id) && this.isRewardDate(id) && !this.hasReceive(id)) {
            return true;
        }
        return false;
    }
    public isFirst = true;
    public hasRedPoint() {
        if (this.isFirst) {
            return true;
        }
        const openTime = G_UserData.getBase().getServer_open_time()
        const end_time = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(2015).content;
        let configName = ConfigNameConst.FIRST_PAY;
        if (openTime >= end_time) configName = ConfigNameConst.FIRST_CHARGE_NEW;
        let FirstPay = G_ConfigLoader.getConfig(configName);
        for (let index = 0; index < FirstPay.length(); index += 1) {
            let config = FirstPay.indexOf(index);
            if (this.canReceive(config.id)) {
                return true;
            }
        }
        return false;
    }
    public getFirstPayList() {
        const openTime = G_UserData.getBase().getServer_open_time()
        const end_time = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(2015).content;
        let configName = ConfigNameConst.FIRST_PAY;
        if (openTime >= end_time) configName = ConfigNameConst.FIRST_CHARGE_NEW;
        let FirstPay = G_ConfigLoader.getConfig(configName);
        let list = [];
        for (let index = 0; index < FirstPay.length(); index += 1) {
            let config = FirstPay.indexOf(index);
            list.push(config);
        }
        return list;
    }
    public needShowFirstPayAct() {
        const openTime = G_UserData.getBase().getServer_open_time()
        const end_time = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(2015).content;
        let configName = ConfigNameConst.FIRST_PAY;
        if (openTime >= end_time) configName = ConfigNameConst.FIRST_CHARGE_NEW;
        let FirstPay = G_ConfigLoader.getConfig(configName);
        for (let index = 0; index < FirstPay.length(); index += 1) {
            let config = FirstPay.indexOf(index);
            if (!this.hasReceive(config.id)) {
                return true;
            }
        }
        return false;
    }
}