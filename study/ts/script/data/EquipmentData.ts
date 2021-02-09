import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_UserData } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { EquipmentUnitData } from "./EquipmentUnitData";
import { FunctionConst } from "../const/FunctionConst";
import { TeamDataHelper } from "../utils/data/TeamDataHelper";
import { EquipDataHelper } from "../utils/data/EquipDataHelper";
import { HeroDataHelper } from "../utils/data/HeroDataHelper";
export interface EquipmentData {
    getCurEquipId(): number
    setCurEquipId(value: number): void
    getLastCurEquipId(): number
}
let schema = {};
schema['curEquipId'] = [
    'number',
    0
];
export class EquipmentData extends BaseData {
    public static schema = schema;
    private _equipmentList: {[key: string]: EquipmentUnitData};
    private _recvGetEquipment;
    private _recvAddFightEquipment;
    private _recvClearFightEquipment;
    private _recvUpgradeEquipment;
    private _recvRefineEquipment;
    private _recvEquipmentRecycle;
    private _recvEquipmentReborn;
    private _recvSuperUpgradeEquipment;
    private _recvEquipmentLimitCost;

    constructor() {
        super()
        this._equipmentList = {};
        this._recvGetEquipment = G_NetworkManager.add(MessageIDConst.ID_S2C_GetEquipment, this._s2cGetEquipment.bind(this));
        this._recvAddFightEquipment = G_NetworkManager.add(MessageIDConst.ID_S2C_AddFightEquipment, this._s2cAddFightEquipment.bind(this));
        this._recvClearFightEquipment = G_NetworkManager.add(MessageIDConst.ID_S2C_ClearFightEquipment, this._s2cClearFightEquipment.bind(this));
        this._recvUpgradeEquipment = G_NetworkManager.add(MessageIDConst.ID_S2C_UpgradeEquipment, this._s2cUpgradeEquipment.bind(this));
        this._recvRefineEquipment = G_NetworkManager.add(MessageIDConst.ID_S2C_RefineEquipment, this._s2cRefineEquipment.bind(this));
        this._recvEquipmentRecycle = G_NetworkManager.add(MessageIDConst.ID_S2C_EquipmentRecycle, this._s2cEquipmentRecycle.bind(this));
        this._recvEquipmentReborn = G_NetworkManager.add(MessageIDConst.ID_S2C_EquipmentReborn, this._s2cEquipmentReborn.bind(this));
        this._recvSuperUpgradeEquipment = G_NetworkManager.add(MessageIDConst.ID_S2C_SuperUpgradeEquipment, this._s2cSuperUpgradeEquipment.bind(this));
        this._recvEquipmentLimitCost = G_NetworkManager.add(MessageIDConst.ID_S2C_EquipmentLimitCost, this._s2cEquipmentLimitCost.bind(this));
    }
    clear() {
        this._recvGetEquipment.remove();
        this._recvGetEquipment = null;
        this._recvAddFightEquipment.remove();
        this._recvAddFightEquipment = null;
        this._recvClearFightEquipment.remove();
        this._recvClearFightEquipment = null;
        this._recvUpgradeEquipment.remove();
        this._recvUpgradeEquipment = null;
        this._recvRefineEquipment.remove();
        this._recvRefineEquipment = null;
        this._recvEquipmentRecycle.remove();
        this._recvEquipmentRecycle = null;
        this._recvEquipmentReborn.remove();
        this._recvEquipmentReborn = null;
        this._recvSuperUpgradeEquipment.remove();
        this._recvSuperUpgradeEquipment = null;
        this._recvEquipmentLimitCost.remove();
        this._recvEquipmentLimitCost = null;
    }

