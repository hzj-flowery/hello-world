import { BaseData } from "./BaseData";
import { G_UserData, G_NetworkManager, G_SignalManager, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler, ArraySort } from "../utils/handler";
import HorseConst from "../const/HorseConst";
import { HorseDataHelper } from "../utils/data/HorseDataHelper";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import { HorseUnitData } from "./HorseUnitData";

import { ConfigNameConst } from "../const/ConfigNameConst";
import { FunctionConst } from "../const/FunctionConst";

export interface HorseData {
    getCurHorseId(): number
    setCurHorseId(value: number): void
    getLastCurHorseId(): number
}
let schema = {};
schema['curHorseId'] = [
    'number',
    0
];
export class HorseData extends BaseData {
    public static schema = schema;
    constructor() {
        super()
        this._horseList = {};
        this._applicableHeros = {};
        this._horsePhotoList = {};
        this._recvWarHorseInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_WarHorseInfo, this._s2cWarHorseInfo.bind(this));
        this._recvWarHorseFit = G_NetworkManager.add(MessageIDConst.ID_S2C_WarHorseFit, this._s2cWarHorseFit.bind(this));
        this._recvWarHorseUnFit = G_NetworkManager.add(MessageIDConst.ID_S2C_WarHorseUnFit, this._s2cWarHorseUnFit.bind(this));
        this._recvWarHorseUpgrade = G_NetworkManager.add(MessageIDConst.ID_S2C_WarHorseUpgrade, this._s2cWarHorseUpgrade.bind(this));
        this._recvWarHorseReclaim = G_NetworkManager.add(MessageIDConst.ID_S2C_WarHorseReclaim, this._s2cWarHorseReclaim.bind(this));
        this._recvWarHorseReborn = G_NetworkManager.add(MessageIDConst.ID_S2C_WarHorseReborn, this._s2cWarHorseReborn.bind(this));
        this._recvWarHorseDraw = G_NetworkManager.add(MessageIDConst.ID_S2C_WarHorseDraw, this._s2cWarHorseDraw.bind(this));
        this._recvGetActiveWarHorsePhoto = G_NetworkManager.add(MessageIDConst.ID_S2C_GetActiveWarHorsePhoto, this._s2cGetActiveWarHorsePhoto.bind(this));
        this._recvActiveWarHorsePhoto = G_NetworkManager.add(MessageIDConst.ID_S2C_ActiveWarHorsePhoto, this._s2cActiveWarHorsePhoto.bind(this));
        this._initApplicableHeroIds();
    }
    private _horseGroupList;
    private _photoNum;
    private _horsePhotoId;
    private _horseList;
    private _applicableHeros;
    private _horsePhotoList;
    private _recvWarHorseInfo;
    private _recvWarHorseFit;
    private _recvWarHorseUnFit;
    private _recvWarHorseUpgrade;
    private _recvWarHorseReclaim;
    private _recvWarHorseReborn;
    private _recvWarHorseDraw;
    private _horseStateList;
    private _recvGetActiveWarHorsePhoto;
    private _recvActiveWarHorsePhoto;

    public clear() {
        this._recvWarHorseInfo.remove();
        this._recvWarHorseInfo = null;
        this._recvWarHorseFit.remove();
        this._recvWarHorseFit = null;
        this._recvWarHorseUnFit.remove();
        this._recvWarHorseUnFit = null;
        this._recvWarHorseUpgrade.remove();
        this._recvWarHorseUpgrade = null;
        this._recvWarHorseReclaim.remove();
        this._recvWarHorseReclaim = null;
        this._recvWarHorseReborn.remove();
        this._recvWarHorseReborn = null;
        this._recvWarHorseDraw.remove();
        this._recvWarHorseDraw = null;
        this._recvGetActiveWarHorsePhoto.remove();
        this._recvGetActiveWarHorsePhoto = null;
        this._recvActiveWarHorsePhoto.remove();
        this._recvActiveWarHorsePhoto = null;
    }
    public reset() {
        this._horseList = {};
        this._applicableHeros = {};
        this._horseStateList = null;
        this._horsePhotoList = {};
    }
    public _initApplicableHeroIds() {

        var horseConfig = G_ConfigLoader.getConfig(ConfigNameConst.HORSE);
        var len = horseConfig.length();
        for (var i = 0; i < len; i++) {
            var horseInfo = horseConfig.indexOf(i);
            var strHero = horseInfo.hero;
            var heroIds: any = [];
            var isSuitAll = false;
            if (strHero != '0' && strHero != '') {
                if (strHero == (HorseConst.ALL_HERO_ID).toString()) {
                    isSuitAll = true;
                    var heroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
                    var len1 = heroConfig.length();
                    for (var j = 0; j < len1; j++) {
                        var info = heroConfig.indexOf(j);
                        if (info.type == 1) {
                            heroIds.push(info.id);
                        } else if (info.type == 2) {
                            heroIds.push(info.id);
                        }
                    }
                } else {
                    isSuitAll = false;
                    var ids = strHero.split('|');
                    for (var k in ids) {
                        var id = ids[k];
                        heroIds.push(parseInt(id));
                    }
                }
            }
            this._applicableHeros[horseInfo.id] = {
                heroIds: heroIds,
                isSuitAll: isSuitAll
            };
        }
    }
    public getHeroIdsWithHorseId(horseId): Array<any> {
        var heroIds = {};
        var isSuitAll = false;
        var info = this._applicableHeros[horseId];
        if (info) {
            heroIds = info.heroIds;
            isSuitAll = info.isSuitAll;
        }
        return [
            heroIds,
            isSuitAll
        ];
    }
    public createTempHorseUnitData(baseId) {
        var baseData: any = {};
        baseData.id = 0;
        baseData.base_id = baseId || 1;
        baseData.star = 1;
        var unitData = new HorseUnitData();
        unitData.updateData(baseData);
        return unitData;
    }
    public _setHorseData(data) {
        this._horseList['k_' + (data.id)] = null;
        var unitData = new HorseUnitData;
        unitData.updateData(data);
        this._horseList['k_' + (data.id)] = unitData;
    }
    public _s2cWarHorseInfo(id, message): any {
        this._horseList = {};
        var horseList = message['datas'] || [];
        for (var i in horseList) {
            var data = horseList[i];
            this._setHorseData(data);
        }
        // cc.warn('已有的战马列表');
        // cc.log(this._horseList);
    }
    public getHorseListData() {
        return this._horseList;
    }
    public getUnitDataWithId(id) {
        var unitData = this._horseList['k_' + (id)];
        console.assert(unitData, ('Can not find id = %d in HorseDataList' + id));
        return unitData;
    }
    public updateData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._horseList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            this._setHorseData(data[i]);
        }
    }
    public insertData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._horseList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            this._setHorseData(data[i]);
        }
        G_UserData.getHandBook().c2sGetResPhoto();
    }
    public deleteData(data) {
        if (data == null || typeof (data) != 'object') {
            return;
        }
        if (this._horseList == null) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            var id = data[i];
            // this._horseList['k_' + (id)] = null;
            delete this._horseList['k_' + (id)];
        }
    }
    public getHorseTotalCount() {
        var count = 0;
        for (var k in this._horseList) {
            var v = this._horseList[k];
            count = count + 1;
        }
        return count;
    }
    public getHorseIdWithBaseId(baseId) {
        for (var k in this._horseList) {
            var data = this._horseList[k];
            if (data.getBase_id() == baseId) {
                return data.getId();
            }
        }
        return null;
    }
    public getHorseCountWithBaseId(baseId) {
        var count = 0;
        for (var k in this._horseList) {
            var data = this._horseList[k];
            if (data.getBase_id() == baseId) {
                count = count + 1;
            }
        }
        return count;
    }
    public getListDataBySort() {
        var result: any[] = [];
        var temp: any[] = [];
        var sortFun = function (a, b) {
            if (a.isInBattle() != b.isInBattle()) {
                return a.isInBattle() == true;
            } else if (a.getStar() != b.getStar()) {
                return a.getStar() > b.getStar();
            } else if (a.getConfig().color != b.getConfig().color) {
                return a.getConfig().color > b.getConfig().color;
            } else {
                return a.getBase_id() < b.getBase_id();
            }
        }
        for (var k in this._horseList) {
            var data = this._horseList[k];
            temp.push(data)
        }
        ArraySort(temp, sortFun);
        for (var i in temp) {
            var data = temp[i];
            result.push(data.getId());
        }
        return result;
    }
    public getRangeDataBySort() {
        var result: any[] = [];
        var temp: any[] = [];
        var sortFun = function (a, b) {
            if (a.isInBattle() != b.isInBattle()) {
                return a.isInBattle() == true
            } else if (a.getStar() != b.getStar()) {
                return a.getStar() > b.getStar();
            } else if (a.getConfig().color != b.getConfig().color) {
                return a.getConfig().color > b.getConfig().color;
            } else {
                return a.getBase_id() < b.getBase_id();
            }
        }
        for (var k in this._horseList) {
            var data = this._horseList[k];
            temp.push(data);
        }
        ArraySort(temp, sortFun);
        for (var i in temp) {
            var data = temp[i];
            result.push(data.getId());
        }
        return result;
    }
    public getReplaceHorseListWithSlot(pos, heroBaseId) {
        var result: any[] = [];
        var wear: any[] = [];
        var noWear: any[] = [];
        var sortFun = function (a, b) {
            if (a.isEffective != b.isEffective) {
                return a.isEffective;
            } else if (a.getStar() != b.getStar()) {
                return a.getStar() > b.getStar();
            } else if (a.getConfig().color != b.getConfig().color) {
                return a.getConfig().color > b.getConfig().color;
            } else {
                return a.getBase_id() < b.getBase_id();
            }
        }
        for (var k in this._horseList) {
            var data = this._horseList[k];
            var cloneData: any = {};
            for (const key in data) {
                cloneData[key] = data[key];
            }
            cloneData.isEffective = false;
            if (heroBaseId) {
                cloneData.isEffective = HorseDataHelper.isEffectiveHorseToHero(cloneData.getBase_id(), heroBaseId);
            }
            var battleData = G_UserData.getBattleResource().getHorseDataWithId(cloneData.getId());
            if (battleData) {
                if (battleData.getPos() != pos) {
                    wear.push(cloneData);
                }
            } else {
                noWear.push(cloneData);
                result.push(cloneData);
            }
        }
        ArraySort(result, sortFun);
        return [
            result,
            noWear,
            wear
        ];
    }
    public getRecoveryList() {
        var result: any = [];
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var isTrainA = a.isDidUpStar() && 1 || 0;
            var isTrainB = b.isDidUpStar() && 1 || 0;
            if (colorA != colorB) {
                return colorA < colorB;
            } else if (isTrainA != isTrainB) {
                return isTrainA < isTrainB;
            } else if (a.getStar() != b.getStar()) {
                return a.getStar() < b.getStar();
            } else {
                return a.getBase_id() < b.getBase_id();
            }
        };
        for (var k in this._horseList) {
            var unit = this._horseList[k];
            var isInBattle = unit.isInBattle();
            var recoveryValid = HorseDataHelper.isHorseRecoveryValid(unit.getId());
            if (!isInBattle && recoveryValid) {
                result.push(unit);
            }
        }
        ArraySort(result, sortFun);
        return result;
    }
    public getRecoveryAutoList() {
        var result: any[] = [];
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            if (colorA != colorB) {
                return colorA < colorB;
            } else {
                return a.getBase_id() < b.getBase_id();
            }
        };
        for (var k in this._horseList) {
            var unit = this._horseList[k];
            var color = unit.getConfig().color;
            var isTrain = unit.isDidUpStar();
            var isInBattle = unit.isInBattle();
            var recoveryValid = HorseDataHelper.isHorseRecoveryValid(unit.getId());
            if (!isInBattle && color < 5 && !isTrain && recoveryValid) {
                result.push(unit);
            }
        }
        ArraySort(result, sortFun);
        return result;
    }
    public getRebornList() {
        var result: any[] = [];
        var sortFun = function (a, b) {
            var colorA = a.getConfig().color;
            var colorB = b.getConfig().color;
            var isTrainA = a.isDidUpStar() && 1 || 0;
            var isTrainB = b.isDidUpStar() && 1 || 0;
            if (colorA != colorB) {
                return colorA < colorB;
            } else if (isTrainA != isTrainB) {
                return isTrainA < isTrainB;
            } else if (a.getStar() != b.getStar()) {
                return a.getStar() < b.getStar();
            } else {
                return a.getBase_id() < b.getBase_id();
            }
        };
        for (var k in this._horseList) {
            var unit = this._horseList[k];
            var isDidUpStar = unit.isDidUpStar();
            if (isDidUpStar) {
                var isInBattle = unit.isInBattle();
                var recoveryValid = HorseDataHelper.isHorseRecoveryValid(unit.getId());
                if (!isInBattle && recoveryValid) {
                    result.push(unit);
                }
            }
        }
        ArraySort(result, sortFun);
        return result;
    }
    public isHaveHorseNotInPos(heroBaseId) {
        for (var k in this._horseList) {
            var unit = this._horseList[k];
            var pos = unit.getPos();
            var isEffective = HorseDataHelper.isEffectiveHorseToHero(unit.getBase_id(), heroBaseId);
            if (pos == null && isEffective) {
                return true;
            }
        }
        return false;
    }
    public isHaveBetterHorse(pos, heroBaseId) {
        function isBetter(a, b) {
            var colorA = a.getConfig().color;
            var starA = a.getStar();
            var colorB = b.getConfig().color;
            var starB = b.getStar();
            if (colorA != colorB) {
                return colorA > colorB;
            } else if (starA != starB) {
                return starA > starB;
            }
        }
        var horseId = G_UserData.getBattleResource().getResourceId(pos, HorseConst.FLAG, 1);
        if (!horseId) {
            return false;
        }
        var horseData = this.getUnitDataWithId(horseId);
        if (!horseData) {
            return false;
        }
        for (var k in this._horseList) {
            var unit = this._horseList[k];
            var pos = unit.getPos();
            var isEffective = HorseDataHelper.isEffectiveHorseToHero(unit.getBase_id(), heroBaseId);
            if (pos == null && isEffective) {
                if (isBetter(unit, horseData)) {
                    return true;
                }
            }
        }
        return false;
    }
    public getSameCardsWithBaseId(baseId, filterId) {
        var result: any = [];
        for (var k in this._horseList) {
            var data = this._horseList[k];
            if (data.getBase_id() == baseId && data.getId() != filterId && !data.isInBattle() && !data.isDidUpStar()) {
                var horseEquipList = G_UserData.getHorseEquipment().getEquipedEquipListWithHorseId(data.getId());
                if (horseEquipList.length <= 0) {
                    result.push(data);
                }
            }
        }
        return result;
    }
    public isHorseLevelMaxWithPos(pos) {
        var ids = G_UserData.getBattleResource().getInstrumentIdsWithPos(pos);
        var horseId = ids[1];
        if (horseId && horseId > 0) {
            var unitData = this.getUnitDataWithId(horseId);
            var star = unitData.getStar();
            if (star >= HorseConst.HORSE_STAR_MAX) {
                return true;
            }
        }
        return false;
    }
    public c2sWarHorseFit(pos, horseId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_WarHorseFit, {
            horseId: horseId,
            pos: pos
        });
    }
    public _s2cWarHorseFit(id, message): any {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var id = message['id'] || 0;
        var pos = message['pos'] || 0;
        var oldId = message['old_id'] || 0;
        G_UserData.getBattleResource().setHorsePosTable(pos, id, oldId);
        G_SignalManager.dispatch(SignalConst.EVENT_HORSE_ADD_SUCCESS, id, pos, oldId);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_HORSE);
    }
    public c2sWarHorseUnFit(pos): any {
        G_NetworkManager.send(MessageIDConst.ID_C2S_WarHorseUnFit, { pos: pos });
    }
    public _s2cWarHorseUnFit(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var pos = message['pos'] || 0;
        var oldId = message['old_id'] || 0;
        G_UserData.getBattleResource().clearHorsePosTable(pos, oldId);
        G_SignalManager.dispatch(SignalConst.EVENT_HORSE_CLEAR_SUCCESS);
    }
    public c2sWarHorseUpgrade(horseId, times?) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_WarHorseUpgrade, {
            horseId: horseId,
            times: times || 1
        });
    }
    public _s2cWarHorseUpgrade(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_HORSE_STARUP_SUCCESS);
    }
    public c2sWarHorseReclaim(horseId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_WarHorseReclaim, { horseId: horseId });
    }
    public _s2cWarHorseReclaim(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_HORSE_RECYCLE_SUCCESS, awards);
    }
    c2sWarHorseReborn(horseId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_WarHorseReborn, { id: horseId });
    }
    _s2cWarHorseReborn(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_HORSE_REBORN_SUCCESS, awards);
    }
    c2sWarHorseDraw(num) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_WarHorseDraw, { num: num });
    }
    _s2cWarHorseDraw(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_HORSE_JUDGE_SUCCESS, awards);
    }
    _s2cGetActiveWarHorsePhoto(id, message) {
        this._horseStateList = null;
        this._horsePhotoList = {};
        var list = message['horse_photo'] || {};
        for (var k in list) {
            var photoId = list[k];
            this._horsePhotoList['k_' + photoId] = {
                photoId: photoId,
                state: HorseConst.HORSE_PHOTO_DONE
            };
        }
        // cc.warn('战马下发图鉴');
        // console.log(this._horsePhotoList);
    }
    c2sActiveWarHorsePhoto(photoId) {
        this._horsePhotoId = photoId;
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActiveWarHorsePhoto, { id: photoId });
    }
    _s2cActiveWarHorsePhoto(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._horsePhotoList['k_' + this._horsePhotoId] = {
            photoId: this._horsePhotoId,
            state: HorseConst.HORSE_PHOTO_DONE
        };
        G_SignalManager.dispatch(SignalConst.EVENT_HORSE_KARMA_ACTIVE_SUCCESS, this._horsePhotoId);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_HORSE_BOOK);
    }
    isHorsePhotoValid() {
        var horseStateList = this.getHorsePhotoStateList()[0];
        var result = HorseDataHelper.isHorsePhotoValid(horseStateList);
        return result;
    }
    getAllHorsePhotoAttrList() {
        var horseStateList = this.getHorsePhotoStateList()[0];
        var horseGroupList = this._getHorseGroupList();
        var powerList = HorseDataHelper.getAllHorsePhotoAttrList(horseStateList, horseGroupList);
        return powerList;
    }
    getAllHorsePhotoPowerList() {
        var horseStateList = this.getHorsePhotoStateList()[0];
        var horseGroupList = this._getHorseGroupList();
        var powerList = HorseDataHelper.getAllHorsePhotoPowerList(horseStateList, horseGroupList);
        return powerList;
    }
    public getHorsePhotoStateList() {
        this._horseStateList = {};
        this._photoNum = 0;
        var horseGroupList = this._getHorseGroupList();
        for (var i in horseGroupList) {
            var groupData = horseGroupList[i];
            if (this._horsePhotoList['k_' + groupData.id]) {
                this._horseStateList[i] = {
                    photoId: groupData.id,
                    state: HorseConst.HORSE_PHOTO_DONE
                };
            } else {
                var horseValid1 = G_UserData.getHandBook().isHorseHave(groupData.horse1);
                var horseValid2 = G_UserData.getHandBook().isHorseHave(groupData.horse2);
                if (horseValid1 && horseValid2) {
                    this._horseStateList[i] = {
                        photoId: groupData.id,
                        state: HorseConst.HORSE_PHOTO_VALID
                    };
                } else {
                    this._horseStateList[i] = {
                        photoId: groupData.id,
                        state: HorseConst.HORSE_PHOTO_UNVALID
                    };
                }
            }
            this._photoNum = this._photoNum + 1;
        }
        return [
            this._horseStateList,
            this._photoNum
        ];
    }
    public _getHorseGroupList() {
        if (!this._horseGroupList) {
            this._horseGroupList = [];

            var horseGroupFile = G_ConfigLoader.getConfig(ConfigNameConst.HORSE_GROUP);
            var dataLen = horseGroupFile.length();
            for (var index = 0; index < dataLen; index++) {
                var groupData = horseGroupFile.indexOf(index);
                this._horseGroupList.push(groupData);
            }
        }
        return this._horseGroupList;
    }
    public getHorsePhotoDetailInfo(photoId) {
        var horseGroupList = this._getHorseGroupList();
        var groupData = HorseDataHelper.getHorsePhotoDetailInfo(photoId, horseGroupList);
        return groupData;
    }
    public getHorsePhotoNeedNum(photoId) {
        var horseGroupList = this._getHorseGroupList();
        var needNum = HorseDataHelper.getHorsePhotoNeedNum(photoId, horseGroupList);
        return needNum;
    }
    public getHorsePowerWithId(horseId) {
        var horseData = this.getUnitDataWithId(horseId);
        var baseId = horseData.getBase_id();
        var star = horseData.getStar();
        var info = HorseDataHelper.getHorseStarConfig(baseId, star);
        var equipList = G_UserData.getHorseEquipment().getEquipedEquipListWithHorseId(horseId);
        var power = info.power;
        for (var k in equipList) {
            var equipUnit = equipList[k];
            power = power + equipUnit.getConfig().all_combat;
        }
        return power;
    }
}