local HitTipParticle = require("app.fight.views.HitTip.HitTipParticle")
local HitTipDamage = class("HitTipDamage", HitTipParticle)

local Path = require("app.utils.Path")
local HeroSkillEffect = require("app.config.hero_skill_effect")
local FightConfig = require("app.fight.Config")


HitTipDamage.HURT_SHAN_BI = 1
HitTipDamage.HURT_CRIT = 2
HitTipDamage.HURT_GE_DANG = 3
HitTipDamage.HURT_WU_DI = 4
HitTipDamage.HURT_XI_SHOU = 5

--buff类hurt也放在这里

--hurt_id对应图片
local spriteName = 
{
	[1] = Path.getTextBattle("zhuangtai_teshu_b_01shanbi") ,
	[2] = Path.getTextBattle("txt_battle_crit"),
    [3] = Path.getTextBattle("gedang"),
    [4] = Path.getTextBattle("zhuangtai_teshu_b_01wudi"),
    [5] = Path.getTextBattle("zhuangtai_teshu_b_01xishou"),
    [99] = Path.getTextBattle("txt_taoyuanjieyi"),
    [100] = Path.getTextBattle("txt_fentan"),
}

local spriteNameHeal = 
{
	[1] = Path.getTextBattle("zhuangtai_teshu_b_01shanbi"),
	[2] = Path.getTextBattle("txt_battle_heal"),
    [3] = Path.getTextBattle("gedang"),
    [4] = Path.getTextBattle("zhuangtai_teshu_b_01wudi"),
    [5] = Path.getTextBattle("zhuangtai_teshu_b_01xishou"),
    [99] = Path.getTextBattle("zhuangtai_teshu_b_01xinsheng"),
}

function HitTipDamage:ctor(value, info, type)
    HitTipDamage.super.ctor(self, type)
    self._crit = false
    self._posX = 0
    self._width = 0
    self._height = 0
    self._tween = 0
    self._hasXiShou = false

    if type == "damage" then
        for _, hurtValue in pairs(info) do
            if hurtValue.hurtId == FightConfig.HURT_TYPE_XISHOU and hurtValue.hurtValue then
                self._hasXiShou = true
            end
        end
        for _, hurtValue in pairs(info) do
            self:_createHurtType(hurtValue.hurtId, hurtValue.hurtValue, value)
        end
    else
        self:_createBuffType(info)
    end
    self._label = nil
    if value > 0 then
        self._label = self:createValueLabel(HitTipParticle.TYPE_HEAL, self._crit, value)
    elseif value < 0 then
        self._label = self:createValueLabel(HitTipParticle.TYPE_DAMAGE, self._crit, value)
    end
    if self._label then 
        self._node:addChild(self._label)
        self._label:setPositionX(self._posX)
        self._width = self._width + self._label:getContentSize().width/2    
        if self._height == 0 then
            self._height = self._label:getContentSize().height
        end    
    end
    -- self._node:setPositionX(-self._width)
    self._node:setContentSize(cc.size(self._width, self._height))
    self._node:setAnchorPoint(cc.p(0.5, 0.5))   
end

function HitTipDamage:_createHurtType(hurtId, hurtValue, value)
    if hurtId == FightConfig.HURT_TYPE_XISHOU and value ~= 0 then
        return
    end
    if hurtId == 0 then 
        return 
    end
    if self._hasXiShou and hurtId ~= FightConfig.HURT_TYPE_XISHOU and value == 0 then
        return
    end
    local frames = spriteName
    if value > 0 then
        frames = spriteNameHeal
    end
    local spriteHurtType = cc.Sprite:create(frames[hurtId])
    if hurtId == HitTipDamage.HURT_CRIT then
        self._crit = true
    end
    spriteHurtType:setAnchorPoint(cc.p(0, 0.5))
    spriteHurtType:setPositionX(self._posX)
    self._posX = self._posX + spriteHurtType:getContentSize().width
    self._width = self._width + spriteHurtType:getContentSize().width
    self._height = spriteHurtType:getContentSize().height
    self._node:addChild(spriteHurtType)
end

function HitTipDamage:_createBuffType(buffId)
    local buffData = HeroSkillEffect.get(buffId)
    assert(buffData, "wrong buff id "..tostring(buffId))
    local resId = buffData.buff_tween_pic
    if resId ~= "" then
        local spriteBuff = cc.Sprite:create(Path.getBuffText(resId))
        spriteBuff:setAnchorPoint(cc.p(0, 0.5))
        local size = spriteBuff:getContentSize()
        self._posX = self._posX + spriteBuff:getContentSize().width
        self._width = self._width + spriteBuff:getContentSize().width
        self._height = size.height
        self._node:addChild(spriteBuff)
    end
end

function HitTipDamage:popup()
    if self._tween == 0 then
        self:_runUpAction()
    elseif self._tween == 1 then
        self:_runMiddleAction()
    elseif self._tween == 2 then
        self:_runDownAction()
    else
        if self._crit then
            self:_runCritAction()
        else
            self:_runDamageAction()
        end
    end
end

return HitTipDamage