-- required uint32 sn_type = 1;
-- repeated KvPair content =2;
-- optional uint32 time = 3;

-- message KvPair {
-- 	required string key = 1;//key
-- 	required string value = 2;//value
-- }

--矿战user数据
local BaseData = require("app.data.BaseData")
local MineSystemNotifyData = class("MineSystemNotifyData", BaseData)

local schema = {}
schema["sn_type"] = {"number", 0}
schema["content"] = {"table", {}}
schema["time"] = {"number", 0}
MineSystemNotifyData.schema = schema

function MineSystemNotifyData:ctor(properties)
    MineSystemNotifyData.super.ctor(self, properties)
end

function MineSystemNotifyData:clear()
end

function MineSystemNotifyData:reset()
end

return MineSystemNotifyData