--矿战数据
local BaseData = require("app.data.BaseData")
local MineCraftData = class("MineCraftData", BaseData)
local MineData = require("app.data.MineData")
local MinePit = require("app.config.mine_pit")
local MineEvent = require("app.config.mine_event")
local MineRoute = require("app.config.mine_route")--不用了
local MineRoad = require("app.config.mine_road")--不用了
local MineWay = require("app.config.mine_way")

local schema = {}
schema["mines"] = {"table", {}}
schema["selfMoney"] = {"number", 0}
schema["selfLastProduceTime"] = {"number", 0}
schema["selfLastTime"] = {"number", 0}
schema["selfMineId"] = {"number", 0}
schema["mineRoads"] = {"table", {}}
schema["midPoints"] = {"table", {}}
schema["myArmyValue"] = {"number", 0}
schema["roads"] = {"table", {}} --走的路程
schema["attackReport"] = {"table", {}} --战报
schema["killType"] = {"number", 0}
schema["targetPos"] = {"number", 0} --目标出生地点
schema["privilegeTime"] = {"number", 0} --矿战特权卡
schema["reachTimeLimit"] = {"boolean", false}
schema["selfInfamValue"] = {"number", 0} --自身恶名值
schema["selfRefreshTime"] = {"number", 0} --自身恶名值刷新时间

MineCraftData.schema = schema

MineCraftData.REPORT_TYPE_ATTACK = 4
MineCraftData.REPORT_TYPE_DEF = 5

local ParameterIDConst = require("app.const.ParameterIDConst")
local Parameter = require("app.config.parameter")

function MineCraftData:ctor(properties)
	MineCraftData.super.ctor(self, properties)

	self:_initMineData()
	self:_initMineWay()

	--进入矿区的基本信息
	self._listenerMineWorld =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GetMineWorld, handler(self, self._s2cGetMineWorld))

	--单个矿区信息
	self._listenerEnterMine = G_NetworkManager:add(MessageIDConst.ID_S2C_EnterMine, handler(self, self._s2cEnterMine))

	--移动
	self._listenerSettleMine = G_NetworkManager:add(MessageIDConst.ID_S2C_SettleMine, handler(self, self._s2cSettleMine))

	--通知刷新广播
	self._listenerMineRespone =
		G_NetworkManager:add(MessageIDConst.ID_S2C_MineRespond, handler(self, self._s2cMineRespond))

	--收获
	self._listenerGetMineMoney =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GetMineMoney, handler(self, self._s2cGetMineMoney))

	--攻打
	self._listenerBattleMine = G_NetworkManager:add(MessageIDConst.ID_S2C_BattleMine, handler(self, self._s2cBattleMine))

	--获取战报
	self._listenerGetReport =
		G_NetworkManager:add(MessageIDConst.ID_S2C_CommonGetReport, handler(self, self._s2cCommonGetReport))

	--扫荡
	self._listenerFastBattle =
		G_NetworkManager:add(MessageIDConst.ID_S2C_BattleMineFast, handler(self, self._s2cFastBattle))

	--买兵力
	self._listenerBuyArmy = G_NetworkManager:add(MessageIDConst.ID_S2C_MineBuyArmy, handler(self, self._s2cBuyArmy))

	--占领广播
	self._listenerMineOwn = G_NetworkManager:add(MessageIDConst.ID_S2C_SysMineOwn, handler(self, self._s2cSysMineOwn))

	--跑动弹幕信息
	self._listenerMineMove = G_NetworkManager:add(MessageIDConst.ID_S2C_BulletNotice, handler(self, self._s2cBulletNotice))

	--矿区信息广播
	-- ID_S2C_SendMineInfo
	self._listenerSendMineInfo =
		G_NetworkManager:add(MessageIDConst.ID_S2C_SendMineInfo, handler(self, self._s2cSendMineInfo))

	self._openSecond = 0
	self._mineIdIndexMap = {}
end

