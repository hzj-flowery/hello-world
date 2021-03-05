-- @Author panhoa
-- @Date 05.07.2019
-- @Role 

local GachaGoldenHeroHelper = {}
local UTF8 = require("app.utils.UTF8")


function GachaGoldenHeroHelper.getParamter(constId)
    local UserDataHelper = require("app.utils.UserDataHelper")
    return UserDataHelper.getParameter(constId)
end


function GachaGoldenHeroHelper.getGachaState()
    local waitTime = GachaGoldenHeroHelper.getParamter(G_ParameterIDConst.GACHA_GOLDENHERO_WAITING)
    local duration = GachaGoldenHeroHelper.getParamter(G_ParameterIDConst.GACHA_GOLDENHERO_DURATION)
    local restTime = GachaGoldenHeroHelper.getParamter(G_ParameterIDConst.GACHA_GOLDENHERO_REST)
    local everyDayOpen  = GachaGoldenHeroHelper.getParamter(G_ParameterIDConst.GACHA_GOLDENHERO_EVERYOPEN)
    local everyDayClose = GachaGoldenHeroHelper.getParamter(G_ParameterIDConst.GACHA_GOLDENHERO_EVERYCLOSE)
    local everyDayOpen1  = GachaGoldenHeroHelper.getParamter(G_ParameterIDConst.GACHA_GOLDENHERO_EVERYOPEN1)
    local everyDayClose1 = GachaGoldenHeroHelper.getParamter(G_ParameterIDConst.GACHA_GOLDENHERO_EVERYCLOSE1)

    local sectionTime = (duration + restTime)
    local startTime = G_UserData:getGachaGoldenHero():getStart_time()
    local endTime   = G_UserData:getGachaGoldenHero():getEnd_time()
    local nowTime   = G_ServerTime:getTime()
    if nowTime > endTime or nowTime < startTime then
        return {stage = 0, countDowm = 0}
    end

    local lastedTime = (nowTime - startTime)
    if lastedTime <= waitTime then                      --0： 等待时间
        return {stage = 0, countDowm = (startTime + waitTime)}
    else                                                --1~： 活动中（进行/开奖）
        local zeroTime = G_ServerTime:secondsFromZero()
        local todayOpen = (tonumber(everyDayOpen) * 3600 + zeroTime)
        local todayClose = (tonumber(everyDayClose) * 3600 + zeroTime)
        local todayOpen1 = (tonumber(everyDayOpen1) * 3600 + zeroTime)
        local todayClose1 = (tonumber(everyDayClose1) * 3600 + zeroTime)
        local todaySecond = (5600 + zeroTime)
        local todayLast = (24 * 3600 + zeroTime)

        local stage = math.ceil((lastedTime - waitTime) / sectionTime)
        if nowTime >= todayOpen1 and nowTime <= todayClose1 then            -- 一.0-2点后新增两轮
            local curStageTime = ((lastedTime - waitTime) % sectionTime)
            if curStageTime > duration then
                local countDowm = (stage * sectionTime + waitTime + startTime)
                if (todayClose1 - nowTime) <= restTime then
                    return {stage = stage, countDowm = todayOpen, isLottery = true, isCrossDay = (nowTime > todaySecond)}
                else
                    return {stage = stage, countDowm = countDowm, isLottery = true, isCrossDay = (nowTime > todaySecond)}
                end
            else
                return {stage = stage, countDowm = ((stage - 1) * sectionTime + duration + waitTime + startTime), isLottery = false}--(本轮抽奖中)
            end
        elseif nowTime >= todayOpen and nowTime <= todayClose then          -- 二.8-24点时间段(1.2： 欢乐活动中)
            local curStageTime = ((lastedTime - waitTime) % sectionTime)
            if curStageTime > duration then
                local countDowm = (stage * sectionTime + waitTime + startTime)
                if todayLast <= countDowm then                                        -- 1.2.1：第二天第一场 （下轮）
                    if countDowm >= endTime then
                        return {stage = stage, countDowm = endTime, isLottery = true, isOver = true}
                    else
                        return {stage = stage, countDowm = (stage * sectionTime + waitTime + tonumber(everyDayOpen1) * 3600 + startTime), isLottery = true}--, isCrossDay = true}
                    end
                else                                                                  -- 1.2：欢乐活动中（同1.2）(下轮)
                    if countDowm >= endTime then
                        return {stage = stage, countDowm = endTime, isLottery = true, isOver = true}
                    else 
                        return {stage = stage, countDowm = countDowm, isLottery = true}
                    end
                end
            else
                return {stage = stage, countDowm = ((stage - 1) * sectionTime + duration + waitTime + startTime), isLottery = false}--(本轮抽奖中)
            end
        else                                                                -- 三.等待欢乐抽奖
            if todayOpen >= endTime then
                return {stage = stage, countDowm = endTime, isLottery = false, isCrossDay = true}     
            else
                return {stage = stage, countDowm = todayOpen, isLottery = false, isCrossDay = true}     
            end
        end
    end
