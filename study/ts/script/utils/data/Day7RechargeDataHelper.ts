import { G_ConfigLoader, G_UserData, G_ServerTime } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { assert } from "../GlobleFunc";
import { TimeConst } from "../../const/TimeConst";
import { UserDataHelper } from "./UserDataHelper";
import { G_ParameterIDConst } from "../../const/ParameterIDConst";
import { ArraySort } from "../handler";

export namespace Day7RechargeDataHelper {
    export function get7DaysMoneyConfig(id) {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.SEVEN_DAYS_MONEY).get(id);
        assert(info, "seven_days_money config can not find id = ", id);
        return info;
    }

    export function getActivityEndTime() {
        var serverOpenTime = G_UserData.getBase().getServer_open_time();
        var openZeroTime = G_ServerTime.secondsFromZero(serverOpenTime, TimeConst.RESET_TIME_SECOND);
        var durationDay = UserDataHelper.getParameter(G_ParameterIDConst.SEVEN_DAY_MONEY_DURATION);
        var endTime = openZeroTime + durationDay * 24 * 3600;
        return endTime;
    }

    export function getAwardEndTime() {
        var serverOpenTime = G_UserData.getBase().getServer_open_time();
        var openZeroTime = G_ServerTime.secondsFromZero(serverOpenTime, TimeConst.RESET_TIME_SECOND);
        var durationDay = UserDataHelper.getParameter(G_ParameterIDConst.SEVEN_DAY_MONEY_REWARD_DURATION);
        var endTime = openZeroTime + durationDay * 24 * 3600;
        return endTime;
    }

    export function isShow() {
        var serverOpenTime = G_UserData.getBase().getServer_open_time();
        var tempTime = UserDataHelper.getParameter(G_ParameterIDConst.SPECIAL_CONFIG_TIME);
        if (serverOpenTime >= tempTime) {
            var endTime = Day7RechargeDataHelper.getAwardEndTime();
            var curTime = G_ServerTime.getTime();
            if (curTime < endTime) {
                return true;
            }
        }
        return false;
    }

    export function getAwardListWithType(type) {
        var result = [];
        var taskInfo = G_UserData.getDay7Recharge().getTaskInfoWithType(type);
        var moneyInfo = G_UserData.getDay7Recharge().getMoneyInfoWithType(type);
        for (var index in moneyInfo) {
            var info = moneyInfo[index];
            var id = info.id;
            var unit = {
                info: info,
                received: taskInfo.isReceivedWithId(id),
                value: taskInfo.getValue(),
                state: taskInfo.getStateWithId(id)
            }
            result.push(unit);
        }

        result.sort((a, b) => {
            if (a.received != b.received) {
                return !a.received ? -1 : 1;
            } else {
                return a.info.order - b.info.order;
            }
        });
        return result;
    }
};