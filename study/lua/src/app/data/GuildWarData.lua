local BaseData = require("app.data.BaseData")
local GuildWarData = class("GuildWarData", BaseData)
local GuildWarConst = require("app.const.GuildWarConst")



local schema = {}
schema["in_city_id"] = {"number", 0} 


GuildWarData.schema = schema



function GuildWarData:ctor()
	GuildWarData.super.ctor(self)

	self._cityList = {}
	self._warUserMap = {}
	self._warPointMap = {}
	self._warWatchMap = {}
	self._rank_list = {}
	self._cityEnterFlag = {}
	self._battleDefenderGuildInfoList = {}
	self._guildWarConfigMap = nil 
	self._guildWarRoadConfigMap = self:_createGuildWarRoadConfigMap()
	self._guildWarRoadDecodeData = {}
	self._guildWarStandPointConfigMap = self:_createGuildWarStandPointConfigMap()
	self._recvGetGuildWarWorld = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildWarWorld, handler(self, self._s2cGetGuildWarWorld))--军团战世界地图
	self._recvEnterGuildWar = G_NetworkManager:add(MessageIDConst.ID_S2C_EnterGuildWar, handler(self, self._s2cEnterGuildWar ))--进入战斗地图
	self._recvMoveGuildWarPoint = G_NetworkManager:add(MessageIDConst.ID_S2C_MoveGuildWarPoint, handler(self, self._s2cMoveGuildWarPoint ))--移动据点
	self._recvSyncGuildWar = G_NetworkManager:add(MessageIDConst.ID_S2C_SyncGuildWar, handler(self, self._s2cSyncGuildWar ))--同步
	self._recvSyncGuildWarWorld = G_NetworkManager:add(MessageIDConst.ID_S2C_SyncGuildWarWorld, handler(self, self._s2cSyncGuildWarWorld ))--同步世界
	self._recvGuildWarBattleWatch = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildWarBattleWatch, handler(self, self._s2cGuildWarBattleWatch  ))--挑战建筑物
	self._recvGuildWarBattleUser = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildWarBattleUser, handler(self, self._s2cGuildWarBattleUser  ))--挑战玩家
	self._recvGuildWarDeclareCity = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildWarDeclareCity, handler(self, self._s2cGuildWarDeclareCity  ))--宣战
	self._recvGuildWarData = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildWarData, handler(self, self._s2cGuildWarData ))
	self._recvGuildWarNotice = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildWarNotice, handler(self, self._s2cGuildWarNotice ))
	

end

-- 清除
function GuildWarData:clear()
	self._recvGetGuildWarWorld:remove()
	self._recvGetGuildWarWorld = nil
	self._recvEnterGuildWar:remove()
	self._recvEnterGuildWar = nil
	self._recvMoveGuildWarPoint:remove()
	self._recvMoveGuildWarPoint = nil

	self._recvSyncGuildWar:remove()
	self._recvSyncGuildWar = nil

	self._recvSyncGuildWarWorld:remove()
	self._recvSyncGuildWarWorld  = nil
	
	self._recvGuildWarBattleWatch:remove()
	self._recvGuildWarBattleWatch = nil
	
	self._recvGuildWarBattleUser:remove()
	self._recvGuildWarBattleUser = nil

	self._recvGuildWarDeclareCity:remove()
	self._recvGuildWarDeclareCity = nil

	self._recvGuildWarData:remove()
	self._recvGuildWarData = nil

	self._recvGuildWarNotice:remove()
	self._recvGuildWarNotice = nil
end

-- 重置
function GuildWarData:reset()

end

--军团战世界地图
function GuildWarData:c2sGetGuildWarWorld()
    local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")
    local bQualification,_ = GuildCrossWarHelper.isGuildCrossWarEntry()
    if bQualification then
        local region = GuildCrossWarHelper.getCurActStage()
        if region and region.stage == 3 then
            G_Prompt:showTip(Lang.get("guild_cross_war_goguildcrosswar"))
            return
        end
    end
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetGuildWarWorld, {})
end

--进入战场
function GuildWarData:c2sEnterGuildWar(cityId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_EnterGuildWar, {
		city_id = cityId
	})
end

