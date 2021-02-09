-- @Author panhoa
-- @Date 7.10.2019
-- @Role

local CommonTabGroup = require("app.ui.component.CommonTabGroup")
local CommonTabGroupHorizon7 = class("CommonTabGroupHorizon7", CommonTabGroup)

local EXPORTED_METHODS = {
    "recreateTabs",
    "setTabIndex",
}

function CommonTabGroupHorizon7:ctor()
    self._target = nil
end

function CommonTabGroupHorizon7:bind(target)
    self._target = target
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonTabGroupHorizon7:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

-- @Export  CreateTab
function CommonTabGroupHorizon7:recreateTabs(param)
    -- body
    param.brightTabItemCallback = function(tabItem, bright)
        local imgPoint = ccui.Helper:seekNodeByName(tabItem.panelWidget, "ImagePoint")
        imgPoint:setVisible(bright)
        tabItem.downImage:setVisible(bright)
        tabItem.normalImage:setVisible(not bright)
    end
    CommonTabGroupHorizon7.super.recreateTabs(self, param)
end

-- @Export  SelectTab
function CommonTabGroupHorizon7:setTabIndex(tabIndex, isJump)
    -- body
    CommonTabGroupHorizon7.super.setTabIndex(self, tabIndex, isJump)
end



return CommonTabGroupHorizon7