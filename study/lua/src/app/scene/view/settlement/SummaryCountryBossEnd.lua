--世界boss战斗结束
local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryCountryBossEnd = class("SummaryCountryBossEnd", SummaryBase)

local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentDamage = require("app.scene.view.settlement.ComponentDamage")


function SummaryCountryBossEnd:ctor(battleData, callback)
    self._battleData = battleData
    local list = {}

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = 0

    local hurt = battleData.hurt
    local componentDamage = ComponentDamage.new(hurt, cc.p(midXPos, 265 - height*0.5 - 20))
    table.insert(list, componentDamage)

    -- local richText = Lang.get("worldboss_fight_finish_point", {
	-- 	num = battleData.point,
	-- })
    -- local componentLine = ComponentDamage.new("", cc.p(midXPos, 265 - height*0.5 - 45),richText)
    -- table.insert(list, componentLine)

    SummaryCountryBossEnd.super.ctor(self,battleData, callback, list)
end

function SummaryCountryBossEnd:onEnter()
    SummaryCountryBossEnd.super.onEnter(self)
    self:_createAnimation()
end

function SummaryCountryBossEnd:onExit()
    SummaryCountryBossEnd.super.onExit(self)
end


function SummaryCountryBossEnd:_createAnimation()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        local subEffect = EffectGfxNode.new(effect)
        subEffect:play()
        return subEffect
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_battleend", effectFunction, handler(self, self.checkStart) , false )
end

return SummaryCountryBossEnd
