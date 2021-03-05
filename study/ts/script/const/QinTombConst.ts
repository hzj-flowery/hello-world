export namespace QinTombConst {
    export const POINT_TYPE_REBORN = 1;
    export const POINT_TYPE_ROAD = 2;
    export const CAMERA_SCALE_MIN = 0.2;
    export const CAMERA_SCALE_MAX = 5;
    export const TEAM_STATE_IDLE = 0;
    export const TEAM_STATE_MOVING = 1;
    export const TEAM_STATE_HOOK = 2;
    export const TEAM_STATE_PK = 3;
    export const TEAM_STATE_DEATH = 4;
    export const MONSTER_STATE_IDLE = 0;
    export const MONSTER_STATE_NONE = 1;
    export const MONSTER_STATE_HOOK = 2;
    export const MONSTER_STATE_PK = 3;
    export const MONSTER_STATE_DEATH = 4;
    export const TEAM_SMALL_MAP_POS = {
        [1]: cc.v2(0, 0),
        [2]: cc.v2(-8, -6),
        [3]: cc.v2(7, -6)
    };
    export const TEAM_AVATAR_IDLE_POS = {
        [1]: cc.v2(0, 0),
        [2]: cc.v2(-40, 40),
        [3]: cc.v2(40, 40)
    };
    export const TEAM_AVATAR_RUN_POS = {
        [1]: cc.v2(0, 0),
        [2]: cc.v2(-40, 40),
        [3]: cc.v2(40, 40)
    };
    export const MONSTER_AVATAR_INFO_POS = cc.v2(0, 60);
    export const TEAM_PK_EFFECT_HEIGHT = 160;
    export const TEAM_BATTLE_RESULT_SHOW_TIME = 3;
    export const TEAM_BATTLE_RESULT = {
        [1]: cc.size(444, 66),
        [2]: cc.size(444, 126),
        [3]: cc.size(444, 181)
    };
    export const TEAM_BATTLE_RESULT_TEXT = {
        [1]: cc.v2(222, 150),
        [2]: cc.v2(222, 118),
        [3]: cc.v2(222, 91)
    };
    // export const TEAM_ZORDER_NAME = 100500;
    // export const TEAM_ZORDER = 100000;
    export const TEAM_ZORDER_NAME = 1005;
    export const TEAM_ZORDER = 1000;
}