local BaseData = require("app.data.BaseData")
local CampRaceFormationData = class("CampRaceFormationData", BaseData)
local Hero = require("app.config.hero")
local CampRaceConst = require("app.const.CampRaceConst")
local CampRaceFormationBaseData = require("app.data.CampRaceFormationBaseData")

local schema = {}
schema["uid"] = {"number", 0}
schema["base_id"] = {"number", 0}
schema["name"] = {"string", 0}
schema["officer_level"] = {"number", 0}
schema["power"] = {"number", 0}
schema["rank"] = {"number", 0}
schema["first_hand"] = {"boolean", false}
schema["status"] = {"number", 0}
schema["win_num"] = {"number", 0}
schema["per_rank"] = {"number", 0}
schema["formation"] = {"table", {}}
CampRaceFormationData.schema = schema

function CampRaceFormationData:ctor(properties)
    CampRaceFormationData.super.ctor(self, properties)
    self._heroDatas = {}
end

function CampRaceFormationData:clear()

end

function CampRaceFormationData:reset()
	self._heroDatas = {}
end

function CampRaceFormationData:updateData(data)
	self:setProperties(data)
    self._heroDatas = {}
    for i, v in pairs(data.hero_data) do 
        local baseData = CampRaceFormationBaseData.new(v)
        local heroId = baseData:getHero_id()
        self._heroDatas[heroId] = baseData
    end
end

function CampRaceFormationData:getPosition(camp)
	local status = G_UserData:getCampRaceData():getStatus()
	if status == CampRaceConst.STATE_PLAY_OFF then
        local pos = G_UserData:getCampRaceData():getPositionByUserId(camp, self:getUid())
        return pos
    end
    return 0
end

function CampRaceFormationData:getHeroDataById(id)
    local baseData = self._heroDatas[id]
    return baseData
end

function CampRaceFormationData:isWin()
    return self:getWin_num() >= 2
end

return CampRaceFormationData