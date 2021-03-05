------------------------------------------------------------------------
-- 商店物品基础数据
-- 固定商店物品 or 随即商店物品
local BaseData = require("app.data.BaseData")
local ShopInfo = require("app.config.shop")
local ShopFix = require("app.config.shop_fix")
local ShopRandomItems = require("app.config.shop_random_items")

local schema = {}
schema["goodId"] 			= {"number", 0} -- 商店商品id
schema["goodNo"]		    = {"number", 0} -- 商店格子No
schema["buyCount"] 			= {"number", 0} -- 已购买数量
schema["shopId"] 			= {"number", 0} -- 商店Id
schema["configType"] 		= {"string", 0} -- 物品类型（固定，随即）
schema["config"]		    = {"table", {}} -- 配置数据
schema["isCanBuy"]          = {"bool", false}
schema["isHaveBuy"]         = {"bool", false}
local ShopItemData = class("ShopItemData", BaseData)
ShopItemData.schema = schema


function ShopItemData:ctor(properties)
    ShopItemData.super.ctor(self, properties)
end

function ShopItemData:initData(shopId,data)
    local goodId = rawget(data, "goods_id")
    local buyCount = rawget(data, "buy_count")
    local goodNo = rawget(data, "goods_no")
    self:setGoodId(goodId)
    self:setBuyCount(buyCount)

    if goodNo then
        self:setGoodNo(goodNo)
    end

	local info = nil
    local shopData = ShopInfo.get(shopId)
    if shopData.shop_type == 0 then
        info = ShopFix.get(goodId)
        assert(info,"ShopFix can't find id = "..tostring(goodId))
        self:setConfigType("fix")


    end
    if shopData.shop_type == 1 then
        info = ShopRandomItems.get(goodId)
        assert(info,"ShopRandomItems can't find id = "..tostring(goodId))
        self:setConfigType("random")
    end

    self:setShopId(shopId)
	self:setConfig(info)

end

function ShopItemData:getVipBuyTimes()
    if self:getConfigType() == "fix" then
        local playerVip = G_UserData:getVip():getLevel()
        local cfg = self:getConfig()

		--类型为3的，根据策划需求，读取vipfunc的数值
        if cfg.num_ban_type == 3 then
             local vipfunc = G_UserData:getVip():getVipFunctionDataByType(cfg.num_ban_value)
             assert(vipfunc, string.format("ShopItemData:getVipBuyTimes can not find vipType[%d] by itemId[%d]",cfg.id,cfg.num_ban_value))
             return vipfunc.value
        end
        -- 1终生显示 2每日限制 获得购买次数 4 每周 5 赛季
        if  cfg.num_ban_type == 1 or cfg.num_ban_type == 2 
            or cfg.num_ban_type == 4
            or cfg.num_ban_type == 5 then
            return cfg.num_ban_value
        end
        --local vipTimes = cfg["vip"..playerVip.."_num"]
        --return vipTimes
    end
    return 0
end

-- 获取限制类型
function ShopItemData:getLimitType( ... )
    if self:getConfigType() == "fix" then
        local playerVip = G_UserData:getVip():getLevel()
        local cfg = self:getConfig()
        return cfg.num_ban_type
    end
    return 0
end

function ShopItemData:isCanAddTimesByVip()
    if self:getConfigType() == "fix" then
        local cfg = self:getConfig()
        return cfg.num_ban_type == 3
    end
    return false
end

--获得剩余次数
function ShopItemData:getSurplusTimes()
    if self:getConfigType() == "fix" then
        if self:getVipBuyTimes() > 0 then
            local surplus = self:getVipBuyTimes() - self:getBuyCount()
            return surplus
        end
    end

    if self:getConfigType() == "random" then
        if self:getBuyCount() > 0 then
            return 0
        end
        return 1
    end

    return 0
end

function ShopItemData:getGoodsInfo()
    local itemInfo = {}
    local goodsCfg = self:getConfig()
    if self:getConfigType() == "fix" then
        itemInfo.type = goodsCfg.type
        itemInfo.value = goodsCfg.value
        itemInfo.size = goodsCfg.size
    end
    return itemInfo
end

return ShopItemData
