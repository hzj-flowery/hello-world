import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_UserData } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { HistoryHeroDataHelper } from "../utils/data/HistoryHeroDataHelper";
import { HistoryHeroUnit } from "./HistoryHeroUnit";
import { SignalConst } from "../const/SignalConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { HistoryHeroWeaponUnit } from "./HistoryHeroWeaponUnit";
import { ArraySort, handler } from "../utils/handler";

export interface HistoryHeroData {
    getHeroList(): HistoryHeroUnit[]
    setHeroList(value: HistoryHeroUnit[]): void
    getLastHeroList(): HistoryHeroUnit[]
    getSystemIdList(): number[]
    setSystemIdList(value: number[]): void
    getLastSystemIdList(): number[]
    getHistoryHeroIds(): Object
    setHistoryHeroIds(value: Object): void
    getLastHistoryHeroIds(): Object
    getActivatedBookIds(): Object
    setActivatedBookIds(value: Object): void
    getLastActivatedBookIds(): Object
    getWeaponList(): { [key: string]: HistoryHeroWeaponUnit}
    setWeaponList(value: {[key: string]: HistoryHeroWeaponUnit }): void
    getLastWeaponList(): {[key: string]: HistoryHeroWeaponUnit}
    getHeroBook(): Object
    setHeroBook(value: Object): void
    getLastHeroBook(): Object
}
let schema = {};
schema['heroList'] = [
    'object',
    {}
];
schema['systemIdList'] = [
    'object',
    {}
];
schema['historyHeroIds'] = [
    'object',
    {}
];
schema['activatedBookIds'] = [
    'object',
    {}
];
schema['weaponList'] = [
    'object',
    {}
];
schema['heroBook'] = [
    'object',
    {}
];
export class HistoryHeroData extends BaseData {
    public static schema = schema;

