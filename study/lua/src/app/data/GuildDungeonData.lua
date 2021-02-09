--军团副本数据

local BaseData = require("app.data.BaseData")
local GuildDungeonData = class("GuildDungeonData", BaseData)

local schema = {}
schema["synRecordData"] = {"boolean", false} 
GuildDungeonData.schema = schema

function GuildDungeonData:ctor(properties)
	GuildDungeonData.super.ctor(self, properties)

    self._dungeonInfoDataList = {}
    self._dungeonRankDataList = {}
    self._dungeonRecordDataList = {}
    self._dungeonRecordDataListByRank = {}
    self._dungeonRecordDataListByPlayerId = {}
    self._myGuildRankData= nil

    self._s2cGetGuildDungeonListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildDungeon, handler(self, self._s2cGetGuildDungeon))--获取公会副本信息
    self._s2cGuildDungeonBattleListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildDungeonBattle, handler(self, self._s2cGuildDungeonBattle))--公会副本挑战
    self._s2cGuildSourceRewardListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildSourceReward, handler(self, self._s2cGuildSourceReward))
    self._s2cGetGuildDungeonRecordListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildDungeonRecord, handler(self, self._s2cGetGuildDungeonRecord))--获取公会副本记录
    self._s2cGuildDungeonRecordRespondListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildDungeonRecordRespond, handler(self, self._s2cGuildDungeonRecordRespond))--副本信息变更同步
end

function GuildDungeonData:clear()
	self._s2cGetGuildDungeonListener:remove()
	self._s2cGetGuildDungeonListener = nil
    self._s2cGuildDungeonBattleListener:remove()
	self._s2cGuildDungeonBattleListener = nil
    self._s2cGuildSourceRewardListener:remove()
	self._s2cGuildSourceRewardListener = nil    
    self._s2cGetGuildDungeonRecordListener:remove()
	self._s2cGetGuildDungeonRecordListener = nil 
    self._s2cGuildDungeonRecordRespondListener:remove()
	self._s2cGuildDungeonRecordRespondListener = nil     
end

function GuildDungeonData:reset()
    self._dungeonInfoDataList = {}
    self._dungeonRankDataList = {}
    self._dungeonRecordDataList = {}
    self._dungeonRecordDataListByRank = {}
    self._dungeonRecordDataListByPlayerId = {}
    self._myGuildRankData = nil
end

function GuildDungeonData:c2sGetGuildDungeon()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetGuildDungeon, {})
end

function GuildDungeonData:c2sGuildDungeonBattle(uid)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GuildDungeonBattle, {
		uid = uid
	})
end

function GuildDungeonData:c2sGuildSourceReward(id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GuildSourceReward, {
		id = id
	})
end

function GuildDungeonData:c2sGetGuildDungeonRecord()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetGuildDungeonRecord, {})
end

