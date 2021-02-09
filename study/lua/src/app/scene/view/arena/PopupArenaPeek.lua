--竞技场巅峰对决弹出界面

local PopupBase = require("app.ui.PopupBase")
local PopupArenaPeek = class("PopupArenaPeek", PopupBase)
local Path = require("app.utils.Path")
local PopupArenaPeekCell = require("app.scene.view.arena.PopupArenaPeekCell")


function PopupArenaPeek:waitEnterMsg(callBack)
	self._reportList = {}
	local function onMsgCallBack(id, message)
		local arenaList = rawget(message,"report") or {}
		local sortFunc = function (obj1,obj2)
			return obj1.defense_rank < obj2.defense_rank
		end
		table.sort(arenaList, sortFunc)
		self._reportList = arenaList
		callBack()
	end
	G_UserData:getArenaData():c2sGetArenaTopTenReport()

	--G_UserData:getArenaData():c2sGetArenaInfo()
    return G_SignalManager:add(SignalConst.EVENT_ARENA_GET_ARENA_TOP_TEN_INFO, onMsgCallBack)
end


function PopupArenaPeek:ctor()
	--
	self._title = Lang.get("arena_peek_title")
    self._listViewItem = nil
    self._commonNodeBk = nil
	--self._reportList = {}
	--
	local resource = {
		file = Path.getCSB("PopupArenaPeek", "arena"),
		binding = {

		}
	}
	PopupArenaPeek.super.ctor(self, resource, true)
end

function PopupArenaPeek:onCreate()
    self._commonNodeBk:setTitle(self._title)
    self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
end


function PopupArenaPeek:_onItemTouch(index, reportId)
	dump(reportId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetBattleReport, {id = reportId})
end

function PopupArenaPeek:_onItemUpdate(item, index)
	if #self._reportList > 0 then
		if self._reportList[ index + 1 ] ~=nil then
			item:updateUI(index, self._reportList[ index + 1 ] )
		end
	end
end

function PopupArenaPeek:_onItemSelected(item, index)

end

function PopupArenaPeek:onEnter()
	self._getChallengeArena = G_SignalManager:add(SignalConst.EVENT_ARENA_GET_ARENA_TOP_TEN_INFO, handler(self, self._onEventGetChallengeReport))
	self._getBattleReport   = G_SignalManager:add(SignalConst.EVENT_GET_ARENA_BATTLE_REPORT, handler(self, self._onEventGetBattleReport))

	self:_updateListView()
end

function PopupArenaPeek:onExit()
    self._getChallengeArena:remove()
	self._getChallengeArena = nil
	self._getBattleReport:remove()
	self._getBattleReport = nil
end

--
function PopupArenaPeek:onBtnCancel()
	self:close()
end

--获得战报
function PopupArenaPeek:_onEventGetChallengeReport(id, message)

	local arenaList = rawget(message,"report") or {}
	local sortFunc = function (obj1,obj2)
		return obj1.defense_rank < obj2.defense_rank
	end


	table.sort(arenaList, sortFunc)
	self._reportList = arenaList

	self:_updateListView()

end

function PopupArenaPeek:_updateListView()
	local lineCount = #self._reportList

	if lineCount > 0 and self._listViewItem then
	    local listView = self._listViewItem
		listView:setTemplate(PopupArenaPeekCell)
		listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
		listView:setCustomCallback(handler(self, self._onItemTouch))
		listView:resize(lineCount)
	end

	self._nodeEmpty:setVisible(lineCount <= 0)
end

function PopupArenaPeek:_onEventGetBattleReport(id, message)

	local reportId = message.id

	local function getReportMsg(reportId)
		for i, value in ipairs(self._reportList) do
			if value.report_id == reportId then
				return value
			end
		end
		return nil
	end

	local function enterFightView(reportId)
		local arenaBattleMsg = getReportMsg(reportId)
		local ReportParser = require("app.fight.report.ReportParser")
		local battleReport = G_UserData:getFightReport():getReport()
		local reportData = ReportParser.parse(battleReport)
		local battleData = require("app.utils.BattleDataHelper").parseBattleReportData(arenaBattleMsg)
		G_SceneManager:showScene("fight", reportData, battleData)
	end
	G_SceneManager:registerGetReport(message.battle_report, function() enterFightView(reportId) end)

	--获得Cell的数据
	-- local arenaBattleMsg = getReportMsg(reportId)
	-- local battleReport = rawget(message,"battle_report") or {}

	-- local ReportParser = require("app.fight.report.ReportParser")
    -- local reportData = ReportParser.parse(battleReport)

    -- local battleData = require("app.utils.BattleDataHelper").parseBattleReportData(arenaBattleMsg)

    -- G_SceneManager:showScene("fight", reportData, battleData)
end

return PopupArenaPeek
