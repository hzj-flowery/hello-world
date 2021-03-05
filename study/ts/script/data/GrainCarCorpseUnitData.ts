import { ConfigNameConst } from "../const/ConfigNameConst";
import { G_ConfigLoader } from "../init";
import { assert } from "../utils/GlobleFunc";
import { BaseData } from "./BaseData";

var schema = {};
schema['grain_car_id'] = [
    'number',
    0
];
schema['level'] = [
    'number',
    0
];
schema['guild_id'] = [
    'number',
    0
];
schema['guild_name'] = [
    'string',
    0
];
schema['mine_id'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];

export interface GrainCarCorpseUnitData {
    getGrain_car_id(): number
    setGrain_car_id(data: number): void
    getLevel(): number
    setLevel(data: number): void
    getGuild_id(): number
    setGuild_id(data: number): void
    getGuild_name(): number
    setGuild_name(data: number): void
    getMine_id(): number
    setMine_id(data: number): void
    getConfig(): object
    setConfig(data: object): void
}


export class GrainCarCorpseUnitData extends BaseData {
    public static schema = schema;
    constructor(properties?) {
        super(properties);
    }
    clear() {
    }
    reset() {
    }
    initData(msg) {
        this.setProperties(msg);
        this.setLevel(msg.grain_car_id);
        var config = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR).get(msg.grain_car_id);
        assert(config, 'graincar can\'t find base_id = ' + (msg.grain_car_id));
        this.setConfig(config);
    }
    updateData(data) {
        this.setProperties(data);
        this.setLevel(data.grain_car_id);
        var config = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR).get(data.grain_car_id);
        assert(config, 'graincar can\'t find base_id = ' + (data.grain_car_id));
        this.setConfig(config);
    }
    insertData(data) {
    }
    deleteData(data) {
    }
};