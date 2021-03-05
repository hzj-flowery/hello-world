local HandBookHelper = {}
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

HandBookHelper.TBA_HERO = 1
HandBookHelper.TBA_EQUIP = 2
HandBookHelper.TBA_TREASURE = 3
HandBookHelper.TBA_SILKBAG = 4
HandBookHelper.TBA_HORSE = 5
HandBookHelper.TBA_JADE_STONE = 6
HandBookHelper.TBA_HISTORY_HERO = 7

-- 含有子tab的图鉴子tab数量
HandBookHelper.TAB_LIST = {
    [HandBookHelper.TBA_HERO] = {
        Lang.get("handbook_country_tab1"),
        Lang.get("handbook_country_tab2"),
        Lang.get("handbook_country_tab3"),
        Lang.get("handbook_country_tab4")
    },
    [HandBookHelper.TBA_JADE_STONE] = {
        Lang.get("handbook_jade_tab1"),
        Lang.get("handbook_jade_tab2"),
        Lang.get("handbook_jade_tab3"),
        Lang.get("handbook_jade_tab4"),
        Lang.get("handbook_jade_tab5"),
        Lang.get("handbook_jade_tab6"),
    }
}

-- 图鉴品质色走向
HandBookHelper.COLOR_GO_TO = {
    [HandBookHelper.TBA_HERO] = {begin = 7, ended = 2},
    [HandBookHelper.TBA_EQUIP] = {begin = 7, ended = 2},
    [HandBookHelper.TBA_TREASURE] = {begin = 7, ended = 2},
    [HandBookHelper.TBA_SILKBAG] = {begin = 7, ended = 2},
    [HandBookHelper.TBA_HORSE] = {begin = 6, ended = 2},
    [HandBookHelper.TBA_JADE_STONE] = {begin = 6, ended = 4},
    [HandBookHelper.TBA_HISTORY_HERO] = {begin = 5, ended = 4}
}

-- 含有子tab图鉴view右上角文字前缀
HandBookHelper.TITLE_PREFIX = {
    [HandBookHelper.TBA_HERO] = "handbook_country",
    [HandBookHelper.TBA_JADE_STONE] = "handbook_jade"
}

HandBookHelper.SUB_TAB_VIEW = 1 -- 含有子tab的图鉴view
HandBookHelper.SUB_OTHER_VIEW = 2 -- 不含子tab

-- 图鉴view映射
HandBookHelper.SUB_VIEW_MAPS = {
    [HandBookHelper.TBA_HERO] = HandBookHelper.SUB_TAB_VIEW,
    [HandBookHelper.TBA_EQUIP] = HandBookHelper.SUB_OTHER_VIEW,
    [HandBookHelper.TBA_TREASURE] = HandBookHelper.SUB_OTHER_VIEW,
    [HandBookHelper.TBA_SILKBAG] = HandBookHelper.SUB_OTHER_VIEW,
    [HandBookHelper.TBA_HORSE] = HandBookHelper.SUB_OTHER_VIEW,
    [HandBookHelper.TBA_JADE_STONE] = HandBookHelper.SUB_TAB_VIEW,
    [HandBookHelper.TBA_HISTORY_HERO] = HandBookHelper.SUB_OTHER_VIEW
}

-- 图鉴类型转道具类型
HandBookHelper.TAB_TYPE_TO_ITEM_TYPE = {
    [HandBookHelper.TBA_HERO] = TypeConvertHelper.TYPE_HERO,
    [HandBookHelper.TBA_EQUIP] = TypeConvertHelper.TYPE_EQUIPMENT,
    [HandBookHelper.TBA_TREASURE] = TypeConvertHelper.TYPE_TREASURE,
    [HandBookHelper.TBA_SILKBAG] = TypeConvertHelper.TYPE_SILKBAG,
    [HandBookHelper.TBA_HORSE] = TypeConvertHelper.TYPE_HORSE,
    [HandBookHelper.TBA_JADE_STONE] = TypeConvertHelper.TYPE_JADE_STONE,
    [HandBookHelper.TBA_HISTORY_HERO] = TypeConvertHelper.TYPE_HISTORY_HERO,
}

-- 获取图鉴父tab数量
function HandBookHelper.getHandBookTabList(forceShowFunctionId)
    local tabNameList = {Lang.get("handbook_tab1"), Lang.get("handbook_tab2"), Lang.get("handbook_tab3")}
    local funcList = {HandBookHelper.TBA_HERO, HandBookHelper.TBA_EQUIP, HandBookHelper.TBA_TREASURE}
    if FunctionConst.FUNC_SILKBAG == forceShowFunctionId or LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_SILKBAG) then
        table.insert(tabNameList, Lang.get("handbook_tab4"))
        table.insert(funcList, HandBookHelper.TBA_SILKBAG)
    end
    
    if FunctionConst.FUNC_EQUIP_TRAIN_TYPE3 == forceShowFunctionId or LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) then
        table.insert(tabNameList, Lang.get("handbook_tab6"))
        table.insert(funcList, HandBookHelper.TBA_JADE_STONE)
    end

    if FunctionConst.FUNC_HORSE_BOOK == forceShowFunctionId or LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HORSE_BOOK) then
        table.insert(tabNameList, Lang.get("handbook_tab5"))
        table.insert(funcList, HandBookHelper.TBA_HORSE)
    end

    if FunctionConst.FUNC_HISTORY_HERO == forceShowFunctionId or LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO_HANDBOOK) then
        table.insert(tabNameList, Lang.get("handbook_tab7"))
        table.insert(funcList, HandBookHelper.TBA_HISTORY_HERO)
    end

    return tabNameList, funcList
end

-- 通过index或取图鉴类型
function HandBookHelper.getHandBookTypeByIndex(index, forceShowFunctionId)
    local _, funcList = HandBookHelper.getHandBookTabList(forceShowFunctionId)
    return funcList[index]
end

-- 获取含有子tab图鉴view的子tab列表
function HandBookHelper.getHandBookTabViewTabs(tabType)
    return HandBookHelper.TAB_LIST[tabType]
end

return HandBookHelper
