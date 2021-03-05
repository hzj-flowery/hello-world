local BaseData = require("app.data.BaseData")
local TowerSuperStageUnitData = class("TowerSuperStageUnitData", BaseData)
local EquipEssenceStage = require("app.config.equip_essence_stage")

local schema = {}
schema["id"]  = {"number", 0}
schema["config"]  = {"table", nil}
schema["pass"]  = {"boolean", false}
TowerSuperStageUnitData.schema = schema

function TowerSuperStageUnitData:ctor(properties)
    TowerSuperStageUnitData.super.ctor(self, properties)
end

function TowerSuperStageUnitData:clear()
end

function TowerSuperStageUnitData:reset()	
end

function TowerSuperStageUnitData:updateData(data)
    self:setProperties(data)
    local config = EquipEssenceStage.get(data.id)
    assert(config, "equip_essence_stage can not find id "..tostring(data.id))
    self:setConfig(config)
end



return TowerSuperStageUnitData