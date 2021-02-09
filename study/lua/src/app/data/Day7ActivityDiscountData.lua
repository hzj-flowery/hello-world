--七日活动折扣商品购买数据
--@Author:Conley
local BaseData = import(".BaseData")
local SevenDaysDiscount = require("app.config.seven_days_discount")

local Day7ActivityDiscountData = class("Day7ActivityDiscountData", BaseData)
local schema = {}
schema["id"] 	= {"number", 0}
schema["buyCount"] 	= {"number", 0}--购买次数
schema["config"] 	= {"table",{}}--商品配置
Day7ActivityDiscountData.schema = schema

function Day7ActivityDiscountData:ctor(properties)
	Day7ActivityDiscountData.super.ctor(self, properties)
end

-- 清除
function Day7ActivityDiscountData:clear()
end

-- 重置
function Day7ActivityDiscountData:reset()
end


function Day7ActivityDiscountData:initData(shopId)
	self:setId(shopId)

	local cfg = SevenDaysDiscount.get(shopId)
	assert(cfg,"seven_days_discount not find id "..tostring(shopId))
	
	self:setConfig(cfg)

	self:setBuyCount(1)
end

function Day7ActivityDiscountData:canBuy()
	return self:getBuyCount() <= 0
end

return Day7ActivityDiscountData