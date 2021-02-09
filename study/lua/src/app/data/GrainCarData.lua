-- Description: 粮车数据
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-06

local BaseData = require("app.data.BaseData")
local GrainCarData = class("GrainCarData", BaseData)
local GrainCarUnitData = require("app.data.GrainCarUnitData")
local GrainRoadPoint = require("app.data.GrainRoadPoint")
local SimpleUserData = require("app.data.SimpleUserData")
local GrainCarConst = require("app.const.GrainCarConst")
local ServerRecordConst = require("app.const.ServerRecordConst")
local GrainCarCorpseUnitData = require("app.data.GrainCarCorpseUnitData")
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper") 

local schema = {}
schema["attack_num"]				= {"number", 0} --自身攻击次数
schema["attack_time"]				= {"number", 0} --自身的上次攻击时间
schema["endTime"]					= {"number", 0} --活动结束时间
schema["users"]          			= {"table", {}} --展现avatar
schema["is_close"]					= {"number", 0} --是否紧急关闭（client）
schema["corpseShowTime"]			= {"number", 0} --尸体显示时间至xxx

GrainCarData.schema = schema



function GrainCarData:ctor(properties)
	GrainCarData.super.ctor(self, properties)
	self._grainCarUnit = nil
	self._grainCarList = {}	-- carUnitData
	self._carHashTable = {} -- 哈希表 k..guildId - carUnitData
	self._mineCarCorpseList = {} -- 哈希表 mineId - carCorpseList
	self._isLoginEndTime = false

	--获取当前粮车路线情况
	self._s2cGetGrainCarInfoListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGraincarInfo, handler(self, self._s2cGetGrainCarInfo))
	--更改粮车路线可见开关
	self._s2cChangeGrainCarViewListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ChangeGraincarView, handler(self, self._s2cChangeGrainCarView))
	--粮车路线分享权限变动
	self._s2cGrainCarViewNotifyListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GrainCarViewNotify, handler(self, self._s2cGrainCarViewNotify))
	--粮车升级
	self._s2cUpgradeGrainCarListener = G_NetworkManager:add(MessageIDConst.ID_S2C_UpgradeGraincar, handler(self, self._s2cUpgradeGrainCar))
	--粮车信息变更通知
	self._s2cGrainCarNotifyListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GraincarNotify, handler(self, self._s2cGrainCarNotify))
	--发车
	self._s2cGrainCarLaunchListener = G_NetworkManager:add(MessageIDConst.ID_S2C_StartGrainCarMove, handler(self, self._s2cStartGrainCarMove))
	--获取所有移动的粮车
	self._s2cGrainCarGetAllListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetAllMoveGrainCar, handler(self, self._s2cGrainCarGetAll))
	--粮车坐标变换通知
	self._s2cGrainCarMoveNotifyListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GrainCarMoveNotify, handler(self, self._s2cGrainCarMoveNotify))
	--攻击粮车
	self._s2cGrainCarAttackListener = G_NetworkManager:add(MessageIDConst.ID_S2C_AttackGrainCar, handler(self, self._s2cAttackGrainCar))
	--攻击活动结束通知
    self._s2cGrainCarEndListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GrainCarEnd, handler(self, self._s2cGrainCarEnd))
    --视野广播合并消息 
    self._s2cGrainCarMoveMultiNotifyListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GrainCarMoveMultiNotify, handler(self, self._s2cGrainCarMoveMultiNotify))
end

function GrainCarData:clear()
	self._s2cGetGrainCarInfoListener:remove()
	self._s2cGetGrainCarInfoListener = nil
	self._s2cChangeGrainCarViewListener:remove()
	self._s2cChangeGrainCarViewListener = nil
	self._s2cGrainCarViewNotifyListener:remove()
	self._s2cGrainCarViewNotifyListener = nil
	self._s2cUpgradeGrainCarListener:remove()
	self._s2cUpgradeGrainCarListener = nil
	self._s2cGrainCarNotifyListener:remove()
	self._s2cGrainCarNotifyListener = nil
	self._s2cGrainCarLaunchListener:remove()
	self._s2cGrainCarLaunchListener = nil
	self._s2cGrainCarGetAllListener:remove()
	self._s2cGrainCarGetAllListener = nil
	self._s2cGrainCarMoveNotifyListener:remove()
	self._s2cGrainCarMoveNotifyListener = nil
	self._s2cGrainCarAttackListener:remove()
	self._s2cGrainCarAttackListener = nil
	self._s2cGrainCarEndListener:remove()
    self._s2cGrainCarEndListener = nil
    self._s2cGrainCarMoveMultiNotifyListener:remove()
    self._s2cGrainCarMoveMultiNotifyListener = nil
