-- Author: nieming
-- Date:2018-06-12 10:44:06
-- Describle：

local BaseData = require("app.data.BaseData")
local CrystalShopGoodData = class("CrystalShopGoodData", BaseData)
local ShopCrystalItemConfig = require("app.config.shop_crystal_item")

local schema = {}
--schema
schema["id"] = {"number", 0}
schema["value"] = {"number",0}
schema["buy_count"] = {"number", 0}
schema["config"] = {"table", {}}
CrystalShopGoodData.schema = schema


function CrystalShopGoodData:ctor(properties)
	CrystalShopGoodData.super.ctor(self, properties)
end

function CrystalShopGoodData:clear()

end

function CrystalShopGoodData:reset()

end

function CrystalShopGoodData:updateData(message)
	local id = rawget(message, "id")
	if id then
		self:setId(id)
	end
	local value = rawget(message, "value")
	if value then
		self:setValue(value)
	end

	local buy_count = rawget(message, "buy_count")
	if buy_count then
		self:setBuy_count(buy_count)
	end

	local cfg = ShopCrystalItemConfig.get(self:getId())
	assert(cfg ~= nil, "shop_crystal_item can not find id "..self:getId())
	self:setConfig(cfg)
end


function CrystalShopGoodData:getLeftBuyCount()
	local cfg = self:getConfig()
	if cfg.limit > 0 then
		return cfg.limit - self:getBuy_count()
	else
		return -1
	end
end


return CrystalShopGoodData
