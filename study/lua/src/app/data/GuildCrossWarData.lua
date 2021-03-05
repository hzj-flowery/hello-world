-- Author: panhoa
-- Date:
-- Describle
local BaseData = require("app.data.BaseData")
local GuildCrossWarData = class("GuildCrossWarData", BaseData)
local GuildCrossWarUserUnitData = require("app.data.GuildCrossWarUserUnitData")
local GuildCrossWarBossUnitData = require("app.data.GuildCrossWarBossUnitData")
local GuildCrossWarCityUnitData = require("app.data.GuildCrossWarCityUnitData")
local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")
local GuildCrossWarConst = require("app.const.GuildCrossWarConst")


local schema = {}
GuildCrossWarData.schema = schema
schema["cityMap"]   = {"table", {}}     -- 城池表
schema["userMap"]   = {"table", {}}     -- 玩家表
schema["bossMap"]   = {"table", {}}     -- Boss表


function GuildCrossWarData:ctor(properties)
    GuildCrossWarData.super.ctor(self, properties)
    self._oriPoinId = 0     -- 原始据点
    self._isPopSmall= false
    self._warKeyMap = {}    -- 跨服据点
    self._observerData= {}  -- 观战角色
    self._warHoleList = {}  -- 所有格子
    self._selfAroundUid = {}-- 周围现存

    self:_initWarPointCfg()
    self:_initWarMapCfg()
    self:_initWarHoleList()

    self._msgGuildCrossWarEnter       = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsEntry, handler(self, self._s2cGuildCrossWarEnter))               -- 入口
    self._msgBrawlguilds              = G_NetworkManager:add(MessageIDConst.ID_S2C_GetBrawlguilds, handler(self, self._s2cBrawlguilds))                        -- Flush
    self._msgGuildCrossUpdatePlayer   = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsUpdatePlayer, handler(self, self._s2cGuildCrossUpdatePlayer))    -- 服务器推送玩家移动
    self._msgGuildCrossUpdateKeyPoint = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsUpdateKeyPoint, handler(self, self._s2cGuildCrossUpdateKeyPoint))-- 服务器推送玩家移动
    self._msgGuildCrossMove           = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsMove, handler(self, self._s2cGuildCrossMove))                    -- 回收移动信息
    self._msgGuildCrossFight          = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsFight, handler(self, self._s2cBrawlGuildsFight))                 -- 战斗
    self._msgGuildCrossFightNotice    = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsFightNotice, handler(self, self._s2cBrawlGuildsFightNotice))     -- 据点其他玩家打Boss推送
    self._msgGuildCrossLadder         = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsLadder, handler(self, self._s2cBrawlGuildsLadder))               -- 军团成员排行
    self._msgGuildsObserve            = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsObserve, handler(self, self._s2cBrawlGuildsObserve))             -- 观战
    self._msgGuildsObserverList       = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsUpdateObserverList, handler(self, self._s2cUpdateObserverList))  -- 刷新观战列表
    self._msgGuildsStation            = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsStation, handler(self, self._s2cBrawlGuildsStation))             -- 驻扎
    self._msgGuildsExit               = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsExit, handler(self, self._s2cBrawlGuildsExit))                   -- 退出
    self._signalAllDataReady          = G_SignalManager:add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(self, self._onAllDataReady))                            -- 断线重连
    self._msgGuildsMap                = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsMap, handler(self, self._s2cBrawlGuildsMap))                     -- 刷新小地图据点
    self._msgGuildsChamption          = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsPushChampion, handler(self, self._s2cBrawlGuildsPushChampion))   -- 冠军成员展示    
end

