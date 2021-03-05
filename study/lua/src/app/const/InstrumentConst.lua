--
-- Author: Liangxu
-- Date: 2017-9-7 14:34:50
-- 神兵常量
local InstrumentConst = {}

InstrumentConst.FLAG = 3

--神兵显示时获取范围的定义
InstrumentConst.INSTRUMENT_RANGE_TYPE_1 = 1 --全范围
InstrumentConst.INSTRUMENT_RANGE_TYPE_2 = 2 --阵位上的宝物

--神兵培养方式的定义
InstrumentConst.INSTRUMENT_TRAIN_ADVANCE = 1 --进阶
InstrumentConst.INSTRUMENT_TRAIN_LIMIT = 2 --界限

--神兵列表显示类型
InstrumentConst.INSTRUMENT_LIST_TYPE1 = 1 --宝物
InstrumentConst.INSTRUMENT_LIST_TYPE2 = 2 --宝物碎片

--神兵界限消耗物品的Key定义
InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1 = 1
InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2 = 2

--神兵界限突破最大等级
InstrumentConst.INSTRUMENT_LIMIT_MAX_LEVEL = 2

InstrumentConst.TRANSFORM_LIMIT_TYPE_0 = 0 --可置换
InstrumentConst.TRANSFORM_LIMIT_TYPE_1 = 1 --无法被选为置换者
InstrumentConst.TRANSFORM_LIMIT_TYPE_2 = 2 --无法被选为目标者
InstrumentConst.TRANSFORM_LIMIT_TYPE_3 = 3 --无法被选为置换者和目标者

InstrumentConst.LIMIT_TEMPLATE_ORANGE = 1   --界限突破橙升红模板
InstrumentConst.LIMIT_TEMPLATE_RED = 2      --界限突破红升金模板

InstrumentConst.LIMIT_ICON_ORANGE_LEVEL_1 = 1      --原生橙色 红色对应界限等级
InstrumentConst.LIMIT_ICON_ORANGE_LEVEL_2 = 2      --原生橙色 金色对应界限等级
InstrumentConst.LIMIT_ICON_RED_LEVEL_1 = 1         --原生红色 金色对应界限等级


return readOnly(InstrumentConst)