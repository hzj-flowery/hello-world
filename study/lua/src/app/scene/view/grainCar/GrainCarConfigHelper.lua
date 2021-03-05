local GrainCarConfigHelper = {}

local GrainCarParameter = require("app.config.graincar_parameter")
local GrainCarRoute = require("app.config.graincar_route")
local GrainCarConst  = require("app.const.GrainCarConst")
local TimeConst  = require("app.const.TimeConst")

------------------------------------------------------------
--------------graincar 配置-----------------------
------------------------------------------------------------
function GrainCarConfigHelper.getGrainCarConfig(id)
    local info = require("app.config.graincar").get(id)
	assert(info, string.format("graincar config can not find id = %d", id))
	return info
end


------------------------------------------------------------
--------------graincar_parameter 配置-----------------------
------------------------------------------------------------
--每周几开启 
--return: [1, 3, 5]
function GrainCarConfigHelper.getGrainCarWeek()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_WEEK)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_WEEK))
    local array = string.split(info.content, "|")
    local result = {}
    for i, v in ipairs(array) do
        table.insert(result, tonumber(v))
    end
	return result
end

--活动开始时间 
--return: hour, minute
function GrainCarConfigHelper.getGrainCarOpenTime()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_OPEN)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_OPEN))
    local array = string.split(info.content, "|")
	return tonumber(array[1]), tonumber(array[2])
end

--活动结束时间 
--return: hour, minute
function GrainCarConfigHelper.getGrainCarCloseTime()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_CLOSE)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_CLOSE))
    local array = string.split(info.content, "|")
	return tonumber(array[1]), tonumber(array[2])
end

--粮车路线生成时间 
--return: hour, minute
function GrainCarConfigHelper.getGrainCarRouteGenTime()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_ROUTE)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_ROUTE))
    local array = string.split(info.content, "|")
	return tonumber(array[1]), tonumber(array[2])
end

--粮车停留时间
--param mineType: GrainCarConst.MINE_COLOR_COPPER 铜矿
--                GrainCarConst.MINE_COLOR_SILVER 银矿
--                GrainCarConst.MINE_COLOR_GOLD   金矿
--return: second
function GrainCarConfigHelper.getGrainCarStopTime(mineType)
    local id = GrainCarConst.GRAINCAR_COPPER_STOP
    if mineType == GrainCarConst.MINE_COLOR_COPPER then
        id = GrainCarConst.GRAINCAR_COPPER_STOP
    elseif mineType == GrainCarConst.MINE_COLOR_SILVER then
        id = GrainCarConst.GRAINCAR_SILVER_STOP
    elseif mineType == GrainCarConst.MINE_COLOR_GOLD then
            id = GrainCarConst.GRAINCAR_GOLD_STOP
    end
    local info = GrainCarParameter.get(id)
    assert(info, string.format("graincar parameter config can not find id = %d", id))
	return tonumber(info.content)
end

--粮车移动时间（2个矿间）
--return: second
function GrainCarConfigHelper.getGrainCarMoveTime()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_MOVING_TIME)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_MOVING_TIME))
	return tonumber(info.content)
end

--粮车捐献消耗 军团贡献
--return: type, value, size
function GrainCarConfigHelper.getGrainCarDonateCost()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_DONATE_COST)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_DONATE_COST))
    local array = string.split(info.content, "|")
	return tonumber(array[1]), tonumber(array[2]), tonumber(array[3])
end

--捐献获得升级经验
--return: int
function GrainCarConfigHelper.getGrainCarDonateExp()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_DONATE_EXP)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_DONATE_EXP))
	return tonumber(info.content)
end

--获得奖励，需要攻击粮车几次
--return: int
function GrainCarConfigHelper.getGrainCarAttackTimes()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_ATTACK_TIMES)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_ATTACK_TIMES))
	return tonumber(info.content)
end

--攻击粮车获得奖励 军团贡献
--return: type, value, size
function GrainCarConfigHelper.getGrainCarAttackBonus()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_ATTACK_BONUS)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_ATTACK_BONUS))
    local array = string.split(info.content, "|")
	return tonumber(array[1]), tonumber(array[2]), tonumber(array[3])
end

--攻击粮车间隔 秒
--return: second
function GrainCarConfigHelper.getGrainCarAttackCD()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_ATTACK_CD)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_ATTACK_CD))
	return tonumber(info.content)
end

--每次攻击粮车损失耐久度
--return: int
function GrainCarConfigHelper.getGrainCarAttackHurt()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_ATTACK_HURT)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_ATTACK_HURT))
	return tonumber(info.content)
end

--粮车损毁获得奖励百分比
--return: int
function GrainCarConfigHelper.getGrainCarDamageBonus()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_DAMAGE_BONUS)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_DAMAGE_BONUS))
	return tonumber(info.content)
