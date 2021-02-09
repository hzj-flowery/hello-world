local BaseData = require("app.data.BaseData")
local SiegeRankData = class("SiegeRankData", BaseData)

local SiegeRankBaseData = require("app.data.SiegeRankBaseData")
local SiegeGuildRankBaseData = require("app.data.SiegeGuildRankBaseData")

local schema = {}
schema["selfRank"] 			            = {"number", 0}
schema["selfGuildRank"]                 = {"number", 0}
schema["rankDatas"] 			        = {"table", {}}
schema["guildRankDatas"]                = {"table", {}}
SiegeRankData.schema = schema

function SiegeRankData:ctor(properties)
    SiegeRankData.super.ctor(self, properties)
    self._listenerRank = G_NetworkManager:add(MessageIDConst.ID_S2C_GetRebelArmyHurtRank, handler(self, self._s2cGetRebelArmyHurtRank))
    self._listenerGuildRank = G_NetworkManager:add(MessageIDConst.ID_S2C_GetRebelArmyGuildHurtRank, handler(self, self._s2cGetRebelArmyGuildHurtRank))
end

function SiegeRankData:clear()
    self._listenerRank:remove()
    self._listenerRank = nil    
    self._listenerGuildRank:remove()
    self._listenerGuildRank = nil
end

function SiegeRankData:reset()
    self:setSelfRank(0)
    self:setRankDatas({})
    self:setSelfGuildRank(0)
    self:setGuildRankDatas({})
end

function SiegeRankData:_updatePersonData(data)
    local rankDatas = {}
    if rawget(data, "ranks") then
        for i = 1, #data.ranks do
            local rankBaseData = SiegeRankBaseData.new(data.ranks[i])
            table.insert(rankDatas, rankBaseData)
        end
    end
    self:setRankDatas(rankDatas)
    self:setSelfRank(data.self_rank)
end

--发送排行榜消息
function SiegeRankData:c2sGetRebelArmyHurtRank()
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetRebelArmyHurtRank, {})
end

function SiegeRankData:_s2cGetRebelArmyHurtRank(id, message)
    if message.ret ~= 1 then
		return
	end
	self:_updatePersonData(message)
    G_SignalManager:dispatch(SignalConst.EVENT_SIEGE_RANK)
end

function SiegeRankData:_updateGuildData(data)
    local rankDatas = {}
    if rawget(data, "ranks") then
        for i = 1, #data.ranks do
            local siegeGuildRankBaseData = SiegeGuildRankBaseData.new(data.ranks[i])
            table.insert(rankDatas, siegeGuildRankBaseData)
        end
    end
    self:setGuildRankDatas(rankDatas)
    self:setSelfGuildRank(data.self_rank)
end

--发送工会排行榜
function SiegeRankData:c2sGetRebelArmyGuildHurtRank()
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetRebelArmyGuildHurtRank, {})
end

--接收工会排行榜
function SiegeRankData:_s2cGetRebelArmyGuildHurtRank(id, message)
    if message.ret ~= 1 then
		return
	end
	self:_updateGuildData(message)
    G_SignalManager:dispatch(SignalConst.EVENT_SIEGE_GUILD_RANK)
end

return SiegeRankData