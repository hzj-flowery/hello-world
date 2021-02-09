--世界boss数据层
local BaseData = require("app.data.BaseData")
local WorldBossData = class("WorldBossData", BaseData)
local DataConst = require("app.const.DataConst")
local TextHelper = require("app.utils.TextHelper")
local schema = {}
schema["boss_id"] = {"number", 0}
schema["start_time"] = {"number", 0}
schema["end_time"] = {"number", 0}
schema["user_point"] = {"number", 0}
schema["challenge_boss_cnt"] = {"number", 0}
schema["challenge_boss_time"] = {"number", 0}
schema["challenge_user_cnt"] = {"number", 0}
schema["challenge_user_time"] = {"number", 0}
schema["bechallenge_cnt"] = {"number", 0}
schema["bechallenge_time"] = {"number", 0}
schema["guild_point"] = {"number", 0}
schema["self_user_rank"] = {"number", 0}
schema["self_guild_rank"] = {"number", 0}
schema["end_notice"] = {"table", {}}
schema["user_rank"] = {"table", {}}
schema["guild_rank"] = {"table", {}}
schema["users"] = {"table", {}}

WorldBossData.schema = schema
---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------
--消息层
--更新奖励信息
function WorldBossData:c2sEnterWorldBoss()
    --做个保护，如果世界boss尚未到开启等级，则不用向服务器发送数据请求
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_WORLD_BOSS)
    if isOpen == false then
        return
    end

    local message = {}
    G_NetworkManager:send(MessageIDConst.ID_C2S_EnterWorldBoss, message)
end

--拉去世界boss排行数据
function WorldBossData:c2sUpdateWorldBossRank(...)
    -- body
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_WORLD_BOSS)
    if isOpen == false then
        return
    end
    local message = {}
    G_NetworkManager:send(MessageIDConst.ID_C2S_UpdateWorldBossRank, message)
end
function WorldBossData:getBossInfo(...)
    -- body
    local bossId = self:getBoss_id()
    if bossId == nil or bossId == 0 then
        assert(false, "can not get boss info")
    end
    local bossInfo = require("app.config.boss_info").get(bossId)
    assert(bossInfo, "boss_info cfg can not find boss by id " .. bossId)
    return bossInfo
end
--[[
    optional uint32 boss_id 	= 2;
	optional uint32 start_time 	= 3;
	optional uint32 user_point  = 4;
	optional uint32 challenge_boss_cnt  = 5;
	optional uint32 challenge_boss_time = 6;
	optional uint32 challenge_user_cnt  = 7;
	optional uint32 challenge_user_time = 8;
	optional uint32 bechallenge_cnt  	= 9;
	optional uint32 bechallenge_time  	= 10;
	optional uint32 guild_point  		= 11;
	optional uint32 self_user_rank  	= 12;
	optional uint32 self_guild_rank  	= 13;
	repeated WorldBossUserRank user_rank =14;
	repeated WorldBossGuildRank guild_rank=15;

message WorldBossUserRank {
    optional uint64 user_id = 1;
	optional uint32 rank 	= 2;
	optional string name 	= 3;
	optional uint32 point 	= 4;
}
message WorldBossGuildRank {
    optional uint64 guild_id = 1;
	optional uint32 rank 	= 2;
	optional string name 	= 3;
	optional uint32 point 	= 4;
	optional uint32 num 	= 5;//参与人数
}
]]
--获取量表提前倒计时
-- function WorldBossData:_getWorldBossParameterCountDownTime()
-- 	local parameter = require("app.config.parameter").get(102)
--     assert(parameter ~= nil, "parameter id = 102 not find")
--     local parameterLeftTime = tonumber(parameter.content)
-- 	return parameterLeftTime or 0
-- end

