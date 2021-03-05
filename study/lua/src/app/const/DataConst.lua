--数据常量
--目前支持Res类型
local DataConst = {}

--rescource表
DataConst.RES_POWER = -1 --
DataConst.RES_DIAMOND  = 1 --元宝
DataConst.RES_GOLD  = 2 --银币
DataConst.RES_VIT   = 3 --体力
DataConst.RES_SPIRIT = 4 --精力
DataConst.RES_EXP    = 5 --经验
DataConst.RES_VIP    = 6 --VIP经验
DataConst.RES_MANNA  = 7 --威望
DataConst.RES_HONOR  = 8 --功勋
DataConst.RES_SOUL   = 9 --将魂
DataConst.RES_JADE   = 10 --仙玉
DataConst.RES_TOKEN  = 11 --叛军令牌
DataConst.RES_TOWER_COUNT = 12 --爬塔挑战次数
DataConst.RES_GONGXIAN = 13 --军团个人贡献
DataConst.RES_SHENHUN = 14 --神魂
DataConst.RES_SHENBINGZHIHUN = 15 --神兵之魂
DataConst.RES_BAOWUZHIHUN = 17 --宝物之魂
DataConst.RES_GUILD_EXP = 18 --军团经验
DataConst.RES_PET   = 19 --兽魂
DataConst.RES_CRYSTAL_SHOP_COIN = 20 --充值水晶
DataConst.RES_CRYSTAL_SHOP_SCORE = 21 --充值水晶积分
DataConst.RES_ARMY_FOOD = 22 --兵粮
DataConst.RES_MINE_TOKEN = 23   --打架令牌
DataConst.RES_AVATAR_FRAGMENT   = 24 --变身卡碎片
DataConst.RES_BEAT_NUM = 25 --击打数量
DataConst.RES_LOOKSTAR_NUM = 26 --观星次数
DataConst.RES_HORSE_SOUL = 28 --马魂
DataConst.RES_JADE_SOUL = 30 -- 玉魂
DataConst.RES_CONTRIBUTION = 31 -- 贡献值
DataConst.RES_JADE2 = 33 -- 玉璧
DataConst.RES_GUESS = 36 --竞猜币


