--vip_function里ID常量
--@Author:Conley
local VipFunctionIDConst = {}

VipFunctionIDConst.VIP_FUNC_ID_MAIN_STAGE = 1   --主线副本重置次数
VipFunctionIDConst.VIP_FUNC_ID_MONEY_TREE = 3 --摇钱树vip_function的id

VipFunctionIDConst.VIP_FUNC_ID_TRAIN = 11

VipFunctionIDConst.VIP_FUNC_ID_TRAIN_ACTIVE_TIMES = 12 -- 演武次数
VipFunctionIDConst.VIP_FUNC_ID_TRAIN_PASSIVE_TIMES = 13 -- 被演武次数

VipFunctionIDConst.VIP_FUNC_ID_ARENA = 10001 --竞技场vip_function的id

VipFunctionIDConst.GUILD_HELP_GOLD_BUY_COUNT = 10002 --军团援助元宝购买次数

return readOnly(VipFunctionIDConst)
