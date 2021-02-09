import { BaseData } from "./BaseData";
import { G_NetworkManager, G_UserData } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { BattleResourceUnitData } from "./BattleResourceUnitData";
import HorseConst from "../const/HorseConst";
import { table } from "../utils/table";

export class BattleResourceData extends BaseData {
    constructor() {
        super()
        this._equipList = {};
        this._treasureList = {};
        this._instrumentList = {};
        this._horseList = {};
        this._tacticsList = {};
        this._resourcePosTable = {};
        this._recvGetBattleResource = G_NetworkManager.add(MessageIDConst.ID_S2C_GetBattleResource, this._s2cGetBattleResource.bind(this));
    }
    private _equipList;
    private _treasureList;
    private _instrumentList;
    private _horseList;
    _tacticsList;
    private _resourcePosTable;
    private _recvGetBattleResource;

    clear() {
        this._recvGetBattleResource.remove();
        this._recvGetBattleResource = null;
    }
    reset() {
        this._equipList = {};
        this._treasureList = {};
        this._instrumentList = {};
        this._horseList = {};
        this._tacticsList = {};
        this._resourcePosTable = {};
    }
    _setResourceData(data) {
        if (data.id == 0) {
            return;
        }
        var baseData = new BattleResourceUnitData();
        baseData.initData(data);
        if (data.flag == 1) {
            this._equipList['k_' + (data.id)] = baseData;
        } else if (data.flag == 2) {
            this._treasureList['k_' + (data.id)] = baseData;
        } else if (data.flag == 3) {
            this._instrumentList['k_' + (data.id)] = baseData;
        } else if (data.flag == 4) {
            this._horseList['k_' + (data.id)] = baseData;
        } else if (data.flag == 5) {
            this._tacticsList['k_' + (data.id)] = baseData;
        }
        var pos = data.pos;
        var flag = data.flag;
        var slot = data.slot;
        if (this._resourcePosTable[pos] == null) {
            this._resourcePosTable[pos] = {};
        }
        if (this._resourcePosTable[pos][flag] == null) {
            this._resourcePosTable[pos][flag] = {};
        }
        this._resourcePosTable[pos][flag][slot] = data.id;
    }
    _s2cGetBattleResource(id, message) {
        this._equipList = {};
        this._treasureList = {};
        this._instrumentList = {};
        this._horseList = {};
        this._tacticsList = {};
        this._resourcePosTable = {};
        var resourceList = message['battle_resource'] || {};
        for (var i in resourceList) {
            var data = resourceList[i];
            this._setResourceData(data);
        }
    }
    getAllEquipData() {
        return this._equipList;
    }
    getAllTreasureData() {
        return this._treasureList;
    }
    getAllInstrumentData() {
        return this._instrumentList;
    }
    getAllHorseData() {
        return this._horseList;
    }
    getAllTacticsData() {
        return this._tacticsList;
    }
    getEquipDataWithId(id) {
        return this._equipList['k_' + (id)];
    }
    getTreasureDataWithId(id) {
        return this._treasureList['k_' + (id)];
    }
    getInstrumentDataWithId(id) {
        return this._instrumentList['k_' + (id)];
    }
    getHorseDataWithId(id) {
        return this._horseList['k_' + (id)];
    }
    getTactcisDataWithId(id) {
        return this._tacticsList['k' + (id)];
    }
    getResourceId(pos, flag, slot) {
        if (this._resourcePosTable[pos] == null) {
            return null;
        }
        if (this._resourcePosTable[pos][flag] == null) {
            return null;
        }
        return this._resourcePosTable[pos][flag][slot];
    }
    setEquipPosTable(pos, slot, id, oldId, oldPos, oldSlot) {
        var data = {
            id: id,
            pos: pos,
            flag: 1,
            slot: slot
        };
        this._setResourceData(data);
        if (oldId > 0) {
            this._equipList['k_' + (oldId)] = null;
        }
        if (oldPos > 0 && oldSlot > 0) {
            this._resourcePosTable[oldPos][1][oldSlot] = null;
        }
    }
    clearEquipPosTable(pos, slot, oldId) {
        this._equipList['k_' + (oldId)] = null;
        this._resourcePosTable[pos][1][slot] = null;
    }
    getEquipIdsWithPos(pos) {
        if (this._resourcePosTable[pos] == null) {
            return [];
        }
        if (this._resourcePosTable[pos][1] == null) {
            return [];
        }
        var result: any = [];
        for (var k in this._resourcePosTable[pos][1]) {
            var id = this._resourcePosTable[pos][1][k];
            if (id != null) {
                result.push(id);
            }
        }
        return result;
    }
    getEquipInfoWithPos(pos) {
        if (this._resourcePosTable[pos] == null) {
            return {};
        }
        if (this._resourcePosTable[pos][1] == null) {
            return {};
        }
        var result = {};
        for (var k in this._resourcePosTable[pos][1]) {
            var id = this._resourcePosTable[pos][1][k];
            result[k] = id;
        }
        return result;
    }
    isInFirstPosWithEquipBaseId(equipBaseId): boolean {
        if (this._resourcePosTable[1] == null) {
            return false;
        }
        if (this._resourcePosTable[1][1] == null) {
            return false;
        }
        for (var k in this._resourcePosTable[1][1]) {
            var equipId = this._resourcePosTable[1][1][k];
            if (equipId != null) {
                var equipUnitData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
                if (equipUnitData.getBase_id() == equipBaseId) {
                    return true;
                }
            }

        }
        return false;
    }
    isInFirstPosWithTreasureBaseId(treasureBaseId): boolean {
        if (this._resourcePosTable[1] == null) {
            return false;
        }
        if (this._resourcePosTable[1][2] == null) {
            return false;
        }
        for (var k in this._resourcePosTable[1][2]) {
            var treasureId = this._resourcePosTable[1][2][k];
            if (treasureId != null) {
                var treasureUnitData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
                if (treasureUnitData.getBase_id() == treasureBaseId) {
                    return true;
                }
            }
        }
        return false;
    }
    isInFirstPosWithTacticsBaseId(tacticsBaseId) {
        if (this._resourcePosTable[1] == null) {
            return false;
        }
        if (this._resourcePosTable[1][5] == null) {
            return false;
        }
        for (var k in this._resourcePosTable[1][5]) {
            var tacticsId = this._resourcePosTable[1][5][k];
            var tacticsUnitData = G_UserData.getTactics().getUnitDataWithId(tacticsId);
            if (tacticsUnitData.getBase_id() == tacticsBaseId) {
                return true;
            }
        }
        return false;
    }
    getFirstEquipId() {
        for (var k in this._resourcePosTable) {
            var one = this._resourcePosTable[k];
            var temp = one[1];
            if (temp) {
                for (var j in temp) {
                    var id = temp[j];
                    return id;
                }
            }
        }
        return null;
    }
    setTreasurePosTable(pos, slot, id, oldId, oldPos, oldSlot) {
        var data = {
            id: id,
            pos: pos,
            flag: 2,
            slot: slot
        };
        this._setResourceData(data);
        if (oldId > 0) {
            this._treasureList['k_' + (oldId)] = null;
        }
        if (oldPos > 0 && oldSlot > 0) {
            this._resourcePosTable[oldPos][2][oldSlot] = null;
        }
    }
    clearTreasurePosTable(pos, slot, oldId) {
        this._treasureList['k_' + (oldId)] = null;
        this._resourcePosTable[pos][2][slot] = null;
    }
    getTreasureIdsWithPos(pos) {
        if (this._resourcePosTable[pos] == null) {
            return [];
        }
        if (this._resourcePosTable[pos][2] == null) {
            return [];
        }
        var result: any = [];
        for (var k in this._resourcePosTable[pos][2]) {
            var id = this._resourcePosTable[pos][2][k];
            if (id != null) {
                result.push(id);
            }
        }
        return result;
    }
    getTreasureInfoWithPos(pos) {
        if (this._resourcePosTable[pos] == null) {
            return [];
        }
        if (this._resourcePosTable[pos][2] == null) {
            return [];
        }
        var result = [];
        for (var k in this._resourcePosTable[pos][2]) {
            var id = this._resourcePosTable[pos][2][k];
            if (id != null) {
                result.push(id);
            }
        }
        return result;
    }
    setTacticsPosTable(pos, slot, id, oldId, oldPos, oldSlot) {
        var data = {
            id: id,
            pos: pos,
            flag: 5,
            slot: slot
        };
        this._setResourceData(data);
        if (oldId > 0) {
            this._tacticsList['k_' + (oldId)] = null;
        }
        if (oldPos > 0 && oldSlot > 0) {
            this._resourcePosTable[oldPos][5][oldSlot] = null;
        }
    }
    clearTacticsPosTable(pos, slot, oldId) {
        this._tacticsList['k_' + (oldId)] = null;
        this._resourcePosTable[pos][5][slot] = null;
    }
    getTacticsIdsWithPos(pos) {
        if (this._resourcePosTable[pos] == null) {
            return {};
        }
        if (this._resourcePosTable[pos][5] == null) {
            return {};
        }
        var result = [];
        for (var k in this._resourcePosTable[pos][5]) {
            var id = this._resourcePosTable[pos][5][k];
            table.insert(result, id);
        }
        return result;
    }
    getTacticsInfoWithPos(pos) {
        if (this._resourcePosTable[pos] == null) {
            return {};
        }
        if (this._resourcePosTable[pos][5] == null) {
            return {};
        }
        var result = {};
        for (var k in this._resourcePosTable[pos][5]) {
            var id = this._resourcePosTable[pos][5][k];
            result[k] = id;
        }
        return result;
    }
    isEquipInBattleWithBaseId(baseId): boolean {
        for (var k in this._equipList) {
            var data = this._equipList[k];
            if (data) {
                var id = data.getId();
                var equip = G_UserData.getEquipment().getEquipmentDataWithId(id);
                var tempBaseId = equip.getBase_id();
                if (baseId == tempBaseId) {
                    return true;
                }
            }
        }
        return false;
    }
    isTreasureInBattleWithBaseId(baseId): boolean {
        for (var k in this._treasureList) {
            var data = this._treasureList[k];
            if (!data) continue;
            var id = data.getId();
            var treasure = G_UserData.getTreasure().getTreasureDataWithId(id);
            var tempBaseId = treasure.getBase_id();
            if (baseId == tempBaseId) {
                return true;
            }
        }
        return false;
    }
    isTacticsInBattleWithBaseId(baseId) {
        for (var k in this._tacticsList) {
            var data = this._tacticsList[k];
            var id = data.getId();
            var unitData = G_UserData.getTactics().getUnitDataWithId(id);
            var tempBaseId = unitData.getBase_id();
            if (baseId == tempBaseId) {
                return true;
            }
        }
        return false;
    }
    isInstrumentInBattleWithBaseId(baseId) {
        for (var k in this._instrumentList) {
            var data = this._instrumentList[k];
            var id = data.getId();
            var instrument = G_UserData.getInstrument().getInstrumentDataWithId(id);
            var tempBaseId = instrument.getBase_id();
            if (baseId == tempBaseId) {
                return true;
            }
        }
        return false;
    }
    setInstrumentPosTable(pos, id, oldId, oldPos?, oldSlot?) {
        var data = {
            id: id,
            pos: pos,
            flag: 3,
            slot: 1
        };
        this._setResourceData(data);
        if (oldId > 0) {
            this._instrumentList['k_' + (oldId)] = null;
        }
    }
    clearInstrumentPosTable(pos, oldId) {
        this._instrumentList['k_' + (oldId)] = null;
        this._resourcePosTable[pos][3][1] = null;
    }
    getInstrumentIdsWithPos(pos) {
        if (this._resourcePosTable[pos] == null) {
            return [];
        }
        if (this._resourcePosTable[pos][3] == null) {
            return [];
        }
        var result: any = [];
        for (var k in this._resourcePosTable[pos][3]) {
            var id = this._resourcePosTable[pos][3][k];
            if (id != null) {
                result.push(id);
            }
        }
        return result;
    }
    getInstrumentInfoWithPos(pos) {
        if (this._resourcePosTable[pos] == null) {
            return [];
        }
        if (this._resourcePosTable[pos][3] == null) {
            return [];
        }
        var result = [];
        for (var k in this._resourcePosTable[pos][3]) {
            var id = this._resourcePosTable[pos][3][k];
            if (id != null) {
                result.push(id);
            }
        }
        return result;
    }
    //根据神兵静态Id获取它是否在第一阵位
    //用于判断神兵羁绊是否激活
    isInFirstPosWithInstrumentBaseId(instrumentBaseId): boolean {
        if (this._resourcePosTable[1] == null) {
            return false;
        }
        if (this._resourcePosTable[1][3] == null) {
            return false;
        }
        for (var k in this._resourcePosTable[1][3]) {
            var instrumentId = this._resourcePosTable[1][3][k];
            var instrumentUnitData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
            if (instrumentUnitData.getBase_id() == instrumentBaseId) {
                return true;
            }
        }
        return false;
    }
    setHorsePosTable(pos, id, oldId, oldPos?, oldSlot?) {
        var data = {
            id: id,
            pos: pos,
            flag: HorseConst.FLAG,
            slot: 1
        };
        this._setResourceData(data);
        if (oldId > 0) {
            this._horseList['k_' + (oldId)] = null;
        }
    }
    clearHorsePosTable(pos, oldId) {
        this._horseList['k_' + (oldId)] = null;
        this._resourcePosTable[pos][HorseConst.FLAG][1] = null;
    }
    getHorseIdsWithPos(pos) {
        if (this._resourcePosTable[pos] == null) {
            return [];
        }
        if (this._resourcePosTable[pos][HorseConst.FLAG] == null) {
            return [];
        }
        var result: any = [];
        for (var k in this._resourcePosTable[pos][HorseConst.FLAG]) {
            var id = this._resourcePosTable[pos][HorseConst.FLAG][k];

            if (id != null) {
                result.push(id);
            }
        }
        return result;
    }
    isHaveEmptyEquipPos(pos, slot) {
        var id = this.getResourceId(pos, 1, slot);
        return id == null;
    }
    isHaveEmptyTreasurePos(pos, slot) {
        var id = this.getResourceId(pos, 2, slot);
        return id == null;
    }
    isHaveEmptyTacticsPos(pos, slot) {
        var id = this.getResourceId(pos, 5, slot);
        return id == null;
    }
    isHaveEmptyInstrumentPos(pos, slot) {
        var id = this.getResourceId(pos, 3, slot);
        return id == null;
    }
    isHaveEmptyHorsePos(pos, slot) {
        var id = this.getResourceId(pos, 4, slot);
        return id == null;
    }
    isFullEquip(pos) {
        for (var i = 1; i <= 4; i++) {
            var isEmpty = this.isHaveEmptyEquipPos(pos, i);
            if (isEmpty) {
                return false;
            }
        }
        return true;
    }
    isFullTreasure(pos) {
        for (var i = 1; i <= 2; i++) {
            var isEmpty = this.isHaveEmptyTreasurePos(pos, i);
            if (isEmpty) {
                return false;
            }
        }
        return true;
    }
    isFullTactics(pos) {
        for (var i = 1; i != 2; i++) {
            var isEmpty = this.isHaveEmptyTacticsPos(pos, i);
            if (isEmpty) {
                return false;
            }
        }
        return true;
    }
    isFullInstrument(pos) {
        var isEmpty = this.isHaveEmptyInstrumentPos(pos, 1);
        if (isEmpty) {
            return false;
        }
        return true;
    }
    isFullHorse(pos) {
        var isEmpty = this.isHaveEmptyHorsePos(pos, 1);
        if (isEmpty) {
            return false;
        }
        return true;
    }
}