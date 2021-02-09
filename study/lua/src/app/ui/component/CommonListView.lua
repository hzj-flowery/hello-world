local CommonListView = class("CommonListView")
local scheduler = require("cocos.framework.scheduler")


local EXPORTED_METHODS = {
    "setTemplate",
    "resize",
    "setCallback",
    "setCustomCallback",
	"adaptWithContainerSize",
	"getItems",
	"clearAll",
	"updateCellNums",
	"forceUpdate",
    "setScrollDuration",
    "setMagneticType",
    "setGravity",
    "jumpToPercentHorizontal",
}

--
function CommonListView:ctor()
	self._target = nil
	self._textTitle = nil
	self._btnClose = nil
end

--
function CommonListView:_init()
	self._spawnCount = 0
	self._items = {}
	self._spacing = self._target:getItemsMargin()
	local size = self._target:getContentSize()
	self._listViewHeight = size.height
	self._listViewWidth = size.width
	self._direction = self._target:getDirection()
end

function CommonListView:getItems()
	return self._items
end
--
function CommonListView:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
	self._target:setScrollBarEnabled(false)
end

--
function CommonListView:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonListView:setCallback(update, selected, scrollEvent)
	self._updateItemCallback = update
	self._selectedCallback = selected
	self._scrollEvent = scrollEvent
end

--
function CommonListView:setCustomCallback(callback)
	self._customCallback = callback
end

--
function CommonListView:setTemplate(template, itemWidth, itemHeight)
	self._template = template
	local widget = template.new()
	self._target:setItemModel(widget)
	
	local size = widget:getContentSize()
	self._templateWidth = itemWidth or size.width
	self._templateHeight = itemHeight or size.height
	--
	if self._direction == ccui.ListViewDirection.vertical then
		self._bufferZone = self._templateHeight + self._spacing
		-- print("1112233 buff height = ", self._bufferZone)
	elseif self._direction == ccui.ListViewDirection.horizontal then
		self._bufferZone = self._templateWidth + self._spacing
	end
	self._updateTimer = 0
	self._lastContentPos = 0
	--self._target:setScrollBarPositionFromCorner(cc.p(7,7))
end

--
function CommonListView:resize(size, exCount)
	self._totalCount = size
	local exCount = exCount or 2
	-- 计算cell创建的数量
	if self._direction == ccui.ListViewDirection.vertical then
		self._spawnCount = math.ceil(self._listViewHeight / self._templateHeight) + exCount
	elseif self._direction == ccui.ListViewDirection.horizontal then
		self._spawnCount = math.ceil(self._listViewWidth / self._templateWidth) + exCount
	end
	if self._spawnCount > self._totalCount then
		self._spawnCount = self._totalCount
	end

	-- 计算滚动范围
	local innerContainerSize = self._target:getInnerContainerSize()
	if self._direction == ccui.ListViewDirection.vertical then
		self._reuseItemOffset = (self._templateHeight + self._spacing) * self._spawnCount
		self._totalRange = self._templateHeight * self._totalCount + (self._totalCount - 1) * self._spacing
		innerContainerSize.height = self._totalRange
	elseif self._direction == ccui.ListViewDirection.horizontal then
		self._reuseItemOffset = (self._templateWidth + self._spacing) * self._spawnCount
		self._totalRange = self._templateWidth * self._totalCount + (self._totalCount - 1) * self._spacing
		innerContainerSize.width = self._totalRange
	end

	--
	self:_respawn()
	self._target:forceDoLayout()
	self._target:setInnerContainerSize(innerContainerSize)
	--self._target:jumpToTop()
	--self._target:scheduleUpdateWithPriorityLua(handler(self, self._onUpdate), 0)
	--scheduler.scheduleUpdateGlobal(handler(self, self._onUpdate))
	self._target:addScrollViewEventListener(function(sender, eventType)
        if eventType == 9 then
            self:_onUpdate(0)
        end
		if self._scrollEvent then
			self._scrollEvent(sender,eventType)
		end
    end)
    self._target:addEventListener(function(sender, eventType)
        if eventType == 0 then
            
        else
			local item = self._items[sender:getCurSelectedIndex()+1]
        	if self._selectedCallback then
        		self._selectedCallback(item, item:getTag())
        	end
        end
    end)
end

