-- Author: nieming
-- Date:2018-04-26 11:49:38
-- Describle：复仇战报日志

local BaseData = require("app.data.BaseData")
local EnemyBattleReportUnitData = class("EnemyBattleReportUnitData", BaseData)

local schema = {}
--schema
schema["fight_time"] = {"number", 0}
schema["tar_uid"] = {"number", 0}
schema["name"] = {"string", ""}
schema["win_type"] = {"boolean", false}
schema["grap_value"] = {"number", 0}
schema["officer_level"] = {"number", 0}

EnemyBattleReportUnitData.schema = schema


function EnemyBattleReportUnitData:ctor(properties)
	EnemyBattleReportUnitData.super.ctor(self, properties)

end

function EnemyBattleReportUnitData:clear()

end

function EnemyBattleReportUnitData:reset()

end



return EnemyBattleReportUnitData
