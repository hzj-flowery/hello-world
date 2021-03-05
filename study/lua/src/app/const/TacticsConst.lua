local TacticsConst = {}

-- TacticsConst.STATE_LOCK = 1 --未解锁
-- TacticsConst.STATE_OPEN = 2 --已解锁
-- TacticsConst.STATE_WEAR = 3 --已装备

TacticsConst.SLOT_MAX = 3 --位置最大数

TacticsConst.SUIT_TYPE_NONE = 0         --适应类型，无
TacticsConst.SUIT_TYPE_JOINT = 996      -- 适应类型，合击武将
TacticsConst.SUIT_TYPE_FEMALE = 997     --适应类型，女武将
TacticsConst.SUIT_TYPE_MALE = 998       --适应类型，男武将
TacticsConst.SUIT_TYPE_ALL = 999        --适应类型，全武将

-- tactics_parameter 字段id
TacticsConst.PARAM_UNLCOK_2 = "tactics_2_unlock"
TacticsConst.PARAM_UNLCOK_3 = "tactics_3_unlock"

-- 战法位最大值
TacticsConst.MAX_POSITION = 3
-- 熟练度最大值
TacticsConst.MAX_PROFICIENCY = 1000

-- 获取战法列表类型
TacticsConst.GET_LIST_TYPE_ALL = 0      -- 所有
TacticsConst.GET_LIST_TYPE_UNLCOK = 1   -- 解锁
TacticsConst.GET_LIST_TYPE_STUDIED = 2  -- 可装备


local Path = require("app.utils.Path")
-- 战法背景
TacticsConst.ICON_COLOR_PATH_5 = Path.getUICommonFrame("img_tactis_kuang01")
TacticsConst.ICON_COLOR_PATH_6 = Path.getUICommonFrame("img_tactis_kuang02")
TacticsConst.ICON_COLOR_PATH_7 = Path.getUICommonFrame("img_tactis_kuang03")

-- 战法界面顶部颜色
TacticsConst.TOP_ITEM_COLOR_5 = Path.getTacticsImage("img_tactis_title02a")
TacticsConst.TOP_ITEM_COLOR_6 = Path.getTacticsImage("img_tactis_title02b")
TacticsConst.TOP_ITEM_COLOR_7 = Path.getTacticsImage("img_tactis_title02c")
-- 战法界面页签颜色
TacticsConst.TAB_COLOR_5_1 = Path.getTacticsImage("bt_tactis_pinzhi01")
TacticsConst.TAB_COLOR_5_2 = Path.getTacticsImage("bt_tactis_pinzhi01b")
TacticsConst.TAB_COLOR_6_1 = Path.getTacticsImage("bt_tactis_pinzhi02")
TacticsConst.TAB_COLOR_6_2 = Path.getTacticsImage("bt_tactis_pinzhi02b")
TacticsConst.TAB_COLOR_7_1 = Path.getTacticsImage("bt_tactis_pinzhi03")
TacticsConst.TAB_COLOR_7_2 = Path.getTacticsImage("bt_tactis_pinzhi03b")
-- 是否可解锁
TacticsConst.UNLOCK_STATE_YES = Path.getTextTactics("txt_tactis_01")   -- 可以解锁
TacticsConst.UNLOCK_STATE_NO = Path.getTextTactics("txt_tactis_02")    -- 不能解锁

TacticsConst.UI_LIST_COL_NUM = 5

TacticsConst.STATE_LOCK_LEVEL = 0
TacticsConst.STATE_LOCK = 1
TacticsConst.STATE_EMPTY = 2
TacticsConst.STATE_WEARED = 3

TacticsConst.CELLITEM_NUM = 5


return readOnly(TacticsConst)