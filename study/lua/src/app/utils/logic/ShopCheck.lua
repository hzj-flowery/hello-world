--逻辑检查函数列表
--用户数据逻辑检查
local ShopCheck = {}
local DataConst = require("app.const.DataConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local ShopConst = require("app.const.ShopConst")

--固定商店购买条件检查
function ShopCheck.shopFixBtnCheck(shopFixData)
    local buyCount = shopFixData:getBuyCount()
    local shopFixCfg = shopFixData:getConfig()
    local vipTimes = shopFixData:getVipBuyTimes()

    local checkParams = {
        [1] = { funcName = "shoplevelMin", param = shopFixCfg.level_min  },  --检查玩家等级
        [2] = { funcName = "shoplevelMax", param = shopFixCfg.level_max },  --检查玩家等级
        [3] = { funcName = "shopEnoughLimit",param = {shopFixCfg.limit_type, shopFixCfg.limit_value} },  --商店条件检测
        [4] = { funcName = "shopNumBanType",param = {shopFixCfg.num_ban_type,buyCount,vipTimes} },  --检查玩家等级
        [5] = { funcName = "shopGoodsLack", param = {shopFixCfg.type, shopFixCfg.value}}, --检查商品是否缺少
    }

    local LogicCheckHelper = require("app.utils.LogicCheckHelper")

    local success, errorMsg,funcName  = LogicCheckHelper.doCheckList(checkParams)

    --return true
    return success,errorMsg,funcName
end

--固定商店购买条件检查 返回多个错误
function ShopCheck.shopFixBtnCheckExt(shopFixData)
    local buyCount = shopFixData:getBuyCount()
    local shopFixCfg = shopFixData:getConfig()
    local vipTimes = shopFixData:getVipBuyTimes()

    local checkParams = {
        [1] = { funcName = "shoplevelMinExt", param = shopFixCfg.level_min  },  --检查玩家等级
        [2] = { funcName = "shoplevelMax", param = shopFixCfg.level_max },  --检查玩家等级
        [3] = { funcName = "shopEnoughLimitExt",param = {shopFixCfg.limit_type, shopFixCfg.limit_value} },  --商店条件检测
        [4] = { funcName = "shopNumBanType",param = {shopFixCfg.num_ban_type,buyCount,vipTimes} },  --检查玩家等级
        [5] = { funcName = "shopGoodsLack", param = {shopFixCfg.type, shopFixCfg.value}}, --检查商品是否缺少
    }

    local LogicCheckHelper = require("app.utils.LogicCheckHelper")

    local success, errorMsgs,funcNames  = LogicCheckHelper.doCheckListExt(checkParams)

    --return true
    return success, errorMsgs, funcNames
end


--固定商店购买条件检查
--calculatedPrice:已经计算好的价格
function ShopCheck.shopFixBuyCheck(shopFixData,buyTimes, showErrorDlg, calculatedPrice1, calculatedPrice2)
    if shopFixData == nil then
        return false
    end
    buyTimes = buyTimes or 1
    if showErrorDlg == nil then
        showErrorDlg = true
    end
    local buyCount = shopFixData:getBuyCount()
    local shopFixCfg = shopFixData:getConfig()
    local vipTimes = shopFixData:getVipBuyTimes()

    local itemPrice1 = UserDataHelper.getTotalPriceByAdd(shopFixCfg.price1_add, buyCount, buyTimes,shopFixCfg.price1_size)
    local itemPrice2 = UserDataHelper.getTotalPriceByAdd(shopFixCfg.price2_add, buyCount, buyTimes,shopFixCfg.price2_size)
    if calculatedPrice1 then
        itemPrice1 = calculatedPrice1
    end
    if calculatedPrice2 then
        itemPrice2 = calculatedPrice2
    end

    local checkParams = {
        [1] = { funcName = "enoughValue", param =  {shopFixCfg.price1_type, shopFixCfg.price1_value, itemPrice1,showErrorDlg}  },  --检查资源是否满足
        [2] = { funcName = "enoughValue", param =  {shopFixCfg.price2_type, shopFixCfg.price2_value, itemPrice2,showErrorDlg}  },  --检查资源是否满足
    }

    local LogicCheckHelper = require("app.utils.LogicCheckHelper")

    local success, errorMsg,funcName  = LogicCheckHelper.doCheckList(checkParams)

    return success,errorMsg,funcName
end


--随即商店按钮状态检查
function ShopCheck.shopRandomBtnCheck(shopRandomData)
    local buyCount = shopRandomData:getBuyCount()
    local shopRandomCfg = shopRandomData:getConfig()

    if buyCount > 0 then
        return false
    end

    return true
end

--随即商店购买条件检查
function ShopCheck.shopRandomBuyCheck(shopRandomData)
    local buyCount = shopRandomData:getBuyCount()

    local shopRandomCfg = shopRandomData:getConfig()

    if buyCount > 0 then
        return false
    end

    local checkParams = {
        [1] = { funcName = "enoughValue", param =  {shopRandomCfg.type1, shopRandomCfg.value1, shopRandomCfg.size1}  },  --检查资源是否满足
        [2] = { funcName = "enoughValue", param =  {shopRandomCfg.type2, shopRandomCfg.value2, shopRandomCfg.size2}  },  --检查资源是否满足
    }

    local LogicCheckHelper = require("app.utils.LogicCheckHelper")

    local success, errorMsg,funcName  = LogicCheckHelper.doCheckList(checkParams)

    return success,errorMsg,funcName
end


--是否满足最小等级
function ShopCheck.shoplevelShow(levelShow)
    local currLv = G_UserData:getBase():getLevel()
    if currLv >= levelShow then
        return true
    end
    return false, Lang.get("shop_condition_levelShow",{level = levelShow})
end

--是否满足最小等级
function ShopCheck.shoplevelMin(levelMin)
    local currLv = G_UserData:getBase():getLevel()
    if currLv >= levelMin then
        return true
    end
    return false, Lang.get("shop_condition_levelmin",{level = levelMin})
end


--是否满足最大等级
function ShopCheck.shoplevelMax(levelMax)
    local currLv = G_UserData:getBase():getLevel()
    if currLv <= levelMax then
        return true
    end
    return false,Lang.get("shop_condition_levelmax")
end

--是否满足最小等级
function ShopCheck.shoplevelMinExt(levelMin)
    local currLv = G_UserData:getBase():getLevel()
    if currLv >= levelMin then
        return true
    end
    return false, Lang.get("shop_condition_levelmin_ext",{level = levelMin})
end


--2.购买限制条件，limitType limitValue
function ShopCheck.shopEnoughLimit(limitType, limitValue)
   -- logWarn(" ShopCheck.shopEnoughLimit(limitType, limitValue) ")
    if limitType == 0 then
        return true
    end

    --dump(limitType)
    --dump(limitValue)
    --过关斩将星星
    if limitType == ShopConst.LIMIT_TYPE_STAR then
        local maxStar = G_UserData:getTowerData():getMax_star()
        if maxStar >= limitValue then
            return true
        end
        return false, Lang.get( "shop_condition_towner_star",{num = limitValue} )
    end

    --过关斩将星星
    if limitType == ShopConst.LIMIT_TYPE_AREA then
        local maxRank = G_UserData:getArenaData():getArenaMaxRank()
        if maxRank <= limitValue then
            return true
        end
        return false, Lang.get( "shop_condition_arena_rank",{num = limitValue} )
    end

    --军团等级
    if limitType == ShopConst.LIMIT_TYPE_GROUP_LEVEL then
        local level = G_UserData:getGuild():getMyGuildLevel()
        if level >= limitValue then
            return true
        end
        return false, Lang.get( "shop_condition_group_level",{num = limitValue} )
    end

    --精英副本最大星数
    if limitType == ShopConst.LIMIT_TYPE_HARD_ELITE then
        local exploreNum = G_UserData:getChapter():getElitePassCount()
        if exploreNum >= limitValue then
            return true
        end
        return false, Lang.get( "shop_condition_elite_star",{num = limitValue} )
    end

    if limitType == ShopConst.LIMIT_TYPE_EXPLORE then
        local exploreNum = G_UserData:getExplore():getExplorePassCount()
        if exploreNum >= limitValue then
            return true
        end
        local ExploreMapHelper = require("app.scene.view.exploreMap.ExploreMapHelper")
        local name = ExploreMapHelper.getExploreNameById(limitValue)
        return false, Lang.get( "shop_condition_explore",{name = name} )
    end

    if limitType == ShopConst.LIMIT_TYPE_TREE then
        local treeLevel = G_UserData:getHomeland():getMainTreeLevel()
        if treeLevel >= limitValue then
            return true
        end

        return false, Lang.get( "shop_condition_tree_level", {num = Lang.get("homeland_main_tree_level"..limitValue)} )
    end
end

--2.购买限制条件，limitType limitValue
function ShopCheck.shopEnoughLimitExt(limitType, limitValue)
    -- logWarn(" ShopCheck.shopEnoughLimit(limitType, limitValue) ")
     if limitType == 0 then
         return true
     end
 
     --dump(limitType)
     --dump(limitValue)
     --过关斩将星星
     if limitType == ShopConst.LIMIT_TYPE_STAR then
         local maxStar = G_UserData:getTowerData():getMax_star()
         if maxStar >= limitValue then
             return true
         end
         return false, Lang.get( "shop_condition_towner_star_ext",{num = limitValue} )
     end
 
     --过关斩将星星
     if limitType == ShopConst.LIMIT_TYPE_AREA then
         local maxRank = G_UserData:getArenaData():getArenaMaxRank()
         if maxRank <= limitValue then
             return true
         end
         return false, Lang.get( "shop_condition_arena_rank_ext",{num = limitValue} )
     end
 
     --军团等级
     if limitType == ShopConst.LIMIT_TYPE_GROUP_LEVEL then
         local level = G_UserData:getGuild():getMyGuildLevel()
         if level >= limitValue then
             return true
         end
         return false, Lang.get( "shop_condition_group_level_ext",{num = limitValue} )
     end
 
     --精英副本最大星数
     if limitType == ShopConst.LIMIT_TYPE_HARD_ELITE then
         local exploreNum = G_UserData:getChapter():getElitePassCount()
         if exploreNum >= limitValue then
             return true
         end
         return false, Lang.get( "shop_condition_elite_star",{num = limitValue} )
     end
 
     if limitType == ShopConst.LIMIT_TYPE_EXPLORE then
         local exploreNum = G_UserData:getExplore():getExplorePassCount()
         if exploreNum >= limitValue then
             return true
         end
         local ExploreMapHelper = require("app.scene.view.exploreMap.ExploreMapHelper")
         local name = ExploreMapHelper.getExploreNameById(limitValue)
         return false, Lang.get( "shop_condition_explore_ext",{name = name} )
     end
 
     if limitType == ShopConst.LIMIT_TYPE_TREE then
         local treeLevel = G_UserData:getHomeland():getMainTreeLevel()
         if treeLevel >= limitValue then
             return true
         end
 
         return false, Lang.get( "shop_condition_tree_level_ext", {num = Lang.get("homeland_main_tree_level"..limitValue)} )
     end
 end

--购买次数限制
function ShopCheck.shopNumBanType(banType,buyCount, vipTimes)
     --终身限制购买的道具，有过购买记录后，即不可购买。按钮显示灰色，文本显示“只可购买1次”
    if banType == 1 then
        if buyCount >= 1 then
            return false, Lang.get("shop_condition_buyonce")
        end
    end
    --每日限制购买的道具，今日购买次数达到上限后，不可购买。按钮显示灰色，文本显示“已达购买上限”
     --vip次数限制
    if banType == 2 or banType == 3 or banType == 4 or banType == 5 then
        if buyCount >= vipTimes then
            return false, Lang.get("shop_condition_buymax")
        end
        return true --Lang.get("shop_condition_buynum",{num = vipTimes - buyCount})
    end

    return true
end

--商品是否缺少
function ShopCheck.shopGoodsLack(type, value)
    if type == TypeConvertHelper.TYPE_AVATAR then
        local isHave = G_UserData:getAvatar():isHaveWithBaseId(value)
        local isLack = not isHave
        return isLack, Lang.get("shop_condition_buyonce")
    end
    return true
end

--是否上阵武将未购买
function ShopCheck.shopHeroInBattle(shopId,callback,refreshType)
    local UserDataHelper = require("app.utils.UserDataHelper")
	local shopDataList = {}
    local shopInfo = G_UserData:getShops():getRandomShopInfo(shopId)
    local function callBackFunction()
        if callback and type(callback) == "function" then
            callback(refreshType)
        end
    end

    for i, value in pairs(shopInfo.goodList) do
        local popupDlg, compType =  UserDataHelper.isCompleteOrFragmentInBattle(value)
        if popupDlg and value:getBuyCount() == 0 then

            if compType == 1 then
                if UserDataHelper.getPopModuleShow("shopHeroInBattle") == true then
                        callBackFunction()
                        return true
                end
                local buyHeroAlert = Lang.get("shop_buy_hero_alert")
                local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("common_title_notice"),buyHeroAlert,callBackFunction)
                PopupSystemAlert:openWithAction()
                PopupSystemAlert:setModuleName("shopHeroInBattle")
            end
            if compType == 4 then
                if UserDataHelper.getPopModuleShow("shopInstrumentInBattle") == true then
                    callBackFunction()
                    return true
                end
                local buyInstrumentAlert = Lang.get("shop_buy_instrument_alert")
                local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("common_title_notice"),buyInstrumentAlert,callBackFunction)
                PopupSystemAlert:openWithAction()
                PopupSystemAlert:setModuleName("shopInstrumentInBattle")
            end

            return true
        end

    end
	return false
