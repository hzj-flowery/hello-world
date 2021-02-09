--通用武将展示模块
local CommonHeroAvatar = class("CommonHeroAvatar")
local HeroConst = require("app.const.HeroConst")

local EXPORTED_METHODS = {
	"updateUI",
	"updateAvatar",
	"updateHeroName",
	"setScale",
	"showShadow",
	"showName",
	"getTextName",
	"getBaseId",
	"setBaseId",
	"showVName",
	"setDark",
	"setLight",
	"applyShader",
	"cancelShader",
	"setAniTimeScale",
	"setTalkString",
	"setBubble",
	"setCallBack",
	"setTouchEnabled",
	"turnBack",
	"showLoopBubble",
	"setBubbleVisible",
	"getNodeHero",
	"setUserData",
	"getUserData",
	"setSpineVisible",
	"getSpineHero",
	"playAnimationOnce",
	"getHeight",
	"turnBubble",
	"getSize",
	"setBubbleTextWidth",
	"playEffectOnce",
	"setAction",
	"showCountry",
	"moveTalkToTop",
	"setConvertType",
	"setNameOffsetY",
	"updateNameHeight",
	"setShadowScale",
	"showAvatarEffect",
	"isAnimExit",
	"addSpineLoadHandler",
	"setAsset",
	"setBubblePosition",
	"playAnimationLoopIdle",
	"setName",
	"getFlashEntity",
    "showTitle",
	"playAnimationEfcOnce",
	"getClickPanel",
	"playLoopActions",
}

function CommonHeroAvatar:ctor()
	self._target = nil
	self._heroId = 0
	self._scale = 0.5
	self._spineHero = nil
	self._delayTime = 1
	self._scaleEx = 1
	self._userData = nil
	self._currBubbleIndex = 0
	self._height = 0
	self._talkStr = nil
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	self._convertType = TypeConvertHelper.TYPE_HERO
	self._avatarEffect = nil --变身卡特效
    self._name = nil
    self._needAnimSp = false
	self._signalLoopAction = nil
end

function CommonHeroAvatar:setConvertType(type)
	-- body
	if type and type > 0 then
		self._convertType = type
	end
end
--获取SpineId
function CommonHeroAvatar:_getSpineData(heroId, animSuffix, limitLevel, limitRedLevel)
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local heroData = TypeConvertHelper.convert(self._convertType, heroId, nil, nil, limitLevel, limitRedLevel)

	local fightResId = heroData.res_cfg.fight_res
	if petSmall then
		if self._convertType == TypeConvertHelper.TYPE_PET then
			fightResId = fightResId .. "_small"
		end
	end

	self._height = heroData.res_cfg.spine_height
	animSuffix = animSuffix or ""
	return Path.getSpine(fightResId .. animSuffix)
end

function CommonHeroAvatar:_init()
	self._panelClick = ccui.Helper:seekNodeByName(self._target, "Panel_click")
	self._textTalk = ccui.Helper:seekNodeByName(self._target, "Text_talk")
	self._textTalk2 = ccui.Helper:seekNodeByName(self._target, "Text_talk2")
	self._textName = ccui.Helper:seekNodeByName(self._target, "Text_name")
	self._imageCountry = ccui.Helper:seekNodeByName(self._target, "ImageCountry")
	self._imageShadow = ccui.Helper:seekNodeByName(self._target, "Image_shadow")
	self._nodeHero = ccui.Helper:seekNodeByName(self._target, "Node_hero")
	self._nodeAvatarEffect = ccui.Helper:seekNodeByName(self._target, "NodeAvatarEffect")
	self._imageTalkBg = ccui.Helper:seekNodeByName(self._target, "Image_talk_bg")
	self._imageTalkBg2 = ccui.Helper:seekNodeByName(self._target, "Image_talk_bg2")
	self._imageNameBg = ccui.Helper:seekNodeByName(self._target, "Image_name_bg")
	self._panelVName = ccui.Helper:seekNodeByName(self._target, "Panel_v_name")
	self._effectNodeFront = ccui.Helper:seekNodeByName(self._target, "Node_effect_front")
	self._effectNodeBack = ccui.Helper:seekNodeByName(self._target, "Node_effect_back")
	self._panelVName:setVisible(false)
	self._imageNameBg:setVisible(false)
	self._imageTalkBg:setVisible(false)
	self._imageTalkBg2:setVisible(false)
	self._imageCountry:setVisible(false)
	self._textName:setVisible(false)

	self._panelClick:addClickEventListenerEx(handler(self, self._onTouchCallBack))
	self._panelClick:setSwallowTouches(false)
	local render = self._textTalk2:getVirtualRenderer()
	render:setMaxLineWidth(400)

	self._spineHero = require("yoka.node.HeroSpineNode").new()
	self._nodeHero:addChild(self._spineHero)
