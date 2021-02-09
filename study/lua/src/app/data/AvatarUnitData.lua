-- 
-- Author: Liangxu
-- Date: 2017-12-25 14:27:24
-- 变身卡单元数据

local BaseData = require("app.data.BaseData")
local AvatarUnitData = class("AvatarUnitData", BaseData)
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")

local schema = {}
schema["id"] = {"number", 0}
schema["base_id"] = {"number", 0}
schema["level"] = {"number", 0}
schema["config"] = {"table", {}}
AvatarUnitData.schema = schema

function AvatarUnitData:ctor(properties)
	AvatarUnitData.super.ctor(self, properties)


end

function AvatarUnitData:clear()
	
end

function AvatarUnitData:reset()
	
end

function AvatarUnitData:updateData(data)
	self:setProperties(data)
	local config = AvatarDataHelper.getAvatarConfig(data.base_id)
	self:setConfig(config)
end

function AvatarUnitData:isEquiped()
	local userAvatarId = G_UserData:getBase():getAvatar_id()
	local avatarId = self:getId()
	return avatarId > 0 and avatarId == userAvatarId
end

function AvatarUnitData:isTrained()
	local level = self:getLevel()
	return level > 1
end

--是自己
function AvatarUnitData:isSelf()
	return self:getBase_id() == 0
end

--是否是已拥有的
function AvatarUnitData:isOwned()
	return self:getId() > 0
end

return AvatarUnitData