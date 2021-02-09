--
-- Author: hedl
-- Date: 2017-3-09 18:00:31
--

local CommonTopbarItemList = class("CommonTopbarItemList")

local DataConst = require("app.const.DataConst")
local TopBarStyleConst = require("app.const.TopBarStyleConst")
local EXPORTED_METHODS = {}
--[[
首页特殊	体力	精力	银两	元宝
通用		  战力	银两	元宝	首页	返回
副本相关	体力	银两	元宝	首页	返回
PVP相关	  精力	银两	元宝	首页	返回
竞技场 	 威望		银两 元宝  首页  返回
]]
local EXPORTED_METHODS = {
    "updateUI",
    "updateUIByResList",
    "pauseUpdate",
    "resumeUpdate"
}

function CommonTopbarItemList:ctor()
    self._target = nil
    self._pause = false
    self._showBackImg = true
end

function CommonTopbarItemList:_init()
    self._resNode1 = ccui.Helper:seekNodeByName(self._target, "ResNode1")
    self._resNode2 = ccui.Helper:seekNodeByName(self._target, "ResNode2")
    self._resNode3 = ccui.Helper:seekNodeByName(self._target, "ResNode3")
    self._resNode4 = ccui.Helper:seekNodeByName(self._target, "ResNode4")
    self._backImage = ccui.Helper:seekNodeByName(self._target, "Image_1")
    for i = 1, 4 do
        local resNode = self["_resNode" .. i]
        resNode:setVisible(false)
        cc.bind(resNode, "CommonTopBarItem")
    end

    self._target:registerScriptHandler(
        function(state)
            if state == "enter" then
                self:_onEnter()
            elseif state == "exit" then
                self:_onExit()
            end
        end
    )
end

function CommonTopbarItemList:bind(target)
    self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonTopbarItemList:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonTopbarItemList:updateUI(topBarStyle, showPanelBlue)
    if topBarStyle == nil then
        return
    end

    self._topBarStyle = topBarStyle
    self._resList = TopBarStyleConst.getStyleValue(self._topBarStyle)
    assert(self._resList, "TopBarStyleConst.getStyleValue return nil topBarStyle is error id:  " .. self._topBarStyle)
    local showBackImg = true
    if showPanelBlue then
        self._showBackImg = false
    end
    self:_updateUI(self._resList)
end

function CommonTopbarItemList:updateUIByResList(resList)
    if not resList then
        return
    end
    self._resList = resList
    self:_updateUI(self._resList)
end

function CommonTopbarItemList:_updateUI(resList)
    for i = 1, 4 do
        local resNode = self["_resNode" .. i]
        resNode:setVisible(false)
        cc.bind(resNode, "CommonTopBarItem")
    end

    local function filter(value)
        -- body
        if value.type == 0 then
            return true
        end
        return false
    end
    local showCount = 0
    if resList then
        for i, value in ipairs(resList) do
            local index = i + (4 - #resList)
            local resNode = self["_resNode" .. index]
            if filter(value) == false then
                resNode:setVisible(true)
                resNode:updateUI(value.type, value.value)
                resNode:showPanelBlue(not self._showBackImg)
                showCount = showCount + 1
            end
        end
    end
    if showCount == 0 then 
        self._backImage:setVisible(false)
    else 
        self._backImage:setVisible(self._showBackImg)
    end
end

function CommonTopbarItemList:_updateData()
    logWarn("CommonTopbarItemList:_updateData()")
    if self._resList then
        self:_updateUI(self._resList)
    end
end

--在View OnEnter调用
function CommonTopbarItemList:_onEnter()
    if self._pause then
        self:_updateData()
        return
    end
    if self._signalRecvRecoverInfo then
        self._signalRecvRecoverInfo:remove()
        self._signalRecvRecoverInfo = nil
    end

    if self._signalRecvCurrencysInfo then
        self._signalRecvCurrencysInfo:remove()
        self._signalRecvCurrencysInfo = nil
    end

    self._signalRecvRecoverInfo =
        G_SignalManager:add(SignalConst.EVENT_RECV_RECOVER_INFO, handler(self, self._updateData))
    self._signalRecvCurrencysInfo =
        G_SignalManager:add(SignalConst.EVENT_RECV_CURRENCYS_INFO, handler(self, self._updateData))
    self._updateItemMsg = G_SignalManager:add(SignalConst.EVENT_ITEM_OP_UPDATE, handler(self, self._updateData)) --道具更新事件监听
    self._deleteItemMsg = G_SignalManager:add(SignalConst.EVENT_ITEM_OP_DELETE, handler(self, self._updateData)) --道具删除事件
    self._intertItemMsg = G_SignalManager:add(SignalConst.EVENT_ITEM_OP_INSERT, handler(self, self._updateData)) --添加道具事件

    --玩家数据发生变化
    self._signalUpdateRoleInfo = G_SignalManager:add(SignalConst.EVENT_RECV_ROLE_INFO, handler(self, self._updateData))

    self._signalBuyShopGoods = G_SignalManager:add(SignalConst.EVENT_BUY_ITEM, handler(self, self._onEventBuyItem))

    self:_updateData()

    logWarn("CommonTopbarItemList:onEnter()")
end

--在View OnExit调用
function CommonTopbarItemList:_onExit()
    if self._signalRecvRecoverInfo then
        self._signalRecvRecoverInfo:remove()
        self._signalRecvRecoverInfo = nil
    end

    if self._signalRecvCurrencysInfo then
        self._signalRecvCurrencysInfo:remove()
        self._signalRecvCurrencysInfo = nil
    end
    if self._updateItemMsg then
        self._updateItemMsg:remove()
        self._updateItemMsg = nil
    end
    if self._deleteItemMsg then
        self._deleteItemMsg:remove()
        self._deleteItemMsg = nil
    end
    if self._intertItemMsg then
        self._intertItemMsg:remove()
        self._intertItemMsg = nil
    end

    if self._signalBuyShopGoods then
        self._signalBuyShopGoods:remove()
        self._signalBuyShopGoods = nil
    end

    if self._signalUpdateRoleInfo then
        self._signalUpdateRoleInfo:remove()
        self._signalUpdateRoleInfo = nil
    end
    logWarn("CommonTopbarItemList:onExit()")
end

function CommonTopbarItemList:_onEventBuyItem(eventName, message)
    local awards = rawget(message, "awards")
    if awards then
        local shopId = rawget(message, "shop_id")
        local shopType = require("app.utils.UserDataHelper").getShopType(shopId)
        local ShopConst = require("app.const.ShopConst")
        if shopType == ShopConst.SHOP_TYPE_ACTIVE or shopId == ShopConst.SEASOON_SHOP then
            local PopupGetRewards = require("app.ui.PopupGetRewards").new()
            PopupGetRewards:showRewards(awards)
        else
            G_Prompt:showAwards(awards)
        end
    end
end

function CommonTopbarItemList:pauseUpdate()
    self._pause = true
    self:_onExit()
end

function CommonTopbarItemList:resumeUpdate()
    if self._pause then
        self._pause = false
        self:_onEnter()
    end
end

return CommonTopbarItemList
