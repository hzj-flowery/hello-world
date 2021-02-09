--
-- Author: Liangxu
-- Date: 2019-5-5
-- 蛋糕活动数据

local BaseData = require("app.data.BaseData")
local CakeActivityData = class("CakeActivityData", BaseData)
local CakeActivityUserRankData = require("app.data.CakeActivityUserRankData")
local CakeActivityGuildRankData = require("app.data.CakeActivityGuildRankData")
local GuildCakeData = require("app.data.GuildCakeData")
local CakeTaskData = require("app.data.CakeTaskData")
local CakeActivityNoticeData = require("app.data.CakeActivityNoticeData")
local CakeActivityConst = require("app.const.CakeActivityConst")
local ShopConst = require("app.const.ShopConst")
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")
local TimeConst = require("app.const.TimeConst")

local schema = {}
schema["batchId"] = {"number", 0}
schema["activityStartTime"] = {"number", 0}
schema["actType"] = {"number", 0}
CakeActivityData.schema = schema

function CakeActivityData:ctor(properties)
	CakeActivityData.super.ctor(self, properties)

	self._taskDatas = {} --任务数据
	self._cakeDataList = {} --蛋糕数据
	self._upRewards = {} --蛋糕升级的奖励 {Key是rewardId, Value:1已领，0未领}
	self._loginRewards = {} --蛋糕登录奖励{Key是第几天, Value:1已领，0未领}
	self._guildRankDatas = {} --军团排行
	self._userRankDatas = {} --个人排行
	self._selfGuildRank = nil --本军团排行信息
	self._selfUserRank = nil --本人排行信息
	self._noticeDatas = {} --通知数据
	self._selfPoint = 0 --本人积分
	self._selectCakeIndex = 0

	self._recvGetCakeActivityTaskReward = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCakeActivityTaskReward, handler(self, self._s2cGetCakeActivityTaskReward))
	self._recvEnterCakeActivity = G_NetworkManager:add(MessageIDConst.ID_S2C_EnterCakeActivity, handler(self, self._s2cEnterCakeActivity))
	self._recvUpdateCakeTaskInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateCakeTaskInfo, handler(self, self._s2cUpdateCakeTaskInfo))
	self._recvAddGuildCakeExp = G_NetworkManager:add(MessageIDConst.ID_S2C_AddGuildCakeExp, handler(self, self._s2cAddGuildCakeExp))
	self._recvUpdateGuildCakeInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateGuildCakeInfo, handler(self, self._s2cUpdateGuildCakeInfo))
	self._recvUpdateRankCakeAndNotice = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateRankCakeAndNotice, handler(self, self._s2cUpdateRankCakeAndNotice))
	self._recvGetCakeActivityStatus = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCakeActivityStatus, handler(self, self._s2cGetCakeActivityStatus))
	self._recvGetGuildCakeUpLvReward = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildCakeUpLvReward, handler(self, self._s2cGetGuildCakeUpLvReward))
	self._recvUpdateGuildCakeLvUpReward = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateGuildCakeLvUpReward, handler(self, self._s2cUpdateGuildCakeLvUpReward))
	self._recvCakeRechrageReward = G_NetworkManager:add(MessageIDConst.ID_S2C_CakeRechrageReward, handler(self, self._s2cCakeRechrageReward))
	self._recvGetGuildCakeLoginReward = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildCakeLoginReward, handler(self, self._s2cGetGuildCakeLoginReward))
	self._recvExchargeReward = G_NetworkManager:add(MessageIDConst.ID_S2C_ExchargeReward, handler(self, self._s2cExchargeReward))

	self:_initTaskMap()
	self:_initRankMap()
end

function CakeActivityData:reset()
	self._taskDatas = {} --任务数据
	self._cakeDataList = {} --蛋糕数据
	self._upRewards = {} --蛋糕升级的奖励Id
	self._loginRewards = {}
	self._guildRankDatas = {} --军团排行
	self._userRankDatas = {} --个人排行
	self._selfGuildRank = nil --本军团排行信息
	self._selfUserRank = nil --本人排行信息
	self._noticeDatas = {} --通知数据
	self._selfPoint = 0 --本人积分
	self._selectCakeIndex = 0
end

