local GuildServerAnswerHelper = {}

GuildServerAnswerHelper.TOTAL_TIME = 600 --十分钟

-- 是否今天开启
function GuildServerAnswerHelper.isTodayOpen()
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local retb = false
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_GUILD_SERVER_ANSWER)
    if not isOpen then
        return retb
    end
    local date = G_ServerTime:getDateObject(nil, 0)
    local days = GuildServerAnswerHelper.getOpenDays()
    if days[date.wday] then
        return not retb
    end
    return retb
end

-- 全服答题开启时间
function GuildServerAnswerHelper.getServerAnswerStartTime()
    return G_UserData:getGuildServerAnswer():getNewStartTime()
end

function GuildServerAnswerHelper.getServerAnswerEndTime()
    local GuildAnswerConst = require("app.const.GuildAnswerConst")
    local startTime = GuildServerAnswerHelper.getServerAnswerStartTime()
    local totalTime = GuildServerAnswerHelper.TOTAL_TIME
    return startTime + totalTime
end

function GuildServerAnswerHelper.getOpenDays()
    local ParamConfig = require("app.config.parameter")
    local config = ParamConfig.get(616)
    assert(config ~= nil, "can not find ParamConfig id = 616")
    local daysString = string.split(config.content, "|")
    local days = {}
    for k, v in pairs(daysString) do
        local curDay = tonumber(v)
        assert(curDay ~= nil, "ParamConfig  error id = 231")
        if curDay > 0 then
            curDay = curDay + 1
            if curDay > 7 then
                curDay = 1
            end
            days[curDay] = true
        end
    end

    return days
end

-- 自己是否在准备列表
function GuildServerAnswerHelper.getServerAnswerSelfIsReadSuccess()
    local list = G_UserData:getGuildServerAnswer():getGuildServerAnswerPlayerDatas()
    for k, v in pairs(list) do
        if v:getUser_id() == G_UserData:getBase():getId() then
            return true
        end
    end
    return false
end

-- 最大坑位
function GuildServerAnswerHelper.getServerAnswerMaxKeng()
    local newAnswerPoint = require("app.config.new_answer_point")
    return newAnswerPoint.length() / 2
end

-- 获取坑位列表
function GuildServerAnswerHelper.getPlayerPointMaps()
    local newAnswerPoint = require("app.config.new_answer_point")
    local leftposMaps = {}
    local rightposMaps = {}
    for index = 1, newAnswerPoint.length() do
        local config = newAnswerPoint.indexOf(index)
        if config.type == 1 then
            table.insert(leftposMaps, config)
        else
            table.insert(rightposMaps, config)
        end
    end
    return leftposMaps, rightposMaps
end

-- 获取当前显示的题目序号
function GuildServerAnswerHelper.getCurrentVisibleQuesNo()
    local GuildAnswerConst = require("app.const.GuildAnswerConst")
    local curQues = G_UserData:getGuildServerAnswer():getCurQuestion()
    local curNo = curQues:getQuestionNo() % GuildAnswerConst.WAVE_MAX_NUMS
    if curNo == 0 then
        curNo = GuildAnswerConst.WAVE_MAX_NUMS
    end
    return curNo
end

-- 获取我的和我军团的排行数据
function GuildServerAnswerHelper.getMyAndMyGuildRankData(personRanks, guildRanks)
    local ranks = G_UserData:getGuildServerAnswer():getRanks()
    local myUser_id = G_UserData:getBase():getId()
    local myGuild_id = G_UserData:getGuild():getMyGuild():getId()
    local myRankData = nil
    local myGuildRankData = nil
    for k, v in pairs(personRanks) do
        if v:getUser_id() == myUser_id then
            myRankData = v
        end
    end
    for k, v in pairs(guildRanks) do
        if v:getGuild_id() == myGuild_id then
            myGuildRankData = v
        end
    end
    return myRankData, myGuildRankData
end

