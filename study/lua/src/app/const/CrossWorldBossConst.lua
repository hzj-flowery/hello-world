local CrossWorldBossConst = {}

CrossWorldBossConst.BOSS_TYPE_POSITION = 0        -- boss位置
CrossWorldBossConst.ATTACK_TYPE_POSITION = 1      -- 攻击位置
CrossWorldBossConst.NORMAL_TYPE_POSITION = 2      -- 普通玩家站位
CrossWorldBossConst.POZHEN_TYPE_POSITION = 3      -- 破阵攻击玩家站位


CrossWorldBossConst.BOSS_NORMAL_STATE = 0
CrossWorldBossConst.BOSS_CHARGE_STATE = 1
CrossWorldBossConst.BOSS_WEAK_STATE = 2

CrossWorldBossConst.TAB_INDEX_GUILD = 1
CrossWorldBossConst.TAB_INDEX_PERSONAL = 2

CrossWorldBossConst.ACTIVITY_STATE_NULL = 0              -- 活动初始状态
CrossWorldBossConst.ACTIVITY_STATE_RANDOM_MOVE = 1       -- 活动前随机移动状态
CrossWorldBossConst.ACTIVITY_STATE_PREPARE = 2           -- 随机移动结束开始前准备状态
CrossWorldBossConst.ACTIVITY_STATE_BEGIN = 3             -- 活动已开始
CrossWorldBossConst.ACTIVITY_STATE_END = 4               -- 活动结束


CrossWorldBossConst.BOSS_SHIELD_IDLE_EFFECT = 1          -- boss蓄力护盾普通状态
CrossWorldBossConst.BOSS_SHIELD_POZHAO_ATTACK_EFFECT = 2 -- boss蓄力护盾被破招阵营玩家攻击特效
CrossWorldBossConst.BOSS_SHIELD_LEFT_ATTACK_EFFECT = 3   -- boss蓄力护盾被左边玩家攻击特效
CrossWorldBossConst.BOSS_SHIELD_RIGHT_ATTACK_EFFECT = 4  -- boss蓄力护盾被右边玩家攻击特效
CrossWorldBossConst.BOSS_SHIELD_BOOM_EFFECT = 5          -- boss蓄力护盾破招失败爆炸特效
CrossWorldBossConst.BOSS_SHIELD_BREAK_EFFECT = 6          -- boss蓄力护盾破招成功爆炸特效

CrossWorldBossConst.CROSS_BOSS_UI_DAY = 1                -- UI处于白天状态
CrossWorldBossConst.CROSS_BOSS_UI_NIGHT = 2              -- UI处于夜晚状态

CrossWorldBossConst.DRAW_HERO_MINGZI = {       -- 名字
    "txt_goldhero_01",
    "txt_goldhero_02",
    "txt_goldhero_03",
    "txt_goldhero_04",
    "txt_goldhero_05",
    "txt_goldhero_06",
    "txt_goldhero_07",
    "txt_goldhero_08",
}

CrossWorldBossConst.DRAW_HERO_DESC = {         -- 描述
    "txt_goldhero_01b",
    "txt_goldhero_02b",
    "txt_goldhero_03b",
    "txt_goldhero_04b",
    "txt_goldhero_05b",
    "txt_goldhero_06b",
    "txt_goldhero_07b",
    "txt_goldhero_08b",
}

-- 竞技场排行榜前4名排名颜色
CrossWorldBossConst.RANK_COLOR   = {
    cc.c3b(0xff,0xbf,0xae),
    cc.c3b(0xff,0xe5,0xae),
    cc.c3b(0xf8,0x86,0xff),
    cc.c3b(0xff,0xcf,0xab)
}

CrossWorldBossConst.RANK_OUTLINE_COLOR   = {
    cc.c3b(0xc4,0x39,0x10),
    cc.c3b(0xdd,0x88,0x1b),
    cc.c3b(0x79,0x21,0x89),
    cc.c3b(0xb6,0x74,0x3e)
}

return readOnly(CrossWorldBossConst)