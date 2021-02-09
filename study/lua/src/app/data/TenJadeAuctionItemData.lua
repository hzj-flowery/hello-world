--跨服拍卖项数据
local BaseData = require("app.data.BaseData")
local TenJadeAuctionItemData = class("TenJadeAuctionItemData", BaseData)

local schema = {}
schema["id"] 			        = {"number", 0} -- id
schema["config_id"]		        = {"number", 0} -- id
schema["item"]		            = {"table",  {}} --购买物品
schema["init_price"] 			= {"number", 0} -- 起始价
schema["add_price"] 			= {"number", 0} -- 加价
schema["now_price"]             = {"number", 0} -- 当前价
schema["now_buyer"]             = {"number", 0} -- 当前最高的用户id
schema["final_price"] 		    = {"number", 0} -- 一口价
schema["open_time"]		        = {"number", 0} -- 准备时间
schema["start_time"]		    = {"number", 0} -- 开始时间
schema["end_time"]		        = {"number", 0} -- 结束时间
schema["boss_id"]		        = {"number", 0} -- 结束时间
schema["order_id"]              = {"number", 0} -- 排序id
schema["money_type"]            = {"number", 0} -- 货币类型
schema["focused"]               = {"number", 0} -- 关注
schema["tag_id"]                = {"number", 0} -- 所属拍卖页签(客户端)
schema["delete"]                = {"number", 0} -- 标记删除(客户端)
schema["order"]                 = {"number", 0} -- 序号(客户端)

TenJadeAuctionItemData.schema = schema

function TenJadeAuctionItemData:ctor(properties)
    TenJadeAuctionItemData.super.ctor(self, properties)
end

function TenJadeAuctionItemData:initData(properties)
    self:setProperties(properties)

    --设置标签页id
    local info = require("app.config.ten_jade_auction_content").get(properties.config_id) 
    assert(info, string.format("ten_jade_auction_content config can not find id = %d", properties.config_id))
    self:setTag_id(info.auction_full_tab)
    self:setOrder(info.order)
end

return TenJadeAuctionItemData