--7天活动数据
--@Author:Conley
local BaseData = import(".BaseData")
local ActivityConst = require("app.const.ActivityConst")
local ExpireStateData = import(".ExpireStateData")
local Day7ActivityConst = require("app.const.Day7ActivityConst")
local SevenDaysAdmin = require("app.config.seven_days_admin")
local SevenDaysDiscount = require("app.config.seven_days_discount")
local SevenDaysTask = require("app.config.seven_days_task")
local SevenDaysTaskOld = require("app.config.seven_days_task_old")
local Day7ActivityTaskData = require("app.data.Day7ActivityTaskData")
local Day7ActivityDiscountData = require("app.data.Day7ActivityDiscountData")
local Day7ActivityTaskUnitData = require("app.data.Day7ActivityTaskUnitData")
local TimeConst = require("app.const.TimeConst")
local Day7ActivityData = class("Day7ActivityData", BaseData)
local schema = {}
schema["start_time"] 		= {"number", 0}--活动开始时间（单位天）
schema["end_time"] 			= {"number", 0}--活动结束时间（单位天）
schema["reward_time"] 		= {"number", 0}--活动奖励领取截止时间（单位天）
schema["current_day"] 		= {"number", 0}--当前时间（单位天），凌晨4点前算上一天
schema["hasData"] 	= {"boolean",false}--是否有数据

Day7ActivityData.schema = schema

function Day7ActivityData:ctor(properties)
	Day7ActivityData.super.ctor(self, properties)
	
	self._s2cGetSevenDaysDataListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetSevenDaysData, handler(self, self._s2cGetSevenDaysData))
    self._s2cSevenDaysRewardListener = G_NetworkManager:add(MessageIDConst.ID_S2C_SevenDaysReward, handler(self, self._s2cSevenDaysReward))
    self._s2cUpdateSevenDaysInfoListener = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateSevenDaysInfo, handler(self, self._s2cUpdateSevenDaysInfo))
    self._s2cSevenDaysShopListener = G_NetworkManager:add(MessageIDConst.ID_S2C_SevenDaysShop, handler(self, self._s2cSevenDaysShop))

	self._serverTaskData = {}
	self._serverDiscountShopData = {}
	self._serverActTaskUnitDatas = {}--任务数据
	self._everydayActTaskUnitDatas = {}--每天的任务数据

	--缓存数据
	self._sevenDaysTaskCfgCache = {} --seven_days_task
	self._discountShopCfgListCache = {}
	self._tabListCache = {}--SevenDaysAdmin


end

-- 清除
function Day7ActivityData:clear()
	Day7ActivityData.super.clear(self)
	self._s2cGetSevenDaysDataListener:remove()
	self._s2cGetSevenDaysDataListener = nil
    self._s2cSevenDaysRewardListener:remove()
	self._s2cSevenDaysRewardListener = nil
    self._s2cUpdateSevenDaysInfoListener:remove()
	self._s2cUpdateSevenDaysInfoListener = nil
    self._s2cSevenDaysShopListener:remove()
	self._s2cSevenDaysShopListener = nil

end

-- 重置
function Day7ActivityData:reset()
	Day7ActivityData.super.reset(self)
	self._serverTaskData = {}
	self._serverDiscountShopData = {}
	self._serverActTaskUnitDatas = {}
	self._everydayActTaskUnitDatas = {}
	self._sevenDaysTaskCfgCache = {}
	self._discountShopCfgListCache = {}
	self._tabListCache = {}
	self:setHasData(false)
end

-- 7天活动数据,登陆后服务器主动推送消息
function Day7ActivityData:_s2cGetSevenDaysData(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:setHasData(true)
	self:resetTime()

	self:setStart_time(message.start_time)
	self:setEnd_time(message.end_time)
	self:setReward_time(message.reward_time)
	self:setCurrent_day(message.current_day)



	self._serverTaskData = {}
	self._serverDiscountShopData = {}

	self:_resetEveryDayActTaskUnitData()	

	local tasks = rawget(message,"tasks") or {}
	self:_setServerTaskData(tasks)

	local shopIds = rawget(message,"shop_ids") or {}
	self:_setDiscountShopData(shopIds)

	G_SignalManager:dispatch(SignalConst.EVENT_DAY7_ACT_GET_INFO,id,message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WEEK_ACTIVITY)--7天红点
	
	--重连时候？登陆后？需要通过这个来刷按钮么
	--G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS)
