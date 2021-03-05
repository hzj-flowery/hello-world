
-- Author: nieming
-- Date:2018-04-24 16:06:21
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local FriendEnemyListViewCell = class("FriendEnemyListViewCell", ListViewCellBase)
local TextHelper = require("app.utils.TextHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EnemyHelper = require("app.scene.view.friend.EnemyHelper")

function FriendEnemyListViewCell:ctor()

	--csb bind var name

	self._bg = nil  --ImageView
	self._btnRevenge = nil  --CommonButtonHighLight
	self._enemyFight = nil  --Text
	self._guildName = nil  --Text
	self._icon = nil  --CommonIconTemplate
	self._mineName = nil  --Text
	self._playerName = nil  --CommonPlayerName
	self._powerNum = nil  --Text
	self._stateText = nil  --Text

	local resource = {
		file = Path.getCSB("FriendEnemyListViewCell", "friend"),
		binding = {
			_btnRevenge = {
				events = {{event = "touch", method = "_onBtnRevenge"}}
			},
		},
	}
	FriendEnemyListViewCell.super.ctor(self, resource)
end

function FriendEnemyListViewCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._btnRevenge:setString(Lang.get("lang_friend_enemy_btn_fight"))
end

function FriendEnemyListViewCell:updateUI(data, index)
	-- body
	self._data = data
	if index % 2 == 1 then
		self._bg:loadTexture(Path.getComplexRankUI("img_com_ranking04"))
	elseif index % 2 == 0 then
		self._bg:loadTexture(Path.getComplexRankUI("img_com_ranking05"))
	end


	self._icon:updateUI(data:getCovertId())
	self._icon:updateHeadFrame(data:getHead_frame_id())
	--self._commonHeadFrame:updateUI(data:getHead_frame_id(),self._icon:getScale())
	self._icon:setLevel(data:getLevel())
	self._icon:setCallBack(function()
		if self._data then
			G_UserData:getBase():c2sGetUserBaseInfo(self._data:getUid())
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

	local mineName = data:getMine_name()
	if mineName and mineName ~= "" then
		self._mineName:setString(mineName)
		self._mineName:setColor(Colors.BRIGHT_BG_TWO)
	else
		self._mineName:setString(Lang.get("lang_friend_enemy_empty_mine_name"))
		self._mineName:setColor(Colors.BRIGHT_BG_RED)
	end

	self._enemyFight:setString(data:getEnemy_value())

end
-- Describle：
function FriendEnemyListViewCell:_onBtnRevenge()
	-- body
	if self._data then
		if G_UserData:getEnemy():getCount() >= EnemyHelper.getDayMaxRevengeNum() then
			G_Prompt:showTip(Lang.get("lang_friend_enemy_revenge_num_zero"))
			return
		end

		local myGuildId= G_UserData:getGuild():getMyGuildId()
		if myGuildId == self._data:getGuild_id() and myGuildId ~= 0 then
			G_Prompt:showTip(Lang.get("lang_friend_enemy_revenge_same_guild"))
			return
		end

		G_UserData:getEnemy():c2sEnemyBattle(self._data:getUid())
	end
end

return FriendEnemyListViewCell
