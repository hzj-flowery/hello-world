
-- Author: conley
-- Rebuilt: Panhoa
-- Date:2018-11-23 17:08:02
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local HistoryHeroDetailSkillModule = class("HistoryHeroDetailSkillModule", ListViewCellBase)
local HistoryHeroDetailSkillCell = require("app.scene.view.historyhero.HistoryHeroDetailSkillCell")
local CSHelper = require("yoka.utils.CSHelper")


function HistoryHeroDetailSkillModule:ctor(skillIds, breakthrough)
	self._skillIds 	   = skillIds
	self._breakthrough = breakthrough

	local resource = {
		file = Path.getCSB("HistoryHeroDetailSkillModule", "historyhero"),
	}
	HistoryHeroDetailSkillModule.super.ctor(self, resource)
end

function HistoryHeroDetailSkillModule:updateUI(skillList, breakthrough)
	for i, skillId in ipairs(skillList) do
		local module = self._listView:getChildByName("HistoryHeroDetailSkillCell"..i)
		if module ~= nil then
			module:updateUI(skillId, breakthrough)
		end
	end
end

function HistoryHeroDetailSkillModule:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	for i, skillId in ipairs(self._skillIds) do
		local cell = HistoryHeroDetailSkillCell.new(i, skillId, self._breakthrough)
		self._listView:pushBackCustomItem(cell)
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function HistoryHeroDetailSkillModule:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("hero_detail_title_skill"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 41)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, titleSize.height / 2)
	widget:addChild(title)

	return widget
end


return HistoryHeroDetailSkillModule