--
-- 背包主界面
-- 管理其他子界面
--
local ViewBase = require("app.ui.ViewBase")
local PackageMainView = class("PackageMainView", ViewBase)
local PackageViewConst = require("app.const.PackageViewConst")
local PackageView = require("app.scene.view.package.PackageView")
local EquipmentListView = require("app.scene.view.equipment.EquipmentListView")
local TreasureListView = require("app.scene.view.treasure.TreasureListView")
local InstrumentListView = require("app.scene.view.instrument.InstrumentListView")
local PackageHelper = require("app.scene.view.package.PackageHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

PackageMainView.viewList = {
    [PackageViewConst.TAB_ITEM] = PackageView,
    [PackageViewConst.TAB_SILKBAG] = PackageView,
    [PackageViewConst.TAB_GEMSTONE] = PackageView,
    [PackageViewConst.TAB_EQUIPMENT] = EquipmentListView,
    [PackageViewConst.TAB_TREASURE] = TreasureListView,
    [PackageViewConst.TAB_INSTRUMENT] = InstrumentListView,
    [PackageViewConst.TAB_JADESTONE] = PackageView,
    [PackageViewConst.TAB_HISTORYHERO] = PackageView,
    [PackageViewConst.TAB_HISTORYHERO_WEAPON] = PackageView,
}

function PackageMainView:ctor(tabIndex)
    self._nodeTabRoot = nil -- 左边tab
    self._panelRight = nil -- 右边面板

    self._textList, self._tabFuncList = PackageHelper.getPackageTabList()
    self._selectTabIndex = tabIndex or 1

    self._tabViewList = {}

    local resource = {
        file = Path.getCSB("PackageMainView", "package"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
            _buttonSale = {
                events = {{event = "touch", method = "_onButtonSaleClicked"}}
            }
        }
    }
    self:setName("PackageMainView")
    PackageMainView.super.ctor(self, resource)
end

function PackageMainView:onCreate()
    local param = {
        callback = handler(self, self._onTabSelect),
        textList = self._textList
    }
    -- self._buttonSale:setVisible(not UserDataHelper.isEnoughBagMergeLevel())
    self._buttonSale:setVisible(true)
    self._nodeTabRoot:recreateTabs(param,cc.size(168,400))
    self:_refreshRedPoint()
end

function PackageMainView:onEnter()
    -- dump(self._nodeTabRoot)
    self._signalRedPointUpdate =
        G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventRedPointUpdate))
    self._signalSellObjects =
        G_SignalManager:add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(self, self._onSellFragmentsSuccess))
    self._signalSellOnlyObjects =
        G_SignalManager:add(SignalConst.EVENT_SELL_ONLY_OBJECTS_SUCCESS, handler(self, self._onSellFragmentsSuccess))

    self:_showTabView(self._selectTabIndex)

    self._nodeTabRoot:setTabIndex(self._selectTabIndex)

    --抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PackageView")
end

function PackageMainView:onExit()
    self._signalRedPointUpdate:remove()
    self._signalRedPointUpdate = nil
    self._signalSellObjects:remove()
    self._signalSellObjects = nil

    self._signalSellOnlyObjects:remove()
    self._signalSellOnlyObjects = nil
end

