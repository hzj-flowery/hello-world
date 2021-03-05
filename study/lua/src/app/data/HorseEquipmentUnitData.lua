--
-- Author: JerryHe
-- Date: 2019-01-22
-- 战马装备单元数据
local BaseData = require("app.data.BaseData")
local HorseEquipmentUnitData = class("HorseEquipmentUnitData", BaseData)
local HorseEquipDataHelper = require("app.utils.data.HorseEquipDataHelper")

local schema = {}
schema["id"] 			= {"number", 0} --唯一Id
schema["base_id"]		= {"number", 0} --静态Id
schema["horse_id"]      = {"number", 0} --装备的战马id
schema["config"] 		= {"table", {}} --配置表信息
HorseEquipmentUnitData.schema = schema

function HorseEquipmentUnitData:ctor(properties)
	HorseEquipmentUnitData.super.ctor(self, properties)
end

function HorseEquipmentUnitData:clear()
	
end

function HorseEquipmentUnitData:reset()
	
end

function HorseEquipmentUnitData:updateData(data)
	self:setProperties(data)
	local config = HorseEquipDataHelper.getHorseEquipConfig(data.base_id)
	self:setConfig(config)
end

return HorseEquipmentUnitData