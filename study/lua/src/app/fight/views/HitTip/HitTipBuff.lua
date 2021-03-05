local HitTipParticle = require("app.fight.views.HitTip.HitTipParticle")
local HitTipBuff = class("HitTipBuff", HitTipParticle)

local Path = require("app.utils.Path")
local HeroSkillEffect = require("app.config.hero_skill_effect")

function HitTipBuff:ctor(buffId)
    HitTipBuff.super.ctor(self, "buff")
    self._action = 0
    self._tween = 0
    local buffData = HeroSkillEffect.get(buffId)
    assert(buffData, "buffdata is nil, id = "..buffId)
    self._resId = buffData.buff_tween_pic
    if self._resId ~= "" then
        local spriteBuff = cc.Sprite:create(Path.getBuffText(self._resId))
        assert(spriteBuff, "has not spriteBuff id = "..tostring(buffId)..tostring(self._resId))
        self._node:addChild(spriteBuff)
        local size = spriteBuff:getContentSize()
        self._node:setContentSize(size)
        self._node:setAnchorPoint(cc.p(0, 0.5))  
        self._height = size.height
        self._tween = tonumber(HeroSkillEffect.get(buffId).buff_tween)
    end
end

function HitTipBuff:popup() --1.下往上，2.上往下，3.中间
    if self._tween == 0 then
        self:_runUpAction()
    elseif self._tween == 1 then
        self:_runMiddleAction()
    elseif self._tween == 2 then
        self:_runDownAction()
    end
end

return HitTipBuff