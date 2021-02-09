
local BaseData = require("app.data.BaseData")
local GuildTaskUnitData = class("GuildTaskUnitData", BaseData)

local schema = {}
schema["id"] 			= {"number", 0}  --id
schema["people"] 		= {"number", 0}  --完成任务人数
schema["config"] 		= {"table", nil} --配置
schema["exp"] 		= {"number", 0}  --经验值

GuildTaskUnitData.schema = schema

function GuildTaskUnitData:ctor(properties)
	GuildTaskUnitData.super.ctor(self, properties)
end

function GuildTaskUnitData:clear()
end

function GuildTaskUnitData:reset()
end

function GuildTaskUnitData:initData(config)
    self:setConfig(config)
    self:setId(config.type)
    self:setPeople(0)
    self:setExp(0)

end


return GuildTaskUnitData