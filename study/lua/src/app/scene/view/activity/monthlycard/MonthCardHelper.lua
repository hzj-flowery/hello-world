-- @Author panhoa
-- @Date  2.21.2019
-- @Role    

local MonthCardHelper = {}


function MonthCardHelper.getDropAwards()
    -- body
    local ParamConfig = require("app.config.parameter")
    local config = ParamConfig.get(604).content

    local awardsList = {}
    local data = string.split(config, ",")
    for index, value in ipairs(data) do
        local award = string.split(value, "|")
        if award and #award == 2 then
            local awardData = {
                openDay = tonumber(award[1]),
                value = tonumber(award[2]),
            }
            table.insert(awardsList, awardData)
        end
    end

    return awardsList
end

function MonthCardHelper.getCurCanDropAwrads()
    -- body
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local awardsList = MonthCardHelper.getDropAwards()

    local canDropList = {}
    for k,v in ipairs(awardsList) do
        if LogicCheckHelper.enoughOpenDay(v.openDay) then
            local data = {
                type = TypeConvertHelper.TYPE_ITEM,
                value = tonumber(v.value),
                size = 1,
            }
            table.insert(canDropList, data)
        end
    end
    return canDropList
end


return MonthCardHelper