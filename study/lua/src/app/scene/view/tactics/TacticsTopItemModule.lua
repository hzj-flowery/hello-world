--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法界面-顶部战法数量模块
local TacticsConst = require("app.const.TacticsConst")
local TacticsDataHelper = require("app.utils.data.TacticsDataHelper")

local TacticsTopItemModule = class("TacticsTopItemModule")

function TacticsTopItemModule:ctor(target)
	self._target = target
	
    self._panelClick = ccui.Helper:seekNodeByName(self._target, "_panelClick")
    self._imgBg = ccui.Helper:seekNodeByName(self._target, "_imgBg")
    self._txtNum = ccui.Helper:seekNodeByName(self._target, "_txtNum")
    self._imgIcon = ccui.Helper:seekNodeByName(self._target, "_imgIcon")
    self._panelClick:addClickEventListenerEx(handler(self,self._onClick), true, nil, 0)
end

function TacticsTopItemModule:_onClick(sender)
    -- 
end

function TacticsTopItemModule:init(color)
    self._color = color
    local path = TacticsConst["TOP_ITEM_COLOR_"..color] or TacticsConst.TOP_ITEM_COLOR_5
    self._imgIcon:loadTexture(path)
end

function TacticsTopItemModule:updateInfo()
    local num, totalNum = TacticsDataHelper.getTacticsNumInfoByColor(self._color)
    self._txtNum:setString(num .. "/" .. totalNum)
end


return TacticsTopItemModule
