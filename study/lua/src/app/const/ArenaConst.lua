--竞技场常量数据
local ArenaConst = {}
ArenaConst.BezierDelay = 0.1 --曲线行动起始延迟时间，播放特效用
ArenaConst.BezierYOffset = 450 --曲线高度偏移
ArenaConst.BezierTime = 0.25 --曲线行走时间
ArenaConst.AttackDelay = 0.4 --攻击后延迟时间, 攻击后，表现掉落的时间延迟

-- 竞技场排行榜前4名排名颜色
ArenaConst.RANK_COLOR   = {
    cc.c3b(0xff,0xe3,0xe3),
    cc.c3b(0xfe,0xfa,0xf1),
    cc.c3b(0xfd,0xdd,0xff),
    cc.c3b(0xff,0xee,0xde)
}

return ArenaConst
