
-- Author: nieming
-- Date:2017-12-26 17:08:06
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupFriendApply = class("PopupFriendApply", PopupBase)
local FriendConst = require("app.const.FriendConst")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local FunctionConst	= require("app.const.FunctionConst")

function PopupFriendApply:ctor()

	--csb bind var name
	self._commonLargePop2 = nil  --CommonNormalSmallPop
	self._imageRoot = nil  --ImageView
	self._listView = nil  --ScrollView
	self._listData = G_UserData:getFriend():getApplyData() or {}
	local resource = {
		file = Path.getCSB("PopupFriendApply", "friend"),
		binding = {
            _refuseAllBtn = {
				events = {{event = "touch", method = "_onRefuseAllBtnClick"}}
			},
			_agreeAllBtn = {
				events = {{event = "touch", method = "_onAgreeAllBtnClick"}}
			},
		}
	}
	PopupFriendApply.super.ctor(self, resource)
end

-- Describle：
function PopupFriendApply:onCreate()
	self._commonLargePop2:setTitle(Lang.get("lang_friend_btn_apply"))
	self._commonLargePop2:addCloseEventListener(handler(self, self.close))
	self:_initListView()
	self:updateListView()

	self._refuseAllBtn:setString(Lang.get("guild_btn_refuse_all"))
	self._agreeAllBtn:setString(Lang.get("guild_btn_agree_all"))

	local isShowAgreeAllBtn = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_AGREE_ALL_FRIEND)
	self._agreeAllBtn:setVisible(isShowAgreeAllBtn)

	local isShowrefuseAllBtn = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_REFUSE_ALL_FRIEND)
	self._refuseAllBtn:setVisible(isShowrefuseAllBtn)
end

-- Describle：
function PopupFriendApply:onEnter()
	self._signalApply = G_SignalManager:add(SignalConst.EVENT_CONFIRM_ADD_FRIEND_SUCCESS, handler(self, self._onApply))
	self._signalGetFriendList = G_SignalManager:add(SignalConst.EVENT_GET_FRIEND_LIST_SUCCESS, handler(self, self._onGetFriendList))
end
-- Describle：
function PopupFriendApply:onExit()
	self._signalApply:remove()
	self._signalApply = nil
	self._signalGetFriendList:remove()
	self._signalGetFriendList = nil
end
function PopupFriendApply:_initListView()
	-- body
	local FriendApplyCell = require("app.scene.view.friend.FriendApplyCell")
	self._listView:setTemplate(FriendApplyCell)
	self._listView:setCallback(handler(self, self._onListViewItemUpdate), handler(self, self._onListViewItemSelected))
	self._listView:setCustomCallback(handler(self, self._onListViewItemTouch))

	-- self._listView:resize()
end

function PopupFriendApply:_onRefuseAllBtnClick ()
	self._listData = G_UserData:getFriend():getApplyData()

	if #self._listData > 0 then
		G_UserData:getFriend():c2sConfirmAddFriend(0, false)
	end
end

function PopupFriendApply:_onAgreeAllBtnClick ()
	self._listData = G_UserData:getFriend():getApplyData()

	if #self._listData > 0 then
		G_UserData:getFriend():c2sConfirmAddFriend(0, true)
	end
end

-- Describle：
function PopupFriendApply:_onListViewItemUpdate(item, index)
	if self._listData then
		item:updateUI(index+1, self._listData[index+1])
	end
end

-- Describle：
function PopupFriendApply:_onListViewItemSelected(item, index)

end

-- Describle：
function PopupFriendApply:_onListViewItemTouch(index, data, isAccept)
	if data then
		G_UserData:getFriend():c2sConfirmAddFriend(data:getId(), isAccept)
	end
end

function PopupFriendApply:updateListView()
	if not self._listData then
		self._listData = {}
	end
	self._listView:resize(#self._listData)
end


function PopupFriendApply:_onGetFriendList()
	self._listData = G_UserData:getFriend():getApplyData()
	self._listView:resize(#self._listData)
end


function PopupFriendApply:_onApply(event, message)
	self._listData = G_UserData:getFriend():getApplyData()
	self._listView:resize(#self._listData)
end



return PopupFriendApply