-- 注册一个小闹钟 世界boss 结束 拉取下一个boss时间 和 提前开启刷新主界面
function WorldBossData:_registerAlarmClock(startTime, endTime)
    --检查boss 是否开启
    if not startTime or not endTime then
        return
    end
    local curTime = G_ServerTime:getTime()

    if curTime <= endTime then
        --世界boss 结束 刷新一下主界面图标
        -- G_ServiceManager:registerOneAlarmClock("WORLD_BOSS_END", endTime + 1, function()
        -- 	G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS)
        -- end)
        --世界boss 结束后 拉取下一次世界boss时间（60 延时 避免误差）
        G_ServiceManager:registerOneAlarmClock(
            "WORLD_BOSS_GET_NEXT",
            endTime + 1,
            function()
                local FunctionCheck = require("app.utils.logic.FunctionCheck")
                local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_WORLD_BOSS)
                if isOpen then
                    self:c2sEnterWorldBoss()
                end
            end
        )
    end

    -- local parameterLeftTime = self:_getWorldBossParameterCountDownTime()

    -- if curTime <= startTime - parameterLeftTime then
    -- 	G_ServiceManager:registerOneAlarmClock("WORLD_BOSS_WILL_START", startTime - parameterLeftTime, function()
    -- 		G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS)
    -- 	end)
    -- end
end

function WorldBossData:_updateWorldBossRank(message)
    -- body
    self:setUser_point(message.user_point)
    self:setGuild_point(message.guild_point)
    self:setSelf_user_rank(message.self_user_rank)
    self:setSelf_guild_rank(message.self_guild_rank)

    local function convertUserRank(message)
        local rankList = {}
        local userRankList = rawget(message, "user_rank") or {}
        for i, value in ipairs(userRankList) do
            local temp = {}
            temp.userId = value.user_id
            temp.rank = value.rank
            temp.name = value.name
            temp.point = value.point
            temp.official = value.office_level
            table.insert(rankList, temp)
        end

        table.sort(
            rankList,
            function(sort1, sort2)
                return sort1.rank < sort2.rank
            end
        )
        return rankList
    end

    local function convertGuildRank(message)
        local rankList = {}
        local guildRankList = rawget(message, "guild_rank") or {}
        for i, value in ipairs(guildRankList) do
            local temp = {}
            temp.guildId = value.guild_id
            temp.rank = value.rank
            temp.name = value.name
            temp.point = value.point
            temp.num = value.num
            table.insert(rankList, temp)
        end

        table.sort(
            rankList,
            function(sort1, sort2)
                return sort1.rank < sort2.rank
            end
        )
        return rankList
    end

    self:setUser_rank(convertUserRank(message))
    self:setGuild_rank(convertGuildRank(message))
end
function WorldBossData:_s2cEnterWorldBoss(id, message)
    if message.ret ~= 1 then
        return
    end

    self:setBoss_id(message.boss_id)
    self:setStart_time(message.start_time)
    self:setEnd_time(message.end_time)
    --注册一个小闹钟 在boss结束后拉取下一个boss的时间
    self:_registerAlarmClock(message.start_time, message.end_time)

    self:setChallenge_boss_cnt(message.challenge_boss_cnt)
    self:setChallenge_boss_time(message.challenge_boss_time)
    self:setChallenge_user_cnt(message.challenge_user_cnt)
    self:setChallenge_user_time(message.challenge_user_time)
    self:setBechallenge_cnt(message.bechallenge_cnt)
    self:setBechallenge_time(message.bechallenge_time)

    self:_updateWorldBossRank(message)

    local endNotice = {}
    local function converEndNotice(message)
        local noticeList = {}
        local endNotice = rawget(message, "end_notice") or {}
        local endNoticeList = rawget(endNotice, "sys_notice") or {}
        for i, value in ipairs(endNoticeList) do
            noticeList[value.key] = value.value
        end
        return noticeList
    end
    self:setEnd_notice(converEndNotice(message))

    local showUsers = {}
    local function convertUsers(message)
        local userList = {}
        local serverList = rawget(message, "users") or {}

        for i, value in ipairs(serverList) do
            local converId, playerInfo = require("app.utils.UserDataHelper").convertAvatarId(value)

            local data = {}
            data.userId = value.user_id
            data.name = value.name
            data.officialLevel = value.officer_level
            data.baseId = converId
            data.playerInfo = playerInfo 
            data.index = i
            data.titleId = value.title
            table.insert(userList, data)
        end
        return userList
    end
    self:setUsers(convertUsers(message))
    G_SignalManager:dispatch(SignalConst.EVENT_WORLDBOSS_GET_INFO, message)
