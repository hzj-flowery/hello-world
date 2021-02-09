--聊天数据
--@Author:Conley
local BaseData = import(".BaseData")
local ChatMsgData = require("app.data.ChatMsgData")
local ChatConst = require("app.const.ChatConst")
local ParameterIDConst = require("app.const.ParameterIDConst")
local ChatData = class("ChatData", BaseData)
local schema = {}
schema["hasData"] 	= {"boolean",false}--是否有数据
schema["lastUISelectedChannel"] 	= {"table",0}----上一次选中的聊天页签
schema["lastUISelectedChatPlayerData"] 	= {"table",nil}----上次的私聊对象
schema["chatSetting"] = {"table",nil}
schema["lastInputCache"] = {"number",""}--聊天输入


ChatData.schema = schema

function ChatData:ctor(properties)
	ChatData.super.ctor(self, properties)
	self:_initData()
	self._s2cChatRequestListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ChatRequest, handler(self, self._s2cChatRequest))--消息发送回调
	self._s2cChatListener = G_NetworkManager:add(MessageIDConst.ID_S2C_Chat, handler(self, self._s2cChat))--聊天消息同步
    self._s2cChatGetMsgListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ChatGetMsg, handler(self, self._s2cChatGetMsg))--获取和某个玩家的私聊消息
    self._s2cChatMsgStatusUpdateListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ChatMsgStatusUpdate, handler(self, self._s2cChatMsgStatusUpdate))--消息已读未读刷新
	self._s2cChatMsgDeleteListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ChatMsgDelete, handler(self, self._s2cChatMsgDelete))--消息删除刷新

	self._s2cGetMultiUserBaseInfoListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetMultiUserBaseInfo, handler(self, self._s2cGetMultiUserBaseInfo)) --获取私聊对象列表
	self._s2cChatGetSimpleMsgListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ChatGetSimpleMsg, handler(self, self._s2cChatGetSimpleMsg))--登陆后服务器推送最后一条私聊消息
	self._signalRecvFlushData = G_SignalManager:add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(self, self._onEventRecvFlushData))    
	self._signalLoginSuccess = G_SignalManager:add(SignalConst.EVENT_LOGIN_SUCCESS, handler(self, self._onEventLoginSuccess))

end

function ChatData:_initData()
	self._worldList = {} ---缓存收到的聊天信息
	self._privateList = {} ---缓存收到的聊天信息
	self._guildList = {} ---缓存收到的聊天信息
	self._teamList = {} ---缓存收到的聊天信息
	self._crossServerList = {} --缓存收到的聊天信息
	self._sendMsgStampList = {} --发送消息时间戳数组，频道下还分类型
	self._showTimeLabelDic = {} --保存各个频道上一次显示时间标签的消息
	self._sendMsgDataCache = nil--缓存发送的聊天消息,在发送成功用来创建消息对象
	self._clientChatSessionList = {}--玩家自己手动建立的聊天对象队列，重新登陆后清空
	self._chatSettingData = {}--聊天设置数据
	self._privateChatDataIsGetFlag = {}--是否取到了和玩家私聊消息数据
	self._worldAutoPlayVoiceList = {}--自动播放语音列表
	self._guildAutoPlayVoiceList = {}--自动播放语音列表
	self._privateObjectInfo = {} --私聊对象信息
	self:setChatSetting(require("app.data.ChatSetting").new())
end


-- 清除
function ChatData:clear()
	self._s2cChatRequestListener:remove()
	self._s2cChatRequestListener = nil

	self._s2cChatListener:remove()
	self._s2cChatListener = nil

	self._s2cChatGetMsgListener:remove()
	self._s2cChatGetMsgListener = nil

	self._s2cChatMsgStatusUpdateListener:remove()
	self._s2cChatMsgStatusUpdateListener = nil

	self._s2cChatMsgDeleteListener:remove()
	self._s2cChatMsgDeleteListener = nil

	self._s2cChatGetSimpleMsgListener:remove()
	self._s2cChatGetSimpleMsgListener = nil

	self._signalRecvFlushData:remove()
	self._signalRecvFlushData = nil
	
	self._s2cGetMultiUserBaseInfoListener:remove()
	self._s2cGetMultiUserBaseInfoListener = nil

	self._signalLoginSuccess:remove()
    self._signalLoginSuccess = nil

end

-- 重置
function ChatData:reset()
	self:setHasData(false)

	self:_initData()
end

function ChatData:_onEventRecvFlushData()
	self:pullData()
end

function ChatData:_onEventLoginSuccess()
	logWarn("ChatData ---------------- onEventLoginSuccess ")
	self._privateChatDataIsGetFlag = {}--是否取到了和玩家私聊消息数据
end

--发送聊天消息服务器响应
function ChatData:_s2cChatRequest(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_CHAT_SEND_SUCCESS)
end

-- 接收私聊对象基本信息
function ChatData:_s2cGetMultiUserBaseInfo(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_CHAT_GETNULTIUSERSINFO, message)
end

