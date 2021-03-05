local FunctionConst	= require("app.const.FunctionConst")
local ChallengeRes = {}

ChallengeRes[FunctionConst.FUNC_ARENA] = 
{
    icon = "img_challenge_battle_bg",
    iconMask = "img_challenge_battle_mask",
    imgName = "img_challenge_battle_txt",
    text = "冲竞技场排名 养最强神将",
    textColor = cc.c3b(0xcd, 0x9c, 0x12),
}

ChallengeRes[FunctionConst.FUNC_DAILY_STAGE] = 
{
    icon = "img_challenge_daily_bg",
    iconMask = "img_challenge_daily_mask",
    imgName = "img_challenge_daily_txt",
    text = "高筑墙 广积粮 缓称王",
    textColor = cc.c3b(0x2f, 0xac, 0xc7),
}

ChallengeRes[FunctionConst.FUNC_PVE_TOWER] = 
{
    icon = "img_challenge_tower_bg",
    iconMask = "img_challenge_tower_mask",
    imgName = "img_challenge_tower_txt",
    text = "战三国英雄 造极品装备",
    textColor = cc.c3b(0xbf, 0x49, 0xa1),
}

ChallengeRes[FunctionConst.FUNC_PVE_SIEGE] = 
{
    icon = "img_challenge_invade_bg",
    iconMask = "img_challenge_invade_mask",
    imgName = "img_challenge_invade_txt",
    text = "战彩云之颠 赢绝世神兵",
    textColor = cc.c3b(0x2d, 0x90, 0xff),
}

ChallengeRes[FunctionConst.FUNC_PVE_TERRITORY] = 
{
    icon = "img_challenge_patrol_bg",
    iconMask = "img_challenge_patrol_mask",
    imgName = "img_challenge_patrol_txt",
    text = "修身齐家 治国平天下",
    textColor = cc.c3b(0x91, 0xc4, 0x23),
}

ChallengeRes[FunctionConst.FUNC_WORLD_BOSS] = 
{
    icon = "img_challenge_boss_bg",
    iconMask = "img_challenge_boss_mask",
    imgName = "img_challenge_boss_txt",
    text = "力战军团BOSS，勇争军团荣耀",
    textColor = cc.c3b(0xa7, 0x54, 0x1a),
}

return ChallengeRes