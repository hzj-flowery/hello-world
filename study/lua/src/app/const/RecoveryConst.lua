--
-- Author: Liangxu
-- Date: 2017-05-27 16:03:34
-- 回收常量
local RecoveryConst = {}

--回收类型
RecoveryConst.RECOVERY_TYPE_1 = 1 --武将回收
RecoveryConst.RECOVERY_TYPE_2 = 2 --武将重生
RecoveryConst.RECOVERY_TYPE_3 = 3 --装备回收
RecoveryConst.RECOVERY_TYPE_4 = 4 --装备重生
RecoveryConst.RECOVERY_TYPE_5 = 5 --宝物回收
RecoveryConst.RECOVERY_TYPE_6 = 6 --宝物重生
RecoveryConst.RECOVERY_TYPE_7 = 7 --神兵回收
RecoveryConst.RECOVERY_TYPE_8 = 8 --神兵重生
RecoveryConst.RECOVERY_TYPE_9 = 9 --神兽回收
RecoveryConst.RECOVERY_TYPE_10 = 10 --神兽重生
RecoveryConst.RECOVERY_TYPE_11 = 11 --战马回收
RecoveryConst.RECOVERY_TYPE_12 = 12 --战马重生
RecoveryConst.RECOVERY_TYPE_13 = 13 --名将重生
RecoveryConst.RECOVERY_TYPE_14 = 14 --战马装备回收


--回收武将最大数量
RecoveryConst.RECOVERY_HERO_MAX = 5
RecoveryConst.RECOVERY_PET_MAX = 5
--回收装备最大数量
RecoveryConst.RECOVERY_EQUIP_MAX = 5

--回收宝物最大数量
RecoveryConst.RECOVERY_TREASURE_MAX = 5

--回收神兵最大数量
RecoveryConst.RECOVERY_INSTRUMENT_MAX = 5

RecoveryConst.RECOVERY_HORSE_MAX = 5
RecoveryConst.RECOVERY_HORSE_EQUIP_MAX = 5       --战马装备回收最大数量

--回收场景编号
RecoveryConst.RECOVERY_SCENE_ID_1 = 103
RecoveryConst.RECOVERY_SCENE_ID_2 = 105

return readOnly(RecoveryConst)