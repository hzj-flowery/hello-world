-- Author: nieming
-- Date:2018-04-09 14:03:16
-- Describle：

local BaseData = require("app.data.BaseData")
local ActivitySuperCheckinData = class("ActivitySuperCheckinData", BaseData)
local ActivityConst = require("app.const.ActivityConst")
local ActivityBaseData = import(".ActivityBaseData")
local schema = {}
schema["baseActivityData"] 	= {"table", {}}--基本活动数据
schema["lastCheckinIndexs"] = {"table", {}}
schema["lastCheckinTime"] = {"number", 0}
ActivitySuperCheckinData.schema = schema


function ActivitySuperCheckinData:ctor(properties)
	ActivitySuperCheckinData.super.ctor(self, properties)
	local activityBaseData = ActivityBaseData.new()
	activityBaseData:initData({id = ActivityConst.ACT_ID_SUPER_CHECKIN  })
	self:setBaseActivityData(activityBaseData)

	self._signalRecvGetActCheckinSuper = G_NetworkManager:add(MessageIDConst.ID_S2C_GetActCheckinSuper, handler(self, self._s2cGetActCheckinSuper))

	self._signalRecvActCheckinSuper = G_NetworkManager:add(MessageIDConst.ID_S2C_ActCheckinSuper, handler(self, self._s2cActCheckinSuper))


end

function ActivitySuperCheckinData:clear()
	self._signalRecvGetActCheckinSuper:remove()
	self._signalRecvGetActCheckinSuper = nil

	self._signalRecvActCheckinSuper:remove()
	self._signalRecvActCheckinSuper = nil

end

function ActivitySuperCheckinData:reset()

end

function ActivitySuperCheckinData:hasRedPoint()
	return not self:isTodayCheckin()
end

function ActivitySuperCheckinData:isTodayCheckin()
	local lastCheckinTime = self:getLastCheckinTime()
	local lastCleanTime = G_ServerTime:getNextCleanDataTime() - 24 * 60 * 60
	if lastCheckinTime < lastCleanTime then
		return false
	end
	return true
end

-- Describle：活动签到数据
-- Param:

function ActivitySuperCheckinData:c2sGetActCheckinSuper()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetActCheckinSuper, {

	})
end
-- Describle：
function ActivitySuperCheckinData:_s2cGetActCheckinSuper(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local last_checkin_time = rawget(message, "last_checkin_time")
	if last_checkin_time then
		self:setLastCheckinTime(last_checkin_time)
	end
	--check data
	local last_award = rawget(message, "last_award")
	if last_award then
		local selectIndexs = {}
		for k, v in pairs(last_award)do
			selectIndexs[v] = true
		end
		self:setLastCheckinIndexs(selectIndexs)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GET_ACT_CHECKIN_SUPER_SUCCESS)
end
-- Describle：签到
-- Param:
--	award_indexs   奖品索引
function ActivitySuperCheckinData:c2sActCheckinSuper( award_indexs)
	--如果当前时间没签到 保存当前签到的选择
	local selectIndexs = {}
	for k, v in pairs(award_indexs)do
		selectIndexs[v] = true
	end
	self:setLastCheckinIndexs(selectIndexs)

	G_NetworkManager:send(MessageIDConst.ID_C2S_ActCheckinSuper, {
		award_indexs = award_indexs,
	})
end
-- Describle：
function ActivitySuperCheckinData:_s2cActCheckinSuper(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local last_checkin_time = rawget(message, "last_checkin_time")
	if last_checkin_time then
		self:setLastCheckinTime(last_checkin_time)
	end
	local reward = rawget(message, "reward")
	local awards = {}
	if reward then
		awards = clone(reward)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_ACT_CHECKIN_SUPER_SUCCESS, awards)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WELFARE,{actId = ActivityConst.ACT_ID_SUPER_CHECKIN})
end

return ActivitySuperCheckinData
