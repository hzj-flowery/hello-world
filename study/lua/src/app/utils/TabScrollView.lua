
-- TabScrollView

--[[
	CommonScrollView辅助类
    根据一个CommonScrollView的Node，创建一系列CommonScrollView，并统一管理
]]

local TabScrollView = class("TabScrollView")
local param = {
    template = nil,
    updateFunc = nil,
    selectFunc = nil,
	touchFunc =nil,
	scrollFunc = nil,
}
function TabScrollView:ctor(listView, scrollParam, tabIndex)
   self._listViewList = self._listViewList or {}
   self:_setTemplate(listView,
        scrollParam.template,
        scrollParam.updateFunc,
        scrollParam.selectFunc,
		scrollParam.touchFunc,
		scrollParam.scrollFunc,
        tabIndex)
end

function TabScrollView:hideAllView( ... )

	for i, view in pairs(self._listViewList) do
		view:setVisible(false)
	end
end

--这里的updateListViewEx，更新的时候不需要stopAutoScroll
function TabScrollView:updateListViewEx(tabIndex, dataCount, scrollParam)
	tabIndex = tabIndex or 1

	local listView = self:_getListView(tabIndex, scrollParam, false)
	if dataCount and dataCount > 0 then
		listView:resize(dataCount)
		listView:setVisible(true)
	else
		listView:resize(0)
		listView:setVisible(true)
	end
end


function TabScrollView:updateListView(tabIndex, dataCount, scrollParam, notScroll)
	tabIndex = tabIndex or 1

	local listView = self:_getListView(tabIndex, scrollParam, true)
	if dataCount and dataCount > 0 then
		listView:resize(dataCount, notScroll)
		listView:setVisible(true)
	else
		listView:resize(0)
		listView:setVisible(true)
	end
end

-- @Role    Change Template for mul-templat of the view
function TabScrollView:updateTemplate(template)
    -- body
    self._template = template
end

function TabScrollView:_setTemplate(listView,template,updateFunc,selectFunc,touchFunc,scrollFunc,tabIndex)
    self._srcListView = listView
    assert(self._srcListView, "init scrollView is nil")
    self._template = template
    assert(self._template, "init template is nil")

    local index = tabIndex or 1
	self._listViewList[index] = listView
    assert(self._listViewList, "init listViewList is nil")

    self._updateFunc = updateFunc
    self._selectFunc = selectFunc
	self._touchFunc = touchFunc
	self._scrollFunc = scrollFunc

    self:_setTemplateEx(listView)
end


function TabScrollView:_setTemplateEx(listView,scrollParam)
	if scrollParam then
		listView:setTemplate( scrollParam.template)
		listView:setCallback( scrollParam.updateFunc,scrollParam.selectFunc, scrollParam.scrollFunc)
		listView:setCustomCallback(scrollParam.touchFunc)
	else
	 	listView:setTemplate(self._template)
		listView:setCallback(self._updateFunc, self._selectFunc, self._scrollFunc)
		listView:setCustomCallback(self._touchFunc)
	end

end


function TabScrollView:_createListView(scrollParam)
    local root = self._srcListView:getParent()
    if root == nil then
        return
    end
    local listView = self._srcListView:clone()
    cc.bind(listView,"ScrollView")
    self:_setTemplateEx(listView,scrollParam)
    root:addChild(listView)
    return listView
end

function TabScrollView:getListView( index )
	-- body
	local listView = self._listViewList[index]
	return listView
end

function TabScrollView:stopAllScroll()
	for i, view in pairs(self._listViewList) do
        view:stopAutoScroll()
	end
end
function TabScrollView:_getListView(index, scrollParam, stopScroll)
	self._listViewList = self._listViewList or {}
	for i, view in pairs(self._listViewList) do
		view:setVisible(false)

		if stopScroll then
        	view:stopAutoScroll()
		end
	end

	local listView = self._listViewList[index]
	if listView == nil then
		listView = self:_createListView(scrollParam)
		self._listViewList[index] = listView
	end
	return listView
end




return TabScrollView
