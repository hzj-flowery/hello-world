-- @Author panhoa
-- @Date 11.28.2018
-- @Role 

local BaseData = require("app.data.BaseData")
local ActivityThreeKindomsData = class("ActivityThreeKindomsData", BaseData)
local TimeLimitActivityConst = require("app.const.TimeLimitActivityConst")

local schema = {}
schema["act_id"] 	= {"number", 1}  -- 活动ID
schema["act_type"] 	= {"number", 0}  -- 活动类型
schema["finish_time"]= {"number",0}  -- 活动结束时间
schema["title"]     = {"string", ""} -- 标题 
schema["status"]    = {"number", 0}  -- 三国杀活动状态 (0: 没资格 1: 未报名 2： 已报名 3： 进行中 4: 已结束
schema["combineTaskQueryTask"] = {"table", {}}	-- 奖励状态 


ActivityThreeKindomsData.schema = schema
function ActivityThreeKindomsData:ctor(properties)
	ActivityThreeKindomsData.super.ctor(self)

	if properties then	
		self:updateData(properties)
	end
end

function ActivityThreeKindomsData:clear()	
end

function ActivityThreeKindomsData:reset()
end

-- @Role        返回状态
-- @Result1     是否开启
-- @Result2     是否新活动
-- @Result3     是否红点
function ActivityThreeKindomsData:hasRedPoint()
    local newShowed = not G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(FunctionConst.FUNC_ACTIVITY,
                                                    {actId = TimeLimitActivityConst.ID_TYPE_THREEKINDOMS,
			                                        actType = TimeLimitActivityConst.ID_TYPE_THREEKINDOMS})
    return  true, newShowed, self:_isShowRedPoint()
end

function ActivityThreeKindomsData:updateData(data)
    self:setProperties(data)
end

-- @Role    活动是否结束
function ActivityThreeKindomsData:isActivityFinish()
    if self:getStatus() == 0 then
        return true
    end

    if self:getFinish_time() == 0 then
        return false
    else
        return (G_ServerTime:getLeftSeconds(self:getFinish_time()) <= 0)
    end
end

-- @Role    活动结束时间
-- @Param   finishTime 结束时间戳
function ActivityThreeKindomsData:updateFinishTime(finishTime)
    self:setFinish_time(finishTime ~= nil and finishTime or 0)
end

-- @Role    当前活动状态
-- @Param   status 状态
function ActivityThreeKindomsData:updateStatus(status)
    self:setStatus(status)
end

-- @Role    各个奖励的状态
-- @Role    data 各个奖励状态
function ActivityThreeKindomsData:updateCombineTaskQueryTask(data)
    self:setCombineTaskQueryTask(data)
end

-- @Role    是否显示小红点
function ActivityThreeKindomsData:_isShowRedPoint()
    if self:getCombineTaskQueryTask() == nil then
        return false
    end

    for key, value in pairs(self:getCombineTaskQueryTask()) do
        if value.task_status == 3 then
            return true
        end
    end
    return false
end


return ActivityThreeKindomsData