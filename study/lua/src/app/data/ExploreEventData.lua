local BaseData = require("app.data.BaseData")
local ExploreEventData = class("ExploreEventData", BaseData)
local ExploreConst = require("app.const.ExploreConst")
local ExploreDiscover = require("app.config.explore_discover")

local schema = {}
schema["event_id"] = {"number", 0}
schema["event_type"] = {"number", 0}
schema["event_time"] = {"number", 0}
schema["value1"] = {"number", 0}    --答题，题目id， 半价，商品1id, 宝箱，获得物品id, 招募，表id, 洛阳之乱, 表id, 董卓之乱，表id
schema["value2"] = {"number", 0}    --答题，正确答案，半价，商品2id， 宝箱，获得宝箱时间，招募，武将id， 董卓之乱，血量1
schema["value3"] = {"number", 0}    --半价，商品3id， 董卓之乱，血量2  招募-时间
schema["value4"] = {"number", 0}    --半价，商品1是否购买， 董卓之乱，血量3
schema["value5"] = {"number", 0}    --半价，商品2是否购买， 董卓之乱，血量4
schema["value6"] = {"number", 0}    --半价，商品3是否购买， 董卓之乱，血量5
schema["value7"] = {"number", 0}    --董卓之乱，血量6  半价-时间
schema["value8"] = {"number", 0}    --董卓之乱，总血量
schema["param"] = {"number", 0}     --记录参数，答题，记录我的答案,  半价，买完之后是1， 宝箱，开完之后是1， 招募，购买之后是1, 洛阳之乱，打完之后是1
schema["endTime"] = {"number", 0} --事件结束时间 统一 接口
ExploreEventData.schema = schema

function ExploreEventData:ctor(properties)
    ExploreEventData.super.ctor(self, properties)
end

function ExploreEventData:clear()
end

function ExploreEventData:reset()
end

--统一接口
function ExploreEventData:_updateEventTime()
    local type = self:getEvent_type()
    local discoverData = ExploreDiscover.get(type)
    assert(discoverData ~= nil, "discoverData = nil")
    if discoverData.time and discoverData.time > 0 then
        self:setEndTime(self:getEvent_time() + discoverData.time)
    end
end


function ExploreEventData:updateData(data)
    self:setEvent_id(data.event_id)
    self:setEvent_type(data.event_type)
    self:setValue1(data.value1)
    self:setValue2(data.value2)
    self:setValue3(data.value3)
    self:setValue4(data.value4)
    self:setValue5(data.value5)
    self:setValue6(data.value6)
    self:setValue7(data.value7)
    self:setValue8(data.value8)
    self:setEvent_time(data.event_time)
    self:_updateEventTime()
end

function ExploreEventData:updateDataByMessage(message)
    self:setValue1(message.value1)
    self:setValue2(message.value2)
    self:setValue3(message.value3)
    self:setValue4(message.value4)
    self:setValue5(message.value5)
    self:setValue6(message.value6)
    self:setValue7(message.value7)
    self:setValue8(message.value8)
    self:_updateEventTime()
end

return ExploreEventData
