local ViewBase = require("app.ui.ViewBase")
local ShopView = class("ShopView", ViewBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIPopupHelper = require("app.utils.UIPopupHelper")
local ShopConst = require("app.const.ShopConst")

local ShopFixView = require("app.scene.view.shop.ShopFixView")
-- local ShopFixView2 = require("app.scene.view.shop.ShopFixView2")
local ShopRandomView = require("app.scene.view.shop.ShopRandomView")
local ShopHelper = require("app.scene.view.shop.ShopHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local UIActionHelper = require("app.utils.UIActionHelper")
function ShopView:ctor(shopId, tabIndex)
	--
	self._selectShopId = shopId or 1
	--左边控件

	self._panelRight = nil --右边面板

	self._selectTabIndex = 0
	self._paramSubId = tabIndex
	self._isFirstEnter = true
	self._isNeedPlayRefreshEffect = false
	self._isFirstEnterRefreshNotPlayed = true
	self._shopView = {}
	self._lastShopView = nil --新商店UI
	self._tabTypeView = {} --按照商店tab类型存放ui
	local resource = {
		file = Path.getCSB("ShopView", "shop"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {}
	}
	ShopView.super.ctor(self, resource)
end

function ShopView:onCreate()
    local TextHelper = require("app.utils.TextHelper")
	self._topbarBase:setImageTitle("txt_sys_com_shangdian")
	self._panelRight:setCascadeOpacityEnabled(true)
	self._shopInfoList = UserDataHelper.getShopTab()
	local tabNameList = {}

	for i, value in ipairs(self._shopInfoList) do
        if value.default_create ~= 0 then
			table.insert(tabNameList, TextHelper.byteAlignment(value.shop_name, 2, 4))
		end
	end

	local param = {
		rootNode = self._scrollViewTab,
		containerStyle = 2,
		callback = handler(self, self._onTabSelect1),
		textList = tabNameList
	}

	self._tabGroup1:recreateTabs(param)

	--self._tabGroup1:setRedPointByTabIndex(selectIndex,false)
end

function ShopView:updateRes(resList)
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
    if #resList <= 0 then
        local FunctionCheck = require("app.utils.logic.FunctionCheck")
        local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_JADE2)
        local topbarConst = isOpen and TopBarStyleConst.STYLE_COMMON2 or TopBarStyleConst.STYLE_COMMON
		self._topbarBase:updateUI(topbarConst)
	else
		self._topbarBase:updateUIByResList(resList)
	end
end

function ShopView:onEnter()
	self._signalBuyShopGoods = G_SignalManager:add(SignalConst.EVENT_BUY_ITEM, handler(self, self._onEventBuyItem))

	self._signalUpdateShopGoods =
		G_SignalManager:add(SignalConst.EVENT_SHOP_INFO_NTF, handler(self, self._onEventShopUpdate))
	self._signalRedPointUpdate =
		G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventRedPointUpdate))

	self._signalShopNewRemindUpdate =
		G_SignalManager:add(SignalConst.EVENT_SHOP_NEW_REMIND_UPDATE, handler(self, self._onEventNewRemindUpdate))

	self:_onEventRedPointUpdate()

	if self._selectShopId > 0 then
		self._tabGroup1:setTabIndex(self:getShopIndexById(self._selectShopId))
	else
		self._tabGroup1:setTabIndex(1)
	end

	self:refreshView()

	if self._paramSubId and self._selectTabIndex > 0 then
		local chooseView = self:getShopView(self._selectTabIndex)
		if chooseView and chooseView.setTabIndex then
			local index = ShopHelper.convertSubIdToIndex(self._selectShopId, self._paramSubId)

			chooseView:setTabIndex(index)
		end
		self._paramSubId = nil
	end

	if self._isFirstEnter then
		UIActionHelper.playEnterShopSceneEffect(
			{
				startCallback = function()
				end,
				listViewPlayCallback = function()
				end,
				topBar = self._topbarBase,
				tabGroup = self._tabGroup1,
				rightNodes = {self._panelRight, self._pendant},
				attachNode = self
			}
		)
		self._isFirstEnter = nil
	end
