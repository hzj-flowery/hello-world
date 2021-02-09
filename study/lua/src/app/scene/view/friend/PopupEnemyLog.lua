
-- Author: nieming
-- Date:2018-04-24 16:06:35
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupEnemyLog = class("PopupEnemyLog", PopupBase)

function PopupEnemyLog:waitEnterMsg(callBack)
	local function onMsgCallBack(id, logList)
		local dialog = callBack()
		if dialog and dialog.updateView then
			dialog:updateView(id, logList)
		end
	end
	G_UserData:getEnemy():c2sCommonGetReport()
	return G_SignalManager:add(SignalConst.EVENT_ENEMY_BATTLE_REPORT_SUCCESS, onMsgCallBack)
end

function PopupEnemyLog:ctor()

	--csb bind var name
	self._listView = nil  --ScrollView
	self._popMid = nil  --CommonNormalSmallPop
	self._logDatas = {}
	local resource = {
		file = Path.getCSB("PopupEnemyLog", "friend"),

	}
	PopupEnemyLog.super.ctor(self, resource)
end

-- Describle：
function PopupEnemyLog:onCreate()
	self._popMid:setTitle(Lang.get("lang_friend_enemy_log_title"))
	self._popMid:addCloseEventListener(handler(self, self.close))
end

-- Describle：
function PopupEnemyLog:onEnter()

end

-- Describle：
function PopupEnemyLog:onExit()

end

function PopupEnemyLog:updateView(id, logList)
	local targetList = {}
	local logDatas = {}
	if logList then
		for k ,v in pairs(logList) do
			local str = G_ServerTime:getDateAndTime(v:getFight_time())
			if not targetList[str] then
				targetList[str] = {}
				targetList[str].timeStr = str
				targetList[str].logs = {}
				table.insert(logDatas, targetList[str])
			end
			table.insert(targetList[str].logs, v)
		end
	end
	self._logDatas = logDatas
	self._listView:removeAllItems()
	local FriendEnemyLogCell = require("app.scene.view.friend.FriendEnemyLogCell")
	for k, v in pairs(logDatas) do
		local view = FriendEnemyLogCell.new()
		view:updateUI(v)
		self._listView:pushBackCustomItem(view)
	end
	self._emptyNode:setVisible(#self._logDatas == 0)
end



return PopupEnemyLog
