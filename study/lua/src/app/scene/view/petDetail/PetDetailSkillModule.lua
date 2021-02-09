--
-- Author: hedili
-- Date: 2018-01-25 19:49:34
-- 神兽详情 技能模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PetDetailSkillModule = class("PetDetailSkillModule", ListViewCellBase)
local PetDetailSkillCell = require("app.scene.view.petDetail.PetDetailSkillCell")
local CSHelper = require("yoka.utils.CSHelper")

function PetDetailSkillModule:ctor(skillIds, showSkillDetail,petBaseId, petStar, petUnitData)
	self._skillIds = skillIds
	self._showSkillDetail = showSkillDetail
	self._petBaseId = petBaseId
	self._petStar = petStar
	self._petUnitData = petUnitData
	local resource = {
		file = Path.getCSB("PetDetailDynamicModule", "pet"),
		binding = {

		},
	}
	PetDetailSkillModule.super.ctor(self, resource)
end

function PetDetailSkillModule:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	for i, skillId in ipairs(self._skillIds) do
		local cell = PetDetailSkillCell.new(skillId,self._showSkillDetail,self._petBaseId, self._petStar, self._petUnitData)
		self._listView:pushBackCustomItem(cell)
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function PetDetailSkillModule:_createTitle()
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

return PetDetailSkillModule