local SummaryLoseBase = require("app.scene.view.settlement.SummaryLoseBase")
local SummaryGuildWarLose = class("SummaryGuildWarLose", SummaryLoseBase)

local Path = require("app.utils.Path")
local ComponentSmallRank = require("app.scene.view.settlement.ComponentSmallRank")

-- --普通副本结算
function SummaryGuildWarLose:ctor(battleData, callback)
    SummaryGuildWarLose.super.ctor(self,battleData,callback)
    self._battleData = battleData
end

function SummaryGuildWarLose:onEnter()
    SummaryGuildWarLose.super.onEnter(self)
    self:_createAnimation()
end

function SummaryGuildWarLose:onExit()
    SummaryGuildWarLose.super.onExit(self)
end

function SummaryGuildWarLose:_createActionNode(effect)
    if effect == "shibai" then
        return self:_createLosePic()
    elseif effect == "fail_icon1" then
        local changeData = self._battleData.selfData
        local beforeVit = changeData.myBeginVit
        local nowVit = changeData.myEndVit
        if nowVit < 0 then 
            nowVit = 0
        end
        local panelVit = ComponentSmallRank.new(cc.p(0, 0), Lang.get("fight_end_my_vit"), beforeVit, nowVit)
        return panelVit:_createRankPanel()
    elseif effect == "fail_icon3" then
        local changeData = self._battleData.selfData
        local beforeTarVit = changeData.tarBeginVit
        local nowTarVit = changeData.tarEndVit
        if nowTarVit < 0 then 
            nowTarVit = 0
        end
        local panelVit = ComponentSmallRank.new(cc.p(0, 0), Lang.get("fight_end_vit"), beforeTarVit, nowTarVit)
        return panelVit:_createRankPanel()
    elseif effect == "fail_txt_tishengzhanli" then
        return self:_createText("fight_mine_end")
    end
end

function SummaryGuildWarLose:_createAnimation(rootNode)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        return self:_createActionNode(effect)    
    end
    local function eventFunction(event)
        if event == "finish" then
            self:_createContinueNode()
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_kuangfail", effectFunction, eventFunction , false )
end

return SummaryGuildWarLose