end

--粮车伤害减免
--当大于等于x名本军团成员和粮车在1个矿点中时，矿车受攻击时损失的耐久值减少x%
--param level:1,2,3 档
--return: int
function GrainCarConfigHelper.getGrainCarDamageReduce(level)
    local id = GrainCarConst["GRAINCAR_PROTECT_" .. level]
    local info = GrainCarParameter.get(id)
    assert(info, string.format("graincar parameter config can not find id = %d", id))
    local array = string.split(info.content, "|")
	return tonumber(array[1]), tonumber(array[2])
end

--同屏显示最大人数
function GrainCarConfigHelper.getGrainCarMaxPlayerNum()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_MAX_NUM)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_MAX_NUM))
	return tonumber(info.content)
end

--结束后还显示多久
function GrainCarConfigHelper.getGrainCarShowTimeAfterEnd()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_SHOW)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_SHOW))
	return tonumber(info.content)
end

--攻击粮车后损失多少兵力
function GrainCarConfigHelper.getGrainCarAttackLose()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_LOSE)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_LOSE))
	return tonumber(info.content)
end

--护镖的avatar
function GrainCarConfigHelper.getGrainCarShowHero()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_SHOW_HERO)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_LOSE))
    local array = string.split(info.content, "|")
    return array
end

--活动结束后，显示死亡粮车的时间
function GrainCarConfigHelper.getGrainCarShame()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_SHOW_SHAME)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_SHOW_SHAME))
    return tonumber(info.content)
end

--捐献几人次后才能发车
function GrainCarConfigHelper.getGrainCarLevelUp()
    local info = GrainCarParameter.get(GrainCarConst.GRAINCAR_LEVEL_UP)
    assert(info, string.format("graincar parameter config can not find id = %d", GrainCarConst.GRAINCAR_LEVEL_UP))
    return tonumber(info.content)
end

