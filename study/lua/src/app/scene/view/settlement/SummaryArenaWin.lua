local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryArenaWin = class("SummaryArenaWin", SummaryBase)

-- local ComponentDrop = require("app.scene.view.settlement.ComponentDrop")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local DropHelper = require("app.utils.DropHelper")

local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentItemInfo = require("app.scene.view.settlement.ComponentItemInfo")
local ComponentBattleDesc = require("app.scene.view.settlement.ComponentBattleDesc")
local ComponentRankChange = require("app.scene.view.settlement.ComponentRankChange")

function SummaryArenaWin:ctor(battleData, callback)
    local list = {}

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = SummaryBase.NORMAL_FIX_X

    if battleData.oldRank ~=  battleData.newRank then   --有名次变化板子
        local componentBattleDesc = ComponentBattleDesc.new(battleData, cc.p(midXPos, 308 - height*0.5))
        table.insert(list, componentBattleDesc)  

        local componentLine = ComponentLine.new("txt_sys_mingcitisheng01", cc.p(midXPos, 260 - height*0.5))
        table.insert(list, componentLine)

        local oldRankDesc = battleData.oldRank
        if battleData.oldRank == 0 then
            oldRankDesc = Lang.get("arena_rank_zero")
        end
        
        local componentRankChange = ComponentRankChange.new(oldRankDesc, battleData.newRank, cc.p(midXPos, 213 - height*0.5))
        table.insert(list, componentRankChange)

        local componentLine = ComponentLine.new("txt_sys_reward02", cc.p(midXPos, 168 - height*0.5))
        table.insert(list, componentLine)

        for i = 1, 2 do 
            local componentItemInfo = ComponentItemInfo.new(battleData.awards[i], cc.p(midXPos, 140 - height*0.5 - 40 * i))
            table.insert(list, componentItemInfo)

            for _, v in pairs(battleData.addAwards) do
                if v.award.type == battleData.awards[i].type and v.award.value == battleData.awards[i].value then
                    componentItemInfo:updateCrit(v.index, v.award.size)
                    break
                end   
            end
        end
    else
        local componentBattleDesc = ComponentBattleDesc.new(battleData, cc.p(midXPos, 290 - height*0.5))
        table.insert(list, componentBattleDesc)

        local componentLine = ComponentLine.new("txt_sys_reward02", cc.p(midXPos, 229 - height*0.5))
        table.insert(list, componentLine)

        for i = 1, 2 do 
            local componentItemInfo = ComponentItemInfo.new(battleData.awards[i], cc.p(midXPos, 201 - height*0.5 - 40 * i))
            table.insert(list, componentItemInfo)
        end
    end

    SummaryArenaWin.super.ctor(self, battleData, callback, list, midXPos, true)
end

function SummaryArenaWin:onEnter()
    SummaryArenaWin.super.onEnter(self)
    self:_createAnimation()

end

function SummaryArenaWin:onExit()
    SummaryArenaWin.super.onExit(self)
end

function SummaryArenaWin:_createAnimation()
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_jwin_2", handler(self, self._playWinText), handler(self, self.checkStart) , false )    
end

return SummaryArenaWin