
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local VipGiftPkgNode = class("VipGiftPkgNode")

function VipGiftPkgNode:ctor(target)
    self._listViewItems =  ccui.Helper:seekNodeByName(target, "ListViewItems") --礼包物品列表
    self._btnBuyVipGift	= ccui.Helper:seekNodeByName(target, "BtnBuyVipGift")  --礼包购买按钮
    self._textOriginalPrice	= ccui.Helper:seekNodeByName(target, "TextOriginalPrice")  -- vip礼包原价
	self._textDiscountPrice = ccui.Helper:seekNodeByName(target, "TextDiscountPrice")  -- vip礼包折扣价
	self._giftPkgName = ccui.Helper:seekNodeByName(target, "GiftPkgName")  -- vip礼包名
    self._vipItemData = nil

    cc.bind(self._listViewItems, "ListView")
    cc.bind(self._textOriginalPrice, "CommonPriceInfo")
    cc.bind(self._textDiscountPrice, "CommonPriceInfo")
    cc.bind(self._btnBuyVipGift, "CommonButtonLevel0Highlight")

  
    self._btnBuyVipGift:addClickEventListenerEx(handler(self,self._onBuyGiftClick))
end

function VipGiftPkgNode:_onBuyGiftClick()
	logDebug(" VipPrivilegeView:_onBuyGiftClick() ")

	local config = self._vipItemData:getInfo()
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local success,popFunc = LogicCheckHelper.enoughCash(config.price)
	if success == true then
		self:_sendBuyVipGift()
	elseif popFunc then
		popFunc()			
	end
	
end

function VipGiftPkgNode:_sendBuyVipGift()
    if not self._vipItemData then
        return
    end
	local vipLevel = self._vipItemData:getId()

	--检查vip礼包是否可以购买
	dump(vipLevel)
	local message = {
		vip_level = vipLevel or 0, --道具ID
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetVipReward, message)
end


function VipGiftPkgNode:updateUI(vipItemData)
	local vipLevel = vipItemData:getId()
	self._vipItemData = vipItemData
	self._listViewItems:clearAll()

    self._textDiscountPrice:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_DIAMOND,vipItemData:getNewPrice())
    self._textOriginalPrice:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_DIAMOND,vipItemData:getVipPrePrice())
    self._textDiscountPrice:showDiscountLine(false)
    self._textOriginalPrice:showDiscountLine(true)
   
	local privilegeList = vipItemData:getVipPrivilegeList()


	--更新vip 礼包列表
	local itemList = vipItemData:getVipGiftList()

	local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")

	for i, itemData in ipairs(itemList) do
		local createIcon = ComponentIconHelper.createIcon(itemData.type, itemData.value, itemData.size)
		local widget = ccui.Widget:create()
		widget:setContentSize(cc.size(98,98))
		widget:addChild(createIcon)
		createIcon:setPosition(49,49)
		createIcon:setTouchEnabled(true)
		createIcon:showIconEffect()
		self._listViewItems:pushBackCustomItem(widget)
	end

	self._giftPkgName:setString(Lang.get("lang_vip_gift_pkg_name",{num = self._vipItemData:getId()}))

	self:_updateVipButtonState()
end

function VipGiftPkgNode:_updateVipButtonState()
	local currVipLevel = self._vipItemData:getId()
	local playerVipLevel = G_UserData:getVip():getLevel()
	
	
	self._btnBuyVipGift:showRedPoint(false)
	if currVipLevel > playerVipLevel then	
		self._btnBuyVipGift:setEnabled(false)
		self._btnBuyVipGift:setString(Lang.get("lang_vip_buy_gift_btn", {level = currVipLevel}))
		return
	else
		if G_UserData:getVip():isVipRewardTake(currVipLevel) then
			self._btnBuyVipGift:setEnabled(false)
			self._btnBuyVipGift:setString(Lang.get("lang_vip_privilege_gift_buyed"))
			return
		end
	end
	self._btnBuyVipGift:setString(Lang.get("lang_buy_gift"))
	self._btnBuyVipGift:setEnabled(true)
	self._btnBuyVipGift:showRedPoint(true)
end

return VipGiftPkgNode