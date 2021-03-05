--
-- Author: Liangxu
-- Date: 2018-1-4 14:12:15
-- 变身卡详情 简介模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local AvatarDetailBriefModule = class("AvatarDetailBriefModule", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")

function AvatarDetailBriefModule:ctor()
	local resource = {
		file = Path.getCSB("HeroDetailDynamicModule", "hero"),
		binding = {
			
		},
	}
	
	AvatarDetailBriefModule.super.ctor(self, resource)
end

function AvatarDetailBriefModule:onCreate()
	
end

function AvatarDetailBriefModule:updateUI(data)
	self._data = data
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

function AvatarDetailBriefModule:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("avatar_detail_brief_title"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 36)
	local widgetSize = cc.size(402, 36 + 10)
	widget:setContentSize(widgetSize)
	title:setPosition(titleSize.width / 2, titleSize.height / 2 + 10)
	widget:addChild(title)

	return widget
end

function AvatarDetailBriefModule:_createDes()
	local briefDes = self._data:getConfig().description
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

return AvatarDetailBriefModule