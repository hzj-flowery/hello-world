--配置活动数据
--@Author:Conley
local BaseData = import(".BaseData")
local CustomActivityData = class("CustomActivityData", BaseData)
local TimeLimitActivityConst = require("app.const.TimeLimitActivityConst")
local CustomActivityConst = require("app.const.CustomActivityConst")
local DataConst = require("app.const.DataConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local ActivityEquipDataHelper = require("app.utils.data.ActivityEquipDataHelper")
local FunctionCheck = require("app.utils.logic.FunctionCheck")
local CustomActivityFundsHelper = require("app.scene.view.customactivity.CustomActivityFundsHelper")
local VipGeneralGoodsData = require("app.data.VipGeneralGoodsData")

local schema = {}
schema["hasData"] 	= {"boolean",false}--是否有数据

CustomActivityData.schema = schema

function CustomActivityData:ctor(properties)
	CustomActivityData.super.ctor(self, properties)

    self._s2cGetCustomActivityInfoListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCustomActivityInfo, handler(self, self._s2cGetCustomActivityInfo))
    self._s2cGetCustomActivityAwardListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCustomActivityAward, handler(self, self._s2cGetCustomActivityAward))
    self._s2cUpdateCustomActivityListener = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateCustomActivity, handler(self, self._s2cUpdateCustomActivity))
    self._s2cUpdateCustomActivityQuestListener = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateCustomActivityQuest, handler(self, self._s2cUpdateCustomActivityQuest))
    self._s2cGetUserCustomActivityQuestListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetUserCustomActivityQuest, handler(self, self._s2cGetUserCustomActivityQuest))
    self._s2combineTaskQueryTask = G_NetworkManager:add(MessageIDConst.ID_S2C_MJZ2SS_CombineTaskQueryTask, handler(self, self._s2cCombineTaskQueryTask)) -- 手杀联动
    self._s2cGetCustomActivityFundAwardListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCustomActivityFundAward, handler(self, self._s2cGetCustomActivityFundAward)) -- 基金活动
	-- self._signalZeroTime = G_SignalManager:add(SignalConst.EVENT_ZERO_CLOCK, handler(self, self._onEventZeroTime))
    self._s2cGetActVipGiftListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetActVipGift, handler(self, self._s2cGetActVipGift))
    self._s2cBuyVipGiftListener = G_NetworkManager:add(MessageIDConst.ID_S2C_BuyVipGift, handler(self, self._s2cBuyVipGift))

    self._s2cBuyReturnGiftListener = G_NetworkManager:add(MessageIDConst.ID_S2C_BuyDailySeller, handler(self, self._s2cBuyReturnGift))
    self._s2cCheckBuyReturnGiftListener = G_NetworkManager:add(MessageIDConst.ID_S2C_CheckDailySeller, handler(self, self._s2cCheckBuyReturnGift))

    local TimeConst = require("app.const.TimeConst")
	self:setResetTime(TimeConst.RESET_TIME_24)

    self:_initData()
end

function CustomActivityData:_initData()
    self._actUnitDataList = {}
    self._userTaskDataList = {}
    self._taskUnitData = {}
    self._threeKindomsDataList = nil -- 三国杀信息
    self._fundsDataList = {}        -- 基金基础信息
    self._vipRecommendGiftList = {} --vip推送礼包
end

-- 清除
function CustomActivityData:clear()
    CustomActivityData.super.clear(self)
    self._s2cGetCustomActivityInfoListener:remove()
	self._s2cGetCustomActivityInfoListener = nil
    self._s2cGetCustomActivityAwardListener:remove()
	self._s2cGetCustomActivityAwardListener = nil
    self._s2cUpdateCustomActivityListener:remove()
	self._s2cUpdateCustomActivityListener = nil
    self._s2cUpdateCustomActivityQuestListener:remove()
	self._s2cUpdateCustomActivityQuestListener = nil
    self._s2cGetUserCustomActivityQuestListener:remove()
    self._s2cGetUserCustomActivityQuestListener = nil
    self._s2combineTaskQueryTask:remove()
    self._s2combineTaskQueryTask = nil
    self._s2cGetCustomActivityFundAwardListener:remove()
    self._s2cGetCustomActivityFundAwardListener = nil
	-- self._signalZeroTime:remove()
	-- self._signalZeroTime = nil
    self._s2cGetActVipGiftListener:remove()
    self._s2cGetActVipGiftListener = nil
    self._s2cBuyVipGiftListener:remove()
    self._s2cBuyVipGiftListener = nil

    self._s2cBuyReturnGiftListener:remove()
    self._s2cBuyReturnGiftListener = nil
    self._s2cCheckBuyReturnGiftListener:remove()
    self._s2cCheckBuyReturnGiftListener = nil
end

-- 重置
function CustomActivityData:reset()
	CustomActivityData.super.reset(self)
	self:setHasData(false)

    self:_initData()
end

