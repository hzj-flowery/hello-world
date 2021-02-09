--活动任务配置单元数据
--@Author:Conley
local BaseData = import(".BaseData")
local Day7ActivityConst = require("app.const.Day7ActivityConst")
local SevenDaysTask = require("app.config.seven_days_task")
local SevenDaysTaskOld = require("app.config.seven_days_task_old")

local Day7ActivityTaskUnitData = class("Day7ActivityTaskUnitData", BaseData)
local schema = {}
schema["id"] 	    = {"number", 0}--任务ID
schema["config"] 	= {"table",{}}--任务配置
schema["inited"] 	= {"boolean",false}--是否初始化了
schema["rewards"] 	= {"table",{}}--任务奖励列表
schema["hasReach"] 	= {"boolean",false}--是否达到了领奖条件
schema["canTaken"] 	= {"boolean",false}--是否能领奖
schema["hasReceived"] 	= {"boolean",false}--已经领奖

Day7ActivityTaskUnitData.schema = schema

function Day7ActivityTaskUnitData:ctor(properties)
	Day7ActivityTaskUnitData.super.ctor(self, properties)
end

-- 清除
function Day7ActivityTaskUnitData:clear()
end

-- 重置
function Day7ActivityTaskUnitData:reset()
end

function Day7ActivityTaskUnitData:initData(data)
	self:setId(data.id)

	local Config = SevenDaysTask
	if G_UserData:getDay7Activity():isUseOldConfig() then
		Config = SevenDaysTaskOld
	end
	local cfg = Config.get(data.id)
	assert(cfg,"seven_days_task not find id "..data.id)
	self:setConfig(cfg)

	self:setInited(true)

	self:setRewards(self:_makeRewards())
end

--TODO：提取成ConfigHelper方法
function Day7ActivityTaskUnitData:_makeRewards()
	local cfg = self:getConfig()
	local rewardList = {}
    for i = 1,Day7ActivityConst.TASK_REWARD_ITEM_MAX,1 do
		if cfg["type_"..i] ~= 0 then
			local reward = {
				type = cfg["type_"..i], 
				value = cfg["value_"..i], 
				size = cfg["size_"..i]
			}
			table.insert( rewardList,reward )
		end
		
	end
	return rewardList
end	

--任务是否能领取
function Day7ActivityTaskUnitData:isTaskHasReceiveCount(actTaskData)
	assert(self:isInited() == true,"call isTaskHasReceiveCount when not inited")
	if not actTaskData then
		--服务器没有任务数据，说明此任务还没有进度		
		return false
	end
	local receiveCount = actTaskData:getReceivePrizeCount(self:getId())
	local rewardCount = self:getConfig().reward_count
	return receiveCount < rewardCount
end

--任务是否已经领取了
function Day7ActivityTaskUnitData:isTaskHasReceived(actTaskData)
	assert(self:isInited() == true,"call isTaskHasReceived when not inited")
	if not actTaskData then
		--服务器没有任务数据，说明此任务还没有进度		
		return false
	end
	local receiveCount = actTaskData:getReceivePrizeCount(self:getId())
	--local rewardCount = self:getConfig().reward_count
	return receiveCount > 0
end


--此任务是否能满足领取条件
function Day7ActivityTaskUnitData:isTaskReachReceiveCondition(actTaskData)
	assert(self:isInited() == true,"call isTaskReachReceiveCondition when not inited")
	--每日登陆任务需要特殊判断
	if not actTaskData then
		--服务器没有任务数据，说明此任务还没有进度		
		return false
	end
	local taskValue01 = self:getConfig().task_value_1 or 0
	local taskValue02 = self:getConfig().task_value_2 or 0

	if actTaskData:getTask_type() == Day7ActivityConst.TASK_TYPE_ARENA  then
		return actTaskData:getTask_value() <= taskValue01
	end

	if actTaskData:getTask_value() >= taskValue01 then
		return true
	end
	return false
end

function Day7ActivityTaskUnitData:getDescription()
	assert(self:isInited() == true,"call isTaskReachReceiveCondition when not inited")
	local taskDes = self:getConfig().task_description
	local taskValue01 = self:getConfig().task_value_1
	taskDes = string.format(taskDes,taskValue01)
	return taskDes
end

--返回任务类型
function Day7ActivityTaskUnitData:getTaskType()
	assert(self:isInited() == true,"call getTaskType when not inited")
	return self:getConfig().task_type
end

--返回任务当前进度值
function Day7ActivityTaskUnitData:getTaskValue(day7ActData)
	day7ActData = day7ActData or G_UserData:getDay7Activity()
	local actTaskData =  day7ActData:getActivityTaskDataByTaskType(self:getTaskType())
	if not actTaskData then
		return 0
	end
	return actTaskData:getTask_value()
end



return Day7ActivityTaskUnitData
