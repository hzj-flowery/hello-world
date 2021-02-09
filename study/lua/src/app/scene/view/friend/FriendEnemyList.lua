
-- Author: nieming
-- Date:2018-04-24 16:06:13
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local FriendEnemyList = class("FriendEnemyList", ViewBase)
local EnemyHelper = require("app.scene.view.friend.EnemyHelper")
function FriendEnemyList:ctor()

	--csb bind var name
	self._btnPopLog = nil  --CommonButtonHighLight
	self._imageRoot = nil  --ImageView
	self._listView = nil  --ScrollView
	self._num = nil  --Text
	self._enemysData = {}
	local resource = {
		file = Path.getCSB("FriendEnemyList", "friend"),
		binding = {
			_btnPopLog = {
				events = {{event = "touch", method = "_onBtnPopLog"}}
			},
		},
	}
	FriendEnemyList.super.ctor(self, resource)
end

-- Describle：
function FriendEnemyList:onCreate()
	self:_initListView()
	self._btnPopLog:setString(Lang.get("lang_friend_enemy_btn_log"))
end

-- Describle：
function FriendEnemyList:onEnter()

end

-- Describle：
function FriendEnemyList:onExit()

end

-- Describle：
function FriendEnemyList:_onBtnPopLog()
	-- body
	-- local pop = require("app.scene.view.friend.PopupEnemyLog").new()
	-- pop:openWithAction()
	G_SceneManager:showDialog("app.scene.view.friend.PopupEnemyLog")
end
function FriendEnemyList:_initListView()
	-- body
	local FriendEnemyListViewCell = require("app.scene.view.friend.FriendEnemyListViewCell")
	self._listView:setTemplate(FriendEnemyListViewCell)
	self._listView:setCallback(handler(self, self._onListViewItemUpdate), handler(self, self._onListViewItemSelected))
	self._listView:setCustomCallback(handler(self, self._onListViewItemTouch))

end



function FriendEnemyList:updateView()
	self._enemysData = G_UserData:getEnemy():getEnemysData()
	self._listView:resize(#self._enemysData)
	self._num:setString(string.format("%s/%s", G_UserData:getEnemy():getCount(), EnemyHelper.getDayMaxRevengeNum()))
end

-- Describle：
function FriendEnemyList:_onListViewItemUpdate(item, index)
	local data = self._enemysData[index + 1]
	item:updateUI(data, index + 1)
end

-- Describle：
function FriendEnemyList:_onListViewItemSelected(item, index)

end

-- Describle：
function FriendEnemyList:_onListViewItemTouch(index, params)

end


return FriendEnemyList
