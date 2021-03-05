-- 红包雨常量
local RedPacketRainConst = {}
local Config = require("app.config.parameter_redpacket_rain")

RedPacketRainConst.TYPE_BIG = "BIG_RED_PACKET" --大红包
RedPacketRainConst.TYPE_SMALL = "SMALL_RED_PACKET" --小红包

--红包结果
RedPacketRainConst.RESULT_TYPE_1 = 1 --有元宝
RedPacketRainConst.RESULT_TYPE_2 = 2 --空
RedPacketRainConst.RESULT_TYPE_3 = 3 --被抢走

--提前多久出图标
RedPacketRainConst.TIME_PRE_SHOW_ICON = tonumber(Config.get(1).content)
--开始倒计时（秒）
RedPacketRainConst.TIME_PRE_START = 3 --tonumber(Config.get(2).content)
--结束倒计时（秒）
RedPacketRainConst.TIME_PRE_FINISH = tonumber(Config.get(4).content)
--持续时间（秒）
RedPacketRainConst.TIME_PLAY = tonumber(Config.get(3).content)
--红包消失时间
RedPacketRainConst.TIME_DISAPPEAR = tonumber(Config.get(5).content)

--红包雨状态
RedPacketRainConst.RAIN_STATE_PRE = 1 --未开始
RedPacketRainConst.RAIN_STATE_ING = 2 --进行中
RedPacketRainConst.RAIN_STATE_FINISH = 3 --结束


return readOnly(RedPacketRainConst)