--登陆服务器推送
function CustomActivityData:_s2cGetCustomActivityInfo(id,message)
  	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

    --dump(message,"**********************************************",6)
    self:setHasData(true)
    self:resetTime()--取到用户进度时重置
    self:_initData()
    if FunctionCheck.funcIsOpened(TimeLimitActivityConst.ID_TYPE_THREEKINDOMS) and G_ConfigManager:isDownloadThreeKindoms() then
        local deviceId = G_NativeAgent:getDeviceId()
        if deviceId ~= nil and deviceId ~= "unknown" then
            local startidx, endidx, strnil = string.find(deviceId, "_sn", -3)
            if type(startidx) ~= "number" and type(endidx) ~= "number" then
                self:c2sCombineTaskQueryTask() --请求手杀联动
            end
        end
    end

    self._fundsDataList = CustomActivityFundsHelper.getFundsBaseInfo()
    local activity = rawget(message,"activity") or {}
    for k,v in ipairs(activity) do
        self:_createActUnitData(v)
    end


    local quest = rawget(message,"quest") or {}
    for k,v in ipairs(quest) do
        self:_createActTaskUnitData(v)
    end

    local userQuest = rawget(message,"user_quest") or {}
    for k,v in ipairs(userQuest) do
        self:_createActUserTaskData(v)
    end

    --dump(message)

     G_SignalManager:dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_INFO)
     G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_ACTIVITY)--CustomActivityService里处理了，这里还需要么
     G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_ACTIVITY)

end

function CustomActivityData:_s2cGetCustomActivityAward(id,message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

    G_SignalManager:dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_GET_AWARD,message)
end

--活动内容同步
function CustomActivityData:_s2cUpdateCustomActivity(id,message)
    local activity = rawget(message,"activity") or {}
    for k,v in ipairs(activity) do
        self:_deleteActData(v.act_id)
        self:_createActUnitData(v)
    end


    local quest = rawget(message,"quest") or {}
    for k,v in ipairs(quest) do
        self:_createActTaskUnitData(v)
    end

    local deleteActivityIds = rawget(message,"delete_activity") or {}
    for k,v in ipairs(deleteActivityIds) do--被删除的活动ID
        self:_deleteActData(v)
    end

    --可能有新活动，这里要拉取进度数据
    self:c2sGetUserCustomActivityQuest()

    G_SignalManager:dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_UPDATE,message)

    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_ACTIVITY)--CustomActivityService里处理了，这里还需要么
end

--进度数据同步
function CustomActivityData:_s2cUpdateCustomActivityQuest(id,message)
    local userQuest = rawget(message,"user_quest") or {}
    for k,v in ipairs(userQuest) do
        self:_createActUserTaskData(v)
    end
    G_SignalManager:dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_UPDATE_QUEST,message)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_ACTIVITY)
    --和服务器对下，是不是实时同步
end

--进度数据拉取回包
function CustomActivityData:_s2cGetUserCustomActivityQuest(id,message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
    self:resetTime()--取到用户进度时重置
    self._userTaskDataList = {}
	local userQuest = rawget(message,"user_quest") or {}
    for k,v in ipairs(userQuest) do
        self:_createActUserTaskData(v)
    end
    G_SignalManager:dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_UPDATE_QUEST,message)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_ACTIVITY)
end

function CustomActivityData:_createActUnitData(data)
    local CustomActivityUnitData = require("app.data.CustomActivityUnitData")
    local actUnitData = CustomActivityUnitData.new()
    actUnitData:initData(data)
    self._actUnitDataList[data.act_id] = actUnitData
    return actUnitData
end


function CustomActivityData:_createActTaskUnitData(data)
    local CustomActivityTaskUnitData = require("app.data.CustomActivityTaskUnitData")
    local actTaskUnitData = CustomActivityTaskUnitData.new()
    actTaskUnitData:initData(data)
    --TODO KEY 是否设置成字符串，避免服务器传入ID是0或者其他无效值
    if not self._taskUnitData[data.act_id] then
        self._taskUnitData[data.act_id] = {}
    end
    self._taskUnitData[data.act_id][data.quest_id] = actTaskUnitData
    return actTaskUnitData
end

function CustomActivityData:_createActUserTaskData(data)
    local CommonActivityUserTaskData = require("app.data.CommonActivityUserTaskData")
    local actUserTaskData = CommonActivityUserTaskData.new()
    actUserTaskData:initData(data)
    self._userTaskDataList[data.act_id.."_"..data.quest_id] = actUserTaskData
    return actUserTaskData
end

function CustomActivityData:_deleteActData(actId)
    self._actUnitDataList[actId] = nil
    self:_deleteActTaskUnitDataByActId(actId)
end

function CustomActivityData:_deleteActTaskUnitDataByActId(actId)
    self._taskUnitData[actId] = nil
end

function CustomActivityData:getActUnitDataById(actId)
    return self._actUnitDataList[actId]
end

function CustomActivityData:getActTaskDataById(actId,questId)
    return self._userTaskDataList[actId.."_"..questId]
end

function CustomActivityData:getActTaskUnitDataById(actId,questId)
    if not self._taskUnitData[actId] then
        return nil
    end
    return self._taskUnitData[actId][questId]
end

-- @Role    获取基金信息
-- @Param   actid 活动Id
function CustomActivityData:getActTaskUnitDataForFundsById(actId)
    if not self._taskUnitData[actId] then
        return nil
    end

    return self._taskUnitData[actId]
end

