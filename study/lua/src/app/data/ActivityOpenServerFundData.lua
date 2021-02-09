--开服基金活动数据类
--@Author:Conley
local ActivityBaseData = import(".ActivityBaseData")
local BaseData = require("app.data.BaseData")
local ActivityConst = require("app.const.ActivityConst")
local ActFund = require("app.config.act_fund")
local ServerRecordConst = require("app.const.ServerRecordConst")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local ActivityOpenServerFundConst = require("app.const.ActivityOpenServerFundConst")
local ActivityOpenServerFundUnitData = class("ActivityOpenServerFundUnitData", BaseData)
local schema = {}
schema["id"] 	    = {"number", 0}
schema["config"] 	    = {"table", {}}
schema["hasReceive"] 	    = {"boolean", false}
ActivityOpenServerFundUnitData.schema = schema

function ActivityOpenServerFundUnitData:ctor(properties)
	ActivityOpenServerFundUnitData.super.ctor(self, properties)
end

-- 清除
function ActivityOpenServerFundUnitData:clear()
end

-- 重置
function ActivityOpenServerFundUnitData:reset()
	self:setHasReceive(false)
end

--是否能领取
function ActivityOpenServerFundUnitData:canReceive()
	local cfg = self:getConfig()
	if cfg.fund_type == ActivityOpenServerFundConst.FUND_TYPE_GROW then
		--等级和VIP条件
		local vip = G_UserData:getActivityOpenServerFund():getGrowFundNeedVipLevel()
		local hasBuyGroup = G_UserData:getActivityOpenServerFund():isGroupBuy(cfg.group)
		--判断是否购买了该阶段的成长基金
		if 	not hasBuyGroup  then
			return false
		end
		return 	G_UserData:getBase():getLevel() >= cfg.fund_value and G_UserData:getVip():getLevel()  >= vip
		
	elseif cfg.fund_type == ActivityOpenServerFundConst.FUND_TYPE_SERVER_REWARD then
		--人数条件
		local num = G_UserData:getActivityOpenServerFund():getFundNum()
		return num >= cfg.fund_value
	end
	return false
end

function ActivityOpenServerFundUnitData:initData(id,hasReceive)
	self:setId(id)

	local info = ActFund.get(id)
	assert(info,"act_fund not find id "..tostring(id))
	self:setConfig(info)
	self:setHasReceive(hasReceive)
end

-----------------------------------------------------
local ActivityOpenServerFundData = class("ActivityOpenServerFundData", BaseData)
local schema = {}
schema["fundNum"] 	    = {"number", 0}--基金参与总人数
schema["group"] 	    = {"table", {}}
schema["baseActivityData"] 	= {"table", {}}
ActivityOpenServerFundData.schema = schema

function ActivityOpenServerFundData:ctor(properties)
	ActivityOpenServerFundData.super.ctor(self, properties)

	local TimeExpiredData = require("app.data.TimeExpiredData")
	self:setResetType(TimeExpiredData.RESET_TYPE_NONE)


	local activityBaseData = ActivityBaseData.new()
	activityBaseData:initData({id = ActivityConst.ACT_ID_OPEN_SERVER_FUND  })
	self:setBaseActivityData(activityBaseData)

	self._unitDataMap = self:_createAllUnitData()

	self._s2cGetActFundListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetActFund, handler(self, self._s2cGetActFund))
	self._s2cActFundListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ActFund, handler(self, self._s2cActFund))
	self._signalServerRecordChange = G_SignalManager:add(SignalConst.EVENT_SERVER_RECORD_CHANGE, handler(self, self._onServerRecordChange))
	self._signalRecvRoleInfo = G_SignalManager:add(SignalConst.EVENT_RECV_ROLE_INFO, handler(self, self._onEventRecvRoleInfo))
	
end

-- 清除
function ActivityOpenServerFundData:clear()
	ActivityOpenServerFundData.super.clear(self)
	self._s2cGetActFundListener:remove()
	self._s2cGetActFundListener = nil
	self._s2cActFundListener:remove()
	self._s2cActFundListener = nil

	self._signalServerRecordChange:remove()
    self._signalServerRecordChange = nil

	self._signalRecvRoleInfo:remove()
	self._signalRecvRoleInfo = nil


	self:getBaseActivityData():clear()
end

-- 重置
function ActivityOpenServerFundData:reset()
	ActivityOpenServerFundData.super.reset(self)
	self:getBaseActivityData():reset()

	self:_resetAllUnitData()
