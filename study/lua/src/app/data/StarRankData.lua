local BaseData = require("app.data.BaseData")
local StarRankData = class("StarRankData", BaseData)

local StarRankBaseData = require("app.data.StarRankBaseData")

local schema = {}
schema["selfRank"] 			            = {"number", 0}
schema["star"]                          = {"star", 0}
schema["rankDatas"] 			        = {"table", {}}
StarRankData.schema = schema

function StarRankData:ctor(properties)
    StarRankData.super.ctor(self, properties)
    self._listenerStarRank = G_NetworkManager:add(MessageIDConst.ID_S2C_GetStageStarRank, handler(self, self._recvStarRank))
end

function StarRankData:clear()
    self._listenerStarRank:remove()
    self._listenerStarRank = nil
end

function StarRankData:reset()	
    self:setSelfRank(0)
    self:setRankDatas({})
end

--请求消息
function StarRankData:c2sGetStageStarRank(rankType)
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetStageStarRank, 
    {
        rank_type = rankType
    }) 
end

function StarRankData:_recvStarRank(id, message)
    local ret = message.ret
    if message.ret == 1 then
        self:updateData(message)      
    end
    G_SignalManager:dispatch(SignalConst.EVENT_CHAPTER_STAR_RANK, ret)
end

function StarRankData:updateData(data)
    self:reset()
    local rankDatas = {}
    if rawget(data, "ranks") then
        for i = 1, #data.ranks do
            local rankBaseData = StarRankBaseData.new(data.ranks[i])
            table.insert(rankDatas, rankBaseData)
        end
    end
    self:setRankDatas(rankDatas)

    self:setSelfRank(data.self_rank)
    self:setStar(data.star)
end

return StarRankData