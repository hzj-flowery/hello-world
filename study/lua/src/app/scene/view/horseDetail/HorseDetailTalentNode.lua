
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HorseDetailTalentNode = class("HorseDetailTalentNode", ListViewCellBase)
local HorseDataHelper = require("app.utils.data.HorseDataHelper")
local CSHelper = require("yoka.utils.CSHelper")

function HorseDetailTalentNode:ctor(horseData)
	self._horseData = horseData
	local resource = {
		file = Path.getCSB("HorseDetailDynamicModule", "horse"),
		binding = {

		},
	}
	HorseDetailTalentNode.super.ctor(self, resource)
end

function HorseDetailTalentNode:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	self:_buildDes()

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function HorseDetailTalentNode:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("horse_detail_title_talent"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 50)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, 30)
	widget:addChild(title)

	return widget
end

function HorseDetailTalentNode:_buildDes()
	local baseId = self._horseData:getBase_id()
	local talentInfo = HorseDataHelper.getHorseTalentInfo(baseId)
	for i, one in ipairs(talentInfo) do
		local des = self:_createDes(one)
		self._listView:pushBackCustomItem(des)
	end
end

function HorseDetailTalentNode:_createDes(info)
	local star = self._horseData:getStar()
	local unlockStar = info.star
	local isActive = star >= unlockStar
	local color = isActive and Colors.SYSTEM_TARGET_RED or Colors.BRIGHT_BG_TWO
	local name = info.name
	local des = info.des
	local unlockDes = ""
	if not isActive then
		unlockDes = Lang.get("horse_detail_skill_unlock_des", {star = unlockStar})
	end

	local widget = ccui.Widget:create()
	local txt = Lang.get("horse_detail_talent_des", {
		name = name, 
		des = des, 
		unlock = unlockDes
	})
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

return HorseDetailTalentNode