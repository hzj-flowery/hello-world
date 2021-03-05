--聊天对象
local BaseData = import(".BaseData")
local ChatObject = class("ChatObject", BaseData)
local schema = {}
ChatObject.schema = schema
schema["channel"]            = {"number", 0}
schema["chatPlayerData"]     = {"table",nil}

function ChatObject:ctor(properties)
	ChatObject.super.ctor(self, properties)
end

-- 清除
function ChatObject:clear()
end

-- 重置
function ChatObject:reset()
end

return ChatObject
