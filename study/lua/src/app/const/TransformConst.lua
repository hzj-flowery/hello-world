--
-- Author: zhanglinsen
-- Date: 2018-06-29 13:54:11
-- 置换常量
local TransformConst = {}

TransformConst.FLAG = 2

--置换类型
TransformConst.HERO = 1 --置换武将
TransformConst.TREASURE = 2 --置换宝物
TransformConst.INSTRUMENT = 3 --置换神兵


TransformConst.TRANSFORM_NODE_TYPE_SRC = 1 --置换Node类型（被置换对象）
TransformConst.TRANSFORM_NODE_TYPE_TAR = 2 --置换Node类型（目标对象）

return readOnly(TransformConst)