local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryMineWin = class("SummaryMineWin", SummaryBase)

local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentSmallRank = require("app.scene.view.settlement.ComponentSmallRank")
local ComponentBattleDesc = require("app.scene.view.settlement.ComponentBattleDesc")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local DropHelper = require("app.utils.DropHelper")

function SummaryMineWin:ctor(battleData, callback)
    local reward = DropHelper.merageAwardList(battleData.awards)
    local list = {}

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = SummaryBase.NORMAL_FIX_X

    local componentBattleDesc = ComponentBattleDesc.new(battleData, cc.p(midXPos, 250 - height*0.5))
    table.insert(list, componentBattleDesc)  

    local componentLine = ComponentLine.new("fight_mine_end", cc.p(midXPos, 215 - height*0.5))
    table.insert(list, componentLine)

    local changeData = battleData.selfData
    local beforeArmy = changeData.myBeginArmy
    local nowArmy = changeData.myEndArmy
    local beforeInfame = changeData.myBeginInfame
    local nowInfame = changeData.myEndInfame
    if nowArmy < 0 then 
        nowArmy = 0
    end
    -- local icon = Path.getResourceMiniIcon("bingli")
    local panelArmy = ComponentSmallRank.new(cc.p(midXPos, 160 - height*0.5), Lang.get("fight_end_my_army"), beforeArmy, nowArmy)
    table.insert(list, panelArmy) 
    
    local beforeTarArmy = changeData.tarBeginArmy
    local nowTarArmy = changeData.tarEndArmy
    if nowTarArmy < 0 then 
        nowTarArmy = 0
    end
    -- local icon = Path.getResourceMiniIcon("bingli")
    local panelTired = ComponentSmallRank.new(cc.p(midXPos, 125 - height*0.5), Lang.get("fight_end_army"), beforeTarArmy, nowTarArmy)
    table.insert(list, panelTired) 


    if math.abs(nowInfame - beforeInfame) ~= 0 then
        --我方恶名有变化才显示
        local panelTired = ComponentSmallRank.new(cc.p(midXPos, 90 - height*0.5), Lang.get("fight_end_my_infame"), beforeInfame, nowInfame, nil, "0")
        table.insert(list, panelTired) 
    end
   
    SummaryMineWin.super.ctor(self, battleData, callback, list, midXPos, true)
end

function SummaryMineWin:onEnter()
    SummaryMineWin.super.onEnter(self)
    self:_createAnimation()
end

function SummaryMineWin:onExit()
    SummaryMineWin.super.onExit(self)
end

function SummaryMineWin:_createAnimation()
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_allwin_win", handler(self, self._playWinText), handler(self, self.checkStart) , false )
end

return SummaryMineWin