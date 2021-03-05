local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryGeneralWin = class("SummaryGeneralWin", SummaryBase)

local ComponentStarRule = require("app.scene.view.settlement.ComponentStarRule")
local ComponentTwoItems = require("app.scene.view.settlement.ComponentTwoItems")
local ComponentLevel = require("app.scene.view.settlement.ComponentLevel")
local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentDrop = require("app.scene.view.settlement.ComponentDrop")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

function SummaryGeneralWin:ctor(battleData, callback)
    self._battleData = battleData
    self._star = battleData.star
    
    local list = {}

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = SummaryBase.NORMAL_FIX_X


    local componentLine = ComponentLine.new("txt_sys_reward01", cc.p(midXPos, 177 - height*0.5))
    table.insert(list, componentLine)

    local componentDrop = ComponentDrop.new(self._battleData.awards, cc.p(midXPos, 107 - height*0.5), self._battleData.isDouble)
    table.insert(list, componentDrop)
    
    SummaryGeneralWin.super.ctor(self,battleData, callback, list, midXPos, true)
end

function SummaryGeneralWin:onEnter()
    SummaryGeneralWin.super.onEnter(self)
    self:_createAnimation()
end

function SummaryGeneralWin:onExit()
    SummaryGeneralWin.super.onExit(self)
end


function SummaryGeneralWin:_createAnimation()
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_allwin_win", handler(self, self._playWinText), handler(self, self.checkStart) , false )
end

return SummaryGeneralWin