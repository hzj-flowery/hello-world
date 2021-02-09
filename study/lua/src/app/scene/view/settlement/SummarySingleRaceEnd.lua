-- 跨服个人竞技战斗结束

local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummarySingleRaceEnd = class("SummarySingleRaceEnd", SummaryBase)

function SummarySingleRaceEnd:ctor(battleData, callback, attackHurt)
    self._battleData = battleData
    local list = {}
    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = 0

    local componentSingleRacePlayers = require("app.scene.view.settlement.ComponentSingleRacePlayers").new(battleData, cc.p(midXPos, 265 - height*0.5))
    table.insert(list, componentSingleRacePlayers)

    SummarySingleRaceEnd.super.ctor(self, battleData, callback, list)
end

function SummarySingleRaceEnd:onEnter()
    SummarySingleRaceEnd.super.onEnter(self)
    self:_createAnimation()
end

function SummarySingleRaceEnd:onExit()
    SummarySingleRaceEnd.super.onExit(self)
end


function SummarySingleRaceEnd:_createAnimation()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        local subEffect = EffectGfxNode.new(effect)
        subEffect:play()
        return subEffect
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_battleend", effectFunction, handler(self, self.checkStart) , false )
end

return SummarySingleRaceEnd