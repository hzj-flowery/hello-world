import { BaseData } from "./BaseData";
import { G_NetworkManager, G_ConfigLoader, G_UserData, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { TacticsDataHelper } from "../utils/data/TacticsDataHelper";
import { table } from "../utils/table";
import { TacticsConst } from "../const/TacticsConst";
import { TacticsUnitData } from "./TacticsUnitData";
import { HeroDataHelper } from "../utils/data/HeroDataHelper";
import { clone, rawget, assert } from "../utils/GlobleFunc";
import { FunctionCheck } from "../utils/logic/FunctionCheck";
import { FunctionConst } from "../const/FunctionConst";
import { SignalConst } from "../const/SignalConst";
import { MessageErrorConst } from "../const/MessageErrorConst";

var schema = {};
export class TacticsData extends BaseData {
    public static schema = schema;
    _suitInfo: {};
    _tacticsUnits: TacticsUnitData[];
    _tacticsIdMap: {};
    _tacticsUnlockInfo: {};
    _recvGetTacticsList: any;
    _recvUnlockTacticsPos: any;
    _recvCreateTactics: any;
    _recvPutOnTactics: any;
    _recvPutDownTactics: any;
    _recvAddTacticsPro: any;
    _recvGetFromationTactics: any;
    constructor(properties?) {
        super(properties);
        this._suitInfo = {};
        this._tacticsUnits = [];
        this._tacticsIdMap = {};
        this._tacticsUnlockInfo = {};
        this._recvGetTacticsList = G_NetworkManager.add(MessageIDConst.ID_S2C_GetTacticsInfo, handler(this, this._s2cGetTacticsList));
        this._recvUnlockTacticsPos = G_NetworkManager.add(MessageIDConst.ID_S2C_UnlockHeroTacticsPos, handler(this, this._s2cUnlockTacticsPos));
        this._recvCreateTactics = G_NetworkManager.add(MessageIDConst.ID_S2C_CreateTactics, handler(this, this._s2cCreateTactics));
        this._recvPutOnTactics = G_NetworkManager.add(MessageIDConst.ID_S2C_AddHeroTactics, handler(this, this._s2cPutOnTactics));
        this._recvPutDownTactics = G_NetworkManager.add(MessageIDConst.ID_S2C_ClearHeroTactics, handler(this, this._s2cPutDownTactics));
        this._recvAddTacticsPro = G_NetworkManager.add(MessageIDConst.ID_S2C_AddTracticsProficiency, handler(this, this._s2cAddTacticsPro));
        this._recvGetFromationTactics = G_NetworkManager.add(MessageIDConst.ID_S2C_GetFormationTactics, handler(this, this._s2cGetFromationTactics));
        this._initData();
    }
    clear() {
        this._recvGetTacticsList.remove();
        this._recvGetTacticsList = null;
        this._recvUnlockTacticsPos.remove();
        this._recvUnlockTacticsPos = null;
        this._recvCreateTactics.remove();
        this._recvCreateTactics = null;
        this._recvPutOnTactics.remove();
        this._recvPutOnTactics = null;
        this._recvPutDownTactics.remove();
        this._recvPutDownTactics = null;
        this._recvAddTacticsPro.remove();
        this._recvAddTacticsPro = null;
        this._recvGetFromationTactics.remove();
        this._recvGetFromationTactics = null;
    }
    reset() {
        this._suitInfo = {};
        this._tacticsUnits = [];
        this._tacticsIdMap = {};
    }
    _initData() {
        this._initSuitableHeroIds();
        this._initUnitData();
    }
    _initSuitableHeroIds() {
        var suitInfo = TacticsDataHelper.getTacticsSuitInfo();
        this._suitInfo = suitInfo;
    }
    _initUnitData() {
        this._tacticsUnits = [];
        var tacticsConfig = G_ConfigLoader.getConfig('tactics');
        var len = tacticsConfig.length();
        for (var i = 0; i < len; i++) {
            var tacticsInfo = tacticsConfig.indexOf(i);
            if (tacticsInfo.gm > 0) {
                var baseId = tacticsInfo.id;
                for (var j = 0; j < tacticsInfo.limit; j++) {
                    var unitData = new TacticsUnitData();
                    unitData.resetWithDefault(baseId);
                    table.insert(this._tacticsUnits, unitData);
                }
            }
        }
        this._tacticsIdMap = {};
    }
    isSuitTacticsToHero(tacticsId, heroBaseId) {
        var suitInfo = this._suitInfo[tacticsId];
        if (suitInfo.suitType == TacticsConst.SUIT_TYPE_NONE) {
            for (var i in suitInfo.heroIds) {
                var heroId = suitInfo.heroIds[i];
                if (heroId == heroBaseId) {
                    return true;
                }
            }
        } else {
            var heroInfo = HeroDataHelper.getHeroConfig(heroBaseId);
            if (suitInfo.suitType == TacticsConst.SUIT_TYPE_ALL) {
                return true;
            } else if (suitInfo.suitType == TacticsConst.SUIT_TYPE_MALE) {
                if (heroInfo.gender == 1 && (heroInfo.type == 1 || heroInfo.color >= 4)) {
                    return true;
                }
            } else if (suitInfo.suitType == TacticsConst.SUIT_TYPE_FEMALE) {
                if (heroInfo.gender == 2 && (heroInfo.type == 1 || heroInfo.color >= 4)) {
                    return true;
                }
            } else if (suitInfo.suitType == TacticsConst.SUIT_TYPE_JOINT) {
                if (heroInfo.type == 2 && heroInfo.skill_3_type != 0 && heroInfo.color >= 4) {
                    return true;
                }
            }
        }
        return false;
    }
    isHaveTacticsNotInPos(pos, slot) {
        var heroUID = G_UserData.getTeam().getHeroIdWithPos(pos);
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroUID);
        for (var uid in this._tacticsIdMap) {
            var index = this._tacticsIdMap[uid];
            var unitData = this._tacticsUnits[index];
            if (unitData.isCanWear() && unitData.getHero_id() == 0) {
                var isSuitHero = this.isSuitTacticsToHero(unitData.getBase_id(), heroUnitData.getAvatarToHeroBaseId());
                if (isSuitHero && unitData.isCanWearWithPos(pos)) {
                    return true;
                }
            }
        }
        return false;
    }
    isHaveBetterTactics(pos, slot) {
        function isBetter(a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            if (colorA != colorB) {
                return colorA > colorB;
            }
        }
        var tacticsId = G_UserData.getBattleResource().getResourceId(pos, 5, slot);
        if (!tacticsId) {
            return false;
        }
        var unitData = this.getUnitDataWithId(tacticsId);
        if (!unitData) {
            return false;
        }
        for (var k in this._tacticsUnits) {
            var unit = this._tacticsUnits[k];
            if (unit.isCanWear() && isBetter(unit, unitData) && unit.getHero_id() == 0) {
                var heroUID = G_UserData.getTeam().getHeroIdWithPos(pos);
                var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroUID);
                var isSuitHero = this.isSuitTacticsToHero(unit.getBase_id(), heroUnitData.getAvatarToHeroBaseId());
                if (isSuitHero) {
                    if (unit.isCanWearWithPos(pos, slot)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    getSuitInfoWithTacticsId(tacticsId) {
        var heroIds = {};
        var limitStrs = {};
        var suitType = TacticsConst.SUIT_TYPE_NONE;
        var info = this._suitInfo[tacticsId];
        if (info) {
            heroIds = info.heroIds;
            limitStrs = info.heroName;
            suitType = info.suitType;
        }
        return [
            heroIds,
            limitStrs,
            suitType
        ];
    }
    getTacticsListByPos(heroPos, pos) {
        function sortFunc(a, b) {
            if (a.wearedSort != b.wearedSort) {
                return a.wearedSort > b.wearedSort;
            } else if (a.suitSort != b.suitSort) {
                return a.suitSort > b.suitSort;
            } else if (a.getConfig().color != b.getConfig().color) {
                return a.getConfig().color > b.getConfig().color;
            } else if (a.getBase_id() != b.getBase_id()) {
                return a.getBase_id() < b.getBase_id();
            } else {
                return a.getId() < b.getId();
            }
        }
        var heroId = G_UserData.getTeam().getHeroIdWithPos(heroPos);
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        var heroBaseId = heroUnitData.getAvatarToHeroBaseId();
        var tmp = this.getTacticsList(TacticsConst.GET_LIST_TYPE_STUDIED);
        var list = [];
        for (var i in tmp) {
            var data = tmp[i];
            var baseId = data.getBase_id();
            var isEffect = this.isSuitTacticsToHero(baseId, heroBaseId);
            var isCanWear = data.isCanWearWithPos(heroPos, pos);
            var isEffective = TacticsDataHelper.isEffectiveTacticsToHero(baseId, heroPos);
            var isWeared = data.getHero_id() == heroUnitData.getId();
            var isSuit = isEffect && isCanWear && isEffective;
            if (isSuit || isWeared) {
                var cloneData = (data);
                cloneData.suitSort = isSuit && 1 || 0;
                if (data.getHero_id() == heroId) {
                    cloneData.wearedSort = 1;
                } else {
                    cloneData.wearedSort = data.getHero_id() > 0 && -1 || 0;
                }
                table.insert(list, cloneData);
            }
        }
        table.sort(list, sortFunc);
        var result = [];
        for (var i1 in list) {
            var data1 = list[i1];
            table.insert(result, data1.getId());
        }
        return result;
    }
    getTacticsList(getType, color?) {
        function sortFunc(a, b) {
            if (a.suitSort != b.suitSort) {
                return a.suitSort > b.suitSort;
            } else if (a.getConfig().color != b.getConfig().color) {
                return a.getConfig().color > b.getConfig().color;
            } else if (a.getBase_id() != b.getBase_id()) {
                return a.getBase_id() < b.getBase_id();
            } else {
                return a.getId() < b.getId();
            }
        }
        var list = [];
        if (getType == TacticsConst.GET_LIST_TYPE_STUDIED) {
            for (var uid in this._tacticsIdMap) {
                var index = this._tacticsIdMap[uid];
                var unitData = this._tacticsUnits[index];
                if (unitData.isCanWear()) {
                    table.insert(list, unitData);
                }
            }
        } else if (getType == TacticsConst.GET_LIST_TYPE_UNLCOK) {
            for (var uid in this._tacticsIdMap) {
                var index = this._tacticsIdMap[uid];
                var unitData = this._tacticsUnits[index];
                table.insert(list, unitData);
            }
        } else {
            for (var index3 in this._tacticsUnits) {
                var unitData = this._tacticsUnits[index3];
                if (unitData.isShow()) {
                    table.insert(list, unitData);
                }
            }
        }
        var res = [];
        if (color != null) {
            for (var i in list) {
                var v = list[i];
                if (color == v.getConfig().color) {
                    table.insert(res, v);
                }
            }
        } else {
            res = list;
        }
        table.sort(res, sortFunc);
        return res;
    }
    getUnlockInfoByPos(pos) {
        var result = this._tacticsUnlockInfo[pos] || {};
        return result;
    }
    getHeroTacticsPosState(heroId) {
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        var pos = heroUnitData.getPos();
        var posList = this.getUnlockInfoByPos(pos);
        var list = [];
        for (var slot = 1; slot != TacticsConst.MAX_POSITION; slot++) {
            var isOpen = FunctionCheck.funcIsOpened(FunctionConst['FUNC_TACTICS_POS' + slot]);
            var item = {
                isOpen: isOpen,
                isUnlocked: false,
                tacticsUnitData: null
            };
            table.insert(list, item);
        }
        for (var uid in this._tacticsIdMap) {
            var index = this._tacticsIdMap[uid];
            var unitData = this._tacticsUnits[index];
            var heroData = unitData.getHeroDataOfWeared();
            if (heroData.getId() == heroUnitData.getId()) {
                var pos = unitData.getPos();
                list[pos].tacticsUnitData = unitData;
                list[pos].isUnlocked = true;
            }
        }
        for (var _ in posList) {
            var pos1 = posList[_];
            list[pos1].isUnlocked = true;
        }
        return list;
    }
    _setTacticsData(data) {
        var id = data.tactics_id;
        var baseId = data.tactics_type;
        var index = -1;
        if (this._tacticsIdMap[id]) {
            index = this._tacticsIdMap[id];
        } else {
            for (var i in this._tacticsUnits) {
                var unitData = this._tacticsUnits[i];
                if (unitData.getBase_id() == baseId) {
                    if (unitData.getId() > 0 && unitData.getId() != id) {
                        return;
                    }
                    index = Number(i);
                    break;
                }
            }
        }
        if (index != -1) {
            this._tacticsIdMap[id] = index;
            this._tacticsUnits[index].updateData(data);
        }
    }
    _updateUnlockInfo(info) {
        var list = {};
        for (var i in info) {
            var v = info[i];
            var pos = rawget(v, 'pos');
            var slots = rawget(v, 'slots');
            if (pos) {
                list[pos] = slots;
            }
        }
        this._tacticsUnlockInfo = list;
    }
    _insertUnlockInfo(pos, slot) {
        if (pos != 0) {
            var list = this._tacticsUnlockInfo[pos] || [];
            table.insert(list, slot);
            this._tacticsUnlockInfo[pos] = list;
        }
    }
    updateData(data) {
        if (data == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            this._setTacticsData(data[i]);
        }
    }
    insertData(data) {
        if (data == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            this._setTacticsData(data[i]);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TACTICS);
    }
    deleteData(data) {
        if (data == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            var id = data[i];
            var index = this._tacticsIdMap[id];
            var unitData = this._tacticsUnits[index];
            if (unitData != null) {
                unitData.resetWithDefault(unitData.getBase_id());
            }
            this._tacticsIdMap[id] = null;
        }
    }
    getUnitDataWithId(id) {
        var index = this._tacticsIdMap[id];
        var unitData = this._tacticsUnits[index];
        assert(unitData, ('TacticsData:getUnitDataWithId is Wrong, unitData, id = %d'));
        return unitData;
    }
    getUnitDataWithBaseId(baseId) {
        for (var i in this._tacticsUnits) {
            var unitData = this._tacticsUnits[i];
            if (unitData.getBase_id() == baseId) {
                return unitData;
            }
        }
        return null;
    }
    getTacticsCount() {
        var count = table.nums(this._tacticsIdMap);
        return count;
    }
    getCountWithBaseId(baseId) {
        var count = 0;
        for (var i in this._tacticsUnits) {
            var unitData = this._tacticsUnits[i];
            if (unitData.getBase_id() == baseId) {
                count = count + 1;
            }
        }
        return count;
    }
    getListNoWeared() {
        var result = [];
        for (var _ in this._tacticsIdMap) {
            var index = this._tacticsIdMap[_];
            var unitData = this._tacticsUnits[index];
            if (unitData.isCanWear() && !unitData.isWeared()) {
                table.insert(result, unitData);
            }
        }
        return result;
    }
    getUnitDataListWithPos(pos) {
        var result = [];
        if (pos == null || pos == 0) {
            return result;
        }
        var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
        for (var _ in this._tacticsIdMap) {
            var index = this._tacticsIdMap[_];
            var unitData = this._tacticsUnits[index];
            if (unitData.getHero_id() == heroId) {
                table.insert(result, unitData);
            }
        }
        return result;
    }
    getCanUnlockList(color) {
        var result = [];
        for (var _ in this._tacticsUnits) {
            var unitData = this._tacticsUnits[_];
            if ((color == null || color == unitData.getConfig()['color']) && unitData.isCanUnlock()) {
                table.insert(result, unitData);
            }
        }
        return result;
    }
    c2sGetTacticsList() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetTacticsInfo, {});
    }
    _s2cGetTacticsList(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.updateData(message.tacticsInfo);
        this._updateUnlockInfo(message.tactics_pos);
        G_SignalManager.dispatch(SignalConst.EVENT_TACTICS_GETLIST, message);
    }
    c2sCreateTactics(tacticsId, materials) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_CreateTactics, {
            tactics_type: tacticsId,
            materials_id: materials
        });
    }
    _s2cCreateTactics(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        for (var i in message.tacticsInfo) {
            var v = message.tacticsInfo[i];
            this._setTacticsData(v);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TACTICS_CREATE, message);
    }
    c2sAddTacticsPro(tacticsUId, materials) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_AddTracticsProficiency, {
            tactics_id: tacticsUId,
            materials_id: materials
        });
    }
    _s2cAddTacticsPro(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        for (var i in message.tacticsInfo) {
            var v = message.tacticsInfo[i];
            this._setTacticsData(v);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TACTICS_ADD_PROFICIENCY, message);
    }
    c2sUnlockTacticsPos(pos, slot, materials) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_UnlockHeroTacticsPos, {
            format_pos: pos,
            pos: slot,
            materials_id: materials
        });
    }
    _s2cUnlockTacticsPos(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var pos = rawget(message, 'format_pos') || 0;
        var slot = rawget(message, 'pos');
        this._insertUnlockInfo(pos, slot);
        G_SignalManager.dispatch(SignalConst.EVENT_TACTICS_UNLOCK_POSITION, pos, slot);
    }
    c2sPutOnTactics(tacticsUId, heroId, pos) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_AddHeroTactics, {
            tactics_id: tacticsUId,
            hero_id: heroId,
            pos: pos
        });
    }
    _s2cPutOnTactics(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var id = rawget(message, 'new_tactics_id');
        assert(id, '_s2cPutOnTactics, message.id = nil');
        var heroId = rawget(message, 'hero_id');
        assert(heroId, '_s2cPutOnTactics, message.hero_id = nil');
        var pos = G_UserData.getHero().getUnitDataWithId(heroId).getPos();
        var slot = rawget(message, 'pos');
        assert(slot, '_s2cPutOnTactics, message.pos = nil');
        var oldId = rawget(message, 'old_tactics_id') || 0;
        var oldHeroId = rawget(message, 'old_hero_id') || 0;
        var oldPos = 0;
        if (oldHeroId > 0) {
            oldPos = G_UserData.getHero().getUnitDataWithId(oldHeroId).getPos();
        }
        var oldSlot = rawget(message, 'old_pos') || 0;
        var tacticsUnitData = G_UserData.getTactics().getUnitDataWithId(id);
        tacticsUnitData.setHero_id(heroId);
        tacticsUnitData.setPos(slot);
        G_UserData.getBattleResource().setTacticsPosTable(pos, slot, id, oldId, oldPos, oldSlot);
        G_SignalManager.dispatch(SignalConst.EVENT_TACTICS_ADD_SUCCESS, id, pos, slot);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TACTICS);
    }
    c2sPutDownTactics(tacticsUId, heroId, pos) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ClearHeroTactics, {
            tactics_id: tacticsUId,
            hero_id: heroId,
            pos: pos
        });
    }
    _s2cPutDownTactics(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var heroId = rawget(message, 'hero_id') || 0;
        var pos = 0;
        if (heroId > 0) {
            pos = G_UserData.getHero().getUnitDataWithId(heroId).getPos();
        }
        var slot = rawget(message, 'pos') || 0;
        var oldId = rawget(message, 'tactics_id') || 0;
        var tacticsUnitData = G_UserData.getTactics().getUnitDataWithId(oldId);
        tacticsUnitData.setHero_id(0);
        tacticsUnitData.setPos(0);
        G_UserData.getBattleResource().clearTacticsPosTable(pos, slot, oldId);
        G_SignalManager.dispatch(SignalConst.EVENT_TACTICS_REMOVE_SUCCESS, oldId, pos, slot);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TACTICS);
    }
    c2sGetFromationTactics() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetFormationTactics, {});
    }
    _s2cGetFromationTactics(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var formationTactics = rawget(message, 'formation_tactics');
        G_SignalManager.dispatch(SignalConst.EVENT_TACTICS_GET_FORMATION, message);
    }
}