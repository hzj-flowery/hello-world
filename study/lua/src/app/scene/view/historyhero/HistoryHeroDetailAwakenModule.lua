-- Description: 历代名将详情觉醒消耗
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-23

local ListViewCellBase = require("app.ui.ListViewCellBase")
local HistoryHeroDetailAwakenModule = class("HistoryHeroDetailAwakenModule", ListViewCellBase)
local HistoryHeroDetailAwakenCell = require("app.scene.view.historyhero.HistoryHeroDetailAwakenCell")
local CSHelper = require("yoka.utils.CSHelper")


function HistoryHeroDetailAwakenModule:ctor(costList)
	self._costList 	   = costList

	local resource = {
		file = Path.getCSB("HistoryHeroDetailAwakenModule", "historyhero"),
	}
	HistoryHeroDetailAwakenModule.super.ctor(self, resource)
end

function HistoryHeroDetailAwakenModule:updateUI(costList)
	for i, costId in ipairs(costList) do
		local module = self._listView:getChildByName("HistoryHeroDetailAwakenCell"..i)
		if module ~= nil then
			module:updateUI(costId)
		end
	end
end

function HistoryHeroDetailAwakenModule:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	for i, costId in ipairs(self._costList) do
		local cell = HistoryHeroDetailAwakenCell.new(costId)
		self._listView:pushBackCustomItem(cell)
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function HistoryHeroDetailAwakenModule:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("historyhero_weapon_detail_title_cost"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 41)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, titleSize.height / 2)
	widget:addChild(title)

	return widget
end


return HistoryHeroDetailAwakenModule