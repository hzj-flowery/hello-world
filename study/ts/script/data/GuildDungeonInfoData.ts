import { BaseData } from "./BaseData";
import { BattleUserData } from "./BattleUserData";

export interface GuildDungeonInfoData {
    getRank(): number
    setRank(value: number): void
    getLastRank(): number
}
let schema = {};
schema['rank'] = [
    'number',
    0
];
export class GuildDungeonInfoData extends BaseData {

    _dungeon;
    public static schema = schema;

    constructor() {
        super();
        this._dungeon = null;
    }
    public clear() {
    }
    public reset() {
        this._dungeon = null;
    }
    public initData(message) {
        this.setProperties(message);
        let battleUserData = new BattleUserData();
        battleUserData.updateData(message.dungeon);
        this._dungeon = battleUserData;
    }
    public getDungeon() {
        return this._dungeon;
    }
}