function MineCraftData:clear()
	self._listenerMineWorld:remove()
	self._listenerMineWorld = nil
	self._listenerEnterMine:remove()
	self._listenerEnterMine = nil
	self._listenerSettleMine:remove()
	self._listenerSettleMine = nil
	self._listenerMineRespone:remove()
	self._listenerMineRespone = nil
	self._listenerGetMineMoney:remove()
	self._listenerGetMineMoney = nil
	self._listenerBattleMine:remove()
	self._listenerBattleMine = nil
	self._listenerGetReport:remove()
	self._listenerGetReport = nil
	self._listenerFastBattle:remove()
	self._listenerFastBattle = nil
	self._listenerBuyArmy:remove()
	self._listenerBuyArmy = nil
	self._listenerMineOwn:remove()
	self._listenerMineOwn = nil
	self._listenerMineMove:remove()
	self._listenerMineMove = nil
	self._listenerSendMineInfo:remove()
	self._listenerSendMineInfo = nil
end

function MineCraftData:_getFuncOpenTime()
	local serverOpenTime = G_UserData:getBase():getServer_open_time()
	local date = G_ServerTime:getDateObject(serverOpenTime)
	local fourClock = serverOpenTime - date.hour * 3600 - date.min * 60 - date.sec + 4 * 3600

	local FunctionLevel = require("app.config.function_level")
	local FunctionConst = require("app.const.FunctionConst")
	local config = FunctionLevel.get(FunctionConst.FUNC_MINE_CRAFT)
	assert(config, "config is nil id = ", FunctionConst.FUNC_MINE_CRAFT)
	local mineOpenDays = config.day - 1

	self._openSecond = fourClock + mineOpenDays * 86400
end

function MineCraftData:getOpenTime()
	if self._openSecond == 0 then
		self:_getFuncOpenTime()
	end
	return self._openSecond
end

--根据矿开启的时间，返回下一层开启的倒计时
function MineCraftData:getOpenLeftTime()
	if self._openSecond == 0 then
		self:_getFuncOpenTime()
	end
	local nextTime = 0
	local nowTime = G_ServerTime:getTime()
	for i = 1, MineEvent.length() do
		local config = MineEvent.indexOf(i)
		if nowTime - self._openSecond < config.start_time then
			local leftTime = self._openSecond + config.start_time - nowTime
			return leftTime, config
		end
	end
end

function MineCraftData:reset()
end

function MineCraftData:_initMineData()
	local mineList = {}
	for i = 1, MinePit.length() do
		local config = MinePit.indexOf(i)
		local data = MineData.new(config)
		mineList[config.pit_id] = data
	end
	self:setMines(mineList)
end

function MineCraftData:_initMineWay()
	local midPoints = {}

	self._graph = {}

	for i = 1, MineWay.length() do
		local way = MineWay.indexOf(i)
		if not self._graph[way.pit_id] then
			self._graph[way.pit_id] = {}
		end
		self._graph[way.pit_id][way.move_pit] = 1

		local midPoint = way.mid_point
		if not midPoints[way.pit_id .. way.move_pit] then
			local strArr = string.split(midPoint, "|")
			midPoints[way.pit_id .. way.move_pit] = cc.p(tonumber(strArr[1]), tonumber(strArr[2]))
		end
	end
	self:setMidPoints(midPoints)

	local time = G_ServerTime:getTimeByWdayandSecond(3, 12 * 60 * 60)
	local w = G_ServerTime:getWeekdayAndHour(G_ServerTime:getTime())
end

function MineCraftData:getMineGraph()
	return self._graph
end

function MineCraftData:getMineDataById(id)
	local list = self:getMines()
	return list[id]
end

function MineCraftData:getMyMineData()
	return self:getMineDataById(self:getSelfMineId())
end

function MineCraftData:getMyMineConfig()
	local data = self:getMineDataById(self:getSelfMineId())
	return data:getConfigData()
end

function MineCraftData:getMineConfigById(id)
	local list = self:getMines()
	local data = list[id]
	if data then
		return data:getConfigData()
	end
end

