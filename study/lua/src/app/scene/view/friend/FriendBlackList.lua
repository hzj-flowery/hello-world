
-- Author: nieming
-- Date:2017-12-26 17:07:50
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local FriendBlackList = class("FriendBlackList", ViewBase)
local FriendConst = require("app.const.FriendConst")

function FriendBlackList:ctor()

	--csb bind var name
	self._listView = nil  --ScrollView

	local resource = {
		file = Path.getCSB("FriendBlackList", "friend"),

	}
	FriendBlackList.super.ctor(self, resource)
end

-- Describle：
function FriendBlackList:onCreate()

	self:_initListView()
end

-- Describle：
function FriendBlackList:onEnter()

end

-- Describle：
function FriendBlackList:onExit()

end
function FriendBlackList:_initListView()
	-- body
	local FriendListViewCell = require("app.scene.view.friend.FriendListViewCell")
	self._listView:setTemplate(FriendListViewCell)
	self._listView:setCallback(handler(self, self._onListViewItemUpdate), handler(self, self._onListViewItemSelected))
	self._listView:setCustomCallback(handler(self, self._onListViewItemTouch))

	-- self._listView:resize()
end

-- Describle：
function FriendBlackList:_onListViewItemUpdate(item, index)
	if self._data then
		local itemData = self._data[index +1]
		item:updateUI(itemData, FriendConst.FRIEND_BLACK, index + 1)
	end
end

-- Describle：
function FriendBlackList:_onListViewItemSelected(item, index)

end

-- Describle：
function FriendBlackList:_onListViewItemTouch(index, data)
	if data then
		G_UserData:getFriend():c2sDelFriend(data:getId(), FriendConst.FRIEND_DEL_BLACK_TYPE)
	end
end

function FriendBlackList:updateView(data)
	self._data = data
	if not self._data then
		self._listView:resize(0)
	else
		self._listView:resize(#self._data)
	end
end


return FriendBlackList
