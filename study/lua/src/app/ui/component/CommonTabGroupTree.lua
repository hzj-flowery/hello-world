--标签树结构
--大标签内有子标签--嵌套关系
local CommonTabGroup = import(".CommonTabGroup")
local CommonTabGroupTree = class("CommonTabGroupTree", CommonTabGroup)
--[[
local groupData = {
    [1] = {
        name = "xxx",
        type = 1,
        cfgId = 111,
        isMain = true,
        subList =  {
            [1] = {
                name = "",
                type =1,
                cfgId = 222,
            },
            [2] ={

            },
        },
    }
}
]]

local EXPORTED_METHODS = {
    "getGroupDataByIndex",
    "openTreeTab",
}

function CommonTabGroupTree:ctor()
    CommonTabGroupTree.super.ctor(self)
    self._currSelectIndex = 1
end


function CommonTabGroupTree:recreateTabs(param,containerSize)
    if self._tabList then
        for index ,value in ipairs(self._tabList) do
            if  value.panelWidget:getName() ~= "Panel_tab" or value.panelWidget:getName() ~= "Panel_tab_sub" then
                value.panelWidget:removeFromParent()
            end
        end
    end
    self:_init(param)
    self:_closeAll()
end

function CommonTabGroupTree:_init(param)
    --assert(param, param.rootNode, "param.rootNode is not nil", param.rootNode)l;
    self._groupIndex = param.tabIndex or 1
    self._containerStyle = param.containerStyle or 1
    self._scrollNode   = ccui.Helper:seekNodeByName(self._target, "ScrollViewTab")
    self._tabGroup = ccui.Helper:seekNodeByName(self._target, "TabGroup")
    self._groupData = param.groupData or {}

    self._imageList = {}
    self._nodeOffset = 0
    self._textList = param.textList or {}
    self._openStateList = param.openStateList or {}
    self._isVertical = 1
    self._callback  = param.callback


    self._template = ccui.Helper:seekNodeByName(self._target, "Panel_tab")
    self._template:setVisible(false)
    self._templateSub = ccui.Helper:seekNodeByName(self._target, "Panel_tab_sub")
    self._templateSub:setVisible(false)

    

    self._brightTabItemCallback = handler(self,self._textImgBrightTabItemCallback)
    

    self._tabList = {}
 
    self:_initTabList()

    self:setCustomColor({
		{cc.c3b(0xa7, 0xb4, 0xd8)},
		{cc.c3b(0xb4, 0x26, 0x00)},
		{cc.c3b(0xa9, 0x6a, 0x2a)},
	})
end

function CommonTabGroupTree:_initTabList()
    --计算滚动高度
    self:_procTextList()
    self:_computeScrollContentSize()
end


