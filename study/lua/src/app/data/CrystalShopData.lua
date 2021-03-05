-- Author: nieming
-- Date:2018-02-07 14:27:15
-- Describle：

local BaseData = require("app.data.BaseData")
local CrystalShopData = class("CrystalShopData", BaseData)
local CrystalShopGoodData = require("app.data.CrystalShopGoodData")

local schema = {}
--schema
CrystalShopData.schema = schema


function CrystalShopData:ctor(properties)
	CrystalShopData.super.ctor(self, properties)

	self._signalRecvGetShopCrystal = G_NetworkManager:add(MessageIDConst.ID_S2C_GetShopCrystal, handler(self, self._s2cGetShopCrystal))

	self._signalRecvGetShopCrystalAward = G_NetworkManager:add(MessageIDConst.ID_S2C_GetShopCrystalAward, handler(self, self._s2cGetShopCrystalAward))

	self._signalRecvRefreshCrystalShop = G_NetworkManager:add(MessageIDConst.ID_S2C_RefreshCrystalShop, handler(self, self._s2cRefreshCrystalShop))

	self._signalRecvShopCrystalBuy = G_NetworkManager:add(MessageIDConst.ID_S2C_ShopCrystalBuy, handler(self, self._s2cShopCrystalBuy))

	self._signalCleanData = G_SignalManager:add(SignalConst.EVENT_CLEAN_DATA_CLOCK, handler(self, self._onCleanData))
	self._datas = self:_initData()
	self._shopDatas = nil
	self._isNotNeedForceRefesh = nil
end

function CrystalShopData:_initData()
	local ShopCrystalConfig = require("app.config.shop_crystal")
	local CrystalShopItemData = require("app.data.CrystalShopItemData")
	local TextHelper = require("app.utils.TextHelper")
	local indexs = ShopCrystalConfig.index()
	local datas = {}
	local rechargeDatas = {}
	for k, v in pairs(indexs) do

		local shopGoodData = CrystalShopItemData.new()
		local config = ShopCrystalConfig.indexOf(v)
		local awards = {}
		for i = 1, 3 do
			if config["type_"..i] ~= 0 then
				table.insert(awards, {type=config["type_"..i],value=config["value_"..i],size=config["size_"..i]})
			else
				break
			end
		end
		shopGoodData:setAwards(awards)
		shopGoodData:setId(config.good_id)
		shopGoodData:setPay_type(config.pay_type)
		shopGoodData:setPay_amount(config.pay_amount)
		shopGoodData:setIs_function(config.is_function)
		shopGoodData:setIs_work(config.is_work)
		shopGoodData:setBuy_size(config.buy_size)
		shopGoodData:setFunction_id(config.function_id)
		shopGoodData:setPage(config.page)
		local description = TextHelper.convertKeyValuePair(config.description, {key = "num", value = config.pay_amount})

		shopGoodData:setDescription(description)

		datas[config.good_id] = shopGoodData
	end
	return datas
end


function CrystalShopData:getShowDatas(pageIndex)
	if not pageIndex then
		return {}
	end

	local datas = {}
	for k, v in pairs(self._datas) do
		if v:canShow() and pageIndex == v:getPage() then
			table.insert(datas, v)
		end
	end
	table.sort(datas, function(a, b)
		local aAlreadyGet = a:isAlreadGet(a:getPage())
		local bAlreadyGet = b:isAlreadGet(b:getPage())
		if bAlreadyGet == aAlreadyGet then
			local aCanGet = a:canGet(a:getPage())
			local bCanGet = b:canGet(b:getPage())
			if aCanGet == bCanGet then
				return a:getId() < b:getId()
			else
				return aCanGet == true
			end
		else
			return aAlreadyGet == false
		end
	end)
	return datas
end

function CrystalShopData:hasRedPoint(pageIndex)
	if pageIndex then
		for k, v in pairs(self._datas) do
			if v:getPage() == pageIndex and v:canShow() and not v:isAlreadGet(v:getPage()) and v:canGet(v:getPage()) then
				return true
			end
		end
	else
		local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(FunctionConst.FUNC_CRYSTAL_SHOP)
		if not showed then
			return true
		end
		for k, v in pairs(self._datas) do
			if v:canShow() and not v:isAlreadGet(v:getPage()) and v:canGet(v:getPage()) then
				return true
			end
		end
	end
	return false
end

function CrystalShopData:clear()
	self._signalRecvGetShopCrystal:remove()
	self._signalRecvGetShopCrystal = nil

	self._signalRecvGetShopCrystalAward:remove()
	self._signalRecvGetShopCrystalAward = nil

	self._signalRecvRefreshCrystalShop:remove()
	self._signalRecvRefreshCrystalShop = nil

	self._signalRecvShopCrystalBuy:remove()
	self._signalRecvShopCrystalBuy = nil

	self._signalCleanData:remove()
	self._signalCleanData = nil
