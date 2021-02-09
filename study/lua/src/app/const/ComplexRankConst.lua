--综合排行榜常量
--[[
	ID_C2S_GetUserLevelRank = 30500;
	ID_S2C_GetUserLevelRank = 30501;
	ID_C2S_GetUserPowerRank = 30502;
	ID_S2C_GetUserPowerRank = 30503;
	ID_C2S_GetStageStarRank = 30504;
	ID_S2C_GetStageStarRank = 30505;
	ID_C2S_GetTowerStarRank	= 30506;
	ID_S2C_GetTowerStarRank	= 30507;
	ID_C2S_GetRebelArmyHurtRank= 30508;
	ID_S2C_GetRebelArmyHurtRank= 30509;
	ID_C2S_GetRebelArmyGuildHurtRank= 30510;
	ID_S2C_GetRebelArmyGuildHurtRank= 30511;
]]
local ComplexRankConst = {}


ComplexRankConst.USER_LEVEL_RANK = 1
ComplexRankConst.USER_POEWR_RANK = 2
ComplexRankConst.USER_ARENA_RANK = 3
ComplexRankConst.STAGE_STAR_RANK = 4
ComplexRankConst.ELITE_STAR_RANK = 5  --精英副本
ComplexRankConst.TOWER_STAR_RANK = 6 --
ComplexRankConst.USER_GUILD_RANK = 7 --军团
ComplexRankConst.ACTIVE_PHOTO_RANK = 8 -- 名将册
ComplexRankConst.AVATAR_PHOTO_RANK = 9 -- 变身卡图鉴


--排行榜页签列表
ComplexRankConst.RANK_TAB_LIST = {
	{ComplexRankConst.USER_LEVEL_RANK, nil},
	{ComplexRankConst.USER_POEWR_RANK, nil},
	{ComplexRankConst.USER_GUILD_RANK, nil},
	{ComplexRankConst.AVATAR_PHOTO_RANK, FunctionConst.FUNC_AVATAR_PHOTO_RANK},
	{ComplexRankConst.ACTIVE_PHOTO_RANK, nil},
	{ComplexRankConst.USER_ARENA_RANK, nil},
	{ComplexRankConst.STAGE_STAR_RANK, nil},
	{ComplexRankConst.ELITE_STAR_RANK, FunctionConst.FUNC_ELITE_STAR_RANK},
	{ComplexRankConst.TOWER_STAR_RANK, nil},
}

return ComplexRankConst
