local BaseData = require("app.data.BaseData")
local HistoryHeroWeaponUnit = class("HistoryHeroWeaponUnit", BaseData)

local schema = {}
schema["id"] 			            = {"number", 0}
schema["num"]                       = {"number", 0}
schema["config"]                    = {"table", {}}

HistoryHeroWeaponUnit.schema = schema

function HistoryHeroWeaponUnit:ctor(properties)
    HistoryHeroWeaponUnit.super.ctor(self, properties)
    if properties then
        self:initData(properties)
    end
end

function HistoryHeroWeaponUnit:clear()
end

function HistoryHeroWeaponUnit:reset()	
end

function HistoryHeroWeaponUnit:initData(msg)	
    self:setProperties(msg)

    local config = require("app.config.historical_hero_equipment").get(msg.id)
	assert(config, "historical_hero_equipment config can't find base_id = " .. tostring(msg.id))
	self:setConfig(config)
end

return HistoryHeroWeaponUnit