function CommonTabGroupTree:bind(target)
	CommonTabGroupTree.super.bind(self, target)
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonTabGroupTree:unbind(target)
    CommonTabGroupTree.super.unbind(self, target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonTabGroupTree:_computeScrollContentSize()    
    self._scrollNode:setScrollBarEnabled(false)
    local maxHeight = 0
    for i, tabItem in ipairs(self._tabList) do
        if tabItem.panelWidget:isVisible() == true then
            tabItem.panelWidget:setPositionY(-maxHeight)
            maxHeight = maxHeight + tabItem.panelWidget:getContentSize().height
        end
    end

    local rootNodeSize = self._scrollNode:getContentSize()
    local scrollHeight = rootNodeSize.height
    --self._scrollNode:setTouchEnabled(false)

    local scrollHeight = math.max(maxHeight,rootNodeSize.height)

    
    self._scrollNode:setInnerContainerSize(cc.size(rootNodeSize.width,scrollHeight))
    self._tabGroup:setPositionY(scrollHeight)
end

function CommonTabGroupTree:getGroupDataByIndex( index )
    local textKey = self._textList[index]

    for i, mainData in pairs(self._groupData) do
        if mainData.tabIndex == index then
            return mainData
        end
        for j, subData in ipairs(mainData.subList) do
            if subData.tabIndex == index then
                return subData
            end
        end
    end
    
    assert(false, "can not find groupData by index "..index)
    return nil
end

function CommonTabGroupTree:_inTheSubList(index)
    local groupData = self:getGroupDataByIndex(index)
    if groupData then
        return not groupData.isMain, groupData
    end
end

function CommonTabGroupTree:_getMainDataByType(mainType)
    for i, mainData in pairs(self._groupData) do
        if mainData.type == mainType then
            return mainData
        end
    end
    return nil
end

function CommonTabGroupTree:_getWidgetByIndex( tabIndex )
    -- body

    if self._tabList == nil then
        return
    end

    for i, tableItem in ipairs(self._tabList) do
        if tableItem and tableItem.panelWidget:getTag() == tabIndex then
            return tableItem
        end
    end

end

function CommonTabGroupTree:_getSubWidgetList(tabIndex)
    local groupData =  self:getGroupDataByIndex(tabIndex)
    local mainData = self:_getMainDataByType(groupData.type)
    local widgetList = {}

    for i, subData in ipairs(mainData.subList) do
        local widget = self:_getWidgetByIndex(subData.tabIndex)
        if widget then
            table.insert(widgetList, widget)
        end
    end
    return widgetList
end


function CommonTabGroupTree:_createCloneNode(index,cloneNode)
    local instNode = cloneNode:clone()
    instNode:setName("Panel_tab"..index)
    return instNode
end

function CommonTabGroupTree:_procTextList()
    local cloneNode = self._template
    local cloneSubNode = self._templateSub
    local loopCount =  self:_getNeedCreateTabCount()

    for i = 1, loopCount do
        local tabNode = nil
        local groupData = self:getGroupDataByIndex(i)
        if groupData.isMain == false then --创建子标签页
            tabNode = self:_createCloneNode(i, cloneSubNode)
        else
            tabNode = self:_createCloneNode(i, cloneNode)
        end
        local tabItem = self:_createTabItem(i, tabNode)
        self:_updateTabItem(tabItem)
        self._tabGroup:addChild(tabNode)
        table.insert(self._tabList, tabItem)
    end

end

function CommonTabGroupTree:_createTabItem(index,tabNode)
    local tabItem = self:_createTextImgListTabItem(tabNode) 
    dump(tabItem)
    tabItem.index = index
    tabItem.panelWidget = tabNode

    tabNode:setTag(index)
    tabNode:setVisible(true)
      --添加点击监听
    local panelWidget = tabItem.panelWidget
    panelWidget:addClickEventListenerEx(handler(self,self._onTouchCallBack), true, nil, 0)
    panelWidget:setSwallowTouches(false) 
    return tabItem
end

function CommonTabGroupTree:_getNeedCreateTabCount()
    local num = #self._textList
    return  num
end


function CommonTabGroupTree:_updateTabItem(tabItem)
    --设置内容
    self:_updateTextImgTab(tabItem)
    
    --高亮按钮
    self:_textImgBrightTabItemCallback(tabItem,self._groupIndex == tabItem.index)
end

function CommonTabGroupTree:openTreeTab( tabIndex )
    -- body
    self:_openTreeTab(tabIndex)
end
--处理主Tab，收起或者打开
function CommonTabGroupTree:_procMainTab(tabIndex)
     
     local function isOpen( tabIndex )
         local list = self:_getSubWidgetList(tabIndex)
         for i, tabItem in ipairs(list) do
            return tabItem.panelWidget:isVisible()
         end
         return false
     end
     if isOpen(tabIndex) then
        self:_closeTreeTab(tabIndex)
     else
        self:_openTreeTab(tabIndex)
     end
end

--打开树节点
function CommonTabGroupTree:_openTreeTab(tabIndex)
    self:_closeAll()
    local list = self:_getSubWidgetList(tabIndex)
    for i, tabItem in ipairs(list) do
         tabItem.panelWidget:setVisible(true)
    end
    self:_computeScrollContentSize()
end

--收起树节点
function CommonTabGroupTree:_closeTreeTab(tabIndex)
    self:_closeAll()
    local list = self:_getSubWidgetList(tabIndex)
    for i, tabItem in ipairs(list) do
         tabItem.panelWidget:setVisible(false)
    end
    self:_computeScrollContentSize()
end

function CommonTabGroupTree:_closeAll()
    local index = 0
    for i, keyName in ipairs(self._textList) do
        local groupData = self:getGroupDataByIndex(i)
        if groupData and groupData.isMain == false then
            local tabItem = self._tabList[i]
            if tabItem then
                tabItem.panelWidget:setVisible(false)
            end
        end
    end
end

--重载选中处理逻辑
function CommonTabGroupTree:setTabIndex(tabIndex)
    if tabIndex and tabIndex <= #self._tabList then
        local isSuccess = true
        local select = self._tabList[tabIndex]

        local openState = self._openStateList[tabIndex]
        if openState and openState.noOpen == true then
            if openState.noOpenTips then G_Prompt:showTip(openState.noOpenTips) end            
            return false
        end
        
        local isSubIndex, groupData =  self:_inTheSubList(tabIndex)
        if self._callback and type( self._callback ) == "function" then
            isSuccess = self._callback(tabIndex, select.panelWidget, groupData)
            isSuccess = isSuccess == nil or isSuccess
        end
        
        if isSuccess then
            for i, tabItem in ipairs(self._tabList) do
                self:_textImgBrightTabItemCallback(tabItem,false)
            end
            self:_textImgBrightTabItemCallback(select,true)
            
            if isSubIndex then
                local mainData = self:_getMainDataByType(groupData.type)
                local widget = self:_getWidgetByIndex(mainData.tabIndex)
                self:_textImgBrightTabItemCallback(widget,true)
            else
                self:_procMainTab(tabIndex)
            end
        end
        
        return isSuccess
    end
    return false
end

return CommonTabGroupTree