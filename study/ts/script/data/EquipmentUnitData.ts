
import { ConfigNameConst } from "../const/ConfigNameConst";
import { BaseData } from "./BaseData";
import { G_ConfigLoader, G_UserData } from "../init";
import { JadeStoneData } from "./JadeStoneData";
import { UserDataHelper } from "../utils/data/UserDataHelper";

var schema = {};
schema['id'] = [
    'number',
    0
];
schema['base_id'] = [
    'number',
    0
];
schema['level'] = [
    'number',
    0
]
schema['star'] = [
    'number',
    0
]
schema['rank'] = [
    'number',
    0
]
schema['money'] = [
    'number',
    0
]
schema['time'] = [
    'number',
    0
]
schema['user_id'] = [
    'number',
    0
]
schema['r_level'] = [
    'number',
    0
]
schema['r_exp'] = [
    'number',
    0
]
schema['all_exp'] = [
    'number',
    0
]
schema['config'] = [
    'object',
    {}
]
schema['yokeRelation'] = [
    'boolean',
    false
]
schema['materials'] = [
    'object',
    []
]
schema['recycle_materials'] = [
    'object',
    []
]
schema['jades'] = [
    'object',
    []
]
schema['change'] = [
    'number',
    0
]
schema['last_jades'] = [];

export interface EquipmentUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getStar(): number
    setStar(value: number): void
    getLastStar(): number
    getRank(): number
    setRank(value: number): void
    getLastRank(): number
    getMoney(): number
    setMoney(value: number): void
    getLastMoney(): number
    getTime(): number
    setTime(value: number): void
    getLastTime(): number
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getR_level(): number
    setR_level(value: number): void
    getLastR_level(): number
    getR_exp(): number
    setR_exp(value: number): void
    getLastR_exp(): number
    getAll_exp(): number
    setAll_exp(value: number): void
    getLastAll_exp(): number
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
    isYokeRelation(): boolean
    setYokeRelation(value: boolean): void
    isLastYokeRelation(): boolean
    getMaterials(): number[]
    setMaterials(value: number[]): void
    getLastMaterials(): number[]
    getRecycle_materials(): number[]
    setRecycle_materials(value: number[]): void
    getLastRecycle_materials(): number[]
    getJades(): number[]
    setJades(value: number[]): void
    getLastJades(): number[]
    getChange(): number
    setChange(value: number): void
    getLastChange(): number
    getLast_jades(): number[]
    setLast_jades(value: number[]): void
    getLastLast_jades(): number[]
}
export class EquipmentUnitData extends BaseData {
    public static schema = schema;
    private _isUser = true;
    private _userDetailJades;
    updateData(data) {
        this.backupJades();
        this.setProperties(data);
        var config = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT).get(data.base_id);
        console.assert(config, 'equipmentConfig can\'t find base_id = ' + (data.base_id));
        this.setConfig(config);
    }
    getPos() {
        var id = this.getId();
        var data = G_UserData.getBattleResource().getEquipDataWithId(id);
        if (data) {
            return data.getPos();
        } else {
            return null;
        }
    }
    getSlot() {
        var id = this.getId();
        var data = G_UserData.getBattleResource().getEquipDataWithId(id);
        if (data) {
            return data.getSlot();
        } else {
            return null;
        }
    }
    isInBattle() {
        var id = this.getId();
        var data = G_UserData.getBattleResource().getEquipDataWithId(id);
        if (data == null) {
            return false;
        } else {
            return true;
        }
    }
    isInjectJadeStone() {
        var jades = this.getJades();
        for (let i = 0; i < jades.length; i++) {
            if (jades[i] > 0) {
                return true;
            }
        }
        return false;
    }
    isDidStrengthen() {
        return this.getLevel() > 1;
    }
    isDidRefine() {
        return this.getR_level() > 0;
    }
    isDidTrain() {
        var isDidStrengthen = this.isDidStrengthen();
        var isDidRefine = this.isDidRefine();
        if (isDidStrengthen || isDidRefine) {
            return true;
        } else {
            return false;
        }
    }
    getJadeSysIds() {
        var jadeSysIds = [];
        var jades = this.getJades();
        for (var i = 0; i < jades.length; i++) {
            if (jades[i] > 0) {
                var unitData = G_UserData.getJade().getJadeDataById(jades[i]);
                jadeSysIds.push(unitData.getConfig().id);
            } else {
                jadeSysIds.push(0);
            }
        }
        return jadeSysIds;
    }
    setIsUserEquip(isUser) {
        this._isUser = isUser;
    }
    isUserEquip() {
        return this._isUser;
    }
    isLimitUp() {
        var bres = false;
        for (var k in this.getMaterials()) {
            var v = this.getMaterials()[k];
            if (v > 0) {
                bres = true;
            }
        }
        if (this.getRecycle_materials().length > 0) {
            bres = true;
        }
        return bres;
    }
    isBlackPlat() {
        var flag = this.getMoney() == 0;
        flag = flag && this.getAll_exp() == 0;
        flag = flag && this.getRecycle_materials().length == 0;
        flag = flag && !this.isDidTrain();
        for (var k in this.getMaterials()) {
            var v = this.getMaterials()[k];
            flag = flag && v == 0;
        }
        for (var k in this.getJades()) {
            var v = this.getJades()[k];
            flag = flag && v == 0;
        }
        return flag;
    }
    isHaveTwoSameJade(jadeId) {
        var jadeUnit = G_UserData.getJade().getJadeDataById(jadeId);
        var slots = {};
        if (!jadeUnit) {
            return [false];
        }
        var jades = this.getJades();
        var count = 0;
        for (var i = 0; i < jades.length; i++) {
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
    backupJades() {
        var lastJade = [];
        var jades = this.getJades();
        for (var i = 0; i < jades.length; i++) {
            lastJade[i] = jades;
        }
        this.setLast_jades(lastJade);
    }
    isFullAttrJade() {
        var config = this.getConfig();
        if (config.suit_id == 0) {
            return false;
        }
        var slotinfo = config.inlay_type.split('|');
        var jades = this.getJades();
        for (var i = 0; i < slotinfo.length; i++) {
            if (parseFloat(slotinfo[i]) > 0) {
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
    isActiveJade(id) {
        var unitData = G_UserData.getJade().getJadeDataById(id);
        var [_, heroBaseId] = UserDataHelper.getHeroBaseIdWithEquipId(this.getId());
        var isSuitable = unitData.isSuitableHero(heroBaseId);
        return isSuitable;
    }
    isFullJade() {
        var config = this.getConfig();
        var slotinfo = config.inlay_type.split('|');
        if (parseFloat(slotinfo[1]) == 0) {
            return false;
        }
        var jades = this.getJades();
        for (var i = 0; i < slotinfo.length; i++) {
            if (parseFloat(slotinfo[i]) > 0) {
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
        if (config.suit_id == 0) {
            return 0;
        }
        var count = 0;
        var slotinfo = config.inlay_type.split('|');
        for (var i in slotinfo) {
            var value = slotinfo[i];
            if (parseFloat(value) > 0) {
                count = count + 1;
            }
        }
        return count;
    }
}