-- @Role    兑换类型活动是否在兑换时间
function CustomActivityData:isActTaskSellTypeRunning()
    for key,value in pairs(self._actUnitDataList) do
        if value and value:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL then
            return G_ServerTime:getLeftSeconds(value:getStart_time()) <= 0 and G_ServerTime:getLeftSeconds(value:getEnd_time()) > 0
        end
    end
    return false
end

function CustomActivityData:getActTaskUnitDataListById(actId)
   return self._taskUnitData[actId] or {}
end

function CustomActivityData:getShowActUnitDataArr()
    local dataArr = {}
    local isReturnServer = G_GameAgent:isLoginReturnServer()

    for k,v in pairs( self._actUnitDataList) do
        if CustomActivityConst.CUSTOM_ACTIVITY_TYPE_FUNDS == v:getAct_type() then
            local bActived, rewardedFinishTime = self:_checkActivedFunds(v:getAct_id())
            if bActived then
                if v:checkFundsActIsVisible(rewardedFinishTime) then
                    table.insert( dataArr, v )
                end
            else
                if v:checkActIsVisible() then
                    table.insert( dataArr, v )
                end
            end
        elseif not isReturnServer and CustomActivityConst.CUSTOM_ACTIVITY_TYPE_RETURN_SERVER_GIFT == v:getAct_type() then
            -- 回归服活动在正式服不显示
        else
            if v:checkActIsVisible() then
                table.insert( dataArr, v )
            end
        end
    end
    local sortFuc = function(unit01,unit02)
        if unit01:getSort_num() ~= unit02:getSort_num() then
            return unit01:getSort_num() < unit02:getSort_num()
        end
        return unit01:getAct_id() > unit02:getAct_id()
    end
    table.sort(dataArr,sortFuc)
    return dataArr
end


function CustomActivityData:refreshShowTaskData(dataArr)
    for k,data in ipairs(dataArr) do
        local v = data.actTaskUnitData
        local actTaskData  = self:getActTaskDataById(v:getAct_id(),v:getId())--用户任务数据
        local canReceive = G_UserData:getCustomActivity():isTaskCanReceived(v:getAct_id(),v:getId())
        local hasReceive = v:isTaskHasReceive(actTaskData)
        local reachReceiveCondition = G_UserData:getCustomActivity():isTaskReachReceiveCondition(
            v:getAct_id(),v:getId())
        local hasLimit = G_UserData:getCustomActivity():isHasTaskReceiveLimit(v:getAct_id(),v:getId())
        local timeLimit = not data.actUnitData:isActInRunTime()

        dataArr[k] = {
                actUnitData = data.actUnitData,
                actTaskUnitData = v,
                canReceive = canReceive,
                hasReceive = hasReceive,
                reachReceiveCondition = reachReceiveCondition,
                hasLimit = hasLimit,
                timeLimit = timeLimit,
            }

    end

end

function CustomActivityData:getShowTaskUnitDataArrById(actId)
    local actUnitData = self:getActUnitDataById(actId)
    if not actUnitData then
        return {}
    end
    local dataMap = self:getActTaskUnitDataListById(actId)
    local dataArr = {}
    for k,v in pairs(dataMap) do
    logWarn("sss----------------- sss")
        local actTaskData  = self:getActTaskDataById(v:getAct_id(),v:getId())--用户任务数据
        local canReceive = G_UserData:getCustomActivity():isTaskCanReceived(v:getAct_id(),v:getId())
        local hasReceive = v:isTaskHasReceive(actTaskData)
        local reachReceiveCondition = G_UserData:getCustomActivity():isTaskReachReceiveCondition(
            v:getAct_id(),v:getId())
        local canShow =  G_UserData:getCustomActivity():isQuestCanShow(v:getAct_id(),v:getId())
        local hasLimit = G_UserData:getCustomActivity():isHasTaskReceiveLimit(v:getAct_id(),v:getId())
        local timeLimit = not actUnitData:isActInRunTime()
        if canShow then
              table.insert(dataArr,
              {
                    actUnitData = actUnitData,
                    actTaskUnitData = v,
                    canReceive = canReceive,
                    hasReceive = hasReceive,
                    reachReceiveCondition = reachReceiveCondition,
                    hasLimit = hasLimit,
                    timeLimit = timeLimit,
                }
            )
        else
              logWarn("jjs----------------- sss")    
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
    return  dataArr
end

--此任务是否能领取奖励
function CustomActivityData:isTaskCanReceived(actId,taskId)
    local actUnitData = self:getActUnitDataById(actId)
    if not actUnitData then
        return false
    end
    if not actUnitData:isActInRewardTime() then
		return false
	end

	local reachReceiveCondition = self:isTaskReachReceiveCondition(actId,taskId)
	if not reachReceiveCondition then
		return false
	end

	local actTaskUnitData =  self:getActTaskUnitDataById(actId,taskId)
    if not actTaskUnitData then
        return false
    end

	local actTaskData  =  self:getActTaskDataById(actId,taskId)
	local canReceive =  not actTaskUnitData:isHasTaskReceiveLimit(actTaskData)
	return canReceive
end

--此任务是否能满足领取条件
function CustomActivityData:isTaskReachReceiveCondition(actId,taskId)
    local actTaskUnitData =  self:getActTaskUnitDataById(actId,taskId)
     if not actTaskUnitData then
        return false
    end
	local actTaskData =  self:getActTaskDataById(actId,taskId)
	local reachCondition =  actTaskUnitData:isTaskReachReceiveCondition(actTaskData)
	return reachCondition
