
-- TabButtonGroup

--[[	
	TabButton辅助类
    根据一个TabButton的Node，创建一系列tabButton，并统一管理
]]

local TabButtonGroup = class("TabButtonGroup")

--构造时传入的参数列表
local CTOR_PARAM =
{
    tabIndex = 1, --默认tab索引
    tabStyle = 1, -- 1是TAB描述是文字，2是图片,3是其他
    containerStyle = 1,--1是节点，2是滚动视图
    isVertical = 1,
    rootNode = nil, --根节点
    offset   = 8, -- tab间隔像素
    textList = {"tab1", "tab2", "tab3"}, --tab文本描述信息
    imageList = {}, --tab 图片路径（文字图片）
    callback = nil, --点击回调函数
    createTabItemCallback = nil,
    brightTabItemCallback = nil,
    updateTabItemCallback = nil,
    getTabCountCallback = nil,
    cloneCallback = nil,
    
}

function TabButtonGroup:ctor(param)
    assert(param, param.rootNode, "param.rootNode is not nil", param.rootNode)

    self:_init(param)
end

function TabButtonGroup:_init(param)

    self._groupIndex = param.tabIndex or CTOR_PARAM.tabIndex
    self._rootNode   = param.rootNode  --grop组件基础Node
    self._nodeOffset = param.offset or CTOR_PARAM.offset
    self._textList = param.textList or CTOR_PARAM.textList
    self._imageList = param.imageList or CTOR_PARAM.imageList
    self._tabStyle = param.tabStyle or CTOR_PARAM.tabStyle
    self._containerStyle = param.containerStyle or CTOR_PARAM.containerStyle
    self._isVertical = param.isVertical or CTOR_PARAM.isVertical
    self._callback  = param.callback

    -- ======================start====================
    --TODO 改成调用约定方法
    self._brightTabItemCallback = param.brightTabItemCallback
    if self._brightTabItemCallback == nil and (self._tabStyle == 1 or self._tabStyle == 2) then
         self._brightTabItemCallback = handler(self,self._textImgBrightTabItemCallback)
    end

    self._createTabItemCallback = param.createTabItemCallback
      if self._createTabItemCallback == nil and (self._tabStyle == 1 or self._tabStyle == 2) then
         self._createTabItemCallback = handler(self,self._createTextImgListTabItem)
    end


    self._updateTabItemCallback = param.updateTabItemCallback
      if self._updateTabItemCallback == nil and (self._tabStyle == 1 or self._tabStyle == 2) then
         self._updateTabItemCallback = handler(self,self._updateTextImgTab)
    end

    self._getTabCountCallback = param.getTabCountCallback


     self._cloneCallback = param.cloneCallback
      if self._cloneCallback == nil then
         self._cloneCallback = handler(self,self._createCloneNode)
    end
    -- ======================end====================

    self._template = ccui.Helper:seekNodeByName(self._rootNode, "Panel_tab")
    self._template:setVisible(false)
    --local tabItem = self._createTabItemCallback(1,panelWiget) 
    --tabItem.panelWiget:setTag(1)

    self._tabList = {}
   -- self._tabList[1] = tabItem

    self:_initTabList()
end

function TabButtonGroup:recreateTabs(param)
    if self._tabList then
        for index ,value in ipairs(self._tabList) do
            if  value.panelWiget:getName() ~= "Panel_tab" then
                value.panelWiget:removeFromParent()
            end
        end
    end
    self:_init(param)

end

