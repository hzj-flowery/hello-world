
local PopupBase = require("app.ui.PopupBase")
local PopupSingleRaceReplay = class("PopupSingleRaceReplay", PopupBase)
local PopupSingleRaceReplayCell = require("app.scene.view.singleRace.PopupSingleRaceReplayCell")

function PopupSingleRaceReplay:ctor(replays)
    self._replays = replays
	local resource = {
		file = Path.getCSB("PopupSingleRaceReplay", "singleRace"),
		binding = {
			
		}
	}
    self:setName("PopupSingleRaceReplay")
	PopupSingleRaceReplay.super.ctor(self, resource)
end

function PopupSingleRaceReplay:onCreate()
    self._curReportId = 0
    self._popBG:addCloseEventListener(handler(self, self._onButtonClose))
    self._popBG:setTitle(Lang.get("camp_replay_title"))
    self._popBG:setTitlePositionX(477)
    self._listView:setTemplate(PopupSingleRaceReplayCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupSingleRaceReplay:onEnter()
	self._signalGetBattleReport = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_GET_REPORT, handler(self, self._onEventGetReport))
	self:_updateList()
    self:_updateScore()
end

function PopupSingleRaceReplay:onExit()
    self._signalGetBattleReport:remove()
    self._signalGetBattleReport = nil
end

function PopupSingleRaceReplay:_updateList()
	self._listView:clearAll()
    self._listView:resize(#self._replays)
end

function PopupSingleRaceReplay:_updateScore()
    local score1, score2 = G_UserData:getSingleRace():getWinNumWithReportData(self._replays)
    self._textScore:setString(Lang.get("single_race_replay_score", {score1 = score1, score2 = score2}))
end

function PopupSingleRaceReplay:_onItemUpdate(item, index)
    local round = index + 1
    local replay = self._replays[round]
    if replay then
        local isLast = #self._replays == round
    	item:update(replay, round, isLast)
    end
end

function PopupSingleRaceReplay:_onItemSelected(item, index)
	
end

function PopupSingleRaceReplay:_onItemTouch(index, reportId)
 	G_UserData:getSingleRace():c2sGetBattleReport(reportId)
    self._curReportId = reportId
end

function PopupSingleRaceReplay:_onButtonClose()
    self:close()
end

function PopupSingleRaceReplay:_onEventGetReport(eventName, battleReport, id)
    local function enterFightView()
        local battleReport = G_UserData:getFightReport():getReport()
        local ReportParser = require("app.fight.report.ReportParser")
        local reportData = ReportParser.parse(battleReport)
        local leftName = reportData:getLeftName()
        local leftOfficer = reportData:getAttackOfficerLevel()
        local rightName = reportData:getRightName()
        local rightOfficer = reportData:getDefenseOfficerLevel()
        local winPos = 1 
        if not reportData:isWin() then 
            winPos = 2
        end
        local battleData = require("app.utils.BattleDataHelper").parseSingleRace(leftName, rightName, leftOfficer, rightOfficer, winPos)
    
        G_SceneManager:showScene("fight", reportData, battleData)
    end
    if id == self._curReportId then
        logWarn(string.format("PopupSingleRaceReplay:_onEventGetReport battleReport = %d", battleReport))
        G_SceneManager:registerGetReport(battleReport, function() enterFightView() end)
    end
end

return PopupSingleRaceReplay