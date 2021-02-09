-- @Author panhoa
-- @Date 8.17.2018
-- @Role 

local SeasonSilkConst = {}
SeasonSilkConst.SILK_SCOP_LOWERLIMIT         = 5     -- 锦囊筛选条件：至少橙色
SeasonSilkConst.SILK_SCOP_REDLIMIT           = 6     -- 锦囊筛选条件：至少红色
SeasonSilkConst.SILK_SCOP_GOLDLIMIT          = 7     -- 锦囊筛选条件：至少金色

SeasonSilkConst.SILK_GROUP_SATE_LOCK         = 0     -- 锦囊组状态：锁定
SeasonSilkConst.SILK_GROUP_SATE_UNLOCK       = 1     -- 锦囊组状态：未锁定（已达星级
SeasonSilkConst.SILK_GROUP_SATE_UNEQUIP      = 2     -- 锦囊组状态：未装备
SeasonSilkConst.SILK_GROUP_SATE_EQUIPPED     = 3     -- 锦囊组状态：已装备

SeasonSilkConst.SEASON_SILKBASE_POS = {
    [1] = {cc.p(50, 265), cc.p(275, 265), cc.p(275, 65), cc.p(50, 65)},
    [2] = {cc.p(50, 265), cc.p(162.5, 310), cc.p(275, 265), cc.p(315, 165), cc.p(275, 65), cc.p(162.5, 10), cc.p(50, 65), cc.p(5, 165)},
    [3] = {cc.p(50, 292), cc.p(160.0, 323), cc.p(265, 292), cc.p(325, 215), cc.p(328, 113), cc.p(265, 17), cc.p(160, -13), cc.p(50, 18), cc.p(-5, 104), cc.p(-15.5, 206.3)},
}

SeasonSilkConst.SEASON_ROOTTAB_POS = {
    [1] = 188,
    [2] = 143,    
    [3] = 98,
}

SeasonSilkConst.SILK_EQUIP_EFFECTNAME = {
    [5] = "effect_jinnang_chengsejihuo",
    [6] = "effect_jinnang_hongsejihuo",
    [7] = "effect_jinnang_hongsejihuo",
}

return readOnly(SeasonSilkConst)