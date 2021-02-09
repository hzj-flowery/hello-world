--
-- Author: Liangxu
-- Date: 2017-12-30 13:59:20
-- 武将置换预览觉醒模块
local ViewBase = require("app.ui.ViewBase")
local HeroTransformCommonAwake = class("HeroTransformCommonAwake", ViewBase)
local HeroDataHelper = require("app.utils.data.HeroDataHelper")

function HeroTransformCommonAwake:ctor()
	local resource = {
		file = Path.getCSB("HeroTransformCommonInfo2", "hero"),
		binding = {
			
		}
	}

	HeroTransformCommonAwake.super.ctor(self, resource)
end

function HeroTransformCommonAwake:onCreate()
	self:_initView()
end

function HeroTransformCommonAwake:onEnter()
	
end

function HeroTransformCommonAwake:onExit()
	
end

function HeroTransformCommonAwake:_initView()
	self._nodeDesValue:setFontSize(20)
	self._nodeDesValue:setDesColor(Colors.BRIGHT_BG_TWO)
	self._nodeDesValue:setValueColor(Colors.BRIGHT_BG_TWO)
end

function HeroTransformCommonAwake:updateUI(baseId, awakeLevel, gemstones)
	self:_updateDesAndStar(awakeLevel)
	self:_updateGemstone(baseId, awakeLevel, gemstones)
end

function HeroTransformCommonAwake:_updateDesAndStar(awakeLevel)
	local star, level = HeroDataHelper.convertAwakeLevel(awakeLevel)
	local des = Lang.get("hero_transform_preview_awake_title")
	local value = Lang.get("hero_transform_preview_awake_value", {star = star, level = level})
	self._nodeDesValue:updateUI(des, value)
	self._nodeStar:setStarOrMoon(star)
end

function HeroTransformCommonAwake:_updateGemstone(baseId, awakeLevel, gemstones)
	local heroConfig = HeroDataHelper.getHeroConfig(baseId)
	local awakeCost = heroConfig.awaken_cost 
	local info = HeroDataHelper.getHeroAwakenConfig(awakeLevel, awakeCost)
	for i = 1, 4 do
		local baseId = info["gemstone_value"..i]
		local stoneId = gemstones[i]
		local mask = stoneId <= 0
		if baseId>0 then
			self["_nodeGemstone"..i]:updateUI(baseId)
			self["_nodeGemstone"..i]:setVisible(true)
		else
			self["_nodeGemstone"..i]:setVisible(false)
		end
		self["_nodeGemstone"..i]:setIconMask(mask)
	end
end

return HeroTransformCommonAwake