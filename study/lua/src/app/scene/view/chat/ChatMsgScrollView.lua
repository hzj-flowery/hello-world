--聊天消息容器
local ViewBase = require("app.ui.ViewBase")
local ChatConst = require("app.const.ChatConst")
local ChatMsgScrollView = class("ChatMsgScrollView", ViewBase)

function ChatMsgScrollView:ctor(mainView,listSize,channelId,maxShowCount,dataList,template,itemGap)
     ChatMsgScrollView.super.ctor(self)

    self._mainView = mainView
    self._listSize = listSize
    self._channelId = channelId
    self._maxShowCount = maxShowCount
    self._dataList = self:clone(dataList)
	self._showItems = {}
	self._scrollView = nil
    self._template = template
    self._itemGap = itemGap or 14--消息之间的间距
    self._lastScrollX = nil--用来在滚动时判断
    self._isUserCanSee = false
	self:_initUI()

   
end

function ChatMsgScrollView:clone(src)
    local list = {}
    for k,v in ipairs(src) do
        table.insert( list, v)
    end
    return list
end

function ChatMsgScrollView:_createTemplate(...)
    local param = {...}
    local ChatMsgItemCell = self._template or  require("app.scene.view.chat.ChatMsgItemCell")
    if param[1]:getSysMsg() ~= nil then
        ChatMsgItemCell = require("app.scene.view.chat.ChatSystemMsgItemCell")
    end

    

    local view = ChatMsgItemCell.new(unpack(param))
    return view
end

