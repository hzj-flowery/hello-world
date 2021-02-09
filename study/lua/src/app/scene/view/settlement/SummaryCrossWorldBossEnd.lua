--跨服boss战斗结束
local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryCrossWorldBossEnd = class("SummaryCrossWorldBossEnd", SummaryBase)

local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentDamage = require("app.scene.view.settlement.ComponentDamage")


function SummaryCrossWorldBossEnd:ctor(battleData, callback)
    self._battleData = battleData
    local list = {}

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = 0

    local hurt = battleData.hurt
    local componentDamage = ComponentDamage.new(hurt, cc.p(midXPos, 265 - height*0.5))
    table.insert(list, componentDamage)    

    local richText = Lang.get("crossworldboss_fight_finish_point", {
		num = battleData.point, 
	})
    local componentLine = ComponentDamage.new("", cc.p(midXPos, 265 - height*0.5 - 45),richText)
    table.insert(list, componentLine)

    SummaryCrossWorldBossEnd.super.ctor(self,battleData, callback, list)
end

function SummaryCrossWorldBossEnd:onEnter()
    SummaryCrossWorldBossEnd.super.onEnter(self)
    self:_createAnimation()
end

function SummaryCrossWorldBossEnd:onExit()
    SummaryCrossWorldBossEnd.super.onExit(self)
end


function SummaryCrossWorldBossEnd:_createAnimation()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        local subEffect = EffectGfxNode.new(effect)
        subEffect:play()
        return subEffect
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_battleend", effectFunction, handler(self, self.checkStart) , false )
end

return SummaryCrossWorldBossEnd