end

--活动任务状态变更，领活动奖励后也同步此消息 
function Day7ActivityData:_s2cUpdateSevenDaysInfo(id,message)
	local task = message.task
	local taskType = task.task_type
	local actTaskData = self:getActivityTaskDataByTaskType(taskType)
	if  actTaskData then
		actTaskData:initData(task)
	else	
		 self:_createActivityTaskData(task)
	end

	self:_resetEveryDayActTaskUnitData()	

	G_SignalManager:dispatch(SignalConst.EVENT_DAY7_ACT_UPDATE_PROGRESS,id,message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WEEK_ACTIVITY)
end

-- 领7天活动任务奖励rsp消息
function Day7ActivityData:_s2cSevenDaysReward(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:_resetEveryDayActTaskUnitData()	

	G_SignalManager:dispatch(SignalConst.EVENT_DAY7_ACT_GET_TASK_REWARD,id,message)
end

-- 购买7天活动中折扣商品rsp消息，需要客户端维护shop_ids
function Day7ActivityData:_s2cSevenDaysShop(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local actDiscountShopData = self:getActivityDiscountShopDataById(message.id)
	if not actDiscountShopData then
		self:_createDiscountShopData(message.id)
	else
	    actDiscountShopData:setBuyCount(actDiscountShopData:getBuyCount()+1)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_DAY7_ACT_GET_BUY_DISCOUNT_SHOP,id,message)

	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WEEK_ACTIVITY)
end

function Day7ActivityData:_createActivityTaskData(task)
	local activityTaskData = Day7ActivityTaskData.new()
	activityTaskData:initData(task)
	self._serverTaskData[Day7ActivityConst.TASK_PREV..task.task_type] = activityTaskData
	return activityTaskData
end

function Day7ActivityData:_createDiscountShopData(shopId)
	local actDiscountShopData = Day7ActivityDiscountData.new()
	actDiscountShopData:initData(shopId)
	self._serverDiscountShopData[Day7ActivityConst.SELL_PREV..shopId] = actDiscountShopData
	return activityTaskData
end

function Day7ActivityData:_createActTaskUnitData(taskId)
	 local data = Day7ActivityTaskUnitData.new()
	 data:initData({id = taskId})
	 self._serverActTaskUnitDatas[taskId] = data
	 return data
end

--更新所有任务数据
function Day7ActivityData:_setServerTaskData(tasks)
	for k, task in ipairs(tasks) do
		self:_createActivityTaskData(task)
	end
end

--更新所有折扣商品数据
function Day7ActivityData:_setDiscountShopData(shopIds)
	for k, shopId in ipairs(shopIds) do
		self:_createDiscountShopData(shopId)
	end
end

--查询服务器任务数据
--@return：nil 表明还没有进度
function Day7ActivityData:getActivityTaskDataByTaskType(taskType)
	return self._serverTaskData[Day7ActivityConst.TASK_PREV..taskType]
end

--查询折扣商品数据
--@return：nil 表明还没有购买
function Day7ActivityData:getActivityDiscountShopDataById(shopId)
	return self._serverDiscountShopData[Day7ActivityConst.SELL_PREV..shopId]
end

--返回某天的标签列表
function Day7ActivityData:getTabListByDay(day)
	local cacheValue = self._tabListCache["key"..tostring(day)]
	if cacheValue then return cacheValue end
	local cfgArr = {}
	local length = SevenDaysAdmin.length()
	for i = 1,length,1 do
		local cfg = SevenDaysAdmin.indexOf(i)
		if cfg.day == day then
			table.insert( cfgArr,cfg)
		end
	end
	self._tabListCache["key"..tostring(day)] = cfgArr
	return cfgArr
end

--返回标签数据
function Day7ActivityData:getTabData(day,sheet)
	local cfg = SevenDaysAdmin.get(day,sheet)
	assert(cfg,"seven_days_admin not find day "..day.."sheet "..sheet)
	return cfg
end

function Day7ActivityData:getActUnitDataList(day,sheet)
	local tabData = self:getTabData(day,sheet)
	if tabData.type == Day7ActivityConst.TAB_TYPE_TASK then
		return self:_getActTaskUnitDataList(day,sheet)
	elseif tabData.type == Day7ActivityConst.TAB_TYPE_DISCOUNT then 
		return self:_getActDiscountShopCfgList(day,sheet)
	end
	return {}
