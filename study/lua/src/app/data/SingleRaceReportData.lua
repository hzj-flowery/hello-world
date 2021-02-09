
--跨服个人竞技战报数据
local BaseData = require("app.data.BaseData")
local SingleRaceReportData = class("SingleRaceReportData", BaseData)
local SingleRaceConst = require("app.const.SingleRaceConst")

local schema = {}
schema["position"] = {"number", 0}
schema["battle_no"] = {"number", 0}
schema["atk_user"] = {"number", 0}
schema["def_user"] = {"number", 0}
schema["win_user"] = {"number", 0}
schema["first_hand"] = {"number", 0}
schema["atk_power"] = {"number", 0}
schema["def_power"] = {"number", 0}
schema["atk_heros"] = {"table", {}}
schema["atk_heros_otr"] = {"table", {}}
schema["atk_heros_rtg"] = {"table", {}}
schema["def_heros"] = {"table", {}}
schema["def_heros_otr"] = {"table", {}}
schema["def_heros_rtg"] = {"table", {}}
schema["report_id"] = {"number", 0}
schema["winnerSide"] = {"number", 0}
SingleRaceReportData.schema = schema

function SingleRaceReportData:ctor(properties)
	SingleRaceReportData.super.ctor(self, properties)
end

function SingleRaceReportData:clear()
	
end

function SingleRaceReportData:reset()
	
end

function SingleRaceReportData:updateData(data)
	self:setProperties(data)
	local userId1 = self:getAtk_user()
	local userId2 = self:getDef_user()
	local winUserId = self:getWin_user()
	if winUserId == userId1 then
		self:setWinnerSide(SingleRaceConst.REPORT_SIDE_1)
	elseif winUserId == userId2 then
		self:setWinnerSide(SingleRaceConst.REPORT_SIDE_2)
	end
end


function SingleRaceReportData:getHeroInfoList()
    local atkHeroIds = self:getAtk_heros()
    local atkHeroOtrs = self:getAtk_heros_otr()
    local atkHeroRtgs = self:getAtk_heros_rtg()
    local atk = {}
    for i,v in ipairs(atkHeroIds) do
        local item = {}
        item.heroId = atkHeroIds[i]
        item.limitLevel = atkHeroOtrs[i]
        item.limitRedLevel = atkHeroRtgs[i]
        table.insert(atk, item)
    end
    local defHeroIds = self:getDef_heros()
    local defHeroOtrs = self:getDef_heros_otr()
    local defHeroRtgs = self:getDef_heros_rtg()
    local def = {}
    for i,v in ipairs(defHeroIds) do
        local item = {}
        item.heroId = defHeroIds[i]
        item.limitLevel = defHeroOtrs[i]
        item.limitRedLevel = defHeroRtgs[i]
        table.insert(def, item)
    end
    return atk, def
end

return SingleRaceReportData