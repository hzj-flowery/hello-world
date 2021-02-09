--构造时传入的参数列表
local CTOR_PARAM = {
    tabIndex = 1, --默认tab索引
    containerStyle = 1,
    --1是节点，2是滚动视图
    isVertical = 1,
    rootNode = nil, --根节点
    offset = 0, -- tab间隔像素
    textList = {"tab1", "tab2", "tab3"}, --tab文本描述信息
    openStateList = {},
    --{{noOpen=true,noOpenTips=""},{noOpen=true,noOpenTips=""}}
    imageList = {}, --tab 图片路径（文字图片）
    callback = nil, --点击回调函数
    createTabItemCallback = nil,
    brightTabItemCallback = nil,
    updateTabItemCallback = nil,
    getTabCountCallback = nil,
    cloneCallback = nil
}

local CommonTabGroup = class("CommonTabGroup")

CommonTabGroup.BUTTON_STATE_NORMAL = 1
CommonTabGroup.BUTTON_STATE_SELECT = 2
CommonTabGroup.BUTTON_STATE_DISABLE = 3

local EXPORTED_METHODS = {
    "getRootNode",
    "setTabIndex",
    "getTabCount",
    "recreateTabs",
    "setRedPointByTabIndex",
    "setImageTipByTabIndex",
    "getTabItem",
    "playEnterEffect",
    "addCustomTag",
    "removeCustomTag",
    "setCustomColor",
    "setDoubleTipsByTabIndex"
}

function CommonTabGroup:ctor()
    self._target = nil
    self._tabList = {}
end

function CommonTabGroup:bind(target)
    self._target = target
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonTabGroup:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonTabGroup:_init(param)
    --assert(param, param.rootNode, "param.rootNode is not nil", param.rootNode)
    self._groupIndex = param.tabIndex or CTOR_PARAM.tabIndex
    self._scrollNode = param.rootNode or self._target --grop组件基础Node
    self._nodeOffset = param.offset or CTOR_PARAM.offset
    self._textList = param.textList or CTOR_PARAM.textList
    self._imageList = param.imageList or CTOR_PARAM.imageList
    self._openStateList = param.openStateList or CTOR_PARAM.openStateList
    self._containerStyle = param.containerStyle or CTOR_PARAM.containerStyle
    self._isVertical = param.isVertical or CTOR_PARAM.isVertical
    self._callback = param.callback

    self._isSwallow = param.isSwallow

    -- ======================start====================
    --TODO 改成调用约定方法
    self._brightTabItemCallback = param.brightTabItemCallback
    if self._brightTabItemCallback == nil then
        self._brightTabItemCallback = handler(self, self._textImgBrightTabItemCallback)
    end

    self._createTabItemCallback = param.createTabItemCallback
    if self._createTabItemCallback == nil then
        self._createTabItemCallback = handler(self, self._createTextImgListTabItem)
    end

    self._updateTabItemCallback = param.updateTabItemCallback
    if self._updateTabItemCallback == nil then
        self._updateTabItemCallback = handler(self, self._updateTextImgTab)
    end

    self._getTabCountCallback = param.getTabCountCallback

    self._cloneCallback = param.cloneCallback
    if self._cloneCallback == nil then
        self._cloneCallback = handler(self, self._createCloneNode)
    end
    -- ======================end====================

    self._template = ccui.Helper:seekNodeByName(self._target, "Panel_tab")
    self._template:setVisible(false)

    self._tabList = {}

    self:_initTabList()
end

function CommonTabGroup:recreateTabs(param)
    if self._tabList then
        for index, value in ipairs(self._tabList) do
            self:removeCustomTag(index)
            if value.panelWidget:getName() ~= "Panel_tab" then
                value.panelWidget:removeFromParent()
            end
        end
    end
    self:_init(param)
end

function CommonTabGroup:getTabCount()
    return #self._tabList
end