end

-- 是否有足够的东西进行兑换
function CustomActivityData:isEnoughValue( checkType, checkValue, checkSize )
    local currNum = UserDataHelper.getNumByTypeAndValue(checkType, checkValue)
    if currNum >= checkSize then
        return true
    end
    return false
end


function CustomActivityData:isHasTaskReceiveLimit(actId,taskId)
    local actTaskUnitData =  self:getActTaskUnitDataById(actId,taskId)
     if not actTaskUnitData then
        return false
    end
	local actTaskData =  self:getActTaskDataById(actId,taskId)
	local hasLimit =  actTaskUnitData:isHasTaskReceiveLimit(actTaskData)
	return hasLimit
end

function CustomActivityData:isQuestCanShow(actId,questId)
    local questData =  self:getActTaskUnitDataById(actId,questId)
     if not questData then
        return false
    end
    local questUserData = self:getActTaskDataById(actId,questId)
	local limitType = questData:getShow_limit_type()
	local limitValue = questData:getShow_limit_value()
    if limitValue <= 0 then
		return true
	end

	if limitType == CustomActivityConst.QUEST_LIMIT_TYPE_RECHARGE or limitType == CustomActivityConst.QUEST_LIMIT_TYPE_RECHARGE2 then
        if not questUserData then
            return false
        end
		return  questUserData:getValue(CustomActivityConst.USER_QUEST_DATA_K_RECHARGE ) >= limitValue 
	end
	return true
end

function CustomActivityData:c2sGetCustomActivityInfo()
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetCustomActivityInfo,  {})
end

--@actId:活动id
--@questId:任务id
--@awardId:可选奖励的第几个奖励 从1开始
--@awardNum:兑换奖励兑换次数
function CustomActivityData:c2sGetCustomActivityAward(actId,questId,awardId,awardNum)
    if self:isExpired() == true then
		self:pullData()
		return
	end
    --[[
    if self:_isActivityExpired() then
        G_SignalManager:dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_EXPIRED)
    end
    ]]
    awardNum = awardNum or 1
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetCustomActivityAward,
        {act_id = actId,quest_id = questId,award_id = awardId,award_num = awardNum})
end

function CustomActivityData:c2sGetUserCustomActivityQuest()
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetUserCustomActivityQuest,  {})
end

function CustomActivityData:pullData()
	self:c2sGetUserCustomActivityQuest()
end

--判断是否有可见活动
function CustomActivityData:hasActivityCanVisible()
     if not self:isHasData() then
        return false
     end
     for k,v in pairs( self._actUnitDataList) do
        if v:checkActIsVisible() then
           return true
        end
     end
    return false
end

function CustomActivityData:checkTimeLimitActivityChange()
     if not self:isHasData() then
        return
     end
     local changed = false
     for k,v in pairs( self._actUnitDataList) do
        local visible = v:checkActIsVisible()
        local lastVisible = v:isLast_act_visible()
        if visible ~= lastVisible then
            v:setLast_act_visible(visible)
            logWarn(string.format("CustomActivityData EVENT_CUSTOM_ACTIVITY_OPEN_NOTICE ActId %s ActType %s  visible %s",
                tostring( v:getAct_id()),tostring( v:getAct_type()),tostring(visible)))
            G_SignalManager:dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_OPEN_NOTICE,v,visible)
            changed = true
        end
     end
     if changed then
         --G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_ACTIVITY)
     end
end




function CustomActivityData:isActivityExpiredById(actId)
    local actData = self:getActUnitDataById(actId)
    if not actData then
        return true
    end
    return not actData:checkActIsVisible()
end

function CustomActivityData:_isActivityExpired()
     for k,v in pairs( self._actUnitDataList) do
        if not v:checkActIsVisible() then
           return true
        end
     end
    return false
end


function CustomActivityData:resetData()
	self:pullData()
	self:setNotExpire()--避免重复取数据
end


--注意 ，因为服务器没有同步，需要在进入主界面时候拉取下进度数据，不然红点没法显示
function CustomActivityData:hasRedPoint(params)
--[[
    --功能开启时候显示红点
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_ACTIVITY)
    if not isOpen then
        return false
    end
]]
    if not params then
        --配置活动是否有红点
        for k,v in pairs(self._actUnitDataList) do
            if v:checkActIsVisible() then
               local red = self:hasRedPointByActId(v:getAct_id())
               if red then
                    return true
               end
            end
        end
        return false
	elseif params and type(params) == 'number' then
        --指定的活动ID是否有红点
        local red = self:hasRedPointByActId(params)
        return red
	end
	return false
end

