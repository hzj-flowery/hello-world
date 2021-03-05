--
-- Author: Liangxu
-- Date: 2017-12-25 14:48:55
-- 通用变身卡展示控件
local CommonAvatarAvatar = class("CommonAvatarAvatar")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
    "updateUI",
    "setTouchEnabled",
    "setScale",
    "getHeight",
    "playAnimationOnce",
    "setBubble",
    "resetImageTalk",
}

function CommonAvatarAvatar:ctor()
	self._target = nil
	self._spineHero = nil
	self._height = 0
	self._effect = nil
end

function CommonAvatarAvatar:_init()
	self._panelClick = ccui.Helper:seekNodeByName(self._target, "Panel_click")
	self._panelClick:addClickEventListenerEx(handler(self, self._onTouchCallBack))
	self._panelClick:setSwallowTouches(false)
	self._imageShadow = ccui.Helper:seekNodeByName(self._target, "Image_shadow")
	self._nodeHero = ccui.Helper:seekNodeByName(self._target, "Node_hero")
	self._spineHero = require("yoka.node.HeroSpineNode").new()
	self._nodeHero:addChild(self._spineHero)
	self._imageTalkBg2 = ccui.Helper:seekNodeByName(self._target, "Image_talk_bg2")
	self._textTalk2 = ccui.Helper:seekNodeByName(self._target, "Text_talk2")
	self._imageTalkBg2:setVisible(false)
end

function CommonAvatarAvatar:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonAvatarAvatar:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonAvatarAvatar:updateUI(avatarId)
	local info = AvatarDataHelper.getAvatarConfig(avatarId)
	local heroId = info.hero_id
	if avatarId == 0 then
		heroId = G_UserData:getHero():getRoleBaseId()
	end

	local limitLevel = 0
	local limitRedLevel = 0
    if info.limit == 1 then
    	limitLevel = require("app.const.HeroConst").HERO_LIMIT_RED_MAX_LEVEL
    end
	local heroData = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId, nil, nil, limitLevel, limitRedLevel)
	local fightResId = heroData.res_cfg.fight_res
	self._height = heroData.res_cfg.spine_height
	local resJson = Path.getSpine(fightResId)
	self._spineHero:setAsset(resJson)
	self._spineHero:setAnimation("idle", true)
end

function CommonAvatarAvatar:setTouchEnabled(enable)
	self._panelClick:setTouchEnabled(enable)
	self._panelClick:setSwallowTouches(false)
end

function CommonAvatarAvatar:setScale(scale)
	scale = scale or 0.5
	if self._spineHero then
		self._spineHero:setScale(scale)
	end
	if self._imageShadow then --影子跟着变
		self._imageShadow:setScale(scale) 
	end
end

function CommonAvatarAvatar:getHeight()
	return self._height
end

function CommonAvatarAvatar:playAnimationOnce(name, callback)
	self._spineHero:setAnimation(name, false)
	self._spineHero.signalComplet:addOnce(function( ... )
		self._spineHero:setAnimation("idle", true)
		if callback then
			callback()
		end
	end)
end

function CommonAvatarAvatar:setBubble(bubbleText)
	if bubbleText == nil or bubbleText == "" then
		self._imageTalkBg2:setVisible(false)
		return
	end

	local minWidth = 62
	local minHeight = 66
	self._textTalk2:setString(bubbleText)
	local render = self._textTalk2:getVirtualRenderer()
	render:setMaxLineWidth(200)
	local size = render:getContentSize()
	local bubbleSize = cc.size(size.width, size.height)
	local changeLine = false		--是否出现换行
	if size.height > 30 then
		changeLine = true
	end

	bubbleSize.width = bubbleSize.width + 30
	if changeLine then
		bubbleSize.height = bubbleSize.height + 47
	end

    if bubbleSize.width < minWidth then
        bubbleSize.width = minWidth
    end
    if bubbleSize.height < minHeight then
        bubbleSize.height = minHeight
    end

    self._textTalk2:setPosition(cc.p(bubbleSize.width/2, size.height/2 + 30))
	self._imageTalkBg2:setContentSize(bubbleSize)
	local posX, posY = self._imageTalkBg2:getPosition()
	self._imageTalkBg2:setPosition(cc.p(posX, self._height))
	if self._effect then
		self._effect:reset()
	end
	self._effect = G_EffectGfxMgr:applySingleGfx(self._imageTalkBg2, "smoving_duihuakuang", handler(self, self._onBubbleFinish))
	self._imageTalkBg2:setVisible(true)
end

function CommonAvatarAvatar:_onBubbleFinish()
	self._imageTalkBg2:runAction(cc.Sequence:create(
		cc.DelayTime:create(10), 
		cc.CallFunc:create(function()
            	self._imageTalkBg2:setVisible(false)
            end)
		)
	)
end

function CommonAvatarAvatar:resetImageTalk()
	self._imageTalkBg2:stopAllActions()
	self._imageTalkBg2:setVisible(false)
end

return CommonAvatarAvatar