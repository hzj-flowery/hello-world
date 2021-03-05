
-- Author: nieming
-- Date:2017-12-26 17:08:01
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local FriendListViewCell = class("FriendListViewCell", ListViewCellBase)
local FriendConst = require("app.const.FriendConst")
local TextHelper = require("app.utils.TextHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
function FriendListViewCell:ctor()

	--csb bind var name
	self._btnGive = nil  --CommonButtonHighLight
	self._guildName = nil  --Text
	self._icon = nil  --CommonIconTemplate
	self._playerName = nil  --CommonPlayerName
	self._powerNum = nil  --Text
	self._stateText = nil  --Text
	self._bg = nil

	local resource = {
		file = Path.getCSB("FriendListViewCell", "friend"),
		-- binding = {
		-- 	_btnGive = {
		-- 		events = {{event = "touch", method = "_onBtnGive"}}
		-- 	},
		-- },
	}
	FriendListViewCell.super.ctor(self, resource)
end

function FriendListViewCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._btnGive:setString(Lang.get("common_btn_name_confirm"))
	self._btnGive:addClickEventListenerExDelay(handler(self,self._onBtnGive), 100)
end


function FriendListViewCell:updateUI(data, type, index)
	-- body
	if not data then
		return
	end
	if index % 2 == 1 then
		self._bg:loadTexture(Path.getUICommon("img_com_board_list02a"))
	elseif index % 2 == 0 then
		self._bg:loadTexture(Path.getUICommon("img_com_board_list02b"))
	end
	self._data = data
	self._type = type
	if type == FriendConst.FRIEND_LIST then
		if data:isCanGivePresent() then
			self._btnGive:setVisible(true)
			self._alreadyDone:setVisible(false)
			self._btnGive:setString(Lang.get("lang_friend_btn_give"))
		else
			self._alreadyDone:setVisible(true)
			self._alreadyDone:loadTexture(Path.getTextSignet("txt_yizengsong"))
			self._btnGive:setVisible(false)
			-- self._btnGive:setString(Lang.get("lang_friend_btn_already_give"))
		end
	elseif type == FriendConst.FRIEND_ENERGY then
		if data:isCanGetPresent() then
			self._btnGive:setVisible(true)
			self._alreadyDone:setVisible(false)
			self._btnGive:setString(Lang.get("lang_friend_btn_get"))
		else
			self._btnGive:setVisible(false)
			self._alreadyDone:setVisible(true)
			self._alreadyDone:loadTexture(Path.getTextSignet("txt_yizengsong"))
			-- self._btnGive:setString(Lang.get("lang_friend_btn_already_get"))
		end
	elseif type == FriendConst.FRIEND_BLACK then
		self._btnGive:setVisible(true)
		self._alreadyDone:setVisible(false)
		self._btnGive:setString(Lang.get("lang_friend_btn_remove"))
	end

	self._icon:updateIcon(data:getPlayerShowInfo(), nil, data:getHead_frame_id())
	
	--self._commonHeadFrame:updateUI(data:getHead_frame_id(),self._icon:getScale())
	self._icon:setLevel(data:getLevel())
	self._icon:setCallBack(function()
		if self._data then
			G_UserData:getBase():c2sGetUserBaseInfo(self._data:getId())
		end
	end)
	self._icon:setTouchEnabled(true)

	self._playerName:updateUI(data:getName(), data:getOffice_level())

	local guildName = data:getGuild_name()
	if guildName and guildName ~= "" then
		self._guildName:setString(guildName)
		self._guildName:setColor(Colors.BRIGHT_BG_TWO)
	else
		self._guildName:setString(Lang.get("siege_rank_no_crops"))
		self._guildName:setColor(Colors.BRIGHT_BG_RED)
	end


	self._powerNum:setString(TextHelper.getAmountText(data:getPower()))
	local onlineText, color = UserDataHelper.getOnlineText(data:getOnline())
	self._stateText:setString(onlineText)  --Text
	self._stateText:setColor(color)

end
-- Describle：
function FriendListViewCell:_onBtnGive()
	-- body
	self:dispatchCustomCallback(self._data)
end

return FriendListViewCell
