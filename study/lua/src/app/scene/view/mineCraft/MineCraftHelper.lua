local MineCraftHelper = {}
MineCraftHelper.CenterPoint = 100       --最中间的矿id

local ParameterIDConst = require("app.const.ParameterIDConst")
local Parameter = require("app.config.parameter")
local TextHelper = require("app.utils.TextHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local TimeConst  = require("app.const.TimeConst")

MineCraftHelper.TYPE_MAIN_CITY = 2
MineCraftHelper.ARMY_TO_LEAVE = 50
MineCraftHelper.RESOURCE_FONT_SIZE  = 18        -- 资源消化字体大小

function MineCraftHelper.getStateColor(state)
    local color = state + 1
    return Colors.getMineStateColor(color)
end

function MineCraftHelper.getRoad2(startId, endId)
    local Greedy = require('app.utils.luagraphs.Greedy')
    local graph = G_UserData:getMineCraftData():getMineGraph()
	local shortestPath = Greedy.findPath(startId, endId, graph)
    table.remove(shortestPath, 1)--自己的点不发送
    return shortestPath
end

function MineCraftHelper.getRoad(startId, endId)
    local roads = G_UserData:getMineCraftData():getMineRoads()

    local function getRoadByIndex(road, startIdx, endIdx)
        local path = {}
        if startIdx > endIdx then 
            for i = startIdx - 1, endIdx, -1 do 
                table.insert(path, road[i])
            end
        else 
            for i = startIdx+1, endIdx do 
                table.insert(path, road[i])
            end
        end
        return path
    end

    --最近的单条路上两个点
    local function getRoadArray(startId, endId)
        local distance = 100
        local retRoad = nil
        for index, road in pairs(roads) do 
            local startIndex = nil
            local endIndex = nil
            for idx, v in pairs(road) do 
                if startId == v then 
                    startIndex = idx
                end
                if endId == v then 
                    endIndex = idx
                end
                if startIndex and endIndex then 
                    local dis = math.abs(startIndex - endIndex )
                    if dis < distance then 
                        distance = dis
                        retRoad = getRoadByIndex(road, startIndex, endIndex)      
                    end
                end
            end
        end  
        return retRoad     
    end
    
    --情况2，在不同的分区 分区以开头分， 101， 201， 301
    local startType = math.floor(startId / 100)
    local endType = math.floor(endId / 100)
    if startType ~= endType then    --不同区
        --先走到中间的矿
        local road1 = getRoadArray(startId, MineCraftHelper.CenterPoint)
        --再从中间的矿走到外面的矿
        local road2 = getRoadArray(MineCraftHelper.CenterPoint, endId)
        for _, id in pairs(road2) do 
            table.insert(road1, id)
        end
        return road1
    else
        local retRoad = getRoadArray(startId, endId)
        if retRoad then 
            return retRoad
        end

        --情况2，不在同一条路
        --找到包含的路
        local containRoad = {}
        for index, road in pairs(roads) do 
            for i, v in pairs(road) do 
                if v == startId then 
                    table.insert(containRoad, road)
                end
            end
        end

        local distance = 100
        local road2 = nil
        local startPt = nil
        for index, road in pairs(containRoad) do 
            for i, v in pairs(road) do 
                local secondRoad = getRoadArray(v, endId)
                if secondRoad and #secondRoad < distance then 
                    distance = #secondRoad
                    road2 = secondRoad
                    startPt = v
                end
            end
        end

        local road1 = getRoadArray(startId, startPt)
        for i, v in pairs(road2) do 
            table.insert(road1, v)
        end
        return road1
    end
end

-----------曲线相关函数-----------------------------------
local bezierFix = function(posStart, posMid, posEnd, t)
	return (math.pow(1-t,2)*posStart + 2*t*(1-t)*posMid + math.pow(t, 2)*posEnd)
end

local bezierAngle = function(posStart, posEnd, t)
	return posStart + (posEnd - posStart)*t
end

function MineCraftHelper.getBezierPosition(bezier, t)
	local xa = bezier[1].x
	local xb = bezier[2].x
	local xc = bezier[3].x

	local ya = bezier[1].y
	local yb = bezier[2].y
	local yc = bezier[3].y

	local posx1 = bezierAngle(xa, xb, t) 
	local posy1 = bezierAngle(ya, yb, t)
	local posx2 = bezierAngle(xb, xc, t)
	local posy2 = bezierAngle(yb, yc, t)

	local angle = math.atan2(posy2-posy1, posx2-posx1)
	local angleRet = -math.floor(angle*180/3.14)

	return bezierFix(xa, xb, xc, t), bezierFix(ya, yb, yc, t), angleRet
end
---------------------------------------------------------------------

function MineCraftHelper.isShowMoneyIcon()
    local serverGetMoneyTime = G_UserData:getMineCraftData():getSelfLastTime()	
	local nowTime = G_ServerTime:getTime()
	local timeDuration = nowTime - serverGetMoneyTime

	local param = Parameter.get(ParameterIDConst.MINE_HAVEST_TIME)
	assert(param, "wrong param id = "..ParameterIDConst.MINE_HAVEST_TIME)
	local defautTime = tonumber(param.content)
    if timeDuration <= defautTime then 
        return false 
    end 
    return true
end

function MineCraftHelper.openAlertDlg(title, content)
    local popupSystemAlert = require("app.ui.PopupSystemAlert").new(title, content)
    popupSystemAlert:showGoButton(Lang.get("fight_kill_comfirm"))
    popupSystemAlert:setCheckBoxVisible(false)
    popupSystemAlert:openWithAction()
end

--获得矿的基础产出情况以及buff, debuff
function MineCraftHelper.getOutputState(mineData)

    local outputConfig, baseOutput = mineData:getMineStateConfig()

    local minus = (outputConfig.output_change  - baseOutput.output_change) / 10     --拥挤减少量

    local guildId = mineData:getGuildId()
    local add = 0           --占领增加量
    local onlyAdd = 0       --独占增加量
    if guildId ~= 0 then 
        local parameterContent = Parameter.get(ParameterIDConst.MINE_OUTPUT_ADD)
        assert(parameterContent, "not id, "..ParameterIDConst.MINE_OUTPUT_ADD)
        add = (tonumber(parameterContent.content)) / 10

        if mineData:isOwn() then 
            local parameterContent = Parameter.get(ParameterIDConst.MINE_ONLY_GUILD)
            assert(parameterContent, "not id, "..ParameterIDConst.MINE_ONLY_GUILD)
            onlyAdd = (tonumber(parameterContent.content)) / 10
        end
    end

    local baseOutputSec = baseOutput.output / 100000       --每一秒的产量,元宝产量每秒除以10万，没有附加值，基础产量
    local double = mineData:getMultiple()
    if double >= 2 then 
        baseOutputSec = baseOutputSec*double
    end

    return baseOutputSec, minus, add, onlyAdd, outputConfig.description
end

--获得我自己矿区的秒产量
function MineCraftHelper.getSelfOutputSec()
    local mineData = G_UserData:getMineCraftData():getMyMineData()
    local baseOutputSec, minus, add, onlyAdd = MineCraftHelper.getOutputState(mineData)
    local change = (100 + minus) 
    if mineData:isMyGuildMine() then 
        change = change + add + onlyAdd
    end
    local outputSec =  baseOutputSec * change / 100
    return outputSec
end

--获得每个矿区的产出详细
function MineCraftHelper.getOutputDetail(mineId)
    local mineData = G_UserData:getMineCraftData():getMineDataById(mineId)
    local baseOutputSec, minus, add, onlyAdd, des = MineCraftHelper.getOutputState(mineData)
    local change = (100 + minus)
    if mineData:isMyGuildMine() then 
        change = change + add + onlyAdd
    end

    local outputSec =  baseOutputSec * change / 100
    local outputDay = math.floor(outputSec * 86400 /10 ) * 10 --以天作为单位
    local strOutputDay = Lang.get("mine_day_money", {count = outputDay})

    local finalChange = minus + add + onlyAdd
    return finalChange, add, onlyAdd, minus, outputDay, strOutputDay, des
end

function MineCraftHelper.getNeedArmy()  --还有距离满兵力还有多少
    local nowArmy = G_UserData:getMineCraftData():getMyArmyValue()
    local maxArmy = tonumber(require("app.config.parameter").get(ParameterIDConst.TROOP_MAX).content)
    if G_UserData:getMineCraftData():isSelfPrivilege() then
        local soilderAdd  = MineCraftHelper.getParameterContent(G_ParameterIDConst.MINE_CRAFT_SOILDERADD)
        maxArmy = (maxArmy + soilderAdd)
    end
    return maxArmy-nowArmy
end

function MineCraftHelper.getMoneyDetail(output)
    local serverMoney = G_UserData:getMineCraftData():getSelfMoney()
	local serverMoneyTime = G_UserData:getMineCraftData():getSelfLastProduceTime()
	local serverGetMoneyTime = G_UserData:getMineCraftData():getSelfLastTime()
	local nowTime = G_ServerTime:getTime()

	local timeDiff = nowTime - serverMoneyTime      --服务器结算金币得时间
    local getTimeDiff = nowTime - serverGetMoneyTime        --玩家点击获得金币得时间
    
    local timeLimit = tonumber(require("app.config.parameter").get(ParameterIDConst.MINE_TIME_LIMIT).content)

	if getTimeDiff > timeLimit then 
		getTimeDiff = timeLimit
        local overTime = nowTime - serverGetMoneyTime - timeLimit
        
		timeDiff = timeDiff - overTime
		if timeDiff < 0 then 
			timeDiff = 0
		end
	end
    local moneyCount = math.floor((serverMoney/100000) + timeDiff * output)
    local moneyText = TextHelper.getAmountText3(moneyCount)

    local nowMoneyDetail = (serverMoney/100000) + timeDiff * output - moneyCount        --钱币的小数部分

    local percent = nowMoneyDetail*100 
    if getTimeDiff == timeLimit then 
        percent = 100
    end
    return moneyCount, moneyText, percent
end

function MineCraftHelper.getBuyArmyDetail()
    local food = nil 
    local money = nil 

    local nowArmy = G_UserData:getMineCraftData():getMyArmyValue()
    local maxArmy = tonumber(require("app.config.parameter").get(ParameterIDConst.TROOP_MAX).content)
    if G_UserData:getMineCraftData():isSelfPrivilege() then
        local soilderAdd  = MineCraftHelper.getParameterContent(G_ParameterIDConst.MINE_CRAFT_SOILDERADD)
        maxArmy = (maxArmy + soilderAdd)
    end
    local needFood = maxArmy - nowArmy

    local maxFood = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD)
    local goldToFood = tonumber(require("app.config.parameter").get(ParameterIDConst.MINE_GOLD_TO_FOOD).content)
    if maxFood >= needFood then 
        food = needFood
    elseif maxFood == 0 then 
        money = goldToFood * needFood
    else
        food = maxFood
        money = (needFood - maxFood) * goldToFood
    end
    return food, money, needFood