--移动据点
function GuildWarData:c2sMoveGuildWarPoint(pointId)
	logWarn("c2sMoveGuildWarPoint ")
	G_NetworkManager:send(MessageIDConst.ID_C2S_MoveGuildWarPoint, {
		point_id = pointId,
	})
end

--挑战建筑物
function GuildWarData:c2sGuildWarBattleWatch(pointId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GuildWarBattleWatch, {
			point_id = pointId
	})
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_DO_ATTACK,pointId)
end

--挑战玩家
function GuildWarData:c2sGuildWarBattleUser(userId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GuildWarBattleUser, {
		user_id = userId
	})
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_DO_ATTACK,userId)
end

--宣战
function GuildWarData:c2sGuildWarDeclareCity(cityId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GuildWarDeclareCity, {
		city_id = cityId
	})
	
end


function GuildWarData:c2sGuildWarData()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GuildWarData, {
	})
end



function GuildWarData:_s2cGetGuildWarWorld(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:resetTime()

	self._cityList = {}
	local warCitys = rawget(message,"war_city") or {}
	for k,v in ipairs(warCitys) do
		self:_createGuildWarCity(v)
	end

	if rawget(message,"in_city_id") then
		self:setIn_city_id(rawget(message,"in_city_id"))
	end


	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_CITY_INFO_GET)
end


function GuildWarData:_s2cEnterGuildWar(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local cityId = rawget(message,"city_id") or 0
	local curTime = G_ServerTime:getTime()
	self._cityEnterFlag = {cityId = cityId,time = curTime}

	self:setIn_city_id(cityId)

	self._warUserMap[cityId] = {}
	self._warPointMap[cityId] = {}

	local warUsers = rawget(message,"war_user") or {}
	for k,v in ipairs(warUsers) do
		self:_createGuildWarUser(v)
	end

	self._warWatchMap[cityId] = {}
	local watcher = rawget(message,"watcher") or {}
	for k,v in ipairs(watcher) do
		self:_createGuildWarWatch(v)
	end

	self._rank_list = {}
	local rankList = rawget(message,"rank_list") or {}
	for k,v in ipairs(rankList) do
		self:_createGuildWarRankValue(v)
	end

	if rawget(message,"battle_own_guild_id") then
		local battleOwnGuildId = rawget(message,"battle_own_guild_id") 
		local battleOwnGuildName = rawget(message,"battle_own_guild_name") 
		self._battleDefenderGuildInfoList[cityId] = { guildId = battleOwnGuildId,guildName = battleOwnGuildName } 
	end

	
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_GET,cityId)
	
end

function GuildWarData:_s2cMoveGuildWarPoint(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local pointId = rawget(message,"point_id") or 0


	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_MOVE_SUCCESS,pointId)
	
end

