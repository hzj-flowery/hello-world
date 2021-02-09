--复用的CellListView，类似于cocos TableView
--目前支持刷新Cell，并滚动到指定cell

local CommonGalleryView = class("CommonGalleryView")
local scheduler = require("cocos.framework.scheduler")



local EXPORTED_METHODS = {
    "setTemplate",
    "setCallback",
    "setCustomCallback",
	"setSpacing",
	"setCurgalleryCallback",
    "resize",
	"reloadData",
	"getItemByTag",
	"getItemPosition",
	"setLocation",
	"getCurGalleryIndex",
	"updateCellAtIndex",
	"tableCellAtIndex",
	"enableCenterScale",
	"setRoundParam",		--设置圆弧（偏移量，半径）
	"setScrollPercentCallback",
	"setScrollType",			--设置滚动样式 1：从中间开始(默认) 2：从头开始
	"refreshLocation",		--刷新位置
}

--
function CommonGalleryView:ctor()
end

--
function CommonGalleryView:_init()
	self._spawnCount = 0
	self._cellsUsed  = {} -- cells that are currently in the table
	self._cellsFreed = {} -- free list of cells
	self._dataSource = {}
	self._isUsedCellsDirty = false
	----------------------------------------------------------------
	self._items = {}
	self._spacing = 0
	local size = self._target:getContentSize()
	self._listViewHeight = size.height
	self._listViewWidth = size.width
	self._direction = self._target:getDirection()
	self._totalRange = 0
	self._isInitTouch = false
	self._curGalleryIndex = 1
	self._enableCenterScale = true
	self._roundOffset = 0
	self._roundRadius = 0
	self._scrollPercentCallback = nil
	self._scrollType = 1 --滚动样式 1：从中间开始(默认) 2：从头开始
end

--
function CommonGalleryView:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
	self._target:setScrollBarEnabled(false)
end

--
function CommonGalleryView:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end


--
function CommonGalleryView:setCallback(update, selected, scrollEvent,eventListener)
	self._updateItemCallback = update
	self._selectedCallback = selected
	self._scrollEvent = scrollEvent
	self._eventListener = eventListener
end

--
function CommonGalleryView:setCustomCallback(callback)
	self._customCallback = callback
end


function CommonGalleryView:setSpacing(spacing )
	self._spacing = spacing
end


--
function CommonGalleryView:setTemplate(template, itemWidth, itemHeight)
	self._template = template
	local widget = template.new()

	local size = widget:getContentSize()
	self._templateWidth = itemWidth or size.width
	self._templateHeight = itemHeight or size.height


	logWarn( string.format("CommonGalleryView  setTemplate width %d height %d ",self._templateWidth,self._templateHeight) )
end


--@Export 		Scrolling Change callBack
function CommonGalleryView:setCurgalleryCallback(callback)
	self._scrollChangeCallback = callback
end

-- @Export 		Cur's Gallery Idx
function CommonGalleryView:getCurGalleryIndex()
	return self._curGalleryIndex
end

function CommonGalleryView:_initTouchEvent( ... )
	if self._isInitTouch == true then
		return
	end
	
	self._target:addTouchEventListener(function(sender, touchType)
		-- logWarn("CommonGalleryView touchType ------------- "..tostring(touchType))
	
		if touchType == ccui.TouchEventType.began then
			self._inTouch = true
			self._inFix = true
			self._target:stopAllActions()
		elseif touchType == ccui.TouchEventType.ended or  
			touchType == ccui.TouchEventType.canceled then
			self._inTouch = false	
			self._isContainerNotMove = true	
			self:_performWithDelay(function()
				if self._isContainerNotMove then
					self:_onUpdateAlign()
				end
			end,0.01)

		end

		if touchType == ccui.TouchEventType.ended then
			if self._selectedCallback then
				local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
				local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
				if moveOffsetX < 20 and moveOffsetY < 20 then
					local endPosition = self._target:getTouchEndPosition()
					local point = self._target:getInnerContainer():convertToNodeSpace(endPosition)
                    point = self:_convertOffset(point)
					local index = self:_indexFromOffset( point )
					if index == -1 then
						return
					end
					local item = self:cellAtIndex(index)
					if item then
						self._selectedCallback(item, item:getIdx() - 1, eventType)
					end
				end
			end
		end
	end)

    self._target:addEventListener(function(sender, eventType)
		--logWarn("CommonGalleryView scroll ------------- "..tostring(eventType))
		if self._scrollEvent then
			self._scrollEvent(sender, eventType)
		end
		if eventType == 9 then--CONTAINER_MOVED
			self._isContainerNotMove = false
            self:_onUpdate()
			-- self:_onUpdateAlign()
        end
		if self._eventListener then	
			self._eventListener(sender, eventType)
		end
    end)
	self._isInitTouch = true
