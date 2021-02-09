import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_UserData, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { SignalConst } from "../const/SignalConst";
import { TeamData } from "./TeamData";
import { MessageErrorConst } from "../const/MessageErrorConst";
import PetConst from "../const/PetConst";
import { PetUnitData } from "./PetUnitData";
import { FunctionConst } from "../const/FunctionConst";
// import HandBookData from "./HandBookData";
// import UserCheck from "../utils/logic/UserCheck";
import { FunctionCheck } from "../utils/logic/FunctionCheck";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { BaseConfig } from "../config/BaseConfig";
import { HandBookData } from "./HandBookData";
import { UserCheck } from "../utils/logic/UserCheck";

/**
 * 预先加载的资源
 * app.config.pet_map
 */

let schema = {};
schema['listDataDirty'] = [
    'boolean',
    false
];
schema['rangeDataDirty'] = [
    'boolean',
    false
];
schema['fragmentDataDirty'] = [
    'boolean',
    false
];
schema['recoveryDataDirty'] = [
    'boolean',
    false
];
schema['recoveryAutoDataDirty'] = [
    'boolean',
    false
];
schema['rebornDataDirty'] = [
    'boolean',
    false
];
export interface PetData {
    isListDataDirty(): boolean
    setListDataDirty(value: boolean): void
    isLastListDataDirty(): boolean
    isRangeDataDirty(): boolean
    setRangeDataDirty(value: boolean): void
    isLastRangeDataDirty(): boolean
    isFragmentDataDirty(): boolean
    setFragmentDataDirty(value: boolean): void
    isLastFragmentDataDirty(): boolean
    isRecoveryDataDirty(): boolean
    setRecoveryDataDirty(value: boolean): void
    isLastRecoveryDataDirty(): boolean
    isRecoveryAutoDataDirty(): boolean
    setRecoveryAutoDataDirty(value: boolean): void
    isLastRecoveryAutoDataDirty(): boolean
    isRebornDataDirty(): boolean
    setRebornDataDirty(value: boolean): void
    isLastRebornDataDirty(): boolean
}

export class PetData extends BaseData {
    public static schema = schema;
    private _petMapConfig: BaseConfig;
    private get petMapConfig(): BaseConfig {
        if (!this._petMapConfig) {
            this._petMapConfig = G_ConfigLoader.getConfig(ConfigNameConst.PET_MAP);
        }

        return this._petMapConfig;
    }


    constructor() {
        super()
        this._signalRecvGetPet = G_NetworkManager.add(MessageIDConst.ID_S2C_GetPet, this._s2cGetPet.bind(this));
        this._signalRecvPetRecycle = G_NetworkManager.add(MessageIDConst.ID_S2C_PetRecycle, this._s2cPetRecycle.bind(this));
        this._signalRecvPetOnTeam = G_NetworkManager.add(MessageIDConst.ID_S2C_PetOnTeam, this._s2cPetOnTeam.bind(this));
        this._signalRecvPetReborn = G_NetworkManager.add(MessageIDConst.ID_S2C_PetReborn, this._s2cPetReborn.bind(this));
        this._signalRecvPetStarUp = G_NetworkManager.add(MessageIDConst.ID_S2C_PetStarUp, this._s2cPetStarUp.bind(this));
        this._signalRecvPetLevelUp = G_NetworkManager.add(MessageIDConst.ID_S2C_PetLevelUp, this._s2cPetLevelUp.bind(this));
        this._signalRecvActivePetPhoto = G_NetworkManager.add(MessageIDConst.ID_S2C_ActivePetPhoto, this._s2cActivePetPhoto.bind(this));
        this._signalRecvGetActivePetPhoto = G_NetworkManager.add(MessageIDConst.ID_S2C_GetActivePetPhoto, this._s2cGetActivePetPhoto.bind(this));
        this._signalRecvPetRankUp = G_NetworkManager.add(MessageIDConst.ID_S2C_PetRankUp, this._s2cPetRankUp.bind(this));
        this._signalRecvPostRankUpMaterial = G_NetworkManager.add(MessageIDConst.ID_S2C_PetPostRankUpMaterial, this._s2cPetPostRankUpMaterial.bind(this));
        this._petList = {};
        this._petHandBookList = {};
    }
    private _signalRecvGetPet;
    private _signalRecvPetRecycle;
    private _signalRecvPetOnTeam;
    private _signalRecvPetReborn;
    private _signalRecvPetStarUp;
    private _signalRecvPetLevelUp;
    private _signalRecvActivePetPhoto;
    private _signalRecvGetActivePetPhoto;
    private _signalRecvPetRankUp;
    private _signalRecvPostRankUpMaterial;
    private _petList: { [key: string]: PetUnitData };
    private _cacheRecoveryAutoList;
    private _cacheRecoveryList;
    private _petHandBookList;
    private _cacheRebornList;
    private _cacheListData;
    private _curPetId;

