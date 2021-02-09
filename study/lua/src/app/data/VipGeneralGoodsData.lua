--vip推送礼包结构
local BaseData = require("app.data.BaseData")
local VipGeneralGoodsData = class("VipGeneralGoodsData", BaseData)

local schema = {}
schema["product_id"] = {"number", 0}
schema["awards"] = {"table", {}}
schema["purchased_times"] = {"number", 0}
VipGeneralGoodsData.schema = schema

function VipGeneralGoodsData:ctor(properties)
	VipGeneralGoodsData.super.ctor(self, properties)
end

function VipGeneralGoodsData:clear()
	
end

function VipGeneralGoodsData:reset()
	
end

function VipGeneralGoodsData:updateData(data)
	self:setProperties(data)
end

function VipGeneralGoodsData:getRmb()
	local configInfo = require("app.config.vip_pay").get(self:getProduct_id())
	return configInfo.rmb
end

return VipGeneralGoodsData