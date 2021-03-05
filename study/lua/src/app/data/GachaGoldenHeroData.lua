-- @Author panhoa
-- @Date 5.5.2019
-- @Role 

local BaseData = import(".BaseData")
local GachaGoldenHeroData = class("GachaGoldenHeroData", BaseData)
local GachaGoldenHeroConst = require("app.const.GachaGoldenHeroConst")


local schema = {}
schema["start_time"] = {"number", 0}    -- 开始时间
schema["end_time"]   = {"number", 0}    -- 结束时间
schema["show_time"]   = {"number", 0}   -- 结束展示时间
schema["drop_id"]    = {"number", 0}    -- 掉落Id
schema["free_cnt"]   = {"number", 0}    -- 剩余免费次数
schema["free_cd"]    = {"number", 0}    -- 免费CD
schema["luck_draw_num"] = {"number", 0} -- 欢乐抽奖次数
schema["autoPopupJoy"]	= {"boolean",  true}	-- 是否赛季继承

GachaGoldenHeroData.schema = schema
function GachaGoldenHeroData:ctor(properties)
    GachaGoldenHeroData.super.ctor(self, properties)
    self:_initGroupHeroId()
    self:_initGoldenHeroRank()
    self:_initGoldenJoyDraw()
    self._prizeLists = {}       -- 中奖名单
    self._ownRank = {}
    
    self._msgFlushGacha   = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGacha, handler(self, self._s2cFlushGacha))       -- Flush
    self._msgGachaEntry   = G_NetworkManager:add(MessageIDConst.ID_S2C_GachaEntry, handler(self, self._s2cGachaEntry))     -- Entry
    self._msgGachaLadder  = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGachaLadder, handler(self, self._s2cGachaLadder))-- Rank
    self._msgGachaExit    = G_NetworkManager:add(MessageIDConst.ID_S2C_GachaExit, handler(self, self._s2cGachaExit))       -- Exit
    self._msgGachaNotify  = G_NetworkManager:add(MessageIDConst.ID_S2C_GachaNotify, handler(self, self._s2cGachaNotify))   -- Notify
    self._msgLuckDrawList = G_NetworkManager:add(MessageIDConst.ID_S2C_GachaLuckDrawList, handler(self, self._s2cGachaLuckDrawList))   -- 中奖名单
    self._msgRechargeReward = G_NetworkManager:add(MessageIDConst.ID_S2C_GachaRechrageReward, handler(self, self._s2cGachaRechargeReward))   -- 充值返道具
end

function GachaGoldenHeroData:clear()
    self._msgFlushGacha:remove()
    self._msgFlushGacha = nil
    self._msgGachaEntry:remove()
    self._msgGachaEntry = nil
    self._msgGachaLadder:remove()
    self._msgGachaLadder= nil
    self._msgGachaExit:remove()
    self._msgGachaExit = nil
    self._msgGachaNotify:remove()
    self._msgGachaNotify = nil
    self._msgLuckDrawList:remove()
    self._msgLuckDrawList = nil
    self._msgRechargeReward:remove()
    self._msgRechargeReward = nil
end

function GachaGoldenHeroData:reset()
end

-----------------------------------------------------------------------
-- Part1: NetWork
-- @Role     Entry（require）
function GachaGoldenHeroData:c2sGachaEntry()
    G_NetworkManager:send(MessageIDConst.ID_C2S_GachaEntry, {})
end

-- @Role     Entry（response）
function GachaGoldenHeroData:_s2cGachaEntry(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end

    local freeCnt = rawget(message, "free_cnt") or 5
    freeCnt = (5 - freeCnt)
    self:setDrop_id(rawget(message, "drop_id") or 1101)
    self:setFree_cnt(freeCnt)
    self:setFree_cd(rawget(message, "free_cd") or 0)
    self:setLuck_draw_num(rawget(message, "luck_draw_num") or 0)
    self._prizeLists = rawget(message, "prize_lists") or {}
    G_SignalManager:dispatch(SignalConst.EVENT_GACHA_GOLDENHERO_ENTRY, message)
end

-- @Role     Gacha（require）
-- @Note1:    0-免费单抽 1-道具单抽 2-元宝单抽 3-10连
-- @Note2:    池子id
function GachaGoldenHeroData:c2sGacha(gachaType, poolType)
    G_NetworkManager:send(MessageIDConst.ID_C2S_Gacha, {gacha_type = gachaType, pool_type = poolType})
end

-- @Role     Exit（require）
function GachaGoldenHeroData:c2sGachaExit()
    G_NetworkManager:send(MessageIDConst.ID_C2S_GachaExit, {})
end

-- @Role      Exit（response）
function GachaGoldenHeroData:_s2cGachaExit(id, message)
end

-- @Role     GachaLadder（require）
-- @Note:    0:总榜；1：阶段排行榜
function GachaGoldenHeroData:c2sGachaLadder(type)
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetGachaLadder, {ladder_type = type})
end

