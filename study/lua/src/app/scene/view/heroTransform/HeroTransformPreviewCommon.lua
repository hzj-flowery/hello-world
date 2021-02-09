--
-- Author: Liangxu
-- Date: 2017-07-15 15:34:05
-- 武将置换预览
local HeroTransformPreviewCommon = class("HeroTransformPreviewCommon")

function HeroTransformPreviewCommon:ctor(target)
	self._target = target
	self:_initData()
	self:_initView()
end

function HeroTransformPreviewCommon:_initData()
	
end

function HeroTransformPreviewCommon:_initView()
	self._nodeTitle = ccui.Helper:seekNodeByName(self._target, "NodeTitle")
	cc.bind(self._nodeTitle, "CommonDetailTitle")
	self._nodeHeroIcon = ccui.Helper:seekNodeByName(self._target, "NodeHeroIcon")
	cc.bind(self._nodeHeroIcon, "CommonHeroIcon")
	self._nodeHeroName = ccui.Helper:seekNodeByName(self._target, "NodeHeroName")
	cc.bind(self._nodeHeroName, "CommonHeroName")

	self._nodeTitle:setFontSize(24)
	self._nodeTitle:setImageBaseSize(cc.size(242, 44))
	self._nodeTitle:setFontImageBgSize(cc.size(226, 34))
	self._nodeHeroName:setFontSize(20)
end

function HeroTransformPreviewCommon:updateUI(type, heroBaseId, limitLevel, rankLevel, limitRedLevel)
	if type == 1 then
		self._nodeTitle:setTitle(Lang.get("hero_transform_preview_before"))
	elseif type == 2 then
		self._nodeTitle:setTitle(Lang.get("hero_transform_preview_after"))
	end
	
	self._nodeHeroIcon:updateUI(heroBaseId, nil, limitLevel, limitRedLevel)
	self._nodeHeroName:setName(heroBaseId, rankLevel, limitLevel, nil, limitRedLevel)
	-- self._nodeHeroName:disableOutline()
end

return HeroTransformPreviewCommon