local HitTipParticle = require("app.fight.views.HitTip.HitTipParticle")
local HitTipAngerBuff = class("HitTipAngerBuff", HitTipParticle)
local HeroSkillEffect = require("app.config.hero_skill_effect")
local Path = require("app.utils.Path")

function HitTipAngerBuff:ctor(buffId, damageValue)
    HitTipAngerBuff.super.ctor(self, "anger_buff")
    self._buffId = buffId
    self._damageType = damageType
    self._damageValue = damageValue
    self._resId = HeroSkillEffect.get(buffId).buff_tween_pic
    self._tween = 0

    local width = 0
    local height = 0
    if self._resId ~= "" then
        local spriteBuff = cc.Sprite:create(Path.getBuffText(self._resId))
        assert(spriteBuff, "has not spriteBuff id = "..tostring(buffId)..tostring(self._resId))
        self._node:addChild(spriteBuff)
        self._tween = tonumber(HeroSkillEffect.get(buffId).buff_tween)
        spriteBuff:setAnchorPoint(cc.p(0, 0.5))
        width = spriteBuff:getContentSize().width
        height = spriteBuff:getContentSize().height
    end

    local label = nil
    local strValue = damageValue
    if damageValue > 0 then
        label = cc.Label:createWithCharMap(Path.getBattleFont("buff_01shuzi"), 31, 41, string.byte("+"))
        strValue = "+"..damageValue
    elseif damageValue < 0 then
        label = cc.Label:createWithCharMap(Path.getBattleFont("buff_02shuzi"), 31, 41, string.byte("+"))
        strValue = damageValue
    end
    if label then 
        self._node:addChild(label)
        label:setString(strValue)
        label:setAnchorPoint(cc.p(0, 0.5))
        label:setPositionX(width)
        width = width + label:getContentSize().width
    end

    self._node:setContentSize(cc.size(width, height))
    self._node:setAnchorPoint(cc.p(0.5, 0.5))  
    self._height = height
end

function HitTipAngerBuff:popup()
    if self._tween == 0 then
        self:_runUpAction()
    elseif self._tween == 1 then
        self:_runMiddleAction()
    elseif self._tween == 2 then
        self:_runDownAction()
    end
end

return HitTipAngerBuff