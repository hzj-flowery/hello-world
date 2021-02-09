local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryCountryBossInterceptWin = class("SummaryCountryBossInterceptWin", SummaryBase)

local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentDamage = require("app.scene.view.settlement.ComponentDamage")

function SummaryCountryBossInterceptWin:ctor(battleData, callback)

    local list = {}

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = SummaryBase.NORMAL_FIX_X

	local componentLine = ComponentLine.new("country_boss_intercept_success", cc.p(midXPos, 253 - height*0.5 - 60))
	table.insert(list, componentLine)

    SummaryCountryBossInterceptWin.super.ctor(self,battleData, callback, list, midXPos, true)
end

function SummaryCountryBossInterceptWin:onEnter()
    SummaryCountryBossInterceptWin.super.onEnter(self)
    self:_createAnimation()
end

function SummaryCountryBossInterceptWin:onExit()
    SummaryCountryBossInterceptWin.super.onExit(self)
end

function SummaryCountryBossInterceptWin:_createAnimation()
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_allwin_win", handler(self, self._playWinText), handler(self, self.checkStart) , false )
end

return SummaryCountryBossInterceptWin
