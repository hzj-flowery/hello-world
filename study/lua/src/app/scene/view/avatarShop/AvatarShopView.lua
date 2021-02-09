--
-- Author: Liangxu
-- Date: 2018-4-27 10:22:09
-- 变身卡商店
local ViewBase = require("app.ui.ViewBase")
local AvatarShopView = class("AvatarShopView", ViewBase)
local AvatarShopCell = require("app.scene.view.avatarShop.AvatarShopCell")
local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")
local ShopConst = require("app.const.ShopConst")
local TabScrollView = require("app.utils.TabScrollView")
local ShopHelper = require("app.scene.view.shop.ShopHelper")
local TopBarStyleConst = require("app.const.TopBarStyleConst")
local SchedulerHelper = require("app.utils.SchedulerHelper")
local UIHelper = require("yoka.utils.UIHelper")
local CustomActivityUIHelper = require("app.scene.view.customactivity.CustomActivityUIHelper")
local PopupAvatarShopBuyConfirm = require("app.scene.view.avatarShop.PopupAvatarShopBuyConfirm")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local AvatarConst = require("app.const.AvatarConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PopupTransformConfirm = require("app.ui.PopupTransformConfirm")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")

local NUM_EVERY_ROW = 5 --每行的数量

function AvatarShopView:ctor(index)
	self._selectTabIndex = index or 1

	local resource = {
		file = Path.getCSB("AvatarShopView", "avatarShop"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonTransform = {
				events = {{event = "touch", method = "_onClickButtonTransform"}}
			},
		}
	}
	
	AvatarShopView.super.ctor(self, resource)
end

function AvatarShopView:onCreate()
	self._goodIds = {}
	self._countDownHandler = nil

	local shopCfg = G_UserData:getShops():getShopCfgById(ShopConst.AVATAR_SHOP)
	local resList = ShopHelper.getResListByShopCfg(shopCfg)
	if #resList <= 0 then
		self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	else
		self._topbarBase:updateUIByResList(resList, true)
	end
	self._tabListView = nil

	self._topbarBase:setImageTitle("txt_sys_com_shangdian")
	self._commonFullScreen:setTitle(Lang.get("shop_avatar_title"))
	self:_initTabGroup()

	local btnEffect = EffectGfxNode.new("effect_youxiangtishi")
	local size = self._buttonTransform:getContentSize()
	btnEffect:setPosition(cc.p(size.width/2, size.height/2))
    btnEffect:play()
	self._buttonTransform:addChild(btnEffect)
	-- self:_initTransform()
end

function AvatarShopView:_initTabGroup()
	local scrollViewParam = {
		template = AvatarShopCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listView, scrollViewParam, self._selectTabIndex)

	local tabNameList = ShopActiveDataHelper.getShopSubTab(ShopConst.AVATAR_SHOP)
	local param = {
		callback = handler(self, self._onTabSelect),
		textList = tabNameList
	}

	self._tabGroup:recreateTabs(param)
end

function AvatarShopView:onEnter()
	self._signalUpdateShopGoods 		= G_SignalManager:add(SignalConst.EVENT_SHOP_INFO_NTF, handler(self, self._onEventShopUpdate))

	self._tabGroup:setTabIndex(self._selectTabIndex)
	self:_updateData()
	self:_updateView()
	self:_startCountDown()
	G_UserData:getShops():c2sGetShopInfo(ShopConst.AVATAR_SHOP)
end

function AvatarShopView:onExit()
	self:_stopCountDown()

	self._signalUpdateShopGoods:remove()
	self._signalUpdateShopGoods = nil
end

function AvatarShopView:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateData()
	self:_updateView()
end

function AvatarShopView:_onEventShopUpdate(eventName, message)
	if message.shop_id ~= ShopConst.AVATAR_SHOP then
		return
	end
	self:_updateData()
	self:_updateView()
end

function AvatarShopView:_updateData()
	local actUnitData = G_UserData:getCustomActivity():getAvatarActivity()
	if actUnitData then
		local curBatch = actUnitData:getBatch()
		self._goodIds = G_UserData:getShopActive():getGoodIdsWithShopAndTabIdBySort(ShopConst.AVATAR_SHOP, self._selectTabIndex, curBatch)
	end
end

