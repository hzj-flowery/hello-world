local ReportParser = {}

local function dumpTable(first, k, t, blank)
    local ret = ""
    k = k or "message"
    blank = blank or ""

    if first then
        ret = ret .. blank.."return {\n"
    else
        if type(k) == "string" then
             ret = ret .. blank..'["'..tostring(k)..'"]'.." = {\n"
        else
            ret = ret .. blank.."["..tostring(k).."]".." = {\n"
        end
       
    end

    local _blank = blank

    blank = blank.."    "
    
    for k, v in pairs(t) do
        if type(v) == "table" then
            ret = ret .. dumpTable(false, k, v, blank)
        else
            if type(k) == "string" then
                ret = ret .. blank .. '["' .. k .. '"] = '
            else
                ret = ret .. blank .. '[' .. tostring(k) .. '] = '
            end

            if type(v) == "string" then
                ret = ret .. '"'..tostring(v)..'",\n'
            else
                ret = ret .. tostring(v) .. ",\n"
            end
        end
    end
    if first then
        ret = ret .. _blank.."}\n"
    else
        ret = ret .. _blank.."},\n"
    end

    return ret
end

-- ReportParser.reportData = nil

function ReportParser.parse(report, isFalseReport)
    assert(type(report) == "table", "Invalid battleReport: "..tostring(report))
    local reportData = require("app.fight.report.ReportData").new()
    reportData:setReport(report, isFalseReport)
    
    if CONFIG_FAKE_REPORT_ENABLE then
        -- print("========================= 1112233 fake report start ================== ")
        local str = dumpTable(true, "report", report)
        G_StorageManager:saveString("fight_report.lua", str)
        -- print("========================= 1112233 fake report end ================== ")
    end
    -- if isLast then
    return reportData
    -- end
end

return ReportParser