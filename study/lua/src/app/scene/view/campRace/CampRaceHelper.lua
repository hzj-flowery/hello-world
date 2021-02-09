local CampRaceHelper = {}

local CampRaceConst = require("app.const.CampRaceConst")
local PvpproParameter = require("app.config.pvppro_parameter")

function CampRaceHelper.getGameTime(state)
    if state == CampRaceConst.STATE_PRE_MATCH then 
        local time = PvpproParameter.get(CampRaceConst.PVP_PRO_PRE_CONST).content
        return tonumber(time)
    elseif state == CampRaceConst.STATE_PLAY_OFF then 
        local time = PvpproParameter.get(CampRaceConst.PVP_PRO_FINAL_CONST).content
        return tonumber(time)
    end
end

function CampRaceHelper.isOpenToday()
    local wday = G_ServerTime:getWeekdayAndHour()
    local openDay = PvpproParameter.get(CampRaceConst.PVP_PRO_OPEN_DAY).content
    local strArr = string.split(openDay, "|")
    for i, v in pairs(strArr) do 
        local day = tonumber(v)
        if wday == day then 
            return true
        end
    end
    return false
end

--返回状态，倒计时的开始时间
function CampRaceHelper.getSigninState()
    local findNextDay = function(fromWday, tbDay)
        for i = fromWday, 7 do
            if tbDay[i] then
                return i
            end
        end
        for i = 1, 7 do
            if tbDay[i] then
                return i+7
            end
        end
    end

    local curTime = G_ServerTime:getTime()

    local openSigninDay = PvpproParameter.get(CampRaceConst.PVP_PRO_SIGNIN_OPEN_DAY).content
    local strArrSigninDay = string.split(openSigninDay, "|")
    local tbSigninDay = {}
    for i, wday in ipairs(strArrSigninDay) do
        tbSigninDay[tonumber(wday)] = true
    end
    local openSigninSec = PvpproParameter.get(CampRaceConst.PVP_PRO_SIGNIN_OPEN_TIME).content
    local strArrSigninSec = string.split(openSigninSec, "|")
    local secondToOpen = tonumber(strArrSigninSec[1])*3600 + tonumber(strArrSigninSec[2])*60

    local openDay = PvpproParameter.get(CampRaceConst.PVP_PRO_OPEN_DAY).content
    local strArrDay = string.split(openDay, "|")
    local tbDay = {}
    for i, wday in ipairs(strArrDay) do
        tbDay[tonumber(wday)] = true
    end
    local openSec = PvpproParameter.get(CampRaceConst.PVP_PRO_OPEN_TIME).content
    local strArrSec = string.split(openSec, "|")
    local secondOpen = tonumber(strArrSec[1])*3600 + tonumber(strArrSec[2])*60

    for i = 1, 7 do
        local signinDay = tbSigninDay[i] and i or findNextDay(i, tbSigninDay)
        local openDay = tbDay[i] and i or findNextDay(i, tbDay)
        local openSigninTime = G_ServerTime:getTimeByWdayandSecond(tonumber(signinDay) + 1, secondToOpen)
        local openTime = G_ServerTime:getTimeByWdayandSecond(tonumber(openDay) + 1, secondOpen)
        if curTime < openSigninTime then
            return CampRaceConst.SIGNIN_NOT_OPEN, openSigninTime - curTime
        elseif curTime >= openSigninTime and curTime < openTime then 
            return CampRaceConst.SIGNIN_OPEN, openTime - curTime
        end
    end

    return 0, 0
end

--是否在阵营冠军Icon显示的时间内
function CampRaceHelper.isInCampChampionIconShowTime()
    if CampRaceHelper.isReplacedBySingleRace() == true then
        return false
    end
    local curTime = G_ServerTime:getTime()

    local openDay = PvpproParameter.get(CampRaceConst.PVP_PRO_OPEN_DAY).content
    local strArrDay = string.split(openDay, "|")
    local tbDay = {}
    for i, wday in ipairs(strArrDay) do
        tbDay[tonumber(wday)] = true
    end
    local openSec = PvpproParameter.get(CampRaceConst.PVP_PRO_OPEN_TIME).content
    local strArrSec = string.split(openSec, "|")
    local secondOpen = tonumber(strArrSec[1])*3600 + tonumber(strArrSec[2])*60

    for wday, v in pairs(tbDay) do
        local openTime = G_ServerTime:getTimeByWdayandSecond(tonumber(wday) + 1, secondOpen)
        local limitTime = G_ServerTime:getTimeByWdayandSecond(tonumber(wday) + 2, 12*3600) --第二天12点
        if curTime > openTime and curTime < limitTime and G_UserData:getCampRaceData():getStatus() == CampRaceConst.STATE_PRE_OPEN then
            return true
        end
    end
    return false
end

function CampRaceHelper.getBetGold()
    local gold = PvpproParameter.get(CampRaceConst.PVP_PRO_BID_COST).content
    return tonumber(gold)
end

