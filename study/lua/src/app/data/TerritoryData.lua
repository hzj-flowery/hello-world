-- 驻地系统
local TerritoryData = class("TerritoryData", require("app.data.BaseData"))
local TerritoryUnit = require("app.data.TerritoryUnit")
local TerritoryInfo = require("app.config.territory_performance")
local TerritoryConst = require("app.const.TerritoryConst")
local UserDataHelper = require("app.utils.UserDataHelper")

local TERRITORY_FILE = "territory"


function TerritoryData:ctor()
	
	self._territoryList = {
		-- TerritoryUnit.new()
	}
	self._isFristEnter = true
	-- 自己领地的信息
	self._selfTerritoryList = {
		-- TerritoryUnit.new()
	}
	self._friendRiots = {}

	self._msgGetTerritoryInfo =  G_NetworkManager:add(MessageIDConst.ID_S2C_GetTerritory, 		handler(self, self._s2cTerritoryInfo))
	self._msgPatrolAward 	  =  G_NetworkManager:add(MessageIDConst.ID_S2C_GetPatrolAward, 	handler(self, self._s2cPartolAward))
	self._msgRiotHelper 	  =  G_NetworkManager:add(MessageIDConst.ID_S2C_TerritoryForHelp, 	handler(self, self._s2cRiotHelper))
	self._msgTerritoryFight   =  G_NetworkManager:add(MessageIDConst.ID_S2C_AttackTerritory, 	handler(self, self._s2cTerritoryFight))
	self._msgTerritoryPartol   =  G_NetworkManager:add(MessageIDConst.ID_S2C_PatrolTerritory, 	handler(self, self._s2cTerritoryPartol))
	self._msgRiotAward 		  =  G_NetworkManager:add(MessageIDConst.ID_S2C_GetTerritoryRiotAward, 		handler(self, self._s2cRiotAward))
	self._msgTerritoryHelp 	  =  G_NetworkManager:add(MessageIDConst.ID_S2C_GetTerritoryForHelp, 		handler(self, self._s2cTerritoryForHelp))

	self._msgUpdateTerritoryHelp =  G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateTerritoryForHelp, handler(self, self._s2cUpdateTerritoryForHelp))

	self._msgTerritoryRiot 	  =  G_NetworkManager:add(MessageIDConst.ID_S2C_TerritoryHelpRepressRiot, 	handler(self, self._s2cTerritoryRepressRiot))
	self._msgGetTerritorySingle	=  G_NetworkManager:add(MessageIDConst.ID_S2C_GetTerritorySingle, 	handler(self, self._s2cGetTerritorySingle))

	self._msgGetTerritoryAllAward = G_NetworkManager:add(MessageIDConst.ID_S2C_GetAllPatrolAward, handler(self, self._s2cGetAllPatrolAward))
end


-- 清除
function TerritoryData:clear()
	self._msgGetTerritoryInfo:remove()
	self._msgGetTerritoryInfo = nil
	self._msgPatrolAward:remove()
	self._msgPatrolAward = nil
	self._msgRiotHelper:remove()
	self._msgRiotHelper = nil
	self._msgTerritoryFight:remove()
	self._msgTerritoryFight = nil

	self._msgTerritoryPartol:remove()
	self._msgTerritoryPartol = nil

	self._msgRiotAward:remove()
	self._msgRiotAward = nil
	self._msgTerritoryHelp:remove()
	self._msgTerritoryHelp = nil
	self._msgTerritoryRiot:remove()
	self._msgTerritoryRiot = nil
	self._msgGetTerritorySingle:remove()
	self._msgGetTerritorySingle = nil

	self._msgUpdateTerritoryHelp:remove()
	self._msgUpdateTerritoryHelp = nil

	self._msgGetTerritoryAllAward:remove()
	self._msgGetTerritoryAllAward = nil
end

-- 重置
function TerritoryData:reset()

end


function TerritoryData:sendAttackTerritoy(id)

end

function TerritoryData:isFirstEnter()
	return self._isFristEnter
end

function TerritoryData:setFirstEnter()
	self._isFristEnter = false
end

-- 获取是否是自己的领地
function TerritoryData:getIsSelf()
	return self._userId == G_UserData:getBase():getId()
end

