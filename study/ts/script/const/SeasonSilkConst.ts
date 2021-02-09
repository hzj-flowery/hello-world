export namespace SeasonSilkConst {
    export const SILK_SCOP_LOWERLIMIT = 5;
    export const SILK_SCOP_REDLIMIT = 6;
    export const SILK_SCOP_GOLDLIMIT = 7;
    export const SILK_GROUP_SATE_LOCK = 0;
    export const SILK_GROUP_SATE_UNLOCK = 1;
    export const SILK_GROUP_SATE_UNEQUIP = 2;
    export const SILK_GROUP_SATE_EQUIPPED = 3;
    export const SEASON_SILKBASE_POS = {
        [1]: [
            cc.v2(50, 265),
            cc.v2(275, 265),
            cc.v2(275, 65),
            cc.v2(50, 65)
        ],
        [2]: [
            cc.v2(50, 265),
            cc.v2(162.5, 310),
            cc.v2(275, 265),
            cc.v2(315, 165),
            cc.v2(275, 65),
            cc.v2(162.5, 10),
            cc.v2(50, 65),
            cc.v2(5, 165)
        ],
        [3]: [
            cc.v2(50, 292),
            cc.v2(160, 323),
            cc.v2(265, 292),
            cc.v2(325, 215),
            cc.v2(328, 113),
            cc.v2(265, 17),
            cc.v2(160, -13),
            cc.v2(50, 18),
            cc.v2(-5, 104),
            cc.v2(-15.5, 206.3)
        ]
    };
    export const SEASON_ROOTTAB_POS = {
        [1]: 188,
        [2]: 143,
        [3]: 98
    };
    export const SILK_EQUIP_EFFECTNAME = {
        [5]: 'effect_jinnang_chengsejihuo',
        [6]: 'effect_jinnang_hongsejihuo',
        [7]: 'effect_jinnang_hongsejihuo'
    };
}