-- 判断是否为自己或同军团
function GuildServerAnswerHelper.getNameColor(data)
    local myUser_id = G_UserData:getBase():getId()
    local myGuild_id = G_UserData:getGuild():getMyGuild():getId()
    local isSelf, isSameGuild = data:getUser_id() == myUser_id, data:getGuild_id() == myGuild_id
    local color = nil
    local colorOutline = nil
    if isSelf then
        color = Colors.GUILD_WAR_MY_COLOR
        colorOutline = Colors.GUILD_WAR_MY_COLOR_OUTLINE
    elseif isSameGuild then
        color = Colors.GUILD_WAR_SAME_GUILD_COLOR
        colorOutline = Colors.GUILD_WAR_SAME_GUILD_COLOR_OUTLINE
    else
        color = Colors.GUILD_WAR_ENEMY_COLOR
        colorOutline = Colors.GUILD_WAR_ENEMY_COLOR_OUTLINE
    end
    return color, colorOutline
end

-- 获取排序的玩家列表
function GuildServerAnswerHelper.getServerAnswerSortPlayers()
    local sortList = {}
    local list = G_UserData:getGuildServerAnswer():getGuildServerAnswerPlayerDatas()
    for _, data in ipairs(list) do
        local sort = data:getSort()
        sortList[sort] = sortList[sort] or {}
        table.insert(sortList[sort], data)
    end
    local realSortList = {}
    for i = 2, 1, -1 do
        if sortList[i] then
            for _, data in ipairs(sortList[i]) do
                table.insert(realSortList, data)
                if #realSortList >= GuildServerAnswerHelper.getServerAnswerMaxKeng() then
                    break
                end
            end
        end
        if #realSortList >= GuildServerAnswerHelper.getServerAnswerMaxKeng() then
            break
        end
    end
    return realSortList
end

-- 当前波次
function GuildServerAnswerHelper.getCurWaves()
    local GuildAnswerConst = require("app.const.GuildAnswerConst")
    local curQues = G_UserData:getGuildServerAnswer():getCurQuestion()
    local waves = curQues:getQuestionNo() / GuildAnswerConst.WAVE_MAX_NUMS
    waves = math.ceil(waves)
    return waves
end

-- 是否需要重置
function GuildServerAnswerHelper.needReset()
    local GuildAnswerConst = require("app.const.GuildAnswerConst")
    local curQues = G_UserData:getGuildServerAnswer():getCurQuestion()
    return curQues:getQuestionNo() <= GuildAnswerConst.WAVE_MAX_NUMS * (GuildServerAnswerHelper.getMaxWaves() - 1) + 1
end

-- 答题本人数据
function GuildServerAnswerHelper.getSelfUnitData()
    local list = G_UserData:getGuildServerAnswer():getGuildServerAnswerPlayerDatas()
    for _, data in ipairs(list) do
        if data:isSelf() then
            return data
        end
    end
end

-- 是否有人答对
function GuildServerAnswerHelper.isHaveRightAnswerPlayer()
    local curQues = G_UserData:getGuildServerAnswer():getCurQuestion()
    local list = G_UserData:getGuildServerAnswer():getGuildServerAnswerPlayerDatas()
    for _, data in ipairs(list) do
        if data:getSide() == curQues:getRightAnswer() then
            return true
        end
    end
    return false
end

-- 最大轮次
function GuildServerAnswerHelper.getMaxWaves()
    local ParamConfig = require("app.config.parameter")
    local config = ParamConfig.get(609)
    assert(config, "parameter not found config by " .. 609)
    return tonumber(config.content)
end

function GuildServerAnswerHelper.getNextOpenTime()
    local curTime = G_ServerTime:getTime()
    local ZERO_TO_18 = 64800 -- 从零点到18:00经过的秒数
    local startTime = ZERO_TO_18 + G_ServerTime:secondsFromZero()
    if GuildServerAnswerHelper.isTodayOpen() then
        if curTime < startTime then
            return startTime
        end
    end

    local date = G_ServerTime:getDateObject()
    local days = GuildServerAnswerHelper.getOpenDays()
    local nextDayNum = 1
    for i = 1, 7 do
        local wDay = date.wday + i
        if wDay > 7 then
            wDay = 1
        end
        if days[wDay] then
            nextDayNum = i
            break
        end
    end

    local t = nextDayNum * 24 * 60 * 60 + startTime
    --logError("========================= nextDayNum "..G_ServerTime:getTimeString(t))
    return t
end

function GuildServerAnswerHelper.getAnswerAwards(id)
    local config = require("app.config.new_answer_reward").get(id)
    local awards = {}
    local item = {}
    item.type = config.right_type1
    item.value = config.right_resource1
    item.size = config.right_size1
    table.insert(awards, item)
    return awards
end

return GuildServerAnswerHelper
