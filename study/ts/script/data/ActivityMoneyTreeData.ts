import { BaseData } from './BaseData';
import { ActivityBaseData } from './ActivityBaseData';
import { G_ConfigLoader, G_UserData, G_NetworkManager, G_SignalManager } from '../init';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { UserDataHelper } from '../utils/data/UserDataHelper';
import { clone } from '../utils/GlobleFunc';
import { Slot } from '../utils/event/Slot';
import { MessageIDConst } from '../const/MessageIDConst';
import { ActivityConst } from '../const/ActivityConst';
import { SignalConst } from '../const/SignalConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import CommonConst from '../const/CommonConst';
import { FunctionConst } from '../const/FunctionConst';
let BOX_REWARD_NUM = 2;
let boxschema = {};
boxschema['config'] = [
    'object',
    {}
];
boxschema['id'] = [
    'number',
    0
];
boxschema['received'] = [
    'boolean',
    false
];
let schema = {};
schema['baseActivityData'] = [
    'object',
    {}
];
schema['num'] = [
    'number',
    0
];
schema['free_num'] = [
    'number',
    0
];
export interface ActivityMoneyTreeBoxData {
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
    getId(): number
    setId(value: number): void
    getLastId(): number
    isReceived(): boolean
    setReceived(value: boolean): void
    isLastReceived(): boolean
}
export class ActivityMoneyTreeBoxData extends BaseData {
    public static schema = boxschema;
    public _fixRewardList;

    constructor(properties?) {
        super(properties);
        super(properties)
        this._fixRewardList = {};
    }
    public clear() {
    }
    public reset() {
    }
    public initData(id, isReceived) {
        this.setId(id);
        let ActSilverBox = G_ConfigLoader.getConfig(ConfigNameConst.ACT_SILVER_BOX);
        let cfg = ActSilverBox.get(id);
        console.assert(cfg, 'act_silver_box not find id ' + String(id));
        this.setConfig(cfg);
        this.setReceived(isReceived);
        this._fixRewardList = UserDataHelper.makeRewards(cfg, BOX_REWARD_NUM);
    }
    public getRewards() {
        let rewardList = [];
        let level = G_UserData.getBase().getLevel();
        let roleData = G_ConfigLoader.getConfig(ConfigNameConst.ROLE).get(level);
        console.assert(roleData, 'role not find id ' + String(level));
        let config = this.getConfig();
        let reward = {
            type: config.type,
            value: config.value,
            size: config.size
        };
        reward.size = Math.floor(reward.size * roleData.silver_para / 1000);
        rewardList = clone(this._fixRewardList);
        rewardList.unshift(reward);
        return rewardList;
    }
}
export interface ActivityMoneyTreeData {
    getBaseActivityData(): ActivityBaseData
    setBaseActivityData(value: ActivityBaseData): void
    getLastBaseActivityData(): ActivityBaseData
    getNum(): number
    setNum(value: number): void
    getLastNum(): number
    getFree_num(): number
    setFree_num(value: number): void
    getLastFree_num(): number
}
export class ActivityMoneyTreeData extends BaseData {

    public static schema =schema;
    public _boxDatas;
    public _s2cGetActMoneyTreeListener: Slot;
    public _s2cActMoneyTreeListener: Slot;
    public _s2cActMoneyTreeBoxListener: Slot;

