--蛋糕活动常量
local CakeActivityConst = {}
local Config = require("app.config.parameter")

CakeActivityConst.MATERIAL_TYPE_1 = 1 --材料类型1
CakeActivityConst.MATERIAL_TYPE_2 = 2 --材料类型2
CakeActivityConst.MATERIAL_TYPE_3 = 3 --材料类型3

CakeActivityConst.RANK_TYPE_1 = 1 --军团
CakeActivityConst.RANK_TYPE_2 = 2 --个人

--通知样式
CakeActivityConst.NOTICE_TYPE_COMMON = 1 --普通
CakeActivityConst.NOTICE_TYPE_LEVEL_UP = 2 --蛋糕升级
CakeActivityConst.NOTICE_TYPE_GET_FRUIT = 3 --获得水果

--领奖箱
CakeActivityConst.AWARD_STATE_1 = 1 --不可领
CakeActivityConst.AWARD_STATE_2 = 2 --可领
CakeActivityConst.AWARD_STATE_3 = 3 --已领

--任务状态
CakeActivityConst.TASK_STATE_1 = 1 --前往
CakeActivityConst.TASK_STATE_2 = 2 --可领取
CakeActivityConst.TASK_STATE_3 = 3 --已领取

--每日奖励状态
CakeActivityConst.DAILY_AWARD_STATE_0 = 0 --跨天的情况,需要重新拉取数据
CakeActivityConst.DAILY_AWARD_STATE_1 = 1 --已超时
CakeActivityConst.DAILY_AWARD_STATE_2 = 2 --可领取
CakeActivityConst.DAILY_AWARD_STATE_3 = 3 --已领取
CakeActivityConst.DAILY_AWARD_STATE_4 = 4 --未到时间不可领

--活动阶段
CakeActivityConst.ACT_STAGE_0 = 0 --活动未开阶段
CakeActivityConst.ACT_STAGE_1 = 1 --本服活动阶段
CakeActivityConst.ACT_STAGE_2 = 2 --中间等待阶段
CakeActivityConst.ACT_STAGE_3 = 3 --全服活动阶段
CakeActivityConst.ACT_STAGE_4 = 4 --全服活动结束后展示阶段

--蛋糕最大等级
CakeActivityConst.MAX_LEVEL = 10

--排名奖励类型
CakeActivityConst.RANK_AWARD_TYPE_1 = 1 --本服个人
CakeActivityConst.RANK_AWARD_TYPE_2 = 2 --本服军团
CakeActivityConst.RANK_AWARD_TYPE_3 = 3 --跨服个人
CakeActivityConst.RANK_AWARD_TYPE_4 = 4 --跨服军团

--信息保留最大条数
CakeActivityConst.INFO_LIST_MAX_COUNT = tonumber(Config.get(688).content)

CakeActivityConst.CAKE_LOCAL_TIME = tonumber(Config.get(680).content) --本服比赛持续时间（秒）
CakeActivityConst.CAKE_CROSS_TIME = tonumber(Config.get(681).content) --全服比赛持续时间（秒）
CakeActivityConst.CAKE_TIME_GAP = tonumber(Config.get(701).content) --本服比赛和全服比赛间隔（秒）
CakeActivityConst.CAKE_TIME_LEFT = tonumber(Config.get(702).content) --全服蛋糕活动结束后保留时间（秒）

return readOnly(CakeActivityConst)