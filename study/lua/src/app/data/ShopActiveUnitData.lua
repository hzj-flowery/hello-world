
local BaseData = require("app.data.BaseData")
local ShopActiveUnitData = class("ShopActiveUnitData", BaseData)

local schema = {}
schema["goods_id"] = {"number", 0}
schema["buy_count"] = {"number", 0}
schema["config"] = {"table", {}}
ShopActiveUnitData.schema = schema

function ShopActiveUnitData:ctor(properties)
	ShopActiveUnitData.super.ctor(self, properties)
end

function ShopActiveUnitData:clear()
	
end

function ShopActiveUnitData:reset()
	
end

function ShopActiveUnitData:updateData(data)
	self:setProperties(data)
end

--是否新上架
function ShopActiveUnitData:isNew(curBatch)
	if self:isBought() then
		return false
	end
	local batch = self:getConfig().batch
	return batch == curBatch
end

--是否已购买
function ShopActiveUnitData:isBought()
	local buyCount = self:getBuy_count() --已购买次数
	local limitCount = self:getConfig().num_ban_value --限制次数
	return buyCount >= limitCount
end

--剩余可购买次数
function ShopActiveUnitData:getRestCount()
	local buyCount = self:getBuy_count() --已购买次数
	local limitCount = self:getConfig().num_ban_value --限制次数
	return limitCount - buyCount
end

--是否可买
function ShopActiveUnitData:isCanBuy(param)
	param = param or {}
	local info = self:getConfig()
	if info.limit_type == 1 then --活动开始x秒后可买
		if param.limitTime and G_ServerTime:getTime() < param.limitTime then
			return false
		end
	end
	return true
end

return ShopActiveUnitData