-- Author: nieming
-- Date:2018-01-12 20:17:21
-- Describle：一个节日狂欢数据结构

local BaseData = require("app.data.BaseData")
local CarnivalActivityUnitData = class("CarnivalActivityUnitData", BaseData)
local CarnivalActivityTermData = require("app.data.CarnivalActivityTermData")
local CarnivalStageActivityData = require("app.data.CarnivalStageActivityData")
local CustomActivityConst = require("app.const.CustomActivityConst")
local FestivalResConfog = require("app.config.festival_res")
local schema = {}
schema["id"] = {"number", 0}
schema["name"] = {"string", 0}
schema["preview_time"] = {"number", 0}
schema["start_time"] = {"number", 0}
schema["end_time"] = {"number", 0}
schema["award_time"] = {"number", 0}
schema["main_view"] = {"number", 0}  -- 活动主视图
schema["icon_left_up"] = {"number", 0}  -- 活动主视图
schema["icon_left_down"] = {"number", 0}  -- 活动主视图
schema["icon_right_up"] = {"number", 0}  -- 活动主视图
schema["icon_right_down"] = {"number", 0}  -- 活动主视图


--schema

CarnivalActivityUnitData.schema = schema

function CarnivalActivityUnitData:ctor(properties)
	CarnivalActivityUnitData.super.ctor(self, properties)
	self._terms = {}
	self._visibleTerms = {}
end

-- function CarnivalActivityUnitData:clear()
--
-- end
--
-- function CarnivalActivityUnitData:reset()
--
-- end

function CarnivalActivityUnitData:initData(message)
	self:setProperties(message)
	local keyhead1 = {"first_", "second_", "third_"}
	local keyhead2 = {"one", "two", "three", "four"}
	local function safeSetVaule(dataImp, func, key)
		local val = rawget(message, key)
		if val then
			func(dataImp, val)
		end
	end

	for k,v in ipairs(keyhead1)do
		local isTermValid = rawget(message,  v.."term")
		if  isTermValid and isTermValid == 1 then
			local termData = CarnivalActivityTermData.new()
			termData:setCarnival_id(self:getId())
			termData:setTerm(k)
			
			safeSetVaule(termData, termData.setPreview_time, v.."preview_time")
			safeSetVaule(termData, termData.setStart_time, v.."start_time")
			safeSetVaule(termData, termData.setEnd_time, v.."end_time")
			safeSetVaule(termData, termData.setAward_time, v.."award_time")
			safeSetVaule(termData, termData.setTerm_icon, v.."term_icon")
			safeSetVaule(termData, termData.setTerm_show_icon, v.."term_show_icon")

			local stages = {}

			-- 特殊说明页面会被加到stages第一个
			local offset = 0
			local term_show_icon = termData:getTerm_show_icon()
			if term_show_icon ~= 0 then
				local stageData = CarnivalStageActivityData.new()
				stageData:setId(1)

				local config = FestivalResConfog.get(termData:getTerm_icon())
				local functionId = config.icon
				local FunctionLevelInfo = require("app.config.function_level")
				local funcInfo = FunctionLevelInfo.get(functionId)

				stageData:setName(funcInfo.name)
				stageData:setResID("111")
				stageData:setSpecial_id(term_show_icon)
				table.insert(stages, stageData)
				offset = 1
			end

			for k1,v1 in ipairs(keyhead2)do
				local isStageValid = rawget(message, v.."stage_"..v1)
				if  isStageValid and isStageValid == 1 then
					local stageData = CarnivalStageActivityData.new()
					stageData:setId(k1 + offset)
					safeSetVaule(stageData, stageData.setName, v.."stage_"..v1.."_name")
					safeSetVaule(stageData, stageData.setResID, v.."stage_"..v1.."_src")
					table.insert(stages, stageData)
				end
			end
			termData:setStages(stages)
			table.insert(self._terms, termData)
		end
	end
	self:_registerClock()
	self:_refreshVisibleTerm()
