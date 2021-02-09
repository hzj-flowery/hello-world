-- Author: hedili
-- Date:2018-08-31 10:16:30
-- Describle：先秦皇陵,怪物单位

local BaseData = require("app.data.BaseData")
local QinTombMonsterData = class("QinTombMonsterData", BaseData)
local QinTombConst = require("app.const.QinTombConst")

local schema = {}

schema["point_id"] = {"number", 0}
schema["monster_type"] = {"number", 0} 
schema["begin_time"] = {"number", 0} 
schema["left_time"] = {"number", 0}
schema["own_team_id"] = {"number", 0}
schema["battle_team_id"] = {"number", 0}
schema["stop_time"] = {"number", 0}
schema["reborn_time"] = {"number", 0}

schema["config"] = {"table", {}}
schema["baseId"] ={"number", 0}
schema["color"] = {"number", 0}
schema["speed"] = {"number", 1}
schema["name"] = {"string", ""}


QinTombMonsterData.schema = schema

function QinTombMonsterData:ctor(properties)
	QinTombMonsterData.super.ctor(self, properties)
end

function QinTombMonsterData:clear()

end

function QinTombMonsterData:reset()

end

function QinTombMonsterData:getCurrState( )
	-- body

	if self:getRebornTime() > 0 then
		local rebornTime = self:getRebornTime()
		local curTime = G_ServerTime:getTime()
		if rebornTime > 0 and curTime <= rebornTime  then
			return QinTombConst.MONSTER_STATE_DEATH
		end
	end


	if self:getBattle_team_id() > 0 then
		return QinTombConst.MONSTER_STATE_PK
	end

	if self:getOwn_team_id() > 0 then
		return QinTombConst.MONSTER_STATE_HOOK
	end

	return QinTombConst.MONSTER_STATE_IDLE
end
function QinTombMonsterData:syncData( serverData )
	-- body
	local point_id = rawget(serverData, "point_id") or nil
	assert(point_id, "point_id can not be nil")

	self:setPoint_id(point_id)

	local monster_type = rawget(serverData, "monster_type") or 0
	self:setMonster_type(monster_type)

	local begin_time = rawget(serverData, "begin_time") or 0
	self:setBegin_time(begin_time)

	local left_time = rawget(serverData, "left_time") or 0
	self:setLeft_time(left_time)

	local stop_time = rawget(serverData, "stop_time") or 0
	self:setStop_time(stop_time)

	local reborn_time = rawget(serverData, "reborn_time") or 0
	if reborn_time > 0 then
		self:setReborn_time(reborn_time+1)--客户端比服务器晚1秒刷新，主要用于怪物刷新问题
	else
		self:setReborn_time(0)
	end
	

	local speed = rawget(serverData, "speed") or 1
	self:setSpeed(speed)

	--挂机队伍
	local oldTeamId = self:getOwn_team_id()
	local own_team_id = rawget(serverData, "own_team_id") or 0
	self:setOwn_team_id(own_team_id)
	
	--pk队伍
	local oldBattleId = self:getBattle_team_id()
	local battle_team_id = rawget(serverData, "battle_team_id") or 0
	self:setBattle_team_id(battle_team_id)


	local cfg = self:_findMonsterCfg(self:getPoint_id())
	self:setConfig(cfg)
	self:_updateMonster()
	self:_updatePosition()

	local retTable =  {oldTeamId = oldTeamId, 
	oldBattleId = oldBattleId, 
	newTeamId = self:getOwn_team_id(), 
	newBattleId = self:getBattle_team_id()}

	return retTable
end

function QinTombMonsterData:updateData( serverData )
	-- body
	--dump(serverData)
	self:syncData(serverData)

end

--获取攻击动作时长
function QinTombMonsterData:getAttackActionTime( ... )
	-- body
	local config = self:getConfig()
	if self:getMonster_type() == 1 then
		return config.small_time / 1000
	end
	return config.big_time / 1000
end

--获取死亡动作时长
function QinTombMonsterData:getDieActionTime( ... )
	-- body
	local config = self:getConfig()
	if self:getMonster_type() == 1 then
		return config.small_die / 1000
	end
	return config.big_die / 1000
end

function QinTombMonsterData:_findMonsterCfg( pointId )
		-- body
	local qin_monster = require("app.config.qin_monster")
	for i=1, qin_monster.length() do 
		local cfg = qin_monster.indexOf(i)
		if cfg.point_id_2 == pointId then
			return cfg
		end
	end
	assert(false, string.format( "can not find monster by id [%d]", pointId))
	return nil
end
	

function QinTombMonsterData:_updateMonster( )
		-- body
	local config = self:getConfig()

	if self:getMonster_type() == 1 then
		local heroRes = require("app.config.hero_res")
		local baseId = 0
		if heroRes.get(config.small_image) then
			baseId = heroRes.get(config.small_image).fight_res
		end
	 	local color = config.small_color
	 	local name = config.small_name
		self:setBaseId(baseId)
		self:setColor(color)
		self:setName(name)
	else
		local baseId = config.big_image
		local color = config.big_color
		local name = config.big_name
		self:setBaseId(baseId)
		self:setColor(color)
		self:setName(name)
	end
	

