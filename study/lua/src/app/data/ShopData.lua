--[[
    ShopData
    商店数据
    根据商店id， 商店物品id 获得数据信息
]]

local BaseData = require("app.data.BaseData")
local ShopInfo = require("app.config.shop")
local ShopFix = require("app.config.shop_fix")
local ShopRandomItems = require("app.config.shop_random_items")
local ShopConst = require("app.const.ShopConst")
local ShopItemData = require("app.data.ShopItemData")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local function isFixShop(shopId)
    local shopData = ShopInfo.get(shopId)
    if shopData.shop_type == 0 then
       return true
    end
    if shopData.shop_type == 1 then
       return false
    end
    return false
end

---------------------------------------------------------------------------------------------------------------------
-- Shop数据集

local ShopData = class("ShopData", BaseData)

-- 商店数据结构
--[[
shopDataList = {
    [1] = {
        --固定商店物品列表
        fixGoods = {
            ["k_101"] = ShopItemData,
            ["k_102"] = ShopItemData,
        }
    },
    [2] = {
       --随即商店物品列表
       randomGoods = {
            ["k_101"] = ShopItemData,
            ["k_102"] = ShopItemData,
        }
       bornTime = 0, --生成时间
       todayManualCount, --今天手动刷新累积次数
       freeCntTime, -- 免费次数最后刷新时间
       freeCnt, --免费剩余次数
    },
}
]]

function ShopData:c2sBuyShopGoods(goodId, shopId, buyCount, buyType)
    --判断是否过期
    if self:isExpired() == true then
        self:c2sGetShopInfo(shopId)
        return
    end

    local buyItem = {
        goods_id = goodId, --道具ID
        shop_id = shopId, --数量
        buy_count = buyCount or 1,
        buy_type = buyType or 0,
    }
    G_NetworkManager:send(MessageIDConst.ID_C2S_BuyShopGoods, buyItem)
end


function ShopData:c2sGetShopInfo(shopId)
	local message = {
		shop_id = shopId,
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetShopInfo, message)
end


function ShopData:c2sShopRefresh(shopId, refreshType)
    --判断是否过期
    if self:isExpired() == true then
        self:c2sGetShopInfo(shopId)
        return
    end

	local message = {
		shop_id = shopId,
		refresh_type = refreshType or 1,
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_ShopRefresh, message)
end

function ShopData:ctor(properties)
	ShopData.super.ctor(self, properties)

    self._shopList = {}

	self._recvGetShopData = G_NetworkManager:add(MessageIDConst.ID_S2C_GetShopInfo, handler(self, self._s2cGetShopInfo))
    self._recBuyShopGoods = G_NetworkManager:add(MessageIDConst.ID_S2C_BuyShopGoods, handler(self, self._s2cBuyShopGoods))


    self:_initShopList()

    self._popBuyOnceShow = true
    --self:_initFixShop(ShopConst.NORMAL_SHOP)
end

--初始化固定商店
function ShopData:_initFixShop(shopId)
    self._shopList[shopId] = {}
    self._shopList[shopId].fixGoods = {}

    for i = 1, ShopFix.length() do
        local fixData = ShopFix.indexOf(i)
        if fixData.shop_id == shopId then
            local baseData = ShopItemData.new()
            local tempTable = {
                goods_id = fixData.id,
                buy_count = 0,
                goods_no = 0,
            }
            baseData:initData(shopId,tempTable)
            baseData:setBuyCount(0)
            baseData:setIsHaveBuy(false)
            baseData:setIsCanBuy(false)

            self._shopList[shopId].fixGoods["k_"..fixData.id] = baseData
        end
    end
end


--更新随即商店数据
function ShopData:_updateRandomShop(shopId,randomShop)
    --dump(propData)
    self._shopList[shopId] = {}
    self._shopList[shopId].randomGoods = self._shopList[shopId].randomGoods or {}

    for i, value in ipairs(randomShop.goods) do
        local baseData = ShopItemData.new()
        baseData:initData(shopId,value)
        local goodsNo = baseData:getGoodNo()
        self._shopList[shopId].randomGoods["k_"..goodsNo] = baseData
    end

    self._shopList[shopId].bornTime = randomShop.born_time--生成时间
    self._shopList[shopId].todayManualCount = randomShop.today_manual_count --今天手动刷新累积次数
    self._shopList[shopId].freeCntTime = randomShop.free_cnt_time --免费次数最后刷新时间
    self._shopList[shopId].freeCnt = randomShop.free_cnt --免费剩余次数
end