-- @Role     GachaLadder（reponse）
function GachaGoldenHeroData:_s2cGachaLadder(id, message)
    local ladders = rawget(message, "ladders") or {}

    if rawequal(message.ladder_type, 1) then        --1. 欢乐积分
        if not self._ownRank[GachaGoldenHeroConst.FLAG_OWNRANK ..1] then
            self._ownRank[GachaGoldenHeroConst.FLAG_OWNRANK ..1] = {}
        end
        self._ownRank[GachaGoldenHeroConst.FLAG_OWNRANK ..1] = {rank = (rawget(message, "own_rank") or 0), point = message.point}
    elseif rawequal(message.ladder_type, 0) then    --0. 总积分
        if not self._ownRank[GachaGoldenHeroConst.FLAG_OWNRANK ..2] then
            self._ownRank[GachaGoldenHeroConst.FLAG_OWNRANK ..2] = {}
        end
        self._ownRank[GachaGoldenHeroConst.FLAG_OWNRANK ..2] = {rank = (rawget(message, "own_rank") or 0), point = message.point}
    end

    G_SignalManager:dispatch(SignalConst.EVENT_GACHA_GOLDENHERO_JOYRANK, message)
end

-- @Role     GachaNotify弹幕（response）
function GachaGoldenHeroData:_s2cGachaNotify(id, message)
end

-- @Role     Gacha下发中奖名单（response）
function GachaGoldenHeroData:_s2cGachaLuckDrawList(id, message)
    self._prizeLists = rawget(message, "lists") or {}
    self:setDrop_id(rawget(message, "drop_id") or 1101)
    G_SignalManager:dispatch(SignalConst.EVENT_GACHA_GOLDENHERO_LUCKLIST)
end

function GachaGoldenHeroData:_s2cGachaRechargeReward(id, message)
    if rawget(message, "awards") then
        G_Prompt:showAwards(message.awards)
        G_SignalManager:dispatch(SignalConst.EVENT_GACHA_GOLDENHERO_UPDATEITEM)
    end
end

-- @Role    Flush Gacha
function GachaGoldenHeroData:_s2cFlushGacha(id, message)
    self:setStart_time(rawget(message, "start_time") or 0)
    self:setEnd_time(rawget(message, "end_time") or 0)
    self:setShow_time(rawget(message, "show_end_time") or 0)

    if G_ServerTime:getTime() >= self:getStart_time() and G_ServerTime:getTime() <= self:getShow_time() then
        G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GACHA_GOLDENHERO)
        G_ServiceManager:registerOneAlarmClock("gachaend", message.show_end_time + 1, function()
            G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GACHA_GOLDENHERO)
        end)
    elseif G_ServerTime:getLeftSeconds(self:getStart_time()) > 0 then
        G_ServiceManager:registerOneAlarmClock("gachastart", message.start_time + 1, function()
            G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GACHA_GOLDENHERO)
        end)
    end
end

--------------------------------------------------------------------------------------
-- Part3:    
-- @Role     RankConfig
function GachaGoldenHeroData:getGoldenHeroRankCfg()
    return self._goldenRankCfg
end

-- @Role     GroupConfig
function GachaGoldenHeroData:getGoldHeroGroupId()
    return self._goldenHeroGroup
end

function GachaGoldenHeroData:getGoldHeroGroupIdByCountry(country)
    return self._goldenHeroZhenyinGroup[country] or {}
end

-- @Role     JoyDrawConfig
function GachaGoldenHeroData:getGoldenJoyDraw()
    return self._goldenJoyDraw
end

-- @Role      PrizeList
function GachaGoldenHeroData:getPrizeLists( ... )
    return self._prizeLists
end

-- @Role      OwnRank
function GachaGoldenHeroData:getOwnRankData( ... )
    return self._ownRank
end

--------------------------------------------------------------------------------------
-- @Role      Get GoldenHeroRank Config
function GachaGoldenHeroData:_initGoldenHeroRank()
    self._goldenRankCfg = {}
    local paramConfig = require("app.config.goldenhero_rank")
    for i = 1, paramConfig.length() do
        local data = paramConfig.indexOf(i)
        if not self._goldenRankCfg[data.rank_type] then
            self._goldenRankCfg[data.rank_type] = {}
        end
        table.insert(self._goldenRankCfg[data.rank_type], data)
    end
end

-- @Role      Get GoldenHeroGroup Config
function GachaGoldenHeroData:_initGroupHeroId()
    self._goldenHeroGroup = {}
    self._goldenHeroZhenyinGroup = {}
    local heroIds = {}
    local paramConfig = require("app.config.goldenhero_recruit")
    local heroConfig = require("app.config.hero")
    for i = 1, paramConfig.length() do
        local data = paramConfig.indexOf(i)
        local newHeroId = data.hero
        local heroConfigInfo = heroConfig.get(newHeroId)
        
        for k,v in pairs(self._goldenHeroGroup) do
            if rawequal(v, data.hero) then
                newHeroId = 0
            end
        end
        if newHeroId and not rawequal(newHeroId, 0) then
            table.insert(self._goldenHeroGroup, newHeroId)

            if heroConfigInfo then
                local country = heroConfigInfo.country
                self._goldenHeroZhenyinGroup[country] = self._goldenHeroZhenyinGroup[country] or {}
                table.insert(self._goldenHeroZhenyinGroup[country], newHeroId)
            end
        end
    end
end

-- @Role      Get GoldenDraw Config
function GachaGoldenHeroData:_initGoldenJoyDraw()
    self._goldenJoyDraw = {}
    local joyIndex = 0
    local paramConfig = require("app.config.goldenhero_draw")
    for i = 1, paramConfig.length() do
        local data = paramConfig.indexOf(i)
        if data.time == 0 then
            joyIndex = (joyIndex + 1)
            self._goldenJoyDraw[joyIndex] = {}
        end
        table.insert(self._goldenJoyDraw[joyIndex], data)
    end
end



return GachaGoldenHeroData