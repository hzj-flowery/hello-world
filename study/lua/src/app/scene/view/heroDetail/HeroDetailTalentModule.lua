--
-- Author: Liangxu
-- Date: 2017-03-01 11:05:27
-- 武将详情 天赋模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HeroDetailTalentModule = class("HeroDetailTalentModule", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local CSHelper = require("yoka.utils.CSHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")

function HeroDetailTalentModule:ctor(heroUnitData, notCheckAvatar, limitLevel, isGoldTrain, hideActive, limitRedLevel)
	self._heroUnitData = heroUnitData
	self._notCheckAvatar = notCheckAvatar --需要特殊处理，不检查变身卡
	self._limitLevel = limitLevel
	self._limitRedLevel = limitRedLevel
	self._isGoldTrain = isGoldTrain or false
	self._hideActive = hideActive or false

	local resource = {
		file = Path.getCSB("HeroDetailDynamicModule", "hero"),
		binding = {}
	}
	HeroDetailTalentModule.super.ctor(self, resource)
end

function HeroDetailTalentModule:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	local rankMax = self._heroUnitData:getConfig().rank_max
	for i = 1, rankMax do
		local des = self:_createDes(i)
		if des then
			self._listView:pushBackCustomItem(des)
		end
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	contentSize.height = contentSize.height + 10
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function HeroDetailTalentModule:_isActiveWithRank(rank)
	local rankLevel = self._heroUnitData:getRank_lv()
	return rankLevel >= rank
end

function HeroDetailTalentModule:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("hero_detail_title_talent"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 34)
	local widgetSize = cc.size(402, 34 + 10)
	widget:setContentSize(widgetSize)
	title:setPosition(titleSize.width / 2, titleSize.height / 2 + 7)
	widget:addChild(title)

	return widget
end

function HeroDetailTalentModule:_createDes(rank)
	local widget = ccui.Widget:create()

	local isActive = self._heroUnitData:isUserHero() and self:_isActiveWithRank(rank)
	local color = isActive and Colors.colorToNumber(Colors.BRIGHT_BG_GREEN) or Colors.colorToNumber(Colors.BRIGHT_BG_TWO)

	local baseId, isEquipAvatar, avatarLimitLevel, avatarRedLimitLevel = AvatarDataHelper.getShowHeroBaseIdByCheck(self._heroUnitData)
	local limitLevel = avatarLimitLevel or self._limitLevel or self._heroUnitData:getLimit_level()
	local limitRedLevel = avatarRedLimitLevel or self._limitRedLevel or self._heroUnitData:getLimit_rtg()
	if self._notCheckAvatar then
		baseId = self._heroUnitData:getBase_id()
		limitLevel = self._heroUnitData:getLimit_level()
		limitRedLevel = self._heroUnitData:getLimit_rtg()
	end
	local config = UserDataHelper.getHeroRankConfig(baseId, rank, limitLevel, limitRedLevel)
	if config == nil then
		return nil
	end

	local name = "[" .. config.talent_name .. rank .. "] "
	local des = config.talent_description
	local HeroGoldHelper = require("app.scene.view.heroGoldTrain.HeroGoldHelper")
	local breakDes = ""
	if HeroGoldHelper.isPureHeroGold(self._heroUnitData) then
		breakDes = (isActive or self._hideActive) and "" or Lang.get("hero_gold_txt_break_des", {rank = rank})
	else
		breakDes = isActive and "" or Lang.get("hero_break_txt_break_des", {rank = rank})
	end
	local isFeature = config.talent_target == 0 --天赋属性目标为0，标记此行描述为“特性”
	local content = ""
	local color2 = color
	if self._isGoldTrain then
		color2 = Colors.colorToNumber(Colors.SYSTEM_TARGET_RED)
	end
	if isFeature then
		content =
			Lang.get(
			"hero_limit_talent_des_2",
			{
				urlIcon = Path.getTextSignet("txt_tianfu_texing"),
				name = name,
				des = des,
				breakDes = breakDes,
				color1 = color,
				color2 = color2
			}
		)
	else
		content =
			Lang.get(
			"hero_limit_talent_des_1",
			{
				name = name,
				des = des,
				breakDes = breakDes,
				color1 = color,
				color2 = color2
			}
		)
	end

	local label = ccui.RichText:createWithContent(content)
	label:setAnchorPoint(cc.p(0, 1))
	label:ignoreContentAdaptWithSize(false)
	label:setContentSize(cc.size(360, 0))
	label:formatText()

	local height = label:getContentSize().height
	label:setPosition(cc.p(24, height + 10))
	widget:addChild(label)

	local size = cc.size(402, height + 10)
	widget:setContentSize(size)

	return widget
end

return HeroDetailTalentModule
