import { FunctionConst } from "./FunctionConst";

export namespace ComplexRankConst {
    export const USER_LEVEL_RANK = 1;
    export const USER_POEWR_RANK = 2;
    export const USER_ARENA_RANK = 3;
    export const STAGE_STAR_RANK = 4;
    export const ELITE_STAR_RANK = 5;
    export const TOWER_STAR_RANK = 6;
    export const USER_GUILD_RANK = 7;
    export const ACTIVE_PHOTO_RANK = 8;
    export const AVATAR_PHOTO_RANK = 9;
    export const RANK_TAB_LIST = [
        [
            ComplexRankConst.USER_LEVEL_RANK,
            null
        ],
        [
            ComplexRankConst.USER_POEWR_RANK,
            null
        ],
        [
            ComplexRankConst.USER_GUILD_RANK,
            null
        ],
        [
            ComplexRankConst.AVATAR_PHOTO_RANK,
            FunctionConst.FUNC_AVATAR_PHOTO_RANK
        ],
        [
            ComplexRankConst.ACTIVE_PHOTO_RANK,
            null
        ],
        [
            ComplexRankConst.USER_ARENA_RANK,
            null
        ],
        [
            ComplexRankConst.STAGE_STAR_RANK,
            null
        ],
        [
            ComplexRankConst.ELITE_STAR_RANK,
            FunctionConst.FUNC_ELITE_STAR_RANK
        ],
        [
            ComplexRankConst.TOWER_STAR_RANK,
            null
        ]
    ];
};