end

function CommonHeroAvatar:_playAnim(anim, isLoop, isReset)
    if self._needAnimSp then 
        self._spineHero:setAnimation(anim, isLoop, isReset)
    else 
        if anim == "idle" and self._spineHero:isAnimationExist("idle3") then
            self._spineHero:setAnimation("idle3", isLoop, isReset)
        elseif anim == "run" and self._spineHero:isAnimationExist("run2") then 
            print("1112233 hahaha")
            self._spineHero:setAnimation("run2", isLoop, isReset)
        else
            self._spineHero:setAnimation(anim, isLoop, isReset)
        end
    end
end

--needAnimSp --是否金奖播放战斗动作
function CommonHeroAvatar:updateUI(heroId, animSuffix, notPlayIdle, limitLevel, callback, needAnimSp, limitRedLevel)
    assert(heroId, "CommonHeroAvatar's heroId can't be nil ")
	self:_initSpine(heroId, animSuffix, limitLevel, callback, notPlayIdle, limitRedLevel)

    if needAnimSp then 
        self._needAnimSp = needAnimSp
    end

    if not notPlayIdle then 
        self:_playAnim("idle", true)
    end
end

function CommonHeroAvatar:updateAvatar(avatarInfo, animSuffix, notPlayIdle, callback)
	if not avatarInfo then
		return
	end
	if avatarInfo.isHasAvatar then
		local avatarConfig = require("app.utils.data.AvatarDataHelper").getAvatarConfig(avatarInfo.avatarBaseId)
		if avatarConfig.limit == 1 then --橙升红标记
			--界限突破参数
			self:updateUI(avatarInfo.covertId, animSuffix, notPlayIdle, HeroConst.HERO_LIMIT_RED_MAX_LEVEL, callback)
		else
			self:updateUI(avatarInfo.covertId, animSuffix, notPlayIdle, nil, callback)
		end
	else
		self:updateUI(avatarInfo.covertId, animSuffix, notPlayIdle, nil, callback)
	end
end

function CommonHeroAvatar:setAction(name, loop, isShowEffect)
	local function createEffect(heroId, actionName, loop, isFront)
		local strLast = "_back_effect"
		if isFront then
			strLast = "_fore_effect"
		end
		local spineEffect = require("yoka.node.HeroSpineNode").new()
		spineEffect:setAsset(Path.getSpine(heroId .. strLast))
		spineEffect.signalLoad:add(
			function()
				if spineEffect:isAnimationExist(name) then
					spineEffect:setAnimation(name, loop, true)
				end
			end
        )
        if spineEffect:isAnimationExist(name) then
            spineEffect:setAnimation(name, loop, true)
        end
		return spineEffect
    end
	
	if isShowEffect == nil then
		isShowEffect = true
	end
	if self._spineHero then
		--加入动作的前景层特效，后景层特效
		if isShowEffect then
			if G_SpineManager:isSpineExist(Path.getSpine(self._heroId .. "_back_effect")) then
				local spineEffect = self._effectNodeBack:getChildByName("back_effect")
				if spineEffect == nil then
					local spineEffect = createEffect(self._heroId, name, loop)
					spineEffect:setName("back_effect")
					self._effectNodeBack:addChild(spineEffect, 1)
				else
					if spineEffect:isAnimationExist(name) then
						spineEffect:setAnimation(name, loop, true)
					end
				end
			end
	
			if G_SpineManager:isSpineExist(Path.getSpine(self._heroId .. "_fore_effect")) then
				local spineEffect = self._effectNodeFront:getChildByName("fore_effect")
				
				if spineEffect == nil then
					local spineEffect = createEffect(self._heroId, name, loop, true)
					spineEffect:setName("fore_effect")
					self._effectNodeFront:addChild(spineEffect, 1)
				else
					if spineEffect:isAnimationExist(name) then
						spineEffect:setAnimation(name, loop, true)
					end
				end
			end
		end
		
        -- self._spineHero:setAnimation(name, loop, true)
        self:_playAnim(name, loop, true)
	end