end


function CommonGalleryView:resize(size)
	--尚未初始化
	self._totalCount = size

	self:reloadData()

	self:_initTouchEvent()
end

function CommonGalleryView:_onUpdate()
	if self._direction == ccui.ListViewDirection.vertical then
		self:scrollViewDidScroll()
	elseif self._direction == ccui.ListViewDirection.horizontal then
		self:scrollViewDidScroll()
	end
end

function CommonGalleryView:_onUpdateAlign()
	--logWarn("--------------- "..tostring(self._inFix) .."  ".. tostring(not self._inTouch))
	if self._inFix and self:_isScrollEnd() and not self._inTouch  then
		--计算离中心最近Item的Index
		self._inFix  = false
		local idx,diff = self:_findNearestIdxToCenter()
		if idx then
			local percent = self:_getOffsetPercentByIdx(idx)
			self:_performWithDelay(function()
				if self._direction == ccui.ListViewDirection.vertical then
					self._target:scrollToPercentVertical(percent,2.5,true)
				elseif self._direction == ccui.ListViewDirection.horizontal then
					self._target:scrollToPercentHorizontal(percent,2.5,true)
				end
			end,0.01)

		end
	end

end

function CommonGalleryView:_performWithDelay( callback, delay)
    local delay = cc.DelayTime:create(delay)
    local sequence = cc.Sequence:create(delay, cc.CallFunc:create(callback))
    self._target:runAction(sequence)
    return sequence
end


--根据总数量
--计算每个cell应该所在位置--预先生成
function CommonGalleryView:_updateCellPositions()
	local totalCount = self._totalCount

	local tempList = {}
	if totalCount > 0 then
		local currPos = 0
		local blankSize = cc.size( (self._listViewWidth-self._templateWidth) * 0.5, (self._listViewHeight-self._templateHeight) * 0.5)
		if self._scrollType == 2 then
			blankSize = cc.size( self._templateWidth * 0.5, self._templateHeight * 0.5)
		end
		local cellSize = cc.size(self._templateWidth + self._spacing, self._templateHeight + self._spacing)

        if self._direction == ccui.ListViewDirection.vertical then
            currPos = blankSize.height 
        elseif self._direction == ccui.ListViewDirection.horizontal then
            currPos = blankSize.width
        end


		for i =1 , totalCount do
			tempList[i] = currPos
			if self._direction == ccui.ListViewDirection.vertical then
				currPos = currPos + cellSize.height 
			elseif self._direction == ccui.ListViewDirection.horizontal then
				currPos = currPos + cellSize.width
			end
		end
		tempList[totalCount+1] = currPos
	end
	dump(tempList)
	logWarn("CommonGalleryView _updateCellPositions" )
	self._cellPosition = tempList
end