function MineCraftData:c2sGetMineWorld()
	local message = {}
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetMineWorld, message)
end

function MineCraftData:_s2cGetMineWorld(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:setSelfMoney(message.self_money)
	self:setSelfLastProduceTime(message.self_last_produce_time)
	self:setSelfLastTime(message.self_last_time)
	self:setSelfMineId(message.self_mine_id)
	self:setMyArmyValue(message.self_army_value)
	self:setSelfInfamValue(message.self_infam_value)
	self:setSelfRefreshTime(message.self_refresh_time)
    self:setPrivilegeTime(rawget(message, "self_privilege_time") or 0)
    if rawget(message, "mine_info") then
		for _, v in pairs(message.mine_info) do
			local mineData = self:getMineDataById(v.mine_id)
			mineData:setGuildId(v.guild_id)
			mineData:setGuildName(v.guild_name)
			mineData:setUserCnt(v.user_cnt)
			mineData:setOwn(v.is_own)
			mineData:setGuildIcon(v.guild_icon)
			mineData:setMultiple(v.multiple)
			mineData:setStartTime(v.startTime)
			mineData:setEndTime(v.endTime)
		end
	end

	G_UserData:getGrainCar():initCorpse(message)
    
	G_SignalManager:dispatch(SignalConst.EVENT_GET_MINE_WORLD)
end

function MineCraftData:checkTimeLimit()
	local timeLimit = tonumber(require("app.config.parameter").get(ParameterIDConst.MINE_TIME_LIMIT).content)
	local moneyDuringTime = self:getMoneyTime()
	if moneyDuringTime > timeLimit then --大于24个小时
		if not self:isReachTimeLimit() then
			self:setReachTimeLimit(true)
			G_SignalManager:dispatch(SignalConst.EVENT_SEND_MINE_INFO)
		end
		return
	end
	if self:isReachTimeLimit() then
		G_SignalManager:dispatch(SignalConst.EVENT_SEND_MINE_INFO)
	end
	self:setReachTimeLimit(false)
end

function MineCraftData:_s2cSendMineInfo(id, message)
	if rawget(message, "mine_id") then
		self:setSelfMineId(message.mine_id)
	end
	if rawget(message, "self_last_time") then
		self:setSelfLastTime(message.self_last_time)
	end
	self:checkTimeLimit()
end

--领钱的时间
function MineCraftData:getMoneyTime()
	local selfMineId = self:getSelfMineId()
	local lastTime = self:getSelfLastTime()
	if selfMineId == 0 or lastTime == 0 then --没有数据
		return 0
	end

	local duringTime = 0
	local configData = self:getMineDataById(selfMineId):getConfigData()
	if configData.pit_type ~= 2 then --不在主城才算
		duringTime = G_ServerTime:getTime() - lastTime
	end
	return duringTime
end

function MineCraftData:c2sEnterMine(mineId, pageIndex)
	pageIndex = pageIndex or 0
	local message = {
		mine_id = mineId,
		page = pageIndex
	}
	self._mineIdIndexMap[mineId] = pageIndex
	G_NetworkManager:send(MessageIDConst.ID_C2S_EnterMine, message)
end

function MineCraftData:_s2cEnterMine(id, message)
	if message.ret ~= 1 then
		return
	end

	local mineData = self:getMineDataById(message.mine_id)

	local pageIndex = self._mineIdIndexMap[message.mine_id] or 0

	-- mineData:refreshUser(message.mine_users)
	if message.is_begin then
		if pageIndex==0 then
			mineData:clearUserList()
		else
			mineData:resetUserList() 	-- 保留原有数据，并保存顺序
		end
		mineData:setRequestData(true)
	end

	for _, user in pairs(message.mine_users) do
		mineData:pushUser(user)
	end

	if message.is_end then
		mineData:refreshUser()
		mineData:setRequestData(false)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_ENTER_MINE, mineData:getId())
end

function MineCraftData:c2sSettleMine(mineIdList)
	local message = {
		mine_id = mineIdList
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_SettleMine, message)
	local selfMineId = self:getSelfMineId()
	table.insert(mineIdList, 1, selfMineId)
	self:setRoads(mineIdList)