end

function Day7ActivityData:_getActDiscountShopCfgList(day,sheet)
	local cacheValue = self._discountShopCfgListCache[tostring(day).."_"..tostring(sheet)]
	if cacheValue then
		return cacheValue
	end
	local cfgArr = {}
	local length = SevenDaysDiscount.length()
	for i =1,length,1 do
		local cfg = SevenDaysDiscount.indexOf(i)
		if cfg.day == day and cfg.sheet == sheet then
			table.insert( cfgArr, cfg )
		end
	end
	self._discountShopCfgListCache[tostring(day).."_"..tostring(sheet)] = cfgArr
	return cfgArr
end

function Day7ActivityData:_sortTaskUnitData(obj1,obj2)
	local hasReach01 = obj1:isHasReach()
	local hasTaken01 = obj1:isHasReceived()--hasReach01 and not obj1:isCanTaken()
	local hasReach02 = obj2:isHasReach()
	local hasTaken02 = obj2:isHasReceived()--hasReach02 and not obj2:isCanTaken()
	if hasTaken01 ~= hasTaken02 then
		return not hasTaken01
	end
	if hasReach01 ~= hasReach02 then
		return hasReach01
	end
	local order1 = obj1:getConfig().order
	local order2 = obj2:getConfig().order 
	return order1 < order2
end

function Day7ActivityData:_getActTaskUnitDataList(day,sheet)
	if not self._everydayActTaskUnitDatas[day] then
		self._everydayActTaskUnitDatas[day] = {}
	end
	local data =  self._everydayActTaskUnitDatas[day][sheet]
	if data == nil then
		data = self:_createActTaskUnitDataList(day,sheet)
		for k,v in ipairs(data) do
			local canReceive = self:isTaskCanReceived(v:getId())
			local reachCondition = self:isTaskReachReceiveCondition(v:getId())
			local hasReceived = self:isTaskReceivedReward(v:getId())
			v:setHasReach(reachCondition)
			v:setCanTaken(canReceive)
			v:setHasReceived(hasReceived)
		end
		table.sort(data,handler(self,self._sortTaskUnitData)) 
	end
	return data
end

function Day7ActivityData:_createActTaskUnitDataList(day,sheet)
	local datas = {}
	local cfgArr = self:_getSevenTaskCfgList(day,sheet)
	for k,cfg in ipairs(cfgArr) do
		local data = self:getActTaskUnitDataById(cfg.id)
		table.insert( datas, data)
	end
	if not self._everydayActTaskUnitDatas[day] then
		self._everydayActTaskUnitDatas[day] = {}
	end
	self._everydayActTaskUnitDatas[day][sheet] = datas
	return  datas
end

function Day7ActivityData:_getSevenTaskCfgList(day,sheet)
	local cacheValue = self._sevenDaysTaskCfgCache[tostring(day).."_"..tostring(sheet)]
	if cacheValue then
		return cacheValue
	end
	local cfgArr = {}
	local Config = SevenDaysTask
	if self:isUseOldConfig() then
		Config = SevenDaysTaskOld
	end
	local length = Config.length()
	for i =1,length,1 do
		local cfg = Config.indexOf(i)
		if cfg.day == day and cfg.sheet == sheet then
			table.insert( cfgArr, cfg )
		end
	end
	self._sevenDaysTaskCfgCache[tostring(day).."_"..tostring(sheet)] = cfgArr
	return cfgArr
end


function Day7ActivityData:getActTaskUnitDataById(taskId)
	local data =  self._serverActTaskUnitDatas[taskId]
	if not data then
		data = self:_createActTaskUnitData(taskId)
	end
	return data
end

function Day7ActivityData:_resetEveryDayActTaskUnitData()
	self._everydayActTaskUnitDatas = {}
end

--是否已经领取了奖励
function Day7ActivityData:isTaskReceivedReward(taskId)
	local actTaskUnitData = self:getActTaskUnitDataById(taskId)
	local actTaskData =  self:getActivityTaskDataByTaskType(actTaskUnitData:getTaskType())
	local hasReceive =  actTaskUnitData:isTaskHasReceived(actTaskData)
	return hasReceive
end

