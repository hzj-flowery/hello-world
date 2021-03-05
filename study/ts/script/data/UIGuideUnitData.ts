import { BaseData } from "./BaseData";
import { G_UserData } from "../init";

export interface UIGuideUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];
export class UIGuideUnitData extends BaseData {

    public static schema = schema;
    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public initData(cfg) {
        this.setId(cfg.id);
        this.setConfig(cfg);
    }
    public isLevelEnough() {
        let cfg = this.getConfig();
        let level = G_UserData.getBase().getLevel();
        if (level < cfg.level_min && level > cfg.level_max) {
            return false;
        }
        return true;
    }
}
