--通用武将展示模块
local CommonSimpleHeroAvatar = class("CommonSimpleHeroAvatar")

local EXPORTED_METHODS = {
    "updateUI",
	"updateHeroName",
	"updateUserName",
	"setNameColor",
	"setScale",
	"showShadow",
	"showName",
	"getBaseId",
	"setDark",
	"setLight",
    "applyShader",
    "cancelShader",
	"setAniTimeScale",
	"setCallBack",

	"turnBack",
	"getNodeHero",
	"setUserData",
	"getUserData",
	"setSpineVisible",
	"getSpineHero",
	"playAnimationOnce",
	"getHeight",
	"getSize",
	"playEffectOnce",
	"setAction",
	"setConvertType",
	"setNameSize",
	"setNameOffsetY",
	"updateNameHeight",
	"setShadowScale",
	"isAnimExit",
	"addSpineLoadHandler",
	"removeSpineLoadHandler",
	"setAsset",
}

function CommonSimpleHeroAvatar:ctor()
	self._target = nil
	self._heroId = 0
	self._scale = 0.5
	self._spineHero = nil
	self._delayTime = 1
	self._scaleEx = 1
	self._userData = nil
	self._height = 0
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	self._convertType = TypeConvertHelper.TYPE_HERO
	self._avatarEffect = nil --变身卡特效
end

function CommonSimpleHeroAvatar:setConvertType( type )
	-- body
	if type and type > 0 then
		self._convertType = type
	end
end
--获取SpineId
function CommonSimpleHeroAvatar:_getSpineData(heroId,animSuffix,limitLevel, limitRedLevel)
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local heroData = TypeConvertHelper.convert(self._convertType, heroId, nil, nil, limitLevel, limitRedLevel)

	local fightResId = heroData.res_cfg.fight_res
	if petSmall then
		if self._convertType == TypeConvertHelper.TYPE_PET then
			fightResId = fightResId.."_small"
		end
	end

	self._height = heroData.res_cfg.spine_height
    animSuffix = animSuffix or ""
	return Path.getSpine(fightResId..animSuffix)
end

function CommonSimpleHeroAvatar:_init()

	self._textName = ccui.Helper:seekNodeByName(self._target, "Text_name")
	self._imageShadow = ccui.Helper:seekNodeByName(self._target, "Image_shadow")
	self._nodeHero = ccui.Helper:seekNodeByName(self._target, "Node_hero")



	self._textName:setVisible(false)




	self._spineHero = require("yoka.node.HeroSpineNode").new()
	self._nodeHero:addChild(self._spineHero)
end

function CommonSimpleHeroAvatar:updateUI(heroId, animSuffix, notPlayIdle, limitLevel, limitRedLevel)
	assert(heroId, "CommonSimpleHeroAvatar's heroId can't be nil ")
	self:_initSpine(heroId, animSuffix, limitLevel, limitRedLevel)

	if not notPlayIdle then
		self._spineHero:setAnimation("idle", true)
	end
end

function CommonSimpleHeroAvatar:setAction(name, loop)
	if self._spineHero then
		self._spineHero:setAnimation(name, loop, true)
	end
end

function CommonSimpleHeroAvatar:setScale(scale)
	scale = scale or 0.5
	self._scaleEx = scale
	if self._spineHero then
		self._spineHero:setScale(scale)
	end
	if self._imageShadow then --影子跟着变
		self._imageShadow:setScale(scale)
	end
end

function CommonSimpleHeroAvatar:turnBack(needBack)
	if self._spineHero then
		if needBack == nil or needBack == true then
			self._spineHero:setScaleX(-self._scaleEx)
		elseif needBack == false then
			self._spineHero:setScaleX(self._scaleEx)
		end
	end
end

function CommonSimpleHeroAvatar:setSpineVisible(needShow)
	if self._spineHero then
		self._spineHero:setVisible(needShow)
	end
end
function CommonSimpleHeroAvatar:_initSpine(heroId,animSuffix,limitLevel, limitRedLevel)
	self._heroId = heroId

	local resJson = self:_getSpineData(heroId,animSuffix,limitLevel,limitRedLevel)

	self._spineHero:setAsset(resJson)

end

function CommonSimpleHeroAvatar:getSize()
	return self._spineHero:getContentSize()
end

function CommonSimpleHeroAvatar:playAnimationOnce(name)
	self._spineHero:setAnimation(name, false)
	self._spineHero.signalComplet:addOnce(function( ... )
		self._spineHero:setAnimation("idle", true)
	end)
end

function CommonSimpleHeroAvatar:playEffectOnce(name,callback)
	self._spineHero:setAnimation(name, false)
	self._spineHero.signalComplet:addOnce(function( ... )
		self._spineHero:setAnimation("idle", true)
		if callback then
			callback()
		end
	end)