------------------------------------------------------------
------------------graincar_route 配置-----------------------
------------------------------------------------------------
--获取起点，终点，路线
--return 起点， 终点， 路线列表[108, 109, ... , 201]
function GrainCarConfigHelper.getGrainCarRouteWithId(id)
    local info = GrainCarRoute.get(id)
    assert(info, string.format("graincar route config can not find id = %d", id))
    local index = 1
    local route = {}
    while index <= GrainCarConst.ROUTE_STOP_COUNT_MAX and info["point_" .. index] ~= 0 do
        table.insert(route, info["point_" .. index])
        index = index + 1
    end
    
	return info.start, route[#route], route
end



------------------------------------------------------------
--------------------------方法-------------------------------
------------------------------------------------------------
--活动开始时间 相对0点偏移多少秒
function GrainCarConfigHelper.getGrainCarOpenTimeSecond()
    local hour, minute = GrainCarConfigHelper.getGrainCarOpenTime()
    return hour * 3600 + minute * 60
end

--获取活动开始时间戳
function GrainCarConfigHelper.getGrainCarOpenTimeStamp()
    local hour, minute = GrainCarConfigHelper.getGrainCarOpenTime()
    return G_ServerTime:getTimestampByHMS(hour, minute)
end

--获取活动结束时间戳
function GrainCarConfigHelper.getGrainCarEndTimeStamp()
    local hour, minute = GrainCarConfigHelper.getGrainCarCloseTime()
    return G_ServerTime:getTimestampByHMS(hour, minute)
end

--获取粮车生成时间戳
function GrainCarConfigHelper.getGrainCarGenTimeStamp()
    local genStartHour, genStartMinute = GrainCarConfigHelper.getGrainCarRouteGenTime()
    return G_ServerTime:getTimestampByHMS(genStartHour, genStartMinute)
end

--获取下次活动开始时间戳
function GrainCarConfigHelper.getNextGrainCarStartTime()
    local weekArray = GrainCarConfigHelper.getGrainCarWeek()

    local weekRefreshTime = {}
    local grainCarOpenTimeSecond = GrainCarConfigHelper.getGrainCarOpenTimeSecond()
    for k, v in pairs(weekArray) do
        local time = G_ServerTime:getTimeByWdayandSecond(v + 1, grainCarOpenTimeSecond)
        table.insert(weekRefreshTime, time)
    end

    local nextRefreshTime = 0
    local index = 1
    local curTime = G_ServerTime:getTime()
    while index <= #weekRefreshTime do
        if curTime < weekRefreshTime[index] then
            nextRefreshTime =  weekRefreshTime[index]
            break
        end
        index = index + 1
    end
    if index == #weekRefreshTime + 1 then
        nextRefreshTime = weekRefreshTime[1] + TimeConst.SECONDS_ONE_WEEK
    end

    return nextRefreshTime
end

-- 是否在活动时间
function GrainCarConfigHelper.isInActivityTime()
    local curSecond = G_ServerTime:secondsFromToday()
    local startHour, startMinute = GrainCarConfigHelper.getGrainCarOpenTime()
    local startSecond = startHour * 3600 + startMinute * 60
    local endHour, endMinute = GrainCarConfigHelper.getGrainCarCloseTime()
    local endSecond = endHour * 3600 + endMinute * 60 + GrainCarConfigHelper.getGrainCarShowTimeAfterEnd()
    return (curSecond >= startSecond and curSecond < endSecond)
end

-- 是否在发车时间区间
function GrainCarConfigHelper.isInLaunchTime()
    local curSecond = G_ServerTime:secondsFromToday()
    local startHour, startMinute = GrainCarConfigHelper.getGrainCarOpenTime()
    local startSecond = startHour * 3600 + startMinute * 60
    local endHour, endMinute = GrainCarConfigHelper.getGrainCarCloseTime()
    local endSecond = endHour * 3600 + endMinute * 60
    return (curSecond >= startSecond and curSecond < endSecond)
end

-- 是否在活动时间(从粮车生成开始算)
function GrainCarConfigHelper.isInActivityTimeFromGenerate()
    if not GrainCarConfigHelper.isTodayOpen() then
        return false
    end
    local curSecond = G_ServerTime:secondsFromToday()
    local genStartHour, genStartMinute = GrainCarConfigHelper.getGrainCarRouteGenTime()
    local genStartSecond = genStartHour * 3600 + genStartMinute * 60
    local endHour, endMinute = GrainCarConfigHelper.getGrainCarCloseTime()
    local endSecond = endHour * 3600 + endMinute * 60 + GrainCarConfigHelper.getGrainCarShowTimeAfterEnd()
    return (curSecond >= genStartSecond and curSecond < endSecond)
end

function GrainCarConfigHelper.getOpenDays()
    local weekArray = GrainCarConfigHelper.getGrainCarWeek()
    local days = {}
    for k, v in pairs(weekArray) do
        local curDay = tonumber(v)
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

-- 是否今日开启
function GrainCarConfigHelper.isTodayOpen()
    local ret = false
    local date = G_ServerTime:getDateObject(nil, 0)
    local days = GrainCarConfigHelper.getOpenDays()
    if days[date.wday] then
        return not ret
    end
    return ret
end

--是否活动结束
function GrainCarConfigHelper.isClose()
    local curSecond = G_ServerTime:secondsFromToday()
    local endHour, endMinute = GrainCarConfigHelper.getGrainCarCloseTime()
    local closeSecond = endHour * 3600 + endMinute * 60
    local endSecond = endHour * 3600 + endMinute * 60 + GrainCarConfigHelper.getGrainCarShowTimeAfterEnd()
    return (curSecond >= closeSecond and curSecond < endSecond)
end

--活动阶段
function GrainCarConfigHelper.getActStage()
    local startTime = GrainCarConfigHelper.getGrainCarOpenTimeStamp()
    local endTime = GrainCarConfigHelper.getGrainCarEndTimeStamp()
    local genTime = GrainCarConfigHelper.getGrainCarGenTimeStamp()
    local curTime = G_ServerTime:getTime()
    if curTime >= genTime and curTime < startTime then
		return GrainCarConst.ACT_STATGE_GENERATED
	elseif curTime >= startTime and curTime < endTime then
		return GrainCarConst.ACT_STATGE_OPEN
	else
		return GrainCarConst.ACT_STATGE_CLOSE
	end
end

--获取经过路径
function GrainCarConfigHelper.getRouteWithId(id)
    local info = require("app.config.graincar_route").get(id)
    assert(info, string.format("graincar_route config can not find id = %d", id))
    local route = {}
    table.insert(route, info.start)
    local i = 1
    while i < 13 and info["point_" .. i] > 0 do
        table.insert(route, info["point_" .. i])
        i = i + 1
    end
    return route
end

--在startNum~endNum范围内随机出count个数字
function GrainCarConfigHelper.randDiff(startNum, endNum, count)
    --产生1~~m,若有n的则m~~n的数字表
    local function fillNum(m, n)
        local j,k
        if n then
            j = m
            k = n
        else
            j=1
            k=m
        end
        local t={}
        for i=j, k do
            table.insert(t, i)
        end
        return t
    end

    local tmp = fillNum(startNum, endNum)
    if count > endNum - startNum + 1 then
        return tmp
    end
    local x = 0
    local t = {}
	
    while count > 0 do
       x = math.random(1, endNum - startNum + 1)
       table.insert(t, tmp[x])
       table.remove(tmp, x)
       count = count-1
       startNum = startNum + 1
    end
    return t
end

return GrainCarConfigHelper