function GuildWarData:_s2cSyncGuildWar(id, message)
	--local stTime =  timer:getms() 
	local changedPointMap = {} 
	local changedUserMap = {} 
	local isPointChange = false
	local cityId = rawget(message,"city_id") or 0

	local insertUserList = rawget(message,"insert_user") or {}
	for k,v in ipairs(insertUserList) do
		isPointChange = true
		local oldPointId = rawget(v,"old_point") or 0
		local nowPointId = rawget(v,"now_point") or 0
		local userId = rawget(v,"user_id") or 0
		changedPointMap[oldPointId] = true
		changedPointMap[nowPointId] = true
		changedUserMap[userId] =  true
		self:_insertGuildWarUser(v)
	end

	local updateUserList = rawget(message,"update_user") or {}
	for k,v in ipairs(updateUserList) do
		isPointChange = true
		local oldPointId = rawget(v,"old_point") or 0
		local nowPointId = rawget(v,"now_point") or 0
		local userId = rawget(v,"user_id") or 0
		changedPointMap[oldPointId] = true
		changedPointMap[nowPointId] = true
		changedUserMap[userId] =  true
		self:_updateGuildWarUser(v)
	end

	local deleteUserList = rawget(message,"delete_user") or {}
	for k,v in ipairs(deleteUserList) do
		isPointChange = true
		local deleteUnit = self:_deleteGuildWarUser(cityId,v)
		if deleteUnit then
			local oldPointId = deleteUnit:getOld_point()
			local nowPointId = deleteUnit:getNow_point()
			local userId = deleteUnit:getUser_id()
			changedPointMap[oldPointId] = true
			changedPointMap[nowPointId] = true
			changedUserMap[userId] =  true
		end
	
	end

	local isBuildingChange = false
	local changedBuildingMap = nil
	if rawget(message,"watcher")  then
		local watcher = rawget(message,"watcher")
		self:_createGuildWarWatch(watcher)
		isBuildingChange = true
		changedBuildingMap = {[watcher.point_id] = true }
	end

	local isRankChange = false
	if rawget(message,"rank_value")  then
		self:_createGuildWarRankValue(rawget(message,"rank_value"))
		isRankChange = true
	end
	

	if rawget(message,"war_notice") then
	end


	if rawget(message,"battle_own_guild_id") then
		local oldDefenderGuildId = self:getBattleDefenderGuildId(cityId) 
		local battleOwnGuildId = rawget(message,"battle_own_guild_id") 
		local battleOwnGuildName = rawget(message,"battle_own_guild_name") 
		self._battleDefenderGuildInfoList[cityId] = { guildId = battleOwnGuildId,guildName = battleOwnGuildName } 
		local isReset = oldDefenderGuildId ~= battleOwnGuildId
		if isReset then
			logWarn("GuildWarData rank_list reset ")
			self._rank_list = {}
			isRankChange = true
			G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_CAMP_REVERSE,cityId)
		end

	end


	--G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_SYN,cityId)
	


	if isRankChange then
		G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_RANK_CHANGE,cityId)
	end

	if isBuildingChange then
		G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_BUILDING_CHANGE,cityId,changedBuildingMap)
	end




	if isPointChange then
		G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_POINT_CHANGE,cityId,changedPointMap,changedUserMap)
	end




	if isPointChange then
		G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_USER_CHANGE,cityId,changedUserMap)
	end


			
--	local etTime =  timer:getms() 
--	print( "GuildWarData ----------"..(etTime-stTime) )
	
	
end


function GuildWarData:_s2cGuildWarBattleWatch(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local pointId =  rawget(message,"point_id") or 0
	local cityId = rawget(message,"city_id") 
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_ATTACK_WATCH,pointId)

	
	--G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_DO_ATTACK,pointId)

	local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
    local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId( cityId,pointId)

	local GuildWarNotice = require("app.data.GuildWarNotice")
	local unit = GuildWarNotice.new()
	if config.point_type ==  GuildWarConst.POINT_TYPE_GATE then
		unit:setId(1)
	else
		unit:setId(2)
	end
	
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE,cityId,unit)
end

function GuildWarData:_s2cGuildWarBattleUser(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end


	local userId = rawget(message,"user_id")
	local userName = rawget(message,"user_name")
	local cityId = rawget(message,"city_id")

	local isKill = rawget(message,"is_kill") 
	local isWin = rawget(message,"is_win") 
	local isBeKill = rawget(message,"is_be_kill") 

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_REPORT_NOTICE,message)



	local GuildWarNotice = require("app.data.GuildWarNotice")
	local unit = GuildWarNotice.new()
	unit:setValue("name",userName)
	unit:setId(isWin and 7 or 8)
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE,cityId,unit)

	if isKill then
		local GuildWarNotice = require("app.data.GuildWarNotice")
		local unit = GuildWarNotice.new()
		unit:setValue("name",userName)
		unit:setId(9)
		G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE,cityId,unit)
	end
	if isBeKill then
		local GuildWarNotice = require("app.data.GuildWarNotice")
		local unit = GuildWarNotice.new()
		unit:setValue("name",userName)
		unit:setId(10)
		G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE,cityId,unit)
	end

end


function GuildWarData:_s2cSyncGuildWarWorld(id, message)
	local warCity = rawget(message,"war_city") or {}
	for k,v in ipairs(warCity) do
		self:_createGuildWarCity(v)
	end
	
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_DECLARE_SYN)
end


function GuildWarData:_s2cGuildWarDeclareCity(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	if rawget(message,"city_id")  then
		local cityId = rawget(message,"city_id") 
		G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_DECLARE_SUCCESS,cityId)
	end

end