--接收私聊的最后一条消息
function ChatData:_s2cChatGetSimpleMsg(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self._clientChatSessionList = {}
	local msgs = rawget(message,"msgs") or {}
	for k,v in ipairs(msgs) do
		local chatMsgData = ChatMsgData.new()
		chatMsgData:initDataWithPrivateMsg(v)

		local isHave = false
		local privateMsgs = self._privateList[chatMsgData:getChatObjectId()] or {}

		for k, v in pairs(privateMsgs) do
			if v:getId() == chatMsgData:getId() then
				isHave = true
			end
		end

		if isHave == false then
			self:_onAddNewMessage(chatMsgData,false)
		end

		--table.insert(self._clientChatSessionList,chatMsgData)
	end
	self:setHasData(true)

	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_CHAT)
	G_SignalManager:dispatch(SignalConst.EVENT_CHAT_UNREAD_MSG_NUM_CHANGE)
	G_SignalManager:dispatch(SignalConst.EVENT_CHAT_PRIVATE_CHAT_MEMBER_CHANGE,nil)
end

--消息同步
function ChatData:_s2cChat(id,message)
	if not self:canAcceptMsg(message.channel) then
		return false
	end

	if (message.channel == ChatConst.CHANNEL_WORLD or message.channel == ChatConst.CHANNEL_CROSS_SERVER) and  --世界频道、跨服频道屏蔽黑名单
		G_UserData:getFriend():isUserIdInBlackList(message.sender_id) then
		return false
	end
	local chatMsgData = ChatMsgData.new()
	chatMsgData:getSender():setId(message.sender_id)
	chatMsgData:getSender():setName(message.sender)
	chatMsgData:getSender():setBase_id(message.base_id)
	chatMsgData:getSender():setOffice_level(message.office_level)
	chatMsgData:getSender():setAvatar_base_id(rawget(message,"avatar_base_id") or 0)
	chatMsgData:getSender():setTitles(message.title)
	chatMsgData:getSender():setHead_frame_id(message.sender_head_frame_id)
	chatMsgData:getSender():setServer_name(message.sender_server_name)
	local covertId,playerInfo = require("app.utils.UserDataHelper").convertAvatarId(chatMsgData:getSender())
	chatMsgData:getSender():setPlayer_info(playerInfo)


	chatMsgData:setChannel(message.channel)
	chatMsgData:setContent(message.content)

	chatMsgData:setStatus(ChatConst.MSG_STATUS_UNREAD)--未读
	chatMsgData:setId(message.msg_id)
	chatMsgData:initDataWithSycMsg(message)
	

	if message.sender_id == 0 then--系统发送的频道消息
		local rollMsg = {msg = message.content,noticeType = 0,param = message.control,sendId = 0} 
		chatMsgData:setSysMsg(rollMsg)
	end
	
	
	if message.channel == ChatConst.CHANNEL_PRIVATE then
		if message.sender_id == G_UserData:getBase():getId() then--自己发送的消息
			--拼接受者(其他人)消息
			if self._sendMsgDataCache and self._sendMsgDataCache.channel == message.channel and 
				self._sendMsgDataCache.reciver then
				chatMsgData:getReciver():setId(self._sendMsgDataCache.reciver:getId())
				chatMsgData:getReciver():setName(self._sendMsgDataCache.reciver:getName())
				chatMsgData:getReciver():setBase_id(self._sendMsgDataCache.reciver:getBase_id())
				chatMsgData:getReciver():setOffice_level(self._sendMsgDataCache.reciver:getOffice_level())
				chatMsgData:getReciver():setAvatar_base_id(self._sendMsgDataCache.reciver:getAvatar_base_id())
				chatMsgData:getReciver():setHead_frame_id(self._sendMsgDataCache.reciver:getHead_frame_id())
				--local covertId,playerInfo = require("app.utils.UserDataHelper").convertAvatarId(chatMsgData:getReciver())
				local playerInfo = self._sendMsgDataCache.reciver:getPlayer_info()
				chatMsgData:getReciver():setPlayer_info(clone(playerInfo))
			end
			chatMsgData:setStatus(ChatConst.MSG_STATUS_READED)
		else--发送给自己的消息
			--拼接受者(自己)消息
			chatMsgData:getReciver():setId(G_UserData:getBase():getId())
			chatMsgData:getReciver():setName(G_UserData:getBase():getName())
			chatMsgData:getReciver():setBase_id(G_UserData:getHero():getRoleBaseId())
			chatMsgData:getReciver():setOffice_level(G_UserData:getBase():getOfficer_level())
			chatMsgData:getReciver():setAvatar_base_id(G_UserData:getBase():getAvatar_base_id())
			chatMsgData:getReciver():setHead_frame_id(G_UserData:getBase():getHead_frame_id())
			local covertId,playerInfo = require("app.utils.UserDataHelper").convertAvatarId(chatMsgData:getReciver())
			chatMsgData:getReciver():setPlayer_info(playerInfo)
		end
	
		
	end
	
	self:_onAddNewMessage(chatMsgData,true)
end

--接收和某个玩家的私聊消息
function ChatData:_s2cChatGetMsg(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	if not self:canAcceptMsg(ChatConst.CHANNEL_PRIVATE) then
		return false
	end

	local msgs = rawget(message,"msgs") or {}
	local userId = rawget(message,"user_id") or 0
	self:_setIsGetPrivateMsgWithPlayer(userId,true)
	
	local chatSession = self:seekChatSessionByPlayerId(userId)
	local privateTargetData = chatSession and chatSession:getChatObject() or nil
	self:_deletePrivateMsgByPlayerId(userId)

	for k,v in ipairs(msgs) do
		local chatMsgData = ChatMsgData.new()
		chatMsgData:initDataWithPrivateMsg(v)
		self:_onAddNewMessage(chatMsgData,false)
	end
	local isClearSession = #msgs <= 0 

	if isClearSession and privateTargetData then
		self:createChatSessionWithPlayer(privateTargetData,false)
	end

	local chatPlayerData = privateTargetData
	if chatPlayerData then
		G_SignalManager:dispatch(SignalConst.EVENT_CHAT_MSG_LIST_GET,chatPlayerData)
	end
	

	G_SignalManager:dispatch(SignalConst.EVENT_CHAT_PRIVATE_CHAT_MEMBER_CHANGE,nil)
	G_SignalManager:dispatch(SignalConst.EVENT_CHAT_UNREAD_MSG_NUM_CHANGE)--似乎不需要
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_CHAT)--似乎不需要
end

