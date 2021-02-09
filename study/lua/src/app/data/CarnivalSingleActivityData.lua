-- Author: nieming
-- Date:2018-01-13 13:49:54
-- Describle：一个活动有多个任务

local BaseData = require("app.data.BaseData")
local CarnivalSingleActivityData = class("CarnivalSingleActivityData", BaseData)
local CustomActivityConst = require("app.const.CustomActivityConst")

local schema = {}
schema["id"] = {"number", 0}  --活动ID
schema["carnival_id"] = {"number", 0}  --主活动id
schema["term"] = {"number", 0} --期数
schema["stage"] = {"number", 0} --页签
schema["act_type"] = {"number", 0} --活动类型
schema["quest_type"] = {"number", 0} --任务类型
schema["title"] = {"string", ""} --活动标题
schema["desc"] = {"string", ""} --活动标题
schema["title1"] = {"string", ""} --活动标题
schema["desc1"] = {"string", ""} --活动描述
schema["title2"] = {"string", ""} --活动标题
schema["desc2"] = {"string", ""} --活动描述
schema["preview_time"] = {"number", 0}
schema["start_time"] = {"number", 0}
schema["end_time"] = {"number", 0}
schema["award_time"] = {"number", 0}
schema["sort"] = {"number", 0}
schema["drop_res_id"] = {"number", 0}




-- schema["button_id"] = {"number", 0}--未达成显示id

CarnivalSingleActivityData.schema = schema

function CarnivalSingleActivityData:ctor(properties)
	CarnivalSingleActivityData.super.ctor(self, properties)
	self._quests = {}
	self._state = 0
end

function CarnivalSingleActivityData:clear()

end

function CarnivalSingleActivityData:reset()

end

function CarnivalSingleActivityData:getQuestDataById(id)
	for _, v in pairs(self._quests) do
		if v:getQuest_id() == id then
			return v
		end
	end
end

function CarnivalSingleActivityData:insertQuestData(questData)
	table.insert(self._quests, questData)
end

function CarnivalSingleActivityData:clearQuest()
	self._quests = {}
end
--排序
function CarnivalSingleActivityData:sortQuests()
	table.sort(self._quests, function(a, b)
		local aCanReceive = a:isQuestCanReceive()
		local bCanReceive = b:isQuestCanReceive()

		if aCanReceive == bCanReceive then
			local aHasReceive = a:isQuestHasReceive()
			local bHasReceive = b:isQuestHasReceive()
			if aHasReceive == bHasReceive then
				if a:getSort_num() == b:getSort_num() then
					return a:getQuest_id() < b:getQuest_id()
				else
					return a:getSort_num() < b:getSort_num()
				end
			else
				return aHasReceive == false
			end

		else
			return aCanReceive == true
		end
	end)
end

function CarnivalSingleActivityData:getQuests()
	return self._quests
end

function CarnivalSingleActivityData:isQuestCanShow(questData,questUserData)
     if not questData then
        return false
    end
	local limitType = questData:getShow_limit_type()
	local limitValue = questData:getShow_limit_value()
	if limitValue <= 0 then
		return true
	end

	if not questUserData then
		return false
	end
	
	if limitType == CustomActivityConst.QUEST_LIMIT_TYPE_RECHARGE or limitType == CustomActivityConst.QUEST_LIMIT_TYPE_RECHARGE2 then
		return  questUserData:getValue(CustomActivityConst.USER_QUEST_DATA_K_RECHARGE ) >= limitValue 
	elseif limitType == CustomActivityConst.QUEST_LIMIT_YUBI_COST_NUM or 
		   limitType == CustomActivityConst.QUEST_LIMIT_YUBI_COST_AND_OPENDAY then
		local yubiCostNum = questUserData:getProgressValue()
		return yubiCostNum >= limitValue
	end
	return true
end


function CarnivalSingleActivityData:getShowQuests()
 	local dataMap = self._quests
    local dataArr = {}
    for k,v in pairs(dataMap) do
        local actTaskData  = v:getActUserData()
        local canReceive = v:isQuestCanReceive()
        local hasReceive = v:isQuestHasReceive()
        local reachReceiveCondition = v:isQuestReachReceiveCondition()
        local hasLimit = v:checkQuestReceiveLimit()
		local timeLimit = not self:checkActIsInReceiveTime()
		local canShow = self:isQuestCanShow(v,actTaskData)
		if canShow then
			 table.insert(dataArr,
			 {
					actUnitData = self,
					actTaskUnitData = v,
					canReceive = canReceive,
					hasReceive = hasReceive,
					reachReceiveCondition = reachReceiveCondition,
					hasLimit = hasLimit,
					timeLimit = timeLimit,
				}
			)
		end
       

    end
	local sortFuc = function(item01,item02)
        if item01.canReceive ~= item02.canReceive then
              return item01.canReceive
        end
        if item01.hasReceive ~= item02.hasReceive then
            if item01.hasReceive then
                return false
            else
                return true
            end
        end
        return item01.actTaskUnitData:getSort_num() < item02.actTaskUnitData:getSort_num()
    end
    table.sort(dataArr,sortFuc)
	return dataArr
