import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_ServerTime, G_ConfigLoader, G_UserData, G_ConfigManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { ArraySort } from "../utils/handler";
import { SignalConst } from "../const/SignalConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { RechargeConst } from "../const/RechargeConst";
import { Slot } from "../utils/event/Slot";

export interface VipPayData {
    isLogin(): boolean
    setLogin(value: boolean): void
    isLastLogin(): boolean
    isFlush(): boolean
    setFlush(value: boolean): void
    isLastFlush(): boolean
}
let schema = {};
schema['login'] = [
    'boolean',
    false
];
schema['flush'] = [
    'boolean',
    false
];
export class VipPayData extends BaseData {

    public static schema = schema;

    _rechargeList: any[];
    _jadeRechargeList:any[];
    _serverDatas: any[];
    _inited: boolean;
    _hasRecharged: boolean;
    _hasGotRechargeAward: boolean;
    _firstBuyResetDate: any[]
    _signalRecharge: Slot;
    _recvUpdateRechargeReset: Slot;
    constructor() {
        super();
        this._rechargeList = null;
        this._serverDatas = [];
        this._inited = false;
        this._hasRecharged = false;
        this._hasGotRechargeAward = true;
        this._firstBuyResetDate = [];
        this._signalRecharge = G_NetworkManager.add(MessageIDConst.ID_S2C_GetRecharge, this._onGetRecharge.bind(this));
        this._recvUpdateRechargeReset = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateRechargeReset, this._s2cUpdateRechargeReset.bind(this));
        this.init();
    }
    public _onGetRecharge(id, message) {
        let rechargeList = message['recharge_money'] || {};
        this.updateData(rechargeList);
    }
    public _s2cUpdateRechargeReset(id, message) {
        let dateList = message['date'] || {};
        this._firstBuyResetDate = [];
        for (let k in dateList) {
            let v = dateList[k];
            this._firstBuyResetDate.push(v);
        }
        let sortfunction = function (a, b) {
            return a > b;
        };
        ArraySort(this._firstBuyResetDate, sortfunction);
        G_SignalManager.dispatch(SignalConst.EVENT_RECHARGE_FIRST_BUY_RESET, id, message);
    }
    public clear() {
        this._signalRecharge.remove();
        this._signalRecharge = null;
        this._recvUpdateRechargeReset.remove();
        this._recvUpdateRechargeReset = null;
        this._rechargeList = null;
    }
    public getFirstBuyResetTime() {
        let time = G_ServerTime.getTime();
        for (let k in this._firstBuyResetDate) {
            let v = this._firstBuyResetDate[k];
            if (v <= time) {
                return v;
            }
        }
        return 0;
    }
    public updateData(recharegeList) {
        for (let i = 0; i < recharegeList.length; i++) {
            let data = recharegeList[i];
            let id = data.Key;
            let time = data.Value;
            for (let j = 0; j < this._rechargeList.length; j++) {
                let rechargeData = this._rechargeList[j];
                if (rechargeData.cfg.id == id) {
                    rechargeData.isBuyed = true;
                    rechargeData.buyTime = time;
                }
            }
        }
    }
    public init() {
        if (!this._inited) {
            this._initData();
            for (let i = 0; i < this._serverDatas.length; i++) {
                let data = this._serverDatas[i];
                for (let j = 0; j < this._rechargeList.length; j++) {
                    let rechargeData = this._rechargeList[j];
                    if (rechargeData.cfg.price == data) {
                        rechargeData.isBuyed = true;
                    }
                }
            }
            this._inited = true;
        }
    }
    public setServerData(datas) {
        this._serverDatas = datas;
        this._inited = false;
    }
    public _initData() {
        let tempRechargeList = [];
        var tempJadeRechargeList = [];
        this._rechargeList = [];
        function matchAppId(rechargeInfo) {
            return true;
        }
        let shopInfos = {};
        let VipPayInfo = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
        for (let i = 0; i < VipPayInfo.length(); i++) {
            let rechargeInfo = VipPayInfo.indexOf(i);
            if (matchAppId(rechargeInfo)) {
                let rechargeData: any = {};
                rechargeData.cfg = rechargeInfo;
                rechargeData.isBuyed = false;
                rechargeData.buyTime = 0;
                if(rechargeInfo.card_type == RechargeConst.VIP_PAY_TYPE_RECHARGE)
                {
                    tempRechargeList.push(rechargeData);
                }
                else if (rechargeInfo.card_type == RechargeConst.VIP_PAY_TYPE_JADE) {
                    tempJadeRechargeList.push(rechargeData);
                }

            }
            
        }
        ArraySort(tempRechargeList, function (a, b) {
            let order_a = a.cfg.order, order_b = b.cfg.order;
            return order_a < order_b;
        });
        ArraySort(tempJadeRechargeList, function (a, b) {
            var order_a = a.cfg.order, order_b = b.cfg.order;
            return order_a < order_b;
        });
        this._rechargeList = tempRechargeList;
        this._jadeRechargeList = tempJadeRechargeList;
    }
    public getRechargeList() {
        let currVip = G_UserData.getVip().getLevel();
        function matchVip(rechargeInfo) {
            return rechargeInfo.vip_show <= currVip;
        }
        function checkLargeAmount(rechargeInfo) {
            return rechargeInfo.large_amount != 1 || rechargeInfo.large_amount == 1 && G_ConfigManager.isLargeCashReCharge();
        }
        let list = [];
        for (let k in this._rechargeList) {
            let v = this._rechargeList[k];
            if (matchVip(v.cfg) && checkLargeAmount(v.cfg)) {
                list.push(v);
            }
        }
        return list;
    }
    public getJadeRechargeList () {
        var currVip = G_UserData.getVip().getLevel();
        function matchVip(rechargeInfo) {
            return rechargeInfo.vip_show <= currVip;
        }
        function checkLargeAmount(rechargeInfo) {
            return rechargeInfo.large_amount != 1 || rechargeInfo.large_amount == 1 && G_ConfigManager.isLargeCashReCharge();
        }
        var list = [];
        for (var k in this._jadeRechargeList) {
            var v = this._jadeRechargeList[k];
            if (matchVip(v.cfg) && checkLargeAmount(v.cfg)) {
                list.push(v)
            }
        }
        return list;
    }
}
