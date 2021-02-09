import { BaseData } from "./BaseData";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { HeroUnitData } from "./HeroUnitData";
import { InstrumentUnitData } from "./InstrumentUnitData";
import { TreasureUnitData } from "./TreasureUnitData";
import { EquipmentUnitData } from "./EquipmentUnitData";
import { AvatarUnitData } from "./AvatarUnitData";
import { PetUnitData } from "./PetUnitData";
import { SilkbagUnitData } from "./SilkbagUnitData";
import { ActivePhotoData } from "./ActivePhotoData";
import { SilkbagOnTeamUnitData } from "./SilkbagOnTeamUnitData";
import { HorseUnitData } from "./HorseUnitData";
import { HorseEquipmentUnitData } from "./HorseEquipmentUnitData";
import { FunctionConst } from "../const/FunctionConst";
import { G_ConfigLoader, G_UserData } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import TeamConst from "../const/TeamConst";
import { AvatarDataHelper } from "../utils/data/AvatarDataHelper";
import { HeroConst } from "../const/HeroConst";
import { table } from "../utils/table";
import { TacticsConst } from "../const/TacticsConst";
import { TacticsUnitData } from "./TacticsUnitData";
import { HistoryHeroUnit } from "./HistoryHeroUnit";
import { BoutUnit } from "./BoutUnit";

export interface UserDetailData {
}

var JADE_TYPE_EQUIPMENT = 0;
var JADE_TYPE_TREASURE = 1;
let schema = {};
export class UserDetailData extends BaseData {
    public static schema = schema;

    _baseId: number;
    _avatarId: number;
    _avatarBaseId: number;
    _name: string;
    _level: number;
    _officeLevel: number;
    _destiny;
    _heroList;
    _formation: Array<any>;
    _secondFormation;
    _equipmentList;
    _treasureList;
    _instrumentList;
    _avatarList;
    _petList;
    _onTeamPetId;
    _protectPetIds;
    _handbookList;
    _activePhoto;
    _silkbags;
    _silkbagPosTable;
    _horseList;
    _horseEquipList;

    _resourcePosTable;
    _homeTree;
    _historyHeroIds: {};
    _historyHeroList: {};
    _tacticsList: {};
    _tacticsUnlockList: {};
    _boutUnlockList: {};

