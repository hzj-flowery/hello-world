--玩家头衔系统
local BaseData = require("app.data.BaseData")
local HonorTitleData = class("HonorTitleData", BaseData)
local TitleInfo = require("app.config.title")
local HonorTitleItemData = require("app.data.HonorTitleItemData")
local PopupHonorTitleHelper = require("app.scene.view.playerDetail.PopupHonorTitleHelper")

local schema = {}

HonorTitleData.schema = schema

function HonorTitleData:ctor(properties)
	HonorTitleData.super.ctor(self, properties)
	self._listenerHonorTitleData =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GetTitle, handler(self, self._s2cGetHonorTitleData)) -- 进入游戏时获得称号数据
	self._listenerHonorEquipTitle =
		G_NetworkManager:add(MessageIDConst.ID_S2C_EquipTitle, handler(self, self._s2cEquipHonorTitle)) -- 装备与卸下称号
	self._titleItemList = {} -- 称号数据列表
	self._hasRed = false
end

function HonorTitleData:clear()
	self._listenerHonorTitleData:remove()
	self._listenerHonorTitleData = nil
	self._listenerHonorEquipTitle:remove()
	self._listenerHonorEquipTitle = nil
end

function HonorTitleData:reset()
	self._titleItemList = {}
end

function HonorTitleData:c2sTitleInfo()
	-- body
	G_NetworkManager:send(MessageIDConst.ID_C2S_TitleInfo, {})
end

function HonorTitleData:c2sEquipTitleInfo(equip_title_id)
	-- body

	G_NetworkManager:send(MessageIDConst.ID_C2S_EquipTitle, {title_id = equip_title_id})
end

-- 修改称号
function HonorTitleData:c2sClearTitles()
	-- body
	-- message Title {
	-- 	optional uint32 id = 1;
	-- 	optional bool equip = 2;
	-- 	optional uint32 expire_time = 3;
	-- 	optional bool on = 4;
	-- 	optional bool fresh = 5;
	-- }

	-- message C2S_ClearTitleRedPoint {
	-- 	repeated uint32 title_ids = 1;
	-- }
	G_NetworkManager:send(MessageIDConst.ID_C2S_ClearTitleRedPoint, {title_ids = self:_getFreshTitles()})
end

--[[
message TitleInfo {
	optional uint32 title_id = 1;
	optional int64 expire_time = 2;
}	
]]
function HonorTitleData:_s2cGetHonorTitleData(id, message)
	local titles = rawget(message, "titles")
	if titles == nil then
		return
	end
	self:insertHonorTitleList(titles, true)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TOWER)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TOWER_SUPER)
end

function HonorTitleData:_s2cEquipHonorTitle(id, message)
	if message.ret ~= 1 then
		return
	end
	local now_id = rawget(message, "now_id")
	PopupHonorTitleHelper.showEquipTip(now_id)
	-- self:_removeNewTitle(now_id)
	G_SignalManager:dispatch(SignalConst.EVENT_EQUIP_TITLE)
end

function HonorTitleData:insertHonorTitleList(titles, isInit)
	-- logWarn("HonorTitleData:insertHonorTitleList")
	-- dump(titles)
	for k, v in pairs(titles) do
		self:_insertTitleItem(v)
	end
	table.sort(
		self._titleItemList,
		function(item1, item2)
			return item1:getId() < item2:getId()
		end
	)

	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE)
	G_SignalManager:dispatch(SignalConst.EVENT_UPDATE_TITLE_INFO)
end

function HonorTitleData:_insertTitleItem(item)
	if item.on and not self:findItemDataById(item.id) then
		local itemData = HonorTitleItemData.new()
		itemData:init(self:_makeItemTemplate(item))
		table.insert(self._titleItemList, itemData)
	end
end

function HonorTitleData:_makeItemTemplate(item)
	local TitleInfo = require("app.config.title")
	local titleData = TitleInfo.get(item.id)
	assert(titleData, "not title by this id")
	local template = {
		id = item.id,
		limitLevel = titleData.limit_level,
		day = titleData.day,
		timeType = titleData.time_type,
		timeValue = titleData.time_value,
		name = titleData.name,
		colour = titleData.colour,
		resource = titleData.resource,
		des = titleData.des,
		isEquip = item.equip,
		expireTime = item.expire_time,
		isOn = item.on,
		fresh = item.fresh
	}
	return template
end

function HonorTitleData:updateTitleList(titles)
	-- logWarn("HonorTitleData:updateTitleList")
	-- dump(titles)
	for k, v in pairs(titles) do
		self:_updateItem(v)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE)
	G_SignalManager:dispatch(SignalConst.EVENT_UPDATE_TITLE_INFO)
end

function HonorTitleData:_updateItem(item)
	for i = 1, #self._titleItemList do
		if self._titleItemList[i]:getId() == item.id then
			if item.on then
				self._titleItemList[i]:updateData(item)
			else
				table.remove(self._titleItemList, i)
			end
			return
		end
	end
	self:_insertTitleItem(item)
end

function HonorTitleData:findItemDataById(id)
	for i = 1, #self._titleItemList do
		if self._titleItemList[i]:getId() == id then
			return self._titleItemList[i]
		end
	end
end

function HonorTitleData:getHonorTitleList()
	return self._titleItemList
end

-- 是否有红点
function HonorTitleData:isHasRedPoint()
	for i = 1, #self._titleItemList do
		if self._titleItemList[i]:isFresh() then
			return true
		end
	end
	return false
end

function HonorTitleData:_getFreshTitles()
	local fresh = {}
	for i = 1, #self._titleItemList do
		if self._titleItemList[i]:isFresh() then
			table.insert(fresh, self._titleItemList[i]:getId())
		end
	end
	return fresh
end

return HonorTitleData
