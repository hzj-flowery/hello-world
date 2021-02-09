--拍卖数据
local BaseData = require("app.data.BaseData")
local AuctionData = class("AuctionData", BaseData)
local AuctionInfo = require("app.config.auction")
local AuctionConst = require("app.const.AuctionConst")

------------------------------------------------------------
local auction_schema = {}
auction_schema["id"] 			        = {"number", 0} -- id
auction_schema["item"]		            = {"table",  {}} --购买物品
auction_schema["init_price"] 			= {"number", 0} -- 起始价
auction_schema["add_price"] 			= {"number", 0} -- 加价
auction_schema["now_price"]             = {"number", 0} -- 当前价
auction_schema["now_buyer"]             = {"number", 0} -- 当前最高的用户id
auction_schema["final_price"] 		    = {"number", 0} -- 一口价
auction_schema["open_time"]		        = {"number", 0} -- 准备时间
auction_schema["start_time"]		    = {"number", 0} -- 开始时间
auction_schema["end_time"]		        = {"number", 0} -- 结束时间
auction_schema["boss_id"]		        = {"number", 0} -- 结束时间
auction_schema["order_id"]              = {"number", 0} -- 排序id
auction_schema["money_type"]            = {"number", 0} -- 货币类型

local AuctionItemData = class("AuctionItemData", BaseData)
AuctionItemData.schema = auction_schema

function AuctionItemData:ctor(properties)
    AuctionItemData.super.ctor(self, properties)
end


------------------------------------------------------------
local schema = {}

AuctionData.schema = schema

local auctionIdDataMap = {}
auctionIdDataMap["guild"] = {{nil, "_guildAuctionBaseInfo"}}
auctionIdDataMap["world"] = {
    {AuctionConst.AC_TYPE_WORLD_ID, "_worldAuctionBaseInfo"},
    {AuctionConst.AC_TYPE_ARENA_ID, "_worldAuctionBaseInfo"},
    {AuctionConst.AC_TYPE_PERSONAL_ARENA_ID, "_worldAuctionBaseInfo"},
    {AuctionConst.AC_TYPE_GUILDCROSSWAR_ID, "_worldAuctionBaseInfo"},
}
auctionIdDataMap["guildWar"] = {
    {AuctionConst.AC_TYPE_WAR_TRADE_ID, "_guildWarActionBaseInfo"},
}
auctionIdDataMap["gm"] = {
    {AuctionConst.AC_TYPE_GM_ID, "_gmAuctionBaseInfo"},
}

--// 拍卖行类型 1：军团拍卖行 2：全服拍卖
function AuctionData:c2sGetAuctionInfo(auctionType)
    auctionType = auctionType or 1
    local message = {
            auction_type = auctionType
    }
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetAuctionInfo, message)
end

--获得所有的拍卖信息
function AuctionData:c2sGetAllAuctionInfo( ... )
    -- body
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetAllAuctionInfo, {})
end

--[[
	optional uint32 main_type = 1; // 拍卖行类型 1：军团拍卖 2：全服拍卖
	optional uint32 config_id = 2; // 配置id
	optional uint32 item_id = 3; // 拍卖品id
	optional uint32 auction_type = 4; // 竞价类型 1：加价 2：一口价
]]
function AuctionData:c2sAuction(mainType, itemId, configId, auctionType)

    local message = {
        main_type = mainType,
        config_id = configId,
        item_id = itemId,
        auction_type = auctionType
    }
    G_NetworkManager:send(MessageIDConst.ID_C2S_Auction, message)
end

function AuctionData:c2sGetAuctionLog(auctionType)
    local message = {
            auction_type = auctionType
    }
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetAuctionLog, message)
end



