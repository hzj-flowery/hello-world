
-- Author: nieming
-- Date:2018-04-24 16:06:27
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local FriendEnemyLogCell = class("FriendEnemyLogCell", ListViewCellBase)
local EnemyHelper = require("app.scene.view.friend.EnemyHelper")

function FriendEnemyLogCell:ctor()

	--csb bind var name
	self._richTextParent = nil  --SingleNode
	self._timeStr = nil
	local resource = {
		file = Path.getCSB("FriendEnemyLogCell", "friend"),

	}
	FriendEnemyLogCell.super.ctor(self, resource)
end

function FriendEnemyLogCell:onCreate()
	-- body
	local size = self._panel:getContentSize()
	self._startSize = size
	-- self:setContentSize(size.width, size.height)

end

function FriendEnemyLogCell:_getLineStr(data)
	local max = EnemyHelper.getFightSuccessEnergy()
	local localdate = G_ServerTime:getDateObject(data:getFight_time())
	local tStr = string.format("%02d:%02d:%02d", localdate.hour, localdate.min, localdate.sec)
	if data:isWin_type() then
		if data:getGrap_value() == 0 then
			return Lang.get("lang_friend_enemy_log_cell_content0", {time = tStr, name = data:getName()})
		elseif data:getGrap_value() < max then
			return Lang.get("lang_friend_enemy_log_cell_content1", {time = tStr, name = data:getName(), num = data:getGrap_value()})
		else
			return Lang.get("lang_friend_enemy_log_cell_content2", {time = tStr, name = data:getName(), num = data:getGrap_value()})
		end
	else
		return Lang.get("lang_friend_enemy_log_cell_content3", {time = tStr, name = data:getName()})
	end
	return ""
end


function FriendEnemyLogCell:updateUI(data)
	-- body
	if not data then
		return
	end
	self._timeStr:setString(data.timeStr)
	local widthLimit = self._startSize.width - 1 *self._richTextParent:getPositionX()
	local totalHeight = 0
	for k ,v in pairs(data.logs) do
		local line = self:_getLineStr(v)
		local richtext = ccui.RichText:createRichTextByFormatString(line, {
			defaultColor = Colors.BRIGHT_BG_ONE, defaultSize = 20,
			other = {
				[2] = {color = Colors.getOfficialColor(v:getOfficer_level()), 
						outlineColor = Colors.getOfficialColorOutlineEx(v:getOfficer_level())}
			}})
		richtext:setVerticalSpace(4)
		richtext:ignoreContentAdaptWithSize(false)
		richtext:setContentSize(cc.size(widthLimit,0))--高度0则高度自适应
		richtext:formatText()
		local virtualContentSize = richtext:getVirtualRendererSize()
		local richtextHeight = virtualContentSize.height + 12

		richtext:setAnchorPoint(cc.p(0, 1))
		richtext:setPositionY(-1 * totalHeight)
		totalHeight = totalHeight + richtextHeight
		self._richTextParent:addChild(richtext)
	end
	self._tiembg:setPositionY(self._startSize.height + totalHeight)
	self:setContentSize(self._startSize.width, self._startSize.height + totalHeight)
end

return FriendEnemyLogCell
