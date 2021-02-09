import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_UserData, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { SignalConst } from "../const/SignalConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { TreasureUnitData } from "./TreasureUnitData";
import { FunctionConst } from "../const/FunctionConst";
import { TeamDataHelper } from "../utils/data/TeamDataHelper";
import { TreasureDataHelper } from "../utils/data/TreasureDataHelper";
import { HeroDataHelper } from "../utils/data/HeroDataHelper";

export interface TreasureData {
    getCurTreasureId(): number
    setCurTreasureId(value: number): void
    getLastCurTreasureId(): number
}
let schema = {};
schema['curTreasureId'] = [
    'number',
    0
];
export class TreasureData extends BaseData{
    public static schema = schema;
    _limitOrgRelationMap: {};
    constructor(){
        super();

        this._treasureList = {};
        this._recvGetTreasure = G_NetworkManager.add(MessageIDConst.ID_S2C_GetTreasure, this._s2cGetTreasure.bind(this));
        this._recvEquipTreasure = G_NetworkManager.add(MessageIDConst.ID_S2C_EquipTreasure, this._s2cEquipTreasure.bind(this));
        this._recvRemoveTreasure = G_NetworkManager.add(MessageIDConst.ID_S2C_RemoveTreasure, this._s2cRemoveTreasure.bind(this));
        this._recvUpgradeTreasure = G_NetworkManager.add(MessageIDConst.ID_S2C_UpgradeTreasure, this._s2cUpgradeTreasure.bind(this));
        this._recvRefineTreasure = G_NetworkManager.add(MessageIDConst.ID_S2C_RefineTreasure, this._s2cRefineTreasure.bind(this));
        this._recvRecoveryTreasure = G_NetworkManager.add(MessageIDConst.ID_S2C_TreasureRecycle, this._s2cRecoveryTreasure.bind(this));
        this._recvRebornTreasure = G_NetworkManager.add(MessageIDConst.ID_S2C_RebornTreasure, this._s2cRebornTreasure.bind(this));
        this._recvTreasureTransform = G_NetworkManager.add(MessageIDConst.ID_S2C_TreasureTransform, this._s2cTreasureTransform.bind(this));
        this._recvTreasureLimitCost = G_NetworkManager.add(MessageIDConst.ID_S2C_TreasureLimitCost, this._s2cTreasureLimitCost.bind(this));
        this._initLimitRelationMap();

        TreasureUnitData._initLimitMaxLvMap();

    }
    
