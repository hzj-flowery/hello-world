-- @Author panhoa
-- @Date 8.17.2018
-- @Role 

local GachaGoldenHeroConst = {}


--GachaGoldenHeroConst.RANK_TYPE1 = 1     -- 总排行榜
--GachaGoldenHeroConst.RANK_TYPE2 = 2     -- 欢乐排行榜

GachaGoldenHeroConst.FLAG_ALIGNMENT_LEFT  = 1   -- 左对齐
GachaGoldenHeroConst.FLAG_ALIGNMENT_RIGHT = 2   -- 右对齐
GachaGoldenHeroConst.FLAG_OWNRANK = "ownRank"
GachaGoldenHeroConst.ITEM_DATA_TYPE = 6
GachaGoldenHeroConst.ITEM_DATA_VALUE = 166
GachaGoldenHeroConst.IS_AUTOLOTTERIED = "isAutoLotteried" -- 是否已经第一次自动弹出


GachaGoldenHeroConst.RANK_CELL_BACKBG = {       -- 排行榜条
    "img_com_dark_board_bg01",
    "img_com_dark_board_bg01c",
}

GachaGoldenHeroConst.DRAW_JOY_BACKBG = {       -- 欢乐抽奖背景
    "img_gold_bg07",
    "img_gold_bg06",
}

GachaGoldenHeroConst.DRAW_JOY_STATE = {       -- 欢乐抽奖中奖状态
    "txt_gold_08",  --中奖
    "txt_gold_04",  --未中奖
}

GachaGoldenHeroConst.DRAW_JOY_ICONTXT = {       -- 欢乐抽奖中奖状态
    "txt_draw_01",  --中奖
    "txt_draw_02",  --未中奖
}


GachaGoldenHeroConst.DRAW_HERO_SPINEEFFECT = {  -- Spine
    "effect1",
    "effect2",
}

GachaGoldenHeroConst.DRAW_HERO_MINGZI = {       -- 名字
    "txt_goldhero_01",
    "txt_goldhero_02",
    "txt_goldhero_03",
    "txt_goldhero_04",
}

GachaGoldenHeroConst.DRAW_HERO_DESC = {         -- 描述
    "txt_goldhero_01b",
    "txt_goldhero_02b",
    "txt_goldhero_03b",
    "txt_goldhero_04b",
}

GachaGoldenHeroConst.DRAW_HERO_DIPAN = {         -- 底盘 
    "img_gold_camp01",
    "img_gold_camp02",
    "img_gold_camp03",
    "img_gold_camp04",
}

GachaGoldenHeroConst.DRAW_HERO_EFFECT = {
    "effect_tujie_huoxingpiao",            -- 特效：2.火星飘
    "effect_jingying_huo",                 -- 特效：3.晶莹火
    "effect_jinjiangzhaomu_huoyan",        -- 特效：1.火焰
}

GachaGoldenHeroConst.JOYBONUS_RANK_BG = {           -- 排行榜底条/奖励底条
    "img_large_ranking01",
    "img_large_ranking02",
    "img_large_ranking03",
    "img_com_board_list02a",
    "img_com_board_list02b",
}


GachaGoldenHeroConst.JOYBONUS_RANKINDEX_BG = {      -- 排行榜旗帜
    "img_qizhi01",
    "img_qizhi02",
    "img_qizhi03",
    "img_qizhi04",
    "img_qizhi05",
}

GachaGoldenHeroConst.JOYBONUS_AWARDINDEX_BG = {      -- 奖励名次底
    "icon_ranking01",
    "icon_ranking02",
    "icon_ranking03",
    "icon_ranking04",  -- [4]此处未用到
}

GachaGoldenHeroConst.JOYBONUS_AWARDINDEX_IDX = {      -- 奖励名次
    "txt_ranking01",
    "txt_ranking02",
    "txt_ranking03",
    "txt_ranking03",   -- [4]此处未用到
}


return readOnly(GachaGoldenHeroConst)