function GuildDungeonData:_s2cGetGuildDungeon(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end
    self:resetTime()

    if message.is_begin then
        self._dungeonInfoDataList = {}
    end
    local dungeons = rawget(message,"dungeons") or {}
    for k,v in ipairs(dungeons) do
        self:_createDungeonInfoData(v)
    end

    if message.is_end then 
        G_SignalManager:dispatch(SignalConst.EVENT_GUILD_DUNGEON_MONSTER_GET)
    end
end


function GuildDungeonData:_s2cGuildDungeonBattle(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
  
	--optional BattleReport battle_report = 2;//战报
	--repeated Award rewards = 3; //奖励
    G_SignalManager:dispatch(SignalConst.EVENT_GUILD_DUNGEON_CHALLENGE,message)
end

function GuildDungeonData:_s2cGuildSourceReward(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	--optional uint32 id =2;
	--repeated Award rewards = 3; //奖励
end

function GuildDungeonData:_s2cGetGuildDungeonRecord(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

   
   
   

    local members = rawget(message,"members") or {}
	G_UserData:getGuild():updateMemberList(members)


    self._dungeonRecordDataList = {}
    local dungeonRecord = rawget(message,"dungeon_record") or {}
    for k,v in ipairs(dungeonRecord) do
         self:_createDungeonRecordData(v)
    end
    self:_updateRecordData()
  

    self._dungeonRankDataList = {}
    local guildDungeonRank = rawget(message,"guild_dungeon_rank") or {}
    for k,v in ipairs(guildDungeonRank) do
         self:_createDungeonRankData(v)
    end


    self._myGuildRankData = self:_createMyGuildRankData(message)

    G_SignalManager:dispatch(SignalConst.EVENT_GUILD_GET_MEMBER_LIST)
    G_SignalManager:dispatch(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN)
end

function GuildDungeonData:_s2cGuildDungeonRecordRespond(id, message)
   if not self:isSynRecordData() then
        return 
    end
 

    local member = rawget(message,"members") 
   if member then
        G_UserData:getGuild():updateGuildMemberData(member)
    end


    local dungeonRecord = rawget(message,"dungeon_record") 
    if dungeonRecord then
         self:_createDungeonRecordData(dungeonRecord)
    end

    self:_updateRecordData()

   

    self._dungeonRankDataList = {}
    local guildDungeonRank = rawget(message,"guild_dungeon_rank") or {}
    for k,v in ipairs(guildDungeonRank) do
         self:_createDungeonRankData(v)
    end


    if rawget(message,"self_rank") then
        self._myGuildRankData = self:_createMyGuildRankData(message)
    end 

    G_SignalManager:dispatch(SignalConst.EVENT_GUILD_GET_MEMBER_LIST)
    G_SignalManager:dispatch(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN)
end

function GuildDungeonData:_updateRecordData()
    table.sort(self._dungeonRecordDataList,handler(self,self._sortRecordDataList))
    self._dungeonRecordDataListByRank = {}
    self._dungeonRecordDataListByPlayerId = {}
    for k,v in ipairs(self._dungeonRecordDataList) do
        if not self._dungeonRecordDataListByRank[v:getTarget_rank()] then
            self._dungeonRecordDataListByRank[v:getTarget_rank()] = {}
        end
        if not self._dungeonRecordDataListByPlayerId[v:getPlayer_id()] then
            self._dungeonRecordDataListByPlayerId[v:getPlayer_id()] = {}
        end
        table.insert(self._dungeonRecordDataListByRank[v:getTarget_rank()],v)
        table.insert(self._dungeonRecordDataListByPlayerId[v:getPlayer_id()], v) 
    end
end

function GuildDungeonData:_createDungeonInfoData(msg)
    local GuildDungeonInfoData = require("app.data.GuildDungeonInfoData")
    local data = GuildDungeonInfoData.new()
    data:initData(msg)
    self._dungeonInfoDataList[msg.rank]  = data
end

function GuildDungeonData:_createDungeonRankData(msg)
    local GuildDungeonRankData = require("app.data.GuildDungeonRankData")
    local data = GuildDungeonRankData.new()
    data:initData(msg)
    self._dungeonRankDataList[msg.rank]  = data
end


function GuildDungeonData:_createDungeonRecordData(msg)
    local GuildDungeonRecordData = require("app.data.GuildDungeonRecordData")
    local data = GuildDungeonRecordData.new()
    data:initData(msg)
    table.insert(self._dungeonRecordDataList,data)
end

function GuildDungeonData:_createMyGuildRankData(message)
    local GuildDungeonRankData = require("app.data.GuildDungeonRankData")
    local data = GuildDungeonRankData.new()
    --军团名和军团ID通过军团数据取
    data:setRank(message.self_rank)
    data:setNum(message.self_player_num)
    data:setPoint(message.self_guild_point)
    return data
end

--[[

function GuildDungeonData:updateMemberList(members)
	self._guildMemberList = {}
	for i, data in ipairs(members) do
		self:_setGuildMemberData(data)
	end

end

function GuildDungeonData:_setGuildMemberData(data)
	self._guildMemberList["k_"..tostring(data.uid)] = nil
	local unitData = GuildMemberData.new(data)
	self._guildMemberList["k_"..tostring(data.uid)] = unitData

	local userId = G_UserData:getBase():getId()
	if userId == data.uid then
		self._myMemberData = unitData
	end
	self._memberListIsDirt = true
end
]]
function GuildDungeonData:_sortRecordDataList(obj1,obj2)
     if obj1:getTime() ~= obj2:getTime() then
        return  obj1:getTime() < obj2:getTime()
    end
    if obj1:getTarget_rank() ~= obj2:getTarget_rank() then
        return  obj1:getTarget_rank() < obj2:getTarget_rank()
    end
    return obj1:getPlayer_id() < obj2:getPlayer_id()
end

function GuildDungeonData:getDungeonInfoDataList()
    return self._dungeonInfoDataList
end

function GuildDungeonData:getDungeonRankDataList()
    return self._dungeonRankDataList
end


function GuildDungeonData:getDungeonRecordDataList()
    return self._dungeonRecordDataList
end

function GuildDungeonData:getMyGuildRankData()
    return self._myGuildRankData
end


function GuildDungeonData:getDungeonRecordDataByRank(rank)
    return self._dungeonRecordDataListByRank[rank] or {}
end

function GuildDungeonData:getDungeonRecordDataByPlayerId(playerId)
    return self._dungeonRecordDataListByPlayerId[playerId] or {}
end

function GuildDungeonData:getDungeonInfoDataByRank(rank)
    return self._dungeonInfoDataList[rank]
end

function GuildDungeonData:pullData()
    G_UserData:getGuild():pullData()

    self:c2sGetGuildDungeonRecord()
    self:c2sGetGuildDungeon()
end


function GuildDungeonData:saveAutionDlgTime(endTime)
   -- local endTime = self:getEnd_time()
    local value = G_UserData:getUserConfig():getConfigValue("guild_dungeon_aution_end_time") or 0
    local oldEndTime = tonumber(value)
    --老时间小于当前时间，则更新
    if oldEndTime < endTime then
       G_UserData:getUserConfig():setConfigValue("guild_dungeon_aution_end_time",endTime)
    end
end

function GuildDungeonData:getAutionDlgTime()
    local value = G_UserData:getUserConfig():getConfigValue("guild_dungeon_aution_end_time") or 0
    dump(value)
    local oldEndTime = tonumber(value)
    return oldEndTime
end

return GuildDungeonData
