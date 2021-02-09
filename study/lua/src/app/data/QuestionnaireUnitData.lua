--@Author:Conley

local BaseData = require("app.data.BaseData")
local QuestionnaireUnitData = class("QuestionnaireUnitData", BaseData)
local schema = {}
schema["id"]   = {"number", 0}
schema["link"]   = {"string", ""}
schema["start_time"] = {"number", 0}
schema["end_time"]   = {"number", 0}
schema["level_min"]  = {"number", 0}
schema["level_max"]  = {"number", 0}
schema["vip_min"]    = {"number", 0}
schema["vip_max"]    = {"number", 0}
schema["apply"]    = {"boolean", false}--是否参与过

QuestionnaireUnitData.schema = schema

function QuestionnaireUnitData:ctor(properties)
	QuestionnaireUnitData.super.ctor(self, properties)
end

-- 清除
function QuestionnaireUnitData:clear()
end

-- 重置
function QuestionnaireUnitData:reset()
end

function QuestionnaireUnitData:getUrl()    
    local link = self:getLink()
    local baseData = G_UserData:getBase()
    local serverInfo = G_ServerListManager:getLastServer()
    --local serverName =  G_UserData:getBase():getServer_name()
    local param =  string.format("%d|%s|%d",serverInfo:getServer(),baseData:getId(),self:getId())
    logWarn(param)
    param  = base64.encode(param)
    logWarn(param)
    local url = link.."?sojumpparm="..param
    logWarn(url)
    return url
end

function QuestionnaireUnitData:isInActTime()
    local time = G_ServerTime:getTime()
    return time >=  self:getStart_time() and time <= self:getEnd_time() 
end


function QuestionnaireUnitData:isLevelEnough()
    local userUserLevel = G_UserData:getBase():getLevel()
    return userUserLevel >=  self:getLevel_min() and userUserLevel <= self:getLevel_max() 
end


function QuestionnaireUnitData:isVipEnough()
    local userVipLevel = G_UserData:getVip():getLevel()
    return userVipLevel >=  self:getVip_min() and userVipLevel <= self:getVip_max() 
end

--是否能显示文卷调查 
function QuestionnaireUnitData:canShow()    
    return self:isApply() == false and self:isInActTime() and self:isLevelEnough() and self:isVipEnough()
end

return QuestionnaireUnitData