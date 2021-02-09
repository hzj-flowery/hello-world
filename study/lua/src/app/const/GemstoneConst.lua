--
-- Author: Liangxu
-- Date: 2017-10-19 10:00:02
-- 宝石常量
local GemstoneConst = {}

--宝石的状态
GemstoneConst.EQUIP_STATE_1 = 1 --可装备
GemstoneConst.EQUIP_STATE_2 = 2 --已装备
GemstoneConst.EQUIP_STATE_3 = 3 --可合成
GemstoneConst.EQUIP_STATE_4 = 4 --无道具
GemstoneConst.EQUIP_STATE_5 = 5 --上锁

return readOnly(GemstoneConst)