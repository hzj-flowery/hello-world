--聊天消息容器
local ViewBase = require("app.ui.ViewBase")
local ChatConst = require("app.const.ChatConst")
local ChatMiniMsgScrollView = class("ChatMiniMsgScrollView",ViewBase)

function ChatMiniMsgScrollView:ctor(mainView,listSize,channelId,maxShowCount,dataList,template,itemGap)
     ChatMiniMsgScrollView.super.ctor(self)
    self._mainView = mainView
	self._dataList = dataList
	self._listSize = listSize
    self._channelId = channelId
	self._showItems = {}
	self._scrollView = nil
    self._maxShowCount = maxShowCount
    self._template = template
    self._itemGap = itemGap or 6--消息之间的间距
    self._enableScrollToLatestMsg = true
	self:_initUI()
end

function ChatMiniMsgScrollView:_createTemplate(...)
    local param = {...}
    local ChatMsgItemCell = self._template or  require("app.scene.view.chat.ChatMsgItemCell")
    local view = ChatMsgItemCell.new(unpack(param))
    return view
end

---添加新的信息
function ChatMiniMsgScrollView:addNewMsg(chatMsgUnit)
    
    if #self._showItems == self._maxShowCount then--数据已在Data里面处理过，所以此处如果是最大数量的话。说明需要删掉旧的一条。
        local lastItem = table.remove(self._showItems, 1)
		lastItem:removeFromParent()
    end
	local item = self:_createTemplate(chatMsgUnit)
    if item:getParent() == nil then --如果没添加，则添加新消息。
        self._scrollView:addChild(item)
    end
    self._showItems[#self._showItems + 1] = item


    local lastY = self._scrollView:getInnerContainer():getPositionY()


	self:_refreshItemsPos()

    
    if not self._enableScrollToLatestMsg and lastY < 0 then--维持位置
        local size = self._scrollView:getInnerContainer():getContentSize()
        local y = lastY - item:getTotalHeight() - self._itemGap
        y = math.min(y,0)
        y = math.max(y,-(size.height - self._listSize.height))
        self._scrollView:getInnerContainer():setPositionY(y)
    else
        self._scrollView:jumpToBottom()
    end

end

function ChatMiniMsgScrollView:_initUI()
	----滑动条
    self._scrollView = ccui.ScrollView:create()
    self._scrollView:setClippingType(1)
    self._scrollView:setBounceEnabled(false)
    self._scrollView:setDirection(ccui.ScrollViewDir.vertical)
    self._scrollView:setTouchEnabled(false)
    self._scrollView:setScrollBarEnabled(false)
    self._scrollView:setPosition(cc.p(0,0))
    self._scrollView:setInnerContainerSize(cc.size(self._listSize.width, self._listSize.height))
    self:addChild(self._scrollView)

    self:refreshData(self._dataList)
end


---聊天信息位置设置
function ChatMiniMsgScrollView:_refreshItemsPos()
    --保存滚动位置
	local currentHeigth = 0
    for i = #self._showItems, 1, -1 do
    	local item = self._showItems[i]
    	item:setPosition(0, currentHeigth)
    	currentHeigth = currentHeigth + item:getTotalHeight() +  (i == 1 and 0 or self._itemGap)
    end

    local finalHeight = currentHeigth > self._listSize.height and self._listSize.height or currentHeigth

    self._scrollView:setBounceEnabled(currentHeigth > self._listSize.height)
    self._scrollView:setInnerContainerSize(cc.size(self._listSize.width, currentHeigth))
    self._scrollView:setContentSize(cc.size(self._listSize.width, finalHeight))

    if currentHeigth < self._listSize.height then
    	--消息小于一屏的时候重新排列
    	local placePosY = 0
    	for i = 1, #self._showItems do
    		local item = self._showItems[i]
    		item:setPosition(0, self._listSize.height - item:getTotalHeight() + placePosY)
    		placePosY = - item:getTotalHeight() - self._itemGap + placePosY
    	end
    	self._scrollView:setContentSize(cc.size(self._listSize.width, self._listSize.height))
    end
end


function ChatMiniMsgScrollView:refreshData(newNsgList)
    self._scrollView:removeAllChildren()
    self._dataList = newNsgList
	self._showItems = {}
    for i = 1, #self._dataList do
    	local data = self._dataList[i]
    	local item = self:_createTemplate(data, self._listSize.width)
        if item:getParent() == nil then --如果没添加，则添加新消息。
            self._scrollView:addChild(item)
        end
    	self._showItems[#self._showItems + 1] = item
    end
    self:_refreshItemsPos()

    if self._enableScrollToLatestMsg then
        self._scrollView:jumpToBottom()
    end

end

function ChatMiniMsgScrollView:enableScroll()
    self._scrollView:setTouchEnabled(true)
    self._scrollView:setScrollBarEnabled(true)
end

function ChatMiniMsgScrollView:enableScrollToLatestMsg(enable)
    self._enableScrollToLatestMsg = enable
end

function ChatMiniMsgScrollView:readAllMsg()
    self._scrollView:jumpToBottom()
end

return ChatMiniMsgScrollView
