-- @Author panhoa
-- @Date 4.3.2020

local BoutConst = {
    BOUT_BOTTOM_NAMEKEY = "boutBottom_", --阵法位名称前缀
    BOUT_POINT_NAMEKEY  = "boutPint_", --阵法位名称前缀

    CONSUME_HERO_ATTRS  = 1,    --增加属性
    CONSUME_HERO_MAXNUM = 3,    --消耗武将数

    CONSUME_HERO_POS = {        --消耗武将位置
        {cc.p(126.5, 103.5)},
        {cc.p(80, 115), cc.p(170, 115)},
        {cc.p(36.5, 103.5), cc.p(126.5, 103.5), cc.p(216.5, 103.5)},
    }
}

return BoutConst