function AuctionData:ctor(properties)
	AuctionData.super.ctor(self, properties)
    --服务器推送下来简单邮件
	self._recvGetAuctionInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_GetAuctionInfo, handler(self, self._s2cGetAuctionInfo))
    self._recvAuction        = G_NetworkManager:add(MessageIDConst.ID_S2C_Auction,        handler(self, self._s2cAuction))
    self._recvGetAuctionLog  = G_NetworkManager:add(MessageIDConst.ID_S2C_GetAuctionLog,  handler(self, self._s2cGetAuctionLog))
    self._recvAuctionBuyerReplace = G_NetworkManager:add(MessageIDConst.ID_S2C_AuctionBuyerReplace,  handler(self, self._s2cAuctionBuyerReplace))

    self._recvUpdateAuctionItem = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateAuctionItem, handler(self,
    self._s2cUpdateAuctionItem))

    self._recvGetAllAuctionInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_GetAllAuctionInfo, handler(self,self._s2cGetAllAuctionInfo))

    self._auctionDataMap = {}
    self._bonusMap = {}
    self._yubiBonusMap = {}
    self._endTimeMap = {}
    self._canBonus = {}
	self._canYubi = {}
    self._cfgList = {}

    self._auctionItemMap = {}           -- 拍卖项字典，key为id，value为拍卖项
    self._guildAuctionBaseInfo = {}     -- 公会拍卖基本数据
    self._worldAuctionBaseInfo = {}     -- 全服拍卖基本数据
    self._guildWarActionBaseInfo = {}   -- 军团行商拍卖基本数据
    self._gmAuctionBaseInfo = {}        -- 后拍卖基本数据

    self._curGetAuctionType = nil       -- 当前在获取的拍卖类型

    self:_initCfg()
end

function  AuctionData:_initCfg( ... )
    -- body
    self._cfgList = {}
    local auctionCfg =  require("app.config.auction")
    for i =1 , auctionCfg.length() do
        local data = auctionCfg.indexOf(i)
        table.insert(self._cfgList, data)
    end
end

function AuctionData:getListByMainType(mainType)
    local idList = {}
    for i , value in ipairs(self._cfgList) do
        if value.auction_type == mainType then
            table.insert(idList, value)
        end
    end

    return idList
end
-- 清除
function AuctionData:clear()
    self._recvGetAuctionInfo:remove()
    self._recvGetAuctionInfo = nil
    self._recvAuction:remove()
    self._recvAuction = nil
    self._recvGetAuctionLog:remove()
    self._recvGetAuctionLog =nil

    self._recvAuctionBuyerReplace:remove()
    self._recvAuctionBuyerReplace =nil

    self._recvGetAllAuctionInfo:remove()
    self._recvGetAllAuctionInfo =nil

    self._recvUpdateAuctionItem:remove()
    self._recvUpdateAuctionItem = nil
end

-- 重置
function AuctionData:reset()


end

--判定动态拍卖（世界boss拍卖）是否开启
function AuctionData:isAuctionShow(configId)
    local endTime = self._endTimeMap["k"..configId]
    if endTime and endTime > 0 then
        return G_ServerTime:getLeftSeconds(endTime) > 0
    end

    return false
end

--军团拍卖是否开启
function AuctionData:isGuildAuctionShow( ... )
    -- body
    if self:isAuctionShow(AuctionConst.AC_TYPE_GUILD_ID) then
         local itemList,bouns = self:getAuctionData(AuctionConst.AC_TYPE_GUILD_ID)
         if #itemList > 0 then
            return true
         end
    end
    return false
end

--跨服军团boss拍卖是否开启
function AuctionData:isCrossWorldBossAuctionShow( ... )
    -- body
    if self:isAuctionShow(AuctionConst.AC_TYPE_CROSS_WORLD_BOSS) then
         local itemList,bouns = self:getAuctionData(AuctionConst.AC_TYPE_CROSS_WORLD_BOSS)
         if #itemList > 0 then
            return true
         end
    end
    return false
end

function AuctionData:getAuctionEndTime(configId)
    local endTime = self._endTimeMap["k"..configId]
    return endTime
end

function AuctionData:isAuctionCanBonus(configId)
    local canBonus = self._canBonus["k"..configId]
    if canBonus == nil then
        return false
    end
    return canBonus
end

function AuctionData:isAuctionCanYubi(configId)
	local canYubi = self._canYubi["k"..configId]
	if canYubi == nil then
		return false
	end
	return canYubi
end

function AuctionData:getBonus(configId)
    local bonus = self._bonusMap["k"..configId]
    if bonus == nil then
        return 0
    end
    return bonus
end

function AuctionData:getYubiBonus(configId)
    local yubiBonus = self._yubiBonusMap["k"..configId]
    if yubiBonus == nil then
        return 0
    end
    return yubiBonus
