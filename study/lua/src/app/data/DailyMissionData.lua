--任务数据
local BaseData = require("app.data.BaseData")
local DailyMissionData = class("DailyMissionData", BaseData)
local DailyTaskInfo = require("app.config.daily_task")
--local schema = {}
--schema["level"] 		= {"number", 0}
--schema["exp"] 			= {"number", 0}
--DailyMissionData.schema = schema

DailyMissionData.DIALY_ACTIVITY_TYPE = 201     --日常任务活跃积分类型
DailyMissionData.DIALY_TASK_TYPE = 1           --日常任务类型 对应daily_reward_info表中的system_type

local DAILY_PREV = "daily_"

DailyMissionData.PARAM_LIME_SHOW_KEY = 175
--



function DailyMissionData:ctor(properties)
	DailyMissionData.super.ctor(self, properties)

	self._getDailyInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_GetDailyTaskInfo, handler(self, self._s2cGetDailyTaskInfo))
    self._getDailyReward = G_NetworkManager:add(MessageIDConst.ID_S2C_GetDailyTaskAward, handler(self, self._s2cGetDailyTaskReward))
    self._getDailyInfoUpdate = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateDailyTaskInfo, handler(self, self._s2cUpdateDailyTaskInfo))
	self._vipFuncDataList = nil --vip data数据列表
	
	self._dailyMissionList = {}
end

-- 清除
function DailyMissionData:clear()
    self._getDailyInfo:remove()
    self._getDailyInfo = nil

    self._getDailyReward:remove()
    self._getDailyReward = nil
end

-- 重置
function DailyMissionData:reset()

end




function DailyMissionData:_setOneDailyDailyMissionData( mission )
    if mission==nil or type(mission)~="table" then 
        return 
    end
    local t = {}
    t.type = mission.type
    t.value = mission.value
    if rawget(mission, "reward_id") then
        t.reward_id = mission.reward_id
    else
        t.reward_id = {}
    end
    self._dailyMissionList[DAILY_PREV..t.type] = t
end



--日常任务进度更新
function DailyMissionData:updateDailyTaskData(message)

    if message==nil or type(message)~="table" then 
        return 
    end

    local dailyMissions = rawget(message, "tasks") or {}

    for i=1, #dailyMissions do
        self:_setOneDailyDailyMissionData(dailyMissions[i])
    end

end


