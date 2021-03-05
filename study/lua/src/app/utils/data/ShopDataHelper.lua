--商店模块数据封装类


local ShopDataHelper = {}


local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local ShopInfo = require("app.config.shop")
local ShopConst = require("app.const.ShopConst")
--商店通用函数
function ShopDataHelper.getShopBuyTimesDesc(shopId,shopItemId)
	local shopMgr = G_UserData:getShops()
	local shopItem = shopMgr:getShopGoodsById(shopId, shopItemId)

	local banType = shopItem:getConfig().num_ban_type --0无限制，1终生，2每日,3 vip次数,5赛季
	if banType == 2 or banType == 3 then
		local vipTimes = shopItem:getVipBuyTimes()
		local buyCount = shopItem:getBuyCount()
		local strBuyTimes = Lang.get("shop_condition_today_buynum",{num = vipTimes - buyCount})
		return strBuyTimes
	elseif banType == 4 then
		local vipTimes = shopItem:getVipBuyTimes()
		local buyCount = shopItem:getBuyCount()
		local strBuyTimes = Lang.get("shop_condition_week_buynum",{num = vipTimes - buyCount})
		return strBuyTimes
	elseif banType == 5 then
		local vipTimes = 0
		local buyCount = 0
		local paramCfg = shopItem:getConfig()
		if paramCfg ~= nil then
			local vipTimes = shopItem:getVipBuyTimes()
			local buyCount = shopItem:getBuyCount()
            local strBuyTimes = ""
            if shopId == ShopConst.ALL_SERVER_GOLDHERO_SHOP then
                strBuyTimes = Lang.get("shop_condition_acticity_buynum",{num = vipTimes - buyCount})
            else
                strBuyTimes = Lang.get("shop_condition_season_buynum",{num = vipTimes - buyCount})
            end
			return strBuyTimes
		end
		return " "
	else
		return " "
	end
end

-- 商店商品可购次数
function ShopDataHelper.getShopItemCanBuyTimes(shopItem)
	local vipTimes = shopItem:getVipBuyTimes()
	local buyCount = shopItem:getBuyCount()
	local times = vipTimes-buyCount
	return times
end


--获得Fix商店折扣率
function ShopDataHelper.getFixShopDiscount(shopItem)

	--shop_fixed_info表中price÷pre_price所得数值为折扣率，四舍五入取整数折扣率
	--local shopId = shopItem:getShopId()
	--local shopItemId = shopItem:getGoodId()
	--local shopMgr = G_UserData:getShops()
	--local shopItem = shopMgr:getShopGoodsById(shopId, shopItemId)
	local shopCfg =  shopItem:getConfig()
	local buyCount = shopItem:getBuyCount()
	local preSize1 = shopCfg.price1_size_pre
	local preSize2 = shopCfg.price2_size_pre
	local priceSize1 = shopCfg.price1_size or 1

	local priceSize = ShopDataHelper.getTotalPriceByAdd(shopCfg.price1_add,buyCount,1,priceSize1)
	priceSize = ShopDataHelper._getPriceWithHomelandBuff(priceSize, shopItem)
	if preSize1 > 0 and priceSize > 0 then
		local discount1 = math.floor( (priceSize / preSize1) *10 + 0.5 )
		return discount1
	end
	return 1
end

--检测神树祈福buff的影响
function ShopDataHelper._getPriceWithHomelandBuff(priceSize, shopItem)
	local result = priceSize
	local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
	local HomelandConst = require("app.const.HomelandConst")
	local itemInfo = shopItem:getConfig()
	local itemType = itemInfo.type
	local itemValue = itemInfo.value
	local buffBaseId = HomelandConst.getBuffBaseId(itemType, itemValue)
	if buffBaseId then
		local isCanUse, buffData = HomelandHelp.checkBuffIsCanUse(buffBaseId) 
		if isCanUse then
			local info = buffData:getConfig()
			local ratio = HomelandHelp.getRealValueOfBuff(info)
			local disPrice = priceSize * (1-ratio) --打折的价格
			result = disPrice
		else
			result = priceSize
		end
	else
		result = priceSize
	end
	return result
end

--获得成长价格
--根据priceId，
function ShopDataHelper.getTotalPriceByAdd(priceAddId,startTimes,buyTimes,srcPrice)
	buyTimes = buyTimes or 1
	if priceAddId > 0 then
		local totalPrice = 0
		for i = 1, buyTimes do
			local now = i + startTimes
			totalPrice = totalPrice + ShopDataHelper.getPriceAdd(priceAddId, now)
		end
		return totalPrice
	else
		srcPrice = srcPrice or 0
		return srcPrice * buyTimes
	end
	return 0
end


