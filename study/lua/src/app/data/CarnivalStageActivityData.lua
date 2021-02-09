-- Author: nieming
-- Date:2018-01-13 13:50:28
-- Describle：

local BaseData = require("app.data.BaseData")
local CarnivalStageActivityData = class("CarnivalStageActivityData", BaseData)

local schema = {}
schema["id"] = {"number", 0}
schema["name"] = {"string", ""}
schema["resID"] = {"number", ""}
schema["activitys"] = {"table", {}}
schema["special_id"] = {"number", 0}
--schema
CarnivalStageActivityData.schema = schema


function CarnivalStageActivityData:ctor(properties)
	CarnivalStageActivityData.super.ctor(self, properties)
end

function CarnivalStageActivityData:clear()

end

function CarnivalStageActivityData:reset()

end

function CarnivalStageActivityData:getVisibleActivitys()
	local activitys = self:getActivitys()
	local visibleActivitys = {}
	for k,v in ipairs(activitys) do
		if v:checkActIsVisible() then
			table.insert( visibleActivitys, v )
		end
	end
	local sortFunc = function(left,right)
		if left:getSort() ~= right:getSort() then
			return left:getSort() < right:getSort()
		end	
		return left:getId() < right:getId() 
	end
	table.sort(visibleActivitys,sortFunc)
	return visibleActivitys
end


function CarnivalStageActivityData:getActivityDataById(id)
	local activitys = self:getActivitys()
	for _, v in pairs(activitys) do
		if v:getId() == id then
			return v
		end
	end
end

-- 按照活动id 排序
function CarnivalStageActivityData:insertActivityData(activityData)
	local activitys = self:getActivitys()
	table.insert(activitys, activityData)
	table.sort(activitys, function(a, b)
		if a:getSort() == b:getSort() then
			return a:getId() < b:getId()
		else
			return a:getSort() < b:getSort()
		end
	end)
end

function CarnivalStageActivityData:removeActivityData(activityData)
	local activitys = self:getActivitys()
	for k, v in ipairs(activitys) do
		if v:getId() == activityData:getId() then
			table.remove(activitys, k)
			break
		end
	end
end

function CarnivalStageActivityData:isHasRedPoint(id)
	local activitys = self:getActivitys()
	for _, v in pairs(activitys) do
		if v:isHasRedPoint() then
			return true
		end
	end
end

return CarnivalStageActivityData