function ChatData:_s2cChatMsgStatusUpdate(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local msgIds = rawget(message,"msg_ids") or {}
	for k,v in ipairs(msgIds) do
		for k1,v1 in pairs( self._privateList) do
			for k2,v2 in ipairs(v1) do
				if v2:getId() == v then
					v2:setStatus(ChatConst.MSG_STATUS_READED)
				end
			end
		end
	end

	G_SignalManager:dispatch(SignalConst.EVENT_CHAT_UNREAD_MSG_NUM_CHANGE)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_CHAT)
end

function ChatData:_s2cChatMsgDelete(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	
	local deleteUserId = rawget(message,"delete_user_id") or {}
	for k,v in ipairs(deleteUserId) do
		self:_deletePrivateMsgByPlayerId(v)
	end
	
	G_SignalManager:dispatch(SignalConst.EVENT_CHAT_PRIVATE_CHAT_MEMBER_CHANGE,nil)
	G_SignalManager:dispatch(SignalConst.EVENT_CHAT_UNREAD_MSG_NUM_CHANGE)--似乎不需要
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_CHAT)
end

--收到新消息
function ChatData:_onAddNewMessage(newMsg,notify)
	--TODO 黑名单，需要好友功能支持
	--如果该玩家在黑名单中，则不创建
	--if G_MMe.friendData:isBlack(newMsg:getSender():getId()) then
	--	return nil
	--end

	local channel = newMsg:getChannel()
	--设置此聊天消息上头是否需要显示时间
	if channel == ChatConst.CHANNEL_WORLD then
		self:_onAddNewMsg2List(self._worldList, newMsg,channel)
		self:_onAddVoiceMsg2List(self._worldAutoPlayVoiceList,newMsg,channel)
	elseif channel == ChatConst.CHANNEL_PRIVATE then
		local privateChatTargetId = newMsg:getChatObjectId()--私聊目标
		if privateChatTargetId ~= 0 then
			self:_onAddPrivateChatNewMsg2List(newMsg)
		else
			newMsg = nil	
		end
	elseif channel == ChatConst.CHANNEL_GUILD then
		self:_onAddNewMsg2List(self._guildList, newMsg,channel)
		self:_onAddVoiceMsg2List(self._guildAutoPlayVoiceList,newMsg,channel)
	elseif channel == ChatConst.CHANNEL_TEAM then
		self:_onAddNewMsg2List(self._teamList, newMsg,channel)
		self:_onAddVoiceMsg2List(self._guildAutoPlayVoiceList,newMsg,channel)
	elseif channel == ChatConst.CHANNEL_CROSS_SERVER then
		self:_onAddNewMsg2List(self._crossServerList, newMsg,channel)
		self:_onAddVoiceMsg2List(self._guildAutoPlayVoiceList,newMsg,channel)
	end

	if newMsg and notify then
		G_SignalManager:dispatch(SignalConst.EVENT_CHAT_GET_MESSAGE, newMsg)
		G_SignalManager:dispatch(SignalConst.EVENT_CHAT_UNREAD_MSG_NUM_CHANGE)
		G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_CHAT)
	end


	return newMsg
end

---向聊天数组中加入新的信息，自动删除多余的信息。
function ChatData:_onAddNewMsg2List(list, newMsg,channel)
	local size = #list + 1
	newMsg:setIndex(size)
	newMsg:setNeedShowTimeLabel(self:_isNeedShowTimeLabel(newMsg))
	list[size] = newMsg
	if #list > ChatConst.MAX_MSG_CACHE_NUM[channel] then
		table.remove(list, 1)
	end
end

function ChatData:_onAddVoiceMsg2List(list,newMsg,channel)
	--查看设置是否自动播放渠道消息
	local chatSetting = self:getChatSetting()
	local isAutoPlay = chatSetting:isAutoPlayVoiceOfChannel(channel)
	if not isAutoPlay then
		return
	end
	--发送者不是自己
	if newMsg:getSender():isSelf() then
		return
	end
	if not newMsg:isVoice() then
		return
	end
	table.insert(list, newMsg)

	--可以使用事件形式TODO
	G_VoiceManager:tryAutoPlay()
end

function ChatData:_onAddPrivateChatNewMsg2List(newMsg)
	--self._privateList[私聊对象Id][]
	local privateChatTargetId = newMsg:getChatObjectId()--私聊目标
	if not self._privateList[privateChatTargetId] then
		self._privateList[privateChatTargetId] = {}
	end
	self:_onAddNewMsg2List(self._privateList[privateChatTargetId],newMsg,ChatConst.CHANNEL_PRIVATE)

	self:_deleteClientChatSession(newMsg,false)
end

