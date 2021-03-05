import { G_ServerTime, G_ConfigLoader, G_UserData } from "../../../init";
import { CampRaceConst } from "../../../const/CampRaceConst";
import { BaseConfig } from "../../../config/BaseConfig";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { ArraySort } from "../../../utils/handler";
import { SingleRaceConst } from "../../../const/SingleRaceConst";

export namespace CampRaceHelper {

    function getPvpproParameter(): BaseConfig {
        return G_ConfigLoader.getConfig(ConfigNameConst.PVPPRO_PARAMETER);
    }

    export function getGameTime(state) {
        if (state == CampRaceConst.STATE_PRE_MATCH) {
            let time = getPvpproParameter().get(CampRaceConst.PVP_PRO_PRE_CONST).content;
            return Number(time);
        } else if (state == CampRaceConst.STATE_PLAY_OFF) {
            let time = getPvpproParameter().get(CampRaceConst.PVP_PRO_FINAL_CONST).content;
            return Number(time);
        }
    };
    export function isOpenToday() {
        let [wday] = G_ServerTime.getWeekdayAndHour();
        let openDay = getPvpproParameter().get(CampRaceConst.PVP_PRO_OPEN_DAY).content;
        let strArr = openDay.split('|');
        for (let i in strArr) {
            let v = strArr[i];
            let day = Number(v);
            if (wday == day) {
                return true;
            }
        }
        return false;
    };
    export function getSigninState() {
        let findNextDay = function (fromWday, tbDay) {
            for (let i = fromWday; i <= 7; i++) {
                if (tbDay[i]) {
                    return i;
                }
            }
            for (let i = 1; i <= 7; i++) {
                if (tbDay[i]) {
                    return i + 7;
                }
            }
        };
        let curTime = G_ServerTime.getTime();
        let openSigninDay = getPvpproParameter().get(CampRaceConst.PVP_PRO_SIGNIN_OPEN_DAY).content;
        let strArrSigninDay = openSigninDay.split('|');
        let tbSigninDay = {};
        for (let i in strArrSigninDay) {
            let wday = strArrSigninDay[i];
            tbSigninDay[Number(wday)] = true;
        }
        let openSigninSec = getPvpproParameter().get(CampRaceConst.PVP_PRO_SIGNIN_OPEN_TIME).content;
        let strArrSigninSec = openSigninSec.split('|');
        let secondToOpen = Number(strArrSigninSec[0]) * 3600 + Number(strArrSigninSec[1]) * 60;
        let openDayStr = getPvpproParameter().get(CampRaceConst.PVP_PRO_OPEN_DAY).content;
        let strArrDay = openDayStr.split('|');
        let tbDay = {};
        for (let i in strArrDay) {
            let wday = strArrDay[i];
            tbDay[Number(wday)] = true;
        }
        let openSec = getPvpproParameter().get(CampRaceConst.PVP_PRO_OPEN_TIME).content;
        let strArrSec = openSec.split('|');
        let secondOpen = Number(strArrSec[0]) * 3600 + Number(strArrSec[1]) * 60;
        for (let i = 1; i <= 7; i++) {
            let signinDay = tbSigninDay[i] ? i : findNextDay(i, tbSigninDay);
            let openDay = tbDay[i] ? i : findNextDay(i, tbDay);
            let openSigninTime = G_ServerTime.getTimeByWdayandSecond(Number(signinDay) , secondToOpen);
            let openTime = G_ServerTime.getTimeByWdayandSecond(Number(openDay), secondOpen);
            if (curTime < openSigninTime) {
                return [
                    CampRaceConst.SIGNIN_NOT_OPEN,
                    openSigninTime - curTime
                ];
            } else if (curTime >= openSigninTime && curTime < openTime) {
                return [
                    CampRaceConst.SIGNIN_OPEN,
                    openTime - curTime
                ];
            }
        }
        return [
            0,
            0
        ];
    };
    export function isInCampChampionIconShowTime() {
        if (isReplacedBySingleRace() == true) {
            return false;
        }
        let curTime = G_ServerTime.getTime();
        let openDay = getPvpproParameter().get(CampRaceConst.PVP_PRO_OPEN_DAY).content;
        let strArrDay = openDay.split('|');
        let tbDay = {};
        for (let i in strArrDay) {
            let wday = strArrDay[i];
            tbDay[Number(wday)] = true;
        }
        let openSec = getPvpproParameter().get(CampRaceConst.PVP_PRO_OPEN_TIME).content;
        let strArrSec = openSec.split('|');
        let secondOpen = Number(strArrSec[0]) * 3600 + Number(strArrSec[1]) * 60;
        for (let wday in tbDay) {
            let v = tbDay[wday];
            let openTime = G_ServerTime.getTimeByWdayandSecond(Number(wday) , secondOpen);
            let limitTime = G_ServerTime.getTimeByWdayandSecond(Number(wday) + 1, 12 * 3600);
            if (curTime > openTime && curTime < limitTime && G_UserData.getCampRaceData().getStatus() == CampRaceConst.STATE_PRE_OPEN) {
                return true;
            }
        }
        return false;
    };
    export function getBetGold() {
        let gold = getPvpproParameter().get(CampRaceConst.PVP_PRO_BID_COST).content;
        return Number(gold);
    };
    export function getBetReward() {
        let gold = getPvpproParameter().get(CampRaceConst.PVP_PRO_BID_REWARD).content;
        return Number(gold);
    };
    export function sortReportGroup(reports) {
        function sortFunc(a, b) {
            return a.getId() < b.getId();
        }
        let result = [];
        for (let id in reports) {
            let report = reports[id];
            result.push(report);
        }
        ArraySort(result, sortFunc);
        return result;
    };
    export function getReportGroup(camp, pos) {
        let pos1 = 0;
        let pos2 = 0;
        if (pos % 2 == 0) {
            pos1 = pos - 1;
            pos2 = pos;
        } else {
            pos1 = pos;
            pos2 = pos + 1;
        }
        let reports = G_UserData.getCampRaceData().getReportGroupByPos(camp, pos1, pos2);
        return [
            reports,
            pos1,
            pos2
        ];
    };
    export function getMatchScore(camp, pos) {
        let [reports, pos1, pos2] = getReportGroup(camp, pos);
        let pos1WinCount = 0;
        let pos2WinCount = 0;
        let score = 0;
        for (let k in reports) {
            let report = reports[k];
            let winPos = report.getWin_pos();
            if (winPos == pos1) {
                pos1WinCount = pos1WinCount + 1;
            } else if (winPos == pos2) {
                pos2WinCount = pos2WinCount + 1;
            }
        }
        if (pos == pos1) {
            score = pos1WinCount;
        } else if (pos == pos2) {
            score = pos2WinCount;
        }
        return score;
    };
    export function getRoundWithPos(pos) {
        for (let round in CampRaceConst.ROUND_POSITION_IN_MATCH) {
            let tbPos = CampRaceConst.ROUND_POSITION_IN_MATCH[round];
            for (let i in tbPos) {
                let tempPos = tbPos[i];
                if (tempPos == pos) {
                    return round;
                }
            }
        }
        return 0;
    };
    export function getMacthStateWithPos(camp, pos) {
        let finalStatus = G_UserData.getCampRaceData().getFinalStatusByCamp(camp);
        let round = getRoundWithPos(pos);
        if (round < finalStatus) {
            return CampRaceConst.MATCH_STATE_AFTER;
        } else if (round > finalStatus) {
            return CampRaceConst.MATCH_STATE_BEFORE;
        } else {
            return CampRaceConst.MATCH_STATE_ING;
        }
    };
    export function getPreviewRankRewards() {
        let result = [];
        let Config = G_ConfigLoader.getConfig(ConfigNameConst.PVPPRO_REWARD);
        let info = Config.get(99);
        for (let i = 1; i <= 10; i++) {
            let type = info['type_' + i];
            let value = info['value_' + i];
            let size = info['size_' + i];
            if (type > 0 && value > 0 && size > 0) {
                let reward = {
                    type: type,
                    value: value,
                    size: size
                };
                result.push(reward);
            }
        }
        return result;
    };
    export function getStartTime() {
        if (isTodayOpen()) {
            let openSec = getPvpproParameter().get(CampRaceConst.PVP_PRO_OPEN_TIME).content;
            let strArrSec = openSec.split('|');
            let startTime = Number(strArrSec[0]) * 3600 + Number(strArrSec[1]) * 60;
            return startTime + G_ServerTime.secondsFromZero();
        }
        return 0;
    };
    export function getEndTime() {
        let openSec = getPvpproParameter().get(CampRaceConst.PVP_PRO_OPEN_TIME).content;
        let strArrSec = openSec.split('|');
        let secondOpen = Number(strArrSec[0]) * 3600 + Number(strArrSec[1]) * 60;
        let openTime = G_ServerTime.secondsFromZero() + secondOpen;
        let endTime = openTime + 7200;
        if (G_ServerTime.getTime() >= openTime) {
            let status = G_UserData.getCampRaceData().getStatus();
            if (status == CampRaceConst.STATE_PRE_OPEN) {
                endTime = G_ServerTime.getTime() - 1;
            }
        }
        return endTime;
    };
    export function isTodayOpen(zeroTimeSecond?) {
        if (isReplacedBySingleRace() == true) {
            return false;
        }
        let date = G_ServerTime.getDateObject(null, zeroTimeSecond);
        let days = getOpenDays();
        let day = date.getDay();
        day = day == 0 ? 7 : day;
        if (days[day]) {
            return true;
        }
        return false;
    };
    export function getOpenDays() {
        let openDay = getPvpproParameter().get(CampRaceConst.PVP_PRO_OPEN_DAY).content;
        let strArrDay = openDay.split('|');
        let days = {};
        for (let k in strArrDay) {
            let v = strArrDay[k];
            let curDay = Number(v);
            curDay = curDay;
            if (curDay > 7) {
                curDay = 1;
            }
            days[curDay] = true;
        }
        return days;
    };
    export function isReplacedBySingleRace() {
        let singleRaceStatus = G_UserData.getSingleRace().getStatus();
        if (singleRaceStatus == SingleRaceConst.RACE_STATE_NONE) {
            return false;
        } else {
            return true;
        }
    };
}