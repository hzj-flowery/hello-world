-- Author: nieming
-- Date:2018-02-05 17:22:16
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local CrystalShopView = class("CrystalShopView", ViewBase)
local ShopConst = require("app.const.ShopConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local TopBarStyleConst = require("app.const.TopBarStyleConst")
local ShopHelper = require("app.scene.view.shop.ShopHelper")
local UIActionHelper = require("app.utils.UIActionHelper")
function CrystalShopView:ctor(tabIndex)
	--csb bind var name
	self._clientParent = nil --SingleNode
	self._fileNodeBg = nil --CommonFullScreen
	self._nodeTabRoot = nil --CommonTabGroup
	self._topbarBase = nil --CommonTopbarBase

	self._curSelectTabIndex = 0
	self._firstEnterTabIndex = tabIndex or 1
	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("CrystalShopView", "crystalShop")
	}
	CrystalShopView.super.ctor(self, resource)
end

-- Describle：
function CrystalShopView:onEnter()
	self._signalCrystalShopItems =
		G_SignalManager:add(SignalConst.EVENT_GET_SHOP_CRYSTAL_SUCCESS, handler(self, self._onEventShopUpdate))
	self._signalCrystalShopAwards =
		G_SignalManager:add(SignalConst.EVENT_GET_SHOP_CRYSTAL_AWARD_SUCCESS, handler(self, self._onEventGetReward))
	self._signalRedPointUpdate =
		G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventRedPointUpdate))
	self._signalRefreshCrystalShop =
		G_SignalManager:add(SignalConst.EVENT_REFRESH_CRYSTAL_SHOP_SUCCESS, handler(self, self._onEventShopUpdate))
	self._signalCrystalShopBuy =
		G_SignalManager:add(SignalConst.EVENT_SHOP_CRYSTAL_BUY_SUCCESS, handler(self, self._onEventGetReward))

	self:_refreshClient()
	self:_refreshRedPoint()
end

-- Describle：
function CrystalShopView:onExit()
	self._signalCrystalShopItems:remove()
	self._signalCrystalShopItems = nil

	self._signalCrystalShopAwards:remove()
	self._signalCrystalShopAwards = nil

	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil

	self._signalRefreshCrystalShop:remove()
	self._signalRefreshCrystalShop = nil

	self._signalCrystalShopBuy:remove()
	self._signalCrystalShopBuy = nil
end

-- Describle：
function CrystalShopView:onCreate()
	self._topbarBase:setImageTitle("txt_sys_com_shangdian")

	self._topbarBase:updateUI(TopBarStyleConst.STYLE_CRYSTAL_SHOP)
	local cryShopList = UserDataHelper.getShopTab(ShopConst.CRYSTAL_SHOP_ENTRANCE)
	self._tabNames = {}
	self._createClientHandlers = {} -- 创建函数
	self._clients = {} --子client
	self._requestsHandlers = {} -- 请求数据

	for i = 1, 2 do
		table.insert(self._tabNames, Lang.get("lang_crystal_shop_tab_charge" .. i))
		table.insert(self._createClientHandlers, handler(self, self._createChargeClient))
		table.insert(self._requestsHandlers, handler(self, self._requestChargeData))
	end
	table.insert(self._tabNames, Lang.get("lang_crystal_shop_tab_charge3"))
	table.insert(self._requestsHandlers, handler(self, self._requestShopData))
	table.insert(self._createClientHandlers, handler(self, self._createFixShopClient))

	local param = {
		callback = handler(self, self._onTabSelect),
		textList = self._tabNames
	}
	self._nodeTabRoot:recreateTabs(param)
	self._nodeTabRoot:setTabIndex(self._firstEnterTabIndex)
	self:_refreshRedPoint()
	self._fileNodeBg:setTitle(Lang.get("lang_crystal_shop_title"))

	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_CRYSTAL_SHOP)
end

function CrystalShopView:_requestShopData()
	G_UserData:getCrystalShop():requestShopData()
end

function CrystalShopView:_requestChargeData()
	self:_onEventShopUpdate()
end

function CrystalShopView:_getClientByIndex(index)
	local client = self._clients[index]
	if not client then
		client = self._createClientHandlers[index](index)
		self._clientParent:addChild(client)
		self._clients[index] = client
	end
	return client
end

function CrystalShopView:_onTabSelect(index, sender)
	if self._curSelectTabIndex == index then
		return
	end

	local oldIndex = self._curSelectTabIndex
	if oldIndex > 0 then
		local oldClient = self:_getClientByIndex(oldIndex)
		oldClient:setVisible(false)
	end
	self._curSelectTabIndex = index
	local newClient = self:_getClientByIndex(self._curSelectTabIndex)
	newClient:setVisible(true)
	if newClient.setPlayEnterEffectTag then
		newClient:setPlayEnterEffectTag(true)
	end
	self._requestsHandlers[index]()
end

function CrystalShopView:_createFixShopClient(index)
	local CrystalShopFixClient = require("app.scene.view.crystalShop.CrystalShopFixClient")
	local client = CrystalShopFixClient.new()
	return client
end

function CrystalShopView:_createChargeClient(index)
	local CrystalShopChargeClient = require("app.scene.view.crystalShop.CrystalShopChargeClient")
	local client = CrystalShopChargeClient.new(index)
	return client
end

function CrystalShopView:_onEventShopUpdate()
	self:_refreshClient()
end

function CrystalShopView:_refreshClient()
	local client = self:_getClientByIndex(self._curSelectTabIndex)
	client:refreshClient()
end

function CrystalShopView:_onEventRedPointUpdate()
	self:_refreshRedPoint()
end

function CrystalShopView:_refreshRedPoint()
	self._nodeTabRoot:setRedPointByTabIndex(1, G_UserData:getCrystalShop():hasRedPoint(1))
	self._nodeTabRoot:setRedPointByTabIndex(2, G_UserData:getCrystalShop():hasRedPoint(2))
end

function CrystalShopView:_onEventGetReward(event, awards)
	if awards then
		G_Prompt:showAwards(awards)
	end
	self:_refreshClient()
end

return CrystalShopView
