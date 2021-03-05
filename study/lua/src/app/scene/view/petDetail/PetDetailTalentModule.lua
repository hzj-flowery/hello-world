--
-- Author: hedili
-- Date: 2018-01-25 11:05:27
-- 神兽出生天赋
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PetDetailTalentModule = class("PetDetailTalentModule", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local PetDetailViewHelper = require("app.scene.view.petDetail.PetDetailViewHelper")
local CSHelper = require("yoka.utils.CSHelper")

function PetDetailTalentModule:ctor(petUnitData)
	self._petUnitData = petUnitData
	local resource = {
		file = Path.getCSB("PetDetailDynamicModule", "pet"),
		binding = {

		},
	}
	PetDetailTalentModule.super.ctor(self, resource)
end

function PetDetailTalentModule:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	local starMax = self._petUnitData:getStarMax()
	local initial_star = math.max(1, self._petUnitData:getInitial_star())
	for i = initial_star, starMax do
		local des =  PetDetailViewHelper.createTalentDes(self._petUnitData,i)
		self._listView:pushBackCustomItem(des)
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	contentSize.height = contentSize.height + 10
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function PetDetailTalentModule:_isActiveWithRank(rank)
	local rankLevel = self._petUnitData:getStar()
	return rankLevel >= rank
end

function PetDetailTalentModule:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("pet_detail_title_talent"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 34)
	local widgetSize = cc.size(402, 34 + 10)
	widget:setContentSize(widgetSize)
	title:setPosition(titleSize.width / 2, titleSize.height / 2 + 10)
	widget:addChild(title)

	return widget
end



return PetDetailTalentModule