
-- 真武战神战斗结束
local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryUniverseRaceEnd = class("SummaryUniverseRaceEnd", SummaryBase)

function SummaryUniverseRaceEnd:ctor(battleData, callback, attackHurt)
    self._battleData = battleData
    local list = {}
    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = 0

    local componentUniverseRacePlayers = require("app.scene.view.settlement.ComponentUniverseRacePlayers").new(battleData, cc.p(midXPos, 265 - height*0.5))
    table.insert(list, componentUniverseRacePlayers)

    SummaryUniverseRaceEnd.super.ctor(self, battleData, callback, list)
end

function SummaryUniverseRaceEnd:onEnter()
    SummaryUniverseRaceEnd.super.onEnter(self)
    self:_createAnimation()
end

function SummaryUniverseRaceEnd:onExit()
    SummaryUniverseRaceEnd.super.onExit(self)
end


function SummaryUniverseRaceEnd:_createAnimation()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        local subEffect = EffectGfxNode.new(effect)
        subEffect:play()
        return subEffect
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_battleend", effectFunction, handler(self, self.checkStart) , false )
end

return SummaryUniverseRaceEnd