--更新固定商店数据
function ShopData:_updateFixShop(shopId,fixShop)
    --dump(propData)
    --self._shopList[shopId] = {}

    --self:_initFixShop(shopId)
    local function checkBanType(baseData)
        local numBanType = baseData:getConfig().num_ban_type--0无限制，1终生，2每日
        local buyCount = baseData:getBuyCount()
        if numBanType == 1 then
            if buyCount >= 1 then
                return true
            end
            return false
        end
        return false
    end

    local function checkBuyCondition(baseData)
        local config =  baseData:getConfig()
        local ShopCheck = require("app.utils.logic.ShopCheck")
        --购买条件检查
        if ShopCheck.shopEnoughLimit(config.limit_type, config.limit_value) == false then
            return false
        end

        return true
    end

    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    for i, value in ipairs(fixShop.goods) do
        local baseData = ShopItemData.new()
        baseData:initData(shopId,value)

        local isHaveBuy = checkBanType(baseData)
        local goodsId = baseData:getGoodId()
        baseData:setIsHaveBuy(isHaveBuy)

        self._shopList[shopId].fixGoods["k_"..goodsId] = baseData
    end

    --服务器只下发购买次数
    --是否可以买的判定，需要一次性批量刷新
    for i, value in pairs(self._shopList[shopId].fixGoods) do
        local isCanBuy  = checkBuyCondition(value)
        value:setIsCanBuy(isCanBuy)
    end
end

function ShopData:_updateActiveShop(shopId, activeShop)
    G_UserData:getShopActive():updateShopList(activeShop.goods)
end

function ShopData:_s2cBuyShopGoods(id, message)
    G_SignalManager:dispatch(SignalConst.EVENT_BUY_ITEM, message)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_SHOP_SCENE)
end

--收到服务器数据，刷新物品列表
function ShopData:_s2cGetShopInfo(id, message)
 	if message.ret ~= 1 then
		return
	end

	local shopId = message.shop_id
    if shopId == nil then
        return
    end

   -- self._shopList[shopId] = self._shopList[shopId] or {}
    self:resetTime()
    local fixShop = rawget(message, "fixed_shop")
    local randomShop = rawget(message, "random_shop")
    local activeShop = rawget(message, "active_shop")
    if fixShop then
       self:_updateFixShop(shopId, fixShop)
    end
    if randomShop then
        self:_updateRandomShop(shopId, randomShop)
    end
    if activeShop then
        self:_updateActiveShop(shopId, activeShop)
    end

    G_SignalManager:dispatch(SignalConst.EVENT_SHOP_INFO_NTF,message)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_SHOP_SCENE)
    G_SignalManager:dispatch(SignalConst.EVENT_SHOP_NEW_REMIND_UPDATE)
end

-- 清除
function ShopData:clear()
	self._recvGetShopData:remove()
	self._recvGetShopData = nil
    self._recBuyShopGoods:remove()
    self._recBuyShopGoods= nil
end

-- 重置
function ShopData:reset()
	self._shopList = {}
end

function ShopData:getShopGoodsById(shopId, goodsId)
    if self._shopList == nil then
		return nil
	end
    if isFixShop(shopId) then
        return self._shopList[shopId].fixGoods["k_"..goodsId]
    end
	return self._shopList[shopId].randomGoods["k_"..goodsId]
end



-- 根据商店id 获取物品列表
function ShopData:getShopGoodsList(shopId, subId )
	if self._shopList == nil then
		return {}
	end
    if isFixShop(shopId) then
        return self:_getFixShopGoods(shopId,subId)
    end
	return self:_getRandomShopGoods(shopId)
end

--返回nil功能未开启或没有数据,返回false找不到
function ShopData:getFixShopGoodsByResId(shopId,type,value)
    if not self:isShopOpened(shopId) then
        return nil
    end
    if self._shopList == nil or  not self._shopList[shopId] then
		return nil
	end
    local fixGoods = self._shopList[shopId].fixGoods
    if not fixGoods then
        return nil
    end
    for k,v in pairs(fixGoods) do
        local config = v:getConfig()
        if config.type == type and config.value == value then
            return v
        end
    end
    return false
end

--随即商店免费刷次次数已满
function ShopData:isRandomShopFreeMax(shopId)
    local shopInfo = self:getRandomShopInfo(shopId)
    if shopInfo then
        local isFull = shopInfo.freeCnt == shopInfo.freeCntTotal
        return isFull
    end
    return false
end