end

function CommonHeroAvatar:setScale(scale)
	scale = scale or 0.5
	self._scaleEx = scale
	if self._spineHero then
		self._spineHero:setScale(scale)
	end
	if self._imageShadow then --影子跟着变
		self._imageShadow:setScale(scale)
	end
end

function CommonHeroAvatar:turnBack(needBack)
	if self._spineHero then
		if needBack == nil or needBack == true then
			self._spineHero:setScaleX(-self._scaleEx)
			self._effectNodeBack:setScaleX(-self._scaleEx)
			self._effectNodeFront:setScaleX(-self._scaleEx)
		elseif needBack == false then
			self._spineHero:setScaleX(self._scaleEx)
			self._effectNodeBack:setScaleX(self._scaleEx)
			self._effectNodeFront:setScaleX(self._scaleEx)
		end
	end
end

function CommonHeroAvatar:setSpineVisible(needShow)
	if self._spineHero then
		self._spineHero:setVisible(needShow)
	end
end
function CommonHeroAvatar:_initSpine(heroId, animSuffix, limitLevel, callback, notPlayIdle, limitRedLevel)
	self._heroId = heroId

	local resJson = self:_getSpineData(heroId, animSuffix, limitLevel, limitRedLevel)

	self._spineHero:setAsset(resJson)
	self._spineHero.signalLoad:add(
        function()
            if not notPlayIdle and self._spineHero:getAnimationName() == "idle" then 
                self:_playAnim("idle", true)
            end
			if callback then
				callback()
            end
           
		end
	)
end

function CommonHeroAvatar:getSize()
	return self._spineHero:getContentSize()
end

function CommonHeroAvatar:playAnimationOnce(name)
    -- self._spineHero:setAnimation(name, false)
    self:_playAnim(name, false)
	self._spineHero.signalComplet:addOnce(
		function(...)
            -- self._spineHero:setAnimation("idle", true)
            self:_playAnim("idle", true)
		end
	)
end

function CommonHeroAvatar:playAnimationEfcOnce(name)
    self:setAction(name, false)
	self._spineHero.signalComplet:addOnce(
        function(...)
            self._spineHero:setAnimation("idle", true)
		end
	)
end

--神兽用，播放2次正常idle 后，播放1次idle2
function CommonHeroAvatar:playAnimationLoopIdle(callBack, posIndex)
    -- self._spineHero:setAnimation("idle", true)
    self:_playAnim("idle", true)
	self._spineHero.signalComplet:add(
		function(index, loopCount)
			if callBack then
				callBack(loopCount, self._spineHero, self._heroId, posIndex)
			end
			if loopCount == 2 and self._spineHero:getAnimationName() ~= "idle2" then
                -- self._spineHero:setAnimation("idle2", false)
                self:_playAnim("idle2", false)
			end
			if loopCount == 1 and self._spineHero:getAnimationName() ~= "idle" then
                -- self._spineHero:setAnimation("idle", true)
                self:_playAnim("idle", true)
			end
		end
	)

	--self._idleTimes = 0
	--self._spineHero:setAnimation("idle", false)
	--self._spineHero.signalComplet:addOnce(function( ... )

	--	self._spineHero:setAnimation("idle", true)
	--end)
end

function CommonHeroAvatar:playEffectOnce(name)
    -- self._spineHero:setAnimation(name, false)
    self:_playAnim(name, false)
end

function CommonHeroAvatar:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHeroAvatar:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonHeroAvatar:setCallBack(callback)
	if self._callback then
		self._callback = nil
	end
	self._callback = callback
end

