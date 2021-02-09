--摇钱树活动数据类
--@Author:Conley
local BaseData = import(".BaseData")
local ActivityBaseData = import(".ActivityBaseData")
local act_silver = require("app.config.act_silver")
local ActivityConst = require("app.const.ActivityConst")
local ActSilverBox = require("app.config.act_silver_box")
local VipFunctionIDConst = require("app.const.VipFunctionIDConst")
local act_admin = require("app.config.act_admin")



local BOX_REWARD_NUM = 2--宝箱最大奖励道具数

-- 摇钱树宝箱单元数据
-- ===================START=====================
local ActivityMoneyTreeBoxData = class("ActivityMoneyTreeBoxData", BaseData)
local schema = {}
schema["config"] 	= {"table", {}}--宝箱配置
schema["id"] 		= {"number", 0}--宝箱ID
schema["received"] 		= {"boolean", false}--是否领取
ActivityMoneyTreeBoxData.schema = schema

function ActivityMoneyTreeBoxData:ctor(properties)
	ActivityMoneyTreeBoxData.super.ctor(self, properties)

	self._fixRewardList = {}

end

-- 清除
function ActivityMoneyTreeBoxData:clear()
end

-- 重置
function ActivityMoneyTreeBoxData:reset()
end

function ActivityMoneyTreeBoxData:initData(id,isReceived)
	self:setId(id)

	local cfg = ActSilverBox.get(id)
	assert(cfg,"act_silver_box not find id "..tostring(id))
	self:setConfig(cfg)

	self:setReceived(isReceived)

	local UserDataHelper = require("app.utils.UserDataHelper")
	self._fixRewardList = UserDataHelper.makeRewards(cfg,BOX_REWARD_NUM)

end

function ActivityMoneyTreeBoxData:getRewards()
	local rewardList = {}
	local level = G_UserData:getBase():getLevel()
	local roleData  = require("app.config.role").get(level )
	assert(roleData,"role not find id "..tostring(level))
	local config = self:getConfig()
	local reward = {
		type = config.type,
		value = config.value,
		size = config.size
	}
	reward.size = math.floor(reward.size * roleData.silver_para/1000)
	rewardList = clone(self._fixRewardList)
	table.insert( rewardList,1,reward)
	return rewardList
end


-- ===================end=====================


local ActivityMoneyTreeData = class("ActivityMoneyTreeData", BaseData)

local schema = {}
schema["baseActivityData"] 	= {"table", {}}--基本活动数据
schema["num"] 		= {"number", 0}--摇一摇的次数（不包括免费次数）
schema["free_num"] 		= {"number", 0}--免费摇一摇的次数
ActivityMoneyTreeData.schema = schema

function ActivityMoneyTreeData:ctor(properties)
	ActivityMoneyTreeData.super.ctor(self, properties)

	self._boxDatas = self._createBoxDataFromCfg()
	self._s2cGetActMoneyTreeListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetActMoneyTree, handler(self, self._s2cGetActMoneyTree))
	self._s2cActMoneyTreeListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ActMoneyTree, handler(self, self._s2cActMoneyTree))
	self._s2cActMoneyTreeBoxListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ActMoneyTreeBox, handler(self, self._s2cActMoneyTreeBox))


	local activityBaseData = ActivityBaseData.new()
	activityBaseData:initData({id = ActivityConst.ACT_ID_MONEY_TREE })
	self:setBaseActivityData(activityBaseData)
end

-- 清除
function ActivityMoneyTreeData:clear()
	ActivityMoneyTreeData.super.clear(self)
	self._s2cGetActMoneyTreeListener:remove()
	self._s2cGetActMoneyTreeListener = nil

	self._s2cActMoneyTreeListener:remove()
	self._s2cActMoneyTreeListener = nil

	self._s2cActMoneyTreeBoxListener:remove()
	self._s2cActMoneyTreeBoxListener = nil

	self:getBaseActivityData():clear()
end

-- 重置
function ActivityMoneyTreeData:reset()
	ActivityMoneyTreeData.super.reset(self)
	self:getBaseActivityData():reset()

	self._boxDatas = self._createBoxDataFromCfg()
end

function ActivityMoneyTreeData:_createBoxDataFromCfg()
	local boxDatas = {}
	local length = ActSilverBox.length()
	for i = 1,length,1 do
		local cfg = ActSilverBox.indexOf(i)
		local boxData = ActivityMoneyTreeBoxData.new()
		boxData:initData(cfg.id,false)
		boxDatas[cfg.id] = boxData
	end
	return boxDatas
end

-- 获取摇钱树随等级变化的参数
function ActivityMoneyTreeData:getRoleParam( ... )
	local userLevel = G_UserData:getBase():getLevel()
	local roleInfo = require("app.config.role").get(userLevel)
	assert(roleInfo, string.format("role config can not find level = %d", userLevel))

	return roleInfo.silver_para
end


function ActivityMoneyTreeData:getMoneyTreeBoxDataById(id)
	return self._boxDatas[id]
end

--默认宝箱ID都是连续的12345，否则需要新建一个Table，排序ID
function ActivityMoneyTreeData:getAllMoneyTreeBoxDatas()
	return self._boxDatas
