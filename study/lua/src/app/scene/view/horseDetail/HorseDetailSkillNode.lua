
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HorseDetailSkillNode = class("HorseDetailSkillNode", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")
local HorseConst = require("app.const.HorseConst")

function HorseDetailSkillNode:ctor(horseData)
	self._horseData = horseData
	local resource = {
		file = Path.getCSB("HorseDetailDynamicModule", "horse"),
		binding = {

		},
	}
	HorseDetailSkillNode.super.ctor(self, resource)
end

function HorseDetailSkillNode:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	for star = 1, HorseConst.HORSE_STAR_MAX do
		local des = self:_createDes(star)
		self._listView:pushBackCustomItem(des)
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function HorseDetailSkillNode:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("horse_detail_title_skill"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 50)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, 30)
	widget:addChild(title)

	return widget
end

function HorseDetailSkillNode:_createDes(star)
	local horseId = self._horseData:getBase_id()
	local curStar = self._horseData:getStar()
	local info = HorseDataHelper.getHorseStarConfig(horseId, star)
	local des = info.skill
	local isActive = curStar >= star
	local color = Colors.BRIGHT_BG_TWO
	if self._horseData:isUser() then
		color = isActive and Colors.SYSTEM_TARGET_RED or Colors.BRIGHT_BG_TWO
	end
	local unlockDes = Lang.get("horse_detail_skill_unlock_des", {star = star})

	local txt = Lang.get("horse_detail_skill_des", {
		des = des, 
		unlock = unlockDes
	})
	local widget = ccui.Widget:create()
	local label = cc.Label:createWithTTF(txt, Path.getCommonFont(), 20)
	label:setAnchorPoint(cc.p(0, 1))
	label:setLineHeight(26)
	label:setWidth(354)
	label:setColor(color)
	local height = label:getContentSize().height
	label:setPosition(cc.p(24, height + 10))
	widget:addChild(label)

	local size = cc.size(402, height + 10)
	widget:setContentSize(size)

	return widget
end

return HorseDetailSkillNode