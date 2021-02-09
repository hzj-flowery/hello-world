--跨服个人竞技竞猜数据
local BaseData = require("app.data.BaseData")
local SingleRaceGuessUnitData = class("SingleRaceGuessUnitData", BaseData)

local schema = {}
schema["answer_id"] = {"number", 0}
schema["support"] = {"table", {}}
schema["my_support"] = {"number", 0}
SingleRaceGuessUnitData.schema = schema

function SingleRaceGuessUnitData:ctor(properties)
	SingleRaceGuessUnitData.super.ctor(self, properties)
	self._guessDatas = {}
end

function SingleRaceGuessUnitData:clear()
	
end

function SingleRaceGuessUnitData:reset()
	self._guessDatas = {}
end

function SingleRaceGuessUnitData:updateData(data)
	self:setProperties(data)
	self._guessDatas = {}
	local supports = rawget(data, "support") or {}
	for i, support in ipairs(supports) do
		self:updateSupport(support)
	end
end

function SingleRaceGuessUnitData:updateSupport(support)
	local supportId = rawget(support, "support_id") or 0
	local supportNum = rawget(support, "support_num") or 0
	self._guessDatas[supportId] = supportNum
end

function SingleRaceGuessUnitData:getGuessDatas()
	return self._guessDatas
end

function SingleRaceGuessUnitData:isVoted()
	return self:getMy_support() > 0
end

function SingleRaceGuessUnitData:getSupportNumWithId(id)
	local supportNum = self._guessDatas[id]
	return supportNum or 0
end

return SingleRaceGuessUnitData