--
-- Author: Liangxu
-- Date: 2019-4-30
-- 蛋糕活动军团排行榜Cell

local ListViewCellBase = require("app.ui.ListViewCellBase")
local CakeRankGuildCell = class("CakeRankGuildCell", ListViewCellBase)
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")

function CakeRankGuildCell:ctor()
	local resource = {
		file = Path.getCSB("CakeRankGuildCell", "cakeActivity"),
		binding = {
			
		}
	}
	CakeRankGuildCell.super.ctor(self, resource)
end

function CakeRankGuildCell:onCreate()
	local size = self._panelBg:getContentSize()
	self:setContentSize(size.width, size.height)
end

function CakeRankGuildCell:update(data)
	self._textRank:setString(data:getRank())
	local serverName = require("app.utils.TextHelper").cutText(data:getServer_name(), 5)
	self._textServerName:setString(serverName)
	self._textName:setString(data:getGuild_name())
	local level = data:getCake_level()
	self._textScore:setString(Lang.get("cake_activity_cake_level", {level = level}))
	local exp = data:getCake_exp()
	local totalExp = CakeActivityDataHelper.getCurCakeLevelConfig(level).exp
	if totalExp == 0 then --最高级时，分母显示上一等级的值
		totalExp = CakeActivityDataHelper.getCurCakeLevelConfig(level-1).exp
	end
	local percent = math.floor(exp/totalExp*100)
	self._textPercent:setString(percent.."%")
end


return CakeRankGuildCell
