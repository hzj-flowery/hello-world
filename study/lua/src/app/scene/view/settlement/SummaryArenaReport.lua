local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryArenaReport = class("SummaryArenaReport", SummaryBase)

local ComponentBattleDesc = require("app.scene.view.settlement.ComponentBattleDesc")

function SummaryArenaReport:ctor(battleData, callback)
    local list = {}
    local width = math.min(1136, display.width)
    local height = math.min(640, display.height)
    local midXPos = 850 - width*0.5

    local componentBattleDesc = ComponentBattleDesc.new(battleData, cc.p(midXPos, 290 - height*0.5), ComponentBattleDesc.TYPE_REPORT)
    table.insert(list, componentBattleDesc)

    SummaryArenaReport.super.ctor(self, battleData, callback, list, midXPos, true)
end

function SummaryArenaReport:onEnter()
    SummaryArenaReport.super.onEnter(self)
    self:_createAnimation()
end

function SummaryArenaReport:onExit()
    SummaryArenaReport.super.onExit(self)
end

function SummaryArenaReport:_createAnimation()
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_jwin_2", handler(self, self._playWinText), handler(self, self.checkStart) , false )    
end

return SummaryArenaReport