function CommonHeroAvatar:_onTouchCallBack(sender)
	local moveOffsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local moveOffsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if moveOffsetX < 20 and moveOffsetY < 20 then
		logWarn(" CommonHeroAvatar:_onTouchCallBack(sender,state) ")
		if self._callback then
			self._callback(self._userData)
		end
	end
end

--是否显示阴影
function CommonHeroAvatar:showShadow(visible)
	self._imageShadow:setVisible(visible)
end

--是否显示阴影
function CommonHeroAvatar:setShadowScale(scale)
	self._imageShadow:setScale(scale)
end

function CommonHeroAvatar:getBaseId()
	if self._heroId then
		return self._heroId
	end
	return 0
end

function CommonHeroAvatar:setBaseId(heroId)
	self._heroId = heroId
end
--显示武将竖着的名字
function CommonHeroAvatar:showVName(visible)
	if visible == nil then
		visible = false
	end
	if self._heroId and self._heroId > 0 then
		local TypeConvertHelper = require("app.utils.TypeConvertHelper")
		local heroData = TypeConvertHelper.convert(self._convertType, self._heroId)
		self._panelVName:setVisible(true)
		local textName = self._panelVName:getSubNodeByName("Text_v_name")

		textName:setString(heroData.name)
		textName:setColor(heroData.icon_color)
		textName:enableOutline(heroData.icon_color_outline, 2)
		textName:setVisible(true)
	end
end

--显示武将国籍
function CommonHeroAvatar:showCountry(visible)
	if visible == nil then
		visible = false
	end
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local heroData = TypeConvertHelper.convert(self._convertType, self._heroId)
	self._imageCountry:loadTexture(heroData.country_text)
	self._imageCountry:setVisible(visible)
end

--显示武将横着的名字
function CommonHeroAvatar:showName(visible, heroName)
	if visible == nil then
		visible = false
	end
	if self._heroId and self._heroId > 0 then
		local TypeConvertHelper = require("app.utils.TypeConvertHelper")
		local heroData = TypeConvertHelper.convert(self._convertType, self._heroId)
		if heroName == nil then
			self._textName:setString(heroData.name)
		else
			self._textName:setString(heroName)
		end
		--self._textName:setString(heroData.name)
		self._textName:setColor(heroData.icon_color)
		self._textName:enableOutline(heroData.icon_color_outline, 2)
		self._textName:setVisible(visible)
	end
end

function CommonHeroAvatar:getTextName()
	return self._textName:getString()
end

--指定英雄名称， 品质色
function CommonHeroAvatar:updateHeroName(name, color, useVName)
	local textName = nil
	if useVName then
		self._panelVName:setVisible(true)
		textName = self._panelVName:getSubNodeByName("Text_v_name")
	else
		textName = self._textName
	end
	textName:setString(name)
	textName:setColor(Colors.getColor(color))
	textName:enableOutline(Colors.getColorOutline(color), 2)
	textName:setVisible(true)
end

function CommonHeroAvatar:setDark()
	local setColor = function(spine)
		if spine ~= nil then
			spine:setColor(cc.c3b(255 * 0.4, 255 * 0.4, 255 * 0.4))
		end
	end

	setColor(self._spineHero)
end

function CommonHeroAvatar:setLight()
	local setColor = function(spine)
		if spine ~= nil then
			spine:setColor(cc.c3b(255, 255, 255))
		end
	end

	setColor(self._spineHero)
end

function CommonHeroAvatar:applyShader(shaderName)
	local spine = self._spineHero:getSpine()
	if spine then
		local ShaderHalper = require("app.utils.ShaderHelper")
		ShaderHalper.filterNode(spine, shaderName)
	else
		self._spineHero.signalLoad:addOnce(
			function()
				local spine = self._spineHero:getSpine()
				local ShaderHalper = require("app.utils.ShaderHelper")
				ShaderHalper.filterNode(spine, shaderName)
			end
		)
	end
end

