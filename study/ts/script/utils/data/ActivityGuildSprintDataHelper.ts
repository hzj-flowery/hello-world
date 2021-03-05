import { G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { TimeLimitActivityConst } from "../../const/TimeLimitActivityConst";
import { ArraySort } from "../handler";

export namespace ActivityGuildSprintDataHelper {

    export function getGuildSprintRankRewardList(rankDataList) {
        let SevenDaySprintAward = G_ConfigLoader.getConfig(ConfigNameConst.SEVEN_DAY_SPRINT_AWARD);
        let len = SevenDaySprintAward.length();
        let dataList = {};
        for (let i = 1; i <= len; i += 1) {
            let config = SevenDaySprintAward.indexOf(i-1);
            if (config.type == TimeLimitActivityConst.ACTIVITY_TYPE_GUILD_SPRINT) {
                let k = config.rank_min + ('_' + config.rank_max);
                if (!dataList[k]) {
                    dataList[k] = {
                        rank_min: config.rank_min,
                        rank_max: config.rank_max,
                        config1: null,
                        config2: null,
                        config3: null,
                        rankData: null
                    };
                }
                dataList[k]['config' + config.value] = config;
                if (config.rank_min == config.rank_max) {
                    dataList[k].rankData = rankDataList[config.rank_min];
                }
            }
        }
        let newDataList = [];
        for (let k in dataList) {
            let v = dataList[k];
            newDataList.push(v);
        }
        let sortFunc = function (obj1, obj2) {
            return obj1.rank_min < obj2.rank_min;
        };
        ArraySort(newDataList, sortFunc);
        return newDataList;
    };
    export function isGuildSprintActEnd() {
        return true;
    };
};