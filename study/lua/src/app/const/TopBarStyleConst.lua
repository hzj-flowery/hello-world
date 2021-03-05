--
-- Author: hedl
-- Date: 2017-03-09 13:50:05
-- 顶部条风格
local TopBarStyleConst = {}

--[[
首页特殊	体力	精力	银两	元宝
通用	     战力	银两	元宝	首页	返回
副本相关	体力	银两	元宝	首页	返回
PVP相关	 精力	银两	元宝	首页	返回
活动相关	砖石	银两	元宝
竞技场 	 威望		银两 元宝  首页  返回
抽卡		 招募令	招贤令		元宝
神树家园    战力  神树币   元宝
]]
--第一阵位
TopBarStyleConst.STYLE_MAIN = 1
TopBarStyleConst.STYLE_COMMON = 2
TopBarStyleConst.STYLE_PVE = 3
TopBarStyleConst.STYLE_PVP = 4
TopBarStyleConst.STYLE_ACTIVITY = 5
TopBarStyleConst.STYLE_ARENA = 6
TopBarStyleConst.STYLE_DRAW_CARD = 7
TopBarStyleConst.STYLE_EXPLORE = 8
TopBarStyleConst.STYLE_GUILD = 9
TopBarStyleConst.STYLE_TOWER = 10
TopBarStyleConst.STYLE_CRYSTAL_SHOP = 11
TopBarStyleConst.STYLE_MINE_CRAFT = 12
TopBarStyleConst.STYLE_HOMELAND = 13
TopBarStyleConst.STYLE_TRANSFORM_HERO = 14
TopBarStyleConst.STYLE_TRANSFORM_TREASURE = 15
TopBarStyleConst.STYLE_TRANSFORM_HERO_RED = 16
TopBarStyleConst.STYLE_SEASONSPORT = 17
TopBarStyleConst.STYLE_RUNNING_MAN = 18
TopBarStyleConst.STYLE_HORSE = 19
TopBarStyleConst.STYLE_SERVER_ANSWER = 20
TopBarStyleConst.STYLE_TRANSFORM_INSTRUMENT = 21
TopBarStyleConst.STYLE_GOLD_TRAIN = 22
TopBarStyleConst.STYLE_GOLD_GACHA = 23
TopBarStyleConst.STYLE_QINTOMB = 24
TopBarStyleConst.STYLE_CAKE_ACTIVITY = 25
TopBarStyleConst.STYLE_HANDBOOK = 26
TopBarStyleConst.STYLE_TRANSFORM_HERO_GOLD = 27
TopBarStyleConst.STYLE_SYNTHESIS_TYPE1 = 28
TopBarStyleConst.STYLE_SYNTHESIS_TYPE2 = 29
TopBarStyleConst.STYLE_SYNTHESIS_TYPE3 = 30
TopBarStyleConst.STYLE_CARNIVAL_ACTIVITY = 31
TopBarStyleConst.STYLE_HISTORY_HERO = 32
TopBarStyleConst.STYLE_COMMON2 = 33
TopBarStyleConst.STYLE_MAIN2 = 34
TopBarStyleConst.STYLE_TEN_JADE_AUCTION = 35
TopBarStyleConst.STYLE_RED_PET_ACTIVITY = 36
TopBarStyleConst.STYLE_END = 37


TopBarStyleConst.BG_TYPE_COMMON = 1
TopBarStyleConst.BG_TYPE_STAGE = 2

--------------------------------------------------------------------------

TopBarStyleConst.STYLE_VALUE = {}

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_MAIN] = {
	[1] = {type = 0, value = 0},
	[2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_VIT},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_GOLD},
	[4] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_MAIN2] = {
	[1] = {type = 0, value = 0},
	[2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_VIT},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_GOLD},
    [4] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND},
    [5] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_JADE2}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_COMMON] = {
	[1] = {type = TypeConvertHelper.TYPE_POWER, value = DataConst.RES_POWER},
	[2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_GOLD},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_COMMON2] = {
	[1] = {type = TypeConvertHelper.TYPE_POWER, value = DataConst.RES_POWER},
	[2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_GOLD},
    [3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND},
    [4] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_JADE2}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_GOLD_TRAIN] = {
	[1] = {type = TypeConvertHelper.TYPE_POWER, value = DataConst.RES_POWER},
	[2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_GOLD}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_PVE] = {
	[1] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_VIT},
	[2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_GOLD},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_PVP] = {
	[1] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_SPIRIT},
	[2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_GOLD},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_ACTIVITY] = {
	[1] = {type = TypeConvertHelper.TYPE_POWER, value = DataConst.RES_POWER},
	[2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_GOLD},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_ARENA] = {
	[1] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_MANNA},
	[2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_GOLD},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_DRAW_CARD] = {
	[1] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_RECRUIT_TOKEN},
	[2] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_RECRUIT_GOLD_TOKEN},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_EXPLORE] = {
	[1] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_SPIRIT},
	[2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_GOLD},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_GUILD] = {
	[1] = {type = TypeConvertHelper.TYPE_POWER, value = DataConst.RES_POWER},
	[2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_GONGXIAN},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_TOWER] = {
	[1] = {type = TypeConvertHelper.TYPE_POWER, value = DataConst.RES_POWER},
	[2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_JADE},
	[3] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_EQUIP_STONE}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_CRYSTAL_SHOP] = {
	[1] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_CRYSTAL_SHOP_COIN},
	[2] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_SUPPORT_TICKET},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_MINE_CRAFT] = {
	[1] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_MINE_TOKEN},
	[2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_ARMY_FOOD},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