function ChatData:_deleteClientChatSession(newMsg,notify)
	logWarn("clear clientChatSessionList start ")
	for i = #self._clientChatSessionList,1,-1 do
		local v = self._clientChatSessionList[i]
		logWarn("delete clientChatSessionList id :"..tostring(v:getChatObjectId()).." = "..tostring(newMsg:getChatObjectId()))
		if v:getChatObjectId() ==  newMsg:getChatObjectId() then
			table.remove(self._clientChatSessionList,i)
		end
	end
	logWarn("clear _clientChatSessionList end ")
	if notify then
		G_SignalManager:dispatch(SignalConst.EVENT_CHAT_PRIVATE_CHAT_MEMBER_CHANGE,newMsg)
	end
end

function ChatData:_clearClientChatSession()
	if #self._clientChatSessionList > 0 then
		--删除伪造的聊天对象
		self._clientChatSessionList = {}
		G_SignalManager:dispatch(SignalConst.EVENT_CHAT_PRIVATE_CHAT_MEMBER_CHANGE)
	end
end

function ChatData:_createClientSession(chatPlayerData,notify)
	local chatMsgData = ChatMsgData.new()
	chatMsgData:setReciver(chatPlayerData)

	chatMsgData:getSender():setId(G_UserData:getBase():getId())
	chatMsgData:getSender():setName(G_UserData:getBase():getName())
	chatMsgData:getSender():setBase_id(G_UserData:getHero():getRoleBaseId())
	chatMsgData:getSender():setOffice_level(G_UserData:getBase():getOfficer_level())

	table.insert(self._clientChatSessionList,chatMsgData)
	if notify then
		G_SignalManager:dispatch(SignalConst.EVENT_CHAT_PRIVATE_CHAT_MEMBER_CHANGE,chatMsgData)
	end
	return chatMsgData
end


--删除和此玩家的私聊消息
function ChatData:_deletePrivateMsgByPlayerId(playerId)
	local msgList = self._privateList[playerId]
	self._privateList[playerId] = nil

	self:_clearTimeLabel(ChatConst.CHANNEL_PRIVATE,playerId)

	return msgList
end

function ChatData:onSendMsgSuccess(channel, msgType)
	local cdType = self:_getCdTypeWithMsgType(msgType)
	if self._sendMsgStampList[channel] == nil then
		self._sendMsgStampList[channel] = {}
	end
	self._sendMsgStampList[channel][cdType] = G_ServerTime:getTime()
end

function ChatData:_getCdTypeWithMsgType(msgType)
	local cdType = ChatConst.CD_TYPE_COMMON
	if msgType == ChatConst.MSG_TYPE_EVENT then
		cdType = ChatConst.CD_TYPE_EVENT
	end
	return cdType
end

--返回与目标playerId的私聊的未读消息数
function ChatData:geUnReadMsgNumWithObject(playerId)
	return self:getUnReadMsgNum(self._privateList[playerId] )
end

function ChatData:getUnReadMsgNum(msgList)
	if not msgList then
		return 0
	end
	local count = 0
	local userId = G_UserData:getBase():getId()
	for k,v in ipairs(msgList) do
		if v:getStatus() == ChatConst.MSG_STATUS_UNREAD and v:getSender():getId() ~= userId then
			count = count + 1
		end
	end

	return count
end


function ChatData:getChannelUnReadMsgNum(channel)
	if channel == ChatConst.CHANNEL_WORLD then
		return self:getUnReadMsgNum(self._worldList)
	elseif channel == ChatConst.CHANNEL_GUILD then
		return self:getUnReadMsgNum(self._guildList)
	elseif channel == ChatConst.CHANNEL_ALL then
		local sysMsgList = G_UserData:getRollNotice():getSystemMsgList()
		local num1 = self:getUnReadMsgNum(self._worldList) 
		local num2 = self:getUnReadMsgNum(self._guildList) 
		local num3 = self:getUnReadMsgNum(sysMsgList)
		logWarn("*** "..num1)
		logWarn("*** "..num2)
		logWarn("*** "..num3)

		--dump(sysMsgList[1])
		return num1 + num2 + num3
	elseif channel == ChatConst.CHANNEL_PRIVATE then
		local num = 0
		for k,v in pairs(self._privateList) do
			num = num + self:getUnReadMsgNum(v)
		end

		return num
	elseif channel == ChatConst.CHANNEL_TEAM then	
		return self:getUnReadMsgNum(self._teamList)
	elseif channel == ChatConst.CHANNEL_CROSS_SERVER then
		return self:getUnReadMsgNum(self._crossServerList)
	end
	return 0
end