function CommonHeroAvatar:cancelShader()
	local spine = self._spineHero:getSpine()
	if spine then
		local ShaderHalper = require("app.utils.ShaderHelper")
		ShaderHalper.filterNode(spine, "", true)
	else
		self._spineHero.signalLoad:addOnce(
			function()
				local spine = self._spineHero:getSpine()
				local ShaderHalper = require("app.utils.ShaderHelper")
				ShaderHalper.filterNode(spine, "", true)
			end
		)
	end
end

function CommonHeroAvatar:setTalkString(talkStr)
	if talkStr and talkStr ~= "" then
		self._textTalk:setString(talkStr)
		self._textTalk2:setString(talkStr)
		self._talkStr = talkStr
	--self._imageTalkBg:setVisible(true)
	end
end

--设置动画频率
function CommonHeroAvatar:setAniTimeScale(timeScale)
	local setTimeScale = function(spine)
		if spine ~= nil then
			spine:setTimeScale(timeScale)
		--spine:setToSetupPose()
		end
	end

	setTimeScale(self._spineHero)
end

function CommonHeroAvatar:setBubbleVisible(visible)
	self._imageTalkBg:setVisible(visible)
	self._imageTalkBg2:setVisible(visible)
end

function CommonHeroAvatar:showLoopBubble(content, interval)
	self._panelClick:stopAllActions()
	interval = interval or 5
	local function getBubbleMsg(bubbleId)
		local BubbleInfo = require("app.config.bubble")
		local data = BubbleInfo.get(tonumber(bubbleId))
		assert(data, "bubble cfg data can not find by bubbleId " .. bubbleId)
		return data.content
	end
	local function loopFunc()
		local npc1talk = string.split(content, "|")
		self._currBubbleIndex = self._currBubbleIndex + 1
		if self._currBubbleIndex > #npc1talk then
			self._currBubbleIndex = 1
		end
		local bubbleId = npc1talk[self._currBubbleIndex]
		local bubbleMsg = getBubbleMsg(bubbleId)
		self:setBubble(bubbleMsg, nil, 2)
	end
	local delay = cc.DelayTime:create(interval)
	local sequence = cc.Sequence:create(cc.CallFunc:create(loopFunc), delay)
	local action = cc.RepeatForever:create(sequence)
	self._panelClick:runAction(action)
end

function CommonHeroAvatar:setBubble(bubbleText, delay, type, showAction, maxWidth)
	print("bubbleTest = " .. bubbleText)
	self._delayTime = delay or self._delayTime
	local textAction = showAction or false
	local textType = type or 2
	if bubbleText ~= nil and bubbleText ~= "" then
		if textType == 1 then
			self:setTalkString(bubbleText)
			self._imageTalkBg:setRotation(-50)
			self._imageTalkBg:setScale(0)
			self._imageTalkBg:runAction(
				cc.Sequence:create(
					cc.DelayTime:create(self._delayTime),
					cc.EaseBackOut:create(cc.Spawn:create(cc.ScaleTo:create(0.3, 0.8), cc.RotateTo:create(0.3, 0)))
				)
			)
			self._imageTalkBg:setVisible(true)
		elseif textType == 2 then
			local minWidth = 62
			local minHeight = 66
			local render = self._textTalk2:getVirtualRenderer()
			if maxWidth then
				render:setMaxLineWidth(maxWidth)
			end
			--先设置宽度，再设置字符
			self:setTalkString(bubbleText)
			local size = render:getContentSize()
			local bubbleSize = cc.size(size.width, size.height)

			local changeLine = false --是否出现换行
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

			self._textTalk2:setPosition(cc.p(bubbleSize.width / 2, size.height / 2 + 30))

			self._imageTalkBg2:setContentSize(bubbleSize)
			if textAction then
				G_EffectGfxMgr:applySingleGfx(self._imageTalkBg2, "smoving_duihuakuang")
			end
			self._imageTalkBg2:setVisible(true)
		end
	else
		self._imageTalkBg:setVisible(false)
		self._imageTalkBg2:setVisible(false)
	end
end

function CommonHeroAvatar:setBubbleTextWidth(width)
	local render = self._textTalk2:getVirtualRenderer()
	render:setMaxLineWidth(width)
	self:setTalkString(self._talkStr)
	local size = self._textTalk2:getContentSize()
	-- size.width = size.width
	-- size.height = size.height + 50
	self._imageTalkBg2:setContentSize(size)
