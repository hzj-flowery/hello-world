--董卓之乱（游历boss）
local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryExploreBoss = class("SummaryExploreBoss", SummaryBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentDrop = require("app.scene.view.settlement.ComponentDrop")
local ComponentItemInfo = require("app.scene.view.settlement.ComponentItemInfo")
local ComponentLevel = require("app.scene.view.settlement.ComponentLevel")

function SummaryExploreBoss:ctor(battleData, callback, attackHurt)
    self._battleData = battleData
    local list = {}
    local height = math.min(640, display.height)
 
    --获得经验
    local itemExp = 
    {
        type = TypeConvertHelper.TYPE_RESOURCE, 
        value = DataConst.RES_EXP, 
        size = self._battleData.exp,
    } 
    local componentItemInfo = ComponentItemInfo.new(itemExp, cc.p(0, 250 - height*0.5))
    table.insert(list, componentItemInfo)

    local componentLevel = ComponentLevel.new(self._battleData.exp, cc.p(0, 230 - height*0.5))
    table.insert(list, componentLevel)

    if #battleData.awards ~= 0 then
        local componentLine = ComponentLine.new("txt_sys_reward02", cc.p(0, 180 - height*0.5))
        table.insert(list, componentLine)
        local componentDrop = ComponentDrop.new(battleData.awards, cc.p(0, 100 - height*0.5 ))
        table.insert(list, componentDrop)
    end

    SummaryExploreBoss.super.ctor(self,battleData, callback, list)
end

function SummaryExploreBoss:onEnter()
    SummaryExploreBoss.super.onEnter(self)
    self:_createAnimation()
end

function SummaryExploreBoss:onExit()
    SummaryExploreBoss.super.onExit(self)
end


function SummaryExploreBoss:_createAnimation()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        local subEffect = EffectGfxNode.new(effect)
        subEffect:play()
        return subEffect
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_battleend", effectFunction, handler(self, self.checkStart) , false )
end

return SummaryExploreBoss