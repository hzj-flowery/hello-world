-- 游历常量
local ExploreConst = {}

ExploreConst.EVENT_TYPE_ANSWER = 1
ExploreConst.EVENT_TYPE_HERO = 4
ExploreConst.EVENT_TYPE_HALP_PRICE = 5
ExploreConst.EVENT_TYPE_REBEL = 6
ExploreConst.EVENT_TYPE_REBEL_BOSS = 7
ExploreConst.EVENT_TYPE_BOX = 8


ExploreConst.EXPLORE_AUTO = 1 -- 自动游历
ExploreConst.EXPLORE_ONE_KEY = 2 --一键游历

ExploreConst.COST_NAME_COLOR    = cc.c3b(0xff,0xb8,0x0c)
ExploreConst.COST_NAME_SIZE     = 20

ExploreConst.TAB_NORMAL_COLOR   = cc.c3b(0xd7,0xef,0xff)
ExploreConst.TAB_LIGHT_COLOR    = cc.c3b(0xba,0x55,0x11)


return readOnly(ExploreConst)