end

function AuctionData:getAuctionData( configId )
    -- body
    local itemList = self._auctionDataMap["k"..configId]
    local bonus = self._bonusMap["k"..configId]
    local yubiBonus = self._yubiBonusMap["k"..configId]
    local endTime = self._endTimeMap["k"..configId]

    return itemList or {} , bonus , yubiBonus , endTime
end

function AuctionData:isHaveRedPoint()
    for i= AuctionConst.AC_TYPE_GUILD_ID, AuctionConst.AC_TYPE_GUILD_MAX do
        local data = self:getAuctionData(i)
        if #data > 0 then
            return true
        end
    end
    
    local data5 = self:getAuctionData(AuctionConst.AC_TYPE_ARENA_ID)
    if  #data5 > 0 then
        return true
    end
    local data6 = self:getAuctionData(AuctionConst.AC_TYPE_WAR_TRADE_ID)
    if #data6 > 0 then
        return true
    end
    local data7 = self:getAuctionData(AuctionConst.AC_TYPE_GM_ID)
    if #data7 > 0 then
        return true
    end

    local data8 = self:getAuctionData(AuctionConst.AC_TYPE_PERSONAL_ARENA_ID)
    if #data8 > 0 then
        return true
    end

    local data9 = self:getAuctionData(AuctionConst.AC_TYPE_GUILDCROSSWAR_ID)
    if #data9 > 0 then
        return true
    end

    return false
end

--
function AuctionData:_s2cGetAuctionInfo(id, message)
	if message.ret ~= 1 then
        return
    end
    
    dump(message)

    if message.first then
        local mainType = rawget(message, "main_type") or AuctionConst.AC_TYPE_GUILD
        self._curGetAuctionType = mainType
        self._auctionItemMap = {}
        local infoList = rawget(message, "auction_info") or {}
        self._guildAuctionBaseInfo = infoList
    end

    local actionItemList = rawget(message, "auction_items") or {}
    for i,v in ipairs(actionItemList) do
        local itemId = rawget(v, "id") or 0
        self._auctionItemMap[itemId] = v
    end

    if message.last then
        -- 结束时才清数据
        local mainType = self._curGetAuctionType
        self:_initMapByMainType(mainType)
        self:_udpateAuctionInfos("guild")
        self:_clearAuctionTempInfo()
        G_SignalManager:dispatch(SignalConst.EVENT_GET_AUCTION_INFO, message)
    end
end

-- 创建拍卖项信息
function AuctionData._createAuctionItemData(item)
    local tempEndTime = rawget(item, "end_time") or 0
    local itemConfigId = rawget(item, "config_id") or 0

    local itemData = AuctionItemData.new()
    itemData:setProperties(item)

    local auctionCfg = require("app.config.auction").get(itemConfigId)
    assert(auctionCfg, "can not find auctionItemData by configid "..itemConfigId)
    --dump(itemConfigId)
    local confName ="app.config."..auctionCfg.cfg_name
    local itemId = itemData:getOrder_id()
    itemData.cfg = require(confName).get(itemId)
    assert(itemData.cfg, "can not find cfg by "..confName.." id is:"..itemId)

    --用于物品排序
    local item = itemData:getItem()
    local auction_content_order = require("app.config.auction_content_order")
    local auctionContentOrderCfg = auction_content_order.get(item.type, item.value)
    assert(auctionContentOrderCfg,
        "auction_content_order can not find type = "..item.type.. " value = "..item.value)
    itemData.item_order = auctionContentOrderCfg.order

    return itemData, tempEndTime
end