end

function CrystalShopData:reset()
	self._shopDatas = nil
	self._isNotNeedForceRefesh = nil
end

-- Describle：
-- Param:

-- function CrystalShopData:c2sGetShopCrystal()
-- 	G_NetworkManager:send(MessageIDConst.ID_C2S_GetShopCrystal, {
--
-- 	})
-- end
-- Describle：
function CrystalShopData:_s2cGetShopCrystal(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local goods = rawget(message, "goods")
	if goods then
		for k, v in pairs(goods) do
			local goodData = self._datas[v.id]
			if goodData then
				goodData:setValue(v.value)
				goodData:setBuy_count(v.buy_count)
			end
		end
	end
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_CRYSTAL_SHOP)
	G_SignalManager:dispatch(SignalConst.EVENT_GET_SHOP_CRYSTAL_SUCCESS)
end
-- Describle：
-- Param:
--	id
function CrystalShopData:c2sGetShopCrystalAward( id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetShopCrystalAward, {
		id = id,
	})
end
-- Describle：
function CrystalShopData:_s2cGetShopCrystalAward(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local awards = rawget(message, "awards")
	if not awards then
		awards = {}
	end

	G_SignalManager:dispatch(SignalConst.EVENT_GET_SHOP_CRYSTAL_AWARD_SUCCESS, awards)
end


function CrystalShopData:requestShopData(isForce)
	if not self._isNotNeedForceRefesh or isForce then
		self:c2sRefreshCrystalShop()
		-- local scheduler = require("cocos.framework.scheduler")
		-- scheduler.performWithDelayGlobal(function()
		-- 	local msg = {}
		-- 	msg.ret = 1
		-- 	msg.goods = {}
		-- 	for i = 1, 12 do
		-- 		table.insert(msg.goods, {
		-- 			id = i,
		-- 			buy_count = 0
		-- 		})
		-- 	end
		-- 	self:_s2cRefreshCrystalShop(1, msg)
		-- end, 0.5)
	else
		local scheduler = require("cocos.framework.scheduler")
		scheduler.performWithDelayGlobal(function()
			G_SignalManager:dispatch(SignalConst.EVENT_REFRESH_CRYSTAL_SHOP_SUCCESS)
		end, 0)
	end
end

function CrystalShopData:getShopData()
	return self._shopDatas or {}
end

function CrystalShopData:c2sRefreshCrystalShop()
	G_NetworkManager:send(MessageIDConst.ID_C2S_RefreshCrystalShop, {

	})
end

function CrystalShopData:_s2cRefreshCrystalShop(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local goods = rawget(message, "goods")
	if goods then
		local shopDatas = {}
		for k ,v in pairs(goods) do
			local temp = CrystalShopGoodData.new()
			temp:updateData(v)
			table.insert(shopDatas, temp)
		end

		table.sort(shopDatas, function(a, b)
			local aConfig = a:getConfig()
			local bConfig = b:getConfig()
			if aConfig.order == bConfig.order then
				return a:getId() < b:getId()
			else
				return aConfig.order < bConfig.order
			end
		end)
		self._isNotNeedForceRefesh = true
		self._shopDatas = shopDatas
	end
	G_SignalManager:dispatch(SignalConst.EVENT_REFRESH_CRYSTAL_SHOP_SUCCESS)
end


function CrystalShopData:c2sShopCrystalBuy( good_id, good_count)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ShopCrystalBuy, {
		good_id = good_id,
		good_count = good_count,
	})
end
-- Describle：
function CrystalShopData:_s2cShopCrystalBuy(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local goodState = rawget(message, "goodState")
	if goodState then
		local temp = CrystalShopGoodData.new()
		temp:updateData(goodState)

		local buyCount = goodState.this_buy_count
		if self._shopDatas then
			for k, v in pairs(self._shopDatas) do
				if v:getId() == temp:getId() then
					self._shopDatas[k] = temp
					break
				end
			end
		end
		local cfg = temp:getConfig()
		local awards = {
			{
				size = (buyCount * cfg.good_size),
				type =  cfg.good_type,
				value = cfg.good_value
			}
		}
		G_SignalManager:dispatch(SignalConst.EVENT_SHOP_CRYSTAL_BUY_SUCCESS, awards)
	end

end

function CrystalShopData:_onCleanData()
	self._isNotNeedForceRefesh = nil
end


return CrystalShopData
