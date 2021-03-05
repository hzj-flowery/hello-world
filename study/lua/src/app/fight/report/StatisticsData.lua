--基本buff统计单位
local BaseData = require("app.data.BaseData")
local StatisticsData = class("StatisticsData", BaseData)

local schema = {}
schema["type"] = {"number", 0}          --类型
schema["count"] = {"number", 0}         --数量
schema["description"] = {"string", 0}   --描述
StatisticsData.schema = schema

function StatisticsData:ctor(type, description)  
    StatisticsData.super.ctor(self)
    self:setType(type)
    self:setDescription(description)
end

function StatisticsData:clear()
    self:setType(0)
    self:setCount(0)
    self:setDiscription("")
end

function StatisticsData:addCount(count)
    local nowCount = self:getCount()
    nowCount = nowCount + count
    self:setCount(nowCount)
end

return StatisticsData