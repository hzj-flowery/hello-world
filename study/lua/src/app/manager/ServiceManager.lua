local ServiceManager = class("ServiceManager")
local scheduler = require("cocos.framework.scheduler")

function ServiceManager:ctor()
    self._serviceList = {}
    self:registerService("CustomActivityService",require("app.service.CustomActivityService").new())
    self:registerService("ActivityService",require("app.service.ActivityService").new())
    self:registerService("Day7ActivityService",require("app.service.Day7ActivityService").new())
    self:registerService("RecruitService", require("app.service.RecruitService").new())
    self:registerService("TerritoryService", require("app.service.TerritoryService").new())
    self:registerService("ShopService", require("app.service.ShopService").new())
    self:registerService("DataResetService", require("app.service.DataResetService").new())
	self:registerService("AlarmClockService", require("app.service.AlarmClockService").new())
    self:registerService("MailDeleteService", require("app.service.MailDeleteService").new())
    self:registerService("GuildService", require("app.service.GuildService").new())
    self:registerService("ChapterDataService", require("app.service.ChapterDataService").new())
    self:registerService("MineDataService", require("app.service.MineDataService").new())

    --没有实名认证，并且开启了实名认证或者防沉迷
    if not G_GameAgent:isRealName() then    
        self:registerService("OnlineTimeService", require("app.service.OnlineTimeService").new())
    end


  --  self:registerService("IndulgeService", require("app.service.IndulgeService").new())

end

function ServiceManager:start()

	--重置service的一些数据
	for k,v in pairs(self._serviceList) do
		v:initData()
	end
   	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._tickHandler ~= nil then
        return
	end
	self._tickHandler = SchedulerHelper.newSchedule(handler(self,self._tick),1)
    self:_tick()
end

function ServiceManager:_tick()
    if not G_NetworkManager:isConnected() then
        return
    end

   -- logWarn("------------ServiceManager.tick")

    for k,v in pairs(self._serviceList) do
        if v:isStart() then
            v:tick()
        end
    end
end

function ServiceManager:registerService(name,service)
    self._serviceList[name] = service
end

function ServiceManager:removeService(name)
    local service = self._serviceList[name]
    if service then
        service:clear()
        self._serviceList[name] = nil
    end
end

function ServiceManager:getService(name)
    return self._serviceList[name]
end

function ServiceManager:stop()
    local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._tickHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._tickHandler)
		self._tickHandler = nil
	end
	--添加一个清理的函数 清理service残留数据
	for k,v in pairs(self._serviceList) do
    	v:clear()
    end
end


--注册一个闹钟
function ServiceManager:registerOneAlarmClock(tag, time, callback)
	local alarmClock = self._serviceList["AlarmClockService"]
	if alarmClock then
		alarmClock:registerAlarmClock(tag, time, callback)
	end
end

--删除一个闹钟
function ServiceManager:DeleteOneAlarmClock(tag)
	local alarmClock = self._serviceList["AlarmClockService"]
	if alarmClock then
		alarmClock:deleteAlarmClock(tag)
	end
end

return ServiceManager
