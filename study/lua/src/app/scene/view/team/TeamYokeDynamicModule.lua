--
-- Author: Liangxu
-- Date: 2017-07-28 14:14:54
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local TeamYokeDynamicModule = class("TeamYokeDynamicModule", ListViewCellBase)
local TeamYokeConditionNode = require("app.scene.view.team.TeamYokeConditionNode")
local YokeDesNode = require("app.scene.view.team.YokeDesNode")
local TeamViewHelper = require("app.scene.view.team.TeamViewHelper")

function TeamYokeDynamicModule:ctor()
	local resource = {
		file = Path.getCSB("TeamYokeDynamicModule", "team"),
		binding = {

		}
	}
	TeamYokeDynamicModule.super.ctor(self, resource)
end

function TeamYokeDynamicModule:onCreate()
	
end

function TeamYokeDynamicModule:updateView(yokeInfo)
	for j, unit in ipairs(yokeInfo) do
		local teamYokeConditionNode = TeamYokeConditionNode.new()
		teamYokeConditionNode:updateView(unit)
		self._listView:pushBackCustomItem(teamYokeConditionNode)

		local disHeight = 10
		if j == #yokeInfo then --最后一条，下面间距要大一些
			disHeight = 30
		end
		
		local widgetCondition = self:_createWidgetDes(unit, disHeight)
		self._listView:pushBackCustomItem(widgetCondition)

		if j ~= #yokeInfo then
			local widgetLine = self:_createWidgetLine(true)
			self._listView:pushBackCustomItem(widgetLine)
		end
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function TeamYokeDynamicModule:_createWidgetDes(unit, disHeight)
	local widget = ccui.Widget:create()
	local yokeDesNode = YokeDesNode.new()
	yokeDesNode:updateView(unit, 510)
	yokeDesNode:setPosition(cc.p(24, disHeight))
	widget:addChild(yokeDesNode)
	local size = yokeDesNode:getContentSize()
	widget:setContentSize(cc.size(size.width, size.height + disHeight))

	return widget
end

function TeamYokeDynamicModule:_createWidgetLine(show)
	local widget = ccui.Widget:create()
	local line = TeamViewHelper.createLine(540, 5)
	widget:addChild(line)
	widget:setContentSize(line:getContentSize())
	line:setVisible(show)

	return widget
end

function TeamYokeDynamicModule:onlyShow(yokeInfo)
	local function createDes(unit, disHeight)
		local widget = ccui.Widget:create()
		local yokeDesNode = YokeDesNode.new()
		yokeDesNode:onlyShow(unit, 510)
		yokeDesNode:setPosition(cc.p(24, disHeight))
		widget:addChild(yokeDesNode)
		local size = yokeDesNode:getContentSize()
		widget:setContentSize(cc.size(size.width, size.height + disHeight))

		return widget
	end

	for j, unit in ipairs(yokeInfo) do
		local teamYokeConditionNode = TeamYokeConditionNode.new()
		teamYokeConditionNode:onlyShow(unit)
		self._listView:pushBackCustomItem(teamYokeConditionNode)

		local disHeight = 10
		if j == #yokeInfo then --最后一条，下面间距要大一些
			disHeight = 30
		end
		
		local widgetCondition = createDes(unit, disHeight)
		self._listView:pushBackCustomItem(widgetCondition)

		if j ~= #yokeInfo then
			local widgetLine = self:_createWidgetLine(true)
			self._listView:pushBackCustomItem(widgetLine)
		end
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

return TeamYokeDynamicModule