function CustomActivityData:hasRedPointByActId(actId)
    --其他活动
        --还有任务没完成时(每日一次)
        --有奖励可领取时（始终）
    --兑换活动
        --还有商品没有兑换（每日一次）
    local actUnitData = self:getActUnitDataById(actId)
    if not actUnitData then
        return false
    end
    if actUnitData:isExchangeAct() then
        local showNewTag = self:_hasGoodsCanExchange(actId)
        return showNewTag,showNewTag,false
	elseif actUnitData:isAvatarAct() then
		local showNewTag = not G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
			FunctionConst.FUNC_ACTIVITY,{actId = actId,actType = TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT}
	    )
		local redPoint = self:_avatarActivityHasRedPoint()
        return  showNewTag or redPoint,showNewTag,redPoint
    elseif actUnitData:isEquipAct() then
        local showNewTag = not G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
            FunctionConst.FUNC_ACTIVITY,{actId = actId,actType = TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT}
        )
        local redPoint = self:_equipActivityHasRedPoint()
        return  showNewTag or redPoint,showNewTag,redPoint
    elseif actUnitData:isPetAct() then
        local showNewTag = not G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
            FunctionConst.FUNC_ACTIVITY,{actId = actId,actType = TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT}
        )
        local redPoint = self:_petActivityHasRedPoint()
        return  showNewTag or redPoint,showNewTag,redPoint
    elseif actUnitData:isHorseConquerAct() then
        local showNewTag = not G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
            FunctionConst.FUNC_ACTIVITY,{actId = actId,actType = TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT}
        )
        local redPoint = self:_horseConquerActivityHasRedPoint()
        return  showNewTag or redPoint,showNewTag,redPoint
    elseif actUnitData:isHorseJudgeAct() then
        local showNewTag = not G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
            FunctionConst.FUNC_ACTIVITY,{actId = actId,actType = TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT}
        )
        return  showNewTag
    elseif actUnitData:isFundsJudgeAct() then
        local showNewTag = not G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
            FunctionConst.FUNC_ACTIVITY,{actId = actId,actType = TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT}
        )
        local redPoint = self:_fundsRedPoint(actId)
        return  showNewTag or redPoint,showNewTag,redPoint
    elseif actUnitData:isVipRecommendGiftAct() then
        local showNewTag = not G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
            FunctionConst.FUNC_ACTIVITY,{actId = actId,actType = TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT}
        )
        return false, showNewTag, false
    else
        local showNewTag = self:_hasTaskNotComplete(actId)
        local redPoint = self:_hasActCanReceived(actId)
        return  showNewTag or redPoint,showNewTag,redPoint
    end
end

function CustomActivityData:hasNewTag(actId)
    local actUnitData = self:getActUnitDataById(actId)
    if not actUnitData then
        return false
    end
    if actUnitData:isExchangeAct() then
        return self:_hasGoodsCanExchange(actId)
    else
        return self:_hasTaskNotComplete(actId)
    end
end

--返回兑换活动是否有商品没有兑换
function CustomActivityData:_hasGoodsCanExchange(actId)
    local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
		FunctionConst.FUNC_ACTIVITY,{actId = actId,actType = TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT}
    )
	if showed then
		return false
	end

    return self:_hasActCanReceived(actId)
end

--返回指定活动是否有奖可领
function CustomActivityData:_hasActCanReceived(actId)
    local actUnitData = self:getActUnitDataById(actId)
    if not actUnitData then
        return false
    end
    local dataMap = self:getActTaskUnitDataListById(actId)
    for questId,actTaskUnitData in pairs(dataMap) do
        local canReceived = self:isTaskCanReceived(actTaskUnitData:getAct_id(),actTaskUnitData:getQuest_id())
        if canReceived then
            return canReceived
        end
    end
    return false
end

--返回指定活动是否还有任务没有完成
function CustomActivityData:_hasTaskNotComplete(actId)

    local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
		FunctionConst.FUNC_ACTIVITY,{actId = actId,actType = TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT }
    )
	if showed then
		return false
	end
    local actUnitData = self:getActUnitDataById(actId)
    if not actUnitData then
        return false
    end
    local dataMap = self:getActTaskUnitDataListById(actId)
    for questId,actTaskUnitData in pairs(dataMap) do
        local receiveCondition = self:isTaskReachReceiveCondition(actTaskUnitData:getAct_id(),actTaskUnitData:getQuest_id())
        if not receiveCondition then
            return true
        end
    end
    return false
end


-- 变身卡活动
function CustomActivityData:getAvatarActivity()
	local t = {}
	for k,v in pairs( self._actUnitDataList) do
		if v:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_AVATAR then
			table.insert(t, v)
		end
	end
	table.sort(t, function(a, b)
		return a:getStart_time() < b:getStart_time()
	end)

	for k ,v in ipairs(t) do
		if v:checkActIsInRunRewardTime() then
			return v
		end
	end
end
--变身卡 活动是否可见
function CustomActivityData:isAvatarActivityVisible()
	local acUnitData = self:getAvatarActivity()
	if acUnitData then
		return acUnitData:isActInRunTime()
	end
	return false
end
--变身卡 活动红点
function CustomActivityData:_avatarActivityHasRedPoint()
	local CustomActivityAvatarHelper = require("app.scene.view.customactivity.avatar.CustomActivityAvatarHelper")
	local UserCheck = require("app.utils.logic.UserCheck")
	local freeCount = CustomActivityAvatarHelper.getFreeCount(1)

	local getCosRes = CustomActivityAvatarHelper.getCosRes(1)
	local canRun = UserCheck.enoughValue(getCosRes.type, getCosRes.value, getCosRes.size, false)
	return freeCount > 0 or canRun
end

-- 手动插入变身开活动到限时活动数据中
-- 策划特殊需求 开服第15-17天 自动上一个变身卡活动（！！！ 后端不给推 ^#^）