end

function GrainCarData:reset()
end

function GrainCarData:updateData(data)
   
end

function GrainCarData:insertData(data)
  
end

function GrainCarData:deleteData(data)
    
end

----------------------------------------------------------------
----------------------------------------------------------------

function GrainCarData:setGrainCar(unit)
	self._grainCarUnit = unit
end

function GrainCarData:getGrainCar()
	return self._grainCarUnit
end

function GrainCarData:getGrainCarList()
	return self._grainCarList
end

--根据军团id获取对应的粮车
function GrainCarData:getGrainCarWithGuildId(guildId)
	return self._carHashTable["k" .. guildId] or nil
end

--是否紧急关闭
function GrainCarData:isEmergencyClose()
	return G_UserData:getServerRecord():isEmergencyClose(ServerRecordConst.SHIFT_FUNCTION_GRAIN_CAR) or self:getIs_close() == 1
end

--是否活动已经结束
function GrainCarData:isActivityOver()
	local curTime = G_ServerTime:getTime()
	local endTime = self:getEndTime()
	if GrainCarConfigHelper.isInActivityTime() and 
		not GrainCarConfigHelper.isInLaunchTime() then
			if endTime == 0 and self._isLoginEndTime then
				--活动已结束
				return true
			elseif endTime == 0 then
				return false
			else
				return curTime > endTime
			end
	else
		return false
	end
end

--获取某个矿里的尸体Hash表
-- {
--     mineId = {
--         1 = {carUnit, carUnit}
--         2 = {carUnit, carUnit}
--         3 = {carUnit, carUnit}
--     }
-- }
function GrainCarData:getGrainCarCorpseHashTable()
	return self._mineCarCorpseList
end

--尸体列表添加
--type 1：GranCarUnitData 2：GrainCarCorpseUnitData
function GrainCarData:addGrainCarCorpse(carUnit, type)
	local mineId = 0
	if type == 1 then
		mineId = carUnit:getCurPit()
	else
		mineId = carUnit:getMine_id()
	end
	if not self._mineCarCorpseList[mineId] then
		self._mineCarCorpseList[mineId] = {}
	end

	local level = carUnit:getLevel()
	if not self._mineCarCorpseList[mineId][level] then
		self._mineCarCorpseList[mineId][level] = {}
	end

	if #self._mineCarCorpseList[mineId][level] >= GrainCarConst.MAX_CORPSE_EACH_LEVEL then
		return
	end

	table.insert(self._mineCarCorpseList[mineId][level], carUnit)
end

--初始尸体
function GrainCarData:initCorpse(message)
	self._mineCarCorpseList = {}

	-- local message = {
	-- 	grain_car_dst_info = {
	-- 		{
	-- 			grain_car_id = 1,
	-- 			guild_id = 101,
	-- 			guild_name = "牛逼1",
	-- 			mine_id = 102,
	-- 		},
	-- 		{
	-- 			grain_car_id = 2,
	-- 			guild_id = 102,
	-- 			guild_name = "牛逼2军团",
	-- 			mine_id = 103,
	-- 		},
	-- 		{
	-- 			grain_car_id = 2,
	-- 			guild_id = 103,
	-- 			guild_name = "牛逼3军团",
	-- 			mine_id = 103,
	-- 		},
	-- 		{
	-- 			grain_car_id = 3,
	-- 			guild_id = 104,
	-- 			guild_name = "牛逼4军团",
	-- 			mine_id = 103,
	-- 		},
			
	-- 		{
	-- 			grain_car_id = 1,
	-- 			guild_id = 105,
	-- 			guild_name = "牛逼5军团",
	-- 			mine_id = 105,
	-- 		},
	-- 		{
	-- 			grain_car_id = 4,
	-- 			guild_id = 105,
	-- 			guild_name = "牛逼5军团",
	-- 			mine_id = 103,
	-- 		},
	-- 		{
	-- 			grain_car_id = 5,
	-- 			guild_id = 105,
	-- 			guild_name = "牛逼5军团",
	-- 			mine_id = 103,
	-- 		},
	-- 	},
	-- 	grain_car_shame_time = 1982834480
	-- }

	if rawget(message, "grain_car_dst_info") then
		for _, v in pairs(message.grain_car_dst_info) do
			local corpseUnit = GrainCarCorpseUnitData.new()
			corpseUnit:initData(v)
			self:addGrainCarCorpse(corpseUnit, 2)
		end
	end
	local shameTime = rawget(message, "grain_car_shame_time")
	self:setCorpseShowTime(shameTime)