function GuildCrossWarData:clear()
    self._msgGuildCrossWarEnter:remove()
    self._msgGuildCrossWarEnter = nil
    self._msgBrawlguilds:remove()
    self._msgBrawlguilds = nil
    self._msgGuildCrossUpdatePlayer:remove()
    self._msgGuildCrossUpdatePlayer = nil
    self._msgGuildCrossUpdateKeyPoint:remove()
    self._msgGuildCrossUpdateKeyPoint = nil
    self._msgGuildCrossMove:remove()
    self._msgGuildCrossMove = nil
    self._msgGuildCrossFight:remove()
    self._msgGuildCrossFight = nil
    self._msgGuildCrossFightNotice:remove()
    self._msgGuildCrossFightNotice = nil
    self._msgGuildCrossLadder:remove()
    self._msgGuildCrossLadder = nil
    self._signalAllDataReady:remove()
    self._signalAllDataReady = nil
    self._msgGuildsObserve:remove()
    self._msgGuildsObserve = nil
    self._msgGuildsStation:remove()
    self._msgGuildsStation = nil
    self._msgGuildsExit:remove()
    self._msgGuildsExit  = nil
    self._msgGuildsObserverList:remove()
    self._msgGuildsObserverList = nil
    self._msgGuildsMap:remove()
    self._msgGuildsMap = nil
    self._msgGuildsChamption :remove()
    self._msgGuildsChamption = nil
end

--============================================================
-- 网络消息
-- @Role    GuildCross Flush
function GuildCrossWarData:_s2cBrawlguilds(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end
   
    local region = GuildCrossWarHelper.getCurActStage()
    if region.stage == 5 then
        G_ServiceManager:registerOneAlarmClock(
            "GuildCrossWarMain1",
            region.endTime + 1,
            function()
                G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GUILD_WAR)
            end
        )
    elseif region.stage == 4 then
        G_ServiceManager:registerOneAlarmClock(
            "GuildCrossWarMain2",
            region.endTime + 1,
            function()
                G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GUILD_WAR)
            end
        )
    end
end

-- @Role    跨服军团入口
function GuildCrossWarData:c2sBrawlGuildsEntry()
    G_NetworkManager:send(MessageIDConst.ID_C2S_BrawlGuildsEntry, {})
end

-- @Role    入口消息
function GuildCrossWarData:_s2cGuildCrossWarEnter(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end

    self._isPopSmall = false
    self:_updateKeyPoint(message)
    self:_updateUsers(message, GuildCrossWarConst.SELF_ENTER)
    self._oriPoinId = rawget(message, "init_key_point_id") or 0
    G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_ENTRY)
end

-- @Role    移动同步信息
-- @Param   key_point_id 移动点
function GuildCrossWarData:c2sBrawlGuildsMove(to, needTime)
    G_NetworkManager:send(MessageIDConst.ID_C2S_BrawlGuildsMove, {to = to, need_time = needTime})
end

-- @Role    移动同步信息自己
function GuildCrossWarData:_s2cGuildCrossMove(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end

    if rawget(message, "to") == nil then
        return
    end

    self:_updateUsers(message)
    self:_updateKeyPoint(message)
    self:_updateSelfUnit(message, GuildCrossWarConst.SELF_MOVE)
    G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_SELFMOVE, message.need_time)
end

-- @Role    战斗
-- @Param   target_type 攻击目标(0/pve  1/pvp)
-- @Param   target      玩家id, 非玩家传据点id
function GuildCrossWarData:c2sBrawlGuildsFight(target, targetId)
    local state, __ = GuildCrossWarHelper.getCurCrossWarStage()
    if rawequal(target, 0) and state == GuildCrossWarConst.ACTIVITY_STAGE_1 then
        return
    end
    G_NetworkManager:send(MessageIDConst.ID_C2S_BrawlGuildsFight, {target_type = target, target_id = targetId})
end

-- @Role    战斗返回信息
function GuildCrossWarData:_s2cBrawlGuildsFight(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end

    local selfUnit = self:getSelfUnit()
    if selfUnit ~= nil then
        local curBossUnit = self:getBossUnitById(selfUnit:getCurPointId())
        if rawget(message, "fight_cd") ~= nil then
            selfUnit:setFight_cd(rawget(message, "fight_cd"))
        end
        if not rawget(message, "fight_type") then   -- 1. Boss
            if curBossUnit and rawget(message, "hurt") then
                local hp = (curBossUnit:getHp() - message.hurt)
                local curHp = hp > 0 and hp or 0
                curBossUnit:setHp(curHp)
            end
            G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_FIGHT, message)
            
        else                                        -- 2. 玩家
            self:_updateKeyPoint(message)
            self:_updateUsers(message)
            self:_updateSelfUnit(message, GuildCrossWarConst.SELF_FIGHT)

            if rawget(message, "players") ~= nil then       ---- 2.1 玩家：被搞死
                selfUnit:setHp(0)
            elseif rawget(message, "own_hp") ~= nil then    ---- 2.2 玩家：受伤
                local selfHp = (selfUnit:getHp() - message.own_hp)
                selfUnit:setHp(selfHp > 0 and selfHp or 0)
            end

            if rawget(message, "key_points") ~= nil and rawget(message, "players") ~= nil then
                G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_SELFDIE, message)
            else
                
                local isAttacker = rawget(message, "is_attacker")
                local isKill = rawget(message, "is_kill")
                -- Warring
                if isAttacker then
                    G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_WARRING, message)
                end

                -- Tips
                if isAttacker and isKill == true then
                    G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_OTHERDIE, message)
                elseif not isAttacker and isKill then
                    G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_OTHERDIE, message)
                else
                    G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_FIGHT, message)
                end 
            end
        end
    end
