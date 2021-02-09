--
-- Author: Liangxu
-- Date: 2019-4-30
-- 蛋糕活动玩家排行榜Cell

local ListViewCellBase = require("app.ui.ListViewCellBase")
local CakeRankPlayerCell = class("CakeRankPlayerCell", ListViewCellBase)
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")

function CakeRankPlayerCell:ctor()
	local resource = {
		file = Path.getCSB("CakeRankPlayerCell", "cakeActivity"),
		binding = {
			
		}
	}
	CakeRankPlayerCell.super.ctor(self, resource)
end

function CakeRankPlayerCell:onCreate()
	local size = self._panelBg:getContentSize()
	self:setContentSize(size.width, size.height)
	self._imageArrow:ignoreContentAdaptWithSize(true)
end

function CakeRankPlayerCell:update(data)
	self._textRank:setString(data:getRank())
	local serverName = require("app.utils.TextHelper").cutText(data:getServer_name(), 5)
	self._textServerName:setString(serverName)
	self._textName:setString(data:getName())
	self._textScore:setString(data:getPoint())
	self._imageArrow:loadTexture(Path.getUICommon(data:getChangeResName()))
end

return CakeRankPlayerCell