end






--------------------------------------------------------------
---------------------------协议--------------------------------
--------------------------------------------------------------
--获取当前粮车路线情况
function GrainCarData:c2sGetGrainCarInfo()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetGraincarInfo,  {})	
end

--获取当前粮车路线情况
-- message S2C_GetGraincarInfo{
-- 	required uint32 ret = 1;
-- 	required GrainCar grain_car = 2;
-- 	optional GrainRoads grain_road = 3;
-- }
function GrainCarData:_s2cGetGrainCarInfo(id, message)
	if message.ret == GrainCarConst.GRAIN_EMERGENCY_CLOSE then
		--紧急关闭
		self:setIs_close(1)
		return
	end
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local unit = self:_createCarUnit(message)
	self:setGrainCar(unit)
	unit:setDestory_guild_name(message.destory_guild_name)
	unit:createRouteWithRoadId(message.road_id)
	unit:setMine_id(message.mine_id)

	local route = self:_createRoads(message)
	if route then
		unit:setRoute(route)
	end

	local road = self:_createRoad(message.grain_road_point)
	if road then
		unit:setGrainRoads(road)
	end

	local users = self:_createUsers(message)
	self:setUsers(users)
	
    G_SignalManager:dispatch(SignalConst.EVENT_GRAIN_CAR_GET_INFO, message)
end
----------------------------------------------------------------

--更改粮车路线可见开关
--switch: 开关 (0:仅管理可见;1:全部可见)
function GrainCarData:c2sChangeGrainCarView(switch)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ChangeGraincarView,  {switch = switch})	
end

--更改粮车路线可见开关
-- message S2C_ChangeGraincarView{
-- 	required uint32 ret = 1;
-- 	required uint32 all_view = 2; // 开关
-- }
function GrainCarData:_s2cChangeGrainCarView(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GRAIN_CAR_CHANGE_AUTH, message.all_view)
end

--粮车路线分享权限变动通知
-- message S2C_GrainCarViewNotify{
-- 	optional uint32 all_view = 1;			// 粮车开关
-- }
function GrainCarData:_s2cGrainCarViewNotify(id, message)
	if self._grainCarUnit then
		self._grainCarUnit:setAll_view(message.all_view)
		G_SignalManager:dispatch(SignalConst.EVENT_GRAIN_CAR_VIEW_NOTIFY, message.all_view)
	end
end

----------------------------------------------------------------

--粮车升级
function GrainCarData:c2sUpgradeGrainCar()
	G_NetworkManager:send(MessageIDConst.ID_C2S_UpgradeGraincar,  {})	
end
--粮车升级
-- message S2C_UpgradeGraincar{
-- 	required uint32 ret = 1;
-- }
function GrainCarData:_s2cUpgradeGrainCar(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_GRAIN_CAR)
	G_SignalManager:dispatch(SignalConst.EVENT_GRAIN_CAR_UPGRADE, message)
end
----------------------------------------------------------------

--粮车信息变更通知
-- message S2C_GraincarNotify{
-- 	required GrainCar grain_car = 1;
-- }
function GrainCarData:_s2cGrainCarNotify(id, message)
	local grainCarMsg = rawget(message, "grain_car")
	
	local carUnit = nil
	if self:_isMyCar(grainCarMsg.guild_id) then
		if self._grainCarUnit then
			self._grainCarUnit:updateData(grainCarMsg)
			-- if self._grainCarUnit:getStamina() <= 0 then
			-- 	self:setDeadMineId(self._grainCarUnit:getCurPit())
			-- 	-- self._grainCarUnit:setDeadMineId(self._grainCarUnit:getCurPit())
			-- end
		end
	end
	carUnit = self._carHashTable["k" .. grainCarMsg.guild_id]

	if carUnit then
		--getAll没拿全 可能会收到这个通知
		carUnit:updateData(grainCarMsg)
		if carUnit:getStamina() <= 0 then
			self:addGrainCarCorpse(carUnit, 1)
		end
	end
	
    G_SignalManager:dispatch(SignalConst.EVENT_GRAIN_CAR_NOTIFY, carUnit)