end

function ActivityOpenServerFundData:_resetAllUnitData()
	for fundType,unitDataList in pairs(self._unitDataMap) do
		for fundId,unitData in pairs(unitDataList) do	
			unitData:reset()
		end
	end
end

function ActivityOpenServerFundData:_createAllUnitData()
	local unitDataList = {}
	for i = 1,ActFund.length(),1 do
		local cfg = ActFund.indexOf(i)
		unitDataList[cfg.fund_type] = unitDataList[cfg.fund_type] or {}
		local fundUnitData = ActivityOpenServerFundUnitData.new()
		fundUnitData:initData(cfg.id,false)
		unitDataList[cfg.fund_type][cfg.id] = fundUnitData
	end
	return unitDataList
end


function ActivityOpenServerFundData:getUnitDataById(id)
	local info = ActFund.get(id)
	assert(info,"act_fund not find id "..tostring(id))
	local unitDataList= self._unitDataMap[info.fund_type] 
	if not unitDataList then
		return nil
	end
	return unitDataList[id]
end

function ActivityOpenServerFundData:getUnitDataListByFundType(fundType,currGroup,needSort)
	if ActivityOpenServerFundConst.FUND_TYPE_GROW == fundType then
		 currGroup = currGroup or self:getCurrGroup()
	else
		 currGroup = 0
	end
   
	needSort = needSort or true
	local resultDataList = {}
	local unitDataList= self._unitDataMap[fundType] 
	if not unitDataList then
		return resultDataList
	end
	for k,v in pairs(unitDataList) do
		local config = v:getConfig() 
		if config.group == currGroup then
			table.insert(resultDataList,v)
		end
	end
	--TODO 后期优化
	local function sortFund(obj1,obj2)
		local receive01 = obj1:isHasReceive()
		local receive02 = obj2:isHasReceive() 
		if receive01 ~= receive02 then
			return not receive01
		end
		return obj1:getId() < obj2:getId()
	end
	
	if needSort then
		table.sort(resultDataList,sortFund )
	end
	return resultDataList
end

function ActivityOpenServerFundData:_createGroupUnitData(groupId)
	local group =  self:getGroup()
	group["k_"..tostring(groupId)] = groupId
end

function ActivityOpenServerFundData:isGroupBuy(groupId)
	local group =  self:getGroup()
	return group["k_"..tostring(groupId)] ~= nil
end

function ActivityOpenServerFundData:_s2cGetActFund(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:getBaseActivityData():setHasData(true)
	self:resetTime()

	self:_resetAllUnitData()

	self:setGroup({})
	local group = rawget(message,"group") or {}
	for k,v in ipairs(group) do
		self:_createGroupUnitData(v)
	end
	

	self:setFundNum(message.fund_num)

	local ids = rawget(message,"ids") or {}
	for k,id in ipairs(ids) do
		local unitData = self:getUnitDataById(id)
		if unitData then
			unitData:setHasReceive(true)
		end
	end

	G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_FUND_OPEN_SERVER_GET_INFO,id,message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WELFARE,{actId =ActivityConst.ACT_ID_OPEN_SERVER_FUND})
end

function ActivityOpenServerFundData:_s2cActFund(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local fundId = message.id--领取的id
	local unitData = self:getUnitDataById(fundId)
	if unitData then
		unitData:setHasReceive(true)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_FUND_OPEN_SERVER_GET_REWARD,id,message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WELFARE,{actId =ActivityConst.ACT_ID_OPEN_SERVER_FUND})
end

function ActivityOpenServerFundData:_onServerRecordChange()
	local num = G_UserData:getServerRecord():getRecordById(
		ServerRecordConst.KEY_OPEN_SERVER_FUND_TOTAL_PLAYER_NUM )
	self:setFundNum(num)	
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WELFARE,{actId =ActivityConst.ACT_ID_OPEN_SERVER_FUND})
end

function ActivityOpenServerFundData:_onEventRecvRoleInfo(event)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WELFARE,{actId =ActivityConst.ACT_ID_OPEN_SERVER_FUND})
end

function ActivityOpenServerFundData:c2sGetActFund()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetActFund, {})
end

function ActivityOpenServerFundData:c2sActFund(id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ActFund, {id = id})
end

function ActivityOpenServerFundData:pullData()
	self:c2sGetActFund()
end

--返回成长基金领取需要的VIP等级
--@return：找不到返回0
function ActivityOpenServerFundData:getGrowFundNeedVipLevel()
	local baseActData = self:getBaseActivityData()
	return baseActData:getActivityParameter(1) or 0