function CakeActivityData:clear()
	self._recvGetCakeActivityTaskReward:remove()
	self._recvGetCakeActivityTaskReward = nil
	self._recvEnterCakeActivity:remove()
	self._recvEnterCakeActivity = nil
	self._recvUpdateCakeTaskInfo:remove()
	self._recvUpdateCakeTaskInfo = nil
	self._recvAddGuildCakeExp:remove()
	self._recvAddGuildCakeExp = nil
	self._recvUpdateGuildCakeInfo:remove()
	self._recvUpdateGuildCakeInfo = nil
	self._recvUpdateRankCakeAndNotice:remove()
	self._recvUpdateRankCakeAndNotice = nil
	self._recvGetCakeActivityStatus:remove()
	self._recvGetCakeActivityStatus = nil
	self._recvGetGuildCakeUpLvReward:remove()
	self._recvGetGuildCakeUpLvReward = nil
	self._recvUpdateGuildCakeLvUpReward:remove()
	self._recvUpdateGuildCakeLvUpReward = nil
	self._recvCakeRechrageReward:remove()
	self._recvCakeRechrageReward = nil
	self._recvGetGuildCakeLoginReward:remove()
	self._recvGetGuildCakeLoginReward = nil
	self._recvExchargeReward:remove()
	self._recvExchargeReward = nil
end

function CakeActivityData:_initTaskMap()
	self._taskMap = {}
	self._taskDatas = {}
	local Config = require("app.config.cake_task")
	local len = Config.length()
	for i = 1, len do
		local info = Config.indexOf(i)
		local type = info.type
		local id = info.id
		if self._taskMap[type] == nil then
			self._taskMap[type] = {}
		end
		table.insert(self._taskMap[type], info)
		if self._taskDatas[type] == nil then
			self._taskDatas[type] = CakeTaskData.new({type = type})
		end
	end
	for type, list in pairs(self._taskMap) do
		table.sort(list, function(a, b)
			return a.times < b.times
		end)
	end
end

function CakeActivityData:_initRankMap()
	self._rankMap = {}
	local Config = require("app.config.cake_rank")
	local len = Config.length()
	for i = 1, len do
		local info = Config.indexOf(i)
		local actType = info.cake_type
		local batch = info.batch
		local type = info.type
		if self._rankMap[actType] == nil then
			self._rankMap[actType] = {}
		end
		if self._rankMap[actType][batch] == nil then
			self._rankMap[actType][batch] = {}
		end
		if self._rankMap[actType][batch][type] == nil then
			self._rankMap[actType][batch][type] = {}
		end
		table.insert(self._rankMap[actType][batch][type], info)
	end
end

function CakeActivityData:getRankInfo(batch, type)
	local actType = self:getActType()
	local info = self._rankMap[actType][batch][type]
	assert(info, string.format("cake_rank config can not actType = %d, batch = %d, type = %d", actType, batch, type))
	return info
end

function CakeActivityData:createFakeNoticeData(data)
	data.fake = true
	local noticeData = CakeActivityNoticeData.new()
	noticeData:updateData(data)

	return noticeData
end

function CakeActivityData:getTaskInfoWithType(type)
	local info = self._taskMap[type]
	assert(info, string.format("cake_task config can not find type = %d", type))
	return info
end

function CakeActivityData:getTaskDataWithType(type)
	local data = self._taskDatas[type]
	assert(data, string.format("CakeActivityData:_initTaskMap not init type = %d", type))
	return data
end

function CakeActivityData:getTaskList()
	local sortFunc = function(a, b)
		if a:isFinish() ~= b:isFinish() then
			return a:isFinish() == false --没完成的排在前面
		elseif a:isCanReceive() ~= b:isCanReceive() then
			return a:isCanReceive() == true --能领奖的排在前面
		else
			return a:getType() < b:getType()
		end
	end

	local result = {}
	for type, data in pairs(self._taskDatas) do
		table.insert(result, data)
	end
	
	table.sort(result, sortFunc)

	return result
end

function CakeActivityData:getChargeList()
	local result = {}
	local actType = self:getActType()
	local Config = require("app.config.cake_charge")
	local len = Config.length()
	for i = 1, len do
		local info = Config.indexOf(i)
		if info.type == actType then
			table.insert(result, info.id)
		end
	end

	return result
end

function CakeActivityData:getCakeDataList()
	local result = {}
	for k, data in pairs(self._cakeDataList) do
		table.insert(result, data)
	end
	table.sort(result, function(a, b)
		return a:getGuild_noraml_end_rank() < b:getGuild_noraml_end_rank()
	end)
	return result
end

function CakeActivityData:getCakeDataWithId(id)
	return self._cakeDataList[id]
end