function CampRaceHelper.getBetReward()
    local gold = PvpproParameter.get(CampRaceConst.PVP_PRO_BID_REWARD).content
    return tonumber(gold)
end

--战报组排序
function CampRaceHelper.sortReportGroup(reports)
    local function sortFunc(a, b)
        return a:getId() < b:getId()
    end

    local result = {}
    for id, report in pairs(reports) do
        table.insert(result, report)
    end
    table.sort(result, sortFunc)
    return result
end

function CampRaceHelper.getReportGroup(camp, pos)
    local pos1 = 0
    local pos2 = 0
    if pos % 2 == 0 then
        pos1 = pos - 1
        pos2 = pos
    else
        pos1 = pos
        pos2 = pos + 1
    end
    local reports = G_UserData:getCampRaceData():getReportGroupByPos(camp, pos1, pos2)
    return reports, pos1, pos2
end

function CampRaceHelper.getMatchScore(camp, pos)
    local reports, pos1, pos2 = CampRaceHelper.getReportGroup(camp, pos)
    local pos1WinCount = 0
    local pos2WinCount = 0
    local score = 0
    for k, report in pairs(reports) do
        local winPos = report:getWin_pos()
        if winPos == pos1 then
            pos1WinCount = pos1WinCount + 1
        elseif winPos == pos2 then
            pos2WinCount = pos2WinCount + 1
        end
    end
    if pos == pos1 then
        score = pos1WinCount
    elseif pos == pos2 then
        score = pos2WinCount
    end

    return score
end

function CampRaceHelper.getRoundWithPos(pos)
    for round, tbPos in pairs(CampRaceConst.ROUND_POSITION_IN_MATCH) do
        for i, tempPos in ipairs(tbPos) do
            if tempPos == pos then
                return round
            end
        end
    end
    return 0
end

function CampRaceHelper.getMacthStateWithPos(camp, pos)
    local finalStatus = G_UserData:getCampRaceData():getFinalStatusByCamp(camp)
    local round = CampRaceHelper.getRoundWithPos(pos)
    if round < finalStatus then
        return CampRaceConst.MATCH_STATE_AFTER
    elseif round > finalStatus then
        return CampRaceConst.MATCH_STATE_BEFORE
    else
        return CampRaceConst.MATCH_STATE_ING
    end
end

function CampRaceHelper.getPreviewRankRewards()
    local result = {}
    local Config = require("app.config.pvppro_reward")
    local info = Config.get(99)
    for i = 1, 10 do
        local type = info["type_"..i]
        local value = info["value_"..i]
        local size = info["size_"..i]
        if type > 0 and value > 0 and size > 0 then
            local reward = {
                type = type,
                value = value,
                size = size,
            }
            table.insert(result, reward)
        end
    end
    return result
end

function CampRaceHelper.getStartTime()
    if CampRaceHelper.isTodayOpen() then
        local openSec = PvpproParameter.get(CampRaceConst.PVP_PRO_OPEN_TIME).content
        local strArrSec = string.split(openSec, "|")
        local startTime = tonumber(strArrSec[1])*3600 + tonumber(strArrSec[2])*60
        return startTime + G_ServerTime:secondsFromZero()
    end
    return 0
end

function CampRaceHelper.getEndTime()
    local openSec = PvpproParameter.get(CampRaceConst.PVP_PRO_OPEN_TIME).content
    local strArrSec = string.split(openSec, "|")
    local secondOpen = tonumber(strArrSec[1])*3600 + tonumber(strArrSec[2])*60
    local openTime = G_ServerTime:secondsFromZero() + secondOpen

    local endTime = openTime + 7200

    if G_ServerTime:getTime() >= openTime then
        local status = G_UserData:getCampRaceData():getStatus()
        if status == CampRaceConst.STATE_PRE_OPEN then
            endTime = G_ServerTime:getTime() - 1
        end
    end

    return endTime
end

function CampRaceHelper.isTodayOpen(zeroTimeSecond)
    if CampRaceHelper.isReplacedBySingleRace() == true then
        return false
    end
    local date =  G_ServerTime:getDateObject(nil, zeroTimeSecond)
    local days = CampRaceHelper.getOpenDays()
    if days[date.wday] then
        return true
    end
    return false
end

function CampRaceHelper.getOpenDays()
    local openDay = PvpproParameter.get(CampRaceConst.PVP_PRO_OPEN_DAY).content
    local strArrDay = string.split(openDay, "|")
    local days = {}
    for k , v in pairs(strArrDay) do
        local curDay = tonumber(v)
        curDay = curDay + 1
        if curDay > 7 then
            curDay = 1
        end
        days[curDay] = true
    end

    return days
end

--阵营竞技是否被跨服个人竞技顶掉了
function CampRaceHelper.isReplacedBySingleRace()
    local singleRaceStatus = G_UserData:getSingleRace():getStatus()
    if singleRaceStatus == require("app.const.SingleRaceConst").RACE_STATE_NONE then
        return false
    else
        return true
    end
end

return CampRaceHelper