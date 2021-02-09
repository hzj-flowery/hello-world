
local BaseData = require("app.data.BaseData")
local GuildRedPacketInfoData = class("GuildRedPacketInfoData", BaseData)
local GuildRedpacket = require("app.config.guild_redpacket")
local schema = {}
schema["id"] 				= {"number", 0} --红包唯一id
schema["red_bag_id"] 		= {"number", 0} --红包表id
schema["total_money"] 		= {"number", 0} --累计金额
schema["multiple"] 			= {"number", 0} --倍数
schema["user_id"] 			= {"number", 0} --所属玩家id
schema["user_name"] 		= {"string", ""}--所属玩家name
schema["base_id"] 			= {"number", 0} --所属玩家baseid
schema["avatar_base_id"]	= {"number", 0}
schema["red_bag_state"] 	= {"number", 0} --红包领取状态 1：未领取 2:已领取
schema["red_bag_sum"]       = {"number", 0}


GuildRedPacketInfoData.schema = schema
function GuildRedPacketInfoData:ctor(properties)
	GuildRedPacketInfoData.super.ctor(self, properties)
end

function GuildRedPacketInfoData:clear()
end

function GuildRedPacketInfoData:reset()
end

function GuildRedPacketInfoData:getConfig()
	local cfg = GuildRedpacket.get(self:getRed_bag_id())
	assert(cfg, "guild_redpacket cannot find id  "..tostring(self:getRed_bag_id()))
	return cfg
end

function GuildRedPacketInfoData:isSelfRedPacket()
	return self:getUser_id() ==  G_UserData:getBase():getId()
end

return GuildRedPacketInfoData	
    
