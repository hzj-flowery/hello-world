import { BaseData } from "./BaseData";
import { G_UserData, G_ConfigLoader } from "../init";
import ParameterIDConst from "../const/ParameterIDConst";
import TreasureConst from "../const/TreasureConst";
import { UserBaseData } from "./UserBaseData";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { TreasureDataHelper } from "../utils/data/TreasureDataHelper";
import { assert } from "../utils/GlobleFunc";

export interface TreasureUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getExp(): number
    setExp(value: number): void
    getLastExp(): number
    getHistory_gold(): number
    setHistory_gold(value: number): void
    getLastHistory_gold(): number
    getRefine_level(): number
    setRefine_level(value: number): void
    getJades(): any[]
    setJades(value: any[]): void
    getLastRefine_level(): number
    getLimit_cost(): number
    setLimit_cost(value: number): void
    getLastLimit_cost(): number
    getMaterials(): any[]
    setMaterials(value: any[]): void
    getLastMaterials(): any[]
    getRecycle_materials(): any[]
    setRecycle_materials(value: any[]): void
    getLastRecycle_materials(): any[]
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
    isYokeRelation(): boolean
    setYokeRelation(value: boolean): void
    isLastYokeRelation(): boolean
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
schema['user_id'] = [
    'number',
    0
];
schema['level'] = [
    'number',
    0
];
schema['exp'] = [
    'number',
    0
];
schema['history_gold'] = [
    'number',
    0
];
schema['refine_level'] = [
    'number',
    0
];
schema['limit_cost'] = [
    'number',
    0
];
schema['materials'] = [
    'object',
    {}
];
schema['recycle_materials'] = [
    'object',
    {}
];
schema['config'] = [
    'object',
    {}
];
schema['yokeRelation'] = [
    'boolean',
    false
];
schema['jades'] = [
    'table',
    {}
];
export class TreasureUnitData extends BaseData {
    public static schema = schema;
    _userDetailJades: any;
    private static _limitStrMaxLvMap: any;
    private static _limitRefineMaxLvMap: any;
    ctor () {
        
    }