end

--是否有免费刷新
function ShopCheck.shopIsFreeRefresh(shopId,callback)
    local shopData = G_UserData:getShops():getRandomShopInfo(shopId)

    if shopData.freeCnt > 0 then --有免费次数
        --是否有上阵武将
        if ShopCheck.shopHeroInBattle(shopId,callback,ShopConst.REFRESH_TYPE_FREE) == false then
            --发送购买请求
            if callback and type(callback) == "function" then
                callback(ShopConst.REFRESH_TYPE_FREE)
            end
        end

        return true
    end

    --G_Prompt:showTip("免费次数已用完")

    return false
end

--是否有刷新令
function ShopCheck.shopHasRefreshToken(shopId,callback)
    local UserDataHelper = require("app.utils.UserDataHelper")
    local shopData = G_UserData:getShops():getRandomShopInfo(shopId)
    local tokenNum = UserDataHelper.getShopRefreshToken()

    --如果不使用刷新令消耗，则返回
    if shopData.cfg.is_cost == 1 then

        if tokenNum > 0 then
            --是否有上阵武将
            if ShopCheck.shopHeroInBattle(shopId,callback,ShopConst.REFRESH_TYPE_TOKEN) == false then
                --发送购买请求
                if callback and type(callback) == "function" then
                    callback(ShopConst.REFRESH_TYPE_TOKEN)
                end
            end

            return true
        end

    end

    --G_Prompt:showTip("刷新令不足")

    return false