function AuctionData:_udpateAuctionInfos(key)
    local info = auctionIdDataMap[key]
    for i,v in ipairs(info) do
        local matchConfigId = v[1]
        local infoList = self[v[2]] or {}
        local allItems = {}
        local configId = nil
        local bonus = nil
        local yubiBonus = nil
        local endTime = 0
        local canBonus = nil
		local canYubi = nil
        
        for _,auctionInfo in ipairs(infoList) do
            local tempCfgId = rawget(auctionInfo, "config_id") or 0
            if matchConfigId==nil or matchConfigId==tempCfgId then--configId相同才会保存
                configId = tempCfgId
                bonus = rawget(auctionInfo, "bonus") or 0
                yubiBonus = rawget(auctionInfo, "bonus_yubi") or 0
                canBonus = rawget(auctionInfo, "canBonus")
                if canBonus == nil then
                    canBonus = false
                end
				canYubi = rawget(auctionInfo, "canYubi") or false
                local idList = rawget(auctionInfo, "item_ids") or {}
                for _,id in ipairs(idList) do
                    local item = self._auctionItemMap[id]
                    if item then
                        local auctionData, tempEndTime = self._createAuctionItemData(item)
                        table.insert(allItems, auctionData)
                        if tempEndTime>endTime then
                            endTime = tempEndTime
                        end
                    end
                end
            end
        end

        if configId and #allItems >0 then
            allItems = self:sortItems(allItems)
            self._auctionDataMap["k"..configId] = allItems
            self._bonusMap["k"..configId] = bonus
            self._yubiBonusMap["k"..configId] = yubiBonus
            self._endTimeMap["k"..configId] = endTime
            self._canBonus["k"..configId] = canBonus
			self._canYubi["k"..configId] = canYubi
        end
    end
end
-- 更新所有拍卖信息
function AuctionData:_updateAllAuctionInfos()
    self:_udpateAuctionInfos("guild")
    self:_udpateAuctionInfos("world")
    self:_udpateAuctionInfos("guildWar")
    self:_udpateAuctionInfos("gm")
end

-- 清除拍卖临时信息
function AuctionData:_clearAuctionTempInfo()
    self._auctionItemMap = {}
    self._guildAuctionBaseInfo = {}
    self._worldAuctionBaseInfo = {}
    self._guildWarActionBaseInfo = {}
    self._gmAuctionBaseInfo = {}
end

--获得所有的拍卖数据
function AuctionData:_s2cGetAllAuctionInfo(id, message)
	if message.ret ~= 1 then
        return
	end

    if message.first then
        --清理并初始化数据
        self:_initMapByMainType(AuctionConst.AC_TYPE_GUILD)
        self:_initMapByMainType(AuctionConst.AC_TYPE_WORLD)
        self:_initMapByMainType(AuctionConst.AC_TYPE_ARENA)
        self:_initMapByMainType(AuctionConst.AC_TYPE_TRADE)
        self:_initMapByMainType(AuctionConst.AC_TYPE_GM)
        self:_initMapByMainType(AuctionConst.AC_TYPE_PERSONAL_ARENA)
        self:_initMapByMainType(AuctionConst.AC_TYPE_GUILDCROSS_WAR)

        self._auctionItemMap = {}
        -- 更新公会拍卖基本数据
        local guildList = rawget(message, "guild_auction") or {}
        self._guildAuctionBaseInfo = guildList
        -- 更新全服拍卖基本数据
        local worldList = rawget(message, "world_auction") or {}
        self._worldAuctionBaseInfo = worldList
        -- 更新军团行商拍卖基本数据
        local tradeList = rawget(message, "guild_war_auction") or {}
        self._guildWarActionBaseInfo = tradeList
        -- 更新后拍卖基本数据
        local gmList = rawget(message, "gm_auction") or {}
        self._gmAuctionBaseInfo = gmList
    end

    local actionItemList = rawget(message, "auction_items") or {}
    for i,v in ipairs(actionItemList) do
        local itemId = rawget(v, "id") or 0
        self._auctionItemMap[itemId] = v
    end

    if message.last then
        self:_updateAllAuctionInfos()
        self:_clearAuctionTempInfo()
        G_SignalManager:dispatch(SignalConst.EVENT_GET_ALL_AUCTION_INFO, message)
    end
end


function AuctionData:_initMapByMainType(mainType)
    local cfgList = self:getListByMainType(mainType)
    --dump(cfgList)
    for i , value in ipairs(cfgList) do
        self._auctionDataMap["k"..value.id] = {}
        self._bonusMap["k"..value.id] = 0
        self._yubiBonusMap["k"..value.id] = 0
        self._endTimeMap["k"..value.id] = 0
        self._canBonus["k"..value.id] = false
		self._canYubi["k"..value.id] = false
    end
end

