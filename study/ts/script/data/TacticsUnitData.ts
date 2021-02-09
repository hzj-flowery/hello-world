import { BaseData } from "./BaseData";
import { TacticsDataHelper } from "../utils/data/TacticsDataHelper";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { TacticsConst } from "../const/TacticsConst";
import { G_UserData } from "../init";
import { table } from "../utils/table";
import { HeroDataHelper } from "../utils/data/HeroDataHelper";

export interface TacticsUnitData {
    getId(): number
    setId(data: number): void
    getBase_id(): number
    setBase_id(data: number): void
    isUnlocked(): boolean
    setUnlocked(data: boolean): void
    getProficiency(): number
    setProficiency(data: number): void
    getHero_id(): number
    setHero_id(data: number): void
    getPos(): number
    setPos(data: number): void
    getConfig(): object
    setConfig(data: object): void
    getStudyConfig(): object
    setStudyConfig(data: object): void
}


var schema = {};
schema['id'] = [
    'number',
    0
];
schema['base_id'] = [
    'number',
    0
];
schema['unlocked'] = [
    'boolean',
    false
];
schema['proficiency'] = [
    'number',
    0
];
schema['hero_id'] = [
    'number',
    0
];
schema['pos'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];
schema['studyConfig'] = [
    'object',
    {}
];
export class TacticsUnitData extends BaseData {
    public static schema = schema;

    ctor(properties) {
    }
    clear() {
    }
    reset() {
    }
    resetWithDefault(id) {
        var data = {
            tactics_id: 0,
            tactics_type: id,
            unlocked: false,
            proficiency: 0,
            hero_id: 0,
            pos: 0
        };
        this.updateData(data);
    }
    updateData(data) {
        this.setProperties(data);
        this.setId(data.tactics_id);
        this.setBase_id(data.tactics_type);
        if (data.tactics_id && data.tactics_id > 0) {
            this.setUnlocked(true);
        } else {
            this.setUnlocked(false);
        }
        var info = TacticsDataHelper.getTacticsConfig(data.tactics_type);
        this.setConfig(info);
        var sinfo = TacticsDataHelper.getTacticsStudyConfig(data.tactics_type);
        this.setStudyConfig(sinfo);
    }
    isWeared() {
        var isWeared = this.getHero_id() > 0;
        return isWeared;
    }
    isShow() {
        return true;
    }
    isCanWear() {
        var isUnlocked = this.isUnlocked();
        var isStudied = this.isStudied();
        return isUnlocked && isStudied;
    }
    isCanUnlock() {
        var isUnlocked = this.isUnlocked();
        if (isUnlocked) {
            return false;
        }
        var materials = TacticsDataHelper.getUnlockedMaterials(this);
        for (var i = 0; i < 3; i++) {
            var info = materials[i];
            if (info) {
                var num = UserDataHelper.getSameCardCount(TypeConvertHelper.TYPE_HERO, info.value);
                if (num < info.size) {
                    return false;
                }
            }
        }
        return true;
    }
    isStudied() {
        return this.getProficiency() >= TacticsConst.MAX_PROFICIENCY;
    }
    isCanWearWithPos(pos, filterSlot?) {
        var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        if (this.getHero_id() == heroId) {
            return false;
        }
        var tacticsUnits = [];
        for (var i = 1; i != 3; i++) {
            if (i != filterSlot) {
                var id = G_UserData.getBattleResource().getResourceId(pos, 5, i);
                if (id && id > 0) {
                    table.insert(tacticsUnits, G_UserData.getTactics().getUnitDataWithId(id));
                }
            }
        }
        var slotList = G_UserData.getTactics().getUnlockInfoByPos(pos);
        var num = slotList.length + 1;
        if (tacticsUnits.length >= num) {
            return false;
        }
        for (var x in tacticsUnits) {
            var v = tacticsUnits[x];
            if (this.isMutex(v.getBase_id())) {
                return false;
            }
        }
        return true;
    }
    isMutex(id) {
        var map1 = TacticsDataHelper.getMutexMap(this.getBase_id());
        var map2 = TacticsDataHelper.getMutexMap(id);
        if (map1[id] || map2[this.getBase_id()]) {
            return true;
        } else {
            return false;
        }
    }
    getHeroDataOfWeared() {
        var heroId = this.getHero_id();
        if (heroId > 0) {
            var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
            return heroUnitData;
        }
        return null;
    }
    getStudyNumByHero(heroBaseId) {
        var studyInfo = this.getStudyConfig();
        var heroInfo = HeroDataHelper.getHeroConfig(heroBaseId);
        var res = 0;
        if (heroInfo.country == studyInfo['camp']) {
            for (var i = 1; i != 3; i++) {
                var needColor = studyInfo['color' + i];
                var pro = studyInfo['proficiency' + i];
                if (needColor == heroInfo.color) {
                    res = pro;
                    break;
                }
            }
        }
        return res;
    }
}