function CakeActivityData:getUpRewards()
	local result = {}
	for rewardId, data in pairs(self._upRewards) do
		table.insert(result, data)
	end
	table.sort(result, function(a, b)
		return a.rewardId < b.rewardId
	end)
	return result
end

function CakeActivityData:getUpRewardWithId(id)
	return self._upRewards[id]
end

function CakeActivityData:getLoginRewards()
	local result = {}
	local maxDay = CakeActivityDataHelper.getDailyAwardMaxDay()
	for day, data in pairs(self._loginRewards) do
		if day <= maxDay then
			table.insert(result, data)
		end
	end
	return result
end

function CakeActivityData:getLoginRewardWithDay(day)
	return self._loginRewards[day]
end

function CakeActivityData:getGuildRankList()
	return self._guildRankDatas
end

function CakeActivityData:getGuildRankWithId(id)
	for i, data in ipairs(self._guildRankDatas) do
		if data:getGuild_id() == id then
			return data
		end
	end
	return nil
end

function CakeActivityData:getUserRankList()
	return self._userRankDatas
end

function CakeActivityData:getUserRankWithId(id)
	for i, data in ipairs(self._userRankDatas) do
		if data:getUser_id() == id then
			return data
		end
	end
	return nil
end

function CakeActivityData:getSelfGuildRank()
	return self._selfGuildRank
end

function CakeActivityData:getSelfUserRank()
	return self._selfUserRank
end

function CakeActivityData:getNoticeDatas()
	return self._noticeDatas
end

function CakeActivityData:getNoticeDataWithIndex(index)
	return self._noticeDatas[index]
end

function CakeActivityData:addNoticeData(data)
	table.insert(self._noticeDatas, data)
end

--移除多余的信息
function CakeActivityData:removeNoticeBeyond()
	local maxCount = CakeActivityConst.INFO_LIST_MAX_COUNT
	local tempDatas = {}
	local maxIndex = #self._noticeDatas
	for i = 1, maxCount do --去最后的maxCount条
		local data = self._noticeDatas[maxIndex-maxCount+i]
		if data then
			table.insert(tempDatas, data)
		end
	end
	self._noticeDatas = tempDatas
end

function CakeActivityData:getSelfPoint()
	return self._selfPoint
end

--检查是否是自己的推送
function CakeActivityData:_checkIsSelfNotice(data)
	local strUId = data:getContentDesWithKey("uid")
	if strUId ~= "" and tonumber(strUId) == G_UserData:getBase():getId() then
		return true
	end
	return false
end

--检查是否是需要弹出的推送
function CakeActivityData:_checkIsBulletNotice(data)
	if data:getNotice_id() == CakeActivityConst.NOTICE_TYPE_COMMON then
		return true
	else
		return false
	end
end

function CakeActivityData:setSelectCakeIndex(index)
	self._selectCakeIndex = index
end

function CakeActivityData:getMyGuildCakeIndex()
	local index = 0
	local myGuildId = G_UserData:getGuild():getMyGuildId()
	local cakeDataList = self:getCakeDataList()
	for i, data in ipairs(cakeDataList) do
		if myGuildId == data:getGuild_id() then
			index = i
			break 
		end
	end
	return index
end

function CakeActivityData:getSelectCakeIndex()
	if self._selectCakeIndex == 0 then
		self._selectCakeIndex = self:getMyGuildCakeIndex()
	end
	return self._selectCakeIndex
end

function CakeActivityData:isShowShopRedPoint()
	local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")
	local tabNameList = ShopActiveDataHelper.getShopSubTab(ShopConst.CAKE_ACTIVE_SHOP)
	for i = 1, #tabNameList do
		local isShow = self:isShowShopRedPointWithIndex(i)
		if isShow then
			return true
		end
	end
	return false
end

function CakeActivityData:isShowShopRedPointWithIndex(index)
	local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
		FunctionConst.FUNC_CAKE_ACTIVITY_SHOP,{index = index}
	)
	if showed then
		return false
	end

	local startTime = self:getActivityStartTime()
	local curBatch = self:getBatchId()
	local goodIds = G_UserData:getShopActive():getGoodIdsWithShopAndTabIdBySort(ShopConst.CAKE_ACTIVE_SHOP, index, curBatch)
	for j, goodId in ipairs(goodIds) do
		local data = G_UserData:getShopActive():getUnitDataWithId(goodId)
		if data:getConfig().limit_type == 1 then
			local targetTime = startTime + data:getConfig().limit_value
			if G_ServerTime:getTime() >= targetTime then
				return true
			end
		end
	end
	return false
