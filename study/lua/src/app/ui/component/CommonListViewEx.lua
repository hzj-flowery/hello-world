local CommonListViewEx = class("CommonListViewEx")
local scheduler = require("cocos.framework.scheduler")

local ListViewDataSource = class("ListViewDataSource")
function ListViewDataSource:tableCellSizeForIndex()end
function ListViewDataSource:cellSizeForTable()end
function ListViewDataSource:tableCellAtIndex()end
function ListViewDataSource:numberOfCellsInTableView()end

local EXPORTED_METHODS = {
    "setTemplate",
    "resize",
    "setCallback",
    "setCustomCallback",
	"adaptWithContainerSize",
	"getItems",
	"clearAll",
	"forceUpdate",
	"reloadData",
	"setLocation",
}

--
function CommonListViewEx:ctor()
	self._target = nil
	self._textTitle = nil
	self._btnClose = nil
end

--
function CommonListViewEx:_init()
	self._spawnCount = 0
	self._cellsUsed  = {} -- cells that are currently in the table
	self._cellsFreed = {} -- free list of cells
	self._dataSource = {}
	self._isUsedCellsDirty = false
	----------------------------------------------------------------
	self._items = {}
	self._spacing = self._target:getItemsMargin() --Item间隔
	local size = self._target:getContentSize()
	self._listViewHeight = size.height
	self._listViewWidth = size.width
	self._direction = self._target:getDirection()
	self._target:setScrollDuration(1.0)
end

function CommonListViewEx:getItems()
	return self._items
end
--
function CommonListViewEx:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
	self._target:setScrollBarEnabled(false)
end

--
function CommonListViewEx:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonListViewEx:setCallback(update, selected, scrollEvent)
	self._updateItemCallback = update
	self._selectedCallback = selected
	self._scrollEvent = scrollEvent
end

--
function CommonListViewEx:setCustomCallback(callback)
	self._customCallback = callback
end

--
function CommonListViewEx:setTemplate(template, itemWidth, itemHeight)
	self._template = template
	local widget = template.new()
	--self._target:setItemModel(widget)
	local size = widget:getContentSize()
	self._templateWidth = itemWidth or size.width
	self._templateHeight = itemHeight or size.height
	--
	if self._direction == ccui.ListViewDirection.vertical then
		self._bufferZone = self._templateHeight + self._spacing
	
	elseif self._direction == ccui.ListViewDirection.horizontal then
		self._bufferZone = self._templateWidth + self._spacing
	end
	self._updateTimer = 0
	self._lastContentPos = 0
	--self._target:setScrollBarPositionFromCorner(cc.p(7,7))
end

--
function CommonListViewEx:resize(size, exCount)
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
	
	self._target:forceDoLayout()
	self._target:setInnerContainerSize(innerContainerSize)
	self:_respawn()
	--self._target:jumpToTop()
	--self._target:scheduleUpdateWithPriorityLua(handler(self, self._onUpdate), 0)
	--scheduler.scheduleUpdateGlobal(handler(self, self._onUpdate))
	self._target:addScrollViewEventListener(function(sender, eventType)
        if eventType == 9 then--CONTAINER_MOVED
            self:_onUpdate(0)
        end
		if self._scrollEvent then
			self._scrollEvent(sender,eventType)
		end
    end)
    self._target:addEventListener(function(sender, eventType)
		
        if eventType == 0 then
            
        else
			local endPosition = self._target:getTouchBeganPosition()
			local point = self._target:getInnerContainer():convertToNodeSpace(endPosition)
        	local index = self:_indexFromOffset(point)
			dump(point)
			dump(index)
			if index ~= -1 then
				local item = self:cellAtIndex(index)
				--local item = self._cellsUsed[index+1]
				if item and self._selectedCallback then
					self._selectedCallback(item, item:getIdx() - 1, eventType)
				end
			end

        end
    end)

end

--
function CommonListViewEx:_respawn()
	if self._direction == ccui.ListViewDirection.vertical then
    	--self._target:jumpToTop()
	elseif self._direction == ccui.ListViewDirection.horizontal then
    	--self._target:jumpToLeft()
	end
	self:reloadData()
end

--
function CommonListViewEx:_getItemPositionYInView(item)
	local worldPos = item:getParent():convertToWorldSpaceAR(cc.p(item:getPosition()))
    local viewPos = self._target:convertToNodeSpaceAR(cc.p(worldPos))
    return viewPos.y
end

--
function CommonListViewEx:_getItemPositionXInView(item)
	local worldPos = item:getParent():convertToWorldSpaceAR(cc.p(item:getPosition()))
    local viewPos = self._target:convertToNodeSpaceAR(cc.p(worldPos))
    return viewPos.x
end


--
function CommonListViewEx:_onUpdate(f)
	self._updateTimer = self._updateTimer + f

	--self._bufferZone = self._templateHeight + self._spacing
	--self._reuseItemOffset = (self._templateHeight + self._spacing) * self._spawnCount
	self._updateTimer = 0
	if self._direction == ccui.ListViewDirection.vertical then
		self:scrollViewDidScroll()
	    self._lastContentPos = self._target:getInnerContainer():getPositionY()
	elseif self._direction == ccui.ListViewDirection.horizontal then
		self:scrollViewDidScroll()

	    self._lastContentPos = self._target:getInnerContainer():getPositionX()
	end
