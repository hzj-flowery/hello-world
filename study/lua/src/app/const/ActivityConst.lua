--福利活动常量
--@Author:Conley
local ActivityConst = {}

ActivityConst.MONTH_CARD_VIP_PAY_TYPE = 1 --vip_pay 中card_type类型

ActivityConst.ACT_ID_MONTHLY_CARD = 3 --月卡活动id
ActivityConst.ACT_ID_SIGNIN = 1 --签到活动id
ActivityConst.ACT_ID_DINNER = 2 --宴会活动id
ActivityConst.ACT_ID_OPEN_SERVER_FUND = 40 --开服基金活动id
ActivityConst.ACT_ID_LUXURY_GIFT_PKG = 5 --豪华礼包活动id
ActivityConst.ACT_ID_MONEY_TREE = 6 --摇钱树活动id
ActivityConst.ACT_ID_WEEKLY_GIFT_PKG = 7 --周礼包活动id
ActivityConst.ACT_ID_LEVEL_GIFT_PKG = 8 --等级礼包活动id
ActivityConst.ACT_ID_BETA_APPOINTMENT = 9 --公测预约活动id
ActivityConst.ACT_ID_RECHARGE_REBATE = 10 --充值返利活动id
ActivityConst.ACT_ID_RESROUCE_BACK = 11 --资源找回
ActivityConst.ACT_ID_SUPER_CHECKIN = 12 --五谷丰登

ActivityConst.ACT_ID_OPEN_SERVER_FUND_1 = 41 --开服基金活动1
ActivityConst.ACT_ID_OPEN_SERVER_FUND_2 = 42 --开服基金活动2
ActivityConst.ACT_ID_OPEN_SERVER_FUND_3 = 43 --开服基金活动3
ActivityConst.ACT_ID_OPEN_SERVER_FUND_4 = 44 --开服基金活动4
ActivityConst.ACT_ID_OPEN_SERVER_FUND_5 = 45 --开服基金活动5
ActivityConst.ACT_ID_OPEN_SERVER_FUND_6 = 46 --开服基金活动6

ActivityConst.CHECKIN_STATE_WRONG_TIME = 0 --未领取
ActivityConst.CHECKIN_STATE_RIGHT_TIME = 1 --可领取
ActivityConst.CHECKIN_STATE_OVER_TIME = 2 --待补签
ActivityConst.CHECKIN_STATE_PASS_TIME = 3 --已领取
ActivityConst.CHECKIN_STATE_PASS_ALL_TIME = 4 --已领取,并邮件补发VIP奖励

ActivityConst.GIFT_PKG_TYPE_LUXURY = 1 --超值礼包折扣类型
ActivityConst.GIFT_PKG_TYPE_WEEKLY = 2 --每周礼包折扣类型

ActivityConst.SHOW_IN_ALL = 0 --都显示
ActivityConst.SHOW_ONLY_IN_NORMAL = 1 -- 只在正常版本显示
ActivityConst.SHOW_ONLY_IN_APPSTORE = 2 -- 只在送审版本显示
--act_admin表固定参数索引
ActivityConst.ACT_PARAMETER_INDEX_RESIGNIN_COST_GOLD = 1 --宴会重签花费元宝参数
ActivityConst.ACT_PARAMETER_INDEX_LUXURY_GIFT_PKG_MAX_BUY_TIMES = 1 --豪华礼包最大的购买参数

ActivityConst.ACT_DAILY_LIMIT_OPEN_DAY = 24   --每日礼包开服天数

return readOnly(ActivityConst)
