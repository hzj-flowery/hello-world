import { BaseData } from "./BaseData";
import { CustomActivityConst } from "../const/CustomActivityConst";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { Lang } from "../lang/Lang";
import { G_ConfigLoader, G_UserData } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { FunctionConst } from "../const/FunctionConst";

export interface CustomActivityTaskUnitData {
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
export class CustomActivityTaskUnitData extends BaseData {
    public static schema = schema;

        _consumeItems;
        _rewardItems;
        _selectRewardItems;
    constructor(properties?) {
        super(properties);
        this._consumeItems = {};
        this._rewardItems = {};
        this._selectRewardItems = {};
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
        // cc.warn('---------------------- xxx');
        // cc.log(this._rewardItems);
        // cc.warn('---------------------- xxx2');
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
    public getTaskType() {
        return this.getQuest_type();
    }
    public getId() {
        return this.getQuest_id();
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
    public getTaskMaxValue() {
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
    public getTaskValue(actTaskData) {
        actTaskData = actTaskData || this.getUserTaskData();
        if (!actTaskData) {
            return 0;
        }
        let questType = this.getQuest_type();
        if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE) {
            return actTaskData.getProgressValue() - actTaskData.getAward_times();
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE) {
            return 0;
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM) {
            return actTaskData.getProgressValue() - actTaskData.getAward_times();
        }
        return actTaskData.getProgressValue();
    }
    public isHasAllServerTimesLimit() {
        let limit = this.getServer_limit();
        let currTimes = this.getServer_times();
        if (limit > 0 && currTimes >= limit) {
            return true;
        }
        return false;
    }
    public isHasTimesLimit(userTaskData) {
        if (!userTaskData) {
            return false;
        }
        let limit = this.getAwardLimit();
        let currTimes = userTaskData.getAward_times();
        if (limit > 0 && currTimes >= limit) {
            return true;
        }
        return false;
    }
    public isHasTaskReceiveLimit(actTaskData) {
        if (this.isHasAllServerTimesLimit()) {
            return true;
        }
        if (this.isHasTimesLimit(actTaskData)) {
            return true;
        }
        return false;
    }
    public isTaskHasReceive(actTaskData) {
        if (this.isHasTimesLimit(actTaskData)) {
            return true;
        }
        return false;
    }
    public isTaskReachReceiveCondition(actTaskData) {
        if (!actTaskData) {
            return false;
        }
        let taskMaxValue = this.getTaskMaxValue();
        if (this.getTaskValue(actTaskData) >= taskMaxValue) {
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
                    name: good.name,
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
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE) {
            condition = taskDes;
        } else {
            condition = this.getTaskMaxValue() > 0 && Lang.getTxt(taskDes, { num: this.getTaskMaxValue() }) || '';
        }
        return condition;
    }
    public getProgressTitle() {
        let questType = this.getQuest_type();
        if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE) {
            return Lang.get('customactivity_text_left');
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE) {
            return Lang.get('customactivity_text_left');
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM) {
            return Lang.get('customactivity_text_left_times');
        }
        else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE) {
            return Lang.get('customactivity_text_buy_left_times');
        }
        return Lang.get('customactivity_text_progress');
    }
    public getButtonTxt() {
        var buttonId = this.getButtonId();
        var actType = this.getActType();
        var questType = this.getQuest_type();
        var btnName = null;
        if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL) {
            if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE) {
                var consumeItem = this._consumeItems[1];
                var num = consumeItem.size || 0;
                btnName = num;
            } else {
                btnName = Lang.get('customactivity_btn_name_exchange');
            }
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM) {
            let payId = this.getParam2();
            let VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
            let payCfg = VipPay.get(payId);
            console.assert(payCfg, 'vip_pay not find id ' + String(payId));
            btnName = Lang.get('customactivity_btn_name_pay', { value: payCfg.rmb });
        } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY) {
            if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_GIFT) {
                btnName = Lang.get('customactivity_btn_name_receive');
            } else {
                btnName = Lang.get('customactivity_btn_name_recharge');
            }
        } else {
            btnName = Lang.get('customactivity_btn_name_arr')[buttonId + 1];
        }
        return btnName || Lang.get('customactivity_btn_name_receive');
    }
    public getFunctionId() {
        let buttonId = this.getButtonId();
        if (buttonId == CustomActivityConst.ACT_BUTTON_TYPE_RECEIVE_GRAY) {
            return 0;
        } else if (buttonId == CustomActivityConst.ACT_BUTTON_TYPE_GO_RECHARGE) {
            return FunctionConst.FUNC_RECHARGE;
        }
        return 0;
    }
    public getProgressValue() {
        let questType = this.getQuest_type();
        let actTaskData = this.getUserTaskData();
        let value01 = this.getTaskValue(actTaskData);
        let value02 = this.getTaskMaxValue();
        let onlyShowMax = false;
        let awardTimes = actTaskData && actTaskData.getAward_times() || 0;
        if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE || questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM) {
            var value = actTaskData && actTaskData.getProgressValue() || 0;
            cc.warn('------------------' + value);
            cc.warn('------------------' + this.getAwardLimit());
            cc.warn('------------------' + awardTimes);
            value01 = this.getAwardLimit() - awardTimes;
            value02 = this.getAwardLimit();
            onlyShowMax = false;
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE || questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE) {
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
    public getUserTaskData() {
        return G_UserData.getCustomActivity().getActTaskDataById(this.getAct_id(), this.getQuest_id());
    }
    public getActivityUnitData() {
        return G_UserData.getCustomActivity().getActUnitDataById(this.getAct_id());
    }
    public getActType() {
        let activityData = this.getActivityUnitData();
        if (!activityData) {
            return 0;
        }
        return activityData.getAct_type();
    }
    public getButtonId() {
        let activityData = this.getActivityUnitData();
        if (!activityData) {
            return 0;
        }
        return activityData.getButton_id();
    }
}
