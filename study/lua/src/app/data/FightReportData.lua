local BaseData = require("app.data.BaseData")
local FightReportData = class("FightReportData", BaseData)

local schema = {}
schema["report"] = {"table", {}}

--把一些战报里面的数据存起来，结算或者各种地方需要使用
schema["leftName"] = {"string", ""}
schema["rightName"] = {"string", ""}
schema["leftOfficerLevel"] = {"number", 0 }
schema["rightOfficerLevel"] = {"number", 0}
schema["leftPower"] = {"number", 0}
schema["rightPower"] = {"number", 0}
schema["leftBaseId"] = {"number", 0}
schema["rightBaseId"] = {"number", 0}
schema["firstOrder"] = {"number", 0}
schema["win"] = {"boolean", false}


FightReportData.schema = schema

function FightReportData:ctor(properties)
    FightReportData.super.ctor(self, properties)

    self._listenerGetNormalReport = G_NetworkManager:add(MessageIDConst.ID_S2C_GetNormalBattleReport, handler(self, self._s2cGetNormalBattleReport))
end

function FightReportData:clear()
    self._listenerGetNormalReport:remove()
    self._listenerGetNormalReport = nil

    self:clearData()
    self:clearFightData()
end

function FightReportData:reset()
end

function FightReportData:clearData()
    self:setReport({})
end

--根据id获得战报
function FightReportData:c2sGetNormalBattleReport(reportId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetNormalBattleReport, {
        report_id = reportId
    })
end

function FightReportData:clearFightData()
    self:setLeftName("")
    self:setLeftOfficerLevel(0)
    self:setLeftPower(0)
    self:setLeftBaseId(0)

    self:setRightName("")
    self:setRightOfficerLevel(0)
    self:setRightPower(0)
    self:setRightBaseId(0)

    self:setFirstOrder(0)
    self:setWin(false)
end


function FightReportData:_setDatas(data)
    self:setLeftName(data.attack_name)
    self:setLeftOfficerLevel(data.attack_officer_level)
    self:setLeftPower(data.attack_power)
    self:setLeftBaseId(data.attack_base_id)

    self:setRightName(data.defense_name)
    self:setRightOfficerLevel(data.defense_officer_level)
    self:setRightPower(data.defense_power)
    self:setRightBaseId(data.defense_base_id)

    self:setFirstOrder(data.first_order)
    self:setWin(data.is_win)
end


function FightReportData:_initReportData(data)
    local report = {}
    report.attack_base_id = data.attack_base_id
    report.attack_hurt = data.attack_hurt
    report.attack_name = data.attack_name
    report.attack_officer_level = data.attack_officer_level
    report.attack_power = data.attack_power
    report.defense_base_id = data.defense_base_id
    report.defense_name = data.defense_name
    report.defense_officer_level = data.defense_officer_level
    report.defense_power = data.defense_power
    report.first_order = data.first_order
    report.is_win = data.is_win
    report.max_round_num = data.max_round_num
    report.pk_type = data.pk_type
    report.skill_ids = {}
    for i = 1, #data.skill_ids do 
        table.insert(report.skill_ids, data.skill_ids[i]) 
    end
    report.version = data.version
    report.waves = {}
    for i = 1, #data.waves do 
        local wave = data.waves[i]
        if not report.waves[wave.index] then 
            report.waves[wave.index] = {}
        end
        report.waves[wave.index].members = wave.members
        report.waves[wave.index].members_final = wave.members_final
        report.waves[wave.index].rounds = {}
        report.waves[wave.index].init_buff = wave.init_buff
        report.waves[wave.index].first_order = wave.first_order
        report.waves[wave.index].pets = wave.pets
    end

    self:setReport(report)
end

function FightReportData:_s2cGetNormalBattleReport(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then 
        return
    end

    if message.is_begin then 
        self:_initReportData(message.report)
        self:_setDatas(message.report)
    end

    if rawget(message, "rounds") then 
        local report = self:getReport()

        -- local rounds = self:getRounds()
        for i = 1, #message.rounds do 
            local roundData = message.rounds[i]
            report.waves[roundData.wave_index]["rounds"][roundData.round_index] = roundData
        end
        self:setReport(report)
    end

    if message.is_end then 
        G_SignalManager:dispatch(SignalConst.EVENT_ENTER_FIGHT_SCENE)
    end
end

return FightReportData



