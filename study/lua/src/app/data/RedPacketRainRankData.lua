--红包雨排行榜数据
local BaseData = import(".BaseData")
local RedPacketRainRankData = class("RedPacketRainRankData", BaseData)

local schema = {}
schema["user_id"] = {"number", 0}
schema["money"] = {"number", 0}
schema["office_level"] = {"number", 0}
schema["name"] = {"string", ""}
schema["guild_name"] = {"string", ""}
schema["big_red_packet"] = {"number", 0}
schema["small_red_packet"] = {"number", 0}
RedPacketRainRankData.schema = schema

function RedPacketRainRankData:ctor(properties)
	RedPacketRainRankData.super.ctor(self, properties)
end

function RedPacketRainRankData:clear()

end

function RedPacketRainRankData:reset()
	
end

return RedPacketRainRankData