--获取聊天发送的CD时间
--@return:返回0 表明没有CD
function ChatData:getCDTime(channel, msgType)
	local cdType = self:_getCdTypeWithMsgType(msgType)
	local UserDataHelper = require("app.utils.UserDataHelper")

	local sendStamp = 0
	if self._sendMsgStampList[channel] then
		sendStamp = self._sendMsgStampList[channel][cdType] or 0
	end
	local maxCd = 0
	

	local currentTime = G_ServerTime:getTime()
	if channel == ChatConst.CHANNEL_GUILD then
		if cdType == ChatConst.CD_TYPE_COMMON then
			maxCd = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_GUILD_INTERVAL)
		elseif cdType == ChatConst.CD_TYPE_EVENT then
			maxCd = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_QIN_GUILD_CD)
		end
	elseif channel == ChatConst.CHANNEL_WORLD then
		if cdType == ChatConst.CD_TYPE_COMMON then
			maxCd = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_WORLD_INTERVAL)
		elseif cdType == ChatConst.CD_TYPE_EVENT then
			maxCd = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_QIN_WORLD_CD)
		end
	elseif channel == ChatConst.CHANNEL_TEAM then
		maxCd = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_TEAM_INTERVAL)	
	elseif channel == ChatConst.CHANNEL_CROSS_SERVER then
		maxCd = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_WORLD_INTERVAL)
	end
	
	local cdTime = 0
	sendStamp  = sendStamp + 0.1--防止手速太快了--可以在收到消息后再来update这个时间，这样做时间会跳
	if currentTime - sendStamp < maxCd then
		cdTime = maxCd - (currentTime - sendStamp)
	end
	return math.min(math.ceil(cdTime),maxCd), cdType
end


function ChatData:isFuncOpen()
   local isFunctionOpen = require("app.utils.logic.FunctionCheck").funcIsShow(FunctionConst.FUNC_CHAT)
   return isFunctionOpen
end

--是否能接受聊天消息
function ChatData:canAcceptMsg(channel)
	local UserDataHelper = require("app.utils.UserDataHelper")


	if not self:isFuncOpen() then
		return false
	end
	if not self:getChatSetting():isReceiveMsgOfChannel(channel) then
		return false
	end
	local playerLevel = G_UserData:getBase():getLevel()
	if channel == ChatConst.CHANNEL_GUILD then
		return true
	elseif channel == ChatConst.CHANNEL_WORLD then
		return playerLevel >= UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_WORLD_ACCEPT_MSG_LEVEL)
	elseif channel == ChatConst.CHANNEL_TEAM then
		return true
	elseif channel == ChatConst.CHANNEL_CROSS_SERVER then
		return true
	end
	return true
end

--是否能发送聊天消息
function ChatData:canSendMsg(channel,limitInfo)
	local UserDataHelper = require("app.utils.UserDataHelper")
	if not self:isFuncOpen() then
		return false
	end

	local count = G_UserData:getDailyCount():getCountById(G_UserData:getDailyCount().DAILY_RECORD_CHAT_CNT)
	local maxCount = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_SEND_MSG_NUM_DAILY) 
	local vipLevel = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_SEND_MSG_VIP_LEVEL) 
	local roleLevel = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_SEND_MSG_ROLE_LEVEL) 
	if count >= maxCount and channel == ChatConst.CHANNEL_WORLD then
		--检查VIP和等级
		local playerLevel = G_UserData:getBase():getLevel()
		local playerVipLevel = G_UserData:getVip():getLevel()
		if playerVipLevel < vipLevel and playerLevel < roleLevel  then
			if limitInfo then
				limitInfo[ChatConst.LIMIT_FLAG_NO_COUNT] = 
					{vipLevel,roleLevel}
			end
			return false
		end
	end

	local checkLevelFunc = function(paramId,limitInfo)
		local playerLevel = G_UserData:getBase():getLevel()
		if playerLevel < UserDataHelper.getChatParameterById(paramId)  then
			if limitInfo then
				limitInfo[ChatConst.LIMIT_FLAG_LEVLE] = 
					UserDataHelper.getChatParameterById(paramId) 
			end
			return false
		end
		return true
	end
	if channel == ChatConst.CHANNEL_GUILD then		
		if not G_UserData:getGuild():isInGuild() then
			if limitInfo then
				limitInfo[ChatConst.LIMIT_FLAG_NO_GANG] = true
			end
			return false
		end
		if not checkLevelFunc(ChatConst.PARAM_CHAT_GUILD_SEND_MSG_LEVEL,limitInfo) then
			return false
		end
	elseif channel == ChatConst.CHANNEL_WORLD then
		if not checkLevelFunc(ChatConst.PARAM_CHAT_WORLD_SEND_MSG_LEVEL,limitInfo) then
			return false
		end
	elseif channel == ChatConst.CHANNEL_PRIVATE then
		if not checkLevelFunc(ChatConst.PARAM_CHAT_PRIVATE_CHAT_LEVEL,limitInfo) then
			return false
		end
	elseif channel == ChatConst.CHANNEL_TEAM then
		return true	
	elseif channel == ChatConst.CHANNEL_CROSS_SERVER then
		if not checkLevelFunc(ChatConst.PARAM_CHAT_CROSS_SERVER_LEVEL,limitInfo) then
			return false
		end
		local ChatDataHelper = require("app.utils.data.ChatDataHelper")
		if not ChatDataHelper.isCanCrossServerChat() then
			if limitInfo then
				limitInfo[ChatConst.LIMIT_FLAG_CROSS_SERVER] = true
			end
			return false
		end
	end
	return true
end

