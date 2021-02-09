
local CommonConst = {}

CommonConst.BOX_TYPE_COPPER = 1
CommonConst.BOX_TYPE_SILVER = 2
CommonConst.BOX_TYPE_GOLD = 3
CommonConst.BOX_TYPE_PASS = 4

CommonConst.BOX_STATUS_NOT_GET = 0--不可领
CommonConst.BOX_STATUS_CAN_GET = 1--可领取
CommonConst.BOX_STATUS_ALREADY_GET = 2--已领取

CommonConst.TRUE_VALUE = 1 --真值

CommonConst.HERO_TOP_IMAGE_TYPE_INBATTLE = 1 --上阵中
CommonConst.HERO_TOP_IMAGE_TYPE_KARMA = 2 --缘分
CommonConst.HERO_TOP_IMAGE_TYPE_YOKE = 3 --羁绊

CommonConst.TREASURE_TOP_IMAGE_TYPE_YOKE = 1 --宝物羁绊

CommonConst.RECEIVE_HAS = 1 --已领取
CommonConst.RECEIVE_NOT = 0 --没领取


return readOnly(CommonConst)
