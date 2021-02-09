local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryNormalWin = class("SummaryNormalWin", SummaryBase)

local ComponentStarRule = require("app.scene.view.settlement.ComponentStarRule")
local ComponentTwoItems = require("app.scene.view.settlement.ComponentTwoItems")
local ComponentLevel = require("app.scene.view.settlement.ComponentLevel")
local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentDrop = require("app.scene.view.settlement.ComponentDrop")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

function SummaryNormalWin:ctor(battleData, callback)
    self._battleData = battleData
    self._star = battleData.star
    self._movingName = "moving_win_"..self._star

    local list = {}
    -- local width = math.min(1136, display.width)
    -- local height = math.min(640, display.height)

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    -- local midXPos = width*0.5
    local midXPos = SummaryBase.NORMAL_FIX_X

    local componentStarRule = ComponentStarRule.new(battleData.star, cc.p(midXPos, 315 - height*0.5))
    -- self:addChild(componentStarRule)
    table.insert(list, componentStarRule)

    local itemExp = 
    {
        type = TypeConvertHelper.TYPE_RESOURCE, 
        value = DataConst.RES_EXP, 
        size = self._battleData.exp,
    } 
    local itemMoney = 
    {
        type = TypeConvertHelper.TYPE_RESOURCE, 
        value = DataConst.RES_GOLD, 
        size = self._battleData.money,
    }      
    local items = {itemExp, itemMoney}
    local componentTwoItems = ComponentTwoItems.new(items, self._battleData.addAwards, cc.p(midXPos, 250 - height*0.5))
    table.insert(list, componentTwoItems)

    local componentLevel = ComponentLevel.new(self._battleData.exp, cc.p(midXPos, 220 - height*0.5))
    table.insert(list, componentLevel)

    local componentLine = ComponentLine.new("txt_sys_reward01", cc.p(midXPos, 177 - height*0.5))
    table.insert(list, componentLine)

    local componentDrop = ComponentDrop.new(self._battleData.awards, cc.p(midXPos, 107 - height*0.5), self._battleData.isDouble)
    table.insert(list, componentDrop)
    
    
    SummaryNormalWin.super.ctor(self,battleData, callback, list, midXPos, true)
end

function SummaryNormalWin:onEnter()
    SummaryNormalWin.super.onEnter(self)
    self:_createAnimation()
    --G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN)
end

function SummaryNormalWin:onExit()
    SummaryNormalWin.super.onExit(self)
    --G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END)
end


function SummaryNormalWin:_createAnimation()
    local effect = G_EffectGfxMgr:createPlayMovingGfx( self, self._movingName, handler(self, self._playWinText), handler(self, self.checkStart) , false )
end

return SummaryNormalWin