function CommonGalleryView:_updateContentSize()
	-- 计算滚动范围
    local blankSize = cc.size( (self._listViewWidth-self._templateWidth), (self._listViewHeight-self._templateHeight) )
	if self._scrollType == 2 then
		blankSize = cc.size( self._templateWidth, self._templateHeight )
	end
	local innerContainerSize = self._target:getInnerContainerSize()
	if self._direction == ccui.ListViewDirection.vertical then
		self._totalRange = self._templateHeight * self._totalCount + (self._totalCount - 1) * self._spacing + blankSize.height

		if self._totalRange < self._listViewHeight then
			self._totalRange = self._listViewHeight
		end
		innerContainerSize.height = self._totalRange 

	elseif self._direction == ccui.ListViewDirection.horizontal then
		self._totalRange = self._templateWidth * self._totalCount + (self._totalCount - 1) * self._spacing  +  blankSize.width

		if self._totalRange < self._templateWidth then
			self._totalRange = self._templateWidth
		end
		innerContainerSize.width = self._totalRange 
	end
    
    -- logWarn("--------  "..tostring(self._templateWidth).."  "..tostring(self._totalCount).."  "..tostring(self._spacing))
    -- dump(blankSize)
	-- dump(innerContainerSize)
	-- logWarn(string.format("CommonGalleryView _updateCellPositions totalRange %d" ,self._totalRange) )

	self._target:setInnerContainerSize(innerContainerSize)
end


function CommonGalleryView:_convertOffset(offset)
    if self._direction == ccui.ListViewDirection.vertical then
        offset.y = self._totalRange - offset.y
    end
    return  offset
end


--根据偏移量，得到cellIndex
function CommonGalleryView:_indexFromOffset(offset)
	local index = nil
	local maxIdx =  self._totalCount

	local function indexFromOffset(offsetPos)

		local low = 1
		local high = self._totalCount

		local search = offset.y
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

function CommonGalleryView:_offsetFromIndex(index)
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
		offsetPos.y = self._totalRange - offsetPos.y - self._templateHeight 
	elseif self._direction == ccui.ListViewDirection.horizontal then
		
	end

	return offsetPos
end

--刷新当前listView
function CommonGalleryView:reloadData( ... )
	-- body
	self._target:removeAllChildren()
	self._target:setTouchEnabled(true)
	self._cellsFreed = {}

    self._indices = {}
    self._cellsUsed = {}
	self._isUsedCellsDirty = false

    self:_updateCellPositions()
    self:_updateContentSize()


    if self._totalCount > 0 then
    	self:scrollViewDidScroll()
    end
end


