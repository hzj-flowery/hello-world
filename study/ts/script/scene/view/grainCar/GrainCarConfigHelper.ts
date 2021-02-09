import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { GrainCarConst } from "../../../const/GrainCarConst";
import { TimeConst } from "../../../const/TimeConst";
import { G_ConfigLoader, G_ServerTime } from "../../../init";
import { assert } from "../../../utils/GlobleFunc";



export default class GrainCarConfigHelper {

  
   static  getGrainCarConfig(id) {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR).get(id);
        assert(info, 'graincar config can not find id = %d');
        return info;
    };
   static  getGrainCarWeek() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_WEEK);
        assert(info, 'graincar parameter config can not find id = %d');
        var array = info.content.split('|');
        var result = [];
        for (let i in array) {
            var v = array[i];
            result.push(parseInt(v));
        }
        return result;
    };
   static  getGrainCarOpenTime() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_OPEN);
        assert(info, 'graincar parameter config can not find id = %d');
        var array = info.content.split('|');
        return [
            parseInt(array[0]),
            parseInt(array[1])
        ];
    };
   static  getGrainCarCloseTime() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_CLOSE);
        assert(info, 'graincar parameter config can not find id = %d');
        var array = info.content.split('|');
        return [
            parseInt(array[0]),
            parseInt(array[1])
        ];
    };
   static  getGrainCarRouteGenTime() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_ROUTE);
        assert(info, 'graincar parameter config can not find id = %d');
        var array = info.content.split('|');
        return [
            parseInt(array[0]),
            parseInt(array[1])
        ];
    };
   static  getGrainCarStopTime(mineType) {
        var id = GrainCarConst.GRAINCAR_COPPER_STOP;
        if (mineType == GrainCarConst.MINE_COLOR_COPPER) {
            id = GrainCarConst.GRAINCAR_COPPER_STOP;
        } else if (mineType == GrainCarConst.MINE_COLOR_SILVER) {
            id = GrainCarConst.GRAINCAR_SILVER_STOP;
        } else if (mineType == GrainCarConst.MINE_COLOR_GOLD) {
            id = GrainCarConst.GRAINCAR_GOLD_STOP;
        }
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(id);
        assert(info, 'graincar parameter config can not find id = %d');
        return parseInt(info.content);
    };
   static  getGrainCarMoveTime() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_MOVING_TIME);
        assert(info, 'graincar parameter config can not find id = %d');
        return parseInt(info.content);
    };
   static  getGrainCarDonateCost() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_DONATE_COST);
        assert(info, 'graincar parameter config can not find id = %d');
        var array = info.content.split('|');
        return [
            parseInt(array[0]),
            parseInt(array[1]),
            parseInt(array[2])
        ];
    };
   static  getGrainCarDonateExp() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_DONATE_EXP);
        assert(info, 'graincar parameter config can not find id = %d');
        return parseInt(info.content);
    };
   static  getGrainCarAttackTimes() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_ATTACK_TIMES);
        assert(info, 'graincar parameter config can not find id = %d');
        return parseInt(info.content);
    };
   static  getGrainCarAttackBonus() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_ATTACK_BONUS);
        assert(info, 'graincar parameter config can not find id = %d');
        var array = info.content.split('|');
        return [
            parseInt(array[0]),
            parseInt(array[1]),
            parseInt(array[2])
        ];
    };
   static  getGrainCarAttackCD() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_ATTACK_CD);
        assert(info, 'graincar parameter config can not find id = %d');
        return parseInt(info.content);
    };
   static  getGrainCarAttackHurt() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_ATTACK_HURT);
        assert(info, 'graincar parameter config can not find id = %d');
        return parseInt(info.content);
    };
   static  getGrainCarDamageBonus() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_DAMAGE_BONUS);
        assert(info, 'graincar parameter config can not find id = %d');
        return parseInt(info.content);
    };
   static  getGrainCarDamageReduce(level) {
        var id = GrainCarConst['GRAINCAR_PROTECT_' + level];
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(id);
        assert(info, 'graincar parameter config can not find id = %d');
        var array = info.content.split('|');
        return [
            parseInt(array[0]),
            parseInt(array[1])
        ];
    };
   static  getGrainCarMaxPlayerNum() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_MAX_NUM);
        assert(info, 'graincar parameter config can not find id = %d');
        return parseInt(info.content);
    };
   static  getGrainCarShowTimeAfterEnd() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_SHOW);
        assert(info, 'graincar parameter config can not find id = %d');
        return parseInt(info.content);
    };
   static  getGrainCarAttackLose() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_LOSE);
        assert(info, 'graincar parameter config can not find id = %d');
        return parseInt(info.content);
    };
   static  getGrainCarShowHero() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_SHOW_HERO);
        assert(info, 'graincar parameter config can not find id = %d');
        var array = info.content.split('|');
        return array;
    };
   static  getGrainCarShame() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_SHOW_SHAME);
        assert(info, 'graincar parameter config can not find id = %d');
        return parseInt(info.content);
    };
   static  getGrainCarLevelUp() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_PARAMETER).get(GrainCarConst.GRAINCAR_LEVEL_UP);
        assert(info, 'graincar parameter config can not find id = %d');
        return parseInt(info.content);
    };
   static  getGrainCarRouteWithId(id) {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_ROUTE).get(id);
        assert(info, 'graincar route config can not find id = %d');
        var index = 1;
        var route = [];
        while (index <= GrainCarConst.ROUTE_STOP_COUNT_MAX && info['point_' + index] != 0) {
            route.push(info['point_' + index]);
            index = index + 1;
        }
        return [
            info.start,
            route[route.length],
            route
        ];
    };
   static  getGrainCarOpenTimeSecond() {
        var [hour, minute] = GrainCarConfigHelper.getGrainCarOpenTime();
        return hour * 3600 + minute * 60;
    };
   static  getGrainCarOpenTimeStamp() {
        var [hour, minute] = GrainCarConfigHelper.getGrainCarOpenTime();
        return G_ServerTime.getTimestampByHMS(hour, minute);
    };
   static  getGrainCarEndTimeStamp() {
        var [hour, minute] = GrainCarConfigHelper.getGrainCarCloseTime();
        return G_ServerTime.getTimestampByHMS(hour, minute);
    };
   static  getGrainCarGenTimeStamp() {
        var [genStartHour, genStartMinute] = GrainCarConfigHelper.getGrainCarRouteGenTime();
        return G_ServerTime.getTimestampByHMS(genStartHour, genStartMinute);
    };
   static  getNextGrainCarStartTime() {
        var weekArray = GrainCarConfigHelper.getGrainCarWeek();
        var weekRefreshTime = [];
        var grainCarOpenTimeSecond = GrainCarConfigHelper.getGrainCarOpenTimeSecond();
        for (let k in weekArray) {
            var v = weekArray[k];
            var time = G_ServerTime.getTimeByWdayandSecond(v + 1, grainCarOpenTimeSecond);
            weekRefreshTime.push(time);
        }
        var nextRefreshTime = 0;
        var index = 1;
        var curTime = G_ServerTime.getTime();
        while (index <= weekRefreshTime.length) {
            if (curTime < weekRefreshTime[index]) {
                nextRefreshTime = weekRefreshTime[index];
                break;
            }
            index = index + 1;
        }
        if (index == weekRefreshTime.length + 1) {
            nextRefreshTime = weekRefreshTime[1] + TimeConst.SECONDS_ONE_WEEK;
        }
        return nextRefreshTime;
    };
   static  isInActivityTime() {
        var curSecond = G_ServerTime.secondsFromToday();
        var [startHour, startMinute] = GrainCarConfigHelper.getGrainCarOpenTime();
        var startSecond = startHour * 3600 + startMinute * 60;
        var [endHour, endMinute] = GrainCarConfigHelper.getGrainCarCloseTime();
        var endSecond = endHour * 3600 + endMinute * 60 + GrainCarConfigHelper.getGrainCarShowTimeAfterEnd();
        return curSecond >= startSecond && curSecond < endSecond;
    };
   static  isInLaunchTime() {
        var curSecond = G_ServerTime.secondsFromToday();
        var [startHour, startMinute] = GrainCarConfigHelper.getGrainCarOpenTime();
        var startSecond = startHour * 3600 + startMinute * 60;
        var [endHour, endMinute] = GrainCarConfigHelper.getGrainCarCloseTime();
        var endSecond = endHour * 3600 + endMinute * 60;
        return curSecond >= startSecond && curSecond < endSecond;
    };
   static  isInActivityTimeFromGenerate() {
        if (!GrainCarConfigHelper.isTodayOpen()) {
            return false;
        }
        var curSecond = G_ServerTime.secondsFromToday();
        var [genStartHour, genStartMinute] = GrainCarConfigHelper.getGrainCarRouteGenTime();
        var genStartSecond = genStartHour * 3600 + genStartMinute * 60;
        var [endHour, endMinute] = GrainCarConfigHelper.getGrainCarCloseTime();
        var endSecond = endHour * 3600 + endMinute * 60 + GrainCarConfigHelper.getGrainCarShowTimeAfterEnd();
        return curSecond >= genStartSecond && curSecond < endSecond;
    };
   static  getOpenDays() {
        var weekArray = GrainCarConfigHelper.getGrainCarWeek();
        var days = {};
        for (let k in weekArray) {
            var v = weekArray[k];
            var curDay = parseInt(v);
            if (curDay > 0) {
                if (curDay == 7) {
                    curDay = 0;
                }
                days[curDay] = true;
            }
        }
        return days;
    };
   static  isTodayOpen() {
        var ret = false;
        var date = G_ServerTime.getDateObject(null, 0);
        var days = GrainCarConfigHelper.getOpenDays();
        var curDay = date.getDay();
        if (days[curDay]) {
            return !ret;
        }
        return ret;
    };
   static  isClose() {
        var curSecond = G_ServerTime.secondsFromToday();
        var [endHour, endMinute] = GrainCarConfigHelper.getGrainCarCloseTime();
        var closeSecond = endHour * 3600 + endMinute * 60;
        var endSecond = endHour * 3600 + endMinute * 60 + GrainCarConfigHelper.getGrainCarShowTimeAfterEnd();
        return curSecond >= closeSecond && curSecond < endSecond;
    };
   static  getActStage() {
        var startTime = GrainCarConfigHelper.getGrainCarOpenTimeStamp().getTime()/1000;
        var endTime = GrainCarConfigHelper.getGrainCarEndTimeStamp().getTime()/1000;
        var genTime = GrainCarConfigHelper.getGrainCarGenTimeStamp().getTime()/1000;
        var curTime = G_ServerTime.getTime();
        if (curTime >= genTime && curTime < startTime) {
            return GrainCarConst.ACT_STATGE_GENERATED;
        } else if (curTime >= startTime && curTime < endTime) {
            return GrainCarConst.ACT_STATGE_OPEN;
        } else {
            return GrainCarConst.ACT_STATGE_CLOSE;
        }
    };
   static  getRouteWithId(id) {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GRAINCAR_ROUTE).get(id);
        assert(info, 'graincar_route config can not find id = %d');
        var route = [];
        route.push(info.start);
        var i = 1;
        while (i < 13 && info['point_' + i] > 0) {
            route.push(info['point_' + i]);
            i = i + 1;
        }
        return route;
    };
   static  randDiff(startNum, endNum, count) {
        var fillNum = function (m, n) {
            var j, k;
            if (n) {
                j = m;
                k = n;
            } else {
                j = 1;
                k = m;
            }
            var t = [];
            for (var i = j; i <= k; i++) {
                t.push(i);
            }
            return t;
        }
        var tmp = fillNum(startNum, endNum);
        if (count > endNum - startNum + 1) {
            return tmp;
        }
        var x = 0;
        var t = [];
        var getRandom = function(end){
            return Math.floor(Math.random()*end)
        }
        while (count > 0) {
            x = getRandom(endNum - startNum + 1);
            if(x>=tmp.length)x=tmp.length-1;
            if(x<0)x = 0;
            t.push(tmp[x]);
            tmp.splice(x, 1);
            count = count - 1;
            startNum = startNum + 1;
        }
        return t;
    };
}