function DailyMissionData:_getDailyMisssions(isActivityData)
    local level = self._level
    local curLevelTasks = {}

    local function saveData(oneTask)
        local minLevel = tonumber(oneTask["level_min"])
        local maxLevel = tonumber(oneTask["level_max"])
        local minDay = tonumber(oneTask["day_min"])
        local maxDay = tonumber(oneTask["day_max"])
        local functionId = tonumber(oneTask["function_id"])
        local openServerDay = G_UserData:getBase():getOpenServerDayNum()
        -- 满足等级条件才显示
        if ( self._level >= minLevel and maxLevel >= self._level ) and
           ( openServerDay >= minDay and openServerDay <= maxDay ) 
        then
             if functionId == FunctionConst.FUNC_SHARE_GO then
                if G_ConfigManager:isShare() then
                    curLevelTasks[#curLevelTasks + 1] = oneTask
                end 
             else
                curLevelTasks[#curLevelTasks + 1] = oneTask
             end
        end 
    end
   
    for index = 1, DailyTaskInfo.length()  do
   
        local oneTask = DailyTaskInfo.indexOf(index)
        assert(oneTask, "Could not find the task info id : "..tostring(index))

        --名字拼接
        local taskName = oneTask["name"]
        oneTask["name"] = string.format(taskName, oneTask["require_value"])

        local require_type = tonumber(oneTask["condition"])
        local condition = true
        oneTask.value = 0
        oneTask.finish = false    --是否完成任务
        oneTask.getAward = false  --默认没有领取 
        if isActivityData == false and DailyMissionData.DIALY_ACTIVITY_TYPE ~= require_type then
            local openFuncId = oneTask["level_function_id"]
            local funInfo = nil
            if openFuncId > 0 then
                funInfo = require("app.config.function_level").get(openFuncId)
                assert(funInfo, " can not find function_level in daily_task id="..oneTask.id)
                local isOpen = G_UserData:getBase():getLevel() >= funInfo.level
                if isOpen then
                    oneTask.icon = funInfo and funInfo.icon  --功能Icon 
                    saveData(oneTask)
                end
            end
      
        elseif isActivityData == true and DailyMissionData.DIALY_ACTIVITY_TYPE == require_type then
            saveData(oneTask)
        end
   end

   return curLevelTasks
end


--是否显示日常任务标签红点
function DailyMissionData:getNewAward()
    local award1 = self:hasAnyRewardCanGet(true) > 0 
    local award2 = self:hasAnyRewardCanGet(false) > 0 
    return award1 or award2
end


function DailyMissionData:hasAnyRewardCanGet(isActivityData)

    local dailyMissions = self:getDailyMissionDatas(isActivityData)

    local canGetAwardNum = 0

    for i=1, #dailyMissions do
        local mission = dailyMissions[i]
        local value = tonumber(mission["value"])

        --达成条件并未领奖
        if not mission.getAward and mission.value >= mission.require_value then
            canGetAwardNum = canGetAwardNum + 1
            break
        end
    end

    --return false
    return canGetAwardNum

end

function DailyMissionData:getDailyMisssonDataById( missionId )
    local dataList = self:getDailyMissionDatas()
    for i, value in ipairs(dataList) do
        if value.id == missionId then
            return value
        end
    end
    return nil
    -- body
end
--获取日常任务数据
function DailyMissionData:getDailyMissionDatas(isActivityData)

    local dailyMission = self:_getDailyMisssions(isActivityData)  

    if dailyMission == nil then
        return {}
    end

    local function isRewardTake(serverTask,missionId)
        if serverTask.reward_id then
            for j = 1,#serverTask.reward_id do
                if serverTask.reward_id[j] == missionId then
                    return true
                end
            end
        end
        return false
    end

--    dump(dailyMission)
    ---根据服务端的完成情况，刷新本地的完成情况
    for i=1, #dailyMission do
        local serverTask = self._dailyMissionList[DAILY_PREV..dailyMission[i].condition]

        if serverTask then
            dailyMission[i].value = serverTask.value
            dailyMission[i].finish = dailyMission[i].value >= dailyMission[i].require_value
            dailyMission[i].getAward = isRewardTake(serverTask, dailyMission[i].id)
        end
        

    end 

    table.sort(dailyMission, function(item1, item2)
        if item1.order ~= item2.order then
            return item1.order < item2.order
        end
    end)

    if isActivityData == false then

        table.sort(dailyMission, function(a, b)
            local canGetAward_a = a.value >= a.require_value and not a.getAward
            local canGetAward_b = b.value >= b.require_value and not b.getAward

            if a.getAward ~= b.getAward then
                return not a.getAward
            elseif canGetAward_a ~= canGetAward_b then
                return canGetAward_a
            elseif a.order ~= b.order then
                return a.order < b.order
            else
                return a.id < b.id
            end
        end)
    end

    return dailyMission

end


--获取日常任务活跃积分领奖情况
function DailyMissionData:getActivityDatas()

    local boxRewardData = nil

    local serverTasks = self._dailyMissionList

    if serverTasks then
        for k, task in pairs(serverTasks) do
            if task.type == DailyMissionData.DIALY_ACTIVITY_TYPE then
                boxRewardData = task
            end
        end
    end

    return boxRewardData
end



--获取日常任务积分宝箱奖励数据
function DailyMissionData:getActivityConfigDatas()
    
    local activityRewards = self:_getDailyMisssions(true)

    table.sort(activityRewards, function(item1, item2)
        return item1.require_value < item2.require_value
    end)

     local function isRewardTake(serverTask, activiyId)
        if serverTask.reward_id then
            for j = 1,#serverTask.reward_id do
                if serverTask.reward_id[j] == activiyId then
                    return true
                end
            end
        end
        return false
    end

    local serverData = self:getActivityDatas()
    
    for i, value in ipairs(activityRewards) do
        value.getAward = false
        if serverData then
            value.getAward = isRewardTake(serverData, value.id)
        end
        
    end

    return activityRewards

end


function DailyMissionData:c2sGetDailyTaskInfo()
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetDailyTaskInfo, {})
end

function DailyMissionData:c2sGetDailyTaskAward(missionId)
    --判断是否过期
    if self:isExpired() == true then
        self:c2sGetDailyTaskInfo()
        return
    end
	if missionId then
		local message = {
			id = missionId
		}
		G_NetworkManager:send(MessageIDConst.ID_C2S_GetDailyTaskAward, message)
	end
end


--
--[[
message DailyTask {
	required uint32 type = 1;       //任务类型,与daily_reward_info.xml的类型一致
	required uint32 value = 2;      //对应类型的当前积累值
	repeated uint32 reward_id = 3;  //已领取过的ID集合 
}
]]
function DailyMissionData:_s2cGetDailyTaskInfo(id, message)
	local level = rawget(message, "level") or 0
	local dailyMissions = rawget(message, "tasks") or {}
	self._level = level

    self:resetTime()
	self._dailyMissionList = {}

    for i=1,#dailyMissions do
        self:_setOneDailyDailyMissionData(dailyMissions[i])
    end
	
    G_SignalManager:dispatch(SignalConst.EVENT_DAILY_TASK_INFO, message)

    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_DAILY_MISSION)
end

function DailyMissionData:_s2cGetDailyTaskReward(id, message)
	if message.ret ~= 1 then
		return
	end

    G_SignalManager:dispatch(SignalConst.EVENT_DAILY_TASK_AWARD, message)

    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_DAILY_MISSION)

end

function DailyMissionData:_s2cUpdateDailyTaskInfo(id,message)

    self:updateDailyTaskData(message)

    G_SignalManager:dispatch(SignalConst.EVENT_DAILY_TASK_UPDATE, message)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,  FunctionConst.FUNC_DAILY_MISSION)
end


--游戏分享
function DailyMissionData:c2sGameShare( ... )
    -- body
    local message = {}
    G_NetworkManager:send(MessageIDConst.ID_C2S_GameShare, message)
end

function DailyMissionData:getDailyAwardExp( cfgData )
    -- body
    local awardActive = cfgData.reward_active
    local rewardExp = cfgData.reward_exp
    if awardActive == nil then
        awardActive= 1
    end
    local serverDay = G_UserData:getBase():getOpenServerDayNum()
    
    if serverDay <= 0 then
        return nil
    end

    local DailyTaskExp = require("app.config.daily_task_exp")
    local expCfg = DailyTaskExp.get(serverDay)
    if expCfg == nil then
       expCfg = DailyTaskExp.indexOf(DailyTaskExp.length())
    end
    
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local DataConst = require("app.const.DataConst")

    return {type= TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_EXP, size = expCfg.exp * rewardExp}
end
return DailyMissionData