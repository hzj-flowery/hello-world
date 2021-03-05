--聊天玩家数据
--@Author:Conley
local BaseData = import(".BaseData")
local ChatPlayerData = class("ChatPlayerData", BaseData)
local schema = {}
ChatPlayerData.schema = schema
schema["id"]               = {"number", 0}--id
schema["name"]             = {"string", ""}--昵称
schema["base_id"]          = {"number", 0}--头像Id 
schema["office_level"]     = {"number", 0}--官衔Id 
schema["avatar_base_id"]     = {"number", 0}--变身卡Id 
schema["player_info"] 	= {"table",nil} --玩家信息
schema["titles"] 		   = {"table", nil} -- 称号
-- schema["sender_head_frame_id"] = {"number", 0} -- 头像框
-- schema["recive_head_frame_id"] = {"number",0}
schema["head_frame_id"] = {"number",0}
schema["server_name"] = {"string", ""}
function ChatPlayerData:ctor(properties)
	ChatPlayerData.super.ctor(self, properties)
end

-- 清除
function ChatPlayerData:clear()
end

-- 重置
function ChatPlayerData:reset()
end

--返回是否是当前玩家
function ChatPlayerData:isSelf()
	local userId = G_UserData:getBase():getId()
	return userId == self:getId()
end

function ChatPlayerData:hasData()
	return  self:getId() ~= 0
end

function ChatPlayerData:hasData()
	return  self:getId() ~= 0
end

function ChatPlayerData:setDataBySimpleUser(simpleUser)
	dump(simpleUser)
	self:setId(simpleUser.userId )
	self:setName(simpleUser.name )
	self:setBase_id(simpleUser.baseId )
	self:setOffice_level(simpleUser.officeLevel)
	self:setAvatar_base_id(simpleUser.avatarBaseId)
	self:setPlayer_info(clone(simpleUser.player_info))
	self:setHead_frame_id(simpleUser.head_frame_id)
end

function ChatPlayerData:setDataByGuildUnitData(data)
	self:setId(data:getLeader() )
	self:setName(data:getLeader_name() )
	self:setBase_id(data:getLeader_base_id())
	self:setOffice_level(data:getLeader_officer_level())
	self:setAvatar_base_id(data:getLeader_avater_base_id())
	self:setPlayer_info(clone(data:getLeader_player_info()))
end

function ChatPlayerData:setDataByGuildMemberData(memberData)
	dump(memberData)
	self:setId(memberData:getUid() )
	self:setName(memberData:getName() )
	self:setBase_id(memberData:getBase_id())
	self:setOffice_level(memberData:getOfficer_level())
	self:setAvatar_base_id(memberData:getAvatar())
	self:setPlayer_info(clone(memberData:getPlayer_info()))
	self:setHead_frame_id(memberData:getHead_frame_id())
end

function ChatPlayerData:setDataByGroupUserData(userData)
	self:setId(userData:getUser_id())
	self:setName(userData:getName())
	self:setBase_id(userData:getBase_id())
	self:setOffice_level(userData:getOffice_level())
	self:setAvatar_base_id(userData:getAvatar_base_id())
	self:setHead_frame_id(userData:getHead_frame_id())
	local serverData = {
		user_id = userData:getUser_id(),
		base_id = userData:getBase_id(),
		name = userData:getName(),
		office_level = userData:getOffice_level(),
		avatar_base_id = userData:getAvatar_base_id(),
	}
	local covertId, playerInfo = require("app.utils.UserDataHelper").convertAvatarId(serverData)
	self:setPlayer_info(playerInfo)
end

return ChatPlayerData