end


function ActivityOpenServerFundData:isVipEnoughForGrowFund()
	--local needVipLevel = self:getGrowFundNeedVipLevel()
	--return G_UserData:getVip():getLevel() >= needVipLevel
	return true
end


function ActivityOpenServerFundData:hasRedPoint()
	--1.充值的，有成长基金可以领取
	--2.有全服奖励可以领取	
	return  self:hasRewardCanReceiveByFundType(ActivityOpenServerFundConst.FUND_TYPE_GROW) or 
			self:hasRewardCanReceiveByFundType(ActivityOpenServerFundConst.FUND_TYPE_SERVER_REWARD)
end

function ActivityOpenServerFundData:hasRedPointByFundGroup(group)	
	return   self:hasRewardCanReceiveByFundType(ActivityOpenServerFundConst.FUND_TYPE_GROW,group) or 
			self:hasRewardCanReceiveByFundType(ActivityOpenServerFundConst.FUND_TYPE_SERVER_REWARD,group)
end

function ActivityOpenServerFundData:_hasVipRedPoint()
	local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
		FunctionConst.FUNC_WELFARE,{actId = ActivityConst.ACT_ID_OPEN_SERVER_FUND,"vipHint"}
    )
	if showed then
		return false
	end
	return  not self:isVipEnoughForGrowFund() 
end


function ActivityOpenServerFundData:hasRewardCanReceiveByFundType(fund_type,group)
	local unitDataList = self:getUnitDataListByFundType(fund_type,group)
	for k,actOpenServerFundUnitData in ipairs(unitDataList) do	
		local isCanReceive = actOpenServerFundUnitData:canReceive()
    	local isReceive = actOpenServerFundUnitData:isHasReceive()
		if not isReceive and isCanReceive then
			return true
		end	
	end
	return false
end

function ActivityOpenServerFundData:c2sBuyFund(group)
	if self:isExpired() == true then
		self:pullData()
		return 
	end
	group = group or self:getCurrGroup()
	local groupInfo = self:getGroupInfo(group)

	G_GameAgent:pay(groupInfo.payCfg.id, 
					groupInfo.payCfg.rmb, 
					groupInfo.payCfg.product_id, 
					groupInfo.payCfg.name, 
					groupInfo.payCfg.name)
end


function ActivityOpenServerFundData:getMaxGroup()
	local maxGroup = 0
	local level = G_UserData:getBase():getLevel()
	local ActFundGroup = require("app.config.act_fund_group")
	for k = 1, ActFundGroup.length(),1 do
		local config = ActFundGroup.indexOf(k)
		if level >= config.show_level then
			maxGroup = math.max(maxGroup,config.group_id)
		end
	end

	return maxGroup
end

function ActivityOpenServerFundData:getCurrGroup()
	--判断下当前的是否已经全部领取完
	local groupIds = self:getGroup()
	local buyGroup = 0 
	for k,v in pairs(groupIds) do
		buyGroup = math.max(buyGroup,v)
	end
	if buyGroup <= 0 then
		return 1
	end
	local hasRewardNotComplete = false 
	local unitDataList = self:getUnitDataListByFundType(ActivityOpenServerFundConst.FUND_TYPE_GROW,buyGroup,false)
	for k,actOpenServerFundUnitData in ipairs(unitDataList) do	
		local isCanReceive = actOpenServerFundUnitData:canReceive()
    	local isReceive = actOpenServerFundUnitData:isHasReceive()
		if not isReceive then
			hasRewardNotComplete = true 
			break
		end	
	end
	if hasRewardNotComplete then
		return buyGroup
	end
	local maxGroup = self:getMaxGroup()
	return  math.min(buyGroup + 1,maxGroup)
end

function ActivityOpenServerFundData:isHasBuyCurrFund(group)
	local currGroup = group or self:getCurrGroup()
	return  self:isGroupBuy(currGroup)
end


function ActivityOpenServerFundData:getGroupInfo(group)
	local ActFundGroup = require("app.config.act_fund_group")
	local config = ActFundGroup.get(group)
	assert(config,"act_fund_group not find id "..tostring(group))
	local payId = config.good_id
	local VipPay = require("app.config.vip_pay")
	local payCfg = VipPay.get(payId)
	assert(payCfg,"vip_pay not find id "..tostring(payId))
	return { group = group,payCfg = payCfg,config = config}
end

return ActivityOpenServerFundData