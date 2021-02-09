import { BaseData } from "./BaseData";
import { HorseDataHelper } from "../utils/data/HorseDataHelper";
import { G_UserData } from "../init";
import HorseConst from "../const/HorseConst";

export interface HorseUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getStar(): number
    setStar(value: number): void
    getLastStar(): number
    getConfig(): Object
    setConfig(value: Object): void
    getLastConfig(): Object
    getEquip(): Object
    setEquip(value: Object): void
    getLastEquip(): Object
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
schema['star'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];
schema['equip'] = [
    'object',
    {}
];
export class HorseUnitData extends BaseData {
    public static schema = schema;
    updateData(data) {
        this.setProperties(data);
        var config = HorseDataHelper.getHorseConfig(data.base_id);
        this.setConfig(config);
    }
    getPos() {
        var id = this.getId();
        var data = G_UserData.getBattleResource().getHorseDataWithId(id);
        if (data) {
            return data.getPos();
        } else {
            return null;
        }
    }
    getSlot() {
        var id = this.getId();
        var data = G_UserData.getBattleResource().getHorseDataWithId(id);
        if (data) {
            return data.getSlot();
        } else {
            return null;
        }
    }
    isInBattle() {
        var id = this.getId();
        var data = G_UserData.getBattleResource().getHorseDataWithId(id);
        if (data == null) {
            return false;
        } else {
            return true;
        }
    }
    isDidUpStar() {
        return this.getStar() > 1;
    }
    isUser() {
        return this.getId() != 0;
    }
    isStarLimit() {
        var maxStar = HorseConst.HORSE_STAR_MAX;
        var star = this.getStar();
        return star >= maxStar;
    }
    isCanUpStar() {
    }
}