-- 获取随即商店信息
function ShopData:getRandomShopInfo( shopId )
	if self._shopList == nil then
		return nil
	end
    if isFixShop(shopId) then
        return nil
    end
    local randomShop = self._shopList[shopId]
    if randomShop == nil then
        return nil
    end
    local UserDataHelper = require("app.utils.UserDataHelper")
    local randomShopCfg = self:getShopCfgById(shopId)
    local shopInfo = {
        bornTime = randomShop.bornTime, --生成时间
        todayManualCount = randomShop.todayManualCount or 0, --今天手动刷新累积次数
        freeCntTime = randomShop.freeCntTime, --免费次数最后刷新时间
        freeCnt = randomShop.freeCnt, --免费剩余次数
        freeCntTotal = randomShopCfg.free_times_max, --免费总次数
        costType = randomShopCfg.type,
        costValue = randomShopCfg.value,
        costSize = randomShopCfg.size,
        refreshCntTotal = UserDataHelper.getVipValueByType(randomShopCfg.refresh_vip_type),--刷新上线
        goodList = self:getShopGoodsList(shopId),
        cfg = randomShopCfg
    }
    shopInfo.surplusTimes = 0
    shopInfo.surplusTimes = shopInfo.refreshCntTotal - shopInfo.todayManualCount --剩余次数

	return shopInfo
end

function ShopData:isShopOpened(shopId)
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local shopCfg =  ShopInfo.get(shopId)
    assert(shopCfg,"shop_info not find id "..tostring(shopId))
    if not LogicCheckHelper.funcIsOpened(shopCfg.function_id) then
        return false
    end
    return true
end

--检查每日购买一次的特定类型，是否有红点逻辑
function ShopData:isFixShopItemDataCanBuy( shopData, checkType )
    -- body
    local function checkItemType(baseData,item)
        local itemConfig = baseData:getConfig()
        local numBanType = itemConfig.num_ban_type--0无限制，1终生，2每日
        local buyCount = baseData:getBuyCount()
        local vipTimes = baseData:getVipBuyTimes()

        --每日物品，并且银币类型
        if numBanType == 2 then
            if itemConfig.price1_type == item.type and
                itemConfig.price1_value == item.value and  buyCount < vipTimes then
                return true
            end
        end
        return false
    end

    local function checkBuyCondition(baseData)
        local config =  baseData:getConfig()
        local ShopCheck = require("app.utils.logic.ShopCheck")
        --购买条件检查
        if ShopCheck.shopEnoughLimit(config.limit_type, config.limit_value) == false then
            return false
        end
        --资源消耗检查
        if ShopCheck.shopFixBuyCheck(baseData,1,false) == false then
            return false
        end
        return true
    end

    --1.没买过 2 可购买
    if checkItemType(shopData,checkType) and checkBuyCondition(shopData) then
        return true
    end

    return false
end

--指定特性类型是否有红点逻辑
function ShopData:isFixShopTypeItemCanBuy(shopId, subId, checkType)
    checkType = checkType or {
        type =  5,--银币类型
        value = 2,
    }
    if not self:isShopOpened(shopId) then
        return false
    end
    local itemList = self:_getFixShopGoods(shopId, subId)
    for i, data in ipairs(itemList) do
        --1.没买过 2 可购买
        if self:isFixShopItemDataCanBuy(data, checkType) == true then
            return true
        end
    end
    return false
end

--用于奖励页面，判定是否有奖励可购买
function ShopData:isFixShopGoodsCanBuy(shopId, subId)
    if not self:isShopOpened(shopId) then
        return false
    end


    local function checkBanType(baseData)
        local numBanType = baseData:getConfig().num_ban_type--0无限制，1终生，2每日
        local buyCount = baseData:getBuyCount()
        if numBanType == 1 then
            if buyCount >= 1 then
                return true
            end
            return false
        end
        return false
    end

    local function checkBuyCondition(baseData)
        local config =  baseData:getConfig()
        local ShopCheck = require("app.utils.logic.ShopCheck")
        --购买条件检查
        if ShopCheck.shopEnoughLimit(config.limit_type, config.limit_value) == false then
            return false
        end
        --资源消耗检查
        logWarn("ShopData:isFixShopGoodsCanBuy")
        if ShopCheck.shopFixBuyCheck(baseData,1,false) == false then
            return false
        end
        return true
    end

    local itemList = self:_getFixShopGoods(shopId, subId)
    for i, data in ipairs(itemList) do
        --1.没买过 2 可购买
        if checkBanType(data) == false and checkBuyCondition(data) == true then
            return true
        end
    end
    return false
end

