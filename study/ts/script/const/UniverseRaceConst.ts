import { G_ConfigLoader } from "../init";

export namespace UniverseRaceConst {
    export const RACE_STATE_NONE = 0;
    export const RACE_STATE_BREAK = 1;
    export const RACE_STATE_ING = 2;
    export const RACE_STATE_CHAMPION_SHOW = 3;
    export const LAYER_STATE_MAP = 1;
    export const LAYER_STATE_BATTLE = 2;
    export const LAYER_STATE_CHAMPION = 3;
    export const LAYER_STATE_PAST_CHAMPION = 4;
    export const MATCH_STATE_BEFORE = 1;
    export const MATCH_STATE_ING = 2;
    export const MATCH_STATE_AFTER = 3;
    export const GUESS_TAB_1 = 1;
    export const GUESS_TAB_2 = 2;
    export const GUESS_TAB_3 = 3;
    export const GUESS_TAB_4 = 4;
    export const GUESS_TAB_5 = 5;
    export const GUESS_STATE_1 = 1;
    export const GUESS_STATE_2 = 2;
    export const GUESS_STATE_3 = 3;
    export const SIDE_LEFT = 1;
    export const SIDE_RIGHT = 2;
    export const MAX_WIN_COUNT = 3;
    export const RESULT_STATE_NONE = 0;
    export const RESULT_STATE_ING = 1;
    export const RESULT_STATE_WIN = 2;
    export const RESULT_STATE_LOSE = 3;
    export const GUESS_TYPE_1 = 1;
    export const GUESS_TYPE_2 = 2;
    export const getIntervalPerRound = function () {
        var num = G_ConfigLoader.getConfig('pvpuniverse_parameter').get(7).content;
        return parseInt(num);
    };
    export const getWinMaxNum = function () {
        var num = G_ConfigLoader.getConfig('pvpuniverse_parameter').get(7).content;
        return parseInt(num);
    };
    export const MAP_RELATION = {
        [25]: 57,
        [26]: 58,
        [27]: 59,
        [28]: 60,
        [29]: 61,
        [30]: 62,
        [31]: 63
    };
    export const MAP_STRUCTURE = {
        [1]: {
            [1]: {
                [1]: 33,
                [2]: 34
            },
            [2]: {
                [9]: 41,
                [10]: 42
            },
            [3]: {
                [17]: 49,
                [18]: 50
            }
        },
        [2]: {
            [1]: {
                [5]: 37,
                [6]: 38
            },
            [2]: {
                [13]: 45,
                [14]: 46
            },
            [3]: {
                [21]: 53,
                [22]: 54
            }
        },
        [3]: {
            [1]: {
                [7]: 39,
                [8]: 40
            },
            [2]: {
                [15]: 47,
                [16]: 48
            },
            [3]: {
                [23]: 55,
                [24]: 56
            }
        },
        [4]: {
            [1]: {
                [3]: 35,
                [4]: 36
            },
            [2]: {
                [11]: 43,
                [12]: 44
            },
            [3]: {
                [19]: 51,
                [20]: 52
            }
        }
    };
    export const getIndexsWithRound = function (round) {
        if (round == 1) {
            return [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8
            ];
        } else if (round == 2) {
            return [
                9,
                10,
                11,
                12,
                13,
                14,
                15,
                16
            ];
        } else if (round == 3) {
            return [
                17,
                18,
                19,
                20,
                21,
                22,
                23,
                24
            ];
        } else if (round == 4) {
            return [
                25,
                26,
                27,
                28
            ];
        } else if (round == 5) {
            return [
                29,
                30
            ];
        } else if (round == 6) {
            return [31];
        } else {
            return {};
        }
    };
    export const NEXT_INDEX = {
        [1]: 9,
        [2]: 10,
        [3]: 11,
        [4]: 12,
        [5]: 13,
        [6]: 14,
        [7]: 15,
        [8]: 16,
        [9]: 17,
        [10]: 18,
        [11]: 19,
        [12]: 20,
        [13]: 21,
        [14]: 22,
        [15]: 23,
        [16]: 24,
        [17]: 25,
        [18]: 25,
        [19]: 26,
        [20]: 26,
        [21]: 27,
        [22]: 27,
        [23]: 28,
        [24]: 28,
        [25]: 29,
        [26]: 29,
        [27]: 30,
        [28]: 30,
        [29]: 31,
        [30]: 31,
        [31]: 0
    };
    export const getLastIndex = function (index) {
        for (var k in UniverseRaceConst.NEXT_INDEX) {
            var v = UniverseRaceConst.NEXT_INDEX[k];
            if (index == v) {
                return k;
            }
        }
    };
};