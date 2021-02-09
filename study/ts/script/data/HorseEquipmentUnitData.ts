import { BaseData } from "./BaseData";
import { HorseEquipDataHelper } from "../utils/data/HorseEquipDataHelper";
export interface HorseEquipmentUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getHorse_id(): number
    setHorse_id(value: number): void
    getLastHorse_id(): number
    getConfig(): Object
    setConfig(value: Object): void
    getLastConfig(): Object
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['base_id'] = [
    'number',
    0
];
schema['horse_id'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];
export class HorseEquipmentUnitData extends BaseData {
    public static schema = schema;
    public updateData(data) {
        this.setProperties(data);
        var config = HorseEquipDataHelper.getHorseEquipConfig(data.base_id);
        this.setConfig(config);
    }
}