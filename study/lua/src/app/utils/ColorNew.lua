--
-- Author: liangxu
-- Date: 2017-07-10 16:00:21
--
local ColorNew = {}

--------------new------------------
-----A类：亮底字色
ColorNew.NORMAL_BG_ONE  = cc.c3b(0xb4,0x64,0x14)
ColorNew.BRIGHT_BG_ONE = cc.c3b(0x71, 0x43, 0x06) --核心文字字色
ColorNew.BRIGHT_BG_GREEN = cc.c3b(0x2f, 0x9f, 0x07) --绿色文字字色
ColorNew.BRIGHT_BG_RED = cc.c3b(0xff, 0x00, 0x00) --红色文字字色
---B类：数值类文字
ColorNew.NUMBER_GREEN = cc.c3b(0x82, 0xf1, 0x00)
ColorNew.NUMBER_GREEN_OUTLINE = cc.c4b(0x0b, 0x2e, 0x05, 0xff)
ColorNew.NUMBER_WHITE = cc.c3b(0xff, 0xff, 0xff)
ColorNew.NUMBER_WHITE_OUTLINE = cc.c4b(0x00, 0x00, 0x00, 0xff)
ColorNew.NUMBER_QUALITY = {
    cc.c3b(0xff, 0xff, 0xff),
    cc.c3b(0xff, 0xff, 0xff), --绿色
    cc.c3b(0xff, 0xff, 0xff), --蓝色
    cc.c3b(0xff, 0xff, 0xff), --紫色
    cc.c3b(0xff, 0xff, 0xff), --橙色
    cc.c3b(0xff, 0xff, 0xff), --红色
    cc.c3b(0xff, 0xfc, 0x00), --金色----未提供金色
}

ColorNew.NUMBER_QUALITY_OUTLINE = {
    cc.c4b(0x00, 0x00, 0x00, 0xff),
    cc.c4b(0x49, 0x99, 0x2e, 0xff), --绿色
    cc.c4b(0x00, 0x8f, 0xbf, 0xff), --蓝色
    cc.c4b(0xa6, 0x00, 0xa6, 0xff), --紫色
    cc.c4b(0xe5, 0x8a, 0x2e, 0xff), --橙色
    cc.c4b(0xcc, 0x27, 0x14, 0xff), --红色
    cc.c4b(0xaa, 0x38, 0x00, 0xff), --金色----未提供金色
}
---C类：标题字色
ColorNew.TITLE_ONE = cc.c3b(0x95, 0x57, 0x20)
ColorNew.TITLE_TWO = cc.c3b(0xda, 0xe4, 0xff)
ColorNew.TITLE_THREE = cc.c3b(0xda, 0xe4, 0xff)
---D类：进度条字色
---D类：暗底字色
ColorNew.DARK_BG_OUTLINE = cc.c3b(0xb2, 0x5d, 0x1e)--描边
ColorNew.DARK_BG_THREE = cc.c3b(0xff, 0xcc, 0x00)
---E类：特显字色
ColorNew.OBVIOUS_GREEN = cc.c3b(0xa8, 0xff, 0x00)
ColorNew.OBVIOUS_GREEN_OUTLINE = cc.c3b(0x1e, 0x33, 0x00)
ColorNew.OBVIOUS_YELLOW = cc.c3b(0xfe, 0xe1, 0x02)
ColorNew.OBVIOUS_YELLOW_OUTLINE = cc.c4b(0x77, 0x1f, 0x00, 0xff)
--H类：按钮字色
ColorNew.BUTTON_WHITE = cc.c3b(0xd2, 0x6e, 0x1e) --按钮文字色

ColorNew.BUTTON_ONE_NORMAL = cc.c3b(0x8c, 0x31, 0x00) --普通样式字色

ColorNew.BUTTON_ONE_NOTE = cc.c3b(0xb4, 0x26, 0x00) --强调样式字色
ColorNew.BUTTON_ONE_DISABLE = cc.c3b(0x66, 0x66, 0x66) --禁用样式字色

--七日每日标签文字颜色
ColorNew.DAY7_TAB_BRIGHT = cc.c4b(0xef, 0x76, 0x00, 0xff)
ColorNew.DAY7_TAB_NORMAL = cc.c4b(0xe8, 0xb8, 0x80, 0xff)
ColorNew.DAY7_TAB_BRIGHT_OUTLINE = cc.c4b(0xfa, 0xe9, 0xa9, 0xff)
ColorNew.DAY7_TAB_NORMAL_OUTLINE = cc.c4b(0x6d, 0x00, 0x00, 0xff)

ColorNew.INPUT_PLACEHOLDER = cc.c3b(0xcf, 0xa4, 0x80)