function GuildWarData:_s2cGuildWarData(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local memberData = rawget(message,"member_data") or {}
	local GuildWarMemberData = require("app.data.GuildWarMemberData")
	local list = {}
	for k,v in ipairs(memberData) do
		local unit = GuildWarMemberData.new()
		unit:initData(v)
		table.insert( list, unit)
	end
	local sortfunction = function(a,b)
		local value1 = a:getValue(GuildWarMemberData.KEY_CONTRIBUTION )
		local value2 = b:getValue(GuildWarMemberData.KEY_CONTRIBUTION )
		if value1 ~= value2 then
			return value1 > value2
		end
		return a:getUser_id() < b:getUser_id()
	end
	table.sort( list, sortfunction )
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_MEMBER_DATA_LIST,list)
end

function GuildWarData:_s2cGuildWarNotice(id, message)
	local userName = rawget(message,"user_name") 
	local isKill = rawget(message,"is_kill") 
	local isWin = rawget(message,"is_win") 
	local isBeKill = rawget(message,"is_be_kill") 


	local cityId = self._cityEnterFlag.cityId
	if not cityId then
		return 
	end

	local GuildWarNotice = require("app.data.GuildWarNotice")
	local unit = GuildWarNotice.new()
	unit:setValue("name",userName)
	unit:setId(isWin and 3 or 4)
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE,cityId,unit)

	if isBeKill then
		local GuildWarNotice = require("app.data.GuildWarNotice")
		local unit = GuildWarNotice.new()
		unit:setValue("name",userName)
		unit:setId(5)
		G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE,cityId,unit)
	end
	if isKill then
		local GuildWarNotice = require("app.data.GuildWarNotice")
		local unit = GuildWarNotice.new()
		unit:setValue("name",userName)
		unit:setId(6)
		G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE,cityId,unit)
	end


end

function GuildWarData:_setMapValue(map,value,...)
	if not map then return end
	local kList = {...}
	for k,v in ipairs(kList) do
		if k ==  #kList then
			 map[v] = value
			 break
		end
		if not map[v] then
			map[v] = {}
		end
		map = map[v]
	end
end



function GuildWarData:_createGuildWarRoadConfigMap()
	local configMap = {}
	local GuildWarRoad =  require("app.config.guild_war_road")
	local len = GuildWarRoad.length()
	for index = 1,len,1 do
		local config = GuildWarRoad.indexOf(index)
		self:_setMapValue(configMap,config,config.start_stand_point,config.end_point_id)
	end
    return configMap
end


function GuildWarData:_createGuildWarStandPointConfigMap()
	local configMap = {}
	local GuildWarPoint =  require("app.config.guild_war_point")
	local len = GuildWarPoint.length()
	for index = 1,len,1 do
		local config = GuildWarPoint.indexOf(index)
		self:_setMapValue(configMap,config,config.battlefield_type,config.point_id,config.face,config.hole_id)
	end
    return configMap
end

function GuildWarData:setGuildWarRoadDecodeData(k1,k2,value)
	self:_setMapValue(self._guildWarRoadDecodeData,value,k1,k2)
end

function GuildWarData:getGuildWarRoadDecodeData(k1,k2)
	if self._guildWarRoadDecodeData[k1] then
		return self._guildWarRoadDecodeData[k1][k2]
	end
end


function GuildWarData:getGuildWarRoadConfig(k1,k2)
	local map = G_UserData:getGuildWar():getGuildWarRoadConfigMap()
    local roadConfig = map[k1][k2]
	return roadConfig
end

function GuildWarData:getGuildWarStandPointList(k1,k2)
	logWarn(k1.." getGuildWarStandPointList "..k2)
	local map = self._guildWarStandPointConfigMap
	if map[k1] then
		return map[k1][k2]
	end
	return nil
end

function GuildWarData:_createGuildWarCity(data)
	local GuildWarCity = require("app.data.GuildWarCity")
	local unit = GuildWarCity.new()
	unit:initData(data)
	self._cityList[data.city_id] = unit
end