    _typeTab;
    _s2cGetStarsListener;
    _s2cGetWeaponListener;
    _s2cStarBreakThroughListener;
    _s2cStarEquipListener;
    _s2cStarRebornListener;
    _s2cStarCollectionListener;
    _s2cGetStarCollectionListener;
    _s2cGetStarFormationListener;
    _s2cStarBreakDowncListener;
    constructor(properties?) {
        super(properties);
        this._typeTab = 1;
        this._s2cGetStarsListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetStars, this._s2cGetStars.bind(this));
        this._s2cGetWeaponListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetStarWeapon, this._s2cGetWeapon.bind(this));
        this._s2cStarBreakThroughListener = G_NetworkManager.add(MessageIDConst.ID_S2C_StarBreakThrough, this._s2cStarBreakThrough.bind(this));
        this._s2cStarEquipListener = G_NetworkManager.add(MessageIDConst.ID_S2C_StarEquip, this._s2cStarEquip.bind(this));
        this._s2cStarRebornListener = G_NetworkManager.add(MessageIDConst.ID_S2C_StarReborn, this._s2cStarReborn.bind(this));
        this._s2cStarCollectionListener = G_NetworkManager.add(MessageIDConst.ID_S2C_StarCollection, this._s2cStarCollection.bind(this));
        this._s2cGetStarCollectionListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetStarCollection, this._s2cGetStarCollection.bind(this));
        this._s2cGetStarFormationListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetStarFormation, this._s2cGetStarFormation.bind(this));
        this._s2cStarBreakDowncListener = G_NetworkManager.add(MessageIDConst.ID_S2C_StarBreakDown, handler(this, this._s2cStarBreakDown));
    }
    public reset() {
    }
    public _s2cGetStars(id, message) {
        this.resetTime();
        let stars = message['stars'] || {};
        let data = [];
        this.setHeroList(data);
        for (let k in stars) {
            let v = stars[k];
            this._createHeroUnitData(v);
        }
        var formationList = {};
        var formationIdList = this.getHistoryHeroIds();
        for (let k in formationIdList) {
            var v = formationIdList[k];
            if (v && v != 0) {
                formationList['k' + v] = this.getHisoricalHeroValueById(v);
            } else {
                formationList['k' + v] = null;
            }
        }
        this.setHeroBook(HistoryHeroDataHelper.getHistoryHeroBookInfo());
    }
    public _createHeroUnitData(v) {
        let unit = new HistoryHeroUnit();
        unit.initData(v);
        unit.updateSystemId(v.system_id);
        let list = this.getHeroList();
        let idx = this.getHisoricalHeroKeyById(unit.getId());
        if (idx >= 0) {
            list[idx] = unit;
        } else if (idx == -1) {
            list.push(unit);
        }
        ArraySort(list, function (item1, item2) {
            if (item1.getSystem_id() == item2.getSystem_id()) {
                return item1.getBreak_through() > item2.getBreak_through();
            } else {
                return item1.getSystem_id() < item2.getSystem_id();
            }
        });
        return unit;
    }
    public _s2cGetStarFormation(id, message) {
        var formationList = {};
        for (let k in message.id) {
            var v = message.id[k];
            formationList['k' + v] = this.getHisoricalHeroValueById(v);
        }
        this.setHistoryHeroIds(message['id'] || []);
        this.getSystemIds();
        G_SignalManager.dispatch(SignalConst.EVENT_HISTORY_HERO_FORMATIONUPDATE, message);
    }

    c2sStarBreakDown(id, idx):void {
        G_NetworkManager.send(MessageIDConst.ID_C2S_StarBreakDown, {
            id: id,
            idx: idx
        });
    }
    _s2cStarBreakDown(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_HISTORY_HERO_DOWN_SUCCESS, message);
    }

    public c2sStarBreakThrough(id, idx, star_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_StarBreakThrough, {
            id: id,
            idx: idx,
            star_id: star_id
        });
    }
    public _s2cStarBreakThrough(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_HISTORY_HERO_BREAK_THROUGH_SUCCESS, message);
    }
    public c2sStarEquip(id, idx) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_StarEquip, {
            id: id,
            idx: idx
        });
    }
    public _s2cStarEquip(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_HISTORY_HERO_EQUIP_SUCCESS, message);
    }
    public c2sStarReborn(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_StarReborn, { id: id });
    }
    public _s2cStarReborn(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_HISTORY_HERO_REBORN_SUCCESS, awards);
    }
    public c2sStarCollection(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_StarCollection, { id: id });
    }
    public _s2cStarCollection(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
    }
    public _s2cGetStarCollection(id, message) {
        let ids = message['ids'] || {};
        let idList = [];
        for (let k in ids) {
            let v = ids[k];
            idList.push(v);
        }
        this.setActivatedBookIds(idList);
        G_SignalManager.dispatch(SignalConst.EVENT_HISTORY_HERO_ACTIVATE_BOOK_SUCCESS);
    }
    public setDetailTabType(type) {
        this._typeTab = type;
    }
    public getDetailTabType() {
        return this._typeTab;
    }
    public updateData(v) {
        if (v == null || typeof v != 'object') {
            return;
        }
        for (let key in v) {
            let value = v[key];
            this._createHeroUnitData(value);
        }
    }
    public insertData(v) {
        if (v == null || typeof v != 'object') {
            return;
        }
        for (let key in v) {
            let value = v[key];
            this._createHeroUnitData(value);
        }
    }
    haveWeapon(configId) {
        var weapon = this.getHeroWeaponUnitData(configId);
        return weapon && true || false;
    }
    public _getHeroUnitData(id) {
        return this.getHisoricalHeroValueById(id);
    }
    public deleteData(v) {
        if (v == null) {
            return;
        }
        for (let key in v) {
            let value = v[key];
            let oldUnitKey = this.getHisoricalHeroKeyById(value);
            this.getHeroList().splice(oldUnitKey, 1);
        }
    }
    public _s2cGetWeapon(id, message) {
        let starsWeapon = message['star_weapons'] || {};
        for (let k in starsWeapon) {
            let v = starsWeapon[k];
            this._createHeroWeaponUnitData(v);
        }
    }
    public _createHeroWeaponUnitData(v) {
        let unit = new HistoryHeroWeaponUnit();
        unit.initData(v);
        let list = this.getWeaponList();
        list['k_' + String(unit.getId())] = unit;
     
        // ArraySort(list, function (item1, item2) {
        //     return item1.getId() < item2.getId();
        // });
        return unit;
    }
    public getHeroWeaponUnitData(id) {
        let list = this.getWeaponList();
        let unit = list['k_' + String(id)];
        return unit;
    }
    public updateWeaponData(v) {
        if (v == null || typeof v != 'object') {
            return;
        }
        for (let key in v) {
            let value = v[key];
            this._createHeroWeaponUnitData(value);
        }
    }
    getOnFormationList() {
        var stars:any = this.getHistoryHeroIds();
        var list = {};
        for (var i = 1; i <= stars.length; i++) {
            var id = stars[i-1];
            if (id == 0) {
                list[i] = null;
            } else {
                var data = this.getHisoricalHeroValueById(id);
                list[i] = data;
            }
        }
        return list;
    }
    public insertWeaponData(v) {
        if (v == null || typeof v != 'object') {
            return;
        }
        for (let key in v) {
            let value = v[key];
            this._createHeroWeaponUnitData(value);
        }
    }
    public deleteWeaponData(v) {
        if (v == null || typeof v != 'object') {
            return;
        }
        for (let key in v) {
            let value = v[key];
            let list = this.getWeaponList();
            list['k_' + String(value)] = null;
        }
    }
    public getCanRebornHisoricalHero() {
        let canBornHero = [];
        let heroList = this.getHeroList();
        let heroSquad = this.getHistoryHeroIds();
        for (let key in heroList) {
            let value = heroList[key];
            let [bSquad, _] = this.isStarEquiped(value.getId());
            if (!bSquad && value.getBreak_through() > 1) {
                canBornHero.push(value);
            }
        }
        return canBornHero;
    }
    public getHisoricalHeroValueById(uniqueId) {
        let heroListData = this.getHeroList();
        for (let key in heroListData) {
            let value = heroListData[key];
            if (uniqueId == value.getId()) {
                return value;
            }
        }
        return null;
    }
    public getHisoricalHeroKeyById(uniqueId) {
        let heroListData = this.getHeroList();
        for (let key = 0; key < heroListData.length; key++) {
            let value = heroListData[key];
            if (uniqueId == value.getId()) {
                return key;
            }
        }
        return -1;
    }
    public getHisoricalHeroBaseIdById(uniqueId) {
        let heroListData = this.getHeroList();
        if (heroListData == null) {
            return null;
        }
        for (let key in heroListData) {
            let value = heroListData[key];
            if (uniqueId == value.getId()) {
                return value.getSystem_id();
            }
        }
        return null;
    }
    public isStarEquiped(id) {
        let equipedStars = this.getHistoryHeroIds();
        if (equipedStars == null) {
            return [
                false,
                null
            ];
        }
        for (let key in equipedStars) {
            let value = equipedStars[key];
            if (value != null && id == value) {
                return [
                    true,
                    Number(key) + 1
                ];
            }
        }
        return [
            false,
            null
        ];
    }
    public getSystemIds() {
        let equipedStars = this.getHistoryHeroIds();
        let stars = this.getHeroList();
        let systemIds = [];
        for (let k in equipedStars) {
            let v = equipedStars[k];
            for (let index in stars) {
                let value = stars[index];
                if (v == value.getId()) {
                    systemIds.push(value.getSystem_id());
                }
            }
        }
        this.setSystemIdList(systemIds);
    }
    public isStarSquad(systemId) {
        let systemIds = this.getSystemIdList();
        for (let k in systemIds) {
            let v = systemIds[k];
            if (v == systemId) {
                return true;
            }
        }
        return false;
    }
    public getSquadStarsNums() {
        let count = 0;
        let data = this.getHistoryHeroIds();
        for (let k in data) {
            let v = data[k];
            if (v != null && v > 0) {
                count = count + 1;
            }
        }
        return count;
    }
    public isActivedBook(mapId) {
        let activedIds = this.getActivatedBookIds();
        if (activedIds == null) {
            return false;
        }
        for (let key in activedIds) {
            let value = activedIds[key];
            if (mapId == value) {
                return true;
            }
        }
        return false;
    }

    isHaveHero(systemId) {
        var list = this.getHeroList();
        for (let k in list) {
            var v = list[k];
            if (v != null && v.getSystem_id() == systemId) {
                return true;
            }
        }
        return false;
    }
    getNotInFormationList(configId?) {
        var heroList = [];
        var heroInBagList = this.getHeroList();
        for (let k in heroInBagList) {
            var v = heroInBagList[k];
            if (configId) {
                if (configId == v.getConfig().id && !v.isEquiped()) {
                    heroList.push(v);
                }
            } else {
                if (!v.isEquiped()) {
                    heroList.push(v);
                }
            }
        }
        return heroList;
    }
    getNotInFormationListExcludeSameName() {
        var heroList = [];
        var heroInBagList = this.getHeroList();
        function isSameNameOnFomation(v) {
            return this.isStarSquad(v.getConfig().id);
        }
        for (var k in heroInBagList) {
            var v = heroInBagList[k];
            if (!this.isStarSquad(v.getConfig().id) && !isSameNameOnFomation(v)) {
                heroList.push(v);
            }
        }
        return heroList;
    }
    existCanBreakHistoryHero() {
        var heroInBagList = this.getHeroList();
        for (let k in heroInBagList) {
            var v = heroInBagList[k];
            if (v.enoughMaterial()) {
                return true;
            }
        }
        return false;
    }
    existSpaceOnFormation() {
        var [slotList, unlockCount] = HistoryHeroDataHelper.getHistoricalHeroSlotList();
        var onFormationList = this.getHistoryHeroIds();
        if (onFormationList == null) {
            return false;
        }
        for (let key in onFormationList) {
            var value = onFormationList[key];
            if (value == 0) {
                if (slotList[key].isopen) {
                    var list = this.getNotInFormationList();
                    return list.length > 0;
                }
            }
        }
        return false;
    }
    existStrongerHero() {
        var list = this.getNotInFormationList();
        var onFormationList = this.getHistoryHeroIds();
        for (let ii in list) {
            var underFormationData = list[ii];
            for (let jj in onFormationList) {
                var heroId = onFormationList[jj];
                if (heroId > 0) {
                    var onFormationData = this.getHisoricalHeroValueById(heroId);
                    if (underFormationData.getConfig().color > onFormationData.getConfig().color) {
                        return true;
                    } else if (underFormationData.getBreak_through() > onFormationData.getBreak_through()) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    existLevel2Hero(configId) {
        var list = this.getHeroList();
        for (let k in list) {
            var v = list[k];
            if (v != null && v.getSystem_id() == configId && v.getBreak_through() == 2 && !v.isOnFormation()) {
                return true;
            }
        }
        return false;
    }
    existLevel1HeroWithWeapon(configId) {
        var list = this.getHeroList();
        for (let k in list) {
            var v = list[k];
            if (v != null && v.getSystem_id() == configId && v.getBreak_through() == 1 && !v.isOnFormation() && v.haveWeapon()) {
                return true;
            }
        }
        return false;
    }
    getHeroDataWithPos(pos) {
        var historyHeroIds = G_UserData.getHistoryHero().getHistoryHeroIds();
        var historyHeroId = historyHeroIds[pos - 1];
        if (historyHeroId && historyHeroId > 0) {
            var historyHeroData = G_UserData.getHistoryHero().getHisoricalHeroValueById(historyHeroId);
            return historyHeroData;
        } else {
            return null;
        }
    }

    public clear() {
        this._s2cGetStarsListener.remove();
        this._s2cGetStarsListener = null;
        this._s2cGetWeaponListener.remove();
        this._s2cGetWeaponListener = null;
        this._s2cStarBreakThroughListener.remove();
        this._s2cStarBreakThroughListener = null;
        this._s2cStarEquipListener.remove();
        this._s2cStarEquipListener = null;
        this._s2cStarRebornListener.remove();
        this._s2cStarRebornListener = null;
        this._s2cStarCollectionListener.remove();
        this._s2cStarCollectionListener = null;
        this._s2cGetStarCollectionListener.remove();
        this._s2cGetStarCollectionListener = null;
        this._s2cGetStarFormationListener.remove();
        this._s2cGetStarFormationListener = null;
        this._s2cStarBreakDowncListener.remove();
        this._s2cStarBreakDowncListener = null;
    }
}
