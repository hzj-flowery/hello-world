import { G_ServerTime, G_Prompt, G_UserData, G_ConfigLoader } from "../../init";
import { Lang } from "../../lang/Lang";
import { SingleRaceConst } from "../../const/SingleRaceConst";
import { ConfigNameConst } from "../../const/ConfigNameConst";

export namespace SingleRaceDataHelper {
    export function getStartTime() {
        let openSec = G_ConfigLoader.getConfig(ConfigNameConst.PVPPRO_PARAMETER).get(SingleRaceConst.PVPSINGLE_SIGN_DAY).content;
        let strArrSec = openSec.split('|');
        let startTime = Number(strArrSec[1]) * 3600 + Number(strArrSec[2]) * 60;
        let timeOfDay = SingleRaceDataHelper.getDaysFromToday() * 24 * 3600;
        return G_ServerTime.secondsFromZero() + timeOfDay + startTime;
    };
    export function getEndTime() {
        let openTime = SingleRaceDataHelper.getStartTime();
        let endTime = openTime + 7200;
        if (G_ServerTime.getTime() >= openTime) {
            let status = G_UserData.getSingleRace().getStatus();
            if (status == SingleRaceConst.RACE_STATE_FINISH) {
                endTime = G_ServerTime.getTime() - 1;
            }
        }
        return endTime;
    };
    export function isTodayOpen(zeroTimeSecond) {
        let date = G_ServerTime.getDateObject(null, zeroTimeSecond);
        let day = date.getDay();
        day = day == 0 ? 7 : day;
        let days = SingleRaceDataHelper.getOpenDays();
        if (days[day]) {
            return true;
        }
        return false;
    };
    export function getOpenDays() {
        let openSec = G_ConfigLoader.getConfig(ConfigNameConst.PVPPRO_PARAMETER).get(SingleRaceConst.PVPSINGLE_SIGN_DAY).content;
        let strArrSec = openSec.split('|');
        let days = {};
        let curDay = Number(strArrSec[0]);
        // curDay = curDay + 1;
        // if (curDay > 7) {
        //     curDay = 1;
        // }
        days[curDay] = true;
        return days;
    };
    export function getDaysFromToday() {
        let openSec = G_ConfigLoader.getConfig(ConfigNameConst.PVPPRO_PARAMETER).get(SingleRaceConst.PVPSINGLE_SIGN_DAY).content;
        let strArrSec = openSec.split('|');
        let targetDay = Number(strArrSec[0]);
        let date = G_ServerTime.getDateObject();
        let wday = date.getDay();
        wday = wday == 0 ? 7 : wday;
        if (targetDay == 8) {
            targetDay = 1;
        }
        if (wday <= targetDay) {
            return targetDay - wday;
        } else {
            return targetDay + 7 - wday;
        }
    };
    export function isInGuessTime(): (boolean | number)[] {
        let PvpproParameter = G_ConfigLoader.getConfig(ConfigNameConst.PVPPRO_PARAMETER);
        let strStart = PvpproParameter.get(SingleRaceConst.PVPSINGLE_GUESS_START).content;
        let strFinish = PvpproParameter.get(SingleRaceConst.PVPSINGLE_GUESS_FINISH).content;
        let tbStart = strStart.split('|');
        let tbFinish = strFinish.split('|');
        let curTime = G_ServerTime.getTime();
        let startSec = Number(tbStart[1]) * 3600 + Number(tbStart[2]) * 60;
        let finishSec = Number(tbFinish[1]) * 3600 + Number(tbFinish[2]) * 60;
        let wdayStart = Number(tbStart[0]);
        if (wdayStart == 8) {
            wdayStart = 1;
        }
        let wdayFinish = Number(tbFinish[0]);
        if (wdayFinish == 8) {
            wdayFinish = 1;
        }
        let startTime = G_ServerTime.getTimeByWdayandSecond(wdayStart, startSec);
        let finishTime = G_ServerTime.getTimeByWdayandSecond(wdayFinish, finishSec);
        if (curTime >= startTime && curTime <= finishTime) {
            return [
                true,
                Number(tbStart[0]),
                Number(tbStart[1])
            ];
        } else {
            return [
                false,
                Number(tbStart[0]),
                Number(tbStart[1])
            ];
        }
    };
    export function checkCanGuess() {
        let [isIn, wday] = SingleRaceDataHelper.isInGuessTime();
        if (isIn == false) {
            let strWday = Lang.get('common_wday')[Number(wday) - 1];
            G_Prompt.showTip(Lang.get('single_race_can_not_guess_tip', { wday: strWday }));
        }
        return isIn;
    };
    export function getPreviewRankRewards() {
        let result = [];
        let info = G_ConfigLoader.getConfig(ConfigNameConst.PVPPRO_PARAMETER).get(SingleRaceConst.PVPSINGLE_REWARD);
        let tbAward = info.content.split(',');
        for (let i in tbAward) {
            let strAward = tbAward[i];
            let temp = strAward.split('|');
            let reward = {
                type: Number(temp[0]),
                value: Number(temp[1]),
                size: 0
            };
            result.push(reward);
        }
        return result;
    };
    export function getStartTimeOfChat() {
        var strStart = G_ConfigLoader.getConfig('pvppro_parameter').get(SingleRaceConst.PVPSINGLE_CHAT_BEGIN).content;
        var tbStart = (strStart.split('|'));
        var curTime = G_ServerTime.getTime();
        var startSec = Number(tbStart[2]) * 3600 + Number(tbStart[3]) * 60;
        var wdayStart = Number(tbStart[1]) + 1;
        var startTime = G_ServerTime.getTimeByWdayandSecond(wdayStart, startSec);
        return startTime;
    };
    export function getEndTimeOfChat() {
        var strFinish = G_ConfigLoader.getConfig('pvppro_parameter').get(SingleRaceConst.PVPSINGLE_CHAT_END).content;
        var tbFinish = (strFinish.split('|'));
        var curTime = G_ServerTime.getTime();
        var finishSec = Number(tbFinish[2]) * 3600 + Number(tbFinish[3]) * 60;
        var wdayFinish = Number(tbFinish[1]) + 1;
        var finishTime = G_ServerTime.getTimeByWdayandSecond(wdayFinish, finishSec);
        return finishTime;
    };
}