import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { JadeStoneUnitData } from "./JadeStoneUnitData";
import { SignalConst } from "../const/SignalConst";
import { FunctionConst } from "../const/FunctionConst";

export class JadeStoneData extends BaseData {
    _jadeList: {};
    _recvGetJade: any;
    _recvJadeEquip: any;
    _recvJadeSell: any;
    _recvJadeTreasure: any;


    constructor() {
        super()
        this._jadeList = {};
        this._recvGetJade = G_NetworkManager.add(MessageIDConst.ID_S2C_GetJade, this._s2cGetJadeData.bind(this));
        this._recvJadeEquip = G_NetworkManager.add(MessageIDConst.ID_S2C_JadeEquip, this._s2cJadeEquip.bind(this));
        this._recvJadeSell = G_NetworkManager.add(MessageIDConst.ID_S2C_JadeSell, this._s2cJadeSell.bind(this));
        this._recvJadeTreasure = G_NetworkManager.add(MessageIDConst.ID_S2C_JadeTreasure, handler(this, this._s2cJadeTreasure));
    }
    clear() {
        this._recvGetJade.remove();
        this._recvGetJade = null;
        this._recvJadeEquip.remove();
        this._recvJadeEquip = null;
        this._recvJadeSell.remove();
        this._recvJadeSell = null;
        this._recvJadeTreasure.remove();
        this._recvJadeTreasure = null;
    }
    reset() {
    }
    getJadeListByEquip(params, type) {
        var list = [];
        for (var k in this._jadeList) {
            var v = this._jadeList[k];
            var suitable = null;
            if (type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) {
                suitable = v.isSuitableEquipment(params.equipBaseId);
            } else if (type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3) {
                suitable = v.isSuitableTreasure(params.equipBaseId);
            }
            if (v.getConfig().property == params.property && suitable && v.getId() != params.jadeId && v.getEquipment_id() != params.equipId) {
                if (params.hideWear) {
                    if (!v.isInEquipment()) {
                        list.push(v);
                    }
                } else {
                    list.push(v);
                }
            }
        }
        return list;
    }
    getJadeListByPackage() {
        var list = [];
        for (var k in this._jadeList) {
            var v = this._jadeList[k];
            v && list.push(v);
        }
        list.sort(function (data1, data2) {
            if (data1.getEquipHeroBaseId() && !data2.getEquipHeroBaseId()) {
                return -1;
            } else if (!data1.getEquipHeroBaseId() && data2.getEquipHeroBaseId()) {
                return 1;
            } else {
                if (data1.getConfig().color == data2.getConfig().color) {
                    if (data1.getConfig().property == data2.getConfig().property) {
                        return data1.getSys_id() - data2.getSys_id();
                    } else {
                        return data1.getConfig().property - data2.getConfig().property;
                    }
                } else {
                    return data2.getConfig().color - data1.getConfig().color;
                }
            }
        });
        return list;
    }
    getJadeListBySell() {
        var list = [];
        for (var k in this._jadeList) {
            var v = this._jadeList[k];
            if (v && !v.isInEquipment()) {
                list.push(v);
            }
        }
        list.sort(function (data1, data2) {
            if (data1.getConfig().color == data2.getConfig().color) {
                if (data1.getConfig().property == data2.getConfig().property) {
                    return data1.getSys_id() - data2.getSys_id();
                } else {
                    return data1.getConfig().property - data2.getConfig().property;
                }
            } else {
                return data1.getConfig().color - data2.getConfig().color;
            }
        });
        return list;
    }
    getJadeDataById(id) {
        return this._jadeList['k_' + id];
    }
    insertData(data) {
        if (!data) {
            return;
        }
        this._updateJadeDatas(data);
    }
    updateData(data) {
        if (!data) {
            return;
        }
        this._updateJadeDatas(data);
    }
    deleteData(data) {
        if (!data) {
            return;
        }
        for (var k in data) {
            var id = data[k];
            this._jadeList['k_' + id] = null;
        }
    }
    _updateJadeDatas(jadeDatas) {
        for (var k in jadeDatas) {
            var v = jadeDatas[k];
            var unitData = this._jadeList['k_' + v.id];
            if (!unitData) {
                unitData = new JadeStoneUnitData();
                this._jadeList['k_' + v.id] = unitData;
            }
            unitData.updateData(v);
        }
    }
    c2sJadeEquip(id, equipment_id, pos) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_JadeEquip, {
            id: id,
            equipment_id: equipment_id,
            pos: pos
        });
    }
    c2sJadeTreasure(id, treasure_id, pos) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_JadeTreasure, {
            id: id,
            t_id: treasure_id,
            pos: pos
        });
    }
    c2sJadeSell(sellDatas) {
        var ids = [];
        for (var k in sellDatas) {
            var v = sellDatas[k];
            ids.push(v.id);
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_JadeSell, { id: ids });
    }
    _s2cJadeSell(id, message) {
        if (message.ret != 1) {
            return;
        }
        var award = message['materials'];
        G_SignalManager.dispatch(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, award);
    }
    _s2cGetJadeData(id, message) {
        var jades = message['jades'];
        if (!jades) {
            return;
        }
        this._updateJadeDatas(jades);
    }
    _s2cJadeEquip(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_JADE_EQUIP_SUCCESS, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE);
    }
    _s2cJadeTreasure(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_JADE_TREASURE_SUCCESS, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE);
    }
}