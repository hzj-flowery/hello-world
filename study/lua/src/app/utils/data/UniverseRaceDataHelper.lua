
local UniverseRaceDataHelper = {}
local UniverseRaceConst = require("app.const.UniverseRaceConst")
local UserCheck = require("app.utils.logic.UserCheck")

function UniverseRaceDataHelper.getGroupConfig(competitor)
    local info = require("app.config.pvpuniverse_group").get(competitor)
    assert(info, string.format("pvpuniverse_group config can not find competitor = %d", competitor))
    return info
end

function UniverseRaceDataHelper.getParameterConfig(id)
    local info = require("app.config.pvpuniverse_parameter").get(id)
    assert(info, string.format("pvpuniverse_parameter config can not find id = %d", id))
    return info
end

function UniverseRaceDataHelper.getRewardConfig(id)
    local info = require("app.config.pvpuniverse_reward").get(id)
    assert(info, string.format("pvpuniverse_reward config can not find id = %d", id))
    return info
end

function UniverseRaceDataHelper.getRewardGuessConfig(id)
    local info = require("app.config.pvpuniverse_reward_guess").get(id)
    assert(info, string.format("pvpuniverse_reward_guess config can not find id = %d", id))
    return info
end

function UniverseRaceDataHelper.getRewardSeriesConfig(id)
    local info = require("app.config.pvpuniverse_reward_series").get(id)
    assert(info, string.format("pvpuniverse_reward_series config can not find id = %d", id))
    return info
end

function UniverseRaceDataHelper.getGuessCostConfig(round, guess)
    local info = require("app.config.pvpuniverse_guess_cost").get(round, guess)
    assert(info, string.format("pvpuniverse_guess_cost config can not find round = %d, guess = %d", round, guess))
    return info
end

function UniverseRaceDataHelper.getRewardPotConfig(id)
    local info = require("app.config.pvpuniverse_reward_pot").get(id)
    assert(info, string.format("pvpuniverse_reward_pot config can not find id = %d", id))
    return info
end

function UniverseRaceDataHelper.getRewardList()
    local Config = require("app.config.pvpuniverse_reward")
    local len = Config.length()
    local result = {}
    for i = 1, len do
        local info = Config.indexOf(i)
        local id = info.id
        local txt = info.txt
        local awards = {}
        for j = 1, 5 do
            local type = info["type_"..j]
            local value = info["value_"..j]
            local size = info["size_"..j]
            if type > 0 and value > 0 then
                table.insert(awards, {type = type, value = value, size = size})
            end
        end
        table.insert(result, {id = id, awards = awards, txt = txt})
    end
    table.sort(result, function(a, b)
        return a.id > b.id
    end)
    return result
end

function UniverseRaceDataHelper.getGuessRewardList()
    local Config = require("app.config.pvpuniverse_reward_pot")
    local len = Config.length()
    local result = {}
    for i = 1, len do
        local info = Config.indexOf(i)
        table.insert(result, info.id)
    end
    
    return result
end

function UniverseRaceDataHelper.getTransformMapRelation(random)
    logWarn("UniverseRaceDataHelper.getTransformMapRelation, random = "..random)
    local bits = bit.tobits(random)
    dump(bits)
    local initStructure = UniverseRaceConst.MAP_STRUCTURE --原始结构
    local resStructure = {} --转换后的结构

    local transform = function(tb)
        local result = {}
        local temp = {}
        for k, v in pairs(tb) do
            table.insert(temp, {key = k, value = v})
        end
        result[temp[1].key] = temp[2].value
        result[temp[2].key] = temp[1].value
        return result
    end

    for i = 1, 4 do --i对应分区
        local bit = bits[i] or 0
        local isTransform = bit == 1 --等于1代表要变换
        resStructure[i] = {}
        local zone = initStructure[i]
        if isTransform then
            for j, info in ipairs(zone) do
                local res = transform(info)
                resStructure[i][j] = res
            end
        else
            resStructure[i] = zone
        end
    end
    dump(resStructure, "--------resStructure---------")
    local index2Pos = UniverseRaceConst.MAP_RELATION --对应表（UI上的控件索引 对应 数据上的位置）
    for i, zone in ipairs(resStructure) do
        for j, info in ipairs(zone) do
            for k, v in pairs(info) do
                index2Pos[k] = v
            end
        end
    end
    dump(index2Pos, "------------index2Pos--------------")
    local pos2Index = {} --数据pos对应ui索引
    for k, v in pairs(index2Pos) do
        pos2Index[v] = k
    end
    return index2Pos, pos2Index