function AuctionData:sortItems(items)

    table.sort(items, function(item1, item2)


        --由小到大
        if item1.item_order ~= item2.item_order then
            return item1.item_order < item2.item_order
        end

        --由小到大
        if item1:getStart_time() ~= item2:getStart_time() then
            return item1:getStart_time() < item2:getStart_time()
        end

        if item1.cfg.id ~= item2.cfg.id then
            return item1.cfg.id < item2.cfg.id
        else
            return item1:getId() > item2:getId()
        end
    end)
    return items
end

function AuctionData:_s2cAuction(id, message)
	if message.ret ~= 1 then
		return
	end

    --[[
    optional uint32 main_type = 2; // 拍卖行类型 1：军团拍卖 2：全服拍卖
	optional uint32 config_id = 3; // 配置id
	optional uint32 item_id = 4; // 拍卖品id
	optional uint32 now_price = 5; // 当前价格
    ]]
    local configId = rawget(message, "config_id")
    if configId and configId > 0 then
        local items = self._auctionDataMap["k"..configId]
        for i , item in ipairs(items) do
            if item:getId() == message.item_id then
                --如果当前价格大于等于最终价格，则认为一口价买走
                if message.now_price >= item:getFinal_price() then
                    table.remove(items,i)
                    self._auctionDataMap["k"..configId] = items
                    break
                end
                item:setNow_buyer(message.now_price_uid)
                item:setNow_price(message.now_price)
            end
        end
    end
    G_SignalManager:dispatch(SignalConst.EVENT_AUCTION_ITEM, message)
end


function AuctionData:_s2cGetAuctionLog(id, message)
	if message.ret ~= 1 then
		return
	end

    --[[
	optional uint32 id = 1;
	optional uint32 main_type = 2;
	optional uint32 deal_time = 3;
	optional Award item = 4;
	optional uint32 price   = 5;
	optional uint32 price_type = 6;
	optional uint32 money_type = 7; //货币类型
    ]]

    G_SignalManager:dispatch(SignalConst.EVENT_AUCTION_LOG, message)
end



function AuctionData:_s2cAuctionBuyerReplace(id, message)
    --	optional Award item = 1;

    G_SignalManager:dispatch(SignalConst.EVENT_AUCTION_BUYER_REPLACE, message)
end



--[[
	optional uint32 config_id = 1;
	optional uint32 item_id = 2;
	optional uint32 main_type = 3;
	optional bool delete = 4;
	optional uint32 now_price = 5;
	optional uint64 now_buyer = 6;
	optional uint32 end_time = 7;

]]


function AuctionData:_s2cUpdateAuctionItem( id, message )
    -- body
    local configId = rawget(message, "config_id")
    local share_bonus = rawget(message, "share_bonus")
    local share_yubi_bonus = rawget(message, "share_bonus_yubi")

    if configId and configId > 0 then
        if share_bonus then
            self._bonusMap["k"..configId] = share_bonus
        end
        if share_yubi_bonus then
            self._yubiBonusMap["k"..configId] = share_yubi_bonus
        end
        
        local items = self._auctionDataMap["k"..configId] or {}
        for i , item in ipairs(items) do
            if item:getId() == message.item_id then
                --如果delete是为 true 则认为被删除
                if message.delete == true then
                    table.remove(items,i)
                    self._auctionDataMap["k"..configId] = items
                    break
                end
                item:setNow_buyer(message.now_buyer)
                item:setNow_price(message.now_price)
                item:setEnd_time(message.end_time)
            end
        end
		--如果流拍世界拍卖 则删除世界拍卖
		local worldAuctionKey = "k"..AuctionConst.AC_TYPE_WORLD_ID
		local allServerItems = self._auctionDataMap[worldAuctionKey] or {}
		for i , item in ipairs(allServerItems) do
			if item:getId() == message.item_id then
                --如果delete是为 true 则认为被删除
                if message.delete == true then
                    table.remove(allServerItems,i)
                    self._auctionDataMap[worldAuctionKey] = allServerItems
                    break
                end
                item:setNow_buyer(message.now_buyer)
                item:setNow_price(message.now_price)
                item:setEnd_time(message.end_time)
            end
		end
    end
    G_SignalManager:dispatch(SignalConst.EVENT_AUCTION_UPDATE_ITEM, message)

end
return AuctionData