---添加新的信息
function ChatMsgScrollView:addNewMsg(chatMsgUnit,isChannelVisible)
    logWarn("on add msg "..#self._dataList.." "..self._maxShowCount)
    if #self._showItems == self._maxShowCount then--数据已在Data里面处理过，所以此处如果是最大数量的话。说明需要删掉旧的一条。
        local lastItem = table.remove(self._showItems, 1)
		lastItem:removeFromParent()
         table.remove(self._dataList, 1)
    end
    table.insert( self._dataList, chatMsgUnit )
	local item = self:_createTemplate(chatMsgUnit, self._listSize.width)
    if item:getParent() == nil then --如果没添加，则添加新消息。
        self._scrollView:addChild(item)
    end
    self._showItems[#self._showItems + 1] = item

    local lastY = self._scrollView:getInnerContainer():getPositionY()
	self:_refreshItemsPos()

    local size = self._scrollView:getInnerContainer():getContentSize()
    local maxY = 0
    local minY = -(size.height - self._listSize.height)
    local y = lastY - item:getTotalHeight() - self._itemGap
    y = math.min(y,maxY)
    y = math.max(y,minY)

    self._scrollView:getInnerContainer():setPositionY(y)

    local isBottom = lastY >= 0
    --当前显示此频道并滚动到最底部，或自己发送消息
    if (isChannelVisible and isBottom) or chatMsgUnit:getSender():isSelf() then
        self._scrollView:jumpToBottom()
        self:_setVisibleMsgReaded()
    elseif isChannelVisible then    
        self:readMsgsInScreen()
    end
    --[[
    --自己发言
    if chatMsgUnit:getSender():isSelf() then
        --刷到最底部
        self._scrollView:jumpToBottom()
        self:_setVisibleMsgReaded()
    elseif isChannelVisible then
         --如果页面可见,一屏幕之内消息设置全已读
         self:readMsgsInScreen()
    end
]]
end

function ChatMsgScrollView:_initUI()
	----滑动条
    self._scrollView = ccui.ScrollView:create()
    self._scrollView:setBounceEnabled(false)
    self._scrollView:setDirection(ccui.ScrollViewDir.vertical)
    self._scrollView:setTouchEnabled(true)
    self._scrollView:setScrollBarEnabled(false)
    self._scrollView:addEventListener(handler(self,self._scrollEventCallback))
    self._scrollView:setPosition(cc.p(0,0))
    self._scrollView:setInnerContainerSize(cc.size(self._listSize.width, self._listSize.height))
    self:addChild(self._scrollView)

    self:refreshData(self._dataList)
end

---位置刷新
function ChatMsgScrollView:_refreshItemsPos()
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

function ChatMsgScrollView:refreshData(newNsgList,scrollToBottom)
    self._scrollView:removeAllChildren()
    self._dataList = self:clone(newNsgList)
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

    if scrollToBottom then
         self:readAllMsg()
    else
        self:_skipToUnReadPos()
    end

end

function ChatMsgScrollView:_skipToUnReadPos()
    local firstUnReadedMsgPosIndex = 0
    for i = 1, #self._dataList do
    	local data = self._dataList[i]
        if data:getStatus() == ChatConst.MSG_STATUS_UNREAD then
			firstUnReadedMsgPosIndex = i
            break
		end
    end
   local lastReadedMsgPosIndex = 0--最后一条已读消息位置
   if firstUnReadedMsgPosIndex == 0 then
        lastReadedMsgPosIndex = #self._dataList
   else
        lastReadedMsgPosIndex = firstUnReadedMsgPosIndex-1  
   end
   if lastReadedMsgPosIndex ~= 0 then
        local itemBottonY = self:_findItemPosition(lastReadedMsgPosIndex)--底部位置
        local size = self._scrollView:getInnerContainer():getContentSize()
        local y = -(size.height - itemBottonY)
        local maxY = 0
        local minY = -(size.height - self._listSize.height)
        y = math.min(y,maxY)
        y = math.max(y,minY)
        self._scrollView:getInnerContainer():setPositionY(y)
    else
        local size = self._scrollView:getInnerContainer():getContentSize()
        local minY = -(size.height - self._listSize.height)
        self._scrollView:getInnerContainer():setPositionY(minY)    
    end
end


function ChatMsgScrollView:_scrollEventCallback(sender, eventType)
    if not self._isUserCanSee then
        return
    end
    if eventType == ccui.ScrollviewEventType.scrollToLeft then
    elseif eventType == ccui.ScrollviewEventType.scrollToRight then
    elseif eventType == ccui.ScrollviewEventType.scrollToBottom then
    elseif eventType == ccui.ScrollviewEventType.scrolling then
    elseif eventType == ccui.ScrollviewEventType.containerMoved then
       local time = G_ServerTime:getTime()
        if self._lastScrollX == nil or time-self._lastScrollX > 0.1 then
            self._lastScrollX = time
            self:_setVisibleMsgReaded()
        end


    elseif eventType == ccui.ScrollviewEventType.autoscrollEnded then
       self:_setVisibleMsgReaded()
    end
end

function ChatMsgScrollView:_setVisibleMsgReaded()
    local y = self._scrollView:getInnerContainer():getPositionY()
    local size = self._scrollView:getInnerContainer():getContentSize()
    local showHeight = size.height + y
    local maxIndex = self:_getMaxIndexInLengthRange(showHeight)
    if maxIndex then
        self:_readMsgsBeforeIndex(maxIndex)
    end
end

function ChatMsgScrollView:_findItemPosition(index)
    local placePosY = 0
    for i = 1, index, 1 do
    	local item = self._showItems[i]
    	placePosY =  item:getTotalHeight() + placePosY
        if i ~= index then
            placePosY = placePosY + self._itemGap
        end
    end
    return placePosY
end

--@return：找不到返回nil
function ChatMsgScrollView:_getMaxIndexInLengthRange(height)
    local maxIndex = nil
    local placePosY = 0
    for i = 1, #self._showItems do
        local item = self._showItems[i]
        --当前Item的头部位置placePosY
         if placePosY + 26 >= height then--至少漏出40像素才算看到
            maxIndex = i-1
            break
        end
        placePosY =  item:getTotalHeight() + self._itemGap + placePosY
    end
    if not maxIndex then
        maxIndex = #self._showItems
    end
    if maxIndex <= 0 then
        return nil
    end
    return maxIndex
end

function ChatMsgScrollView:_readMsgsBeforeIndex(maxIndex)
    local chatMsgList  = {}
    for k,v in ipairs(self._dataList) do
        if k <= maxIndex and v:getStatus() == ChatConst.MSG_STATUS_UNREAD  then
            table.insert(chatMsgList,v)
        end
    end
    logWarn(" -----------")
    G_UserData:getChat():readChatMsgDatas(chatMsgList)
    logWarn(" -----------")

end

function ChatMsgScrollView:readMsgsInScreen()
    local showHeight = self._listSize.height
    local maxIndex = self:_getMaxIndexInLengthRange(showHeight)
    if maxIndex then
        self:_readMsgsBeforeIndex(maxIndex)
    end
end

function ChatMsgScrollView:readAllMsg()
    self._scrollView:jumpToBottom()
    self:_setVisibleMsgReaded()
end

function ChatMsgScrollView:setChannelVisible(visible)
    self._isUserCanSee = visible
end

function ChatMsgScrollView:getChatMsgList()
    return self._dataList
end

return ChatMsgScrollView
