
local VipItemData = class("VipItemData")
local VipLevelInfo = require("app.config.vip_level")
local VipFunctionInfo = require("app.config.vip_function")


--
function VipItemData:ctor()
	self._privilegeList = {}
	self._vipGiftList = {}
end

function VipItemData:setInfo(info)
	self._info = info

	local count = VipFunctionInfo.length()
	for i = 1, count do
		local vipFuncInfo = VipFunctionInfo.indexOf(i)
		if vipFuncInfo.vip == self._info.vip_level and vipFuncInfo.show == 1 then
			self._privilegeList[#self._privilegeList + 1] = vipFuncInfo
		end
	end

	for i = 1, 6 do
		if info["type_" .. i] ~= 0 then
			self._vipGiftList[#self._vipGiftList + 1] = {
				type = info["type_" .. i],
				value = info["value_" .. i],
				size = info["size_" .. i]
			}
		end
	end

	self._giftPrePrice = info.price_show
	self._giftNewPrice = info.price
end

function VipItemData:getInfo()
	return self._info
end

function VipItemData:getId()
	return self._info.vip_level
end


---获取VIP特权描述列表
function VipItemData:getVipPrivilegeList()
	return self._privilegeList
end

---获取VIP礼包列表
function VipItemData:getVipGiftList()
	return self._vipGiftList
end

----当前等级的VIP礼包是否已经购买
function VipItemData:isGiftBeenBought()
	return false
end

function VipItemData:getVipPrePrice()
	return self._giftPrePrice
end

function VipItemData:getNewPrice()
	return self._giftNewPrice
end


--对应的VIP礼包的商城ID
function VipItemData:getShopItemId()
	return self._info.gift_shop_id
end
return VipItemData