local CommonSweep = class("CommonSweep")

local EXPORTED_METHODS = {
    "setTitle",
    "pushItem",
    "setCloseFunc",
    "scrollToBottom",
    "clearDropList",
    "hideCloseBtn",
    "insertItem",
    "setCloseVisible",
}

function CommonSweep:ctor()
	self._target = nil
end

function CommonSweep:_init()
    self._commonNodeBk = ccui.Helper:seekNodeByName(self._target,"CommonNodeBk")
    cc.bind(self._commonNodeBk, "CommonNormalSmallPop")
    -- self._commonNodeBk:hideCloseBtn()

    self._listDrop = ccui.Helper:seekNodeByName(self._target, "ListDrop")
    self._listDrop:setScrollBarEnabled(false)

    -- self._btnClose = ccui.Helper:seekNodeByName(self._target, "Button_sweep_close")
end

function CommonSweep:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonSweep:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonSweep:setTitle(title)
    self._commonNodeBk:setTitle(title)
end

function CommonSweep:pushItem(item)
    self._listDrop:pushBackCustomItem(item)
    self._listDrop:scrollToBottom(0,false)
    self._listDrop:doLayout()
end

-- self._reportList:insertCustomItem(newItem, self._currentTime - 1)
-- self:performWithDelay(function ()
--     self._reportList:scrollToBottom(0.1 ,false)
-- end, 0.1)
-- self._reportList:refreshView()

function CommonSweep:insertItem(item, idx)
    self._listDrop:insertCustomItem(item, idx)
    
end

function CommonSweep:scrollToBottom()
    self._listDrop:scrollToBottom(0, true)
end

function CommonSweep:setCloseFunc(callback)
    self._commonNodeBk:addCloseEventListener(callback)
	-- if self._btnClose then
	-- 	self._btnClose:addClickEventListenerEx(callback, true, nil, 0)
	-- end
end

function CommonSweep:clearDropList()
	self._listDrop:removeAllItems()
	self._listDrop:addScrollViewEventListener(function(sender, eventType) end)
    self._listDrop:addEventListener(function(sender, eventType) end)
    if self._direction == ccui.ListViewDirection.vertical then
    	self._listDrop:jumpToTop()
	elseif self._direction == ccui.ListViewDirection.horizontal then
    	self._listDrop:jumpToLeft()
	end
end

function CommonSweep:hideCloseBtn()
	self._commonNodeBk:hideCloseBtn()
end

function CommonSweep:setCloseVisible(v)
    self._commonNodeBk:setCloseVisible(v)
end

return CommonSweep
