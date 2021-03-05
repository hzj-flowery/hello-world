local CommonPageViewIndicator = class("CommonPageViewIndicator")

local EXPORTED_METHODS = {
        "refreshPageData",
        "setCurrentPageIndex",
		"setPageViewIndex"
}

CommonPageViewIndicator.DEFAULT_GAP = 10

function CommonPageViewIndicator:ctor()
	self._target = nil
    self._checkBox = nil
    self._pageView = nil
    self._currPageIndex = 0
    self._indicatorViews = {}
    self._itemSize = nil
end

function CommonPageViewIndicator:_init()
	self._checkBox = ccui.Helper:seekNodeByName(self._target, "CheckBox")
    table.insert(self._indicatorViews,self._checkBox)

    self._itemSize = self._checkBox:getContentSize()
end

function CommonPageViewIndicator:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPageViewIndicator:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonPageViewIndicator:refreshPageData(pageView,count,currPageIndex,itemGap, eventListen)
    if self._pageView ~= pageView then
        self._pageView = pageView
		self._eventListen = eventListen
        if self._pageView then
             self._pageView:addEventListener(handler(self,self.onPageEvent))
        end
    end

    count = count or 0
    currPageIndex = currPageIndex or 0
    itemGap = itemGap or CommonPageViewIndicator.DEFAULT_GAP


    for k,v in ipairs(self._indicatorViews) do
        if k ~= 1 then
			v:removeFromParent()
		end
    end
	self._indicatorViews = {}
	table.insert(self._indicatorViews,self._checkBox)
    for k = 2,count,1 do
        local checkBox = self:_createCloneNode(k,self._checkBox)
        checkBox:setVisible(false)
        self._target:addChild(checkBox)
        table.insert(self._indicatorViews,checkBox)
    end
	for k, v in ipairs(self._indicatorViews) do
		v:setTag(k-1)
		v:addEventListener(handler(self, self._onClickCheckBox))
	end

    local totalW = (count-1) * itemGap + count * self._itemSize.width
    local startX = -totalW*0.5 + self._itemSize.width * 0.5
    for k = 1,count,1 do
        local v = self._indicatorViews[k]
        v:setPositionX(startX)
        v:setVisible(true)
        self:_brightItem(v,false)

        startX = startX + self._itemSize.width + itemGap
    end

    self:setCurrentPageIndex(currPageIndex)
end

function CommonPageViewIndicator:setCurrentPageIndex(currPageIndex)
    local oldPageIndex =  self._currPageIndex
    self._currPageIndex = currPageIndex or 0
    self:_brightItem(self._indicatorViews[oldPageIndex+1],false)
    self:_brightItem(self._indicatorViews[self._currPageIndex+1],true)
end

function CommonPageViewIndicator:_brightItem(item,bright)
    if not item then
        return
    end
    item:setSelected(bright)
end

function CommonPageViewIndicator:_onClickCheckBox(checkBox, event)
	if event == 1 then
		self:_brightItem(checkBox, true)
	else
		if self._pageView then
			self._pageView:setCurrentPageIndex(checkBox:getTag() or 0)
			if self._eventListen then
				self._eventListen(self._pageView, ccui.PageViewEventType.turning)
			end
		end
		self:setCurrentPageIndex(checkBox:getTag() or 0)
	end
end

function CommonPageViewIndicator:onPageEvent(sender, eventType)
	if self._eventListen then
		self._eventListen(sender, eventType)
	end
    if eventType == ccui.PageViewEventType.turning and self._pageView == sender then
        local pageIndex = sender:getCurrentPageIndex()
        self:setCurrentPageIndex(pageIndex)
    end
end

function CommonPageViewIndicator:_createCloneNode(index,cloneNode)
    local instNode = cloneNode:clone()
    instNode:setTag(index)
    return instNode
end
-- 0 开始
function CommonPageViewIndicator:setPageViewIndex(index)
	if index and index < #self._indicatorViews then
		if self._pageView then
			self._pageView:setCurrentPageIndex(index)
			if self._eventListen then
				self._eventListen(self._pageView, ccui.PageViewEventType.turning)
			end
		end
		self:setCurrentPageIndex(index)
	end
end


return CommonPageViewIndicator