end

function WorldBossData:getEndNoticeValue(key)
    -- body
    local noticeTable = self:getEnd_notice()
    dump(noticeTable)
    if noticeTable then
        return tonumber(noticeTable[key])
    end
    return nil
end

function WorldBossData:c2sAttackWorldBoss()
    local message = {}
    G_NetworkManager:send(MessageIDConst.ID_C2S_AttackWorldBoss, message)
end

function WorldBossData:_s2cAttackWorldBoss(id, message)
    if message.ret ~= 1 then
        return
    end

    G_SignalManager:dispatch(SignalConst.EVENT_WORLDBOSS_ATTACK_BOSS, message)
end

function WorldBossData:_s2cWorldBossNotice(id, message)
    local snType = message.sn_type
    local noticePairs = message.content
    local config = require("app.config.boss_content").get(snType)
    assert(config, string.format("boss_content config can not find id = %d", snType))
    local source = config.text

    local RichTextHelper = require("app.utils.RichTextHelper")

    --客户端指定替换某个关键字的颜色
    local clientPairs =
        RichTextHelper.convertServerNoticePairs(
        noticePairs,
        function(data)
            if data.key == "integral" then
                data.key_type = 2 --品质色
                data.key_value = 1 -- 白色
            end
            return data
        end
    )

    dump(clientPairs)
    local text = RichTextHelper.convertRichTextByNoticePairs(source, clientPairs, 20, Colors.DARK_BG_TWO)

    dump(text)
    local textType = config.text_type
    self._noticeMsg["k" .. textType] = self._noticeMsg["k" .. textType] or {}

    --永远最新的在第后条
    table.insert(self._noticeMsg["k" .. textType], text)
    local tableList = self._noticeMsg["k" .. textType]
    if #tableList > 2 then
        table.remove(self._noticeMsg["k" .. textType], 1)
    end

    --self._noticeMsg["k"..snType] = text

    G_SignalManager:dispatch(SignalConst.EVENT_WORLDBOSS_NOTICE, message)
end

function WorldBossData:getNoticeMsg(type)
    local msgList = self._noticeMsg["k" .. type]
    return msgList or {}
end

function WorldBossData:c2sGetWorldBossGrabList()
    local message = {}
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetWorldBossGrabList, message)
end

function WorldBossData:_s2cGetWorldBossGrabList(id, message)
    if message.ret ~= 1 then
        return
    end

    local function convertAvatarId(temp)
        -- body
        for i, value in ipairs(temp.heroList) do
            temp.heroList[i] = {value, 0}
            if value > 0 and value < 100 and temp.avatarId > 0 then
                local baseId, limit = require("app.utils.UserDataHelper").convertToBaseIdByAvatarBaseId(temp.avatarId)
                temp.heroList[i] = {baseId, limit}
            end
        end
        return temp
    end

    local function convertGrabList(message)
        local rankList = {}
        local grabList = rawget(message, "list") or {}
        for i, value in ipairs(grabList) do
            local temp = {}
            --rank > 0 则参与显示
            if value.rank > 0 then
                temp.userId = value.user_id
                temp.rank = value.rank
                temp.name = value.name
                temp.point = value.point
                temp.official = value.office_level
                temp.heroList = rawget(value, "hero_base_id") or {}
                temp.guildName = rawget(value, "guild_name") or ""
                temp.avatarId = rawget(value, "avatar_base_id") or 0
                temp = convertAvatarId(temp)

                table.insert(rankList, temp)
            end
        end

        table.sort(
            rankList,
            function(sort1, sort2)
                return sort1.rank < sort2.rank
            end
        )
        return rankList
    end

    local grabList = convertGrabList(message)

    G_SignalManager:dispatch(SignalConst.EVENT_WORLDBOSS_GET_GRAB_LIST, grabList)
