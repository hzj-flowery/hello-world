import { BaseData } from "./BaseData";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { GuildTaskUnitData } from "./GuildTaskUnitData";
import { ArraySort } from "../utils/handler";

export interface GuildUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getExp(): number
    setExp(value: number): void
    getLastExp(): number
    getAnnouncement(): string
    setAnnouncement(value: string): void
    getLastAnnouncement(): string
    getDeclaration(): string
    setDeclaration(value: string): void
    getLastDeclaration(): string
    getLeader(): number
    setLeader(value: number): void
    getLastLeader(): number
    getMember_num(): number
    setMember_num(value: number): void
    getLastMember_num(): number
    getDungeon_score(): number
    setDungeon_score(value: number): void
    getLastDungeon_score(): number
    getIcon(): number
    setIcon(value: number): void
    getLastIcon(): number
    getGuild_rank(): number
    setGuild_rank(value: number): void
    getLastGuild_rank(): number
    getCreated(): number
    setCreated(value: number): void
    getLastCreated(): number
    getLeader_name(): string
    setLeader_name(value: string): void
    getLastLeader_name(): string
    isHas_application(): boolean
    setHas_application(value: boolean): void
    isLastHas_application(): boolean
    getImpeach_time(): number
    setImpeach_time(value: number): void
    getLastImpeach_time(): number
    getLeader_base_id(): number
    setLeader_base_id(value: number): void
    getLastLeader_base_id(): number
    getDaily_total_exp(): number
    setDaily_total_exp(value: number): void
    getLastDaily_total_exp(): number
    getActive_days(): number
    setActive_days(value: number): void
    getLastActive_days(): number
    getDonate_point(): number
    setDonate_point(value: number): void
    getLastDonate_point(): number
    getLeader_officer_level(): number
    setLeader_officer_level(value: number): void
    getLastLeader_officer_level(): number
    getLeader_avater_base_id(): number
    setLeader_avater_base_id(value: number): void
    getLastLeader_avater_base_id(): number
    getLeader_player_info(): Object
    setLeader_player_info(value: Object): void
    getLastLeader_player_info(): Object
    getAnswer_time(): number
    setAnswer_time(value: number): void
    getLastAnswer_time(): number
    getAnswer_time_reset_cnt(): number
    setAnswer_time_reset_cnt(value: number): void
    getLastAnswer_time_reset_cnt(): number
    getMine_born_id(): number
    setMine_born_id(value: number): void
    getLastMine_born_id(): number
    getKick_member_cnt(): number
    setKick_member_cnt(value: number): void
    getLastKick_member_cnt(): number
    getWar_declare_time(): number
    setWar_declare_time(value: number): void
    getLastWar_declare_time(): number
    isEntry(): boolean
    setEntry(value: boolean): void
    isLastEntry(): boolean
    getIcon_list();
    setIcon_list(value:any)
    getLast_icon()
    setLast_icon(value:any)
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['name'] = [
    'string',
    ''
];
schema['level'] = [
    'number',
    0
];
schema['exp'] = [
    'number',
    0
];
schema['announcement'] = [
    'string',
    ''
];
schema['declaration'] = [
    'string',
    ''
];
schema['leader'] = [
    'number',
    0
];
schema['member_num'] = [
    'number',
    0
];
schema['dungeon_score'] = [
    'number',
    0
];
schema['icon'] = [
    'number',
    0
];
schema['guild_rank'] = [
    'number',
    0
];
schema['created'] = [
    'number',
    0
];
schema['leader_name'] = [
    'string',
    ''
];
schema['has_application'] = [
    'boolean',
    false
];
schema['impeach_time'] = [
    'number',
    0
];
schema['leader_base_id'] = [
    'number',
    0
];
schema['daily_total_exp'] = [
    'number',
    0
];
schema['active_days'] = [
    'number',
    0
];
schema['donate_point'] = [
    'number',
    0
];
schema['leader_officer_level'] = [
    'number',
    0
];
schema['leader_avater_base_id'] = [
    'number',
    0
];
schema['leader_player_info'] = [
    'object',
    null
];
schema['answer_time'] = [
    'number',
    3
];
schema['answer_time_reset_cnt'] = [
    'number',
    0
];
schema['mine_born_id'] = [
    'number',
    0
];
schema['kick_member_cnt'] = [
    'number',
    0
];
schema['war_declare_time'] = [
    'number',
    0
];
schema['entry'] = [
    'boolean',
    false
];

schema['auto_jion_power'] = [
    'number',
    0
];

schema['auto_jion'] = [
    'boolean',
    false
];

schema['address'] = [
    'string',
    ''
];

schema['address_type'] = [
    'number',
    0
];

schema['icon_list'] = [
    'table',
    {}
];
schema['last_icon'] = [
    'number',
    0
];

export class GuildUnitData extends BaseData {
    public static schema = schema;

    _guildTaskList;
    _myWeekWageItems: any[];
    constructor(properties?) {
        super(properties);
        if (properties) {
            let [covertId, playerInfo] = UserDataHelper.convertAvatarId(properties);
            this.setLeader_player_info(playerInfo);
        }
        this._guildTaskList = {};
        this._myWeekWageItems = [];
    }
    public clear() {
    }
    public reset() {
        this._guildTaskList = {};
    }
    public initTaskData(message) {
        this._createGuildTaskDatas();
        this._updateGuildTaskDatas(message);
        let awardList = message['week_pay'] || [];
        this._myWeekWageItems = [];
        for (let k in awardList) {
            let v = awardList[k];
            this._myWeekWageItems.push({
                type: v.type,
                value: v.value,
                size: v.size
            });
        };
        var data = {};
        var guildIconList = this.getIcon_list();
        for (let k in guildIconList) {
            var v = guildIconList[k];
            var infoArray = v.split(',');
            var id = parseInt(infoArray[0]);
            var time = parseInt(infoArray[1]);
            data[id] = time;
        }
        this.setIcon_list(data);
    }
    public _createGuildTaskDatas() {
        let GuildWagesType = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_WAGES_TYPE);
        this._guildTaskList = {};
        for (let index = 0; index < GuildWagesType.length(); index += 1) {
            let config = GuildWagesType.indexOf(index);
            let data = new GuildTaskUnitData();
            data.initData(config);
            this._guildTaskList[config.type] = data;
        }
    }
    public getGuildTaskUnitData(id) {
        return this._guildTaskList[id];
    }
    public _updateGuildTaskDatas(message) {
        let dailyPartCount = message['daily_part_count'] || {};
        let dailyPartExp = message['daily_part_exp'] || {};
        let weekRewards = message['week_pay'] || {};
        for (let k in dailyPartCount) {
            let v = dailyPartCount[k];
            let unitData = this.getGuildTaskUnitData(v.Key);
            if (unitData) {
                let maxValue = unitData.getConfig().max_active;
                unitData.setPeople(Math.min(maxValue, v.Value));
            }
        }
        for (let k in dailyPartExp) {
            let v = dailyPartExp[k];
            let unitData = this.getGuildTaskUnitData(v.Key);
            if (unitData) {
                unitData.setExp(v.Value);
            }
        }
    }
    public getSortedTaskDataList() {
        let listData = [];
        for (let k in this._guildTaskList) {
            let v = this._guildTaskList[k];
            listData.push(v);
        }
        let sortfunction = function (obj1, obj2) {
            return obj1.getConfig().index < obj2.getConfig().index;
        };
        ArraySort(listData, sortfunction);
        return listData;
    }
    public getWeekWageItems() {
        return this._myWeekWageItems;
    }
    public getTaskDataList() {
        return this._guildTaskList;
    }
}
