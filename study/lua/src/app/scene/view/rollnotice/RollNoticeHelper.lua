local RollNoticeConst = require("app.const.RollNoticeConst")
local RollNoticeConst = require("app.const.RollNoticeConst")
local RollNoticeHelper = {}

RollNoticeHelper.valueFuncs = {
    [RollNoticeConst.NOTICE_COLOR_COLOR] = function(params)
        if not params.value2 then
            return nil, nil
        end
        return params.value2
    end,
    [RollNoticeConst.NOTICE_COLOR_USER] = function(params)
        if not params.value2 then
            return nil, nil
        end
        return Colors.getOfficialColor(params.value2), Colors.getOfficialColorOutlineEx(params.value2)
    end,
    [RollNoticeConst.NOTICE_COLOR_HERO] = function(params)
        if not params.value2 then
            return nil, nil
        end
        return Colors.getColor(params.value2), nil --Colors.getColorOutline(params.value2)
    end,
    [RollNoticeConst.NOTICE_COLOR_EQUIPMENT] = function(params)
        if not params.value2 then
            return nil, nil
        end
        return Colors.getColor(params.value2), nil   -- Colors.getColorOutline(params.value2)
    end,
    [RollNoticeConst.NOTICE_IMG] = function(params)
        if not params.value1 then
            return nil
        end
        return "title"
    end
}

function RollNoticeHelper.splitServerRollMsg(msg)
    local list = string.split(msg, ",") or {}
    local values = {}
    for i = 1, #list do
        if list[i] then
            values[i] = {}
            local subMsg = list[i]
            --local index = string.find(subMsg,"#")
            --if index then--多个名称之类
            local nameList = string.split(subMsg, "#") or {}
            for k, nameStr in ipairs(nameList) do
                local subList = string.split(nameStr, "|") or {}
                table.insert(values[i], subList)
            end
        -- else
        --     local subList = string.split(subMsg, "|") or {}
        --     table.insert( values[i] , subList )
        -- end
        end
    end
    return values
end

function RollNoticeHelper.decodeColors(values)
    local newValues = {}
    for k, v in ipairs(values) do
        for k1, v1 in ipairs(v) do
            if #v1 > 0 then
                newValues[k] = newValues[k] or {}
                if v1[2] and tonumber(v1[2]) then
                    local retValue1, retValue2 =
                        RollNoticeHelper.valueFuncs[tonumber(v1[2])](
                        {value1 = tonumber(v1[2]), value2 = tonumber(v1[3])}
                    ) --Colors.getColorsByServerColorData(tonumber(v1[2]), tonumber(v1[3]))
                    table.insert(newValues[k], {v1[1], retValue1, retValue2})
                else
                    table.insert(newValues[k], {v1[1]})
                end
            end
        end
    end
    return newValues
end

-- #110#恭喜#name#从#0xffffff黄金宝箱中#获得#equipment#！
function RollNoticeHelper.makeRichMsgFromServerRollMsg(rollMsg, colorParam)    
    local values = RollNoticeHelper.splitServerRollMsg(rollMsg.param)
    --拆分服务器数据
    values = RollNoticeHelper.decodeColors(values) --将品质颜等生成颜色
    local RichTextHelper = require("app.utils.RichTextHelper")
    local subTitles = RichTextHelper.parse2SubTitleExtend(rollMsg.msg)

    subTitles = RichTextHelper.fillSubTitleUseReplaceTextColor(subTitles, values, rollMsg.noticeId)
    local richElementList =
        RichTextHelper.convertSubTitleToRichMsgArr(
        colorParam or
            {
                textColor = Colors.PAOMADENG,
                --跑马灯的默认字体颜色
                outlineColor = Colors.PAOMADENG_OUTLINE,
                outlineSize = 2,
                fontSize = 20
                --跑马灯的默认字体大小
            },
        subTitles
    )
    local richStr = json.encode(richElementList)
    -- logWarn(richStr)
    return richStr, richElementList
end

return RollNoticeHelper
