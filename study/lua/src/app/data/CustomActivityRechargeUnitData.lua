-- 自定义活动（充值类）单元数据
-- Author: Liangxu
-- Date: 2018-5-5 10:46:07
--
local BaseData = require("app.data.BaseData")
local CustomActivityRechargeUnitData = class("CustomActivityRechargeUnitData", BaseData)
local CustomActivityConst = require("app.const.CustomActivityConst")
local ActivityEquipDataHelper = require("app.utils.data.ActivityEquipDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local schema = {}
schema["act_type"] = {"number", 0}
schema["free_use"] = {"number", 0}
schema["total_use"] = {"number", 0}
schema["last_draw_time"] = {"number", 0}
schema["records"] = {"table", {}}
CustomActivityRechargeUnitData.schema = schema

function CustomActivityRechargeUnitData:ctor(properties)
	CustomActivityRechargeUnitData.super.ctor(self, properties)
end

function CustomActivityRechargeUnitData:clear()

end

function CustomActivityRechargeUnitData:reset()
	
end

function CustomActivityRechargeUnitData:updateData(data)
	local actType = rawget(data, "act_type") or 0
	local freeUse = rawget(data, "free_use") or 0
	local totalUse = rawget(data, "total_use") or 0
	local lastDrawTime = rawget(data, "last_draw_time") or 0
	local records = rawget(data, "records") or {}
	self:setAct_type(actType)
	self:setFree_use(freeUse)
	self:setTotal_use(totalUse)
	self:setLast_draw_time(lastDrawTime)
	self:setRecords(records)

	self:resetTime()
end

--得到剩余免费次数
function CustomActivityRechargeUnitData:getRestFreeCount(batch)
	local info = ActivityEquipDataHelper.getActiveConfig(batch)
	local limitNum = info.day_free1
	local usedNum = self:getFree_use()
	local restNum = limitNum - usedNum
	if restNum < 0 then
		restNum = 0
	end
	return restNum
end

function CustomActivityRechargeUnitData:getRecordList(restCount, showCount)
	showCount = showCount or 10 --需要显示的信息数量
	local result = {}
	local records = self:getRecords()
	local len = #records
	local targetIndex = len - restCount --计算目标索引，只取目标索引前showCount条
	for i = targetIndex-showCount+1, targetIndex do
		local id = records[i]
		if id then
			local info = ActivityEquipDataHelper.getActiveDropConfig(id)
			local unit = {
				type = info.type,
				id = info.value,
				num = info.size,
			}
			table.insert(result, unit)
		end
	end

	return result
end

return CustomActivityRechargeUnitData