end

--刷新资源是否充足
function ShopCheck.shopHasRefreshCost(shopId, callback)
    local shopData = G_UserData:getShops():getRandomShopInfo(shopId)

    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local success, errorMsg  = LogicCheckHelper.doCheck("enoughValue", {param = {shopData.costType,shopData.costValue,shopData.costSize}})

    if success == true then
        --是否有上阵武将
        if ShopCheck.shopHeroInBattle(shopId,callback,ShopConst.REFRESH_TYPE_RES) == false then
            --发送购买请求
            if callback and type(callback) == "function" then
                callback(ShopConst.REFRESH_TYPE_RES)
            end
            return true
        end
    end

    --弹出获取资源弹框


    return false
end





function ShopCheck.shopRefreshBtnCheck(shopId,callback)

    if ShopCheck.shopIsFreeRefresh(shopId, callback) == true then
        return true
    end

    local shopData = G_UserData:getShops():getRandomShopInfo(shopId)

    --每日固定刷新次数，为0直接返回
    if shopData.surplusTimes <= 0 then
        --弹出VIP弹框
        G_Prompt:showTip("剩余次数不足")
        return false
    end

    if ShopCheck.shopHasRefreshToken(shopId,callback) == true then
        return true
    end

    if ShopCheck.shopHasRefreshCost(shopId, callback) == true then
        return true
    end

    return false
