import { BaseData } from "./BaseData";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { G_UserData, G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { UserDataHelper } from "../utils/data/UserDataHelper";

export interface PetUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getExp(): number
    setExp(value: number): void
    getLastExp(): number
    getStar(): number
    setStar(value: number): void
    getLastStar(): number
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
    getMaterials(): any[]
    setMaterials(value: any[]): void
    getLastMaterials(): any[]
    getInital_exp():any
    setInital_exp(value:number):void
    getRecycle_materials(): any[]
    setRecycle_materials(value: any[]): void
    getLastRecycle_materials(): any[]

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
schema['level'] = [
    'number',
    0
];
schema['exp'] = [
    'number',
    0
];
schema['star'] = [
    'number',
    1
];
schema['config'] = [
    'object',
    {}
];
schema['inital_exp'] = [
    'number',
    0
]
schema['materials'] = [
    'object',
    {}
];
schema['recycle_materials'] = [
    'object',
    {}
];
schema['type'] = [
    'number',
    10
];
export class PetUnitData extends BaseData {
    public static schema = schema;
    constructor() {
        super()
        this._isUserPet = true;
    }
    private _isUserPet;
    private _petList;
    public clear() {
    }
    public reset() {
        this._petList = {};
    }


    public updateData(data) {
        this.backupProperties()
        this.setProperties(data);
        var config = G_ConfigLoader.getConfig(ConfigNameConst.PET).get(data.base_id);
        this.setConfig(config);
        if (config.initial_star > 0) {
            this.setInital_exp(UserDataHelper.getPetNeedExpWithLevel(config.level, config.color));
        } else {
            this.setInital_exp(0);
        }
    }
    public getPos() {
        var petIds = G_UserData.getTeam().getPetIdsInHelpWithZero();
        for (var i in petIds) {
            var id = petIds[i];
            if (this.getId() == id) {
                return parseInt(i) + 1;
            }
        }
        return null;
    }
    public isInBattle() {
        var petIds = G_UserData.getTeam().getPetIdsInBattle();
        for (var i in petIds) {
            var value = petIds[i];
            if (value == this.getId()) {
                return true;
            }
        }
        return false;
    }
    public isPetBless() {
        var pos = this.getPos();
        if (pos && pos > 0) {
            return true;
        } else {
            return false;
        }
    }
    public isCanTrain() {
        return true;
    }
    public isCanBreak() {
        var rankMax = this.getConfig().star_max;
        if (rankMax == 0) {
            return false;
        }
        return true;
    }
    isDidUpgrade() {
        return this.getExp() > this.getInital_exp();
    }
    isDidBreak() {
        return this.getStar() > this.getConfig().initial_star;
    }
    public getStarMax() {
        return this.getConfig().star_max;
    }
    getInitial_star() {
        return this.getConfig().initial_star;
    }
    getIsRed() {
        return this.getConfig().is_red;
    }
    public getLvUpCost() {
        return this.getConfig().color;
    }
    public getQuality() {
        return this.getConfig().color;
    }
    public getFragmentId() {
        return this.getConfig().fragment_id;
    }
    public isDidTrain() {
        var isDidUpgrade = this.isDidUpgrade();
        var isDidBreak = this.isDidBreak();
        if (isDidUpgrade || isDidBreak) {
            return true;
        } else {
            return false;
        }
    }
    public getLimitCostCountWithKey(key) {
        var limitRes = this.getRecycle_materials();
        for (var i in limitRes) {
            var info = limitRes[i];
            if (info.Key == key) {
                return info.Value;
            }
        }
        return 0;
    }
    public getCurLimitCostCountWithKey(key) {
        var limitRes = this.getMaterials();
        return limitRes[key];
    }
    public setUserPet(userPet) {
        this._isUserPet = userPet;
    }
    public isUserPet() {
        return this._isUserPet;
    }
}