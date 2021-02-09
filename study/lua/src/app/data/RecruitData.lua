local BaseData = require("app.data.BaseData")
local RecruitData = class("RecruitData", BaseData)

local ParameterIDConst = require("app.const.ParameterIDConst")
local Parameter = require("app.config.parameter")


local schema = {}
schema["normal_cnt"] = {"number", 0}        --普通次数
schema["normal_free_time"] = {"number", 0}  --普通最后抽的时间戳
schema["gold_cnt"] = {"number", 0}          --元宝招募次数(免费)
schema["recruit_point"] = {"number", 0}     --招募积分
schema["recruit_point_get"] = {"number", 0} --积分领取奖励
schema["gold_baodi_cnt"] = {"number", 0}    --保底次数
schema["daily_normal_cnt"] = {"number", 0}  --普通抽卡次数
schema["daily_gold_cnt"] = {"number", 0}    --元宝抽卡次数
RecruitData.schema = schema

function RecruitData:ctor(properties)
    RecruitData.super.ctor(self, properties)
    self._listenerRecruitInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_RecruitInfo, handler(self, self._s2cRecruitInfo))
    self._listenerRecruitNormal = G_NetworkManager:add(MessageIDConst.ID_S2C_RecruitNormal, handler(self, self._s2cRecruitNormal))
    self._listenerRecruitGoldOne = G_NetworkManager:add(MessageIDConst.ID_S2C_RecruitGoldOne, handler(self, self._s2cRecruitGoldOne))
    self._listenerRecruitGoldTen = G_NetworkManager:add(MessageIDConst.ID_S2C_RecruitGoldTen, handler(self, self._s2cRecruitGoldTen))
    self._listenerRecruitPointGet = G_NetworkManager:add(MessageIDConst.ID_S2C_RecruitPointGet, handler(self, self._s2cRecruitPointGet))
end

function RecruitData:clear()
    self._listenerRecruitInfo:remove()
    self._listenerRecruitInfo = nil
    self._listenerRecruitNormal:remove()
    self._listenerRecruitNormal = nil
    self._listenerRecruitGoldOne:remove()
    self._listenerRecruitGoldOne = nil
    self._listenerRecruitGoldTen:remove()
    self._listenerRecruitGoldTen = nil
    self._listenerRecruitPointGet:remove()
    self._listenerRecruitPointGet = nil
end

function RecruitData:reset()
end

function RecruitData:updateData(data)
    self:setProperties(data)
    self:resetTime()
    dump(RecruitData.schema)
end

function RecruitData:_s2cRecruitInfo(id, message)
    self:updateData(message)
    G_SignalManager:dispatch(SignalConst.EVENT_RECRUIT_INFO, message)
end

--type 1 免费，2，招募令
function RecruitData:c2sRecruitNormal(type)
    --判断是否过期
    if self:isExpired() == true then
        self:c2sRecruitInfo()
        return
    end
	local message = {
		recruit_type = type,
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_RecruitNormal, message)    
end

-- 收到普通招募消息
function RecruitData:_s2cRecruitNormal(id, message)
    if message.ret ~= 1 then
        return 
    end
    if rawget(message, "recruit_info") then
        self:updateData(message.recruit_info)
    end
    if rawget(message, "awards") then
        local generals = {}
        for i = 1, #message.awards do 
            local general = 
            {
                type = message.awards[i].type,
                value = message.awards[i].value,
                size = message.awards[i].size,
            }
            table.insert(generals, general)
        end
        G_SignalManager:dispatch(SignalConst.EVENT_RECRUIT_NORMAL, generals)
    end
end

--type 1免费，2招募令，3元宝
function RecruitData:c2sRecruitGoldOne(type)
    --判断是否过期
    if self:isExpired() == true then
        self:c2sRecruitInfo()
        return
    end
    
	local message = {
		recruit_type = type,
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_RecruitGoldOne, message)
end

