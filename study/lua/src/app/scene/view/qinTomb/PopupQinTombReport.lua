--秦皇陵战报

local PopupBase = require("app.ui.PopupBase")
local PopupQinTombReport = class("PopupQinTombReport", PopupBase)
local Path = require("app.utils.Path")
local PopupQinTombReportCell = require("app.scene.view.qinTomb.PopupQinTombReportCell")
local QinTombBattleResultAnimation = import(".QinTombBattleResultAnimation")
PopupQinTombReport.MAX_REPORT_SIZE = 10

function PopupQinTombReport:ctor()
	--
	self._title = Lang.get("qin_battle_report")
    self._listViewItem = nil
    self._commonNodeBk = nil
	self._nodeTab = nil
	self._reportList = {}
	--
	local resource = {
		file = Path.getCSB("PopupQinTombReport", "qinTomb"),
		binding = {

		}
	}
	PopupQinTombReport.super.ctor(self, resource, true)
end


function PopupQinTombReport:onCreate()
    self._commonNodeBk:setTitle(self._title)
    self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))

	self._listViewItem:setTemplate(PopupQinTombReportCell)
	self._listViewItem:setCallback(handler(self, self._onListViewItemItemUpdate), handler(self, self._onListViewItemItemSelected))
	self._listViewItem:setCustomCallback(handler(self, self._onListViewItemItemTouch))	
end





function PopupQinTombReport:_onListViewItemItemUpdate(item, index)

	local data = self._reportList[ index + 1 ]
	if data then
		item:updateUI( data ,index )
	end
	

end

function PopupQinTombReport:_onListViewItemItemTouch(index)

end

function PopupQinTombReport:_onListViewItemItemSelected(item, index)

end


--
function PopupQinTombReport:onBtnCancel()
	self:close()
end


function PopupQinTombReport:onEnter()
	self._getReport = G_SignalManager:add(SignalConst.EVENT_GET_COMMON_REPORT_LIST, handler(self, self._onGetReport))

	G_UserData:getQinTomb():c2sCommonGetReport()
end

function PopupQinTombReport:onExit()
    self._getReport:remove()
	self._getReport = nil
end

--获得战报
function PopupQinTombReport:_onGetReport(id, message)
	if message.ret ~= 1  then
		return
	end

	local reportList = rawget(message,"grave_reports") or {}
	
	local sortFunc = function (obj1,obj2)
		return obj1.report_time > obj2.report_time
	end

	table.sort(reportList, sortFunc)
	self._reportList = reportList
	self:_updateListView()	

--test code
--[[
	local report = reportList[1]

	local popupBattleResult = QinTombBattleResultAnimation.new()
	popupBattleResult:updateUI(report)
	popupBattleResult:showResult(finishCallBack)
]]

end

function PopupQinTombReport:_updateListView()
	local lineCount = #self._reportList
	if self._listViewItem and lineCount > 0 then
		self._listViewItem:resize(lineCount)
	end
	self._nodeEmpty:setVisible(lineCount <= 0 )
end

function PopupQinTombReport:_initListItemSource()
	-- body
end


return PopupQinTombReport
