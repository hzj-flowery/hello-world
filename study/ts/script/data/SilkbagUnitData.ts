import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { BaseData } from "./BaseData";
import { G_ConfigLoader, G_UserData } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { SilkbagConst } from "../const/SilkbagConst";

export interface SilkbagUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getType(): number
    setType(value: number): void
    getLastType(): number
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
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
schema['type'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];

export class SilkbagUnitData extends BaseData {
    public static schema = schema;
    updateData(data) {
        this.setProperties(data);
        this.setType(TypeConvertHelper.TYPE_SILKBAG);
        var info = G_ConfigLoader.getConfig(ConfigNameConst.SILKBAG).get(data.base_id);
        console.assert(info, 'silkbag config can\'t find id = ' + (data.base_id));
        this.setConfig(info);
    }
    isWeared() {
        var unitData = G_UserData.getSilkbagOnTeam().getUnitDataWithId(this.getId());
        var isWeared = unitData != null;
        return isWeared;
    }
    isCanWearWithPos(pos) {
        var onlyType = this.getConfig().only;
        if (onlyType == SilkbagConst.ONLY_TYPE_0) {
            return true;
        } else if (onlyType == SilkbagConst.ONLY_TYPE_1) {
            var ids = G_UserData.getSilkbagOnTeam().getIdsOnTeamWithPos(pos);
            for (var i in ids) {
                var id = ids[i];
                var unitData = G_UserData.getSilkbag().getUnitDataWithId(id);
                if (unitData.getBase_id() == this.getBase_id()) {
                    return false;
                }
            }
        } else if (onlyType == SilkbagConst.ONLY_TYPE_2) {
            for (var posIndex = 1; posIndex <= 6; posIndex++) {
                var ids = G_UserData.getSilkbagOnTeam().getIdsOnTeamWithPos(posIndex);
                for (let i in ids) {
                    var id = ids[i];
                    var unitData = G_UserData.getSilkbag().getUnitDataWithId(id);
                    if (unitData.getBase_id() == this.getBase_id()) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    getHeroBaseIdOfWeared() {
        var heroUnitData = this.getHeroDataOfWeared();
        var heroBaseId = 0;
        if (heroUnitData) {
            heroBaseId = heroUnitData.getBase_id();
        }
        return heroBaseId;
    }
    getHeroDataOfWeared () {
        var unitData = G_UserData.getSilkbagOnTeam().getUnitDataWithId(this.getId());
        if (unitData) {
            var pos = unitData.getPos();
            var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
            return heroUnitData;
        }
        return null;
    }
    isWearedInPos(pos) {
        var unitData = G_UserData.getSilkbagOnTeam().getUnitDataWithId(this.getId());
        if (unitData) {
            if (pos == unitData.getPos()) {
                return true;
            }
        }
        return false;
    }
    canBeSold() {
        if (!this.isWeared() && this.getConfig().recycle_type != 0 && this.getConfig().recycle_value != 0 && this.getConfig().recycle_size != 0) {
            return true;
        }
        return false;
    }
}