end

function GuildCrossWarData:_handlePlayers(message)
    -- body
    if rawget(message, "is_main_view_ober") then    -- 1. Observer
        self:_updateKeyPoint(message)
        self:_updateUsers(message)
        self:_createPlayers(message, stage)
        G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_UPDATEPLAYER, message)
    else                                            -- 2. Join
        local player = rawget(message, "player")
        if player == nil or rawget(player, "uid") == nil then
            return
        end
        if rawget(message, "action") == nil then
            return
        end

        self:_updateUsers(message)
        G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_UPDATEPLAYER, message)
    end
end

-- @Role    推送更新玩家移动
function GuildCrossWarData:_s2cGuildCrossUpdatePlayer(id, message)
    local data = rawget(message, "players") or {}
    for k,value in pairs(data) do
        self:_handlePlayers(value)
    end
end

-- @Role    推送更新据点
function GuildCrossWarData:_s2cGuildCrossUpdateKeyPoint(id, message)
    self:_updateKeyPoint(message)
    G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_UPDATEPOINT, rawget(message, "action"))
end

-- @Role    推送其他玩家打Boss
function GuildCrossWarData:_s2cBrawlGuildsFightNotice(id, message)
    if rawget(message, "key_point_id") == nil then
        return
    end

    local curBossUnit = self:getBossUnitById(message.key_point_id)
    if curBossUnit and rawget(message, "hurt") then
        curBossUnit:setHp(curBossUnit:getHp() - message.hurt)
    end
    G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_OTHER_SEE_BOSSS, message)
end

-- @Role    本军团排行榜（0/军团，1/个人）
function GuildCrossWarData:c2sBrawlGuildsLadder(type)
    G_NetworkManager:send(MessageIDConst.ID_C2S_BrawlGuildsLadder, {ladder_type = type})
end

-- @Role    本军团排行榜
function GuildCrossWarData:_s2cBrawlGuildsLadder(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end
    G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_LADDER, message)
end

-- @Role    清缓存
function GuildCrossWarData:_clearData( ... )
    self:setCityMap({})
    self:setUserMap({})
    self:setBossMap({})
end

-- @Role    断线重连
function GuildCrossWarData:_onAllDataReady()
    local bInGuild, bJoin = false, false
    local FunctionConst = require("app.const.FunctionConst")
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_CROSS_WAR)
    local _, bOpenToday = GuildCrossWarHelper.isTodayOpen()
    if isOpen and bOpenToday then
        local state, __ = GuildCrossWarHelper.getCurCrossWarStage()
        if state ~= GuildCrossWarConst.ACTIVITY_STAGE_3 then
            bInGuild, bJoin = GuildCrossWarHelper.isGuildCrossWarEntry()
        end
    end

    if G_UserData:isFlush() and bInGuild then
        self:_clearData()
        if bJoin then
            self:c2sBrawlGuildsEntry()
        else
            self._observerData = {}
            self:c2sBrawlGuildsObserve()
        end
    end
end

-- @Role    Require Exit Act
function GuildCrossWarData:c2sBrawlGuildsExit()
    G_NetworkManager:send(MessageIDConst.ID_C2S_BrawlGuildsExit, {})
end