end

--是否有材料可领取
function CakeActivityData:isHaveCanGetMaterial()
	if self:getActType() == 0 then
		return false
	end
	local taskList = self:getTaskList()
	for i, data in ipairs(taskList) do
		local id = data:getCurShowId()
		local info = CakeActivityDataHelper.getCurCakeTaskConfig(id)
		if data:isFinish() == false and data:getValue() >= info.times then
			return true
		end
	end
	return false
end

--是否提示充值(获取奶油)
function CakeActivityData:isPromptRecharge()
	local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
		FunctionConst.FUNC_CAKE_ACTIVITY_GET_MATERIAL,{index = CakeActivityConst.MATERIAL_TYPE_2}
	)
	if showed then
		return false
	end
	local actStage = CakeActivityDataHelper.getActStage()
	if actStage == CakeActivityConst.ACT_STAGE_4 then
		return false
	end
	return true
end

--是否有可捐献的材料
function CakeActivityData:isHaveCanGiveMaterial()
	if CakeActivityDataHelper.isCanGiveMaterial() == false then
		return false
	end
	local UserDataHelper = require("app.utils.UserDataHelper")
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	for type = CakeActivityConst.MATERIAL_TYPE_1, CakeActivityConst.MATERIAL_TYPE_3 do
		local itemId = CakeActivityDataHelper.getMaterialItemId(type)
		local count = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemId)
		if count > 0 then
			return true
		end
	end
	return false
end

--是否有可领取的蛋糕升级奖励
function CakeActivityData:isHaveCanGetLevelUpAward()
	local rewards = self:getUpRewards()
	for i, reward in ipairs(rewards) do
		if reward.isReceived == false then
			return true
		end
	end
	return false
end

--是否有可领的蛋糕日常登录奖励
function CakeActivityData:isHaveCanGetDailyAward()
	local rewards = self:getLoginRewards()
	for i, reward in ipairs(rewards) do
		if reward.isReceived == false then
			return true
		end
	end
	return false
end

----------------------------------------协议部分----------------------------------------------
function CakeActivityData:c2sGetCakeActivityTaskReward(taskId)
	if self:isExpired(TimeConst.RESET_TIME_24) == true then
		self:c2sEnterCakeActivity()
		return 
	end
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetCakeActivityTaskReward, {
		task_id = taskId
    })
end

