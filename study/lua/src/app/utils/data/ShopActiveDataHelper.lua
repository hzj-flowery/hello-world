--活动类商店数据帮助类

local ShopActiveDataHelper = {}
local ShopConst = require("app.const.ShopConst")

function ShopActiveDataHelper.getShopActiveConfig(id)
	local info = require("app.config.shop_active").get(id)
	assert(info, string.format("shop_active config can not find id = %d", id))
	return info
end

function ShopActiveDataHelper.getCostInfo(id)
	local result = {}
	local info = ShopActiveDataHelper.getShopActiveConfig(id)
	for i = 1, 2 do
		local type = info["and_price"..i.."_type"]
		local value = info["and_price"..i.."_value"]
		local size = info["and_price"..i.."_size"]
		if type > 0 and value > 0 and size > 0 then
			local data = {
				type = type,
				value = value,
				size = size,
				priceType = ShopConst.PRICE_TYPE_AND,
			}
			table.insert(result, data)
		end
	end

	for i = 1, 2 do
		local type = info["or_price"..i.."_type"]
		local value = info["or_price"..i.."_value"]
		local size = info["or_price"..i.."_size"]
		if type > 0 and value > 0 and size > 0 then
			local data = {
				type = type,
				value = value,
				size = size,
				priceType = ShopConst.PRICE_TYPE_OR,
			}
			table.insert(result, data)
		end
	end

	return result
end

function ShopActiveDataHelper.checkCostEnough(data)
	local formula = "" --公式
	for i, unit in ipairs(data) do
		local type = unit.type
		local value = unit.value
		if i == 1 then
			formula = formula..value
		else
			if type == ShopConst.PRICE_TYPE_AND then
				formula = formula.." and "..value
			elseif type == ShopConst.PRICE_TYPE_OR then
				formula = formula.." or "..value
			end
		end
	end
	
	local func = loadstring("return "..formula)
	local result = func()
	return result
end

function ShopActiveDataHelper.getShopSubTab(shopId)
	local shopMgr = G_UserData:getShops()
	local shopData = shopMgr:getShopCfgById(shopId)
	local shoptabList = {}
	if shopData == nil then
		return {}
	end

	for i = 1, 6 do
		local tabName = shopData["tab_name"..i]
		if tabName and tabName ~= "" then
			table.insert(shoptabList, tabName)
		end
	end

	return shoptabList
end

--获得该商品能购买最大上限
--restCount ，剩余购买次数
function ShopActiveDataHelper.getMaxLimit(goodId)
	local UserDataHelper = require("app.utils.UserDataHelper")
	local maxNum = 9999
	local costInfo = ShopActiveDataHelper.getCostInfo(goodId)
	for i, info in ipairs(costInfo) do
		local myCount = UserDataHelper.getNumByTypeAndValue(info.type, info.value)
		local limit = math.floor(myCount / info.size)
		if maxNum > limit then
			maxNum = limit
		end
	end
	local data = G_UserData:getShopActive():getUnitDataWithId(goodId)
	local restCount = data:getRestCount()
	if restCount and maxNum > restCount then
		maxNum = restCount
	end

	return maxNum
end

return ShopActiveDataHelper