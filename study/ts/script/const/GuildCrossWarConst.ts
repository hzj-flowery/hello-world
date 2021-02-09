export namespace GuildCrossWarConst {
    export const CAMERA_SCALE_SMALL = 0.1666;
    export const AVATAR_MOVING_RATE = 70;
    export const DEFAULT_CARAME_POS = 546;
    export const MAX_GRID_PATHFINDING = 100;
    export const MAX_GRID_NUMSATK = 2;
    export const CROSS_GRID_DISTANCE = 2 ^ 1 / 2;
    export const CROSS_GRID_NUMS = 25;
    export const ACTIVITY_STAGE_1 = 1;
    export const ACTIVITY_STAGE_2 = 2;
    export const ACTIVITY_STAGE_3 = 3;
    export const ATTACK_TYPE_1 = 1;
    export const ATTACK_TYPE_2 = 2;
    export const ATTACK_TYPE_3 = 3;
    export const SELF_ENTER = 1;
    export const SELF_MOVE = 2;
    export const SELF_FIGHT = 3;
    export const UPDATE_BOSS = 304;
    export const UPDATE_CITY1 = 302;
    export const UPDATE_CITY2 = 303;
    export const UPDATE_CITY3 = 1;
    export const UPDATE_CITY4 = 2;
    export const UNIT_STATE_IDLE = 0;
    export const UNIT_STATE_MOVING = 1;
    export const UNIT_STATE_CD = 2;
    export const UNTI_STATE_PK = 3;
    export const UNIT_STATE_DEATH = 4;
    export const UNIT_ZORDER = 1000000;
    export const BOSS_STATE_IDLE = 0;
    export const BOSS_STATE_PK = 1;
    export const BOSS_STATE_DEATH = 2;
    export const GUILD_CROSS_ATKTARGET_TYPE1 = 1;
    export const GUILD_CROSS_ATKTARGET_TYPE2 = 2;
    export const UPDATE_ACTION_0 = 0;
    export const UPDATE_ACTION_1 = 1;
    export const UPDATE_ACTION_2 = 2;
    export const UPDATE_ACTION_3 = 3;
    export const GRID_SIZE = 120;
    export const DST_SCALE = 1;
    export const SCALE_VALUE_PER_PIXEL = 0.1 / 250;
    export const X_POS_SCALE_VALUE_PER_PIXEL = 0.1 / 250;
    export const Y_POS_SCALE_VALUE_PER_PIXEL = 0.1 / 300;
    export const MAP_WIDTH = 1800;
    export const MAP_MIN_HEIGHT = 640;
    export const MAP_TAI_HEIGHT = 440;
    export const FIRST_ENTER_BOTTOM_BOAT_TO_SCREEN_DISTANCE = 190;
    export const BOSS_AVATAR_INFO_POS = cc.v2(0, 60);
    export const BOSS_AVATAR_DISTANCE = 5;
    export const ENEMYLISTVIEW_POS = [
        336.5,
        250
    ];
    export const ENEMYLISTVIEW_SIZE = [
        cc.size(256, 336),
        cc.size(256, 250)
    ];
    export const GUILD_LADDER_CELL_BG = [
        'img_com_dark_board_bg01',
        'img_com_dark_board_bg01c'
    ];
    export const PERSONNAL_LADDER_CELL_BG = [
        'img_com_ranking04',
        'img_com_ranking05'
    ];
    export const GUILD_LADDER_RANKNUM = [
        'img_qizhi01',
        'img_qizhi02',
        'img_qizhi03',
        'img_qizhi04'
    ];
    export const GUILD_OBSERVER_BG = [
        'img_guild_cross_war_btn0',
        'img_guild_cross_war_btn1'
    ];
    export const GUESS_GUILD_OBSERVER_PANELPOS = [
        [
            cc.v2(227.75, -230),
            cc.v2(79.25, -230),
            cc.v2(376.25, -230)
        ],
        [
            cc.v2(153.5, -230),
            cc.v2(302, -230),
            cc.v2(5, -230),
            cc.v2(450.5, -230)
        ]
    ];
};