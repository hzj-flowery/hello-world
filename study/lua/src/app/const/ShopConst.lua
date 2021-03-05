--商店数据常量
local ShopConst = {}

ShopConst.NORMAL_SHOP = 1 --普通商店id
ShopConst.EQUIP_SHOP = 2 --装备商店id
ShopConst.INSTRUMENT_SHOP = 3 --神兵商店
ShopConst.ARENA_SHOP = 4 --竞技场商店
ShopConst.GUILD_SHOP = 5 --军团商店
ShopConst.HERO_SHOP = 6 --神将商店id
ShopConst.TREASURE_SHOP = 7 --宝物商店id

ShopConst.AVATAR_SHOP = 13 --变身商店
ShopConst.SUIT_SHOP = 14 --套装商店
ShopConst.PET_SHOP = 15
--神兽商店
ShopConst.AWAKE_SHOP = 16
--觉醒商店
ShopConst.LOOKSTAR_SHOP = 17 --观星商店
ShopConst.HORSE_SHOP = 18 --战马商店
ShopConst.SEASOON_SHOP = 19 --赛季商店（无差别
ShopConst.HORSE_CONQUER_SHOP = 21 --训马商店
ShopConst.CAKE_ACTIVE_SHOP = 22 --本服蛋糕商店
ShopConst.ALL_SERVER_GOLDHERO_SHOP = 24 --金将商店
ShopConst.RED_PET_SHOP = 25 -- 红神兽商店
ShopConst.UNIVERSE_RACE_SHOP = 26 --真武战神商店

ShopConst.NORMAL_SHOP_SUB_MONEY = 99 --普通商店 RMB页签

ShopConst.EQUIP_SHOP_SUB_AWARD = 4 --装备商店子标签 奖励页签
ShopConst.ARENA_SHOP_SUB_AWARD = 3 --竞技场商店子标签 奖励页签
ShopConst.ARENA_SHOP_SUB_ITEM = 1 ---竞技场商店子标签

ShopConst.GUILD_SHOP_SUB_ITEM1 = 2 --军团商店子标签
ShopConst.GUILD_SHOP_SUB_ITEM2 = 2 --神兽标签
ShopConst.GUILD_SHOP_SUB_ITEM3 = 3 --军团商店子标签
ShopConst.GUILD_SHOP_SUB_ITEM4 = 4 --军团商店子标签
ShopConst.GUILD_SHOP_SUB_ITEM5 = 5 --军团商店子标签
ShopConst.GUILD_SHOP_SUB_ITEM6 = 6 --军团商店子标签

ShopConst.AWARK_SHOP_SUB_ITEM1 = 1 --觉醒商店子标签
ShopConst.AWARK_SHOP_SUB_ITEM2 = 2 --觉醒商店子标签
ShopConst.AWARK_SHOP_SUB_ITEM3 = 3 --觉醒商店子标签
ShopConst.AWARK_SHOP_SUB_ITEM4 = 4 --觉醒商店子标签

ShopConst.REFRESH_TYPE_FREE = 1
ShopConst.REFRESH_TYPE_TOKEN = 2
ShopConst.REFRESH_TYPE_RES = 3

ShopConst.LIMIT_TYPE_STAR = 1 -- 过关斩将星星数量
ShopConst.LIMIT_TYPE_AREA = 2 -- 竞技场名次
ShopConst.LIMIT_TYPE_GROUP_LEVEL = 3 --军团等级
ShopConst.LIMIT_TYPE_EXPLORE = 4 --通过游历的关卡
ShopConst.LIMIT_TYPE_HARD_ELITE = 5
ShopConst.LIMIT_TYPE_TREE = 8   -- 神树等级限制
--精英副本星数

ShopConst.DEFAULT_SHOP_ENTRANCE = 1 -- 默认商店入口
ShopConst.CRYSTAL_SHOP_ENTRANCE = 2 -- 水晶商店入口

ShopConst.SHOP_TYPE_FIX = 0 -- 固定商店
ShopConst.SHOP_TYPE_RANDOM = 1 -- 随机商店
ShopConst.SHOP_TYPE_ACTIVE = 2 --活动商店

ShopConst.PRICE_TYPE_AND = 1 --花费类型，“和”的关系
ShopConst.PRICE_TYPE_OR = 2 --花费类型，“或”的关系

ShopConst.SHOW_CONTORL_ALL = 0 --所有版本都显示
ShopConst.SHOW_CONTORL_NO_APPSTORE = 1 --送审版本不显示
ShopConst.SHOW_CONTORL_APPSTORE = 2 --送审版本显示

ShopConst.TABL_TYPE_DEFAULT = 0 --默认商店样式
ShopConst.TABL_TYPE_NEW = 1 --新商店样式

ShopConst.SHOP_FIX_LIMIT_RICE   = 111 -- 粮草
ShopConst.SHOP_FIX_LIMIT_ATKCMD = 112 -- 攻击令

-- 商店背景
local Path = require("app.utils.Path")
ShopConst.SHOP_FIX_VIEW_BG = {
    [ShopConst.TABL_TYPE_DEFAULT] = Path.getCommonImage("img_com_board01_large_bg02"),
    [ShopConst.TABL_TYPE_NEW] = Path.getShopBG("shop_bj")
}

-- 商店cell
ShopConst.SHOP_FIX_VIEW_CELL = {
    [ShopConst.TABL_TYPE_DEFAULT] = require("app.scene.view.shop.ShopViewItemCell"),
    [ShopConst.TABL_TYPE_NEW] = require("app.scene.view.shop.ShopViewItemCell2")
}

-- 商店cell的item数量
ShopConst.SHOP_FIX_VEWI_CELL_ITEM_COUNT = {
    [ShopConst.TABL_TYPE_DEFAULT] = 2,
    [ShopConst.TABL_TYPE_NEW] = 4
}

return ShopConst
