import { BaseData } from "./BaseData";
import { G_UserData, G_ConfigLoader } from "../init";
import { HistoryHeroConst } from "../const/HistoryHeroConst";
import { HistoryHeroDataHelper } from "../utils/data/HistoryHeroDataHelper";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { assert } from "../utils/GlobleFunc";

export interface HistoryHeroUnit {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getSystem_id(): number
    setSystem_id(value: number): void
    getLastSystem_id(): number
    getBreak_through(): number
    setBreak_through(value: number): void
    getLastBreak_through(): number
    getMaterials(): any
    setMaterials(value: Object): void
    getLastMaterials(): Object
    setConfig(value: Object): void
    getConfig(): any
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['system_id'] = [
    'number',
    0
];
schema['break_through'] = [
    'number',
    0
];
schema['materials'] = [
    'object',
    {}
];
schema['config'] = [
    'object',
    {}
];
export class HistoryHeroUnit extends BaseData {

    public static schema = schema;
    constructor(properties?) {
        super(properties);
        if (properties) {
            this.initData(properties);
        }
    }

    clear() {
    }
    reset() {
    }
    initData(msg) {
        this.setProperties(msg);
    }
    updateID(id) {
        this.setId(id);
    }
    updateData(data) {
        this.setProperties(data);
        
        var config = G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO).get(data.system_id);
        assert(config, 'historical_hero can\'t find base_id = ',(data.system_id));
        this.setConfig(config);
    }
    updateSystemId(systemId) {
        this.setSystem_id(systemId);
        var config = G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO).get(systemId);
        assert(config, 'historical_hero can\'t find base_id = ',(systemId));
        this.setConfig(config);
    }
    updateBreakThrough(breakThrough) {
        this.setBreak_through(breakThrough);
    }
    isCanTrain() {
        return true;
    }
    isEquiping() {
        var materials = this.getMaterials();
        return materials.length > 0;
    }
    createFakeUnit(configId) {
        this.updateSystemId(configId);
        this.setId(-1);
        this.setBreak_through(1);
    }
    isEquiped() {
        return G_UserData.getHistoryHero().isStarEquiped(this.getId())[0];
    }
    haveWeapon() {
        var weaponId = this.getConfig().arm;
        return G_UserData.getHistoryHero().haveWeapon(weaponId);
    }
    isOnFormation() {
        return G_UserData.getHistoryHero().isStarEquiped(this.getId())[0];
    }
    existMaterial(i) {
        var t = this.getMaterials();
        if (t.length == 0) {
            return false;
        }
        var material = t[i - 1];
        return material && typeof(material) == 'object' && material.type > 0;
    }
    getMaterialCount() {
        var materialCount = 0;
        for (var i = 1; i <= 3; i++) {
            var bExist = this.existMaterial(i);
            if (bExist) {
                materialCount = materialCount + 1;
            }
        }
        return materialCount;
    }
    enoughMaterial() {
        if (this.getBreak_through() == 1) {
            return this.haveWeapon();
        } else if (this.getBreak_through() == 2) {
            if (this.getConfig().color == HistoryHeroConst.QUALITY_PURPLE) {
                return false;
            } else if (this.getConfig().color == HistoryHeroConst.QUALITY_ORANGE) {
                return this.orangeEnoughMaterial();
            }
        } else if (this.getBreak_through() == 3) {
            return false;
        }
    }
    orangeEnoughMaterial() {
        var stepConfig = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(this.getConfig().id, 2);
        var have = false;
        for (var i = 1; i <= HistoryHeroConst.MAX_STEP_MATERIAL; i++) {
            var bExist = this.existMaterial(i);
            if (stepConfig['type_' + i] > 0 && !bExist) {
                if (stepConfig['type_' + i] == TypeConvertHelper.TYPE_HISTORY_HERO) {
                    var configId = stepConfig['value_' + i];
                    have = have || G_UserData.getHistoryHero().existLevel2Hero(configId);
                } else if (stepConfig['type_' + i] == TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON) {
                    var configId = stepConfig['value_' + i];
                    have = have || G_UserData.getHistoryHero().haveWeapon(configId);
                }
            }
        }
        return have;
    }
    materialAllReady() {
        if (this.getBreak_through() == 1) {
            return true;
        } else if (this.getBreak_through() == 2) {
            var have = true;
            for (var i = 1; i <= HistoryHeroConst.MAX_STEP_MATERIAL; i++) {
                var bExist = this.existMaterial(i);
                have = have && bExist;
            }
            return have;
        } else if (this.getBreak_through() == 3) {
            return true;
        }
    }
    existStronger() {
        var list1 = G_UserData.getHistoryHero().getNotInFormationList();
        for (let ii in list1) {
            var underFormationData = list1[ii];
            if (underFormationData.getConfig().color > this.getConfig().color) {
                return true;
            } else if (underFormationData.getConfig().color == this.getConfig().color && underFormationData.getBreak_through() > this.getBreak_through()) {
                return true;
            }
        }
        return false;
    }

}
