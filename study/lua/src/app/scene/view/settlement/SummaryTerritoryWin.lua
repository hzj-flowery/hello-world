local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryTerritoryWin = class("SummaryTerritoryWin", SummaryBase)
local ComponentTwoItems = require("app.scene.view.settlement.ComponentTwoItems")
local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentDrop = require("app.scene.view.settlement.ComponentDrop")
local ComponentLevel = require("app.scene.view.settlement.ComponentLevel")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local DropHelper = require("app.utils.DropHelper")

function SummaryTerritoryWin:ctor(battleData, callback)
    local list = {}

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = SummaryBase.NORMAL_FIX_X

    if battleData.exp > 0 then
        local itemExp = 
        {
            type = TypeConvertHelper.TYPE_RESOURCE, 
            value = DataConst.RES_EXP, 
            size =  battleData.exp,
        } 
        local itemMoney = 
        {
            type  = TypeConvertHelper.TYPE_RESOURCE, 
            value = DataConst.RES_GOLD, 
            size  = battleData.money,
        } 

        local items = {itemExp, itemMoney}
        local componentTwoItems = ComponentTwoItems.new(items, battleData.addAwards, cc.p(midXPos, 250 - height*0.5), true)
        table.insert(list, componentTwoItems)
        local componentLevel = ComponentLevel.new(battleData.exp, cc.p(midXPos, 220 - height*0.5))
        table.insert(list, componentLevel)

    end
   

    local componentLine = ComponentLine.new("txt_sys_reward02", cc.p(midXPos, 177 - height*0.5))
    table.insert(list, componentLine)

    local componentDrop = ComponentDrop.new(battleData.awards, cc.p(midXPos, 107 - height*0.5))
    table.insert(list, componentDrop)

   
    SummaryTerritoryWin.super.ctor(self,battleData, callback, list, midXPos, true)
end

function SummaryTerritoryWin:onEnter()
    SummaryTerritoryWin.super.onEnter(self)
    self:_createAnimation()
end

function SummaryTerritoryWin:onExit()
    SummaryTerritoryWin.super.onExit(self)
end

function SummaryTerritoryWin:_createAnimation()
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_allwin_win", handler(self, self._playWinText), handler(self, self.checkStart) , false )
end

return SummaryTerritoryWin