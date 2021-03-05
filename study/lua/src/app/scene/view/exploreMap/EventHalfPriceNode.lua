local ViewBase = require("app.ui.ViewBase")
local EventHalfPriceNode = class("EventHalfPriceNode", ViewBase)

local ExploreDiscover = require("app.config.explore_discover")
-- local ShopRandomItems = require("app.config.shop_random_items")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local scheduler = require("cocos.framework.scheduler")
local UIHelper = require("yoka.utils.UIHelper")
local EventHalfPriceCell = require("app.scene.view.exploreMap.EventHalfPriceCell")
EventHalfPriceNode.ITEM_COUNT = 3

function EventHalfPriceNode:ctor(eventData)
    self._eventData = eventData
    self._configData = ExploreDiscover.get(eventData:getEvent_type())
    self._itemIds = {eventData:getValue1(), eventData:getValue2(), eventData:getValue3()}
    self._cells = {}

    --ui
    self._node1 = nil       --物品节点1
    self._node2 = nil       --物品节点2
    self._node3 = nil       --物品节点3
    -- self._talk = nil        --说话
    self._leftTimeLabel = nil --倒计时


    local resource = {
		file = Path.getCSB("EventHalfPriceNode", "exploreMap"),
        binding = {
        }
	}
	EventHalfPriceNode.super.ctor(self, resource)
end


function EventHalfPriceNode:onCreate()
    self:_setTalk()
    self._leftTimeLabel:setString(G_ServerTime:getLeftSecondsString(self._eventData:getEndTime(), "00:00:00"))
end

function EventHalfPriceNode:onEnter()
    self:_setItem()
    self:_refreshButton()
    self._countDownScheduler = scheduler.scheduleGlobal(handler(self, self._onTimer), 0.5)
end

function EventHalfPriceNode:onExit()
    scheduler.unscheduleGlobal(self._countDownScheduler)
    self._countDownScheduler = nil
end

function EventHalfPriceNode:_setItem()
    for i, v in pairs(self._itemIds) do
        local eventHalfPriceCell = EventHalfPriceCell.new(v, i, handler(self, self._buyItem))
        self["_node"..i]:addChild(eventHalfPriceCell)
        table.insert(self._cells, eventHalfPriceCell)
    end
end

--刷新按钮
function EventHalfPriceNode:_refreshButton()
    --单独判断每一个是否买过
    if self._eventData:getValue4() == 1 then
        self._cells[1]:setHasBuy()
    end
    if self._eventData:getValue5() == 1 then
        self._cells[2]:setHasBuy()
    end
    if self._eventData:getValue6() == 1 then
        self._cells[3]:setHasBuy()
    end
end

--设置说话
function EventHalfPriceNode:_setTalk()
    -- local des = self._configData.description
    -- self._talk:setText(des, 400, true)
end

--购买物品
function EventHalfPriceNode:_buyItem(buyIndex, data)
    local endTime = self._eventData:getEndTime()
    local curTime =  G_ServerTime:getTime()
    if curTime > endTime then
        G_Prompt:showTip(Lang.get("explore_event_time_over"))
        return
    end
    self._buyIndex = buyIndex
    local success = LogicCheckHelper.enoughValue(data.type1, data.value1, data.size1)
    if success then
        G_UserData:getExplore():c2sExploreDoEvent(self._eventData:getEvent_id(), self._buyIndex)
    end
end

--处理事件
function EventHalfPriceNode:doEvent()
    --从新获取data 里面的数据  避免 重连大致的bug
    local eventData = G_UserData:getExplore():getEventById(self._eventData:getEvent_id())
    if not eventData then
        return
    end
    self._eventData = eventData
    if self._buyIndex == 1 then
        eventData:setValue4(1)
    elseif self._buyIndex == 2 then
        eventData:setValue5(1)
    elseif self._buyIndex == 3 then
        eventData:setValue6(1)
    end
    if eventData:getValue4() == 1 and eventData:getValue5() == 1 and eventData:getValue6() == 1 then
        eventData:setParam(1)
		-- G_UserData:getExplore():setEventParamById(self._eventData:getEvent_id(), 1)
    end
    self._cells[self._buyIndex]:setHasBuy()
end

function EventHalfPriceNode:_onTimer()
    self._leftTimeLabel:setString(G_ServerTime:getLeftSecondsString(self._eventData:getEndTime(), "00:00:00"))
end

return EventHalfPriceNode