-- function CustomActivityData:_manualInsertAvatarActivity()
-- 	--如果当前存在变身卡活动 则 不手动插入
-- 	local acUnitData = self:getAvatarActivity()
-- 	if not acUnitData then
-- 		local CustomActivityAvatarHelper = require("app.scene.view.customactivity.avatar.CustomActivityAvatarHelper")
-- 		local info = CustomActivityAvatarHelper.getManualInsertAvatarActivityInfo()
-- 		if info then
-- 			self:_createActUnitData(info)
-- 			return true
-- 		end
-- 	end
-- 	return false
-- end
-- -- 0点
-- function CustomActivityData:_onEventZeroTime()
-- 	if self:_manualInsertAvatarActivity() then
-- 		G_SignalManager:dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_UPDATE)
-- 	end
-- end

--装备活动
function CustomActivityData:getEquipActivity()
	local t = {}
	for k,v in pairs( self._actUnitDataList) do
		if v:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP then
			table.insert(t, v)
		end
	end
	table.sort(t, function(a, b)
		return a:getStart_time() < b:getStart_time()
	end)

	for k ,v in ipairs(t) do
		if v:checkActIsInRunRewardTime() then
			return v
		end
	end
end

--装备活动是否可见
function CustomActivityData:isEquipActivityVisible()
    local acUnitData = self:getEquipActivity()
    if acUnitData then
        return acUnitData:isActInRunTime()
    end
    return false
end

--装备活动红点
function CustomActivityData:_equipActivityHasRedPoint()
    local actUnitData = G_UserData:getCustomActivity():getEquipActivity()
	if not actUnitData then
		return false
	end
    local batch = actUnitData:getBatch()
    local rechargeUnit = G_UserData:getCustomActivityRecharge():getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP)
    local count1 = rechargeUnit:getRestFreeCount(batch) --免费次数
    if count1 > 0 then
        return true
    end

    local configInfo = ActivityEquipDataHelper.getActiveConfig(batch)
    local count2 = UserDataHelper.getNumByTypeAndValue(configInfo.money_type, configInfo.money_value)
    if count2 > configInfo.consume_time1 then
        return true
    end
    local shopRP = G_UserData:getShopActive():isShowEquipRedPoint()
    if shopRP then
        return true
    end

    return false
end

--神兽活动
function CustomActivityData:getPetActivity()
	local t = {}
	for k,v in pairs( self._actUnitDataList) do
		if v:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET then
			table.insert(t, v)
		end
	end
	table.sort(t, function(a, b)
		return a:getStart_time() < b:getStart_time()
	end)

	for k ,v in ipairs(t) do
		if v:checkActIsInRunRewardTime() then
			return v
		end
	end
end

--神兽活动是否可见
function CustomActivityData:isPetActivityVisible()
    local acUnitData = self:getPetActivity()
    if acUnitData then
        return acUnitData:isActInRunTime()
    end
    return false
end

--神兽活动红点
function CustomActivityData:_petActivityHasRedPoint()
    local actUnitData = G_UserData:getCustomActivity():getPetActivity()
	if not actUnitData then
		return false
	end
    local batch = actUnitData:getBatch()
    local rechargeUnit = G_UserData:getCustomActivityRecharge():getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET)
    local count1 = rechargeUnit:getRestFreeCount(batch) --免费次数
    if count1 > 0 then
        return true
    end

    local configInfo = ActivityEquipDataHelper.getActiveConfig(batch)
    local count2 = UserDataHelper.getNumByTypeAndValue(configInfo.money_type, configInfo.money_value)
    if count2 > configInfo.consume_time1 then
        return true
    end
    local shopRP = G_UserData:getShopActive():isShowPetRedPoint()
    if shopRP then
        return true
    end

    return false
end

--训马活动
function CustomActivityData:getHorseConquerActivity()
    local t = {}
    for k,v in pairs( self._actUnitDataList) do
        if v:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER then
            table.insert(t, v)
        end
    end
    table.sort(t, function(a, b)
        return a:getStart_time() < b:getStart_time()
    end)

    for k ,v in ipairs(t) do
        if v:checkActIsInRunRewardTime() then
            return v
        end
    end
end

--训马活动是否可见
function CustomActivityData:isHorseConquerActivityVisible()
    local acUnitData = self:getHorseConquerActivity()
    if acUnitData then
        return acUnitData:isActInRunTime()
    end
    return false
end

--训马活动红点
function CustomActivityData:_horseConquerActivityHasRedPoint()
    local actUnitData = G_UserData:getCustomActivity():getHorseConquerActivity()
    if not actUnitData then
        return false
    end
    local batch = actUnitData:getBatch()
    local rechargeUnit = G_UserData:getCustomActivityRecharge():getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER)
    local count1 = rechargeUnit:getRestFreeCount(batch) --免费次数
    if count1 > 0 then
        return true
    end

    local configInfo = ActivityEquipDataHelper.getActiveConfig(batch)
    local count2 = UserDataHelper.getNumByTypeAndValue(configInfo.money_type, configInfo.money_value)
    if count2 > configInfo.consume_time1 then
        return true
    end

    return false
end

