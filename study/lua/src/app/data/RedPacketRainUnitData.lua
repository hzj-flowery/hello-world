-- Author: Liangxu
-- Date: 2019-4-15
-- 红包雨单个数据

local BaseData = import(".BaseData")
local RedPacketRainUnitData = class("RedPacketRainUnitData", BaseData)

local schema = {}
schema["id"] = {"string", ""}
schema["redpacket_type"] = {"string", ""}
schema["money"] = {"number", 0}
schema["rob"] = {"boolean", false}
RedPacketRainUnitData.schema = schema

function RedPacketRainUnitData:ctor(properties)
	RedPacketRainUnitData.super.ctor(self, properties)
end

function RedPacketRainUnitData:clear()

end

function RedPacketRainUnitData:reset()
	
end

--是否是真红包
function RedPacketRainUnitData:isReal()
	return self:getMoney() > 0
end

return RedPacketRainUnitData