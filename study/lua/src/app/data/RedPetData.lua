--红神兽data
local BaseData = require("app.data.BaseData")
local RedPetData = class("RedPetData", BaseData)
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

local schema = {}
schema["free_times"] = {"number", 0}
schema["free_cd"] = {"number", 0}
schema["orange_pool_id"] = {"table", {}}
schema["schedule"] = {"table", {}}
RedPetData.schema = schema

function RedPetData:ctor(properties)
	RedPetData.super.ctor(self, properties)

    self._recvRedPetInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_PokemonEntry, handler(self, self._s2cGetRedPetInfo))
    --self._recvRedPetActivityTime = G_NetworkManager:add(MessageIDConst.ID_S2C_PokemonSchedule, handler(self, self._s2cGetRedPetActivityTime))
    self._recvGachaRedPet = G_NetworkManager:add(MessageIDConst.ID_S2C_PokemonGacha, handler(self, self._s2cGachaRedPet))
    self._recvRefreshRedPet = G_NetworkManager:add(MessageIDConst.ID_S2C_PokemonRefresh, handler(self, self._s2cRedPetRefresh))
end

-- 清除
function RedPetData:clear()
    self._recvRedPetInfo:remove()
    self._recvRedPetInfo = nil
	self._recvGachaRedPet:remove()
    self._recvGachaRedPet = nil
    self._recvRefreshRedPet:remove()
    self._recvRefreshRedPet = nil
    --self._recvRedPetActivityTime:remove()
	--self._recvRedPetActivityTime = nil
end

-- 重置
function RedPetData:reset()

end

function RedPetData:isActivityOpen()
    --local openDay = G_UserData:getBase():getOpenServerDayNum()	--开服天数
    --local activitySchedule = self:getSchedule()
    --local isOpen = false
    -- local curTime = G_ServerTime:getTime()

    -- for k, v in pairs(activitySchedule) do
    --     local start_time = v.start_time or 0
    --     local end_time = v.end_time or 0

    --     if curTime >= start_time and start_time < end_time then
    --         isOpen = true
    --         break
    --     end
    -- end

    return LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_RED_PET)
end


----------------------------------------------------

function RedPetData:c2sGetRedPetInfo()
	G_NetworkManager:send(MessageIDConst.ID_C2S_PokemonEntry, {})
end

function RedPetData:_s2cGetRedPetInfo(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
    
    local info = rawget(message, "pokemon")
    if info then
        self:setFree_times(rawget(info, "free_times") or 0)
        self:setFree_cd(rawget(info, "free_cd") or 0)
        self:setOrange_pool_id(rawget(info, "orange_pool_id") or {})
    end

	G_SignalManager:dispatch(SignalConst.EVENT_GET_RED_PET_INFO)
end

function RedPetData:c2sGachaRedPet(type, id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_PokemonGacha, {
        gacha_type = type,
        pool_id = id
    })
end

function RedPetData:_s2cGachaRedPet(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
    
    local info = rawget(message, "pokemon")
    if info then
        self:setFree_times(rawget(info, "free_times") or 0)
        self:setFree_cd(rawget(info, "free_cd") or 0)
        self:setOrange_pool_id(rawget(info, "orange_pool_id") or {})
    end

    local awards = rawget(message, "awards")

	G_SignalManager:dispatch(SignalConst.EVENT_GACHA_RED_PET, awards)
end

function RedPetData:c2sRedPetRefresh()
	G_NetworkManager:send(MessageIDConst.ID_C2S_PokemonRefresh, {})
end

function RedPetData:_s2cRedPetRefresh(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
    
    local info = rawget(message, "pokemon")
    if info then
        self:setFree_times(rawget(info, "free_times") or 0)
        self:setFree_cd(rawget(info, "free_cd") or 0)
        self:setOrange_pool_id(rawget(info, "orange_pool_id") or {})
    end

	G_SignalManager:dispatch(SignalConst.EVENT_REFRESH_RED_PET)
end

-- function RedPetData:_s2cGetRedPetActivityTime(id, message)
--     local schedule = rawget(message, "schedule")
--     if schedule then
--         self:setSchedule(schedule)
--     end
-- end

return RedPetData