--任务是否能领取
function Day7ActivityData:isTaskCanReceived(taskId)
	if not self:isInActRewardTime() then
		return false
	end
	local reachReceiveCondition = self:isTaskReachReceiveCondition(taskId)
	if not reachReceiveCondition then
		return false
	end

	local actTaskUnitData = self:getActTaskUnitDataById(taskId)
	local actTaskData =  self:getActivityTaskDataByTaskType(actTaskUnitData:getTaskType())
	if actTaskData == nil  then
		local taskType = actTaskUnitData:getTaskType()
		if taskType == Day7ActivityConst.TASK_TYPE_LOGIN_REWARD then
			return true
		end
	end
	local canReceive =  actTaskUnitData:isTaskHasReceiveCount(actTaskData)
	return canReceive
end

--此任务是否能满足领取条件
function Day7ActivityData:isTaskReachReceiveCondition(taskId)
	local actTaskUnitData = self:getActTaskUnitDataById(taskId)

	if not self:isDayCanReceive(actTaskUnitData:getConfig().day) then
		return false
	end

	local actTaskData =  self:getActivityTaskDataByTaskType(actTaskUnitData:getTaskType())
	local reachCondition =  actTaskUnitData:isTaskReachReceiveCondition(actTaskData)



	local taskType = actTaskUnitData:getTaskType()
	if taskType == Day7ActivityConst.TASK_TYPE_LOGIN_REWARD then
		reachCondition = true --不需要是当天--self:_todayIsDay(actTaskUnitData:getConfig().day)
	end



	return reachCondition
end

function Day7ActivityData:getTaskValue(actTaskUnitData)
	local actTaskData =  self:getActivityTaskDataByTaskType(actTaskUnitData:getTaskType())
	if not actTaskData then
		return 0
	end
	return actTaskData:getTask_value()
end

--折扣商品能否购买
function Day7ActivityData:isShopDiscountCanBuy(shopId)
	if not self:isInActRewardTime() then
		return false
	end
	local reachReceiveCondition = self:isShopDiscountReachBuyCondition(shopId)
	if not reachReceiveCondition then
		return false
	end
	local actDiscountShopData = self:getActivityDiscountShopDataById(shopId)
	if not actDiscountShopData then
		return true
	end
	return actDiscountShopData:canBuy()
end

--折扣商品满足购买条件
function Day7ActivityData:isShopDiscountReachBuyCondition(shopId)
	--判断时间
	if not self:isInActRewardTime() then
		return false
	end
	local cfg = SevenDaysDiscount.get(shopId)
	assert(cfg,"seven_days_discount not find id "..tostring(shopId))

	if not self:isDayCanReceive(cfg.day) then
		return false
	end
	return true
end

function Day7ActivityData:isDayCanReceive(day)
	local currentDay = self:getCurrent_day() 
	return day <= currentDay 
end

function Day7ActivityData:_todayIsDay(day)
	return self:getCurrent_day() == day
end

--是否处在做活动时间内，没数据也返回False
function Day7ActivityData:isInActRunTime()
	local currentDay = self:getCurrent_day() 
	local startDay = self:getStart_time()
	local endDay = self:getEnd_time()
	if currentDay  > 0  and currentDay >= startDay  and currentDay <= endDay then
		return true
	end
	return false
end

--是否在领奖时间内，没数据也返回False
function Day7ActivityData:isInActRewardTime()
	local currentDay = self:getCurrent_day() 
	local startDay = self:getStart_time()
	local rewardDay = self:getReward_time()
	if currentDay  > 0  and currentDay >= startDay  and currentDay <= rewardDay then
		return true
	end
	return false
end

--活动结束时间单位秒
function Day7ActivityData:getActEndTime()
	local currentDay = self:getCurrent_day() 
	local endDay = self:getEnd_time()
	local diffDay = endDay - currentDay 

	return G_ServerTime:getSomeDayMidNightTimeByDiffDay(diffDay,TimeConst.RESET_TIME)
end

--领取奖励截止时间单位秒
function Day7ActivityData:getActRewardEndTime()
	local currentDay = self:getCurrent_day() 
	local rewardDay = self:getReward_time()
	local diffDay = rewardDay - currentDay 

	return G_ServerTime:getSomeDayMidNightTimeByDiffDay(diffDay,TimeConst.RESET_TIME)
end