    //性能优化,避免每个unitData都算一遍
   public static _initLimitMaxLvMap () {
        var tempMaxLvMap = {};
        var TreatureLevelup = G_ConfigLoader.getConfig('treasure_levelup');
        var len = TreatureLevelup.length();
        for (var i = 1; i != len; i++) {
            var item = TreatureLevelup.indexOf(i);
            if (tempMaxLvMap[item.templet] == null) {
                tempMaxLvMap[item.templet] = item.level;
            } else {
                tempMaxLvMap[item.templet] = Math.max(tempMaxLvMap[item.templet], item.level);
            }
        }
        TreasureUnitData._limitStrMaxLvMap = tempMaxLvMap;
        var tempMaxLvMap = {};
        var TreatureRefine = G_ConfigLoader.getConfig('treasure_refine');
        var len = TreatureRefine.length();
        for (var i = 1; i != len; i++) {
            var item = TreatureRefine.indexOf(i);
            if (tempMaxLvMap[item.templet] == null) {
                tempMaxLvMap[item.templet] = item.level;
            } else {
                tempMaxLvMap[item.templet] = Math.max(tempMaxLvMap[item.templet], item.level);
            }
        }
        TreasureUnitData._limitRefineMaxLvMap = tempMaxLvMap;

    }
    updateData(data) {
        this.setProperties(data);
        //this._initLimitMaxLvMap();
        var config = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE).get(data.base_id);
        if (!config)
            cc.error('treasure config can not find id = ' + (data.base_id));
        this.setConfig(config);
    }
    getPos() {
        var id = this.getId();
        var data = G_UserData.getBattleResource().getTreasureDataWithId(id);
        if (data) {
            return data.getPos();
        } else {
            return null;
        }
    }
    getSlot() {
        var id = this.getId();
        var data = G_UserData.getBattleResource().getTreasureDataWithId(id);
        if (data) {
            return data.getSlot();
        } else {
            return null;
        }
    }
    isInBattle() {
        var id = this.getId();
        var data = G_UserData.getBattleResource().getTreasureDataWithId(id);
        if (data == null) {
            return false;
        } else {
            return true;
        }
    }
    getMaxStrLevel() {
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        let ratio = Parameter.get(ParameterIDConst.MAX_TREASURE_LEVEL).content / 1000;
        let addLevel = 0;
        let limitLevel = this.getLimit_cost();
        if (limitLevel >= TreasureConst.TREASURE_LIMIT_RED_LEVEL) {
            addLevel = TreasureConst.getAddStrLevelByLimit();
        }
        let maxLevel = Math.floor(G_UserData.getBase().getLevel() * ratio) + addLevel;
        return maxLevel;
    }
    getMaxRefineLevel() {
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        let ratio = Parameter.get(ParameterIDConst.MAX_TREASURE_REFINE).content / 1000;
        let addLevel = 0;
        let limitLevel = this.getLimit_cost();
        if (limitLevel >= TreasureConst.TREASURE_LIMIT_RED_LEVEL) {
            addLevel = TreasureConst.getAddRefineLevelByLimit();
        }
        let maxLevel = Math.floor(G_UserData.getBase().getLevel() * ratio) + addLevel;
        return maxLevel;
    }
    isLimitShowTop() {
        var limitLevel = this.getLimit_cost();
        var limitUpId = this.getConfig().limit_up_id;
        if (limitUpId > 0) {
            var showLevel = TreasureDataHelper.getLimitShowLv(limitLevel);
            var gameUserLevel = G_UserData.getBase().getLevel();
            if (showLevel > gameUserLevel) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }
    getAddStrLevelByNextLimit () {
        var limitLevel = this.getLimit_cost();
        var limitUpId = this.getConfig().limit_up_id;
        var config1, config2;
        if (limitUpId > 0) {
            config1 = this.getConfig();
            config2 = G_ConfigLoader.getConfig('treasure').get(limitUpId);
            assert(config2, 'treasure config can not find id = ' + (limitUpId));
        } else if (limitLevel >= TreasureConst.TREASURE_LIMIT_UP_BASE_LEVEL && limitUpId <= 0) {
            var id = G_UserData.getTreasure().getLimitOrgSrcId(this.getBase_id());
            config1 = G_ConfigLoader.getConfig('treasure').get(id);
            assert(config1, 'treasure config can not find id = ' + (id));
            config2 = this.getConfig();
        } else {
            return 0;
        }
        var lvTemplet = config1.levelup_templet;
        var lvTemplet2 = config2.levelup_templet;
        var lvDelta = TreasureUnitData._limitStrMaxLvMap[lvTemplet2] - TreasureUnitData._limitStrMaxLvMap[lvTemplet];
        return lvDelta;
    }
    getAddRefineLevelByNextLimit () {
        var limitLevel = this.getLimit_cost();
        var limitUpId = this.getConfig().limit_up_id;
        var config1, config2;
        if (limitUpId > 0) {
            config1 = this.getConfig();
            config2 = G_ConfigLoader.getConfig('treasure').get(limitUpId);
            assert(config2, 'treasure config can not find id = ' + (limitUpId));
        } else if (limitLevel >= TreasureConst.TREASURE_LIMIT_UP_BASE_LEVEL && limitUpId <= 0) {
            var id = G_UserData.getTreasure().getLimitOrgSrcId(this.getBase_id());
            config1 = G_ConfigLoader.getConfig('treasure').get(id);
            assert(config1, 'treasure config can not find id = ' + (id));
            config2 = this.getConfig();
        } else {
            return 0;
        }
        var reTemplet = config1.refine_templet;
        var reTemplet2 = config2.refine_templet;
        var reDelta = TreasureUnitData._limitRefineMaxLvMap[reTemplet2] - TreasureUnitData._limitRefineMaxLvMap[reTemplet];
        return reDelta;
    }
    getAddRefineLevelByAllLimit (param) {
        var config1;
        if (this.getLimit_cost() < TreasureConst.TREASURE_LIMIT_UP_BASE_LEVEL) {
            config1 = this.getConfig();
        } else {
            var id = G_UserData.getTreasure().getLimitSrcId(this.getBase_id());
            config1 = G_ConfigLoader.getConfig('treasure').get(id);
            assert(config1, 'treasure config can not find id = ' + (id));
        }
        var config2;
        var limitUpId = this.getConfig().limit_up_id;
        var limitLevel = this.getConfig().limit_level;
        if (param == 1 && limitUpId > 0) {
            config2 = G_ConfigLoader.getConfig('treasure').get(limitUpId);
            assert(config2, 'treasure config can not find id = ' + (limitUpId));
        } else if (param == -1 && limitLevel > 0) {
            var id = G_UserData.getTreasure().getLimitOrgSrcId(this.getBase_id());
            config2 = G_ConfigLoader.getConfig('treasure').get(id);
            assert(config2, 'treasure config can not find id = ' + (id));
        } else {
            config2 = this.getConfig();
        }
        var reTemplet = config1.refine_templet;
        var reTemplet2 = config2.refine_templet;
        var reDelta = TreasureUnitData._limitRefineMaxLvMap[reTemplet2] - TreasureUnitData._limitRefineMaxLvMap[reTemplet];
        return reDelta;
    }
    getSameCardId() {
        var sameCardId = this.getBase_id();
        var limitLevel = this.getLimit_cost();
        if (limitLevel == TreasureConst.TREASURE_LIMIT_RED_LEVEL) {
            sameCardId = G_UserData.getTreasure().getLimitSrcId(sameCardId);
        }
        return sameCardId;
    }
    isCanLimitBreak() {
        return this.getConfig().limit_able == 1;
    }
    isDidStrengthen() {
        return this.getLevel() > 1;
    }
    isDidRefine() {
        return this.getRefine_level() > 0;
    }
    isDidLimit() {
        if (this.getLimit_cost() > 0) {
            return true;
        }
        for (var key = TreasureConst.TREASURE_LIMIT_COST_KEY_1; key <= TreasureConst.TREASURE_LIMIT_COST_KEY_4; key++) {
            var value = this.getLimitCostCountWithKey(key);
            if (value > 0) {
                return true;
            }
        }
        return false;
    }
    isDidTrain() {
        var isDidStrengthen = this.isDidStrengthen();
        var isDidRefine = this.isDidRefine();
        var isDidLimit = this.isDidLimit();
        if (isDidStrengthen || isDidRefine || isDidLimit) {
            return true;
        } else {
            return false;
        }
    }
    isCanTrain() {
        var treasureType = this.getConfig().treasure_type;
        if (treasureType == 0) {
            return false;
        }
        return true;
    }
    isUserTreasure() {
        return this.getId() != 0;
    }
    getLimitCostCountWithKey(key) {
        var limitRes = this.getMaterials();
        for (var i = 1; i <= limitRes.length; i++) {
            var value = limitRes[i - 1];
            if (i == key) {
                return value;
            }
        }
        return 0;
    }
    isInjectJadeStone() {
        var jades = this.getJades();
        for (var i = 1; i <= jades.length; i++) {
            if (jades[i] > 0) {
                return true;
            }
        }
        return false;
    }
    getJadeSysIds() {
        var jadeSysIds = {};
        var jades = this.getJades();
        for (var i = 1; i <= jades.length; i++) {
            if (jades[i] > 0) {
                var unitData = G_UserData.getJade().getJadeDataById(jades[i]);
                jadeSysIds[i] = unitData.getConfig().id;
            } else {
                jadeSysIds[i] = 0;
            }
        }
        return jadeSysIds;
    }
    isHaveTwoSameJade(jadeId) {
        var jadeUnit = G_UserData.getJade().getJadeDataById(jadeId);
        var slots = {};
        if (!jadeUnit) {
            return false;
        }
        var jades = this.getJades();
        var count = 0;
        for (var i = 1; i <= jades.length; i++) {
            if (jades[i] > 0) {
                var unitData = G_UserData.getJade().getJadeDataById(jades[i]);
                if (jadeUnit.getConfig().id == unitData.getConfig().id) {
                    count = count + 1;
                    slots[i] = true;
                }
            }
        }
        return [
            count >= 2,
            slots
        ];
    }
    isFullAttrJade() {
        var config = this.getConfig();
        var slotinfo = (config.inlay_type.split('|'));
        var jades = this.getJades();
        for (var i = 2; i <= slotinfo.length; i++) {
            if (Number(slotinfo[i]) > 0) {
                if (jades[i] || jades[i] == 0) {
                    return false;
                } else {
                    if (!this.isActiveJade(jades[i])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    isActiveJade(id) {
        var unitData = G_UserData.getJade().getJadeDataById(id);
        var [heroBaseId, convertHeroBaseId] = UserDataHelper.getHeroBaseIdWithTreasureId(this.getId());
        var isSuitable = unitData.isSuitableHero(heroBaseId);
        return isSuitable;
    }
    isFullJade() {
        var config = this.getConfig();
        var slotinfo = (config.inlay_type.split('|'));
        if (Number(slotinfo[1]) == 0) {
            return false;
        }
        var jades = this.getJades();
        for (var i = 1; i <= slotinfo.length; i++) {
            if (Number(slotinfo[i]) > 0) {
                if (jades[i] == 0) {
                    return false;
                } else {
                    if (!this.isActiveJade(jades[i])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    setUserDetailJades(slot, sysId) {
        this._userDetailJades = this._userDetailJades || {};
        this._userDetailJades[slot] = sysId;
    }
    getUserDetailJades() {
        return this._userDetailJades;
    }
    getJadeSlotNums() {
        var config = this.getConfig();
        var count = 0;
        var slotinfo = (config.inlay_type.split('|'));
        for (var i in slotinfo) {
            var value = slotinfo[i];
            if (Number(value) > 0) {
                count = count + 1;
            }
        }
        return count;
    }
}