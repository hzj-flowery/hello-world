local HistoryHeroConst = {}
local FunctionConst	= require("app.const.FunctionConst")


HistoryHeroConst.LIST_TYPE1 = 1 --历代名将
HistoryHeroConst.LIST_TYPE2 = 2 --名将碎片
HistoryHeroConst.LIST_TYPE3 = 3 --武器
HistoryHeroConst.LIST_TYPE4 = 4 --武器碎片

HistoryHeroConst.BREAK_STATE_0    = 0 -- 名将突破：1.不可突破
HistoryHeroConst.BREAK_STATE_1    = 1 -- 名将突破：2.可突破

HistoryHeroConst.TAB_TYPE_HERO    = 0   -- 名将（名将主界面）
HistoryHeroConst.TAB_TYPE_DETAIL  = 1   -- 详情
HistoryHeroConst.TAB_TYPE_AWAKE   = 2   -- 觉醒
HistoryHeroConst.TAB_TYPE_BREAK   = 3   -- 突破
HistoryHeroConst.TAB_TYPE_REBORN  = 4   -- 重生（重生）

HistoryHeroConst.TYPE_EQUIP_0     = 0   -- 更换：1.不存在：Normal 
HistoryHeroConst.TYPE_EQUIP_1     = 1   -- 更换：2.存在：同位置
HistoryHeroConst.TYPE_EQUIP_2     = 2   -- 更换：3.存在：不同位置

HistoryHeroConst.QUALITY_PURPLE   = 4   -- 紫色品质
HistoryHeroConst.QUALITY_ORANGE   = 5   -- 橙色品质

HistoryHeroConst.DEFAULT_HISTORY_HERO_ID = 101   -- 默认历代名将id


HistoryHeroConst.SQUADITEM_WIDTH = 90         -- 上阵坑位宽
HistoryHeroConst.EQUIPVIEW_OFFSETWIDTH = 470  -- 详情/觉醒/突破视窗偏移  

HistoryHeroConst.TYPE_MAINICON = {           -- 名将主界面左下角图标
    FunctionConst.FUNC_HISTORY_FORMATION,
    FunctionConst.FUNC_HISTORY_WEAPON_LIST,
}

HistoryHeroConst.MAX_STEP_MATERIAL = 3


HistoryHeroConst.TYPE_BREAKTHROUGH_POS_1 = { -- 突破位置：1.一位
    cc.p(0, 355)
}

HistoryHeroConst.TYPE_BREAKTHROUGH_POS_2 = { -- 突破位置：2.两位
    cc.p(-93.5, 355), cc.p(92, 355)
}

HistoryHeroConst.TYPE_BREAKTHROUGH_POS_3 = { -- 突破位置：3.三位
    cc.p(0, 355), cc.p(-94, 335), cc.p(94, 335)
}

HistoryHeroConst.TYPE_BREAKTHROUGH_POS = { --各个状态的节点位置 从moving中smoving_lidaimingjiang读
    avalon = {
        open = cc.p(417.35, -205.85),
        close = cc.p(417.35, -113.90)
    },
    sword = {
        open = cc.p(417.35, 26.25),
        close = cc.p(417.35, -19.25)
    },
    icon1 = {
        open = cc.p(314.1, 82.85),
        close = cc.p(314.1, 82.85)
    },
    icon2 = {
        open = cc.p(416.9, 103.25),
        close = cc.p(416.9, 103.25)
    },
    icon3 = {
        open = cc.p(519.7, 82.85),
        close = cc.p(519.7, 82.85)
    }
}


return readOnly(HistoryHeroConst)