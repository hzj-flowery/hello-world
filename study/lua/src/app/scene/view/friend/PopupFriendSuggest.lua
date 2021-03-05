
-- Author: nieming
-- Date:2017-12-26 17:08:08
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupFriendSuggest = class("PopupFriendSuggest", PopupBase)
local FriendConst = require("app.const.FriendConst")
local UIHelper = require("yoka.utils.UIHelper")
local UIActionHelper = require("app.utils.UIActionHelper")
function PopupFriendSuggest:ctor()

	--csb bind var name
	self._btnRefresh = nil  --CommonButtonHighLight
	self._commonLargePop2 = nil  --CommonNormalSmallPop
	self._imageRoot = nil  --ImageView
	self._listView = nil  --ScrollView

	self._listData = nil

	self._countDownStartTime = 0
	local resource = {
		file = Path.getCSB("PopupFriendSuggest", "friend"),
		binding = {
			_btnRefresh = {
				events = {{event = "touch", method = "_onBtnRefresh"}}
			},
		},
	}
	PopupFriendSuggest.super.ctor(self, resource)
end

-- Describle：
function PopupFriendSuggest:onCreate()

	local Parameter = require("app.config.parameter")
	local config = Parameter.get(141)
	assert(config ~= nil, "can not find param 141 value")
	self._suggestInterval = tonumber(config.content) or 10

	self._commonLargePop2:setTitle(Lang.get("lang_friend_suggest_title"))
	self._commonLargePop2:addCloseEventListener(handler(self, self.close))
	self:_initListView()
	self:_refreshBtnState()
	self._listData = G_UserData:getFriend():getSuggestTempListData()
	self:updateListView()
end

-- Describle：
function PopupFriendSuggest:onEnter()
	self._signalSuggestList = G_SignalManager:add(SignalConst.EVENT_RECOMMAND_FRIEND_SUCCESS, handler(self, self._onGetSuggestList))
	self._signalAddFriend = G_SignalManager:add(SignalConst.EVENT_ADD_FRIEND_SUCCESS, handler(self, self._onAddFriendSuccess))

	if self._countDownStartTime + self._suggestInterval - G_ServerTime:getTime() < 0 then
		self:requestSuggestList()
	end
end

-- Describle：
function PopupFriendSuggest:onExit()
	self._signalSuggestList:remove()
	self._signalSuggestList = nil

	self._signalAddFriend:remove()
	self._signalAddFriend = nil
end

function PopupFriendSuggest:requestSuggestList()
	G_UserData:getFriend():c2sRecommandFriend()
end

function PopupFriendSuggest:_onGetSuggestList(event, data)
	self._listData = data
	self:updateListView()
	self:_refreshBtnState()
end

-- Describle：
function PopupFriendSuggest:_onBtnRefresh()
	-- body
	if self._countDownStartTime == 0 then
		self:requestSuggestList()
	end
end

function PopupFriendSuggest:_refreshBtnState()
	local desc = self._btnRefresh:getDesc()
	if desc then
		desc:stopAllActions()
		self._countDownStartTime = G_UserData:getFriend():getSuggestRefreshTime()
		if self._countDownStartTime + self._suggestInterval - G_ServerTime:getTime() >= 0 then
			self._btnRefresh:setEnabled(false)
			self._btnRefresh:setString(string.format("%ds", self._countDownStartTime + self._suggestInterval - G_ServerTime:getTime()))
			local action = UIActionHelper.createUpdateAction(function()
				local leftTime = self._countDownStartTime + self._suggestInterval - G_ServerTime:getTime()
				if leftTime > 0 then
					local desc = self._btnRefresh:getDesc()
					if desc then
						self._btnRefresh:setString(string.format("%ds", leftTime))
					end
				else
					desc:stopAllActions()
					self._countDownStartTime = 0
					self._btnRefresh:setEnabled(true)
					self._btnRefresh:setString(Lang.get("lang_friend_suggest_btn_refresh"))
				end
			end, 0.5)
			desc:runAction(action)
		else
			self._btnRefresh:setEnabled(true)
			self._btnRefresh:setString(Lang.get("lang_friend_suggest_btn_refresh"))
		end
	end
end

function PopupFriendSuggest:_initListView()
	-- body
	local FriendSuggestCell = require("app.scene.view.friend.FriendSuggestCell")
	self._listView:setTemplate(FriendSuggestCell)
	self._listView:setCallback(handler(self, self._onListViewItemUpdate), handler(self, self._onListViewItemSelected))
	self._listView:setCustomCallback(handler(self, self._onListViewItemTouch))

	-- self._listView:resize()
end

-- Describle：
function PopupFriendSuggest:_onListViewItemUpdate(item, index)
	if self._listData then
		item:updateUI(index+1, self._listData[index+1])
	end
end

-- Describle：
function PopupFriendSuggest:_onListViewItemSelected(item, index)

end

-- Describle：
function PopupFriendSuggest:_onListViewItemTouch(index, data)
	if data then
		G_UserData:getFriend():c2sAddFriend(data:getName(), FriendConst.FRIEND_ADD_FRIEND_TYPE)
	end
end

function PopupFriendSuggest:updateListView()
	if not self._listData then
		self._listData = {}
	end
	self._listView:resize(#self._listData)
end


function PopupFriendSuggest:_onAddFriendSuccess(event, message)

	local uid = rawget(message, "uid")
	if uid and self._listData then
		for k, v in pairs(self._listData) do
			if v:getId() == uid then
				table.remove(self._listData, k)
				self:updateListView()
				break
			end
		end
	end
	local friend_type = rawget(message, "friend_type")
	if friend_type then
		if friend_type == FriendConst.FRIEND_ADD_FRIEND_TYPE then
			G_Prompt:showTip(Lang.get("lang_friend_apply_success_tip"))
		end
	end
end

return PopupFriendSuggest
