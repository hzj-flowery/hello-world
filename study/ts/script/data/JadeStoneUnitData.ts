import { BaseData } from "./BaseData";
import { G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { stringUtil } from "../utils/StringUtil";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { EquipDataHelper } from "../utils/data/EquipDataHelper";
import { EquipJadeHelper } from "../scene/view/equipmentJade/EquipJadeHelper";

export interface JadeStoneUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getSys_id(): number
    setSys_id(value: number): void
    getLastSys_id(): number
    getEquipment_id(): number
    setEquipment_id(value: number): void
    getLastEquipment_id(): number
    getEquiped_type():number
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['sys_id'] = [
    'number',
    0
];
schema['equipment_id'] = [
    'number',
    0
];
schema['equiped_type'] = [
    'number',
    0
];
schema['config'] = [
    'table',
    {}
];
export class JadeStoneUnitData extends BaseData {
    public static schema = schema;

    updateData(data) {
        this.setProperties(data);
        var config = G_ConfigLoader.getConfig(ConfigNameConst.JADE).get(data.sys_id);
        console.assert(config, 'jade config can not find id = ' + (data.sys_id));
        this.setConfig(config);
    }
    getEquipHeroBaseId() {
        if (this.getEquipment_id() > 0) {
            if (this.getEquiped_type() == 0) {
                var [heroBaseId, convertHeroBaseId] = UserDataHelper.getHeroBaseIdWithEquipId(this.getEquipment_id());
                return [
                    heroBaseId,
                    convertHeroBaseId
                ];
            } else if (this.getEquiped_type() == 1) {
                var [heroBaseId, convertHeroBaseId] = UserDataHelper.getHeroBaseIdWithTreasureId(this.getEquipment_id());
                return [
                    heroBaseId,
                    convertHeroBaseId
                ];
            }
        } else {
            return [null];
        }
    }

    getEquipHeroBaseData() {
        if (this.getEquipment_id() > 0) {
            if (this.getEquiped_type() == 0) {
                var heroUnitData = UserDataHelper.getHeroDataWithEquipId(this.getEquipment_id());
                return heroUnitData;
            } else if (this.getEquiped_type() == 1) {
                var heroUnitData = UserDataHelper.getHeroDataWithTreasureId(this.getEquipment_id());
                return heroUnitData;
            }
        } else {
            return null;
        }
    }

    isInEquipment() {
        return this.getEquipment_id() > 0;
    }
    isSuitableEquipment(baseId) {
        var suitableInfo = stringUtil.split(this.getConfig().equipment, '|');
        for (var i = 0; i < suitableInfo.length; i++) {
            if (parseFloat(suitableInfo[i]) == baseId) {
                return true;
            }
        }
        return false;
    }

    isSuitableTreasure(baseId) {
        var suitableInfo = (this.getConfig().treasure.split( '|'));
        for (var i = 0; i < suitableInfo.length; i++) {
            if (Number(suitableInfo[i]) == baseId) {
                return true;
            }
        }
        return false;
    }

    isSuitableHero(heroBaseId) {
        return EquipJadeHelper.isSuitableHero(this.getConfig(), heroBaseId);
    }
    getType() {
        return TypeConvertHelper.TYPE_JADE_STONE;
    }
}