--------------------------------------------------------------------
-----------------------------------------------------------------------
--- todo
-----A类：亮底字色--新规范可能有打字错误，没有次级文字
ColorNew.BRIGHT_BG_TWO = cc.c3b(0xb6, 0x65, 0x11) --次级文字字色
ColorNew.BRIGHT_BG_OUT_LINE_TWO = cc.c4b(0x51, 0x17, 0x00, 0xff)
--D类：暗底字色--无法与新规范对应
ColorNew.DARK_BG_ONE = cc.c3b(0xff, 0xf7, 0xe8) --常规信息字色
ColorNew.DARK_BG_TWO = cc.c3b(0xfc, 0xc5, 0x76) --辅助说明字色
ColorNew.DARK_BG_GREEN = cc.c3b(0x30, 0xd9, 0x21)
ColorNew.DARK_BG_RED = cc.c3b(0xff, 0x00, 0x00)

--F类：系统文字--新规范缺失
ColorNew.SYSTEM_TIP = cc.c3b(0xff, 0xd8, 0x00) --系统提示字色
ColorNew.SYSTEM_TIP_OUTLINE = cc.c4b(0x77, 0x29, 0x09, 0xff) --系统提示描边色
ColorNew.SYSTEM_TARGET = cc.c3b(0x2f, 0x9f, 0x07) --绿色
ColorNew.SYSTEM_TARGET_RED = cc.c3b(0xe0, 0x4b, 0x0a) --红色
--G类品质色--不知道2类该如何对应
ColorNew.COLOR_QUALITY = {
    cc.c3b(0xfa, 0xfa, 0xf2), -- 白色
    cc.c3b(0x2f, 0x9f, 0x07), -- 绿色
    cc.c3b(0x11, 0x7b, 0xde), -- 蓝色
    cc.c3b(0xce, 0x1d, 0xd6), -- 紫色
    cc.c3b(0xf9, 0x7b, 0x00), -- 橙色
    cc.c3b(0xff, 0x00, 0x00), -- 红色
    cc.c3b(0xff, 0xfc, 0x00) -- 金色
}

ColorNew.COLOR_QUALITY_LIGHT = {
    cc.c3b(0xfa, 0xfa, 0xf2), -- 白色
    cc.c3b(0x40, 0xd1, 0x0a), -- 绿色
    cc.c3b(0x1f, 0xb3, 0xf0), -- 蓝色
    cc.c3b(0xff, 0x0e, 0xe5), -- 紫色
    cc.c3b(0xf9, 0x7b, 0x00), -- 橙色
    cc.c3b(0xff, 0x00, 0x00), -- 红色
    cc.c3b(0xff, 0xfc, 0x00) -- 金色
}

ColorNew.COLOR_QUALITY_DARK = {
    cc.c3b(0x58, 0x58, 0x58), -- 白色
    cc.c3b(0x03, 0x82, 0x00), -- 绿色
    cc.c3b(0x00, 0x71, 0xb7), -- 蓝色
    cc.c3b(0x9d, 0x00, 0xa7), -- 紫色
    cc.c3b(0xd5, 0x54, 0x00), -- 橙色
    cc.c3b(0xc6, 0x00, 0x00), -- 红色
    cc.c3b(0xff, 0xfc, 0x00) -- 金色
}

-- 品质色的描边
ColorNew.COLOR_QUALITY_OUTLINE = {
    cc.c4b(0x33, 0x29, 0x1f, 0xff), -- 白色
    cc.c4b(0x21, 0x40, 0x00, 0xff), -- 绿色
    cc.c4b(0x00, 0x1b, 0x4c, 0xff), -- 蓝色
    cc.c4b(0x49, 0x04, 0x57, 0xff), -- 紫色
    cc.c4b(0x5d, 0x29, 0x07, 0xff), -- 橙色
    cc.c4b(0x63, 0x06, 0x06, 0xff), -- 红色
    cc.c4b(0xaa, 0x38, 0x00, 0xff) -- 金色
}
--H类：按钮文字--需确认对应关系

-- ColorNew.BUTTON_WHITE = cc.c3b(0xff, 0xf3, 0xe1) --按钮文字色
--TabIcon文字颜色
ColorNew.TAB_ICON_NORMAL = cc.c3b(0x95, 0xb3, 0xe5)
ColorNew.TAB_ICON_DISABLE = cc.c3b(0x5f, 0x6b, 0xa2)
ColorNew.TAB_ICON_SELECTED = cc.c3b(0xe2, 0x6a, 0x00)
ColorNew.TAB_ICON_NORMAL_OUTLINE = cc.c4b(0x3d, 0x71, 0x11, 0xff)
ColorNew.TAB_ICON_DISABLE_OUTLINE = cc.c4b(0x40, 0x4b, 0x36, 0xff)
ColorNew.TAB_ICON_SELECTED_OUTLINE = cc.c4b(0xd4, 0xf0, 0x86, 0xff)