--item表
DataConst.ITEM_VIT      = 1 --体力丹
DataConst.ITEM_SPIRIT   = 2 --精力丹
DataConst.ITEM_BREAK    = 3 --突破丹
--DataConst.ITEM_ARMY_FOOD    = 4 --粮草令
DataConst.ITEM_REFRESH_TOKEN = 5 --刷新令
DataConst.ITEM_RECRUIT_TOKEN = 6    --招募令
DataConst.ITEM_RECRUIT_GOLD_TOKEN = 7   --招贤令
DataConst.ITEM_TREASURE_REFINE_STONE = 10 --宝物精炼石
DataConst.ITEM_REFINE_STONE_1 = 11 --装备精炼石1
DataConst.ITEM_REFINE_STONE_2 = 12 --装备精炼石2
DataConst.ITEM_REFINE_STONE_3 = 13 --装备精炼石3
DataConst.ITEM_REFINE_STONE_4 = 14 --装备精炼石4
DataConst.ITEM_TOKEN = 15       --南蛮令牌
DataConst.ITEM_EQUIP_STONE = 18 --装备精华
DataConst.ITEM_INSTRUMENT_STONE = 19 --神兵进阶石
DataConst.ITEM_GOLD_KEY      = 20 --黄金钥匙
DataConst.ITEM_GOLD_BOX      = 21 --黄金宝箱
DataConst.ITEM_OFFICE_SEAL_1 = 23 --郡守印
DataConst.ITEM_OFFICE_SEAL_2 = 24 --刺史印
DataConst.ITEM_OFFICE_SEAL_3 = 25 --将军印
DataConst.ITEM_OFFICE_SEAL_4 = 26 --都督印
DataConst.ITEM_OFFICE_SEAL_5 = 27 --帝皇印
DataConst.ITEM_TREE_1 = 505     -- 霖青天水
DataConst.ITEM_TREE_2 = 515     -- 牵铃圣草
DataConst.ITEM_TREE_3 = 535     -- 轮回暝石
DataConst.ITEM_OFFICE_SEAL_6 = 723 --四海印
DataConst.ITEM_OFFICE_SEAL_7 = 724 --六合印
DataConst.ITEM_SUPPORT_TICKET = 33 --支持券
DataConst.ITEM_TRANSFORM = 41 --置换符
DataConst.ITEM_TRANSFORM_TOKEN = 42 --择贤令
DataConst.ITEM_TRANSFORM_RED_TOKEN = 43 --择贤举善令(红将)
DataConst.ITEM_TRANSFORM_RED = 44 --红色置换符
DataConst.ITEM_TRANSFORM_GOLD = 45 --金色置换符
DataConst.ITEM_TRANSFORM_GOLD_TOKEN = 46 --择贤举善令(金将)
DataConst.ITEM_HERO_LEVELUP_MATERIAL_1 = 61 --三年杜康
DataConst.ITEM_HERO_LEVELUP_MATERIAL_2 = 62 --五年杜康
DataConst.ITEM_HERO_LEVELUP_MATERIAL_3 = 63 --十年杜康
DataConst.ITEM_HERO_LEVELUP_MATERIAL_4 = 64 --百年杜康
DataConst.ITEM_TREASURE_LEVELUP_MATERIAL_1 = 71 --宝物升级所需要的道具1
DataConst.ITEM_TREASURE_LEVELUP_MATERIAL_2 = 72 --宝物升级所需要的道具2
DataConst.ITEM_TREASURE_LEVELUP_MATERIAL_3 = 73 --宝物升级所需要的道具3
DataConst.ITEM_TREASURE_LEVELUP_MATERIAL_4 = 74 --宝物升级所需要的道具4

DataConst.ITEM_AVATAR_ACTIVITY_ITEM1 = 83 -- 变身卡活动 道具
DataConst.ITEM_AVATAR_ACTIVITY_ITEM2 = 84 -- 变身卡活动 道具
DataConst.ITEM_AVATAR_ACTIVITY_TOKEN = 85 -- 变身卡活动 币 玄天八卦
DataConst.ITEM_EQUIP_ACTIVITY_TOKEN = 86 --装备活动 币

DataConst.ITEM_PET_LEVELUP_MATERIAL_1 = 28 --初级经验丹
DataConst.ITEM_PET_LEVELUP_MATERIAL_2 = 29 --中级经验丹
DataConst.ITEM_PET_LEVELUP_MATERIAL_3 = 30 --高级经验丹
DataConst.ITEM_PET_LEVELUP_MATERIAL_4 = 31 --稀有经验丹

DataConst.ITEM_COMMON_INSTRUMENT1 = 80 --橙色万能神兵
DataConst.ITEM_COMMON_INSTRUMENT2 = 81 --红色万能神兵
DataConst.ITEM_PET_JINGHUA = 89   -- 神兽精华
DataConst.ITEM_HORSE_CLASSICS = 97 --相马经
DataConst.ITEM_HORSE_WHISTLE = 98 --神马哨
DataConst.ITEM_HORSE_WHISTLE_FRAGMENT = 99 --马哨碎片
DataConst.ITEM_HERO_EXP_BOX = 101 --稀有武将经验竹简礼包
DataConst.ITEM_TREASURE_EXP_BOX = 102 --经验宝物礼盒

DataConst.ITEM_QINTOMB_ADDTIME = 161 --秦皇陵道具
DataConst.ITEM_ADD_VIPEXP = 309 --VIP道具加经验

DataConst.ITEM_RED_PET_JINGHUA = 718   -- 圣灵之息

