--名次变化
local ComponentBase = require("app.scene.view.settlement.ComponentBase")
local ComponentRankChange = class("ComponentRankChange", ComponentBase)

function ComponentRankChange:ctor(rank1, rank2, position)
    self._rank1 = rank1
    self._rank2 = rank2
    self:setPosition(position)
    ComponentRankChange.super.ctor(self)
end

function ComponentRankChange:start()
    ComponentRankChange.super.start(self)
    self:_playAnim()
end

function ComponentRankChange:_createLabel(rank, type)
    -- local fontColor, fontOutline = Colors.getFTypeColor()
    -- if type == 2 then
    --     fontColor, fontOutline = Colors.getRankColor2()
    -- end
    local fontColor, fontOutline = Colors.getSettlementRankColor(type)
    local label = cc.Label:createWithTTF(rank, Path.getCommonFont(), 30)
    label:setColor(fontColor)
    label:enableOutline(fontOutline, 2)   
    return label     
end

function ComponentRankChange:_playAnim()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "effect_paiming_jiantou" then
            local subEffect = EffectGfxNode.new("effect_paiming_jiantou")
            subEffect:play()
            return subEffect
        elseif effect == "mingci_1" then
            return self:_createLabel(self._rank1, 1)
        elseif effect == "mingci_2" then
            return self:_createLabel(self._rank2, 2)
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_jwin_mingci", effectFunction, handler(self, self.checkEnd) , false )
end

return ComponentRankChange