end

function ShopView:onExit()
	self._signalBuyShopGoods:remove()
	self._signalBuyShopGoods = nil
	self._signalUpdateShopGoods:remove()
	self._signalUpdateShopGoods = nil
	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil
	self._signalShopNewRemindUpdate:remove()
	self._signalShopNewRemindUpdate = nil
end

function ShopView:getShopView(index, tabIndex)
	local shopView = self._shopView[index]
	if shopView == nil then
		local tabIndex = tabIndex or 1
		dump("-------------------------------- index: " .. index)
		dump("-------------------------------- tabIndex: " .. tabIndex)
		local shopId = self:getShopIdByTab(index) or self._selectShopId
		if UserDataHelper.getShopType(shopId) == ShopConst.SHOP_TYPE_FIX then
			shopView = ShopFixView.new(self, shopId)
		else
			shopView = ShopRandomView.new(self, shopId)
		end
		self._panelRight:addChild(shopView)
		shopView:setCascadeOpacityEnabled(true)
		self._shopView[index] = shopView
	end
	return shopView
end

function ShopView:getShopIndexById(shopId)
	for i, shopInfo in ipairs(self._shopInfoList) do
		if shopInfo.shop_id == shopId then
			return i
		end
	end
	return 1
end
function ShopView:getShopIdByTab(index)
	-- dump(index)
	-- dump(self._shopInfoList)
	return self._shopInfoList[index].shop_id
end
function ShopView:_onTabSelect1(index, sender)
	if self._selectTabIndex == index then
		return
	end

	local shopId = self:getShopIdByTab(index)
	if shopId == nil then
		return
	end

	--如果是军团商店
	if shopId == ShopConst.GUILD_SHOP then
		local isInGuild = G_UserData:getGuild():isInGuild()
		if isInGuild == false then
			G_Prompt:showTip(Lang.get("lang_guild_shop_no_open"))
			return false
		end
	end

	self._selectTabIndex = index
	self._selectShopId = shopId

	for i, view in pairs(self._shopView) do
		view:setVisible(false)
	end

	local chooseView = self:getShopView(self._selectTabIndex)
	if chooseView then
		chooseView:setListViewParentVisible(false)
	end

	local chooseView = self:getShopView(index)
	chooseView:setVisible(true)

	local shopCfg = G_UserData:getShops():getShopCfgById(shopId)
	local resList = ShopHelper.getResListByShopCfg(shopCfg)
	self:updateRes(resList)

	if shopId == ShopConst.EQUIP_SHOP then
		self:updateSubTabRedPoint()
	end

	if shopId == ShopConst.NORMAL_SHOP then
		self:_updateSubViewNewRemind()
	end

	self:_updateNewRemind()
	self._playAnimation = true
	G_UserData:getShops():c2sGetShopInfo(shopId)
end

function ShopView:refreshView()
	local chooseView = self:getShopView(self._selectTabIndex)
	-- dump(chooseView)
	chooseView:refreshView()
end

function ShopView:_onEventBuyItem(eventName, message)
	--抛出新手事件出新手事件
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, "ShopView buy Item")
end

function ShopView:_onEventShopUpdate(eventName, message)
	self:refreshView()

	local chooseView = self:getShopView(self._selectTabIndex)
	if chooseView then
		chooseView:setListViewParentVisible(true)
	end
	if self._playAnimation then
		local chooseView = self:getShopView(self._selectTabIndex)
		if chooseView then
			chooseView:playEnterEffect()
		end
		self._playAnimation = false
	end
end

