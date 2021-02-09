
local BaseData = import(".BaseData")
local CombineTaskStatusData = class("CombineTaskStatusData", BaseData)
local schema = {}
CombineTaskStatusData.schema = schema
schema["task_id"]            = {"number", 0}
schema["status"]     = {"number", 0}
schema["param1"]            = {"number", 0}



function CombineTaskStatusData:ctor(properties)
	CombineTaskStatusData.super.ctor(self, properties)
end

-- 清除
function CombineTaskStatusData:clear()
end

-- 重置
function CombineTaskStatusData:reset()
end

function CombineTaskStatusData:initData(msg)
    self:setProperties(msg)
end



return CombineTaskStatusData
