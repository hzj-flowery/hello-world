--南蛮入侵战斗结束
local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryRebelEnd = class("SummaryRebelEnd", SummaryBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentDamage = require("app.scene.view.settlement.ComponentDamage")
local ComponentItemInfo = require("app.scene.view.settlement.ComponentItemInfo")
local ComponentSmallRank = require("app.scene.view.settlement.ComponentSmallRank")


function SummaryRebelEnd:ctor(battleData, callback, attackHurt)
    self._battleData = battleData
    local list = {}

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = 0

    local componentDamage = ComponentDamage.new(attackHurt, cc.p(midXPos, 265 - height*0.5))
    table.insert(list, componentDamage)    

    local componentLine = ComponentLine.new("txt_sys_reward02", cc.p(midXPos, 215 - height*0.5))
    table.insert(list, componentLine)    

    local componentItemInfo = ComponentItemInfo.new(battleData.awards[1], cc.p(midXPos, 150 - height*0.5))
    table.insert(list, componentItemInfo)

    for i, v in pairs(battleData.addAwards) do
        if v.award.type == battleData.awards[1].type and v.award.value == battleData.awards[1].value then
            componentItemInfo:updateCrit(v.index, v.award.size)
        end   
    end

    local componentHeight = 30
    local posY = 150 - componentHeight
    if battleData.oldGuildRank ~= battleData.newGuildRank then
        local componentSmallRank = ComponentSmallRank.new(cc.p(midXPos, posY - height*0.5), Lang.get("guild_rank_up"), battleData.oldGuildRank, battleData.newGuildRank)
        table.insert(list, componentSmallRank)
        posY = posY - componentHeight
    end

    if battleData.oldRank ~= battleData.newRank then
        local componentSmallRank = ComponentSmallRank.new(cc.p(midXPos, posY - height*0.5), Lang.get("person_rank_up"), battleData.oldRank, battleData.newRank)
        table.insert(list, componentSmallRank)
    end

    SummaryRebelEnd.super.ctor(self,battleData, callback, list)
end

function SummaryRebelEnd:onEnter()
    SummaryRebelEnd.super.onEnter(self)
    self:_createAnimation()
end

function SummaryRebelEnd:onExit()
    SummaryRebelEnd.super.onExit(self)
end


function SummaryRebelEnd:_createAnimation()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        local subEffect = EffectGfxNode.new(effect)
        subEffect:play()
        return subEffect
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_battleend", effectFunction, handler(self, self.checkStart) , false )
end

return SummaryRebelEnd