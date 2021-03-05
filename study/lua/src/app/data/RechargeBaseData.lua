--充值基础数据
--@Author:Conley

local BaseData = require("app.data.BaseData")
local RechargeBaseData = class("RechargeBaseData", BaseData)

local schema = {}
schema["id"] 		= {"number", 0}
schema["config"] 		= {"table", {}}

RechargeBaseData.schema = schema

function RechargeBaseData:ctor(properties)
	RechargeBaseData.super.ctor(self, properties)
end

-- 清除
function RechargeBaseData:clear()
end

-- 重置
function RechargeBaseData:reset()
end

return RechargeBaseData