function TabButtonGroup:getTabCount()
    if self._tabStyle == 1 or self._tabStyle == 2 then
         return math.max(#self._textList, #self._imageList)
    end
    if self._getTabCountCallback then
        return self._getTabCountCallback()
    end
    return  1
end

function TabButtonGroup:_initTabList()

    if self._containerStyle == 2 then
        self._rootNode:setScrollBarEnabled(false)
         --计算滚动高度
        local templateNodeSize = self._template:getContentSize()
        local rootNodeSize = self._rootNode:getContentSize()
        if self._isVertical == 2 then--水平
            --todo
        else --垂直
            local loopCount = self:getTabCount()
            local needHeight =  loopCount* ( templateNodeSize.height + self._nodeOffset )  - self._nodeOffset 
            local scrollHeight = math.max(needHeight,rootNodeSize.height)
            local scrollWidth = rootNodeSize.width
            self._rootNode:setInnerContainerSize(cc.size(scrollWidth,scrollHeight))
        end
    end

    local cloneNode = self._template
    local function procTextList()
     
       local loopCount =  self:getTabCount()
       for i = 1, loopCount do
             if i > 1 then
                 local tabNode = self._cloneCallback(i, cloneNode)
                 local tabItem = self:_createTabItem(i,tabNode)
                 self:_updateTabItem(tabItem)
                 self._rootNode:addChild(tabNode)
                 table.insert(self._tabList, tabItem)
             else
                  --更新第一个
                 local tabItem = self:_createTabItem(i,cloneNode) 
        
                 self:_updateTabItem(tabItem)    
                 table.insert(self._tabList, tabItem)
             end
        end
    end

   -- if self._tabStyle == 1 or self._tabStyle == 2 then
        procTextList()
   -- end


end

function TabButtonGroup:_createTabItem(index,tabNode)
     local tabItem = self._createTabItemCallback(tabNode) 
     tabItem.index = index
     tabItem.panelWiget = tabNode

    tabNode:setTag(index)
    tabNode:setVisible(true)

      --添加点击监听
    local panelWiget = tabItem.panelWiget
    panelWiget:addClickEventListenerEx(handler(self,self._onTabClick))
    
     return tabItem
end

function TabButtonGroup:_createCloneNode(index,cloneNode)
    local instNode = cloneNode:clone()
    instNode:setName("Panel_tab"..index)
    return instNode
end

function TabButtonGroup:_createTextImgListTabItem(tabNode)
    local tabItem = {}
    local instNode = tabNode
    tabItem.panelWiget = instNode
    tabItem.textWidget = ccui.Helper:seekNodeByName(instNode, "Text_desc")
    tabItem.imageWidget = ccui.Helper:seekNodeByName(instNode, "Image_desc")
    tabItem.normalImage = ccui.Helper:seekNodeByName(instNode, "Image_normal")
    tabItem.downImage = ccui.Helper:seekNodeByName(instNode, "Image_down")
    tabItem.redPoint  = ccui.Helper:seekNodeByName(instNode, "Image_RedPoint")
    return tabItem
end

function TabButtonGroup:_updateTabItem(tabItem)
    --设置内容
    self._updateTabItemCallback(tabItem)
  
    --设置位置
    self:_updateTabItemPostion(tabItem)
    
    if self._brightTabItemCallback then
        self._brightTabItemCallback(tabItem,self._groupIndex == tabItem.index)
    end
end

function TabButtonGroup:_updateTextImgTab(tabItem)
    local index = tabItem.index
    local text = self._textList[index]
    local image = self._imageList[index]

    local imageWidget = tabItem.imageWidget


    local textWidget = tabItem.textWidget
    local normalImage = tabItem.normalImage
    local downImage =  tabItem.downImage
    local panelWiget = tabItem.panelWiget
    normalImage:setVisible(true)
    downImage:setVisible(false)
    
    if textWidget and text then
        textWidget:setString(text)
        textWidget:setColor(Colors.COLOR_TAB_ITEM)
    end

    if imageWidget and image then
        imageWidget:loadTexture(image)
        imageWidget:setVisible(true)
    end

  
end

function TabButtonGroup:_updateTabItemPostion(tabItem)
    local index = tabItem.index
    local panelWiget = tabItem.panelWiget
    local contentSize = panelWiget:getContentSize()


    if self._containerStyle == 2 then
        local offsetX,offsetY = 0,0
         local size = self._rootNode:getInnerContainerSize()
         if self._isVertical == 2 then
            --todo
         else
            offsetY = size.height - (index-1) * ( contentSize.height + self._nodeOffset )  
            panelWiget:setPositionY(offsetY)
         end
    else

        local offsetX,offsetY = 0,0

        --处理Node位置
        if self._isVertical == 2 then
            offsetX =  (index-1) * ( contentSize.width + self._nodeOffset )
        else
            offsetY = - (index-1) * ( contentSize.height + self._nodeOffset )  
        end
    
        panelWiget:setPositionX(offsetX)
        panelWiget:setPositionY(offsetY)

    end
end


function TabButtonGroup:_onTabClick(panel)
    local clickIndex = panel:getTag()
    self:setTabIndex(clickIndex)
end

function TabButtonGroup:_updateNormal(tabItem)
      tabItem.normalImage:setVisible(true)
      tabItem.downImage:setVisible(false)
end

function TabButtonGroup:_updateSelect(tabItem)
      tabItem.normalImage:setVisible(false)
      tabItem.downImage:setVisible(true)
end

function TabButtonGroup:_textImgBrightTabItemCallback(tabItem,bright)
    if bright then
        self:_updateSelect(tabItem)
    else
        self:_updateNormal(tabItem)    
    end
end

function TabButtonGroup:setTabIndex(tabIndex)
    if tabIndex and tabIndex <= #self._tabList then
        local isSuccess = true
       

        if  self._callback and type( self._callback ) == "function" then
             local select = self._tabList[tabIndex]
            isSuccess = self._callback(tabIndex, select.panelWidget)
            isSuccess = isSuccess == nil or isSuccess
        end
        
        if isSuccess then
            for i, tabItem in ipairs(self._tabList) do
                if self._brightTabItemCallback then
                    self._brightTabItemCallback(tabItem,false)
                end    
            end
            
            local select = self._tabList[tabIndex]--重新取
            if self._brightTabItemCallback then
                self._brightTabItemCallback(select,true)
            end
        
        end
        

        return isSuccess
    end
    return false
end

function TabButtonGroup:getRootNode()
    return self._rootNode 
end

function TabButtonGroup:getTabItem(tabIndex)
     if tabIndex and tabIndex <= #self._tabList then
         return self._tabList[tabIndex]
    end
    return nil
end

function TabButtonGroup:setRedPointByTabIndex(tabIndex,show,posPercent)
   local item = self:getTabItem(tabIndex)
   if item.redPoint then
      item.redPoint:setVisible(show)
   else 
        self:_showRedPoint(item.panelWiget,show,posPercent or cc.p(0.85,0.8))
   end
end

function TabButtonGroup:_showRedPoint(node,show,posPercent)
    if show then
        local redImg = node:getChildByName("redPoint")
        if not redImg then
            local UIHelper  = require("yoka.utils.UIHelper")
            redImg = UIHelper.createImage({texture = Path.getUICommon("img_redpoint") })
            redImg:setName("redPoint")
            node:addChild(redImg)
            if posPercent then
                 UIHelper.setPosByPercent(redImg, posPercent)
            end
           
        end
        redImg:setVisible(true)
    else
        local redImg = node:getChildByName("redPoint")
        if redImg then
            redImg:setVisible(false)
        end
    end
   
end

return TabButtonGroup