--@Author:Conley
local BaseData = import(".BaseData")

local CommonActivityUserTaskData = class("CommonActivityUserTaskData", BaseData)
local schema = {}
schema["act_id"] 	= {"number", 0}--活动ID
schema["quest_id"] 	= {"number", 0}--任务ID
schema["time"] 	= {"number", 0}--活动初始化时间
schema["time2"] 	= {"number", 0}--活动激活时间
schema["progress"] 	= {"string", 0}--活动完成进度
schema["award_time"] 	= {"number", 0}--奖励领取时间
schema["award_times"] 	= {"number", 0}--奖励领取次数
schema["progress_second"] 	= {"string", 0}--活动完成进度2
schema["valueMap"] 	= {"table", {} } 

CommonActivityUserTaskData.schema = schema

function CommonActivityUserTaskData:ctor(properties)
	CommonActivityUserTaskData.super.ctor(self, properties)
end

-- 清除
function CommonActivityUserTaskData:clear()
end

-- 重置
function CommonActivityUserTaskData:reset()
end

function CommonActivityUserTaskData:initData(data)
    self:setProperties(data)

    local valueList = rawget(data,"value") or {}
    local valueMap = self:getValueMap()
    for k,v in ipairs(valueList) do
        valueMap[v.Key] = v.Value
    end
end

function CommonActivityUserTaskData:getProgressValue()
    return tonumber(self:getProgress()) or 0
end

function CommonActivityUserTaskData:getProgressValue2()
    return tonumber(self:getProgress_second()) or 0
end

function CommonActivityUserTaskData:getValue(key)
    local valueMap = self:getValueMap()
    return valueMap[key] or 0
end


return CommonActivityUserTaskData