end

function MineCraftHelper.getParameterContent(constId)
    local UserDataHelper = require("app.utils.UserDataHelper")
    return UserDataHelper.getParameter(constId)
end

function MineCraftHelper.getPrivilegeVipCfg()
    local VipPay = require("app.config.vip_pay")
    local privilegeCfg = VipPay.get(10098)
    assert(privilegeCfg, "vip_pay id = "..10098)
    return privilegeCfg
end

--获取恶名值下降速率（矿战特权相对于普通）
function MineCraftHelper.getInfameReduceRelative()
    local reduceVip = Parameter.get(ParameterIDConst.PEACE_VIPEVIL_REDUCE).content
    local reduceNormal = Parameter.get(ParameterIDConst.PEACE_EVIL_REDUCE).content
    local arrayVip = string.split(reduceVip, "|")
    local arrayNormal = string.split(reduceNormal, "|")
    local rateVip = arrayVip[2] / arrayVip[1]
    local rateNormal = arrayNormal[2] / arrayNormal[1]
    return rateVip / rateNormal
end

--获取恶名值最大值（矿战特权相对于普通）
function MineCraftHelper.getInfameRelative()
    local maxVip = tonumber(Parameter.get(ParameterIDConst.PEACE_EVIL_VIPLIMIT).content)
    local maxNormal = tonumber(Parameter.get(ParameterIDConst.PEACE_EVIL_LIMIT).content)
    return maxVip - maxNormal
