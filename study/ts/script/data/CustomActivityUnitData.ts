import { BaseData } from "./BaseData";
import { G_ServerTime, G_UserData } from "../init";
import { CustomActivityConst } from "../const/CustomActivityConst";
import { Lang } from "../lang/Lang";
import { FunctionConst } from "../const/FunctionConst";

export interface CustomActivityUnitData {
    getAct_id(): number
    setAct_id(value: number): void
    getLastAct_id(): number
    getAct_type(): number
    setAct_type(value: number): void
    getLastAct_type(): number
    getIcon_type(): number
    setIcon_type(value: number): void
    getLastIcon_type(): number
    getIcon_value(): number
    setIcon_value(value: number): void
    getLastIcon_value(): number
    getIcon_type_top_one(): number
    setIcon_type_top_one(value: number): void
    getLastIcon_type_top_one(): number
    getIcon_value_top_one(): number
    setIcon_value_top_one(value: number): void
    getLastIcon_value_top_one(): number
    getIcon_type_top_two(): number
    setIcon_type_top_two(value: number): void
    getLastIcon_type_top_two(): number
    getIcon_value_top_two(): number
    setIcon_value_top_two(value: number): void
    getLastIcon_value_top_two(): number
    getIcon_type_top_three(): number
    setIcon_type_top_three(value: number): void
    getLastIcon_type_top_three(): number
    getIcon_value_top_three(): number
    setIcon_value_top_three(value: number): void
    getLastIcon_value_top_three(): number
    getTitle(): string
    setTitle(value: string): void
    getLastTitle(): string
    getSub_title(): string
    setSub_title(value: string): void
    getLastSub_title(): string
    getDesc(): string
    setDesc(value: string): void
    getLastDesc(): string
    getDetail(): string
    setDetail(value: string): void
    getLastDetail(): string
    getPreview_time(): number
    setPreview_time(value: number): void
    getLastPreview_time(): number
    getStart_time(): number
    setStart_time(value: number): void
    getLastStart_time(): number
    getEnd_time(): number
    setEnd_time(value: number): void
    getLastEnd_time(): number
    getAward_time(): number
    setAward_time(value: number): void
    getLastAward_time(): number
    getButton_id(): number
    setButton_id(value: number): void
    getLastButton_id(): number
    getMin_vip(): number
    setMin_vip(value: number): void
    getLastMin_vip(): number
    getMax_vip(): number
    setMax_vip(value: number): void
    getLastMax_vip(): number
    getMin_level(): number
    setMin_level(value: number): void
    getLastMin_level(): number
    getMax_level(): number
    setMax_level(value: number): void
    getLastMax_level(): number
    getShow_schedule(): number
    setShow_schedule(value: number): void
    getLastShow_schedule(): number
    getBatch(): number
    setBatch(value: number): void
    getLastBatch(): number
    getSort_num(): number
    setSort_num(value: number): void
    getLastSort_num(): number
    isLast_act_visible(): boolean
    setLast_act_visible(value: boolean): void
    isLastLast_act_visible(): boolean
}
let schema = {};
schema['act_id'] = [
    'number',
    0
];
schema['act_type'] = [
    'number',
    0
];
schema['icon_type'] = [
    'number',
    0
];
schema['icon_value'] = [
    'number',
    0
];
schema['icon_type_top_one'] = [
    'number',
    0
];
schema['icon_value_top_one'] = [
    'number',
    0
];
schema['icon_type_top_two'] = [
    'number',
    0
];
schema['icon_value_top_two'] = [
    'number',
    0
];
schema['icon_type_top_three'] = [
    'number',
    0
];
schema['icon_value_top_three'] = [
    'number',
    0
];
schema['title'] = [
    'string',
    ''
];
schema['sub_title'] = [
    'string',
    ''
];
schema['desc'] = [
    'string',
    ''
];
schema['detail'] = [
    'string',
    ''
];
schema['preview_time'] = [
    'number',
    0
];
schema['start_time'] = [
    'number',
    0
];
schema['end_time'] = [
    'number',
    0
];
schema['award_time'] = [
    'number',
    0
];
schema['button_id'] = [
    'number',
    0
];
schema['min_vip'] = [
    'number',
    0
];
schema['max_vip'] = [
    'number',
    0
];
schema['min_level'] = [
    'number',
    0
];
schema['max_level'] = [
    'number',
    0
];
schema['show_schedule'] = [
    'number',
    0
];
schema['batch'] = [
    'number',
    0
];
schema['sort_num'] = [
    'number',
    0
];
schema['last_act_visible'] = [
    'boolean',
    false
];
export class CustomActivityUnitData extends BaseData {
    public static schema = schema

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public initData(data) {
        this.setProperties(data);
    }
    public isInTimeRange(minTime, maxTime) {
        let time = G_ServerTime.getTime();
        return time >= minTime && time < maxTime;
    }
    public isActInRunTime() {
        let time = G_ServerTime.getTime();
        let startTime = this.getStart_time();
        let endTime = this.getEnd_time();
        if (startTime == 0 || endTime == 0 || time < startTime || time > endTime) {
            return false;
        }
        return true;
    }
    public isActInRewardTime() {
        let time = G_ServerTime.getTime();
        let startTime = this.getStart_time();
        let awardTime = this.getAward_time();
        if (startTime == 0 || awardTime == 0 || time < startTime || time > awardTime) {
            return false;
        }
        return true;
    }
    public isActInPreviewTime() {
        return this.isInTimeRange(this.getPreview_time(), this.getStart_time());
    }
    public checkActIsInRunRewardTime() {
        let time = G_ServerTime.getTime();
        let startTime = this.getStart_time();
        let endTime = this.getEnd_time();
        let awardTime = this.getAward_time();
        awardTime = endTime > awardTime && endTime || awardTime;
        if (awardTime > time && startTime <= time) {
            return true;
        } else {
            return false;
        }
    }
    public checkActIsInRunFundsRewardTime(finishTime) {
        let time = G_ServerTime.getTime();
        let startTime = this.getStart_time();
        if (finishTime > time && startTime <= time) {
            return true;
        } else {
            return false;
        }
    }
    public checkActIsUnlock() {
        let userVipLevel = G_UserData.getVip().getLevel();
        let userUserLevel = G_UserData.getBase().getLevel();
        let minVip = this.getMin_vip();
        let maxVip = this.getMax_vip();
        let minLevel = this.getMin_level();
        let maxLevel = this.getMax_level();
        let reachActVipLevel = minVip == 0 || minVip > 0 && userVipLevel >= minVip;
        reachActVipLevel = reachActVipLevel && (maxVip == 0 || maxVip > 0 && userVipLevel <= maxVip);
        let reachActUserLevel = minLevel == 0 || minLevel > 0 && userUserLevel >= minLevel;
        reachActUserLevel = reachActUserLevel && (maxLevel == 0 || maxLevel > 0 && userUserLevel <= maxLevel);
        return reachActVipLevel && reachActUserLevel;
    }
    public checkActIsVisible() {
        let reachActVipLevel = this.checkActIsUnlock();
        if (!reachActVipLevel) {
            return false;
        }
        return this.isActInPreviewTime() || this.checkActIsInRunRewardTime();
    }
    public checkFundsActIsVisible(rewardedFinishTime) {
        let reachActVipLevel = this.checkActIsUnlock();
        if (!reachActVipLevel) {
            return false;
        }
        return this.isActInPreviewTime() || this.checkActIsInRunFundsRewardTime(rewardedFinishTime);
    }
    public isExchangeAct() {
        return this.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL;
    }
    public isAvatarAct() {
        return this.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_AVATAR;
    }
    public isEquipAct() {
        return this.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP;
    }
    public isPetAct() {
        return this.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET;
    }
    public isHorseConquerAct() {
        return this.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER;
    }
    public isVipRecommendGiftAct() {
        return this.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_VIP_RECOMMEND_GIFT;
    }
    public isHorseJudgeAct() {
        return this.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_JUDGE;
    }
    public isFundsJudgeAct() {
        return this.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_FUNDS;
    }
    public getButtonTxt() {
        let buttonId = this.getButton_id();
        let actType = this.getAct_type();
        let btnName = null;
        if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL) {
            btnName = Lang.get('customactivity_btn_name_exchange');
        } else {
            btnName = Lang.get('customactivity_btn_name_arr')[buttonId];
        }
        return btnName || Lang.get('customactivity_btn_name_receive');
    }
    public getFunctionId() {
        let buttonId = this.getButton_id();
        if (buttonId == CustomActivityConst.ACT_BUTTON_TYPE_RECEIVE_GRAY) {
            return 0;
        } else if (buttonId == CustomActivityConst.ACT_BUTTON_TYPE_GO_RECHARGE) {
            return FunctionConst.FUNC_RECHARGE;
        }
        return 0;
    }
    public getTopBarItems() {
        let items = [];
        let item01 = this.getIcon_type_top_one();
        let item02 = this.getIcon_type_top_two();
        let item03 = this.getIcon_type_top_three();
        if (item01 != 0) {
            items.push({
                type: item01,
                value: this.getIcon_value_top_one()
            });
        }
        if (item02 != 0) {
            items.push({
                type: item02,
                value: this.getIcon_value_top_two()
            });
        }
        if (item03 != 0) {
            items.push({
                type: item03,
                value: this.getIcon_value_top_three()
            });
        }
        for (let i = items.length + 1; i <= 4; i += 1) {
            items.unshift({
                type: 0,
                value: 0
            })
        }
        return items;
    }
}