DataConst.VIP_FUNC_TYPE_STAGE_RESET = 1--主线副本重置
DataConst.VIP_FUNC_TYPE_HERO_BAG = 1--英雄背包数量上限
DataConst.VIP_FUNC_TYPE_EQUIP_BAG = 2--装备背包数量上限
DataConst.VIP_FUNC_TYPE_TREASURE_BAG = 3 --宝物背包数量上限
DataConst.VIP_FUNC_TYPE_ARENA_TIMES = 10001 --竞技场次数

--武将经验竹简
DataConst.HERO_EXP_ITEM_1 = 601 --低级武将经验竹简
DataConst.HERO_EXP_ITEM_2 = 602 --中级武将经验竹简
DataConst.HERO_EXP_ITEM_3 = 603 --高级武将经验竹简
DataConst.HERO_EXP_ITEM_4 = 604 --稀有武将经验竹简

--宝物经验
DataConst.TREASURE_EXP_ITEM_1 = 401 --初级经验宝物
DataConst.TREASURE_EXP_ITEM_2 = 402 --中级经验宝物

--快捷获取装备ID
DataConst.SHORTCUT_EQUIP_ID_1 = 101
DataConst.SHORTCUT_EQUIP_ID_2 = 102
DataConst.SHORTCUT_EQUIP_ID_3 = 103
DataConst.SHORTCUT_EQUIP_ID_4 = 104

--快捷获取宝物ID
DataConst.SHORTCUT_TREASURE_ID_1 = 101
DataConst.SHORTCUT_TREASURE_ID_2 = 111

--快捷获取神兵ID
DataConst.SHORTCUT_INSTRUMENT_ID = 101

-- 快捷获取马具ID
DataConst.SHORTCUT_HORSE_EQUIP_ID_1 = 101
DataConst.SHORTCUT_HORSE_EQUIP_ID_2 = 102
DataConst.SHORTCUT_HORSE_EQUIP_ID_3 = 103

--快捷获取战马ID
DataConst.SHORTCUT_HORSE_ID = 1


DataConst.USER_OP_TYPE_RE_HERO = 1 -- 武将回收
DataConst.USER_OP_TYPE_SIEGE = 2 --南蛮入侵

-- 玉石宝箱
DataConst.JADE_STONE_BOX={
    [701]=1,
    [702]=1,
    [703]=1,
    [704]=1,
    [721]=1,
    [722]=1,
}

function DataConst.getResName(resId)
    for key, value in pairs(DataConst) do
        if string.find(key,"RES_") and value == resId then
            local retName = string.gsub(key,"RES_","")
            return string.lower(retName)
        end
    end
    return ""
end

function DataConst.getItemName(itemId)
    for key, value in pairs(DataConst) do
        if string.find(key,"ITEM_") and value == itemId then
            local retName = string.gsub(key,"ITEM_","")
            return string.lower(retName)
        end
    end
    return ""
end

--根据ResId 获得ItemId
function DataConst.getItemIdByResId(resId)
    for key, value in pairs(DataConst) do
        if string.find(key,"RES_") and value == resId then
            local retName = string.gsub(key,"RES_","")
            local itemName = "ITEM_"..retName

            local itemId = DataConst[itemName]
            return itemId
        end
    end
    return nil
end

--判断是否是官印
function DataConst.isOfficeSeal(redId)
	if redId == DataConst.ITEM_OFFICE_SEAL_1 or
		redId == DataConst.ITEM_OFFICE_SEAL_2 or
		redId == DataConst.ITEM_OFFICE_SEAL_3 or
		redId == DataConst.ITEM_OFFICE_SEAL_4 or
        redId == DataConst.ITEM_OFFICE_SEAL_5 or 
        redId == DataConst.ITEM_OFFICE_SEAL_6 or 
        redId == DataConst.ITEM_OFFICE_SEAL_7 then
			return true
	end
end

return DataConst
