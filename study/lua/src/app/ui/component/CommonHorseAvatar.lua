--
-- Author: liangxu
-- Date: 2018-8-27
-- 战马

local CommonHorseAvatar = class("CommonHorseAvatar")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

--品质对应特效名称
local EFFECT_NAME = {
	[3] = {down = "moving_zhanma_lanse_down", up = "moving_zhanma_lanse_up"},
	[4] = {down = "moving_zhanma_zise_down", up = "moving_zhanma_zise_up"},
	[5] = {down = "moving_zhanma_chengse_down", up = "moving_zhanma_chengse_up"},
}

local EXPORTED_METHODS = {
    "updateUI",
	"setScale",
	"showShadow",
	"getBaseId",
	"setDark",
	"setLight",
	"setAniTimeScale",
	"setCallBack",
	"setTouchEnabled",
	"turnBack",
	"getNodeHorse",
	"setUserData",
	"getUserData",
	"setSpineVisible",
	"setConvertType",
	"setShadowScale",
	"playAnimationOnce",
	"showEffect",
}

function CommonHorseAvatar:ctor()
	self._target = nil
	self._horseId = 0
	self._scale = 0.5
	self._spineHorse = nil
	self._scaleEx = 1
	self._userData = nil
	self._convertType = TypeConvertHelper.TYPE_HORSE
	self._avatarEffectDown = nil
	self._avatarEffectUp = nil
end

function CommonHorseAvatar:setConvertType( type )
	if type and type > 0 then
		self._convertType = type
	end
end
--获取SpineId
function CommonHorseAvatar:_getSpineData(horseId, animSuffix)
	local horseData = TypeConvertHelper.convert(self._convertType, horseId)

	local resId = horseData.cfg.res_id
    animSuffix = animSuffix or ""
	return Path.getSpine(resId..animSuffix)
end

function CommonHorseAvatar:_init()
	self._panelClick = ccui.Helper:seekNodeByName(self._target, "Panel_click")
	self._imageShadow = ccui.Helper:seekNodeByName(self._target, "Image_shadow")
	self._nodeHorse = ccui.Helper:seekNodeByName(self._target, "Node_horse")
	self._nodeEffectDown = ccui.Helper:seekNodeByName(self._target, "NodeEffectDown")
	self._nodeEffectUp = ccui.Helper:seekNodeByName(self._target, "NodeEffectUp")

	self._panelClick:addClickEventListenerEx(handler(self, self._onTouchCallBack))
	self._panelClick:setSwallowTouches(false)

	self._spineHorse = require("yoka.node.HeroSpineNode").new()
	self._nodeHorse:addChild(self._spineHorse)
end

function CommonHorseAvatar:updateUI(horseId, animSuffix, notPlayIdle)
	assert(horseId, "CommonHorseAvatar's horseId can't be nil ")
	self:_initSpine(horseId, animSuffix)

	if not notPlayIdle then
		self._spineHorse:setAnimation("idle", true)
	end
end

function CommonHorseAvatar:setScale(scale)
	scale = scale or 0.5
	self._scaleEx = scale
	if self._spineHorse then
		self._spineHorse:setScale(scale)
	end
	if self._imageShadow then --影子跟着变
		self._imageShadow:setScale(scale)
	end
end

function CommonHorseAvatar:turnBack(needBack)
	if self._spineHorse then
		if needBack == nil or needBack == true then
			self._spineHorse:setScaleX(-self._scaleEx)
		elseif needBack == false then
			self._spineHorse:setScaleX(self._scaleEx)
		end
	end
end

function CommonHorseAvatar:setSpineVisible(needShow)
	if self._spineHorse then
		self._spineHorse:setVisible(needShow)
	end
end
function CommonHorseAvatar:_initSpine(horseId, animSuffix)
	self._horseId = horseId

	local resJson = self:_getSpineData(horseId, animSuffix)

	self._spineHorse:setAsset(resJson)
end

function CommonHorseAvatar:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHorseAvatar:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonHorseAvatar:setCallBack(callback)
	if self._callback then
		self._callback = nil
	end
	self._callback = callback
end

function CommonHorseAvatar:_onTouchCallBack(sender)
	local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
	local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
	if moveOffsetX < 20 and moveOffsetY < 20 then
		logWarn(" CommonHorseAvatar:_onTouchCallBack(sender,state) ")
		if self._callback then
			self._callback(self._userData)
		end
	end
end


--是否显示阴影
function CommonHorseAvatar:showShadow(visible)
	self._imageShadow:setVisible(visible)
end

function CommonHorseAvatar:setShadowScale(scale)
	self._imageShadow:setScale(scale)
end

function CommonHorseAvatar:playAnimationOnce(name)
	self._spineHorse:setAnimation(name, false)
	self._spineHorse.signalComplet:addOnce(function( ... )
		self._spineHorse:setAnimation("idle", true)
	end)
end

function CommonHorseAvatar:getBaseId()
	if self._horseId then
		return self._horseId
	end
	return 0
end

function CommonHorseAvatar:setDark()
	local setColor = function (spine)
		if spine ~= nil then
			spine:setColor(cc.c3b(255*0.4, 255*0.4, 255*0.4))
		end
	end

	setColor(self._spineHorse)
end

function CommonHorseAvatar:setLight()
	local setColor = function (spine)
		if spine ~= nil then
			spine:setColor(cc.c3b(255, 255, 255))
		end
	end

	setColor(self._spineHorse)
end

--设置动画频率
function CommonHorseAvatar:setAniTimeScale(timeScale)
	local setTimeScale = function (spine)
		if spine ~= nil then
			spine:setTimeScale(timeScale)
		end
	end

	setTimeScale(self._spineHorse)
end

function CommonHorseAvatar:setTouchEnabled(enable)
	self._panelClick:setTouchEnabled(enable)
	self._panelClick:setSwallowTouches(false)
end

function CommonHorseAvatar:getNodeHorse()
	return self._nodeHorse
end

function CommonHorseAvatar:setUserData(userData)
	self._userData = userData
end

function CommonHorseAvatar:getUserData()
	return self._userData
end

function CommonHorseAvatar:showEffect(show)
	if show then
		local param = TypeConvertHelper.convert(self._convertType, self._horseId)
		local names = EFFECT_NAME[param.color]
		if self._avatarEffectDown == nil and names then
			self._avatarEffectDown = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffectDown, names.down, nil, nil , false)
		end
		if self._avatarEffectUp == nil and names then
			self._avatarEffectUp = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffectUp, names.up, nil, nil , false)
		end
	else
		if self._avatarEffectDown then
			self._avatarEffectDown:runAction(cc.RemoveSelf:create())
			self._avatarEffectDown = nil
		end
		if self._avatarEffectUp then
			self._avatarEffectUp:runAction(cc.RemoveSelf:create())
			self._avatarEffectUp = nil
		end
	end
end

return CommonHorseAvatar