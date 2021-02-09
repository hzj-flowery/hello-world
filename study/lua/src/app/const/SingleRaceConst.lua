
local SingleRaceConst = {}

--活动状态
SingleRaceConst.RACE_STATE_NONE = 0 --无活动
SingleRaceConst.RACE_STATE_PRE = 1 --未开始
SingleRaceConst.RACE_STATE_ING = 2 --进行中
SingleRaceConst.RACE_STATE_FINISH = 3 --已结束

SingleRaceConst.LAYER_STATE_MAP = 1 --进程图  
SingleRaceConst.LAYER_STATE_BATTLE = 2 --战斗
SingleRaceConst.LAYER_STATE_CHAMPION = 3 --冠军

SingleRaceConst.MAX_WIN_COUNT = 3 --5局3胜制

SingleRaceConst.RESULT_STATE_NONE = 0 --初始值（未开始）
SingleRaceConst.RESULT_STATE_ING = 1 --进行中
SingleRaceConst.RESULT_STATE_WIN = 2 --胜
SingleRaceConst.RESULT_STATE_LOSE = 3 --负

SingleRaceConst.REPORT_SIDE_1 = 1 --战报双方位置，上方
SingleRaceConst.REPORT_SIDE_2 = 2 --战报双方位置，下方

--每场比赛状态
SingleRaceConst.MATCH_STATE_BEFORE = 1 --比赛之前
SingleRaceConst.MATCH_STATE_ING = 2 --比赛之中
SingleRaceConst.MATCH_STATE_AFTER = 3 --比赛之后

--对战图缩放状态
SingleRaceConst.MAP_STATE_LARGE = 1 --放大状态
SingleRaceConst.MAP_STATE_SMALL = 2 --缩小状态

--
SingleRaceConst.PVPSINGLE_WINNERSHOW = 21 --跨服个人竞技冠军页面展示结束时间
SingleRaceConst.PVPSINGLE_SIGN_DAY = 22 --跨服个人竞技周几几点开
SingleRaceConst.PVPSINGLE_GUESS_START = 40 --跨服个人竞技竞猜开始时间
SingleRaceConst.PVPSINGLE_GUESS_FINISH = 41 --跨服个人竞技竞猜结束时间
SingleRaceConst.PVPSINGLE_REWARD = 42 --奖励预览
SingleRaceConst.PVPSINGLE_CHAT_BEGIN = 46 --跨服个人竞技跨服聊天开始时间
SingleRaceConst.PVPSINGLE_CHAT_END = 47 --跨服个人竞技跨服聊天结束时间

--排行榜数据类型
SingleRaceConst.RANK_DATA_TYPE_1 = 1 --服务器排行榜数据
SingleRaceConst.RANK_DATA_TYPE_2 = 2 --个人排行榜数据
SingleRaceConst.RANK_DATA_TYPE_3 = 3 --本服排行榜数据

--竞猜页签类型
SingleRaceConst.GUESS_TAB_TYPE_1 = 1 --谁会是本次竞技冠军？
SingleRaceConst.GUESS_TAB_TYPE_2 = 2 --哪个服会排名第一？
SingleRaceConst.GUESS_TAB_TYPE_3 = 3 --哪个服会排名垫底？

--每轮时间(秒)
function SingleRaceConst.getIntervalPerRound()
	local num = require("app.config.pvppro_parameter").get(15).content
	return tonumber(num)
end

--最大获胜场数
function SingleRaceConst.getWinMaxNum()
	local num = require("app.config.pvppro_parameter").get(16).content
	return tonumber(num)
end

--下注元宝数
function SingleRaceConst.getBidCost()
	local num = require("app.config.pvppro_parameter").get(17).content
	return tonumber(num)
end

--压中元宝奖励
function SingleRaceConst.getBidReward()
	local num = require("app.config.pvppro_parameter").get(18).content
	return tonumber(num)
end

--根据位置得到轮次
function SingleRaceConst.getRoundWithPosition(position)
	local round = 0
	if position >= 33 and position <= 48 then
		round = 1
	elseif position >= 49 and position <= 56 then
		round = 2
	elseif position >= 57 and position <= 60 then
		round = 3
	elseif position >= 61 and position <= 62 then
		round = 4
	elseif position == 63 then
		round = 5
	end
	return round
end

--根据轮次获得位置区间
function SingleRaceConst.getPositionRegionWithRound(round)
	if round == 1 then
		return {1, 32}
	elseif round == 2 then
		return {33, 48}
	elseif round == 3 then
		return {49, 56}
	elseif round == 4 then
		return {57, 60}
	elseif round == 5 then
		return {61, 62}
	else
		return {63, 63}
	end
end

return readOnly(SingleRaceConst)