export namespace CampRaceConst {
    export const STATE_PRE_OPEN = 0;
    export const STATE_PRE_MATCH = 1;
    export const STATE_PLAY_OFF = 2;
    export const PLAY_OFF_ROUND1 = 1;
    export const PLAY_OFF_ROUND2 = 2;
    export const PLAY_OFF_ROUND3 = 3;
    export const PLAY_OFF_ROUND_ALL = 4;
    export const SIGNIN_NOT_OPEN = 1;
    export const SIGNIN_OPEN = 2;
    export const ROUND_POSITION_IN_MATCH = {
        [CampRaceConst.PLAY_OFF_ROUND1]: [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8
        ],
        [CampRaceConst.PLAY_OFF_ROUND2]: [
            9,
            10,
            11,
            12
        ],
        [CampRaceConst.PLAY_OFF_ROUND3]: [
            13,
            14
        ],
        [CampRaceConst.PLAY_OFF_ROUND_ALL]: [15]
    };
    export const PVP_PRO_PRE_CONST = 9;
    export const PVP_PRO_FINAL_CONST = 10;
    export const PVP_PRO_SIGNIN_OPEN_DAY = 1;
    export const PVP_PRO_SIGNIN_OPEN_TIME = 2;
    export const PVP_PRO_OPEN_DAY = 4;
    export const PVP_PRO_OPEN_TIME = 5;
    export const PVP_PRO_BID_COST = 11;
    export const PVP_PRO_BID_REWARD = 12;
    export const MATCH_STATE_BEFORE = 1;
    export const MATCH_STATE_ING = 2;
    export const MATCH_STATE_AFTER = 3;
}