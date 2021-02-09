
-- Author: zhanglinsen
-- Date:2018-09-10 10:43:46
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupGroupsInviteCell = class("PopupGroupsInviteCell", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local GroupsConst = require("app.const.GroupsConst")

function PopupGroupsInviteCell:ctor()
	local resource = {
		file = Path.getCSB("PopupGroupsInviteCell", "groups"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "_onBtnOk"}}
			},
		},
	}
	PopupGroupsInviteCell.super.ctor(self, resource)
end

function PopupGroupsInviteCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._btnText:setString(Lang.get("groups_level_different"))
	self._btnOk:setString(Lang.get("groups_invite"))
	self._btnOk:setVisible(false)
	self._btnText:setVisible(false)
	self._btnImg:setVisible(false)
end

function PopupGroupsInviteCell:updateUI(index, data)
	self._data = data

	local covertId = data.covertId
	local limitLevel = data.limitLevel
	local userId = data.userId
	local guildName = data.guildName
	local playerName = data.playerName
	local officerLevel = data.officerLevel
	local level = data.level
	local power = data.power
	local maxLv = data.maxLv
	local minLv = data.minLv
	
	self._icon:updateUI(covertId, nil, limitLevel)

	
	self._commonHeadFrame:updateUI(data.head_frame_id,self._icon:getScale())
	self._commonHeadFrame:setLevel(level)
	-- self._icon:setLevel(level)
	self._playerName:updateUI(playerName, officerLevel)
	if guildName and guildName ~= "" then
		self._guildName:setString(guildName)
		self._guildName:setColor(Colors.BRIGHT_BG_ONE)
	else
		self._guildName:setString(Lang.get("siege_rank_no_crops"))
		self._guildName:setColor(Colors.BRIGHT_BG_RED)
	end
	self._powerNum:setString(TextHelper.getAmountText(power))

	self._btnOk:setVisible(false)
	self._btnText:setVisible(false)
	self._btnImg:setVisible(false)
	
	if level > maxLv or level < minLv then
		self._btnText:setVisible(true)
		return
	end

	if G_UserData:getGroups():getMyGroupData():getInviteUserData(userId) then
		self._btnImg:setVisible(true)
		return
	end

	self._btnOk:setVisible(true)

	if index % 2 ~= 0 then
		self._bg:loadTexture(Path.getUICommon("img_com_board_list02a"))
	else
		self._bg:loadTexture(Path.getUICommon("img_com_board_list02b"))
	end
end

function PopupGroupsInviteCell:_onBtnOk()
	local userId = self._data.userId
	self:dispatchCustomCallback(userId)
end

return PopupGroupsInviteCell