local PopupBase = require("app.ui.PopupBase")
local PopupReport = class("PopupReport", PopupBase)

local PopupReportCell = require("app.scene.view.mineCraft.PopupReportCell")

PopupReport.TYPE_ATTACK = 1
PopupReport.TYPE_DEF = 2

PopupReport.MAX_REPORT_SIZE = 10

function PopupReport:waitEnterMsg(callBack, msgParam)
	local function onMsgCallBack(id, message)
		callBack()
	end
    G_UserData:getMineCraftData():c2sCommonGetReport()

    local signal = G_SignalManager:add(SignalConst.EVENT_GET_MINE_ATTACK_REPORT, onMsgCallBack)
    return signal
end

function PopupReport:ctor()
    self._reports = {}
	local resource = {
		file = Path.getCSB("PopupReport", "mineCraft"),
		-- binding = {
		-- 	_btnClose = {
		-- 		events = {{event = "touch", method = "_onCloseClick"}}
		-- 	},
		-- 	_btnChange = {
		-- 		events = {{event = "touch", method = "_onChangeClick"}}
		-- 	}
		-- }
	}
	PopupReport.super.ctor(self, resource)

    self._signalAttackReport = nil
end

function PopupReport:onCreate()
    self._commonNodeBk:setTitle(Lang.get("mine_report_title"))
    self._commonNodeBk:addCloseEventListener(function() self:closeWithAction() end)
    self:_refreshReport()
end

function PopupReport:onEnter()
	self._signalAttackReport = G_SignalManager:add(SignalConst.EVENT_GET_MINE_ATTACK_REPORT, handler(self, self._refreshReport))
end

function PopupReport:onExit()
    self._signalAttackReport:remove()
    self._signalAttackReport = nil
end

function PopupReport:_refreshReport(eventName)
	local reports = G_UserData:getMineCraftData():getAttackReport()
    self._reports = reports
    local lineCount = #self._reports
	if self._listViewItem then
		local listView = self._listViewItem
		listView:clearAll()
		listView:setTemplate(PopupReportCell)
		listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
		listView:setCustomCallback(handler(self, self._onItemTouch))
		listView:resize(lineCount)
    end
    self._nodeEmpty:setVisible(lineCount <= 0 )
end

function PopupReport:_onItemUpdate(item, index)
	item:updateUI(index, self._reports[ index + 1 ] )
end

function PopupReport:_onItemSelected(item, index)

end

return PopupReport