-- @Role    Response Exit
function GuildCrossWarData:_s2cBrawlGuildsExit(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end

    self:_clearData()
    self._observerData = {}
end

-- @Role    Require Guild map
function GuildCrossWarData:c2sBrawlGuildsMap()
    G_NetworkManager:send(MessageIDConst.ID_C2S_BrawlGuildsMap, {})
end

-- @Role    Response Guild map
function GuildCrossWarData:_s2cBrawlGuildsMap(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end

    if rawget(message, "status") then
        self:_updateKeyPoint(message, true)
    else
        self:_clearData()
        self._isPopSmall = true
        self:_updateKeyPoint(message)
        G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_INSPIRE)
    end
end
-------------------------------------------------------------
--          Observe Protocol
-- @Role    Observe Require
-- @param   uId (默认0, 选择传Uid)
function GuildCrossWarData:c2sBrawlGuildsObserve(uId)
    uId = uId or 0
    G_NetworkManager:send(MessageIDConst.ID_C2S_BrawlGuildsObserve, {main_view_player_id = uId})
end

-- @Role    Observe Response
function GuildCrossWarData:_s2cBrawlGuildsObserve(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end

    self._observerData = {
        observerId = rawget(message, "main_view_player_id") or 0,
        observerList = rawget(message, "lists") or self._observerData["observerList"],
    }

    self._oriPoinId = 0
    self._isPopSmall = false
    self:_updateKeyPoint(message)
    self:_updateUsers(message, GuildCrossWarConst.SELF_ENTER)
    G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_OBSERVE, {exchangeRole = true, updateList = true})
end

-- @Role    Update Observer's List
function GuildCrossWarData:_s2cUpdateObserverList(id, message)
    if not rawget(message, "lists") then
        return
    end

    if not self._observerData["observerList"] then
        self._observerData["observerList"] = {}
    end
    table.insert(self._observerData["observerList"], rawget(message, "lists"))
    G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_OBSERVE, {exchangeRole = false, updateList = true})
end

-----------------------------------------------------------------
--          Guess  Protocol
-- @Role    InspireList Require
-- @param   
function GuildCrossWarData:c2sBrawlPsnlInspInfo( ... )
    G_NetworkManager:send(MessageIDConst.ID_C2S_BrawlGuildsPsnlInspInfo, {})
end

-- @Role    Inspire Require
-- @param   insp_type = 1; // 0- 攻击 1 - 防守
function GuildCrossWarData:c2sBrawlPsnlInsp(inspType)
    G_NetworkManager:send(MessageIDConst.ID_C2S_BrawlGuildsPsnlInsp, {insp_type = inspType})
end

-- @Role    Support Require
function GuildCrossWarData:c2sBrawlGuildInspInfo()
    G_NetworkManager:send(MessageIDConst.ID_C2S_BrawlGuildsGuildInspInfo, {})
end

-- @Role    Support Require
function GuildCrossWarData:c2sBrawlGuildsGuildInsp(guildId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_BrawlGuildsGuildInsp, {guild_id = guildId})
end

-----------------------------------------------------------------
--          Cantonment  Protocol
-- @Role    Cantonment Require
-- @param 
function GuildCrossWarData:c2sBrawlGuildsStation(key_point_id)
    G_NetworkManager:send(MessageIDConst.ID_C2S_BrawlGuildsStation, {key_point_id = key_point_id})
end

-- @Role    Cantonment
function GuildCrossWarData:_s2cBrawlGuildsStation(id, message)
    -- body
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end

    G_Prompt:showTip(Lang.get("guild_cross_war_campsuccess"))
end
--------------------------------------------------------------
--          Champion  Protocol
-- @Role    Champion  Require
function GuildCrossWarData:c2sBrawlGuildsPushChampion( ... )
    G_NetworkManager:send(MessageIDConst.ID_C2S_BrawlGuildsPushChampion, {})
end

-- @Role    Champion
function GuildCrossWarData:_s2cBrawlGuildsPushChampion(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end

    local champtions = rawget(message, "players") or {}
    if table.nums(champtions) <= 0 then
        return
    end

    self:_clearData()
    G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_CHAMPTION, message)
end
--------------------------------------------------------------
-- @Role    Update Players
function GuildCrossWarData:_updateUsers(message, stage)
    if self:_createPlayer(message) then --1. Update
        return
    end
    self:_createPlayers(message, stage) --2. Entry/Move/Fight
end

