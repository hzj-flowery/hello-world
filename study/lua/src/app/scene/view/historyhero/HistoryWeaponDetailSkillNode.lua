--
-- Author: chenzhongjie
-- Date: 2019-08-23
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HistoryWeaponDetailSkillNode = class("HistoryWeaponDetailSkillNode", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")

function HistoryWeaponDetailSkillNode:ctor(weaponData)
	self._weaponData = weaponData

	local resource = {
		file = Path.getCSB("HistoryHeroDynamicModule", "historyhero"),
		binding = {

		}
	}
	HistoryWeaponDetailSkillNode.super.ctor(self, resource)
end

function HistoryWeaponDetailSkillNode:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	local des = self:_createDes()
	self._listView:pushBackCustomItem(des)

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function HistoryWeaponDetailSkillNode:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("historyhero_weapon_detail_title_skill"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 50)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, 30)
	widget:addChild(title)

	return widget
end

function HistoryWeaponDetailSkillNode:_createDes()
	local briefDes = self._weaponData:getConfig().long_description
	local color = Colors.BRIGHT_BG_TWO

	local widget = ccui.Widget:create()
	local labelDes = cc.Label:createWithTTF(briefDes, Path.getCommonFont(), 20)
	labelDes:setAnchorPoint(cc.p(0, 1))
	labelDes:setLineHeight(26)
	labelDes:setWidth(354)
	labelDes:setColor(color)

	local height = labelDes:getContentSize().height
	labelDes:setPosition(cc.p(24, height + 15))
	widget:addChild(labelDes)

	local size = cc.size(402, height + 20)
	widget:setContentSize(size)

	return widget
end

return HistoryWeaponDetailSkillNode