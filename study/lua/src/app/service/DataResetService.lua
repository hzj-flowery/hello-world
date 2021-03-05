local BaseService = require("app.service.BaseService")
local TimeConst = require("app.const.TimeConst")
local DataResetService = class("DataResetService",BaseService)

function DataResetService:ctor()
    DataResetService.super.ctor(self)
    self:start()

    self._lastNoticeTimeList = {}
end

function DataResetService:tick()
    --场景检测
    local runningSceneName = display.getRunningScene():getName() 
    if  runningSceneName == "fight" or runningSceneName == "login" then
        return
    end
    local loginTime = G_UserData:getBase():getOnline_time_update_time()
    if loginTime <= 0 then
        return 
    end
    local time = G_ServerTime:getTime()
    for k,v in ipairs(TimeConst.RESET_TIME_LIST) do
        self._lastNoticeTimeList[k] = self._lastNoticeTimeList[k] or loginTime
        local expired = G_ServerTime:isTimeExpired(self._lastNoticeTimeList[k] or 0,v)
        if expired then
            self._lastNoticeTimeList[k] = time
            G_SignalManager:dispatch(SignalConst.EVENT_COMMON_ZERO_NOTICE,v)
            print("------------------------------------------DataResetService:EVENT_COMMON_ZERO_NOTICE")
        end
    end
end



return DataResetService