-- 获取固定商店物品列表
function ShopData:_getFixShopGoods(shopId, subId)
    local tempList = {}
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local subTab = subId or 1
    self._shopList[shopId] = self._shopList[shopId] or {}
    local fixList = self._shopList[shopId].fixGoods or {}

    local function buyCondition()
    end

    --根据玩家等级过滤
    local function filterGoods(cfg)
        if cfg.is_true == 0 then
            return true
        end

        if cfg.tab ~= subTab then
            return true
        end

        local playerLevel = G_UserData:getBase():getLevel()
        local levelMin = cfg.level_min
        local levelMax = cfg.level_max
        local levelShow = cfg.level_show
        local showControl = cfg.show_control
        local isAppStore = G_ConfigManager:isAppstore()
        logWarn( {cfg=cfg,isAppStore=isAppStore,showControl=showControl} )

        --显示版本控制
        if showControl ~= 0 then
            if isAppStore and showControl == ShopConst.SHOW_CONTORL_NO_APPSTORE then -- 送审版本不显示
                return true
            end
            local isAppStoreAndNotInAppstore = isAppStore and showControl ~= ShopConst.SHOW_CONTORL_APPSTORE
            if isAppStoreAndNotInAppstore or not isAppStore then -- 送审版本显示
                return true
            end
        end
        
        --不在开服天数内，则不显示
        if LogicCheckHelper.enoughOpenDay(cfg.day) == false then
            return true
        end
        
        if playerLevel < levelShow or  playerLevel > levelMax then
            return true
        end
        --if  playerLevel > levelMax or playerLevel < levelMin then
        --   return true
        --end

        return false
    end

    --检查是否拥有,并且设置一个值，用于排序
    local function checkAndSetIsOwn(unitData)
        if unitData:getConfig().type == TypeConvertHelper.TYPE_AVATAR then --是变身卡才检查
            local isHave = G_UserData:getAvatar():isHaveWithBaseId(unitData:getConfig().value)
            unitData:setIsHaveBuy(isHave)
        end
    end

    local useSortNormal = true
    for key, value in pairs(fixList) do
        local config = value:getConfig()
        if filterGoods(config) == false then
            checkAndSetIsOwn(value)
            table.insert(tempList, value)
        end
        if config.num_ban_type == 1 then --0无限制，1终生，2每日
           useSortNormal = false
        end
    end

    local function sortNormal( tempList )
        table.sort( tempList, function (a ,b )
            local configA = a:getConfig()
            local configB = b:getConfig()
            return configA.order < configB.order
        end )
    end

    local function sortNumBanType1( tempList )
        table.sort( tempList, function (a ,b )
            local configA = a:getConfig()
            local configB = b:getConfig()

            if a:getIsHaveBuy() ~= b:getIsHaveBuy() then
                return not a:getIsHaveBuy()
            end

            if a:getIsCanBuy() ~= b:getIsCanBuy() then
                return a:getIsCanBuy()
            end

            return configA.order < configB.order

        end )
    end

    if useSortNormal then
        logWarn( string.format("sortNormal shopId[%d] subId[%d]",shopId, subId))
        sortNormal(tempList)
    else
        logWarn( string.format("sortNumBanType1 shopId[%d] subId[%d]",shopId, subId))
        sortNumBanType1(tempList)
    end

    return tempList
end

-- 获取随即商店物品列表
function ShopData:_getRandomShopGoods(shopId)

    local tempList = {}
    self._shopList[shopId] = self._shopList[shopId] or {}
    local goodList = self._shopList[shopId].randomGoods or {}

    for key,value in pairs(goodList) do
        table.insert(tempList, value)
    end

    table.sort( tempList, function (a ,b )
        local qa,qb = a:getGoodNo(),b:getGoodNo()
        return qa < qb
    end )

    return tempList
end

function ShopData:_initShopList()
    if self._shopInfoList == nil then
        self._shopInfoList = {}

        for i =1, ShopInfo.length() do
            local data =  ShopInfo.indexOf(i)
            table.insert( self._shopInfoList, data)
            if isFixShop(data.shop_id) then
                self:_initFixShop(data.shop_id)
            end
        end
    end
end


-- 获取商店标签页列表
function ShopData:getShopCfgList()
    if self._shopInfoList == nil then
        self._shopInfoList = {}
        for i =1, ShopInfo.length() do
            table.insert( self._shopInfoList, ShopInfo.indexOf(i))
        end
    end

    return self._shopInfoList
end

function ShopData:getShopCfgByTabIndex(tabIndex)
    local shopInfo = self._shopInfoList[tabIndex]

    return shopInfo
end

function ShopData:getShopCfgById(shopId)
    for i, shopInfo in ipairs(self._shopInfoList) do
        if shopInfo.shop_id == shopId then
            return shopInfo
        end
    end
    return nil
end

function ShopData:setBuyOnceShow(needShow)
    self._popBuyOnceShow = needShow
end

function ShopData:getBuyOnceShow()
    return  self._popBuyOnceShow
end
return ShopData
