-- Author: nieming
-- Date:2018-02-16 14:20:58
-- Describle：资源找回

local BaseData = require("app.data.BaseData")
local ActivityResourceBackData = class("ActivityResourceBackData", BaseData)
local ActivityConst = require("app.const.ActivityConst")
local ActivityBaseData = import(".ActivityBaseData")
local ActivityResourceBackItemData = import(".ActivityResourceBackItemData")
local schema = {}
--schema
schema["baseActivityData"] 	= {"table", {}}--基本活动数据
schema["items"] = {"table", {}} --items

ActivityResourceBackData.schema = schema


function ActivityResourceBackData:ctor(properties)
	ActivityResourceBackData.super.ctor(self, properties)
	local activityBaseData = ActivityBaseData.new()
	activityBaseData:initData({id = ActivityConst.ACT_ID_RESROUCE_BACK  })
	self:setBaseActivityData(activityBaseData)

	self._signalRecvGetResourceBackData = G_NetworkManager:add(MessageIDConst.ID_S2C_GetResourceBackData, handler(self, self._s2cGetResourceBackData))

	self._signalRecvActResourceBackAward = G_NetworkManager:add(MessageIDConst.ID_S2C_ActResourceBackAward, handler(self, self._s2cActResourceBackAward))

end


function ActivityResourceBackData:hasRedPoint()
	local isHave = false
	local items = self:getItems()
	for k, v in pairs(items) do
		if not v:isAlreadyBuy() then
			isHave = true
			break
		end
	end
	if isHave and not G_UserData:getRedPoint():isThisLoginClick(FunctionConst.FUNC_WELFARE,{actId = ActivityConst.ACT_ID_RESROUCE_BACK}) then
		return true
	end
	return false
end


function ActivityResourceBackData:clear()

	self._signalRecvGetResourceBackData:remove()
	self._signalRecvGetResourceBackData = nil

	self._signalRecvActResourceBackAward:remove()
	self._signalRecvActResourceBackAward = nil
end

function ActivityResourceBackData:reset()

end

function ActivityResourceBackData:getNotBuyItems()
	local items = self:getItems()
	local notBuyItems = {}
	for k, v in ipairs(items) do
		if not v:isAlreadyBuy() then
			table.insert(notBuyItems, v)
		end
	end
	return notBuyItems
end

function ActivityResourceBackData:_sortItems()
	local items = self:getItems()
	table.sort(items, function(a, b)
		-- if a:isAlreadyBuy() ==  b:isAlreadyBuy() then
			return a:getId() < b:getId()
		-- else
		-- 	return a:isAlreadyBuy() == false
		-- end
	end)
	self:setItems(items)
end

function ActivityResourceBackData:getItemById(id)
	local items = self:getItems()
	for k, v in ipairs(items) do
		if v:getId() == id then
			return v
		end
	end

end
-- Describle：
function ActivityResourceBackData:_s2cGetResourceBackData(id, message)
	-- if message.ret ~= MessageErrorConst.RET_OK then
	-- 	return
	-- end
	--check data
	local items = {}
	local data = rawget(message, "data")
	if data then
		for k ,v in ipairs(data) do
			local singleData = ActivityResourceBackItemData.new()
			singleData:updateData(v)
			table.insert(items, singleData)
		end
	end
	self:setItems(items)
	self:_sortItems()
	-- G_SignalManager:dispatch(SignalConst.EVENT_GET_RESOURCE_BACK_DATA_SUCCESS)
end
-- Describle：
-- Param:
--	id
--	back_type   找回类型0：完美找回 1：普通找回
function ActivityResourceBackData:c2sActResourceBackAward( id, back_type)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ActResourceBackAward, {
		id = id,
		back_type = back_type,
	})

	-- local item = self:getItemById(id)
	-- local message = {
	-- 	ret = 1,
	-- 	id = item:getId(),
	-- 	awards = item:getAwards()
	-- }
	-- self:_s2cActResourceBackAward(id, message)
end
-- Describle：
function ActivityResourceBackData:_s2cActResourceBackAward(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local id = rawget(message, "id")
	if id then
		local itemData = self:getItemById(id)
		itemData:setState(1)
	end
	local awards = rawget(message, "awards") or {}

	G_SignalManager:dispatch(SignalConst.EVENT_ACT_RESOURCE_BACK_AWARD_SUCCESS, awards)
end

function ActivityResourceBackData:mockData()
	local singleData = {
		id = 1,
		awards = {
			{
				type = 5,
				value = 3,
				size = 10,
			},{
				type = 5,
				value = 4,
				size = 10,
			}

		},
		value = 2,
		state = 0
	}

	local datas = {
		ret = 1,
		data = {}
	}

	for i = 1 , 2 do
		local d = clone(singleData)
		table.insert(datas.data, d)
	end
	self:_s2cGetResourceBackData(id, datas)
end


return ActivityResourceBackData
