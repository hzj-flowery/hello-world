--
-- Author: hedl
-- Date: 2018-01-23 15:51:32
-- 跑男常量
local RunningManConst = {}

RunningManConst.START_AVATAR_ZORDER = 250

local RUNNING_Y_OFFSET = 75
local RUNNING_X_OFFSET = 30
RunningManConst.AVATA_INFO1 = 
{
    startPos = cc.p(290+ RUNNING_X_OFFSET*4,147+ RUNNING_Y_OFFSET*4),
    scale = 0.7,
    chatPos = cc.p(40,88),
}
RunningManConst.AVATA_INFO2 =
{
    startPos = cc.p(290+ RUNNING_X_OFFSET*3,147 + RUNNING_Y_OFFSET*3),
    scale = 0.7,
    chatPos = cc.p(40,88),
}
RunningManConst.AVATA_INFO3 = {
    startPos = cc.p(290+ RUNNING_X_OFFSET*2,147 + RUNNING_Y_OFFSET*2),
    scale = 0.7,
    chatPos = cc.p(40,88),
}

RunningManConst.AVATA_INFO4 = {
    startPos = cc.p(290+ RUNNING_X_OFFSET,147 + RUNNING_Y_OFFSET),
    scale = 0.7,
    chatPos = cc.p(40,88),
}

RunningManConst.AVATA_INFO5 =
{
    startPos = cc.p(290,147),
    scale = 0.7,
    chatPos = cc.p(40,88),
}


RunningManConst.RUNNING_STATE_PRE_START = 1--活动尚未开启
RunningManConst.RUNNING_STATE_END = 2 --活动已结束

RunningManConst.RUNNING_STATE_BET = 3--开始并且投注状态
RunningManConst.RUNNING_STATE_WAIT = 4 --投注状态结束，比赛开始等待
RunningManConst.RUNNING_STATE_RUNNING = 5 --投注状态结束，跑步状态
RunningManConst.RUNNING_STATE_RUNNING_END = 6 --跑步状态结束

RunningManConst.RUNNING_MOVE_ACTION_TIME  = 1.5--移动状态
RunningManConst.RUNNING_COST_CASH_VALUE = 50

RunningManConst.RUNNING_ANIMATION_SPEED = 1.2 --跑步动画速度

RunningManConst.BUBBLE_START_TIME_MIN = 1 --开头聊天延迟最小时间
RunningManConst.BUBBLE_START_TIME_MAX = 4 --开头聊天延迟最大时间

RunningManConst.BUBBLE_SHOW_TIME_MIN = 3 --泡泡最小时间
RunningManConst.BUBBLE_SHOW_TIME_MAX = 8 --泡泡最大时间

function RunningManConst.getStateName(stateValue)
    for key, value in pairs(RunningManConst) do
        if string.find(key,"RUNNING_") and value == stateValue then
            return key
        end
    end
    return ""
end

return readOnly(RunningManConst)