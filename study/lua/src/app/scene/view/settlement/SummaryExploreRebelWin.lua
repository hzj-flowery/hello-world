--洛阳之乱（游历叛军）
local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryExploreRebelWin = class("SummaryExploreRebelWin", SummaryBase)

local ComponentItemInfo = require("app.scene.view.settlement.ComponentItemInfo")
local ComponentLevel = require("app.scene.view.settlement.ComponentLevel")
local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentDrop = require("app.scene.view.settlement.ComponentDrop")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

function SummaryExploreRebelWin:ctor(battleData, callback)
    self._battleData = battleData

    local list = {}

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = SummaryBase.NORMAL_FIX_X
    --获得经验
    local itemExp = 
    {
        type = TypeConvertHelper.TYPE_RESOURCE, 
        value = DataConst.RES_EXP, 
        size = self._battleData.exp,
    } 
    local componentItemInfo = ComponentItemInfo.new(itemExp, cc.p(midXPos - 40, 240 - height*0.5))
    table.insert(list, componentItemInfo)

    local componentLevel = ComponentLevel.new(self._battleData.exp, cc.p(midXPos, 220 - height*0.5))
    table.insert(list, componentLevel)

    local componentLine = ComponentLine.new("txt_sys_reward01", cc.p(midXPos, 177 - height*0.5))
    table.insert(list, componentLine)

    local componentDrop = ComponentDrop.new(self._battleData.awards, cc.p(midXPos, 107 - height*0.5))
    table.insert(list, componentDrop)
    
    SummaryExploreRebelWin.super.ctor(self,battleData, callback, list, midXPos, true)
end

function SummaryExploreRebelWin:onEnter()
    SummaryExploreRebelWin.super.onEnter(self)
    self:_createAnimation()
end

function SummaryExploreRebelWin:onExit()
    SummaryExploreRebelWin.super.onExit(self)
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END)
end


function SummaryExploreRebelWin:_createAnimation()
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_allwin_win", handler(self, self._playWinText), handler(self, self.checkStart) , false )
end

return SummaryExploreRebelWin