--领地巡逻
ColorNew.TERRITRY_CITY_NAME = cc.c3b(0xff, 0xf7, 0xe8)
--------------------------------------------------------------------
-----------------------------------------------------------------------




---------------------待具体处理----------------------------------------------
--常规按钮
--一级按钮
-- ColorNew.BUTTON_ONE_NOTE = cc.c3b(0xff, 0xf3, 0xe1) --强调样式字色
ColorNew.BUTTON_ONE_NOTE_OUTLINE = cc.c3b(0xff, 0xc8, 0x68) --强调样式描边色
-- ColorNew.BUTTON_ONE_NORMAL = cc.c3b(0xb4, 0x64, 0x14) --普通样式字色
ColorNew.BUTTON_ONE_NORMAL_OUTLINE = cc.c3b(0xff, 0xee, 0x9b) --普通样式描边色

ColorNew.BUTTON_ONE_DISABLE_OUTLINE = cc.c3b(0xc5, 0xc5, 0xc5) --禁用样式描边色

--二级按钮
ColorNew.BUTTON_TWO_NOTE = cc.c3b(0xff, 0xf3, 0xe1) --强调样式字色
ColorNew.BUTTON_TWO_NOTE_OUTLINE = cc.c3b(0xe0, 0x6a, 0x0d, 0xff) --强调样式描边色
ColorNew.BUTTON_TWO_NORMAL = cc.c3b(0xff, 0xf3, 0xe1) --普通样式字色
ColorNew.BUTTON_TWO_NORMAL_OUTLINE = cc.c3b(0xd7, 0x8a, 0x27, 0xff) --普通样式描边色
ColorNew.BUTTON_TWO_DISABLE = cc.c3b(0xff, 0xf3, 0xe1) --禁用样式字色
ColorNew.BUTTON_TWO_DISABLE_OUTLINE = cc.c3b(0x62, 0x62, 0x62, 0xff) --禁用样式描边色

--三级按钮
ColorNew.BUTTON_THREE_NORMAL = cc.c3b(0x80, 0x4c, 0x0c) --普通样式字色

--页签
--一级页签
ColorNew.TAB_ONE_NORMAL = cc.c3b(0xb8, 0xc9, 0xee) --普通样式字色
ColorNew.TAB_ONE_NORAML_OUTLINE = cc.c3b(0x77, 0x84, 0xb9) --普通样式描边色
ColorNew.TAB_ONE_SELECTED = cc.c3b(0x9f, 0x4d, 0x1b) --选中样式字色
ColorNew.TAB_ONE_SELECTED_OUTLINE = cc.c3b(0xff, 0xed, 0xbd) --选中样式描边色
ColorNew.TAB_ONE_DISABLE = cc.c3b(0xff, 0xf7, 0xe2) --禁用样式字色
ColorNew.TAB_ONE_DISABLE_OUTLINE = cc.c3b(0x62, 0x62, 0x62, 0xff) --禁用样式描边色

--二级页签
ColorNew.TAB_TWO_NORMAL = cc.c3b(0xe8, 0xb8, 0x80) --普通样式字色
ColorNew.TAB_TWO_NORAML_OUTLINE = cc.c3b(0x77, 0x84, 0xb9) --普通样式描边色--暂时没有
ColorNew.TAB_TWO_SELECTED = cc.c3b(0x9d, 0x63, 0x3c) --选中样式字色
ColorNew.TAB_TWO_SELECTED_OUTLINE = cc.c3b(0xf8, 0xf0, 0xd3) --选中样式描边色
ColorNew.TAB_TWO_DISABLE = cc.c3b(0xff, 0xf7, 0xe2) --禁用样式字色
ColorNew.TAB_TWO_DISABLE_OUTLINE = cc.c3b(0x53, 0x4e, 0x4b, 0xff) --禁用样式描边色





--B类：LIST文字
ColorNew.LIST_TEXT = cc.c3b(0x88, 0x44, 0x1b)
ColorNew.LIST_RED = cc.c3b(0xbf, 0x00, 0x00)

--分类
ColorNew.CLASS_TEXT = cc.c3b(0x88, 0x44, 0x1b)
ColorNew.CLASS_WHITE = cc.c3b(0xff, 0xff, 0xff)
ColorNew.CLASS_WHITE_OUTLINE = cc.c4b(0x00, 0x00, 0x00, 0xff)
ColorNew.CLASS_GREEN = cc.c3b(0x9f, 0xf1, 0x00)
ColorNew.CLASS_GREEN_OUTLINE = cc.c4b(0x23, 0x3a, 0x00, 0xff)







--跑马灯颜色
ColorNew.PAOMADENG = cc.c3b(0xff, 0xf7, 0xe5)
ColorNew.PAOMADENG_OUTLINE = cc.c3b(0x49, 0x2a, 0x1b)

