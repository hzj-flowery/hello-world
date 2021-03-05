--
-- Author: Liangxu
-- Date: 2017-12-30 13:59:20
-- 武将置换预览等级模块
local ViewBase = require("app.ui.ViewBase")
local HeroTransformCommonLevel = class("HeroTransformCommonLevel", ViewBase)
local TextHelper = require("app.utils.TextHelper")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")

function HeroTransformCommonLevel:ctor()
	local resource = {
		file = Path.getCSB("HeroTransformCommonInfo1", "hero"),
		binding = {
			
		}
	}

	HeroTransformCommonLevel.super.ctor(self, resource)
end

function HeroTransformCommonLevel:onCreate()
	self:_initView()
end

function HeroTransformCommonLevel:onEnter()
	
end

function HeroTransformCommonLevel:onExit()
	
end

function HeroTransformCommonLevel:_initView()
	self._nodeDesValue:setFontSize(22)
	self._nodeDesValue:setDesColor(Colors.SYSTEM_TARGET_RED)
	self._nodeDesValue:setValueColor(Colors.SYSTEM_TARGET_RED)

	for i = 1, 4 do
		self["_nodeAttr"..i]:setFontSize(22)
	end
end

function HeroTransformCommonLevel:updateUI(baseId, level)
	local config = HeroDataHelper.getHeroConfig(baseId)
	self:_updateDes(level, config)
	self:_updateAttr(config, level)
end

function HeroTransformCommonLevel:_updateDes(level, config)
	local des = Lang.get("hero_transform_preview_level_title")
	if config.color == 7 then
		des = Lang.get("hero_transform_cell_title_gold")
	end
	local value = Lang.get("hero_transform_preview_level_value", {level = level})
	self._nodeDesValue:updateUI(des, value)
end

function HeroTransformCommonLevel:_updateAttr(config, level)
	local info = HeroDataHelper.getBasicAttrWithLevel(config, level)
	local desInfo = TextHelper.getAttrInfoBySort(info)
	for i = 1, 4 do
		local attr = desInfo[i]
		if attr then
			self["_nodeAttr"..i]:setVisible(true)
			self["_nodeAttr"..i]:updateView(attr.id, attr.value)
		else
			self["_nodeAttr"..i]:setVisible(false)
		end
	end
end

return HeroTransformCommonLevel