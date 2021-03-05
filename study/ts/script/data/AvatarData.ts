import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_UserData } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { SignalConst } from "../const/SignalConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { AvatarUnitData } from "./AvatarUnitData";

let schema = {};
schema['curAvatarId'] = [
    'number',
    0
];

export interface AvatarData {
    getCurAvatarId(): number
    setCurAvatarId(value: number): void
    getLastCurAvatarId(): number

}

export class AvatarData extends BaseData {
    public static schema = schema;

    constructor() {
        super()

        this._avatarList = {};
        this._recvGetAvatar = G_NetworkManager.add(MessageIDConst.ID_S2C_GetAvatar, this._s2cGetAvatar.bind(this));
        this._recvEquipAvatar = G_NetworkManager.add(MessageIDConst.ID_S2C_EquipAvatar, this._s2cEquipAvatar.bind(this));
        this._recvEnhanceAvatar = G_NetworkManager.add(MessageIDConst.ID_S2C_EnhanceAvatar, this._s2cEnhanceAvatar.bind(this));
        this._recvRebornAvatar = G_NetworkManager.add(MessageIDConst.ID_S2C_RebornAvatar, this._s2cRebornAvatar.bind(this));
    }

    private _avatarList;
    private _recvGetAvatar;
    private _recvEquipAvatar;
    private _recvEnhanceAvatar;
    private _recvRebornAvatar;

    clear() {
        this._recvGetAvatar.remove();
        this._recvGetAvatar = null;
        this._recvEquipAvatar.remove();
        this._recvEquipAvatar = null;
        this._recvEnhanceAvatar.remove();
        this._recvEnhanceAvatar = null;
        this._recvRebornAvatar.remove();
        this._recvRebornAvatar = null;
    }
    reset() {
        this._avatarList = {};
    }
    _setAvatarData(data) {
        this._avatarList['k_' + (data.id)] = null;
        var unitData = new AvatarUnitData();
        unitData.updateData(data);
        this._avatarList['k_' + (data.id)] = unitData;
    }
    _s2cGetAvatar(id, message) {
        this._avatarList = {};
        var avatarList = message['avatars'] || {};
        for (var i in avatarList) {
            var data = avatarList[i];
            this._setAvatarData(data);
        }
    }
    updateData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._avatarList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            this._setAvatarData(data[i]);
        }
    }
    insertData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._avatarList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            this._setAvatarData(data[i]);
        }
    }
    deleteData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._avatarList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            var id = data[i];
            this._avatarList['k_' + (id)] = null;
        }
    }
    createTempAvatarUnitData(data) {
        console.assert(data && typeof (data) == 'object', 'AvatarData:createTempAvatarUnitData data must be object');
        var baseData: any = {};
        baseData.id = data.id || 0;
        baseData.base_id = data.base_id || 0;
        baseData.level = data.level || 1;
        var unitData = new AvatarUnitData();
        unitData.updateData(baseData);
        return unitData;
    }
    getUnitDataWithId(id) {
        var unit = this._avatarList['k_' + (id)];
        console.assert(unit, ('AvatarData._avatarList can not find id = %d' + id));
        return unit;
    }
    getUnitDataWithBaseId(baseId) {
        for (var k in this._avatarList) {
            var unit = this._avatarList[k];
            if (unit.getBase_id() == baseId) {
                return unit;
            }
        }
        return null;
    }
    isHaveWithBaseId(baseId) {
        for (var k in this._avatarList) {
            var unit = this._avatarList[k];
            if (unit.getBase_id() == baseId) {
                return true;
            }
        }
        return false;
    }
    getAllDatas() {
        return this._avatarList;
    }
    getAvatarCount() {
        var count = 0;
        for (var k in this._avatarList) {
            var data = this._avatarList[k];
            count = count + 1;
        }
        return count;
    }
    getCurEquipedUnitData() {
        var unitData = null;
        var avatarId = G_UserData.getBase().getAvatar_id();
        if (avatarId > 0) {
            unitData = this.getUnitDataWithId(avatarId);
        }
        return unitData;
    }
    c2sEquipAvatar(avatarId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EquipAvatar, { avatar_id: avatarId });
    }
    _s2cEquipAvatar(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var avatarId = message['avatar_id'] || 0;
        G_SignalManager.dispatch(SignalConst.EVENT_AVATAR_EQUIP_SUCCESS, avatarId);
    }
    c2sEnhanceAvatar(avatarId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EnhanceAvatar, { avatar_id: avatarId });
    }
    _s2cEnhanceAvatar(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var avatarId = message['avatar_id'] || 0;
        G_SignalManager.dispatch(SignalConst.EVENT_AVATAR_ENHANCE_SUCCESS, avatarId);
    }
    c2sRebornAvatar(avatarId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_RebornAvatar, { avatar_id: avatarId });
    }
    _s2cRebornAvatar(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_AVATAR_REBORN_SUCCESS, awards);
    }

}