--置换确认框

local PopupBase = require("app.ui.PopupBase")
local PopupTransformConfirm = class("PopupTransformConfirm", PopupBase)
local PopupTransformConfirmCell = require("app.ui.PopupTransformConfirmCell")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

function PopupTransformConfirm:ctor(checkFunc)
	self._checkFunc = checkFunc

	local resource = {
		file = Path.getCSB("PopupTransformConfirm", "common"),
		binding = {
			
		}
	}
	
	PopupTransformConfirm.super.ctor(self, resource)
end

function PopupTransformConfirm:onCreate()
	self._popupBg:setTitle(Lang.get("common_transform_confirm_title"))
	self._popupBg:hideBtnBg()
	self._popupBg:addCloseEventListener(handler(self, self._onClose))

	self._listView:setTemplate(PopupTransformConfirmCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupTransformConfirm:onEnter()
	self._signalBuyShopGoods = G_SignalManager:add(SignalConst.EVENT_BUY_ITEM, handler(self, self._onEventBuyItem))
end

function PopupTransformConfirm:onExit()
	self._signalBuyShopGoods:remove()
	self._signalBuyShopGoods = nil
end

function PopupTransformConfirm:updateUI(datas)
	self._datas = datas
    self._listView:clearAll()
    self._listView:resize(#datas)
end

function PopupTransformConfirm:_onItemUpdate(item, index)
	local data = self._datas[index + 1]
	if data then
		item:update(data)
	end
end

function PopupTransformConfirm:_onItemSelected(item, index)

end

function PopupTransformConfirm:_onItemTouch(index, t)
	local index = index + t
	local data = self._datas[index]
	
	if self._checkFunc then
		local ok = self._checkFunc()
		if not ok then
			return
		end
	end
	
	local info = data.data1
	local isEnough = LogicCheckHelper.enoughValue(info.type, info.value, info.size, false)
	if not isEnough then
		local popup = require("app.ui.PopupItemGuider").new()
		popup:updateUI(info.type, info.value)
		popup:openWithAction()
		return
	end

	G_UserData:getShops():c2sBuyShopGoods(data.goodId, data.shopId, 1)
end

function PopupTransformConfirm:_onEventBuyItem()
	self:close()
end

function PopupTransformConfirm:_onClose()
	self:close()
end

return PopupTransformConfirm