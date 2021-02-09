-- Author: nieming
-- Date:2018-04-25 14:24:54
-- Describle：仇人系统

local BaseData = require("app.data.BaseData")
local EnemyData = class("EnemyData", BaseData)
local EnemyUnitData = require("app.data.EnemyUnitData")
local EnemyBattleReportUnitData = require("app.data.EnemyBattleReportUnitData")
local schema = {}
--schema
EnemyData.schema = schema


function EnemyData:ctor(properties)
	EnemyData.super.ctor(self, properties)

	self._signalRecvDelEnemy = G_NetworkManager:add(MessageIDConst.ID_S2C_DelEnemy, handler(self, self._s2cDelEnemy))

	self._signalRecvGetEnemyList = G_NetworkManager:add(MessageIDConst.ID_S2C_GetEnemyList, handler(self, self._s2cGetEnemyList))

	self._signalRecvEnemyRespond = G_NetworkManager:add(MessageIDConst.ID_S2C_EnemyRespond, handler(self, self._s2cEnemyRespond))

	self._signalRecvEnemyBattle = G_NetworkManager:add(MessageIDConst.ID_S2C_EnemyBattle, handler(self, self._s2cEnemyBattle))

	self._signalRecvCommonGetReport = G_NetworkManager:add(MessageIDConst.ID_S2C_CommonGetReport, handler(self, self._s2cCommonGetReport))
	self._signalCleanData = G_SignalManager:add(SignalConst.EVENT_CLEAN_DATA_CLOCK, handler(self, self._eventCleanData))

	self._enemysList = {} --仇人列表
	self._enmeysData = nil
	self._isNeedRecord = nil
end

function EnemyData:clear()
	self._signalRecvDelEnemy:remove()
	self._signalRecvDelEnemy = nil

	self._signalRecvGetEnemyList:remove()
	self._signalRecvGetEnemyList = nil

	self._signalRecvEnemyRespond:remove()
	self._signalRecvEnemyRespond = nil

	self._signalRecvEnemyBattle:remove()
	self._signalRecvEnemyBattle = nil

	self._signalRecvCommonGetReport:remove()
	self._signalRecvCommonGetReport = nil

	self._signalCleanData:remove()
	self._signalCleanData = nil
end

function EnemyData:reset()
	self._enemysList = {}
	self._enmeysData = nil
	self._isNeedRecord = nil
end

function EnemyData:isUserIdInEnemysList(userID)
	return self._enemysList[userID]
end


function EnemyData:requestEnemysData(isForce)
	self._isNeedRecord = true
	if self._enmeysData then
		if isForce then
			self:c2sGetEnemyList()
		end
	end
	self:c2sGetEnemyList()
end

function EnemyData:cleanDatas()
	self._enmeysData = nil
	self._isNeedRecord = nil
end

function EnemyData:getEnemysData()
	if self._enmeysData then
		return self._enmeysData.enemys
	end
	return {}
end
--复仇次数
function EnemyData:getCount()
	if self._enmeysData then
		return self._enmeysData.count
	end
	return 0
end

function EnemyData:_recordEnemys(datas)
	if self._isNeedRecord then
		self._enmeysData = datas
		self:_sortEnemysData()
	end
end

function EnemyData:_sortEnemysData()
	if self._enmeysData then
		table.sort(self._enmeysData.enemys, function(a, b)
			return a:getEnemy_value() > b:getEnemy_value()
		end)
	end
end

function EnemyData:_deleteEnemysData(uid)
	if self._enmeysData then
		for k ,v in pairs(self._enmeysData.enemys) do
			if v:getUid() == uid then
				table.remove(self._enmeysData.enemys, k)
				break
			end
		end
		self:_sortEnemysData()
	end
end

function EnemyData:_eventCleanData()
	if self._enmeysData then
		self._enmeysData.count = 0
		G_SignalManager:dispatch(SignalConst.EVENT_GET_ENEMY_LIST_SUCCESS)
	end
end
-- Describle：
-- Param:
--	uid
function EnemyData:c2sDelEnemy( uid)
	G_NetworkManager:send(MessageIDConst.ID_C2S_DelEnemy, {
		uid = uid,
	})
end


-- Describle：
function EnemyData:_s2cDelEnemy(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local uid = rawget(message, "uid")
	if uid then
		self._enemysList[uid] = nil
		self:_deleteEnemysData(uid)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_DEL_ENEMY_SUCCESS)
end


function EnemyData:c2sGetEnemyList()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetEnemyList, {

	})
end
-- Describle：
function EnemyData:_s2cGetEnemyList(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local enemysData = {}
	enemysData.count  = 0
	local enemys_cnt = rawget(message, "enemys_cnt")
	if enemys_cnt then
		enemysData.count = enemys_cnt
	end
	local enemys = rawget(message, "enemys")
	enemysData.enemys = {}
	self._enemysList = {}
	if enemys then
		for k, v in pairs(enemys) do
			local unitEnemy = EnemyUnitData.new()
			unitEnemy:updateData(v)
			table.insert(enemysData.enemys, unitEnemy)
			self._enemysList[unitEnemy:getUid()] = true
		end
	end

	self:_recordEnemys(enemysData)
	G_SignalManager:dispatch(SignalConst.EVENT_GET_ENEMY_LIST_SUCCESS)
end

-- Describle：出现变化重新拉取仇人列表
function EnemyData:_s2cEnemyRespond(id, message)
	-- 只在好友界面  处理通知
	if self._isNeedRecord then
		self:c2sGetEnemyList()
	end
end
-- 复仇战斗
function EnemyData:c2sEnemyBattle( user_id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_EnemyBattle, {
		user_id = user_id,
	})
end
-- Describle：
function EnemyData:_s2cEnemyBattle(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_ENEMY_BATTLE_SUCCESS, message)
end

function EnemyData:c2sCommonGetReport()
	--
	local message =
	{
		report_type = 5, --5 复仇战报
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_CommonGetReport, message)
end

function EnemyData:_s2cCommonGetReport(id, message)
	-- if message.ret ~= MessageErrorConst.RET_OK then
	-- 	return
	-- end
	local enemy_reports = rawget(message, "enemy_reports")
	local list = {}
	if enemy_reports then
		for _, v in pairs(message.enemy_reports) do
			local signalData = EnemyBattleReportUnitData.new()
			signalData:setProperties(v)
			table.insert(list, signalData)
		end
	end
	table.sort(list, function(a, b)
		return a:getFight_time() > b:getFight_time()
	end)
	G_SignalManager:dispatch(SignalConst.EVENT_ENEMY_BATTLE_REPORT_SUCCESS, list)
end


return EnemyData
