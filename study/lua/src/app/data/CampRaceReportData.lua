local BaseData = require("app.data.BaseData")
local CampRaceReportData = class("CampRaceReportData", BaseData)

local schema = {}
schema["id"] = {"number", 0}
schema["camp"] = {"number", 0}
schema["pos1"] = {"number", 0}
schema["pos2"] = {"number", 0}
schema["win_pos"] = {"number", 0}
schema["first_hand"] = {"number", 0}
schema["left_power"] = {"number", 0}
schema["left_heros"] = {"table", {}}
schema["left_heros_otr"] = {"table", {}}
schema["left_heros_rtg"] = {"table", {}}
schema["right_power"] = {"number", 0}
schema["right_heros"] = {"table", {}}
schema["right_heros_otr"] = {"table", {}}
schema["right_heros_rtg"] = {"table", {}}
schema["report_id"] = {"number", 0}
CampRaceReportData.schema = schema

function CampRaceReportData:ctor(properties)
    CampRaceReportData.super.ctor(self, properties)
end

function CampRaceReportData:clear()
	
end

function CampRaceReportData:reset()
	
end

function CampRaceReportData:getHeroInfoList()
    local leftHeroIds = self:getLeft_heros()
    local leftHeroOtrs = self:getLeft_heros_otr()
    local leftHeroRtgs = self:getLeft_heros_rtg()
    local left = {}
    for i,v in ipairs(leftHeroIds) do
        local item = {}
        item.heroId = leftHeroIds[i]
        item.limitLevel = leftHeroOtrs[i]
        item.limitRedLevel = leftHeroRtgs[i]
        table.insert(left, item)
    end
    local rightHeroIds = self:getRight_heros()
    local rightHeroOtrs = self:getRight_heros_otr()
    local rightHeroRtgs = self:getRight_heros_rtg()
    local right = {}
    for i,v in ipairs(rightHeroIds) do
        local item = {}
        item.heroId = rightHeroIds[i]
        item.limitLevel = rightHeroOtrs[i]
        item.limitRedLevel = rightHeroRtgs[i]
        table.insert(right, item)
    end
    return left, right
end

return CampRaceReportData