end

function MineCraftData:_s2cSettleMine(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		self:setRoads({})
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_SETTLE_MINE, message)
end

function MineCraftData:_processChangeMine(message)
	if rawget(message, "change_world_mine") then
		for i, v in pairs(message.change_world_mine) do
			local mineData = self:getMineDataById(v.mine_id)
			if rawget(v, "guild_id") then
				mineData:setGuildId(v.guild_id) --矿区改变占领工会
			end
			if rawget(v, "guild_name") then
				mineData:setGuildName(v.guild_name)
			end
			if rawget(v, "user_cnt") then
				mineData:setUserCnt(v.user_cnt)
			end
			mineData:setOwn(v.is_own)
			if rawget(v, "guild_icon") then
				mineData:setGuildIcon(v.guild_icon)
			end
			if rawget(v, "startTime") then
				mineData:setStartTime(v.startTime)
			end
			if rawget(v, "endTime") then
				mineData:setEndTime(v.endTime)
			end
		end
	end
end

function MineCraftData:_processChangeUser(message)
	local oldMineId = nil --离开矿id
	local newMineId = nil --目标矿id
	if rawget(message, "replace_mine_user") then
		for i, user in pairs(message.replace_mine_user) do
			newMineId = user.mine_id
			oldMineId = user.old_mine_id
			if newMineId == oldMineId then --玩家没有移动
				local mineData = self:getMineDataById(newMineId)
				mineData:updateUser(user)
			else --目标发生移动
				local oldMineData = self:getMineDataById(oldMineId)
				oldMineData:deleteUser(user.user_id)
				local newMineData = self:getMineDataById(newMineId)
				newMineData:newUser(user)
			end
		end
	end
	return oldMineId, newMineId
end

--收到需要刷新矿区
function MineCraftData:_s2cMineRespond(id, message)
	self:setSelfMoney(message.self_money)
	self:setSelfLastProduceTime(message.self_last_produce_time)
	self:setSelfLastTime(message.self_last_time)
	self:setSelfMineId(message.self_mine_id)
	self:setMyArmyValue(message.self_army_value)
	self:setSelfInfamValue(message.self_infam_value)
	self:setSelfRefreshTime(message.self_refresh_time)
    self:_processChangeMine(message)
    self:setPrivilegeTime(rawget(message, "self_privilege_time") or 0)
	local oldMineId, newMineId = self:_processChangeUser(message)

	G_SignalManager:dispatch(SignalConst.EVENT_GET_MINE_RESPOND, oldMineId, newMineId) --老矿用于删除，新矿用于提示刷新
end

function MineCraftData:c2sGetMineMoney()
	local message = {}
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetMineMoney, message)
end

