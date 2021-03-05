local ViewBase = require("app.ui.ViewBase")
local EventBoxNode = class("EventBoxNode", ViewBase)

local ExploreDiscover = require("app.config.explore_discover")
local SchedulerHelper = require "app.utils.SchedulerHelper"

function EventBoxNode:ctor(eventData)
    self._eventData = eventData
    self._configData = ExploreDiscover.get(eventData:getEvent_type())
    self._scheduleHandler = nil
    self._finishTime = self._eventData:getValue2() + self._configData.time
    self._canOpenBox = false

    --ui
    self._talkNode = nil            --说话节点
    self._rewards = nil             --奖励节点数组
    self._reward1 = nil             --显示奖励1
    self._reward2 = nil             --显示奖励2
    self._reward3 = nil             --显示奖励3
    self._rewrad4 = nil             --显示奖励4
    self._textTime = nil            --倒计时
    self._btnBox = nil              --宝箱按钮
    self._textAfter = nil           --后可开启
    local resource = {
		file = Path.getCSB("EventBoxNode", "exploreMap"),
        binding = {
            _btnBox = {
				events = {{event = "touch", method = "_onBoxClick"}}
			},
        }
	}
	EventBoxNode.super.ctor(self, resource)
end

function EventBoxNode:onCreate()
    self._rewards = {self._reward1, self._reward2, self._reward3, self._reward4}
end

function EventBoxNode:onEnter()
    self:_setTalk()
    self:_showItem()
    self:_refreshBoxTime()
    self:_refreshBoxState()
	self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._update), 0.5)
end

function EventBoxNode:onExit()
	if self._scheduleHandler then
		SchedulerHelper.cancelSchedule(self._scheduleHandler)
	end
	self._scheduleHandler = nil
end

function EventBoxNode:_setTalk()
    local textTalk = self._configData.description
    self._talkNode:setText(textTalk, 300, true)
end

function EventBoxNode:_refreshBoxTime()
    local str = G_ServerTime:getLeftSecondsString(self._finishTime)
    if str == "-" then
        self._canOpenBox = true
        self._imageLight:setVisible(false)
        self._textAfter:setVisible(false)
        self._textTime:setVisible(false)
    else
        self._textTime:setString(str)
        self._canOpenBox = false
    end
end

function EventBoxNode:_refreshBoxState()
    if self._eventData:getParam() == 1 then
        self._btnBox:setTouchEnabled(false)
    end
end

--更新
function EventBoxNode:_update(dt)
    self:_refreshBoxTime()
end

--处理可能获得
function EventBoxNode:_showItem()
    for i = 1, 4 do
        self._rewards[i]:initUI(self._configData["drop"..i.."_type"], self._configData["drop"..i.."_id"])
    end
end

--点击宝箱事件
function EventBoxNode:_onBoxClick()
    if self._canOpenBox then
        G_UserData:getExplore():c2sExploreDoEvent(self._eventData:getEvent_id())
    end
end

--处理事件
function EventBoxNode:doEvent()
    -- self._eventData:setParam(1)
	G_UserData:getExplore():setEventParamById(self._eventData:getEvent_id(), 1)
    self:_refreshBoxState()
end

return EventBoxNode