end


function CommonSimpleHeroAvatar:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonSimpleHeroAvatar:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonSimpleHeroAvatar:setCallBack(callback)
	if self._callback then
		self._callback = nil
	end
	self._callback = callback
end

function CommonSimpleHeroAvatar:_onTouchCallBack(sender)
	local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
	local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
	if moveOffsetX < 20 and moveOffsetY < 20 then
		logWarn(" CommonSimpleHeroAvatar:_onTouchCallBack(sender,state) ")
		if self._callback then
			self._callback(self._userData)
		end
	end
end


--是否显示阴影
function CommonSimpleHeroAvatar:showShadow(visible)
	self._imageShadow:setVisible(visible)
end


--是否显示阴影
function CommonSimpleHeroAvatar:setShadowScale(scale)
	self._imageShadow:setScale(scale)
end


function CommonSimpleHeroAvatar:getBaseId()
	if self._heroId then
		return self._heroId
	end
	return 0
end


--显示武将横着的名字
function CommonSimpleHeroAvatar:showName(visible, heroName)
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

--指定英雄名称， 品质色
function CommonSimpleHeroAvatar:updateHeroName(name, color)
	local textName = nil
	textName = self._textName
	
	textName:setString(name)
	textName:setColor(Colors.getColor(color))
	textName:enableOutline(Colors.getColorOutline(color), 2)
	textName:setVisible(true)
end

function CommonSimpleHeroAvatar:updateUserName(name, officerLevel)
	local textName = nil
	textName = self._textName
	
	textName:setString(name)
	--textName:setColor(Colors.getOfficialColor(color))
	--textName:enableOutline(Colors.getOfficialColor(color), 2)

	textName:setColor(Colors.getOfficialColor(officerLevel))
	textName:enableOutline(Colors.getOfficialColorOutline(officerLevel) , 2)


	textName:setVisible(true)
end

function CommonSimpleHeroAvatar:setNameColor(color,outlineColor)
	local textName = nil
	textName = self._textName

	textName:setColor(color)
	textName:enableOutline(outlineColor , 2)
end

function CommonSimpleHeroAvatar:setDark()
	local setColor = function (spine)
		if spine ~= nil then
			spine:setColor(cc.c3b(255*0.4, 255*0.4, 255*0.4))
		end
	end

	setColor(self._spineHero)
end

function CommonSimpleHeroAvatar:setLight()
	local setColor = function (spine)
		if spine ~= nil then
			spine:setColor(cc.c3b(255, 255, 255))
		end
	end

	setColor(self._spineHero)
end


function CommonSimpleHeroAvatar:applyShader(shaderName)
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

function CommonSimpleHeroAvatar:cancelShader()
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


--设置动画频率
function CommonSimpleHeroAvatar:setAniTimeScale(timeScale)
	local setTimeScale = function (spine)
		if spine ~= nil then
			spine:setTimeScale(timeScale)
			--spine:setToSetupPose()
		end
	end

	setTimeScale(self._spineHero)
end




function CommonSimpleHeroAvatar:getNodeHero()
	return self._nodeHero
end

function CommonSimpleHeroAvatar:setUserData(userData)
	self._userData = userData
end

function CommonSimpleHeroAvatar:getUserData()
	return self._userData
end

function CommonSimpleHeroAvatar:getSpineHero()
	return self._spineHero:getSpine()
end

function CommonSimpleHeroAvatar:getHeight()
	return self._height
end



function CommonSimpleHeroAvatar:setNameOffsetY(offsetY)
	local posY = self._textName:getPositionY()
	posY = posY + offsetY
	self._textName:setPositionY(posY)
end

function CommonSimpleHeroAvatar:updateNameHeight(YPos)
	self._textName:setPositionY(YPos)
end

function CommonSimpleHeroAvatar:setNameSize(size)
	self._textName:setFontSize(size)
end




function CommonSimpleHeroAvatar:isAnimExit(anim)
	if self._spineHero then
		return self._spineHero:isAnimationExist(anim)
	end
	return false
end

function CommonSimpleHeroAvatar:addSpineLoadHandler(handler)
	self._spineHero.signalComplet:addOnce(handler)
end


function CommonSimpleHeroAvatar:removeSpineLoadHandler(handler)
	self._spineHero.signalComplet:remove(handler)
end


function CommonSimpleHeroAvatar:setAsset(resName, animSuffix)
	animSuffix = animSuffix or ""
	local resJson = Path.getSpine(resName..animSuffix)
	self._spineHero:setAsset(resJson)
end


return CommonSimpleHeroAvatar
