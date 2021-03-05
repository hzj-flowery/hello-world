--数据更新时间相关常量
--@Author:Conley
local TimeConst = {}

TimeConst.RESET_TIME = 4--重置时间凌晨4点
TimeConst.RESET_TIME_12 = 12--重置时间12点
TimeConst.RESET_TIME_24 = 0--重置时间0点

TimeConst.SECONDS_ONE_DAY = 86400--一天的秒数

TimeConst.SECONDS_ONE_WEEK = 604800--一周的秒数

TimeConst.SET_EXPIRE_EXTRA_SECOND = 60--设置过期时间时，在当前时间上额外加的秒数

TimeConst.INDULGE_TIME_01  = 24 * 3600
TimeConst.INDULGE_TIME_02  = 24 * 3600

TimeConst.RESET_TIME_SECOND = 14400--重置时间凌晨4点

TimeConst.RESET_TIME_LIST  = {TimeConst.RESET_TIME,TimeConst.RESET_TIME_12,TimeConst.RESET_TIME_24}


return readOnly(TimeConst)