--相马活动
function CustomActivityData:getHorseJudgeActivity()
    local t = {}
    for k,v in pairs( self._actUnitDataList) do
        if v:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_JUDGE then
            table.insert(t, v)
        end
    end
    table.sort(t, function(a, b)
        return a:getStart_time() < b:getStart_time()
    end)

    for k ,v in ipairs(t) do
        if v:checkActIsInRunRewardTime() then
            return v
        end
    end
end

--相马活动是否可见
function CustomActivityData:isHorseJudgeActivityVisible()
    local acUnitData = self:getHorseJudgeActivity()
    if acUnitData then
        return acUnitData:isActInRunTime()
    end
    return false
end

--VIP推送礼包活动
function CustomActivityData:getVipRecommendGiftActivity()
    local t = {}
    for k,v in pairs( self._actUnitDataList) do
        if v:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_VIP_RECOMMEND_GIFT then
            table.insert(t, v)
        end
    end
    table.sort(t, function(a, b)
        return a:getStart_time() < b:getStart_time()
    end)

    for k ,v in ipairs(t) do
        if v:checkActIsInRunRewardTime() then
            return v
        end
    end
end

--VIP推送礼包活动是否可见
function CustomActivityData:isVipRecommendGiftActivityVisible()
    local acUnitData = self:getVipRecommendGiftActivity()
    if acUnitData then
        return acUnitData:isActInRunTime()
    end
    return false
end

--------------------------------------------------------------
-- @Role    基金活动
-- @Param   actId 活动Id
function CustomActivityData:_getTaskData(actId)
    local questData = self:getActTaskUnitDataForFundsById(actId)
    if questData == nil then
        return nil
    end

    local data = table.values(questData)[1]
    if data == nil then
        return nil
    end

    local questId = table.keys(questData)[1]
    local groupIdx = data:getParam3()
    
    local taskData = self:getActTaskDataById(actId, questId)
    if taskData == nil then
        return nil
    end
    return taskData, groupIdx
end

-- @Role    检测是否激活基金活动
function CustomActivityData:_checkActivedFunds(actId)
    local taskData, groupIdx = self:_getTaskData(actId)
    if taskData == nil then
        return false
    end

    local bActived = table.nums(taskData.valueMap_) > 0
    local rewardedFinishTime = taskData.time2_
    if bActived then
        rewardedFinishTime = (rewardedFinishTime + (table.nums(self:getFundsByGroupId(groupIdx)) + 1) * CustomActivityConst.FUNDS_ONEDAY_TIME)
    end
    return bActived, rewardedFinishTime
end

-- @Role    基金活动红点
-- @Param   actId 活动Id
function CustomActivityData:_fundsRedPoint(actId)
    local taskData, _ = self:_getTaskData(actId)
    if taskData == nil then
        return false
    end

    local bFundsSigned = table.nums(taskData.valueMap_) > 0
    local mask = table.nums(taskData.valueMap_) >= 0 and taskData.valueMap_[1] or 0
    local maskBit = bit.tobits(mask)
    if table.nums(maskBit) > 0 then
        for key, value in pairs(maskBit) do
            if value == 0 then
                return true
            end
        end
    elseif table.nums(maskBit) == 0 and bFundsSigned then
        return true
    end
    return false
end

--------------------------------------------------------------
-- @Role    手杀（体验三国杀
function CustomActivityData:c2sCombineTaskQueryTask()
    G_NetworkManager:send(MessageIDConst.ID_C2S_MJZ2SS_CombineTaskQueryTask, {})
end

function CustomActivityData:_s2cCombineTaskQueryTask(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end

    local finishTime = rawget(message,"finish_time")
    local status = rawget(message,"status")
    local combineTaskQueryTask = rawget(message,"tasks")
    local ActivityThreeKindomsData = require("app.data.ActivityThreeKindomsData")
    local threeKindomsData = ActivityThreeKindomsData.new()
    
    threeKindomsData:updateFinishTime(finishTime)
    threeKindomsData:updateStatus(status)
    threeKindomsData:updateCombineTaskQueryTask(combineTaskQueryTask)
    self._threeKindomsDataList = threeKindomsData
end

function CustomActivityData:getThreeKindomsData()
    if self._threeKindomsDataList == nil then
        local ActivityThreeKindomsData = require("app.data.ActivityThreeKindomsData").new()
        self._threeKindomsDataList = ActivityThreeKindomsData
    end
    return self._threeKindomsDataList
end

-----------------------------------------------------------------
-- @Role    报名
function CustomActivityData:c2sCombineTaskSignUp()
    G_NetworkManager:send(MessageIDConst.ID_C2S_MJZ2SS_CombineTaskSignUp, {version = G_ConfigManager:getAppVersion()})
end

-----------------------------------------------------------------
-- @Role    手杀领奖
function CustomActivityData:c2sCombineTaskAward(taskId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_MJZ2SS_CombineTaskAward, {task_id = taskId})
end
-- @Role    获取某类基金基础信息
-- @Param   groupId 组号（如101/201）
function CustomActivityData:getFundsByGroupId(groupId)
    for key, value in pairs(self._fundsDataList) do
        if key ~= nil and key == groupId then
            return value
        end
    end
    return nil
end

--------------------------------------------------------------
-- @Role    基金领奖
-- @Param   actId 活动id
-- @Param   questId 任务id
-- @oaram   day 可选奖励的第几个奖励 从0开始
function CustomActivityData:c2sGetCustomActivityFundAward(actId, questId, day)
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetCustomActivityFundAward, {act_id = actId, quest_id = questId, day = day})
end

