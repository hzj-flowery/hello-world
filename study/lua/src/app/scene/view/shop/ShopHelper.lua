--shop view帮助类

local ShopHelper = {}
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

ShopHelper.SHOP_COMMODITY_TAB_INDEX = 2 -- 商品的tab索引

function ShopHelper.getItemWidgetByPos(listView, pos)
	local itemList = listView:getItems()
	for i, item in ipairs(itemList) do
		local itemWidget = item:findItemByPos(pos)
		if itemWidget then
			return itemWidget
		end
	end
	return nil
end

function ShopHelper.getItemDataByPos(itemList, pos)
	if pos > 0 and pos <= #itemList then
		return itemList[pos]
	end
	return nil
end

--获取商店的刷新时间列表（各个时间点以秒为单位）
function ShopHelper.getRefreshSecList(shopInfo)
	-- body
	if shopInfo == nil then
		assert(nil, "shopInfo can't be nil")
	end

	local tList = {}
	local list = {}
	if shopInfo.refresh_time1 ~= "0:00:00" then
		tList = string.split(shopInfo.refresh_time1, ":")
		list[#list + 1] = tonumber(tList[1]) * 3600 + tonumber(tList[2]) * 60 + tonumber(tList[3])
	end
	if shopInfo.refresh_time2 ~= "0:00:00" then
		tList = string.split(shopInfo.refresh_time2, ":")
		list[#list + 1] = tonumber(tList[1]) * 3600 + tonumber(tList[2]) * 60 + tonumber(tList[3])
	end
	if shopInfo.refresh_time3 ~= "0:00:00" then
		tList = string.split(shopInfo.refresh_time3, ":")
		list[#list + 1] = tonumber(tList[1]) * 3600 + tonumber(tList[2]) * 60 + tonumber(tList[3])
	end
	if shopInfo.refresh_time4 ~= "0:00:00" then
		tList = string.split(shopInfo.refresh_time4, ":")
		list[#list + 1] = tonumber(tList[1]) * 3600 + tonumber(tList[2]) * 60 + tonumber(tList[3])
	end

	return list
end

function ShopHelper.getResListByShopCfg(shopCfg)
	local resList = {}
	if shopCfg.price1_type > 0 and shopCfg.price1_value > 0 then
		table.insert(resList, {type = shopCfg.price1_type, value = shopCfg.price1_value})
	end

	if shopCfg.price2_type > 0 and shopCfg.price2_value > 0 then
		table.insert(resList, {type = shopCfg.price2_type, value = shopCfg.price2_value})
	end

	if shopCfg.price3_type > 0 and shopCfg.price3_value > 0 then
		table.insert(resList, {type = shopCfg.price3_type, value = shopCfg.price3_value})
	end

	if shopCfg.price4_type > 0 and shopCfg.price4_value > 0 then
		table.insert(resList, {type = shopCfg.price4_type, value = shopCfg.price4_value})
	end
	return resList
end

function ShopHelper.convertSubIdToIndex(shopId, subId)
	-- body
	local UserDataHelper = require("app.utils.UserDataHelper")
	local shopList, shopTabIndex = UserDataHelper.getShopSubTab(shopId)
	for i, value in ipairs(shopTabIndex) do
		if value.subId == subId then
			return value.index
		end
	end
	return 1
end

function ShopHelper.convertSubIndexToSubId(shopId, subIndex)
	-- body
	local UserDataHelper = require("app.utils.UserDataHelper")
	local shopList, shopTabIndex = UserDataHelper.getShopSubTab(shopId)
	local tabName = shopList[subIndex]
	for i, value in ipairs(shopTabIndex) do
		if value.name == tabName then
			return value.subId
		end
	end
	return 1
end
function ShopHelper.getShopIndexById(shopId)
	local UserDataHelper = require("app.utils.UserDataHelper")
	local shopInfoList = UserDataHelper.getShopTab()
	for i, shopInfo in ipairs(shopInfoList) do
		if shopInfo.shop_id == shopId then
			return i
		end
	end
	return 1
end

function ShopHelper.getTabTypeByTab(shopId, tabIndex)
	-- dump("-------------------------------- shopId: " .. shopId)
	-- dump("-------------------------------- tabIndex: " .. tabIndex)
	local ShopConst = require("app.const.ShopConst")
	local UserDataHelper = require("app.utils.UserDataHelper")
	local shopIndex = ShopHelper.getShopIndexById(shopId) or 1
	local index = tabIndex or 1
	local shopInfoList = UserDataHelper.getShopTab()
	-- dump(shopInfoList)
	local tab_types = shopInfoList[shopIndex].tab_type or ""
	local tabTypes = string.split(tab_types, "|") or {}
	if #tabTypes >= index then
		-- dump("-------------------- getTabTypeByTab: " .. tonumber(tabTypes[index]))
		return tonumber(tabTypes[index]) or ShopConst.TABL_TYPE_DEFAULT
	end
	return ShopConst.TABL_TYPE_DEFAULT
end

-- 是否有需要上新提示的商品
function ShopHelper.isHaveNewRemindShop(subTabIndex)
	local ShopConst = require("app.const.ShopConst")
	local shopMgr = G_UserData:getShops()
    local shopId = ShopConst.NORMAL_SHOP
    
    if subTabIndex == nil then
        for subTidx=2,3 do
            local itemList = shopMgr:getShopGoodsList(shopId, subTidx)
            for i, shopItem in pairs(itemList) do
                if shopItem:getConfig().new_remind == 1 and ShopHelper.isNeedNewRemind(shopItem:getGoodId(), subTidx) then
                    return true
                end
            end        
        end
        return false
    end

	local itemList = shopMgr:getShopGoodsList(shopId, subTabIndex)
    for i, shopItem in pairs(itemList) do
      	if shopItem:getConfig().new_remind == 1 and ShopHelper.isNeedNewRemind(shopItem:getGoodId(), subTabIndex) then
			return true
		end
	end
	return false
end

-- 需要上新显示
function ShopHelper.isNeedNewRemind(id, subTabIndex)
    local UserSettingData = G_UserData:getUserSetting()
    if subTabIndex == nil then
        for i=2,3 do
            local data = UserSettingData:getSettingValue("shopnNewRemind" .. G_UserData:getBase():getId() ..i) or {}
            if data and table.nums(data) > 0 then
                for i = 1, #data do
                    if data[i] == id then
                        return false
                    end
                end
            end
        end
        return true
    end
    
    local data = UserSettingData:getSettingValue("shopnNewRemind" .. G_UserData:getBase():getId() ..subTabIndex) or {}
	for i = 1, #data do
		if data[i] == id then
			return false
		end
	end
	return true
end

function ShopHelper.saveNewRemindShop(itemList, subTabIndex)
	local UserSettingData = G_UserData:getUserSetting()
    local data = {}    
	for k, shopItem in pairs(itemList) do
        if shopItem:getConfig().new_remind == 1 then
			table.insert(data, shopItem:getGoodId())
		end
	end
	UserSettingData:setSettingValue("shopnNewRemind" .. G_UserData:getBase():getId() ..subTabIndex, data)
	G_SignalManager:dispatch(SignalConst.EVENT_SHOP_NEW_REMIND_UPDATE)
end

return ShopHelper