-- @Role    Check CreateUser
function GuildCrossWarData:_checkCreateUserUnit(data)
    local userMap = self:getUserMap()
    if userMap[data.uid] == nil then
        userMap[data.uid] = GuildCrossWarUserUnitData.new()
    end

    userMap[data.uid]:updateData(data)
    return data.uid, userMap[data.uid]
end

-- @Role    Create Player
function GuildCrossWarData:_createPlayer(message)
    local player = rawget(message, "player")
    if player ~= nil then
        local key, unit = self:_checkCreateUserUnit(player)
        if rawget(message, "action") ~= nil then unit:setAction(message.action) end
        if rawget(message, "move_end_time") ~= nil then unit:setMove_end_time(message.move_end_time) end
        if rawget(message, "need_time") ~= nil then
            local endTime = (G_ServerTime:getTime() + message.need_time/1000)
            unit:setMove_end_time(endTime)
        end
        if rawget(message, "revive_time") ~= nil then
            unit:setRevive_time(message.revive_time)
        end
        if rawget(message, "from") ~= nil then
            unit:setFrom_pos(message.from)
        end
        if rawget(message, "to") ~= nil then
            unit:setTo_pos(message.to)
        end

        if not self._selfAroundUid[unit:getUid()] then
            self._selfAroundUid[unit:getUid()] = unit:getUid()
        end
        return true
    end
    return false
end

-- @Role    Create Players
function GuildCrossWarData:_createPlayers(message, state)
    local players = rawget(message, "players")
    if players ~= nil then
        self._selfAroundUid = {}
        for k,v in pairs(players) do
            v.index = tonumber(k)
            if not GuildCrossWarHelper.isSelf(v.uid) or rawequal(state, GuildCrossWarConst.SELF_ENTER) then
                if not self._selfAroundUid[v.uid] then
                    self._selfAroundUid[v.uid] = v.uid
                end
                self:_checkCreateUserUnit(v)
            end
        end
    end
end

-- @Role    更新self数据
function GuildCrossWarData:_updateSelfUnit(data, state)
    local unit = self:getSelfUnit()
    if unit == nil then
        return
    end
    
    if rawequal(state, GuildCrossWarConst.SELF_MOVE) then           -- 1. Self Move
        if rawget(data, "move_cd") ~= nil then
            local cdTime = (data.move_cd)
            unit:setMove_cd(cdTime)
        end
        if rawget(data, "need_time") ~= nil then
            unit:setNeed_time(rawget(data, "need_time")/1000)
            unit:setMove_end_time((G_ServerTime:getTime() + data.need_time/1000))
        end
        if rawget(data, "to") ~= nil then
            local tempToPos = unit:getTo_pos()
            unit:setFrom_pos(tempToPos)
            unit:setTo_pos(rawget(data, "to"))
        end

    elseif rawequal(state, GuildCrossWarConst.SELF_FIGHT) then      -- 2. Self Fight
        if rawget(data, "revive_time")   ~= nil then
            unit:setRevive_time(rawget(data, "revive_time"))
        end    
        if rawget(data, "fight_cd") ~= nil then
            unit:setFight_cd(rawget(data, "fight_cd"))
        end
        if rawget(data, "key_points") ~= nil and rawget(data, "players") ~= nil then
            for k,v in pairs(data.players) do
                if GuildCrossWarHelper.isSelf(v.uid) then
                    local tempToPos = unit:getTo_pos()
                    unit:setFrom_pos(tempToPos)
                    unit:setTo_pos({key_point_id = v.key_point_id, pos = v.pos})
                    break
                end
            end
        end
    end
    return unit
end