    createTempEquipUnitData(baseId) {
        var baseData: any = {};
        baseData.id = 1;
        baseData.base_id = baseId || 1;
        baseData.level = 1;
        baseData.exp = 1;
        baseData.star = 1;
        baseData.rank = 1;
        baseData.money = 1;
        baseData.time = 1;
        baseData.user_id = 1;
        baseData.r_level = 0;
        baseData.r_exp = 1;
        baseData.all_exp = 1;
        var unitData = new EquipmentUnitData();
        unitData.updateData(baseData);
        unitData.setIsUserEquip(false);
        return unitData;
    }
    reset() {
        this._equipmentList = {};
    }
    _setEquipmentData(data) {
        this._updateChange(this._equipmentList['k_' + (data.id)], data);
        this._equipmentList['k_' + (data.id)] = null;
        var unitData = new EquipmentUnitData();
        unitData.updateData(data);
        this._equipmentList['k_' + (data.id)] = unitData;
    }
    _s2cGetEquipment(id, message) {
        this._equipmentList = {};
        var equipmentList = message.equipments || {};
        for (var i in equipmentList) {
            var data = equipmentList[i];
            this._setEquipmentData(data);
        }
    }
    _updateChange(curData, newData) {
        newData.change = 0;
        if (!curData) {
            return;
        }
        newData.change = curData.getChange();
        if (curData.getMoney() != newData.money && newData.money > 0) {
            newData.change = 1;
            return;
        }
        newData.change = 0;
    }
    getEquipmentIdsWithBaseId(base_id) {
        var ids = [];
        for (var i in this._equipmentList) {
            var data = this._equipmentList[i];
            if (data.getBase_id() == base_id && data.getId() != this.getCurEquipId()) {
                ids.push(data.getId());
            }
        }
        return ids;
    }
    getEquipmentDataWithId(id) {
        return this._equipmentList['k_' + (id)];
    }
    updateData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._equipmentList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            this._setEquipmentData(data[i]);
        }
    }
    insertData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._equipmentList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            this._setEquipmentData(data[i]);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_EQUIP);
    }
    deleteData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._equipmentList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            var id = data[i];
            this._equipmentList['k_' + (id)] = null;
            delete this._equipmentList['k_' + (id)];
        }
    }
    getEquipTotalCount() {
        var count = 0;
        for (var k in this._equipmentList) {
            var v = this._equipmentList[k];
            count = count + 1;
        }
        return count;
    }
    getEquipIdWithBaseId(baseId) {
        for (var k in this._equipmentList) {
            var data = this._equipmentList[k];
            if (data.getBase_id() == baseId) {
                return data.getId();
            }
        }
        return null;
    }
    getListDataBySort() {
        var result = [];
        var wear: EquipmentUnitData[] = [];
        var noWear: EquipmentUnitData[] = [];
        function sortFun1(a, b) {
            var configA = a.getConfig();
            var configB = b.getConfig();
            if (configA.color != configB.color) {
                return configB.color - configA.color;
            } else if (configA.potential != configB.potential) {
                return configB.potential - configA.potential;
            } else if (a.getLevel() != b.getLevel()) {
                return b.getLevel() - a.getLevel();
            } else if (a.getR_level() != b.getR_level()) {
                return b.getR_level() - a.getR_level();
            } else {
                return configA.id - configB.id;
            }
        }
        function sortFun2(a, b) {
            var configA = a.getConfig();
            var configB = b.getConfig();
            if (configA.color != configB.color) {
                return configB.color - configA.color;
            } else if (configA.potential != configB.potential) {
                return configB.potential - configA.potential;
            } else if (a.getLevel() != b.getLevel()) {
                return b.getLevel() - a.getLevel();
            } else if (a.getR_level() != b.getR_level()) {
                return b.getR_level() - a.getR_level();
            } else {
                return configA.id - configB.id;
            }
        }
        for (var k in this._equipmentList) {
            var data = this._equipmentList[k];
            var isInBattle = data.isInBattle();
            if (isInBattle) {
                wear.push(data);
            } else {
                noWear.push(data);
            }
        }
        wear.sort(sortFun1);
        noWear.sort(sortFun2);
        for (var i in wear) {
            var data = wear[i];
            result.push(data.getId());
        }
        for (let i in noWear) {
            var data = noWear[i];
            result.push(data.getId());
        }
        return result;
    }
    getReplaceEquipmentListWithSlot(pos, slot) {
        var result = [];
        var noWear = [];
        var wear = [];
        function sortFun(a, b) {
            var configA = a.getConfig();
            var configB = b.getConfig();
            var yokeA = 0;
            var yokeB = 0;
            if (a.isYokeRelation && b.isYokeRelation) {
                yokeA = a.isYokeRelation() == true && 1 || 0;
                yokeB = b.isYokeRelation() == true && 1 || 0;
            }

            if (yokeA != yokeB) {
                return yokeB - yokeA;
            } else if (configA.color != configB.color) {
                return configB.color - configA.color;
            } else if (configA.potential != configB.potential) {
                return configB.potential - configA.potential;
            } else if (a.getLevel() != b.getLevel()) {
                return b.getLevel() - a.getLevel();
            } else if (a.getR_level() != b.getR_level()) {
                return b.getR_level() - a.getR_level();
            } else {
                return configA.id - configB.id;
            }
        }
        var heroBaseId = TeamDataHelper.getHeroBaseIdWithPos(pos);
        var fateIdInfos = HeroDataHelper.getHeroYokeInfosByConfig(heroBaseId);
        for (var k in this._equipmentList) {
            var unit = this._equipmentList[k];
            if (unit.getConfig().type == slot) {
                var isYoke = EquipDataHelper.isHaveYokeBetweenHeroAndTreasured1(fateIdInfos, unit.getBase_id());
                unit.setYokeRelation(isYoke);
                var data = G_UserData.getBattleResource().getEquipDataWithId(unit.getId());
                if (data) {
                    if (data.getPos() != pos) {
                        wear.push(unit);
                    }
                } else {
                    noWear.push(unit);
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
    getRecoveryList() {
        var result = [];
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var typeA = a.getConfig().type;
            var typeB = b.getConfig().type;
            var isTrainA = a.isDidTrain() && 1 || 0;
            var isTrainB = b.isDidTrain() && 1 || 0;
            if (colorA != colorB) {
                return colorA - colorB;
            } else if (typeA != typeB) {
                return typeA - typeB;
            } else if (isTrainA != isTrainB) {
                return isTrainA - isTrainB;
            } else if (a.getR_level() != b.getR_level()) {
                return a.getR_level() - b.getR_level();
            } else if (a.getLevel() != b.getLevel()) {
                return a.getLevel() - b.getLevel();
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        for (var k in this._equipmentList) {
            var unit = this._equipmentList[k];
            var color = unit.getConfig().color;
            var isInBattle = unit.isInBattle();
            var isInjectJade = unit.isInjectJadeStone();
            if (!isInBattle && !isInjectJade) {
                result.push(unit);
            }
        }
        result.sort(sortFun);
        return result;
    }
    getRecoveryAutoList() {
        var result = [];
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var typeA = a.getConfig().type;
            var typeB = b.getConfig().type;
            var isTrainA = a.isDidTrain() && 1 || 0;
            var isTrainB = b.isDidTrain() && 1 || 0;
            if (colorA != colorB) {
                return colorA - colorB;
            } else if (typeA != typeB) {
                return typeA - typeB;
            } else if (isTrainA != isTrainB) {
                return isTrainA - isTrainB;
            } else if (a.getR_level() != b.getR_level()) {
                return a.getR_level() - b.getR_level();
            } else if (a.getLevel() != b.getLevel()) {
                return a.getLevel() - b.getLevel();
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        for (var k in this._equipmentList) {
            var unit = this._equipmentList[k];
            var color = unit.getConfig().color;
            if (color < 5) {
                var isInBattle = unit.isInBattle();
                var isInjectJade = unit.isInjectJadeStone();
                if (!isInBattle && !isInjectJade) {
                    result.push(unit);
                }
            }
        }
        result.sort(sortFun);
        return result;
    }
    getRebornList() {
        var result = [];
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var typeA = a.getConfig().type;
            var typeB = b.getConfig().type;
            var isTrainA = a.isDidTrain() && 1 || 0;
            var isTrainB = b.isDidTrain() && 1 || 0;
            if (colorA != colorB) {
                return colorA - colorB;
            } else if (typeA != typeB) {
                return typeA - typeB;
            } else if (isTrainA != isTrainB) {
                return isTrainA - isTrainB;
            } else if (a.getR_level() != b.getR_level()) {
                return a.getR_level() - b.getR_level();
            } else if (a.getLevel() != b.getLevel()) {
                return a.getLevel() - b.getLevel();
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        for (var k in this._equipmentList) {
            var unit = this._equipmentList[k];
            var color = unit.getConfig().color;
            var isDidStrengthen = unit.isDidStrengthen();
            var isDidRefine = unit.isDidRefine();
            var islimit = unit.isLimitUp();
            if (isDidStrengthen || isDidRefine || islimit) {
                var isInBattle = unit.isInBattle();
                var isInjectJade = unit.isInjectJadeStone();
                if (!isInBattle && !isInjectJade) {
                    result.push(unit);
                }
            }
        }
        result.sort(sortFun);
        return result;
    }
    isHaveEquipmentNotInPos(slot) {
        for (var k in this._equipmentList) {
            var unit = this._equipmentList[k];
            var pos = unit.getPos();
            if (pos == null && unit.getConfig().type == slot) {
                return true;
            }
        }
        return false;
    }
    isHaveBetterEquip(pos, slot) {
        function isBetter(a, b) {
            var colorA = a.getConfig().color;
            var potentialA = a.getConfig().potential;
            var levelA = a.getLevel();
            var rLevelA = a.getR_level();
            var colorB = b.getConfig().color;
            var potentialB = b.getConfig().potential;
            var levelB = b.getLevel();
            var rLevelB = b.getR_level();
            if (colorA != colorB) {
                return colorA > colorB;
            } else if (potentialA != potentialB) {
                return potentialA > potentialB;
            } else if (levelA != levelB) {
                return levelA > levelB;
            } else if (rLevelA != rLevelB) {
                return rLevelA > rLevelB;
            }
        }
        var equipId = G_UserData.getBattleResource().getResourceId(pos, 1, slot);
        if (!equipId) {
            return false;
        }
        var equipData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
        if (!equipData) {
            return false;
        }
        for (var k in this._equipmentList) {
            var unit = this._equipmentList[k];
            var pos = unit.getPos();
            if (pos == null && unit.getConfig().type == slot) {
                if (isBetter(unit, equipData)) {
                    return true;
                }
            }
        }
        return false;
    }
    c2sAddFightEquipment(pos, slot, id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_AddFightEquipment, {
            pos: pos,
            slot: slot,
            id: id
        });
    }
    _s2cAddFightEquipment(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var pos = message.pos;
        var slot = message.slot;
        var id = message.id;
        var oldId = message.old_id || 0;
        var oldPos = message.old_pos || 0;
        var oldSlot = message.old_slot || 0;
        G_UserData.getBattleResource().setEquipPosTable(pos, slot, id, oldId, oldPos, oldSlot);
        G_SignalManager.dispatch(SignalConst.EVENT_EQUIP_ADD_SUCCESS, oldId, pos, slot);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_EQUIP);
    }
    c2sClearFightEquipment(pos, slot) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ClearFightEquipment, {
            pos: pos,
            slot: slot
        });
    }
    _s2cClearFightEquipment(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var pos = message.pos;
        var slot = message.slot;
        var oldId = message.old_id
        G_UserData.getBattleResource().clearEquipPosTable(pos, slot, oldId);
        G_SignalManager.dispatch(SignalConst.EVENT_EQUIP_CLEAR_SUCCESS, slot);
    }
    c2sUpgradeEquipment(id, times) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_UpgradeEquipment, {
            id: id,
            times: times
        });
    }
    _s2cUpgradeEquipment(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var times = message.times || 0;
        var critTimes = message.crit_times || 0;
        var breakReason = message.break_reason || 0;
        var level = message.level || 0;
        var crits = message.crits || {};
        var saveMoney = message.save_money || 0;
        var data = {
            times: times,
            critTimes: critTimes,
            breakReason: breakReason,
            level: level,
            crits: crits,
            saveMoney: saveMoney
        };
        G_SignalManager.dispatch(SignalConst.EVENT_EQUIP_UPGRADE_SUCCESS, data);
    }
    c2sRefineEquipment(id, type, item) {
        if (item) {
            G_NetworkManager.send(MessageIDConst.ID_C2S_RefineEquipment, {
                id: id,
                type: type,
                item: item
            });
        } else {
            G_NetworkManager.send(MessageIDConst.ID_C2S_RefineEquipment, {
                id: id,
                type: type
            });
        }
    }
    _s2cRefineEquipment(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var rLevel = message.r_level || 0;
        var rExp = message.r_exp || 0;
        var subItem = message['sub_item'] || {};
        var data = {
            rLevel: rLevel,
            rExp: rExp,
            subItem: subItem
        };
        G_SignalManager.dispatch(SignalConst.EVENT_EQUIP_REFINE_SUCCESS, data);
    }
    c2sEquipmentRecycle(equipIds) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EquipmentRecycle, { equipment_id: equipIds });
    }
    _s2cEquipmentRecycle(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_EQUIP_RECOVERY_SUCCESS, awards);
    }
    c2sEquipmentReborn(equipId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EquipmentReborn, { equipment_id: equipId });
    }
    _s2cEquipmentReborn(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_EQUIP_REBORN_SUCCESS, awards);
    }
    c2sSuperUpgradeEquipment(pos) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_SuperUpgradeEquipment, { pos: pos });
    }
    _s2cSuperUpgradeEquipment(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var crits = message['crits'] || {};
        var saveMoney = message['save_money'] || 0;
        G_SignalManager.dispatch(SignalConst.EVENT_EQUIP_SUPER_UPGRADE_SUCCESS, crits, saveMoney);
    }
    c2sEquipmentLimitCost(_id, pos, subItem) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EquipmentLimitCost, {
            id: _id,
            index: pos,
            materials: subItem,
            cards: [subItem.id]
        });
    }
    _s2cEquipmentLimitCost(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var index = message['index'];
        G_SignalManager.dispatch(SignalConst.EVENT_EQUIP_LIMIT_UP_PUT_RES, index);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE);
        if (index == 2) {
            G_SignalManager.dispatch(SignalConst.EVENT_UPDATE_EQUIPMENT_NUMS);
        }
    }
}