end
----------------------------------------------------------------

--发车
-- message C2S_StartGrainCarMove{
-- }
function GrainCarData:c2sStartGrainCarMove()
	G_NetworkManager:send(MessageIDConst.ID_C2S_StartGrainCarMove,  {})
end

--发车
-- message S2C_StartGrainCarMove{
-- 	required uint32 ret = 1;
-- }
function GrainCarData:_s2cStartGrainCarMove(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GRAIN_CAR_LAUNCH, message)
end
----------------------------------------------------------------

--攻击粮车
-- message C2S_AttackGrainCar{
-- 	required uint32 guild_id = 1;
-- 	required uint32 mine_id = 2; // 矿坑id
-- }
function GrainCarData:c2sAttackGrainCar(guildId, mineId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_AttackGrainCar,  {guild_id = guildId, mine_id = mineId})
end

--攻击粮车
-- message S2C_AttackGrainCar{
-- 	required uint32 ret = 1;
-- 	optional uint32 attack_num = 2;
-- 	optional uint32 attcak_time = 3;
--  repeated Award  awards = 4;
--  optional uint32 hurt = 5;           //  造成的伤害
--  optional uint32 army = 5;           //  兵力值
-- }
function GrainCarData:_s2cAttackGrainCar(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	self:setAttack_num(message.attack_num)
	self:setAttack_time(message.attcak_time)


	local hurt = rawget(message, "hurt")
	local army = rawget(message, "army")
	local desc_army = rawget(message, "desc_army")
	G_UserData:getMineCraftData():setMyArmyValue(army)
	G_SignalManager:dispatch(SignalConst.EVENT_GRAIN_CAR_UPDATE_ARMY)
	G_SignalManager:dispatch(SignalConst.EVENT_GRAIN_CAR_ATTACK, message.awards, hurt, army, desc_army)
end
----------------------------------------------------------------

--粮车进站变动通知
-- message S2C_GrainCarMoveNotify{
-- 	required GrainCar grain_car = 1;
-- 	optional GrainRoadPoint grain_point = 2;
-- }
function GrainCarData:_s2cGrainCarMoveNotify(id, message)
	local newCarUnit = self:_updateCarRoad(message)
	if not newCarUnit then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_GRAIN_CAR_MOVE_NOTIFY, newCarUnit)
end

----------------------------------------------------------------
--视野广播合并消息
function GrainCarData:_s2cGrainCarMoveMultiNotify(id, message)
    -- body
    local msg = rawget(message, "msg") or {}
    if table.nums(msg) <= 0 then
        return
    end

    for k, v in pairs(msg) do
        self:_s2cGrainCarMoveNotify(nil, v)
    end
end

--获取所有移动的粮车
-- message C2S_GetAllMoveGrainCar{
-- }
function GrainCarData:c2sGetAllMoveGrainCar()
	self._grainCarList = {}
	self._carHashTable = {}
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetAllMoveGrainCar,  {})
end

--获取所有移动的粮车
-- message S2C_GetAllMoveGrainCar{
-- 	required uint32 ret = 1;				
-- 	repeated GrainMoveInfo grain_move_info = 2;	 // 当前已经发车的粮车信息
-- 	optional uint32 self_attack_num = 3;		// 自身攻击次数
-- 	optional uint32 self_attack_time = 4;		// 自身的上次攻击时间
-- 	optional bool is_end = 5;					// 判断是否最后一个数据包
-- }
function GrainCarData:_s2cGrainCarGetAll(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:setAttack_num(message.self_attack_num)
	self:setAttack_time(message.self_attack_time)

	local package = {} -- 分包
	for i, v in pairs(message.grain_move_info) do
		local unit = self:_createCarUnit(v)
		local guildId = unit:getGuild_id()
		local roads = self:_createRoad(v.grain_road_point)
		if roads then
			unit:setGrainRoads(roads)
		end
		unit:createRouteWithRoadId(v.road_id)

		if self._carHashTable["k" .. guildId] then
			--已经有了就更新 避免重复
			local index = #self._grainCarList + 1
			for i, carUnit in pairs(self._grainCarList) do
				if carUnit:getGuild_id() == guildId then
					index = i
					break
				end
			end
			self._carHashTable["k" .. guildId] = unit
			self._grainCarList[index] = unit
		else
			self._carHashTable["k" .. guildId] = unit
			table.insert(self._grainCarList, unit)
		end
		table.insert(package, unit)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_GRAIN_CAR_GET_ALL_MOVE_CAR, package)
	-- if message.is_end then
	-- end