end

function WorldBossData:c2sGrabWorldBossPoint(userId)
    local message = {
        user_id = userId
    }
    G_NetworkManager:send(MessageIDConst.ID_C2S_GrabWorldBossPoint, message)
end

function WorldBossData:_s2cGrabWorldBossPoint(id, message)
    if message.ret ~= 1 then
        return
    end

    G_SignalManager:dispatch(SignalConst.EVENT_WORLDBOSS_GET_GRAB_POINT, message)
end

--[[
    required uint32 ret 		= 1;
	optional uint32 user_point  = 2;
	optional uint32 guild_point  		= 3;
	optional uint32 self_user_rank  	= 4;
	optional uint32 self_guild_rank  	= 5;
	repeated WorldBossUserRank user_rank =6;
	repeated WorldBossGuildRank guild_rank=7;
]]
function WorldBossData:_s2cUpdateWorldBossRank(id, message)
    -- body
    if message.ret ~= 1 then
        return
    end

    self:_updateWorldBossRank(message)

    G_SignalManager:dispatch(SignalConst.EVENT_WORLDBOSS_UPDATE_RANK, message)
end

--仅仅用于初始主界面boss入口Icon是否显示，刚进游戏推送
function WorldBossData:_s2cGetWorldBossInfo(id, message)
    if message.ret ~= 1 then
        return
    end

    self:setBoss_id(message.boss_id)
    self:setStart_time(message.start_time)
    self:setEnd_time(message.end_time)
    --注册一个小闹钟 在boss结束后拉取下一个boss的时间
    self:_registerAlarmClock(message.start_time, message.end_time)
end

---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------
function WorldBossData:ctor(properties)
    WorldBossData.super.ctor(self, properties)

    self._noticeMsg = {}
     --通知数据
    self._msgEnterWorldBoss =
        G_NetworkManager:add(MessageIDConst.ID_S2C_EnterWorldBoss, handler(self, self._s2cEnterWorldBoss))

    self._msgAttackWorldBoss =
        G_NetworkManager:add(MessageIDConst.ID_S2C_AttackWorldBoss, handler(self, self._s2cAttackWorldBoss))

    self._msgGetWorldBossGrabList =
        G_NetworkManager:add(MessageIDConst.ID_S2C_GetWorldBossGrabList, handler(self, self._s2cGetWorldBossGrabList))

    self._msgWorldBossNotice =
        G_NetworkManager:add(MessageIDConst.ID_S2C_WorldBossNotice, handler(self, self._s2cWorldBossNotice))

    self._msgGrabWorldBossPoint =
        G_NetworkManager:add(MessageIDConst.ID_S2C_GrabWorldBossPoint, handler(self, self._s2cGrabWorldBossPoint))

    self._msgGetWorldBossInfo =
        G_NetworkManager:add(MessageIDConst.ID_S2C_GetWorldBossInfo, handler(self, self._s2cGetWorldBossInfo))

    self._msgUpdateWorldBossRank =
        G_NetworkManager:add(MessageIDConst.ID_S2C_SyncWorldBossRank, handler(self, self._s2cUpdateWorldBossRank))
end

