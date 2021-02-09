-- @Author panhoa
-- @Date 8.16.2018
-- @Role

local PopupBase = require("app.ui.PopupBase")
local PopupOwnFightReportView = class("PopupOwnFightReportView", PopupBase)
local TabScrollView = require("app.utils.TabScrollView")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")
local OwnFightReportCell = require("app.scene.view.seasonSport.OwnFightReportCell")


-- @Role Get Connected-Info while Entry(Obsolutly in SeasonSportView.lua
function PopupOwnFightReportView:waitEnterMsg(callBack)
	local function onMsgCallBack(id, message)
		callBack()
	end

	G_UserData:getSeasonSport():c2scFightsReport()
	local signal = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_OWNFIGHTREPORT, onMsgCallBack)
	return signal
end

function PopupOwnFightReportView:ctor()
    self._commonNodeBk  = nil
    self._scrollView    = nil
    self._isSelectedWin = nil
    self._textSeasonFightNum = nil
    self._textSeasonFightRate= nil
    self._ownReportData = {}
    self._ownDanInfo = {}

	local resource = {
		file = Path.getCSB("PopupOwnFightReportView", "seasonSport"),
	}
	self:setName("PopupOwnFightReportView")
	PopupOwnFightReportView.super.ctor(self, resource, false, false)
end

function PopupOwnFightReportView:onCreate()
    self._commonNodeBk:setTitle(Lang.get("season_own_report"))
    self._commonNodeBk:addCloseEventListener(handler(self, self._btnClose))
    self:_initScrollView()
end

function PopupOwnFightReportView:onEnter()
    self._playReport       = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_PLAYFIGHTREPORT, handler(self, self._onPlayReport))		-- 播放战报
    self._listnerSeasonEnd = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_END, handler(self, self._onListnerSeasonEnd))			-- 监听赛季结束

    self._ownReportData = G_UserData:getSeasonSport():getOwnFightReport()
    self:_updateScrollView()
    self:_updateOwnFightUI()
end

function PopupOwnFightReportView:onExit()
    self._playReport:remove()
    self._listnerSeasonEnd:remove()
    self._playReport = nil
    self._listnerSeasonEnd = nil
end

function PopupOwnFightReportView:_onListnerSeasonEnd()
    G_UserData:getSeasonSport():c2sFightsEntrance()
    self:close()
end

function PopupOwnFightReportView:_btnClose()
    self:close()
end

function PopupOwnFightReportView:_initScrollView()
	local scrollViewParam = {}
	scrollViewParam.template = OwnFightReportCell
	scrollViewParam.updateFunc = handler(self, self._onCellUpdate)
	scrollViewParam.selectFunc = handler(self, self._onCellSelected)
	scrollViewParam.touchFunc = handler(self, self._onCellTouch)
	self._ownReportView = TabScrollView.new(self._scrollView, scrollViewParam, 1)
end

function PopupOwnFightReportView:_updateScrollView()
    local maxCount = table.nums(self._ownReportData)
	if not self._ownReportData or maxCount <= 0 then
		return
	end

    self._ownReportView:updateListView(1, maxCount)
end

-- @Role    Own's Fight
function PopupOwnFightReportView:_updateOwnFightUI()
    local winNum = G_UserData:getSeasonSport():getSeason_Win_Num()
    local fightNum = G_UserData:getSeasonSport():getSeason_Fight_Num()
    local strWinRate = "0.00%" 
    if fightNum ~= 0 then
       strWinRate = string.format("%.2f", (100 * winNum / fightNum)).."%"
    end
    self._textSeasonFightNum:setString(fightNum)
    self._textSeasonFightRate:setString(strWinRate)
end

function PopupOwnFightReportView:_onCellUpdate(cell, index)
    if not self._ownReportData or table.nums(self._ownReportData) <= 0 then
		return
    end
    
    local curIndex = (index + 1)
    local cellData = {}
    if self._ownReportData[curIndex] then
        cellData = self._ownReportData[curIndex]
        cellData.index = curIndex
        cell:updateUI(cellData)
    end
end

function PopupOwnFightReportView:_onCellSelected(cell, index)
end

-- @Role    请求播放战报
function PopupOwnFightReportView:_onCellTouch(index, data)
    G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_CANCEL_MATCHWHILEREPORT)
    self._isSelectedWin = data.is_win
    self._ownDanInfo = {
		isOwn 	= true,
		sid   	= G_UserData:getBase():getServer_name(),
		star	= rawget(data, "user_star") ~= nil and data.user_star or G_UserData:getSeasonSport():getCurSeason_Star(),
		name	= G_UserData:getBase():getName(),
		officialLevel = G_UserData:getBase():getOfficialLevel()
    }
    self._otherDanInfo = {
		isOwn 	= false,
		sid   	= data.sname,
		name  	= data.op_name,
		star  	= data.op_star,
		officialLevel = data.op_title,
	}
    G_UserData:getSeasonSport():c2scPlayFightsReport(data.report_id)
end

-- @Role    播放战报
function PopupOwnFightReportView:_onPlayReport(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end

    local function enterFightView(message)
        local battleReport = G_UserData:getFightReport():getReport()
        self._ownDanInfo.isProir = (battleReport.is_win == self._isSelectedWin or false)
        self._otherDanInfo.isProir = not self._ownDanInfo.isProir
        battleReport.is_win = self._isSelectedWin
        local ReportParser = require("app.fight.report.ReportParser")
        local reportData = ReportParser.parse(battleReport)
        local battleData = require("app.utils.BattleDataHelper").parseSeasonSportData(message, true)
        battleData.is_win = battleReport.is_win
        battleData.ownDanInfo = self._ownDanInfo
        battleData.otherDanInfo = self._otherDanInfo
        G_SceneManager:showScene("fight", reportData, battleData)
	end
	G_SceneManager:registerGetReport(message.battle_report, function() enterFightView(message) end)
end

return PopupOwnFightReportView