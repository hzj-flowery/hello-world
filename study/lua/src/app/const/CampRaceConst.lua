local CampRaceConst = {}

CampRaceConst.STATE_PRE_OPEN = 0     --未开赛
CampRaceConst.STATE_PRE_MATCH = 1    --预赛
CampRaceConst.STATE_PLAY_OFF = 2     --8强季后赛

CampRaceConst.PLAY_OFF_ROUND1 = 1       --季后赛第一轮 （对应协议的final_status）
CampRaceConst.PLAY_OFF_ROUND2 = 2       --季后赛第二轮
CampRaceConst.PLAY_OFF_ROUND3 = 3       --季后赛第三轮
CampRaceConst.PLAY_OFF_ROUND_ALL = 4       --季后赛全部

CampRaceConst.SIGNIN_NOT_OPEN = 1       --没有开启报名
CampRaceConst.SIGNIN_OPEN = 2           --已经开启报名

CampRaceConst.ROUND_POSITION_IN_MATCH = 
{
    [CampRaceConst.PLAY_OFF_ROUND1] = {1, 2, 3, 4, 5, 6, 7, 8},
    [CampRaceConst.PLAY_OFF_ROUND2] = {9, 10, 11, 12},
    [CampRaceConst.PLAY_OFF_ROUND3] = {13, 14},
    [CampRaceConst.PLAY_OFF_ROUND_ALL] = {15}
}

CampRaceConst.PVP_PRO_PRE_CONST = 9
CampRaceConst.PVP_PRO_FINAL_CONST = 10
--开启报名相关
CampRaceConst.PVP_PRO_SIGNIN_OPEN_DAY = 1
CampRaceConst.PVP_PRO_SIGNIN_OPEN_TIME = 2
--开启
CampRaceConst.PVP_PRO_OPEN_DAY = 4
CampRaceConst.PVP_PRO_OPEN_TIME = 5

-- [11] = {11,"pvppro_bid_cost","50",},
-- [12] = {12,"pvppro_bid_reward","200",},
--赌博相关
CampRaceConst.PVP_PRO_BID_COST = 11
CampRaceConst.PVP_PRO_BID_REWARD = 12 

--比赛状态
CampRaceConst.MATCH_STATE_BEFORE = 1 --比赛之前
CampRaceConst.MATCH_STATE_ING = 2 --比赛之中
CampRaceConst.MATCH_STATE_AFTER = 3 --比赛之后

return readOnly(CampRaceConst)