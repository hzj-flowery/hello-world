import { BaseData } from './BaseData';
import { Lang } from '../lang/Lang';
import { G_ConfigLoader, G_UserData } from '../init';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { FunctionConst } from '../const/FunctionConst';
import { LogicCheckHelper } from '../utils/LogicCheckHelper';
import { CustomActivityConst } from '../const/CustomActivityConst';
import { TypeConvertHelper } from '../utils/TypeConvertHelper';
let schema = {};
schema['quest_id'] = [
    'number',
    0
];

schema['act_id'] = [
    'number',
    0
];

schema['quest_type'] = [
    'number',
    0
];

schema['param1'] = [
    'string',
    ''
];

schema['param2'] = [
    'number',
    0
];

schema['param3'] = [
    'number',
    0
];

schema['award_select'] = [
    'number',
    0
];

schema['award_limit'] = [
    'number',
    0
];

schema['server_limit'] = [
    'number',
    0
];

schema['server_times'] = [
    'number',
    0
];

schema['quest_des'] = [
    'string',
    0
];

schema['discout_id'] = [
    'string',
    0
];

schema['sort_num'] = [
    'number',
    0
];

schema['show_limit_type'] = [
    'number',
    0
];

schema['show_limit_value'] = [
    'number',
    0
];

export interface CommonActivityQuestData {
    getQuest_id(): number
    setQuest_id(value: number): void
    getLastQuest_id(): number
    getAct_id(): number
    setAct_id(value: number): void
    getLastAct_id(): number
    getQuest_type(): number
    setQuest_type(value: number): void
    getLastQuest_type(): number
    getParam1(): string
    setParam1(value: string): void
    getLastParam1(): string
    getParam2(): number
    setParam2(value: number): void
    getLastParam2(): number
    getParam3(): number
    setParam3(value: number): void
    getLastParam3(): number
    getAward_select(): number
    setAward_select(value: number): void
    getLastAward_select(): number
    getAward_limit(): number
    setAward_limit(value: number): void
    getLastAward_limit(): number
    getServer_limit(): number
    setServer_limit(value: number): void
    getLastServer_limit(): number
    getServer_times(): number
    setServer_times(value: number): void
    getLastServer_times(): number
    getQuest_des(): string
    setQuest_des(value: string): void
    getLastQuest_des(): string
    getDiscout_id(): string
    setDiscout_id(value: string): void
    getLastDiscout_id(): string
    getSort_num(): number
    setSort_num(value: number): void
    getLastSort_num(): number
    getShow_limit_type(): number
    setShow_limit_type(value: number): void
    getLastShow_limit_type(): number
    getShow_limit_value(): number
    setShow_limit_value(value: number): void
    getLastShow_limit_value(): number
}
export class CommonActivityQuestData extends BaseData {
    public static schema = schema;

    public _consumeItems;
    public _rewardItems;
    public _selectRewardItems;
    public _userDataSource;