end

function CarnivalActivityUnitData:_registerClock()
	--做一个闹钟 --活动开启或者结束 抛出一个事件
	local curTime = G_ServerTime:getTime()
	if self:getAward_time() >= curTime then
		local clockTime
		if self:getPreview_time() > curTime then
			clockTime = self:getPreview_time()
		elseif self:getStart_time() > curTime then
			clockTime = self:getStart_time()
		else
			clockTime = self:getAward_time()
		end
		-- 用于刷新界面
		local tag = string.format("CARNIVAL_CHANGE_%d",self:getId())
		G_ServiceManager:registerOneAlarmClock(tag, clockTime, function()
			self:_refreshVisibleTerm()
			G_SignalManager:dispatch(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE)
		end)
	end
end

-- 注册一个小闹钟刷新界面 --
function CarnivalActivityUnitData:_refreshVisibleTerm()
	self._visibleTerms = {}
	local curTime = G_ServerTime:getTime()
	for k, v in ipairs(self._terms) do
		if v:getAward_time() >= curTime then
			local clockTime
			if v:getPreview_time() > curTime then
				clockTime = v:getPreview_time()
				v:setState(CustomActivityConst.STATE_NOT_START)
			elseif v:getStart_time() > curTime then
				clockTime = v:getStart_time()
				v:setState(CustomActivityConst.STATE_PREVIEW)
				table.insert(self._visibleTerms, v)
			elseif v:getEnd_time() > curTime then
				clockTime = v:getEnd_time()
				v:setState(CustomActivityConst.STATE_ING)
				table.insert(self._visibleTerms, v)
			else
				clockTime = v:getAward_time()
				v:setState(CustomActivityConst.STATE_AWARD_ING)
				table.insert(self._visibleTerms, v)
			end
			local tag = string.format("CARNIVAL_TERM_DATA_CHANGE_%d_%d",self:getId(), v:getTerm())
			G_ServiceManager:registerOneAlarmClock(tag, clockTime, function()
				self:_refreshVisibleTerm()
				G_SignalManager:dispatch(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE)
			end)
		else
			v:setState(CustomActivityConst.STATE_AWARD_END)
		end
	end


end

--self._visibleTerms 排序可能会变化
function CarnivalActivityUnitData:getCurVisibleTermIndexByTermId(termId)
	local index = 1
	for k, v in ipairs(self._visibleTerms) do
		if v:getTerm() == termId then
			index = k
			break
		end
	end
	return index
end

--获取可见的
function CarnivalActivityUnitData:getVisibleTermList()
	return self._visibleTerms
end



--获取 期数数据
function CarnivalActivityUnitData:getTermDataById(id)
	for _, v in pairs(self._terms) do
		if v:getTerm() == id then
			return v
		end
	end
end

function CarnivalActivityUnitData:foreach(callBack)
	for k, v in pairs(self._terms) do
		if callBack then
			callBack(v)
		end
	end
end

--检查活动是否可见
function CarnivalActivityUnitData:checkActIsVisible()
    return  self:isActInPreviewTime() or
        self:checkActIsInRunRewardTime()
end

function CarnivalActivityUnitData:isActInPreviewTime()
	local time = G_ServerTime:getTime()
	local startTime = self:getStart_time()
	local previewTime = self:getPreview_time()
	if previewTime >= startTime then
		return false
	end	
    return time >= previewTime and time < startTime
end

--检查活动是否在活动时间和领奖时间内
function CarnivalActivityUnitData:checkActIsInRunRewardTime()
    local time = G_ServerTime:getTime()
	local startTime = self:getStart_time()
	local endTime = self:getEnd_time()
    local awardTime = self:getAward_time()


    --领奖结束时间或活动结束时间为准
    awardTime = endTime > awardTime and endTime or awardTime

    if awardTime > time and startTime <= time then
        return true
    else
        return false
    end
end


return CarnivalActivityUnitData