end

--
function CommonListViewEx:_updateItem(item, itemID, templateID)
    item:setTag(itemID)
    if self._updateItemCallback then
	    self._updateItemCallback(item, itemID)
	end
end

--根据滚动cell自动配置大小
--用于居中对齐等功能
function CommonListViewEx:adaptWithContainerSize()
	
	self._target:doLayout()
	local containSize = self._target:getInnerContainerSize()
	self._target:setContentSize(containSize)
	
end

function CommonListViewEx:clearAll()


	self:_init()
end


--根据总数量
--计算每个cell应该所在位置--预先生成
function CommonListViewEx:_updateCellPositions()
	local totalCount = self._totalCount

	local tempList = {}
	if totalCount > 0 then
		local currPos = 0
		local cellSize = cc.size(self._templateWidth + self._spacing, self._templateHeight + self._spacing)
		for i =1 , totalCount do
			tempList[i] = currPos 
			if self._direction == ccui.ListViewDirection.vertical then
				currPos = currPos + cellSize.height
			elseif self._direction == ccui.ListViewDirection.horizontal then
				currPos = currPos + cellSize.width
			end
		end
		tempList[totalCount+1] = currPos
		table.sort(tempList, function(a,b) return a < b end)
	end
	self._cellPosition = tempList
end

--创建并更新Template
function CommonListViewEx:tableCellAtIndex(index)
	local widget = self:dequeueCell()
	if widget == nil then
		widget = self._template.new()
		widget:setTag(index-1)
		self._target:addChild(widget)
		logWarn("widget = self._template.new()")
	end
	widget:setVisible(true)
	widget:setCustomCallback(self._customCallback)
	widget:setIdx(index)
	self:_setIndexForCell(index, widget)


	if self._updateItemCallback then
	    self._updateItemCallback(widget, index-1)
	end
	
	return widget
end

function CommonListViewEx:_updateContentSize()
	local innerContainerSize = self._target:getInnerContainerSize()
	self._target:setInnerContainerSize(cc.size(innerContainerSize.width,self._totalRange))
end
--根据偏移量，得到cellIndex
function CommonListViewEx:_indexFromOffset(offset)
	local index = nil
	local maxIdx =  self._totalCount


    offset.y = self._totalRange - offset.y
    
	local function indexFromOffset(offsetPos)

		local low = 1
		local high = self._totalCount
		local search = offsetPos.y
		if self._direction == ccui.ListViewDirection.horizontal then
			search = offsetPos.x
		end
		--二分查找法
		while high >= low do
			local index = math.floor( low + (high -low) / 2 )
			local cellStart = self._cellPosition[index] 
			local cellEnd   = self._cellPosition[index + 1]
			if search >= cellStart and search <= cellEnd then
				return index
			elseif search < cellStart then
				high = index - 1
			else
				low = index + 1
			end
		end
		if low <= 1 then
			return 1
		end

		return -1
	end
	index = indexFromOffset(offset)
	if index ~= -1 then
		index = math.max(1, index)
		if index > maxIdx then
			index = -1
		end
	end
	return index
end

function CommonListViewEx:_offsetFromIndex(index)
	local function offsetFromIndex(index)
		local offset = cc.p(0,0)
		offset = cc.p( 0, self._cellPosition[index] )
		if self._direction == ccui.ListViewDirection.horizontal then
			offset = cc.p(  self._cellPosition[index], 0 )
		end
		return offset
	end
	local offsetPos = offsetFromIndex(index)


	if self._direction ==  ccui.ListViewDirection.vertical then
		offsetPos.y = self._totalRange - offsetPos.y - self._templateHeight - self._spacing
	elseif self._direction == ccui.ListViewDirection.horizontal then
		offsetPos.x = self._totalRange - offsetPos.x - self._templateWidth - self._spacing
	end

	return offsetPos
end

--刷新当前listView
function CommonListViewEx:reloadData( ... )
	-- body
	self._target:removeAllChildren()
	self._cellsFreed = {}

    self._indices = {}
    self._cellsUsed = {}
	self._isUsedCellsDirty = false

    self:_updateCellPositions()
    self:_updateContentSize()

    if  self._totalCount > 0 then
    	self:scrollViewDidScroll()
    end
end