    private _treasureList;
    private _recvGetTreasure;
    private _recvEquipTreasure;
    private _recvRemoveTreasure;
    private _recvUpgradeTreasure;
    private _recvRefineTreasure;
    private _recvRecoveryTreasure;
    private _recvRebornTreasure;
    private _recvTreasureTransform;
    private _recvTreasureLimitCost;
    private _limitRelationMap;
    clear() {
        this._recvGetTreasure.remove();
        this._recvGetTreasure = null;
        this._recvEquipTreasure.remove();
        this._recvEquipTreasure = null;
        this._recvRemoveTreasure.remove();
        this._recvRemoveTreasure = null;
        this._recvUpgradeTreasure.remove();
        this._recvUpgradeTreasure = null;
        this._recvRefineTreasure.remove();
        this._recvRefineTreasure = null;
        this._recvRecoveryTreasure.remove();
        this._recvRecoveryTreasure = null;
        this._recvRebornTreasure.remove();
        this._recvRebornTreasure = null;
        this._recvTreasureTransform.remove();
        this._recvTreasureTransform = null;
        this._recvTreasureLimitCost.remove();
        this._recvTreasureLimitCost = null;
    }
    _initLimitRelationMap() {
        this._limitRelationMap = {};
        this._limitOrgRelationMap = {};
        var Config = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE);
        for (var i = 0;i<Config.length();i++) {
            var info = Config.indexOf(i);
            var id = info.id;
            var limitUpId = info.limit_up_id;
            if (limitUpId > 0) {
                if (this._limitRelationMap[id]) {
                    this._limitRelationMap[limitUpId] = this._limitRelationMap[id];
                } else {
                    this._limitRelationMap[limitUpId] = id;
                }
                this._limitOrgRelationMap[limitUpId] = id;
            }
        }
    }
    getLimitSrcId(id) {
        var srcId = this._limitRelationMap[id];
        if(!srcId)
        cc.error('treasure config can not find limit_up_id = %d'+id);
        return srcId;
    }

    getLimitOrgSrcId(id) {
        var srcId = this._limitOrgRelationMap[id];
        if(!srcId)
        cc.error('treasure config can not find limit_up_id = %d'+id);
        return srcId;
    }

    createTempTreasureUnitData(baseId) {
        var baseData:any = {};
        baseData.id = 0;
        baseData.base_id = baseId || 1;
        baseData.user_id = 1;
        baseData.level = 1;
        baseData.exp = 1;
        baseData.refine_level = 0;
        if (baseId && typeof(baseId) == 'object') {
            var data = baseId;
            baseData.base_id = data.baseId || 1;
            baseData.level = data.level || 1;
            baseData.refine_level = data.refine_level || 0;
        }
        var unitData = new TreasureUnitData();
        unitData.updateData(baseData);
        return unitData;
    }
    reset() {
        this._treasureList = {};
    }
    _setTreasureData(data) {
        this._treasureList['k_' + (data.id)] = null;
        var unitData = new TreasureUnitData();
        unitData.updateData(data);
        this._treasureList['k_' + (data.id)] = unitData;
    }
    _s2cGetTreasure(id, message) {
        this._treasureList = {};
        var treasureList = message['treasures'] || {};
        for (var i in treasureList) {
            var data = treasureList[i];
            this._setTreasureData(data);
        }
    }
    getTreasureDataWithId(id) {
        return this._treasureList['k_' + (id)];
    }
    updateData(data) {
        if (data == null || typeof(data) != 'object') {
            return;
        }
        if (this._treasureList == null) {
            return;
        }
        for (var i = 0;i<data.length;i++) {
            this._setTreasureData(data[i]);
        }
    }
    insertData(data) {
        if (data == null || typeof(data) != 'object') {
            return;
        }
        if (this._treasureList == null) {
            return;
        }
        for (var i = 0;i<data.length;i++) {
            this._setTreasureData(data[i]);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TREASURE);
    }
    deleteData(data) {
        if (data == null || typeof(data) != 'object') {
            return;
        }
        if (this._treasureList == null) {
            return;
        }
        for (var i = 0;i<data.length;i++) {
            var id = data[i];
            // this._treasureList['k_' + (id)] = null;
            delete this._treasureList['k_' + (id)];
        }
    }
    getTreasureTotalCount() {
        var count = 0;
        for (var k in this._treasureList) {
            var v = this._treasureList[k];
            count = count + 1;
        }
        return count;
    }
    getTreasureCountWithBaseId(baseId) {
        var count = 0;
        for (var k in this._treasureList) {
            var data = this._treasureList[k];
            if (data.getBase_id() == baseId) {
                count = count + 1;
            }
        }
        return count;
    }
    getTreasureIdWithBaseId(baseId) {
        for (var k in this._treasureList) {
            var data = this._treasureList[k];
            if (data.getBase_id() == baseId) {
                return data.getId();
            }
        }
        return null;
    }
    getListDataBySort() {
        var result:any[] = [];
        var wear:any[]= [];
        var noWear:any[]= [];
        var expTreasure:any[] = [];
        var sortFun1 = function (a, b) {
            var configA = a.getConfig();
            var configB = b.getConfig();
            if (configA.color != configB.color) {
                return configB.color - configA.color;
            } else if (a.getLevel() != b.getLevel()) {
                return b.getLevel()-a.getLevel();
            } else if (a.getRefine_level() != b.getRefine_level()) {
                return b.getRefine_level()-a.getRefine_level();
            } else {
                return configA.id - configB.id;
            }
        }
        var sortFun2= function (a, b) {
            if (a.getConfig().color != b.getConfig().color) {
                return b.getConfig().color - a.getConfig().color;
            } else {
                return a.getConfig().id - b.getConfig().id;
            }
        }
        for (var k in this._treasureList) {
            var unit = this._treasureList[k];
            if (unit.getConfig().treasure_type != 0) {
                var isInBattle = unit.isInBattle();
                if (isInBattle) {
                    wear.push(unit);
                } else {
                    noWear.push(unit);
                }
            } else {
                expTreasure.push(unit);
            }
        }
        wear.sort(sortFun1);
        noWear.sort(sortFun1);
        expTreasure.sort(sortFun2);
        for (var i in wear) {
            var unit = wear[i];
            result.push(unit.getId());
        }
        for (let i in noWear) {
            var unit = noWear[i];
            result.push(unit.getId());
        }
        for (let i in expTreasure) {
            var unit = expTreasure[i];
            result.push(unit.getId());
        }
        return result;
    }
    getRangeDataBySort() {
        var result:any[] = [];
        var wear:any[] = [];
        var noWear:any[] = [];
        function sortFun1(a, b) {
            var configA = a.getConfig();
            var configB = b.getConfig();
            if (configA.color != configB.color) {
                return  configB.color - configA.color;
            } else if (a.getLevel() != b.getLevel()) {
                return  b.getLevel()-a.getLevel();
            } else if (a.getRefine_level() != b.getRefine_level()) {
                return b.getRefine_level()-a.getRefine_level();
            } else {
                return configA.id - configB.id;
            }
        }
        for (var k in this._treasureList) {
            var unit = this._treasureList[k];
            if (unit.getConfig().treasure_type != 0) {
                var isInBattle = unit.isInBattle();
                if (isInBattle) {
                    wear.push(unit);
                } else {
                    noWear.push(unit);
                }
            }
        }
        wear.sort(sortFun1);
        noWear.sort(sortFun1);
        for (var i in wear) {
            var unit = wear[i];
            result.push(unit.getId());
        }
        for (let i in noWear) {
            var unit = noWear[i];
            result.push(unit.getId());
        }
        return result;
    }
    getReplaceTreasureListWithSlot(pos, slot):Array<any> {
        var result:any = [];
        var wear:any= [];
        var noWear:any = [];
        var sortFun = function (a, b) {
            var configA = a.getConfig();
            var configB = b.getConfig();
            var reA:boolean = false;
            var reB:boolean = false;
            if(a.isYokeRelation)
            reA = a.isYokeRelation();
            if(b.isYokeRelation)
            reB = b.isYokeRelation();
            var yokeA = reA == true && 1 || 0;
            var yokeB = reB == true && 1 || 0;
            if (yokeA != yokeB) {
                return yokeB - yokeA;
            } else if (configA.color != configB.color) {
                return configB.color - configA.color;
            } else if (configA.potential != configB.potential) {
                return configB.potential - configA.potential;
            } else if (a.getLevel() != b.getLevel()) {
                return b.getLevel() - a.getLevel();
            } else if (a.getRefine_level() != b.getRefine_level()) {
                return b.getRefine_level() - a.getRefine_level();
            } else {
                return configA.id - configB.id;
            }
        }
        var heroBaseId = TeamDataHelper.getHeroBaseIdWithPos(pos);
        var fateIdInfos = HeroDataHelper.getHeroYokeInfosByConfig(heroBaseId);
        for (var k in this._treasureList) {
            var data = this._treasureList[k];
            if (data.getConfig().treasure_type == slot) {
                var isYoke = TreasureDataHelper.isHaveYokeBetweenHeroAndTreasured2(fateIdInfos, data.getBase_id());
                data.setYokeRelation(isYoke);
                var battleData = G_UserData.getBattleResource().getTreasureDataWithId(data.getId());
                if (battleData) {
                    if (battleData.getPos() != pos) {
                        wear.push(data);
                    }
                } else {
                    noWear.push(data);
                }
            }
        }
        wear.sort(sortFun);
        noWear.sort(sortFun);
        for (var i in noWear) {
            var data = noWear[i];
            result.push(data);
        }
        for (let i in wear) {
            var data = wear[i];
            result.push(data);
        }
        return [
            result,
            noWear,
            wear
        ];
    }
    getStrengthenFoodListBySort(filterId) {
        var result:any = [];
        var sortFun = function (a, b) {
            var typeA = a.getConfig().treasure_type;
            var typeB = b.getConfig().treasure_type;
            var expA = a.getConfig().treasure_exp + a.getExp();
            var expB = b.getConfig().treasure_exp + b.getExp();
            if (typeA != typeB) {
                return typeA - typeB;
            } else if (expA != expB) {
                return expA - expB;
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        for (var k in this._treasureList) {
            var unit = this._treasureList[k];
            var treasureId = unit.getId();
            var isDidRefine = unit.isDidRefine();
            var isInBattle = unit.isInBattle();
            if (!isDidRefine && treasureId != filterId && !isInBattle) {
                result.push(unit);
            }
        }
        result.sort(sortFun);
        return result;
    }
    getStrengthenFoodeAutoListBySort(addedFoodsData, filterId) {
        var result:any = [];
        var isAdded = function (foodData) {
            for (var k in addedFoodsData) {
                var food = addedFoodsData[k];
                if (food.getId() == foodData.getId()) {
                    return true;
                }
            }
            return false;
        };
        var sortFun = function (a, b) {
            var typeA = a.getConfig().treasure_type;
            var typeB = b.getConfig().treasure_type;
            var expA = a.getConfig().treasure_exp + a.getExp();
            var expB = b.getConfig().treasure_exp + b.getExp();
            if (typeA != typeB) {
                return typeA - typeB;
            } else if (expA != expB) {
                return expA - expB;
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        for (var k in this._treasureList) {
            var unit = this._treasureList[k];
            var treasureId = unit.getId();
            var isDidRefine = unit.isDidRefine();
            var isInBattle = unit.isInBattle();
            if (!isDidRefine && treasureId != filterId && !isInBattle) {
                result.push(unit);
            }
        }
        result.sort(sortFun);
        return result;
    }
    getSameCardsWithBaseId(baseId) {
        var result:any= [];
        for (var k in this._treasureList) {
            var data = this._treasureList[k];
            if (data.getBase_id() == baseId && !data.isInBattle() && !data.isDidStrengthen() && !data.isDidRefine()) {
                result.push(data);
            }
        }
        return result;
    }
    getRecoveryList() {
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var isTrainA = a.isDidTrain() && 1 || 0;
            var isTrainB = b.isDidTrain() && 1 || 0;
            if (colorA != colorB) {
                return colorA - colorB;
            } else if (isTrainA != isTrainB) {
                return isTrainA - isTrainB;
            } else if (a.getRefine_level() != b.getRefine_level()) {
                return a.getRefine_level() - b.getRefine_level();
            } else if (a.getLevel() != b.getLevel()) {
                return a.getLevel() - b.getLevel();
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        var result:any= [];
        for (var k in this._treasureList) {
            var unit = this._treasureList[k];
            var treasureConfig = unit.getConfig();
            var treasureType = treasureConfig.treasure_type;
            var isInBattle = unit.isInBattle();
            if (!isInBattle) {
                result.push(unit);
            }
        }
        result.sort(sortFun);
        return result;
    }
    getTransformList() {
        var sortFun = function (a, b) {
            var configA = a.getConfig();
            var configB = b.getConfig();
            if (configA.color != configB.color) {
                return configA.color - configB.color;
            } else if (a.getLevel() != b.getLevel()) {
                return a.getLevel() - b.getLevel();
            } else if (a.getRefine_level() != b.getRefine_level()) {
                return a.getRefine_level() - b.getRefine_level();
            } else {
                return configA.id - configB.id;
            }
        }
        var result:any[]= [];
        var wear:any[]= [];
        var noWear:any[]= [];
        for (var k in this._treasureList) {
            var unit = this._treasureList[k];
            var treasureConfig = unit.getConfig();
            var treasureType = treasureConfig.treasure_type;
            var color = treasureConfig.color;
            if (treasureType != 0) {
                var pos = unit.getPos();
                if (!pos && (color == 5 && color <= 7)) {
                    var isInBattle = unit.isInBattle();
                    if (isInBattle) {
                        wear.push(unit);
                    } else {
                        noWear.push(unit);
                    }
                }
            }
        }
        wear.sort(sortFun);
        noWear.sort(sortFun);
        for (var i in wear) {
            var unit = wear[i];
            result.push(unit);
        }
        for (let i in noWear) {
            var unit = noWear[i];
            result.push(unit);
        }
        return result;
    }
    getRecoveryAutoList() {
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var isTrainA = a.isDidTrain() && 1 || 0;
            var isTrainB = b.isDidTrain() && 1 || 0;
            if (colorA != colorB) {
                return colorA - colorB;
            } else if (isTrainA != isTrainB) {
                return isTrainA - isTrainB;
            } else if (a.getRefine_level() != b.getRefine_level()) {
                return a.getRefine_level() - b.getRefine_level();
            } else if (a.getLevel() != b.getLevel()) {
                return a.getLevel() - b.getLevel();
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        var result:any[] = [];
        for (var k in this._treasureList) {
            var unit = this._treasureList[k];
            var treasureConfig = unit.getConfig();
            var treasureType = treasureConfig.treasure_type;
            var color = treasureConfig.color;
            if (treasureType != 0) {
                var isInBattle = unit.isInBattle();
                if (!isInBattle && color < 5) {
                    result.push(unit);
                }
            }
        }
        result.sort(sortFun);
        return result;
    }
    getRebornList() {
        var result:any[] = [];
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var isTrainA = a.isDidTrain() && 1 || 0;
            var isTrainB = b.isDidTrain() && 1 || 0;
            if (colorA != colorB) {
                return colorA - colorB;
            } else if (isTrainA != isTrainB) {
                return isTrainA - isTrainB;
            } else if (a.getRefine_level() != b.getRefine_level()) {
                return a.getRefine_level() - b.getRefine_level();
            } else if (a.getLevel() != b.getLevel()) {
                return a.getLevel() - b.getLevel();
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        for (var k in this._treasureList) {
            var unit = this._treasureList[k];
            var treasureConfig = unit.getConfig();
            var treasureType = treasureConfig.treasure_type;
            var color = treasureConfig.color;
            if (treasureType != 0) {
                var isDidTrain = unit.isDidTrain();
                if (isDidTrain) {
                    var isInBattle = unit.isInBattle();
                    if (!isInBattle) {
                        result.push(unit);
                    }
                }
            }
        }
        result.sort(sortFun);
        return result;
    }
    isHaveTreasureNotInPos(slot) {
        for (var k in this._treasureList) {
            var unit = this._treasureList[k];
            var pos = unit.getPos();
            if (pos == null && unit.getConfig().treasure_type == slot) {
                return true;
            }
        }
        return false;
    }

    //性能优化， 把fateIdInfos提到外层 避免for循环计算
    isHaveBetterTreasure(pos, slot) {
        var isBetter = function (a, b, fateIdInfos) {
            var isYokeA = TreasureDataHelper.isHaveYokeBetweenHeroAndTreasured2(fateIdInfos, a.getBase_id());
            var isYokeB = TreasureDataHelper.isHaveYokeBetweenHeroAndTreasured2(fateIdInfos, b.getBase_id());
            var yokeA = isYokeA && 1 || 0;
            var yokeB = isYokeB && 1 || 0;
            var colorA = a.getConfig().color;
            var potentialA = a.getConfig().potential;
            var levelA = a.getLevel();
            var rLevelA = a.getRefine_level();
            var colorB = b.getConfig().color;
            var potentialB = b.getConfig().potential;
            var levelB = b.getLevel();
            var rLevelB = b.getRefine_level();
            if (yokeA != yokeB) {
                return yokeA > yokeB;
            } else if (colorA != colorB) {
                return colorA > colorB;
            } else if (potentialA != potentialB) {
                return potentialA > potentialB;
            } else if (levelA != levelB) {
                return levelA > levelB;
            } else if (rLevelA != rLevelB) {
                return rLevelA > rLevelB;
            }
        }
        var treasureId = G_UserData.getBattleResource().getResourceId(pos, 2, slot);
        if (!treasureId) {
            return false;
        }
        var treasureData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
        if (!treasureData) {
            return false;
        }
        var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
        var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
        var heroBaseId = unitData.getBase_id();


        var fateIdInfos = HeroDataHelper.getHeroYokeInfosByConfig(heroBaseId);

        for (var k in this._treasureList) {
            var unit = this._treasureList[k];
            var pos = unit.getPos();
            if (pos == null && unit.getConfig().treasure_type == slot) {
                if (isBetter(unit, treasureData, fateIdInfos)) {
                    return true;
                }
            }
        }
        return false;
    }
    c2sEquipTreasure(pos, slot, id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EquipTreasure, {
            id: id,
            pos: pos,
            slot: slot
        });
    }
    _s2cEquipTreasure(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var id = message['id'];
        if(!id)
        cc.error('_s2cEquipTreasure, message.id = nil');
        var pos = message['pos'];
        if(!pos)
        cc.error('_s2cEquipTreasure, message.pos = nil');
        var slot = message['slot'];
        if(!slot)
        cc.error('_s2cEquipTreasure, message.slot = nil');
        var oldId = message['old_id'] || 0;
        var oldPos = message['old_pos'] || 0;
        var oldSlot = message['old_slot'] || 0;
        G_UserData.getBattleResource().setTreasurePosTable(pos, slot, id, oldId, oldPos, oldSlot);
        G_SignalManager.dispatch(SignalConst.EVENT_TREASURE_ADD_SUCCESS, oldId, pos, slot);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TREASURE);
    }
    c2sRemoveTreasure(pos, slot) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_RemoveTreasure, {
            pos: pos,
            slot: slot
        });
    }
    _s2cRemoveTreasure(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var pos = message['pos'];
        var slot = message['slot'];
        var oldId = message['old_id'];
        G_UserData.getBattleResource().clearTreasurePosTable(pos, slot, oldId);
        G_SignalManager.dispatch(SignalConst.EVENT_TREASURE_REMOVE_SUCCESS, slot);
    }
    c2sUpgradeTreasure(id, materials) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_UpgradeTreasure, {
            id: id,
            materials: materials
        });
    }
    _s2cUpgradeTreasure(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TREASURE_UPGRADE_SUCCESS);
    }
    c2sRefineTreasure(id, materials) {
        if (materials.length == 0) {
            G_NetworkManager.send(MessageIDConst.ID_C2S_RefineTreasure, { id: id });
        } else {
            G_NetworkManager.send(MessageIDConst.ID_C2S_RefineTreasure, {
                id: id,
                materials: materials
            });
        }
    }
    _s2cRefineTreasure(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TREASURE_REFINE_SUCCESS);
    }
    c2sRecoveryTreasure(treasureId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_TreasureRecycle, { treasure_id: treasureId });
    }
    _s2cRecoveryTreasure(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_TREASURE_RECOVERY_SUCCESS, awards);
    }
    c2sRebornTreasure(treasureId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_RebornTreasure, { treasure_id: treasureId });
    }
    _s2cRebornTreasure(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_TREASURE_REBORN_SUCCESS, awards);
    }
    c2sTreasureTransform(srcIds, toId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_TreasureTransform, {
            to_id: toId,
            src_ids: srcIds
        });
    }
    _s2cTreasureTransform(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TREASURE_TRANSFORM_SUCCESS);
    }
    c2sTreasureLimitCost(treasureId, idx?, materials?) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_TreasureLimitCost, {
            treasure_id: treasureId,
            idx: idx,
            materials: materials
        });
    }
    _s2cTreasureLimitCost(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var idx = message['idx'] || 0;
        if (idx > 0) {
            G_SignalManager.dispatch(SignalConst.EVENT_TREASURE_LIMIT_LV_PUT_RES, idx);
        } else {
            G_SignalManager.dispatch(SignalConst.EVENT_TREASURE_LIMIT_SUCCESS);
        }
    }

}