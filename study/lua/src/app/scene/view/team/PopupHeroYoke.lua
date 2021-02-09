--
-- Author: Liangxu
-- Date: 2017-03-31 19:50:07
-- 武将羁绊详情弹框
local PopupBase = require("app.ui.PopupBase")
local PopupHeroYoke = class("PopupHeroYoke", PopupBase)
local TeamYokeConditionNode = require("app.scene.view.team.TeamYokeConditionNode")
local YokeDesNode = require("app.scene.view.team.YokeDesNode")
local TeamViewHelper = require("app.scene.view.team.TeamViewHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function PopupHeroYoke:ctor(heroUnitData)
	self._heroUnitData = heroUnitData

	local resource = {
		file = Path.getCSB("PopupHeroYoke", "hero"),
		binding = {
			
		}
	}
	PopupHeroYoke.super.ctor(self, resource)
end

function PopupHeroYoke:onCreate()
	self._panelBg:setTitle(Lang.get("hero_yoke_title"))
	self._panelBg:addCloseEventListener(handler(self, self._onButtonClose))
	self._nodeTitle:setFontSize(22)
	self._nodeTitle:setFontName(Path.getCommonFont())
end

function PopupHeroYoke:onEnter()
	self:_updateView()
end

function PopupHeroYoke:onExit()
	
end

function PopupHeroYoke:_updateView()
	self._listView:removeAllItems()

	local heroBaseId = self._heroUnitData:getBase_id()
	local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId)
	self._nodeTitle:setTitle(heroParam.name)
	self._nodeTitle:setTitleColor(heroParam.icon_color)
	if heroParam.icon_color_outline_show then
		self._nodeTitle:setTitleOutLine(heroParam.icon_color_outline)
	end

	local heroYoke = UserDataHelper.getHeroYokeInfo(self._heroUnitData)
	if heroYoke == nil then
		return
	end

	for j, unit in ipairs(heroYoke.yokeInfo) do
		local teamYokeConditionNode = TeamYokeConditionNode.new()
		teamYokeConditionNode:updateView(unit)
		self._listView:pushBackCustomItem(teamYokeConditionNode)

		local widgetCondition = self:_createWidgetCondition(unit)
		self._listView:pushBackCustomItem(widgetCondition)

		if j ~= #heroYoke.yokeInfo then
			local widgetLine = self:_createWidgetLine()
			self._listView:pushBackCustomItem(widgetLine)
		end
	end
end

function PopupHeroYoke:_createWidgetCondition(unit)
	local widget = ccui.Widget:create()
	local yokeDesNode = YokeDesNode.new()
	yokeDesNode:updateView(unit, 525)
	yokeDesNode:setPosition(cc.p(18, 0))
	widget:addChild(yokeDesNode)
	widget:setContentSize(yokeDesNode:getContentSize())

	return widget
end

function PopupHeroYoke:_createWidgetLine()
	local widget = ccui.Widget:create()
	local line = TeamViewHelper.createLine(564, 0)
	widget:addChild(line)
	widget:setContentSize(line:getContentSize())

	return widget
end

function PopupHeroYoke:_onButtonClose()
	self:close()
end

return PopupHeroYoke
