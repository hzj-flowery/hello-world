import { BaseData } from './BaseData';
import { G_NetworkManager, G_SignalManager, G_ServerTime, G_UserData, G_ConfigLoader } from '../init';
import { MessageIDConst } from '../const/MessageIDConst';
import { SignalConst } from '../const/SignalConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { GuildWarUser } from './GuildWarUser';
import { ArraySort } from '../utils/handler';
import { GuildWarMemberData } from './GuildWarMemberData';
import { GuildWarNotice } from './GuildWarNotice';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { GuildWarCity } from './GuildWarCity';
import { GuildWarWatch } from './GuildWarWatch';
import { GuildWarRankValue } from './GuildWarRankValue';
import { GuildWarDataHelper } from '../utils/data/GuildWarDataHelper';
import { GuildWarConst } from '../const/GuildWarConst';
let schema = {};
schema['in_city_id'] = [
    'number',
    0
];
export interface GuildWarData {
    getIn_city_id(): number
    setIn_city_id(value: number): void
    getLastIn_city_id(): number
}
export class GuildWarData extends BaseData {
    public static schema = schema;
    public _cityList;
    public _warUserMap;
    public _warPointMap;
    public _warWatchMap;
    public _rank_list;
    public _cityEnterFlag;
    public _battleDefenderGuildInfoList;
    public _guildWarConfigMap;
    public _guildWarRoadConfigMap;
    public _guildWarRoadDecodeData;
    public _guildWarStandPointConfigMap;
    public _recvGetGuildWarWorld;
    public _recvEnterGuildWar;
    public _recvMoveGuildWarPoint;
    public _recvSyncGuildWar;
    public _recvSyncGuildWarWorld;
    public _recvGuildWarBattleWatch;
    public _recvGuildWarBattleUser;
    public _recvGuildWarDeclareCity;
    public _recvGuildWarData;
    public _recvGuildWarNotice;