end

--活动结束通知
function GrainCarData:_s2cGrainCarEnd(id, message)
	self:setEndTime(message.endTime)
	self._isLoginEndTime = message.is_login
	G_SignalManager:dispatch(SignalConst.EVENT_GRAIN_CAR_END)
end






----------------------------------------------------------------
------------------------------方法------------------------------
----------------------------------------------------------------
--创建粮车对象
function GrainCarData:_createCarUnit(message)
	local grainCarMsg = rawget(message, "grain_car")
	local unit = GrainCarUnitData.new()
	unit:initData(grainCarMsg)
	return unit
end

--更新粮车对象
function GrainCarData:_updateCarUnit(message)
	local grainCarMsg = rawget(message, "grain_car")
	local guildId = grainCarMsg.guild_id

	if self:_isMyCar(grainCarMsg.guild_id) then
		if self._grainCarUnit then
			self._grainCarUnit:updateData(grainCarMsg)
			local roads = self:_createRoad(message.grain_point)
			if roads then
				self._grainCarUnit:setGrainRoads(roads)
			end
			self._grainCarUnit:createRouteWithRoadId(message.road_id)
		end
	end

	local index = #self._grainCarList + 1
	for i, carUnit in pairs(self._grainCarList) do
		if carUnit:getGuild_id() == guildId then
			index = i
			break
		end
	end

	local unitInList = self._grainCarList[index]
	local unitInHashTable = self._carHashTable["k" .. guildId]

	if not unitInList or not unitInHashTable then
		return nil
	end
	unitInList:updateData(grainCarMsg)
	unitInHashTable:updateData(grainCarMsg)
	return unitInList
end

--创建路径点列表
function GrainCarData:_createRoads(message)
	local roadPointList = {}
	local grainRoad = rawget(message, "grain_road")
	if grainRoad then
		local roads = rawget(grainRoad, "grain_points")
		for i, v in pairs(roads) do
			local point = GrainRoadPoint.new()
			point:initData(v)
			table.insert(roadPointList, point)
		end
		return roadPointList
	end
	return nil
end

--创建路径点
function GrainCarData:_createRoad(message)
	local roadPointList = {}
	local point = GrainRoadPoint.new()
	point:initData(message)
	table.insert(roadPointList, point)
	return roadPointList
end 

--创建users
function GrainCarData:_createUsers(message)
	local userList = {}
	local users = rawget(message, "user")
	if not users then
		return userList 
	end
	for i, user in pairs(users) do
		local userData = SimpleUserData.new(user)
		table.insert(userList, userData)
	end
	return userList
end

--更新车当前位置
function GrainCarData:_updateCarRoad(message)
	local newCarUnit = self:_updateCarUnit(message)
	if not newCarUnit then
		if self:_getAliveCount() >= GrainCarConst.MAX_CAR_AVATAR  then
			--大于最大数 丢弃
			print("[GrainCarData _updateCarRoad] reach max aliveCount")
			return nil
		end
		newCarUnit = self:_createCarUnit(message)
		local guildId = newCarUnit:getGuild_id()
		local index = #self._grainCarList + 1
		for i, carUnit in pairs(self._grainCarList) do
			if carUnit:getGuild_id() == guildId then
				index = i
				break
			end
		end
		self._grainCarList[index] = newCarUnit
		self._carHashTable["k" .. guildId] = newCarUnit
	end

	local roads = self:_createRoad(message.grain_point)
	if roads then
		newCarUnit:setGrainRoads(roads)
	end
	newCarUnit:createRouteWithRoadId(message.road_id)

	return newCarUnit
end

function GrainCarData:_isMyCar(guildId)
	return self._grainCarUnit and self._grainCarUnit:getGuild_id() == guildId
end

function GrainCarData:_getAliveCount()
	local count = 0
	for i, carUnit in pairs(self._carHashTable) do
		if carUnit:getStamina() > 0 then
			count = count + 1
		end
	end
	return count
end

return GrainCarData