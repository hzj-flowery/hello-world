local DailyDungeonCheck = {}

--副本是否能打
function DailyDungeonCheck.isDailyDungeonCanFight(type,popHint)
    local success = true
    local popFunc = nil 

    success,popFunc = DailyDungeonCheck.isDailyDungeonLevelEnough(type,popHint)
    if success then
        success,popFunc = DailyDungeonCheck.isDailyDungeonInOpenTime(type,popHint)
    end
    if success then
        success,popFunc = DailyDungeonCheck.isDailyDungeonCountEnough(type,popHint)
    end

    return success,popFunc
end


function DailyDungeonCheck.isDailyDungeonLevelEnough(type,popHint)
    local success = true
    local popFunc = nil 

    local DailyDungeonType = require("app.config.daily_dungeon_type")
    local DailyDungeon = require("app.config.daily_dungeon")
    
    local dailyInfo = DailyDungeonType.get(type)
    assert(dailyInfo,"daily_dungeon_type not find id "..type)
   
	local dailyDungeonCount = DailyDungeon.length()
    local firstLevel = 0
	for i = 1, dailyDungeonCount do
		local info = DailyDungeon.indexOf(i)
		if info.type == dailyInfo.id and info.pre_id == 0 then
            firstLevel = info.level
            break
		end
	end

    local myLevel = G_UserData:getBase():getLevel()
    
    logWarn(" ------------- "..tostring(firstLevel))
    if myLevel < firstLevel then
        success =  false
         popFunc = function() 
            G_Prompt:showTip(Lang.get("daily_open_tips", {count = firstLevel, name = dailyInfo.name})) 
        end
    end
   

    if popHint and popFunc then
        popFunc()
    end

    return success,popFunc
end


function DailyDungeonCheck.isDailyDungeonInOpenTime(type,popHint)
    
    local DailyDungeonType = require("app.config.daily_dungeon_type")
    local DailyDungeon = require("app.config.daily_dungeon")

    local getFirstOpenLevelFunc = function(type)
        local DailyDungeonCount = DailyDungeon.length()
        for i = 1, DailyDungeonCount do
            local info = DailyDungeon.indexOf(i)
            if info.type == type and info.pre_id == 0 then
                return info.level
            end
        end
    end

    local getOpenDateStr = function(openDayData)
        local openDays = {}
        for i,open in ipairs(openDayData) do
            if open then
                table.insert(openDays,i)
            end
        end
        local sortfunction = function(obj1,obj2)
            if obj1 == 1 or obj2 == 1 then
                return obj1 ~= 1
            end
            return obj1 < obj2
        end
        table.sort( openDays, sortfunction )

        local days = openDays
        local strDays = ""
        for i = 1, #days-1 do
            strDays = strDays..Lang.get("open_days")[days[i]]..", "
        end
        strDays = strDays..Lang.get("open_days")[days[#days]]

        return strDays
    end


    local success = true
    local popFunc = nil 


    local firstLevel = getFirstOpenLevelFunc(type)
    local todayLevel = G_UserData:getBase():getToday_init_level()
    local nowLevel = G_UserData:getBase():getLevel()
    if todayLevel < firstLevel and nowLevel >= firstLevel then
        return true
    end


    local dailyInfo = DailyDungeonType.get(type)
    assert(dailyInfo,"daily_dungeon_type not find id "..type)
    local openDays = {}
	for i = 1,string.len(dailyInfo.week_open_queue) do
		openDays[i] = string.byte(dailyInfo.week_open_queue,i) == 49
	end
    local TimeConst = require("app.const.TimeConst")
	local data = G_ServerTime:getDateObject(nil,TimeConst.RESET_TIME_SECOND)
	if not openDays[data.wday] then
        
        success = false
        local strDays = getOpenDateStr(openDays)
        local tipString = Lang.get("open_string", {str = strDays})

        logWarn(" ---------------- &&66 "..tostring(tipString))

        popFunc = function() 
            G_Prompt:showTip(tipString)
        end
    end

  
    if popHint and popFunc then
        popFunc()
    end

    return success,popFunc
end


function DailyDungeonCheck.isDailyDungeonCountEnough(type,popHint)
    local success = true
    local popFunc = nil 

    local remainCount = G_UserData:getDailyDungeonData():getRemainCount(type) 
    if remainCount <= 0 then
        success =  false
         popFunc = function() 
            G_Prompt:showTip(Lang.get("challenge_no_count"))
        end
    end
   

    if popHint and popFunc then
        popFunc()
    end

    return success,popFunc
end


return DailyDungeonCheck