--根据总价钱，获得成长最大数量
function ShopDataHelper.getTotalNumByAdd(priceAddId,startTimes,surplus,totalPrice,srcPrice)
	if priceAddId > 0 then
		local currentPrice = 0
		local currTimes = 0
		for i = 1,surplus,1 do
			local addPrice = ShopDataHelper.getPriceAdd(priceAddId, startTimes + i)
			if addPrice > 0 then
				if currentPrice + addPrice <= totalPrice then
					currentPrice =  currentPrice + addPrice
					currTimes = i
				end
			else
				break
			end
		end
		return currTimes
		--[[
		while(currentPrice < totalPrice)
		do
			local addPrice = ShopDataHelper.getPriceAdd(priceAddId, startTimes + currTimes)

			if addPrice > 0 then
				currentPrice = currentPrice + addPrice
				currTimes = currTimes + 1
			else
				break
			end

		end

		return currTimes
		]]
	else
		return math.floor(totalPrice / srcPrice)
	end

	return 0
end



--获得该商品能购买最大上限
function ShopDataHelper.getFixItemMaxNum(shopItemData)
	local UserDataHelper = require("app.utils.UserDataHelper")
	local surplus = shopItemData:getSurplusTimes() -- 剩余购买次数
	local buyTimes = shopItemData:getBuyCount()
	local shopCfg =  shopItemData:getConfig()

	local maxNum = 999
	for i=1, 2 do
		local size = shopCfg["price"..i.."_size"]
		local type = shopCfg["price"..i.."_type"]
		local value = shopCfg["price"..i.."_value"]
		local addId = shopCfg["price"..i.."_add"]
		if type > 0 then
			local totolMoney = UserDataHelper.getNumByTypeAndValue(type, value)
			logWarn("  ^^^^^ "..tostring(totolMoney))
			local currNum = ShopDataHelper.getTotalNumByAdd(addId,buyTimes,surplus,totolMoney,size)
			logWarn("  ^^^^^ end  " ..currNum)
			if maxNum > currNum then
				maxNum = currNum
			end
		end
	end
	if surplus > 0 and maxNum > surplus then
		maxNum = surplus
	end

	return maxNum
end



