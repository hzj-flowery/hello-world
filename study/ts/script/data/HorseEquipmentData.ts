import { BaseData } from "./BaseData";
import { MessageIDConst } from "../const/MessageIDConst";
import { G_NetworkManager, G_SignalManager } from "../init";
import { HorseEquipDataHelper } from "../utils/data/HorseEquipDataHelper";
import { SignalConst } from "../const/SignalConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { HorseEquipmentUnitData } from "./HorseEquipmentUnitData";

export interface HorseEquipmentData {
    getCurEquipmentId(): number
    setCurEquipmentId(value: number): void
    getLastCurEquipmentId(): number
    getCurEquipmentPos(): number
    setCurEquipmentPos(value: number): void
    getLastCurEquipmentPos(): number
}
let schema = {};
schema['curEquipmentId'] = [
    'number',
    0
];
schema['curEquipmentPos'] = [
    'number',
    0
];
export class HorseEquipmentData extends BaseData {
    public static schema = schema;
    constructor() {
        super()
        this._horseEquipmentList = {};
        this._recvGetHorseEquip = G_NetworkManager.add(MessageIDConst.ID_S2C_GetHorseEquip, this._s2cGetHorseEquip.bind(this));
        this._recvEquipWarHorseEquipment = G_NetworkManager.add(MessageIDConst.ID_S2C_EquipWarHorseEquipment, this._s2cEquipWarHorseEquipment.bind(this));
        this._recvWarHorseEquipmentRecovery = G_NetworkManager.add(MessageIDConst.ID_S2C_WarHorseEquipmentRecovery, this._s2cWarHorseEquipmentRecovery.bind(this));
    }
    private _horseEquipmentList;
    private _recvGetHorseEquip;
    private _recvEquipWarHorseEquipment;
    private _recvWarHorseEquipmentRecovery;
    private _horseEquipPos;
    private _horseEquipId;