ColorNew.CLICK_SCREEN_CONTINUE = cc.c3b(0x78, 0x78, 0x78)



--聊天标签文字颜色
ColorNew.CHAT_TAB_BRIGHT = cc.c3b(0xaf, 0x74, 0x4c)
ColorNew.CHAT_TAB_NORMAL =  cc.c3b(0x98, 0xad, 0xe6)
ColorNew.CHAT_TAB_BRIGHT_OUTLINE = ColorNew.TAB_ONE_SELECTED_OUTLINE
ColorNew.CHAT_TAB_NORMAL_OUTLINE = ColorNew.TAB_ONE_NORAML_OUTLINE
ColorNew.CHAT_MSG = ColorNew.BRIGHT_BG_ONE

--欢庆佳节 tab颜色
ColorNew.CARNIVAL_TAB_BRIGHT = cc.c4b(0xbf, 0x43, 0x01, 0xff)
ColorNew.CARNIVAL_TAB_NORMAL = cc.c4b(0xff, 0xbf, 0x44, 0xff)
ColorNew.CARNIVAL_TAB_BRIGHT_OUTLINE = cc.c4b(0x70, 0x3d, 0x13, 0xff)
ColorNew.CARNIVAL_TAB_NORMAL_OUTLINE = cc.c4b(0x70, 0x3d, 0x13, 0xff)

--领地灰色字体
ColorNew.DRAK_TEXT = cc.c3b(0xca, 0xca, 0xca)
ColorNew.DRAK_TEXT_OUTLINE = cc.c3b(0x2b, 0x2b, 0x2b)

ColorNew.TERRITRY_CITY_NAME = cc.c3b(0xff, 0xf7, 0xe8)
ColorNew.TERRITRY_CITY_NAME_OUTLINE = cc.c3b(0x75, 0x40, 0x1c)

ColorNew.TERRITRY_CITY_NAME_DRAK = cc.c3b(0xda, 0xda, 0xda)
ColorNew.TERRITRY_CITY_NAME_DRAK_OUTLINE = cc.c3b(0x54, 0x54, 0x54)

--世界boss
ColorNew.WORLD_BOSS_RANK_COLOR1 = cc.c3b(0xd7, 0x14, 0x00)
 --排行第一名
ColorNew.WORLD_BOSS_RANK_COLOR2 = cc.c3b(0xc2, 0x48, 0x00)
 --排行第二名
ColorNew.WORLD_BOSS_RANK_COLOR3 = cc.c3b(0x7b, 0x13, 0xbd)
 --排行第三名
ColorNew.WORLD_BOSS_RANK_COLOR4 = cc.c3b(0x70, 0x38, 0x0d)
 --排行第四名

--军团副本排名颜色
ColorNew.GUILD_DUNGEON_RANK_COLOR1 = cc.c3b(0xff, 0x19, 0x19)
 --排行第一名
ColorNew.GUILD_DUNGEON_RANK_COLOR2 = cc.c3b(0xff, 0xc6, 0x19)
 --排行第二名
ColorNew.GUILD_DUNGEON_RANK_COLOR3 = cc.c3b(0xff, 0x00, 0xff)
 --排行第三名
ColorNew.GUILD_DUNGEON_RANK_COLOR4 = cc.c3b(0xff, 0xf7, 0xe8)
 --排行第四名

--三国战记排名颜色
ColorNew.COUNTRY_BOSS_RANK_COLOR1 = cc.c3b(0xff, 0x19, 0x19)
 --排行第一名
ColorNew.COUNTRY_BOSS_RANK_COLOR2 = cc.c3b(0xff, 0xc6, 0x19)
 --排行第二名
ColorNew.COUNTRY_BOSS_RANK_COLOR3 = cc.c3b(0xff, 0x00, 0xff)
 --排行第三名


ColorNew.TAB_NORMAL_TEXT_COLOR = cc.c3b(0xd7, 0xef, 0xff)
ColorNew.TAB_CHOOSE_TEXT_COLOR = cc.c3b(0xba, 0x55, 0x11)


ColorNew.INPUT_CREATE_ROLE = cc.c3b(0xff, 0xff, 0xff)
ColorNew.INPUT_PLACEHOLDER_2 = cc.c3b(0xf5, 0xc5, 0x94)

ColorNew.CUSTOM_ACT_TAB_BRIGHT = cc.c3b(0xce, 0x68, 0x24)
ColorNew.CUSTOM_ACT_TAB_NORMAL = cc.c3b(0x5d, 0x70, 0xa4)
ColorNew.CUSTOM_ACT_TAB_BRIGHT_OUTLINE = cc.c3b(0xef, 0xd4, 0x8c)
ColorNew.CUSTOM_ACT_TAB_NORMAL_OUTLINE = cc.c3b(0x71, 0x19, 0x05)

