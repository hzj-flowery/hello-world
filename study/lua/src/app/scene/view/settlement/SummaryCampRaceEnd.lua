-- --南蛮入侵战斗结束

local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryCampRaceEnd = class("SummaryCampRaceEnd", SummaryBase)

function SummaryCampRaceEnd:ctor(battleData, callback, attackHurt)
    self._battleData = battleData
    local list = {}
    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = 0

    local componentCampPlayers = require("app.scene.view.settlement.ComponentCampPlayers").new(battleData, cc.p(midXPos, 265 - height*0.5))
    table.insert(list, componentCampPlayers)

    SummaryCampRaceEnd.super.ctor(self, battleData, callback, list)
end

function SummaryCampRaceEnd:onEnter()
    SummaryCampRaceEnd.super.onEnter(self)
    self:_createAnimation()
end

function SummaryCampRaceEnd:onExit()
    SummaryCampRaceEnd.super.onExit(self)
end


function SummaryCampRaceEnd:_createAnimation()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        local subEffect = EffectGfxNode.new(effect)
        subEffect:play()
        return subEffect
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_battleend", effectFunction, handler(self, self.checkStart) , false )
end

return SummaryCampRaceEnd