function AvatarShopView:_initTransform()
	local info = ShopActiveDataHelper.getShopActiveConfig(AvatarConst.SHOP_SPECIAL_ID_1)
	local costInfo = ShopActiveDataHelper.getCostInfo(AvatarConst.SHOP_SPECIAL_ID_1)
	local cost = costInfo[1]

	local itemParam1 = TypeConvertHelper.convert(cost.type, cost.value)
	local itemParam2 = TypeConvertHelper.convert(info.type, info.value)

	self._textCost1:setString(cost.size)
	self._imageCost1:loadTexture(itemParam1.res_mini)
	self._textCost2:setString(info.size)
	self._imageCost2:loadTexture(itemParam2.res_mini)
end

function AvatarShopView:_updateView()
	local count = math.ceil(#self._goodIds / NUM_EVERY_ROW)
	self._tabListView:updateListView(self._selectTabIndex, count)
end

function AvatarShopView:_onItemUpdate(item, index)
	local index = index * NUM_EVERY_ROW
	local datas = {}
	for i = 1, NUM_EVERY_ROW do
		local goodId = self._goodIds[index + i]
		if goodId then
			table.insert(datas, goodId)
		end
	end
	item:update(datas)
end

function AvatarShopView:_onItemSelected(item, index)

end

function AvatarShopView:_onItemTouch(index, t)
	if not self:_checkFunc() then
		return
	end
	local index = index * NUM_EVERY_ROW + t
	local goodId = self._goodIds[index]
	local popup = PopupAvatarShopBuyConfirm.new(goodId, handler(self, self._callbackOnConfirm))
	popup:openWithAction()
end

function AvatarShopView:_callbackOnConfirm(goodId, index)
	if not self:_checkFunc() then
		return
	end

	local costInfo = ShopActiveDataHelper.getCostInfo(goodId)
	local info = costInfo[index]
	if info then
		local isEnough = LogicCheckHelper.enoughValue(info.type, info.value, info.size, false)
		if isEnough then
			self:_doBuy(goodId, index)
			return true
		else
			local popup = require("app.ui.PopupItemGuider").new()
			popup:updateUI(info.type, info.value)
			popup:openWithAction()
			return false
		end
	end
	return false
end

function AvatarShopView:_doBuy(goodId, buyType)
	local shopId = ShopConst.AVATAR_SHOP
	local buyCount = 1
	G_UserData:getShops():c2sBuyShopGoods(goodId, shopId, buyCount, buyType)
end

function AvatarShopView:_startCountDown()
	self:_stopCountDown()
	
	self._countDownHandler = SchedulerHelper.newSchedule(handler(self, self._onCountDown), 1)
	self:_onCountDown()
end

function AvatarShopView:_stopCountDown()
	if self._countDownHandler then
		SchedulerHelper.cancelSchedule(self._countDownHandler)
		self._countDownHandler = nil
	end
end

function AvatarShopView:_onCountDown()
	local actUnitData = G_UserData:getCustomActivity():getAvatarActivity()
	if actUnitData and actUnitData:isActInRunTime() then
		local timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData:getEnd_time())
		self._textTime:setString(timeStr)
	else
		self:_stopCountDown()
	end
end

function AvatarShopView:_onClickButtonTransform()
	local datas = {}
	local ids = {AvatarConst.SHOP_SPECIAL_ID_2, AvatarConst.SHOP_SPECIAL_ID_1}
	local curBatch = AvatarDataHelper.getCurAvatarBatch()
	for i, id in ipairs(ids) do
		local info = ShopActiveDataHelper.getShopActiveConfig(id)
		if curBatch >= info.batch then
			local costInfo = ShopActiveDataHelper.getCostInfo(id)
			local cost = costInfo[1]
			
			local data1 = cost
			local data2 = {type = info.type, value = info.value, size = info.size}
			local shopId = ShopConst.AVATAR_SHOP

			local data = {data1 = data1, data2 = data2, shopId = shopId, goodId = id}
			table.insert(datas, data)
		end
	end

	local popup = PopupTransformConfirm.new(handler(self, self._checkFunc))
	popup:updateUI(datas)
	popup:openWithAction()
end

function AvatarShopView:_checkFunc()
	local isVisible = G_UserData:getCustomActivity():isAvatarActivityVisible()
	if isVisible then
		return true
	else
		G_Prompt:showTip(Lang.get("customactivity_avatar_act_end_tip"))
		return false
	end
end

return AvatarShopView