function GuildWarData:_createGuildWarUser(data,isUpdate)
	local cityId = data.city_id
	local userId = data.user_id
	local nowPoint = data.now_point
	local oldPoint = data.old_point




	if not self._warUserMap[cityId] then
		self._warUserMap[cityId] = {}
	end

	local oldUnit = self._warUserMap[cityId][userId]



	if not self._warPointMap[cityId] then
		self._warPointMap[cityId] = {}
	end

	if oldUnit and oldPoint == 0 then
		oldPoint = oldUnit.now_point_
	end

	if not self._warPointMap[cityId][oldPoint] then
		self._warPointMap[cityId][oldPoint] = {}
	end
	self._warPointMap[cityId][oldPoint][userId] = nil


	if not self._warPointMap[cityId][nowPoint] then
		self._warPointMap[cityId][nowPoint] = {}
	end

	local unit = oldUnit
	if isUpdate == true and oldUnit then
		oldUnit:updateData(data)
	else
		local GuildWarUser = require("app.data.GuildWarUser")
		unit = GuildWarUser.new()
		unit:initData(data)
	end

	self._warPointMap[cityId][nowPoint][userId] = unit
	self._warUserMap[cityId][userId] = unit
end

function GuildWarData:_insertGuildWarUser(data)
	self:_createGuildWarUser(data)
end

function GuildWarData:_updateGuildWarUser(data)
	self:_createGuildWarUser(data,true)
end

function GuildWarData:_deleteGuildWarUser(cityId,userId)
	local deleteUnit = self:getWarUserById(cityId,userId)
	--self:_setMapValue(self._warUserMap,nil,cityId,userId)
	if not deleteUnit then
		return nil
	end
	
	local nowPoint = deleteUnit.now_point_

	if not self._warUserMap[cityId] then
		self._warUserMap[cityId] = {}
	end
	self._warUserMap[cityId][userId] = nil


	if not self._warPointMap[cityId] then
		self._warPointMap[cityId] = {}
	end
	if not self._warPointMap[cityId][nowPoint] then
		self._warPointMap[cityId][nowPoint] = {}
	end
	self._warPointMap[cityId][nowPoint][userId] = nil


	return deleteUnit
end

function GuildWarData:_createGuildWarWatch(data)
	local GuildWarWatch = require("app.data.GuildWarWatch")
	local unit = GuildWarWatch.new()
	unit:initData(data)
	self:_setMapValue(self._warWatchMap,unit,unit:getCity_id(),unit:getPoint_id())
end

function GuildWarData:_createGuildWarRankValue(data)
	local GuildWarRankValue = require("app.data.GuildWarRankValue")
	local unit = GuildWarRankValue.new()
	unit:initData(data)
	self._rank_list[unit:getGuild_id()] = unit
end


function GuildWarData:getCityList()
	return self._cityList
end

function GuildWarData:getCityById(cityId)
	return self._cityList[cityId]
end

function GuildWarData:getWarUserListByCityId(cityId)
	return self._warUserMap[cityId]
end

function GuildWarData:getWarUserById(cityId,userId)
	if self._warUserMap[cityId] then
		return self._warUserMap[cityId][userId]
	end
end

function GuildWarData:getWarWatchListByCityId(cityId)
	return self._warWatchMap[cityId]
end

function GuildWarData:getWarWatchById(cityId,id)
	return self._warWatchMap[cityId][id]
end

function GuildWarData:getMyWarUser(cityId)
	local userId = G_UserData:getBase():getId()
	return self:getWarUserById(cityId,userId)
end

function GuildWarData:getNewestMyWarUser()
	local cityId = self._cityEnterFlag.cityId
	if not cityId then
		return nil
	end
	local userId = G_UserData:getBase():getId()
	return self:getWarUserById(cityId,userId)
end


function GuildWarData:getBattleDefenderGuildId(cityId)
	local guildInfo = self._battleDefenderGuildInfoList[cityId]
	if guildInfo then
		return guildInfo.guildId
	end
	return nil
end

function GuildWarData:getBattleDefenderGuildInfo(cityId)
	local guildInfo = self._battleDefenderGuildInfoList[cityId]
	return guildInfo
end

--返回据点的玩家列表
function GuildWarData:getWarUserListByFortId(cityId,pointId)
	local list = {}
	local warUserList = self:getWarUserListByCityId(cityId)
	for k,v in pairs(warUserList) do
		if v:getCurrPoint() == pointId then
			table.insert(list,v)
		end
	end
	return list
end


