import { G_NetworkManager, G_UserData, G_SignalManager, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { SilkbagConst } from "../const/SilkbagConst";
import { SilkbagUnitData } from "./SilkbagUnitData";
import { FunctionConst } from "../const/FunctionConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { stringUtil } from "../utils/StringUtil";
import { FunctionCheck } from "../utils/logic/FunctionCheck";
import { HeroData } from "./HeroData";
import { BaseData } from "./BaseData";
import { SilkbagDataHelper } from "../utils/data/SilkbagDataHelper";
import { clone2 } from "../utils/GlobleFunc";

export class SilkbagData extends BaseData {
    _silkbagList: {};
    _applicableHeros: {};
    _recvGetSilkbag: any;
    _recvEquipSilkbag: any;
    constructor() {
        super()
        this._silkbagList = {};
        this._applicableHeros = {};
        this._recvGetSilkbag = G_NetworkManager.add(MessageIDConst.ID_S2C_GetSilkbag, this._s2cGetSilkbag.bind(this));
        this._recvEquipSilkbag = G_NetworkManager.add(MessageIDConst.ID_S2C_EquipSilkbag, this._s2cEquipSilkbag.bind(this));
        this._initApplicableHeroIds();
    }
    clear() {
        this._recvGetSilkbag.remove();
        this._recvGetSilkbag = null;
        this._recvEquipSilkbag.remove();
        this._recvEquipSilkbag = null;
    }
    reset() {
        this._silkbagList = {};
        this._applicableHeros = {};
    }
    _initApplicableHeroIds() {
        var silkbagConfig = G_ConfigLoader.getConfig(ConfigNameConst.SILKBAG);
        var len = silkbagConfig.length();
        for (var i = 0; i < len; i++) {
            var silkbagInfo = silkbagConfig.indexOf(i);
            var strHero =  silkbagInfo.hero;
            var heroIds = [];
            var suitType = SilkbagConst.SUIT_TYPE_NONE;
            if (strHero != '0' && strHero != '') {
                if (strHero == (SilkbagConst.ALL_HERO_ID).toString()) {
                    suitType = SilkbagConst.SUIT_TYPE_ALL;
                    var heroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO)
                    var len1 = heroConfig.length();
                    for (var j = 0; j < len1; j++) {
                        var info = heroConfig.indexOf(j);
                        if (info.type == 1) {
                            heroIds.push(info.id);
                        } else if (info.type == 2 && info.color >= 4) {
                            heroIds.push(info.id);
                        }
                    }
                } else if (strHero == (SilkbagConst.ALL_MALE_ID).toString()) {
                    suitType = SilkbagConst.SUIT_TYPE_MALE;
                    var heroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO)
                    var len2 = heroConfig.length();
                    for (var k = 0; k < len; k++) {
                        var info = heroConfig.indexOf(k);
                        if (info.type == 1 && info.gender == 1) {
                            heroIds.push(info.id);
                        } else if (info.type == 2 && info.gender == 1 && info.color >= 4) {
                            heroIds.push(info.id);
                        }
                    }
                } else if (strHero == (SilkbagConst.ALL_FEMALE_ID).toString()) {
                    suitType = SilkbagConst.SUIT_TYPE_FEMALE;
                    var heroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO)
                    var len3 = heroConfig.length();
                    for (var m = 0; m < len3; m++) {
                        var info = heroConfig.indexOf(m);
                        if (info.type == 1 && info.gender == 2) {
                            heroIds.push(info.id);
                        } else if (info.type == 2 && info.gender == 2 && info.color >= 4) {
                            heroIds.push(info.id);
                        }
                    }
                } else {
                    suitType = SilkbagConst.SUIT_TYPE_NONE;
                    var ids = stringUtil.split(strHero, '|');
                    for (var n in ids) {
                        var id = ids[n];
                        heroIds.push(parseFloat(id));
                    }
                }
            }
            this._applicableHeros[silkbagInfo.id] = {
                heroIds: heroIds,
                suitType: suitType
            };
        }
    }
    getHeroIdsWithSilkbagId(silkbagId) {
        var heroIds = {};
        var suitType = SilkbagConst.SUIT_TYPE_NONE;
        var info = this._applicableHeros[silkbagId];
        if (info) {
            heroIds = info.heroIds;
            suitType = info.suitType;
        }
        return [
            heroIds,
            suitType
        ];
    }
    _s2cGetSilkbag(id, message) {
        this._silkbagList = {};
        var silkbagList = message['silkbags'] || {};
        for (var i in silkbagList) {
            var data = silkbagList[i];
            this._setSilkbagData(data);
        }
    }
    _setSilkbagData(data) {
        this._silkbagList['k_' + (data.id)] = null;
        var unitData = new SilkbagUnitData();
        unitData.updateData(data);
        this._silkbagList['k_' + (data.id)] = unitData;
    }
    updateData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._silkbagList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            this._setSilkbagData(data[i]);
        }
    }
    insertData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._silkbagList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            this._setSilkbagData(data[i]);
        }
    }
    deleteData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._silkbagList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            var id = data[i];
            this._silkbagList['k_' + (id)] = null;
        }
    }
    getUnitDataWithId(id) {
        var unitData = this._silkbagList['k_' + (id)];
        console.assert(unitData, 'SilkbagData:getUnitDataWithId is Wrong, id = %d');
        return unitData;
    }
    getSilkbagCount() {
        var count = 0;
        for (var k in this._silkbagList) {
            var data = this._silkbagList[k];
            count = count + 1;
        }
        return count;
    }
    getCountWithBaseId(baseId) {
        var count = 0;
        for (var k in this._silkbagList) {
            var data = this._silkbagList[k];
            if (data && data.getBase_id() == baseId) {
                count = count + 1;
            }
        }
        return count;
    }
    getListBySort(heroBaseId, heroRank, isInstrumentMaxLevel, curPos, isWeard, heroLimit, heroRedLimit) {
        var sortFunc = function (a, b) {
            if (a.suitSort != b.suitSort) {
                return b.suitSort - a.suitSort;
            } else if (a.getConfig().color != b.getConfig().color) {
                return b.getConfig().color - a.getConfig().color;
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        }
        var temp = [];
        for (var k in this._silkbagList) {
            var data = this._silkbagList[k];
            if (!data)  continue;
            var cloneData = clone2(data);
            if (cloneData && isWeard == cloneData.isWeared()) {
                if (!cloneData.isWearedInPos(curPos)) {
                    var baseId = cloneData.getBase_id();
                    var isEffect = SilkbagDataHelper.isEffectiveSilkBagToHero(baseId, heroBaseId, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit)[0];
                    var isCanWear = cloneData.isCanWearWithPos(curPos);
                    var isSuit = isEffect && isCanWear;
                    cloneData.suitSort = isSuit ? 1 : 0;
                    temp.push(cloneData);
                }
            }
        }
        temp.sort(sortFunc);
        var result = [];
        for (var i in temp) {
            var data = temp[i];
            result.push(data.getId());
        }
        return result;
    }
    getListDataOfSell() {
        function sortFuncForSell(a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            if (colorA != colorB) {
                return colorA - colorB;
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        }
        var result = [];
        for (var k in this._silkbagList) {
            var data = this._silkbagList[k];
            if (data && data.canBeSold()) {
                result.push(data);
            }
        }
        result.sort(sortFuncForSell);
        return result;
    }
    getListDataOfPackage(isSortForSell?) {
        function sortFunc(a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            if (a.wearedSort != b.wearedSort) {
                return b.wearedSort - a.wearedSort;
            } else if (colorA != colorB) {
                return colorB - colorA;
            } else if (a.getConfig().order != b.getConfig().order) {
                return a.getConfig().order - b.getConfig().order;
            } else {
                return a.getBase_id() - b.getBase_id();
            }
        }
        var result = [];
        for (var k in this._silkbagList) {
            var data = this._silkbagList[k];
            if (data) {
                var wearedSort = data.isWeared() ? 1 : 0;
                data.wearedSort = wearedSort;
                result.push(data);
            }
        }
        result.sort(sortFunc);
        return result;
    }
    getListNoWeared() {
        var result = [];
        for (var k in this._silkbagList) {
            var data = this._silkbagList[k];
            if (data && !data.isWeared()) {
                result.push(data);
            }
        }
        return result;
    }
    isHaveSilkbag() {
        var count = 0;
        for (var k in this._silkbagList) {
            var data = this._silkbagList[k];
            count = count + 1;
        }
        return count > 0;
    }
    isHaveRedPoint(pos, slot) {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst['FUNC_SILKBAG_SLOT' + slot])[0];
        if (!isOpen) {
            return false;
        }
        if (pos < 1 || pos > 6) {
            return false;
        }
        var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        var heroBaseId = heroUnitData.getAvatarToHeroBaseId();
        var heroRank = heroUnitData.getRank_lv();
        var isInstrumentMaxLevel = G_UserData.getInstrument().isInstrumentLevelMaxWithPos(pos);
        var heroLimit = heroUnitData.getLeaderLimitLevel();
        var heroRedLimit = heroUnitData.getLeaderLimitRedLevel();
        var unitData = null;
        var silkbagId = G_UserData.getSilkbagOnTeam().getIdWithPosAndIndex(pos, slot);
        if (silkbagId > 0) {
            unitData = this.getUnitDataWithId(silkbagId);
        }
        for (var k in this._silkbagList) {
            var data = this._silkbagList[k];
            if (data && !data.isWeared() && data.isCanWearWithPos(pos)) {
                var isEffective = SilkbagDataHelper.isEffectiveSilkBagToHero(data.getBase_id(), heroBaseId, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit)[0];
                if (!unitData) {
                    if (isEffective) {
                        return true;
                    }
                } else {
                    if (isEffective && data.getConfig().color > unitData.getConfig().color) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    c2sEquipSilkbag(pos, index, silkbagId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EquipSilkbag, {
            pos: pos,
            index: index,
            silkbag_id: silkbagId
        });
    }
    _s2cEquipSilkbag(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var pos = message['pos'];
        var index = message['index'];
        var silkbagId = message['silkbag_id'];
        G_SignalManager.dispatch(SignalConst.EVENT_SILKBAG_EQUIP_SUCCESS, pos, index, silkbagId);
    }
}