end

function UniverseRaceDataHelper.getEndTime()
    local beginTime = G_UserData:getUniverseRace():getBegin_time()
    local endTime = beginTime + 3600 * (48 + 1) --2天1小时后必定结束
    local status = UniverseRaceDataHelper.getRaceStateAndTime()
    if status == UniverseRaceConst.RACE_STATE_CHAMPION_SHOW then
        endTime = G_ServerTime:getTime() - 1
    end
    return endTime
end

--获取发奖时间
function UniverseRaceDataHelper.getAwardTime()
    return 0
end

--获取比赛状态
function UniverseRaceDataHelper.getRaceStateAndTime()
    local curTime = G_ServerTime:getTime()
    local createTime = G_UserData:getUniverseRace():getCreate_time()
    local beginTime = G_UserData:getUniverseRace():getBegin_time()
    local nowRound = G_UserData:getUniverseRace():getNow_round()
    local roundBeginTime = G_UserData:getUniverseRace():getRound_begin_time()

    if createTime == 0 then
        return UniverseRaceConst.RACE_STATE_NONE        
    elseif curTime > createTime and roundBeginTime == 0 then
        return UniverseRaceConst.RACE_STATE_CHAMPION_SHOW --当前时间大于创建时间，轮次开始时间为0，表示比赛结束，进入了冠军展示阶段
	end

    local state = nil
    local targetTime = 0
    if curTime < createTime then
        state = UniverseRaceConst.RACE_STATE_NONE
        targetTime = createTime
    else
        if curTime < roundBeginTime then
            state = UniverseRaceConst.RACE_STATE_BREAK
            targetTime = roundBeginTime
        else
            state = UniverseRaceConst.RACE_STATE_ING
        end
    end

    return state, targetTime
end

--获取某轮单场竞猜列表
function UniverseRaceDataHelper.getSingleGuessListWithRound(round)
    local result = {}
	local positions = G_UserData:getUniverseRace():getPositionWithRound(round)
	for i, position in ipairs(positions) do
		local matchData = G_UserData:getUniverseRace():getMatchDataWithPosition(position)
		if matchData then
			local prePos = G_UserData:getUniverseRace():getPrePosOfPos(position)
			local userData1 = G_UserData:getUniverseRace():getUserDataWithPosition(prePos[1])
			local userData2 = G_UserData:getUniverseRace():getUserDataWithPosition(prePos[2])
            if userData1 and userData2 then
                local supportData = G_UserData:getUniverseRace():getSupportSingleUnitDataWithPosition(position)
                local supportId = supportData and supportData:getSupport() or 0
                local supportStates = {} 
                if supportId == userData1:getUser_id() then
                    supportStates[1] = UniverseRaceConst.GUESS_STATE_2
                    supportStates[2] = UniverseRaceConst.GUESS_STATE_3
                elseif supportId == userData2:getUser_id() then
                    supportStates[1] = UniverseRaceConst.GUESS_STATE_3
                    supportStates[2] = UniverseRaceConst.GUESS_STATE_2
                else
                    supportStates[1] = UniverseRaceConst.GUESS_STATE_1
                    supportStates[2] = UniverseRaceConst.GUESS_STATE_1
                end
				local info = {
                    [1] = {
                        userData = userData1,
                        supportNum = matchData:getAtk_user_support(),
                        supportState = supportStates[1],
                        pos = prePos[1],
                        parentPos = position,
                    },
                    [2] = {
                        userData = userData2,
                        supportNum = matchData:getDef_user_support(),
                        supportState = supportStates[2],
                        pos = prePos[2],
                        parentPos = position,
                    },
				}
				table.insert(result, info)
			end
		end
	end
	return result
