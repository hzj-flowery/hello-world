--@Author:Conley
local BaseData = import(".BaseData")

local CustomActivityUserTaskData = class("CustomActivityUserTaskData", BaseData)
local schema = {}
schema["act_id"] 	= {"number", 0}--活动ID
schema["quest_id"] 	= {"number", 0}--任务ID
schema["time"] 	= {"number", 0}--活动初始化时间
schema["progress"] 	= {"string", 0}--活动完成进度
schema["award_time"] 	= {"number", 0}--奖励领取时间
schema["award_times"] 	= {"number", 0}--奖励领取次数
schema["progress_second"] 	= {"string", 0}--活动完成进度2
schema["valueMap"] 	= {"table", {} } 



CustomActivityUserTaskData.schema = schema

function CustomActivityUserTaskData:ctor(properties)
	CustomActivityUserTaskData.super.ctor(self, properties)
end

-- 清除
function CustomActivityUserTaskData:clear()
end

-- 重置
function CustomActivityUserTaskData:reset()
end

function CustomActivityUserTaskData:initData(data)
    self:setProperties(data)
    local valueList = rawget(data,"value") or {}
    local valueMap = self:getValueMap()
    for k,v in ipairs(valueList) do
        valueMap[v.Key] = v.Value
    end

end

function CustomActivityUserTaskData:getProgressValue()
    return tonumber(self:getProgress()) or 0
end

function CustomActivityUserTaskData:getProgressValue2()
    return tonumber(self:getProgress_second()) or 0
end

function CustomActivityUserTaskData:getValue(key)
    local valueMap = self:getValueMap()
    return valueMap[key] or 0
end

return CustomActivityUserTaskData