ColorNew.CUSTOM_ACT_DES_HILIGHT = cc.c3b(0xa8, 0xff, 0x00)
ColorNew.CUSTOM_ACT_DES = cc.c3b(0xff, 0xff, 0xff)
ColorNew.CUSTOM_ACT_DES_OUTLINE = cc.c3b(0x77, 0x1f, 0x00)

--出售文本提示
ColorNew.SELL_TIPS_COLOR_NORMAL = cc.c3b(0xa4, 0x6e, 0x47)
ColorNew.SELL_TIPS_COLOR_HIGHLIGHT = cc.c3b(0xcc, 0x3b, 0x0a)

--军团战
ColorNew.GUILD_WAR_MY_COLOR = cc.c3b(0x2f, 0x9f, 0x07)
ColorNew.GUILD_WAR_MY_COLOR_OUTLINE = cc.c4b(0x21, 0x40, 0x00, 0xff)
ColorNew.GUILD_WAR_SAME_GUILD_COLOR = cc.c3b(0x11, 0x7b, 0xde)
ColorNew.GUILD_WAR_SAME_GUILD_COLOR_OUTLINE = cc.c4b(0x00, 0x1b, 0x4c, 0xff)
ColorNew.GUILD_WAR_ENEMY_COLOR = cc.c3b(0xff, 0x00, 0x00)
ColorNew.GUILD_WAR_ENEMY_COLOR_OUTLINE = cc.c4b(0x63, 0x06, 0x06, 0xff)

ColorNew.GUILD_WAR_NOTICE_ATTACK_COLOR = cc.c3b(0x80, 0xff, 0x0f)
ColorNew.GUILD_WAR_NOTICE_ATTACK_COLOR_OUTLINE = cc.c4b(0x18, 0x36, 0x00, 0xff)

ColorNew.GUILD_WAR_NOTICE_BE_ATTACK_COLOR = cc.c3b(0xff, 0x00, 0x00)
ColorNew.GUILD_WAR_NOTICE_BE_ATTACK_COLOR_OUTLINE = cc.c4b(0x63, 0x06, 0x06, 0xff)

-- 无差别竞技
ColorNew.SEASON_SILKBINDING_TEXT = cc.c3b(0x88, 0x52, 0x26)
ColorNew.SEASON_SILKUNLOCKCONTENT_TEXT = cc.c3b(0xB6, 0x65, 0x11)

-- 手杀联动
ColorNew.THREEKINDOMS_LINKED_REWARD = cc.c3b(0x99, 0x99, 0x99)
ColorNew.THREEKINDOMS_LINKED_REWARDED = cc.c3b(0xa8, 0xff, 0x00)

-- 周基金V2
ColorNew.FUNDSWEEK_V2_NOTGOT = cc.c3b(0xa1, 0x53, 0x00)
ColorNew.FUNDSWEEK_V2_GOT = cc.c3b(0x33, 0x9C, 0x11)

-- 跨服军团战
ColorNew.GUILDCROSSWAR_ATCCOLOR = cc.c3b(0xff, 0xba, 0x00)
ColorNew.GUILDCROSSWAR_ATCCOLOR_OUT = cc.c3b(0x75, 0x24, 0x00)
ColorNew.GUILDCROSSWAR_NOT_ATCCOLOR = cc.c3b(0xe6, 0xe8, 0xfc)
ColorNew.GUILDCROSSWAR_NOT_ATCCOLOR_OUT = cc.c3b(0x1d, 0x21, 0x46)

-- 阵法
ColorNew.BOUT_POINTNAME_COLOR = {
    {cc.c3b(0xff, 0xff, 0xfe), cc.c3b(0xc4, 0xaa, 0x5a)},--normal
    {cc.c3b(0xeb, 0x64, 0x09), cc.c3b(0xf9, 0xe9, 0xaf)},--selected
    {cc.c3b(0xff, 0x66, 0x00), cc.c3b(0xff, 0xeb, 0xbf)},--unlocked
}


-- 新红包名字颜色
ColorNew.NEW_RED_PACKET_NAME_COLOR = cc.c3b(0xff, 0x66, 0x00)

-- 未镶嵌颜色
ColorNew.NO_INJECT_COLOR = cc.c3b(0x75, 0x3b, 0x07)

-- 金将招募
ColorNew.GOLDENHERO_RANK_TOP = {
    cc.c3b(0xff, 0x00, 0x00),
    cc.c3b(0xff, 0xa0, 0x00),
    cc.c3b(0xde, 0x00, 0xff),
    cc.c3b(0xff, 0xff, 0xff),
}