--发送任务领取消息
function Day7ActivityData:c2sSevenDaysReward(id,rewardIndex)
	if self:isExpired() == true then
		self:pullData()
		return 
	end
    G_NetworkManager:send(MessageIDConst.ID_C2S_SevenDaysReward,  {id = id,reward_index = rewardIndex})
end

--发送折扣商店购买消息
function Day7ActivityData:c2sSevenDaysShop(id)
	if self:isExpired() == true then
		self:pullData()
		return 
	end
    G_NetworkManager:send(MessageIDConst.ID_C2S_SevenDaysShop,  {id = id})
end

function Day7ActivityData:c2sGetSevenDaysData()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetSevenDaysData,  {})
end

function Day7ActivityData:pullData()
	--客户端没有主动拉取的协议
	self:c2sGetSevenDaysData()
end

function Day7ActivityData:resetData()
	--客户端没有主动拉取的协议
	self:pullData()
	self:setNotExpire()--避免重复处理
end

function Day7ActivityData:hasRedPoint(params)
	if not params then
		--7天是否有红点
		for i = 1,Day7ActivityConst.DAY_NUM,1 do
			local red =  self:_hasRedPointByDay(i)
			if red then
				return true
			end
		end
		return false
	elseif params.day and params.sheet then
		--某天的某个页签是否有红点
		return self:_hasRedPointByDaySheet(params.day,params.sheet)
	elseif params.day then
		--某天是否有红点
		return self:_hasRedPointByDay(params.day)
	end
	return false
end

function Day7ActivityData:_hasRedPointByDay(day)
	local tabList = self:getTabListByDay(day)
	if tabList then
		for k,v in ipairs(tabList) do
			local red = self:_hasRedPointByDaySheet(v.day,v.sheet)
			if red then
				return true
			end
        end
	end
	return false
end

function Day7ActivityData:_hasRedPointByDaySheet(day,sheet)
	local tabData = self:getTabData(day,sheet)
	if tabData.type ==  Day7ActivityConst.TAB_TYPE_TASK then
		return self:_hasRewardNotReceived(day,sheet) 
	elseif tabData.type ==  Day7ActivityConst.TAB_TYPE_DISCOUNT then
		return self:_hasGoodsNotBuy(day,sheet)
	end
	return false
end

--返回是否有商品没有购买
function Day7ActivityData:_hasGoodsNotBuy(day,sheet)

	local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
		FunctionConst.FUNC_WEEK_ACTIVITY,{day = day,sheet = sheet})
	if showed then
		return false
	end
	local goodsList = self:getActUnitDataList(day,sheet)
	for k,v in ipairs(goodsList) do
   		local canBuy = self:isShopDiscountCanBuy(v.id)
		if canBuy then
			if day == 7 then logWarn("---------_hasGoodsNotBuy") end
			return true
		end
	end
	return false
end

--返回是否有奖励没有领取
function Day7ActivityData:_hasRewardNotReceived(day,sheet)
	local actUnitDataList = self:getActUnitDataList(day,sheet)
	for k,actTaskUnitData in ipairs(actUnitDataList) do
		local canReceive = self:isTaskCanReceived(actTaskUnitData:getId())
		--local canReceive = actTaskUnitData:isCanTaken()
		if canReceive then
			if day == 7 then logWarn("---------canReceive") end
			return true
		end
	end
	return false
end

--返回最后一天能获得的英雄列表
function Day7ActivityData:getShowHeroIds()
	local ParameterIDConst = require("app.const.ParameterIDConst")
	local Parameter = require("app.config.parameter")
	local config = Parameter.get(ParameterIDConst.SEVEN_DAYS_SHOW_HERO)
	assert(config,"parameter can't find id:"..tostring(ParameterIDConst.SEVEN_DAYS_SHOW_HERO))
	local TextHelper = require("app.utils.TextHelper")
	local numberArray = TextHelper.splitStringToNumberArr(config.content)
	return numberArray
end

--是否用旧表
function Day7ActivityData:isUseOldConfig()
	local serverOpenTime = G_UserData:getBase():getServer_open_time()
	local UserDataHelper = require("app.utils.UserDataHelper")
	local tempTime = UserDataHelper.getParameter(G_ParameterIDConst.SPECIAL_CONFIG_TIME)
	return serverOpenTime < tempTime --开服时间<参考时间，用旧表
end

return Day7ActivityData
