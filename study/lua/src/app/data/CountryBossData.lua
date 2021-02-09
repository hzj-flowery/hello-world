-- Author: nieming
-- Date:2018-05-08 10:11:27
-- Describle：三国战纪  军团boss2

local BaseData = require("app.data.BaseData")
local CountryBossData = class("CountryBossData", BaseData)
local CountryBossUnitData = require("app.data.CountryBossUnitData")
local CountryBossVoteUnitData = require("app.data.CountryBossVoteUnitData")
local CountryBossInterceptUnitData = require("app.data.CountryBossInterceptUnitData")
local CountryBossConst = require("app.const.CountryBossConst")

local schema = {}
schema["challenge_boss_time1"] = {"number", 0} --打boss时间
schema["challenge_boss_time2"] = {"number", 0} --打大boss时间
schema["challenge_boss_user"] = {"number", 0} --打大boss时间
schema["self_vote"] = {"number", 0}
schema["final_vote"] = {"number", 0}

schema["ahead_time1"] = {"number", 0} -- 第一阶段提前结束 时间
schema["ahead_time3"] = {"number", 0} -- 整个活动结束
--schema
CountryBossData.schema = schema

function CountryBossData:ctor(properties)
	CountryBossData.super.ctor(self, properties)

	self._signalRecvAttackCountryBoss =
		G_NetworkManager:add(MessageIDConst.ID_S2C_AttackCountryBoss, handler(self, self._s2cAttackCountryBoss))

	self._signalRecvSyncCountryBossVote =
		G_NetworkManager:add(MessageIDConst.ID_S2C_SyncCountryBossVote, handler(self, self._s2cSyncCountryBossVote))

	self._signalRecvInterceptCountryBossList =
		G_NetworkManager:add(MessageIDConst.ID_S2C_InterceptCountryBossList, handler(self, self._s2cInterceptCountryBossList))

	self._signalRecvSyncCountryBossUser =
		G_NetworkManager:add(MessageIDConst.ID_S2C_SyncCountryBossUser, handler(self, self._s2cSyncCountryBossUser))

	self._signalRecvCountryBossVote =
		G_NetworkManager:add(MessageIDConst.ID_S2C_CountryBossVote, handler(self, self._s2cCountryBossVote))

	self._signalRecvSyncCountryBoss =
		G_NetworkManager:add(MessageIDConst.ID_S2C_SyncCountryBoss, handler(self, self._s2cSyncCountryBoss))

	self._signalRecvEnterCountryBoss =
		G_NetworkManager:add(MessageIDConst.ID_S2C_EnterCountryBoss, handler(self, self._s2cEnterCountryBoss))

	self._signalRecvInterceptCountryBossUser =
		G_NetworkManager:add(MessageIDConst.ID_S2C_InterceptCountryBossUser, handler(self, self._s2cInterceptCountryBossUser))
	self._signalRecvGetMaxCountryBossList =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GetMaxCountryBossList, handler(self, self._s2cGetMaxCountryBossList))

	self._signalRecvSyncCountryBossTime =
		G_NetworkManager:add(MessageIDConst.ID_S2C_SyncCountryBossTime, handler(self, self._s2cSyncCountryBossTime))

	self._bossDatas = {}
	self._bossVotes = {}
	self._interceptList = nil
end

function CountryBossData:clear()
	self._signalRecvAttackCountryBoss:remove()
	self._signalRecvAttackCountryBoss = nil

	self._signalRecvSyncCountryBossVote:remove()
	self._signalRecvSyncCountryBossVote = nil

	self._signalRecvInterceptCountryBossList:remove()
	self._signalRecvInterceptCountryBossList = nil

	self._signalRecvSyncCountryBossUser:remove()
	self._signalRecvSyncCountryBossUser = nil

	self._signalRecvCountryBossVote:remove()
	self._signalRecvCountryBossVote = nil

	self._signalRecvSyncCountryBoss:remove()
	self._signalRecvSyncCountryBoss = nil

	self._signalRecvEnterCountryBoss:remove()
	self._signalRecvEnterCountryBoss = nil

	self._signalRecvInterceptCountryBossUser:remove()
	self._signalRecvInterceptCountryBossUser = nil

	self._signalRecvGetMaxCountryBossList:remove()
	self._signalRecvGetMaxCountryBossList = nil

	self._signalRecvSyncCountryBossTime:remove()
	self._signalRecvSyncCountryBossTime = nil
end

function CountryBossData:reset()
	self._bossDatas = {}
	self._bossVotes = {}
	self._interceptList = nil
end

function CountryBossData:getBossDatas()
	return self._bossDatas
end

function CountryBossData:getBossDataById(id)
	return self._bossDatas[id]
end

