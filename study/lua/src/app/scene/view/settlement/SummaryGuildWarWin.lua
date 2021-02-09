local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryGuildWarWin = class("SummaryGuildWarWin", SummaryBase)

local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentSmallRank = require("app.scene.view.settlement.ComponentSmallRank")
local ComponentBattleDesc = require("app.scene.view.settlement.ComponentBattleDesc")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local DropHelper = require("app.utils.DropHelper")

function SummaryGuildWarWin:ctor(battleData, callback)

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
    local beforeVit = changeData.myBeginVit
    local nowVit = changeData.myEndVit
    if nowVit < 0 then 
        nowVit = 0
    end
    -- local icon = Path.getResourceMiniIcon("bingli")
    local panelVit = ComponentSmallRank.new(cc.p(midXPos, 160 - height*0.5), Lang.get("fight_end_my_vit"), beforeVit, nowVit)
    table.insert(list, panelVit) 
    
    local beforeTarVit = changeData.tarBeginVit
    local nowTarVit = changeData.tarEndVit
    if nowTarVit < 0 then 
        nowTarVit = 0
    end
    -- local icon = Path.getResourceMiniIcon("bingli")
    local panelTired = ComponentSmallRank.new(cc.p(midXPos, 125 - height*0.5), Lang.get("fight_end_vit"), beforeTarVit, nowTarVit)
    table.insert(list, panelTired) 
   
    SummaryGuildWarWin.super.ctor(self, battleData, callback, list, midXPos, true)
end

function SummaryGuildWarWin:onEnter()
    SummaryGuildWarWin.super.onEnter(self)
    self:_createAnimation()
end

function SummaryGuildWarWin:onExit()
    SummaryGuildWarWin.super.onExit(self)
end

function SummaryGuildWarWin:_createAnimation()
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_allwin_win", handler(self, self._playWinText), handler(self, self.checkStart) , false )
end

return SummaryGuildWarWin