function CommonGalleryView:scrollViewDidScroll()
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
	local maxIdx = math.max(countOfItems, 0)

    local startOffset = self._target:getInnerContainerPosition() -- 滚动条起始位置都是从最大高度的负数开始
    local endOffset  = cc.p(startOffset.x, startOffset.y)
	if self._direction == ccui.ListViewDirection.vertical then
		startOffset.y = startOffset.y * -1
		startOffset.y = startOffset.y + self._listViewHeight
        startOffset = self:_convertOffset(startOffset)
        endOffset.y = startOffset.y + self._listViewHeight
	elseif self._direction == ccui.ListViewDirection.horizontal then
		startOffset.x = startOffset.x * -1
        startOffset = self:_convertOffset(startOffset)
        endOffset.x = startOffset.x + self._listViewWidth
	end


	startIdx = self:_indexFromOffset(cc.p(startOffset.x, startOffset.y)) --根据offset得到起始index
    endIdx = self:_indexFromOffset(cc.p(endOffset.x, endOffset.y))

	if startIdx == -1 or  endIdx == -1 then

        if self._direction == ccui.ListViewDirection.vertical then
            if startOffset.y  < self._cellPosition[1]  then
                startIdx = 0
            elseif startOffset.y >  self._cellPosition[self._totalCount+1]  then    
                startIdx = self._totalCount  + 1
            end
            if endOffset.y < self._cellPosition[1] then
                endIdx = 0
            elseif endOffset.y >  self._cellPosition[self._totalCount+1]  then    
                endIdx = self._totalCount  + 1
            end
        elseif self._direction == ccui.ListViewDirection.horizontal then
            if startOffset.x  < self._cellPosition[1]  then
                 startIdx = 0
            elseif startOffset.x >  self._cellPosition[self._totalCount + 1]  then 
                 startIdx = self._totalCount  + 1
            end

            if endOffset.x < self._cellPosition[1] then
                endIdx = 0
            elseif endOffset.x >  self._cellPosition[self._totalCount + 1]  then 
                endIdx = self._totalCount  + 1
            end
        end
	end

    --logWarn("CommonGalleryView scrollViewDidScroll -------------- "..tostring(startIdx).." "..tostring(endIdx))

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
        if i >= 1 and i <= self._totalCount and self._indices[i] == nil then
            self:updateCellAtIndex(i)
        end
	end



    local midOffset = self._target:getInnerContainerPosition() 
    local midValue = 0
    local midSize = 0
	if self._direction == ccui.ListViewDirection.vertical then
		midOffset.y = midOffset.y * -1 + self._listViewHeight * 0.5
        midOffset = self:_convertOffset(midOffset)
        midValue = midOffset.y
        midSize = self._templateHeight * 0.5
	elseif self._direction == ccui.ListViewDirection.horizontal then
		midOffset.x = midOffset.x * -1 + self._listViewWidth * 0.5
        midOffset = self:_convertOffset(midOffset)
        midValue = midOffset.x
        midSize = self._templateWidth * 0.5
	end

    
   
    --缩放Item
    for i, usedCell in ipairs(self._cellsUsed) do
		if usedCell:isVisible() then
			local idx = usedCell:getIdx()
			local diff = math.abs(self._cellPosition[idx]  + midSize - midValue )
			local scale = math.max(0.7, 1 - diff * 0.5 / 700 )
			local posDiff = 0
			if self._direction == ccui.ListViewDirection.vertical and self._roundRadius ~=0 then
				-- -- 抛物线
				-- posDiff = -0.00105 * diff * diff
				-- usedCell:setPositionX(posDiff + 100)
				-- 圆
				posDiff = math.sqrt(self._roundRadius * self._roundRadius - diff * diff) 
				usedCell:setPositionX(posDiff + self._roundOffset)
			elseif self._direction == ccui.ListViewDirection.horizontal and self._roundRadius ~=0 then
				posDiff = math.sqrt(self._roundRadius * self._roundRadius - diff * diff) 
				usedCell:setPositionX(posDiff + self._roundOffset)
			end 
			usedCell:setAnchorPoint(cc.p(0.5,0.5))
			if self._enableCenterScale then
				usedCell:setScale(scale)
			end
			usedCell:setAnchorPoint(cc.p(0,0))
			self._curGalleryIndex = scale >= 0.8 and idx or self._curGalleryIndex
			if self._scrollChangeCallback and self._curGalleryIndex == idx then
				self._scrollChangeCallback(self._curGalleryIndex)
			end
		end
	end

	if self._scrollPercentCallback ~= nil then
		local percent = self:_getScrollPercent()
		self._scrollPercentCallback(percent)
	end
end

function CommonGalleryView:updateCellAtIndex(idx)
    if idx == -1 then
        return
	end
	logWarn("CommonGalleryView:updateCellAtIndex ::: "..idx)
    local countOfItems = self._totalCount
    if 0 == countOfItems or idx > countOfItems then
       return
	end

    local cellWidget = self:cellAtIndex(idx)
    if cellWidget then
        self:_moveCellOutOfSight(cellWidget)
    end

	--创建并更新
    local cellWidget = self:tableCellAtIndex( idx )

    local addCellIfNecessary = function(cell)
        table.insert(self._cellsUsed, cell)
        self._indices[cell:getIdx()] = true
        self._isUsedCellsDirty = true
        cell:setVisible(true)
    end



    addCellIfNecessary(cellWidget)
end