function MineCraftData:_s2cGetMineMoney(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	self:setSelfMoney(message.self_money)
	self:setSelfLastProduceTime(message.self_last_produce_time)
	self:setSelfLastTime(message.self_last_time)

	self:checkTimeLimit()

	G_SignalManager:dispatch(SignalConst.EVENT_GET_MINE_MONEY, message.award)
end

function MineCraftData:c2sBattleMine(userId)
	local message = {
		user_id = userId
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_BattleMine, message)
end

function MineCraftData:_s2cBattleMine(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	if rawget(message, "tar_reborn_mine") then
		self:setTargetPos(message.tar_reborn_mine)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_BATTLE_MINE, message.mine_fight, message.tar_mine_user)
end

function MineCraftData:c2sCommonGetReport()
	local message = {
		report_type = MineCraftData.REPORT_TYPE_ATTACK
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_CommonGetReport, message)
end

function MineCraftData:_s2cCommonGetReport(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local type = message.report_type
	local list = {}

	for _, data in pairs(message.mine_reports) do
		local mineReportData = require("app.data.MineReportData").new(data)
		table.insert(list, mineReportData)
	end

	table.sort(
		list,
		function(a, b)
			return a:getReport_id() > b:getReport_id()
		end
	)

	if type == MineCraftData.REPORT_TYPE_ATTACK then
		self:setAttackReport(list)
		G_SignalManager:dispatch(SignalConst.EVENT_GET_MINE_ATTACK_REPORT)
	end
end

function MineCraftData:c2sBattleMineFast(userId, count)
	local message = {
		user_id = userId,
		num = count
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_BattleMineFast, message)
end

function MineCraftData:_s2cFastBattle(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local reportList = {}
	for i, v in pairs(message.mine_fight) do
		local data = require("app.data.MineReportData").new()
		data:updateDataFromMineFight(v, message.tar_mine_user)
		table.insert(reportList, data)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_FAST_BATTLE, reportList)
end

function MineCraftData:c2sMineBuyArmy(count)
	local message = {
		num = count
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_MineBuyArmy, message)
end

function MineCraftData:_s2cBuyArmy(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_MINE_BUY_ARMY, message.num)
end

function MineCraftData:_s2cSysMineOwn(id, message)
	local mineId = message.mine_id
	local mineData = self:getMineDataById(mineId)
	G_SignalManager:dispatch(SignalConst.EVENT_MINE_GUILD_BOARD, mineData)
end

-- message NoticePair {
-- 	required string key = 1;//key
-- 	required string value = 2;//value
-- 	optional uint32 key_type = 3;//key的颜色类型 1:官衔
-- 	optional uint32 key_value = 4;//key的颜色值
-- }

-- message BulletNotice {
-- 	required uint32 sn_type = 1; //1:世界boss, 3矿战移动
-- 	required uint32 color = 2; //
-- 	optional SimpleUser user = 3;
-- 	repeated NoticePair content =4;
-- }

-- message SimpleUser {
--     optional uint64 user_id = 1;
-- 	optional string name 	= 2;
-- 	optional uint32 officer_level 	= 3;
-- 	optional uint32 leader 	= 4;//主角id
-- 	optional uint32 avatar_base_id = 5;
-- }

function MineCraftData:_s2cBulletNotice(id, message)
	logWarn("MineCraftData:_s2cBulletNotice")
	dump(message)
	for _, data in pairs(message.content) do
		local bulletType = data.sn_type
		if bulletType ~= 3 then
			break
		end
		local user = data.user
		dump(user)
		if user.user_id == G_UserData:getBase():getId() then --如果是自己，就不广播
			break
		end
		local oldId = 0
		local newId = 0
		for i, v in pairs(data.content) do
			if v.key == "oldmineid" then
				oldId = tonumber(v.value)
			elseif v.key == "newmineid" then
				newId = tonumber(v.value)
			end
		end
		G_SignalManager:dispatch(SignalConst.EVENT_MINE_NOTICE, user, oldId, newId)
	end
end

function MineCraftData:isMineHasUser(mineId)
	local mineData = self:getMineDataById(mineId)
	return mineData:hasUsers()
end

function MineCraftData:clearAllMineUser()
	local list = self:getMines()
	for i, v in pairs(list) do
		v:clearUsers()
	end
end

function MineCraftData:isSelfPrivilege()
    local leftSec = G_ServerTime:getLeftSeconds(G_UserData:getMineCraftData():getPrivilegeTime())
    if leftSec and leftSec > 0 then
        return true
    end
    return false
end

function MineCraftData:isPrivilegeRedPoint()
    local MineCraftHelper = require("app.scene.view.mineCraft.MineCraftHelper")
    local payCfg = MineCraftHelper.getPrivilegeVipCfg()
    local cardData = G_UserData:getActivityMonthCard():getMonthCardDataById(payCfg.id)
    if cardData and cardData:getRemainDay() > 0 then
        return cardData:isCanReceive()
    end
    return false
end

-- 是否有和平矿
function MineCraftData:isExistPeaceMine()
	local list = self:getMines()
	for i, v in pairs(list) do
		if v:isPeace() then
			return true, v
		end
	end
	return false, nil
end

return MineCraftData
