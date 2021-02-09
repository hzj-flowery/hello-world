local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryGuildDungeonWin = class("SummaryGuildDungeonWin", SummaryBase)

local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentItemInfo = require("app.scene.view.settlement.ComponentItemInfo")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local ComponentDrop = require("app.scene.view.settlement.ComponentDrop")

function SummaryGuildDungeonWin:ctor(battleData, callback)
    self._battleData = battleData

    local list = {}

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = SummaryBase.NORMAL_FIX_X
    local componentLine = ComponentLine.new("txt_sys_reward02", cc.p(midXPos, 253 - height*0.5))
    table.insert(list, componentLine)


    local componentDrop = ComponentDrop.new(self._battleData.awards, cc.p(midXPos, 183 - height*0.5))
    table.insert(list, componentDrop)

    SummaryGuildDungeonWin.super.ctor(self,battleData, callback, list, midXPos, true)
end

function SummaryGuildDungeonWin:onEnter()
    SummaryGuildDungeonWin.super.onEnter(self)
    self:_createAnimation()
end

function SummaryGuildDungeonWin:onExit()
    SummaryGuildDungeonWin.super.onExit(self)
end


function SummaryGuildDungeonWin:_createAnimation()
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_allwin_win", handler(self, self._playWinText), handler(self, self.checkStart) , false )
end

return SummaryGuildDungeonWin