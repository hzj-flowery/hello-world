import { BaseData } from "./BaseData";

export interface GuildUserData {
    getLeave_time(): number
    setLeave_time(value: number): void
    getLastLeave_time(): number
    getGuild_id(): number
    setGuild_id(value: number): void
    getLastGuild_id(): number
    getFinish_help_cnt(): number
    setFinish_help_cnt(value: number): void
    getLastFinish_help_cnt(): number
    getGet_help_reward(): number
    setGet_help_reward(value: number): void
    getLastGet_help_reward(): number
    getAsk_help_cnt(): number
    setAsk_help_cnt(value: number): void
    getLastAsk_help_cnt(): number
    getDungeon_cnt(): number
    setDungeon_cnt(value: number): void
    getLastDungeon_cnt(): number
    getDungeon_atk_time(): number
    setDungeon_atk_time(value: number): void
    getLastDungeon_atk_time(): number
    getSource_reward(): number
    setSource_reward(value: number): void
    getLastSource_reward(): number
    getAsk_help_time(): number
    setAsk_help_time(value: number): void
    getLastAsk_help_time(): number
    getAsk_help_buy(): number
    setAsk_help_buy(value: number): void
    getLastAsk_help_buy(): number
    getAsk_help_cd_sec(): number
    setAsk_help_cd_sec(value: number): void
    getLastAsk_help_cd_sec(): number
    getReceivedBoxIndexList(): Object
    setReceivedBoxIndexList(value: Object): void
    getLastReceivedBoxIndexList(): Object
    getTaskDataList(): Object
    setTaskDataList(value: Object): void
    getLastTaskDataList(): Object
    getDonate(): number
    setDonate(value: number): void
    getLastDonate(): number
    getDonate_reward(): Object
    setDonate_reward(value: Object): void
    getLastDonate_reward(): Object
    getGet_red_bag_cnt(): number
    setGet_red_bag_cnt(value: number): void
    getLastGet_red_bag_cnt(): number
    getCreate_guild_cnt(): number
    setCreate_guild_cnt(value: number): void
    getLastCreate_guild_cnt(): number
}
let schema = {};
schema['leave_time'] = [
    'number',
    0
];
schema['guild_id'] = [
    'number',
    0
];
schema['finish_help_cnt'] = [
    'number',
    0
];
schema['get_help_reward'] = [
    'number',
    0
];
schema['ask_help_cnt'] = [
    'number',
    0
];
schema['dungeon_cnt'] = [
    'number',
    0
];
schema['dungeon_atk_time'] = [
    'number',
    0
];
schema['source_reward'] = [
    'number',
    0
];
schema['ask_help_time'] = [
    'number',
    0
];
schema['ask_help_buy'] = [
    'number',
    0
];
schema['ask_help_cd_sec'] = [
    'number',
    0
];
schema['receivedBoxIndexList'] = [
    'object',
    {}
];
schema['taskDataList'] = [
    'object',
    {}
];
schema['donate'] = [
    'number',
    0
];
schema['donate_reward'] = [
    'object',
    {}
];
schema['get_red_bag_cnt'] = [
    'number',
    0
];
schema['create_guild_cnt'] = [
    'number',
    0
];
export class GuildUserData extends BaseData {

    public static schema = schema;

    constructor(properties?) {
        super(properties);
        super(properties)
        this._updateData(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public _updateData(message) {
        let totalExpReward = message['total_exp_reward'] || {};
        let receivedBoxIndexList = {};
        for (let k in totalExpReward) {
            let v = totalExpReward[k];
            receivedBoxIndexList[v] = true;
        }
        let taskDataList = {};
        let partCount = message['part_count'] || {};
        for (let k in partCount) {
            let v = partCount[k];
            taskDataList[v.Key] = v.Value;
        }
        let donateRewardList = {};
        for (let k in message['donate_reward'] || {}) {
            let v = (message['donate_reward'] || {})[k];
            donateRewardList[v] = true;
        }
        this.setReceivedBoxIndexList(receivedBoxIndexList);
        this.setTaskDataList(taskDataList);
        this.setDonate_reward(donateRewardList);
    }
    public isBoxReceived(boxId) {
        let boxIdList = this.getReceivedBoxIndexList();
        return boxIdList[boxId];
    }
    public setBoxReceived(boxId) {
        let boxIdList = this.getReceivedBoxIndexList();
        boxIdList[boxId] = true;
    }
    public isContributionBoxReceived(boxId) {
        let boxIdList = this.getDonate_reward();
        return boxIdList[boxId];
    }
    public setContributionBoxReceived(boxId) {
        let boxIdList = this.getDonate_reward();
        boxIdList[boxId] = true;
    }
    public addContributionCount(count) {
    }
}
