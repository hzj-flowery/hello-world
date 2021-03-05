
-- Author: nieming
-- Date:2017-12-26 17:07:58
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local FriendList = class("FriendList", ViewBase)
local FriendConst = require("app.const.FriendConst")

function FriendList:ctor()

	--csb bind var name
	self._btnAddFriend = nil  --CommonButtonHighLight
	self._btnFriendApply = nil  --CommonButtonHighLight
	self._btnFriendSuggest = nil  --CommonButtonNormal
	self._listView = nil  --ScrollView

	local resource = {
		file = Path.getCSB("FriendList", "friend"),
		binding = {
			_btnAddFriend = {
				events = {{event = "touch", method = "_onBtnAddFriend"}}
			},
			_btnFriendApply = {
				events = {{event = "touch", method = "_onBtnFriendApply"}}
			},
			_btnFriendSuggest = {
				events = {{event = "touch", method = "_onBtnFriendSuggest"}}
			},
			_btnOnekeyGive = {
				events = {{event = "touch", method = "_onBtnOnekeyGive"}}
			},
		},
	}
	FriendList.super.ctor(self, resource)
end

-- Describle：
function FriendList:onCreate()
	self:_initListView()
	self._btnAddFriend:setString(Lang.get("lang_friend_btn_add"))
	self._btnFriendApply:setString(Lang.get("lang_friend_btn_apply"))
	self._btnFriendSuggest:setString(Lang.get("lang_friend_btn_suggest"))
	self._btnOnekeyGive:setString(Lang.get("lang_friend_btn_one_key_give"))
end

-- Describle：
function FriendList:onEnter()

end

-- Describle：
function FriendList:onExit()

end
-- Describle：
function FriendList:_onBtnAddFriend()
	-- body
	local PopupInput = require("app.ui.PopupInput")
	local popup = PopupInput.new(function(name)
		if G_UserData:getBase():getName() == name then
			G_Prompt:showTip(Lang.get("lang_friend_add_friend_not_self"))
			return true
		end
		G_UserData:getFriend():c2sAddFriend(name, FriendConst.FRIEND_ADD_FRIEND_TYPE)
	end,nil, Lang.get("lang_friend_btn_add"), Lang.get("lang_friend_input_tips"), Lang.get("lang_friend_input_tips"),Lang.get("lang_friend_input_placeholder"), 7)
	popup:setBtnOkName(Lang.get("lang_friend_input_btn_ok"))

	popup:openWithAction()
end
-- Describle：
function FriendList:_onBtnFriendApply()
	-- body
	local PopupFriendApply = require("app.scene.view.friend.PopupFriendApply").new()
	PopupFriendApply:openWithAction()
end
-- Describle：
function FriendList:_onBtnFriendSuggest()
	-- body
	local popupFriendSuggest = require("app.scene.view.friend.PopupFriendSuggest").new()
	popupFriendSuggest:openWithAction()
end
function FriendList:_initListView()
	-- body
	local FriendListViewCell = require("app.scene.view.friend.FriendListViewCell")
	self._listView:setTemplate(FriendListViewCell)
	self._listView:setCallback(handler(self, self._onListViewItemUpdate), handler(self, self._onListViewItemSelected))
	self._listView:setCustomCallback(handler(self, self._onListViewItemTouch))
	-- self._listView:resize()
end
-- Describle：
function FriendList:_onListViewItemUpdate(item, index)
	if self._data then
		local itemData = self._data[index +1]
		item:updateUI(itemData, FriendConst.FRIEND_LIST, index + 1)
	end
end
-- Describle：
function FriendList:_onListViewItemSelected(item, index)

end

-- Describle：
function FriendList:_onListViewItemTouch(index, data)
	if data then
		G_UserData:getFriend():c2sFriendPresent(data:getId())
	end

end

function FriendList:updateView(data, applyListData)
	-- 无数据
	self._data = data
	self._applyListData = applyListData
	if data then
		self._listView:resize(#data)
	else
		self._listView:resize(0)
	end
end

function FriendList:updateRedPoint()
	self._applyRedPoint:setVisible(G_UserData:getFriend():hasApplyRedPoint())
end

function FriendList:_onBtnOnekeyGive()
	if not self._data then
		return
	end
	local canGive = false
	for _, v in pairs(self._data)do
		if v:isCanGivePresent() then
			canGive = true
			break
		end
	end
	if not canGive then
		G_Prompt:showTip(Lang.get("lang_friend_today_can_not_one_key_give"))
		return
	end
	G_UserData:getFriend():c2sFriendPresent(0)
end



return FriendList
