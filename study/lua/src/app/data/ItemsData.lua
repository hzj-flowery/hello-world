--[===========[
    ItemsData
    消耗品模块数据处理
    用于消耗品数据的增删改查
]===========]

local BaseData = require("app.data.BaseData")

local ItemInfo = require("app.config.item")
local DataConst = require("app.const.DataConst")

------------------------------------------------------------------------
-- Item基础数据
local schema = {}
schema["id"] 			= {"number", 0} -- itemId
schema["num"] 			= {"number", 0} -- itemNum
schema["type"]			= {"number", 0}  --数据类型
schema["config"]		= {"table", {}} -- itemConfig

local ItemBaseData = class("ItemBaseData", BaseData)
ItemBaseData.schema = schema

function ItemBaseData:ctor(properties)
    ItemBaseData.super.ctor(self, properties)
end

function ItemBaseData:initData(data)
    self:setId(data.id)
    self:setNum(data.num)

    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	self:setType(TypeConvertHelper.TYPE_ITEM)

	local info = ItemInfo.get(data.id)
    assert(info,"ItemInfo can't find id = "..tostring(data.id))
	self:setConfig(info)
end
---------------------------------------------------------------------------------------------------------------------
-- Item数据集
local ItemsData = class("ItemsData", BaseData)
function ItemsData:ctor(properties)
	ItemsData.super.ctor(self, properties)

	self._itemList = {}
	self._s2cGetItemsData = G_NetworkManager:add(MessageIDConst.ID_S2C_GetItem, handler(self, self._s2cGetItem))
    self._s2cUseItemData  = G_NetworkManager:add(MessageIDConst.ID_S2C_UseItem, handler(self, self._s2cUseItem))
end

function ItemsData:c2sUseItem(id, amount, target, idx, boxId)
    if amount <= 0 then
        amount = 1
    end

	local useItem = {
			id = id, --道具ID
			amount = amount, --数量
			target = target or 0, --对目标使用道具(武将,装备)
			idx = idx or 0, --N选1的选择项
            box_id = boxId,
		}
    G_NetworkManager:send(MessageIDConst.ID_C2S_UseItem, useItem)
end
function ItemsData:_setItemData(propData)
    --dump(propData)
    self._itemList["k_"..tostring(propData.id)] = nil
    if ItemInfo.get(propData.id) then --确保数据在item表中有数据
        local baseData = ItemBaseData.new()
        baseData:initData(propData)
        self._itemList["k_"..tostring(propData.id)]= baseData
    end
end


--收到服务器数据，刷新物品列表
function ItemsData:_s2cGetItem(id, message)
	self._itemList = {}

    local itemList = rawget(message, "items") or {}
	for i, value in ipairs(itemList) do
		self:_setItemData(value)
	end

end

--收到使用物品协议
function ItemsData:_s2cUseItem(id, message)
   	if message.ret ~= 1 then
		return
	end

    G_SignalManager:dispatch(SignalConst.EVNET_USE_ITEM_SUCCESS, message)
end

-- 清除
function ItemsData:clear()
	self._s2cGetItemsData:remove()
	self._s2cGetItemsData = nil

    self._s2cUseItemData:remove()
    self._s2cUseItemData = nil
end

-- 重置
function ItemsData:reset()
	self._itemList = {}
end

--

--[===========[
	通过id获取物品信息
]===========]
function ItemsData:getItemByID( id )
	if self._itemList == nil then
		return nil
	end
	return self._itemList["k_"..tostring(id)]
end


--[===========[
    通过道具ID获取道具数量
    参数
    id 为对应道具id
]===========]
function ItemsData:getItemNum(id)
    -- logWarn("ItemsData:getItemNum " ..id)
    if self._itemList == nil then
        return 0
    end

    local item = self:getItemByID(id)
    --dump(item)
	if item then
		return item:getNum()
	end
    return 0
end