-- 获取当前领地的用户ID
function TerritoryData:getUserId()
	return self._userId
end

-- 获取当前领地的用户名字
function TerritoryData:getShowName()
	return self._name or ""
end

-- 设置目前可镇压次数
function TerritoryData:setAssistCount( count )
	if count ~= nil then
		self._remainAssistCount = count
	end
end

-- 获取目前可镇压次数
function TerritoryData:getAssistCount( )
	return self._remainAssistCount or 0
end

-- 设置好友信息
function TerritoryData:setFriendInfo( baseid )
	self._baseId = baseid
end

-- 获取好友的信息
function TerritoryData:getFriendInfo()
	return self._baseId
end

-- 设置第一次攻打掉落奖励，在之后界面显示用
function TerritoryData:setBattleAward( award )
	if award == nil then
		return
	end
	self._battleAward = clone(award)
end

-- 获取第一次攻打奖励，仅一次之后清除
function TerritoryData:getBattleAward()
	local award = self._battleAward
	self._battleAward = nil
	return award
end

-- 获取所有领地正在巡逻的神将ID
function TerritoryData:getHeroIds()
	local ids = {}
	for i,unit in ipairs(self._territoryList) do
		-- 按哈希表存，方便取
		ids[unit:getHeroId()] = true
	end

	return ids
end

