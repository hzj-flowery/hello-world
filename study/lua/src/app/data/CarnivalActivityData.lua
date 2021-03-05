-- Author: nieming
-- Date:2018-01-12 20:14:47
-- Describle：
-- 结构
--[[
	data --结构
		--多个节日狂欢
		CarnivalActivityUnitData
			--一个节日狂欢有多期
			CarnivalActivityTermData
				一期有多个页签
				CarnivalStageActivityData
				--一个页签下 有多个任务类型
					CarnivalSingleActivityData
					--有多个任务
						CommonActivityQuestData

	userData
]]


local BaseData = require("app.data.BaseData")
local CarnivalActivityData = class("CarnivalActivityData", BaseData)

local CarnivalActivityUnitData = require("app.data.CarnivalActivityUnitData")
local CarnivalSingleActivityData = require("app.data.CarnivalSingleActivityData")
local CommonActivityQuestData = require("app.data.CommonActivityQuestData")
local CommonActivityUserTaskData = require("app.data.CommonActivityUserTaskData")
local CustomActivityConst = require("app.const.CustomActivityConst")
local schema = {}
--schema
CarnivalActivityData.schema = schema


function CarnivalActivityData:ctor(properties)
	CarnivalActivityData.super.ctor(self, properties)

	self._signalRecvGetCarnivalActivityAward = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCarnivalActivityAward, handler(self, self._s2cGetCarnivalActivityAward))

	self._signalRecvGetCarnivalActivityInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCarnivalActivityInfo, handler(self, self._s2cGetCarnivalActivityInfo))
	self._signalRecvUpdateCarnivalActivityQuest = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateCarnivalActivityQuest, handler(self, self._s2cUpdateCarnivalActivityQuest))
	self._signalRecvUpdateCarnivalActivity = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateCarnivalActivity, handler(self, self._s2cUpdateCarnivalActivity))
	self._signalRecvGetUserCarnivalActivityQuest = G_NetworkManager:add(MessageIDConst.ID_S2C_GetUserCarnivalActivityQuest, handler(self, self._s2cGetUserCarnivalActivityQuest))
	self._signalActivtyDataChange = G_SignalManager:add(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE, handler(self, self._onEventDataChange))

	self._data = {}
	self._userData = {}  --方便更新quest任务数据
	self._activitys = {} -- 方便插入quest
end

function CarnivalActivityData:clear()
	self._signalRecvGetCarnivalActivityAward:remove()
	self._signalRecvGetCarnivalActivityAward = nil

	self._signalRecvGetCarnivalActivityInfo:remove()
	self._signalRecvGetCarnivalActivityInfo = nil

	self._signalRecvUpdateCarnivalActivityQuest:remove()
	self._signalRecvUpdateCarnivalActivityQuest = nil

	self._signalRecvUpdateCarnivalActivity:remove()
	self._signalRecvUpdateCarnivalActivity = nil

	self._signalRecvGetUserCarnivalActivityQuest:remove()
	self._signalRecvGetUserCarnivalActivityQuest = nil

	self._signalActivtyDataChange:remove()
	self._signalActivtyDataChange = nil
end

function CarnivalActivityData:reset()
	self._data = {}
	self._userData = {}  --方便更新quest任务数据
	self._activitys = {} -- 方便插入quest
end

-- 数据变化 计算红点状态
function CarnivalActivityData:_onEventDataChange()
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_CARNIVAL_ACTIVITY)
	G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_CARNIVAL_ACTIVITY)
end

--刷新红点状态
function CarnivalActivityData:_checkRedPointChange()
	local state = false
	for k, v in pairs(self._activitys) do
		if v:isHasRedPoint() then
			state = true
			break
		end
	end
	return state
end

-- 检查 keys { key = carnival_id。。termid }
function CarnivalActivityData:isTermsHasRedPoint(termIDs)
	if not termIDs then
		return false
	end
	for k, v in pairs(self._activitys) do
		local key = v:getCarnival_id().."_"..v:getTerm()
		if termIDs[key] then
			if v:isHasRedPoint() then
				return true
			end
		end
	end
end

function CarnivalActivityData:isHasRedPoint()
	return self:_checkRedPointChange()
end

