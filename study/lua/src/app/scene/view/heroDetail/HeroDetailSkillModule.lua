--
-- Author: Liangxu
-- Date: 2017-03-01 19:49:34
-- 武将详情 技能模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HeroDetailSkillModule = class("HeroDetailSkillModule", ListViewCellBase)
local HeroDetailSkillCell = require("app.scene.view.heroDetail.HeroDetailSkillCell")
local CSHelper = require("yoka.utils.CSHelper")

function HeroDetailSkillModule:ctor(skillIds)
	self._skillIds = skillIds

	local resource = {
		file = Path.getCSB("HeroDetailDynamicModule", "hero"),
		binding = {

		},
	}
	HeroDetailSkillModule.super.ctor(self, resource)
end

function HeroDetailSkillModule:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	for i, skillId in ipairs(self._skillIds) do
		local cell = HeroDetailSkillCell.new(skillId)
		self._listView:pushBackCustomItem(cell)
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function HeroDetailSkillModule:_createTitle()
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

return HeroDetailSkillModule