end

--获取恶名值刷新时间和步长
function MineCraftHelper.getInfameCfg(bIsVip)
    local Parameter = require("app.config.parameter")
    local ParameterIDConst = require("app.const.ParameterIDConst")
    local content = ""
    if bIsVip then
        content = Parameter.get(ParameterIDConst.PEACE_VIPEVIL_REDUCE).content
    else
        content = Parameter.get(ParameterIDConst.PEACE_EVIL_REDUCE).content
    end
    local array = string.split(content, "|")
    return tonumber(array[1]), tonumber(array[2])
end

--获取最大恶名值
function MineCraftHelper.getMaxInfameValue(bIsVip)
    local Parameter = require("app.config.parameter")
    local ParameterIDConst = require("app.const.ParameterIDConst")
    local content = ""
    if bIsVip then
        content = Parameter.get(ParameterIDConst.PEACE_EVIL_VIPLIMIT).content
    else
        content = Parameter.get(ParameterIDConst.PEACE_EVIL_LIMIT).content
    end
    return tonumber(content)
end

--获取富矿刷新时间戳(相对当天0点)
function MineCraftHelper.getGoldMineRefreshTime()
    local Parameter = require("app.config.parameter")
    local ParameterIDConst = require("app.const.ParameterIDConst")
    local content = Parameter.get(ParameterIDConst.OUTPUT_UP_REFRESH).content
    local array = string.split(content, "|")
    return array[1] * 3600 + array[2] + array[3]
end

--获取富矿刷新后x秒后刷新和平矿
function MineCraftHelper.getPeaceRefreshTimeOffset()
    return tonumber(Parameter.get(ParameterIDConst.PEACE_BEGIN).content)
end

--获取在和平矿攻击非恶名玩家增加x点恶名值
function MineCraftHelper.getInfameValueAddPerAttack()
    return tonumber(Parameter.get(ParameterIDConst.PEACE_EVIL).content)
end

--获取和平矿每周生成时间
function MineCraftHelper.getNextPeaceStartTime()
    local content = Parameter.get(ParameterIDConst.PEACE_WEEK).content
    local array = string.split(content, "|")

    local weekRefreshTime = {}
    local goldMineRefreshTime = MineCraftHelper.getGoldMineRefreshTime()
    local peaceRefreshTime = MineCraftHelper.getPeaceRefreshTimeOffset()
	-- local wDayToday = G_ServerTime:getWeekdayAndHour(G_ServerTime:getTime())
    for k, v in pairs(array) do
        local time = G_ServerTime:getTimeByWdayandSecond(v + 1, goldMineRefreshTime + peaceRefreshTime)
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


return MineCraftHelper