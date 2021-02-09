--UI相关常量
--
local UIConst = {}

--特效X轴偏移量
--全面屏适配时，UI调整，之前的特效会有位移偏差
--用此参数修正偏移
UIConst.EFFECT_OFFSET_X = -50

UIConst.SUMMARY_OFFSET_X_TEAM = -130 --阵容界面飘字偏移量
UIConst.SUMMARY_OFFSET_X_YOKE = 50 --阵容援军飘字偏移量
UIConst.SUMMARY_OFFSET_X_TRAIN = -210 --培养界面飘字偏移量
UIConst.SUMMARY_OFFSET_X_AVATAR = -220 --变身卡界面飘字偏移量
UIConst.SUMMARY_OFFSET_X_SILKBAG = -120 --锦囊界面飘字偏移量
UIConst.SUMMARY_OFFSET_X_TACTICS = -120 --战法界面飘字偏移量

UIConst.SUMMARY_OFFSET_X_ATTR = -70 --属性飘字相对正常飘字额外的偏移量

UIConst.SUMMARY_OFFSET_X_JADE = -60--玉石界面飘字偏移量

UIConst.SUMMARY_OFFSET_X_GOLD = 30--玉石界面飘字偏移量
UIConst.SUMMARY_OFFSET_X_HISTORYHERO = -50--历代名将飘字偏移量
UIConst.SUMMARY_OFFSET_X_BOUT = -50--阵法飘字偏移量


return readOnly(UIConst)