--创建并更新Template
function CommonGalleryView:tableCellAtIndex(index)
    local setIndexForCell = function(index, cell)
        cell:setAnchorPoint(cc.p(0, 0))
        local offsetPos = self:_offsetFromIndex(index)
        cell:setPosition(offsetPos)
        cell:setIdx(index)
        cell:setTag(index-1)
    end

    local dequeueCell = function()
        local cell = nil
        if #self._cellsFreed == 0 then
            cell = nil
        else
            cell =  self._cellsFreed[1]
            table.remove(self._cellsFreed, 1)
        end
        return cell
    end


	local widget = dequeueCell()
	if widget == nil then
		widget = self._template.new()
		self._target:getInnerContainer():addChild(widget)
	end
	widget:setVisible(true)
	widget:setCustomCallback(self._customCallback)
	setIndexForCell(index, widget)

	if self._updateItemCallback then
	    self._updateItemCallback(widget, index-1)
	end

	return widget
end

function CommonGalleryView:enableCenterScale(bEnable)
	self._enableCenterScale = bEnable
end



function CommonGalleryView:_moveCellOutOfSight(cell)
	--cell:retain()
    table.insert( self._cellsFreed, cell)

	for i, usedCell in ipairs(self._cellsUsed) do
		if usedCell:getIdx() == cell:getIdx() then
			table.remove(self._cellsUsed, i)
			break
		end
	end
	--logWarn(string.format( "_moveCellOutOfSight idx [%d]",cell:getIdx() ))
    self._isUsedCellsDirty = true
	self._indices[cell:getIdx()] = nil
    cell:reset()

    --if cell:getParent() == self._target:getInnerContainer() then
	cell:setVisible(false)
    --end
end


function CommonGalleryView:cellAtIndex(idx)
	if self._indices[idx] ~= nil then
		for i, cell in ipairs(self._cellsUsed) do
			if cell:getIdx() == idx then
				return cell
			end
		end
	end
	return nil
end

function CommonGalleryView:getItemPosition(index)
	local offset = self:_offsetFromIndex(index)
	return offset
end

function CommonGalleryView:setLocation(offset, customOffset)
	customOffset = (customOffset > 0 and customOffset or 0)
	
	if self._direction == ccui.ListViewDirection.vertical then
		offset.y = -offset.y + customOffset
		offset.x = 0
	elseif self._direction == ccui.ListViewDirection.horizontal then
		offset.x = -offset.x + customOffset
		offset.y = offset.y - (self._listViewHeight - self._templateHeight )
		offset.y = offset.y * -1
		offset.y = math.max(offset.y,math.min(self._listViewHeight - self._totalCount*self._templateHeight,0))
		offset.y = math.min(offset.y,0)
	end


	local innerSize = self._target:getInnerContainerSize()

	self._target:setInnerContainerPosition( offset )
    self:scrollViewDidScroll()
end

function CommonGalleryView:refreshLocation(index)
	local offset = cc.p( 0, self._cellPosition[index] )
	if self._direction == ccui.ListViewDirection.horizontal then
		offset = cc.p(  self._cellPosition[index], 0 )
	end
	local containerPos = self._target:getInnerContainerPosition()
	
	if self._direction == ccui.ListViewDirection.vertical then
		offset.y = offset.y - (-containerPos.y) - self._templateHeight  / 2
		offset.x = 0
	elseif self._direction == ccui.ListViewDirection.horizontal then
		--todo
	end
	self._target:setInnerContainerPosition(offset)
    self:scrollViewDidScroll()
end

function CommonGalleryView:getItemByTag(index)
	if not index then
		return nil
	end
	return self:cellAtIndex(index+1)
end

function CommonGalleryView:_isScrollEnd()
	local offset = self._target:getInnerContainerPosition()
	if not self._lastOffset then
		self._lastOffset = offset
		return 
	end
	local value = math.abs(self._lastOffset.x - offset.x) + 
		math.abs(self._lastOffset.y - offset.y) 
	-- logWarn("CommonGalleryView isScrollEnd ----------- "..tostring(value))
	self._lastOffset = offset

	if value <= 2 then
		return true
	end
	
	return false
