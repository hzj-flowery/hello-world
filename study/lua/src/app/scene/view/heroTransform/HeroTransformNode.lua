--
-- Author: Liangxu
-- Date: 2017-12-28 16:06:18
-- 武将置换Node
local HeroTransformNode = class("HeroTransformNode")
local HeroConst = require("app.const.HeroConst")

function HeroTransformNode:ctor(target, type, callback)
	self._target = target
	self._type = type
	self._callback = callback
	self:_initData()
	self:_initView()
end

function HeroTransformNode:_initData()
	self._heroId = 0
	self._limitLevel = 0
	self._limitRedLevel = 0
	self._heroCount = 0
	self._lock = false
end

function HeroTransformNode:_initView()
	self._fileNodeHero = ccui.Helper:seekNodeByName(self._target, "FileNodeHero")
	cc.bind(self._fileNodeHero, "CommonHeroAvatar")
	self._fileNodeHero:setTouchEnabled(true)
	self._fileNodeHero:setCallBack(handler(self, self._onClickHero))

	self._textTip = ccui.Helper:seekNodeByName(self._target, "TextTip")
	self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "ButtonAdd")
	self._buttonAdd:addClickEventListenerEx(handler(self, self._onButtonAddClicked))
	self._imageNum = ccui.Helper:seekNodeByName(self._target, "ImageNum")
	self._textNum = ccui.Helper:seekNodeByName(self._target, "TextNum")

	self._textTip:setString(Lang.get("hero_transform_choose_tip"..self._type))
end

function HeroTransformNode:_resetView()
	self._fileNodeHero:setOpacity(255)
	self._fileNodeHero:setVisible(false)
	self._textTip:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._imageNum:setVisible(false)
end

function HeroTransformNode:updateUI()
	self:_resetView()
	if self._lock then
		return
	end

	if self._heroId > 0 then
		self._fileNodeHero:updateUI(self._heroId, nil, nil, self._limitLevel, nil, nil, self._limitRedLevel)
		self._fileNodeHero:setVisible(true)
	else
		self._buttonAdd:setVisible(true)
		self._textTip:setVisible(true)
	end
	if self._heroCount > 1 then
		self._textNum:setString(Lang.get("hero_transform_hero_count", {count = self._heroCount}))
		self._imageNum:setVisible(true)
	end
end

function HeroTransformNode:setLock(lock)
	self._lock = lock
end

function HeroTransformNode:setHeroId(heroId, limitLevel, limitRedLevel)
	self._heroId = heroId
	self._limitLevel = limitLevel
	self._limitRedLevel = limitRedLevel
end

function HeroTransformNode:getHeroId()
	return self._heroId
end

function HeroTransformNode:setHeroCount(count)
	self._heroCount = count
end

function HeroTransformNode:getHeroCount()
	return self._heroCount
end

function HeroTransformNode:_onButtonAddClicked()
	if self._callback then
		self._callback()
	end
end

function HeroTransformNode:_onClickHero()
	if self._callback then
		self._callback()
	end
end

function HeroTransformNode:setEnabled(enable)
	self._fileNodeHero:setTouchEnabled(enable)
	self._buttonAdd:setEnabled(enable)
end

function HeroTransformNode:getHeroNode()
	return self._fileNodeHero
end

return HeroTransformNode