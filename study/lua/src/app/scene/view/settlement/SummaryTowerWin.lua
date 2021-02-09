local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryTowerWin = class("SummaryTowerWin", SummaryBase)

local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentItemInfo = require("app.scene.view.settlement.ComponentItemInfo")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

function SummaryTowerWin:ctor(battleData, callback)
    self._battleData = battleData

    local list = {}

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = SummaryBase.NORMAL_FIX_X
    
    local componentLine = ComponentLine.new("txt_sys_reward02", cc.p(midXPos, 253 - height*0.5))
    table.insert(list, componentLine)


    local itemMoney = 
    {
        type = TypeConvertHelper.TYPE_RESOURCE, 
        value = DataConst.RES_GOLD, 
        size = 0,
    } 
    local itemIron = 
    {
        type = TypeConvertHelper.TYPE_RESOURCE, 
        value = DataConst.RES_JADE, 
        size = 0,
    } 
    for i, v in pairs(battleData.awards) do
        if v.type == itemMoney.type and v.value == itemMoney.value then
            itemMoney.size = itemMoney.size + v.size
        elseif v.type == itemIron.type and v.value == itemIron.value then
            itemIron.size = itemIron.size + v.size
        end
    end

    local componentItemInfo1 = ComponentItemInfo.new(itemMoney, cc.p(midXPos, 185 - height*0.5))
    table.insert(list, componentItemInfo1)

    local componentItemInfo2 = ComponentItemInfo.new(itemIron, cc.p(midXPos, 150 - height*0.5))
    table.insert(list, componentItemInfo2)

    for i, v in pairs(battleData.addAwards) do
        if v.award.type == itemMoney.type and v.award.value == itemMoney.value then
            componentItemInfo1:updateCrit(v.index, v.award.size)
        elseif v.award.type == itemIron.type and v.award.value == itemIron.value then
            componentItemInfo2:updateCrit(v.index, v.award.size)
        end   
    end
    
    SummaryTowerWin.super.ctor(self,battleData, callback, list, midXPos, true)
end

function SummaryTowerWin:onEnter()
    SummaryTowerWin.super.onEnter(self)
    self:_createAnimation()
end

function SummaryTowerWin:onExit()
    SummaryTowerWin.super.onExit(self)
end


function SummaryTowerWin:_createAnimation()
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_allwin_win", handler(self, self._playWinText), handler(self, self.checkStart) , false )
end

return SummaryTowerWin