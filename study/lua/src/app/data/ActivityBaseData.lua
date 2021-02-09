--福利活动基本数据类
--@Author:Conley

local BaseData = import(".BaseData")
local ActAdmin = require("app.config.act_admin")
local ActivityBaseData = class("ActivityBaseData", BaseData)

local schema = {}
schema["id"]  		= {"number",0}--活动ID
schema["config"]  	= {"table", {}}--活动配置
schema["hasData"] 	= {"boolean",false}--是否从服务器取到了数据
ActivityBaseData.schema = schema

function ActivityBaseData:ctor(properties)
	ActivityBaseData.super.ctor(self, properties)
end

-- 清除
function ActivityBaseData:clear()

end

-- 重置
function ActivityBaseData:reset()
	self:setHasData(false)
end

function ActivityBaseData:initData(data)
	local id = data.id
	self:setId(id)
	local info = ActAdmin.get(id)
    assert(info,"act_admin can't find id = "..tostring(id))
    self:setConfig(info)
	self:setHasData(false)
end

--返回活动固定参数，配置表里的value_1...
--@index:参数索引
function ActivityBaseData:getActivityParameter(index)
    local config = self:getConfig()
	local key = string.format("value_%d",index)
	return config[key]
end

return ActivityBaseData