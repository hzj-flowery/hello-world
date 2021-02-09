-- Description: 粮车尸体数据
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-11-11

local BaseData = require("app.data.BaseData")
local GrainCarCorpseUnitData = class("GrainCarCorpseUnitData", BaseData)
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper") 

local schema = {}
schema["grain_car_id"]					= {"number", 0} --粮车configId 就是等级 ————贝贝
schema["level"]					        = {"number", 0} --粮车configId 就是等级 ————贝贝
schema["guild_id"]				        = {"number", 0} --军团id
schema["guild_name"]		            = {"string", 0} --军团名字
schema["mine_id"]                       = {"number", 0} --在哪个矿死
schema["config"]            	        = {"table", {}} --配置表信息

GrainCarCorpseUnitData.schema = schema


function GrainCarCorpseUnitData:ctor(properties)
	GrainCarCorpseUnitData.super.ctor(self, properties)
end

function GrainCarCorpseUnitData:clear()
end

function GrainCarCorpseUnitData:reset()
end

function GrainCarCorpseUnitData:initData(msg)
    self:setProperties(msg)
    self:setLevel(msg.grain_car_id)
    local config = require("app.config.graincar").get(msg.grain_car_id)
    assert(config, "graincar can't find base_id = " .. tostring(msg.grain_car_id))
    self:setConfig(config)
end

function GrainCarCorpseUnitData:updateData(data)
    self:setProperties(data)
    self:setLevel(data.grain_car_id)
    local config = require("app.config.graincar").get(data.grain_car_id)
    assert(config, "graincar can't find base_id = " .. tostring(data.grain_car_id))
    self:setConfig(config)
end

function GrainCarCorpseUnitData:insertData(data)
end

function GrainCarCorpseUnitData:deleteData(data)
end


return GrainCarCorpseUnitData