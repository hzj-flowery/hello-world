local MainUIHelper = {}

local CityTimeShow = require("app.config.city_timeshow")
local UserDataHelper = require("app.utils.UserDataHelper")

function MainUIHelper.getCurrShowSceneId()
    local time = G_ServerTime:getDateObject()
    dump(time)
    local dayOfYear =  time.yday
    local currConfig = nil
    for i = 1,CityTimeShow.length(),1 do
        local config = CityTimeShow.indexOf(i)
        if dayOfYear >= config.start_day and dayOfYear <= config.end_day then
            currConfig = config
        end      
    end
    local dayTimeStr = UserDataHelper.getParameter(G_ParameterIDConst.CITY_DAY_TIME)
    local hours = string.split(dayTimeStr,"|")
    assert(hours[1] and hours[2], "ParameterIDConst CITY_DAY_TIME format not correct")
    local minHour = tonumber(hours[1])
    local maxHour = tonumber(hours[2])

    local isInDaytime = false
    local seconds = G_ServerTime:secondsFromToday()
    if seconds  >= minHour*3600 and seconds <=  maxHour * 3600 then
        isInDaytime = true
    end
  
    return isInDaytime and currConfig.scene_day or currConfig.scene_night
end

function MainUIHelper.getCurrShowSceneConfig()
    local time = G_ServerTime:getDateObject()
    dump(time)
    local dayOfYear =  time.yday
    local currConfig = nil
    for i = 1,CityTimeShow.length(),1 do
        local config = CityTimeShow.indexOf(i)
        if dayOfYear >= config.start_day and dayOfYear <= config.end_day then
            currConfig = config
        end      
    end
    return currConfig
end

return MainUIHelper