local BaseData = require("app.data.BaseData")
local TowerRankData = class("TowerRankData", BaseData)

local TowerRankBaseData = require("app.data.TowerRankBaseData")

local schema = {}
schema["selfRank"] 			            = {"number", 0}
schema["rankDatas"] 			        = {"table", {}}
TowerRankData.schema = schema

function TowerRankData:ctor(properties)
    TowerRankData.super.ctor(self, properties)
    self._listenerTowerRank = G_NetworkManager:add(MessageIDConst.ID_S2C_GetTowerStarRank, handler(self, self._recvGetRank))
end

function TowerRankData:clear()
    self._listenerTowerRank:remove()
    self._listenerTowerRank = nil
end

function TowerRankData:reset()
    self:setSelfRank(0)
    self:setRankDatas({})
end

function TowerRankData:updateData(data)
    self:reset()
    local rankDatas = {}
    if rawget(data, "ranks") then
        for i = 1, #data.ranks do
            local rankBaseData = TowerRankBaseData.new(data.ranks[i])
            table.insert(rankDatas, rankBaseData)
        end
    end
    self:setRankDatas(rankDatas)

    self:setSelfRank(data.self_rank)
end

function TowerRankData:c2sGetTowerStarRank()
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetTowerStarRank, {})
end

function TowerRankData:_recvGetRank(id, message)
    if message.ret == 1 then
        self:updateData(message)
    end
    G_SignalManager:dispatch(SignalConst.EVENT_TOWER_RANK)
end

return TowerRankData