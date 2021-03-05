-- Author: nieming
-- Date:2018-02-18 11:17:36
-- Describle：

local BaseData = require("app.data.BaseData")
local ActivityResourceBackItemData = class("ActivityResourceBackItemData", BaseData)
local ResourceRecoveryConfig = require("app.config.resource_recovery")

local schema = {}
--schema
schema["id"] = {"number", 0}
schema["awards"] = {"table", {}}
schema["state"] = {"number", 0}
schema["value"] = {"number", 0}
schema["describle"] = {"string", ""}
schema["gold"] = {"number", 0}   --元宝  完美找回
schema["coin"] = {"number", 0} -- 硬币  普通找回
schema["percent"] = {"number", 0} -- 普通 资源百分百
ActivityResourceBackItemData.schema = schema


function ActivityResourceBackItemData:ctor(properties)
	ActivityResourceBackItemData.super.ctor(self, properties)

end

function ActivityResourceBackItemData:clear()

end

function ActivityResourceBackItemData:reset()

end

function ActivityResourceBackItemData:updateData(message)
	local id = rawget(message, "id")
	if id then
		self:setId(id)
	end

	local awards = rawget(message, "awards")
	if awards then
		self:setAwards(awards)
	end

	local state = rawget(message, "state")
	if state then
		self:setState(message.state or 0)
	end

	local value = rawget(message, "value")
	if value then
		self:setValue(value)
	end

	local config = ResourceRecoveryConfig.get(id or 0)
	assert(config ~= nil, "can not find resource_recovery id = "..(id or 0))
	if config then
		self:setCoin(config.coin_price)
		self:setGold(config.acer_price)
		self:setPercent(config.percent/100.0)
		self:setDescrible(config.name)
	end
end



function ActivityResourceBackItemData:isAlreadyBuy()
	return self:getState() == 1
end





return ActivityResourceBackItemData