--神树家园
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_HOMELAND] = {
	[1] = {type = TypeConvertHelper.TYPE_POWER, value = DataConst.RES_POWER},
	[2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_PET},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

--英雄置換
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_TRANSFORM_HERO] = {
	[1] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_TRANSFORM},
	[2] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_TRANSFORM_TOKEN},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

--宝物置換
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_TRANSFORM_TREASURE] = {
	[1] = {type = 0, value = 0},
	[2] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_TRANSFORM},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

--神兵置换
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_TRANSFORM_INSTRUMENT] = {
	[1] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_TRANSFORM},
	[2] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_TRANSFORM_RED},
	[3] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_TRANSFORM_GOLD},
	[4] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

--英雄置换（红将）
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_TRANSFORM_HERO_RED] = {
	[1] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_TRANSFORM_RED},
	[2] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_TRANSFORM_RED_TOKEN},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

--跑男系统
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_RUNNING_MAN] = {
	[1] = {type = 0, value = 0},
	[2] = {type = 0, value = 0},
	[3] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_SUPPORT_TICKET}
}

--战马系统
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_HORSE] = {
	[1] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_HORSE_CLASSICS},
	[2] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_HORSE_WHISTLE},
	[3] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_HORSE_WHISTLE_FRAGMENT}
}

--无差别竞技
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_SEASONSPORT] = {
	[1] = {type = 0, value = 0},
	[2] = {type = 0, value = 0},
	[3] = {type = 0, value = 0}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_SERVER_ANSWER] = {
	[1] = {type = 0, value = 0},
	[2] = {type = 0, value = 0},
	[3] = {type = 0, value = 0}
}

--金将招募
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_GOLD_GACHA] = {
	[1] = {type = 0, value = 0},
	[2] = {type = 0, value = 0},
	[3] = {type = 0, value = 0}
}

--秦皇陵
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_QINTOMB] = {
    [1] = {type = 0, value = 0},
    [2] = {type = 0, value = 0},
    [3] = {type = 0, value = 0}
}

--蛋糕活动
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_CAKE_ACTIVITY] = {
    [1] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_CONTRIBUTION},
    [2] = {type = 0, value = 0},
    [3] = {type = 0, value = 0}
}

--图鉴
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_HANDBOOK] = {
    [1] = {type = 0, value = 0},
    [2] = {type = 0, value = 0},
    [3] = {type = 0, value = 0}
}

--英雄置换（金将）
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_TRANSFORM_HERO_GOLD] = {
	[1] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_TRANSFORM_GOLD},
	[2] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_TRANSFORM_GOLD_TOKEN},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND}
}

--合成官印
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_SYNTHESIS_TYPE1] = {
	[1] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_OFFICE_SEAL_6},
	[2] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_OFFICE_SEAL_7},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_GOLD}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_SYNTHESIS_TYPE2] = {
	[1] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_TRANSFORM_GOLD},
	[2] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_TRANSFORM_GOLD_TOKEN},
	[3] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_GOLD}
}
-- 神树资源合成
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_SYNTHESIS_TYPE3] = {
	[1] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_TREE_1},
	[2] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_TREE_2},
	[3] = {type = TypeConvertHelper.TYPE_ITEM, value = DataConst.ITEM_TREE_3},
	[4] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_GOLD}
}

TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_CARNIVAL_ACTIVITY] = {
	[1] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND},
	[2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_JADE2},
}

--历代名将
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_HISTORY_HERO] = {
    [1] = {type = 0, value = 0},
    [2] = {type = 0, value = 0},
    [3] = {type = 0, value = 0}
}

--跨服拍卖
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_TEN_JADE_AUCTION] = {
    [1] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_JADE2}
}

--红神兽
TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_RED_PET_ACTIVITY] = {
	[1] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_DIAMOND},
    [2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_JADE2}
}
--------------------------------------------------------------------------

--根据类型返回资源组
function TopBarStyleConst.getStyleValue(styleType)
	if styleType and styleType >= TopBarStyleConst.STYLE_MAIN and styleType <= TopBarStyleConst.STYLE_END then
		return TopBarStyleConst.STYLE_VALUE[styleType]
	end
	return nil
end

return readOnly(TopBarStyleConst)
