local BaseService = require("app.service.BaseService")
local OnlineTimeService = class("OnlineTimeService",BaseService)


function OnlineTimeService:ctor()
    OnlineTimeService.super.ctor(self)
    self._isNoticeRealName = false
    self:start()
end

function OnlineTimeService:initData()
    local refreshTime = G_ServerTime:secondsFromZero() + 86400      --第二天零点
    G_ServiceManager:registerOneAlarmClock("onLineRefreshTime", refreshTime, function()
        G_UserData:getBase():c2sGetTotalOnlineTime()
    end)

end

function OnlineTimeService:clear()
    self._isNoticeRealName = false
end

function OnlineTimeService:tick()

    if G_GameAgent:isRealName() then
        return 
    end

    if not G_ConfigManager:isAvoidHooked() then --如果后台没有开启防沉迷，返回
        return 
    end

    if self._isNoticeRealName then 
        return 
    end
    
    local canPlay = G_UserData:getBase():checkRealName()
    if not canPlay then 
        self._isNoticeRealName = true
    end 
end

return OnlineTimeService