end

--返回最大宝箱的单元数据
function ActivityMoneyTreeData:getMaxBox()
	 --默认宝箱ID都是连续的12345
	 return self._boxDatas[#self._boxDatas]
end

--摇一摇的最大次数
function ActivityMoneyTreeData:getMaxCount()
	return self:getBaseActivityData():getActivityParameter(1)
end

function ActivityMoneyTreeData:_s2cGetActMoneyTree(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	self:setNum(rawget(message,"num") or 0)
	self:setFree_num(rawget(message,"free_num") or 0)
	local boxIds = rawget(message,"box_ids") or {}

	for k,v in ipairs(boxIds) do
		local boxData = self:getMoneyTreeBoxDataById(v)
		if boxData then
			boxData:setReceived(true)
		end
	end

	self:getBaseActivityData():setHasData(true)
	self:resetTime()

	G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_MONEY_TREE_GET_INFO,id,message)
end

function ActivityMoneyTreeData:_s2cActMoneyTree(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	--更新摇一摇的次数
	self:setNum(rawget(message,"num") or 0)
	self:setFree_num(rawget(message,"free_num") or 0)

	G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_MONEY_TREE_SHAKE,id,message)
end

function ActivityMoneyTreeData:_s2cActMoneyTreeBox(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--刷新宝箱已领取
	local boxData = self:getMoneyTreeBoxDataById(message.id)
	boxData:setReceived(true)

	G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_MONEY_TREE_OPEN_BOX,id,message)
end

function ActivityMoneyTreeData:isBoxHasReceived(id)
	local boxData = self:getMoneyTreeBoxDataById(id)
	if not boxData then
		return false
	end
	return boxData:isReceived()
end

function ActivityMoneyTreeData:isBoxCanReceived(id)
	local CommonConst = require("app.const.CommonConst")
	local boxData = self:getMoneyTreeBoxDataById(id)
	if not boxData then
		return CommonConst.BOX_STATUS_NOT_GET
	end
    if boxData:isReceived()  then
		return CommonConst.BOX_STATUS_ALREADY_GET
	end
	if boxData:getConfig().count <= self:getNum() then
		return CommonConst.BOX_STATUS_CAN_GET
	else
		return CommonConst.BOX_STATUS_NOT_GET
	end
end

--摇钱树摇一摇
function ActivityMoneyTreeData:c2sActMoneyTree(type)
	if self:isExpired() == true then
		self:pullData()
		return
	end
	G_NetworkManager:send(MessageIDConst.ID_C2S_ActMoneyTree, {op_type = type})
end

--获取摇钱树数据
function ActivityMoneyTreeData:c2sGetActMoneyTree()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetActMoneyTree, {})
end

--发送领取宝箱消息
function ActivityMoneyTreeData:c2sActMoneyTreeBox(id)
	if self:isExpired() == true then
		self:pullData()
		return
	end
	G_NetworkManager:send(MessageIDConst.ID_C2S_ActMoneyTreeBox, {id = id})
end


function ActivityMoneyTreeData:pullData()
	self:c2sGetActMoneyTree()
end

function ActivityMoneyTreeData:resetData()
	self:pullData()
	self:setNotExpire()--避免重复取数据
end


--返回硬币配置通过次数
function ActivityMoneyTreeData:getActSilverCfgByTime(time)
	if time < 0 then
		return nil
	end
	if time >= act_silver.length() then
		time = act_silver.length() - 1
	end
	local cfg = act_silver.get(time)
	assert(cfg,"act_silver not find count "..tostring(time))
	return cfg
end

--返回当前VIP下最大可购买次数
	--[[
function ActivityMoneyTreeData:getMaxBuyCount()

	local vipInfo = G_UserData:getVip():getVipFunctionDataByType(
		VipFunctionIDConst.VIP_FUNC_ID_MONEY_TREE)
	return vipInfo.value
	

end

]]


function ActivityMoneyTreeData:canShake()
--[[]
	local times = self:getNum()
	local maxTimes = self:getMaxBuyCount()
	return times < maxTimes
	]]
	return true

end

function ActivityMoneyTreeData:getShake10TimesCost()
	local time = self:getNum()
	local cfg = self:getActSilverCfgByTime(time + 1)
	return cfg.cost * 10
end

function ActivityMoneyTreeData:getShakeOnceCost()
	local times = self:getNum()
	local freeTimes = self:getFree_num()
	local totalFreeTimes = self.getFreeCount()

	local cost = 0
	if freeTimes >= totalFreeTimes then
			cost = self:getActSilverCfgByTime(times + 1).cost
	end

	return cost
end

function ActivityMoneyTreeData:hasRedPoint()
	--第一次登陆，都会有红点提醒一下，玩家看后即消失， 当天再次登陆就没了。
	--直接读取缓存即可
	local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
		FunctionConst.FUNC_WELFARE,{actId = ActivityConst.ACT_ID_MONEY_TREE}
    )
	if showed then
		return false
	end
	return true
end


function ActivityMoneyTreeData:getFreeCount()
	local freeCount = act_admin.get(6).value_2
	return freeCount
end


return ActivityMoneyTreeData
