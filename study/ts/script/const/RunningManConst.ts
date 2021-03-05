export namespace RunningManConst {
    export const START_AVATAR_ZORDER = 250;
    var RUNNING_Y_OFFSET = 75;
    var RUNNING_X_OFFSET = 30;
    export const AVATA_INFO1 = {
        startPos: cc.v2(290 + RUNNING_X_OFFSET * 4, 147 + RUNNING_Y_OFFSET * 4),
        betPos: cc.v2(-290 + RUNNING_X_OFFSET * 4, 147 + RUNNING_Y_OFFSET * 4),
        scale: 0.7,
        chatPos: cc.v2(40, 88)
    };
    export const AVATA_INFO2 = {
        startPos: cc.v2(290 + RUNNING_X_OFFSET * 3, 147 + RUNNING_Y_OFFSET * 3),
        betPos: cc.v2(-290 + RUNNING_X_OFFSET * 3, 147 + RUNNING_Y_OFFSET * 3),
        scale: 0.7,
        chatPos: cc.v2(40, 88)
    };
    export const AVATA_INFO3 = {
        startPos: cc.v2(290 + RUNNING_X_OFFSET * 2, 147 + RUNNING_Y_OFFSET * 2),
        betPos: cc.v2(-290 + RUNNING_X_OFFSET * 2, 147 + RUNNING_Y_OFFSET * 2),
        scale: 0.7,
        chatPos: cc.v2(40, 88)
    };
    export const AVATA_INFO4 = {
        startPos: cc.v2(290 + RUNNING_X_OFFSET, 147 + RUNNING_Y_OFFSET),
        betPos: cc.v2(-290 + RUNNING_X_OFFSET, 147 + RUNNING_Y_OFFSET),
        scale: 0.7,
        chatPos: cc.v2(40, 88)
    };
    export const AVATA_INFO5 = {
        startPos: cc.v2(290, 147),
        betPos: cc.v2(-290, 147),
        scale: 0.7,
        chatPos: cc.v2(40, 88)
    };
    export const RUNNING_STATE_PRE_START = 1;
    export const RUNNING_STATE_END = 2;
    export const RUNNING_STATE_BET = 3;
    export const RUNNING_STATE_WAIT = 4;
    export const RUNNING_STATE_RUNNING = 5;
    export const RUNNING_STATE_RUNNING_END = 6;
    export const RUNNING_MOVE_ACTION_TIME = 1.5;
    export const RUNNING_COST_CASH_VALUE = 50;
    export const RUNNING_ANIMATION_SPEED = 1.2;
    export const BUBBLE_START_TIME_MIN = 1;
    export const BUBBLE_START_TIME_MAX = 4;
    export const BUBBLE_SHOW_TIME_MIN = 3;
    export const BUBBLE_SHOW_TIME_MAX = 8;
    export const getStateName = function (stateValue) {
        for (let key in RunningManConst) {
            var value = RunningManConst[key];
            if(key.indexOf('RUNNING_') != -1 && value == stateValue) {
                return key;
            }
        }
        return '';
    };
}