function CountryBossData:getBossVotes()
	return self._bossVotes
end

function CountryBossData:getVoteById(id)
	local voteData = self._bossVotes[id]
	if voteData then
		return voteData:getVote()
	end
	return 0
end

function CountryBossData:getInterceptList()
	return self._interceptList
end

function CountryBossData:cleanInterceptList()
	self._interceptList = nil
end
-- Describle：
-- Param:
--	boss_id
function CountryBossData:c2sAttackCountryBoss(boss_id)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_AttackCountryBoss,
		{
			boss_id = boss_id
		}
	)
end
-- Describle：
function CountryBossData:_s2cAttackCountryBoss(id, message)
	if message.ret == 8400 then
		self:c2sEnterCountryBoss()
		return
	end
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local challenge_boss_time1 = rawget(message, "challenge_boss_time1")
	if challenge_boss_time1 then
		self:setChallenge_boss_time1(challenge_boss_time1)
	end

	local challenge_boss_time2 = rawget(message, "challenge_boss_time2")
	if challenge_boss_time2 then
		self:setChallenge_boss_time2(challenge_boss_time2)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_ATTACK_COUNTRY_BOSS_SUCCESS, message)
end
-- Describle：
function CountryBossData:_s2cSyncCountryBossVote(id, message)
	--check data
	local boss_vote = rawget(message, "boss_vote")
	if boss_vote then
		local voteData = CountryBossVoteUnitData.new()
		voteData:setProperties(boss_vote)
		self._bossVotes[voteData:getBoss_id()] = voteData
	end
	local final_vote = rawget(message, "final_vote")
	if final_vote then
		self:setFinal_vote(final_vote)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_SYNC_COUNTRY_BOSS_VOTE_SUCCESS)
end
-- Describle：
-- Param:
--	boss_id
function CountryBossData:c2sInterceptCountryBossList(boss_id)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_InterceptCountryBossList,
		{
			boss_id = boss_id
		}
	)
end
-- Describle：
function CountryBossData:_s2cInterceptCountryBossList(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local list = rawget(message, "list")
	if list then
		local datas = {}
		for k, v in pairs(list) do
			local interceptData = CountryBossInterceptUnitData.new()
			interceptData:setProperties(v)
			table.insert(datas, interceptData)
		end
		self._interceptList = datas
	end

	G_SignalManager:dispatch(SignalConst.EVENT_INTERCEPT_COUNTRY_BOSS_LIST_SUCCESS)
end
-- Describle：
function CountryBossData:_s2cSyncCountryBossUser(id, message)
	--check data
	local challenge_boss_time2 = rawget(message, "challenge_boss_time2")
	if challenge_boss_time2 then
		self:setChallenge_boss_time2(challenge_boss_time2)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_SYNC_COUNTRY_BOSS_USER_SUCCESS)
end
-- Describle：
-- Param:
--	boss_id
function CountryBossData:c2sCountryBossVote(boss_id)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_CountryBossVote,
		{
			boss_id = boss_id
		}
	)
end
-- Describle：投票
function CountryBossData:_s2cCountryBossVote(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:setSelf_vote(message.boss_id)
	G_SignalManager:dispatch(SignalConst.EVENT_COUNTRY_BOSS_VOTE_SUCCESS)
end
-- Describle：同步boss信息
function CountryBossData:_s2cSyncCountryBoss(id, message)
	--check data
	local country_boss = rawget(message, "country_boss")
	if country_boss then
		for k, v in pairs(country_boss) do
			local bossData = CountryBossUnitData.new()
			bossData:updateData(v)
			self._bossDatas[bossData:getBoss_id()] = bossData
		end
	end

	local oldAhead_time1 = self:getAhead_time1()
	local oldAhead_time3 = self:getAhead_time3()

	local ahead_time1 = rawget(message, "ahead_time1")
	if ahead_time1 then
		self:setAhead_time1(ahead_time1)
	end

	local ahead_time3 = rawget(message, "ahead_time3")
	if ahead_time3 then
		self:setAhead_time3(ahead_time3)
	end
	-- local notice = rawget(message, "notice")
	-- if notice then
	-- 	G_SignalManager:dispatch(SignalConst.EVENT_BULLET_SCREEN_NOTICE, {content = {notice}})
	-- end
	if self:getAhead_time1() ~= oldAhead_time1 or self:getAhead_time3() ~= oldAhead_time3 then
		G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_COUNTRY_BOSS)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_SYNC_COUNTRY_BOSS_SUCCESS)
end

-- Describle：进入
function CountryBossData:c2sEnterCountryBoss()
	G_NetworkManager:send(MessageIDConst.ID_C2S_EnterCountryBoss, {})