function CustomActivityData:_s2cGetCustomActivityFundAward(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end

    if rawget(message, "awards") ~= nil then
        G_Prompt:showAwards(message.awards)
    end
    G_SignalManager:dispatch(SignalConst.EVENT_FUNDS_REWARDS, message)
end

--检查是否有Vip推送礼包活动，如果有，拉取相关信息
function CustomActivityData:checkVipRecommendGift()
    if self:isVipRecommendGiftActivityVisible() then
        local acUnitData = self:getVipRecommendGiftActivity()
        if acUnitData then
            local actId = acUnitData:getAct_id()
            self:c2sGetActVipGift(actId)
        end
    end
end

function CustomActivityData:c2sGetActVipGift(actId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetActVipGift, {
        act_id = actId
    })
end

function CustomActivityData:_s2cGetActVipGift(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end
    local goods = rawget(message, "goods") or {}
    local actId = rawget(message, "act_id")
    self._vipRecommendGiftList = {}
    for i, good in ipairs(goods) do
        local data = VipGeneralGoodsData.new()
        data:updateData(good)
        local id = data:getProduct_id()
        self._vipRecommendGiftList[id] = data
    end
    G_SignalManager:dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_GET_VIP_RECOMMEND_GIFT_SUCCESS)
end

function CustomActivityData:getVipRecommendGiftList()
    local result = {}
    for id, data in pairs(self._vipRecommendGiftList) do
        table.insert(result, data)
    end
    table.sort(result, function(a, b)
        return a:getRmb() < b:getRmb()
    end)

    return result
end

function CustomActivityData:getReturnGiftList()
    local returnSvr = G_UserData:getBase():getReturnSvr()
    local isReturnServer = G_GameAgent:isLoginReturnServer()

    if not isReturnServer then
        return {}
    end

    local list = {}

    local gotGiftIds = returnSvr and returnSvr:getPacks() or {}

    local openDay = G_UserData:getBase():getOpenServerDayNum(0)	--开服天数

    local return_charge_award = require("app.config.return_charge_award")
    local return_charge_active = require("app.config.return_charge_active")

    local isGiftGot = function (id)
        local isGot = 0
        for k, v in pairs(gotGiftIds) do
            if v == id then
                isGot = 1
                break
            end
        end

        return isGot
    end

    local len = return_charge_active.length()
    local lastConfigInfo = return_charge_active.indexOf(len)
    local maxDay = lastConfigInfo.day

    local Paramter = require("app.config.parameter")
    local back_charge_day = tonumber(Paramter.get(882).content)

    local getAwardDay 
    getAwardDay = function (awardDay)
        if awardDay > maxDay then
            --awardDay = getAwardDay((awardDay - 1) % maxDay + back_charge_day)
            awardDay = (awardDay - maxDay - 1) % (maxDay - back_charge_day + 1) + back_charge_day
        else
            awardDay = awardDay
        end

        return awardDay
    end
    --12323232323
    local awardDay = getAwardDay(openDay)

    -- local awardDay = 1
    -- if openDay > maxDay then
    --     local Paramter = require("app.config.parameter")
    --     local back_charge_day = tonumber(Paramter.get(882).content)
    --     awardDay = openDay % maxDay + back_charge_day
    -- else
    --     awardDay = openDay
    -- end

    for i = 1, len do
        local info = {}
        local config = return_charge_active.indexOf(i)
        if awardDay == config.day then
            info.giftId = config.id
            info.isGot = isGiftGot(config.id)
            table.insert( list, info )
        end
    end

    table.sort(list, function(a, b) 
        if a.isGot ~= b.isGot then
            return a.isGot < b.isGot
        end

        return a.giftId < b.giftId
    end)

    return list
end

function CustomActivityData:getVipRecommendGiftWithId(id)
    return self._vipRecommendGiftList[id]
end

function CustomActivityData:_s2cBuyVipGift(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end
    local good = rawget(message, "good")
    if good then
        local id = rawget(good, "product_id")
        local data = self:getVipRecommendGiftWithId(id)
        if data then
            data:updateData(good)
            local awards = data:getAwards()
            G_SignalManager:dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_BUY_VIP_RECOMMEND_GIFT_SUCCESS, awards)
        end
    end
end

function CustomActivityData:_s2cBuyReturnGift(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end

    local rs = rawget(message, "rs")
    if rs then
        local returnSvr = G_UserData:getBase():getReturnSvr()
        returnSvr:updateData(rs)
    end

    local awards = rawget(message, "awards")
    if awards then
        G_SignalManager:dispatch(SignalConst.EVENT_RETURN_BUY_RETURN_GIFT, awards)
    end
end

function CustomActivityData:c2sCheckBuyReturnGift(giftId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_CheckDailySeller, {id = giftId})
end

function CustomActivityData:_s2cCheckBuyReturnGift(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end

    local giftId = rawget(message, "id")

    G_SignalManager:dispatch(SignalConst.EVENT_CHECK_BUY_RETURN_GIFT, giftId)
end

return CustomActivityData
