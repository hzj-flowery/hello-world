--
-- Author: Liangxu
-- Date: 2017-07-15 15:34:05
-- 武将置换预览
local PopupBase = require("app.ui.PopupBase")
local PopupHeroTransformPreview = class("PopupHeroTransformPreview", PopupBase)
local HeroConst = require("app.const.HeroConst")
local HeroTransformPreviewCommon = require("app.scene.view.heroTransform.HeroTransformPreviewCommon")
local HeroTransformCommonLevel = require("app.scene.view.heroTransform.HeroTransformCommonLevel")
local HeroTransformCommonBreak = require("app.scene.view.heroTransform.HeroTransformCommonBreak")
local HeroTransformCommonAwake = require("app.scene.view.heroTransform.HeroTransformCommonAwake")

function PopupHeroTransformPreview:ctor(parentView, srcHeroId, tarHeroBaseId)
	self._parentView = parentView
	self._srcHeroId = srcHeroId
	self._tarHeroBaseId = tarHeroBaseId

	local resource = {
		file = Path.getCSB("PopupHeroTransformPreview", "hero"),
		binding = {
			_buttonClose = {
				events = {{event = "touch", method = "_onButtonClose"}}
			},
		}
	}
	
	PopupHeroTransformPreview.super.ctor(self, resource)
end

function PopupHeroTransformPreview:onCreate()
	self:_initData()
	self:_initView()
end

function PopupHeroTransformPreview:_initData()
	self._selectTabIndex = 0
	self._subNodes = {}
	self._srcHeroData = G_UserData:getHero():getUnitDataWithId(self._srcHeroId)
end

function PopupHeroTransformPreview:_initView()
	self._nodeBg:setTitle(Lang.get("hero_transform_preview_title"))
	self._nodeBg:addCloseEventListener(handler(self, self._onButtonClose))
	self._buttonClose:setString(Lang.get("hero_transform_preview_btn_close"))

	self:_initTab()
	local srcCommon = HeroTransformPreviewCommon.new(self._nodeCommon1)
	local tarCommon = HeroTransformPreviewCommon.new(self._nodeCommon2)
	local srcHeroBaseId = self._srcHeroData:getBase_id()
	local tarHeroBaseId = self._tarHeroBaseId
	local limitLevel = self._srcHeroData:getLimit_level()
	local limitRedLevel = self._srcHeroData:getLimit_rtg()
	srcCommon:updateUI(1, srcHeroBaseId, limitLevel, self._srcHeroData:getRank_lv(), limitRedLevel)
	tarCommon:updateUI(2, tarHeroBaseId, limitLevel, self._srcHeroData:getRank_lv(), limitRedLevel)
end

function PopupHeroTransformPreview:_initTab()
	local param = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		textList = {
			Lang.get("hero_transform_preview_tab1"),
			Lang.get("hero_transform_preview_tab2"),
			Lang.get("hero_transform_preview_tab3"),
		}
	}
	if self:_isChooseGoldHero() then
		param = {
			callback = handler(self, self._onTabSelect),
			isVertical = 2,
			textList = {
				Lang.get("hero_transform_preview_tab4"),
			}
		}
	end

	self._nodeTabRoot:recreateTabs(param)
end

function PopupHeroTransformPreview:onEnter()
	self:_updateData()
	self._nodeTabRoot:setTabIndex(1)
end

function PopupHeroTransformPreview:onExit()
	
end

function PopupHeroTransformPreview:_onTabSelect(index, sender)
	if self._selectTabIndex == index then
		return
	end
	self._selectTabIndex = index
	self:_updateView()
end

function PopupHeroTransformPreview:_updateData()
	
end

function PopupHeroTransformPreview:_updateView()
	local nodes = self._subNodes[self._selectTabIndex]
	if nodes == nil then
		nodes = {}
		local srcHeroBaseId = self._srcHeroData:getBase_id()
		local tarHeroBaseId = self._tarHeroBaseId
		
		if self._selectTabIndex == HeroConst.HERO_TRAIN_UPGRADE then
			local heroLevel = self._srcHeroData:getLevel()
			nodes[1] = HeroTransformCommonLevel.new()
			nodes[2] = HeroTransformCommonLevel.new()
			nodes[1]:updateUI(srcHeroBaseId, heroLevel)
			nodes[2]:updateUI(tarHeroBaseId, heroLevel)

		elseif self._selectTabIndex == HeroConst.HERO_TRAIN_BREAK then
			local heroRank = self._srcHeroData:getRank_lv()
			nodes[1] = HeroTransformCommonBreak.new()
			nodes[2] = HeroTransformCommonBreak.new()
			nodes[1]:updateUI(srcHeroBaseId, heroRank)
			nodes[2]:updateUI(tarHeroBaseId, heroRank)

		elseif self._selectTabIndex == HeroConst.HERO_TRAIN_AWAKE then
			local awakeLevel = self._srcHeroData:getAwaken_level()
			local gemstones = self._srcHeroData:getAwaken_slots()
			nodes[1] = HeroTransformCommonAwake.new()
			nodes[2] = HeroTransformCommonAwake.new()
			nodes[1]:updateUI(srcHeroBaseId, awakeLevel, gemstones)
			nodes[2]:updateUI(tarHeroBaseId, awakeLevel, gemstones)
		end

		if nodes[1] and nodes[2] then
			self._nodeInfo1:addChild(nodes[1])
			self._nodeInfo2:addChild(nodes[2])
			self._subNodes[self._selectTabIndex] = nodes
		end
	end

	for k, subs in pairs(self._subNodes) do
		subs[1]:setVisible(false)
		subs[2]:setVisible(false)
	end
	nodes[1]:setVisible(true)
	nodes[2]:setVisible(true)
end

function PopupHeroTransformPreview:_onButtonClose()
	self:close()
end

--是否选的是金将
function PopupHeroTransformPreview:_isChooseGoldHero()
	if self._srcHeroData then
		local color = self._srcHeroData:getConfig().color
		if color == 7 then
			return true
		end
	end
	return false
end

return PopupHeroTransformPreview