-- @Author panhoa
-- @Date 5.7.2019
-- @Role 

local ViewBase = require("app.ui.ViewBase")
local GoldHeroAvatar = class("GoldHeroAvatar", ViewBase)
local GachaGoldenHeroConst = require("app.const.GachaGoldenHeroConst")

function GoldHeroAvatar:ctor(callback)
    self._avatar  = nil   -- avatar
    self._heroName= nil
    self._heroId  = nil   -- heroId
    self._callback= callback

    local resource = {
		file = Path.getCSB("GoldHeroAvatar", "gachaGoldHero"),

	}
	GoldHeroAvatar.super.ctor(self, resource)
end

function GoldHeroAvatar:onCreate()
    self:_init()
end

function GoldHeroAvatar:onEnter()
end

function GoldHeroAvatar:onExit()
end

function GoldHeroAvatar:_init( ... )
    self._nodeEffect:setVisible(false)
    self._panelTouch:addClickEventListenerEx(handler(self, self._clickAvatar))
end

function GoldHeroAvatar:_clickAvatar()
    if self._callback then
        self._callback(self._heroId)
    end
end

-- @Role Update avatar Info
function GoldHeroAvatar:updateUI(heroId, limitLevel, isAni)
    self._avatar:updateUI(heroId, "", false, limitLevel, nil, isAni)
    self._heroId = heroId
    self:_updateCountry()
end

function GoldHeroAvatar:_updateCountry()
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local heroData = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, self._heroId)
    self._heroName:setName(heroData.name)
    self._heroName:setCountryFlag(heroData.country_text)
    self:_playCountryEffect(heroData.country)

    local scaleValue = 1.0
    if string.len(heroData.name) > 6 then
        scaleValue = (1 + (string.len(heroData.name) - 6)/10)
    end 
    self._heroName:setCountryScaleY(scaleValue)
end

function GoldHeroAvatar:_playCountryEffect(country)
    local effectName = ""
    local movingName = ""

    if country == 1 then
        effectName = "effect_jinjiangzhaomu_dianjiang_qingseshuxian"
        movingName = "moving_jinjiangzhaomu_down_jiaodiqingse"
    elseif country == 2 then
        effectName = "effect_jinjiangzhaomu_dianjiang_chengseshuxian"
        movingName = "moving_jinjiangzhaomu_jiaodichengse"
    elseif country == 3 then
        effectName = "effect_jinjiangzhaomu_dianjiang_lvseshuxian"
        movingName = "moving_jinjiangzhaomu_jiaodilvse"
    elseif country == 4 then
        effectName = "effect_jinjiangzhaomu_dianjiang_ziseshuxian"
        movingName = "moving_jinjiangzhaomu_jiaodizise"
    end

    self._nodeFrontEffect:removeAllChildren()
    G_EffectGfxMgr:createPlayGfx(self._nodeFrontEffect, effectName, nil, true)

    local function effectFunction(effect)
	end
	
    local function eventFunction(event)
        if event == "finish" then
        end
    end

    self._nodeBackEffect:removeAllChildren()
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeBackEffect, movingName, effectFunction, eventFunction , false)
end

-- @Role Show effect
function GoldHeroAvatar:showAvatarEffect(bShow)
    self._avatar:showAvatarEffect(true)
end

-- @Role Scale
function GoldHeroAvatar:setScale(scale)
    self._avatar:setScale(scale)
end

-- @Role Get HeroId
function GoldHeroAvatar:getHeroId()
    return self._heroId
end

function GoldHeroAvatar:playAnimationLoopIdle(callBack, posIndex)
    self._avatar:setAniTimeScale(1)
    self._avatar:playAnimationLoopIdle(callBack, posIndex)
end

function GoldHeroAvatar:playAnimationOnce(name)
	self._avatar:setAniTimeScale(1)
	self._avatar:playAnimationOnce(name)
end

function GoldHeroAvatar:playAnimationEfcOnce(name)
	self._avatar:setAniTimeScale(1)
    self._avatar:playAnimationEfcOnce(name)
end

-- @Role Play idle
function GoldHeroAvatar:playAnimationNormal()
	self._avatar:setAniTimeScale(1)
	self._avatar:setAction("idle", true)
end

-- @Role Set opacity
function GoldHeroAvatar:setOpacity(opacity)
    return self._avatar:setOpacity(opacity)
end

function GoldHeroAvatar:getSpine()
    return self._avatar
end

function GoldHeroAvatar:turnBack(bTrue)
    self._avatar:turnBack(bTrue)
end

function GoldHeroAvatar:setAligement(iType)
    if GachaGoldenHeroConst.FLAG_ALIGNMENT_LEFT == iType then
        self._heroName:setPositionX(45)
    elseif GachaGoldenHeroConst.FLAG_ALIGNMENT_RIGHT == iType then
        self._heroName:setPositionX(205)
    end
end

function GoldHeroAvatar:setNameVisible(isVisible)
    self._heroName:setVisible(isVisible)
end

function GoldHeroAvatar:setNamePositionY(alignType)
    if alignType == 2 then
        self._heroName:setPositionY(130)
    elseif alignType == 1 then
        self._heroName:setPositionY(50)        
    end
end

function GoldHeroAvatar:setFlagScaleY(value)
    self._heroName:setCountryScaleY(value)
end


return GoldHeroAvatar
