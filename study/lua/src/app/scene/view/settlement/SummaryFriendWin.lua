local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryFriendWin = class("SummaryFriendWin", SummaryBase)

-- local ComponentDrop = require("app.scene.view.settlement.ComponentDrop")
-- local TypeConvertHelper = require("app.utils.TypeConvertHelper")
-- local DataConst = require("app.const.DataConst")
-- local DropHelper = require("app.utils.DropHelper")

-- local ComponentLine = require("app.scene.view.settlement.ComponentLine")
-- local ComponentItemInfo = require("app.scene.view.settlement.ComponentItemInfo")
local ComponentBattleDesc = require("app.scene.view.settlement.ComponentBattleDesc")
-- local ComponentRankChange = require("app.scene.view.settlement.ComponentRankChange")

function SummaryFriendWin:ctor(battleData, callback)
    local list = {}

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = SummaryBase.NORMAL_FIX_X

    local componentBattleDesc = ComponentBattleDesc.new(battleData, cc.p(midXPos, 308 - height*0.5))
    table.insert(list, componentBattleDesc)  
    SummaryFriendWin.super.ctor(self,battleData, callback, list, midXPos, true)
end

function SummaryFriendWin:onEnter()
    SummaryFriendWin.super.onEnter(self)
    self:_createAnimation()
end

function SummaryFriendWin:onExit()
    SummaryFriendWin.super.onExit(self)
end

function SummaryFriendWin:_createAnimation()
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_jwin_2", handler(self, self._playWinText), handler(self, self.checkStart) , false )    
end

return SummaryFriendWin