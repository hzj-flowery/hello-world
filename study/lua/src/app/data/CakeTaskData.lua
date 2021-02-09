-- Author: Liangxu
-- Date: 2019-5-5
-- 蛋糕活动蛋糕任务信息

local BaseData = require("app.data.BaseData")
local CakeTaskData = class("CakeTaskData", BaseData)
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")

local schema = {}
schema["type"] = {"number", 0}
schema["value"] = {"number", 0}
schema["reward_id"] = {"table", {}}
CakeTaskData.schema = schema

function CakeTaskData:ctor(properties)
	CakeTaskData.super.ctor(self, properties)
	self._curShowId = 0
end

function CakeTaskData:reset()
	
end

function CakeTaskData:clear()

end

function CakeTaskData:updateData(data)
	self:setProperties(data)

	self._curShowId = self:_findCurShowId()
end

function CakeTaskData:_findCurShowId()
	local type = self:getType()
	local taskInfo = G_UserData:getCakeActivity():getTaskInfoWithType(type)
	local value = self:getValue()
	for i, info in ipairs(taskInfo) do
		if value < info.times then
			return info.id
		elseif self:_isInReward(info.id) == false then
			return info.id
		end
	end
	return taskInfo[#taskInfo].id --没有符合条件的，就显示最后一个
end

function CakeTaskData:getCurShowId()
	if self._curShowId == 0 then
		self._curShowId = self:_findCurShowId()
	end
	return self._curShowId
end

--此Id是否已经领过
function CakeTaskData:_isInReward(id)
	local rewardIds = self:getReward_id()
	for i, rewardId in ipairs(rewardIds) do
		if rewardId == id then
			return true
		end
	end
	return false
end

--此类型任务是否完成了，如果有多个阶段，是指所有阶段全部完成
function CakeTaskData:isFinish()
	local curShowId = self:getCurShowId()
	if self:_isInReward(curShowId) then
		return true
	else
		return false
	end
end

--是否可领取
function CakeTaskData:isCanReceive()
	if G_UserData:getCakeActivity():getActType() == 0 then
		return false
	end
	local id = self:getCurShowId()
	local info = CakeActivityDataHelper.getCurCakeTaskConfig(id)
	if self:isFinish() == false and self:getValue() >= info.times then
		return true
	else
		return false
	end
end

return CakeTaskData