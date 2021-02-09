--
-- Author: Liangxu
-- Date: 2017-03-01 14:22:05
-- 武将详情 简介模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HeroDetailBriefModule = class("HeroDetailBriefModule", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")

function HeroDetailBriefModule:ctor(heroUnitData)
	self._heroUnitData = heroUnitData

	local resource = {
		file = Path.getCSB("HeroDetailDynamicModule", "hero"),
		binding = {

		}
	}
	HeroDetailBriefModule.super.ctor(self, resource)
end

function HeroDetailBriefModule:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	local des = self:_createDes()
	self._listView:pushBackCustomItem(des)

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	contentSize.height = contentSize.height + 10
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function HeroDetailBriefModule:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("hero_detail_title_brief"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 36)
	local widgetSize = cc.size(402, 36 + 10)
	widget:setContentSize(widgetSize)
	title:setPosition(titleSize.width / 2, titleSize.height / 2 + 7)
	widget:addChild(title)

	return widget
end

function HeroDetailBriefModule:_createDes()
	local briefDes = self._heroUnitData:getConfig().description
	local color = Colors.BRIGHT_BG_TWO

	local widget = ccui.Widget:create()
	local labelDes = cc.Label:createWithTTF(briefDes, Path.getCommonFont(), 20)
	labelDes:setAnchorPoint(cc.p(0, 1))
	labelDes:setLineHeight(26)
	labelDes:setWidth(350)
	labelDes:setColor(color)

	local height = labelDes:getContentSize().height
	labelDes:setPosition(cc.p(24, height + 15))
	widget:addChild(labelDes)

	local size = cc.size(402, height + 20)
	widget:setContentSize(size)

	return widget
end

return HeroDetailBriefModule