local ViewBase = require("app.ui.ViewBase")
local ShopRandomView = class("ShopRandomView", ViewBase)
local ShopViewItemCell = require("app.scene.view.shop.ShopViewItemCell")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")
local ShopConst = require("app.const.ShopConst")
local ShopHelper = require("app.scene.view.shop.ShopHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local DataConst = require("app.const.DataConst")
function ShopRandomView:ctor(mainView, shopId)
	--左边控件
	self._listViewTab = nil --列表控件
	self._tabGroup2 = nil --子标签页控件
	self._shopRes1 = nil
	self._shopRes2 = nil
	self._textHaveCount = nil --剩余次数
	self._textFreeCount =nil --免费次数
	self._resRefreshCost = nil --刷新令消耗
	self._btnRefresh = nil -- 刷新按钮
	self._textRefreshDesc = nil -- 刷新消耗描述
	self._textNextRefresh = nil --免费时间描述
	self._textFreeCountFullImage = nil --免费次数已满图片
	self._isNeedPlayRefeshEffect = nil

	self._ccAlertEnable = false 	-- 货币变更提醒
	--数据
	self._itemList = {}


	self._shopId = shopId
	self._mainView = mainView


    local resource = {
        file = Path.getCSB("ShopRandomView", "shop"),
        binding = {
			_btnRefresh = {
				events = {{event = "touch", method = "_onButtonRefresh"}}
			}
		}
    }
    ShopRandomView.super.ctor(self, resource)
end


function ShopRandomView:onCreate()
	self._listViewTab:setTemplate(ShopViewItemCell)
	self._listViewTab:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listViewTab:setCustomCallback(handler(self, self._onItemTouch))
	self._listViewTab:setTouchEnabled(false)
	self._btnRefresh:setString(Lang.get("shop_btn_refresh"))
	self._textRefreshDesc:setVisible(false)
	--self._shopRes1:addClickEventListenerEx(handler(self, self._onClickRes1))
	--self._shopRes2:addClickEventListenerEx(handler(self, self._onClickRes2))

	local shopCfg = G_UserData:getShops():getShopCfgById(self._shopId)
	self._commonFullScreen:setTitle(shopCfg.shop_name)
end

function ShopRandomView:_onClickRes1()

end

function ShopRandomView:_onClickRes2()

end


function ShopRandomView:onEnter()
	--self:refreshView()
	self:_refreshRedPoint()
	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
	self._signalCurrencyChange = G_SignalManager:add(SignalConst.EVENT_RECHARGE_GET_INFO, handler(self, self._onEventCurrencyChange))
end

function ShopRandomView:onExit()
	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil
	self._signalCurrencyChange:remove()
	self._signalCurrencyChange = nil
	self:_stopCountDown()
end

-- 充值完成后，更新价格文字颜色
function ShopRandomView:_onEventCurrencyChange(eventName, message)
	if self._ccAlertEnable then
		self:refreshView()
	end
end

function ShopRandomView:_onEventRedPointUpdate(event,funcId,param)
	if funcId ==  FunctionConst.FUNC_SHOP_SCENE then
		self:_refreshRedPoint()
    end
end

function ShopRandomView:_refreshRedPoint()

	if self._shopId == ShopConst.HERO_SHOP then
		local RedPointHelper = require("app.data.RedPointHelper")
		local redValue = RedPointHelper.isModuleSubReach( FunctionConst.FUNC_SHOP_SCENE, "heroShop" )
		self._btnRefresh:showRedPoint(redValue)
	end
	if self._shopId == ShopConst.PET_SHOP then
		local RedPointHelper = require("app.data.RedPointHelper")
		local redValue = RedPointHelper.isModuleSubReach( FunctionConst.FUNC_SHOP_SCENE, "petShop" )
		self._btnRefresh:showRedPoint(redValue)
	end
end


function ShopRandomView:_onButtonRefresh()

	local function sendCall(refreshType)
		logWarn("_onButtonRefresh   "..refreshType)
		G_UserData:getShops():c2sShopRefresh(self._shopId, refreshType)
		self._isNeedPlayRefeshEffect = true
	end

	LogicCheckHelper.shopRefreshBtnCheck(self._shopId,sendCall)

end




function ShopRandomView:_getSelectItemList()
	local selectItemList = self._itemList
	return selectItemList
end


function ShopRandomView:_onItemTouch(index, itemPos)
	local lineIndex = index
	local shopItemData = self:_getItemDataByPos(itemPos)
	--dump(shopItemData)

	if LogicCheckHelper.shopRandomBuyCheck(shopItemData) == false then
		return
	end

	UIPopupHelper.popupRandomShopBuyItem(shopItemData)
end

function ShopRandomView:_onItemSelected(item, index)

end

function ShopRandomView:_onItemUpdate(item, index)
	local startIndex = index * 2 + 1
	logWarn("ShopRandomView:_onItemUpdate  "..startIndex)
	local endIndex = startIndex + 2
	local itemLine = {}

	local itemList = self:_getSelectItemList()

	if itemList and #itemList > 0 then
		for i = startIndex, endIndex do
			local itemData = itemList[i]
			if itemData then
				table.insert(itemLine, itemData)
			end
		end
		item:update(index,itemLine)
	end
end


function ShopRandomView:refreshView()
	self._itemList = {}
	local shopMgr = G_UserData:getShops()
	local shopId = self._shopId

	--商店数据尚未拉取，直接显示
	local itemList = shopMgr:getShopGoodsList(shopId)
	if #itemList == 0 then
		return
	end

	self._itemList =  itemList

	self:_updateCurrencyChangeAlert()
	local lineCount = math.ceil( #itemList / 2 )

	--更新ListView
	lineCount = lineCount or 1

	self._listViewTab:resize(lineCount)

	--self:_updateShopRes()
	self:_updateShopText()
	self:_startCountDown()
	
	if self._isNeedPlayRefeshEffect == true then
		self:playEnterEffect()
		self._isNeedPlayRefeshEffect = false
	end
end

-- 更新货币变更提醒的标志位
function ShopRandomView:_updateCurrencyChangeAlert()
	local alert = false
	for i,v in ipairs(self._itemList) do
		local item = v:getConfig()
		for j=1,2 do
			local type = item["type" .. j]
			local value = item["value" .. j]
			if type==5 and (value==1 or value==33) then
				alert = true
				break
			end
		end
		if alert then
			break
		end
	end
	self._ccAlertEnable = alert
end


function ShopRandomView:_getItemDataByPos(pos)
	local itemList = self._itemList
	if pos > 0 and pos <= #itemList then
		return itemList[pos]
	end
	return nil
end


function ShopRandomView:_updateShopRes()

	local shopCfg = G_UserData:getShops():getShopCfgById(self._shopId)

	local size1 = UserDataHelper.getNumByTypeAndValue(shopCfg.price1_type, shopCfg.price1_value)

	self._shopRes1:setVisible(false)
	if shopCfg.price1_type > 0 then
		self._shopRes1:updateUI(shopCfg.price1_type,shopCfg.price1_value,size1)
		self._shopRes1:setVisible(true)
	end


	if shopCfg.price2_type > 0 and shopCfg.price2_value > 0 then
		local size2 = UserDataHelper.getNumByTypeAndValue(shopCfg.price2_type, shopCfg.price2_value)
		self._shopRes2:updateUI(shopCfg.price2_type,shopCfg.price2_value,size2)
		self._shopRes2:setVisible(true)
	else
		self._shopRes2:setVisible(false)
	end

end



function ShopRandomView:_updateShopText()
	local shopInfo = UserDataHelper.getRandomShopInfo(self._shopId)
	local token = UserDataHelper.getShopRefreshToken() --获得刷新令牌
--	dump(shopInfo)
	self._textFreeCount:setString(shopInfo.freeCnt.."/"..shopInfo.freeCntTotal)
	self._textHaveCount:setString(shopInfo.surplusTimes.."/"..shopInfo.refreshCntTotal)

	if shopInfo.freeCnt > 0 then
		self._resRefreshCost:setVisible(false)
		--self._textRefreshDesc:setVisible(false)
		return
	else
		self._resRefreshCost:setVisible(true)
		--self._textRefreshDesc:setVisible(true)
	end
	if token > 0 then
		self._resRefreshCost:updateUI(TypeConvertHelper.TYPE_ITEM,DataConst.ITEM_REFRESH_TOKEN)
		self._resRefreshCost:setCount("1".."/"..token)
		self._resRefreshCost:setTextColorToDTypeColor()
		self._resRefreshCost:showResName(true,Lang.get("shop_random_refresh1"))
		self._resRefreshCost:alignToRightForRandomShop()
	else
		self._resRefreshCost:updateUI(shopInfo.costType, shopInfo.costValue)
		local itemNum = UserDataHelper.getNumByTypeAndValue(shopInfo.costType, shopInfo.costValue)
		self._resRefreshCost:setCount(shopInfo.costSize )

		self._resRefreshCost:setTextColorToDTypeColor()

		self._resRefreshCost:showResName(true,Lang.get("shop_random_refresh2"))
		self._resRefreshCost:alignToRightForRandomShop()
	end
end


--开始刷新倒计时
function ShopRandomView:_startCountDown( ... )
	-- body
	local shopData = G_UserData:getShops():getRandomShopInfo(self._shopId)
	if shopData.freeCnt == shopData.freeCntTotal then
		-- self._textNextRefresh:setString(Lang.get("shop_free_max"))
		-- self._textNextRefresh:setColor(Colors.DARK_BG_GREEN)
		self._textNextRefresh:setVisible(false)
		self._textFreeCountFullImage:setVisible(true)
		return
	end
	self._textNextRefresh:setVisible(true)
	self._textFreeCountFullImage:setVisible(false)

	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._shopId == nil or self._shopId == 0 then return end
	if self._countDownHandler ~= nil then return end
	self._leaveSec2Refresh = UserDataHelper.getShopLeaveRefreshSec(self._shopId)
	self._countDownHandler = SchedulerHelper.newSchedule(handler(self,self._onCountDown),1)
	self:_onCountDown(0)
end

--格式化倒计时
function ShopRandomView:_onCountDown( dt )
	-- body
	self._leaveSec2Refresh = self._leaveSec2Refresh - dt
	if(self._leaveSec2Refresh <= 0)then
		self._leaveSec2Refresh = 0
		self:_stopCountDown()
		G_UserData:getShops():c2sGetShopInfo(self._shopId)
	end

	local UIHelper = require("yoka.utils.UIHelper")
	local strTimeFormat = UIHelper.fromatHHMMSS(self._leaveSec2Refresh)
	self._textNextRefresh:setString(strTimeFormat)
	self._textNextRefresh:setColor(Colors.DARK_BG_RED)
end

--停止倒计时
function ShopRandomView:_stopCountDown( ... )
	local SchedulerHelper = require("app.utils.SchedulerHelper")

	if self._countDownHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._countDownHandler)
		self._countDownHandler = nil
	end
end


function ShopRandomView:playEnterEffect()
	self._listViewTab:playEnterEffect(handler(self, self.playEnterEffectEndCallBack))
end

function ShopRandomView:setListViewParentVisible(trueOrFalse)
	self._listViewParent:setVisible(trueOrFalse)
end

function ShopRandomView:playEnterEffectEndCallBack()
	 --抛出新手事件出新手事件
     G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

return ShopRandomView