-- 金将招募 Tab
ColorNew.GOLDENHERO_RANK_COLOR_NML = cc.c3b(0xa9, 0x6a, 0x2a)
ColorNew.GOLDENHERO_RANK_COLOR_IMP = cc.c3b(0xfe, 0xad, 0x3a)
ColorNew.GOLDENHERO_TAB_COLOR_NML = cc.c3b(0x88, 0x48, 0x21)
ColorNew.GOLDENHERO_TAB_COLOR_IMP = cc.c3b(0xb0, 0x43, 0x0e)
ColorNew.GOLDENHERO_ACTIVITY_END_NORMAL = cc.c3b(0xff, 0xae, 0x00)

-- 跨服军团战
ColorNew.OBSERVER_GUILD_SELECT = cc.c3b(0xac, 0x44, 0x16)
ColorNew.OBSERVER_GUILD_UNSELECT = cc.c3b(0xdd, 0xb8, 0x8b)


-- 品质色的描边是否显示
ColorNew.COLOR_QUALITY_OUTLINE_SHOW = {
    false, -- 白色
    false, -- 绿色
    false, -- 蓝色
    false, -- 紫色
    false, -- 橙色
    false, -- 红色
    true -- 金色
}

-- 官衔色的描边是否显示
ColorNew.COLOR_OFFICIAL_RANK_OUTLINE_SHOW = {
    false, -- 平民
    false, -- 护军
    false, -- 司马
    false, -- 都尉
    false, -- 校尉
    false, -- 太守
    false, -- 刺史
    false, -- 中郎将
    false, -- 京兆尹
    false, -- 尚书令
    false, -- 卫将军
    false, -- 大都督
    false, -- 大将军
    false, -- 大司徒
    false, -- 大司空
    true, -- 大司马
    true, -- 太尉
}

--官衔色
ColorNew.COLOR_OFFICIAL_RANK = {
    cc.c3b(0x52, 0xcf, 0x25), -- 平民
    cc.c3b(0x61, 0xc6, 0xdc), -- 护军
    cc.c3b(0x58, 0xaa, 0xfe), -- 司马
    cc.c3b(0xff, 0x84, 0xe0), -- 都尉
    cc.c3b(0xff, 0x47, 0xeb), -- 校尉
    cc.c3b(0xf7, 0x3d, 0xff), -- 太守
    cc.c3b(0xc7, 0x77, 0xff), -- 刺史
    cc.c3b(0xff, 0xb7, 0x00), -- 中郎将
    cc.c3b(0xff, 0xaa, 0x00), -- 京兆尹
    cc.c3b(0xf9, 0x7b, 0x00), -- 尚书令
    cc.c3b(0xf9, 0x5e, 0x00), -- 卫将军
    cc.c3b(0xf9, 0x5a, 0x69), -- 大都督
    cc.c3b(0xff, 0x56, 0x40), -- 大将军
    cc.c3b(0xff, 0x3f, 0x1f), -- 大司徒
    cc.c3b(0xff, 0x00, 0x00), -- 大司空
    cc.c3b(0xff, 0xe4, 0x00), -- 大司马
    cc.c3b(0xfc, 0xff, 0x00), -- 太尉
}

ColorNew.COLOR_OFFICIAL_RANK_OUTLINE = {
    cc.c3b(0x23, 0x4c, 0x05), -- 平民
    cc.c3b(0x0b, 0x4c, 0x6d), -- 护军
    cc.c3b(0x0b, 0x42, 0x6d), -- 司马
    cc.c3b(0x79, 0x17, 0x73), -- 都尉
    cc.c3b(0x83, 0x11, 0x82), -- 校尉
    cc.c3b(0x62, 0x13, 0x79), -- 太守
    cc.c3b(0x47, 0x07, 0x5f), -- 刺史
    cc.c3b(0x8a, 0x3e, 0x01), -- 中郎将
    cc.c3b(0x8a, 0x2b, 0x01), -- 京兆尹
    cc.c3b(0x8a, 0x31, 0x01), -- 尚书令
    cc.c3b(0x8a, 0x27, 0x01), -- 卫将军
    cc.c3b(0x89, 0x11, 0x11), -- 大都督
    cc.c3b(0x82, 0x07, 0x07), -- 大将军
    cc.c3b(0x87, 0x0c, 0x0c), -- 大司徒
    cc.c3b(0x82, 0x00, 0x00), -- 大司空
    cc.c3b(0xbd, 0x00, 0x00), -- 大司马
    cc.c3b(0xea, 0x00, 0x00), -- 太尉
}

