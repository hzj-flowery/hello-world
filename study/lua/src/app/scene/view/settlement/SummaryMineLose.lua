local SummaryLoseBase = require("app.scene.view.settlement.SummaryLoseBase")
local SummaryMineLose = class("SummaryMineLose", SummaryLoseBase)

local Path = require("app.utils.Path")
local ComponentSmallRank = require("app.scene.view.settlement.ComponentSmallRank")

-- --普通副本结算
function SummaryMineLose:ctor(battleData, callback)
    SummaryMineLose.super.ctor(self,battleData,callback)
    self._battleData = battleData
end

function SummaryMineLose:onEnter()
    SummaryMineLose.super.onEnter(self)
    self:_createAnimation()
end

function SummaryMineLose:onExit()
    SummaryMineLose.super.onExit(self)
end

function SummaryMineLose:_createActionNode(effect)
    if effect == "shibai" then
        return self:_createLosePic()
    elseif effect == "fail_icon1" then
        local changeData = self._battleData.selfData
        local beforeArmy = changeData.myBeginArmy
        local nowArmy = changeData.myEndArmy
        if nowArmy < 0 then 
            nowArmy = 0
        end
        -- local icon = Path.getResourceMiniIcon("bingli")
        local panelArmy = ComponentSmallRank.new(cc.p(0, 0), Lang.get("fight_end_my_army"), beforeArmy, nowArmy)
        return panelArmy:_createRankPanel()
    elseif effect == "fail_icon3" then
        local changeData = self._battleData.selfData
        local beforeTarArmy = changeData.tarBeginArmy
        local nowTarArmy = changeData.tarEndArmy
        local beforeInfame = changeData.myBeginInfame
        local nowInfame = changeData.myEndInfame

        if nowTarArmy < 0 then 
            nowTarArmy = 0
        end
        -- local icon = Path.getResourceMiniIcon("bingli")
        local panelArmy = ComponentSmallRank.new(cc.p(0, 0), Lang.get("fight_end_army"), beforeTarArmy, nowTarArmy)
        local panel = panelArmy:_createRankPanel()

        if math.abs(nowInfame - beforeInfame) ~= 0 then
            --我方恶名有变化才显示
            local panelTired = ComponentSmallRank.new(cc.p(0, 0), Lang.get("fight_end_my_infame"), beforeInfame, nowInfame, nil, "0")
            local panelInfame = panelTired:_createRankPanel()
            panelInfame:setPositionY(-50)
            panel:addChild(panelInfame)
        end

        return panel
    elseif effect == "fail_txt_tishengzhanli" then
        return self:_createText("fight_mine_end")
    end
end

function SummaryMineLose:_createAnimation(rootNode)
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

return SummaryMineLose