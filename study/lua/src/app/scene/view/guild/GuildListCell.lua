--
-- Author: Liangxu
-- Date: 2017-06-15 15:01:49
-- 军团列表cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildListCell = class("GuildListCell", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")

function GuildListCell:ctor()
	self._panel = nil
	self._name = nil
	self._level = nil
	self._number = nil
	self._captain = nil
	self._index = 0
	local resource = {
		file = Path.getCSB("GuildListCell", "guild"),
		binding = {

		}
	}
	GuildListCell.super.ctor(self, resource)
end

function GuildListCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function GuildListCell:update(data,index,selectIndex)
	if data then
		self._index = index
		local name = data:getName()
		local level = data:getLevel()
		local number = data:getMember_num()
		local maxNumber = UserDataHelper.getGuildMaxMember(level)
		local leaderName = data:getLeader_name()
		local isFull = number >= maxNumber

		self._name:setString(name)
		self._level:setString(level)
		self._number:setString(number.."/"..maxNumber)
		self._captain:setString(leaderName)
		

		local hasApplication = data:isHas_application()
		self._imageApply:setVisible(hasApplication)

		self._textFull:setVisible(isFull and not hasApplication)

		self:setSelected(index == selectIndex)
	end

end

function GuildListCell:setSelected(selected)
	
	if selected then
		self._panel:setVisible(true)
		self._panel:loadTexture(Path.getUICommon("img_com_board_list03"))
		self._panel:setScale9Enabled(true)	
		self._panel:setCapInsets(cc.rect(1,29,1,1))
	elseif ( (self._index + 1) % 2) == 0 then
		self._panel:setVisible(true)
		self._panel:loadTexture(Path.getUICommon("img_com_board_list02b"))
		self._panel:setScale9Enabled(true)	
		self._panel:setCapInsets(cc.rect(1,1,1,1))
	else
		self._panel:loadTexture(Path.getUICommon("img_com_board_list02a"))
		self._panel:setScale9Enabled(true)	
		self._panel:setCapInsets(cc.rect(1,1,1,1))
		--self._panel:setVisible(false)
	end
end

return GuildListCell