--为包裹界面打包道具信息
function ItemsData:_packItemsInfoForPack()

   local function filter(info)
 	 if info.item_type == DataConst.ITEM_GOLD_KEY
	  	or info.item_type == DataConst.ITEM_GOLD_BOX then
		  	return false
		end
		return true
	end

	-----------------------------------------
    local items = self._itemList
    local list = {}
    for k, value in pairs(items) do
        if value and filter(value:getConfig()) then
            table.insert(list,#list+1,value)
        end
    end

    return list
end

function ItemsData:hasRedPointByItemID(itemId)
     local itemData = self:getItemByID(itemId)
     if not itemData then
        return false
     end
     local playerLevel = G_UserData:getBase():getLevel()
     if playerLevel < itemData:getConfig().level_limit then
         return false
     end

     if itemData:getConfig().if_add == 1 then
        return true
     end

     --黄金宝箱红点
     if itemData:getConfig().id == 21 then
        if self:hasPairItemList({20,21}) == true then
            return true
        end
     end

     --秦皇陵 上 中 下红点
     if itemData:getConfig().id == 154 then
        if self:hasPairItemList({154,155,156}) == true then
            return true
        end
     end

     return false
end

--是否拥有对应物品
function ItemsData:hasPairItemList(itemList)
     local hasMatchTable = {}
     hasMatchTable= { keyList = itemList , mathValue = {} }

     local function mathItemId(matchId)
         for i, value in ipairs(hasMatchTable.keyList) do 
            if value == matchId then
                hasMatchTable.mathValue[value] = true
            end 
         end
         local currSize = #hasMatchTable.keyList
         for i, value in pairs(hasMatchTable.mathValue) do
            currSize = currSize - 1
         end
         if currSize == 0 then
            return true
         end
         return false
     end

     local tempList = self:_packItemsInfoForPack()
     for i, item in ipairs(tempList) do
         if mathItemId(item:getConfig().id) == true then
            return true
         end
     end
     return false
end

--小红点判定条件
--1. if_add 为1的物品，则有红点
--2. 黄金宝箱存在，并且黄金钥匙存在，则有红点
function ItemsData:hasRedPoint(itemId)
     local tempList = self:_packItemsInfoForPack()
     local playerLevel = G_UserData:getBase():getLevel()
     for i, item in ipairs(tempList) do

        if item:getConfig().if_add == 1 and 
            playerLevel >= item:getConfig().level_limit  then
            return true
        end
     end
     local retValue1 = self:hasRedPointByItemID(21)
     local retValue2 = self:hasRedPointByItemID(154)
     return retValue or retValue2
end

--[===========[
    获取包裹中所有道具信息
    参数
    id 为对应道具id
]===========]
function ItemsData:getItemsData()
    local tempList = self:_packItemsInfoForPack()

    table.sort( tempList, function (a ,b )
        local qa,qb = a:getConfig().color,b:getConfig().color

        local id_a,id_b = a:getConfig().item_sorting,b:getConfig().item_sorting

        local itemId_a,itemId_b = a:getConfig().id,b:getConfig().id

        if id_a ~= id_b then
            return id_a < id_b
        end

        if qa ~= qb then
            return qa > qb
        end

        return itemId_a < itemId_b
    end )

    return tempList
end

--获取所有官印
function ItemsData:getItemSellData()
	local items = self._itemList
    local list = {}
    for k, value in pairs(items) do
        local cfg = value:getConfig()
        if cfg.recycle_value and cfg.recycle_value > 0 then
            table.insert(list,value)
        end
    end

	table.sort( list, function (a ,b )
		local aConfig = a:getConfig()
		local bConfig = b:getConfig()
        if aConfig.sell_order == bConfig.sell_order then
            if aConfig.color == bConfig.color then
    			return a:getId() < b:getId()
    		else
    			return aConfig.color < bConfig.color
    		end
        else
            return aConfig.sell_order < bConfig.sell_order
        end

	end)
	return list
end



----------------------
--更新
function ItemsData:updateData(itemList)
    if itemList==nil or type(itemList)~="table" then
        return
    end
    if self._itemList==nil then
        return
    end
	for i=1,#itemList do
		self:_setItemData(itemList[i])
	end
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACTIVITY)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ITEM_BAG)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_OFFICIAL)--邮箱里领取道具可能改变升官衔条件
end

--插入
function ItemsData:insertData(itemList)
    if itemList==nil or type(itemList)~="table" then
        return
    end
    if self._itemList==nil then
        return
    end

	for i=1,#itemList do
		self:_setItemData(itemList[i])
	end
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACTIVITY)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ITEM_BAG)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_HERO_TRAIN_TYPE2, itemList)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_EQUIP_TRAIN_TYPE2, itemList)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TREASURE_TRAIN_TYPE2, itemList)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1, itemList)

    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_OFFICIAL)--邮箱里领取道具可能改变升官衔条件
end

function ItemsData:deleteData(itemList)
    if itemList==nil or type(itemList)~="table" then
        return
    end
    if self._itemList==nil then
        return
    end

	for i=1,#itemList do
		local id = itemList[i]
		self._itemList["k_"..tostring(id)]=nil
	end
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACTIVITY)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ITEM_BAG)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_OFFICIAL)--邮箱里领取道具可能改变升官衔条件
end

return ItemsData