---是否需要显示时间标签
---@channel 当前的频道
function ChatData:_isNeedShowTimeLabel(newMsg)
	local channel = newMsg:getChannel()
	local playerId = nil
	if channel == ChatConst.CHANNEL_PRIVATE then
		playerId = newMsg:getChatObjectId()--私聊目标
	end	
	
	local currentTime = newMsg:getTime()--G_ServerTime:getTime()
	local currentIndex = newMsg:getIndex()
	local needShow = false
	local key = tostring(channel).."_"..tostring(playerId)
	local lastShowTimeLabelMsg = self._showTimeLabelDic[key] 
	local lastShowTime = lastShowTimeLabelMsg and lastShowTimeLabelMsg:getTime() or 0
	local lastShowTimeIndex = lastShowTimeLabelMsg and lastShowTimeLabelMsg:getIndex() or 0
	logWarn(key)
	logWarn(lastShowTime.."++++++++++++++++"..lastShowTimeIndex)
	logWarn(currentTime.."++++++++++++++++"..currentIndex)
	if currentTime - lastShowTime >= ChatConst.SHOW_TIME_LABEL_BLANK then
		self._showTimeLabelDic[key] = newMsg
		needShow = true
	elseif currentIndex - lastShowTimeIndex >= ChatConst.SHOW_TIME_LABEL_MSG_NUM then
		self._showTimeLabelDic[key] = newMsg
		needShow = true	
	else
		needShow = false
	end

	return needShow
end

function ChatData:_clearTimeLabel(channel,playerId)
	local key = tostring(channel).."_"..tostring(playerId)
	self._showTimeLabelDic[key] = nil
end

--返回世界聊天数据
function ChatData:getWorldList()
	return self._worldList
end

--返回私聊数据
function ChatData:getPrivateList()
	return self._privateList
end

--返回军团聊天数据
function ChatData:getGuildList()
	return self._guildList
end	

--返回组队聊天数据
function ChatData:getTeamList()
	return self._teamList
end

--返回跨服聊天数据
function ChatData:getCrossServerList()
	return self._crossServerList
end

function ChatData:getMsgListByChannel(channelId)
	local msgList = {}
    if channelId == ChatConst.CHANNEL_WORLD  then
        msgList = G_UserData:getChat():getWorldList()
    elseif channelId == ChatConst.CHANNEL_GUILD  then
        msgList = G_UserData:getChat():getGuildList()
    elseif channelId == ChatConst.CHANNEL_ALL  then--综合频道(系统、世界、军团)
		msgList = G_UserData:getChat():getAllChannelMsgList()	
	elseif channelId == ChatConst.CHANNEL_TEAM  then
		msgList = self._teamList
	elseif channelId == ChatConst.CHANNEL_CROSS_SERVER then
		msgList = self._crossServerList
    end   
	return msgList
end	

