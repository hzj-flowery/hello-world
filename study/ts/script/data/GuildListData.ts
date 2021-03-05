import { BaseData } from "./BaseData";
import { GuildUnitData } from "./GuildUnitData";

export interface GuildListData {
    getTotal_cnt(): number
    setTotal_cnt(value: number): void
    getLastTotal_cnt(): number
    getNum(): number
    setNum(value: number): void
    getLastNum(): number
}
let schema = {};
schema['total_cnt'] = [
    'number',
    0
];
schema['num'] = [
    'number',
    0
];
export class GuildListData extends BaseData {
    public static schema = schema;
    public static ITEM_NUM_PER_PAGE = 50;
    _guildList;

    constructor() {
        super();
        this._guildList = {};
    }
    public clear() {
    }
    public reset() {
        this._guildList = {};
    }
    public addNewPage(message) {
        this.setProperties(message);
        let pageNun = message.num;
        let guilds = message['guilds'] || {};
        for (let i = 0; i < guilds.length; i++) {
            let data = guilds[i];
            this._setGuildUnitData((pageNun - 1) * GuildListData.ITEM_NUM_PER_PAGE + i, data);
        }
    }
    public _setGuildUnitData(index, data) {
        this._guildList['k_' + String(index)] = null;
        let unitData = new GuildUnitData(data);
        this._guildList['k_' + String(index)] = unitData;
    }
    public getHasAppliedCount() {
        let count = 0;
        for (let k in this._guildList) {
            let data = this._guildList[k];
            if (data.isHas_application()) {
                count = count + 1;
            }
        }
        return count;
    }
    public getGuildListBySort() {
        return this.getGuildListByPage(this.getTotalPage());
    }
    public getGuildListByPage(pageNum) {
        let result = [];
        for (let index = 0; index <= GuildListData.ITEM_NUM_PER_PAGE * pageNum; index += 1) {
            let unitData = this._guildList['k_' + (index)];
            if (unitData) {
                result.push(unitData);
            }
        }
        return result;
    }
    public getTotalPage() {
        return Math.ceil(this.getTotal_cnt() / GuildListData.ITEM_NUM_PER_PAGE);
    }
}