-- 暴击颜色
ColorNew.crtColors = {
    [1] = {color = cc.c3b(0xfa, 0xfa, 0xf2), outlineColor = cc.c3b(0x55, 0x37, 0x19)},
     --白色
    [2] = {color = cc.c3b(0x2f, 0x9f, 0x07), outlineColor = cc.c3b(0x29, 0x36, 0x03)}, --绿色
    [3] = {color = cc.c3b(0x11, 0x7b, 0xde), outlineColor = cc.c3b(0x25, 0x27, 0x24)},
     -- 蓝色
    [4] = {color = cc.c3b(0x11, 0x7b, 0xde), outlineColor = cc.c3b(0x25, 0x27, 0x24)},
     -- 蓝色
    [5] = {color = cc.c3b(0xf9, 0x7b, 0x00), outlineColor = cc.c3b(0x2e, 0x28, 0x3a)}, --橙色
    [6] = {color = cc.c3b(0xf9, 0x7b, 0x00), outlineColor = cc.c3b(0x2e, 0x28, 0x3a)}, --橙色
    [7] = {color = cc.c3b(0xf9, 0x7b, 0x00), outlineColor = cc.c3b(0x2e, 0x28, 0x3a)}, --橙色
    [8] = {color = cc.c3b(0xf9, 0x7b, 0x00), outlineColor = cc.c3b(0x2e, 0x28, 0x3a)}, --橙色
    [9] = {color = cc.c3b(0xf9, 0x7b, 0x00), outlineColor = cc.c3b(0x2e, 0x28, 0x3a)}, --橙色
    [10] = {color = cc.c3b(0xff, 0x00, 0x00), outlineColor = cc.c3b(0x4e, 0x33, 0x17)} -- 红色
}

--神兽名称品质色
ColorNew.PET_COLORS = {
    cc.c3b(0x2f, 0x9f, 0x07), -- 白 1
    cc.c3b(0x2f, 0x9f, 0x07), -- 绿 2
    cc.c3b(0xef, 0xf8, 0xff), -- 蓝 3
    cc.c3b(0xf9, 0xed, 0xff), -- 紫 4
    cc.c3b(0xff, 0xf7, 0xea), -- 橙 5
    cc.c3b(0xff, 0xff, 0xff), -- 红 6
}

ColorNew.COLOR_GUILD_FLAGS = {
    cc.c3b(0xff, 0xff, 0xff),
    cc.c3b(0xff, 0xff, 0xff),
    cc.c3b(0xff, 0xff, 0xff),
    cc.c3b(0xff, 0xff, 0xff),
    cc.c3b(0xff, 0xff, 0xff),
    cc.c3b(0xff, 0xff, 0xff),
    cc.c3b(0xff, 0xff, 0xff),
    cc.c3b(0xff, 0xff, 0xff),
    cc.c3b(0xff, 0xff, 0xff),
    cc.c3b(0xff, 0xff, 0xff),
    cc.c3b(0xff, 0xff, 0xff),
}

ColorNew.COLOR_GUILD_FLAGS_OUTLINE = {
    cc.c3b(0xa0, 0x04, 0x00),
    cc.c3b(0xd7, 0x42, 0x00),
    cc.c3b(0xe9, 0x94, 0x00),
    cc.c3b(0x2d, 0xba, 0x00),
    cc.c3b(0x00, 0x8d, 0x46),
    cc.c3b(0x00, 0x96, 0x7a),
    cc.c3b(0x15, 0x5b, 0xbb),
    cc.c3b(0x77, 0x00, 0xb3),
    cc.c3b(0xa6, 0x00, 0xb0),
    cc.c3b(0xb4, 0x56, 0x33),
    cc.c3b(0xb4, 0x56, 0x33)
}

ColorNew.COLOR_PIT_NAME = {
    [3] = {color = cc.c3b(0xeb, 0xa4, 0x93), outlineColor = cc.c3b(0x36, 0x02, 0x02)},
    [4] = {color = cc.c3b(0xcd, 0xd8, 0xf6), outlineColor = cc.c3b(0x1e, 0x22, 0x30)},
    [5] = {color = cc.c3b(0xff, 0xe4, 0x00), outlineColor = cc.c3b(0x59, 0x14, 0x02)},
}

--获取神兽品质色
function ColorNew.getPetColor(index)
    assert(ColorNew.PET_COLORS[index], "Invalid color: " .. tostring(index))

    return ColorNew.PET_COLORS[index]
end

--获取官衔色
function ColorNew.getOfficialColor(index)
    assert(ColorNew.COLOR_OFFICIAL_RANK[index + 1], "Invalid color: " .. tostring(index + 1))

    return ColorNew.COLOR_OFFICIAL_RANK[index + 1]
end

--获取官衔色的描边
function ColorNew.getOfficialColorOutline(index)
    assert(ColorNew.COLOR_OFFICIAL_RANK_OUTLINE[index + 1], "Invalid color outline: " .. tostring(index + 1))

    return ColorNew.COLOR_OFFICIAL_RANK_OUTLINE[index + 1]