function CommonListViewEx:scrollViewDidScroll()
	local countOfItems = self._totalCount
    if 0 == countOfItems then
        return
    end

    if self._isUsedCellsDirty then
        self._isUsedCellsDirty = false
		table.sort(self._cellsUsed, function(cell1, cell2) 
				return cell1:getIdx() < cell2:getIdx() 
		end)
    end

	local startIdx = 0
	local endIdx= 0
	local idx = 0
	local maxIdx =math.max(countOfItems, 0)

    local offset = self._target:getInnerContainerPosition() -- 滚动条起始位置都是从最大高度的负数开始
	
	offset.y = offset.y * -1
	offset.x = offset.x * -1
	offset.y = offset.y + self._listViewHeight

	local templateRange = self._templateHeight *2
	startIdx = self:_indexFromOffset(cc.p(offset.x, offset.y)) --根据offset得到起始index
	if startIdx == -1 then
		startIdx = countOfItems
	end

	offset.y = offset.y - self._listViewHeight;

	endIdx = self:_indexFromOffset(cc.p(offset.x, offset.y))
	if endIdx == -1 then
		endIdx = countOfItems
	end

	logWarn(string.format( "InnerPosY[%d] maxIdx[%d] startIdx[%d] endIdx[%d]", offset.y, maxIdx, startIdx, endIdx))

	local function procCellUsedBegin( ... )
		if #self._cellsUsed ==0 then
			return
		end
		local cell = self._cellsUsed[1]
		if cell == nil then
			return
		end

		local idx = cell:getIdx()
		while idx < startIdx do
			logWarn(string.format( "removeStarIndex idx[%d]",idx))
			self:_moveCellOutOfSight(cell)
			if #self._cellsUsed > 0 then
				cell = self._cellsUsed[1]
				idx = cell:getIdx()
			else
				break
			end
		end
	end

	local function procCellUsedEnd( ... )
		if #self._cellsUsed == 0 then
			return
		end
		local cell = self._cellsUsed[#self._cellsUsed]
		if cell == nil then
			return
		end
		local idx = cell:getIdx()
		while idx <= maxIdx and idx > endIdx do
			logWarn(string.format( "removeEndIndex idx[%d]",idx))
			self:_moveCellOutOfSight(cell)
			if #self._cellsUsed > 0 then
				cell = self._cellsUsed[#self._cellsUsed]
				idx = cell:getIdx()
			else
				break
			end
		end
	end

	procCellUsedBegin()
	procCellUsedEnd()


	for i = startIdx, endIdx do
		if self._indices[i] == nil then
			self:updateCellAtIndex(i)
		end
	end
	
	--self._target:getInnerContainer():forceDoLayout()
	--_tableViewDelegate:scrollViewDidScroll()
end

function CommonListViewEx:updateCellAtIndex(idx)
    if idx == -1 then
        return
	end
	logWarn("CommonListViewEx:updateCellAtIndex ::: "..idx)
    local countOfItems = self._totalCount
    if 0 == countOfItems and idx > countOfItems then
       return
	end
    
    local cellWidget = self:cellAtIndex(idx)
    if cellWidget then
        self:_moveCellOutOfSight(cellWidget)
    end
	
	--创建并更新
    local cellWidget = self:tableCellAtIndex( idx )
   
    self:_addCellIfNecessary(cellWidget)
end

function CommonListViewEx:cellAtIndex(idx)
	if self._indices[idx] ~= nil then
		for i, cell in ipairs(self._cellsUsed) do
			if cell:getIdx() == idx then
				return cell
			end
		end
	end
	return nil
end

function CommonListViewEx:_moveCellOutOfSight(cell)
	--cell:retain()
    table.insert( self._cellsFreed, cell)

	for i, usedCell in ipairs(self._cellsUsed) do
		if usedCell:getIdx() == cell:getIdx() then
			table.remove(self._cellsUsed, i)
			break
		end
	end
	logWarn(string.format( "_moveCellOutOfSight idx [%d]",cell:getIdx() ))
    self._isUsedCellsDirty = true
	self._indices[cell:getIdx()] = nil
    cell:reset()
    
    --if cell:getParent() == self._target:getInnerContainer() then
		cell:setVisible(false)
    --end
end


function CommonListViewEx:_setIndexForCell(index, cell)
    cell:setAnchorPoint(cc.p(0, 0))
	local offsetPos = self:_offsetFromIndex(index)
	dump(offsetPos)
    cell:setPosition(offsetPos)
    cell:setIdx(index)
end

function CommonListViewEx:_addCellIfNecessary(cell)

    table.insert(self._cellsUsed, cell)
 	self._indices[cell:getIdx()] = true
    self._isUsedCellsDirty = true

	cell:setVisible(true)
	--dump(self._indices)
end

function CommonListViewEx:dequeueCell()
    local cell = nil
    if #self._cellsFreed == 0 then
        cell = nil
    else 
        cell =  self._cellsFreed[1]
		logWarn("CommonListViewEx:dequeueCell 拿出老的复用")
        table.remove(self._cellsFreed, 1)
    end
	
	
    return cell
end


function CommonListViewEx:setLocation(index)
	local offset = self:_offsetFromIndex(index)
	dump(offset)
	offset.y = offset.y - (self._listViewHeight )
	offset.y = offset.y * -1
	--local percent =  math.ceil( ( ( self._totalRange - offset.y) / self._totalRange) * 100.0 )
	--dump(percent)
	local innerSize = self._target:getInnerContainerSize()
	dump(innerSize)
	self._target:setInnerContainerPosition( offset )
	local pos = self._target:getInnerContainerPosition()
	dump(pos)
	

end
return CommonListViewEx