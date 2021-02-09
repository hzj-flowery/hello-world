--
-- 组队数据封装
-- Author: zhanglinsen
-- Date: 2018-08-30 10:05:31
-- 
local GroupsDataHelper = {}
local GroupsConst = require("app.const.GroupsConst")

-- 组队目标配置
function GroupsDataHelper.getTeamTargetConfig(targetId)
    local info = require("app.config.team_target").get(targetId)
    assert(info, string.format("team_target config can not find target = %d", targetId))
    return info
end

-- 组队活动配置
function GroupsDataHelper.getTeamInfoConfig(id)
    local info = require("app.config.team_info").get(id)
    assert(info, string.format("team_info config can not find id = %d", id))
    return info
end

function GroupsDataHelper.getGroupInfos()
    local result = {}
    local Config = require("app.config.team_info")
    for i = 1, Config.length() do
        local info = Config.indexOf(i)
        local funcInfo = require("app.config.function_level").get(info.function_id)
        assert(funcInfo, string.format("function_level config can not find function_id = %d", info.function_id))
        table.insert(result, {configInfo = info, name = funcInfo.name})
    end

    return result
end

function GroupsDataHelper.getGroupIdWithFunctionId(functionId)
    local groupId = 0
    local Config = require("app.config.team_info")
    for i = 1, Config.length() do
        local info = Config.indexOf(i)
        if info.function_id == functionId then
            groupId = info.id
        end
    end
    return groupId
end

function GroupsDataHelper.getGroupTypeWithTarget(targetId)
    local Config = require("app.config.team_info")
    for i = 1, Config.length() do
        local info = Config.indexOf(i)
        local targetIds = string.split(info.target,"|")
        for k, id in ipairs(targetIds) do
            if tonumber(id) == targetId then
                return info.id
            end
        end
    end
    return 0
end

--获取某个活动状态
--返回：是否开启，活动起始时间
function GroupsDataHelper.getActiveState(functionId)
    local isOpen, openSec, closeSec = nil
    if functionId == FunctionConst.FUNC_MAUSOLEUM then
        local qinCfg = require("app.config.qin_info").get(1)
        isOpen = G_UserData:getQinTomb():isQinOpen()
        openSec = tonumber(qinCfg.open_time)
        closeSec = tonumber(qinCfg.close_time)
    end
    return isOpen, openSec, closeSec
end

function GroupsDataHelper.getActiveCloseTime(functionId)
    local closeTime = 0
    if functionId == FunctionConst.FUNC_MAUSOLEUM then
        closeTime = G_UserData:getQinTomb():getCloseTime()
    end
    return closeTime
end

function GroupsDataHelper.getMyActiveLeftTime(functionId)
    local leftTime = 0
    if functionId == FunctionConst.FUNC_MAUSOLEUM then
        leftTime = G_UserData:getBase():getGrave_left_sec()
    end
    return leftTime
end

function GroupsDataHelper.getMyActiveAssistTime(functionId)
    local assistTime = 0
    if functionId == FunctionConst.FUNC_MAUSOLEUM then
        assistTime = G_UserData:getBase():getGrave_assist_sec()
    end
    return assistTime
end

return GroupsDataHelper