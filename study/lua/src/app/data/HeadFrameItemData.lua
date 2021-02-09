local BaseData = require("app.data.BaseData")
local HeadFrameItemData = class("HeadFrameItemData", BaseData)
local HeadFrameConfig = require("app.config.head_frame")

local schema = {}
schema["id"] = {"number", 0}
schema["expire_time"] = {"number", 0}

-- head_frame 表中读取
schema["name"] = {"string",nil}
schema["limit_level"] = {"number",0}
schema["day"] = {"number",0}
schema["color"] = {"number",0}
schema["time_type"] = {"number",0}
schema["time_value"] = {"number",0}
schema["des"] = {"string",nil}

-- 自定义
schema["have"] = {"boolean",false} -- 是否含有该头像框


HeadFrameItemData.schema = schema

function HeadFrameItemData:ctor(properties)
	HeadFrameItemData.super.ctor(self, properties)
end

function HeadFrameItemData:clear()
	
end

function HeadFrameItemData:reset()
	
end

return HeadFrameItemData