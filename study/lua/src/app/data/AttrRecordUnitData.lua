--
-- Author: Liangxu
-- Date: 2018-1-15 14:14:28
-- 属性记录单元数据

local BaseData = require("app.data.BaseData")
local AttrRecordUnitData = class("AttrRecordUnitData", BaseData)

local schema = {}
schema["id"] = {"number", 0}
schema["attr"] = {"table", {}}
AttrRecordUnitData.schema = schema

function AttrRecordUnitData:ctor(properties)
	AttrRecordUnitData.super.ctor(self, properties)
end

function AttrRecordUnitData:reset()

end

function AttrRecordUnitData:clear()

end

function AttrRecordUnitData:updateData(attr)
	self:backupProperties()
	self:setProperties({attr = attr})
end

function AttrRecordUnitData:getCurValue(attrId)
	local attr = self:getAttr()
	local value = attr[attrId]
	return value or 0
end

function AttrRecordUnitData:getLastValue(attrId)
	local attr = self:getLastAttr()
	local value = attr[attrId]
	return value or 0
end

function AttrRecordUnitData:getCurAttrList( ... )
	-- body
	local attr = self:getAttr()
	return attr
end

function AttrRecordUnitData:getDiffValue(attrId)
	local curValue = self:getCurValue(attrId)
	local lastValue = self:getLastValue(attrId)
	local diffValue = curValue - lastValue
	return diffValue
end

--获取有记录的所有属性Id
function AttrRecordUnitData:getAllAttrIds()
	local attr = clone(self:getAttr())
	local lastAttr = clone(self:getLastAttr())
	table.merge(attr, lastAttr)
	local attrIds = table.keys(attr)
	return attrIds
end

function AttrRecordUnitData:getAllAttrIdsBySort()
	local function sortFun(a, b) --排序
        local infoA = require("app.config.attribute").get(a)
        local infoB = require("app.config.attribute").get(b)
        assert(infoA and infoB, string.format("attribute config can not find Aid = %d, Bid = %d", a, b))
        local orderA = infoA.order
        local orderB = infoB.order
        return orderA < orderB
    end

	local attrIds = self:getAllAttrIds()
	table.sort(attrIds, sortFun)
	return attrIds
end

return AttrRecordUnitData