end

function QinTombMonsterData:getPosition(  )
	-- body
	local pos = cc.p(self._position.x, self._position.y)
	return pos
end


function QinTombMonsterData:getHookPosition( index, useGlobal )
	-- body
	local dir = 1.0
	if index  == 3 then
		dir = -1.0
	end
	if useGlobal == nil then
		return self._hookPos[index],dir
	end

	local pos = cc.p(self._position.x, self._position.y)
	local global = cc.pAdd( self._hookPos[index], pos)
	return global,dir
end

function QinTombMonsterData:getPkPosition( index, useGlobal )
	-- body
	local dir = 1.0
	if index  == 3 then
		dir = -1.0
	end
	if useGlobal == nil then
		return self._pkPos[index],dir
	end
	local pos = cc.p(self._position.x, self._position.y)
	local global = cc.pAdd( self._pkPos[index], pos)
	return global,dir
end

function QinTombMonsterData:_updatePosition( )
	-- body
	local QinTombHelper = require("app.scene.view.qinTomb.QinTombHelper")
	local cfg = self:getConfig()
	local posValue = QinTombHelper.getMidPoint(cfg.point_id_1)
	local pos = cc.p(posValue.x, posValue.y)
	self._position = pos --怪物坐标
	self._hookPos = {} --挂机点
	self._pkPos = {} --挂机PK点
	for i=1, 3 do
		local posHook = QinTombHelper.getOffsetPoint(cfg.point_id_3,i)
		local posPK =  QinTombHelper.getOffsetPoint(cfg.point_id_4,i)
		table.insert(self._hookPos, posHook)
		table.insert(self._pkPos, posPK)
	end
end

function QinTombMonsterData:getMonumentPKPos(index, useGlobal)
	-- body
	local QinTombHelper = require("app.scene.view.qinTomb.QinTombHelper")
	local cfg = self:getConfig()



	local posPK =  QinTombHelper.getOffsetPointRange(cfg.point_id_4,index)
	if useGlobal == nil then
		return posPK
	end


	local pos = cc.p(self._position.x, self._position.y)
	return cc.pAdd( posPK, pos)
end

function QinTombMonsterData:getMonumentHookPos(index, useGlobal)
	-- body
	local QinTombHelper = require("app.scene.view.qinTomb.QinTombHelper")
	local cfg = self:getConfig()
	--加入朝向控制

	local hookPos =  QinTombHelper.getOffsetPointRange(cfg.point_id_3,index)
	if useGlobal == nil then
		return hookPos
	end



	local pos = cc.p(self._position.x, self._position.y)
	return cc.pAdd( hookPos, pos)
end

--获取怪物挂机时长
function QinTombMonsterData:getMaxHookTime( ... )
	-- body
	local QinTombHelper = require("app.scene.view.qinTomb.QinTombHelper")
	if self:getMonster_type() == 2 then
		return QinTombHelper.getQinInfo("one_big_time")
	end
	return QinTombHelper.getQinInfo("one_small_time")
end


--获取怪物出生血条总长度
function QinTombMonsterData:getHookLeftTime( ... )
	-- body
	local leftTime =  self:getBegin_time() - currTime + self:getLeft_time() 
	return leftTime
end

--更新怪物当前血量
function QinTombMonsterData:updateHPTime(  )

	-- body
end
--获取怪物死亡时间
function QinTombMonsterData:getDieTime( )
	-- body
	
	--1. stoptime > 0  left 就是剩余时间 self:getSpeed()
	--2. stoptime = 0  需要实时算  begintime + leftTime - now > 0 剩余时间 
	--3. 
	local speed = 1	
	if self:getSpeed() > 0 then
		speed = self:getSpeed()
	end

	local maxTime = self:getMaxHookTime()
	if self:getStop_time() > 0 then
		return self:getLeft_time(), maxTime
	else
		local currTime = G_ServerTime:getTime()
		local leftTime = currTime - self:getBegin_time()
		
		local realLeftTime = self:getLeft_time() - (leftTime*speed)  -- 真实结束时间
		if realLeftTime < 0 then
			realLeftTime = 0
		end
		return realLeftTime, maxTime
	end

end

--获取怪物复活时间
function QinTombMonsterData:getRebornTime( ... )
	-- body
	
	local QinTombHelper = require("app.scene.view.qinTomb.QinTombHelper")
	local currTime = G_ServerTime:getTime()
	local refreshTime = QinTombHelper.getQinInfo("refresh_time")
	local deathTime, maxTime = self:getDieTime() 

	if self:getReborn_time() > 0 then
		return self:getReborn_time()
	end
	return 0
	
end


--获取墓地列表
function QinTombMonsterData:getMonumentList( )
	-- body
	local pointId = self:getPoint_id()
	local retList = G_UserData:getQinTomb():getMonumentList(pointId)
	--获取全部墓地
	return retList
end
return QinTombMonsterData
