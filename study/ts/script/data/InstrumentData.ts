import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_UserData, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import { InstrumentUnitData } from "./InstrumentUnitData";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { FunctionConst } from "../const/FunctionConst";
export interface InstrumentData {
    getCurInstrumentId(): number
    setCurInstrumentId(value: number): void
    getLastCurInstrumentId(): number
}
let schema = {};
schema['curInstrumentId'] = [
    'number',
    0
];

export class InstrumentData extends BaseData {
    public static schema = schema;
    constructor() {
        super();

        this._instrumentList = {};
        this._heroMap = {};
        this._createHeroMap();
        this._recvGetInstrument = G_NetworkManager.add(MessageIDConst.ID_S2C_GetInstrument, this._s2cGetInstrument.bind(this));
        this._recvAddFightInstrument = G_NetworkManager.add(MessageIDConst.ID_S2C_AddFightInstrument, this._s2cAddFightInstrument.bind(this));
        this._recvClearFightInstrument = G_NetworkManager.add(MessageIDConst.ID_S2C_ClearFightInstrument, this._s2cClearFightInstrument.bind(this));
        this._recvInstrumentUpLevel = G_NetworkManager.add(MessageIDConst.ID_S2C_InstrumentUpLevel, this._s2cInstrumentUpLevel.bind(this));
        this._recvInstrumentUpLimitLevel = G_NetworkManager.add(MessageIDConst.ID_S2C_InstrumentUpLimitLevel, this._s2cInstrumentUpLimitLevel.bind(this));
        this._recvInstrumentLimitLvPutRes = G_NetworkManager.add(MessageIDConst.ID_S2C_InstrumentLimitLvPutRes, this._s2cInstrumentLimitLvPutRes.bind(this));
        this._recvInstrumentRecycle = G_NetworkManager.add(MessageIDConst.ID_S2C_InstrumentRecycle, this._s2cInstrumentRecycle.bind(this));
        this._recvInstrumentReborn = G_NetworkManager.add(MessageIDConst.ID_S2C_InstrumentReborn, this._s2cInstrumentReborn.bind(this));
        this._recvInstrumentTransform = G_NetworkManager.add(MessageIDConst.ID_S2C_InstrumentTransform, this._s2cInstrumentTransform.bind(this));
    }
    private _instrumentList;
    private _heroMap;
    private _recvGetInstrument;
    private _recvAddFightInstrument;
    private _recvClearFightInstrument;
    private _recvInstrumentUpLevel;
    private _recvInstrumentUpLimitLevel;
    private _recvInstrumentLimitLvPutRes;
    private _recvInstrumentRecycle;
    private _recvInstrumentReborn;
    private _recvInstrumentTransform;