end

function ShopCheck.shopCheckShopBuyRes(itemType,itemValue,onlyShowTips)
	local shopItemData = G_UserData:getShops():getFixShopGoodsByResId(ShopConst.NORMAL_SHOP,itemType,itemValue)
	if shopItemData == nil then--商店功能未开放
		G_Prompt:showTip(Lang.get("common_popup_shop_buy_not_open"))
		return false
	elseif shopItemData == false then--没有此类商品
		G_Prompt:showTip(Lang.get("common_popup_shop_buy_not_item"))
		return false
	end

	local success01, errorMsg, funcName = ShopCheck.shopFixBtnCheck(shopItemData)
	if success01 == false then--不符合购买条件(等级、限制、购买次数)
		--去提示升级VIP对话框
		local cfg = shopItemData:getConfig()
		if funcName == "shopNumBanType" and shopItemData:isCanAddTimesByVip() then--3表明能通过VIP提升次数
				--"主公，您当前VIP4，觉醒商店刷新18次已用完(vip_function,hint1)"
            local LogicCheckHelper = require("app.utils.LogicCheckHelper")
			local timesOut = LogicCheckHelper.vipTimesOutCheck(cfg.num_ban_value,
				shopItemData:getBuyCount(),Lang.get("shop_condition_buymax"),onlyShowTips)
		elseif errorMsg then
			G_Prompt:showTip(errorMsg)
		end
		return false
	end
	return true
end


return ShopCheck