end

function CarnivalSingleActivityData:initData(data)
	self:setProperties(data)
	self:_registerClock()
end

function CarnivalSingleActivityData:_registerClock()
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
		-- 避免抛出多个事件 已活动时间做key
		-- 用于刷新界面
		logWarn("CarnivalSingleActivityData registerClock")
		local tag = string.format("CARNIVAL_ACTIVITY_DATA_CHANGE_%d",clockTime)
		G_ServiceManager:registerOneAlarmClock(tag, clockTime, function()
			G_SignalManager:dispatch(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE)
		end)
	end
end

--检查活动是否可见
function CarnivalSingleActivityData:checkActIsVisible()
    return  self:isActInPreviewTime() or
        self:checkActIsInRunRewardTime()
end


function CarnivalSingleActivityData:isInTimeRange(minTime,maxTime)
	local time = G_ServerTime:getTime()
	--[[
	if minTime > maxTime then
		minTime = maxTime
	end 
	]]
	 return time >= minTime and time < maxTime
end

function CarnivalSingleActivityData:isActInPreviewTime()
	local time = G_ServerTime:getTime()
	local startTime = self:getStart_time()
	local previewTime = self:getPreview_time()
	if previewTime >= startTime then
		return false
	end	
    return time >= previewTime and time < startTime
end

--检查活动是否在活动时间和领奖时间内
function CarnivalSingleActivityData:checkActIsInRunRewardTime()
    local time = G_ServerTime:getTime()
	local startTime = self:getStart_time()
	local endTime = self:getEnd_time()
    local awardTime = self:getAward_time()

	--logWarn("CarnivalSingleActivityData time  "..tostring(time))

    --领奖结束时间或活动结束时间为准
    awardTime = endTime > awardTime and endTime or awardTime
	
    if awardTime > time and startTime <= time then
        return true
    else
        return false
    end
end

function CarnivalSingleActivityData:checkActIsInReceiveTime()
	if self:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL then
		return self:isInTimeRange(self:getStart_time(),self:getEnd_time())
	else
		return self:checkActIsInRunRewardTime()
	end
end

--活动是否有效
function CarnivalSingleActivityData:isActValid()
	local termData = G_UserData:getCarnivalActivity():getTermData(self:getCarnival_id(), self:getTerm())
	if not termData then
		return false
	end
	--当期活动未开启
	if not termData:checkActIsInRunRewardTime() then
		return false
	end
	--活动期间内
	if not self:checkActIsInRunRewardTime() then
		return false
	end
	return true
end

function CarnivalSingleActivityData:isHasRedPoint()
	local termData = G_UserData:getCarnivalActivity():getTermData(self:getCarnival_id(), self:getTerm())
	if not termData then
		return false
	end
	--当期活动未开启
	if not (termData:getState() == CustomActivityConst.STATE_ING or
		termData:getState() == CustomActivityConst.STATE_AWARD_ING) then
		return false
	end
	--活动期间内
	if not self:checkActIsInReceiveTime() then
		return false
	end
	--兑换类
	if self:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL then
		local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
			FunctionConst.FUNC_CARNIVAL_ACTIVITY,{actId = self:getId()}
		)
		if showed then
			return false
		end
	end

	for _, v in pairs(self._quests) do
		if v:isQuestCanReceive() then
			return true
		end
	end
	return false
end




function CarnivalSingleActivityData:getFunctionId()
    local FunctionConst = require("app.const.FunctionConst")
    local buttonId = nil--self:getButton_id()

    if buttonId == CustomActivityConst.ACT_BUTTON_TYPE_RECEIVE_GRAY then--领取(灰色，无功能)
        return 0
    elseif buttonId == CustomActivityConst.ACT_BUTTON_TYPE_GO_RECHARGE then--去充值(跳转去充值)
        return FunctionConst.FUNC_RECHARGE
    end
    return 0
end

function CarnivalSingleActivityData:getShow_schedule()
	return 1
end

return CarnivalSingleActivityData
