--
-- Author: Liangxu
-- Date: 2018-1-4 14:12:15
-- 变身卡详情 天赋模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local AvatarDetailAvatarTalentModule = class("AvatarDetailAvatarTalentModule", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")

function AvatarDetailAvatarTalentModule:ctor()
	local resource = {
		file = Path.getCSB("HeroDetailDynamicModule", "hero"),
		binding = {
			
		},
	}
	
	AvatarDetailAvatarTalentModule.super.ctor(self, resource)
end

function AvatarDetailAvatarTalentModule:onCreate()
	
end

function AvatarDetailAvatarTalentModule:updateUI(data)
	self._data = data

	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	local templet = data:getConfig().levelup_cost
	local allInfo = AvatarDataHelper.getAllTalentInfo(templet)
	for i, info in ipairs(allInfo) do
		local des = self:_createDes(info)
		self._listView:pushBackCustomItem(des)
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	contentSize.height = contentSize.height + 10
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function AvatarDetailAvatarTalentModule:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("avatar_detail_avatar_talent_title"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 34)
	local widgetSize = cc.size(402, 34 + 10)
	widget:setContentSize(widgetSize)
	title:setPosition(titleSize.width / 2, titleSize.height / 2 + 10)
	widget:addChild(title)

	return widget
end

function AvatarDetailAvatarTalentModule:_createDes(info)
	local widget = ccui.Widget:create()

	local isActive = self._data:getLevel() >= info.level
	local color = isActive and Colors.colorToNumber(Colors.BRIGHT_BG_GREEN) or Colors.colorToNumber(Colors.BRIGHT_BG_TWO)
	local name = "["..info.talent_name.."] "
	local des = info.talent_description
	local breakDes = isActive and "" or Lang.get("avatar_detail_talent_unlock", {level = info.level})
	local txt = name..des..breakDes
	local content = Lang.get("avatar_detail_talent_des", {
		des = txt,
		color = color,
	})

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

return AvatarDetailAvatarTalentModule