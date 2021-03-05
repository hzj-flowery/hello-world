local SingleRaceDataHelper = {}
local SingleRaceConst = require("app.const.SingleRaceConst")
local PvpproParameter = require("app.config.pvppro_parameter")

function SingleRaceDataHelper.getStartTime()
    local openSec = PvpproParameter.get(SingleRaceConst.PVPSINGLE_SIGN_DAY).content
    local strArrSec = string.split(openSec, "|")
    local startTime = tonumber(strArrSec[2])*3600 + tonumber(strArrSec[3])*60
    local timeOfDay = SingleRaceDataHelper.getDaysFromToday() * 24 * 3600
    return G_ServerTime:secondsFromZero() + timeOfDay + startTime
end

function SingleRaceDataHelper.getEndTime()
    local openTime = SingleRaceDataHelper.getStartTime()
    local endTime = openTime + 7200

    if G_ServerTime:getTime() >= openTime then
        local status = G_UserData:getSingleRace():getStatus()
        if status == SingleRaceConst.RACE_STATE_FINISH then
            endTime = G_ServerTime:getTime() - 1
        end
    end

    return endTime
end

function SingleRaceDataHelper.isTodayOpen(zeroTimeSecond)
    local date =  G_ServerTime:getDateObject(nil, zeroTimeSecond)
    local days = SingleRaceDataHelper.getOpenDays()
    if days[date.wday] then
        return true
    end
    return false
end

function SingleRaceDataHelper.getOpenDays()
    local openSec = PvpproParameter.get(SingleRaceConst.PVPSINGLE_SIGN_DAY).content
    local strArrSec = string.split(openSec, "|")
    local days = {}
    local curDay = tonumber(strArrSec[1])
    curDay = curDay + 1
    if curDay > 7 then
        curDay = 1
    end
    days[curDay] = true

    return days
end

--从今天到开启那天的天数
function SingleRaceDataHelper.getDaysFromToday()
    local openSec = PvpproParameter.get(SingleRaceConst.PVPSINGLE_SIGN_DAY).content
    local strArrSec = string.split(openSec, "|")
    local targetDay = tonumber(strArrSec[1]) + 1
    local date =  G_ServerTime:getDateObject()
    local wday = date.wday
    if targetDay == 8 then --周日特殊处理
        targetDay = 1
    end

    if wday <= targetDay then
        return targetDay - wday
    else
        return targetDay + 7 - wday
    end
end

--是否在竞猜的时间范围内
function SingleRaceDataHelper.isInGuessTime()
    local strStart = PvpproParameter.get(SingleRaceConst.PVPSINGLE_GUESS_START).content
    local strFinish = PvpproParameter.get(SingleRaceConst.PVPSINGLE_GUESS_FINISH).content
    local tbStart = string.split(strStart, "|")
    local tbFinish = string.split(strFinish, "|")

    local curTime = G_ServerTime:getTime()
    local startSec = tonumber(tbStart[2])*3600 + tonumber(tbStart[3])*60
    local finishSec = tonumber(tbFinish[2])*3600 + tonumber(tbFinish[3])*60
    local wdayStart = tonumber(tbStart[1]) + 1
    local wdayFinish = tonumber(tbFinish[1]) + 1
    local startTime = G_ServerTime:getTimeByWdayandSecond(wdayStart, startSec)
    local finishTime = G_ServerTime:getTimeByWdayandSecond(wdayFinish, finishSec)
    if curTime >= startTime and curTime <= finishTime then
        return true, tonumber(tbStart[1]), tonumber(tbStart[2])
    else
        return false, tonumber(tbStart[1]), tonumber(tbStart[2])
    end
end

function SingleRaceDataHelper.checkCanGuess()
    local isIn, wday = SingleRaceDataHelper.isInGuessTime()
    if isIn == false then
        local strWday = Lang.get("common_wday")[wday]
        G_Prompt:showTip(Lang.get("single_race_can_not_guess_tip", {wday = strWday}))
    end
    return isIn
end

function SingleRaceDataHelper.getPreviewRankRewards()
    local result = {}
    local info = PvpproParameter.get(SingleRaceConst.PVPSINGLE_REWARD)
    local tbAward = string.split(info.content, ",")
    for i, strAward in ipairs(tbAward) do
        local temp = string.split(strAward, "|")
        local reward = {
            type = tonumber(temp[1]),
            value = tonumber(temp[2]),
            size = 0,
        }
        table.insert(result, reward)
    end
    
    return result
end

--跨服个人竞技跨服聊天开始时间
function SingleRaceDataHelper.getStartTimeOfChat()
    local strStart = PvpproParameter.get(SingleRaceConst.PVPSINGLE_CHAT_BEGIN).content
    local tbStart = string.split(strStart, "|")

    local curTime = G_ServerTime:getTime()
    local startSec = tonumber(tbStart[2])*3600 + tonumber(tbStart[3])*60
    local wdayStart = tonumber(tbStart[1]) + 1
    local startTime = G_ServerTime:getTimeByWdayandSecond(wdayStart, startSec)
    return startTime
end

--跨服个人竞技跨服聊天结束时间
function SingleRaceDataHelper.getEndTimeOfChat()
    local strFinish = PvpproParameter.get(SingleRaceConst.PVPSINGLE_CHAT_END).content
    local tbFinish = string.split(strFinish, "|")

    local curTime = G_ServerTime:getTime()
    local finishSec = tonumber(tbFinish[2])*3600 + tonumber(tbFinish[3])*60
    local wdayFinish = tonumber(tbFinish[1]) + 1
    local finishTime = G_ServerTime:getTimeByWdayandSecond(wdayFinish, finishSec)
    return finishTime
end

return SingleRaceDataHelper