function CommonTabGroup:_getNeedCreateTabCount()
    if self._getTabCountCallback then
        return self._getTabCountCallback()
    end
    local num = math.max(#self._textList, #self._imageList)
    return num
end

function CommonTabGroup:_initTabList()
    if self._containerStyle == 2 then
        self._scrollNode:setScrollBarEnabled(false)
        --计算滚动高度
        local templateNodeSize = self._template:getContentSize()
        local rootNodeSize = self._scrollNode:getContentSize()
        if self._isVertical == 2 then --水平
            local loopCount = self:_getNeedCreateTabCount()
            local needWidth = loopCount * (templateNodeSize.width + self._nodeOffset)
            local scrollWidth = math.max(needWidth, rootNodeSize.width)
            local scrollHeight = rootNodeSize.height
            self._scrollNode:setInnerContainerSize(cc.size(scrollWidth + 20, scrollHeight))

            self._target:setPositionX(math.abs(rootNodeSize.width - needWidth) + 5)
        else --垂直
            local loopCount = self:_getNeedCreateTabCount()
            local needHeight = loopCount * (templateNodeSize.height + self._nodeOffset) - self._nodeOffset
            local scrollHeight = math.max(needHeight, rootNodeSize.height)
            local scrollWidth = rootNodeSize.width
            self._scrollNode:setInnerContainerSize(cc.size(scrollWidth, scrollHeight))

            self._target:setPositionY(scrollHeight)
        end
    end

    self:_procTextList()
end

function CommonTabGroup:_procTextList()
    local cloneNode = self._template
    local loopCount = self:_getNeedCreateTabCount()
    for i = 1, loopCount do
        if i > 1 then
            local tabNode = self._cloneCallback(i, cloneNode)
            local tabItem = self:_createTabItem(i, tabNode)
            self:_updateTabItem(tabItem)
            self._target:addChild(tabNode)
            table.insert(self._tabList, tabItem)
        else
            --更新第一个
            local tabItem = self:_createTabItem(i, cloneNode)
            self:_updateTabItem(tabItem)
            table.insert(self._tabList, tabItem)
        end
    end
end

function CommonTabGroup:_createTabItem(index, tabNode)
    local tabItem = self._createTabItemCallback(tabNode)
    tabItem.index = index
    tabItem.panelWidget = tabNode

    tabNode:setTag(index)
    tabNode:setVisible(true)

    --添加点击监听
    local panelWidget = tabItem.panelWidget
    panelWidget:addClickEventListenerEx(handler(self, self._onTouchCallBack), true, nil, 0)
    panelWidget:setSwallowTouches(self._isSwallow or false)
    return tabItem
end

function CommonTabGroup:_createCloneNode(index, cloneNode)
    local instNode = cloneNode:clone()
    instNode:setName("Panel_tab" .. index)
    return instNode
end

function CommonTabGroup:_createTextImgListTabItem(tabNode)
    local tabItem = {}
    local instNode = tabNode
    tabItem.panelWidget = instNode
    tabItem.textWidget = ccui.Helper:seekNodeByName(instNode, "Text_desc")
    tabItem.imageWidget = ccui.Helper:seekNodeByName(instNode, "Image_desc")
    tabItem.normalImage = ccui.Helper:seekNodeByName(instNode, "Image_normal")
    tabItem.downImage = ccui.Helper:seekNodeByName(instNode, "Image_down")
    tabItem.imageSelect = ccui.Helper:seekNodeByName(instNode, "Image_select")
    tabItem.redPoint = ccui.Helper:seekNodeByName(instNode, "Image_RedPoint")
    tabItem.doubleTips = ccui.Helper:seekNodeByName(instNode, "Image_DoubleTips")
    return tabItem
end

function CommonTabGroup:setDoubleTipsByTabIndex(tabIndex, show)
    local item = self:getTabItem(tabIndex)
    if not item then
        return
    end
    if item.doubleTips then
        item.doubleTips:setVisible(show)
    end
end

function CommonTabGroup:getTabItem(tabIndex)
    if tabIndex and tabIndex <= #self._tabList then
        return self._tabList[tabIndex]
    end
    return nil
end

function CommonTabGroup:setRedPointByTabIndex(tabIndex, show, posPercent)
    local item = self:getTabItem(tabIndex)
    if not item then
        return
    end
    if item.redPoint then
        item.redPoint:setVisible(show)
    else
        if self._isVertical == 2 then -- 水平
            self:_showRedPoint(item.panelWidget, show, posPercent or cc.p(0.92, 0.8))
        else
            self:_showRedPoint(item.panelWidget, show, posPercent or cc.p(0.15, 0.8))
        end
    end
end

function CommonTabGroup:setImageTipByTabIndex(tabIndex, show, posPercent, texture)
    local item = self:getTabItem(tabIndex)
    if not item then
        return
    end
    if self._isVertical == 2 then -- 水平
        self:_showImageTip(item.panelWidget, show, posPercent or cc.p(0.88, 0.62), texture)
    else
        self:_showImageTip(item.panelWidget, show, posPercent or cc.p(0.15, 0.8), texture)
    end
end

function CommonTabGroup:_showRedPoint(node, show, posPercent)
    if show then
        local redImg = node:getChildByName("redPoint")
        if not redImg then
            local UIHelper = require("yoka.utils.UIHelper")
            redImg = UIHelper.createImage({texture = Path.getUICommon("img_redpoint")})
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

function CommonTabGroup:_showImageTip(node, show, posPercent, texture)
    if show then
        local imgTip = node:getChildByName("image_tip")
        if not imgTip then
            local UIHelper = require("yoka.utils.UIHelper")
            imgTip = UIHelper.createImage({texture = texture})
            imgTip:setName("image_tip")
            node:addChild(imgTip)
            if posPercent then
                UIHelper.setPosByPercent(imgTip, posPercent)
            end
        end
        imgTip:setVisible(true)
    else
        local imgTip = node:getChildByName("image_tip")
        if imgTip then
            imgTip:setVisible(false)
        end
    end
end

function CommonTabGroup:_updateTabItem(tabItem)
    --设置内容
    self._updateTabItemCallback(tabItem)

    --设置位置
    self:_updateTabItemPostion(tabItem)

    if self._brightTabItemCallback then
        self._brightTabItemCallback(tabItem, self._groupIndex == tabItem.index)
    end
end

function CommonTabGroup:_updateTextImgTab(tabItem)
    local index = tabItem.index
    local text = self._textList[index]
    local image = self._imageList[index]

    local textWidget = tabItem.textWidget
    local imageWidget = tabItem.imageWidget
    local normalImage = tabItem.normalImage
    local downImage = tabItem.downImage
    local panelWidget = tabItem.panelWidget
    normalImage:setVisible(true)
    downImage:setVisible(false)

    if textWidget and text then
        textWidget:setString(text)
    end

    if imageWidget and image then
        imageWidget:loadTexture(image)
        imageWidget:setVisible(true)
    end
end

function CommonTabGroup:_updateTabItemPostion(tabItem)
    local index = tabItem.index
    local panelWidget = tabItem.panelWidget
    local contentSize = panelWidget:getContentSize()

    local offsetX, offsetY = 0, 0

    --处理Node位置
    if self._isVertical == 2 then
        offsetX = (index - 1) * (contentSize.width + self._nodeOffset)
    else
        offsetY = -(index - 1) * (contentSize.height + self._nodeOffset)
    end

    panelWidget:setPositionX(offsetX)
    panelWidget:setPositionY(offsetY)
end

-- isIncludeHalf 有部分包含在可见区域内
function CommonTabGroup:_isTabInVisibleArea(tabItem, isJump, isIncludeHalf)
    local panelWidget = tabItem.panelWidget
    local panelSize = panelWidget:getContentSize()
    local size = self._scrollNode:getInnerContainerSize()
    local rootNodeSize = self._scrollNode:getContentSize()
    local itemMinPos, itemMaxPos = 0, 0
    local scrollSize, screenSize = 0
    if self._isVertical == 2 then --水平
        itemMinPos = panelWidget:getPositionX()
        itemMaxPos = itemMinPos + panelSize.width
        screenSize = rootNodeSize.width
        scrollSize = size.width
    else
        itemMinPos = -panelWidget:getPositionY()
        itemMaxPos = itemMinPos + panelSize.height
        screenSize = rootNodeSize.height
        scrollSize = size.height
    end

    local visibleMaxPos = 0
    local visibleMinPos = 0
    if self._isVertical == 2 then --水平
        local x = self._scrollNode:getInnerContainer():getPositionX()
        visibleMinPos = -x
        visibleMaxPos = visibleMinPos + rootNodeSize.width
    else --垂直
        local y = self._scrollNode:getInnerContainer():getPositionY()
        visibleMaxPos = size.height + y
        visibleMinPos = visibleMaxPos - rootNodeSize.height
    end
    if isIncludeHalf then
        if
            (itemMinPos > visibleMinPos or itemMinPos < visibleMaxPos) and
                (itemMaxPos < visibleMaxPos or itemMaxPos > visibleMinPos)
         then
            return true
        end
    else
        if
            (itemMinPos > visibleMinPos and itemMinPos < visibleMaxPos) and
                (itemMaxPos < visibleMaxPos and itemMaxPos > visibleMinPos)
         then
            return true
        end
    end

    if isJump then
        local scrollValue = 0
        if self._isVertical == 2 then --水平
            scrollValue = -itemMinPos
        else
            scrollValue = -scrollSize + (itemMinPos + screenSize)
        end
        local maxScrollValue = 0
        local minScrollValue = -(scrollSize - screenSize)
        scrollValue = math.min(scrollValue, maxScrollValue)
        scrollValue = math.max(scrollValue, minScrollValue)
        if self._isVertical == 2 then --水平
            self._scrollNode:getInnerContainer():setPositionX(scrollValue)
        else
            self._scrollNode:getInnerContainer():setPositionY(scrollValue)
        end
    end

    return false
end

function CommonTabGroup:_onTouchCallBack(sender, state)
    -----------防止拖动的时候触发点击
    if (state == ccui.TouchEventType.began) then
        return true
    elseif (state == ccui.TouchEventType.ended) or not state then
        local moveOffsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
        local moveOffsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            local clickIndex = sender:getTag()

            self:setTabIndex(clickIndex, false)
        end
    end
end

function CommonTabGroup:setCustomColor(customColorArray)
    self._customColor = customColorArray
end

function CommonTabGroup:_getTextTabColors(state)
    if self._customColor then
        if self._customColor[state] then
            return self._customColor[state][1], self._customColor[state][2]
        end
    end

    if self._isVertical == 2 then --水平
        if state == CommonTabGroup.BUTTON_STATE_NORMAL then
            return Colors.TAB_TWO_NORMAL
        elseif state == CommonTabGroup.BUTTON_STATE_SELECT then
            return Colors.TAB_TWO_SELECTED,Colors.TAB_TWO_SELECTED_OUTLINE
        else
            return Colors.TAB_TWO_DISABLE,Colors.TAB_TWO_DISABLE_OUTLINE
        end
    else
        if state == CommonTabGroup.BUTTON_STATE_NORMAL then
            return cc.c3b(0xa7, 0xb4, 0xd8)
        elseif state == CommonTabGroup.BUTTON_STATE_SELECT then
            return cc.c3b(0xb4, 0x26, 0x00)
        else
            return Colors.TAB_ONE_DISABLE
        end
    end
end

function CommonTabGroup:_textImgBrightTabItemCallback(tabItem, bright)
    local disable = false
    local openState = self._openStateList[tabItem.index]
    if openState and openState.noOpen == true then
        disable = true
    end

    local buttonState = CommonTabGroup.BUTTON_STATE_NORMAL
    local ShaderHalper = require("app.utils.ShaderHelper")
    ShaderHalper.filterNode(tabItem.normalImage, "", true)
    if disable then
        buttonState = CommonTabGroup.BUTTON_STATE_DISABLE
        tabItem.normalImage:setVisible(true)
        tabItem.downImage:setVisible(false)
        ShaderHalper.filterNode(tabItem.normalImage, "gray")
    elseif bright then
        buttonState = CommonTabGroup.BUTTON_STATE_SELECT
        tabItem.normalImage:setVisible(false)
        tabItem.downImage:setVisible(true)
    else
        tabItem.normalImage:setVisible(true)
        tabItem.downImage:setVisible(false)
    end
    if tabItem.imageSelect then
        tabItem.imageSelect:setVisible(false)
    -- tabItem.imageSelect:setVisible( not disable and bright)
    end

    local textWidget = tabItem.textWidget
    local color, outlineColor = self:_getTextTabColors(buttonState)
    textWidget:setColor(color)
    -- if outlineColor then
    --     textWidget:enableOutline(outlineColor, 2)
    -- else
    --     textWidget:disableEffect(cc.LabelEffect.OUTLINE)
    -- end
end

function CommonTabGroup:setTabIndex(tabIndex, isJump)
    if tabIndex and tabIndex <= #self._tabList then
        local isSuccess = true
        local select = self._tabList[tabIndex]

        local openState = self._openStateList[tabIndex]
        if openState and openState.noOpen == true then
            if openState.noOpenTips then
                G_Prompt:showTip(openState.noOpenTips)
            end
            return false
        end

        if self._callback and type(self._callback) == "function" then
            isSuccess = self._callback(tabIndex, select.panelWidget)
            isSuccess = isSuccess == nil or isSuccess
        end

        dump(isSuccess)
        if isSuccess then
            --设置滚动位置确保标签可见
            if isJump == nil then
                isJump = true
            end
            if isJump and self._containerStyle == 2 then
                self:_isTabInVisibleArea(select, isJump)
            end

            for i, tabItem in ipairs(self._tabList) do
                if self._brightTabItemCallback then
                    self._brightTabItemCallback(tabItem, false)
                end
            end

            if self._brightTabItemCallback then
                self._brightTabItemCallback(select, true)
            end
        end

        return isSuccess
    end
    return false
end

function CommonTabGroup:getRootNode()
    return self._target
end

-- 播放进场特效
function CommonTabGroup:playEnterEffect(movingName, interval)
    if not movingName or not interval then
        return
    end

    local loopCount = self:_getNeedCreateTabCount()
    local firstIndex = nil
    self._playEnterEffectNodes = {}

    local isNotScoll = self._scrollNode.getInnerContainerSize == nil

    for i = 1, loopCount do
        local item = self:getTabItem(i)
        if item then
            if isNotScoll or self:_isTabInVisibleArea(item, nil, true) then
                if not firstIndex then
                    firstIndex = i
                end
                local widget = item.panelWidget
                widget:setVisible(false)
                local delayAction = cc.DelayTime:create(interval * (i - firstIndex))
                local curIndex = i
                local callFunc =
                    cc.CallFunc:create(
                    function()
                        local tabItem = self:getTabItem(curIndex)
                        if item then
                            local widget = item.panelWidget
                            widget:setVisible(true)
                            local effectSingle = G_EffectGfxMgr:applySingleGfx(widget, movingName, nil, nil, nil)
                        end
                    end
                )
                local action = cc.Sequence:create(delayAction, callFunc)
                widget:runAction(action)
            end
        end
    end
end
--添加在定义标签
function CommonTabGroup:addCustomTag(tabIndex, params)
    local tabItem = self:getTabItem(tabIndex)
    if not tabItem or not params then
        return
    end

    if tabItem.customTag then
        return
    end

    local UIHelper = require("yoka.utils.UIHelper")
    tabItem.customTag = UIHelper.createImage(params)
    tabItem.panelWidget:addChild(tabItem.customTag)
end

function CommonTabGroup:removeCustomTag(tabIndex)
    local tabItem = self:getTabItem(tabIndex)
    if tabItem and tabItem.customTag then
        tabItem.customTag:removeFromParent()
    end
end

return CommonTabGroup