    constructor(properties?) {
        super(properties);
        this._baseId = 0;
        this._avatarId = 0;
        this._avatarBaseId = 0;
        this._name = '';
        this._level = 0;
        this._officeLevel = 0;
        this._destiny = {};
        this._heroList = {};
        this._formation = [];
        this._secondFormation = {};
        this._equipmentList = {};
        this._treasureList = {};
        this._instrumentList = {};
        this._avatarList = {};
        this._petList = {};
        this._onTeamPetId = 0;
        this._protectPetIds = {};
        this._handbookList = {};
        this._activePhoto = {};
        this._silkbags = {};
        this._silkbagPosTable = {};
        this._horseList = {};
        this._horseEquipList = {};
        this._historyHeroIds = {};
        this._historyHeroList = {};
        this._tacticsList = {};
        this._tacticsUnlockList = {};
        this._boutUnlockList = {};
    }
    public clear() {
    }
    public reset() {
        this._baseId = 0;
        this._avatarId = 0;
        this._avatarBaseId = 0;
        this._name = '';
        this._level = 0;
        this._officeLevel = 0;
        this._destiny = {};
        this._heroList = {};
        this._formation = [];
        this._secondFormation = {};
        this._equipmentList = {};
        this._treasureList = {};
        this._resourcePosTable = {};
        this._instrumentList = {};
        this._avatarList = {};
        this._petList = {};
        this._onTeamPetId = 0;
        this._protectPetIds = {};
        this._handbookList = {};
        this._activePhoto = {};
        this._silkbags = {};
        this._silkbagPosTable = {};
        this._horseList = {};
        this._horseEquipList = {};
        this._historyHeroIds = {};
        this._historyHeroList = {};
        this._tacticsList = {};
        this._tacticsUnlockList = {};
        this._boutUnlockList = {};
    }
    public updateData(message) {
        this._baseId = message.base_id || 0;
        this._avatarId = message.avatar_id || 0;
        this._avatarBaseId = message.avatar_base_id || 0;
        this._name = message.name || '';
        this._level = message.level || 0;
        this._officeLevel = message.office_level || 0;
        this._destiny = message.destiny || {};
        let heros = message['heros'] || {};
        let formation = message['formation'] || {};
        let secondFormation = message['second_formation'] || {};
        let equipments = message['equipments'] || {};
        let treasures = message['treasures'] || {};
        let teamResource = message['team_resource'] || {};
        let instruments = message['instruments'] || {};
        let avatars = message['avatars'] || {};
        let pets = message['pets'] || {};
        this._onTeamPetId = message.on_team_pet_id || 0;
        let protectPetIds = message['protect_pet_ids'] || {};
        let resPhoto = message['res_photo'] || {};
        let activePhoto = message['active_photo'] || {};
        let silkbags = message['silkbags'] || {};
        let silkbagOnTeam = message['silkbag_team'] || {};
        let homeTree = message['home_tree'] || {};
        let horses = message['war_horses'] || {};
        let horseEquips = message['war_horse_equip'] || {};
        let jadeList = message['jade'] || {};
        var historyHeroIds = message['star_formation'] || {};
        var historyHeros = message['stars'] || {};
        var tacticsInfo = message['tacticsInfo'] || {};
        var tacticsUnlockInfo = message['tactics_unlock'] || {};
        var boutUnlockInfo = message['bout'] || {};
        this._baseId = UserDataHelper.convertToBaseIdByAvatarBaseId(this._avatarBaseId, this._baseId)[0];
        this._heroList = {};
        for (let i in heros) {
            let data = heros[i];
            let unitData = new HeroUnitData();
            unitData.updateData(data);
            this._heroList['k_' + String(data.id)] = unitData;
        }
        this._formation = formation;
        this._secondFormation = secondFormation;
        this._equipmentList = {};
        for (let i in equipments) {
            let data = equipments[i];
            let unitData = new EquipmentUnitData();
            unitData.updateData(data);
            this._equipmentList['k_' + String(data.id)] = unitData;
        }
        this._treasureList = {};
        for (let i in treasures) {
            let data = treasures[i];
            let unitData = new TreasureUnitData();
            unitData.updateData(data);
            this._treasureList['k_' + String(data.id)] = unitData;
        }
        this._instrumentList = {};
        for (let i in instruments) {
            let data = instruments[i];
            let unitData = new InstrumentUnitData();
            unitData.updateData(data);
            this._instrumentList['k_' + String(data.id)] = unitData;
        }
        this._avatarList = {};
        for (let i in avatars) {
            let data = avatars[i];
            let unitData = new AvatarUnitData();
            unitData.updateData(data);
            this._avatarList['k_' + String(data.id)] = unitData;
        }
        this._resourcePosTable = {};
        for (let i in teamResource) {
            let data = teamResource[i];
            if (data.id > 0) {
                let pos = data.pos;
                let flag = data.flag;
                let slot = data.slot;
                if (this._resourcePosTable[pos] == null) {
                    this._resourcePosTable[pos] = {};
                }
                if (this._resourcePosTable[pos][flag] == null) {
                    this._resourcePosTable[pos][flag] = {};
                }
                this._resourcePosTable[pos][flag][slot] = data.id;
            }
        }
        this._petList = {};
        for (let i in pets) {
            let data = pets[i];
            let unitData = new PetUnitData();
            unitData.updateData(data);
            this._petList['k_' + String(data.id)] = unitData;
        }
        this._protectPetIds = protectPetIds;
        this._handbookList = {};
        for (let i in resPhoto) {
            let data = resPhoto[i];
            this._handbookList['k' + data.res_type] = this._handbookList['k' + data.res_type] || {};
            this._handbookList['k' + data.res_type]['k' + data.res_id] = true;
        }
        this._activePhoto = {};
        for (let i in activePhoto) {
            let data = activePhoto[i];
            let unitData = new ActivePhotoData(data);
            let type = unitData.getActive_type();
            let id = unitData.getActive_id();
            this._activePhoto['k' + type] = this._activePhoto['k' + type] || [];
            this._activePhoto['k' + type].push(id);
        }
        this._silkbags = {};
        for (let i in silkbags) {
            let data = silkbags[i];
            let unitData = new SilkbagUnitData(data);
            this._silkbags['k_' + String(data.id)] = unitData;
        }
        this._silkbagPosTable = {};
        for (let i in silkbagOnTeam) {
            let data = silkbagOnTeam[i];
            let unitData = new SilkbagOnTeamUnitData(data);
            let pos = unitData.getPos();
            let index = unitData.getIndex();
            let silkbagId = unitData.getSilkbag_id();
            if (this._silkbagPosTable[pos] == null) {
                this._silkbagPosTable[pos] = {};
            }
            this._silkbagPosTable[pos][index] = silkbagId;
        }
        this._homeTree = {};
        this._homeTree = homeTree;
        this._horseList = {};
        for (let i in horses) {
            let data = horses[i];
            let unitData = new HorseUnitData();
            unitData.updateData(data);
            this._horseList['k_' + String(data.id)] = unitData;
        }
        this._horseEquipList = {};
        for (let i in horseEquips) {
            let data = horseEquips[i];
            let unitData = new HorseEquipmentUnitData();
            unitData.updateData(data);
            this._horseEquipList['k_' + String(data.id)] = unitData;
        }
        this._historyHeroIds = historyHeroIds;
        this._historyHeroList = {};
        for (var i in historyHeros) {
            var data = historyHeros[i];
            let unitData = new HistoryHeroUnit();
            unitData.updateData(data);
            this._historyHeroList['k_' + String(data.id)] = unitData;
        }
        this._tacticsList = {};
        for (let i in tacticsInfo) {
            var data = tacticsInfo[i];
            let unitData = new TacticsUnitData();
            unitData.updateData(data);
            this._tacticsList['k_' + String(data.tactics_id)] = unitData;
        }
        this._tacticsUnlockList = {};
        for (let i in tacticsUnlockInfo) {
            var data = tacticsUnlockInfo[i];
            var pos = data['pos'];
            if (pos != null && pos != 0) {
                this._tacticsUnlockList[pos] = data.slots;
            }
        }
        this._boutUnlockList = {};
        for (i in boutUnlockInfo) {
            var value = boutUnlockInfo[i];
            if (!this._boutUnlockList[value.id]) {
                this._boutUnlockList[value.id] = {};
            }
            var boutUnit = new BoutUnit(value);
            this._boutUnlockList[value.id][value.pos] = boutUnit;
        }
        this._constructUserEquipmentJadeData(jadeList);
    }