--返回私聊最新发言的消息列表
function ChatData:getPrivateChatLastestMsgList()
	local chatObjectIdList = {}
	for k,chatMsgData in ipairs(self._clientChatSessionList) do
		chatObjectIdList[chatMsgData:getChatObjectId()] = chatMsgData
	end


	for k,msgList in pairs(self._privateList) do
		if msgList and #msgList > 0 then
			--取最后一个
			local chatMsgData = msgList[#msgList]
			chatObjectIdList[chatMsgData:getChatObjectId()] = chatMsgData
		end
	end	
	local resultList = {}
	for k,v in pairs(chatObjectIdList) do
		table.insert( resultList, v)
	end
	local sortFunc = function(msg1,msg2)
		--TODO 秒计时，时间可能一样
		local time1 =  msg1:getTime()
		local time2 =  msg2:getTime() 
		return time1 > time2
	end

	table.sort(resultList,sortFunc)
	return resultList
end

function ChatData:getMiniMsgList()

	local showWorldMsg = self:getChatSetting():isShowMiniMsgOfChannel(ChatConst.CHANNEL_WORLD )
	local showSystemMsg = self:getChatSetting():isShowMiniMsgOfChannel(ChatConst.CHANNEL_SYSTEM )

	--世界和私聊的消息
	local miniMsgList = {}

	if showWorldMsg then
		for k,v in ipairs(self._worldList) do
			table.insert(miniMsgList,v)
		end	
	end
	
	for k,v in ipairs(self._guildList) do
		table.insert(miniMsgList,v)
	end

	for k,v in ipairs(self._teamList) do
		table.insert(miniMsgList,v)
	end
	
	for k,v in ipairs(self._crossServerList) do
		table.insert(miniMsgList,v)
	end
	
	if showSystemMsg then
		for k,v in ipairs(G_UserData:getRollNotice():getSystemMsgList()) do
			table.insert(miniMsgList,v)
		end
	end

	table.sort(miniMsgList,handler(self,self._sortChatMsg))

	return self:_clipMsgList(miniMsgList,ChatConst.MAX_MINI_MSG_CACHE_NUM)
end

--综合频道(系统、世界、军团)
function ChatData:getAllChannelMsgList()
	local worldMsgList = G_UserData:getChat():getWorldList()
	local sysMsgList = G_UserData:getRollNotice():getSystemMsgList()
	local guildMsgList = G_UserData:getChat():getGuildList()
	local teamMsgList = G_UserData:getChat():getTeamList()
	local crossServerList = G_UserData:getChat():getCrossServerList()

	local msgList = {}

	for k,v in ipairs(sysMsgList) do
		table.insert(msgList,v)
	end

	for k,v in ipairs(worldMsgList) do
		table.insert(msgList,v)
	end	

	for k,v in ipairs(guildMsgList) do
		table.insert(msgList,v)
	end

	for k,v in ipairs(teamMsgList) do
		table.insert(msgList,v)
	end

	for k,v in ipairs(crossServerList) do
		table.insert(msgList,v)
	end

	table.sort(msgList,handler(self,self._sortChatMsg))

	local maxMsgNum = ChatConst.MAX_MSG_CACHE_NUM[ChatConst.CHANNEL_ALL] 
	return self:_clipMsgList(msgList,maxMsgNum)
end

function ChatData:_clipMsgList(msgList,maxMsgNum)
	local resultList = {}
	local startIndex = #msgList-maxMsgNum + 1
	startIndex = math.max(startIndex,1)
	for i = startIndex,#msgList,1 do
		table.insert(resultList,msgList[i])
	end
	return resultList
end

--返回和玩家的私聊消息
function ChatData:getPrivateMsgListWithPlayerId(playerId)
	for k,msgList in pairs(self._privateList) do
		if k == playerId then
			--取最后一个
			return msgList
		end
	end	
	return {}
end

function ChatData:_sortChatMsg(msg1,msg2)
	--TODO 秒计时，时间可能一样
	local time1 =  msg1:getTime()
	local time2 =  msg2:getTime() 
	return time1 < time2
end

--@return:找不到返回nil,说明还没和此玩家聊过天或没建立过聊天
function ChatData:seekChatSessionByPlayerId(playerId)
	for k,msgList in pairs(self._privateList) do
		if k == playerId then
			local lastData = msgList[#msgList]
			return lastData 
		end
	end	
	return self:_seekClientChatSessionByPlayerId(playerId)
end

function ChatData:_seekClientChatSessionByPlayerId(playerId)
	for k,chatMsgData in ipairs(self._clientChatSessionList) do
		if chatMsgData:getChatObjectId() == playerId then
			return chatMsgData
		end
	end
	return nil
end


function ChatData:createChatSessionWithPlayer(chatPlayerData,notify)
	local chatSession = self:seekChatSessionByPlayerId(chatPlayerData:getId())
	if not chatSession then
		chatSession = self:_createClientSession(chatPlayerData,notify)
	end
	return chatSession
end


--是否有红点
function ChatData:hasRedPoint(channelId)
	if not channelId or type(channelId) ~= 'number' then
		return self:isChannelHasRedPoint(ChatConst.CHANNEL_PRIVATE)
	else
		return self:isChannelHasRedPoint(channelId)	
	end	
end

--和玩家是否有未读私聊消息
function ChatData:hasRedPointWithPlayer(playerId)
	return self:geUnReadMsgNumWithObject(playerId) > 0
end

--是否有聊天红点
function ChatData:isChannelHasRedPoint(channel)
	if channel ~= ChatConst.CHANNEL_PRIVATE and channel ~=  ChatConst.CHANNEL_GUILD and 
		channel ~=  ChatConst.CHANNEL_TEAM
	then
		return false
	end
	return self:getChannelUnReadMsgNum(channel) > 0
end


--清除所有私聊消息
function ChatData:clearAllPrivateChatMsg()
	local deleteUserIds = {}
	for k,msgList in pairs(self._privateList) do
		if k ~= 0 then
			deleteUserIds[k] = true
		end
	end

	for k,chatMsgData in ipairs(self._clientChatSessionList) do
		deleteUserIds[chatMsgData:getChatObjectId() ] = true
	end

	dump(deleteUserIds)
	local newDeleteUserIds = {}
	for k,v in pairs(deleteUserIds) do
		table.insert(newDeleteUserIds,k)
	end
	if #newDeleteUserIds > 0 then
		self:c2sChatMsgDelete(newDeleteUserIds)
	end

	self:_clearClientChatSession()
end

--清除和单个玩家的聊天消息
function ChatData:clearPrivateChatMsg(chatMsgData)
	local playerId = chatMsgData:getChatObject():getId()--私聊玩家ID
	local chatSession = self:_seekClientChatSessionByPlayerId(playerId)--查询是否是客户端自己创建的聊天会话
	if chatSession then
		--删除伪造的聊天对象
		self:_deleteClientChatSession(chatSession,true)
	end

	local deleteUserIds = {playerId}
	self:c2sChatMsgDelete(deleteUserIds)
end

--设置消息已读
function ChatData:readChatMsgDatas(msgList)
	local ids = {}
	local readMsg = false
    for k,v in ipairs(msgList) do
        if v:getStatus() == ChatConst.MSG_STATUS_UNREAD  then
		   if v:getChannel() == ChatConst.CHANNEL_PRIVATE then
		   		table.insert(ids,v:getId())
				--防止在请求服务器过程中又刷聊天列表，导致滚动位置又切换到了未读消息处
			   	readMsg = true
		   		v:setStatus(ChatConst.MSG_STATUS_READED)
		   else
		   		readMsg = true
		   		v:setStatus(ChatConst.MSG_STATUS_READED)
				--dump(v)
				logWarn("----msg id:"..v:getSender():getId().." read")
		   end
        end
    end
	
	if #ids > 0 then
	  	dump(ids)
		self:c2sChatMsgStatusUpdate(ids)
	end
	if readMsg then
		G_SignalManager:dispatch(SignalConst.EVENT_CHAT_UNREAD_MSG_NUM_CHANGE)
		G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_CHAT)
	end
end

--将系统消息转换成聊天消息
function ChatData:createChatMsgDataBySysMsg(systemMsg)
	local chatMsgData = require("app.data.ChatMsgData").new()
	chatMsgData:setSysMsg(systemMsg)
	chatMsgData:setChannel(ChatConst.CHANNEL_SYSTEM)
	chatMsgData:setStatus(ChatConst.MSG_STATUS_UNREAD)
	return chatMsgData
end

function ChatData:_setIsGetPrivateMsgWithPlayer(playerId,isGet)
	self._privateChatDataIsGetFlag[playerId] = isGet
end

--是否有和玩家的私聊消息
function ChatData:isGetPrivateMsgWithPlayer(playerId)
	return self._privateChatDataIsGetFlag[playerId]
end

function ChatData:_onEventCheckWord( name, content )
    -- body
end

--发送聊天信息
--@ChatPlayerData:私聊玩家数据
function ChatData:c2sChatRequest(channel,content,chatPlayerData,msgType,parameter)
	msgType = msgType or 1--默认文本消息
    local data = {channel = channel , content = content, 
		reciver_id = chatPlayerData and chatPlayerData:getId() or nil,msg_type = msgType,parameter = parameter}
	G_NetworkManager:send(MessageIDConst.ID_C2S_ChatRequest,  data)

	--TODO：连续发送多条消息，缓存会被刷掉
	self._sendMsgDataCache = {channel = channel , content = content, reciver = chatPlayerData}


	--记录下发送消息时间，用来显示CD
	self:onSendMsgSuccess(channel, msgType)
end

--请求和某人的私聊内容
--@userId：私聊的玩家
function ChatData:c2SChatGetMsg(userId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ChatGetMsg, {user_id = userId})
end

--发送私聊消息已读
--@msgIds：已读的私聊消息ID数组
function ChatData:c2sChatMsgStatusUpdate(msgIds)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ChatMsgStatusUpdate, {msg_ids = msgIds})
end