function RecruitData:_s2cRecruitGoldOne(id, message)
    if message.ret ~= 1 then
        return 
    end
    if rawget(message, "recruit_info") then
        self:updateData(message.recruit_info)
    end
    if rawget(message, "awards") then
        local generals = {}
        for i = 1, #message.awards do 
            local general = 
            {
                type = message.awards[i].type,
                value = message.awards[i].value,
                size = message.awards[i].size,
            }
            table.insert(generals, general)
        end
        G_SignalManager:dispatch(SignalConst.EVENT_RECRUIT_GOLD, generals)
    end
end

function RecruitData:c2sRecruitGoldTen(type)
    --判断是否过期
    if self:isExpired() == true then
        self:c2sRecruitInfo()
        return
    end
	local message = {
        recruit_type = type,
    }
	G_NetworkManager:send(MessageIDConst.ID_C2S_RecruitGoldTen, message)
end

function RecruitData:_s2cRecruitGoldTen(id, message)
    if message.ret ~= 1 then
        return 
    end
    if rawget(message, "recruit_info") then
        self:updateData(message.recruit_info)
    end
    if rawget(message, "awards") then
        local generals = {}
        for i = 1, #message.awards do 
            local general = 
            {
                type = message.awards[i].type,
                value = message.awards[i].value,
                size = message.awards[i].size,
            }
            table.insert(generals, general)
        end
        G_SignalManager:dispatch(SignalConst.EVENT_RECRUIT_GOLD_TEN, generals)
    end
end

function RecruitData:c2sRecruitInfo()
    local message = {}

    G_NetworkManager:send(MessageIDConst.ID_C2S_RecruitInfo, message)
end
function RecruitData:c2sRecruitPointGet(boxNum, boxId, index)

    --判断是否过期
    if self:isExpired() == true then
        self:c2sRecruitInfo()
        return
    end
    
	local message = {
		box_num = boxNum,
        box_id = boxId,
        hero_num = index,
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_RecruitPointGet, message)    
end

function RecruitData:_s2cRecruitPointGet(id, message)
    if message.ret ~= 1 then
        return 
    end
    if rawget(message, "recruit_info") then
        self:updateData(message.recruit_info)
    end
    if rawget(message, "awards") then
        local generals = {}
        for i = 1, #message.awards do 
            local general = 
            {
                type = message.awards[i].type,
                value = message.awards[i].value,
                size = message.awards[i].size,
            }
            table.insert(generals, general)
        end
        G_SignalManager:dispatch(SignalConst.EVENT_RECRUIT_POINT_GET, generals)
    end
end

function RecruitData:hasFreeGoldCount()
    if self:getGold_cnt() == 0 then
        return true
    end
end

function RecruitData:hasFreeNormalCount()
	local freeCount = self:getNormal_cnt()
	local lastRecuritTime = self:getNormal_free_time()
	local freeTime = lastRecuritTime + tonumber(Parameter.get(ParameterIDConst.RECRUIT_TNTERVAL).content)
	local tblFreeCount = tonumber(Parameter.get(ParameterIDConst.RECRUIT_NORMAL_COUNT).content)
	if freeCount < tblFreeCount and G_ServerTime:getTime() >= freeTime then
        return true
    end
end

function RecruitData:hasBoxToGet()
    local myPoint =self:getRecruit_point()
	local state = self:getRecruit_point_get()
    local boxPoint = {}
    local boxStates = bit.tobits(state)
    for i = 1, 3 do
        boxPoint = tonumber(Parameter.get(ParameterIDConst["RECRUIT_BOX"..i.."_POINT"]).content)
        if myPoint >= boxPoint then
            if not boxStates[i] or boxStates[i] == 0 then
                return true
            end
        end
    end
end

function RecruitData:hasFreeCount()
    local freeCount = self:getNormal_cnt()  
	local tblFreeCount = tonumber(Parameter.get(ParameterIDConst.RECRUIT_NORMAL_COUNT).content)
    return freeCount < tblFreeCount
end

return RecruitData