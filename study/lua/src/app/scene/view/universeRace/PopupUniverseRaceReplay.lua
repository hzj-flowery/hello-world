--
-- Author: Liangxu
-- Date: 2019-10-28
-- 
local PopupBase = require("app.ui.PopupBase")
local PopupUniverseRaceReplay = class("PopupUniverseRaceReplay", PopupBase)
local UniverseRaceReplayCell = require("app.scene.view.universeRace.UniverseRaceReplayCell")
local UniverseRaceConst = require("app.const.UniverseRaceConst")
local UIHelper = require("yoka.utils.UIHelper")

function PopupUniverseRaceReplay:ctor(groupReportData)
	self._groupReportData = groupReportData
	self._replays = self._groupReportData:getReportDatas()

	local resource = {
		file = Path.getCSB("PopupUniverseRaceReplay", "universeRace"),
		binding = {}
	}
	self:setName("PopupUniverseRaceReplay")
	PopupUniverseRaceReplay.super.ctor(self, resource)
end

function PopupUniverseRaceReplay:onCreate()
	self._curReportId = 0
	self._nodeBg:addCloseEventListener(handler(self, self._onButtonClose))
	self._nodeBg:setTitle(Lang.get("universe_race_replay_title"))

	self._listView:setTemplate(UniverseRaceReplayCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupUniverseRaceReplay:onEnter()
	self._signalGetBattleReport = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_GET_REPORT, handler(self, self._onEventGetReport))

	self:_updateUsers()
    self:_updateList()
end

function PopupUniverseRaceReplay:onExit()
    self._signalGetBattleReport:remove()
    self._signalGetBattleReport = nil
end

function PopupUniverseRaceReplay:_updateUsers()
	local function updateUser(data, index)
		local isWin = data.isWin
		local voteCount = data.voteCount
		local userData = data.user

		local resName = isWin and "txt_com_battle_win" or "txt_com_battle_lose"
		self["_imageResult"..index]:loadTexture(Path.getBattleFont(resName))
		self["_textVoteCount"..index]:setString(voteCount)
		local covertId, limitLevel, limitRedLevel = userData:getCovertIdAndLimitLevel()
		self["_nodeIcon"..index]:updateUI(covertId, nil, limitLevel, limitRedLevel)
		local serverName = require("app.utils.TextHelper").cutText(userData:getServer_name(), 5)
		self["_textServer"..index]:setString(serverName)
		self["_textName"..index]:setString(userData:getUser_name())
		local officerLevel = userData:getOfficer_level()
		self["_textName"..index]:setColor(Colors.getOfficialColor(officerLevel))
		UIHelper.updateTextOfficialOutline(self["_textName"..index], officerLevel)
		self["_textPower"..index]:setString(userData:getPower())
		
		--排版
		if index == 1 then
			local posX, posY = self["_textServer"..index]:getPosition()
			local size = self["_textServer"..index]:getContentSize()
			self["_textName"..index]:setPositionX(posX + size.width + 5)
		elseif index == 2 then
			local posX, posY = self["_textName"..index]:getPosition()
			local size = self["_textName"..index]:getContentSize()
			self["_textServer"..index]:setPositionX(posX - size.width - 5)
		end
	end

	local datas = {}
	datas[1] = {}
	datas[2] = {}
	local winNum1 = self._groupReportData:getWinNum1()
	local winNum2 = self._groupReportData:getWinNum2()
	if winNum1 == UniverseRaceConst.MAX_WIN_COUNT then
		datas[1].isWin = true
		datas[2].isWin = false
	elseif winNum2 == UniverseRaceConst.MAX_WIN_COUNT then
		datas[1].isWin = false
		datas[2].isWin = true
	end
	local userData1, userData2 = self._groupReportData:getUserDatas()
	datas[1].user = userData1
	datas[2].user = userData2
	local supportNum1, supportNum2 = self._groupReportData:getSupportNum()
	datas[1].voteCount = supportNum1
	datas[2].voteCount = supportNum2
	for i = 1, 2 do
		local data = datas[i]
		updateUser(data, i)
	end
end

function PopupUniverseRaceReplay:_updateList()
	self._listView:clearAll()
    self._listView:resize(#self._replays)
end

function PopupUniverseRaceReplay:_onItemUpdate(item, index)
	local index = index + 1
	local data = self._replays[index]
	if data then
		item:update(data, index)
	end
end

function PopupUniverseRaceReplay:_onItemSelected(item, index)
	
end

function PopupUniverseRaceReplay:_onItemTouch(index, t)
	local index = index + t
	local replay = self._replays[index]
	local reportId = replay:getReport_id()
	G_UserData:getUniverseRace():c2sGetBattleReport(reportId)
	self._curReportId = reportId
end

function PopupUniverseRaceReplay:_onButtonClose()
    self:close()
end

function PopupUniverseRaceReplay:_onEventGetReport(eventName, battleReport, id)
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
        local battleData = require("app.utils.BattleDataHelper").parseUniverseRace(leftName, rightName, leftOfficer, rightOfficer, winPos)
    
        G_SceneManager:showScene("fight", reportData, battleData)
    end
    if id == self._curReportId then
        logWarn(string.format("PopupUniverseRaceReplay:_onEventGetReport battleReport = %d", battleReport))
        G_SceneManager:registerGetReport(battleReport, function() enterFightView() end)
    end
end

return PopupUniverseRaceReplay