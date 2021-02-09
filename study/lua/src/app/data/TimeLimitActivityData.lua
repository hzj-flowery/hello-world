--管理各种福利活动
--@Author:Conley

local BaseData = require("app.data.BaseData")
local CommonConst = require("app.const.CommonConst")
local TimeLimitActivityData = class("TimeLimitActivityData", BaseData)
local TimeLimitActivityConst = require("app.const.TimeLimitActivityConst")
local ActivitySevenDaySprintInfoData = require("app.data.ActivitySevenDaySprintInfoData")

local schema = {}
TimeLimitActivityData.schema = schema

function TimeLimitActivityData:ctor(properties)
	TimeLimitActivityData.super.ctor(self, properties)
    self._sprintActUnitList = {}
    self._s2cGetSevenDaySprintInfoListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetSevenDaySprintInfo, handler(self, self._s2cGetSevenDaySprintInfo))
end

-- 清除
function TimeLimitActivityData:clear()
    TimeLimitActivityData.super.clear(self)
    self._s2cGetSevenDaySprintInfoListener:remove()
	self._s2cGetSevenDaySprintInfoListener = nil
end

-- 重置
function TimeLimitActivityData:reset()
end

function TimeLimitActivityData:_s2cGetSevenDaySprintInfo(id,message)

    local sprintInfoList = rawget(message,"sprint_info") or {}
    for k,v in ipairs(sprintInfoList) do
        self:_createSprintActUnitData(v)
    end

    G_SignalManager:dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_INFO)
    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_ACTIVITY)--CustomActivityService里处理了，这里还需要么
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_ACTIVITY)

end 

function TimeLimitActivityData:_createSprintActUnitData(v)
    local unitData = ActivitySevenDaySprintInfoData.new(v)
    self._sprintActUnitList[unitData:getType()] = unitData
end

function TimeLimitActivityData:getSprintActUnitData(actType)
    return self._sprintActUnitList[actType]
end

function TimeLimitActivityData:getSprintActUnitList()
    return self._sprintActUnitList
end

--通过ID返回相应活动数据
function TimeLimitActivityData:getActivityDataById(actType,actId)
   	if TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT == actType then
		return G_UserData:getCustomActivity()
	elseif TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT == actType then
        if actId ==  TimeLimitActivityConst.ACTIVITY_TYPE_GUILD_SPRINT then	
            return G_UserData:getGuildSprint()
        end
    elseif TimeLimitActivityConst.ID_TYPE_THREEKINDOMS == actType then
        return G_UserData:getCustomActivity():getThreeKindomsData()
    end
	return nil
end

function TimeLimitActivityData:hasRedPoint()
    local sprintActUnitList = self:getSprintActUnitList()
    for k,v in pairs(sprintActUnitList) do
        local data = self:getActivityDataById( TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT ,v:getType() )
		if data and data.hasRedPoint and data:hasRedPoint() then
            logWarn("TimeLimitActivityData --------------  ".. tostring( v:getType() ) )
			return true
		end
    end

    if G_UserData:getCustomActivity():hasRedPoint() then
     logWarn("TimeLimitActivityData --------------  ")
        return true
    end

	return false
end

--返回：红点,新活动,非新活动的红点
function TimeLimitActivityData:hasRedPointForSubAct(actType,actId)
    local actData = self:getActivityDataById(actType,actId)
    if not actData then
        return false
    end
    if TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT == actType then
		return actData:hasRedPointByActId(actId)
	elseif TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT == actType then
        return actData:hasRedPoint()
    elseif TimeLimitActivityConst.ID_TYPE_THREEKINDOMS == actType then
        return actData:hasRedPoint()
    end
	return false
end

function TimeLimitActivityData:hasTimeLimitActivityCanVisible()

    local sprintActUnitList = self:getSprintActUnitList()
    for k,v in pairs(sprintActUnitList) do
        local data = self:getActivityDataById( TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT , v:getType())
		if data and data.hasActivityCanVisible and data:hasActivityCanVisible() then
			return true
		end
    end

   if G_UserData:getCustomActivity():hasActivityCanVisible() then
        return true
   end
    return false
end

function TimeLimitActivityData:checkTimeLimitActivityChange()
    G_UserData:getCustomActivity():checkTimeLimitActivityChange()
end


return TimeLimitActivityData
