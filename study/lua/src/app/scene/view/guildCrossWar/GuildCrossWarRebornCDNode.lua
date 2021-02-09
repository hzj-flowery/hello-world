--跨服重生倒计时
local ViewBase = require("app.ui.ViewBase")
local GuildCrossWarRebornCDNode = class("GuildCrossWarRebornCDNode", ViewBase)
local GuildCrossWarConst = require("app.const.GuildCrossWarConst")
function GuildCrossWarRebornCDNode:ctor()
    self._panelShadow = nil
    self._text1 = nil
    self._text2 = nil
    self._textTime = nil
    self._countDown = false
    local resource = {
        file = Path.getCSB("GuildCrossWarRebornCDNode", "guildCrossWar"),
    
    }
    GuildCrossWarRebornCDNode.super.ctor(self, resource)
end

function GuildCrossWarRebornCDNode:onCreate()
    local size = G_ResolutionManager:getDesignSize()
    self._panelShadow:setContentSize(cc.size(size[1], size[2]))
    self._panelShadow:setSwallowTouches(true)
end

function GuildCrossWarRebornCDNode:onEnter()
end

function GuildCrossWarRebornCDNode:onExit()
end

function GuildCrossWarRebornCDNode:isInReborn()
    return self._countDown
end

function GuildCrossWarRebornCDNode:startCD(...)
    -- body
    self:setVisible(true)
    self._countDown = true
end
function GuildCrossWarRebornCDNode:refreshCdTimeView(finishCall)
    if self._countDown == false then
        return
    end
    
    local selfUnit = G_UserData:getGuildCrossWar():getSelfUnit()
    if selfUnit then
        local rebornTime = selfUnit:getRevive_time()
        local curTime = G_ServerTime:getTime()

        if curTime <= rebornTime then
            local leftTime = rebornTime - curTime
            self._textTime:setString(leftTime)
        else
            self._textTime:setString(" ")
            self:setVisible(false)
            self._countDown = false
            if finishCall then
                finishCall()
            end
        end
    end
    return true
end

function GuildCrossWarRebornCDNode:updateVisible()
    local selfUnit = G_UserData:getGuildCrossWar():getSelfUnit()
    if selfUnit then
        local isInBorn = (selfUnit:getCurrState() == GuildCrossWarConst.UNIT_STATE_DEATH)
        self:setVisible(isInBorn)
    end
end

return GuildCrossWarRebornCDNode
