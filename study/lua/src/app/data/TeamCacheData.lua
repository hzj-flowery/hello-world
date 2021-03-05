--
-- Author: Liangxu
-- Date: 2017-08-10 15:41:03
-- 
local BaseData = require("app.data.BaseData")
local TeamCacheData = class("TeamCacheData", BaseData)

local schema = {}
schema["showHeroTrainFlag"] = {"boolean", false} --记录是否显示武将培养飘字的Flag
schema["showEquipTrainFlag"] = {"boolean", false} --记录是否显示装备培养飘字的Flag
schema["showTreasureTrainFlag"] = {"boolean", false} --记录是否显示宝物培养飘字的Flag
schema["showInstrumentTrainFlag"] = {"boolean", false} --记录是否显示神兵培养飘字的Flag
schema["showHorseTrainFlag"] = {"boolean", false} --记录是否显示战马培养飘字的Flag
schema["showAvatarEquipFlag"] = {"boolean", false} --记录是否显示变身卡穿戴飘字的Flag
schema["showAvatarTrainFlag"] = {"boolean", false} --记录是否显示变身卡培养飘字的Flag
schema["showHistoryHeroFlag"] = {"boolean", false} --记录是否显示历代名将飘字的Flag

TeamCacheData.schema = schema

function TeamCacheData:ctor(properties)
	TeamCacheData.super.ctor(self, properties)
end

function TeamCacheData:reset()

end

function TeamCacheData:clear()

end

return TeamCacheData