function PackageMainView:_refreshRedPoint()
    local redPointShow1 = G_UserData:getFragments():hasRedPoint({fragType = 8})
    local tabIndex1 = PackageHelper.getPackTabIndex(PackageViewConst.TAB_GEMSTONE)
    if tabIndex1 then
        self._nodeTabRoot:setRedPointByTabIndex(tabIndex1, redPointShow1) -- 原背包红点
    end
    
    local redPointShow2 = G_UserData:getFragments():hasRedPoint({fragType = 6})
    local tabIndex2 = PackageHelper.getPackTabIndex(PackageViewConst.TAB_ITEM)
    if tabIndex2 then
        self._nodeTabRoot:setRedPointByTabIndex(tabIndex2, redPointShow2) --道具碎片红点    
    end
    
    local redPointShow3 = G_UserData:getFragments():hasRedPoint({fragType = 2})
    local tabIndex3 = PackageHelper.getPackTabIndex(PackageViewConst.TAB_EQUIPMENT)
    if tabIndex3 then
        self._nodeTabRoot:setRedPointByTabIndex(tabIndex3, redPointShow3) --装备红点    
    end
    
    local redPointShow4 = G_UserData:getFragments():hasRedPoint({fragType = 3})
    local tabIndex4 = PackageHelper.getPackTabIndex(PackageViewConst.TAB_TREASURE)
    if tabIndex4 then
        self._nodeTabRoot:setRedPointByTabIndex(tabIndex4, redPointShow4) -- 宝物红点
    end
    
    local redPointShow5 = G_UserData:getFragments():hasRedPoint({fragType = 4})
    local tabIndex5 = PackageHelper.getPackTabIndex(PackageViewConst.TAB_INSTRUMENT)
    if tabIndex5 then
        self._nodeTabRoot:setRedPointByTabIndex(tabIndex5, redPointShow5) -- 神兵红点
    end
    
    local redPointShow6 = G_UserData:getFragments():hasRedPoint({fragType = 13})
    local tabIndex6 = PackageHelper.getPackTabIndex(PackageViewConst.TAB_HISTORYHERO)
    if tabIndex6 then
        self._nodeTabRoot:setRedPointByTabIndex(tabIndex6, redPointShow6) -- 历代名将碎片红点
        if self._tabViewList[tabIndex6] then
            self._tabViewList[tabIndex6]:setRedPointByTabIndex(2, redPointShow6)
        end
    end
    
    local redPointShow7 = G_UserData:getFragments():hasRedPoint({fragType = 14})
    local tabIndex7 = PackageHelper.getPackTabIndex(PackageViewConst.TAB_HISTORYHERO_WEAPON)
    if tabIndex7 then
        self._nodeTabRoot:setRedPointByTabIndex(tabIndex7, redPointShow7) -- 历代名将兵器碎片红点
        if self._tabViewList[tabIndex7] then
            self._tabViewList[tabIndex7]:setRedPointByTabIndex(2, redPointShow7)
        end
    end
end

function PackageMainView:_onEventRedPointUpdate(event, funcId, param)
    self:_refreshRedPoint()
end

function PackageMainView:_onSellFragmentsSuccess()
    self:_refreshRedPoint()
end

-- 切换子界面
function PackageMainView:_onTabSelect(index, sender)
    if self._selectTabIndex == index then
        return
    end

    for k, v in pairs(self._tabViewList) do
        v:setVisible(false)
    end
    self._selectTabIndex = index
    self:_showTabView(index)
    self:_swithButtonSaleVisible(index)
    self:_refreshRedPoint()
end

-- 根据子界面更新出售按钮的显示
function PackageMainView:_swithButtonSaleVisible(index)
    if self._tabFuncList[index]==PackageViewConst.TAB_HISTORYHERO or self._tabFuncList[index]==PackageViewConst.TAB_HISTORYHERO_WEAPON then
        self._buttonSale:setVisible(false)
    else
        -- self._buttonSale:setVisible(not UserDataHelper.isEnoughBagMergeLevel())
        self._buttonSale:setVisible(true)
    end
end

function PackageMainView:_showTabView(index)
    local tabView = self:getTabView(index)
    tabView:setVisible(true)
    if tabView then
        if tabView.setFuncTabIndex then -- 原背包界面特殊处理
            tabView:setFuncTabIndex(self._tabFuncList[index])
        end
    end
end

function PackageMainView:getTabView(index)
    local tabView = self._tabViewList[index]
    if tabView == nil then
        local tabFunc = self._tabFuncList[index]
        tabView = PackageMainView.viewList[tabFunc].new(tabFunc)
        self._panelRight:addChild(tabView)
        self._tabViewList[index] = tabView
    end

    return tabView
end

function PackageMainView:_onButtonSaleClicked()
    local tabView = self:getTabView(self._selectTabIndex)
    if tabView.onButtonClicked then
        tabView:onButtonClicked()
    end
end

return PackageMainView
