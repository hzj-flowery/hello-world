--
-- Author: Liangxu
-- Date: 2017-12-30 13:59:20
-- 武将置换预览突破模块
local ViewBase = require("app.ui.ViewBase")
local HeroTransformCommonBreak = class("HeroTransformCommonBreak", ViewBase)
local TextHelper = require("app.utils.TextHelper")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")

function HeroTransformCommonBreak:ctor()
	local resource = {
		file = Path.getCSB("HeroTransformCommonInfo1", "hero"),
		binding = {
			
		}
	}

	HeroTransformCommonBreak.super.ctor(self, resource)
end

function HeroTransformCommonBreak:onCreate()
	self:_initView()
end

function HeroTransformCommonBreak:onEnter()
	
end

function HeroTransformCommonBreak:onExit()
	
end

function HeroTransformCommonBreak:_initView()
	self._nodeDesValue:setFontSize(22)
	self._nodeDesValue:setDesColor(Colors.SYSTEM_TARGET_RED)
	self._nodeDesValue:setValueColor(Colors.SYSTEM_TARGET_RED)

	for i = 1, 4 do
		self["_nodeAttr"..i]:setFontSize(22)
	end
end

function HeroTransformCommonBreak:updateUI(baseId, rank)
	self:_updateDes(rank)
	self:_updateAttr(baseId, rank)
end

function HeroTransformCommonBreak:_updateDes(rank)
	local des = Lang.get("hero_transform_preview_break_title")
	self._nodeDesValue:updateUI(des, rank)
end

function HeroTransformCommonBreak:_updateAttr(baseId, rank)
	local info = HeroDataHelper.getBreakAttrWithBaseIdAndRank(baseId, rank, 0, 0)
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

return HeroTransformCommonBreak