end
-- Describle：
function CountryBossData:_s2cEnterCountryBoss(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local oldAhead_time1 = self:getAhead_time1()
	local oldAhead_time3 = self:getAhead_time3()
	self:setProperties(message)

	--可能提前结束了  刷新 主界面图标
	if self:getAhead_time1() ~= oldAhead_time1 or self:getAhead_time3() ~= oldAhead_time3 then
		G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_COUNTRY_BOSS)
	end

	self._bossDatas = {}
	local country_boss = rawget(message, "country_boss")
	if country_boss then
		for k, v in pairs(country_boss) do
			local bossData = CountryBossUnitData.new()
			bossData:updateData(v)
			self._bossDatas[bossData:getBoss_id()] = bossData
		end
	end

	local boss_vote = rawget(message, "boss_vote")
	if boss_vote then
		for k, v in pairs(boss_vote) do
			local voteData = CountryBossVoteUnitData.new()
			voteData:setProperties(v)
			self._bossVotes[voteData:getBoss_id()] = voteData
		end
	end

	G_SignalManager:dispatch(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS)
end
-- Describle：拦截
function CountryBossData:c2sInterceptCountryBossUser(user_id, boss_id)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_InterceptCountryBossUser,
		{
			user_id = user_id,
			boss_id = boss_id
		}
	)
end
-- Describle：
function CountryBossData:_s2cInterceptCountryBossUser(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local challenge_boss_user = rawget(message, "challenge_boss_user")
	if challenge_boss_user then
		self:setChallenge_boss_user(challenge_boss_user)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_INTERCEPT_COUNTRY_BOSS_USER_SUCCESS, message)
end

--获取攻击成员列表
function CountryBossData:c2sGetMaxCountryBossList(boss_id)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_GetMaxCountryBossList,
		{
			boss_id = boss_id
		}
	)

	-- 	local message = {
	-- 		ret = 1,
	-- 	users = {
	-- 		{
	-- 			user_id = 1001,
	-- 			name = "哈哈哈1",
	-- 			officer_level = 8,
	-- 			leader = 1,
	-- 		},
	-- 		{
	-- 			user_id = 1002,
	-- 			name = "哈哈哈2",
	-- 			officer_level = 8,
	-- 			leader = 1,
	-- 		},
	-- 		{
	-- 			user_id = 1003,
	-- 			name = "哈哈哈3",
	-- 			officer_level = 8,
	-- 			leader = 1,
	-- 		},
	-- 		{
	-- 			user_id = 1004,
	-- 			name = "哈哈哈4",
	-- 			officer_level = 8,
	-- 			leader = 1,
	-- 		},
	-- 		{
	-- 			user_id = 1005,
	-- 			name = "哈哈哈5",
	-- 			officer_level = 8,
	-- 			leader = 1,
	-- 		},
	-- 		{
	-- 			user_id = 1006,
	-- 			name = "哈哈哈6",
	-- 			officer_level = 8,
	-- 			leader = 1,
	-- 		},
	-- 		{
	-- 			user_id = 1007,
	-- 			name = "哈哈哈7",
	-- 			officer_level = 8,
	-- 			leader = 1,
	-- 		},
	-- 		{
	-- 			user_id = 1008,
	-- 			name = "哈哈哈8",
	-- 			officer_level = 8,
	-- 			leader = 1,
	-- 		},
	-- 		{
	-- 			user_id = 1009,
	-- 			name = "哈哈哈9",
	-- 			officer_level = 8,
	-- 			leader = 1,
	-- 		},
	-- 		{
	-- 			user_id = 10010,
	-- 			name = "哈哈哈10",
	-- 			officer_level = 8,
	-- 			leader = 1,
	-- 		},
	-- 	}
	--
	-- 	}
	--
	-- local scheduler = require("cocos.framework.scheduler")
	-- scheduler.performWithDelayGlobal(function()
	-- 	self:_s2cGetMaxCountryBossList(1, message)
	-- end, 0.5)
end
-- Describle：
function CountryBossData:_s2cGetMaxCountryBossList(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local UserDataHelper = require("app.utils.UserDataHelper")
	local users = rawget(message, "users")
	local userList = {}
	if users then
		for k, v in ipairs(users) do
			local data = {}
			data.userId = v.user_id
			data.name = v.name
			data.officialLevel = v.officer_level
			local covertId, param = UserDataHelper.convertAvatarId(v)
			data.baseId = covertId
			data.limitLevel = param.limitLevel
			data.titleId = v.title
			table.insert(userList, data)
		end
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GET_MAX_COUNTRY_BOSS_LIST_SUCCESS, userList)
end

function CountryBossData:_s2cSyncCountryBossTime(id, message)
	self:setProperties(message)
end

return CountryBossData