-- 获取锁定状态提示
function TerritoryData:getLockMsg( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:getLockMsg()
	end

	return nil
end

-- 获取领地名字
function TerritoryData:getTerritoryName( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:getTerritoryName()
	end

	return ""
end

function TerritoryData:getAllTerritoryRiot()

end

--是否有巡逻奖励
function TerritoryData:isHavePatrolAward()
	local UserDataHelper = require("app.utils.UserDataHelper")
	for i, territory in pairs(self._territoryList) do
		local state = territory:getTerritoryState()
		if state == TerritoryConst.STATE_FINISH  then
			return true
		end
	end
	return false
end

-- 获取红点(宝箱奖励)
function TerritoryData:isShowRedPoint( ... )

	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	local UserDataHelper = require("app.utils.UserDataHelper")
	local isOpen =  FunctionCheck.funcIsOpened(FunctionConst.FUNC_PVE_TERRITORY)
	if isOpen == false then
		return false
	end
	
	for i, territory in pairs(self._territoryList) do
		local state = territory:getTerritoryState()
		if state == TerritoryConst.STATE_FINISH  then
			return true
		end
		local currVit  = UserDataHelper.getNumByTypeAndValue( 5, 3 )--获取当前体力值
		if state == TerritoryConst.STATE_ADD and currVit >= 5 then
			return true
		end
		--有符合等级可以攻打的新领地，并且满足推荐战力的时候。
		if territory:isCanFight() then
			return true
		end
	end

	return false
end


--暴动奖励，暴动求助
function TerritoryData:isRiotRedPoint()
	if self:isRiotHaveTake() then
		return true
	end
	if self:isRiotHaveHelp() then
		return true
	end
	return false
end

--暴动有奖励可领取
function TerritoryData:isRiotHaveTake()
	local TerritoryHelper = require("app.scene.view.territory.TerritoryHelper")
	local riotList = self:getAllRiotEvents()
	for i, riot in ipairs(riotList) do
		local riotState = TerritoryHelper.getRiotEventState(riot)
		if riotState == TerritoryConst.RIOT_TAKE  then
			return true
		end
	end
	return false
end

--暴动求助
function TerritoryData:isRiotHaveHelp()
	local TerritoryHelper = require("app.scene.view.territory.TerritoryHelper")
	local riotList = self:getAllRiotEvents()
	for i, riot in ipairs(riotList) do
		local riotState = TerritoryHelper.getRiotEventState(riot)
		if riotState == TerritoryConst.RIOT_HELP then
			return true
		end
	end
	return false
end

-- 获取领地配置数据
function TerritoryData:getTerritoryCfg( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:getTerritoryCfg()
	end

	return ""
end

-- 获取指定领地第一个还在暴动的事件ID
function TerritoryData:getFirstRiotId( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:getFirstRiotId()
	end

	return 0
end

-- 插入事件，目前仅支持镇压事件
function TerritoryData:insertEvent( territoryId, eventId )
	local territory = self._territoryList[territoryId]
	if territory then
		territory:insertEvent(eventId)
	end
end

-- 设置指定领地信息
function TerritoryData:setTerritoryDataById( territoryId, TerritoryData )
	local territory = self._territoryList[territoryId]
	if territory then
		territory:setTerritoryData(TerritoryData)
	end
end

-- 获取指定领地状态
function TerritoryData:getTerritoryState( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:getTerritoryState()
	end

	return TerritoryConst.STATE_NONE
end

-- 获取指定领地是否已经到达可攻打等级
function TerritoryData:getTerritoryReady( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:IsReady()
	end

	return false
end

-- 获取指定领地结束巡逻的时间
function TerritoryData:getTerritoryEndTime( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:getEndTime()
	end

	return 0
end

-- 获取指定领地武将界限突破等级
function TerritoryData:getTerritoryLimitLevel( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:getLimitLevel()
	end

	return 0
end

-- 获取指定领地武将红升金界限突破等级
function TerritoryData:getTerritoryLimitRedLevel( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:getLimitRedLevel()
	end

	return 0
end

-- 获取指定领地，至今的事件列表
function TerritoryData:getTerritoryEventsTillNow( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:getTerritoryEventsTillNow()
	end

	return {}
end

-- 获取指定领地下一个事件的发生时间
function TerritoryData:getNextEventTime( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:getNextEventTime()
	end

	return {}
end

-- 获取指定领地开始巡逻的时间
function TerritoryData:getStartTime( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:getStartTime()
	end

	return 0
end

-- 获取指定领地巡逻的神将
function TerritoryData:getTerritoryHeroId( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:getHeroId()
	end

	return 0
end

-- 获取奖励掉落
function TerritoryData:getHeroDrop( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:getHeroDrop()
	end

	return nil
end


-- 重置指定领地的信息
function TerritoryData:resetTerritory( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		territory:reset()
	end
end

-- 设置下一领地可攻打
function TerritoryData:setNextCanFight( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		local nextTerritory = self._territoryList[territory:getNextId()]
		if nextTerritory and nextTerritory:IsReady() then
			nextTerritory:setCanFight(true)
		end
	end
end



function TerritoryData:getTerritoryBubble( territoryId, index )
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:getTerritoryBubble(index)
	end

	return 0
end

function TerritoryData:getTerritoryRiotInfo(territoryId)
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:getTerritoryRiotInfo()
	end

	return nil
end

-- 获取领地是否已经开启
function TerritoryData:getTerritoryIsOpen( territoryId )
	local territory = self._territoryList[territoryId]
	if territory then
		return territory:getIsOpen()
	end

	return false
end

-- 获取所有背包武将，剔除主角，经验卡和紫色以下，非开采中在前
function TerritoryData:getAllHeros()
	local list = G_UserData:getHero():getAllHeros()

	--去除相同的baseId
	local baseUnitList = {}
	local temp = {}
	for i, unitData in pairs(list) do
		local baseId = unitData:getBase_id()
		if temp[baseId] == nil or unitData:isInBattle() then --排除baseId重复的情况,如果上阵状态，则放入重新填入
			temp[baseId] = unitData
		end
	end

	local heroIds = G_UserData:getTerritory():getHeroIds()
	local retList = {}
	local onHeros = {}
	local offHeros = {}
	local unitIdList = {}

	--颜色条件走配表
	local checkColor = function(color)
		local TerritoryHelper = require("app.scene.view.territory.TerritoryHelper")
		local strColors = TerritoryHelper.getTerritoryParameter("territory_hero")
		local tbColors = string.split(strColors, "|")
		for i, v in ipairs(tbColors) do
			if color == tonumber(v) then
				return true
			end
		end
		return false
	end

	for i, hero in pairs(temp) do
		local unitCfg = hero:getConfig()
		if unitCfg.type == 2 and checkColor(unitCfg.color) then --剔除主角，经验卡和颜色条件
			table.insert(retList, hero)
		end
	end

	table.sort(retList, function(unit1, unit2)
		local cfg1 = unit1:getConfig()
		local cfg2 = unit2:getConfig()

		local isPartol1 = heroIds[unit1:getBase_id()] --不在巡逻
		local isPartol2 = heroIds[unit2:getBase_id()] --不在巡逻

		--巡逻状态，排序在后
		if isPartol1 ~= isPartol2 then
			return not isPartol1
		end

		--上阵在前面
		local isInBattle1 = unit1:isInBattle()
		local isInBattle2 = unit2:isInBattle()

		if isInBattle1 ~= isInBattle2 then
			return isInBattle1
		--品质色排序
		elseif cfg1.color ~= cfg2.color then
			return cfg1.color > cfg2.color
		else
			return cfg1.id < cfg2.id
		end

	end)

	return retList
end



--获取所有的暴动事件
function TerritoryData:getAllRiotEvents()
	local allRiotList = {}

	local TerritoryHelper = require("app.scene.view.territory.TerritoryHelper")
	for key, territory in pairs(self._territoryList) do
		local riotList = territory:getRiotEvents()
		for i, value in ipairs(riotList) do
			value.territory_id = key
			if TerritoryHelper.isRiotEventExpiredTime(value) == false then
				table.insert(allRiotList, value )
			end
		end
	end
	local function sortEvent(event1, event2)
		local state1 = TerritoryHelper.getRiotEventState(event1)
		local state2 = TerritoryHelper.getRiotEventState(event2)
		if state1 ~= state2 then
			return state1 < state2
		end
		return event1.territory_id < event2.territory_id
	end

	table.sort(allRiotList,sortEvent)
	--TODO 这里可能要做个排序
	return allRiotList
end



----------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------
--网络交互
function TerritoryData:c2sGetTerritory()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetTerritory, {})
end

--领地巡逻一件领取
function TerritoryData:c2sGetAllPatrolAward()
	if self:isHavePatrolAward() then
		G_NetworkManager:send(MessageIDConst.ID_C2S_GetAllPatrolAward, {})
	end
end

function TerritoryData:c2sGetPatrolAward(territoryId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetPatrolAward, {id = territoryId})
end


function TerritoryData:c2sTerritoryForHelp(territoryId, eventId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_TerritoryForHelp, {territory_id = territoryId , event_id = eventId})
end

function TerritoryData:c2sAttackTerritory(territoryId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_AttackTerritory, {id = territoryId})
end

function TerritoryData:c2sPatrolTerritory(territoryId,partolType,heroId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_PatrolTerritory, {id = territoryId, patrol_type = partolType, hero_id = heroId})
end


function TerritoryData:c2sGetTerritoryRiotAward(territoryId, eventId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetTerritoryRiotAward, {territory_id = territoryId , event_id = eventId})
end

function TerritoryData:c2sGetTerritoryForHelp()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetTerritoryForHelp, {})
end

function TerritoryData:c2sTerritoryHelpRepressRiot(messageTable)
	--[[
	local messageTable = {
		territory_id = riotEvent.territory_id,
		event_id = riotEvent.event.id,
		friend_id = riotEvent.user_id,
		friend_uuid = riotEvent.uuid,
		friend_sid = riotEvent.sid,
	}
	]]

	G_NetworkManager:send(MessageIDConst.ID_C2S_TerritoryHelpRepressRiot, messageTable)
end


function TerritoryData:_addNetMsg()

end

function TerritoryData:_removeNetMsg()

end

-- 设置领地信息，自己或好友
function TerritoryData:_s2cTerritoryInfo( id, message )
	if message.ret ~= 1 then
		return
	end

	local territorys = rawget(message, "territorys") or {}
	self._territoryList = {}
	-- 服务器返回数据长度不确定，相信表数据
	for i=1, TerritoryInfo.length() do
		local territory = territorys[i]
		local unit = TerritoryUnit.new(i,territory)
		self._territoryList[unit:getTerritoryId()] = unit
		-- 获取上一个领地
		local pre = self._territoryList[unit:getPreTerritoryId()]
		if pre then
			-- 如果上一个领地已经开启且当前领地等级到达，则可攻打
			if pre:getIsOpen() and unit:IsReady() then
				unit:setCanFight(true)
			end
			-- 上一个领地设置下一个领地为当前
			pre:setNextId(unit:getTerritoryId())
		else
			-- 如果没有上一个领地，则可攻打
			if unit:IsReady() then
				unit:setCanFight(true)
			end
		end
	end

	self:resetTime()
	G_SignalManager:dispatch(SignalConst.EVENT_TERRITORY_UPDATEUI, message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY)
end


function TerritoryData:_s2cTerritoryFight(id, message)
	if message.ret ~= 1 then
		return
	end


	local awards = rawget(message, "awards") or {}

	if #awards > 0 then
		local territoryId = message.id
		self:resetTerritory(territoryId)
		self:setNextCanFight(territoryId)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_TERRITORY_ATTACKTERRITORY, message)
end

function TerritoryData:_s2cPartolAward(id, message)
	if message.ret ~= 1 then
		return
	end

	local territoryId = message.id
	self:resetTerritory(territoryId)

	G_SignalManager:dispatch(SignalConst.EVENT_TERRITORY_GETAWARD, message)
end


function TerritoryData:_s2cGetAllPatrolAward(id, message)
	if message.ret ~= 1 then
		return
	end

	local territoryIdList = rawget(message,"id") or {}
	for i, value in ipairs(territoryIdList) do
		self:resetTerritory(value)
	end
	
	G_SignalManager:dispatch(SignalConst.EVENT_TERRITORY_GETAWARD, message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY)
end


function TerritoryData:_s2cTerritoryPartol(id, message)
	if message.ret ~= 1 then
		return
	end

	self:setTerritoryDataById(message.id, message.territory)

	G_SignalManager:dispatch(SignalConst.EVENT_TERRITORY_PATROL, message)
end

function TerritoryData:_s2cRiotHelper(id, message)
	if message.ret ~= 1 then
		return
	end

	local territory = self._territoryList[message.territory_id]
	if territory then
		territory:setRiotEventState(message.event_id,TerritoryConst.RIOT_HELPED)
	end


	G_SignalManager:dispatch(SignalConst.EVENT_TERRITORY_FORHELP, message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY)
end


function TerritoryData:_s2cRiotAward(id, message)
	if message.ret ~= 1 then
		return
	end

	local territory = self._territoryList[message.territory_id]
	if territory then
		territory:setRiotEventState(message.event_id, TerritoryConst.RIOT_TAKEN)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_TERRITORY_GET_RIOT_AWARD, message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY)
end

function TerritoryData:isTerritoryFriend( ... )
	local list = self:getFriendsRiotInfo()
	return #list > 0
end

function TerritoryData:isRiotHelpRedPoint()
	local list = self:getFriendsRiotInfo()
	return #list > 0, #list
end

function TerritoryData:_s2cUpdateTerritoryForHelp( id, message )
	local friendRiot = rawget(message, "friend_riot") or {}
	dump(friendRiot)
	if friendRiot then
		for j, serverInfo in ipairs(friendRiot.riots) do
			local riotInfo = self:_makeFriendRiotInfo(friendRiot, serverInfo)
			dump(riotInfo.key_id)
			self._friendRiots[riotInfo.key_id] = riotInfo
			--table.insert(self._friendRiots, riotInfo)
		end
	end

	G_SignalManager:dispatch(SignalConst.EVENT_TERRITORY_GET_FORHELP, message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY)
	-- body
end

--[[
message FriendTerritoryRiotInfo {
	optional uint64 user_id = 1;
	optional string uuid = 2;
	optional string name = 3;
	optional uint64 sid = 4;
	optional uint32 baseId = 5;
	optional uint32 level = 6;
	optional uint32 office_level = 7;
	repeated TerritoryRiotInfo riots = 8;
}

message TerritoryRiotInfo {
	 optional uint32 territory_id = 1;
	 optional TerritoryEvent event = 2;
}

message TerritoryEvent {
	optional uint32 id = 1;      //自增ID
	optional uint32 territory_id = 2;
	optional uint32 time = 3;    //发生时间
	optional uint32 info_id = 4; //事件ID
	optional uint32 event_type = 5; //事件类型
	optional bool is_repress = 6;   //是否已经镇压
	optional bool for_help = 7;   //是否已求助
	optional bool is_award = 8;   //是否已领奖
	optional string fname = 9;   //镇压好友名字
	optional uint32 office_level = 10;   //镇压好友名字
	repeated Award awards = 11;   //事件奖励
}

]]

function TerritoryData:_makeFriendRiotInfo( friends, serverInfo)
	-- body
	local riotInfo = {}
	local event = {}
	local converId, playInfo = require("app.utils.UserDataHelper").convertAvatarId(friends)
	event.id = serverInfo.event.id
	event.time = serverInfo.event.time
	event.info_id = serverInfo.event.info_id
	event.event_type = serverInfo.event.event_type
	event.is_repress = serverInfo.event.is_repress
	event.for_help = serverInfo.event.for_help
	event.fname = serverInfo.event.fname
	event.awards = serverInfo.event.awards
	event.end_time = rawget( serverInfo, "end_time") or 0
	riotInfo.user_id = friends.user_id
	riotInfo.uuid = friends.uuid
	riotInfo.name = friends.name
	riotInfo.sid = friends.sid
	riotInfo.level = friends.level
	riotInfo.baseId = friends.baseId or 0
	riotInfo.playeInfo = playInfo
	riotInfo.office_level = friends.office_level
	riotInfo.head_frame_id = friends.head_frame_id
	riotInfo.territory_id = serverInfo.territory_id
	riotInfo.end_time = rawget( serverInfo, "end_time")
	riotInfo.event = event
	
	--变态服务器数据结构奇葩，需要3层id才能确定唯一id
	--1 玩家id 2城池id 3事件id  因为事件id是不唯一，所以只能这样
	riotInfo.key_id = "k"..riotInfo.user_id..riotInfo.territory_id..serverInfo.event.id
	return riotInfo
end

function TerritoryData:getFriendsRiotInfo( ... )
	-- body
	local TerritoryHelper = require("app.scene.view.territory.TerritoryHelper")
	local helpNumber = tonumber(TerritoryHelper.getTerritoryParameter("help_number"))
	--暴动没次数了，不显示暴动信息
	if self:getRepressCount() == helpNumber then
		return {}
	end

	local retList =  {}

	for i, value in pairs(self._friendRiots) do
		local checkValue1 = TerritoryHelper.getRiotEventState(value.event) == TerritoryConst.RIOT_HELPED
		local checkValue2 = TerritoryHelper.isRiotEventExpiredTime(value.event) == false
		dump(value)
		dump(checkValue1)
		dump(checkValue2)
		if checkValue1 and checkValue2 then
			table.insert(retList, value)
		end
	end

	table.sort(retList,function( item1, item2 )
		return item1.event.time > item2.event.time
	end)

	return retList
end

function TerritoryData:getRepressCount( ... )
	-- 6是领地暴动
	return G_UserData:getDailyCount():getCountById(6) or 0
end


function TerritoryData:_s2cTerritoryForHelp(id, message)
	if message.ret ~= 1 then
		return
	end
	local TerritoryHelper = require("app.scene.view.territory.TerritoryHelper")
	self._friendRiots = {}
	local friendRiots = rawget(message, "friend_riots") or {}

	for i, friends in ipairs(friendRiots) do
		for j, serverInfo in ipairs(friends.riots) do
			local riotInfo = self:_makeFriendRiotInfo(friends, serverInfo)
	
			self._friendRiots[riotInfo.key_id] = riotInfo
			--table.insert(self._friendRiots, riotInfo)
		end
	end

	--好友暴动信息排序
	table.sort(self._friendRiots,function( item1, item2 )
		return item1.time > item2.time
	end)


	G_SignalManager:dispatch(SignalConst.EVENT_TERRITORY_GET_FORHELP, message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY)
end

function TerritoryData:_s2cTerritoryRepressRiot(id, message)
	if message.ret ~= 1 then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_TERRITORY_HELP_REPRESS_RIOT, message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY)
end

function TerritoryData:_s2cGetTerritorySingle(id, message)
	if message.ret ~= 1 then
		return
	end
	local data = rawget(message,"territory")
	if data then
		local territoryTemp = self._territoryList[data.id]
		if territoryTemp then
			territoryTemp:setTerritoryData(data)
		else
			local unit = TerritoryUnit.new(data.id,data)
			self._territoryList[unit:getTerritoryId()] = unit
		end
		
	end

	G_SignalManager:dispatch(SignalConst.EVENT_TERRITORY_SYNC_SINGLE_INFO, message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY)
end
----------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------

return TerritoryData