    public clear() {
        this._recvGetHorseEquip.remove();
        this._recvGetHorseEquip = null;
        this._recvEquipWarHorseEquipment.remove();
        this._recvEquipWarHorseEquipment = null;
        this._recvWarHorseEquipmentRecovery.remove();
        this._recvWarHorseEquipmentRecovery = null;
    }
    public reset() {
        this._horseEquipmentList = {};
    }
    public updateData(data): void {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (!this._horseEquipmentList) {
            return;
        }
        for (var i = 1; i <= data.length; i++) {
            this._setHorseEquipData(data[i - 1]);
        }
    }
    public insertData(data): void {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (!this._horseEquipmentList) {
            return;
        }
        for (var i = 1; i <= data.length; i++) {
            this._setHorseEquipData(data[i - 1]);
        }
    }
    public deleteData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._horseEquipmentList == null) {
            return;
        }
        for (var i = 1; i <= data.length; i++) {
            // this._horseEquipmentList['k_' + data[i]] = null;
            delete this._horseEquipmentList['k_' + data[i - 1]];
        }
    }
    public _setHorseEquipData(data) {
        this._horseEquipmentList['k_' + data.id] = null;
        var unitData = new HorseEquipmentUnitData();
        unitData.updateData(data);
        this._horseEquipmentList['k_' + data.id] = unitData;
    }
    public getHorseEquipTotalCount() {
        var count = 0;
        for (var k in this._horseEquipmentList) {
            var v = this._horseEquipmentList[k];
            count = count + 1;
        }
        return count;
    }
    public getHorseEquipmentList() {
        return this._horseEquipmentList;
    }
    public getListDataBySort(horseId?) {
        var result = HorseEquipDataHelper.getAllHorseEquipList(this._horseEquipmentList);
        return result;
    }
    public getReplaceEquipmentListWithSlot(slot, horseId?) {
        var [result, noWear, wear] = HorseEquipDataHelper.getReplaceHorseEquipListWithSlot(this._horseEquipmentList, slot, horseId);
        return [
            result,
            noWear,
            wear
        ];
    }
    public getAllRecoveryHorseEquipments(lowLevel?) {
        var result = HorseEquipDataHelper.getAllRecoveryHorseEquipList(this._horseEquipmentList, lowLevel);
        return result;
    }
    public getEquipedEquipListWithHorseId(horseId) {
        var equipList = HorseEquipDataHelper.getEquipedEquipListWithHorseId(horseId, this._horseEquipmentList);
        return equipList;
    }
    public getEquipedEquipinfoWithHorseIdAndSlot(horseId, slot) {
        var equipInfo = HorseEquipDataHelper.getEquipedEquipinfoWithHorseIdAndSlot(horseId, slot, this._horseEquipmentList);
        return equipInfo;
    }
    public getEquipRecoveryRewardList(equipList) {
        cc.error("该函数暂时没翻译");
        // var rewardList = HorseEquipDataHelper.getEquipRecoveryRewardList(equipList);
        // return rewardList;
    }
    public getHorseEquipWithEquipId(equipId) {
        return this._horseEquipmentList['k_' + equipId];
    }
    public createTempHorseEquipUnitData(baseId) {
        var baseData: any = {};
        baseData.id = 0;
        baseData.base_id = baseId || 1;
        baseData.horse_id = 0;
        var unitData = new HorseEquipmentUnitData;
        unitData.updateData(baseData);
        return unitData;
    }
    public isHaveBetterHorseEquip(equipBaseId) {
        var result = HorseEquipDataHelper.isHaveBetterHorseEquip(equipBaseId, this._horseEquipmentList);
        return result;
    }
    public isHaveFreeHorseEquip(slot) {
        var result = HorseEquipDataHelper.isHaveFreeHorseEquip(slot, this._horseEquipmentList);
        return result;
    }
    public isHaveHorseEquipRP(horseId) {
        var result = false;
        for (var i = 1; i <= 3; i++) {
            var equipInfo = this.getEquipedEquipinfoWithHorseIdAndSlot(horseId, i);
            if (!equipInfo) {
                if (this.isHaveFreeHorseEquip(i)) {
                    result = true;
                    break;
                }
            } else {
                var baseId = equipInfo.getBase_id();
                if (this.isHaveBetterHorseEquip(baseId)) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    }
    public isHorseEquipRP(param) {
        var equipPos = param.equipPos;
        var horseId = param.horseId;
        if (equipPos) {
            var equipInfo = this.getEquipedEquipinfoWithHorseIdAndSlot(horseId, equipPos);
            if (equipInfo) {
                var isBetter = this.isHaveBetterHorseEquip(equipInfo.getBase_id());
                return isBetter;
            } else {
                var isFree = this.isHaveFreeHorseEquip(equipPos);
                return isFree;
            }
        } else {
            var checkResult = this.isHaveHorseEquipRP(horseId);
            return checkResult;
        }
    }
    public _s2cGetHorseEquip(id, message) {
        var datas = message['datas'];
        if (!datas) {
            return;
        }
        for (var i = 0; i < datas.length; i++) {
            this._setHorseEquipData(datas[i]);
        }
        // cc.warn('下发的战马装备信息\uFF0C解析后');
        // cc.log(datas);
    }
    public c2sEquipWarHorseEquipment(horseId, horseEquipPos, equipId) {
        this._horseEquipPos = horseEquipPos;
        this._horseEquipId = equipId;
        G_NetworkManager.send(MessageIDConst.ID_C2S_EquipWarHorseEquipment, {
            horse_id: horseId,
            horse_equip_id: equipId,
            pos: horseEquipPos
        });
    }
    public _s2cEquipWarHorseEquipment(id, message) {
        // cc.warn('HorseEquipmentData:_s2cEquipWarHorseEquipment');
        // cc.log(message);
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        // cc.warn('HorseEquipmentData:_s2cEquipWarHorseEquipment\uFF0CequipPos ' + (this._horseEquipPos));
        G_SignalManager.dispatch(SignalConst.EVENT_HORSE_EQUIP_ADD_SUCCESS, this._horseEquipPos);
    }
    public c2sWarHorseEquipmentRecovery(equipIds) {
        // cc.warn('战马装备回收列表');
        // cc.log(equipIds);
        G_NetworkManager.send(MessageIDConst.ID_C2S_WarHorseEquipmentRecovery, { horse_equip_id: equipIds });
    }
    public _s2cWarHorseEquipmentRecovery(id, message) {
        // cc.warn('HorseEquipmentData:_s2cWarHorseEquipmentRecovery\uFF0C message');
        // cc.log(message);
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_HORSE_EQUIP_RECOVERY_SUCCESS, awards);
    }

}