    public clear() {
        this._signalRecvGetPet.remove();
        this._signalRecvGetPet = null;
        this._signalRecvPetRecycle.remove();
        this._signalRecvPetRecycle = null;
        this._signalRecvPetOnTeam.remove();
        this._signalRecvPetOnTeam = null;
        this._signalRecvPetReborn.remove();
        this._signalRecvPetReborn = null;
        this._signalRecvPetStarUp.remove();
        this._signalRecvPetStarUp = null;
        this._signalRecvPetLevelUp.remove();
        this._signalRecvPetLevelUp = null;
        this._signalRecvActivePetPhoto.remove();
        this._signalRecvActivePetPhoto = null;
        this._signalRecvPetRankUp.remove();
        this._signalRecvPetRankUp = null;
        this._signalRecvPostRankUpMaterial.remove();
        this._signalRecvPostRankUpMaterial = null;
    }
    public reset() {
    }
    public createTempPetUnitData(data) {
        if (!data || typeof (data) != "object") {
            alert("PetData:createTempPetUnitData data must be table");
        }
        var config = G_ConfigLoader.getConfig(ConfigNameConst.PET).get(data.baseId || 1);
        var baseData: any = {};
        baseData.id = data.id || 1;
        baseData.base_id = data.baseId || 1;
        baseData.level = data.level || 1;
        baseData.exp = data.exp || 1;
        baseData.star = data.star || config.initial_star;
        baseData.materials = data.materials || {};
        baseData.recycle_materials = data.recycle_materials || {};
        var unitData = new PetUnitData();
        unitData.updateData(baseData);
        unitData.setUserPet(false);
        return unitData;
    }
    private _setPetData(data) {
        this._petList['k_' + (data.id)] = null;
        var unitData = new PetUnitData();
        unitData.updateData(data);
        this._petList['k_' + (data.id)] = unitData;
    }
    public updateData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._petList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            this._setPetData(data[i]);
        }
    }
    public insertData(data): any {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._petList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            this._setPetData(data[i]);
        }
        this.setSortDataDirty(true);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TEAM);
    }
    public deleteData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._petList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            var id = data[i];
            // this._petList['k_' + (id)] = null;
            delete this._petList['k_' + (id)];
        }
        this.setSortDataDirty(true);
    }
    public setSortDataDirty(dirty) {
        this.setListDataDirty(dirty);
        this.setRangeDataDirty(dirty);
        this.setFragmentDataDirty(dirty);
        this.setRecoveryDataDirty(dirty);
        this.setRecoveryAutoDataDirty(dirty);
        this.setRebornDataDirty(dirty);
    }
    public isPetBless(id) {
        var unitData = this.getUnitDataWithId(id);
        return unitData.isPetBless();
    }
    public isPetInBattle(id) {
        var unitData = this.getUnitDataWithId(id);
        return unitData.isInBattle();
    }

    /**
     * TODO:
     */
    public isPetMapShow(petMapId) {
        let PetMapConfig = G_ConfigLoader.getConfig(ConfigNameConst.PET_MAP);
        function isPetMapShowTest(petMapId) {
            var config = PetMapConfig.get(petMapId);
            if (!config) {
                alert("pet_map config can\'t find petMapId = " + petMapId);
            }
            var petIdList: any = [];
            for (var i = 1; i <= 3; i++) {
                var petId = config['pet' + i];
                if (petId > 0) {
                    petIdList.push(petId);
                }
            }
            for (var k in petIdList) {
                var value = petIdList[k];
                if (G_UserData.getPet().isPetHave(value) == true) {
                    return true;
                }
            }
            return false;
        }
        if (isPetMapShowTest(petMapId) == true) {
            return true;
        }
        var config = PetMapConfig.get(petMapId);
        if (!config)
            alert("pet_map config can\'t find petMapId = " + petMapId);
        if (UserCheck.enoughOpenDay(config.show_day) == true) {
            return true;
        }
        return false;
    }

    /**
     * TODO:G_UserData.getHandBook()
     * @param petBaseId 
     */
    public isPetHave(petBaseId): boolean {
        var isHave1 = G_UserData.getHandBook().isPetHave(petBaseId);
        var isHave2 = this.getPetCountWithBaseId(petBaseId) > 0;
        return isHave1 || isHave2;
    }
    public getUnitDataWithId(id) {
        if (id == 0) {
            return null;
        }
        var unitData = this._petList['k_' + (id)];
        return unitData;
    }

    public getListDataBySort() {
        var sortFun1 = function (a: PetUnitData, b: PetUnitData) {
            if (a.isInBattle() != b.isInBattle()) {
                return a.isInBattle() ? -1 : 1;
            }
            if (a.isPetBless() != b.isPetBless()) {
                return a.isPetBless() ? -1 : 1;
            }
            if (a.getConfig().color != b.getConfig().color) {
                return b.getConfig().color - a.getConfig().color;
            } else if (a.getStar() != b.getStar()) {
                return b.getStar() - a.getStar();
            }else if(a.getLevel() != b.getLevel()) {
                return b.getLevel() - a.getLevel();
            }else {
                return a.getConfig().id - b.getConfig().id;
            }
        };
        if (this._cacheListData == null || this.isListDataDirty()) {
            var result = [];
            var petList = [];
            for (var k in this._petList) {
                let unit: PetUnitData = this._petList[k];
                petList.push(unit);
            }
            petList.sort(sortFun1);
            for (var i in petList) {
                let unit: PetUnitData = petList[i];
                result.push(unit.getId());
            }
            this._cacheListData = result;
            this.setListDataDirty(false);
        }
        return this._cacheListData;
    }
    public getRangeDataBySort() {
        var petList: any = [];
        for (var key in this._petList) {
            var value = this._petList[key];
            petList.push(value.getId());
        }
        return petList;
    }
    public getAllPets() {
        return this._petList;
    }
    public getCurPetId() {
        return this._curPetId;
    }
    public setCurPetId(petId) {
        this._curPetId = petId;
    }

    public getPetTotalCount() {
        var count = 0;
        for (var k in this._petList) {
            var v = this._petList[k];
            count = count + 1;
        }
        return count;
    }
    public getReplaceDataBySort(filterId?) {
        var sortFun = function (a, b) {
            if (a.getConfig().color != b.getConfig().color) {
                return b.getConfig().color - a.getConfig().color;
            } else {
                if (a.getLevel() != b.getLevel()) {
                    return b.getLevel() - a.getLevel();
                } else {
                    return a.getBase_id() - b.getBase_id();
                }
            }
        };
        var result = [];
        for (var k in this._petList) {
            var unit = this._petList[k];
            var isInBattle = unit.isInBattle();
            var isPetBless = unit.isPetBless();
            var same = G_UserData.getTeam().isHaveSamePet(unit.getBase_id(), filterId);
            cc.warn('TeamData:isHaveSamePet ' + (same))
            if (!isInBattle && !isPetBless && !same) {
                result.push(unit);
            }
        }
        result.sort(sortFun);
        return result;
    }
    private _s2cGetPet(id, message) {
        var pets = message['pets'];
        if (!pets) {
            return;
        }
        for (let i = 0; i < pets.length; i++) {
            var data = pets[i];
            this._setPetData(data);
        }
        this.setSortDataDirty(true);
        // G_SignalManager.dispatch(SignalConst.EVENT_GET_PET_SUCCESS);
    }

    public c2sPetRecycle(pet_ids) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_PetRecycle, { pet_ids: pet_ids });
    }
    public c2sActivePetPhoto(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActivePetPhoto, { id: id });
    }
    public _s2cPetRecycle(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var awards = message["awards"];
        if (!awards) {
        }
        this.setSortDataDirty(true);
        G_SignalManager.dispatch(SignalConst.EVENT_PET_RECOVERY_SUCCESS, awards);
    }
    public c2sPetOnTeam(pet_id, on_team_type, pos?) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_PetOnTeam, {
            pet_id: pet_id,
            on_team_type: on_team_type || 1,
            pos: pos
        });
    }
    public _s2cPetOnTeam(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var pet_id = message['pet_id'];
        if (pet_id == undefined) {
            return;
        }
        this.setSortDataDirty(true);
        G_SignalManager.dispatch(SignalConst.EVENT_PET_ON_TEAM_SUCCESS, pet_id);
    }
    public c2sPetReborn(pet_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_PetReborn, { pet_id: pet_id });
    }
    public _s2cPetReborn(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var awards = message['awards'];
        if (!awards) {
        }
        this.setSortDataDirty(true);
        G_SignalManager.dispatch(SignalConst.EVENT_PET_REBORN_SUCCESS, awards);
    }

    public c2sPetStarUp(pet_id, cost_pet_id, cost_base_pet_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_PetStarUp, {
            pet_id: pet_id,
            cost_pet_id: cost_pet_id,
            cost_base_pet_id: cost_base_pet_id
        });
    }
    public _s2cPetStarUp(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        cc.warn(' PetData:_s2cPetStarUp');
        this.setSortDataDirty(true);
        G_SignalManager.dispatch(SignalConst.EVENT_PET_STAR_UP_SUCCESS);
    }
    public c2sPetLevelUp(pet_id, materials) {
        cc.log(pet_id);
        cc.log(materials);
        G_NetworkManager.send(MessageIDConst.ID_C2S_PetLevelUp, {
            pet_id: pet_id,
            materials: materials
        });
    }
    public _s2cPetLevelUp(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setSortDataDirty(true);
        G_SignalManager.dispatch(SignalConst.EVENT_PET_LEVEL_UP_SUCCESS, message);
    }
    public _s2cActivePetPhoto(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_ACTIVE_PET_PHOTO_SUCCESS, message);
    }
    public _s2cGetActivePetPhoto(id, message) {
        this._petHandBookList = {};
        var petHandBookList = message['pet_photo'] || {};
        this._petHandBookList = petHandBookList;
        G_SignalManager.dispatch(SignalConst.EVENT_GET_ACTIVE_PET_PHOTO_SUCCESS, message);
    }
    public c2sPetRankUp(petId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_PetRankUp, { pet_id: petId });
    }

    public _s2cPetRankUp(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var new_pet_id = message['new_pet_id'];
        this.setCurPetId(new_pet_id);
        G_SignalManager.dispatch(SignalConst.EVENT_PET_LIMITUP_MATERIAL_SUCCESS, 0);
        G_SignalManager.dispatch(SignalConst.EVENT_PET_LIMITUP_SUCCESS);
    }
    public c2sPetPostRankUpMaterial(petId, item, index) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_PetPostRankUpMaterial, {
            pet_id: petId,
            materials: item,
            idx: index
        });
    }
    public _s2cPetPostRankUpMaterial(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var idx = message['idx'] || 0;
        G_SignalManager.dispatch(SignalConst.EVENT_PET_LIMITUP_MATERIAL_SUCCESS, idx);
    }
    public getPetCountWithBaseId(baseId) {
        var count = 0;
        for (var k in this._petList) {
            var data = this._petList[k];
            if (data.getBase_id() == baseId) {
                count = count + 1;
            }
        }
        return count;
    }
    public getSameCardCountWithBaseId(baseId, filterId?) {
        var result: any = [];
        for (var k in this._petList) {
            var data = this._petList[k];
            var isFilter = false;
            if (filterId && data.getId() == filterId) {
                isFilter = true;
            }
            if (data.getBase_id() == baseId && !data.isInBattle() && !data.isPetBless() && !data.isDidUpgrade() && !data.isDidBreak() && !isFilter) {
                result.push(data);
            }
        }
        return result;
    }

    public isHavePetNotInBattle() {
        for (var k in this._petList) {
            var unit = this._petList[k];
            var isInBattle = unit.isInBattle();
            var inInBless = unit.isPetBless();
            var same = G_UserData.getTeam().isHaveSamePet(unit.getBase_id());
            if (!isInBattle && !inInBless && !same) {
                return true;
            }
        }
        return false;
    }
    public getRecoveryList() {
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var isTrainA = a.isDidTrain() && 1 || 0;
            var isTrainB = b.isDidTrain() && 1 || 0;
            if (colorA != colorB) {
                return colorA - colorB;
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        if (this._cacheRecoveryList == null || this.isRebornDataDirty()) {
            var result: any = [];
            for (var k in this._petList) {
                var unit = this._petList[k];
                var heroConfig = unit.getConfig();
                var color = heroConfig.color;
                if (color > 1) {
                    var isInBattle = unit.isInBattle();
                    var isInHelp = unit.isPetBless();
                    if (!isInBattle && !isInHelp) {
                        result.push(unit);
                    }
                }
            }
            result.sort(sortFun);
            this._cacheRecoveryList = result;
            this.setRecoveryDataDirty(false);
        }
        return this._cacheRecoveryList;
    }

    public getRecoveryAutoList() {
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var isTrainA = a.isDidTrain() && 1 || 0;
            var isTrainB = b.isDidTrain() && 1 || 0;
            if (colorA != colorB) {
                return colorA - colorB;
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        if (this._cacheRecoveryAutoList == null || this.isRecoveryAutoDataDirty()) {
            var result: any = [];
            for (var k in this._petList) {
                var unit = this._petList[k];
                var petConfig = unit.getConfig();
                var color = petConfig.color;
                var isInBattle = unit.isInBattle();
                var isInHelp = unit.isPetBless();
                var initial_star = unit.getInitial_star();
                if (color > 1 && initial_star == 0) {
                    if (!isInBattle && !isInHelp) {
                        result.push(unit);
                    }
                }
            }
            result.sort(sortFun);
            this._cacheRecoveryAutoList = result;
            this.setRecoveryAutoDataDirty(false);
        }
        return this._cacheRecoveryAutoList;
    }

    public getRebornList() {
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var isTrainA = a.isDidTrain() && 1 || 0;
            var isTrainB = b.isDidTrain() && 1 || 0;
            if (colorA != colorB) {
                return colorA - colorB;
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        if (this._cacheRebornList == null || this.isRebornDataDirty()) {
            var result: any = [];
            for (var k in this._petList) {
                var unit = this._petList[k];
                var petConfig = unit.getConfig();
                var color = petConfig.color;
                if (color > 1) {
                    var isDidTrain = unit.isDidTrain();
                    if (isDidTrain) {
                        var isInBattle = unit.isInBattle();
                        var isInHelp = unit.isPetBless();
                        if (!isInBattle && !isInHelp) {
                            result.push(unit);
                        }
                    }
                }
            }
            result.sort(sortFun);
            this._cacheRebornList = result;
            this.setRebornDataDirty(false);
        }
        return this._cacheRebornList;
    }
    public isPetMapRedPoint() {
        var pet_map = this.petMapConfig;
        var result = {};
        var attrList = {};
        for (var loop = 1; loop < pet_map.length(); loop++) {
            var petMapData = pet_map.indexOf(loop);
            if (this.getPetMapState(petMapData.id) == 1) {
                return true;
            }
        }
        return false;
    }

    public getPetMapState(petMapId) {
        if (this.isPetMapShow(petMapId) == false) {
            return -1;
        }
        for (var i in this._petHandBookList) {
            var actId = this._petHandBookList[i];
            if (petMapId == actId) {
                return 2;
            }
        }
        if (this.isPetMapActive(petMapId) == false) {
            return 1;
        }
        return 0;
    }
    public getAllPetMapId() {
        var petIdList: any = [];
        var pet_map = this.petMapConfig;
        for (var loop = 0; loop < pet_map.length(); loop++) {
            var petMapData = pet_map.indexOf(loop);
            if (this.getPetMapState(petMapData.id) != -1) {
                for (var i = 1; i <= 3; i++) {
                    var petId = petMapData['pet' + i];
                    if (petId > 0) {
                        petIdList.push(petId);
                    }
                }
            }
        }
        return petIdList;
    }

    /**
     * TODO:FunctionCheck
     */
    public getShowPetNum() {
        var countShowNum = 0;
        var countOpenNum = 0;
        if (PetConst.SHOW_PET_NUM && PetConst.SHOW_PET_NUM > 0) {
            return PetConst.SHOW_PET_NUM;
        }
        // TODO:
        for (var index = FunctionConst.FUNC_PET_HELP_SLOT1; index <= FunctionConst.FUNC_PET_HELP_SLOT7; index++) {
            var isOpen = FunctionCheck.funcIsOpened(index)[0];
            var isShow = FunctionCheck.funcIsShow(index);
            if (isShow == true) {
                countShowNum = countShowNum + 1;
            }
            if (isOpen == true) {
                countOpenNum = countOpenNum + 1;
            }
        }
        return [
            countShowNum,
            countOpenNum
        ];
    }
    public isPetMapActive(petMapId) {
        var config = this.petMapConfig.get(petMapId);
        if (!config)
            alert("pet_map config can\'t find petMapId =" + petMapId);
        var petIdList: any = [];
        for (var i = 1; i <= 3; i++) {
            var petId = config['pet' + i];
            if (petId > 0) {
                petIdList.push(petId);
            }
        }
        for (var k in petIdList) {
            var value = petIdList[k];
            if (G_UserData.getPet().isPetHave(value) == false) {
                return true;
            }
        }
        return false;
    }




}