function CarnivalActivityData:getAllVisibleTermData()
	local visibleActData = {}
	for _, v in pairs(self._data) do
		if v:checkActIsVisible() then
			table.insert(visibleActData,v)
		end
	end
	local sortFunc = function(left,right)
		if left:getStart_time() ~= right:getStart_time() then
			return left:getStart_time() > right:getStart_time()
		end
		return left:getId() < right:getId()
	end
	--排序
	table.sort(visibleActData,sortFunc)

	local allTerms = {}
	for _, v in ipairs(visibleActData) do
		local terms = v:getVisibleTermList()
		for _, j in ipairs(terms) do
			table.insert(allTerms, j)
		end
	end
	

	return allTerms
end

--只需要第一个节日狂欢数据就可以了  其他的节日狂欢 不做处理
function CarnivalActivityData:getUnitDataById(carnival_id)
	for _, v in pairs(self._data) do
		if v:getId() == carnival_id then
			return v
		end
	end
end



--获取期数数据
function CarnivalActivityData:getTermData(carnival_id, termId)
	local termData
	local unitData = self:getUnitDataById(carnival_id)
	if unitData then
		termData = unitData:getTermDataById(termId)
		return termData
	end
end

function CarnivalActivityData:_insertActivityDataToStage(activityData)
	local termData = self:getTermData(activityData:getCarnival_id(), activityData:getTerm())
	if termData then
		local stageData = termData:getStageDataById(activityData:getStage())
		if stageData  then-- activityData:getAct_type() ~= CustomActivityConst.CUSTOM_ACTIVITY_TYPE_DROP
			stageData:insertActivityData(activityData)
			return
		end
	end
end

function CarnivalActivityData:_removeActivityDataFromStage(activityData)
	local termData = self:getTermData(activityData:getCarnival_id(), activityData:getTerm())
	if termData then
		local stageData = termData:getStageDataById(activityData:getStage())
		if stageData then
			stageData:removeActivityData(activityData)
			return
		end
	end
end

function CarnivalActivityData:getActivityDataById(id)
	return self._activitys[id]
end

function CarnivalActivityData:_insertUnitData(data)
	local unitData = CarnivalActivityUnitData.new()
	unitData:initData(data)
	table.insert(self._data, unitData)
end

function CarnivalActivityData:_insertActivityData(data)
	local activityData = CarnivalSingleActivityData.new()
	activityData:initData(data)
	self._activitys[activityData:getId()] = activityData
	self:_insertActivityDataToStage(activityData)
end

function CarnivalActivityData:_insertQuestData(data)
	local questData = CommonActivityQuestData.new()
	questData:initData(data)
	questData:setUserDataSource(CustomActivityConst.CUSTOM_QUEST_USER_DATA_SOURCE_CARNIVAL)
	local activityData = self:getActivityDataById(questData:getAct_id())
	if activityData then
		activityData:insertQuestData(questData)
	end
end

function CarnivalActivityData:_insertUserData(data)
	local actUserTaskData = CommonActivityUserTaskData.new()
	actUserTaskData:initData(data)
	self._userData[actUserTaskData:getAct_id().."_"..actUserTaskData:getQuest_id()] = actUserTaskData
end

function CarnivalActivityData:getActUserData(actId,questId)
    return self._userData[actId.."_"..questId]
end


function CarnivalActivityData:hasActivityCanVisible()
	for _, v in pairs(self._data) do
		local terms = v:getVisibleTermList()
		if #terms > 0 then
			return true
		end
	end
	return false
end


function CarnivalActivityData:getMainMenuIconFunctionId()
	--取第一期活动配置的FunctionID
	local FestivalResConfog = require("app.config.festival_res")
	local termDataList = self:getAllVisibleTermData()
	local functionIdList = {}
	for k,v in ipairs(termDataList) do
		local titleConfig = FestivalResConfog.get(v:getTerm_icon())
		assert(titleConfig ~= nil, "can not find res id")
		functionIdList[ titleConfig.icon] = true
	end
	local functionId = nil
	local count = 0
	for k,v in pairs(functionIdList) do
		count = count + 1
		functionId = k
	end
	if count ~= 1 then
		return nil--使用默认FunctionId
	end
	return functionId
end

