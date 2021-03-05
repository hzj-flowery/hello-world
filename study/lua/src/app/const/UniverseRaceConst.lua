
local UniverseRaceConst = {}

--活动状态
UniverseRaceConst.RACE_STATE_NONE = 0 --活动未开启
UniverseRaceConst.RACE_STATE_BREAK = 1 --间歇中
UniverseRaceConst.RACE_STATE_ING = 2 --进行中
UniverseRaceConst.RACE_STATE_CHAMPION_SHOW = 3 --冠军展示阶段

UniverseRaceConst.LAYER_STATE_MAP = 1 --进程图  
UniverseRaceConst.LAYER_STATE_BATTLE = 2 --战斗
UniverseRaceConst.LAYER_STATE_CHAMPION = 3 --冠军
UniverseRaceConst.LAYER_STATE_PAST_CHAMPION = 4 --历代冠军

--每场比赛状态
UniverseRaceConst.MATCH_STATE_BEFORE = 1 --比赛之前
UniverseRaceConst.MATCH_STATE_ING = 2 --比赛之中
UniverseRaceConst.MATCH_STATE_AFTER = 3 --比赛之后

UniverseRaceConst.GUESS_TAB_1 = 1 --单场竞猜
UniverseRaceConst.GUESS_TAB_2 = 2 --串联竞猜
UniverseRaceConst.GUESS_TAB_3 = 3 --单场结果
UniverseRaceConst.GUESS_TAB_4 = 4 --串联结果
UniverseRaceConst.GUESS_TAB_5 = 5 --竞猜排行

--竞猜状态
UniverseRaceConst.GUESS_STATE_1 = 1 --能支持
UniverseRaceConst.GUESS_STATE_2 = 2 --已支持
UniverseRaceConst.GUESS_STATE_3 = 3 --不能支持

--左右边
UniverseRaceConst.SIDE_LEFT = 1
UniverseRaceConst.SIDE_RIGHT = 2

UniverseRaceConst.MAX_WIN_COUNT = 3 --5局3胜制

UniverseRaceConst.RESULT_STATE_NONE = 0 --初始值（未开始）
UniverseRaceConst.RESULT_STATE_ING = 1 --进行中
UniverseRaceConst.RESULT_STATE_WIN = 2 --胜
UniverseRaceConst.RESULT_STATE_LOSE = 3 --负

--竞猜类型
UniverseRaceConst.GUESS_TYPE_1 = 1 --单场竞猜
UniverseRaceConst.GUESS_TYPE_2 = 2 --串联竞猜

--每轮时间(秒)
function UniverseRaceConst.getIntervalPerRound()
	local num = require("app.config.pvpuniverse_parameter").get(7).content
	return tonumber(num)
end

--最大获胜场数
function UniverseRaceConst.getWinMaxNum()
	local num = require("app.config.pvpuniverse_parameter").get(9).content
	return tonumber(num)
end

--进程图关系(见pvpuniverse_group表sheet2)
--从25组开始,前面的要随机生成
--key:ui的节点索引，value:数据中的pos索引
UniverseRaceConst.MAP_RELATION = {
    [25] = 57,
    [26] = 58,
    [27] = 59,
    [28] = 60,
    [29] = 61,
    [30] = 62,
    [31] = 63,
}

--晋级图结构，因为有随机展示的需求，所以构建此结构
UniverseRaceConst.MAP_STRUCTURE = {
    [1] = { --第1分区
        [1] = { --第1轮
            [1] = 33, --ui节点1，对应数据上的pos位33
            [2] = 34, 
        },
        [2] = { --第2轮
            [9] = 41,
            [10] = 42,
        },
        [3] = {
            [17] = 49,
            [18] = 50,
        },
    },
    [2] = { --第2分区
        [1] = {
            [5] = 37, 
            [6] = 38,
        },
        [2] = {
            [13] = 45,
            [14] = 46,
        },
        [3] = {
            [21] = 53,
            [22] = 54,
        },
    },
    [3] = { --第3分区
        [1] = {
            [7] = 39, 
            [8] = 40,
        },
        [2] = {
            [15] = 47,
            [16] = 48,
        },
        [3] = {
            [23] = 55,
            [24] = 56,
        },
    },
    [4] = { --第4分区
        [1] = {
            [3] = 35, 
            [4] = 36,
        },
        [2] = {
            [11] = 43,
            [12] = 44,
        },
        [3] = {
            [19] = 51,
            [20] = 52,
        },
    },
}

--根据轮次获取位置（是UI索引，不是实际位置）
function UniverseRaceConst.getIndexsWithRound(round)
    if round == 1 then
        return {1, 2, 3, 4, 5, 6, 7, 8}
    elseif round == 2 then
        return {9, 10, 11, 12, 13, 14, 15, 16}
    elseif round == 3 then
        return {17, 18, 19, 20, 21, 22, 23, 24}
    elseif round == 4 then
        return {25, 26, 27, 28}
    elseif round == 5 then
        return {29, 30}
    elseif round == 6 then
        return {31}
    else
        return {}
    end
end

UniverseRaceConst.NEXT_INDEX = {
    [1] = 9,
    [2] = 10,
    [3] = 11,
    [4] = 12,
    [5] = 13,
    [6] = 14,
    [7] = 15,
    [8] = 16,
    [9] = 17,
    [10] = 18,
    [11] = 19,
    [12] = 20,
    [13] = 21,
    [14] = 22,
    [15] = 23,
    [16] = 24,
    [17] = 25,
    [18] = 25,
    [19] = 26,
    [20] = 26,
    [21] = 27,
    [22] = 27,
    [23] = 28,
    [24] = 28,
    [25] = 29,
    [26] = 29,
    [27] = 30,
    [28] = 30,
    [29] = 31,
    [30] = 31,
    [31] = 0,
}

function UniverseRaceConst.getLastIndex(index)
    for k, v in pairs(UniverseRaceConst.NEXT_INDEX) do
        if index == v then
            return k
        end
    end
end

return readOnly(UniverseRaceConst)