-- 清除
function WorldBossData:clear()
    self._msgEnterWorldBoss:remove()
    self._msgEnterWorldBoss = nil

    self._msgAttackWorldBoss:remove()
    self._msgAttackWorldBoss = nil

    self._msgGetWorldBossGrabList:remove()
    self._msgGetWorldBossGrabList = nil

    self._msgWorldBossNotice:remove()
    self._msgWorldBossNotice = nil

    self._msgGrabWorldBossPoint:remove()
    self._msgGrabWorldBossPoint = nil

    self._msgGetWorldBossInfo:remove()
    self._msgGetWorldBossInfo = nil

    self._msgUpdateWorldBossRank:remove()
    self._msgUpdateWorldBossRank = nil
end

--是否boss战开启
function WorldBossData:isBossStart()
    local startTime = self:getStart_time()
    local endTime = self:getEnd_time()

    local currTime = G_ServerTime:getTime()
    if currTime >= startTime and currTime <= endTime then
        return true
    end
    return false, startTime
end

--是否拍卖结束
--军团boss结束时间+拍卖准备时间+拍卖持续时间 =弹框结束时间
function WorldBossData:isAuctionEnd(...)
    -- body
    if self:isBossStart() == false then
        return
    end
    local AuctionConst = require("app.const.AuctionConst")
    local auctionCfg = require("app.config.auction")
    local worldBossAuction = auctionCfg.get(AuctionConst.AC_TYPE_GUILD_ID)
    assert("app.config.auction can't find by id " .. AuctionConst.AC_TYPE_GUILD_ID)
    local endTime = self:getStart_time() + worldBossAuction.auction_open_time + worldBossAuction.auction_continued_time

    --dump(currTime)
    --dump(endTime)
    --dump(self:getEnd_time())
    --logWarn(" WorldBossData:isAuctionEnd")
    --dump( G_ServerTime:getDateAndTime(currTime) )
    --dump( G_ServerTime:getDateAndTime(endTime) )

    local currTime = G_ServerTime:getTime()
    if currTime >= endTime then
        return true
    end

    return false
end

--获取boss 开始倒计时时间 返回nil
-- function WorldBossData:isBeginBossStartCountDown()
-- 	local parameterLeftTime = self:_getWorldBossParameterCountDownTime()
--     local startTime = self:getStart_time()
--     local currTime = G_ServerTime:getTime()
--     local leftTime = startTime - currTime
--     if leftTime > 0 and leftTime <= parameterLeftTime then
--         return true, startTime
--     end

--     return false
-- end

--是否boss战已结束,并尚未弹出过弹框
function WorldBossData:needShopPromptDlg()
    local endTime = self:getEnd_time()
    local currTime = G_ServerTime:getTime()

    local value = G_UserData:getUserConfig():getConfigValue("bossEndTime") or 0
    dump(value)
    local oldEndTime = tonumber(value)
    local isCurrOpen = self:isBossStart()

    --活动未结束不会弹框
    if isCurrOpen == true then
        --存下当前活动时间
        self:_saveCurrTime()
        logWarn(" WorldBossData:needShopPromptDlg is open  ret false")
        return false
    end
    if oldEndTime == 0 then
        self:_saveCurrTime()
        logWarn(" WorldBossData:needShopPromptDlg  oldEndTime = 0 ret true")
        return true
    end
    --老的结束时间小于当前结束时间
    if oldEndTime < endTime then
        --弹出界面，并存下当前时间，下次就不会再弹出界面了
        self:_saveCurrTime()
        logWarn(" WorldBossData:needShopPromptDlg  oldEndTime < endTime ret true")
        return true
    end

    dump(oldEndTime)
    dump(endTime)
    return false
end

function WorldBossData:_saveCurrTime()
    local endTime = self:getEnd_time()
    local value = G_UserData:getUserConfig():getConfigValue("bossEndTime") or 0
    local oldEndTime = tonumber(value)
    --老时间小于当前时间，则更新
    if oldEndTime < endTime then
        G_UserData:getUserConfig():setConfigValue("bossEndTime", endTime)
    end
end

-- 重置
function WorldBossData:reset()
end

return WorldBossData