--发送删除聊天消息
--@deleteUserIds：被删除私聊玩家的ID数组
function ChatData:c2sChatMsgDelete(deleteUserIds)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ChatMsgDelete, {delete_user_id = deleteUserIds})
end

--请求私聊对象列表
--@userIds：私聊的玩家
function ChatData:c2sGetMultiUserBaseInfo(userIds)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetMultiUserBaseInfo, {user_ids = userIds})
end

--发送组队消息
function ChatData:sendCreateTeamMsg(channelId,teamId,teamType,minPeople,maxPeople,isInFight)
	local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
    if not LogicCheckHelper.chatMsgSendCheck(channelId, true, nil, ChatConst.MSG_TYPE_EVENT) then
        return false
    end

	--"#name#开组了！#level_min#-#level_max#级~（人数#number#/#people_number#)$c120_【点击进组】$"
	local TextHelper = require("app.utils.TextHelper")
	local PaoMaDeng = require("app.config.paomadeng")
	local id = isInFight and ChatConst.CREATE_TEAM_IN_FIGHT_ROLL_NOTICE_ID or ChatConst.CREATE_TEAM_ROLL_NOTICE_ID 
    local cfg = PaoMaDeng.get(id)
    assert(cfg,"paomadeng not find id "..tostring(id))
	local param = {}
	table.insert(param,{key  = "number",value = tostring(minPeople)})
	table.insert(param,{key  = "people_number",value = tostring(maxPeople)})
	table.insert(param,{key  = "teamId",value = tostring(teamId)})
	table.insert(param,{key  = "teamType",value = tostring(teamType)})
	
	local content = TextHelper.convertKeyValuePairs(cfg.description, param )
	G_UserData:getChat():c2sChatRequest(channelId,content,nil,ChatConst.MSG_TYPE_EVENT,param)
	return true
end

function ChatData:pullData()
	--登陆后服务器会推送各个私聊对象的最后一条私聊消息，这里不用再向服务器请求了
end

--返回下一个自动播放的语音消息
function ChatData:getNextAutoPlayVoiceMsg()
	--先清理已经播放的列表
	local clearPlayedListFunc = function(list)
		for i = #list,1,-1 do
			local v = list[i]
			if v:isVoicePlay() then
				table.remove(list,i)
			end
		end
	end
	
	clearPlayedListFunc(self._guildAutoPlayVoiceList)
	clearPlayedListFunc(self._worldAutoPlayVoiceList)

	local msg = nil
	for k,v in ipairs(self._guildAutoPlayVoiceList) do
		if not v:isVoicePlay() then
			msg = v
			break
		end
	end
	if msg then
		return msg
	end
	for k,v in ipairs(self._worldAutoPlayVoiceList) do
		if not v:isVoicePlay() then
			msg = v
			break
		end
	end
	return msg
end

function ChatData:clearGuildAutoPlayVoiceList()
	logWarn("VoiceManager....... clearGuildAutoPlayVoiceList")
	self._guildAutoPlayVoiceList = {}
end

function ChatData:clearWorldAutoPlayVoiceList()
	logWarn("VoiceManager....... clearWorldAutoPlayVoiceList")
	self._worldAutoPlayVoiceList = {}
end

function ChatData:setPrivateObjectInfo(info)
	if self._privateObjectInfo and #self._privateObjectInfo > 0 then
		self._privateObjectInfo = nil
	end 
	self._privateObjectInfo = info
end

function ChatData:getPrivateObjectTitles(userId)
	if self._privateObjectInfo and #self._privateObjectInfo > 0 then
		for index=1, #self._privateObjectInfo do
			if userId == self._privateObjectInfo[index].user_id then
				local titles = rawget(self._privateObjectInfo[index], "title") or nil
				if titles and #titles > 0 then
					return titles[1]
				end
				return 0
			end	
		end
	end
	return 0
end

return ChatData