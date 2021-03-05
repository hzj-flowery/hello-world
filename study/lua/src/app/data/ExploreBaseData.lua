local BaseData = require("app.data.BaseData")
local ExploreBaseData = class("ExploreBaseData", BaseData)

local schema = {}
schema["id"] = {"number", 0}
schema["map_id"] = {"number", 0}
schema["foot_index"] = {"number", 0}
schema["pass_count"] = {"number", 0}
schema["events"] = {"table", {}}
schema["award"] = {"table", {}}
schema["roll_nums"] = {"table", {}} --走过的数量
schema["configData"] = {"table", {}}
ExploreBaseData.schema = schema

function ExploreBaseData:ctor(properties)
    ExploreBaseData.super.ctor(self, properties)
end

function ExploreBaseData:clear()
end

function ExploreBaseData:reset()
end

function ExploreBaseData:updateData(data)
    self:setId(data.id)
    self:setFoot_index(data.foot_index)
    self:setMap_id(data.map_id)
    self:setPass_count(data.pass_count)

    if rawget(data, "events") then
        local list = {}
        for i, v in pairs(data.events) do
            table.insert(list, v)
        end
        self:setEvents(list)
    end

    self:setAward({})
    if rawget(data, "awards") then
        local awardList = {}
        for i, v in pairs(data.awards) do
            local award = {type = v.type, value = v.value, size = v.size}
            table.insert(awardList, award)
        end
        self:setAward(awardList)
    end

    self:clearRollNum()
    if rawget(data, "roll_nums") then
        local rollList = {}
        for i, v in pairs(data.roll_nums) do
            local roll = v
            table.insert(rollList, roll)
        end
        self:setRoll_nums(rollList)
    end
end

--删除已走步数
function ExploreBaseData:clearRollNum()
    self:setRoll_nums({})
end

--是否是第一次通关
function ExploreBaseData:isFirstPass()
    if self:getPass_count() == 2 then
        return true
    end
    return false
end

return ExploreBaseData
