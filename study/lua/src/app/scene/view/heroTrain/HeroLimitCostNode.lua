--
-- Author: Liangxu
-- Date: 2018-8-7
-- 武将界限消耗Node
local CommonLimitCostNode = require("app.ui.component.CommonLimitCostNode")
local HeroLimitCostNode = class("HeroLimitCostNode", CommonLimitCostNode)
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local HeroConst = require("app.const.HeroConst")
local LimitCostConst = require("app.const.LimitCostConst")


function HeroLimitCostNode:ctor(target, costKey, callback, otherInfo)
	HeroLimitCostNode.super.ctor(self, target, costKey, callback, otherInfo)
end

function HeroLimitCostNode:_check()
	if self._costKey >= HeroConst.HERO_LIMIT_COST_KEY_3 and self._costKey ~= HeroConst.HERO_LIMIT_COST_KEY_6 then
		self._isShowCount = true
	else
		self._isShowCount = false
	end
end

function HeroLimitCostNode:updateUI(limitLevel, curCount, limitRed)
	if (limitRed==0 and limitLevel>=3) or (limitRed~=0 and limitLevel>=4) then
		self._isFull = false
		self._target:setVisible(false)
		return
	end
	self:_updateCommonUI(limitLevel, curCount, limitRed)
end

function HeroLimitCostNode:_calPercent(limitLevel, curCount, limitRed)
	local info = HeroDataHelper.getHeroLimitCostConfig(limitLevel, limitRed)
	local configKey = HeroDataHelper.getLimitCostConfigKey(self._costKey)
	local size = info[configKey.size] or 0
	local percent = math.floor(curCount / size * 100)
	return math.min(percent, 100), size
end

return HeroLimitCostNode