    clear() {
        this._recvGetInstrument.remove();
        this._recvGetInstrument = null;
        this._recvAddFightInstrument.remove();
        this._recvAddFightInstrument = null;
        this._recvClearFightInstrument.remove();
        this._recvClearFightInstrument = null;
        this._recvInstrumentUpLevel.remove();
        this._recvInstrumentUpLevel = null;
        this._recvInstrumentUpLimitLevel.remove();
        this._recvInstrumentUpLimitLevel = null;
        this._recvInstrumentLimitLvPutRes.remove();
        this._recvInstrumentLimitLvPutRes = null;
        this._recvInstrumentRecycle.remove();
        this._recvInstrumentRecycle = null;
        this._recvInstrumentReborn.remove();
        this._recvInstrumentReborn = null;
        this._recvInstrumentTransform.remove();
        this._recvInstrumentTransform = null;
    }
    reset() {
        this._instrumentList = {};
        this._heroMap = {};
    }
    _createHeroMap() {

        var HeroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        var len = HeroConfig.length();
        for (var i = 0; i < len; i++) {
            var info = HeroConfig.indexOf(i);
            var id = info.instrument_id;
            var heroBaseId = info.id;
            if (this._heroMap[id] == null) {
                this._heroMap[id] = heroBaseId;
            }
        }
    }
    getHeroMap() {
        return this._heroMap;
    }
    createTempInstrumentUnitData(data) {
        if (!data || typeof (data) != 'object')
            cc.error('InstrumentData:createTempInstrumentUnitData data must be table');
        var baseData: any = {};
        baseData.id = data.id || 0;
        baseData.base_id = data.baseId || 1;
        baseData.level = data.level || 0;
        baseData.limit_level = data.limit_level || 0;
        var unitData = new InstrumentUnitData();
        unitData.updateData(baseData);
        return unitData;
    }
    getHeroBaseId(id) {
        var heroId = this._heroMap[id];
        if (!heroId)
            cc.error('hero config can not find instrument_id = %d' + id);
        return heroId;
    }
    _setInstrumentData(data) {
        this._instrumentList['k_' + (data.id)] = null;
        var unitData = new InstrumentUnitData();
        unitData.updateData(data);
        this._instrumentList['k_' + (data.id)] = unitData;
    }
    _s2cGetInstrument(id, message) {
        this._instrumentList = {};
        var instrumentList = message['instruments'] || {};
        for (var i in instrumentList) {
            var data = instrumentList[i];
            this._setInstrumentData(data);
        }
    }
    getInstrumentDataWithId(id) {
        var unitData = this._instrumentList['k_' + (id)];
        // if (!unitData)
        //     cc.error('Can not find id = %d in InstrumentDataList' + id);
        return unitData;
    }
    updateData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._instrumentList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            this._setInstrumentData(data[i]);
        }
    }
    insertData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._instrumentList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            this._setInstrumentData(data[i]);
        }
    }
    deleteData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._instrumentList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            var id = data[i];
            // this._instrumentList['k_' + (id)] = null;
            delete this._instrumentList['k_' + (id)];
        }
    }
    getInstrumentTotalCount() {
        var count = 0;
        for (var k in this._instrumentList) {
            var v = this._instrumentList[k];
            count = count + 1;
        }
        return count;
    }
    getInstrumentIdWithBaseId(baseId) {
        for (var k in this._instrumentList) {
            var data = this._instrumentList[k];
            if (data.getBase_id() == baseId) {
                return data.getId();
            }
        }
        return null;
    }
    getInstrumentCountWithBaseId(baseId) {
        var count = 0;
        for (var k in this._instrumentList) {
            var data = this._instrumentList[k];
            if (data.getBase_id() == baseId) {
                count = count + 1;
            }
        }
        return count;
    }
    getListDataBySort() {
        var result: any[] = [];
        var temp: any[] = [];
        function sortFun(a, b) {
            if (a.isInBattle() != b.isInBattle()) {
                return a.isInBattle() == true ? -1 : 1;
            } else if(a.getLimit_level() != b.getLimit_level()){
                return b.getLimit_level() - a.getLimit_level();
            } else if (a.getLevel() != b.getLevel()) {
                return b.getLevel() - a.getLevel();
            } else if (a.getConfig().color != b.getConfig().color) {
                return b.getConfig().color-a.getConfig().color;
            }else {
                return a.getBase_id() - b.getBase_id();
            }
        }
        for (var k in this._instrumentList) {
            var data = this._instrumentList[k];
            temp.push(data);
        }
        temp.sort(sortFun);
        for (var i in temp) {
            var data = temp[i];
            result.push(data.getId());
        }
        return result;
    }
    getRangeDataBySort() {
        var result: any[] = [];
        var temp: any[] = [];
        function sortFun(a, b) {
            if (a.isInBattle() != b.isInBattle()) {
                return a.isInBattle() == true ? -1 : 1;
            } else if(a.getLimit_level() != b.getLimit_level()){
                return b.getLimit_level() - a.getLimit_level();
            } else if (a.getLevel() != b.getLevel()) {
                return b.getLevel() - a.getLevel();
            } else if (a.getConfig().color != b.getConfig().color) {
                return b.getConfig().color-a.getConfig().color;
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        }
        for (var k in this._instrumentList) {
            var data = this._instrumentList[k];
            temp.push(data);
        }
        temp.sort(sortFun);
        for (var i in temp) {
            var data = temp[i];
            result.push(data.getId());
        }
        return result;
    }
    getReplaceInstrumentListWithSlot(pos, heroBaseId) {
        var heroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(heroBaseId);
        if (!heroConfig) {
            cc.error('hero config can not find id = %d' + heroBaseId);
            return [];
        }
        var instrumentId = heroConfig.instrument_id;
        var result: any[] = [];
        var wear: any[] = [];
        var noWear: any[] = [];
        function sortFun(a, b) {
            if(a.getLimit_level() != b.getLimit_level()){
                return b.getLimit_level() - a.getLimit_level();
            }else if (a.getLevel() != b.getLevel()) {
                return b.getLevel() - a.getLevel();
            } else if (a.getConfig().color != b.getConfig().color) {
                return b.getConfig().color - a.getConfig().color;
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        }
        for (var k in this._instrumentList) {
            var data = this._instrumentList[k];
            if (data.getBase_id() == instrumentId) {
                var battleData = G_UserData.getBattleResource().getInstrumentDataWithId(data.getId());
                if (battleData) {
                    if (battleData.getPos() != pos) {
                        wear.push(data);
                        result.push(data);
                    }
                } else {
                    noWear.push(data);
                    result.push(data);
                }
            }
        }
        result.sort(sortFun);
        return [
            result,
            noWear,
            wear
        ];
    }
    getRecoveryList() {
        var result: any[] = [];
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var isTrainA = a.isAdvanced() && 1 || 0;
            var isTrainB = b.isAdvanced() && 1 || 0;
            if (colorA != colorB) {
                return colorA - colorB;
            } else if (isTrainA != isTrainB) {
                return isTrainA - isTrainB;
            } else if(a.getLimit_level() != b.getLimit_level()){
                return b.getLimit_level() - a.getLimit_level();
            } else if (a.getLevel() != b.getLevel()) {
                return a.getLevel() - b.getLevel();
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        for (var k in this._instrumentList) {
            var unit = this._instrumentList[k];
            var isInBattle = unit.isInBattle();
            var color = unit.getConfig().color;
            if (!isInBattle && color != 7) {
                result.push(unit);
            }
        }
        result.sort(sortFun);
        return result;
    }
    getRecoveryAutoList() {
        var result: any[] = [];
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            if (colorA != colorB) {
                return colorA - colorB;
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        for (var k in this._instrumentList) {
            var unit = this._instrumentList[k];
            var color = unit.getConfig().color;
            var isTrain = unit.isAdvanced();
            var isInBattle = unit.isInBattle();
            if (!isInBattle && color < 5 && !isTrain) {
                result.push(unit);
            }
        }
        result.sort(sortFun);
        return result;
    }
    getRebornList() {
        var result: any[] = [];
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var isTrainA = a.isAdvanced() && 1 || 0;
            var isTrainB = b.isAdvanced() && 1 || 0;
            if (colorA != colorB) {
                return colorA - colorB;
            } else if (isTrainA != isTrainB) {
                return isTrainA - isTrainB;
            } else if(a.getLimit_level() != b.getLimit_level()){
                return b.getLimit_level() - a.getLimit_level();
            } else if (a.getLevel() != b.getLevel()) {
                return a.getLevel() - b.getLevel();
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        for (var k in this._instrumentList) {
            var unit = this._instrumentList[k];
            var isAdvanced = unit.isAdvanced();
            if (isAdvanced) {
                var isInBattle = unit.isInBattle();
                if (!isInBattle) {
                    result.push(unit);
                }
            }
        }
        result.sort(sortFun);
        return result;
    }
    getTransformSrcList() {
        var sortFun = function (a, b) {
            var configA = a.getConfig();
            var configB = b.getConfig();
            if (configA.color != configB.color) {
                return configB.color - configA.color;
            } else if (a.getLimit_level() != b.getLimit_level()) {
                return b.getLimit_level() - a.getLimit_level();
            } else if (a.getLevel() != b.getLevel()) {
                return b.getLevel() - a.getLevel();
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        };
        var result = {
            1: [],
            2: [],
            3: [],
            4: []
        };
        for (var k in this._instrumentList) {
            var unit = this._instrumentList[k];
            var isInBattle = unit.isInBattle();
            var isSrc = unit.isCanBeTransformSrc(); // --是否能是置换者
            var color = unit.getConfig().color;
            if (!isInBattle && isSrc && color >= 5 && color <= 7) {
                var country = unit.getCountry();
                if (result[country]) {
                    result[country].push(unit);
                }
            }
        }
        for (var i = 1; i <= 4; i++) {
            result[i].sort(sortFun);
        }
        return result;
    }
    isHaveInstrumentNotInPos(heroBaseId) {
        var heroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(heroBaseId);
        if (!heroConfig)
            cc.error('hero config can not find id = %d' + heroBaseId);
        var instrumentId = heroConfig.instrument_id;
        for (var k in this._instrumentList) {
            var unit = this._instrumentList[k];
            var pos = unit.getPos();
            if (pos == null && unit.getBase_id() == instrumentId) {
                return true;
            }
        }
        return false;
    }
    isHaveBetterInstrument(pos, heroBaseId) {
        function isBetter(a, b) {
            var colorA = a.getConfig().color;
            var levelA = a.getLevel();
            var colorB = b.getConfig().color;
            var levelB = b.getLevel();
            if (colorA != colorB) {
                return colorA > colorB;
            } else if (levelA != levelB) {
                return levelA > levelB;
            }
        }
        var heroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(heroBaseId);
        if (!heroConfig)
            cc.error('hero config can not find id = %d' + heroBaseId);
        var tempInstrumentId = heroConfig.instrument_id;
        var instrumentId = G_UserData.getBattleResource().getResourceId(pos, 3, 1);
        if (!instrumentId) {
            return false;
        }
        var instrumentData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
        if (!instrumentData) {
            return false;
        }
        for (var k in this._instrumentList) {
            var unit = this._instrumentList[k];
            var pos = unit.getPos();
            if (pos == null && unit.getBase_id() == tempInstrumentId) {
                if (isBetter(unit, instrumentData)) {
                    return true;
                }
            }
        }
        return false;
    }
    getSameCardsWithBaseId(baseId) {
        var result: any = [];
        for (var k in this._instrumentList) {
            var data = this._instrumentList[k];
            if (data.getBase_id() == baseId && !data.isInBattle() && !data.isAdvanced()) {
                result.push(data);
            }
        }
        return result;
    }
    isInstrumentLevelMaxWithPos(pos) {
        var ids = G_UserData.getBattleResource().getInstrumentIdsWithPos(pos);
        var instrumentId = ids[1];
        if (instrumentId && instrumentId > 0) {
            var unitData = this.getInstrumentDataWithId(instrumentId);
            var level = unitData.getLevel();
            var maxLevel = unitData.getConfig().level_max;
            if (level >= maxLevel) {
                return true;
            }
        }
        return false;
    }
    c2sAddFightInstrument(pos, instrumentId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_AddFightInstrument, {
            pos: pos,
            instrument_id: instrumentId
        });
    }
    _s2cAddFightInstrument(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var id = message['instrument_id'] || 0;
        var pos = message['pos'] || 0;
        var oldId = message['old_id'] || 0;
        G_UserData.getBattleResource().setInstrumentPosTable(pos, id, oldId);
        G_SignalManager.dispatch(SignalConst.EVENT_INSTRUMENT_ADD_SUCCESS, id, pos, oldId);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TREASURE);
    }
    c2sClearFightInstrument(pos) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ClearFightInstrument, { pos: pos });
    }
    _s2cClearFightInstrument(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var pos = message['pos'] || 0;
        var oldId = message['old_id'] || 0;
        G_UserData.getBattleResource().clearInstrumentPosTable(pos, oldId);
        G_SignalManager.dispatch(SignalConst.EVENT_INSTRUMENT_CLEAR_SUCCESS);
    }
    c2sInstrumentUpLevel(instrumentId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_InstrumentUpLevel, { id: instrumentId });
    }
    _s2cInstrumentUpLevel(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_INSTRUMENT_LEVELUP_SUCCESS);
    }
    c2sInstrumentUpLimitLevel(instrumentId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_InstrumentUpLimitLevel, { id: instrumentId });
    }
    _s2cInstrumentUpLimitLevel(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_INSTRUMENT_LIMIT_SUCCESS);
    }
    c2sInstrumentLimitLvPutRes(instrumentId, pos, subItems) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_InstrumentLimitLvPutRes, {
            instrument_id: instrumentId,
            pos: pos,
            sub_item: subItems
        });
    }
    _s2cInstrumentLimitLvPutRes(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var pos = message['pos'] || 0;
        G_SignalManager.dispatch(SignalConst.EVENT_INSTRUMENT_LIMIT_LV_PUT_RES, pos);
    }
    c2sInstrumentRecycle(instrumentId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_InstrumentRecycle, { instrument_id: instrumentId });
    }
    _s2cInstrumentRecycle(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_INSTRUMENT_RECYCLE_SUCCESS, awards);
    }
    c2sInstrumentReborn(instrumentId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_InstrumentReborn, { instrument_id: instrumentId });
    }
    _s2cInstrumentReborn(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_INSTRUMENT_REBORN_SUCCESS, awards);
    }
    c2sInstrumentTransform(srcIds, toId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_InstrumentTransform, {
            to_id: toId,
            src_ids: srcIds
        });
    }
    _s2cInstrumentTransform(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_INSTRUMENT_TRANSFORM_SUCCESS);
    }
}