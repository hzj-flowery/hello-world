import { BaseData } from "./BaseData";
import { G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";

export interface TowerSuperStageUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getConfig(): Object
    setConfig(value: Object): void
    getLastConfig(): Object
    isPass(): boolean
    setPass(value: boolean): void
    isLastPass(): boolean
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    null
];
schema['pass'] = [
    'boolean',
    false
];
export class TowerSuperStageUnitData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public updateData(data) {
        this.setProperties(data);
        let EquipEssenceStage = G_ConfigLoader.getConfig(ConfigNameConst.EQUIP_ESSENCE_STAGE);
        let config = EquipEssenceStage.get(data.id);
        console.assert(config, 'equip_essence_stage can not find id ' + String(data.id));
        this.setConfig(config);
    }
}
