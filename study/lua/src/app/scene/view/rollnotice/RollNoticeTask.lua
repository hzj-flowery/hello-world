local RollNoticeTask = class("RollNoticeTask")

function RollNoticeTask:ctor(name,filterList,notRunSelf)
	self._name = name
	self._filterList = filterList or {}
	self._notRunSelf = notRunSelf
	self._pause = false
	self._stop = false
end

function RollNoticeTask:start( ... )
	self._stop = false
end

function RollNoticeTask:isExistEffect(id)
    if type(id) ~= "number" then
        return ""
    end
    local PaoMaDeng = require("app.config.paomadeng")
    local cfg = PaoMaDeng.get(id)
    return cfg.if_team_display
end

function RollNoticeTask:canReceiveNotice(value)
	if self._stop then--任务停止了，不接受任何通知
		return false
	end

	if value == nil or type(value) ~= "table" then return false end
	if table.indexof(self._filterList,value.noticeType) ~= false then
		return false
	end
	return true
end

function RollNoticeTask:canRunNotice(value)
	local isSelf =  value.sendId and G_UserData:getBase():getId() == value.sendId --自己不用显示
	local notRun = self._notRunSelf and isSelf == true 
	if notRun then
		return false
	end
	return not self._pause and self:canReceiveNotice(value)
end

function RollNoticeTask:stop( ... )
	self._stop = true
end

function RollNoticeTask:pause( ... )
	self._pause = true
end

function RollNoticeTask:resume( ... )
	self._pause = false
end

function RollNoticeTask:clear( ... )
	self:stop()
end

function RollNoticeTask:getName()
	return self._name 
end

return RollNoticeTask
