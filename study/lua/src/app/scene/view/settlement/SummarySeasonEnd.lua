-- -- 无差别战斗结束

local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummarySeasonEnd = class("SummarySeasonEnd", SummaryBase)

function SummarySeasonEnd:ctor(battleData, callback, attackHurt)
    self._battleData = battleData
    local list = {}
    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = 0

    local ComponentSeasonPlayers = require("app.scene.view.settlement.ComponentSeasonPlayers").new(battleData, cc.p(midXPos, 265 - height*0.5))
    table.insert(list, ComponentSeasonPlayers)

    SummarySeasonEnd.super.ctor(self, battleData, callback, list)
end

function SummarySeasonEnd:onEnter()
    SummarySeasonEnd.super.onEnter(self)
    self:_createAnimation()
end

function SummarySeasonEnd:onExit()
    if G_UserData:getSeasonSport():isSquadReconnect() and G_UserData:getSeasonSport():isPlayReport() == false then
        G_SceneManager:showScene("seasonSport")
    end
    
    G_UserData:getSeasonSport():setPlayReport(false)
    SummarySeasonEnd.super.onExit(self)
end

function SummarySeasonEnd:_createAnimation()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        local subEffect = EffectGfxNode.new(effect)
        subEffect:play()
        return subEffect
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_battleend", effectFunction, handler(self, self.checkStart) , false )
end

return SummarySeasonEnd