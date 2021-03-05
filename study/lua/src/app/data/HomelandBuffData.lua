
local BaseData = require("app.data.BaseData")
local HomelandBuffData = class("HomelandBuffData", BaseData)
local HomelandConst = require("app.const.HomelandConst")

local schema = {}
schema["id"] = {"number", 0}
schema["baseId"] = {"number", 0}
schema["pos"] = {"number", 0}
schema["startTime"] = {"number", 0}
schema["endTime"] = {"number", 0}
schema["useCount"] = {"number", 0}
schema["config"] = {"table", {}} --配置表信息

HomelandBuffData.schema = schema
function HomelandBuffData:ctor(properties)
    HomelandBuffData.super.ctor(self)
end

function HomelandBuffData:clear()
end

function HomelandBuffData:reset()

end

function HomelandBuffData:updateData(data)
    self:setProperties(data)
    local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
    local baseId = data.baseId
    local info = HomelandHelp.getTreeBuffConfig(baseId)
	self:setConfig(info)
end

--是否已生效过
function HomelandBuffData:isEffected()
    local type = self:getConfig().type
    if type == HomelandConst.TREE_BUFF_TYPE_1 then
        return true
    elseif type == HomelandConst.TREE_BUFF_TYPE_2 then
        return self:getUseCount() >= self:getConfig().times
    elseif type == HomelandConst.TREE_BUFF_TYPE_3 then
        local curTime = G_ServerTime:getTime()
        return curTime >= self:getEndTime()
    end
end

--剩余次数
function HomelandBuffData:getRestCount()
    local userCount = self:getUseCount()
    local totalCount = self:getConfig().times
    return totalCount - userCount
end

return HomelandBuffData