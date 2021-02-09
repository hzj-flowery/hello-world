local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryDailyWin = class("SummaryDailyWin", SummaryBase)

local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentItemInfo = require("app.scene.view.settlement.ComponentItemInfo")
local ComponentDrop = require("app.scene.view.settlement.ComponentDrop")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local DropHelper = require("app.utils.DropHelper")

function SummaryDailyWin:ctor(battleData, callback)
    local reward = DropHelper.merageAwardList(battleData.awards)
    local list = {}

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = SummaryBase.NORMAL_FIX_X

    local componentLine = ComponentLine.new("txt_sys_reward02", cc.p(midXPos, 253 - height*0.5))
    table.insert(list, componentLine)
    if #reward == 1 and reward[1].type == TypeConvertHelper.TYPE_RESOURCE then
        local componentItemInfo = ComponentItemInfo.new(reward[1], cc.p(midXPos, 170 - height*0.5))
        table.insert(list, componentItemInfo)        
    else
        local componentDrop = ComponentDrop.new(reward, cc.p(midXPos, 183 - height*0.5))
        table.insert(list, componentDrop)
    end
   
    SummaryDailyWin.super.ctor(self,battleData, callback, list, midXPos, true)
end

function SummaryDailyWin:onEnter()
    SummaryDailyWin.super.onEnter(self)
    self:_createAnimation()
end

function SummaryDailyWin:onExit()
    SummaryDailyWin.super.onExit(self)
end

function SummaryDailyWin:_createAnimation()
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_allwin_win", handler(self, self._playWinText), handler(self, self.checkStart) , false )
end

return SummaryDailyWin