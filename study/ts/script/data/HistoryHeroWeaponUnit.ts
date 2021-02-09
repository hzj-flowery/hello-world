import { ConfigNameConst } from "../const/ConfigNameConst";
import { G_ConfigLoader } from "../init";
import { BaseData } from "./BaseData";

export interface HistoryHeroWeaponUnit {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getNum(): number
    setNum(value: number): void
    getLastNum(): number
    setConfig(value: Object): void
    getConfig(): any
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['num'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];
export class HistoryHeroWeaponUnit extends BaseData {

    public static schema = schema;
    constructor(properties?) {
        super(properties);
        if (properties) {
            this.initData(properties);
        }
    }
    public clear() {
    }
    public reset() {
    }
    public initData(msg) {
        this.setProperties(msg);
        var config = G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO_EQUIPMENT).get(msg.id);
        this.setConfig(config);
    }
}
