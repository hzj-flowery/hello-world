--七日活动任务数据
--@Author:Conley
local BaseData = import(".BaseData")
local Day7ActivityTaskData = class("Day7ActivityTaskData", BaseData)
local schema = {}
schema["task_type"] 	= {"number", 0}--任务类型
schema["task_value"] 	= {"number", 0}--任务值
schema["taskRewards"]  = {"table", {}}--已领取的任务ID列表
Day7ActivityTaskData.schema = schema

function Day7ActivityTaskData:ctor(properties)
	Day7ActivityTaskData.super.ctor(self, properties)
end

-- 清除
function Day7ActivityTaskData:clear()
end

-- 重置
function Day7ActivityTaskData:reset()
end

function Day7ActivityTaskData:initData(data)
	self:setProperties(data)
	local taskRewards = rawget(data,"task_rewards") or {}

	--协议里table数据要展开
	local newTaskRewards  = {}
	for k,v in pairs(taskRewards) do
		newTaskRewards[k] = v
	end
	self:setTaskRewards(newTaskRewards)
end

--是否已经领取奖励
function Day7ActivityTaskData:hasReceived(taskId)
	return self:getReceivePrizeCount(taskId) > 0
end

--领奖次数
function Day7ActivityTaskData:getReceivePrizeCount(taskId)
	--TODO 可以优化
	local taskRewards = self:getTaskRewards()
	local count = 0
	for k,v in ipairs(taskRewards) do
		if v == taskId then
			count = count  + 1
		end
	end
	return count
end


return  Day7ActivityTaskData