function GuildWarData:getPopulation(cityId,pointId)
	local guildId = G_UserData:getGuild():getMyGuildId()
	local list = self._warPointMap[cityId][pointId]
	if not list then
		return 0,0
	end
	--local list = self:getWarUserListByFortId(cityId,pointId)
	local a,b = 0,0
	for k,v in pairs(list) do
		if v:getCurrPoint() == pointId then
			if v.guild_id_ == guildId then
				a = a + 1
			else
				b = b + 1	
			end
		end
	
	end
	return a,b
end

--返回据点的我方玩家列表，排序
function GuildWarData:getSameGuildWarUserList(cityId,pointId,isSort)
	if isSort == nil then
		isSort = true
	end
	local newList = {}
	local guildId = G_UserData:getGuild():getMyGuildId()
	local list = self:getWarUserListByFortId(cityId,pointId)
	for k,v in ipairs(list) do
		if v:getGuild_id() == guildId then
			table.insert( newList,v )
		end
	end
	if isSort then
		local sort = function(a,b)
			if a:isSelf() or b:isSelf() then
				return a:isSelf()
			end
			if a:getPower() ~= b:getPower() then
				return a:getPower() > b:getPower()
			end
			return a:getUser_id() < b:getUser_id()
		end
		table.sort( newList, sort)
	end
	
	return newList
end

--返回据点的非我方玩家列表，排序
function GuildWarData:getOtherGuildWarUserList(cityId,pointId,isSort)
	if isSort == nil then
		isSort = true
	end
	local newList = {}
	local guildId = G_UserData:getGuild():getMyGuildId()
	local list = self:getWarUserListByFortId(cityId,pointId)
	for k,v in ipairs(list) do
		if v:getGuild_id() ~= guildId then
			table.insert( newList,v )
		end
	end
	if isSort then
		local sort = function(a,b)
			if a:getMove_time() ~= b:getMove_time() then
				return a:getMove_time() < b:getMove_time()
			end
			return a:getUser_id() < b:getUser_id()
		end
		table.sort( newList, sort)
	end
	return newList
end