end

--获取某轮串联竞猜列表
function UniverseRaceDataHelper.getMultipleGuessListWithRound(round)
    local temp = {}
	local positions = G_UserData:getUniverseRace():getPositionWithRound(round)
	for i, position in ipairs(positions) do
		local matchData = G_UserData:getUniverseRace():getMatchDataWithPosition(position)
        if matchData then
            local series = G_UserData:getUniverseRace():getSeriesWithPos(position)
            if temp[series] == nil then
                temp[series] = {series = series, data = {}}
            end
			local prePos = G_UserData:getUniverseRace():getPrePosOfPos(position)
			local userData1 = G_UserData:getUniverseRace():getUserDataWithPosition(prePos[1])
			local userData2 = G_UserData:getUniverseRace():getUserDataWithPosition(prePos[2])
            if userData1 and userData2 then
                local supportData = G_UserData:getUniverseRace():getSupportMutipleUnitDataWithPosition(position)
                local supportId = supportData and supportData:getSupport() or 0
                local supportStates = {} 
                if supportId == userData1:getUser_id() then
                    supportStates[1] = UniverseRaceConst.GUESS_STATE_2
                    supportStates[2] = UniverseRaceConst.GUESS_STATE_3
                elseif supportId == userData2:getUser_id() then
                    supportStates[1] = UniverseRaceConst.GUESS_STATE_3
                    supportStates[2] = UniverseRaceConst.GUESS_STATE_2
                else
                    supportStates[1] = UniverseRaceConst.GUESS_STATE_1
                    supportStates[2] = UniverseRaceConst.GUESS_STATE_1
                end
				local info = {
                    [1] = {
                        userData = userData1,
                        supportNum = matchData:getAtk_user_support(),
                        supportState = supportStates[1],
                        pos = prePos[1],
                        parentPos = position,
                    },
                    [2] = {
                        userData = userData2,
                        supportNum = matchData:getDef_user_support(),
                        supportState = supportStates[2],
                        pos = prePos[2],
                        parentPos = position,
                    },
				}
				table.insert(temp[series].data, info)
			end
		end
    end
    
    local temp2 = {}
    for series, unit in pairs(temp) do
        table.insert(temp2, unit)
    end
    table.sort(temp2, function(a, b)
        return a.series < b.series
    end)
    local result = {}
    for index, unit in ipairs(temp2) do
        table.insert(result, unit)
    end
	return result
end

--某轮单场竞猜是否可以支持
function UniverseRaceDataHelper.isCanSingleSupportWithRound(round)
    local isTimeOk = UniverseRaceDataHelper.checkCanGuess() --时间上可以竞猜
    if isTimeOk == false then
        return false
    end
    local costInfo = UniverseRaceDataHelper.getGuessCostConfig(round, UniverseRaceConst.GUESS_TYPE_1)
    if UserCheck.enoughValue(costInfo.type, costInfo.value, costInfo.size, false) == false then
		return false
	end
    local positions = G_UserData:getUniverseRace():getPositionWithRound(round)
	for i, position in ipairs(positions) do
		local supportData = G_UserData:getUniverseRace():getSupportSingleUnitDataWithPosition(position)
        local supportId = supportData and supportData:getSupport() or 0
        if supportId == 0 then
            return true
        end
    end
    return false
end

