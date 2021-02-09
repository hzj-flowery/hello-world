import { BaseData } from "./BaseData";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { G_NetworkManager, G_ConfigLoader } from "../init";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { ConfigNameConst } from "../const/ConfigNameConst";

export interface GemstoneData {
    getGemstones(): Object
    setGemstones(value: Object): void
    getLastGemstones(): Object
}
interface GemstoneUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getNum(): number
    setNum(value: number): void
    getLastNum(): number
    getType(): number
    setType(value: number): void
    getLastType(): number
    getConfig(): Object
    setConfig(value: Object): void
    getLastConfig(): Object
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['num'] = [
    'number',
    0
];
schema['type'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];
class GemstoneUnitData extends BaseData {
    public static schema = schema;
    constructor() {
        super()
    }

    initData(data): void {
        this.setId(data.id);
        this.setNum(data.num);
        this.setType(TypeConvertHelper.TYPE_GEMSTONE);
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GEMSTONE).get(data.id);
        this.setConfig(info);
    }

}
schema = {};
schema['gemstones'] = [
    'object',
    {}
];
export class GemstoneData extends BaseData {
    public static schema = schema;
    constructor() {
        super()
        this._gemstoneList = {};
        this._recvGetGemstone = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGemstone, this._s2cGetGemstone.bind(this));
    }

    private _recvGetGemstone;
    private _gemstoneList;

    clear() {
        this._recvGetGemstone.remove();
        this._recvGetGemstone = null;
    }
    reset() {
        this._gemstoneList = {};
    }
    _setGemstoneData(data) {
        var unitData = new GemstoneUnitData();
        unitData.initData(data);
        this._gemstoneList['k_' + (data.id)] = unitData;
    }
    _s2cGetGemstone(id, message) {
        this._gemstoneList = {};
        var gemstones = message['gemstones'] || {};
        for (var i in gemstones) {
            var data = gemstones[i];
            this._setGemstoneData(data);
        }
    }
    updateData(datas) {
        if (datas == null || typeof (datas) != 'object') {
            return;
        }
        if (this._gemstoneList == null) {
            return;
        }
        for (var i = 0; i < datas.length; i++) {
            this._setGemstoneData(datas[i]);
        }
    }
    insertData(datas) {
        if (datas == null || typeof (datas) != 'object') {
            return;
        }
        if (this._gemstoneList == null) {
            return;
        }
        for (var i = 0; i < datas.length; i++) {
            this._setGemstoneData(datas[i]);
        }
    }
    deleteData(datas) {
        if (datas == null || typeof (datas) != 'object') {
            return;
        }
        if (this._gemstoneList == null) {
            return;
        }
        for (var i = 0; i < datas.length; i++) {
            var id = datas[i];
            this._gemstoneList['k_' + (id)] = null;
        }
    }
    getUnitDataWithId(id) {
        var data = this._gemstoneList['k_' + (id)];
        return data;
    }
    getGemstonesData(sortFuncType ?) {
        var sortFun;
        if (sortFuncType && sortFuncType == 1) {
            sortFun = function (a, b) {
                return b.getConfig().sorting - a.getConfig().sorting;
            };
        } else {
            sortFun = function (a, b) {
                return a.getConfig().sorting - b.getConfig().sorting;
            };
        }
        var result: any = [];
        for (var k in this._gemstoneList) {
            var unit = this._gemstoneList[k];
            unit && result.push(unit);
        }
        result.sort(sortFun);
        return result;
    }

}