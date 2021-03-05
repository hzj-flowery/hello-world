local CommonTabGroupScrollVertical = class("CommonTabGroupScrollVertical")
local CommonTabGroup = require("app.ui.component.CommonTabGroup")
local EXPORTED_METHODS = {
    "setTabIndex",
    "getTabCount",
    "recreateTabs",
    "setRedPointByTabIndex",
    "setImageTipByTabIndex",
    "getTabItem",
    "playEnterEffect",
    "setCustomColor",
    "setDoubleTipsByTabIndex"
}

function CommonTabGroupScrollVertical:ctor()
    self._commonTabGroup = nil
    self._scrollViewTab = nil
end

function CommonTabGroupScrollVertical:_init()
    self._commonTabGroup = ccui.Helper:seekNodeByName(self._target, "CommonTabGroup")
    if cc.isRegister("CommonTabGroupVertical") then
        cc.bind(self._commonTabGroup, "CommonTabGroupVertical")
    end
    self._scrollViewTab = ccui.Helper:seekNodeByName(self._target, "ScrollViewTab")
end

function CommonTabGroupScrollVertical:bind(target)
    self._target = target
    cc.setmethods(target, self, EXPORTED_METHODS)

    self:_init()
end

function CommonTabGroupScrollVertical:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonTabGroupScrollVertical:setTabIndex(index)
    return self._commonTabGroup:setTabIndex(index)
end

function CommonTabGroupScrollVertical:getTabCount()
    return self._commonTabGroup:getTabCount()
end

function CommonTabGroupScrollVertical:setCustomColor(colorArr)
    return self._commonTabGroup:setCustomColor(colorArr)
end

function CommonTabGroupScrollVertical:recreateTabs(param, containerSize)
    param.containerStyle = 2
    param.rootNode = self._scrollViewTab
    if containerSize then
        self._scrollViewTab:setContentSize(containerSize)
    end
    self._commonTabGroup:recreateTabs(param)
end

function CommonTabGroupScrollVertical:setRedPointByTabIndex(tabIndex, show, posPercent)
    self._commonTabGroup:setRedPointByTabIndex(tabIndex, show, posPercent)
end

function CommonTabGroupScrollVertical:setDoubleTipsByTabIndex(tabIndex, show)
    self._commonTabGroup:setDoubleTipsByTabIndex(tabIndex, show)
end

function CommonTabGroupScrollVertical:setImageTipByTabIndex(tabIndex, show, posPercent, texture)
    self._commonTabGroup:setImageTipByTabIndex(tabIndex, show, posPercent, texture)
end

function CommonTabGroupScrollVertical:getTabItem(index)
    return self._commonTabGroup:getTabItem(index)
end

function CommonTabGroupScrollVertical:playEnterEffect(movingName, interval)
    self._commonTabGroup:playEnterEffect(movingName, interval)
end

return CommonTabGroupScrollVertical
