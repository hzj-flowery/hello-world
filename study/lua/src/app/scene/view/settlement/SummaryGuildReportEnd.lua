local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryGuildReportEnd = class("SummaryGuildReportEnd", SummaryBase)

local ComponentBattleDesc = require("app.scene.view.settlement.ComponentBattleDesc")

function SummaryGuildReportEnd:ctor(battleData, callback, attackHurt)
    self._battleData = battleData
    local list = {}
    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = 0

    local width = math.min(1136, display.width)
    local height = math.min(640, display.height)
    -- local midXPos = 850 - width * 0.5

    local componentBattleDesc = ComponentBattleDesc.new(battleData, cc.p(midXPos, 270 - height * 0.5), ComponentBattleDesc.TYPE_REPORT)
    table.insert(list, componentBattleDesc)

    SummaryGuildReportEnd.super.ctor(self, battleData, callback, list)
end

function SummaryGuildReportEnd:onEnter()
    SummaryGuildReportEnd.super.onEnter(self)
    self:_createAnimation()
end

function SummaryGuildReportEnd:onExit()
    SummaryGuildReportEnd.super.onExit(self)
end

function SummaryGuildReportEnd:_createAnimation()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        local subEffect = EffectGfxNode.new(effect)
        subEffect:play()
        return subEffect
    end
    G_EffectGfxMgr:createPlayMovingGfx(self, "moving_battleend", effectFunction, handler(self, self.checkStart), false)
end

return SummaryGuildReportEnd