end

function CommonGalleryView:_findNearestIdxToCenter()
	local midOffset = self._target:getInnerContainerPosition() 
	local midValue = 0
	local midSize = 0
	local visualSize = 0
	if self._direction == ccui.ListViewDirection.vertical then
		midOffset.y = midOffset.y * -1 + self._listViewHeight * 0.5
        midOffset = self:_convertOffset(midOffset)
		midValue = midOffset.y
		midSize = self._templateHeight * 0.5
		visualSize = self._listViewHeight 
	elseif self._direction == ccui.ListViewDirection.horizontal then
		midOffset.x = midOffset.x * -1 + self._listViewWidth * 0.5
        midOffset = self:_convertOffset(midOffset)
		midValue = midOffset.x
		midSize = self._templateWidth * 0.5
		visualSize = self._listViewWidth 
	end
	 local minDiff = nil
	 local nearestIdx = nil
	 for i, usedCell in ipairs(self._cellsUsed) do
		if usedCell:isVisible() then
            local idx = usedCell:getIdx()
			local diff = math.abs(self._cellPosition[idx]  + midSize - midValue )
			if not minDiff or diff < minDiff then
				minDiff = diff
				nearestIdx = idx
			end
            
		end
	end

	return nearestIdx,minDiff
end


function CommonGalleryView:_getOffsetPercentByIdx(nearestIdx)
	local midSize = 0
	local visualSize = 0
	if self._direction == ccui.ListViewDirection.vertical then
		midSize = self._templateHeight * 0.5
		visualSize = self._listViewHeight 
	elseif self._direction == ccui.ListViewDirection.horizontal then
		midSize = self._templateWidth * 0.5
		visualSize = self._listViewWidth 
	end

	
	local maxOffset = math.max(0,math.abs(self._totalRange - visualSize))
	if maxOffset <= 0 then
		return 0
	end
	local percent = 0
	if self._direction == ccui.ListViewDirection.vertical then
		local offset =  math.max(0,(self._cellPosition[nearestIdx] + midSize) - visualSize * 0.5 )
		percent = offset * 100 / maxOffset
	elseif self._direction == ccui.ListViewDirection.horizontal then
		local offset = math.max(0,self._cellPosition[nearestIdx] + midSize - visualSize * 0.5)
		percent = offset * 100 / maxOffset
	end
	return percent
end

function CommonGalleryView:setRoundParam(offset, radius)
	self._roundOffset = offset
	self._roundRadius = radius
end

function CommonGalleryView:_getScrollPercent()
	local midSize = 0
	local visualSize = 0
	if self._direction == ccui.ListViewDirection.vertical then
		midSize = self._templateHeight * 0.5
		visualSize = self._listViewHeight 
	elseif self._direction == ccui.ListViewDirection.horizontal then
		midSize = self._templateWidth * 0.5
		visualSize = self._listViewWidth 
	end

	
	local maxOffset = math.max(0,math.abs(self._totalRange - visualSize))
	if maxOffset <= 0 then
		return 0
	end

	local startOffset = self._target:getInnerContainerPosition() -- 滚动条起始位置都是从最大高度的负数开始
	local percent = 0
	if self._direction == ccui.ListViewDirection.vertical then
		startOffset.y = startOffset.y * -1
		startOffset.y = startOffset.y + self._listViewHeight
		startOffset = self:_convertOffset(startOffset)
		percent = startOffset.y * 100 / maxOffset
	elseif self._direction == ccui.ListViewDirection.horizontal then
		startOffset.x = startOffset.x * -1
		startOffset.x = startOffset.x + self._listViewWidth
		startOffset = self:_convertOffset(startOffset)
		percent = startOffset.x * 100 / maxOffset
	end

	return percent
end

function CommonGalleryView:setScrollPercentCallback(cb)
	self._scrollPercentCallback = cb
end


function CommonGalleryView:setScrollType(type)
	self._scrollType = type
end


return CommonGalleryView
