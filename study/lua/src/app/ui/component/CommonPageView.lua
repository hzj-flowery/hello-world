local CommonPageView = class("CommonPageView")

local INVALID_INDEX =  -2

local EXPORTED_METHODS = {
    "initPageView",
    "refreshPage",
	"scrollToPageEx",
	"setCurrentPageIndexEx",
	"getItemEx",
    "getItemsEx",
    "getPageSize",
}

function CommonPageView:ctor()
	self._target = nil
    self._data = nil
    self._updateListener = nil
    self._eventListener = nil
    self._template = nil
    self._items = {}
    self._time = 0
    self._isAutoUpdate = false
end

function CommonPageView:_init()
    
	local node = display.newNode()
    self._target:getParent():addChild(node)
    node:scheduleUpdateWithPriorityLua(handler(self,self._onUpdate),0)
    self._target:addEventListener(handler(self, self._onPageViewEvent))
    
end

function CommonPageView:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPageView:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonPageView:initPageView(template,updateListener,eventListener,isAutoUpdate )
    self._template = template
    self._updateListener = updateListener
    self._eventListener = eventListener
    self._isAutoUpdate = isAutoUpdate
end

--只创建widget，减少开始的加载量
function CommonPageView:_createPageItem()
    local pageViewSize = self._target:getContentSize()
	local widget = ccui.Widget:create()
	widget:setContentSize(pageViewSize.width, pageViewSize.height)
	return widget
end

function CommonPageView:refreshPage(pageData)
    self._data = pageData
    self._items = {}
    self._time = 0
    self._target:removeAllPages()
    local pageSize = self:getPageSize()
    for i = 1,pageSize,1 do
        local item = self:_createPageItem()
        self._target:addPage(item)
    end

end

function CommonPageView:scrollToPageEx(index)
    if not self:_checkIndex(index) then
        return 
    end
    local currPageIndex  = self:_getCurrentPageIndex()
    if currPageIndex == index then
        return 
    end
    self:_updatePages(index)
    self._target:scrollToPage(index)
end

--index:从0开始
function CommonPageView:setCurrentPageIndexEx(index)
    if not self:_checkIndex(index) then
        return 
    end
    local currPageIndex = self:_getCurrentPageIndex()
    if currPageIndex == index  then
        return 
    end
    self:_updatePages(index)
    self._target:setCurrentPageIndex(index)
end


function CommonPageView:_updatePages(index)
    index = index or self._target:getCurrentPageIndex()
    for  i = index -1 ,index + 1,1 do
        if self:_checkIndex(i) then
           self:_updateItem(i)
        end
    end
end

function CommonPageView:_updateItem(i)
    if self._items[i+1] then
        return
    end
    local item = self._target:getItem(i) 
    local template = self._template.new()
    item:addChild(template)
    local size = item:getContentSize()
    template:setPosition(size.width * 0.5,size.height * 0.5)
    self._items[i+1] = template
    self._updateListener(template,i)
    return template
end

function CommonPageView:_getCurrentPageIndex()
    return self._target:getCurrentPageIndex()
end

function CommonPageView:getItemEx(index,forceUpdate)
    local item = self._items[index+1]--self._target:getItem(index)
    if not item and forceUpdate == true then
        item = self:_updateItem(index)
    end
   return item
end

function CommonPageView:getItemsEx(...)
    return self._items --self._target:getItems()
end

function CommonPageView:getPageSize()
    return self._data and #self._data or 0
end

--index从0开始
function CommonPageView:_checkIndex(index)
    if index < 0 or index >= self:getPageSize() then
        return false
    end
    return true
end

---pageview页码变化
function CommonPageView:_onPageViewEvent(sender, eventType)
    self:_updatePages()
    if self._eventListener then
        self._eventListener(sender, eventType)
    end
end


function CommonPageView:_onUpdate(dt)
    if not self._isAutoUpdate or  not self._updateListener then
        return
    end
    self._time = self._time + dt
    if self._time < 0.1 then
        return
    end
    self._time = 0

    local currPageIndex  = self:_getCurrentPageIndex()
    self:_updateItem(currPageIndex)
    --logWarn("#########"..currPageIndex)
end

return CommonPageView