    constructor(properties?) {
        super(properties)
        this._consumeItems = {};
        this._rewardItems = {};
        this._selectRewardItems = {};
        this._userDataSource = 0;
    }
    public clear() {
    }
    public reset() {
    }
    public initData(data) {
        this.setProperties(data);
        this._consumeItems = this._makeItems(data, 'consume_', 4);
        this._rewardItems = this._makeItems(data, 'award_', 4);
        this._selectRewardItems = this._makeItems(data, 'select_award_', 8);
    }
    public _makeItems(data, keyName, maxNum) {
        let itemsList = [];
        for (let k = 1; k <= maxNum; k += 1) {
            let type = data[keyName + ('type' + k)];
            if (type && type != 0) {
                let value = data[keyName + ('value' + k)] || 0;
                let size = data[keyName + ('size' + k)] || 0;
                itemsList.push({
                    type: type,
                    value: value,
                    size: size
                });
            }
        }
        return itemsList;
    }
    public isSelectReward() {
        let items = this.getSelectRewardItems();
        return items.length > 0;
    }
    public getDiscountNum() {
        let discount = Number(this.getDiscout_id()) || 0;
        return discount;
    }
    public isDiscountNeedShow(discount) {
        return discount > 0 && discount < 10;
    }
    public getConsumeItems() {
        return this._consumeItems;
    }
    public getRewardItems() {
        return this._rewardItems;
    }
    public getSelectRewardItems() {
        return this._selectRewardItems;
    }
    public getParamOneValue() {
        return Number(this.getParam1()) || 0;
    }
    public getAwardLimit() {
        let limit = this.getAward_limit();
        let questType = this.getQuest_type();
        if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE) {
            limit = this.getParam2();
        }
        return limit;
    }
    public getQuestMaxValue() {
        let value = this.getParamOneValue();
        let questType = this.getQuest_type();
        if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PUSH_ITEM) {
            value = this.getParam3();
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE) {
            return 1;
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE) {
            return 0;
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM) {
            return 1;
        }
        return value;
    }
    public getQuestValue(actUserData) {
        if (!actUserData) {
            return 0;
        }
        let questType = this.getQuest_type();
        if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE) {
            return actUserData.getProgressValue() - actUserData.getAward_times();
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE) {
            return 0;
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM) {
            return actUserData.getProgressValue() - actUserData.getAward_times();
        }
        return actUserData.getProgressValue();
    }
    public checkAllServerTimesLimit() {
        let limit = this.getServer_limit();
        let currTimes = this.getServer_times();
        if (limit > 0 && currTimes >= limit) {
            return true;
        }
        return false;
    }
    public checkTimesLimit(actUserData) {
        if (!actUserData) {
            return false;
        }
        let limit = this.getAwardLimit();
        let currTimes = actUserData.getAward_times();
        if (limit > 0 && currTimes >= limit) {
            return true;
        }
        return false;
    }
    public checkQuestReceiveLimit() {
        if (this.checkAllServerTimesLimit()) {
            return true;
        }
        let actUserData = this.getActUserData();
        if (this.checkTimesLimit(actUserData)) {
            return true;
        }
        return false;
    }
    public isQuestHasReceive() {
        let actUserData = this.getActUserData();
        if (this.checkTimesLimit(actUserData)) {
            return true;
        }
        return false;
    }
    public isQuestReachReceiveCondition() {
        let actUserData = this.getActUserData();
        let taskMaxValue = this.getQuestMaxValue();
        if (this.getQuestValue(actUserData) >= taskMaxValue) {
            return true;
        }
        return false;
    }
    public getDescription() {
        let taskDes = this.getQuest_des();
        let condition = '';
        let questType = this.getQuest_type();
        if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PUSH_ITEM) {
            let good = TypeConvertHelper.convert(this.getParamOneValue(), this.getParam2(), this.getParam3());
            if (good) {
                condition = Lang.getTxt(taskDes, {

                    num: good.size
                });
            }
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_CONSTANT_RECHARGE) {
            condition = Lang.getTxt(taskDes, {
                num1: this.getParam1(),
                num2: this.getParam2()
            });
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE) {
            condition = Lang.getTxt(taskDes, { num: this.getParam1() });
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE) {
            condition = taskDes;
        } else {
            condition = this.getQuestMaxValue() > 0 && Lang.getTxt(taskDes, { num: this.getQuestMaxValue() }) || '';
        }
        return condition;
    }
    public isNeedShowProgress() {
        return true;
    }
    public getProgressTitle() {
        let questType = this.getQuest_type();
        if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE) {
            return Lang.get('customactivity_text_left_times');
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE) {
            return Lang.get('customactivity_text_exchange_left_times');
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM) {
            return Lang.get('customactivity_text_left_times');
        }
        return Lang.get('customactivity_text_progress');
    }
    public getButtonTxt() {
        let buttonId = null;
        let actType = this.getActType();
        let questType = this.getQuest_type();
        let btnName = null;
        if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE) {
            btnName = Lang.get('customactivity_btn_name_exchange');
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE) {
            var consumeItem = this._consumeItems[0];
            var num = consumeItem.size || 0;
            btnName = num;
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM) {
            let payId = this.getParam2();
            let VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
            let payCfg = VipPay.get(payId);
            console.assert(payCfg, 'vip_pay not find id ' + String(payId));
            btnName = Lang.get('customactivity_btn_name_pay', { value: payCfg.rmb });
        } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY) {
            if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_GIFT || questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_TOTAL_CONSUME) {
                btnName = Lang.get('customactivity_btn_name_receive');
            } else {
                btnName = Lang.get('customactivity_btn_name_recharge');
            }
        }
        return btnName || Lang.get('customactivity_btn_name_receive');
    }
    public getProgressValue() {
        let questType = this.getQuest_type();
        let actUserData = this.getActUserData();
        let value01 = this.getQuestValue(actUserData);
        let value02 = this.getQuestMaxValue();
        let onlyShowMax = false;
        let awardTimes = actUserData && actUserData.getAward_times() || 0;
        if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE || questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM) {
            let value = actUserData && actUserData.getProgressValue() || 0;
            value01 = this.getAwardLimit() - awardTimes;
            value02 = this.getAwardLimit();
            onlyShowMax = false;
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE|| questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE) {
            value01 = this.getAwardLimit() - awardTimes;
            value02 = this.getAwardLimit();
            onlyShowMax = false;
        }
        value01 = value01 > value02 && value02 || value01;
        return [
            value01,
            value02,
            onlyShowMax
        ];
    }
    public setUserDataSource(c) {
        this._userDataSource = c;
    }
    public getActUserData() {
        if (this._userDataSource == CustomActivityConst.CUSTOM_QUEST_USER_DATA_SOURCE_CARNIVAL) {
            return G_UserData.getCarnivalActivity().getActUserData(this.getAct_id(), this.getQuest_id());
        }
    }
    public getActivityData() {
        if (this._userDataSource == CustomActivityConst.CUSTOM_QUEST_USER_DATA_SOURCE_CARNIVAL) {
            return G_UserData.getCarnivalActivity().getActivityDataById(this.getAct_id());
        }
    }
    public getQuestNotFinishJumpFunctionID() {
        let questType = this.getQuest_type();
        if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_DAILY_RECHARGE || questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_TOTAL_RECHARGE || questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE || questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_CONSTANT_RECHARGE) {
            return FunctionConst.FUNC_RECHARGE;
        } else {
            return 0;
        }
    }
    public isExchageType() {
        let activityData = this.getActivityData();
        if (!activityData) {
            return false;
        }
        return activityData.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL;
    }
    public getActType() {
        let activityData = this.getActivityData();
        if (!activityData) {
            return null;
        }
        return activityData.getAct_type();
    }
    public isQuestCanReceive() {
        let activityData = this.getActivityData();
        if (!activityData) {
            return false;
        }
        if (!activityData.checkActIsInReceiveTime()) {
            return false;
        }
        if (this.checkQuestReceiveLimit()) {
            return false;
        }
        if (!this.isQuestReachReceiveCondition()) {
            return false;
        }
        return true;
    }
    public checkCanExchange(canPopDialog) {
        let items = this.getConsumeItems();
        let canBuy = true;
        for (let k in items) {
            let v = items[k];
            if (!LogicCheckHelper.enoughValue(v.type, v.value, v.size, canPopDialog)) {
                canBuy = false;
                break;
            }
        }
        return canBuy;
    }
    public isActivityExpired() {
        let actData = this.getActivityData();
        if (!actData) {
            return true;
        }
        return !actData.checkActIsVisible();
    }
    public getId() {
        return this.getQuest_id();
    }
}