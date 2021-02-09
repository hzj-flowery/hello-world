--跨服拍卖活动数据
local BaseData = require("app.data.BaseData")
local TenJadeAuctionInfoData = class("TenJadeAuctionInfoData", BaseData)
local schema = {}
schema["auction_id"]		            = {"number",  0} --id
schema["bonus"]		                    = {"number",  0} --奖金
schema["canBonus"]		                = {"bool",  false} --能否分红
schema["start_time"]		            = {"number",  0} --开始时间
schema["end_time"]		                = {"number",  0} --结束时间
schema["bonus_yubi"]		            = {"number",  0} --玉璧分红
schema["open_state"]		            = {"number",  0} --活动状态

TenJadeAuctionInfoData.schema = schema

function TenJadeAuctionInfoData:ctor(properties)
    TenJadeAuctionInfoData.super.ctor(self, properties)
end

function TenJadeAuctionInfoData:initData(msg)
    self:setProperties(msg)
end

--是否结束
function TenJadeAuctionInfoData:isEnd()
    local curTime = G_ServerTime:getTime()
    local endTime = self:getEnd_time()
    return curTime > endTime
end

return TenJadeAuctionInfoData