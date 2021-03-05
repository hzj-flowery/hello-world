
-- Author: nieming
-- Date:2018-05-09 10:39:25
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local AwardNode = class("AwardNode", ViewBase)
local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")

function AwardNode:ctor(bossId)

	--csb bind var name
	self._rankRewardListViewItem = nil  --CommonListViewLineItem
	self._bossId = bossId
	local resource = {
		file = Path.getCSB("AwardNode", "countryboss"),

	}
	AwardNode.super.ctor(self, resource)
end

-- Describle：
function AwardNode:onCreate()
	local awards = CountryBossHelper.getPreviewRankRewards(self._bossId)
	self._rankRewardListViewItem:updateUI(awards)
	self._rankRewardListViewItem:setMaxItemSize(5)
	self._rankRewardListViewItem:setListViewSize(400,100)
	self._rankRewardListViewItem:setItemsMargin(2)
	local cfg = CountryBossHelper.getBossConfigById(self._bossId)
	if cfg.type == 1 then
		self._awardText:setString(Lang.get("country_boss_award_lable1"))
	else
		self._awardText:setString(Lang.get("country_boss_award_lable2"))
	end

end

-- Describle：
function AwardNode:onEnter()

end

-- Describle：
function AwardNode:onExit()

end

return AwardNode
