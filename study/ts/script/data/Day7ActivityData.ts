import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_ConfigLoader, G_ServerTime, G_UserData, G_ConfigManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import { Day7ActivityTaskData } from "./Day7ActivityTaskData";
import { Day7ActivityDiscountData } from "./Day7ActivityDiscountData";
import { Day7ActivityConst } from "../const/Day7ActivityConst";
import { Day7ActivityTaskUnitData } from "./Day7ActivityTaskUnitData";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { ArraySort } from "../utils/handler";
import { TimeConst } from "../const/TimeConst";
import ParameterIDConst from "../const/ParameterIDConst";
import { TextHelper } from "../utils/TextHelper";
import { FunctionConst } from "../const/FunctionConst";

export interface Day7ActivityData {
    getStart_time(): number
    setStart_time(value: number): void
    getLastStart_time(): number
    getEnd_time(): number
    setEnd_time(value: number): void
    getLastEnd_time(): number
    getReward_time(): number
    setReward_time(value: number): void
    getLastReward_time(): number
    getCurrent_day(): number
    setCurrent_day(value: number): void
    getLastCurrent_day(): number
    isHasData(): boolean
    setHasData(value: boolean): void
    isLastHasData(): boolean
}
let schema = {};
schema['start_time'] = [
    'number',
    0
];
schema['end_time'] = [
    'number',
    0
];
schema['reward_time'] = [
    'number',
    0
];
schema['current_day'] = [
    'number',
    0
];
schema['hasData'] = [
    'boolean',
    false
];
export class Day7ActivityData extends BaseData {
    public static schema = schema;

        _s2cGetSevenDaysDataListener;
        _s2cSevenDaysRewardListener;
        _s2cUpdateSevenDaysInfoListener;
        _s2cSevenDaysShopListener;
        _serverTaskData;
        _serverDiscountShopData;
        _serverActTaskUnitDatas;
        _everydayActTaskUnitDatas;
        _sevenDaysTaskCfgCache;
        _discountShopCfgListCache;
        _tabListCache;

