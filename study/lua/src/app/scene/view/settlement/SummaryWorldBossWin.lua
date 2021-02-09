local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryWorldBossWin = class("SummaryWorldBossWin", SummaryBase)

local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentDamage = require("app.scene.view.settlement.ComponentDamage")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local DropHelper = require("app.utils.DropHelper")

function SummaryWorldBossWin:ctor(battleData, callback)

    local list = {}

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = SummaryBase.NORMAL_FIX_X

    local componentLine = ComponentLine.new("txt_sys_reward02", cc.p(midXPos, 253 - height*0.5))
    table.insert(list, componentLine)

    local richText = Lang.get("worldboss_fight_grob_point", { num = battleData.point})
    local componentDamage = ComponentDamage.new(nil, cc.p(midXPos, 183 - height*0.5) , richText)
    table.insert(list, componentDamage)
   
    SummaryWorldBossWin.super.ctor(self,battleData, callback, list, midXPos, true)
end

function SummaryWorldBossWin:onEnter()
    SummaryWorldBossWin.super.onEnter(self)
    self:_createAnimation()
end

function SummaryWorldBossWin:onExit()
    SummaryWorldBossWin.super.onExit(self)
end

function SummaryWorldBossWin:_createAnimation()
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_allwin_win", handler(self, self._playWinText), handler(self, self.checkStart) , false )
end

return SummaryWorldBossWin