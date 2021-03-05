--活动类商店数据

local BaseData = require("app.data.BaseData")
local ShopActiveData = class("ShopActiveData", BaseData)
local ShopActiveUnitData = require("app.data.ShopActiveUnitData")
local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")
local ShopConst = require("app.const.ShopConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local ParameterIDConst = require("app.const.ParameterIDConst")

local schema = {}
ShopActiveData.schema = schema

function ShopActiveData:ctor(properties)
	ShopActiveData.super.ctor(self, properties)

	self._goodIdsInShop = {} --某个商店对应的所有货物
	self._shopList = {}

	self:_formatGoods()
end

function ShopActiveData:clear()
	
end

function ShopActiveData:reset()
	self._goodIdsInShop = {}
	self._shopList = {}
end

function ShopActiveData:_formatGoods()
	local Config = require("app.config.shop_active")
	local len = Config.length()
	for i = 1, len do
		local info = Config.indexOf(i)
		local shopId = info.shop_id
		local tab = info.tab
		if self._goodIdsInShop[shopId] == nil then
			self._goodIdsInShop[shopId] = {}
		end
		if self._goodIdsInShop[shopId][tab] == nil then
			self._goodIdsInShop[shopId][tab] = {}
		end
		table.insert(self._goodIdsInShop[shopId][tab], info.id)

		local unitData = ShopActiveUnitData.new()
		unitData:setConfig(info)
		self._shopList[info.id] = unitData
	end
end

function ShopActiveData:_getGoodIdsWithShopId(shopId)
	local goodIds = self._goodIdsInShop[shopId] or {}
	return goodIds
end

function ShopActiveData:_getGoodIdsWithShopAndTabId(shopId, tabId)
	local tempIds = self:_getGoodIdsWithShopId(shopId)
	local goodIds = tempIds[tabId] or {}
	return goodIds
end

function ShopActiveData:getGoodIdsWithShopAndTabIdBySort(shopId, tabId, curBatch)
	local sortFunc = function(a, b)
		if a.boughtSort ~= b.boughtSort then
			return a.boughtSort < b.boughtSort
		elseif a.order ~= b.order then
			return a.order < b.order
		elseif a.newSort ~= b.newSort then
			return a.newSort > b.newSort
		else
			return a.id < b.id
		end
	end

	local function checkAndSetIsOwn(unitData)
		unitData.isHave = false
        if unitData:getConfig().type == TypeConvertHelper.TYPE_AVATAR then --是变身卡才检查
            local isHave = G_UserData:getAvatar():isHaveWithBaseId(unitData:getConfig().value)
            unitData.isHave = isHave
        end
    end

	local goodIds = self:_getGoodIdsWithShopAndTabId(shopId, tabId)
	local temp = {}
	for i, goodId in ipairs(goodIds) do
		local unitData = self:getUnitDataWithId(goodId)
		local batch = unitData:getConfig().batch
		local day = unitData:getConfig().day
		if self:_checkIsEnoughBatch(shopId, curBatch, batch) and self:_checkIsEnoughOpenTime(shopId, day) then
			checkAndSetIsOwn(unitData)
			local isBought = unitData:isBought() or unitData.isHave
			local one = {
				id = unitData:getConfig().id,
				boughtSort = isBought and 1 or 0,
				newSort = unitData:isNew(curBatch) and 1 or 0,
				order = unitData:getConfig().order,
			}
			table.insert(temp, one)
		end
	end
	table.sort(temp, sortFunc)

	local result = {}
	for i, one in ipairs(temp) do
		table.insert(result, one.id)
	end
	return result
end

--获取批次筛选方式
function ShopActiveData:_getBatchFilterType(shopId)
	local filterType = 0 --批次累加（2批次包括batch填1和2的）
	if shopId == ShopConst.LOOKSTAR_SHOP or 
	   shopId == ShopConst.HORSE_CONQUER_SHOP or 
	   shopId == ShopConst.CAKE_ACTIVE_SHOP or 
	   shopId == ShopConst.RED_PET_SHOP then
		filterType = 1 --批次单独算（2批次只包括batch填2的）
	end
	return filterType
end

--检查是否符合批次限制
function ShopActiveData:_checkIsEnoughBatch(shopId, curBatch, batch)
	local filterType = self:_getBatchFilterType(shopId)
	if filterType == 1 then
		return curBatch == batch
	else
		return curBatch >= batch
	end
end

--检查是否满足开服时间条件
function ShopActiveData:_checkIsEnoughOpenTime(shopId, day)
	local isEnough = true
	local openServerDays = G_UserData:getBase():getOpenServerDayNum()
	if shopId == ShopConst.CAKE_ACTIVE_SHOP then
		isEnough = openServerDays >= day
	end
	return isEnough
end

function ShopActiveData:updateShopList(datas)
	for i, data in ipairs(datas) do
		local unitData = self:getUnitDataWithId(data.goods_id)
		unitData:updateData(data)
	end
end

function ShopActiveData:getUnitDataWithId(id)
	local unitData = self._shopList[id]
	assert(unitData, string.format("shop_active config can not find id = %d", id))
	return unitData
end

--是否显示红装商店红点
function ShopActiveData:isShowEquipRedPoint()
	local goodIds = self:_getGoodIdsWithShopAndTabId(ShopConst.SUIT_SHOP, 1) or {}
	local goodId = goodIds[1]
	if goodId then
		local cost = ShopActiveDataHelper.getCostInfo(goodId)[1]
		if cost then
			local size = tonumber(require("app.config.parameter").get(ParameterIDConst.EQUIP_ACTIVE_RED).content)
			local isEnough = LogicCheckHelper.enoughValue(cost.type, cost.value, size, false)
			if isEnough then
				return true
			end
		end
	end
	return false
end

--是否显示神兽商店红点
function ShopActiveData:isShowPetRedPoint()
	local goodIds = self:_getGoodIdsWithShopAndTabId(ShopConst.LOOKSTAR_SHOP, 1) or {}
	local goodId = goodIds[1]
	if goodId then
		local cost = ShopActiveDataHelper.getCostInfo(goodId)[1]
		if cost then
			local size = tonumber(require("app.config.parameter").get(ParameterIDConst.STAR_ACTIVE_RED).content)
			local isEnough = LogicCheckHelper.enoughValue(cost.type, cost.value, size, false)
			if isEnough then
				return true
			end
		end
	end
	return false
end

--是否显示红神兽商店红点
function ShopActiveData:isShowRedPetRedPoint()
	local goodIds = self:_getGoodIdsWithShopAndTabId(ShopConst.RED_PET_SHOP, 1) or {}
	local goodId = goodIds[1]
	if goodId then
		local cost = ShopActiveDataHelper.getCostInfo(goodId)[1]
		if cost then
			local size = tonumber(require("app.config.parameter").get(ParameterIDConst.STAR_ACTIVE_RED).content)
			local isEnough = LogicCheckHelper.enoughValue(cost.type, cost.value, size, false)
			if isEnough then
				return true
			end
		end
	end
	return false
end

--是否显示训马商店红点
function ShopActiveData:isShowHorseConquerRedPoint()
	local goodIds = self:_getGoodIdsWithShopAndTabId(ShopConst.HORSE_CONQUER_SHOP, 1) or {}
	local goodId = goodIds[1]
	if goodId then
		local cost = ShopActiveDataHelper.getCostInfo(goodId)[1]
		if cost then
			local size = tonumber(require("app.config.parameter").get(ParameterIDConst.HORSE_CONQUER_ACTIVE_RED).content)
			local isEnough = LogicCheckHelper.enoughValue(cost.type, cost.value, size, false)
			if isEnough then
				return true
			end
		end
	end
	return false
end

return ShopActiveData