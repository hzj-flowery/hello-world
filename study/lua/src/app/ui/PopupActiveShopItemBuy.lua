--弹出界面
--通用活动商店购买
local PopupItemUse = require("app.ui.PopupItemUse")
local Path = require("app.utils.Path")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PopupActiveShopItemBuy = class("PopupActiveShopItemBuy", PopupItemUse)
local UserDataHelper = require("app.utils.UserDataHelper")
local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")

function PopupActiveShopItemBuy:ctor(goodId, callback, title)
	self._title = title or Lang.get("shop_pop_title") 
	self._goodId = goodId
	self._callback = callback
	self._costResInfo1 = nil --消耗资源
	self._useNum  = 1 

	PopupActiveShopItemBuy.super.ctor(self, self._title, callback)
end

function PopupActiveShopItemBuy:onInitCsb()
	local CSHelper = require("yoka.utils.CSHelper")
	local resource = {
		file = Path.getCSB("PopupItemBuy", "common"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "onBtnOk"}}
			},
			_btnCancel = {
				events = {{event = "touch", method = "onBtnCancel"}}
			},
		}
	}
   if resource then
        CSHelper.createResourceNode(self, resource)
    end
end


--
function PopupActiveShopItemBuy:onCreate()
	PopupActiveShopItemBuy.super.onCreate(self)

	self._costResInfo2:setVisible(false)
end


function PopupActiveShopItemBuy:onEnter()
    self:_updateUI()
    local maxLimit = ShopActiveDataHelper.getMaxLimit(self._goodId)
    self:setMaxLimit(maxLimit)
end

function PopupActiveShopItemBuy:onExit()
    
end

function PopupActiveShopItemBuy:_onNumSelect(num)
	self._useNum = num
	local info1 = self:_getItemPrice(1)
	if info1 then
		self:setCostInfo1(info1.type, info1.value, info1.size)
	end

    local info2 = self:_getItemPrice(2)
	if info2 then
		self:setCostInfo2(info2.type, info2.value, info2.size)
	end
end

function PopupActiveShopItemBuy:_getItemPrice(index)
	local costInfo = ShopActiveDataHelper.getCostInfo(self._goodId)
	local info = costInfo[index]
	if info then
		info.size = info.size * self._useNum
	end

	return info
end

function PopupActiveShopItemBuy:_updateUI()
	local info = ShopActiveDataHelper.getShopActiveConfig(self._goodId)
	local itemOwnerNum = UserDataHelper.getNumByTypeAndValue(info.type, info.value)
	PopupActiveShopItemBuy.super.updateUI(self, info.type, info.value, info.size)
	
	self:setOwnerCount(itemOwnerNum)
	self:_onNumSelect(self._useNum)
end

function PopupActiveShopItemBuy:onBtnOk()
	if self._callback then
		self._callback(self._goodId, self._useNum)
	end
	self:close()
end


function PopupActiveShopItemBuy:setCostInfo1(costType,costValue, costSize)
	self._costResInfo1:updateUI(costType,costValue,costSize)
end

function PopupActiveShopItemBuy:setCostInfo2(costType,costValue, costSize)
	self._costResInfo2:updateUI(costType,costValue,costSize)
	self._costResInfo2:setVisible(true)
end

return PopupActiveShopItemBuy