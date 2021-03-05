import { BaseData } from "./BaseData";
import { G_ConfigLoader, G_NetworkManager, G_SignalManager, G_GameAgent, G_ConfigManager, G_UserData, G_ServerTime } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import { TimeConst } from "../const/TimeConst";
import { FunctionConst } from "../const/FunctionConst";

let unitSchema = {};
unitSchema['id'] = [
    'number',
    0
];
unitSchema['config'] = [
    'object',
    {}
];

export interface RechargeActivityUnitData {
    getId(): number
    setId(value: number): void
    setConfig(value: any): void
    getConfig(): any
}

export class RechargeActivityUnitData extends BaseData {
    public static schema = unitSchema;

    public clear() {
    }
    public reset() {
    }
    public initData(id, hasReceive) {
        this.setId(id);
        let cfg = G_ConfigLoader.getConfig(ConfigNameConst.RECHARGE_ACTVITY).get(id);
        this.setConfig(cfg);
    }
}

let schema = {};
schema['group'] = [
    'number',
    1
];

export interface RechargeActivityData {
    getGroup(): number
    setGroup(value: Number): void
}

export class RechargeActivityData extends BaseData {
    public static schema = schema;

    public _unitDataMap;
    _getSuperChargeGiftIds;
    _superChargeGiftAwards;

    private _buyData = {};

    public state = 1;   // 0 还可以买, 1一结束

    //has_open_servers = [5001000004, 5001000003, 5001000002, 5001000001];

    constructor(properties?) {
        super(properties);
        this.initAllUnitData();
        this._getSuperChargeGiftIds = G_NetworkManager.add(MessageIDConst.ID_S2C_GetSuperChargeGiftIds, handler(this, this.S2C_GetSuperChargeGiftIds));
        this._superChargeGiftAwards = G_NetworkManager.add(MessageIDConst.ID_S2C_SuperChargeGiftAwards, handler(this, this.S2C_SuperChargeGiftAwards));

  
    }

    clear() {
        this._getSuperChargeGiftIds.remove();
        this._getSuperChargeGiftIds = null;
        this._superChargeGiftAwards.remove();
        this._superChargeGiftAwards = null;
    }


    initAllUnitData() {
        this._unitDataMap = {};
        var cfgs = G_ConfigLoader.getConfig(ConfigNameConst.RECHARGE_ACTVITY);
        for (var i = 0; i < cfgs.length(); i++) {
            var cfg = cfgs.indexOf(i);
            var unitData = new RechargeActivityUnitData();
            unitData.initData(cfg.id, false);
            this._unitDataMap[cfg.id] = unitData;

        }
    }

    getCurActUnitData(): RechargeActivityUnitData {
        return this._unitDataMap[this.getGroup().toString()];
    }

    S2C_GetSuperChargeGiftIds(id, message) {
        var ids = message['gift_ids'] || {};
        for (var k in ids) {
            var v = ids[k];
            this._buyData[(v.Key)] = v.Value;
        }
        this.updateGroup();
        G_SignalManager.dispatch(SignalConst.EVENT_SUPER_CHARGE_GIFT_INFO);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SUPER_CHARGE_GIFT);
    }

    updateGroup() {
        this.state = 0;
        var group = 1;
        var cfgs = G_ConfigLoader.getConfig(ConfigNameConst.RECHARGE_ACTVITY);
        for (var i = 0; i < cfgs.length(); i++) {
            var cfg = cfgs.indexOf(i);
            if (this._buyData[cfg.vip_pay_id]) {
                group++;
            }
        }
        this.setGroup(group);
        if (group > cfgs.length()) {
            this.state = 1;
        }
    }

    getActivityEndTime() {
        var endTime = 0;
        if (this.getGroup() == 1) {
            var serverOpenTime = G_UserData.getBase().getCreate_time();
         //   var openZeroTime = G_ServerTime.secondsFromZero(serverOpenTime, TimeConst.RESET_TIME_SECOND);
            endTime = serverOpenTime + 24 * 3600;
        } else {
            var lastBuyId = this.getGroup() - 1;
            var lastBuyTime = this._buyData[this._unitDataMap[lastBuyId].getConfig().vip_pay_id];
            endTime = lastBuyTime + 24 * 3600
        }
        return endTime;
    }

    c2sBuy() {
        var payId = this._unitDataMap[this.getGroup().toString()].getConfig().vip_pay_id;
        var payCfg = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY).get(payId);
        G_GameAgent.pay(payCfg.id, payCfg.rmb, payCfg.product_id, payCfg.name, payCfg.name);
    }

    S2C_SuperChargeGiftAwards(id, message) {
        var awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_SUPER_CHARGE_GIFT_REWARDS, awards)
    }
}