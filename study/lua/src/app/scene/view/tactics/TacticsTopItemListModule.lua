--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法界面-顶部战法数量列表模块
local TacticsConst = require("app.const.TacticsConst")
local TacticsDataHelper = require("app.utils.data.TacticsDataHelper")
local TacticsTopItemModule = require("app.scene.view.tactics.TacticsTopItemModule")

local TacticsTopItemListModule = class("TacticsTopItemListModule")

function TacticsTopItemListModule:ctor(target)
    self._target = target

    self._nodeItem1 = TacticsTopItemModule.new(ccui.Helper:seekNodeByName(self._target, "_nodeItem1"))
    self._nodeItem2 = TacticsTopItemModule.new(ccui.Helper:seekNodeByName(self._target, "_nodeItem2"))
    self._nodeItem3 = TacticsTopItemModule.new(ccui.Helper:seekNodeByName(self._target, "_nodeItem3"))
    
    self:init()
end

function TacticsTopItemListModule:init()
    self._nodeItem1:init(5)
    self._nodeItem2:init(6)
    self._nodeItem3:init(7)
end

function TacticsTopItemListModule:updateInfo()
    self._nodeItem1:updateInfo()
    self._nodeItem2:updateInfo()
    self._nodeItem3:updateInfo()
end


return TacticsTopItemListModule
