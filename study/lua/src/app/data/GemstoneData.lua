-- Author: liangxu
-- Date:2017-10-18 16:48:19
-- Describle：宝石数据

local BaseData = require("app.data.BaseData")
local GemstoneData = class("GemstoneData", BaseData)

--宝石单元数据
local GemstoneUnitData = class("GemstoneUnitData", BaseData)
local schema = {}
schema["id"] = {"number", 0}
schema["num"] = {"number", 0}
schema["type"] = {"number", 0}
schema["config"] = {"table", {}}
GemstoneUnitData.schema = schema

function GemstoneUnitData:ctor(properties)
	GemstoneUnitData.super.ctor(self, properties)
end

function GemstoneUnitData:initData(data)
	self:setId(data.id)
	self:setNum(data.num)
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	self:setType(TypeConvertHelper.TYPE_GEMSTONE)

	local info = require("app.config.gemstone").get(data.id)
    assert(info,"gemstone config can't find id = "..tostring(data.id))
	self:setConfig(info)
end


--宝物数据
local GemstoneData = class("GemstoneData", BaseData)
local schema = {}
schema["gemstones"] = {"table", {}}
GemstoneData.schema = schema

function GemstoneData:ctor(properties)
	GemstoneData.super.ctor(self, properties)
	self._gemstoneList = {}
	self._recvGetGemstone = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGemstone, handler(self, self._s2cGetGemstone))
end

function GemstoneData:clear()
	self._recvGetGemstone:remove()
	self._recvGetGemstone = nil
end

function GemstoneData:reset()
	self._gemstoneList = {}
end

function GemstoneData:_setGemstoneData(data)
    local unitData = GemstoneUnitData.new()
    unitData:initData(data)
    self._gemstoneList["k_"..tostring(data.id)] = unitData
end

--
function GemstoneData:_s2cGetGemstone(id, message)
	self._gemstoneList = {}
	local gemstones = rawget(message, "gemstones") or {}
	for i, data in ipairs(gemstones) do
		self:_setGemstoneData(data)
	end
end

function GemstoneData:updateData(datas)
	if datas == nil or type(datas) ~= "table" then
        return
    end
    if self._gemstoneList == nil then
        return
    end
	for i = 1, #datas do
		self:_setGemstoneData(datas[i])
	end
end

function GemstoneData:insertData(datas)
	if datas == nil or type(datas) ~= "table" then
        return
    end
    if self._gemstoneList == nil then
        return
    end

	for i = 1, #datas do
		self:_setGemstoneData(datas[i])
	end
end

function GemstoneData:deleteData(datas)
	if datas == nil or type(datas) ~= "table" then
        return
    end
    if self._gemstoneList == nil then
        return
    end

	for i = 1, #datas do
		local id = datas[i]
		self._gemstoneList["k_"..tostring(id)] = nil
	end
end

--
function GemstoneData:getUnitDataWithId(id)
	local data = self._gemstoneList["k_"..tostring(id)]
	return data
end

--sortFuncType 排序规则  1 按品质低-->高 nil 按品质高-->低
function GemstoneData:getGemstonesData(sortFuncType)
	local sortFun
	if sortFuncType and sortFuncType == 1 then
		sortFun = function(a, b)
			return a:getConfig().sorting > b:getConfig().sorting
		end
	else
		sortFun = function(a, b)
			return a:getConfig().sorting < b:getConfig().sorting
		end
	end

	local result = {}
	for k, unit in pairs(self._gemstoneList) do
		table.insert(result, unit)
	end
	table.sort(result, sortFun)

	return result
end

return GemstoneData
