import { BaseData } from './BaseData';
import { G_UserData, G_ConfigLoader, G_NetworkManager, G_SignalManager, G_GameAgent } from '../init';
import { ActivityOpenServerFundConst } from '../const/ActivityOpenServerFundConst';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { TimeExpiredData } from './TimeExpiredData';
import { ActivityBaseData } from './ActivityBaseData';
import { ActivityConst } from '../const/ActivityConst';
import { Slot } from '../utils/event/Slot';
import { MessageIDConst } from '../const/MessageIDConst';
import { SignalConst } from '../const/SignalConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { FunctionConst } from '../const/FunctionConst';
import { ServerRecordConst } from '../const/ServerRecordConst';
let unitSchema = {};
unitSchema['id'] = [
    'number',
    0
];
unitSchema['config'] = [
    'object',
    {}
];
unitSchema['hasReceive'] = [
    'boolean',
    false
];
let schema = {};
schema['fundNum'] = [
    'number',
    0
];
schema['group'] = [
    'object',
    {}
];
schema['baseActivityData'] = [
    'object',
    {}
];
export interface ActivityOpenServerFundUnitData {
getId(): number
setId(value: number): void
getLastId(): number
getConfig(): any
setConfig(value: any): void
getLastConfig(): any
isHasReceive(): boolean
setHasReceive(value: boolean): void
isLastHasReceive(): boolean

}
export class ActivityOpenServerFundUnitData extends BaseData {
    public static schema = unitSchema;

    public clear () {
    }
    public reset () {
        this.setHasReceive(false);
    }
    public canReceive () {
        let cfg = this.getConfig();
        if (cfg.fund_type == ActivityOpenServerFundConst.FUND_TYPE_GROW) {
            let vip = G_UserData.getActivityOpenServerFund().getGrowFundNeedVipLevel();
            let hasBuyGroup = G_UserData.getActivityOpenServerFund().isGroupBuy(cfg.group);
            if (!hasBuyGroup) {
                return false;
            }
            return G_UserData.getBase().getLevel() >= cfg.fund_value && G_UserData.getVip().getLevel() >= vip;
        } else if (cfg.fund_type == ActivityOpenServerFundConst.FUND_TYPE_SERVER_REWARD) {
            let num = G_UserData.getActivityOpenServerFund().getFundNum();
            return num >= cfg.fund_value;
        }
        return false;
    }
    public initData (id, hasReceive) {
        this.setId(id);
        let ActFund = G_ConfigLoader.getConfig(ConfigNameConst.ACT_FUND);
        let info = ActFund.get(id);
        console.assert(info, 'act_fund not find id ' + String(id));
        this.setConfig(info);
        this.setHasReceive(hasReceive);
    }
}
export interface ActivityOpenServerFundData {
getFundNum(): number
setFundNum(value: number): void
getLastFundNum(): number
getGroup(): Object
setGroup(value: Object): void
getLastGroup(): Object
getBaseActivityData(): ActivityBaseData
setBaseActivityData(value: ActivityBaseData): void
getLastBaseActivityData(): ActivityBaseData
}
export class ActivityOpenServerFundData extends BaseData {
    public static schema = schema