-- Describle：活动领奖
-- Param:
--	act_id  活动id
--	quest_id  任务id
--	award_id  可选奖励的第几个奖励 从0开始
--	award_num  兑换奖励兑换次数
function CarnivalActivityData:c2sGetCarnivalActivityAward( act_id, quest_id, award_id, award_num)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetCarnivalActivityAward, {
		act_id = act_id,
		quest_id = quest_id,
		award_id = award_id,
		award_num = award_num or 1,
	})
	print("c2sGetCarnivalActivityAward ",award_num)
end
-- Describle：
function CarnivalActivityData:_s2cGetCarnivalActivityAward(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
	 	return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_GET_CARNIVAL_ACTIVITY_AWARD_SUCCESS, message)
end
-- Describle：获取活动信息
-- Param:

function CarnivalActivityData:c2sGetCarnivalActivityInfo()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetCarnivalActivityInfo, {

	})
end

-- Describle：登录获取的
function CarnivalActivityData:_s2cGetCarnivalActivityInfo(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
	 	return
	end
	--check data
	self._data = {}
	local carnival = rawget(message, "carnival")
	if carnival then
		for _, v in ipairs(carnival) do
			self:_insertUnitData(v)
		end
	end

	self._activitys = {}
	local activity = rawget(message, "activity")
	if activity then
		for _, v in ipairs(activity) do
			self:_insertActivityData(v)
		end
	end

	local quest = rawget(message, "quest")
	if quest then
		for _, v in ipairs(quest) do
			self:_insertQuestData(v)
		end
	end
	local user_quest = rawget(message, "user_quest")
	if user_quest then
		for _, v in ipairs(user_quest) do
			self:_insertUserData(v)
		end
	end
	G_SignalManager:dispatch(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE)
end

-- Describle：
function CarnivalActivityData:_s2cUpdateCarnivalActivityQuest(id, message)
	-- if message.ret ~= MessageErrorConst.RET_OK then
	-- 	return
	-- end
	--check data
	local user_quest = rawget(message, "user_quest")
	if user_quest then
		for _, v in ipairs(user_quest)do
			self:_insertUserData(v)
		end
	end
	G_SignalManager:dispatch(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE)
end

--修改活动 删除旧的配置
function CarnivalActivityData:_cleanDirtyData(carnivalId)
	--
	for k, v in ipairs(self._data)do
		if v:getId() == carnivalId then
			table.remove(self._data, k)
			break
		end
	end

	for k,v in pairs(self._activitys) do
		if v:getCarnival_id() == carnivalId then
			self._activitys[k] = nil
		end
	end

end
-- Describle：活动有修改的时候 全局广播
function CarnivalActivityData:_s2cUpdateCarnivalActivity(id, message)
	-- if message.ret ~= MessageErrorConst.RET_OK then
	-- 	return
	-- end
	--check data
	local carnival = rawget(message, "carnival")
	if carnival then
		for _, v in ipairs(carnival) do
			self:_cleanDirtyData(v.id)
			self:_insertUnitData(v)
		end
	end

	local activity = rawget(message, "activity")
	if activity then
		for _, v in ipairs(activity) do
			self:_insertActivityData(v)
		end
	end
	local quest = rawget(message, "quest")
	if quest then
		for _, v in ipairs(quest) do
			self:_insertQuestData(v)
		end
	end
	-- 删除活动
	local delete_activity = rawget(message, "delete_activity")
	if delete_activity then
		for k, v in ipairs(delete_activity)do
			local actitivyData = self:getActivityDataById(v)
			if actitivyData then
				self:_removeActivityDataFromStage(actitivyData)
				self._activitys[v] = nil
			end
		end
	end

	G_SignalManager:dispatch(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE)
end
-- Describle：获取个人记录
-- Param:

function CarnivalActivityData:c2sGetUserCarnivalActivityQuest()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetUserCarnivalActivityQuest, {

	})
end
-- Describle：
function CarnivalActivityData:_s2cGetUserCarnivalActivityQuest(id, message)
	-- if message.ret ~= MessageErrorConst.RET_OK then
	-- 	return
	-- end
	--check data
	local user_quest = rawget(message, "user_quest")
	if user_quest then
		for _, v in ipairs(user_quest) do
			self:_insertUserData(v)
		end
	end

	G_SignalManager:dispatch(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE)
end



return CarnivalActivityData
