-- 
-- Author: Liangxu
-- Date: 2017-12-25 14:27:24
-- 变身卡数据

local BaseData = require("app.data.BaseData")
local AvatarData = class("AvatarData", BaseData)
local AvatarUnitData = require("app.data.AvatarUnitData")

local schema = {}
schema["curAvatarId"] = {"number", 0} --当前选中变身卡id
AvatarData.schema = schema

function AvatarData:ctor(properties)
	AvatarData.super.ctor(self, properties)

	self._avatarList = {}
	-- self:_initTemplet2MaxLevel()
	self._recvGetAvatar = G_NetworkManager:add(MessageIDConst.ID_S2C_GetAvatar, handler(self, self._s2cGetAvatar))
	self._recvEquipAvatar = G_NetworkManager:add(MessageIDConst.ID_S2C_EquipAvatar, handler(self, self._s2cEquipAvatar))
	self._recvEnhanceAvatar = G_NetworkManager:add(MessageIDConst.ID_S2C_EnhanceAvatar, handler(self, self._s2cEnhanceAvatar))
	self._recvRebornAvatar = G_NetworkManager:add(MessageIDConst.ID_S2C_RebornAvatar, handler(self, self._s2cRebornAvatar))
end

function AvatarData:clear()
	self._recvGetAvatar:remove()
	self._recvGetAvatar = nil
	self._recvEquipAvatar:remove()
	self._recvEquipAvatar = nil
	self._recvEnhanceAvatar:remove()
	self._recvEnhanceAvatar = nil
	self._recvRebornAvatar:remove()
	self._recvRebornAvatar = nil
end

function AvatarData:reset()
	self._avatarList = {}
end

-- function AvatarData:_initTemplet2MaxLevel()
-- 	local result = {}
-- 	local Config = require("app.config.avatar_level")
-- 	local len = Config.length()
-- 	for i = 1, len do
-- 		local info = Config.indexOf(i)
-- 		local templet = info.templet
-- 		local level = info.level
-- 		result[templet] = level
-- 	end
-- 	self:setTemplet2MaxLevel(result)
-- end

function AvatarData:_setAvatarData(data)
	self._avatarList["k_"..tostring(data.id)] = nil
	local unitData = AvatarUnitData.new()
	unitData:updateData(data)
	self._avatarList["k_"..tostring(data.id)] = unitData
end

function AvatarData:_s2cGetAvatar(id, message)
	self._avatarList = {}
	local avatarList = rawget(message, "avatars") or {}
	for i, data in ipairs(avatarList) do
		self:_setAvatarData(data)
	end
end

function AvatarData:updateData(data)
	if data == nil or type(data) ~= "table" then
		return 
	end
	if self._avatarList == nil then 
        return 
    end
    for i = 1, #data do
    	self:_setAvatarData(data[i])
    end
end

function AvatarData:insertData(data)
	if data == nil or type(data) ~= "table" then 
		return 
	end
	if self._avatarList == nil then 
        return 
    end
    for i = 1, #data do
    	self:_setAvatarData(data[i])
    end
end

function AvatarData:deleteData(data)
	if data == nil or type(data) ~= "table" then 
		return 
	end
	if self._avatarList == nil then 
        return 
    end
    for i = 1, #data do
    	local id = data[i]
    	self._avatarList["k_"..tostring(id)] = nil
    end
end

function AvatarData:createTempAvatarUnitData(data)
	assert(data and type(data) == "table", "AvatarData:createTempAvatarUnitData data must be table")
	local baseData = {}
	baseData.id = data.id or 0
	baseData.base_id = data.base_id or 0
	baseData.level = data.level or 1

	local unitData = AvatarUnitData.new()
	unitData:updateData(baseData)

	return unitData
end

function AvatarData:getUnitDataWithId(id)
	local unit = self._avatarList["k_"..tostring(id)]
	assert(unit, string.format("AvatarData._avatarList can not find id = %d", id))
	return unit
end

function AvatarData:getUnitDataWithBaseId(baseId)
	for k, unit in pairs(self._avatarList) do
		if unit:getBase_id() == baseId then
			return unit
		end
	end
	return nil
end

function AvatarData:isHaveWithBaseId(baseId)
	for k, unit in pairs(self._avatarList) do
		if unit:getBase_id() == baseId then
			return true
		end
	end
	return false
end

function AvatarData:getAllDatas()
	return self._avatarList
end

function AvatarData:getAvatarCount()
	local count = 0
	for k, data in pairs(self._avatarList) do
		count = count + 1
	end
	return count
end

function AvatarData:getCurEquipedUnitData()
	local unitData = nil
	local avatarId = G_UserData:getBase():getAvatar_id()
    if avatarId > 0 then
        unitData = self:getUnitDataWithId(avatarId)
    end
    return unitData
end

------------------------------------------------------------------------------------------
function AvatarData:c2sEquipAvatar(avatarId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_EquipAvatar, {
		avatar_id = avatarId,
	})
end

function AvatarData:_s2cEquipAvatar(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local avatarId = rawget(message, "avatar_id") or 0
	G_SignalManager:dispatch(SignalConst.EVENT_AVATAR_EQUIP_SUCCESS, avatarId)
end

function AvatarData:c2sEnhanceAvatar(avatarId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_EnhanceAvatar, {
		avatar_id = avatarId,
	})
end

function AvatarData:_s2cEnhanceAvatar(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local avatarId = rawget(message, "avatar_id") or 0
	G_SignalManager:dispatch(SignalConst.EVENT_AVATAR_ENHANCE_SUCCESS, avatarId)
end

function AvatarData:c2sRebornAvatar(avatarId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_RebornAvatar, {
		avatar_id = avatarId,
	})
end

function AvatarData:_s2cRebornAvatar(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local awards = rawget(message, "awards") or {}
	G_SignalManager:dispatch(SignalConst.EVENT_AVATAR_REBORN_SUCCESS, awards)
end

return AvatarData