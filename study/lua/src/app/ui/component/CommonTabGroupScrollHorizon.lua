local CommonTabGroupScrollHorizon = class("CommonTabGroupScrollHorizon")
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

function CommonTabGroupScrollHorizon:ctor()
    self._commonTabGroup = nil
    self._scrollViewTab = nil
end

function CommonTabGroupScrollHorizon:_init()
    self._commonTabGroup = ccui.Helper:seekNodeByName(self._target, "CommonTabGroup")
    if cc.isRegister("CommonTabGroupHorizon") then
        cc.bind(self._commonTabGroup, "CommonTabGroupHorizon")
    end
    self._scrollViewTab = ccui.Helper:seekNodeByName(self._target, "ScrollViewTab")
    self._scrollViewTab:setScrollBarEnabled(false)
end

function CommonTabGroupScrollHorizon:bind(target)
    self._target = target
    cc.setmethods(target, self, EXPORTED_METHODS)

    self:_init()
end

function CommonTabGroupScrollHorizon:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonTabGroupScrollHorizon:setTabIndex(index)
    return self._commonTabGroup:setTabIndex(index)
end

function CommonTabGroupScrollHorizon:getTabCount()
    return self._commonTabGroup:getTabCount()
end

function CommonTabGroupScrollHorizon:setCustomColor(colorArr)
    return self._commonTabGroup:setCustomColor(colorArr)
end

function CommonTabGroupScrollHorizon:recreateTabs(param, containerSize)
    param.containerStyle = 2
    param.rootNode = self._scrollViewTab
    if containerSize then
        self._scrollViewTab:setContentSize(containerSize)
    end
    self._commonTabGroup:recreateTabs(param)
end

function CommonTabGroupScrollHorizon:setRedPointByTabIndex(tabIndex, show, posPercent)
    self._commonTabGroup:setRedPointByTabIndex(tabIndex, show, posPercent)
end

function CommonTabGroupScrollHorizon:setDoubleTipsByTabIndex(tabIndex, show)
    self._commonTabGroup:setDoubleTipsByTabIndex(tabIndex, show)
end

function CommonTabGroupScrollHorizon:setImageTipByTabIndex(tabIndex, show, posPercent, texture)
    self._commonTabGroup:setImageTipByTabIndex(tabIndex, show, posPercent, texture)
end

function CommonTabGroupScrollHorizon:getTabItem(index)
    return self._commonTabGroup:getTabItem(index)
end

function CommonTabGroupScrollHorizon:playEnterEffect(movingName, interval)
    self._commonTabGroup:playEnterEffect(movingName, interval)
end

return CommonTabGroupScrollHorizon
