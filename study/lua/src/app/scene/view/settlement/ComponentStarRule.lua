--星数说明
local ComponentBase = require("app.scene.view.settlement.ComponentBase")
local ComponentStarRule = class("ComponentStarRule", ComponentBase)

function ComponentStarRule:ctor(star, position)
    self._star = star
    self:setPosition(position)
    ComponentStarRule.super.ctor(self)
end

function ComponentStarRule:start()
    ComponentStarRule.super.start(self)
    self:_playAnim()
end

function ComponentStarRule:_createFontLabel()
    local fontColor = Colors.getSummaryStarColor()
    local str = Lang.get("settlement_star_rule")[self._star]
    local label = cc.Label:createWithTTF(str, Path.getCommonFont(), 20)
    label:setColor(fontColor)
    -- label:enableOutline(fontOutline, 2)   
    return label 
end

function ComponentStarRule:_playAnim()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "pingjia" then
            local label = self:_createFontLabel()
            return label
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_win_pingjia", effectFunction, handler(self, self.checkEnd) , false )
end

return ComponentStarRule