end


----------------------------------------------------------------------------------
--  @Role       Get GoldenHeroDraw
function GachaGoldenHeroHelper.getGoldenHeroDraw(dropId)
    local ParamConfig = require("app.config.goldenhero_draw")
    local dropData = ParamConfig.get(dropId)
    assert(dropData, "goldenhero_draw.lua Can't find the drop_id: "..tostring(dropId))
    return dropData
end

function GachaGoldenHeroHelper.getGero(id)
	local info = require("app.config.hero").get(id)
	assert(info, string.format("hero config can not find id = %d", id))
	return info
end

function GachaGoldenHeroHelper.getGoldHeroCfg()
    local heroData = {}
    local heroList = G_UserData:getGachaGoldenHero():getGoldHeroGroupId()
    for i,v in ipairs(heroList) do
        local heroCfg = GachaGoldenHeroHelper.getGero(v)
        local data = {
            cfg = heroCfg,
            isHave = G_UserData:getHandBook():isHeroHave(heroCfg.id, heroCfg.limit),
            limitLevel = heroCfg.limit,
        }
        table.insert(heroData, data)
    end
    return heroData
end

function GachaGoldenHeroHelper.getGoldHeroCfgWithCountry(country)
    local heroData = {}
    local heroList = G_UserData:getGachaGoldenHero():getGoldHeroGroupId()
    for i,v in ipairs(heroList) do
        local heroCfg = GachaGoldenHeroHelper.getGero(v)

        if heroCfg.country == country then
            local data = {
                cfg = heroCfg,
                isHave = G_UserData:getHandBook():isHeroHave(heroCfg.id, heroCfg.limit),
                limitLevel = heroCfg.limit,
            }
            table.insert(heroData, data)
        end
    end
    return heroData
end

function GachaGoldenHeroHelper.isLottery(ladders)
    ladders = ladders or {}
    local selfId = G_UserData:getBase():getId()
    for k,v in pairs(ladders) do
        if rawequal(v.user_id, selfId) then
            return true
        end
    end
    return false
end

function GachaGoldenHeroHelper.isLastReward(id)
    local index = 0
    local paramConfig = require("app.config.goldenhero_draw")
    for i = 1, paramConfig.length() do
        local data = paramConfig.indexOf(i)
        if rawequal(data.drop_id, id) then
            index = i
            break
        end
    end
    return index == paramConfig.length()
end

function GachaGoldenHeroHelper.getLastReward(dropId, isOver)
    local paramConfig = require("app.config.goldenhero_draw")
    local function getCurDropIdx(drawConfig, id)
        for i = 1, drawConfig.length() do
            local data = drawConfig.indexOf(i)
            if rawequal(data.drop_id, id) then
                return i
            end
        end
        return 0
    end
    
    local index = getCurDropIdx(paramConfig, dropId)
    if index == 0 then
        return nil
    end

    index = (index == 1 and 1 or (index - 1))
    index = isOver and paramConfig.length() or index
    return paramConfig.indexOf(index)
end

function GachaGoldenHeroHelper.getFormatServerName(serverName, txtLen, isNotReplace)
    txtLen = txtLen or 8 --默认截取8个字符
    isNotReplace = isNotReplace or false
    local len = UTF8.utf8len(serverName)
    local str = UTF8.utf8sub(serverName, 1, txtLen)
    if len > txtLen then
        str = isNotReplace and str or str..".."
    end
    return str
end


return GachaGoldenHeroHelper