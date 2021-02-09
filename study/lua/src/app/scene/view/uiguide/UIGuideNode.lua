local ViewBase = require("app.ui.ViewBase")
local UIGuideNode = class("UIGuideNode", ViewBase)


function UIGuideNode:ctor(uiGuideUnitData )
    self._uiGuideUnitData = uiGuideUnitData 
    self._startTime = 0
    self._endTime = 0
    UIGuideNode.super.ctor(self)
end


function UIGuideNode:onCreate()
end

function UIGuideNode:onEnter()
    logWarn("UIGuideNode enter start")
    local cfg = self._uiGuideUnitData:getConfig()
    local hasCdTime = cfg.cd_min > 0 
    if hasCdTime then
        self:_startRefreshHandler()   

        self._startTime = 0
        self._endTime = 0

        self:_resetCD()
        
        self:_visibleChildren(false)
    end   
    logWarn("UIGuideNode enter end")
end

function UIGuideNode:onExit()
    logWarn("UIGuideNode exit start")
    self:_endRefreshHandler()
    logWarn("UIGuideNode exit end")
end

function UIGuideNode:_startRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),1)
end

function UIGuideNode:_endRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end

function UIGuideNode:_isGuideVisible()
    local time = G_ServerTime:getTime()
    if time >= self._startTime and time <= self._endTime then
        return true
    else
        return false
    end
end


function UIGuideNode:_resetCD()
    local time = G_ServerTime:getTime()
    local cfg = self._uiGuideUnitData:getConfig()
    if time > self._endTime then
        self._startTime = time + math.random(cfg.cd_min,cfg.cd_max)
        self._endTime = self._startTime + math.random(cfg.time_min,cfg.time_max)
    end
end


function UIGuideNode:_onRefreshTick(dt)
    local visible = self:_isGuideVisible()
    self:_visibleChildren(visible)
    self:_resetCD()
end

function UIGuideNode:_visibleChildren(visible)
    local children = self:getChildren()
    for k,v in ipairs(children) do
        v:setVisible(visible)
    end
end


return UIGuideNode