import { UserDataHelper } from "./UserDataHelper";
import ParameterIDConst from "../../const/ParameterIDConst";
import { G_UserData, G_ConfigLoader, G_ServerTime } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { GuildWarConst } from "../../const/GuildWarConst";
import { ArraySort } from "../handler";
import { GuildWarCheck } from "../logic/GuildWarCheck";

export namespace GuildWarDataHelper {
    export function getGuildWarMoveCD() {
        return UserDataHelper.getParameter(ParameterIDConst.GUILD_WAR_MOVE_CD);
    };
    export function getGuildWarAtkCD() {
        return UserDataHelper.getParameter(ParameterIDConst.GUILD_WAR_ATK_CD);
    };
    export function getGuildWarTotalAtkCD() {
        return UserDataHelper.getParameter(ParameterIDConst.GUILD_WAR_TOTAL_ATK_CD);
    };
    export function getGuildWarHp() {
        return UserDataHelper.getParameter(ParameterIDConst.GUILD_WAR_HP);
    };
    export function getGuildWarProclaimCD() {
        return UserDataHelper.getParameter(ParameterIDConst.GUILD_WAR_PROCLAIM_CD);
    };
    export function getGuildWarProclaimMax() {
        return UserDataHelper.getParameter(ParameterIDConst.GUILD_WAR_PROCLAIM_MAX);
    };
    export function getGuildWarProclaimGuildLv() {
        return UserDataHelper.getParameter(ParameterIDConst.GUILD_WAR_DECLARE_LV);
    };
    export function getMyGuildWarGuildId(cityId) {
        let user = G_UserData.getGuildWar().getMyWarUser(cityId);
        if (!user) {
            return 0;
        }
        return user.getGuild_id();
    };
    export function getOpenDays(id) {
        let openDayInfoStr = UserDataHelper.getParameter(id);
        let openDayStrArr = openDayInfoStr.split('|') || {};
        let openDays = {};
        for (let k in openDayStrArr) {
            let v = openDayStrArr[k];
            let curDay = Number(v);
            // curDay = curDay + 1;
            // if (curDay > 7) {
            //     curDay = curDay - 7;
            // }
            openDays[curDay] = true;
        }
        return openDays;
    };
    export function decodePoint(str) {
        let strArr = str.split('|');
        return [
            Number(strArr[0]),
            Number(strArr[1])
        ];
    };
    export function decodeNums(str) {
        let strArr = str.split('|');
        let nums = {};
        for (let k in strArr) {
            let v = strArr[k];
            nums[k] = Number(v);
        }
        return nums;
    };
    export function decodePointSlot(str) {
        let strArr = str.split('|');
        return [
            Number(strArr[0]),
            Number(strArr[1]),
            Number(strArr[2])
        ];
    };
    export function decodePointSlotPos(str) {
        let strArr = str.split('|');
        return [
            Number(strArr[1]),
            Number(strArr[2])
        ];
    };
    export function decodeMoveData(config) {
        let moveArr = config.move.split('|');
        let mvoeTimeArr = config.move_time.split('|');
        let moveDataList = {};
        for (let k in moveArr) {
            let v = moveArr[k];
            moveDataList[Number(v)] = [
                Number(v),
                Number(mvoeTimeArr[k])
            ];
        }
        return moveDataList;
    };
    export function decodeMoveHinderData(config) {
        if (config.move_hinder == '0' || config.move_hinder == '') {
            return {};
        }
        let moveHinderArr = config.move_hinder.split('|');
        let moveHinderList = {};
        for (let k in moveHinderArr) {
            let v = moveHinderArr[k];
            moveHinderList[Number(v)] = true;
        }
        return moveHinderList;
    };
    export function decodeRoadConfig(roadConfig) {
        let len = 5;
        let pointList = [];
        for (let k = 1; k <= len; k += 1) {
            let str = roadConfig['mid_point_' + k];
            if (str != '' && str != '0') {
                pointList[k] = GuildWarDataHelper.decodeNums(str);
            }
        }
        let curveConfigList = [];
        for (let i = 0; i < pointList.length - 1; i += 1) {
            if (pointList[i] == null || pointList[i + 1] == null) {
                continue;
            }
            let curveData = {};
            curveData[1] = cc.v2(pointList[i][0], pointList[i][1]);
            curveData[2] = cc.v2((pointList[i][0] + pointList[i + 1][0]) / 2, (pointList[i][1] + pointList[i + 1][1]) / 2);
            curveData[3] = cc.v2(pointList[i + 1][0], pointList[i + 1][1]);
            curveData[4] = cc.v2(pointList[i + 1][0], pointList[i + 1][1]);
            curveConfigList.push(curveData);
        }
        return curveConfigList;
    };
    export function getGuildWarBgConfig(id) {
        let GuildWarBg = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_WAR_BG);
        let config = GuildWarBg.get(id);
        console.assert(config, 'guild_war_bg can not find id ' + (id));
        return config;
    };
    export function getGuildWarRoadConfig(id) {
        let GuildWarRoad = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_WAR_ROAD);
        let config = GuildWarRoad.get(id);
        console.assert(config, 'guild_war_road can not find id ' + (id));
        return config;
    };
    export function getGuildWarCityConfig(id) {
        let GuildWarCity = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_WAR_CITY);
        let config = GuildWarCity.get(id);
        console.assert(config, 'guild_war_city can not find id ' + (id));
        return config;
    };
    export function getGuildWarRoadDecodeData(k1, k2) {
        let decodeData = G_UserData.getGuildWar().getGuildWarRoadDecodeData(k1, k2);
        if (!decodeData) {
            let map = G_UserData.getGuildWar().getGuildWarRoadConfigMap();
            let roadConfig = map[k1][k2];
            decodeData = GuildWarDataHelper.decodeRoadConfig(roadConfig);
            G_UserData.getGuildWar().setGuildWarRoadDecodeData(k1, k2, decodeData);
        }
        return decodeData;
    };
    export function getGuildWarDecodeData(config) {
        let moveData = GuildWarDataHelper.decodeMoveData(config);
        let [x, y] = GuildWarDataHelper.decodePoint(config.click_point);
        let hinderData = GuildWarDataHelper.decodeMoveHinderData(config);
        let standPointData = G_UserData.getGuildWar().getGuildWarStandPointList(config.battlefield_type, config.point_id);
        let newConfig = {
            id: config.id,
            battlefield_type: config.battlefield_type,
            point_id: config.point_id,
            point_type: config.point_type,
            move: config.move,
            move_time: config.move_time,
            name: config.name,
            build_hp: config.build_hp,
            move_hinder: config.move_hinder,
            name_pic: config.name_pic,
            city_pic: config.city_pic,
            city_pic_break: config.city_pic_break,
            x: config.x,
            y: config.y,
            click_point: config.click_point,
            click_radius: config.click_radius,
            hp_x: config.hp_x,
            hp_y: config.hp_y,
            moveData: moveData,
            clickPos: cc.v2(x, y),
            hinderData: hinderData,
            standPointData: standPointData || {}
        };
        console.warn('------------------ getGuildWarDecodeData ');
        return newConfig;
    };
    export function getGuildWarConfigMap() {
        let configMap = G_UserData.getGuildWar().getGuildWarConfigMap();
        if (configMap) {
            return configMap;
        }
        configMap = {};
        let GuildWar = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_WAR);
        let len = GuildWar.length();
        for (let index = 0; index < len; index += 1) {
            let config = GuildWar.indexOf(index);
            if (!configMap[config.battlefield_type]) {
                configMap[config.battlefield_type] = {};
            }
            configMap[config.battlefield_type][config.point_id] = GuildWarDataHelper.getGuildWarDecodeData(config);
        }
        G_UserData.getGuildWar().setGuildWarConfigMap(configMap);
        return configMap;
    };
    export function getGuildWarConfigByCityIdPointId(cityId, pointId) {
        let cityConfig = GuildWarDataHelper.getGuildWarCityConfig(cityId);
        let configMap = GuildWarDataHelper.getGuildWarConfigMap();
        let list = configMap[cityConfig.scene];
        if (!list) {
            return null;
        }
        let config = list[pointId];
        console.assert(config, 'guild_war can not find cityId %d  id %d ');
        return config;
    };
    export function getPointIdByCityIdPointType(cityId, pointType) {
        let cityConfig = GuildWarDataHelper.getGuildWarCityConfig(cityId);
        let configMap = GuildWarDataHelper.getGuildWarConfigMap();
        let list = configMap[cityConfig.scene];
        if (!list) {
            return null;
        }
        for (let k in list) {
            let v = list[k];
            if (v.point_type == pointType) {
                return v.point_id;
            }
        }
        return null;
    };
    export function getGuildWarConfigListByCityId(cityId) {
        let cityConfig = GuildWarDataHelper.getGuildWarCityConfig(cityId);
        let configMap = GuildWarDataHelper.getGuildWarConfigMap();
        let list = configMap[cityConfig.scene];
        if (!list) {
            return {};
        }
        return list;
    };
    export function getGuildWarBuildingConfigListByCityId(cityId) {
        let list = GuildWarDataHelper.getGuildWarConfigListByCityId(cityId);
        let newList = [];
        for (let k in list) {
            let v = list[k];
            if (v.build_hp > 0) {
                newList.push(v);
            }
        }
        return newList;
    };
    export function getGuildWarBuildingList(cityId) {
        let list = GuildWarDataHelper.getGuildWarConfigListByCityId(cityId);
        let buildList = [];
        for (let k in list) {
            let v = list[k];
            if (v.build_hp > 0) {
                buildList.push(v);
            }
        }
        return buildList;
    };
    export function getGuildWarTargetList(cityId, buildList) {
        let taskList = {};
        for (let k in buildList) {
            let v = buildList[k];
            if (!taskList[v.point_type]) {
                taskList[v.point_type] = {
                    point_type: v.point_type,
                    valid: true
                };
            }
            if (v.point_type == GuildWarConst.POINT_TYPE_GATE && taskList[v.point_type].valid) {
                let nowWarWatch = G_UserData.getGuildWar().getWarWatchById(cityId, v.point_id);
                let hp = nowWarWatch.getWatch_value();
                if (hp <= 0) {
                    taskList[v.point_type].valid = false;
                }
            }
        }
        let newTaskList = [];
        for (let k in taskList) {
            let v = taskList[k];
            if (v.valid) {
                newTaskList.push(v);
            }
        }
        let sortFunc = function (a, b) {
            return a.point_type < b.point_type;
        };
        ArraySort(newTaskList, sortFunc);
        return newTaskList;
    };
    export function isTodayOpen(zeroTimeSecond?) {
        let date = G_ServerTime.getDateObject(null, zeroTimeSecond);
        let day = date.getDay();
        day = day == 0 ? 7 : day;
        let days = GuildWarDataHelper.getOpenDays(ParameterIDConst.GUILD_WAR_OPEN_WEEK);
        if (days[day]) {
            return true;
        }
        return false;
    };
    export function getGuildWarTimeRegion() {
        let zeroTime = G_ServerTime.secondsFromZero();
        let startTime = zeroTime + UserDataHelper.getParameter(ParameterIDConst.GUILD_WAR_STARTTIME);
        let time1Len = UserDataHelper.getParameter(ParameterIDConst.GUILD_WAR_TIME_1);
        let time2Len = UserDataHelper.getParameter(ParameterIDConst.GUILD_WAR_TIME_2);
        let endTime = startTime + time1Len + time2Len;
        let time1 = startTime + UserDataHelper.getParameter(ParameterIDConst.GUILD_WAR_TIME_1);
        let timeRegion = {
            startTime: startTime,
            endTime: endTime,
            time1: time1
        };
        return timeRegion;
    };
    export function isCityCanBeAttack(beAttackCityId, attackCityId) {
        let GuildWarCity = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_WAR_CITY);
        if (attackCityId != null && attackCityId > 0) {
            let config = GuildWarCity.get(attackCityId);
            console.assert(config, 'guild_war_city can not find id ' + (attackCityId));
            return config.next_city == beAttackCityId;
        }
        let config = GuildWarCity.get(beAttackCityId);
        console.assert(config, 'guild_war_city can not find id ' + (beAttackCityId));
        return config.proclaim == 0;
    };
    export function isGuildWarInRunning() {
        let isTodayOpen = GuildWarDataHelper.isTodayOpen();
        if (!isTodayOpen) {
            return false;
        }
        let timeData = GuildWarDataHelper.getGuildWarTimeRegion();
        let curTime = G_ServerTime.getTime();
        if (curTime >= timeData.startTime && curTime < timeData.endTime) {
            return true;
        }
        return false;
    };
    export function getNextOpenDayNum(days) {
        let date = G_ServerTime.getDateObject();
        let day = date.getDay();
        day = day == 0 ? 7 : day;
        let nextDayNum = 1;
        for (let i = 1; i <= 7; i++) {
            let wDay = day + i;
            if (wDay > 7) {
                wDay = 1;
            }
            if (days[wDay]) {
                nextDayNum = i;
                break;
            }
        }
        return nextDayNum;
    };
    export function getGuildWarNextOpeningTimeRegion() {
        let curTime = G_ServerTime.getTime();
        let timeData = GuildWarDataHelper.getGuildWarTimeRegion();
        if (GuildWarDataHelper.isTodayOpen()) {
            if (curTime <= timeData.endTime) {
                return timeData;
            }
        }
        let days = GuildWarDataHelper.getOpenDays(ParameterIDConst.GUILD_WAR_OPEN_WEEK);
        let dayNum = GuildWarDataHelper.getNextOpenDayNum(days);
        for (let k in timeData) {
            let v = timeData[k];
            timeData[k] = v + dayNum * 24 * 60 * 60;
        }
        return timeData;
    };
    export function getGuildWarStatus() {
        let curTime = G_ServerTime.getTime();
        let timeData = GuildWarDataHelper.getGuildWarNextOpeningTimeRegion();
        let status = GuildWarConst.STATUS_CLOSE;
        if (curTime >= timeData.startTime && curTime < timeData.time1) {
            status = GuildWarConst.STATUS_STAGE_1;
        } else if (curTime >= timeData.time1 && curTime < timeData.endTime) {
            status = GuildWarConst.STATUS_STAGE_2;
        }
        return status;
    };
    export function getOwnCityId() {
        let guildId = G_UserData.getGuild().getMyGuildId();
        if (guildId == 0) {
            return null;
        }
        let cityList = G_UserData.getGuildWar().getCityList();
        for (let k in cityList) {
            let v = cityList[k];
            if (v.getOwn_guild_id() == guildId) {
                return v.getCity_id();
            }
        }
        return null;
    };
    export function getGuildWarHurtRankList() {
        let rankList = G_UserData.getGuildWar().getRankList();
        let newList = [];
        for (let k in rankList) {
            let v = rankList[k];
            newList.push({
                unit: v,
                hurt: v.getHurt()
            });
        }
        return newList;
    };
    export function getMyGuildWarRankData(newList) {
        let guildId = G_UserData.getGuild().getMyGuildId();
        for (let k in newList) {
            let v = newList[k];
            if (v.unit.getGuild_id() == guildId) {
                return v;
            }
        }
        return null;
    };
    export function selfIsDefender(cityId) {
        let guildId = GuildWarDataHelper.getMyGuildWarGuildId(cityId);
        let defenderGuildId = G_UserData.getGuildWar().getBattleDefenderGuildId(cityId);
        if (!defenderGuildId || defenderGuildId == 0) {
            return false;
        }
        if (defenderGuildId == guildId) {
            return true;
        }
        return false;
    };
    export function getSelfCampType(cityId) {
        let guildWarUser = G_UserData.getGuildWar().getMyWarUser(cityId);
        return guildWarUser.getPk_type();
    };
    export function findNextMovePointData(cityId, pointId) {
        let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, pointId);
        if (!config) {
            return {};
        }
        let decodeMoveData = config.moveData;
        return decodeMoveData;
    };
    export function isHasHinder(cityId, pointId, dstPointId) {
        let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, pointId);
        if (!config) {
            return false;
        }
        let campType = GuildWarDataHelper.getSelfCampType(cityId);
        if (campType == GuildWarConst.CAMP_TYPE_DEFENDER) {
            return false;
        }
        let hinderData = config.hinderData;
        if (hinderData[dstPointId]) {
            let watcher = G_UserData.getGuildWar().getWarWatchById(cityId, pointId);
            if (watcher && watcher.getWatch_value() > 0) {
                return true;
            }
        }
        return false;
    };
    export function isWatcherDeath(cityId, pointId) {
        let watcher = G_UserData.getGuildWar().getWarWatchById(cityId, pointId);
        if (watcher && watcher.getWatch_value() <= 0) {
            return true;
        }
        return false;
    };
    export function findShowMoveSignPointList(cityId, pointId) {
        let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, pointId);
        if (!config) {
            return [];
        }
        let decodeMoveData = config.moveData;
        let list = [];
        for (let k in decodeMoveData) {
            let v = decodeMoveData[k];
            let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, k);
            let [success] = GuildWarCheck.guildWarCanShowPoint(cityId, k, false);
            if (!GuildWarDataHelper.isHasHinder(cityId, pointId, k) && success == true) {
                list.push({
                    cityId: cityId,
                    pointId: k
                });
            }
        }
        return list;
    };
    export function calculatePopulation(cityId, pointId) {
        let [a, b] = G_UserData.getGuildWar().getPopulation(cityId, pointId);
        return [
            a,
            b
        ];
    };
    export function makePointSlotMap(cityId) {
        let list = GuildWarDataHelper.getGuildWarConfigListByCityId(cityId);
        let map = [];
        for (let k in list) {
            let v1 = list[k];
            let pointId = k;
            map[pointId] = {};
            for (let i in v1.standPointData) {
                let v2 = v1.standPointData[i];
                map[pointId][i] = {};
                for (let j in v2) {
                    let v3 = v2[j];
                    if (v3.is_show == 1 && Number(j) != GuildWarConst.SELF_SLOT_INDEX) {
                        map[pointId][i][j] = true;
                    }
                }
            }
        }
        console.log(map);
        return map;
    };
    export function getStandPointNum(cityId, pointId, faceIndex) {
        console.warn(cityId + ('-----------' + (pointId + ('----------' + faceIndex))));
        let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, pointId);
        let standPointList = config.standPointData[faceIndex];
        var count = 0;
        for (var k in standPointList) {
            count++;
        }
        return count;
    };
    export function getSlotPosition(cityId, pointId, faceIndex, slotIndex) {
        let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, pointId);
        let standPoint = config.standPointData[faceIndex][slotIndex];
        let x = standPoint.point_x, y = standPoint.point_y;
        return [
            x,
            y
        ];
    };
    export function getCurveConfigList(cityId, startPointId, endPointId, faceIndex, slotIndex) {
        let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, startPointId);
        console.warn(startPointId + ('--------' + (faceIndex + ('----------- ' + slotIndex))));
        let standPoint = config.standPointData[faceIndex][slotIndex];
        let pathId = standPoint.road_id;
        let roadConfig = G_UserData.getGuildWar().getGuildWarRoadConfig(pathId, endPointId);
        let decodeData = GuildWarDataHelper.getGuildWarRoadDecodeData(pathId, endPointId);
        return decodeData;
    };
    export function getPathRunTime(cityId, startPointId, endPointId) {
        let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, startPointId);
        let moveDataList = config.moveData;
        let moveData = moveDataList[endPointId];
        let runTime = moveData[1];
        return runTime;
    };
    export function getExitPoint(cityId) {
        console.warn('getExitPoint---------------  ' + (cityId));
        let ownCityId = GuildWarDataHelper.getOwnCityId();
        if (!ownCityId) {
            return null;
        }
        let campId = GuildWarDataHelper.getCampPoint(cityId);
        let pointId = 0;
        if (campId) {
            let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, campId);
            let moveDataList = config.moveData;
            for (let k in moveDataList) {
                let v = moveDataList[k];
                let subConfig = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, k);
                if (subConfig.point_type == GuildWarConst.POINT_TYPE_EXIT) {
                    pointId = parseInt(k);
                    break;
                }
            }
        }
        console.log('getExitPoint---------------xx  ', (pointId), ' ', (campId));
        if (pointId != 0) {
            return pointId;
        }
        return null;
    };
    export function getCampPoint(cityId) {
        let guildWarUserData = G_UserData.getGuildWar().getMyWarUser(cityId);
        let bornPointId = guildWarUserData.getBorn_point_id();
        let pointId = bornPointId;
        if (pointId != 0) {
            return pointId;
        }
        return null;
    };
    export function getPreCityId(cityId, birth_id) {
        let config = GuildWarDataHelper.getGuildWarCityConfig(cityId);
        let canAttackCityList = config.from_city.split('|') || {};
        console.log(canAttackCityList);
        for (let k in canAttackCityList) {
            let v = canAttackCityList[k];
            let fromCityId = Number(v);
            if (fromCityId && fromCityId != 0) {
                let fromCityConfig = GuildWarDataHelper.getGuildWarCityConfig(fromCityId);
                if (fromCityConfig.next_city == cityId && fromCityConfig.scene_birth_id == birth_id) {
                    return fromCityId;
                }
            }
        }
        return null;
    };
    export function getGuildWarSeekPointList(cityId) {
        let list = GuildWarDataHelper.getGuildWarConfigListByCityId(cityId);
        if (!list) {
            return {};
        }
        let newList = [];
        let campId = GuildWarDataHelper.getCampPoint(cityId);
        for (let k in list) {
            let config = list[k];
            if (config.point_type == GuildWarConst.POINT_TYPE_EXIT) {
            } else if (config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK || config.point_type == GuildWarConst.POINT_TYPE_CAMP_DEFENDER) {
                if (campId == config.point_id) {
                    newList.push(config);
                }
            } else {
                newList.push(config);
            }
        }
        return newList;
    };
    export function getGuildWarCampList(cityId) {
        let list = GuildWarDataHelper.getGuildWarConfigListByCityId(cityId);
        if (!list) {
            return {};
        }
        let newList = [];
        for (let k in list) {
            let config = list[k];
            if (config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK || config.point_type == GuildWarConst.POINT_TYPE_CAMP_DEFENDER) {
                newList.push(config);
            }
        }
        return newList;
    };
    export function getBattleResultState(cityId) {
        let guildWarUserData = G_UserData.getGuildWar().getMyWarUser(cityId);
        let isDefender = guildWarUserData.getPk_type() == GuildWarConst.CAMP_TYPE_DEFENDER;
        let guildId = G_UserData.getGuildWar().getBattleDefenderGuildId(cityId);
        if (isDefender) {
            if (guildWarUserData.getGuild_id() == guildId && guildId != 0) {
                return [
                    GuildWarConst.BATTLE_RESULT_DEFENDER_SUCCESS,
                    cityId
                ];
            } else {
                let ownCityId = GuildWarDataHelper.getOwnCityId();
                if (ownCityId) {
                    return [
                        GuildWarConst.BATTLE_RESULT_ATTACK_SUCCESS,
                        ownCityId
                    ];
                }
                return [
                    GuildWarConst.BATTLE_RESULT_DEFENDER_FAIL,
                    cityId
                ];
            }
        } else {
            if (guildWarUserData.getGuild_id() == guildId && guildId != 0) {
                return [
                    GuildWarConst.BATTLE_RESULT_ATTACK_SUCCESS,
                    cityId
                ];
            } else {
                let ownCityId = GuildWarDataHelper.getOwnCityId();
                if (ownCityId) {
                    return [
                        GuildWarConst.BATTLE_RESULT_DEFENDER_SUCCESS,
                        ownCityId
                    ];
                }
                return [
                    GuildWarConst.BATTLE_RESULT_ATTACK_FAIL,
                    cityId
                ];
            }
        }
        return [
            GuildWarConst.BATTLE_RESULT_ATTACK_FAIL,
            cityId
        ];
    };
    export function isUserInCamp() {
        let user = G_UserData.getGuildWar().getNewestMyWarUser();
        if (!user) {
            return false;
        }
        if (user.getCurrPoint() == user.getBorn_point_id()) {
            return true;
        }
        return false;
    };
    export function getCurrBattleCityId() {
        let timeRegion = GuildWarDataHelper.getGuildWarTimeRegion();
        let requestInfo = G_UserData.getGuildWar().getCityRequestInfo();
        if (requestInfo.cityId) {
            if (requestInfo.time < timeRegion.startTime || requestInfo.time >= timeRegion.endTime) {
                return null;
            }
            return requestInfo.cityId;
        }
        return null;
    };
    export function getGuildWarPreviewRewards() {
        let openServerDayNum = G_UserData.getBase().getOpenServerDayNum();
        let GuildWarAward = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_WAR_AWARD);
        let rewardConfig = null;
        for (let index = 0; index < GuildWarAward.length(); index += 1) {
            let config = GuildWarAward.indexOf(index);
            if (openServerDayNum >= config.day_min && openServerDayNum <= config.day_max) {
                rewardConfig = config;
                break;
            }
        }
        if (!rewardConfig) {
            rewardConfig = GuildWarAward.indexOf(GuildWarAward.length());
        }
        let rewardList = {};
        if (rewardConfig != null) {
            rewardList = UserDataHelper.makeRewards(rewardConfig, GuildWarConst.AUCTION_REWARD_NUM);
        }
        return rewardList;
    };
    export function getGuildWarExitCityId(cityId) {
        let guildWarUser = G_UserData.getGuildWar().getMyWarUser(cityId);
        let currCityId = guildWarUser.getCity_id();
        let isDefender = guildWarUser.getPk_type() == GuildWarConst.CAMP_TYPE_DEFENDER;
        let bornPointId = guildWarUser.getBorn_point_id();
        let nextCityId = null;
        if (isDefender) {
            let config = GuildWarDataHelper.getGuildWarCityConfig(currCityId);
            nextCityId = config.next_city;
        } else {
            nextCityId = GuildWarDataHelper.getPreCityId(currCityId, bornPointId);
        }
        return nextCityId;
    };
    export function guildHasDeclare() {
        let guild = G_UserData.getGuild().getMyGuild();
        let lastDeclareTime = guild && guild.getWar_declare_time() || 0;
        if (lastDeclareTime > 0) {
            return true;
        }
        return false;
    };
    export function isLivingBuilding(cityId, pointId) {
        let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, pointId);
        if (config.build_hp > 0) {
            let nowWarWatch = G_UserData.getGuildWar().getWarWatchById(cityId, config.point_id);
            let maxHp = config.build_hp;
            let hp = maxHp;
            if (nowWarWatch) {
                hp = nowWarWatch.getWatch_value();
            }
            return hp > 0;
        }
        return false;
    };
    export function isNeedAttackBuild(cityId, pointId) {
        let isDefender = GuildWarDataHelper.selfIsDefender(cityId);
        let canAttack = GuildWarDataHelper.isLivingBuilding(cityId, pointId) && !isDefender;
        return canAttack;
    };
    export function getRecordConfigByMerit(merit) {
        let GuildWarMerit = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_WAR_MERIT);
        for (let k = GuildWarMerit.length() - 1; k >= 0; k += -1) {
            let config = GuildWarMerit.indexOf(k);
            if (merit >= config.merit_min) {
                return config;
            }
        }
        return null;
    };
};