        public _unitDataMap;
        public _s2cGetActFundListener: Slot;
        public _s2cActFundListener: Slot;
        public _signalServerRecordChange: Slot;
        public _signalRecvRoleInfo: Slot;
    constructor (properties?) {
        super(properties);
        this.setResetType(TimeExpiredData.RESET_TYPE_NONE);
        let activityBaseData = new ActivityBaseData();
        activityBaseData.initData({ id: ActivityConst.ACT_ID_OPEN_SERVER_FUND });
        this.setBaseActivityData(activityBaseData);
        this._unitDataMap = this._createAllUnitData();
        this._s2cGetActFundListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetActFund, this._s2cGetActFund.bind(this));
        this._s2cActFundListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ActFund, this._s2cActFund.bind(this));
        this._signalServerRecordChange = G_SignalManager.add(SignalConst.EVENT_SERVER_RECORD_CHANGE, this._onServerRecordChange.bind(this));
        this._signalRecvRoleInfo = G_SignalManager.add(SignalConst.EVENT_RECV_ROLE_INFO, this._onEventRecvRoleInfo.bind(this));
    }
    public clear () {
        super.clear();
        this._s2cGetActFundListener.remove();
        this._s2cGetActFundListener = null;
        this._s2cActFundListener.remove();
        this._s2cActFundListener = null;
        this._signalServerRecordChange.remove();
        this._signalServerRecordChange = null;
        this._signalRecvRoleInfo.remove();
        this._signalRecvRoleInfo = null;
        this.getBaseActivityData().clear();
    }
    public reset () {
        super.reset();
        this.getBaseActivityData().reset();
        this._resetAllUnitData();
    }
    public _resetAllUnitData () {
        for (let fundType in this._unitDataMap) {
            let unitDataList = this._unitDataMap[fundType];
            for (let fundId in unitDataList) {
                let unitData = unitDataList[fundId];
                unitData.reset();
            }
        }
    }
    public _createAllUnitData () {
        let unitDataList = {};
        let ActFund = G_ConfigLoader.getConfig(ConfigNameConst.ACT_FUND);
        for (let i = 0; i < ActFund.length(); i += 1) {
            let cfg = ActFund.indexOf(i);
            unitDataList[cfg.fund_type] = unitDataList[cfg.fund_type] || {};
            let fundUnitData = new ActivityOpenServerFundUnitData();
            fundUnitData.initData(cfg.id, false);
            unitDataList[cfg.fund_type][cfg.id] = fundUnitData;
        }
        return unitDataList;
    }
    public getUnitDataById (id) {
        let ActFund = G_ConfigLoader.getConfig(ConfigNameConst.ACT_FUND);
        let info = ActFund.get(id);
        console.assert(info, 'act_fund not find id ' + String(id));
        let unitDataList = this._unitDataMap[info.fund_type];
        if (!unitDataList) {
            return null;
        }
        return unitDataList[id];
    }
    public getUnitDataListByFundType (fundType, currGroup, needSort?) {
        if (ActivityOpenServerFundConst.FUND_TYPE_GROW == fundType) {
            currGroup = currGroup || this.getCurrGroup();
        } else {
            currGroup = 0;
        }
        needSort = needSort || true;
        let resultDataList = [];
        let unitDataList = this._unitDataMap[fundType];
        if (!unitDataList) {
            return resultDataList;
        }
        for (let k in unitDataList) {
            let v = unitDataList[k];
            let config = v.getConfig();
            if (config.group == currGroup) {
                resultDataList.push(v);
            }
        }
        function sortFund(obj1, obj2) {
            let receive01 = obj1.isHasReceive();
            let receive02 = obj2.isHasReceive();
            if (receive01 != receive02) {
                return receive01 ? 1 : -1;
            }
            return obj1.getId() - obj2.getId();
        }
        if (needSort) {
            resultDataList.sort(sortFund);
        }
        return resultDataList;
    }
    public _createGroupUnitData (groupId) {
        let group = this.getGroup();
        group['k_' + String(groupId)] = groupId;
    }
    public isGroupBuy (groupId) {
        let group = this.getGroup();
        return group['k_' + String(groupId)] != null;
    }
    public _s2cGetActFund (id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.getBaseActivityData().setHasData(true);
        this.resetTime();
        this._resetAllUnitData();
        this.setGroup({});
        let group = message['group'] || {};
        for (let k in group) {
            let v = group[k];
            this._createGroupUnitData(v);
        }
        this.setFundNum(message.fund_num);
        let ids = message['ids'] || {};
        for (let k in ids) {
            let id = ids[k];
            let unitData = this.getUnitDataById(id);
            if (unitData) {
                unitData.setHasReceive(true);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_FUND_OPEN_SERVER_GET_INFO, id, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_OPEN_SERVER_FUND });
    }
    public _s2cActFund (id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let fundId = message.id;
        let unitData = this.getUnitDataById(fundId);
        if (unitData) {
            unitData.setHasReceive(true);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_FUND_OPEN_SERVER_GET_REWARD, id, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_OPEN_SERVER_FUND });
    }
    public _onServerRecordChange () {
        let num = G_UserData.getServerRecord().getRecordById(ServerRecordConst.KEY_OPEN_SERVER_FUND_TOTAL_PLAYER_NUM);
        this.setFundNum(num);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_OPEN_SERVER_FUND });
    }
    public _onEventRecvRoleInfo (event) {
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_OPEN_SERVER_FUND });
    }
    public c2sGetActFund () {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetActFund, {});
    }
    public c2sActFund (id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActFund, { id: id });
    }
    public pullData () {
        this.c2sGetActFund();
    }
    public getGrowFundNeedVipLevel () {
        let baseActData = this.getBaseActivityData();
        return baseActData.getActivityParameter(1) || 0;
    }
    public isVipEnoughForGrowFund () {
        return true;
    }
    public hasRedPoint () {
        return this.hasRewardCanReceiveByFundType(ActivityOpenServerFundConst.FUND_TYPE_GROW) || this.hasRewardCanReceiveByFundType(ActivityOpenServerFundConst.FUND_TYPE_SERVER_REWARD);
    }
    public hasRedPointByFundGroup (group) {
        return this.hasRewardCanReceiveByFundType(ActivityOpenServerFundConst.FUND_TYPE_GROW, group) || this.hasRewardCanReceiveByFundType(ActivityOpenServerFundConst.FUND_TYPE_SERVER_REWARD, group);
    }
    public _hasVipRedPoint () {
        let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_WELFARE, {
            actId: ActivityConst.ACT_ID_OPEN_SERVER_FUND,
            '0': 'vipHint'
        });
        if (showed) {
            return false;
        }
        return !this.isVipEnoughForGrowFund();
    }
    public hasRewardCanReceiveByFundType (fund_type, group?) {
        let unitDataList = this.getUnitDataListByFundType(fund_type, group);
        for (let k in unitDataList) {
            let actOpenServerFundUnitData = unitDataList[k];
            let isCanReceive = actOpenServerFundUnitData.canReceive();
            let isReceive = actOpenServerFundUnitData.isHasReceive();
            if (!isReceive && isCanReceive) {
                return true;
            }
        }
        return false;
    }
    public c2sBuyFund (group) {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        group = group || this.getCurrGroup();
        let groupInfo = this.getGroupInfo(group);
        G_GameAgent.pay(groupInfo.payCfg.id, groupInfo.payCfg.rmb, groupInfo.payCfg.product_id, groupInfo.payCfg.name, groupInfo.payCfg.name);
    }
    public getMaxGroup () {
        let maxGroup = 0;
        let level = G_UserData.getBase().getLevel();
        let ActFundGroup = G_ConfigLoader.getConfig(ConfigNameConst.ACT_FUND_GROUP);
        for (let k = 0; k < ActFundGroup.length(); k += 1) {
            let config = ActFundGroup.indexOf(k);
            if (level >= config.show_level) {
                maxGroup = Math.max(maxGroup, config.group_id);
            }
        }
        return maxGroup;
    }
    public getCurrGroup () {
        let groupIds = this.getGroup();
        let buyGroup = 0;
        for (let k in groupIds) {
            let v = groupIds[k];
            buyGroup = Math.max(buyGroup, v);
        }
        if (buyGroup <= 0) {
            return 1;
        }
        let hasRewardNotComplete = false;
        let unitDataList = this.getUnitDataListByFundType(ActivityOpenServerFundConst.FUND_TYPE_GROW, buyGroup, false);
        for (let k in unitDataList) {
            let actOpenServerFundUnitData = unitDataList[k];
            let isCanReceive = actOpenServerFundUnitData.canReceive();
            let isReceive = actOpenServerFundUnitData.isHasReceive();
            if (!isReceive) {
                hasRewardNotComplete = true;
                break;
            }
        }
        if (hasRewardNotComplete) {
            return buyGroup;
        }
        let maxGroup = this.getMaxGroup();
        return Math.min(buyGroup + 1, maxGroup);
    }
    public isHasBuyCurrFund (group) {
        let currGroup = group || this.getCurrGroup();
        return this.isGroupBuy(currGroup);
    }
    public getGroupInfo (group) {
        let ActFundGroup = G_ConfigLoader.getConfig(ConfigNameConst.ACT_FUND_GROUP);
        let config = ActFundGroup.get(group);
        console.assert(config, 'act_fund_group not find id ' + String(group));
        let payId = config.good_id;
        let VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
        let payCfg = VipPay.get(payId);
        console.assert(payCfg, 'vip_pay not find id ' + String(payId));
        return {
            group: group,
            payCfg: payCfg,
            config: config
        };
    }
}