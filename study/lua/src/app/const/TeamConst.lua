--
-- Author: Liangxu
-- Date: 2017-05-27 17:52:31
-- 阵容常量
local TeamConst = {}

TeamConst.STATE_HERO = 1 --开启并且已有上位武将
TeamConst.STATE_OPEN = 2 --开启但没有上位武将
TeamConst.STATE_LOCK = 3 --未开启

TeamConst.PET_POS = 7

return readOnly(TeamConst)