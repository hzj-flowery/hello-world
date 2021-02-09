
local ViewBase = require("app.ui.ViewBase")
local GuildWarRebornCDNode = class("GuildWarRebornCDNode", ViewBase)

function GuildWarRebornCDNode:ctor()
    self._panelShadow = nil
    self._text1 = nil
    self._text2 = nil
    self._textTime = nil
    self._countDown = false
	local resource = {
		file = Path.getCSB("GuildWarRebornCDNode", "guildwarbattle"),

	}
	GuildWarRebornCDNode.super.ctor(self, resource)
end

function GuildWarRebornCDNode:onCreate()
    local size = G_ResolutionManager:getDesignSize()
    self._panelShadow:setContentSize(cc.size(size[1],size[2]))
end

function GuildWarRebornCDNode:onEnter()
end

function GuildWarRebornCDNode:onExit()
end

function GuildWarRebornCDNode:startCountdown()
    local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),1)

    self:_onRefreshTick()
end

function GuildWarRebornCDNode:stopCountdown()
    local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end

function GuildWarRebornCDNode:_onRefreshTick(dt)
    self:refreshCdTimeView()
end

function GuildWarRebornCDNode:startCD( ... )
    -- body
    self:setVisible(true)
    self._countDown = true
end
function GuildWarRebornCDNode:refreshCdTimeView(cityId, finishCall) 
    if self._countDown == false then
        return
    end

    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(cityId)
    local rebornTime = guildWarUser:getRelive_time()
    local curTime = G_ServerTime:getTime()
    if curTime <= rebornTime  then
        self._textTime:setString(tostring(rebornTime-curTime))
    else
        self._textTime:setString("0")
        self:setVisible(false)
        self._countDown = false
        if finishCall then
            finishCall()
        end
    end
    return true

end

function GuildWarRebornCDNode:updateVisible(cityId) 
    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(cityId)
    local isInBorn = guildWarUser:isInBorn()
    self:setVisible(isInBorn)
end

return GuildWarRebornCDNode