    constructor(properties?) {
        super(properties);
        super(properties)
        this._boxDatas = this._createBoxDataFromCfg();
        this._s2cGetActMoneyTreeListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetActMoneyTree, this._s2cGetActMoneyTree.bind(this));
        this._s2cActMoneyTreeListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ActMoneyTree, this._s2cActMoneyTree.bind(this));
        this._s2cActMoneyTreeBoxListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ActMoneyTreeBox, this._s2cActMoneyTreeBox.bind(this));
        let activityBaseData = new ActivityBaseData();
        activityBaseData.initData({ id: ActivityConst.ACT_ID_MONEY_TREE });
        this.setBaseActivityData(activityBaseData);
    }
    public clear() {
        super.clear();
        this._s2cGetActMoneyTreeListener.remove();
        this._s2cGetActMoneyTreeListener = null;
        this._s2cActMoneyTreeListener.remove();
        this._s2cActMoneyTreeListener = null;
        this._s2cActMoneyTreeBoxListener.remove();
        this._s2cActMoneyTreeBoxListener = null;
        this.getBaseActivityData().clear();
    }
    public reset() {
        super.reset();
        this.getBaseActivityData().reset();
        this._boxDatas = this._createBoxDataFromCfg();
    }
    public _createBoxDataFromCfg() {
        let boxDatas = {};
        let ActSilverBox = G_ConfigLoader.getConfig(ConfigNameConst.ACT_SILVER_BOX);
        let length = ActSilverBox.length();
        for (let i = 0; i < length; i += 1) {
            let cfg = ActSilverBox.indexOf(i);
            let boxData = new ActivityMoneyTreeBoxData();
            boxData.initData(cfg.id, false);
            boxDatas[cfg.id] = boxData;
        }
        return boxDatas;
    }
    public getRoleParam() {
        let userLevel = G_UserData.getBase().getLevel();
        let roleInfo = G_ConfigLoader.getConfig(ConfigNameConst.ROLE).get(userLevel);
        console.assert(roleInfo, 'role config can not find level = %d');
        return roleInfo.silver_para;
    }
    public getMoneyTreeBoxDataById(id) {
        return this._boxDatas[id];
    }
    public getAllMoneyTreeBoxDatas() {
        return this._boxDatas;
    }
    public getMaxBox() {
        return this._boxDatas[this._boxDatas.length];
    }
    public getMaxCount() {
        return this.getBaseActivityData().getActivityParameter(1);
    }
    public _s2cGetActMoneyTree(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setNum(message['num'] || 0);
        this.setFree_num(message['free_num'] || 0);
        let boxIds = message['box_ids'] || {};
        for (let k in boxIds) {
            let v = boxIds[k];
            let boxData = this.getMoneyTreeBoxDataById(v);
            if (boxData) {
                boxData.setReceived(true);
            }
        }
        this.getBaseActivityData().setHasData(true);
        this.resetTime();
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_MONEY_TREE_GET_INFO, id, message);
    }
    public _s2cActMoneyTree(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setNum(message['num'] || 0);
        this.setFree_num(message['free_num'] || 0);
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_MONEY_TREE_SHAKE, id, message);
    }
    public _s2cActMoneyTreeBox(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let boxData = this.getMoneyTreeBoxDataById(message.id);
        boxData.setReceived(true);
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_MONEY_TREE_OPEN_BOX, id, message);
    }
    public isBoxHasReceived(id) {
        let boxData = this.getMoneyTreeBoxDataById(id);
        if (!boxData) {
            return false;
        }
        return boxData.isReceived();
    }
    public isBoxCanReceived(id) {
        let boxData = this.getMoneyTreeBoxDataById(id);
        if (!boxData) {
            return CommonConst.BOX_STATUS_NOT_GET;
        }
        if (boxData.isReceived()) {
            return CommonConst.BOX_STATUS_ALREADY_GET;
        }
        if (boxData.getConfig().count <= this.getNum()) {
            return CommonConst.BOX_STATUS_CAN_GET;
        } else {
            return CommonConst.BOX_STATUS_NOT_GET;
        }
    }
    public c2sActMoneyTree(type) {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActMoneyTree, { op_type: type });
    }
    public c2sGetActMoneyTree() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetActMoneyTree, {});
    }
    public c2sActMoneyTreeBox(id) {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActMoneyTreeBox, { id: id });
    }
    public pullData() {
        this.c2sGetActMoneyTree();
    }
    public resetData() {
        this.pullData();
        this.setNotExpire();
    }
    public getActSilverCfgByTime(time) {
        if (time < 0) {
            return null;
        }

        let act_silver = G_ConfigLoader.getConfig(ConfigNameConst.ACT_SILVER);
        if (time >= act_silver.length()) {
            time = act_silver.length() - 1;
        }
        let cfg = act_silver.get(time);
        console.assert(cfg, 'act_silver not find count ' + String(time));
        return cfg;
    }
    public canShake() {
        return true;
    }
    public getShake10TimesCost() {
        let time = this.getNum();
        let cfg = this.getActSilverCfgByTime(time + 1);
        return cfg.cost * 10;
    }
    public getShakeOnceCost() {
        let times = this.getNum();
        let freeTimes = this.getFree_num();
        let totalFreeTimes = this.getFreeCount();
        let cost = 0;
        if (freeTimes >= totalFreeTimes) {
            cost = this.getActSilverCfgByTime(times + 1).cost;
        }
        return cost;
    }
    public hasRedPoint() {
        let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_MONEY_TREE });
        if (showed) {
            return false;
        }
        return true;
    }
    public getFreeCount() {
        let act_admin = G_ConfigLoader.getConfig(ConfigNameConst.ACT_ADMIN);
        let freeCount = act_admin.get(6).value_2;
        return freeCount;
    }
}
ActivityMoneyTreeData;