    constructor(properties?) {
        super(properties);
        this._s2cGetSevenDaysDataListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetSevenDaysData, this._s2cGetSevenDaysData.bind(this));
        this._s2cSevenDaysRewardListener = G_NetworkManager.add(MessageIDConst.ID_S2C_SevenDaysReward, this._s2cSevenDaysReward.bind(this));
        this._s2cUpdateSevenDaysInfoListener = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateSevenDaysInfo, this._s2cUpdateSevenDaysInfo.bind(this));
        this._s2cSevenDaysShopListener = G_NetworkManager.add(MessageIDConst.ID_S2C_SevenDaysShop, this._s2cSevenDaysShop.bind(this));
        this._serverTaskData = {};
        this._serverDiscountShopData = {};
        this._serverActTaskUnitDatas = {};
        this._everydayActTaskUnitDatas = {};
        this._sevenDaysTaskCfgCache = {};
        this._discountShopCfgListCache = {};
        this._tabListCache = {};
    }
    public clear() {
        super.clear();
        this._s2cGetSevenDaysDataListener.remove();
        this._s2cGetSevenDaysDataListener = null;
        this._s2cSevenDaysRewardListener.remove();
        this._s2cSevenDaysRewardListener = null;
        this._s2cUpdateSevenDaysInfoListener.remove();
        this._s2cUpdateSevenDaysInfoListener = null;
        this._s2cSevenDaysShopListener.remove();
        this._s2cSevenDaysShopListener = null;
    }
    public reset() {
        super.reset();
        this._serverTaskData = {};
        this._serverDiscountShopData = {};
        this._serverActTaskUnitDatas = {};
        this._everydayActTaskUnitDatas = {};
        this._sevenDaysTaskCfgCache = {};
        this._discountShopCfgListCache = {};
        this._tabListCache = {};
        this.setHasData(false);
    }
    public _s2cGetSevenDaysData(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setHasData(true);
        this.resetTime();
        this.setStart_time(message.start_time);
        this.setEnd_time(message.end_time);
        this.setReward_time(message.reward_time);
        this.setCurrent_day(message.current_day);
        this._serverTaskData = {};
        this._serverDiscountShopData = {};
        this._resetEveryDayActTaskUnitData();
        let tasks = message['tasks'] || {};
        this._setServerTaskData(tasks);
        let shopIds = message['shop_ids'] || {};
        this._setDiscountShopData(shopIds);
        G_SignalManager.dispatch(SignalConst.EVENT_DAY7_ACT_GET_INFO, id, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WEEK_ACTIVITY);
    }
    public _s2cUpdateSevenDaysInfo(id, message) {
        let task = message.task;
        let taskType = task.task_type;
        let actTaskData = this.getActivityTaskDataByTaskType(taskType);
        if (actTaskData) {
            actTaskData.initData(task);
        } else {
            this._createActivityTaskData(task);
        }
        this._resetEveryDayActTaskUnitData();
        G_SignalManager.dispatch(SignalConst.EVENT_DAY7_ACT_UPDATE_PROGRESS, id, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WEEK_ACTIVITY);
    }
    public _s2cSevenDaysReward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._resetEveryDayActTaskUnitData();
        G_SignalManager.dispatch(SignalConst.EVENT_DAY7_ACT_GET_TASK_REWARD, id, message);
    }
    public _s2cSevenDaysShop(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let actDiscountShopData = this.getActivityDiscountShopDataById(message.id);
        if (!actDiscountShopData) {
            this._createDiscountShopData(message.id);
        } else {
            actDiscountShopData.setBuyCount(actDiscountShopData.getBuyCount() + 1);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_DAY7_ACT_GET_BUY_DISCOUNT_SHOP, id, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WEEK_ACTIVITY);
    }
    public _createActivityTaskData(task) {
        let activityTaskData = new Day7ActivityTaskData();
        activityTaskData.initData(task);
        this._serverTaskData[Day7ActivityConst.TASK_PREV + task.task_type] = activityTaskData;
        return activityTaskData;
    }
    public _createDiscountShopData(shopId) {
        let actDiscountShopData = new Day7ActivityDiscountData();
        actDiscountShopData.initData(shopId);
        this._serverDiscountShopData[Day7ActivityConst.SELL_PREV + shopId] = actDiscountShopData;
        return actDiscountShopData;
    }
    public _createActTaskUnitData(taskId) {
        let data = new Day7ActivityTaskUnitData();
        data.initData({ id: taskId });
        this._serverActTaskUnitDatas[taskId] = data;
        return data;
    }
    public _setServerTaskData(tasks) {
        for (let k in tasks) {
            let task = tasks[k];
            this._createActivityTaskData(task);
        }
    }
    public _setDiscountShopData(shopIds) {
        for (let k in shopIds) {
            let shopId = shopIds[k];
            this._createDiscountShopData(shopId);
        }
    }
    public getActivityTaskDataByTaskType(taskType) {
        return this._serverTaskData[Day7ActivityConst.TASK_PREV + taskType];
    }
    public getActivityDiscountShopDataById(shopId) {
        return this._serverDiscountShopData[Day7ActivityConst.SELL_PREV + shopId];
    }
    public getTabListByDay(day) {
        let cacheValue = this._tabListCache['key' + String(day)];
        if (cacheValue) {
            return cacheValue;
        }
        let cfgArr = [];
        let SevenDaysAdmin = G_ConfigLoader.getConfig(ConfigNameConst.SEVEN_DAYS_ADMIN);
        let length = SevenDaysAdmin.length();
        for (let i = 0; i < length; i += 1) {
            let cfg = SevenDaysAdmin.indexOf(i);
            if (cfg.day == day) {
                cfgArr.push(cfg);
            }
        }
        this._tabListCache['key' + String(day)] = cfgArr;
        return cfgArr;
    }
    public getTabData(day, sheet) {
        let SevenDaysAdmin = G_ConfigLoader.getConfig(ConfigNameConst.SEVEN_DAYS_ADMIN);
        let cfg = SevenDaysAdmin.get(day, sheet);
        console.assert(cfg, 'seven_days_admin not find day ' + (day + ('sheet ' + sheet)));
        return cfg;
    }
    public getActUnitDataList(day, sheet) {
        let tabData = this.getTabData(day, sheet);
        if (tabData.type == Day7ActivityConst.TAB_TYPE_TASK) {
            return this._getActTaskUnitDataList(day, sheet);
        } else if (tabData.type == Day7ActivityConst.TAB_TYPE_DISCOUNT) {
            return this._getActDiscountShopCfgList(day, sheet);
        }
        return {};
    }
    public _getActDiscountShopCfgList(day, sheet) {
        let cacheValue = this._discountShopCfgListCache[String(day) + ('_' + String(sheet))];
        if (cacheValue) {
            return cacheValue;
        }
        let cfgArr = [];
        let SevenDaysDiscount = G_ConfigLoader.getConfig(ConfigNameConst.SEVEN_DAYS_DISCOUNT);
        let length = SevenDaysDiscount.length();
        for (let i = 0; i < length; i += 1) {
            let cfg = SevenDaysDiscount.indexOf(i);
            if (cfg.day == day && cfg.sheet == sheet) {
                cfgArr.push(cfg);
            }
        }
        this._discountShopCfgListCache[String(day) + ('_' + String(sheet))] = cfgArr;
        return cfgArr;
    }
    public _sortTaskUnitData(obj1, obj2) {
        let hasReach01 = obj1.isHasReach();
        let hasTaken01 = obj1.isHasReceived();
        let hasReach02 = obj2.isHasReach();
        let hasTaken02 = obj2.isHasReceived();
        if (hasTaken01 != hasTaken02) {
            return !hasTaken01;
        }
        if (hasReach01 != hasReach02) {
            return hasReach01;
        }
        let order1 = obj1.getConfig().order;
        let order2 = obj2.getConfig().order;
        return order1 < order2;
    }
    public _getActTaskUnitDataList(day, sheet) {
        if (!this._everydayActTaskUnitDatas[day]) {
            this._everydayActTaskUnitDatas[day] = {};
        }
        let data = this._everydayActTaskUnitDatas[day][sheet];
        if (data == null) {
            data = this._createActTaskUnitDataList(day, sheet);
            for (let k in data) {
                let v = data[k];
                let canReceive = this.isTaskCanReceived(v.getId());
                let reachCondition = this.isTaskReachReceiveCondition(v.getId());
                let hasReceived = this.isTaskReceivedReward(v.getId());
                v.setHasReach(reachCondition);
                v.setCanTaken(canReceive);
                v.setHasReceived(hasReceived);
            }
            ArraySort(data, this._sortTaskUnitData.bind(this));
        }
        return data;
    }
    public _createActTaskUnitDataList(day, sheet) {
        let datas = [];
        let cfgArr = this._getSevenTaskCfgList(day, sheet);
        for (let k in cfgArr) {
            let cfg = cfgArr[k];
            let data = this.getActTaskUnitDataById(cfg.id);
            datas.push(data);
        }
        if (!this._everydayActTaskUnitDatas[day]) {
            this._everydayActTaskUnitDatas[day] = {};
        }
        this._everydayActTaskUnitDatas[day][sheet] = datas;
        return datas;
    }
    public _getSevenTaskCfgList(day, sheet) {
        let cacheValue = this._sevenDaysTaskCfgCache[String(day) + ('_' + String(sheet))];
        if (cacheValue) {
            return cacheValue;
        }
        let cfgArr = [];
        let SevenDaysTask = G_ConfigLoader.getConfig(ConfigNameConst.SEVEN_DAYS_TASK);
        let length = SevenDaysTask.length();
        for (let i = 1; i <= length; i += 1) {
            let cfg = SevenDaysTask.indexOf(i -1);
            //暂时去掉累计充值相关
            if(cfg.task_type == 2 &&  !G_ConfigManager.checkCanRecharge()){
                continue;
            }
            if (cfg.day == day && cfg.sheet == sheet) {
                cfgArr.push(cfg);
            }
        }
        this._sevenDaysTaskCfgCache[String(day) + ('_' + String(sheet))] = cfgArr;
        return cfgArr;
    }
    public getActTaskUnitDataById(taskId) {
        let data = this._serverActTaskUnitDatas[taskId];
        if (!data) {
            data = this._createActTaskUnitData(taskId);
        }
        return data;
    }
    public _resetEveryDayActTaskUnitData() {
        this._everydayActTaskUnitDatas = {};
    }
    public isTaskReceivedReward(taskId) {
        let actTaskUnitData = this.getActTaskUnitDataById(taskId);
        let actTaskData = this.getActivityTaskDataByTaskType(actTaskUnitData.getTaskType());
        let hasReceive = actTaskUnitData.isTaskHasReceived(actTaskData);
        return hasReceive;
    }
    public isTaskCanReceived(taskId) {
        if (!this.isInActRewardTime()) {
            return false;
        }
        let reachReceiveCondition = this.isTaskReachReceiveCondition(taskId);
        if (!reachReceiveCondition) {
            return false;
        }
        let actTaskUnitData = this.getActTaskUnitDataById(taskId);
        let actTaskData = this.getActivityTaskDataByTaskType(actTaskUnitData.getTaskType());
        if (actTaskData == null) {
            let taskType = actTaskUnitData.getTaskType();
            if (taskType == Day7ActivityConst.TASK_TYPE_LOGIN_REWARD) {
                return true;
            }
        }
        let canReceive = actTaskUnitData.isTaskHasReceiveCount(actTaskData);
        return canReceive;
    }
    public isTaskReachReceiveCondition(taskId) {
        let actTaskUnitData = this.getActTaskUnitDataById(taskId);
        if (!this.isDayCanReceive(actTaskUnitData.getConfig().day)) {
            return false;
        }
        let actTaskData = this.getActivityTaskDataByTaskType(actTaskUnitData.getTaskType());
        let reachCondition = actTaskUnitData.isTaskReachReceiveCondition(actTaskData);
        let taskType = actTaskUnitData.getTaskType();
        if (taskType == Day7ActivityConst.TASK_TYPE_LOGIN_REWARD) {
            reachCondition = true;
        }
        return reachCondition;
    }
    public getTaskValue(actTaskUnitData) {
        let actTaskData = this.getActivityTaskDataByTaskType(actTaskUnitData.getTaskType());
        if (!actTaskData) {
            return 0;
        }
        return actTaskData.getTask_value();
    }
    public isShopDiscountCanBuy(shopId) {
        if (!this.isInActRewardTime()) {
            return false;
        }
        let reachReceiveCondition = this.isShopDiscountReachBuyCondition(shopId);
        if (!reachReceiveCondition) {
            return false;
        }
        let actDiscountShopData = this.getActivityDiscountShopDataById(shopId);
        if (!actDiscountShopData) {
            return true;
        }
        return actDiscountShopData.canBuy();
    }
    public isShopDiscountReachBuyCondition(shopId) {
        if (!this.isInActRewardTime()) {
            return false;
        }
        let SevenDaysDiscount = G_ConfigLoader.getConfig(ConfigNameConst.SEVEN_DAYS_DISCOUNT);
        let cfg = SevenDaysDiscount.get(shopId);
        console.assert(cfg, 'seven_days_discount not find id ' + String(shopId));
        if (!this.isDayCanReceive(cfg.day)) {
            return false;
        }
        return true;
    }
    public isDayCanReceive(day) {
        let currentDay = this.getCurrent_day();
        return day <= currentDay;
    }
    public _todayIsDay(day) {
        return this.getCurrent_day() == day;
    }
    public isInActRunTime() {
        let currentDay = this.getCurrent_day();
        let startDay = this.getStart_time();
        let endDay = this.getEnd_time();
        if (currentDay > 0 && currentDay >= startDay && currentDay <= endDay) {
            return true;
        }
        return false;
    }
    public isInActRewardTime() {
        let currentDay = this.getCurrent_day();
        let startDay = this.getStart_time();
        let rewardDay = this.getReward_time();
        if (currentDay > 0 && currentDay >= startDay && currentDay <= rewardDay) {
            return true;
        }
        return false;
    }
    public getActEndTime() {
        let currentDay = this.getCurrent_day();
        let endDay = this.getEnd_time();
        let diffDay = endDay - currentDay;
        return G_ServerTime.getSomeDayMidNightTimeByDiffDay(diffDay, TimeConst.RESET_TIME);
    }
    public getActRewardEndTime() {
        let currentDay = this.getCurrent_day();
        let rewardDay = this.getReward_time();
        let diffDay = rewardDay - currentDay;
        return G_ServerTime.getSomeDayMidNightTimeByDiffDay(diffDay, TimeConst.RESET_TIME);
    }
    public c2sSevenDaysReward(id, rewardIndex) {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_SevenDaysReward, {
            id: id,
            reward_index: rewardIndex
        });
    }
    public c2sSevenDaysShop(id) {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_SevenDaysShop, { id: id });
    }
    public c2sGetSevenDaysData() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetSevenDaysData, {});
    }
    public pullData() {
        this.c2sGetSevenDaysData();
    }
    public resetData() {
        this.pullData();
        this.setNotExpire();
    }
    public hasRedPoint(params) {
        if (!params) {
            for (let i = 1; i <= Day7ActivityConst.DAY_NUM; i += 1) {
                let red = this._hasRedPointByDay(i);
                if (red) {
                    return true;
                }
            }
            return false;
        } else if (params.day && params.sheet) {
            return this._hasRedPointByDaySheet(params.day, params.sheet);
        } else if (params.day) {
            return this._hasRedPointByDay(params.day);
        }
        return false;
    }
    public _hasRedPointByDay(day) {
        let tabList = this.getTabListByDay(day);
        if (tabList) {
            for (let k in tabList) {
                let v = tabList[k];
                let red = this._hasRedPointByDaySheet(v.day, v.sheet);
                if (red) {
                    return true;
                }
            }
        }
        return false;
    }
    public _hasRedPointByDaySheet(day, sheet) {
        let tabData = this.getTabData(day, sheet);
        if (tabData.type == Day7ActivityConst.TAB_TYPE_TASK) {
            return this._hasRewardNotReceived(day, sheet);
        } else if (tabData.type == Day7ActivityConst.TAB_TYPE_DISCOUNT) {
            return this._hasGoodsNotBuy(day, sheet);
        }
        return false;
    }
    public _hasGoodsNotBuy(day, sheet) {
        let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_WEEK_ACTIVITY, {
            day: day,
            sheet: sheet
        });
        if (showed) {
            return false;
        }
        let goodsList = this.getActUnitDataList(day, sheet);
        for (let k in goodsList) {
            let v = goodsList[k];
            let canBuy = this.isShopDiscountCanBuy(v.id);
            if (canBuy) {
                if (day == 7) {
                    cc.warn('---------_hasGoodsNotBuy');
                }
                return true;
            }
        }
        return false;
    }
    public _hasRewardNotReceived(day, sheet) {
        let actUnitDataList = this.getActUnitDataList(day, sheet);
        for (let k in actUnitDataList) {
            let actTaskUnitData = actUnitDataList[k];
            let canReceive = this.isTaskCanReceived(actTaskUnitData.getId());
            if (canReceive) {
                if (day == 7) {
                    cc.warn('---------canReceive');
                }
                return true;
            }
        }
        return false;
    }
    public getShowHeroIds() {
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        let config = Parameter.get(ParameterIDConst.SEVEN_DAYS_SHOW_HERO);
        console.assert(config, 'parameter can\'t find id:' + String(ParameterIDConst.SEVEN_DAYS_SHOW_HERO));
        let numberArray = TextHelper.splitStringToNumberArr(config.content);
        return numberArray;
    }
}
