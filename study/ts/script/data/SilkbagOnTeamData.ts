import { BaseData } from "./BaseData"
import { G_NetworkManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { SilkbagOnTeamUnitData } from "./SilkbagOnTeamUnitData";

export class SilkbagOnTeamData extends BaseData {
    _silkbagPosTable: {};
    _silkbagOnTeamList: {};
    _recvGetEquipSilkbag: any;
    constructor() {
        super()
        this._silkbagPosTable = {};
        this._silkbagOnTeamList = {};
        this._recvGetEquipSilkbag = G_NetworkManager.add(MessageIDConst.ID_S2C_GetEquipSilkbag, this._s2cGetEquipSilkbag.bind(this));
    }
    clear() {
        this._recvGetEquipSilkbag.remove();
        this._recvGetEquipSilkbag = null;
    }
    reset() {
        this._silkbagPosTable = {};
        this._silkbagOnTeamList = {};
    }
    _s2cGetEquipSilkbag(id, message) {
        var silkbagOnTeamList = message['equip_silkbag'] || {};
        this._silkbagOnTeamList = {};
        for (var i in silkbagOnTeamList) {
            var data = silkbagOnTeamList[i];
            this._setSilkbagOnTeamData(data);
        }
    }
    _setSilkbagOnTeamData(data) {
        var unitData: any = new SilkbagOnTeamUnitData();
        unitData.updateData(data);
        var pos = unitData.getPos();
        var index = unitData.getIndex();
        var silkbagId = unitData.getSilkbag_id();
        if (this._silkbagPosTable[pos] == null) {
            this._silkbagPosTable[pos] = {};
        }
        this._silkbagPosTable[pos][index] = silkbagId;
        this._silkbagOnTeamList['k_' + (silkbagId)] = unitData;
    }
    getUnitDataWithId(id) {
        var unitData = this._silkbagOnTeamList['k_' + (id)];
        return unitData;
    }
    getIdsOnTeamWithPos(pos) {
        var result = [];
        var posTable = this._silkbagPosTable[pos] || {};
        for (var k in posTable) {
            var silkbagId = posTable[k];
            if (silkbagId > 0) {
                result.push(silkbagId);
            }
        }
        return result;
    }
    getIdWithPosAndIndex(pos, index) {
        if (this._silkbagPosTable[pos] == null) {
            return 0;
        }
        var silkbagId = this._silkbagPosTable[pos][index] || 0;
        return silkbagId;
    }
}