--获得成长价格
function ShopDataHelper.getPriceAdd(priceAddId, buyTimes)

	local priceConfig = G_UserData:getPriceConfig(priceAddId)
	local priceList = priceConfig.priceList
	local priceMap = priceConfig.priceMap
	local maxTime = priceConfig.maxTime
	local lastCfgData = priceList[#priceList]
	if buyTimes >= maxTime then
		return lastCfgData and lastCfgData.price or 0
	end

--[[
	for i , cfgData in ipairs(priceIdList) do
		if buyTimes <= cfgData.time then
			lastCfgData = cfgData
			return lastCfgData.price
		end
	end

	return lastCfgData.price
]]

	local priceConfig = priceMap[buyTimes]
	return priceConfig and priceConfig.price or 0
end

--获取商店类型
function ShopDataHelper.getShopType(shopId)
    local shopData = ShopInfo.get(shopId)
    return shopData.shop_type
end

function ShopDataHelper.getShopTab(entranceType)
	if not entranceType then
		entranceType = ShopConst.DEFAULT_SHOP_ENTRANCE
	end
	local shopMgr = G_UserData:getShops()
	local shopList = shopMgr:getShopCfgList()
	local shoptabList = {}
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")

	for i, value in ipairs(shopList) do
		if LogicCheckHelper.funcIsOpened(value.function_id) then
			if value.default_create ~= 0 and value.shop_entrance == entranceType then
				table.insert(shoptabList, value)
			end
		end
	end


    table.sort(shoptabList, function(item1, item2)
        if item1.order ~= item2.order then
            return item1.order < item2.order
        end
    end)

	return shoptabList
end

function ShopDataHelper.getShopIdByTab(tabIndex)
	local shopTabList = ShopDataHelper.getShopTab()
	local shopData = shopTabList[tabIndex]
	return shopData.shop_id
end

--
function ShopDataHelper.getShopSubTab(shopId)
	local shopMgr = G_UserData:getShops()
	local shopData = shopMgr:getShopCfgById(shopId)
	local shoptabList = {}
	local shopTabIndex = {}
	if shopData == nil then
		return {}, {}
	end

	for i = 1, 6 do
		local tabName = shopData["tab_name"..i]
		local shopList = shopMgr:getShopGoodsList(shopId,i)
		if tabName and tabName ~= "" and #shopList > 0 then
			table.insert(shoptabList, tabName)
			table.insert(shopTabIndex, {name = tabName, subId = i, index = #shoptabList})
		end

	end

	return shoptabList,shopTabIndex
end

--获得随机商店信息
function ShopDataHelper.getRandomShopInfo(shopId)
	local shopMgr = G_UserData:getShops()
	local shopData = shopMgr:getRandomShopInfo(shopId)
	return shopData
end


--该碎片是否有上阵英雄
function ShopDataHelper.isFragmentInBattle(shopItem)
	local cfgData = shopItem:getConfig()
	if cfgData.item_type == TypeConvertHelper.TYPE_FRAGMENT then
		local fragment = TypeConvertHelper.convert(	cfgData.item_type, cfgData.item_id)
		if fragment then
			if fragment.cfg.comp_type == 1 then --武将合成
				return G_UserData:getTeam():isInBattleWithBaseId(fragment.cfg.comp_value), 1
			end
			if fragment.cfg.comp_type == 4 then --神兵
				local UserDataHelper = require("app.utils.UserDataHelper")
				return UserDataHelper.isInBattleHeroWithBaseId(fragment.cfg.comp_value),4
			end
		end
	end

	return false
end

function ShopDataHelper.isCompleteOrFragmentInBattle ( shopItem )
	local cfgData = shopItem:getConfig()
	local itemInfo = TypeConvertHelper.convert(	cfgData.item_type, cfgData.item_id)
	if cfgData.item_type == TypeConvertHelper.TYPE_FRAGMENT then
		if itemInfo then
			if itemInfo.cfg.comp_type == 1 then --武将合成
				return G_UserData:getTeam():isInBattleWithBaseId(itemInfo.cfg.comp_value), 1
			end
			if itemInfo.cfg.comp_type == 4 then --神兵
				local UserDataHelper = require("app.utils.UserDataHelper")
				return UserDataHelper.isInBattleHeroWithBaseId(itemInfo.cfg.comp_value),4
			end
		end
	elseif cfgData.item_type == TypeConvertHelper.TYPE_HERO then
		if itemInfo then
			return G_UserData:getTeam():isInBattleWithBaseId(itemInfo.cfg.id), 1
		end
	elseif cfgData.item_type == TypeConvertHelper.TYPE_INSTRUMENT then
		if itemInfo then
			local UserDataHelper = require("app.utils.UserDataHelper")
			return UserDataHelper.isInBattleHeroWithBaseId(itemInfo.cfg.id), 4
		end
	end

	return false
end

--该英雄是否是上阵英雄
function ShopDataHelper.isHeroInBattle(shopItem)
	local cfgData = shopItem:getConfig()
	if cfgData.item_type == TypeConvertHelper.TYPE_HERO then
		local hero = TypeConvertHelper.convert(	cfgData.item_type, cfgData.item_id)
		if hero then
			return G_UserData:getTeam():isInBattleWithBaseId(hero.cfg.id), 1
		end
	end

	return false
end


--获取未购买上阵武将列表
function ShopDataHelper.getShopHeroInBattle(shopId)
	local shopDataList = {}
    local shopInfo = G_UserData:getShops():getRandomShopInfo(shopId)
    for i, value in pairs(shopInfo.goodList) do
		if ShopDataHelper.isFragmentInBattle(value) and value:getBuyCount() == 0 then
			table.insert(shopDataList, value)
		end
    end
	return shopDataList
end


--获得刷新令数量
function ShopDataHelper.getShopRefreshToken()
	local UserDataHelper = require("app.utils.UserDataHelper")
	local token = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_REFRESH_TOKEN)
	return token
end



--获取距离下一个刷新点 还剩多少秒
function ShopDataHelper.getShopLeaveRefreshSec( shopId )
	-- body
	local UserDataHelper = require("app.utils.UserDataHelper")
	local shopInfo = UserDataHelper.getRandomShopInfo(shopId)

	local sec = -1
	local refreshTime = shopInfo.cfg.free_times_time
	local nowTime = G_ServerTime:getTime()
	local lastTime = shopInfo.freeCntTime
	sec =  refreshTime - (nowTime - lastTime)

	return sec,refreshTime
end

function ShopDataHelper.getShopRecoverMaxRefreshCountTime( shopId )
	if not G_UserData:getShops():isShopOpened(shopId) then
		return 0,false,0
	end
	local playerLevel = G_UserData:getBase():getLevel()
	if playerLevel <= 10 then
		return 0,false,0
	end

	local UserDataHelper = require("app.utils.UserDataHelper")
	local shopInfo = UserDataHelper.getRandomShopInfo(shopId)
	if not shopInfo  then
		return 0,false,0
	end

	local refreshTime = shopInfo.cfg.free_times_time
	local nowTime = G_ServerTime:getTime()
	local lastTime = shopInfo.freeCntTime
	local num = shopInfo.freeCntTotal - shopInfo.freeCnt
	local recoverTime =  num * refreshTime + lastTime

	return recoverTime,recoverTime <= nowTime,refreshTime
end



return ShopDataHelper
