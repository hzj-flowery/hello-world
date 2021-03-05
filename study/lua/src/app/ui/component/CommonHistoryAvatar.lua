-- Author: �û�����
-- Date:2018-11-23 17:11:47
-- Rebuilt by Panhoa

local CommonHistoryAvatar = class("CommonHistoryAvatar")
local HistoryHeroConst = require("app.const.HistoryHeroConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


local EXPORTED_METHODS = {
	"updateUI",
	"setConvertType",
	"getBaseId",
	"setName",
	"setScale",
	"turnBack",
	"setSpineVisible",
	"playAnimationOnce",
	"showShadow",
	"updateOpcacity",
	"setTouchCallBack",
	"setUserData",
	"getUserData",
	"applyShader",
	"cancelShader",
	"showAvatarEffect",
	"getItemParams",
	"showName"
}

function CommonHistoryAvatar:ctor()
	self._target = nil
	self._heroId    = 0
	self._scale     = 0.5
	self._name 		= nil
	self._spineHero = nil
	self._userData  = nil	-- 自定义数据
	self._scaleEx   = 1		-- 缩放属性
	self._avatarEffect = nil-- avatar特效
	self._itemParams   = nil
	self._convertType = TypeConvertHelper.TYPE_HISTORY_HERO -- 默认历代名将
end

function CommonHistoryAvatar:_init()
	self._panelClick = ccui.Helper:seekNodeByName(self._target, "Panel_click")
	self._imageShadow = ccui.Helper:seekNodeByName(self._target, "Image_shadow")
	self._nodeHero = ccui.Helper:seekNodeByName(self._target, "Node_hero")
	self._nodeAvatarEffect = ccui.Helper:seekNodeByName(self._target, "NodeAvatarEffect")
	self._spineHero = require("yoka.node.HeroSpineNode").new()
	self._nodeHero:addChild(self._spineHero)
	self._panelClick:addClickEventListenerEx(handler(self, self._onTouchCallBack))
	self._panelClick:setSwallowTouches(false)
end

function CommonHistoryAvatar:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHistoryAvatar:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

--------------------------------------------------------------------------
-- @Export 		可设置转换类型, 默认TYPE_HISTORY_HERO
-- @Param		type 类型
function CommonHistoryAvatar:setConvertType(type)
	if type and type > 0 then
		self._convertType = type
	end
end

--------------------------------------------------------------------------
-- @Export 		获取基础Id（武将Id）
function CommonHistoryAvatar:getBaseId()
	if self._heroId then
		return self._heroId
	end
	return 0
end

--------------------------------------------------------------------------
-- @Export 		设置控件名,作为整体处理
-- @Param 		ctrlname
function CommonHistoryAvatar:setName(ctrlname)
	self:setName(name)
end

--------------------------------------------------------------------------
-- @Export 		获取当前武将基础属性
function CommonHistoryAvatar:getItemParams()
	return self._itemParams
end

--------------------------------------------------------------------------
-- @Export 		Touch Listener
function CommonHistoryAvatar:setTouchCallBack(callback)
	if self._callback then
		self._callback = nil
	end
	self._callback = callback
end

-- @Role 		CallBack
function CommonHistoryAvatar:_onTouchCallBack(sender)
	local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
	local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
	if moveOffsetX < 20 and moveOffsetY < 20 then
		if self._callback then
			self._callback(self._userData)
		end
	end
end

------------------------------------------------------------------------------
-- @Expport 	Custom's UserData
-- @Param		userData means table or other
function CommonHistoryAvatar:setUserData(userData)
	self._userData = userData
end

function CommonHistoryAvatar:getUserData()
	return self._userData
end

------------------------------------------------------------------------------
-- @Export 		创建Ani
-- @param 		heroId 武将Id
-- @param 		animSuffix 动画类型
-- @param 		notPlayIdle 是否播放动画
-- @param 		limitLevel  界限突破
function CommonHistoryAvatar:updateUI(heroId, animSuffix, notPlayIdle, limitLevel)
	assert(heroId, "CommonHistoryAvatar's heroId can't be nil ")
	self:_initSpine(heroId, animSuffix, limitLevel)
	if not notPlayIdle then
		self._spineHero:setAnimation("idle", true)
	end
end

-- @Role 	获取Spine资源
-- @Param 	heroId 武将Id
-- @Param 	animSuffix 动画类型（默认spine
-- @Param	limitLevel 界限突破（暂不用
function CommonHistoryAvatar:_getSpineData(heroId, animSuffix, limitLevel)
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local heroData = TypeConvertHelper.convert(self._convertType, heroId, nil, nil, limitLevel)
	self._itemParams = heroData

	local fightResId = heroData.res_cfg.fight_res
	self._height = heroData.res_cfg.spine_height
    animSuffix = animSuffix or ""
	return Path.getSpine(fightResId..animSuffix)
end

-- @Role 	初始化动画
-- @Param   HeroId 武将Id
function CommonHistoryAvatar:_initSpine(heroId, animSuffix, limitLevel)
	self._heroId = heroId
	local resJson = self:_getSpineData(heroId,animSuffix,limitLevel)
	self._spineHero:setAsset(resJson)
end

--------------------------------------------------------------------
-- @Export 		缩放属性
-- @Param 		scale 缩放因子, 默认0.5
function CommonHistoryAvatar:setScale(scale)
	scale = scale or 0.5
	self._scaleEx = scale
	if self._spineHero then
		self._spineHero:setScale(scale)
	end
	if self._imageShadow then --影子跟着变
		self._imageShadow:setScale(scale)
	end
end

--------------------------------------------------------------------
-- @Export 		旋转属性
-- @Param 		needBack 是否旋转，（翻转）
function CommonHistoryAvatar:turnBack(needBack)
	if self._spineHero then
		if needBack == nil or needBack == true then
			self._spineHero:setScaleX(-self._scaleEx)
		elseif needBack == false then
			self._spineHero:setScaleX(self._scaleEx)
		end
	end
end

---------------------------------------------------------------------
-- @Export 	 	是否可见
-- @Param 		needShow 是否显示
function CommonHistoryAvatar:setSpineVisible(needShow)
	if self._spineHero then
		self._spineHero:setVisible(needShow)
	end
end

---------------------------------------------------------------------
-- @Wxport 		展示前播放一次动作
-- @Param 		idleName 动作名
function CommonHistoryAvatar:playAnimationOnce(idleName)
	self._spineHero:setAnimation(name, false)
	self._spineHero.signalComplet:addOnce(function( ... )
		self._spineHero:setAnimation("idle", true)
	end)
end

----------------------------------------------------------------------
-- @Export 		是否展示脚底阴影
-- @Param 		bVisible 是否
function CommonHistoryAvatar:showShadow(bVisible)
	self._imageShadow:setVisible(bVisible)
end

----------------------------------------------------------------------
-- @Export 		模型透明度
-- @Param 		opacity 不透明度（0~1），(默认透明，通常不透明值0.4可参考
function CommonHistoryAvatar:updateOpcacity(opacity)
	local setColor = function (spine, opacity)
		if spine ~= nil then
			spine:setColor(cc.c3b(255 * opacity, 255 * opacity, 255 * opacity))
		end
	end
	opacity = (opacity == nil and 1 or opacity)
	setColor(self._spineHero, opacity)
end

-----------------------------------------------------------------------
-- @Export 		应用shader
-- @Param 		shaderName shader名
function CommonHistoryAvatar:applyShader(shaderName)
    local spine = self._spineHero:getSpine()
    if spine then
         local ShaderHalper = require("app.utils.ShaderHelper")
         ShaderHalper.filterNode(spine, shaderName)
    else
        self._spineHero.signalLoad:addOnce(function()
            local spine = self._spineHero:getSpine()
            local ShaderHalper = require("app.utils.ShaderHelper")
            ShaderHalper.filterNode(spine, shaderName)
        end)
    end
end

-- @Export 		取消shader
function CommonHistoryAvatar:cancelShader()
    local spine = self._spineHero:getSpine()
    if spine then
         local ShaderHalper = require("app.utils.ShaderHelper")
         ShaderHalper.filterNode(spine, "", true)
    else
        self._spineHero.signalLoad:addOnce(function()
            local spine = self._spineHero:getSpine()
            local ShaderHalper = require("app.utils.ShaderHelper")
            ShaderHalper.filterNode(spine, "", true)
        end)
    end
end

---------------------------------------------------------------------------
-- @Export 		是否显示特效及其缩放
-- @Param 		show 是否显示
-- @Param		scale 缩放因子		
function CommonHistoryAvatar:showAvatarEffect(show, scale)
	scale = scale or 1.0
	self._nodeAvatarEffect:setScale(scale)
	if show then
		if self._avatarEffect == nil then
			self._avatarEffect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeAvatarEffect, "moving_bianshenka", effectFunction, eventFunction , false)
		end
	else
		if self._avatarEffect then
			self._avatarEffect:runAction(cc.RemoveSelf:create())
			self._avatarEffect = nil
		end
	end
end

function CommonHistoryAvatar:showName()
	
end



return CommonHistoryAvatar