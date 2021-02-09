-- Author: nieming
-- Date:2018-04-13 11:28:58
-- Describle：

local BaseData = require("app.data.BaseData")
local DailyCountData = class("DailyCountData", BaseData)

local schema = {}
schema["daily_count"] = {"table", {}}
--schema
DailyCountData.schema = schema


DailyCountData.DAILY_RECORD_RECRUIT_NORMAL_CNT                 = 1  --普通招募次数
DailyCountData.DAILY_RECORD_RECRUIT_GOLD_CNT                   = 2  --元宝招募次数
DailyCountData.DAILY_RECORD_NORMAL_CHAPTER_VICTORY_CNT         = 3  --围剿叛军触发后主线副本胜利次数
DailyCountData.DAILY_RECORD_RECRUIT_NORMAL_CNT_CHARGE          = 4  --普通招募不免费次数
DailyCountData.DAILY_RECORD_RECRUIT_GOLD_CNT_CHARGE            = 5  --元宝招募不免费次数
DailyCountData.DAILY_RECORD_TERRITORY_HELP_REPRESS_COUNT       = 6  --今天协助镇压暴动次数
DailyCountData.DAILY_RECORD_TOWER_SUPER_CNT                    = 7  --爬塔精英次数
DailyCountData.DAILY_RECORD_HERO_STAGE_CNT                     = 8  --名将副本挑战次数
DailyCountData.DAILY_RECORD_FRIEND_GIFT_CNT                    = 9  --好友精力领取次数
DailyCountData.DAILY_RECORD_AVATAR_ACTVITY_CNT                 = 10 --变身卡活动免费次数
DailyCountData.DAILY_RECORD_CHAT_CNT                 		   = 12 --世界频道聊天限制
DailyCountData.DAILY_RECORD_HOME_TREE_AWARD              	   = 13 --神树领取次数
DailyCountData.DAILY_RECORD_HOME_TREE_PRAY              	   = 19 --神树祈福次数

function DailyCountData:ctor(properties)
	DailyCountData.super.ctor(self, properties)

	self._signalRecvGetDailyCount = G_NetworkManager:add(MessageIDConst.ID_S2C_GetDailyCount, handler(self, self._s2cGetDailyCount))

end

function DailyCountData:clear()
	self._signalRecvGetDailyCount:remove()
	self._signalRecvGetDailyCount = nil

end

function DailyCountData:reset()

end
-- Describle：
function DailyCountData:_s2cGetDailyCount(id, message)
	self:setProperties(message)
	G_SignalManager:dispatch(SignalConst.EVENT_GET_DAILY_COUNT_SUCCESS)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACTIVITY)
end

function DailyCountData:getCountById(id)
	local counts = self:getDaily_count()
	for k ,v in pairs(counts)do
		if v.key == id then
			return v.value
		end
	end
	return 0
end

return DailyCountData