--[[
--返回跑图的玩家列表,限制数量并打乱
function GuildWarData:getShowWarUserList(cityId,fliterUserMap,maxRoleNum)
	fliterUserMap = fliterUserMap or {}
	maxRoleNum = maxRoleNum or  GuildWarConst.MAP_MAX_ROLE_NUM
	local runList = {}
	local otherStandList = {}
	local myStandList = {}
	local standNum = 0
	local runNum = 0
	local myGuildId = G_UserData:getGuild():getMyGuildId()
	local warUserList = self:getWarUserListByCityId(cityId)
	for k,v in pairs(warUserList) do
		if not fliterUserMap[v:getUser_id()] then
			local guildId = v:getGuild_id()

			if v:getCurrPoint() == 0 then
				runNum  = runNum + 1
				table.insert(runList,v)
			else	
				standNum = standNum + 1	
				if guildId ~=  myGuildId then
					table.insert(otherStandList,v)
				else
					table.insert(myStandList,v)	
				end
				
			end
		end
		
	end

	--分配原则：最多显示45个
	--分配原则：据点上站立的以显示己方为主
	--分配原则：自己一定显示，无论在跑图还是在据点上
	--分配原则：跑图和站立分别比例是 65%、35%
	local maxRunNum = math.ceil(maxRoleNum  * GuildWarConst.MAP_RUN_MAP_PERCENT /100)
	local maxStandNum = math.ceil(maxRoleNum  * GuildWarConst.MAP_STAND_PERCENT /100)
	local finalRunNum = math.min(runNum,maxRunNum)
	local finalStandNum =  math.min(standNum,maxStandNum)
	if finalRunNum + finalStandNum < maxRoleNum then
		local remainNum =  maxRoleNum - finalRunNum - finalStandNum 
		if maxRunNum < runNum then
			finalRunNum = math.min(remainNum + finalRunNum,runNum)
		elseif maxStandNum < standNum then
			finalStandNum = math.min(remainNum + finalStandNum,standNum)
		end
	end	

	--己方站立数量
	--其他站立数量
	local myStandNum = math.min(#myStandList ,finalStandNum) 
	local otherStandNum =  math.min(#otherStandList, math.max(finalStandNum - myStandNum,0) ) 

	--logWarn(string.format( "getShowWarUserList %d %d %d",runNum,#myStandList,#otherStandList))
	--logWarn(string.format( "getShowWarUserList %d %d %d",finalRunNum,myStandNum,otherStandNum))


	local shuffle = function(list)
		for k,v in ipairs(list) do
			local newK = math.random(1,#list)
			local oldValue = list[k]
			list[k] = list[newK]
			list[newK] = oldValue
		end 
	end

	local insertUser = function(newList,list,num)
		local userId = G_UserData:getBase():getId()
		for k1,v1 in ipairs(list) do
			if k1 <= num and v1:getUser_id() ~= userId then
				table.insert( newList, v1 )
			end 
		end
	end

	shuffle(runList)
	shuffle(myStandList)
	shuffle(otherStandList)

	
	local newList = {}
	insertUser(newList,runList,finalRunNum)
	insertUser(newList,myStandList,myStandNum)
	insertUser(newList,otherStandList,otherStandNum)



	--自己
	local myWatchUser  = self:getMyWarUser(cityId)
	if myWatchUser and not fliterUserMap[myWatchUser:getUser_id()] then
		table.insert( newList, myWatchUser )
	end

	return newList
end
]]

function GuildWarData:getShowWarUserList(cityId,fliterUserMap,maxRoleNum)
	fliterUserMap = fliterUserMap or {}
	maxRoleNum = maxRoleNum or  GuildWarConst.MAP_MAX_ROLE_NUM
	local list = {}
	local warUserList = self:getWarUserListByCityId(cityId)
	for k,v in pairs(warUserList) do
		if not fliterUserMap[v.user_id_] then
			table.insert(list,v)	
		end
	end

	local shuffle = function(list)
		for k,v in ipairs(list) do
			local newK = math.random(1,#list)
			local oldValue = list[k]
			list[k] = list[newK]
			list[newK] = oldValue
		end 
	end

	local insertUser = function(newList,list,num)
		local userId = G_UserData:getBase():getId()
		for k1,v1 in ipairs(list) do
			if k1 <= num and v1.user_id_ ~= userId then
				table.insert( newList, v1 )
			end 
		end
	end

	shuffle(list)

	local newList = {}
	insertUser(newList,list,maxRoleNum)


	--自己
	local myWatchUser  = self:getMyWarUser(cityId)
	if myWatchUser and not fliterUserMap[myWatchUser:getUser_id()] then
		table.insert( newList, myWatchUser )
	end

	return newList
end




--返回指定城市的堡垒数据
function GuildWarData:getShowWarWatchList(cityId)
	local list = {}
	local warWatchList = self:getWarWatchListByCityId(cityId)
	for k,v in pairs(warWatchList) do
		table.insert(list,v)
	end
	return list
end


--返回伤害排行，排序
function GuildWarData:getRankList()
	local list = {}
	for k,v in pairs(self._rank_list) do
		table.insert(list,v)
	end
	local sortFunc = function(a,b)
		if a:getHurt() ~= b:getHurt() then
			return a:getHurt() > b:getHurt()
		end
		return a:getGuild_id() > b:getGuild_id()
	end
	table.sort(list,sortFunc)
	return list
end

function GuildWarData:getGuildWarConfigMap()
	return self._guildWarConfigMap
end

function GuildWarData:setGuildWarConfigMap(map)
	 self._guildWarConfigMap = map
end


function GuildWarData:getGuildWarRoadConfigMap()
	return self._guildWarRoadConfigMap
end

function GuildWarData:getCityRequestInfo()
	return self._cityEnterFlag 
end

function GuildWarData:pullData()

end


function GuildWarData:saveAutionDlgTime(endTime)
   -- local endTime = self:getEnd_time()
    local value = G_UserData:getUserConfig():getConfigValue("guild_war_aution_end_time") or 0
    local oldEndTime = tonumber(value)
    --老时间小于当前时间，则更新
    if oldEndTime < endTime then
       G_UserData:getUserConfig():setConfigValue("guild_war_aution_end_time",endTime)
    end
end

function GuildWarData:getAutionDlgTime()
    local value = G_UserData:getUserConfig():getConfigValue("guild_war_aution_end_time") or 0
    dump(value)
    local oldEndTime = tonumber(value)
    return oldEndTime
end

function GuildWarData:clearBattleData()
	self._cityEnterFlag = {}
end

return GuildWarData