end

function CommonHeroAvatar:setTouchEnabled(enable)
	self._panelClick:setTouchEnabled(enable)
	self._panelClick:setSwallowTouches(false)
end

function CommonHeroAvatar:getNodeHero()
	return self._nodeHero
end

function CommonHeroAvatar:setUserData(userData)
	self._userData = userData
end

function CommonHeroAvatar:getUserData()
	return self._userData
end

function CommonHeroAvatar:getSpineHero()
	return self._spineHero:getSpine()
end

function CommonHeroAvatar:getHeight()
	return self._height
end

function CommonHeroAvatar:turnBubble()
	local posX = self._imageTalkBg2:getPositionX()
	local posTextX = self._textTalk2:getPositionX()
	self._imageTalkBg2:setScaleX(-1)
	self._imageTalkBg2:setPositionX(-posX)
	self._textTalk2:setScaleX(-1)
end

function CommonHeroAvatar:moveTalkToTop()
	self._imageTalkBg:setGlobalZOrder(1)
	--关闭按钮提到上层
	local container = self._target:getParent()
	local node = self._imageTalkBg2
	node:retain()
	local worldPos = node:convertToWorldSpaceAR(cc.p(0, 0))
	local btnNewPos = container:convertToNodeSpace(cc.p(worldPos))
	node:removeFromParent()
	container:addChild(node)
	node:setPosition(btnNewPos)
	node:release()
end

function CommonHeroAvatar:setNameOffsetY(offsetY)
	local posY = self._textName:getPositionY()
	posY = posY + offsetY
	self._textName:setPositionY(posY)
end

function CommonHeroAvatar:updateNameHeight(YPos)
	self._textName:setPositionY(YPos)
end

function CommonHeroAvatar:showAvatarEffect(show, scale)
	scale = scale or 1.0
	self._nodeAvatarEffect:setScale(scale)
	if show then
		if self._avatarEffect == nil then
			self._avatarEffect =
				G_EffectGfxMgr:createPlayMovingGfx(
				self._nodeAvatarEffect,
				"moving_bianshenka",
				effectFunction,
				eventFunction,
				false
			)
		end
	else
		if self._avatarEffect then
			self._avatarEffect:runAction(cc.RemoveSelf:create())
			self._avatarEffect = nil
		end
	end
end

function CommonHeroAvatar:isAnimExit(anim)
	if self._spineHero then
		return self._spineHero:isAnimationExist(anim)
	end
	return false
end

function CommonHeroAvatar:addSpineLoadHandler(handler)
	self._spineHero.signalComplet:addOnce(handler)
end

function CommonHeroAvatar:setAsset(resName, animSuffix)
	animSuffix = animSuffix or ""
	local resJson = Path.getSpine(resName .. animSuffix)
	self._spineHero:setAsset(resJson)
end

function CommonHeroAvatar:setBubblePosition(pos)
	self._imageTalkBg2:setPosition(pos)
end

function CommonHeroAvatar:setName(name)
	self:setName(name)
end

function CommonHeroAvatar:getFlashEntity()
	return self._spineHero, self._imageShadow
end

function CommonHeroAvatar:showTitle(titleId, modelName)
	local UserDataHelper = require("app.utils.UserDataHelper")
	UserDataHelper.appendNodeTitle(self._target, titleId, modelName)
end

function CommonHeroAvatar:getClickPanel()
	return self._panelClick
end

--播放action1 count1次后，播放action2 count2次
--如此循环
function CommonHeroAvatar:playLoopActions(action1, action2, count1, count2)
	if self._signalLoopAction then
		self._signalLoopAction:remove()
		self._signalLoopAction = nil
	end
	
	self:_playAnim(action1, true)
	self._signalLoopAction = self._spineHero.signalComplet:add(
		function(index, loopCount)
			if loopCount == count1 and self._spineHero:getAnimationName() == action1 then
				self:_playAnim(action2, true)
			end
			if loopCount == count2 and self._spineHero:getAnimationName() == action2 then
				self:_playAnim(action1, true)
			end
		end
	)
end

return CommonHeroAvatar