function CakeActivityData:_s2cGetCakeActivityTaskReward(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local taskId = rawget(message, "task_id") or 0
	local awards = rawget(message, "awards") or {}

	G_SignalManager:dispatch(SignalConst.EVENT_CAKE_ACTIVITY_GET_TASK_REWARD, taskId, awards)
end

function CakeActivityData:c2sEnterCakeActivity()
	G_NetworkManager:send(MessageIDConst.ID_C2S_EnterCakeActivity, {
		
    })
end

function CakeActivityData:_s2cEnterCakeActivity(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:resetTime()
	local tasks = rawget(message, "tasks") or {}
	local guildCakes = rawget(message, "guild_cake") or {}
	local upReward = rawget(message, "up_reward") or {}
	local cakeGuildRank = rawget(message, "cake_guild_rank") or {}
	local selfCakeGuildRank = rawget(message, "self_cake_guild_rank")
	local cakeUserRank = rawget(message, "cake_user_rank") or {}
	local selfCakeUserRank = rawget(message, "self_cake_user_rank")
	local cakeNotice = rawget(message, "cake_notice") or {}
	local loginReward = rawget(message, "login_reward") or {}
	local point = rawget(message, "point") or 0

	self:_initTaskMap()
	for i, task in ipairs(tasks) do
		local type = rawget(task, "type")
		local data = self:getTaskDataWithType(type)
		data:updateData(task)
	end

	self._cakeDataList = {}
	for i, guildCake in ipairs(guildCakes) do
		local cakeData = GuildCakeData.new()
		cakeData:updateData(guildCake)
		local guildId = cakeData:getGuild_id()
		self._cakeDataList[guildId] = cakeData
	end

	self._upRewards = {}
	for i, data in ipairs(upReward) do
		local rewardId = rawget(data, "Key")
		local value = rawget(data, "Value")
		self._upRewards[rewardId] = {rewardId = rewardId, isReceived = value == 1}
	end

	self._guildRankDatas = {}
	for i, rank in ipairs(cakeGuildRank) do
		local data = CakeActivityGuildRankData.new()
		data:updateData(rank)
		table.insert(self._guildRankDatas, data)
	end

	self._selfGuildRank = nil
	if selfCakeGuildRank then
		self._selfGuildRank = CakeActivityGuildRankData.new()
		self._selfGuildRank:updateData(selfCakeGuildRank)
	end

	self._userRankDatas = {}
	for i, rank in ipairs(cakeUserRank) do
		local data = CakeActivityUserRankData.new()
		data:updateData(rank)
		table.insert(self._userRankDatas, data)
	end
	
	self._selfUserRank = nil
	if selfCakeUserRank then
		self._selfUserRank = CakeActivityUserRankData.new()
		self._selfUserRank:updateData(selfCakeUserRank)
	end

	self._noticeDatas = {}
	for i, notice in ipairs(cakeNotice) do
		local data = CakeActivityNoticeData.new()
		data:updateData(notice)
		self:addNoticeData(data)
	end

	self._loginRewards = {}
	for i, data in ipairs(loginReward) do
		local day = rawget(data, "Key")
		local value = rawget(data, "Value")
		self._loginRewards[day] = {day = day, isReceived = value == 1}
	end

	self._selfPoint = point

	G_SignalManager:dispatch(SignalConst.EVENT_CAKE_ACTIVITY_ENTER_SUCCESS)
end

function CakeActivityData:_s2cUpdateCakeTaskInfo(id, message)
	local tasks = rawget(message, "tasks") or {}
	for i, task in ipairs(tasks) do
		local type = rawget(task, "type")
		local data = self:getTaskDataWithType(type)
		data:updateData(task)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_TASK_INFO)
end

function CakeActivityData:c2sAddGuildCakeExp(addGuildId, itemId, itemNum)
	logWarn("----CakeActivityData:c2sAddGuildCakeExp:addGuildId = "..addGuildId.." itemId = "..itemId.."itemNum = "..itemNum)
	G_NetworkManager:send(MessageIDConst.ID_C2S_AddGuildCakeExp, {
		add_guild_id = addGuildId,
		item_id = itemId,
		item_num = itemNum,
    })
end

function CakeActivityData:_s2cAddGuildCakeExp(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local itemId = rawget(message, "item_id") or 0
	local itemNum = rawget(message, "item_num") or 0
	local awards = rawget(message, "awards") or {}
	local cakeNotice = rawget(message, "cake_notice") or {}
	local addEggLimit = rawget(message, "add_egg_limit")
	local addGuildId = rawget(message, "add_guild_id")
	local point = rawget(message, "point")

	self._selfPoint = point
	local noticeDatas = {}
	for i, notice in ipairs(cakeNotice) do
		local data = CakeActivityNoticeData.new()
		data:updateData(notice)
		self:addNoticeData(data)
		if self:_checkIsBulletNotice(data) then
			table.insert(noticeDatas, data)
		end
	end

	G_SignalManager:dispatch(SignalConst.EVENT_CAKE_ACTIVITY_ADD_CAKE_EXP, itemId, itemNum, awards, noticeDatas, addEggLimit)
end

function CakeActivityData:_s2cUpdateGuildCakeInfo(id, message)
	local guildCakes = rawget(message, "guild_cake") or {}
	local guildIds = {}
	for i, guildCake in ipairs(guildCakes) do
		local guildId = rawget(guildCake, "guild_id")
		local cakeData = self:getCakeDataWithId(guildId)
		if cakeData then
			table.insert(guildIds, guildId)
			cakeData:updateData(guildCake)
		end
	end

	G_SignalManager:dispatch(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_CAKE_INFO, guildIds)
end

function CakeActivityData:_s2cUpdateRankCakeAndNotice(id, message)
	local cakeGuildRank = rawget(message, "cake_guild_rank") or {}
	local selfCakeGuildRank = rawget(message, "self_cake_guild_rank")
	local cakeUserRank = rawget(message, "cake_user_rank") or {}
	local selfCakeUserRank = rawget(message, "self_cake_user_rank")
	local cakeNotice = rawget(message, "cake_notice") or {}

	local guildRankDatas = {}
	for i, rank in ipairs(cakeGuildRank) do
		local guildId = rawget(rank, "guild_id")
		local data = self:getGuildRankWithId(guildId)
		if data == nil then
			data = CakeActivityGuildRankData.new()
		end
		data:updateData(rank)
		table.insert(guildRankDatas, data)
	end
	self._guildRankDatas = guildRankDatas

	if selfCakeGuildRank then
		if self._selfGuildRank == nil then
			self._selfGuildRank = CakeActivityGuildRankData.new()
		end
		self._selfGuildRank:updateData(selfCakeGuildRank)
	end

	local userRankDatas = {}
	for i, rank in ipairs(cakeUserRank) do
		local userId = rawget(rank, "user_id")
		local data = self:getUserRankWithId(userId)
		if data == nil then
			data = CakeActivityUserRankData.new()
		end
		data:updateData(rank)
		table.insert(userRankDatas, data)
	end
	self._userRankDatas = userRankDatas

	if selfCakeUserRank then
		if self._selfUserRank == nil then
			self._selfUserRank = CakeActivityUserRankData.new()
		end
		self._selfUserRank:updateData(selfCakeUserRank)
	end

	local noticeDatas = {}
	for i, notice in ipairs(cakeNotice) do
		local data = CakeActivityNoticeData.new()
		data:updateData(notice)
		if self:_checkIsSelfNotice(data) == false then --不是自己的
			self:addNoticeData(data)
			if self:_checkIsBulletNotice(data) then
				table.insert(noticeDatas, data)
			end
		end
	end

	G_SignalManager:dispatch(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_RANK_CAKE_AND_NOTICE, noticeDatas)
end

function CakeActivityData:_s2cGetCakeActivityStatus(id, message)
	local batchId = rawget(message, "batch_id") or 0
	local activityStartTime = rawget(message, "activity_start_time") or 0
	local actType = rawget(message, "act_type") or 0

	self:setBatchId(batchId)
	self:setActivityStartTime(activityStartTime)
	self:setActType(actType)

	G_SignalManager:dispatch(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_ACTIVITY_STATUS)
	G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_CAKE_ACTIVITY)
end

function CakeActivityData:c2sGetGuildCakeUpLvReward(upRewardId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetGuildCakeUpLvReward, {
		up_reward_id = upRewardId,
    })
end

function CakeActivityData:_s2cGetGuildCakeUpLvReward(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local upRewardId = rawget(message, "up_reward_id") or 0
	local awards = rawget(message, "awards") or {}
	local upReward = rawget(message, "up_reward") or {}

	for i, data in ipairs(upReward) do
		local rewardId = rawget(data, "Key")
		local value = rawget(data, "Value")
		self._upRewards[rewardId] = {rewardId = rewardId, isReceived = value == 1}
	end

	G_SignalManager:dispatch(SignalConst.EVENT_CAKE_ACTIVITY_GET_LEVEL_UP_REWARD, awards, upRewardId)
end

function CakeActivityData:_s2cUpdateGuildCakeLvUpReward(id, message)
	local upReward = rawget(message, "up_reward") or {}

	for i, data in ipairs(upReward) do
		local rewardId = rawget(data, "Key")
		local value = rawget(data, "Value")
		self._upRewards[rewardId] = {rewardId = rewardId, isReceived = value == 1}
	end

	G_SignalManager:dispatch(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_LEVEL_UP_REWARD)
end

function CakeActivityData:_s2cCakeRechrageReward(id, message)
	local awards = rawget(message, "awards") or {}

	G_SignalManager:dispatch(SignalConst.EVENT_CAKE_ACTIVITY_GET_RECHARGE_REWARD, awards)
end

function CakeActivityData:c2sGetGuildCakeLoginReward(dayId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetGuildCakeLoginReward, {
		day_id = dayId,
    })
end

function CakeActivityData:_s2cGetGuildCakeLoginReward(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local dayId = rawget(message, "day_id") or 0
	local awards = rawget(message, "awards") or {}
	local loginReward = rawget(message, "login_reward") or {}
	for i, data in ipairs(loginReward) do
		local day = rawget(data, "Key")
		local value = rawget(data, "Value")
		self._loginRewards[day] = {day = day, isReceived = value == 1}
	end

	G_SignalManager:dispatch(SignalConst.EVENT_CAKE_ACTIVITY_GET_DAILY_REWARD, awards)
end

function CakeActivityData:c2sExchargeReward(id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ExchargeReward, {
		id = id,
	})
end

function CakeActivityData:_s2cExchargeReward(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local id = rawget(message, "id") or 0
	local awards = rawget(message, "awards") or {}
	
	G_SignalManager:dispatch(SignalConst.EVENT_CAKE_ACTIVITY_RECHARGE_REWARD, awards)
end

return CakeActivityData