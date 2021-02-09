--竞技场战报
local PopupBase = require("app.ui.PopupBase")
local PopupArenaReport = class("PopupArenaReport", PopupBase)
local Path = require("app.utils.Path")

local PopupArenaReportCell = require("app.scene.view.arena.PopupArenaReportCell")

PopupArenaReport.MAX_REPORT_SIZE = 10
function PopupArenaReport:ctor()
	--
	self._title = Lang.get("arena_report_rank_title")
    self._listViewItem = nil
    self._commonNodeBk = nil
	self._nodeTab = nil
	--
	local resource = {
		file = Path.getCSB("PopupArenaReport", "arena"),
		binding = {

		}
	}
	PopupArenaReport.super.ctor(self, resource, true)
end


function PopupArenaReport:onCreate()
    self._commonNodeBk:setTitle(self._title)
    self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))

	self:_initTab()

end


function PopupArenaReport:_initTab()

	local param = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		offset = 0,
		textList = {Lang.get("arena_report_atk_tab"),Lang.get("arena_report_def_tab")}
	}
	self._nodeTab:recreateTabs(param)

end

function PopupArenaReport:_onItemTouch(index)

end



function PopupArenaReport:_onItemUpdate(item, index)

	item:updateUI(index, self._reportList[ index + 1 ] )

end

function PopupArenaReport:_onItemSelected(item, index)

end


function PopupArenaReport:_onTabSelect(index)
	if self._tabIndex == index then
		return
	end
	self._tabIndex = index

	self._titleName:setString(Lang.get("arena_report_sub_title"..index))

	self._textBattleReportCount:setString("0/10")

	G_UserData:getArenaData():c2sCommonGetReport(self:_getReportType())

end




--
function PopupArenaReport:onBtnCancel()
	self:close()
end

function PopupArenaReport:_getReportType()
	if self._tabIndex == 1 then
		return 2--进攻
	end
	if self._tabIndex == 2 then
		return 1
	end
end


function PopupArenaReport:onShowFinish()
	self._nodeTab:setTabIndex(1)
end

function PopupArenaReport:onEnter()
	self._getReport = G_SignalManager:add(SignalConst.EVENT_GET_COMMON_REPORT_LIST, handler(self, self._onGetReport))
end

function PopupArenaReport:onExit()
    self._getReport:remove()
	self._getReport = nil
end

--获得战报
function PopupArenaReport:_onGetReport(id, message)
	if message.ret ~= 1  then
		return
	end
	if message.report_type == self:_getReportType() then

		local arenaList = rawget(message,"arena_reports") or {}
		
		local sortFunc = function (obj1,obj2)
			return obj1.fight_time > obj2.fight_time
		end

		table.sort(arenaList, sortFunc)
		self._reportList = arenaList
		self:_updateListView()
	end
end

function PopupArenaReport:_updateListView()

	local lineCount = #self._reportList
	if self._listViewItem then
		local listView = self._listViewItem
		listView:clearAll()
		listView:setTemplate(PopupArenaReportCell)
		listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
		listView:setCustomCallback(handler(self, self._onItemTouch))
		listView:resize(lineCount)
	end

	self._textBattleReportCount:setString(lineCount.."/"..PopupArenaReport.MAX_REPORT_SIZE) --战报数量最大上限是10

	self._nodeEmpty:setVisible(lineCount <= 0 )
end

return PopupArenaReport
