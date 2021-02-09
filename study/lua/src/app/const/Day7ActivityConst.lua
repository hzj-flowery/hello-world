--7天活动常量
--@Author:Conley
local Day7ActivityConst = {}

Day7ActivityConst.ACTIVITY_TYPE_1 = 1      --7日活动
Day7ActivityConst.ACTIVITY_TYPE_2 = 2     --14日活动

--任务id前缀	
Day7ActivityConst.TASK_PREV = "task_"
Day7ActivityConst.SHOP_PREV = "shop_"
Day7ActivityConst.SELL_PREV = "sell_"

Day7ActivityConst.TASK_TYPE_LOGIN_REWARD = 1--任务类型－登陆奖励
Day7ActivityConst.TASK_TYPE_ARENA = 8--竞技场任务类型


Day7ActivityConst.REWARD_TYPE_ALL = 1--奖励类型－全部奖励
Day7ActivityConst.REWARD_TYPE_SELECT = 2--奖励类型－选择一个

Day7ActivityConst.TASK_REWARD_ITEM_MAX = 4  --任务列表中最多允许道具个数  与days7_activity_info.type_4对应  
Day7ActivityConst.DAY_NUM = 7--总天数
Day7ActivityConst.MAX_SUB_TAB_NUM = 4--最大子页签数 
Day7ActivityConst.TAB_TYPE_TASK = 1--页签类型,任务
Day7ActivityConst.TAB_TYPE_DISCOUNT = 2--页签类型，折扣商品

Day7ActivityConst.BG_IMG_ARR = {"img_background1","img_background2","img_background2","img_background2","img_background2","img_background2","img_background2"}--7天背景图数组



return readOnly(Day7ActivityConst)