import { G_ConfigLoader } from "../init";
import { ConfigNameConst } from "./ConfigNameConst";

export namespace SingleRaceConst {
    export const RACE_STATE_NONE = 0;
    export const RACE_STATE_PRE = 1;
    export const RACE_STATE_ING = 2;
    export const RACE_STATE_FINISH = 3;
    export const LAYER_STATE_MAP = 1;
    export const LAYER_STATE_BATTLE = 2;
    export const LAYER_STATE_CHAMPION = 3;
    export const MAX_WIN_COUNT = 3;
    export const RESULT_STATE_NONE = 0;
    export const RESULT_STATE_ING = 1;
    export const RESULT_STATE_WIN = 2;
    export const RESULT_STATE_LOSE = 3;
    export const REPORT_SIDE_1 = 1;
    export const REPORT_SIDE_2 = 2;
    export const MATCH_STATE_BEFORE = 1;
    export const MATCH_STATE_ING = 2;
    export const MATCH_STATE_AFTER = 3;
    export const MAP_STATE_LARGE = 1;
    export const MAP_STATE_SMALL = 2;
    export const PVPSINGLE_WINNERSHOW = 21;
    export const PVPSINGLE_SIGN_DAY = 22;
    export const PVPSINGLE_GUESS_START = 40;
    export const PVPSINGLE_GUESS_FINISH = 41;
    export const PVPSINGLE_CHAT_BEGIN = 46;
	export const PVPSINGLE_CHAT_END = 47;
    export const PVPSINGLE_REWARD = 42;
    export const RANK_DATA_TYPE_1 = 1;
    export const RANK_DATA_TYPE_2 = 2;
    export const RANK_DATA_TYPE_3 = 3;
    export const GUESS_TAB_TYPE_1 = 1;
    export const GUESS_TAB_TYPE_2 = 2;
    export const GUESS_TAB_TYPE_3 = 3;
    export const getIntervalPerRound = function () {
        let config = G_ConfigLoader.getConfig(ConfigNameConst.PVPPRO_PARAMETER)
        var num = config.get(15).content;
        return Number(num);
    };
    export const getWinMaxNum = function () {
        let config = G_ConfigLoader.getConfig(ConfigNameConst.PVPPRO_PARAMETER)
        var num = config.get(16).content;
        return Number(num);
    };
    export const getBidCost = function () {
        let config = G_ConfigLoader.getConfig(ConfigNameConst.PVPPRO_PARAMETER)
        var num = config.get(17).content;
        return Number(num);
    };
    export const getBidReward = function () {
        let config = G_ConfigLoader.getConfig(ConfigNameConst.PVPPRO_PARAMETER)
        var num = config.get(18).content;
        return Number(num);
    };
    export const getRoundWithPosition = function (position) {
        var round = 0;
        if (position >= 33 && position <= 48) {
            round = 1;
        } else if (position >= 49 && position <= 56) {
            round = 2;
        } else if (position >= 57 && position <= 60) {
            round = 3;
        } else if (position >= 61 && position <= 62) {
            round = 4;
        } else if (position == 63) {
            round = 5;
        }
        return round;
    };
    export const getPositionRegionWithRound = function (round) {
        if (round == 1) {
            return [
                1,
                32
            ];
        } else if (round == 2) {
            return [
                33,
                48
            ];
        } else if (round == 3) {
            return [
                49,
                56
            ];
        } else if (round == 4) {
            return [
                57,
                60
            ];
        } else if (round == 5) {
            return [
                61,
                62
            ];
        } else {
            return [
                63,
                63
            ];
        }
    };
}