function ShopView:updateSubTabRedPoint()
	local tabIndex = self:getShopIndexById(ShopConst.EQUIP_SHOP)
	if self._selectTabIndex == tabIndex then
		local chooseView = self:getShopView(tabIndex)
		local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "equipShop")
		chooseView:setRedPointByTabIndex(ShopConst.EQUIP_SHOP_SUB_AWARD, redValue)
	--装备商店子标签奖励是4
	end

	tabIndex = self:getShopIndexById(ShopConst.ARENA_SHOP)
	if self._selectTabIndex == tabIndex then
		local chooseView = self:getShopView(tabIndex)
		local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "arenaShop1")
		chooseView:setRedPointByTabIndex(ShopConst.ARENA_SHOP_SUB_ITEM, redValue)
		-- 竞技场商店奖励红点

		local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "arenaShop2")
		chooseView:setRedPointByTabIndex(ShopConst.ARENA_SHOP_SUB_AWARD, redValue)
	-- 竞技场商店奖励红点
	end

	tabIndex = self:getShopIndexById(ShopConst.GUILD_SHOP)
	if self._selectTabIndex == tabIndex then
		local chooseView = self:getShopView(tabIndex)
		local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "guildShop")
		chooseView:setRedPointByTabIndex(ShopConst.GUILD_SHOP_SUB_ITEM1, redValue)
	-- 军团商店红点
	end
end

-- 子视图 商品新上架提示刷新
function ShopView:_updateSubViewNewRemind()
    local tabIndex = self:getShopIndexById(ShopConst.NORMAL_SHOP)
	if self._selectTabIndex == tabIndex then
        local chooseView = self:getShopView(tabIndex)
        local redValue = ShopHelper.isHaveNewRemindShop(2)--chooseView:getSubIndex())
        chooseView:setImageTipByTabIndex(ShopConst.GUILD_SHOP_SUB_ITEM1, redValue, nil, Path.getTextSignet("txt_sg_new02"))
        redValue = ShopHelper.isHaveNewRemindShop(3)--chooseView:getSubIndex())
		chooseView:setImageTipByTabIndex(ShopConst.GUILD_SHOP_SUB_ITEM3, redValue, nil, Path.getTextSignet("txt_sg_new02"))
	-- 商城红点
	end
end

-- 商品新上架提示刷新
function ShopView:_updateNewRemind()
	local index = self:getShopIndexById(ShopConst.NORMAL_SHOP)
	if self._selectTabIndex == index then
		self._tabGroup1:setImageTipByTabIndex(index, false, nil, Path.getTextSignet("txt_sg_new02"))
    else
		local redValue = ShopHelper.isHaveNewRemindShop()
		self._tabGroup1:setImageTipByTabIndex(index, redValue, nil, Path.getTextSignet("txt_sg_new02"))
	end
end

function ShopView:_onEventNewRemindUpdate()
	self:_updateNewRemind()
	self:_updateSubViewNewRemind()
end

function ShopView:_onEventRedPointUpdate()
	local index = self:getShopIndexById(ShopConst.HERO_SHOP)
	if index > 0 then
		local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "heroShop")
		self._tabGroup1:setRedPointByTabIndex(index, redValue)
	end

	---装备红点
	local equipIndex = self:getShopIndexById(ShopConst.EQUIP_SHOP)
	if equipIndex > 0 then
		local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "equipShop")
		self._tabGroup1:setRedPointByTabIndex(equipIndex, redValue)
		self:updateSubTabRedPoint()
	end

	---竞技场红点
	local tabIndex = self:getShopIndexById(ShopConst.ARENA_SHOP)
	if tabIndex > 0 then
		local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "arenaShop")
		self._tabGroup1:setRedPointByTabIndex(tabIndex, redValue)
		self:updateSubTabRedPoint()
	end

	---军团商店红点
	tabIndex = self:getShopIndexById(ShopConst.GUILD_SHOP)
	if tabIndex > 0 then
		local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "guildShop")
		self._tabGroup1:setRedPointByTabIndex(tabIndex, redValue)
		self:updateSubTabRedPoint()
	end

	---神兽商店红点
	local petIndex = self:getShopIndexById(ShopConst.PET_SHOP)
	if petIndex > 0 then
		local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "petShop")
		self._tabGroup1:setRedPointByTabIndex(petIndex, redValue)
		self:updateSubTabRedPoint()
	end
end
return ShopView
