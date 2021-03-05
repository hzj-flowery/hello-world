--掉落的线
local ComponentBase = require("app.scene.view.settlement.ComponentBase")
local ComponentLine = class("ComponentLine", ComponentBase)
local CSHelper  = require("yoka.utils.CSHelper")

function ComponentLine:ctor(textFile, position)
    self._textFile = Lang.get(textFile)
    self:setPosition(position)
    ComponentLine.super.ctor(self)
end

function ComponentLine:start()
    ComponentLine.super.start(self)
    self:_playAnim()
end

function ComponentLine:_createLabel()
    -- local fontColor, fontOutline = Colors.getFTypeColor()
    -- if type == 2 then
    --     fontColor, fontOutline = Colors.getRankColor2()
    -- end
    local fontColor = Colors.getSummaryLineColor()
    local label = cc.Label:createWithTTF(self._textFile, Path.getFontW8(), 24)
    label:setColor(fontColor)
    -- label:enableOutline(fontOutline, 2)   
    return label     
end

function ComponentLine:_playAnim()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "effect_win_fengexian" then
            local subEffect = EffectGfxNode.new("effect_win_fengexian")
            subEffect:play()
            return subEffect
        elseif effect == "win_txt_diaoluo" then
            return self:_createLabel()
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_win_diaoluojiangli", effectFunction, handler(self, self.checkEnd) , false )
end

return ComponentLine