--某轮串联竞猜是否都支持过了
function UniverseRaceDataHelper.isCanMutipleSupportWithRound(round)
    local isTimeOk = UniverseRaceDataHelper.checkCanGuess() --时间上可以竞猜
    if isTimeOk == false then
        return false
    end
    local listData = UniverseRaceDataHelper.getMultipleGuessListWithRound(round)
    local costInfo = UniverseRaceDataHelper.getGuessCostConfig(round, UniverseRaceConst.GUESS_STATE_2)
    if UserCheck.enoughValue(costInfo.type, costInfo.value, costInfo.size, false) == false then
		return false
	end
    local positions = G_UserData:getUniverseRace():getPositionWithRound(round)
	for i, position in ipairs(positions) do
		local supportData = G_UserData:getUniverseRace():getSupportMutipleUnitDataWithPosition(position)
        local supportId = supportData and supportData:getSupport() or 0
        if supportId == 0 then
            return true
        end
    end
    return false
end

--获取个人竞猜结果列表
function UniverseRaceDataHelper.getSingleGuessResultList()
    local result = {}
    local totalNum = 0
    local correctNum = 0
    local nowRound = G_UserData:getUniverseRace():getNow_round()
    local round = nowRound - 1
    for i = round, 1, -1 do
        local positions = G_UserData:getUniverseRace():getPositionWithRound(i)
        for j, position in ipairs(positions) do
            local groupReportData = G_UserData:getUniverseRace():getGroupReportData(position)
            local matchData = G_UserData:getUniverseRace():getMatchDataWithPosition(position)
            if groupReportData and matchData then
                local userData1, userData2 = groupReportData:getUserDatas()
                if userData1 and userData2 then
                    local supportData = G_UserData:getUniverseRace():getSupportMutipleUnitDataWithPosition(position)
                    local supportId = supportData and supportData:getSupport() or 0
                    local isCorrect = false
                    local userLeft = userData1
                    local userRight = userData2
                    local isWin1 = false
                    local isWin2 = false
                    local resultStateLeft = groupReportData:getResultStateWithSide(UniverseRaceConst.SIDE_LEFT)
                    local resultStateRight = groupReportData:getResultStateWithSide(UniverseRaceConst.SIDE_RIGHT)
                    if resultStateLeft == UniverseRaceConst.RESULT_STATE_WIN then
                        isWin1 = true
                        if supportId == userData1:getUser_id() then
                            isCorrect = true
                        end
                    elseif resultStateRight == UniverseRaceConst.RESULT_STATE_WIN then
                        isWin2 = true
                        if supportId == userData2:getUser_id() then
                            isCorrect = true
                        end
                    end
                    local isLeftWin = isWin1
                    local isRightWin = isWin2
                    local supportNumLeft = matchData:getAtk_user_support()
                    local supportNumRight = matchData:getDef_user_support()
                    if supportId == userData2:getUser_id() then
                        userLeft = userData2
                        userRight = userData1
                        isLeftWin = isWin2
                        isRightWin = isWin1
                        supportNumLeft = matchData:getDef_user_support()
                        supportNumRight = matchData:getAtk_user_support()
                    end
                    local info = {
                        round = i,
                        datas = {
                            [1] = {
                                userData = userLeft,
                                isWin = isLeftWin,
                                supportNum = supportNumLeft,
                            },
                            [2] = {
                                userData = userRight,
                                isWin = isRightWin,
                                supportNum = supportNumRight,
                            },
                        },
                        isCorrect = isCorrect,
                    }
                    totalNum = totalNum + 1
                    if info.isCorrect == true then
                        correctNum = correctNum + 1
                    end
                    table.insert(result, info)
                end
            end
        end
		if i ~= 1 then
			table.insert(result, {isLine = true}) --轮次之间插入“分割线”
		end
    end

    return result, totalNum, correctNum
end

