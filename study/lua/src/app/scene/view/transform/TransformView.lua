-- Author: zhanglinsen
-- Date:2018-06-29 13:49:16
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local FunctionConst = require("app.const.FunctionConst")
local TopBarStyleConst = require("app.const.TopBarStyleConst")
local TransformConst = require("app.const.TransformConst")
local TreasureTransformView = require("app.scene.view.transform.treasure.TreasureTransformView")
local InstrumentTransformView = require("app.scene.view.transform.instrument.InstrumentTransformView")
local HeroTransformView = require("app.scene.view.heroTransform.HeroTransformView")
local TransformView = class("TransformView", ViewBase)
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")

function TransformView:ctor(transformType)
	self._selectTabIndex = transformType or TransformConst.HERO

	--csb bind var name
	self._buttonHelp = nil  --CommonHelp
	self._nodeTabIcon1 = nil  --CommonTabIcon
	self._nodeTabIcon2 = nil  --CommonTabIcon
	self._nodeTabIcon3 = nil  --CommonTabIcon
	self._panelDesign = nil  --Panel
	self._panelContent = nil  --Panel
	self._topbarBase = nil  --CommonTopbarBase
	self._curHeroQuality = 0 --当前武将的品质

	local resource = {
		file = Path.getCSB("TransformView", "transform"),
		size = G_ResolutionManager:getDesignSize(),
	}
	TransformView.super.ctor(self, resource)
end

function TransformView:onCreate()
	self:_initData()
	self:_initView()
end

function TransformView:onEnter()
	self._signalHeroTransformChoose = G_SignalManager:add(SignalConst.EVENT_HERO_TRANSFORM_CHOOSE, handler(self, self._heroTransformChoose))
	self:_updateData()
	self:_updateView()
end

function TransformView:onExit()
	self._signalHeroTransformChoose:remove()
	self._signalHeroTransformChoose = nil
end

function TransformView:_initData()

end

function TransformView:_initView()
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_TRANSFORM_HERO)
	self._topbarBase:setImageTitle("txt_sys_com_zhihuan")
	self._buttonHelp:updateUI(FunctionConst.FUNC_CONVERT)

	self._subLayers = {} --存储子layer
	local showTabCount = 0
	for i = 1, 3 do
		local txt = Lang.get("transform_tab_icon_"..i)
		local isOpen = true
		if i == 3 then --神兵再判断一下
			isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_CONVERT_INSTRUMENT)
		end
		self["_nodeTabIcon"..i]:updateUI(txt, isOpen, i)
		self["_nodeTabIcon"..i]:setCallback(handler(self, self._onClickTabIcon))
		self["_nodeTabIcon"..i]:setVisible(isOpen)
		self["_imageLine"..i]:setVisible(isOpen)
		if isOpen then
			showTabCount = showTabCount + 1
		end
	end
	self._imageTail:setPositionY(-315+135*(3-showTabCount))
end
function TransformView:_onClickTabIcon(index)
	if index == self._selectTabIndex then
		return
	end
	if index == TransformConst.HERO then
		if self._curHeroQuality == 6 then
			self._topbarBase:updateUI(TopBarStyleConst.STYLE_TRANSFORM_HERO_RED)
		elseif self._curHeroQuality == 7 then
			self._topbarBase:updateUI(TopBarStyleConst.STYLE_TRANSFORM_HERO_GOLD)
		else
			self._topbarBase:updateUI(TopBarStyleConst.STYLE_TRANSFORM_HERO)
		end
	elseif index == TransformConst.TREASURE then
		self._topbarBase:updateUI(TopBarStyleConst.STYLE_TRANSFORM_TREASURE)
	elseif index == TransformConst.INSTRUMENT then
		self._topbarBase:updateUI(TopBarStyleConst.STYLE_TRANSFORM_INSTRUMENT)
	end

	self._selectTabIndex = index
	self:_updateView()
end

function TransformView:updateTabIcons()
	for i = 1, 3 do
		self["_nodeTabIcon"..i]:setSelected(i == self._selectTabIndex)
	end
end
function TransformView:_updateData()
	
end

function TransformView:_updateView()
	self:updateTabIcons()
	local layer = self._subLayers[self._selectTabIndex]
	if layer == nil then
		if self._selectTabIndex == TransformConst.HERO then
			layer = HeroTransformView.new(self)
		elseif self._selectTabIndex == TransformConst.TREASURE then
			layer = TreasureTransformView.new(self)
		elseif self._selectTabIndex == TransformConst.INSTRUMENT then
			layer = InstrumentTransformView.new(self)
		end

		if layer then
			self._panelContent:addChild(layer)
			self._subLayers[self._selectTabIndex] = layer
		end
	end
	for k, subLayer in pairs(self._subLayers) do
		subLayer:setVisible(false)
	end
	layer:setVisible(true)
	-- layer:onEnter()
end

function TransformView:_heroTransformChoose(eventName, color)
	self._curHeroQuality = color
	if color == 5 then
		self._topbarBase:updateUI(TopBarStyleConst.STYLE_TRANSFORM_HERO)
	elseif color == 6 then
		self._topbarBase:updateUI(TopBarStyleConst.STYLE_TRANSFORM_HERO_RED)
	elseif color == 7 then
		self._topbarBase:updateUI(TopBarStyleConst.STYLE_TRANSFORM_HERO_GOLD)
	end
end

return TransformView