-- @Role    Updata KeyPoint
function GuildCrossWarData:_updateKeyPoint(message, isUpdateInspire)
    -- Create   City
    local function createCityUnit(data)
        local cityUnit = GuildCrossWarCityUnitData.new()
        cityUnit:updateData(data)
        return cityUnit
    end

    -- Create  Boss
    local function createBossUnit(data)
        local bossUnit = GuildCrossWarBossUnitData.new()
        bossUnit:updateData(data)
        return bossUnit
    end

    local keyPoint = {}
    if rawget(message, "key_point") then
        table.insert(keyPoint, message.key_point)
    elseif rawget(message, "key_points") then
        keyPoint = message.key_points
    end

    for key, value in pairs(keyPoint) do
        -- Create Point
        if rawget(value, "key_point_id") then
            local unitData = {
                key_point_id = rawget(value, "key_point_id"),
                guild_id     = rawget(value, "guild_id"),
                guild_name   = rawget(value, "guild_name"),
                guild_level  = rawget(value, "guild_level"),
                sid          = rawget(value, "sid"),
                sname        = rawget(value, "sname"),
                hp           = rawget(value, "hp"),
                max_hp       = rawget(value, "max_hp"),
                attack_lists = rawget(value, "attack_lists"),
                action       = rawget(value, "action")
            }
    
            local cityMap = self:getCityMap()
            cityMap[value.key_point_id] = createCityUnit(unitData)
        end

        -- Create Boss
        if not isUpdateInspire then
            local bExist, bossCfg = GuildCrossWarHelper.isExistBossInPoint(value.key_point_id)
            local isKill = rawget(value, "is_kill")

            if bExist and isKill ~= nil then
                local bossMap = self:getBossMap()
                if isKill then
                    if bossMap[value.key_point_id] then
                        bossMap[value.key_point_id]:setIs_kill(true)
                    end
                else
                    local bossData = {
                        id      = rawget(value, "key_point_id"),
                        hp      = rawget(value, "hp"),
                        max_hp  = rawget(value, "max_hp"),
                        is_kill = rawget(value, "is_kill"),
                        config  = bossCfg,
                        guild_name = rawget(value, "guild_name"),
                    } 
                    bossMap[value.key_point_id] = createBossUnit(bossData)
                end
            end
        end
    end
end

-- @Role    Get PointData
function GuildCrossWarData:getCityDataById(pointId)
    -- body
    if pointId == nil or type(pointId) ~= "number" then
        return nil
    end

    local cityMap = self:getCityMap()
    if type(cityMap) ~= "table" or next(cityMap) == nil then
        return nil
    end

    if cityMap[pointId] == nil then
        return nil
    end
    return cityMap[pointId]
end

-- @Role    Get Data
function GuildCrossWarData:getBossUnitById(pointId)
    -- body
    if pointId == nil or type(pointId) ~= "number" then
        return nil
    end

    local bossUnitMap = self:getBossMap()
    if type(bossUnitMap) ~= "table" or next(bossUnitMap) == nil then
        return nil
    end

    if bossUnitMap[pointId] == nil then
        return nil
    end
    return bossUnitMap[pointId]
end

-- @Role    
function GuildCrossWarData:setBossUnitById(pointId)
    local bossMap = self:getBossMap()
    bossMap[pointId] = nil
end

--============================================================
-- @Role    获取据点信息
function GuildCrossWarData:getWarKeyMap()
    return self._warKeyMap
end

-- @Role    获取坑位消息
function GuildCrossWarData:getWarPointMap()
    return self._warPointMap
end

function GuildCrossWarData:getWarHolegMap()
    return self._warHoleMap
end

-- @Role   所有格子
function GuildCrossWarData:getWarHoleList()
    return self._warHoleList
end

function GuildCrossWarData:getAroundUids( ... )
    -- body
    return self._selfAroundUid
end

-- @Role    Get  Self Ori'sPoint
function GuildCrossWarData:getSelfOriPoint()
    return self._oriPoinId
end

-- @Role   弹初始据点展示窗口（1、2阶段）
function GuildCrossWarData:isPopSmall( ... )
    local region =  GuildCrossWarHelper.getCurActStage()
    return self._isPopSmall and region.stage <= 2
end

-- @Role    观战角色Id
function GuildCrossWarData:getObserverId()
    local observerId = self._observerData["observerId"] or 0
    return observerId
end

-- @Role    观战角色列表
function GuildCrossWarData:getObserverList()
    local observerList = self._observerData["observerList"] or {}
    return observerList
end

-- @Role    观战军团Id
function GuildCrossWarData:setObserverGuildId(id)
    id = id or 0
    self._observerData["observerGuildId"] = id 
end

-- @Role    观战军团Id
function GuildCrossWarData:getObserverGuildId()
    local observerGuildId = self._observerData["observerGuildId"] or 0
    return observerGuildId
end
--------------------------------------------------------------

function GuildCrossWarData:reset()
end

