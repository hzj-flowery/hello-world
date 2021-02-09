--充值常量
--@Author:Conley
local RechargeConst = {}

RechargeConst.VIP_PAY_TYPE_MONTH_CARD = 1 --月卡vip_pay中card_type类型
RechargeConst.VIP_PAY_TYPE_LUXURY_GIFT_PKG = 2 --豪华签到，豪华礼包vip_pay中card_type类型
RechargeConst.VIP_PAY_TYPE_RECHARGE = 0--基本充值
RechargeConst.VIP_PAY_TYPE_JADE = 4--基本充值

return readOnly(RechargeConst)
