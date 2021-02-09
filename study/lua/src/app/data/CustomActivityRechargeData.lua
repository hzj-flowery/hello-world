-- 自定义活动（充值类）数据
-- Author: Liangxu
-- Date: 2018-5-5 10:46:07
--
local BaseData = require("app.data.BaseData")
local CustomActivityRechargeData = class("CustomActivityRechargeData", BaseData)
local CustomActivityConst = require("app.const.CustomActivityConst")
local ActivityEquipDataHelper = require("app.utils.data.ActivityEquipDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local CustomActivityRechargeUnitData = require("app.data.CustomActivityRechargeUnitData")

local schema = {}
schema["curSelectedIndex"] = {"number", 0} --记录选中的索引，神兽活动用
schema["curSelectedIndex2"] = {"number", 0} --记录选中的索引，训马活动用
CustomActivityRechargeData.schema = schema

function CustomActivityRechargeData:ctor(properties)
	CustomActivityRechargeData.super.ctor(self, properties)

	self._datas = {}

	self._recvSpecialActInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_SpecialActInfo, handler(self, self._s2cSpecialActInfo))
	self._recvPlaySpecialActivity = G_NetworkManager:add(MessageIDConst.ID_S2C_PlaySpecialActivity, handler(self, self._s2cPlaySpecialActivity))
	self._recvSpecialActLimitInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_SpecialActLimitInfo, handler(self, self._s2cSpecialActLimitInfo))
	self._signalCustomActivityOpenNotice = G_SignalManager:add(SignalConst.EVENT_CUSTOM_ACTIVITY_OPEN_NOTICE, handler(self, self._customActivityOpenNotice))
end

function CustomActivityRechargeData:clear()
	self._recvSpecialActInfo:remove()
	self._recvSpecialActInfo = nil
	self._recvPlaySpecialActivity:remove()
	self._recvPlaySpecialActivity = nil
	self._signalCustomActivityOpenNotice:remove()
	self._signalCustomActivityOpenNotice = nil
	self._recvSpecialActLimitInfo:remove()
	self._recvSpecialActLimitInfo = nil
end

function CustomActivityRechargeData:reset()
	
end

function CustomActivityRechargeData:c2sSpecialActInfo(actType)
	G_NetworkManager:send(MessageIDConst.ID_C2S_SpecialActInfo, {
		act_type = actType
	})
end

function CustomActivityRechargeData:_s2cSpecialActInfo(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local actType = rawget(message, "act_type")
	local unitData = self:getUnitDataWithType(actType)
	unitData:updateData(message)
	self._datas[actType] = unitData

	G_SignalManager:dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_INFO, actType)
end

function CustomActivityRechargeData:_customActivityOpenNotice(eventName, customActivityUnitData, visible)
	local actType = customActivityUnitData:getAct_type()
	if visible then
		if actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP 
			or actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET
			or actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER then
			self:c2sSpecialActInfo(actType)
		end
	end
end

function CustomActivityRechargeData:getUnitDataWithType(actType)
	local unitData = self._datas[actType]
	if unitData == nil then
		unitData = CustomActivityRechargeUnitData.new()
	end
	return unitData
end

function CustomActivityRechargeData:c2sPlaySpecialActivity(actType, drawType, dropIndex)
	G_NetworkManager:send(MessageIDConst.ID_C2S_PlaySpecialActivity, {
		draw_type = drawType,
		act_type = actType,
		drop_index = dropIndex
	})
end

function CustomActivityRechargeData:_s2cPlaySpecialActivity(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local actType = rawget(message, "act_type")
	local drawType = rawget(message, "draw_type")
	local usedFree = rawget(message, "used_free")
	local totalUse = rawget(message, "total_use")
	local lastDrawTime = rawget(message, "last_draw_time")
	local addRecords = rawget(message, "add_records")

	local unitData = self:getUnitDataWithType(actType)
	unitData:setAct_type(actType)
	unitData:setFree_use(usedFree)
	unitData:setTotal_use(totalUse)
	unitData:setLast_draw_time(lastDrawTime)

	local records = unitData:getRecords()
	local object = {}
	local equips = {} --整件装备
	for i, id in ipairs(addRecords) do
		table.insert(records, id)
		table.insert(object, id)
		local info = ActivityEquipDataHelper.getActiveDropConfig(id)
		if info.type == TypeConvertHelper.TYPE_EQUIPMENT then
			local award = {
				type = info.type,
				value = info.value,
				size = info.size,
			}
			table.insert(equips, award)
		end
	end
	unitData:setRecords(records)

	unitData:resetTime()

	G_SignalManager:dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_PLAY_SUCCESS, actType, drawType, object, equips)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACTIVITY)
end

function CustomActivityRechargeData:_s2cSpecialActLimitInfo(id, message)
	local actType = rawget(message, "act_type")
	local limitUse = rawget(message, "limit_use")
	local unitData = self:getUnitDataWithType(actType)
	unitData:setTotal_use(limitUse)
	G_SignalManager:dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_LIMIT_CHANGE, actType, limitUse)
end

return CustomActivityRechargeData