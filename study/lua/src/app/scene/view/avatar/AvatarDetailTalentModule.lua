--
-- Author: Liangxu
-- Date: 2018-1-4 14:12:15
-- 变身卡详情 天赋模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local AvatarDetailTalentModule = class("AvatarDetailTalentModule", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")

function AvatarDetailTalentModule:ctor()
	local resource = {
		file = Path.getCSB("HeroDetailDynamicModule", "hero"),
		binding = {
			
		},
	}
	
	AvatarDetailTalentModule.super.ctor(self, resource)
end

function AvatarDetailTalentModule:onCreate()
	
end

function AvatarDetailTalentModule:updateUI(data, noActive)
	self._data = data
	local heroId = G_UserData:getTeam():getHeroIdWithPos(1)
	self._heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)

	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	local baseId = AvatarDataHelper.getAvatarConfig(data:getBase_id()).hero_id
	local rankMax = HeroDataHelper.getHeroConfig(baseId).rank_max
	for i = 1, rankMax do
		local des = self:_createDes(i, noActive)
		self._listView:pushBackCustomItem(des)
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	contentSize.height = contentSize.height + 10
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function AvatarDetailTalentModule:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("avatar_detail_talent_title"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 34)
	local widgetSize = cc.size(402, 34 + 10)
	widget:setContentSize(widgetSize)
	title:setPosition(titleSize.width / 2, titleSize.height / 2 + 10)
	widget:addChild(title)

	return widget
end

function AvatarDetailTalentModule:_isActiveWithRank(rank)
	local rankLevel = self._heroUnitData:getRank_lv()
	return rankLevel >= rank
end

function AvatarDetailTalentModule:_createDes(rank, noActive)
	local widget = ccui.Widget:create()

	local isActive = self:_isActiveWithRank(rank)
	if noActive == true then
		isActive = false
	end
	
	local color = isActive and Colors.colorToNumber(Colors.BRIGHT_BG_GREEN) or Colors.colorToNumber(Colors.BRIGHT_BG_TWO)

	local info = AvatarDataHelper.getAvatarConfig(self._data:getBase_id())
	local baseId = info.hero_id
	local limitLevel = 0
	if info.limit == 1 then
		limitLevel = require("app.const.HeroConst").HERO_LIMIT_RED_MAX_LEVEL
	end

	local config = HeroDataHelper.getHeroRankConfig(baseId, rank, limitLevel)
	local name = "["..config.talent_name..rank.."] "
	local des = config.talent_description
	local breakDes = isActive and "" or Lang.get("hero_break_txt_break_des", {rank = rank})
	local txt = name..des..breakDes
	local isFeature = config.talent_target == 0 --天赋属性目标为0，标记此行描述为“特性”
	local content = ""
	if isFeature then
		content = Lang.get("hero_detail_talent_des_2", {
			urlIcon = Path.getTextSignet("txt_tianfu_texing"),
			des = txt,
			color = color,
		})
	else
		content = Lang.get("hero_detail_talent_des_1", {
			des = txt,
			color = color,
		})
	end

	local label = ccui.RichText:createWithContent(content)
	label:setAnchorPoint(cc.p(0, 1))
	label:ignoreContentAdaptWithSize(false)
	label:setContentSize(cc.size(360,0))
	label:formatText()

	local height = label:getContentSize().height
	label:setPosition(cc.p(24, height + 10))
	widget:addChild(label)
 
	local size = cc.size(402, height + 10)
	widget:setContentSize(size)

	return widget
end

return AvatarDetailTalentModule