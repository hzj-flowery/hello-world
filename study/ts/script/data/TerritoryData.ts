import { BaseData } from "./BaseData";
import { Slot } from "../utils/event/Slot";
import { G_NetworkManager, G_UserData, G_ConfigLoader, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { UserData } from "./UserData";
import { clone, rawget } from "../utils/GlobleFunc";
import { FunctionCheck } from "../utils/logic/FunctionCheck";
import { TerritoryConst } from "../const/TerritoryConst";
import { ArraySort } from "../utils/handler";
import { TerritoryUnit } from "./TerritoryUnit";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { FunctionConst } from "../const/FunctionConst";
import { SignalConst } from "../const/SignalConst";
import { TerritoryHelper } from "../scene/view/territory/TerritoryHelper";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { table } from "../utils/table";
import { MessageErrorConst } from "../const/MessageErrorConst";

export class TerritoryData extends BaseData {
    _territoryList;
    _isFristEnter: boolean;
    _selfTerritoryList;
    _friendRiots: any[];
    _msgGetTerritoryInfo: Slot;
    _msgPatrolAward: Slot;
    _msgRiotHelper: Slot;
    _msgTerritoryFight: Slot;
    _msgTerritoryPartol: Slot;
    _msgRiotAward: Slot;
    _msgTerritoryHelp: Slot;
    _msgUpdateTerritoryHelp: Slot;
    _msgTerritoryRiot: Slot;
    _msgGetTerritorySingle: Slot;
    _msgGetTerritoryAllAward: Slot;

    _userId: number;
    _name: string;
    _baseId;
    _battleAward;
    _remainAssistCount: number;
    _lastPatrolList: {};
    _curPatrolList: {};
    _msgDeleteTerritoryForHelp;
    _msgGetAllPatrolState;
    _msgTerritoryOneKey;
    constructor() {
        super()
        this._territoryList = {};
        this._isFristEnter = true;
        this._selfTerritoryList = {};
        this._lastPatrolList = {};
        this._curPatrolList = {};
        this._friendRiots = [];
        this._msgGetTerritoryInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetTerritory, this._s2cTerritoryInfo.bind(this));
        this._msgPatrolAward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetPatrolAward, this._s2cPartolAward.bind(this));
        this._msgRiotHelper = G_NetworkManager.add(MessageIDConst.ID_S2C_TerritoryForHelp, this._s2cRiotHelper.bind(this));
        this._msgTerritoryFight = G_NetworkManager.add(MessageIDConst.ID_S2C_AttackTerritory, this._s2cTerritoryFight.bind(this));
        this._msgTerritoryPartol = G_NetworkManager.add(MessageIDConst.ID_S2C_PatrolTerritory, this._s2cTerritoryPartol.bind(this));
        this._msgRiotAward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetTerritoryRiotAward, this._s2cRiotAward.bind(this));
        this._msgTerritoryHelp = G_NetworkManager.add(MessageIDConst.ID_S2C_GetTerritoryForHelp, this._s2cTerritoryForHelp.bind(this));
        this._msgUpdateTerritoryHelp = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateTerritoryForHelp, this._s2cUpdateTerritoryForHelp.bind(this));
        this._msgDeleteTerritoryForHelp = G_NetworkManager.add(MessageIDConst.ID_S2C_DeleteTerritoryForHelp, this._s2cDeleteTerritoryForHelp.bind(this));
        this._msgTerritoryRiot = G_NetworkManager.add(MessageIDConst.ID_S2C_TerritoryHelpRepressRiot, this._s2cTerritoryRepressRiot.bind(this));
        this._msgGetTerritorySingle = G_NetworkManager.add(MessageIDConst.ID_S2C_GetTerritorySingle, this._s2cGetTerritorySingle.bind(this));
        this._msgGetAllPatrolState = G_NetworkManager.add(MessageIDConst.ID_S2C_GetAllPatrolState, this._s2cGetAllPatrolState.bind(this))
        this._msgGetTerritoryAllAward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetAllPatrolAward, this._s2cGetAllPatrolAward.bind(this));
        this._msgTerritoryOneKey = G_NetworkManager.add(MessageIDConst.ID_S2C_PatrolAllTerritory, this._s2cTerritoryOneKey.bind(this));
    }

    resetCurPatrolList() {
        let heroBaseIdMap = this.getHeroIds();
        let heroIdMap = {};
        this._curPatrolList = {};
        for (const i in this._lastPatrolList) {
            let heroId = this._lastPatrolList[i][0];
            if (
                heroId > 0 &&
                !heroIdMap[heroId] &&
                G_UserData.getHero().hasUnitDataWithId(heroId) &&
                !heroBaseIdMap[G_UserData.getHero().getUnitDataWithId(heroId).getBase_id()]
            ) {
                heroIdMap[heroId] = true;
                this._curPatrolList[i] = clone(this._lastPatrolList[i]);
            } else {
                this._curPatrolList[i] = [0, 0];
            }
        }
    }

    setCurPatrolInfo(cityId, heroId?, lastPatrolType?) {
        heroId = heroId ?? this._curPatrolList[cityId][0];
        lastPatrolType = lastPatrolType ?? this._curPatrolList[cityId][1];
        for (const i in this._curPatrolList) {
            let id = this._curPatrolList[i][0];
            if (heroId && heroId > 0 && id == heroId && i != cityId) {
                this._curPatrolList[i] = [0, 0];
            }
        }
        this._curPatrolList[cityId] = [heroId, lastPatrolType];
    }

    _setLastPatrolInfo(cityId, data) {
        let heroId = 0;
        let lastPatrolType = 0;
        if (data != null) {
            heroId = rawget(data, 'hero_id') ?? 0;
            lastPatrolType = rawget(data, "last_patrol_type") ?? 0;
        }
        for (const i in this._lastPatrolList) {
            let id = this._lastPatrolList[i][0];
            if (id == heroId && i != cityId) {
                this._lastPatrolList[i] = [0, 0];
            }
        }
        this._lastPatrolList[cityId] = [heroId, lastPatrolType];
    }

    getCurPatrolList() {
        return this._curPatrolList;
    }

    public clear() {
        this._msgGetTerritoryInfo.remove();
        this._msgGetTerritoryInfo = null;
        this._msgPatrolAward.remove();
        this._msgPatrolAward = null;
        this._msgRiotHelper.remove();
        this._msgRiotHelper = null;
        this._msgTerritoryFight.remove();
        this._msgTerritoryFight = null;
        this._msgTerritoryPartol.remove();
        this._msgTerritoryPartol = null;
        this._msgRiotAward.remove();
        this._msgRiotAward = null;
        this._msgTerritoryHelp.remove();
        this._msgTerritoryHelp = null;
        this._msgTerritoryRiot.remove();
        this._msgTerritoryRiot = null;
        this._msgGetTerritorySingle.remove();
        this._msgGetTerritorySingle = null;
        this._msgGetAllPatrolState.remove();
        this._msgGetAllPatrolState = null;
        this._msgUpdateTerritoryHelp.remove();
        this._msgUpdateTerritoryHelp = null;
        this._msgDeleteTerritoryForHelp.remove();
        this._msgDeleteTerritoryForHelp = null;
        this._msgGetTerritoryAllAward.remove();
        this._msgGetTerritoryAllAward = null;
        this._msgTerritoryOneKey.remove();
        this._msgTerritoryOneKey = null;
    }
    public reset() {
    }
    public sendAttackTerritoy(id) {
    }
    public isFirstEnter() {
        return this._isFristEnter;
    }
    public setFirstEnter() {
        this._isFristEnter = false;
    }
    public getIsSelf() {
        return this._userId == G_UserData.getBase().getId();
    }
    public getUserId() {
        return this._userId;
    }
    public getShowName() {
        return this._name || '';
    }
    public setAssistCount(count) {
        if (count != null) {
            this._remainAssistCount = count;
        }
    }
    public getAssistCount() {
        return this._remainAssistCount || 0;
    }
    public setFriendInfo(baseid) {
        this._baseId = baseid;
    }
    public getFriendInfo() {
        return this._baseId;
    }
    public setBattleAward(award) {
        if (award == null) {
            return;
        }
        this._battleAward = clone(award);
    }
    public getBattleAward() {
        let award = this._battleAward;
        this._battleAward = null;
        return award;
    }
    public getHeroIds() {
        let ids = {};
        for (let i in this._territoryList) {
            let unit = this._territoryList[i];
            ids[unit.getHeroId()] = true;
        }
        return ids;
    }

    isOpenAllTerritories() {
        let res = true;
        for (const i in this._territoryList) {
            if (!this._territoryList[i].getIsOpen()) {
                res = false;
            }
        }
        return res;
    }

    public getLockMsg(territoryId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            return territory.getLockMsg();
        }
        return null;
    }
    public getTerritoryName(territoryId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            return territory.getTerritoryName();
        }
        return '';
    }
    public getAllTerritoryRiot() {
    }
    public isHavePatrolAward() {
        // var myGuild = G_UserData.getGuild().getMyGuild();
        // if (!myGuild) {
        //     return false;
        // }
        for (let i in this._territoryList) {
            let territory = this._territoryList[i];
            let state = territory.getTerritoryState();
            if (state == TerritoryConst.STATE_FINISH) {
                return true;
            }
        }
        return false;
    }

    isHavePatrolTerritory() {
        for (const i in this._territoryList) {
            let state = this._territoryList[i].getTerritoryState();
            if (state == TerritoryConst.STATE_ADD) {
                return true;
            }
        }
        return false;
    }

    public isShowRedPoint() {
        let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_PVE_TERRITORY)[0];
        if (isOpen == false) {
            return false;
        }
        for (let i in this._territoryList) {
            let territory = this._territoryList[i];
            let state = territory.getTerritoryState();
            if (state == TerritoryConst.STATE_FINISH) {
                return true;
            }
            let currVit = UserDataHelper.getNumByTypeAndValue(5, 3);
            if (state == TerritoryConst.STATE_ADD && currVit >= 5) {
                return true;
            }
            if (territory.isCanFight()) {
                return true;
            }
        }
        return false;
    }
    public isRiotRedPoint() {
        if (this.isRiotHaveTake()) {
            return true;
        }
        if (this.isRiotHaveHelp()) {
            return true;
        }
        return false;
    }
    public isRiotHaveTake() {
        let riotList = this.getAllRiotEvents();
        for (let i in riotList) {
            let riot = riotList[i];
            let riotState = TerritoryHelper.getRiotEventState(riot);
            if (riotState == TerritoryConst.RIOT_TAKE) {
                return true;
            }
        }
        return false;
    }
    public isRiotHaveHelp() {
        var myGuild = G_UserData.getGuild().getMyGuild();
        if (!myGuild) {
            return false;
        }
        let riotList = this.getAllRiotEvents();
        for (let i in riotList) {
            let riot = riotList[i];
            let riotState = TerritoryHelper.getRiotEventState(riot);
            if (riotState == TerritoryConst.RIOT_HELP) {
                return true;
            }
        }
        return false;
    }
    public getTerritoryCfg(territoryId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            return territory.getTerritoryCfg();
        }
        return '';
    }
    public getFirstRiotId(territoryId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            return territory.getFirstRiotId();
        }
        return 0;
    }
    public insertEvent(territoryId, eventId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            territory.insertEvent(eventId);
        }
    }
    public setTerritoryDataById(territoryId, TerritoryData) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            territory.setTerritoryData(TerritoryData);
            this._setLastPatrolInfo(territory.getTerritoryId(), TerritoryData);
        }
    }
    public getTerritoryState(territoryId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            return territory.getTerritoryState();
        }
        return TerritoryConst.STATE_NONE;
    }
    public getTerritoryReady(territoryId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            return territory.IsReady();
        }
        return false;
    }
    public getTerritoryEndTime(territoryId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            return territory.getEndTime();
        }
        return 0;
    }
    getTerritoryLimitLevel(territoryId) {
        var territory = this._territoryList[territoryId];
        if (territory) {
            return territory.getLimitLevel();
        }
        return 0;
    }
    getTerritoryLimitRedLevel(territoryId) {
        var territory = this._territoryList[territoryId];
        if (territory) {
            return territory.getLimitRedLevel();
        }
        return 0;
    }
    public getTerritoryEventsTillNow(territoryId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            return territory.getTerritoryEventsTillNow();
        }
        return {};
    }
    public getNextEventTime(territoryId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            return territory.getNextEventTime();
        }
        return {};
    }
    public getStartTime(territoryId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            return territory.getStartTime();
        }
        return 0;
    }
    public getTerritoryHeroId(territoryId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            return territory.getHeroId();
        }
        return 0;
    }
    public getHeroDrop(territoryId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            return territory.getHeroDrop();
        }
        return null;
    }
    public resetTerritory(territoryId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            territory.reset();
        }
    }
    public setNextCanFight(territoryId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            let nextTerritory = this._territoryList[territory.getNextId()];
            if (nextTerritory && nextTerritory.IsReady()) {
                nextTerritory.setCanFight(true);
            }
        }
    }
    public getTerritoryBubble(territoryId, index) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            return territory.getTerritoryBubble(index);
        }
        return 0;
    }
    public getTerritoryRiotInfo(territoryId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            return territory.getTerritoryRiotInfo();
        }
        return null;
    }
    public getTerritoryIsOpen(territoryId) {
        let territory = this._territoryList[territoryId];
        if (territory) {
            return territory.getIsOpen();
        }
        return false;
    }
    getAllHerosByOneKey() {
        var list = this.getAllHeros();
        var heroIds = G_UserData.getTerritory().getHeroIds();
        var map = {};
        for (var i in this._curPatrolList) {
            var v = this._curPatrolList[i];
            var heroId = v[0];
            if (heroId > 0) {
                var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
                var baseId = heroUnitData.getBase_id();
                map[baseId] = true;
            }
        }
        table.sort(list, function (unit1, unit2) {
            var cfg1 = unit1.getConfig();
            var cfg2 = unit2.getConfig();
            var isPartol1 = heroIds[unit1.getBase_id()];
            var isPartol2 = heroIds[unit2.getBase_id()];
            if (isPartol1 != isPartol2) {
                return !isPartol1;
            }
            var isLast1 = map[unit1.getBase_id()];
            var isLast2 = map[unit2.getBase_id()];
            if (isLast1 != isLast2) {
                return !isLast1;
            }
            var isInBattle1 = unit1.isInBattle();
            var isInBattle2 = unit2.isInBattle();
            if (isInBattle1 != isInBattle2) {
                return isInBattle1;
            } else if (cfg1.color != cfg2.color) {
                return cfg1.color > cfg2.color;
            } else {
                return cfg1.id < cfg2.id;
            }
        });
        return list;
    }
    public getAllHeros() {
        let list = G_UserData.getHero().getAllHeros();
        let baseUnitList = {};
        let temp = {};
        for (let i in list) {
            let unitData = list[i];
            let baseId = unitData.getBase_id();
            if (temp[baseId] == null || unitData.isInBattle()) {
                temp[baseId] = unitData;
            }
        }
        let heroIds = G_UserData.getTerritory().getHeroIds();
        let retList = [];
        let checkColor = function (color) {
            let strColors = TerritoryHelper.getTerritoryParameter('territory_hero');
            let tbColors = strColors.split('|');
            for (let i in tbColors) {
                let v = tbColors[i];
                if (color == Number(v)) {
                    return true;
                }
            }
            return false;
        };
        for (let i in temp) {
            let hero = temp[i];
            let unitCfg = hero.getConfig();
            if (unitCfg.type == 2 && checkColor(unitCfg.color)) {
                retList.push(hero);
            }
        }
        ArraySort(retList, function (unit1, unit2) {
            let cfg1 = unit1.getConfig();
            let cfg2 = unit2.getConfig();
            let isPartol1 = heroIds[unit1.getBase_id()];
            let isPartol2 = heroIds[unit2.getBase_id()];
            if (isPartol1 != isPartol2) {
                return !isPartol1;
            }
            let isInBattle1 = unit1.isInBattle();
            let isInBattle2 = unit2.isInBattle();
            if (isInBattle1 != isInBattle2) {
                return isInBattle1;
            } else if (cfg1.color != cfg2.color) {
                return cfg1.color > cfg2.color;
            } else {
                return cfg1.id < cfg2.id;
            }
        });
        return retList;
    }
    public getAllRiotEvents() {
        let allRiotList = [];

        for (let key in this._territoryList) {
            let territory = this._territoryList[key];
            let riotList = territory.getRiotEvents();
            for (let i in riotList) {
                let value = riotList[i];
                value.territory_id = key;
                if (TerritoryHelper.isRiotEventExpiredTime(value) == false) {
                    allRiotList.push(value);
                }
            }
        }
        function sortEvent(event1, event2) {
            let state1 = TerritoryHelper.getRiotEventState(event1);
            let state2 = TerritoryHelper.getRiotEventState(event2);
            if (state1 != state2) {
                return state1 < state2;
            }
            return event1.territory_id < event2.territory_id;
        }
        ArraySort(allRiotList, sortEvent);
        return allRiotList;
    }
    public c2sGetTerritory() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetTerritory, {});
    }
    public c2sGetAllPatrolAward() {
        if (this.isHavePatrolAward()) {
            G_NetworkManager.send(MessageIDConst.ID_C2S_GetAllPatrolAward, {});
        }
    }
    public c2sGetPatrolAward(territoryId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetPatrolAward, { id: territoryId });
    }
    public c2sTerritoryForHelp(territoryId, eventId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_TerritoryForHelp, {
            territory_id: territoryId,
            event_id: eventId
        });
    }
    public c2sAttackTerritory(territoryId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_AttackTerritory, { id: territoryId });
    }
    public c2sPatrolTerritory(territoryId, partolType, heroId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_PatrolTerritory, {
            id: territoryId,
            patrol_type: partolType,
            hero_id: heroId
        });
    }
    public c2sGetTerritoryRiotAward(territoryId, eventId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetTerritoryRiotAward, {
            territory_id: territoryId,
            event_id: eventId
        });
    }
    public c2sGetTerritoryForHelp() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetTerritoryForHelp, {});
    }
    public c2sTerritoryHelpRepressRiot(messageTable) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_TerritoryHelpRepressRiot, messageTable);
    }
    public _addNetMsg() {
    }
    public _removeNetMsg() {
    }
    public _s2cTerritoryInfo(id, message) {
        if (message.ret != 1) {
            return;
        }
        let territorys = message['territorys'] || [];
        this._territoryList = {};
        let TerritoryInfo = G_ConfigLoader.getConfig(ConfigNameConst.TERRITORY_PERFORMANCE);
        for (let i = 0; i < TerritoryInfo.length(); i++) {
            let territory = territorys[i];
            let unit = new TerritoryUnit(i + 1, territory);
            this._territoryList[unit.getTerritoryId()] = unit;
            this._setLastPatrolInfo(unit.getTerritoryId(), territory);
            let pre = this._territoryList[unit.getPreTerritoryId()];
            if (pre) {
                if (pre.getIsOpen() && unit.IsReady()) {
                    unit.setCanFight(true);
                }
                pre.setNextId(unit.getTerritoryId());
            } else {
                if (unit.IsReady()) {
                    unit.setCanFight(true);
                }
            }
        }
        this.resetTime();
        G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_UPDATEUI, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY);
    }
    public _s2cTerritoryFight(id, message) {
        if (message.ret != 1) {
            return;
        }
        let awards = message['awards'] || {};
        if (awards.length > 0) {
            let territoryId = message.id;
            this.resetTerritory(territoryId);
            this.setNextCanFight(territoryId);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_ATTACKTERRITORY, message);
    }
    public _s2cPartolAward(id, message) {
        if (message.ret != 1) {
            return;
        }
        let territoryId = message.id;
        this.resetTerritory(territoryId);
        G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_GETAWARD, message);
    }
    public _s2cGetAllPatrolAward(id, message) {
        if (message.ret != 1) {
            return;
        }
        let territoryIdList = message['id'] || {};
        for (let i in territoryIdList) {
            let value = territoryIdList[i];
            this.resetTerritory(value);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_GETAWARD, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY);
    }
    public _s2cTerritoryPartol(id, message) {
        if (message.ret != 1) {
            return;
        }
        this.setTerritoryDataById(message.id, message.territory);
        G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_PATROL, message);
    }
    public _s2cRiotHelper(id, message) {
        if (message.ret != 1) {
            return;
        }
        let territory = this._territoryList[message.territory_id];
        if (territory) {
            territory.setRiotEventState(message.event_id, TerritoryConst.RIOT_HELPED);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_FORHELP, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY);
    }
    public _s2cRiotAward(id, message) {
        if (message.ret != 1) {
            return;
        }
        let territory = this._territoryList[message.territory_id];
        if (territory) {
            territory.setRiotEventState(message.event_id, TerritoryConst.RIOT_TAKEN);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_GET_RIOT_AWARD, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY);
    }
    public isTerritoryFriend() {
        let list = this.getFriendsRiotInfo();
        return list.length > 0;
    }
    public isRiotHelpRedPoint(): [boolean, number] {
        let list = this.getFriendsRiotInfo();
        return [
            list.length > 0,
            list.length
        ];
    }
    public _s2cUpdateTerritoryForHelp(id, message) {
        let friendRiot = message['friend_riot'] || {};
        console.log(friendRiot);
        if (friendRiot) {
            for (let j in friendRiot.riots) {
                let serverInfo = friendRiot.riots[j];
                let riotInfo = this._makeFriendRiotInfo(friendRiot, serverInfo);
                console.log(riotInfo.key_id);
                this._friendRiots[riotInfo.key_id] = riotInfo;
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_GET_FORHELP, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY);
    }
    _s2cDeleteTerritoryForHelp(id, message) {
        var friendRiots = rawget(message, 'friend_riot') ?? {};
        for (var key in friendRiots) {
            var value = friendRiots[key];
            var keyId = 'k' + (value.uid + (value.territory_id + value.event_id));
            this._friendRiots[keyId] = null;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_GET_FORHELP);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY);
    }
    public _makeFriendRiotInfo(friends, serverInfo) {
        let riotInfo: any = {};
        let event: any = {};
        let [converId, playInfo] = UserDataHelper.convertAvatarId(friends);
        event.id = serverInfo.event.id;
        event.time = serverInfo.event.time;
        event.info_id = serverInfo.event.info_id;
        event.event_type = serverInfo.event.event_type;
        event.is_repress = serverInfo.event.is_repress;
        event.for_help = serverInfo.event.for_help;
        event.fname = serverInfo.event.fname;
        event.awards = serverInfo.event.awards;
        event.end_time = serverInfo['end_time'] || 0;
        riotInfo.user_id = friends.user_id;
        riotInfo.uuid = friends.uuid;
        riotInfo.name = friends.name;
        riotInfo.sid = friends.sid;
        riotInfo.level = friends.level;
        riotInfo.baseId = friends.baseId || 0;
        riotInfo.playeInfo = playInfo;
        riotInfo.office_level = friends.office_level;
        riotInfo.head_frame_id = friends.head_frame_id;
        riotInfo.head_frame_exp = friends.head_frame_exp;
        riotInfo.territory_id = serverInfo.territory_id;
        riotInfo.end_time = serverInfo['end_time'];
        riotInfo.event = event;
        riotInfo.key_id = 'k' + (riotInfo.user_id + (riotInfo.territory_id + serverInfo.event.id));
        return riotInfo;
    }
    public getFriendsRiotInfo() {

        let helpNumber = Number(TerritoryHelper.getTerritoryParameter('help_number'));
        if (this.getRepressCount() == helpNumber) {
            return [];
        }
        let retList = [];
        for (let i in this._friendRiots) {
            let value = this._friendRiots[i];
            let checkValue1 = TerritoryHelper.getRiotEventState(value.event) == TerritoryConst.RIOT_HELPED;
            let checkValue2 = TerritoryHelper.isRiotEventExpiredTime(value.event) == false;
            console.log(value);
            console.log(checkValue1);
            console.log(checkValue2);
            if (checkValue1 && checkValue2) {
                retList.push(value);
            }
        }
        ArraySort(retList, function (item1, item2) {
            return item1.event.time > item2.event.time;
        });
        return retList;
    }
    public getRepressCount() {
        return G_UserData.getDailyCount().getCountById(6) || 0;
    }
    public _s2cTerritoryForHelp(id, message) {
        if (message.ret != 1) {
            return;
        }

        this._friendRiots = [];
        let friendRiots = message['friend_riots'] || [];
        for (let i in friendRiots) {
            let friends = friendRiots[i];
            for (let j in friends.riots) {
                let serverInfo = friends.riots[j];
                let riotInfo = this._makeFriendRiotInfo(friends, serverInfo);
                this._friendRiots[riotInfo.key_id] = riotInfo;
            }
        }
        ArraySort(this._friendRiots, function (item1, item2) {
            return item1.time > item2.time;
        });
        G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_GET_FORHELP, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY);
    }
    public _s2cTerritoryRepressRiot(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_HELP_REPRESS_RIOT, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY);
    }
    public _s2cGetTerritorySingle(id, message) {
        if (message.ret != 1) {
            return;
        }
        let data = message['territory'];
        if (data) {
            let territoryTemp = this._territoryList[data.id];
            if (territoryTemp) {
                territoryTemp.setTerritoryData(data);
            } else {
                let unit = new TerritoryUnit(data.id, data);
                this._territoryList[unit.getTerritoryId()] = unit;
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_SYNC_SINGLE_INFO, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY);
    }

    _s2cGetAllPatrolState(id, message) {
        for (var i = 0; i < message.territorys.length; i++) {
            var territory = message.territorys[i];
            var id = territory.id;
            this.setTerritoryDataById(id, territory);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_STATE_UPDATE, message);
    }
    c2sTerritoryOneKey(idList, patrolTypeList, heroIdList) {
        var list = [];
        for (var i = 0; i < idList.length; i++) {
            var id = idList[i];
            var patrolType = patrolTypeList[i];
            var heroId = heroIdList[i];
            var info = {
                id: id,
                patrol_type: patrolType,
                hero_id: heroId
            };
            table.insert(list, info);
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_PatrolAllTerritory, { info: list });
    }
    _s2cTerritoryOneKey(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        for (var i = 0; i < message.info.length; i++) {
            var id = message.info[i].id;
            var territory = rawget(message.info[i], 'territory');
            this.setTerritoryDataById(id, territory);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_ONEKEY, message);
    }
}