--
function CommonListView:_respawn()
	local count = #self._items
	if count > self._spawnCount then
		while #self._items > self._spawnCount do
			table.remove(self._items, #self._items)
			self._target:removeLastItem()
		end
	elseif count < self._spawnCount then
		local index = #self._items
		while index < self._spawnCount do
			local widget = self._template.new()
			self._target:pushBackCustomItem(widget)
			widget:setCustomCallback(self._customCallback)
			self:_updateItem(widget, index, index)
			self._items[#self._items+1] = widget
			index = index + 1
		end
	end
end

--
function CommonListView:_getItemPositionYInView(item)
	local worldPos = item:getParent():convertToWorldSpaceAR(cc.p(item:getPosition()))
    local viewPos = self._target:convertToNodeSpaceAR(cc.p(worldPos))
    return viewPos.y
end

--
function CommonListView:_getItemPositionXInView(item)
	local worldPos = item:getParent():convertToWorldSpaceAR(cc.p(item:getPosition()))
    local viewPos = self._target:convertToNodeSpaceAR(cc.p(worldPos))
    return viewPos.x
end

--
function CommonListView:_onUpdate(f)
	self._updateTimer = self._updateTimer + f
	--[[if self._updateTimer < self._updateInterval then
		return
	end]]
	--print("1111")
	self._updateTimer = 0
	if self._direction == ccui.ListViewDirection.vertical then
		local isDown = self._target:getInnerContainerPosition().y < self._lastContentPos
		
		for i=1, self._spawnCount do
	        local item = self._items[i]
	        local itemPos = self:_getItemPositionYInView(item)
	        if isDown then
	
	            if itemPos < -self._bufferZone and item:getPositionY() + self._reuseItemOffset < self._totalRange then
	                local itemID = item:getTag() - self._spawnCount
	                item:setPositionY(item:getPositionY() + self._reuseItemOffset)
	                self:_updateItem(item, itemID, i)
	            end
	        else 
	        	-- print("i = " ..i, "itemPos = " .. itemPos)
	            if itemPos > self._bufferZone + self._listViewHeight and item:getPositionY() - self._reuseItemOffset >= 0 then
	                item:setPositionY(item:getPositionY() - self._reuseItemOffset)
	                local itemID = item:getTag() + self._spawnCount
	                self:_updateItem(item, itemID, i)
	            end
	        end
	    end

	    self._lastContentPos = self._target:getInnerContainer():getPositionY()
	elseif self._direction == ccui.ListViewDirection.horizontal then
		local isRight = self._target:getInnerContainerPosition().x < self._lastContentPos
		
		for i=1, self._spawnCount do
	        local item = self._items[i]
	        local itemPos = self:_getItemPositionXInView(item)
	        if isRight then
	            if itemPos < -self._bufferZone and item:getPositionX() + self._reuseItemOffset < self._totalRange then
	                local itemID = item:getTag() + self._spawnCount
	                item:setPositionX(item:getPositionX() + self._reuseItemOffset)
	                self:_updateItem(item, itemID, i)
	            end
	        else 
	        	--print("i = " ..i, "itemPos = " .. itemPos)
	            if itemPos > self._bufferZone + self._listViewWidth and item:getPositionX() - self._reuseItemOffset >= 0 then
	                item:setPositionX(item:getPositionX() - self._reuseItemOffset)
	                local itemID = item:getTag() - self._spawnCount
	                self:_updateItem(item, itemID, i)
	            end
	        end
	    end
	    self._lastContentPos = self._target:getInnerContainer():getPositionX()
	end
end

--
function CommonListView:_updateItem(item, itemID, templateID)
    item:setTag(itemID)
    if self._updateItemCallback then
	    self._updateItemCallback(item, itemID)
	end
end

--根据滚动cell自动配置大小
--用于居中对齐等功能
function CommonListView:adaptWithContainerSize()
	
	self._target:doLayout()
	local containSize = self._target:getInnerContainerSize()
	self._target:setContentSize(containSize)
	
end

function CommonListView:clearAll()
	self._target:removeAllItems()
	self._target:addScrollViewEventListener(function(sender, eventType) end)
    self._target:addEventListener(function(sender, eventType) end)
    if self._direction == ccui.ListViewDirection.vertical then
    	self._target:jumpToTop()
	elseif self._direction == ccui.ListViewDirection.horizontal then
    	self._target:jumpToLeft()
	end

	self:_init()
end


--刷新数据并定位到上次滑动的位置
function CommonListView:updateCellNums( cellNum )
	-- body
	
	local offset = self._target:getInnerContainerPosition()
	self:resize(cellNum)
	self._target:setInnerContainerPosition(offset)

end

function CommonListView:setScrollDuration(time)
    -- body
    time = time or 1
    self._target:setScrollDuration(time)
end

function CommonListView:setMagneticType(type)
    -- body
    type = type or 1
    self._target:setMagneticType(type)
end

function CommonListView:setGravity(type)
    -- body
    type = type or 2
    self._target:setGravity(type)
end

function CommonListView:jumpToPercentHorizontal(percent)
    -- body
    percent = percent or 50
    self._target:jumpToPercentHorizontal(percent)
end



return CommonListView