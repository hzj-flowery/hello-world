--聊天消息数据
--@Author:Conley
local BaseData = import(".BaseData")
local ChatMsgData = class("ChatMsgData", BaseData)
local ChatPlayerData = require("app.data.ChatPlayerData")
local ChatConst = require("app.const.ChatConst")
local KvPairs = require("app.data.KvPairs")
local schema = {}
ChatMsgData.schema = schema
schema["sender"] 	= {"table",{}} --ChatPlayerData
schema["reciver"] 	= {"table",{}} --ChatPlayerData
schema["channel"]   = {"number", 0}
schema["content"]   = {"string", ""}
schema["sysMsg"]   = {"table", nil}
schema["id"]   = {"number", 0}--消息id,私聊消息才有 
schema["status"]   = {"number",0}--消息的状态，是否已读取，状态值看@see：ChatConst
schema["msg_type"]   = {"number", 0}--消息类型
schema["index"]   = {"number", 0}--在消息队列索引
schema["voiceInfo"]   = {"table", {}}
schema["voicePlay"]   = {"boolean", false}
schema["eventInfo"]   = {"table", {}}
schema["parameter"]   = {"table", {}} --KvPair 数组

ChatMsgData.id = 0

function ChatMsgData:ctor(properties)
	ChatMsgData.super.ctor(self, properties)
	local senderPlayerData = ChatPlayerData.new()
	local reciverPlayerData = ChatPlayerData.new()
	self:setSender(senderPlayerData)
	self:setReciver(reciverPlayerData)
	self._time = G_ServerTime:getTime() --聊天创建的时间
	self._needShowTimeLabel = false --是否显示时间标签

	--测试
	ChatMsgData.id  = ChatMsgData.id  + 1

	self:setId(ChatMsgData.id)
	--
end

-- 清除
function ChatMsgData:clear()
end

-- 重置
function ChatMsgData:reset()
end

function ChatMsgData:initDataWithPrivateMsg(v)
	local ChatConst = require("app.const.ChatConst")
	local msgType = rawget(v,"msg_type") or ChatConst.MSG_TYPE_TEXT

	self:getSender():setId(v.sender_id)
	self:getSender():setName(v.sender_name)
	self:getSender():setBase_id(v.sender_base_id)
	self:getSender():setOffice_level(v.sender_office_level)
	self:getSender():setAvatar_base_id(v.sender_avatar_base_id)
	self:getSender():setTitles(v.sender_title)
	self:getSender():setHead_frame_id(v.sender_head_frame_id)

	self:setChannel(ChatConst.CHANNEL_PRIVATE)
	self:getReciver():setId(v.recive_id)
	self:getReciver():setName(v.recive_name)
	self:getReciver():setBase_id(v.recive_base_id)
	self:getReciver():setOffice_level(v.recive_office_level)
	self:getReciver():setAvatar_base_id(v.recive_avatar_base_id)
	self:getReciver():setHead_frame_id(v.recive_head_frame_id)

	self:setStatus(v.status)
	self:setMsg_type(msgType)
	self:setId(v.id)
	self:setTime(v.send_time)
	
	
	if msgType == ChatConst.MSG_TYPE_VOICE then
		local voiceInfo = self:_decodeVoiceInfo(v.content)
		self:setVoiceInfo(voiceInfo)
		self:setContent(voiceInfo.voiceText)
	else
		self:setContent(v.content)
	end

	local covertId,playerInfo = require("app.utils.UserDataHelper").convertAvatarId(self:getReciver())
	self:getReciver():setPlayer_info(playerInfo)

		dump(playerInfo)

	local covertId,playerInfo = require("app.utils.UserDataHelper").convertAvatarId(self:getSender())
	self:getSender():setPlayer_info(playerInfo)

	dump(playerInfo)

	self:_createParameter(v)
end

function ChatMsgData:initDataWithSycMsg(v)
	local msgType = rawget(v,"msg_type") or ChatConst.MSG_TYPE_TEXT
	self:setMsg_type(msgType)
	if msgType == ChatConst.MSG_TYPE_VOICE then
		local voiceInfo = self:_decodeVoiceInfo(v.content)
		self:setVoiceInfo(voiceInfo)
		self:setContent(voiceInfo.voiceText)
	else
		self:setContent(v.content)
	end

	self:_createParameter(v)
end

function ChatMsgData:_createParameter(v)
	local parameter = KvPairs.new()
	parameter:initData(v)
	self:setParameter(parameter)
end

--设置消息顶部是否显示时间标题
function ChatMsgData:setNeedShowTimeLabel(value)
	self._needShowTimeLabel = value
end

--消息顶部是否显示时间标题
function ChatMsgData:getNeedShowTimeLabel()
	return self._needShowTimeLabel
end


function ChatMsgData:setTime(time)
	self._time = time
end

--聊天消息的发送时间
function ChatMsgData:getTime()
	return self._time
end


--返回和用户私聊的玩家的ID
--@return:0表示找不到，说明不是私聊，比如世界频道
function ChatMsgData:getChatObjectId()
	local target = self:getChatObject()
	if target then
		return target:getId()
	end
	return 0
end

function ChatMsgData:getChatObject()
	local sender = self:getSender()
	local reciver = self:getReciver()
	local senderIsSelf = sender:isSelf()
	local reciverIsSelf = reciver:isSelf()
	if senderIsSelf then
		return reciver
	elseif reciverIsSelf then
		return sender
	else	
		return nil
	end
	return nil
end

function ChatMsgData:setStatus(status)
	self.status_ = status
end

function ChatMsgData:isVoice()
	return self:getMsg_type() == ChatConst.MSG_TYPE_VOICE
end

function ChatMsgData:_decodeVoiceInfo(content)
	local arr = string.split(content,"#")
	local url = arr[1]
	local voiceLen = arr[2]
	local voiceText = arr[3]
	return {voiceUrl = url,voiceLen = voiceLen,voiceText = voiceText}
end

function ChatMsgData:voiceEquil(chatMsg)
	if (not self:isVoice()) or (not chatMsg:isVoice()) then
		return false
	end	
	local voiceInfo01 = self:getVoiceInfo()
	local voiceInfo02 = chatMsg:getVoiceInfo()
	return voiceInfo01.voiceUrl == voiceInfo02.voiceUrl
end	


----------------聊天响应事件-----------------
function ChatMsgData:isEvent()
	return self:getMsg_type() == ChatConst.MSG_TYPE_EVENT
end




return ChatMsgData