end

--根据是否显示官衔描边色，获取官衔描边色
--返回nil表示不显示描边色
function ColorNew.getOfficialColorOutlineEx(index)
    local isShow = ColorNew.isOfficialColorOutlineShow(index)
    if isShow then
        return ColorNew.getOfficialColorOutline(index)
    else
        return nil
    end
end

--获取品质色
function ColorNew.getColor(index, isDark)
    assert(ColorNew.COLOR_QUALITY[index], "Invalid color: " .. tostring(index))

    if not isDark then
        return ColorNew.COLOR_QUALITY[index]
    else
        return ColorNew.getDarkColor(index)
    end
end

--获取品质色
function ColorNew.getColorLight(index)
    assert(ColorNew.COLOR_QUALITY_LIGHT[index], "Invalid color: " .. tostring(index))

    return ColorNew.COLOR_QUALITY_LIGHT[index]
end

--获取品质色的描边
function ColorNew.getColorOutline(index)
    assert(ColorNew.COLOR_QUALITY_OUTLINE[index], "Invalid color outline: " .. tostring(index))

    return ColorNew.COLOR_QUALITY_OUTLINE[index]
end

--是否显示品质色的描边
--有些地方需要只显示金色品质的描边，其它品质的描边不显示
function ColorNew.isColorOutlineShow(index)
    assert(ColorNew.COLOR_QUALITY_OUTLINE_SHOW[index] ~= nil, "Invalid color outline show: " .. tostring(index))

    return ColorNew.COLOR_QUALITY_OUTLINE_SHOW[index]
end

--是否显示官衔色的描边
function ColorNew.isOfficialColorOutlineShow(index)
    assert(ColorNew.COLOR_OFFICIAL_RANK_OUTLINE_SHOW[index+1] ~= nil, "Invalid official rank color outline show: " .. tostring(index+1))

    return ColorNew.COLOR_OFFICIAL_RANK_OUTLINE_SHOW[index+1]
end

--readOnly 导致 for循环失败

--获取数值类文字品质色
function ColorNew.getNumberColor(index)
    assert(ColorNew.NUMBER_QUALITY[index], "ColorNew.getNumberColor Invalid color: " .. tostring(index))
    return ColorNew.NUMBER_QUALITY[index]
end

--获取数值类文字品质色描边
function ColorNew.getNumberColorOutline(index)
    assert(ColorNew.NUMBER_QUALITY_OUTLINE[index], "ColorNew.getNumberColorOutline Invalid color: " .. tostring(index))
    return ColorNew.NUMBER_QUALITY_OUTLINE[index]
end

--转换服务器的颜色数据成客户端显示颜色
function ColorNew.getColorsByServerColorData(colorType, colorValue)
    local RollNoticeConst = require("app.const.RollNoticeConst")
    if not colorType or not colorValue then
        return nil, nil
    end
    if colorType == RollNoticeConst.NOTICE_COLOR_COLOR then
        return colorValue
    elseif colorType == RollNoticeConst.NOTICE_COLOR_USER then
        return Colors.getOfficialColor(colorValue), Colors.getOfficialColorOutline(colorValue)
    elseif colorType == 2 then
        return Colors.getColor(colorValue), Colors.getColorOutline(colorValue)
    elseif colorType == RollNoticeConst.NOTICE_COLOR_EQUIPMENT then
        return Colors.getColor(colorValue), Colors.getColorOutline(colorValue)
    end
end

--排名变化的后一种颜色，描边
function ColorNew.getRankColor2()
    return Colors.CLASS_GREEN, Colors.CLASS_GREEN_OUTLINE
end

--暴击字体颜色
function ColorNew.getCritPromptColor(crt)
    local colorData = Colors.crtColors[crt]
    if not colorData then
        colorData = Colors.crtColors[#Color.crtColors]
    end
    return colorData.color
end

--暴击字体描边颜色
function ColorNew.getCritPromptColorOutline(crt)
    local colorData = Colors.crtColors[crt]
    if not colorData then
        colorData = Colors.crtColors[#Color.crtColors]
    end
    return colorData.outlineColor
end

--获取军团旗帜上军团名称颜色
function ColorNew.getGuildFlagColor(index)
    assert(ColorNew.COLOR_GUILD_FLAGS[index], "guild flag Invalid color: " .. tostring(index))

    return ColorNew.COLOR_GUILD_FLAGS[index]
end

--获取军团旗帜上军团名称轮廓色
function ColorNew.getGuildFlagColorOutline(index)
    assert(ColorNew.COLOR_GUILD_FLAGS_OUTLINE[index], "guild flag  Invalid color outline: " .. tostring(index))

    return ColorNew.COLOR_GUILD_FLAGS_OUTLINE[index]
end

return ColorNew --readOnly(ColorNew)