    constructor() {
        super();
        super()
        this._cityList = {};
        this._warUserMap = {};
        this._warPointMap = {};
        this._warWatchMap = {};
        this._rank_list = {};
        this._cityEnterFlag = {};
        this._battleDefenderGuildInfoList = {};
        this._guildWarConfigMap = null;
        this._guildWarRoadConfigMap = this._createGuildWarRoadConfigMap();
        this._guildWarRoadDecodeData = {};
        this._guildWarStandPointConfigMap = this._createGuildWarStandPointConfigMap();
        this._recvGetGuildWarWorld = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildWarWorld, this._s2cGetGuildWarWorld.bind(this));
        this._recvEnterGuildWar = G_NetworkManager.add(MessageIDConst.ID_S2C_EnterGuildWar, this._s2cEnterGuildWar.bind(this));
        this._recvMoveGuildWarPoint = G_NetworkManager.add(MessageIDConst.ID_S2C_MoveGuildWarPoint, this._s2cMoveGuildWarPoint.bind(this));
        this._recvSyncGuildWar = G_NetworkManager.add(MessageIDConst.ID_S2C_SyncGuildWar, this._s2cSyncGuildWar.bind(this));
        this._recvSyncGuildWarWorld = G_NetworkManager.add(MessageIDConst.ID_S2C_SyncGuildWarWorld, this._s2cSyncGuildWarWorld.bind(this));
        this._recvGuildWarBattleWatch = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildWarBattleWatch, this._s2cGuildWarBattleWatch.bind(this));
        this._recvGuildWarBattleUser = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildWarBattleUser, this._s2cGuildWarBattleUser.bind(this));
        this._recvGuildWarDeclareCity = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildWarDeclareCity, this._s2cGuildWarDeclareCity.bind(this));
        this._recvGuildWarData = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildWarData, this._s2cGuildWarData.bind(this));
        this._recvGuildWarNotice = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildWarNotice, this._s2cGuildWarNotice.bind(this));
    }
    public clear() {
        this._recvGetGuildWarWorld.remove();
        this._recvGetGuildWarWorld = null;
        this._recvEnterGuildWar.remove();
        this._recvEnterGuildWar = null;
        this._recvMoveGuildWarPoint.remove();
        this._recvMoveGuildWarPoint = null;
        this._recvSyncGuildWar.remove();
        this._recvSyncGuildWar = null;
        this._recvSyncGuildWarWorld.remove();
        this._recvSyncGuildWarWorld = null;
        this._recvGuildWarBattleWatch.remove();
        this._recvGuildWarBattleWatch = null;
        this._recvGuildWarBattleUser.remove();
        this._recvGuildWarBattleUser = null;
        this._recvGuildWarDeclareCity.remove();
        this._recvGuildWarDeclareCity = null;
        this._recvGuildWarData.remove();
        this._recvGuildWarData = null;
        this._recvGuildWarNotice.remove();
        this._recvGuildWarNotice = null;
    }
    public reset() {
    }
    public c2sGetGuildWarWorld() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGuildWarWorld, {});
    }
    public c2sEnterGuildWar(cityId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EnterGuildWar, { city_id: cityId });
    }
    public c2sMoveGuildWarPoint(pointId) {
        console.warn('c2sMoveGuildWarPoint ');
        G_NetworkManager.send(MessageIDConst.ID_C2S_MoveGuildWarPoint, { point_id: Number(pointId) });
    }
    public c2sGuildWarBattleWatch(pointId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildWarBattleWatch, { point_id: pointId });
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_DO_ATTACK, pointId);
    }
    public c2sGuildWarBattleUser(userId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildWarBattleUser, { user_id: userId });
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_DO_ATTACK, userId);
    }
    public c2sGuildWarDeclareCity(cityId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildWarDeclareCity, { city_id: cityId });
    }
    public c2sGuildWarData() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildWarData, {});
    }
    public _s2cGetGuildWarWorld(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.resetTime();
        this._cityList = {};
        let warCitys = message['war_city'] || {};
        for (let k in warCitys) {
            let v = warCitys[k];
            this._createGuildWarCity(v);
        }
        if (message.hasOwnProperty('in_city_id')) {
            this.setIn_city_id(message['in_city_id']);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_CITY_INFO_GET);
    }
    public _s2cEnterGuildWar(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let cityId = message['city_id'] || 0;
        let curTime = G_ServerTime.getTime();
        this._cityEnterFlag = {
            cityId: cityId,
            time: curTime
        };
        this.setIn_city_id(cityId);
        this._warUserMap[cityId] = {};
        this._warPointMap[cityId] = {};
        let warUsers = message['war_user'] || {};
        for (let k in warUsers) {
            let v = warUsers[k];
            this._createGuildWarUser(v);
        }
        this._warWatchMap[cityId] = {};
        let watcher = message['watcher'] || {};
        for (let k in watcher) {
            let v = watcher[k];
            this._createGuildWarWatch(v);
        }
        this._rank_list = {};
        let rankList = message['rank_list'] || {};
        for (let k in rankList) {
            let v = rankList[k];
            this._createGuildWarRankValue(v);
        }
        if (message.hasOwnProperty('battle_own_guild_id')) {
            let battleOwnGuildId = message['battle_own_guild_id'];
            let battleOwnGuildName = message['battle_own_guild_name'];
            this._battleDefenderGuildInfoList[cityId] = {
                guildId: battleOwnGuildId,
                guildName: battleOwnGuildName
            };
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_GET, cityId);
    }
    public _s2cMoveGuildWarPoint(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let pointId = message['point_id'] || 0;
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_MOVE_SUCCESS, pointId);
    }
    public _s2cSyncGuildWar(id, message) {
        let changedPointMap = {};
        let changedUserMap = {};
        let isPointChange = false;
        let cityId = message['city_id'] || 0;
        let insertUserList = message['insert_user'] || {};
        for (let k in insertUserList) {
            let v = insertUserList[k];
            isPointChange = true;
            let oldPointId = v['old_point'] || 0;
            let nowPointId = v['now_point'] || 0;
            let userId = v['user_id'] || 0;
            changedPointMap[oldPointId] = true;
            changedPointMap[nowPointId] = true;
            changedUserMap[userId] = true;
            this._insertGuildWarUser(v);
        }
        let updateUserList = message['update_user'] || {};
        for (let k in updateUserList) {
            let v = updateUserList[k];
            isPointChange = true;
            let oldPointId = v['old_point'] || 0;
            let nowPointId = v['now_point'] || 0;
            let userId = v['user_id'] || 0;
            changedPointMap[oldPointId] = true;
            changedPointMap[nowPointId] = true;
            changedUserMap[userId] = true;
            this._updateGuildWarUser(v);
        }
        let deleteUserList = message['delete_user'] || {};
        for (let k in deleteUserList) {
            let v = deleteUserList[k];
            isPointChange = true;
            let deleteUnit = this._deleteGuildWarUser(cityId, v);
            if (deleteUnit) {
                let oldPointId = deleteUnit.getOld_point();
                let nowPointId = deleteUnit.getNow_point();
                let userId = deleteUnit.getUser_id();
                changedPointMap[oldPointId] = true;
                changedPointMap[nowPointId] = true;
                changedUserMap[userId] = true;
            }
        }
        let isBuildingChange = false;
        let changedBuildingMap = null;
        if (message.hasOwnProperty('watcher')) {
            let watcher = message['watcher'];
            this._createGuildWarWatch(watcher);
            isBuildingChange = true;
            changedBuildingMap = { [watcher.point_id]: true };
        }
        let isRankChange = false;
        if (message.hasOwnProperty('rank_value')) {
            this._createGuildWarRankValue(message['rank_value']);
            isRankChange = true;
        }
        if (message.hasOwnProperty('war_notice')) {
        }
        if (message.hasOwnProperty('battle_own_guild_id')) {
            let oldDefenderGuildId = this.getBattleDefenderGuildId(cityId);
            let battleOwnGuildId = message['battle_own_guild_id'];
            let battleOwnGuildName = message['battle_own_guild_name'];
            this._battleDefenderGuildInfoList[cityId] = {
                guildId: battleOwnGuildId,
                guildName: battleOwnGuildName
            };
            let isReset = oldDefenderGuildId != battleOwnGuildId;
            if (isReset) {
                console.warn('GuildWarData rank_list reset ');
                this._rank_list = {};
                isRankChange = true;
                G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_CAMP_REVERSE, cityId);
            }
        }
        if (isRankChange) {
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_RANK_CHANGE, cityId);
        }
        if (isBuildingChange) {
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_BUILDING_CHANGE, cityId, changedBuildingMap);
        }
        if (isPointChange) {
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_POINT_CHANGE, cityId, changedPointMap, changedUserMap);
        }
        if (isPointChange) {
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_USER_CHANGE, cityId, changedUserMap);
        }
    }
    public _s2cGuildWarBattleWatch(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let pointId = message['point_id'] || 0;
        let cityId = message['city_id'];
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_ATTACK_WATCH, pointId);
        let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, pointId);
        let unit = new GuildWarNotice();
        if (config.point_type == GuildWarConst.POINT_TYPE_GATE) {
            unit.setId(1);
        } else {
            unit.setId(2);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE, cityId, unit);
    }
    public _s2cGuildWarBattleUser(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let userId = message['user_id'];
        let userName = message['user_name'];
        let cityId = message['city_id'];
        let isKill = message['is_kill'];
        let isWin = message['is_win'];
        let isBeKill = message['is_be_kill'];
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_REPORT_NOTICE, message);
        let unit = new GuildWarNotice();
        unit.setValue('name', userName);
        unit.setId(isWin ? 7 : 8);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE, cityId, unit);
        if (isKill) {
            let unit = new GuildWarNotice();
            unit.setValue('name', userName);
            unit.setId(9);
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE, cityId, unit);
        }
        if (isBeKill) {
            let unit = new GuildWarNotice();
            unit.setValue('name', userName);
            unit.setId(10);
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE, cityId, unit);
        }
    }
    public _s2cSyncGuildWarWorld(id, message) {
        let warCity = message['war_city'] || {};
        for (let k in warCity) {
            let v = warCity[k];
            this._createGuildWarCity(v);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_DECLARE_SYN);
    }
    public _s2cGuildWarDeclareCity(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (message.hasOwnProperty('city_id')) {
            let cityId = message['city_id'];
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_DECLARE_SUCCESS, cityId);
        }
    }
    public _s2cGuildWarData(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let memberData = message['member_data'] || {};
        let list = [];
        for (let k in memberData) {
            let v = memberData[k];
            let unit = new GuildWarMemberData();
            unit.initData(v);
            list.push(unit);
        }
        let sortfunction = function (a, b) {
            let value1 = a.getValue(GuildWarMemberData.KEY_CONTRIBUTION);
            let value2 = b.getValue(GuildWarMemberData.KEY_CONTRIBUTION);
            if (value1 != value2) {
                return value1 > value2;
            }
            return a.getUser_id() < b.getUser_id();
        };
        ArraySort(list, sortfunction);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_MEMBER_DATA_LIST, list);
    }
    public _s2cGuildWarNotice(id, message) {
        let userName = message['user_name'];
        let isKill = message['is_kill'];
        let isWin = message['is_win'];
        let isBeKill = message['is_be_kill'];
        let cityId = this._cityEnterFlag.cityId;
        if (!cityId) {
            return;
        }
        let unit = new GuildWarNotice();
        unit.setValue('name', userName);
        unit.setId(isWin ? 3 : 4);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE, cityId, unit);
        if (isBeKill) {
            let unit = new GuildWarNotice();
            unit.setValue('name', userName);
            unit.setId(5);
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE, cityId, unit);
        }
        if (isKill) {
            let unit = new GuildWarNotice();
            unit.setValue('name', userName);
            unit.setId(6);
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE, cityId, unit);
        }
    }
    public _setMapValue(map, value, ...kList) {
        if (!map) {
            return;
        }
        for (let k = 0; k < kList.length; k++) {
            let v = kList[k];
            if (k == kList.length - 1) {
                map[v] = value;
                break;
            }
            if (!map[v]) {
                map[v] = {};
            }
            map = map[v];
        }
    }
    public _createGuildWarRoadConfigMap() {
        let configMap = {};
        let GuildWarRoad = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_WAR_ROAD);
        let len = GuildWarRoad.length();
        for (let index = 0; index < len; index += 1) {
            let config = GuildWarRoad.indexOf(index);
            this._setMapValue(configMap, config, config.start_stand_point, config.end_point_id);
        }
        return configMap;
    }
    public _createGuildWarStandPointConfigMap() {
        let configMap = {};
        let GuildWarPoint = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_WAR_POINT);
        let len = GuildWarPoint.length();
        for (let index = 0; index < len; index += 1) {
            let config = GuildWarPoint.indexOf(index);
            this._setMapValue(configMap, config, config.battlefield_type, config.point_id, config.face, config.hole_id);
        }
        return configMap;
    }
    public setGuildWarRoadDecodeData(k1, k2, value) {
        this._setMapValue(this._guildWarRoadDecodeData, value, k1, k2);
    }
    public getGuildWarRoadDecodeData(k1, k2) {
        if (this._guildWarRoadDecodeData[k1]) {
            return this._guildWarRoadDecodeData[k1][k2];
        }
    }
    public getGuildWarRoadConfig(k1, k2) {
        let map = G_UserData.getGuildWar().getGuildWarRoadConfigMap();
        let roadConfig = map[k1][k2];
        return roadConfig;
    }
    public getGuildWarStandPointList(k1, k2) {
        console.warn(k1 + (' getGuildWarStandPointList ' + k2));
        let map = this._guildWarStandPointConfigMap;
        if (map[k1]) {
            return map[k1][k2];
        }
        return null;
    }
    public _createGuildWarCity(data) {
        let unit = new GuildWarCity();
        unit.initData(data);
        this._cityList[data.city_id] = unit;
    }
    public _createGuildWarUser(data, isUpdate?) {
        let cityId = data.city_id;
        let userId = data.user_id;
        let nowPoint = data.now_point;
        let oldPoint = data.old_point;
        if (!this._warUserMap[cityId]) {
            this._warUserMap[cityId] = {};
        }
        let oldUnit = this._warUserMap[cityId][userId];
        if (!this._warPointMap[cityId]) {
            this._warPointMap[cityId] = {};
        }
        if (oldUnit && oldPoint == 0) {
            oldPoint = oldUnit.now_point_;
        }
        if (!this._warPointMap[cityId][oldPoint]) {
            this._warPointMap[cityId][oldPoint] = {};
        }
        this._warPointMap[cityId][oldPoint][userId] = null;
        if (!this._warPointMap[cityId][nowPoint]) {
            this._warPointMap[cityId][nowPoint] = {};
        }
        let unit = oldUnit;
        if (isUpdate == true && oldUnit) {
            oldUnit.updateData(data);
        } else {
            unit = new GuildWarUser();
            unit.initData(data);
        }
        this._warPointMap[cityId][nowPoint][userId] = unit;
        this._warUserMap[cityId][userId] = unit;
    }
    public _insertGuildWarUser(data) {
        this._createGuildWarUser(data);
    }
    public _updateGuildWarUser(data) {
        this._createGuildWarUser(data, true);
    }
    public _deleteGuildWarUser(cityId, userId) {
        let deleteUnit = this.getWarUserById(cityId, userId);
        if (!deleteUnit) {
            return null;
        }
        let nowPoint = deleteUnit.now_point_;
        if (!this._warUserMap[cityId]) {
            this._warUserMap[cityId] = {};
        }
        this._warUserMap[cityId][userId] = null;
        if (!this._warPointMap[cityId]) {
            this._warPointMap[cityId] = {};
        }
        if (!this._warPointMap[cityId][nowPoint]) {
            this._warPointMap[cityId][nowPoint] = {};
        }
        this._warPointMap[cityId][nowPoint][userId] = null;
        return deleteUnit;
    }
    public _createGuildWarWatch(data) {
        let unit = new GuildWarWatch();
        unit.initData(data);
        this._setMapValue(this._warWatchMap, unit, unit.getCity_id(), unit.getPoint_id());
    }
    public _createGuildWarRankValue(data) {
        let unit = new GuildWarRankValue();
        unit.initData(data);
        this._rank_list[unit.getGuild_id()] = unit;
    }
    public getCityList() {
        return this._cityList;
    }
    public getCityById(cityId) {
        return this._cityList[cityId];
    }
    public getWarUserListByCityId(cityId) {
        return this._warUserMap[cityId];
    }
    public getWarUserById(cityId, userId) {
        if (this._warUserMap[cityId]) {
            return this._warUserMap[cityId][userId];
        }
    }
    public getWarWatchListByCityId(cityId) {
        return this._warWatchMap[cityId];
    }
    public getWarWatchById(cityId, id) {
        return this._warWatchMap[cityId][id];
    }
    public getMyWarUser(cityId) {
        let userId = G_UserData.getBase().getId();
        return this.getWarUserById(cityId, userId);
    }
    public getNewestMyWarUser() {
        let cityId = this._cityEnterFlag.cityId;
        if (!cityId) {
            return null;
        }
        let userId = G_UserData.getBase().getId();
        return this.getWarUserById(cityId, userId);
    }
    public getBattleDefenderGuildId(cityId) {
        let guildInfo = this._battleDefenderGuildInfoList[cityId];
        if (guildInfo) {
            return guildInfo.guildId;
        }
        return null;
    }
    public getBattleDefenderGuildInfo(cityId) {
        let guildInfo = this._battleDefenderGuildInfoList[cityId];
        return guildInfo;
    }
    public getWarUserListByFortId(cityId, pointId) {
        let list = [];
        let warUserList = this.getWarUserListByCityId(cityId);
        for (let k in warUserList) {
            let v = warUserList[k];
            if (v && v.getCurrPoint() == pointId) {
                list.push(v);
            }
        }
        return list;
    }
    public getPopulation(cityId, pointId) {
        let guildId = G_UserData.getGuild().getMyGuildId();
        let list = this._warPointMap[cityId][pointId];
        if (!list) {
            return [
                0,
                0
            ];
        }
        let a = 0, b = 0;
        for (let k in list) {
            let v = list[k];
            if (v == null) {
                continue;
            }
            if (v.getCurrPoint() == pointId) {
                if (v.guild_id_ == guildId) {
                    a = a + 1;
                } else {
                    b = b + 1;
                }
            }
        }
        return [
            a,
            b
        ];
    }
    public getSameGuildWarUserList(cityId, pointId, isSort) {
        if (isSort == null) {
            isSort = true;
        }
        let newList = [];
        let guildId = G_UserData.getGuild().getMyGuildId();
        let list = this.getWarUserListByFortId(cityId, pointId);
        for (let k in list) {
            let v = list[k];
            if (v.getGuild_id() == guildId) {
                newList.push(v);
            }
        }
        if (isSort) {
            let sort = function (a, b) {
                if (a.isSelf() || b.isSelf()) {
                    return a.isSelf();
                }
                if (a.getPower() != b.getPower()) {
                    return a.getPower() > b.getPower();
                }
                return a.getUser_id() < b.getUser_id();
            };
            ArraySort(newList, sort);
        }
        return newList;
    }
    public getOtherGuildWarUserList(cityId, pointId, isSort) {
        if (isSort == null) {
            isSort = true;
        }
        let newList = [];
        let guildId = G_UserData.getGuild().getMyGuildId();
        let list = this.getWarUserListByFortId(cityId, pointId);
        for (let k in list) {
            let v = list[k];
            if (v.getGuild_id() != guildId) {
                newList.push(v);
            }
        }
        if (isSort) {
            let sort = function (a, b) {
                if (a.getMove_time() != b.getMove_time()) {
                    return a.getMove_time() < b.getMove_time();
                }
                return a.getUser_id() < b.getUser_id();
            };
            ArraySort(newList, sort);
        }
        return newList;
    }
    public getShowWarUserList(cityId, fliterUserMap, maxRoleNum) {
        fliterUserMap = fliterUserMap || {};
        maxRoleNum = maxRoleNum || GuildWarConst.MAP_MAX_ROLE_NUM;
        let list = [];
        let warUserList = this.getWarUserListByCityId(cityId);
        for (let k in warUserList) {
            let v = warUserList[k];
            if (v && !fliterUserMap[v.user_id_]) {
                list.push(v);
            }
        }
        let shuffle = function (list) {
            for (let k in list) {
                let v = list[k];
                let newK = Math.randInt(1, list.length);
                let oldValue = list[k];
                list[k] = list[newK];
                list[newK] = oldValue;
            }
        };
        let insertUser = function (newList, list, num) {
            let userId = G_UserData.getBase().getId();
            for (let k1 in list) {
                let v1 = list[k1];
                if (v1) {
                    if (k1 <= num && v1.user_id_ != userId) {
                        newList.push(v1);
                    }
                }
            }
        };
        shuffle(list);
        let newList = [];
        insertUser(newList, list, maxRoleNum);
        let myWatchUser = this.getMyWarUser(cityId);
        if (myWatchUser && !fliterUserMap[myWatchUser.getUser_id()]) {
            newList.push(myWatchUser);
        }
        return newList;
    }
    public getShowWarWatchList(cityId) {
        let list = [];
        let warWatchList = this.getWarWatchListByCityId(cityId);
        for (let k in warWatchList) {
            let v = warWatchList[k];
            list.push(v);
        }
        return list;
    }
    public getRankList() {
        let list = [];
        for (let k in this._rank_list) {
            let v = this._rank_list[k];
            list.push(v);
        }
        let sortFunc = function (a, b) {
            if (a.getHurt() != b.getHurt()) {
                return a.getHurt() > b.getHurt();
            }
            return a.getGuild_id() > b.getGuild_id();
        };
        ArraySort(list, sortFunc);
        return list;
    }
    public getGuildWarConfigMap() {
        return this._guildWarConfigMap;
    }
    public setGuildWarConfigMap(map) {
        this._guildWarConfigMap = map;
    }
    public getGuildWarRoadConfigMap() {
        return this._guildWarRoadConfigMap;
    }
    public getCityRequestInfo() {
        return this._cityEnterFlag;
    }
    public pullData() {
    }
    public saveAutionDlgTime(endTime) {
        let value = G_UserData.getUserConfig().getConfigValue('guild_war_aution_end_time') || 0;
        let oldEndTime = Number(value);
        if (oldEndTime < endTime) {
            G_UserData.getUserConfig().setConfigValue('guild_war_aution_end_time', endTime);
        }
    }
    public getAutionDlgTime() {
        let value = G_UserData.getUserConfig().getConfigValue('guild_war_aution_end_time') || 0;
        console.log(value);
        let oldEndTime = Number(value);
        return oldEndTime;
    }
    public clearBattleData() {
        this._cityEnterFlag = {};
    }
}
