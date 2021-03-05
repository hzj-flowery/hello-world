
--真武战神战报组数据
local BaseData = require("app.data.BaseData")
local UniverseRaceGroupReportData = class("UniverseRaceGroupReportData", BaseData)
local SingleRaceReportData = require("app.data.SingleRaceReportData")
local UniverseRaceConst = require("app.const.UniverseRaceConst")

local schema = {}
schema["position"] = {"number", 0}
schema["winNum1"] = {"number", 0}
schema["winNum2"] = {"number", 0}
UniverseRaceGroupReportData.schema = schema

function UniverseRaceGroupReportData:ctor(properties)
    UniverseRaceGroupReportData.super.ctor(self, properties)
    self._reportDatas = {}
end

function UniverseRaceGroupReportData:clear()
	
end

function UniverseRaceGroupReportData:reset()
	self._reportDatas = {}
end

function UniverseRaceGroupReportData:updateData(report)
    local position = self:getPosition()
    if position == 0 then
        local pos = rawget(report, "position")
        self:setPosition(pos)
    end
    local battleNo = rawget(report, "battle_no")
    local unitData = self:getUnitReport(battleNo)
    if unitData == nil then
        unitData = SingleRaceReportData.new()
        self._reportDatas[battleNo] = unitData
    end
    unitData:updateData(report)

    self:_updateWinNum()
end

function UniverseRaceGroupReportData:_updateWinNum()
    local lastWinNum1 = self:getWinNum1()
    local lastWinNum2 = self:getWinNum2()
    local winNum1 = 0
    local winNum2 = 0
    for battleNo, reportData in pairs(self._reportDatas) do
        local winnerSide = reportData:getWinnerSide()
        if winnerSide == UniverseRaceConst.SIDE_LEFT then
            winNum1 = winNum1 + 1
        elseif winnerSide == UniverseRaceConst.SIDE_RIGHT then
            winNum2 = winNum2 + 1
        end
    end
    self:setWinNum1(winNum1)
    self:setWinNum2(winNum2)

    local userData1, userData2 = self:getUserDatas()
    if lastWinNum1 == UniverseRaceConst.MAX_WIN_COUNT - 1 and winNum1 == UniverseRaceConst.MAX_WIN_COUNT then
        if userData2 then
            userData2:setEliminated(true)
            G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_MATCH_FINISH, self:getPosition(), userData2:getUser_id()) --产生负者，右侧
        end
    elseif lastWinNum2 == UniverseRaceConst.MAX_WIN_COUNT - 1 and winNum2 == UniverseRaceConst.MAX_WIN_COUNT then
        if userData1 then
            userData1:setEliminated(true)
            G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_MATCH_FINISH, self:getPosition(), userData1:getUser_id()) --产生负者，左侧
        end
    end
	
	if lastWinNum1 ~= winNum1 then
		G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_SCORE_CHANGE, self:getPosition(), UniverseRaceConst.SIDE_LEFT) --左边比分发生变化
	end
	if lastWinNum2 ~= winNum2 then
		G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_SCORE_CHANGE, self:getPosition(), UniverseRaceConst.SIDE_RIGHT) --右边比分发生变化
	end
end

function UniverseRaceGroupReportData:getReportDatas()
    return self._reportDatas
end

function UniverseRaceGroupReportData:getReportNum()
    local num = 0
    for k, v in pairs(self._reportDatas) do
        num = num + 1
    end
    return num
end

function UniverseRaceGroupReportData:getUnitReport(battleNo)
    local unitData = self._reportDatas[battleNo]
    return unitData
end

function UniverseRaceGroupReportData:getResultStateWithSide(side)
    local winNum1 = self:getWinNum1()
    local winNum2 = self:getWinNum2()
	if winNum1 == UniverseRaceConst.MAX_WIN_COUNT then
		if side == UniverseRaceConst.SIDE_LEFT then
			return UniverseRaceConst.RESULT_STATE_WIN
		elseif side == UniverseRaceConst.SIDE_RIGHT then
			return UniverseRaceConst.RESULT_STATE_LOSE
		end
	elseif winNum2 == UniverseRaceConst.MAX_WIN_COUNT then
		if side == UniverseRaceConst.SIDE_LEFT then
			return UniverseRaceConst.RESULT_STATE_LOSE
		elseif side == UniverseRaceConst.SIDE_RIGHT then
			return UniverseRaceConst.RESULT_STATE_WIN
		end
	elseif winNum1 > 0 or winNum2 > 0 then
		return UniverseRaceConst.RESULT_STATE_ING
	else
		return UniverseRaceConst.RESULT_STATE_NONE
	end
end

--比赛是否已经决出胜负
function UniverseRaceGroupReportData:isMatchEnd()
    local winNum1 = self:getWinNum1()
    local winNum2 = self:getWinNum2()
	if winNum1 == UniverseRaceConst.MAX_WIN_COUNT or winNum2 == UniverseRaceConst.MAX_WIN_COUNT then
		return true
	else
		return false
	end
end

--获取双方玩家数据
function UniverseRaceGroupReportData:getUserDatas()
    local userData1 = nil
    local userData2 = nil
    local replay = self._reportDatas[1] --取一组，找到玩家Id
    if replay then
        local userId1 = replay:getAtk_user()
        local userId2 = replay:getDef_user()
        userData1 = G_UserData:getUniverseRace():getUserDataWithId(userId1)
        userData2 = G_UserData:getUniverseRace():getUserDataWithId(userId2)
    end
	return userData1, userData2
end

--获取双方的支持数
function UniverseRaceGroupReportData:getSupportNum()
    local position = self:getPosition()
    local matchData = G_UserData:getUniverseRace():getMatchDataWithPosition(position)
    local num1 = matchData:getAtk_user_support()
    local num2 = matchData:getDef_user_support()
    return num1, num2
end

return UniverseRaceGroupReportData