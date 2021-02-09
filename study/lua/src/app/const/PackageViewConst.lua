local PackageViewConst = {}

PackageViewConst.TAB_ITEM = 1 --道具
PackageViewConst.TAB_SILKBAG = 2 --锦囊
PackageViewConst.TAB_GEMSTONE = 3 --觉醒材料
PackageViewConst.TAB_EQUIPMENT = 4 --装备
PackageViewConst.TAB_TREASURE = 5 -- 宝物
PackageViewConst.TAB_INSTRUMENT = 6 --神兵
PackageViewConst.TAB_JADESTONE = 7 --玉石
PackageViewConst.TAB_HISTORYHERO = 8 --历代名将
PackageViewConst.TAB_HISTORYHERO_WEAPON = 9 --历代名将武器

PackageViewConst.ITEM_TYPE_DROP = 1 -- drop物品
PackageViewConst.ITEM_TYPE_BOX = 2 -- 宝箱
PackageViewConst.ITEM_TYPE_TOKEN = 3 --令牌/材料
PackageViewConst.ITEM_TYPE_REFINED_STONE = 4 -- 装备精炼石
PackageViewConst.ITEM_TYPE_DEMON = 5 --  降妖令
PackageViewConst.ITEM_TYPE_WUJIANG_UPGRADE = 6 -- 武将升级经验道具
PackageViewConst.ITEM_TYPE_BAOWU_UPGARDE = 7 -- 宝物升级经验道具
PackageViewConst.ITEM_TYPE_GOLD_BOX = 8 -- 黄金宝箱及钥匙
PackageViewConst.ITEM_TYPE_QINTMOB = 9 -- 皇陵残卷
PackageViewConst.ITEM_TYPE_GOD_BEAST_UPGRADE = 10 -- 神兽升级经验道具
PackageViewConst.ITEM_TYPE_RECHARGE = 11 -- 充值激活道具
PackageViewConst.ITEM_TYPE_ACTIVE_VIP_ICON = 12 -- 激活vip图标道具
PackageViewConst.ITEM_TYPE_QINTOMB_ADDTIME = 13 -- 秦皇陵添加时间
PackageViewConst.ITEM_TYPE_SHISHEN_BOX = 14 --
PackageViewConst.ITEM_TYPE_HOMELAND_BUFF = 15 -- 神树祝福类道具
PackageViewConst.ITEM_TYPE_GRAIN_BOX = 16 -- 兵粮宝箱

PackageViewConst.JADE_STONE_TOPBAR_RES = {
    [1] = {type = 5, value = 30},
    [2] = {type = 5, value = 2},
    [3] = {type = 5, value = 1}
}

function PackageViewConst.getItemTypeName(itemType)
    for key, value in pairs(PackageViewConst) do
        if string.find(key, "ITEM_") and value == itemType then
            return key
        end
    end
    return ""
end

return readOnly(PackageViewConst)