    getUnitDataListWithPos(pos) {
        var list = [];
        var heroId = this._formation[pos];
        for (var k in this._tacticsList) {
            var data = this._tacticsList[k];
            if (data.getHero_id() == heroId) {
                table.insert(list, data);
            }
        }
        return list;
    }
    getBoutAttr() {
        return G_UserData.getBout().getAttrSingleInfo(this._boutUnlockList);
    }
    getBoutPower() {
        return G_UserData.getBout().getPowerSingleInfo(this._boutUnlockList);
    }

    public _constructUserEquipmentJadeData(jadeList) {
        for (var i in jadeList) {
            var data = jadeList[i];
            if (data.equiped_type == JADE_TYPE_EQUIPMENT) {
                var unitData = this._equipmentList['k_' + String(data.equipment_id)];
                if (unitData) {
                    let jades = unitData.getJades();
                    for (var j = 0; j < jades.length; j++) {
                        if (data.id == jades[j]) {
                            unitData.setUserDetailJades(j, data.sys_id);
                        }
                    }
                }
            } else if (data.equiped_type == JADE_TYPE_TREASURE) {
                var unitData = this._treasureList['k_' + String(data.equipment_id)];
                if (unitData) {
                    let jades = unitData.getJades();
                    for (var j = 0; j < jades.length; j++) {
                        if (data.id == jades[j]) {
                            unitData.setUserDetailJades(j, data.sys_id);
                        }
                    }
                }
            }
        }
    }
    public isShowEquipJade() {
        let funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3);
        let isShow = this.getLevel() >= funcLevelInfo.level;
        return isShow;
    }
    isShowTreasureJade() {
        var funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3);
        var isShow = this.getLevel() >= funcLevelInfo.level;
        return isShow;
    }
    public getFormation() {
        return this._formation;
    }
    public getHeroDataWithId(id) {
        let data = this._heroList['k_' + id];
        return data;
    }
    public getHeroCount() {
        let count = 0;
        for (let i in this._formation) {
            let id = this._formation[i];
            if (id > 0) {
                count = count + 1;
            }
        }
        return count;
    }
    /**
     * 
     * @param pos 下标位置从1走
     */
    public getHeroDataWithPos(pos) {
        let heroId = this._formation[pos - 1];
        if (heroId > 0) {
            let data = this._heroList['k_' + heroId];
            return data;
        }
        return null;
    }
    getTacticsPosState(pos, slot) {
        var isOpen = this.funcIsOpened(FunctionConst['FUNC_TACTICS_POS' + slot]);
        if (!isOpen) {
            return [TacticsConst.STATE_LOCK_LEVEL, null];
        }
        var heroUnitData = this.getHeroDataWithPos(pos);
        var slotList = this._tacticsUnlockList[pos] || {};
        var find = false;
        for (var _ in slotList) {
            var v = slotList[_];
            if (slot == v) {
                find = true;
                break;
            }
        }
        if (!find && slot != 1) {
            return [TacticsConst.STATE_LOCK, null];
        }
        var heroId = heroUnitData.getId();
        var tacticsUnitData = null;
        for (_ in this._tacticsList) {
            var unitData = this._tacticsList[_];
            if (unitData.getHero_id() == heroId && unitData.getPos() == slot) {
                tacticsUnitData = unitData;
                break;
            }
        }
        if (tacticsUnitData) {
            return [
                TacticsConst.STATE_WEARED,
                tacticsUnitData
            ];
        } else {
            return [TacticsConst.STATE_EMPTY, null];
        }
    }
    public getPosState(pos) {
        let count = this.getHeroCount();
        if (pos <= count) {
            return TeamConst.STATE_HERO;
        } else {
            return TeamConst.STATE_LOCK;
        }
    }
    public getEquipDataWithId(id) {
        return this._equipmentList['k_' + String(id)];
    }
    public getEquipData(pos, slot) {
        if (this._resourcePosTable[pos] == null) {
            return null;
        }
        if (this._resourcePosTable[pos][1] == null) {
            return null;
        }
        let equipId = this._resourcePosTable[pos][1][slot];
        if (equipId) {
            return this._equipmentList['k_' + String(equipId)];
        }
    }
    public getTreasureDataWithId(id) {
        return this._treasureList['k_' + String(id)];
    }
    public getTreasureData(pos, slot) {
        if (this._resourcePosTable[pos] == null) {
            return null;
        }
        if (this._resourcePosTable[pos][2] == null) {
            return null;
        }
        let treasureId = this._resourcePosTable[pos][2][slot];
        if (treasureId) {
            return this._treasureList['k_' + String(treasureId)];
        }
    }
    public getInstrumentDataWithId(id) {
        return this._instrumentList['k_' + String(id)];
    }
    public getInstrumentData(pos, slot) {
        if (this._resourcePosTable[pos] == null) {
            return null;
        }
        if (this._resourcePosTable[pos][3] == null) {
            return null;
        }
        let instrumentId = this._resourcePosTable[pos][3][slot];
        if (instrumentId) {
            return this._instrumentList['k_' + String(instrumentId)];
        }
    }
    public getHorseDataWithId(id) {
        return this._horseList['k_' + String(id)];
    }
    public getHorseData(pos, slot) {
        if (this._resourcePosTable[pos] == null) {
            return null;
        }
        if (this._resourcePosTable[pos][4] == null) {
            return null;
        }
        let horseId = this._resourcePosTable[pos][4][slot];
        if (horseId) {
            return this._horseList['k_' + String(horseId)];
        }
    }
    public getHorseEquipData() {
        return this._horseEquipList;
    }
    getHistoryHeroData(pos) {
        if (this._historyHeroIds[pos - 1] == null) {
            return null;
        }
        var historyHeroId = this._historyHeroIds[pos - 1];
        if (historyHeroId) {
            return this._historyHeroList['k_' + String(historyHeroId)];
        }
    }
    public getSecondFormation() {
        return this._secondFormation;
    }
    public getHeroDataInBattle() {
        let result = [];
        for (let i in this._formation) {
            let id = this._formation[i];
            if (id > 0) {
                let data = this._heroList['k_' + String(id)];
                result.push(data);
            }
        }
        return result;
    }
    public getHeroDataInReinforcements() {
        let result = {};
        for (let i in this._secondFormation) {
            let id = this._secondFormation[i];
            if (id > 0) {
                let data = this._heroList['k_' + String(id)];
                result[i] = data;
            }
        }
        return result;
    }
    public getBaseId() {
        return this._baseId;
    }
    public getAvatarToHeroBaseId(heroUnitData) {
        let heroBaseId = heroUnitData.getBase_id();
        if (heroUnitData.isLeader() && this._avatarBaseId > 0) {
            heroBaseId = AvatarDataHelper.getAvatarConfig(this._avatarBaseId).hero_id;
        }
        return heroBaseId;
    }
    public getUserLeaderLimitLevel(heroUnitData) {
        if (heroUnitData.isLeader() && this._avatarBaseId > 0) {
            let limit = AvatarDataHelper.getAvatarConfig(this._avatarBaseId).limit;
            if (limit == 1) {
                return HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
            }
        }
        return heroUnitData.getLimit_level();
    }
    getUserLeaderRedLimitLevel(heroUnitData) {
        return 0;
    }
    public getAvatarId() {
        return this._avatarId;
    }
    public getAvatarBaseId() {
        return this._avatarBaseId;
    }
    public getName() {
        return this._name;
    }
    public getLevel() {
        return this._level;
    }
    public getOfficeLevel() {
        return this._officeLevel;
    }
    public isKarmaActivated(karmaId) {
        for (let i in this._destiny) {
            let id = this._destiny[i];
            if (id == karmaId) {
                return true;
            }
        }
        return false;
    }
    /**
     * 
     * @param unitData 
     * @return 下标位置从1走
     */
    public getHeroPos(unitData) {
        let heroId = unitData.getId();
        for (let i in this._formation) {
            let id = this._formation[i];
            if (id == heroId) {
                return parseInt(i) + 1;
            }
        }
        return null;
    }
    public getEquipDatasWithPos(pos) {
        let result = [];
        for (let i = 1; i <= 4; i++) {
            let data = this.getEquipData(pos, i);
            if (data) {
                result.push(data);
            }
        }
        return result;
    }
    public getEquipInfoWithPos(pos) {
        if (this._resourcePosTable[pos] == null) {
            return {};
        }
        if (this._resourcePosTable[pos][1] == null) {
            return {};
        }
        let result = {};
        for (let k in this._resourcePosTable[pos][1]) {
            let id = this._resourcePosTable[pos][1][k];
            result[k] = id;
        }
        return result;
    }
    public isHaveEquipInPos(baseId, pos) {
        let datas = this.getEquipDatasWithPos(pos);
        for (let i in datas) {
            let data = datas[i];
            if (data.getBase_id() == baseId) {
                return true;
            }
        }
        return false;
    }
    public getTreasureDatasWithPos(pos) {
        let result = [];
        for (let i = 1; i <= 2; i++) {
            let data = this.getTreasureData(pos, i);
            if (data) {
                result.push(data);
            }
        }
        return result;
    }
    public getTreasureInfoWithPos(pos) {
        if (this._resourcePosTable[pos] == null) {
            return {};
        }
        if (this._resourcePosTable[pos][2] == null) {
            return {};
        }
        let result = {};
        for (let k in this._resourcePosTable[pos][2]) {
            let id = this._resourcePosTable[pos][2][k];
            result[k] = id;
        }
        return result;
    }
    public getInstrumentDatasWithPos(pos) {
        let result = [];
        for (let i = 1; i <= 1; i++) {
            let data = this.getInstrumentData(pos, i);
            if (data) {
                result.push(data);
            }
        }
        return result;
    }
    public getInstrumentInfoWithPos(pos) {
        if (this._resourcePosTable[pos] == null) {
            return {};
        }
        if (this._resourcePosTable[pos][3] == null) {
            return {};
        }
        let result = {};
        for (let k in this._resourcePosTable[pos][3]) {
            let id = this._resourcePosTable[pos][3][k];
            result[k] = id;
        }
        return result;
    }
    public getHorseDatasWithPos(pos) {
        let result = [];
        for (let i = 1; i <= 1; i++) {
            let data = this.getHorseData(pos, i);
            if (data) {
                result.push(data);
            }
        }
        return result;
    }
    public isInBattle(unitData) {
        for (let i in this._formation) {
            let id = this._formation[i];
            if (id == unitData.getId()) {
                return true;
            }
        }
        return false;
    }
    public isEquipAvatar() {
        let avatarId = this.getAvatarId();
        return avatarId > 0;
    }
    public getAvatarUnitDataWithId(avatarId) {
        let unitData = this._avatarList['k_' + String(avatarId)];
        return unitData;
    }
    public isHaveAvatarWithBaseId(baseId) {
        for (let k in this._avatarList) {
            let unit = this._avatarList[k];
            if (unit.getBase_id() == baseId) {
                return true;
            }
        }
        return false;
    }
    public getOnTeamPetId() {
        return this._onTeamPetId;
    }
    public getPetUnitDataWithId(id) {
        let unitData = this._petList['k_' + String(id)];
        return unitData;
    }
    public getProtectPetIds() {
        let result = [];
        for (let i in this._protectPetIds) {
            let petId = this._protectPetIds[i];
            if (petId > 0) {
                result.push(petId);
            }
        }
        return result;
    }
    public isPetHave(baseId) {
        let avatarPhoto = this._activePhoto['k' + ActivePhotoData.PET_TYPE] || {};
        for (let i in avatarPhoto) {
            let id = avatarPhoto[i];
            if (id == baseId) {
                return true;
            }
        }
        return false;
    }
    public getHorseKarmaInfo() {
        return this._activePhoto['k' + ActivePhotoData.HORSE_TYPE] || {};
    }
    public funcIsShow(funcId) {
        let funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(funcId);
        console.assert(funcLevelInfo, 'Invalid function_level can not find funcId ' + funcId);
        if (funcLevelInfo.show_level <= this._level) {
            return true;
        }
        return false;
    }
    public getAllOwnAvatarShowInfo() {
        let result = [];
        let avatarPhoto = this._activePhoto['k' + ActivePhotoData.AVATAR_TYPE] || {};
        for (let i in avatarPhoto) {
            let id = avatarPhoto[i];
            let info = AvatarDataHelper.getAvatarShowConfig(id);
            result.push(info);
        }
        return result;
    }
    public getSilkbagIdWithPosAndIndex(pos, index) {
        if (this._silkbagPosTable[pos] == null) {
            return 0;
        }
        let silkbagId = this._silkbagPosTable[pos][index] || 0;
        return silkbagId;
    }
    public getSilkbagIdsOnTeamWithPos(pos) {
        let result = [];
        let posTable = this._silkbagPosTable[pos] || {};
        for (let k in posTable) {
            let silkbagId = posTable[k];
            if (silkbagId > 0) {
                result.push(silkbagId);
            }
        }
        return result;
    }
    public getSilkbagUnitDataWithId(id) {
        let unitData = this._silkbags['k_' + String(id)];
        return unitData;
    }
    public isInstrumentLevelMaxWithPos(pos) {
        let datas = this.getInstrumentDatasWithPos(pos);
        let unitData = datas[1];
        if (unitData) {
            let level = unitData.getLevel();
            let maxLevel = unitData.getConfig().level_max;
            if (level >= maxLevel) {
                return true;
            }
        }
        return false;
    }
    public getHomeTree() {
        return this._homeTree;
    }
    public funcIsOpened(funcId) {
        let funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(funcId);
        console.assert(funcLevelInfo, 'Invalid function_level can not find funcId ' + funcId);
        return this._level >= funcLevelInfo.level;
    }
}