function GuildCrossWarData:_stringToNumber(strList)
    local moveStrList = string.split(strList, "|")
    local retList = {}
    for i, value in ipairs(moveStrList) do
        table.insert(retList, tonumber(value))
    end
    return retList
end

-- @Role    Get Point's Cfg
function GuildCrossWarData:_initWarPointCfg()
    -- body
    local function makeClickRect(cfg)
        local pointKey = cc.p(cfg["map_x"], cfg["map_y"])
        local rangeX = cfg.range_x
        local rangeY = cfg.range_y
        local clickRect = cc.rect(pointKey.x - rangeX * 0.5, pointKey.y - rangeY * 0.5, rangeX, rangeY)
        return clickRect
    end
    local guild_cross_war = require("app.config.guild_cross_war")
    for i = 1, guild_cross_war.length() do
        local indexData = guild_cross_war.indexOf(i)
        local keyData = {
            cfg = indexData,
            keyList = self:_stringToNumber(indexData.move), -- 可到达的据点
            clickRect = makeClickRect(indexData),           -- 据点可点击区域
            cityPicture = indexData.city_pic                -- 有城池的据点
        }
        self._warKeyMap[indexData.id] = keyData
    end
end

-- @Role    Init Gide     
function GuildCrossWarData:_initWarHoleList()
    -- body
    local function makeClickRect(cfg)
        local pointKeyX = ((cfg.axis_x - 1) * GuildCrossWarConst.GRID_SIZE + 5)
        local pointKeyY = ((cfg.axis_y - 1) * GuildCrossWarConst.GRID_SIZE + 5)
        local clickRect = cc.rect(pointKeyX, pointKeyY, GuildCrossWarConst.GRID_SIZE - 5, GuildCrossWarConst.GRID_SIZE - 5)
        return clickRect
    end
    local guild_cross_war = require("app.config.guild_cross_war_map")
    for i = 1, guild_cross_war.length() do
        local indexData = guild_cross_war.indexOf(i)
        local data  ={
            id = indexData.id,
            cfg = indexData,
            clickRect = makeClickRect(indexData),
            isMove = indexData.is_move,
            point = indexData.point_y,
            x = indexData.axis_x,
            y = indexData.axis_y
        }
        self._warHoleList[indexData.id] = data
    end
end

--------------------------------------------------------------------------
-- @Role    War Map Cfg
function GuildCrossWarData:_initWarMapCfg()
    self._warPointMap = {}
    self._warHoleMap  = {}
    local guild_cross_war_map = require("app.config.guild_cross_war_map")
    for i = 1, guild_cross_war_map.length() do
        local indexData = guild_cross_war_map.indexOf(i)
        if indexData.point_y ~= 0 then
            if self._warPointMap[indexData.point_y] == nil then
                self._warPointMap[indexData.point_y] = {}
            end
            self._warPointMap[indexData.point_y][indexData.id] = indexData
        end
        self._warHoleMap[indexData.axis_x .."_" ..indexData.axis_y] = indexData
    end
end

--------------------------------------------------------------------------

-- @Role    GetData according to Map buyId
function GuildCrossWarData:getUnitById(userId)
    local userMap = self:getUserMap()
    local unit = userMap[userId]
    if unit then
        return unit
    end
    return nil
end

--根据某个坐标点，找到路径Key点
function GuildCrossWarData:findPointKey(position)
    for key, value in pairs(self._warKeyMap) do
        if value.clickRect ~= nil then
            if cc.rectContainsPoint(value.clickRect, position) then
                return key
            end
        end
    end
    return nil
end

--获得可点击区域列表（测试用）
function GuildCrossWarData:getClickKeyRectList()
    local retList = {}
    for key, value in pairs(self._warKeyMap) do
        if value.clickRect ~= nil then
            table.insert(retList, value.clickRect)
        end
    end
    return retList
end

-- @Role    Get Self UId
function GuildCrossWarData:getSelfUserId()
    local observerId = self._observerData["observerId"] or 0
    return observerId > 0 and observerId or G_UserData:getBase():getId()
end

-- @Role    Get  Self Unit
function GuildCrossWarData:getSelfUnit()
    local unit = self:getUnitById(self:getSelfUserId())
    if unit then
        return unit
    end
    return nil
end


return GuildCrossWarData