--获取串联竞猜结果列表
function UniverseRaceDataHelper.getMultipleGuessResultList()
    local result = {}
    local totalNum = 0
    local correctNum = 0
    local nowRound = G_UserData:getUniverseRace():getNow_round()
    local round = nowRound - 1
    for i = round, 1, -1 do
        local positions = G_UserData:getUniverseRace():getPositionWithRound(i)
        for j, position in ipairs(positions) do
            local groupReportData = G_UserData:getUniverseRace():getGroupReportData(position)
            local matchData = G_UserData:getUniverseRace():getMatchDataWithPosition(position)
            if groupReportData and matchData then
                local userData1, userData2 = groupReportData:getUserDatas()
                if userData1 and userData2 then
                    local supportData = G_UserData:getUniverseRace():getSupportMutipleUnitDataWithPosition(position)
                    local supportId = supportData and supportData:getSupport() or 0
                    local isCorrect = false
                    local userLeft = userData1
                    local userRight = userData2
                    local isWin1 = false
                    local isWin2 = false
                    local resultStateLeft = groupReportData:getResultStateWithSide(UniverseRaceConst.SIDE_LEFT)
                    local resultStateRight = groupReportData:getResultStateWithSide(UniverseRaceConst.SIDE_RIGHT)
                    if resultStateLeft == UniverseRaceConst.RESULT_STATE_WIN then
                        isWin1 = true
                        if supportId == userData1:getUser_id() then
                            isCorrect = true
                        end
                    elseif resultStateRight == UniverseRaceConst.RESULT_STATE_WIN then
                        isWin2 = true
                        if supportId == userData2:getUser_id() then
                            isCorrect = true
                        end
                    end
                    local isLeftWin = isWin1
                    local isRightWin = isWin2
                    local supportNumLeft = matchData:getAtk_user_support()
                    local supportNumRight = matchData:getDef_user_support()
                    if supportId == userData2:getUser_id() then
                        userLeft = userData2
                        userRight = userData1
                        isLeftWin = isWin2
                        isRightWin = isWin1
                        supportNumLeft = matchData:getDef_user_support()
                        supportNumRight = matchData:getAtk_user_support()
                    end
                    local info = {
                        round = i,
                        datas = {
                            [1] = {
                                userData = userLeft,
                                isWin = isLeftWin,
                                supportNum = supportNumLeft,
                            },
                            [2] = {
                                userData = userRight,
                                isWin = isRightWin,
                                supportNum = supportNumRight,
                            },
                        },
                        isCorrect = isCorrect,
                    }
                    totalNum = totalNum + 1
                    if info.isCorrect == true then
                        correctNum = correctNum + 1
                    end
                    table.insert(result, info)
                end
            end
        end
    end

    return result, totalNum, correctNum
end


function UniverseRaceDataHelper.checkCanGuess()
    local raceState = UniverseRaceDataHelper.getRaceStateAndTime()
    if raceState == UniverseRaceConst.RACE_STATE_BREAK then
        return true
    else
        return false
    end
end

--获取竞猜消耗武将列表
-- function UniverseRaceDataHelper.getGuessCostHeroList()
--     local temp = {}
--     local allHeroList = G_UserData:getHero():getAllHeros()
--     for k, unit in pairs(allHeroList) do
--         local isInBattle = unit:isInBattle()
--         local isInReinforcements = unit:isInReinforcements()
--         if unit:getConfig().type == 2 
--             and unit:getConfig().color == 5 --橙色
--             and not isInBattle 
--             and not isInReinforcements 
--             and not unit:isDidTrain() then
--             table.insert(temp, unit)
--         end
--     end

--     table.sort(temp, function(a, b)
--         return a:getConfig().id < b:getConfig().id
--     end)

--     local result = clone(temp)

--     return result
-- end

--获取奖池数据
function UniverseRaceDataHelper.getGuessRewardPotList(totalNum)
    local result = {}
    for index = 1, 3 do
        local info = UniverseRaceDataHelper.getRewardPotConfig(index)
        local rate = info.award_rate
        local num = math.ceil(totalNum * rate / 100)
        local unit = {num = num, rate = rate}
        table.insert(result, unit)
    end
    return result
end

return UniverseRaceDataHelper