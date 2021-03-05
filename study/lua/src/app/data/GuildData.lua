
local BaseData = require("app.data.BaseData")
local GuildData = class("GuildData", BaseData)
local GuildUnitData = require("app.data.GuildUnitData")
local GuildUserData = require("app.data.GuildUserData")
local GuildMemberData = require("app.data.GuildMemberData")
local GuildApplicationData = require("app.data.GuildApplicationData")
local GuildSystemNotifyData = require("app.data.GuildSystemNotifyData")
local GuildHelpData = require("app.data.GuildHelpData")
local GuildHelpBaseData = require("app.data.GuildHelpBaseData")
local GuildConst = require("app.const.GuildConst")
local BuyCountIDConst = require("app.const.BuyCountIDConst")
local GuildListData = require("app.data.GuildListData")
local GuildUIHelper = require("app.scene.view.guild.GuildUIHelper")
local GuildTrainData = require("app.data.GuildTrainData")
local Training = require("app.config.training")
local ParameterIDConst = require("app.const.ParameterIDConst")
local Parameter = require("app.config.parameter")

local schema = {}
schema["lastCanSnatchRedPacketHintFlag"] = {"boolean", false} 
schema["tipInvite"]   = {"boolean", true} --是否提示邀请


GuildData.schema = schema

local GUILD_TEAIN_TYPE = {
	m2m = 1,--自己传给自己
	m2o = 2, -- 传给别人
	o2m = 3 -- 别人传给自己
}



function GuildData:ctor(properties)
	GuildData.super.ctor(self, properties)

	self._guildListData = GuildListData.new()
	self._userGuildInfo = nil --玩家军团信息
	self._myGuild = nil --我的军团信息
	self._guildMemberList = {} --成员列表
	self._myMemberData = nil --我的成员信息
	self._guildApplicationList = {} --申请列表
	self._guildNotifyList = {} --日志列表
	self._myRequestHelp = nil --我的求援信息
	self._guildHelpList = {} --军团援助列表
	self._guildRedPacketList = {}--军团红包列表
	self._guildOnlineGetRedPacketList = {}--军团在线收到的红包列表

	self._guildTrainType = 1 -- 传功方式
	self._guildTrainDataList = {} -- 正在演武的人员
	self._otherGuildTrainList = {} -- 其他演武人员
	self:_initOtherGuildTrainList()

	self._positionNotifyFlag  = false

	self._trainEndState = true -- 演武是否结束

	self._inviteTrainList = {} --邀请的人员列表 

	self._recvGetUserGuild = G_NetworkManager:add(MessageIDConst.ID_S2C_GetUserGuild, handler(self, self._s2cGetUserGuild))--获取个人军团信息
	self._recvGetGuildList = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildList, handler(self, self._s2cGetGuildList))--请求军团列表
	self._recvCreateGuild = G_NetworkManager:add(MessageIDConst.ID_S2C_CreateGuild, handler(self, self._s2cCreateGuild))--创建公会
	self._recvGuildApplication = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildApplication, handler(self, self._s2cGuildApplication))--申请/取消申请军团
	self._recvQueryGuildMall = G_NetworkManager:add(MessageIDConst.ID_S2C_QueryGuildMall, handler(self, self._s2cQueryGuildMall))--进入军团大厅 （军团，成员列表）
	self._recvGuildCheckApplication = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildCheckApplication, handler(self, self._s2cGuildCheckApplication))--审核入会申请
	self._recvGetGuildApplication = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildApplication, handler(self, self._s2cGetGuildApplication))--获取军团申请列表
	self._recvGuildLeave = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildLeave, handler(self, self._s2cGuildLeave))--退会
	self._recvGuildDismiss = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildDismiss, handler(self, self._s2cGuildDismiss))--解散军团
	self._recvSetGuildMessage = G_NetworkManager:add(MessageIDConst.ID_S2C_SetGuildMessage, handler(self, self._s2cSetGuildMessage))--设置公告宣言
	self._recvGetGuildMember = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildMember, handler(self, self._s2cGetGuildMember))--获取军团成员列表
	self._recvGuildKick = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildKick, handler(self, self._s2cGuildKick))--踢玩家
	self._recvLeaderImpeachment = G_NetworkManager:add(MessageIDConst.ID_S2C_LeaderImpeachment, handler(self, self._s2cLeaderImpeachment))--弹劾会长
	self._recvGuildTransfer = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildTransfer, handler(self, self._s2cGuildTransfer))--转让会长
	self._recvGuildPromote = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildPromote, handler(self, self._s2cGuildPromote))--军团升降职
	self._recvGetGuildSystemNotify = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildSystemNotify, handler(self, self._s2cGetGuildSystemNotify))--获取军团Log
	self._recvGetGuildHelp = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildHelp, handler(self, self._s2cGetGuildHelp))--获取军团援助
	self._recvAppGuildHelp = G_NetworkManager:add(MessageIDConst.ID_S2C_AppGuildHelp, handler(self, self._s2cAppGuildHelp))--申请军团援助
	self._recvUseGuildHelp = G_NetworkManager:add(MessageIDConst.ID_S2C_UseGuildHelp, handler(self, self._s2cUseGuildHelp))--领取军团援助
	self._recvSurGuildHelp = G_NetworkManager:add(MessageIDConst.ID_S2C_SurGuildHelp, handler(self, self._s2cSurGuildHelp))--支援军团援助
	self._recvGuildHelpReward = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildHelpReward, handler(self, self._s2cGuildHelpReward))--领取援助军团奖励
	self._signalBuyArenaCount = G_NetworkManager:add(MessageIDConst.ID_S2C_BuyCommonCount, handler(self, self._s2cBuyCommonCount))--购买援助次数

	self._recvGuildChangeState = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildChangeState, handler(self, self._s2cGuildChangeState))--军团职位变更
	
	 
	
	self._recvGetGuildRedBagList = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildRedBagList, handler(self, self._s2cGetGuildRedBagList))
	self._recvOpenGuildRedBag = G_NetworkManager:add(MessageIDConst.ID_S2C_OpenGuildRedBag, handler(self, self._s2cOpenGuildRedBag))	
	self._recvPutGuildRedBag = G_NetworkManager:add(MessageIDConst.ID_S2C_PutGuildRedBag, handler(self, self._s2cPutGuildRedBag))
	self._recvGuildRedBagRespondNew = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildRedBagRespondNew, handler(self, self._s2cGuildRedBagRespondNew))
	self._recvGuildRedBagRespondDel = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildRedBagRespondDel, handler(self, self._s2cGuildRedBagRespondDel))

	self._recvGetGuildTaskReward = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildTaskReward, handler(self, self._s2cGetGuildTaskReward))
	

	self._recvGuildDonate = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildDonate, handler(self, self._s2cGuildDonate))
	self._recvGetGuildDonateReward = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildDonateReward, handler(self, self._s2cGetGuildDonateReward ))
	
	self._recvGetGuildBase = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildBase, handler(self, self._s2cGetGuildBase))--军团信息同步
	self._recvGuildChangeName = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildChangeName, handler(self, self._s2cGuildChangeName))
	self._recvChangeGuildIcon = G_NetworkManager:add(MessageIDConst.ID_S2C_ChangeGuildIcon, handler(self, self._s2cChangeGuildIcon))

	self._recvQueryGuildTrain = G_NetworkManager:add(MessageIDConst.ID_S2C_QueryGuildTrain , handler(self, self._s2cQueryGuildTrain))--发送演武请求返回
	self._recvInviteGuildTrainNotify  = G_NetworkManager:add(MessageIDConst.ID_S2C_InviteGuildTrainNotify, handler(self, self._s2cInviteGuildTrainNotify))--收到演武请求
	self._recvConfirmGuildTrain  = G_NetworkManager:add(MessageIDConst.ID_S2C_ConfirmGuildTrain, handler(self, self._s2cConfirmGuildTrain))--接受演武
	self._recvStartGuildTrainNotify  = G_NetworkManager:add(MessageIDConst.ID_S2C_StartGuildTrainNotify, handler(self, self._s2cStartGuildTrainNotify))--开始演武通知
	self._recvEndGuildTrainNotify = G_NetworkManager:add(MessageIDConst.ID_S2C_EndGuildTrainNotify, handler(self, self._s2cEndGuildTrainNotify))--结束演武通知
	self._recvEndGuildTrain = G_NetworkManager:add(MessageIDConst.ID_S2C_EndGuildTrain, handler(self, self._s2cEndGuildTrain))--强制演武结束返回
	self._recvGuildTrainChange = G_NetworkManager:add(MessageIDConst.ID_S2C_GuildTrainChange, handler(self, self._s2cGuildTrainChange))--演武人员更新

	self._recvInviteGuildTrainReturn = G_NetworkManager:add(MessageIDConst.ID_S2C_InviteGuildTrainReturn, handler(self, self._s2cInviteGuildTrainReturn))

end

function GuildData:clear()
	self._recvGetUserGuild:remove()
	self._recvGetUserGuild = nil
	self._recvGetGuildList:remove()
	self._recvGetGuildList = nil
	self._recvCreateGuild:remove()
	self._recvCreateGuild = nil
	self._recvQueryGuildMall:remove()
	self._recvQueryGuildMall = nil
	self._recvGuildApplication:remove()
	self._recvGuildApplication = nil
	self._recvGuildCheckApplication:remove()
	self._recvGuildCheckApplication = nil
	self._recvGetGuildApplication:remove()
	self._recvGetGuildApplication = nil
	self._recvGuildLeave:remove()
	self._recvGuildLeave = nil
	self._recvSetGuildMessage:remove()
	self._recvSetGuildMessage = nil
	self._recvGetGuildMember:remove()
	self._recvGetGuildMember = nil
	self._recvGuildDismiss:remove()
	self._recvGuildDismiss = nil
	self._recvGuildKick:remove()
	self._recvGuildKick = nil
	self._recvLeaderImpeachment:remove()
	self._recvLeaderImpeachment = nil
	self._recvGuildTransfer:remove()
	self._recvGuildTransfer = nil
	self._recvGuildPromote:remove()
	self._recvGuildPromote = nil
	self._recvGetGuildSystemNotify:remove()
	self._recvGetGuildSystemNotify = nil
	self._recvGetGuildHelp:remove()
	self._recvGetGuildHelp = nil
	self._recvAppGuildHelp:remove()
	self._recvAppGuildHelp = nil
	self._recvUseGuildHelp:remove()
	self._recvUseGuildHelp = nil
	self._recvSurGuildHelp:remove()
	self._recvSurGuildHelp = nil
	self._recvGuildHelpReward:remove()
	self._recvGuildHelpReward = nil

	self._signalBuyArenaCount:remove()
	self._signalBuyArenaCount = nil

	self._recvGuildChangeState:remove()
	self._recvGuildChangeState = nil

	self._recvGetGuildRedBagList:remove()
	self._recvGetGuildRedBagList = nil

	self._recvOpenGuildRedBag:remove()
	self._recvOpenGuildRedBag = nil

	self._recvPutGuildRedBag:remove()
	self._recvPutGuildRedBag = nil

	self._recvGuildRedBagRespondNew:remove()
	self._recvGuildRedBagRespondNew = nil

	self._recvGuildRedBagRespondDel:remove()
	self._recvGuildRedBagRespondDel = nil

	self._recvGetGuildTaskReward:remove()
	self._recvGetGuildTaskReward = nil


	self._recvGuildDonate:remove()
	self._recvGuildDonate = nil

	self._recvGetGuildDonateReward:remove()
	self._recvGetGuildDonateReward = nil

	self._recvGetGuildBase:remove()
	self._recvGetGuildBase = nil

	self._recvGuildChangeName:remove()
	self._recvGuildChangeName = nil

	self._recvChangeGuildIcon:remove()
	self._recvChangeGuildIcon = nil

	self._recvQueryGuildTrain:remove()
	self._recvQueryGuildTrain = nil
	self._recvInviteGuildTrainNotify:remove()
	self._recvInviteGuildTrainNotify = nil
	self._recvConfirmGuildTrain:remove()
	self._recvConfirmGuildTrain = nil
	self._recvStartGuildTrainNotify:remove()
	self._recvStartGuildTrainNotify = nil
	self._recvEndGuildTrainNotify:remove()
	self._recvEndGuildTrainNotify = nil
	self._recvEndGuildTrain:remove()
	self._recvEndGuildTrain = nil
	self._recvGuildTrainChange:remove()
	self._recvGuildTrainChange = nil
	self._recvInviteGuildTrainReturn:remove()
	self._recvInviteGuildTrainReturn = nil
end

function GuildData:reset()
	self._guildListData = GuildListData.new()
	self._userGuildInfo = nil
	self._myGuild = nil
	self._guildMemberList = {}
	self._myMemberData = nil
	self._guildApplicationList = {}
	self._guildNotifyList = {}
	self._myRequestHelp = nil
	self._guildHelpList = {}
	self._trainEndState = false

	self._guildTrainingMemberList = {}
	self._guildTrainingMemberInfo = {}

	self._guildRedPacketList = {}
	self._guildOnlineGetRedPacketList = {}

	self._inviteTrainList = {}
	G_SignalManager:dispatch(SignalConst.EVENT_TRAIN_DATA_CLEAR)

end

function GuildData:c2sQueryGuildTrain ( _user )
	G_NetworkManager:send(MessageIDConst.ID_C2S_QueryGuildTrain, {
	user_id = _user})
	if G_UserData:getBase():getId() ~= _user then 
		self._inviteTrainList[_user] = _user
	end
end

function GuildData:removeInviteMemberWithId( id )
	if self._inviteTrainList[id] ~= nil then 
		self._inviteTrainList[id] = nil
	end
end

function GuildData:getInviteTrainListById( id )
	if self._inviteTrainList[id] ~= nil then 
		return self._inviteTrainList[id]
	end
	return nil
end


function GuildData:_s2cQueryGuildTrain( id,message )
	if message.ret == MessageErrorConst.RET_OK then 
		if rawget(message,"userId") and message.userId ~= G_UserData:getBase():getId() then 
			GuildUIHelper.getS2CQueryGuildTrain()
			if G_UserData:getBase():getLevel() < self:getGuildMemberDataWithId(message.userId):getLevel() then 
				self._guildTrainType = GUILD_TEAIN_TYPE.o2m
			else
				self._guildTrainType = GUILD_TEAIN_TYPE.m2o
			end
		else
			self._guildTrainType = GUILD_TEAIN_TYPE.m2m
		end
		G_SignalManager:dispatch(SignalConst.EVENT_TRAIN_INVITE_SUCCESS, message.userId)
	elseif  message.ret == MessageErrorConst.RET_GUILD_TRAIN_TRAINING or message.ret == MessageErrorConst.RET_GUILD_TRAIN_INTERVAL then 
		self:removeInviteMemberWithId(message.userId)
		G_SignalManager:dispatch(SignalConst.EVENT_TRAIN_INVITE_TIME_OUT)
	end
end


function GuildData:_s2cInviteGuildTrainNotify( id,message )
	-- dump(message,"tongzhikuang",6)
	if G_UserData:getBase():getLevel() < message.level then 
		self._guildTrainType = GUILD_TEAIN_TYPE.o2m
	else
		self._guildTrainType = GUILD_TEAIN_TYPE.m2o
	end
	local userData = GuildTrainData.new(message)
    local currTime = G_ServerTime:getTime()
    userData:setInviteEndTime(currTime + 10)

	userData:startCountDown()

	GuildUIHelper.pushGuildTeamApply(userData)
end

function GuildData:_s2cEndGuildTrainNotify( id,message )
	-- dump(message,"自动结束演武通知框",6)
	self:setTrainEndState(true)
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_TRAIN_AUTO_END,message.totalExp)
end

function GuildData:c2sEndGuildTrain( ... )
	G_NetworkManager:send(MessageIDConst.ID_C2S_EndGuildTrain,{})
end

function GuildData:_s2cEndGuildTrain( id,message )
	-- dump(message,"强制演武结束返回",6)
	self:setTrainEndState(true)
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_TRAIN_FORCE_END)
end

function GuildData:_s2cGuildTrainChange( id,message )
	-- dump(message,"演武人员更新",1)
	if rawget(message,"users") then
		self:_setGuildTrainDataList(message.users)
	else-- 人走完了
		self._guildTrainDataList = {}
	end

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_TRAIN_UPDATE)
end




function GuildData:c2sConfirmGuildTrain ( _user,_accept )
	G_NetworkManager:send(MessageIDConst.ID_C2S_ConfirmGuildTrain, {
	userId = _user,
	accept = _accept
	})
end

function GuildData:getGuildTrainType( ... )
	return self._guildTrainType
end

function GuildData:getGuildTrainTotalExp( level,index )
	local length = Training.length()
	for i = 1,length,1 do
		local cfg = Training.indexOf(i)
		if cfg.role_lv == level then
			if self._guildTrainType == GUILD_TEAIN_TYPE.m2m then 
				return cfg.exp_3
			elseif index == 1 then
				return cfg.exp_1
			elseif index == 2 then
				return cfg.exp_2
			end
		end
	end
end

function GuildData:getGuildPercentExp( level,index )
	local percentExp = 0
	if level ~= nil then 
		local totalExp = self:getGuildTrainTotalExp(level,index)
		local totalTime = tonumber(Parameter.get(ParameterIDConst.TRAIN_LIMIT_TIME).content)
		local expGap = tonumber(Parameter.get(ParameterIDConst.TRAIN_PERCENT_EXP).content)
		local times = math.ceil(totalTime/expGap)
		percentExp = math.floor(totalExp/times)
	end
	return percentExp
end

-- 一秒升级经验
function GuildData:getGuildPercentExpByOneS( level,index )
	local percentExp = 0
	if level ~= nil then 
		local totalExp = self:getGuildTrainTotalExp(level,index)
		local totalTime = tonumber(Parameter.get(ParameterIDConst.TRAIN_LIMIT_TIME).content)
		percentExp = math.floor(totalExp/totalTime)
	end
	return percentExp
end

function GuildData:setTrainEndState( state )
	self._trainEndState = state
end

function GuildData:getTrainEndState( ... )
	return self._trainEndState
end



function GuildData:_s2cConfirmGuildTrain( id,message )
	-- dump(message,"jieshouyaoqing",6)
end

function GuildData:_s2cInviteGuildTrainReturn( id,message )
	self:removeInviteMemberWithId(message.uid)
	if rawget(message,"accept") == false then 
		GuildUIHelper.getConfirmGuildTrain(message.name)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_TRAIN_INVITE_TIME_OUT)
end

function GuildData:_s2cStartGuildTrainNotify( id,message )
	-- dump(message,"startYanwu",1)
	-- self:_initOtherGuildTrainList()
	self:_setGuildTrainDataList(message.users)
	self:_setTrainTime(message)
	self:setTrainEndState(false)

	GuildUIHelper.getS2CStartGuildTrainNotify()
end


function GuildData:_initOtherGuildTrainList( ... )
	self._otherGuildTrainList = {}
	for i=1,8 do
		table.insert(self._otherGuildTrainList,{})
	end
end

function GuildData:_setGuildTrainDataList( userData )
	self._guildTrainDataList = {}
	for k,v in pairs(userData) do
		local temp = {}
		if rawget(v, "user")  and rawget(v, "tar_user")  then
			local firstData = GuildTrainData.new(v.user)
			local secondData = GuildTrainData.new(v.tar_user)
			if firstData:getLevel() >= secondData:getLevel() then
				temp.first = firstData
				temp.second = secondData
			else
				temp.first = secondData
				temp.second = firstData
			end
		elseif rawget(v, "user") == nil and  rawget(v, "tar_user") ~= nil then
			temp.first = GuildTrainData.new(v.tar_user)
			temp.second = nil
		elseif rawget(v, "user") ~= nil and  rawget(v, "tar_user") == nil then
			temp.first = GuildTrainData.new(v.user)
			temp.second = nil
		end
		if next(temp) then
			table.insert(self._guildTrainDataList,temp)
		end
	end
end

-- 获取和我演武的人员信息
function GuildData:getMyGuildTrainTeamInfo(  )
	local myTeamInfo = {}
	for k,v in pairs(self._guildTrainDataList) do
		if (rawget(v, "first") and v.first:getUser_id() == G_UserData:getBase():getId()) or 
			(rawget(v, "second") and v.second:getUser_id() == G_UserData:getBase():getId()) then
			myTeamInfo.first = v.first
			myTeamInfo.second = v.second
		end
	end
	return myTeamInfo
end

-- 获取其他正在演武的人员信息
function GuildData:getOtherGuildTrainTeamInfo( ... )
	local tmpOther = {}
	-- self._otherGuildTrainList = {}
	for k,v in pairs(self._guildTrainDataList) do
		local myId = G_UserData:getBase():getId()
		if not ((rawget(v, "first") and v.first:getUser_id() == myId ) or ( rawget(v, "second") and v.second:getUser_id() == myId)) then
			local temp = {}
			temp.first = v.first
			temp.second = v.second
			table.insert(tmpOther,temp)
			if self:isOtherTrainListHaveTeam(self._otherGuildTrainList,temp) == false then
				for i=1,8 do
					if self:isEmptyTeam(self._otherGuildTrainList[i]) then 
						self._otherGuildTrainList[i] = temp
						break
					end
				end
			end
		end
	end

	for j=1,8 do
		if self:isEmptyTeam(self._otherGuildTrainList[j]) == false then 
			if self:isOtherTrainListHaveTeam(tmpOther,self._otherGuildTrainList[j]) == false then 
				self._otherGuildTrainList[j] = {}
			end
		end
	end
	-- dump(self._otherGuildTrainList,"其他人",6)

	if #tmpOther == 0 then 
		self:_initOtherGuildTrainList()
	end
	return self._otherGuildTrainList
end

-- 判断是不是同一对 
function GuildData:isTheSameTeam( t1,t2 )
	if t1 ~= nil and t2 ~= nil then
		if rawget(t1, "first") and rawget(t2, "first") and rawget(t1, "second") and rawget(t2, "second") then
			if t1.first:getUser_id() == t2.first:getUser_id() and t1.second:getUser_id() == t2.second:getUser_id() then 
				return true
			end
		end

		if rawget(t1, "first") and rawget(t2, "first") and rawget(t1, "second") == nil and rawget(t2, "second") ==nil then
			if t1.first:getUser_id() == t2.first:getUser_id() then 
				return true
			end
		end

		if rawget(t1, "first") == nil and rawget(t2, "first") == nil and rawget(t1, "second") and rawget(t2, "second") then
			if t1.second:getUser_id() == t2.second:getUser_id() then 
				return true
			end
		end
	end
	return false
end

-- 判断一个空的队伍
function GuildData:isEmptyTeam( v )
	if v == nil or (v.first == nil and v.second == nil) then 
		return true
	end
	return false
end

-- 判断列表中是否还有一个队伍
function GuildData:isOtherTrainListHaveTeam( table,v )
	for i=1,#table do
		if self:isTheSameTeam(table[i],v) then 
			return true
		end
	end
	return false
end



function GuildData:_setTrainTime( message )
	self._trainTime = {}
	self._trainTime.startTime = message.starttime
	self._trainTime.endTime = message.endtime
end

-- 获取演武时间
function GuildData:getTrainTime( ... )
	return self._trainTime
end


--获取个人军团信息
function GuildData:c2sGetUserGuild()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetUserGuild, {
	})
end

function GuildData:_s2cGetUserGuild(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:resetTime()
	self._userGuildInfo = nil
	local userGuildInfo = rawget(message, "user_guild")
	if userGuildInfo then
		self._userGuildInfo = GuildUserData.new(userGuildInfo)
		if not self:isInGuild() then
			self:_doKick(G_UserData:getBase():getId())
			
		end
	end
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_ARMY_GROUP)
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_GET_USER_GUILD)
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_CAN_SNATCH_RED_PACKET_NUM_CHANGE,0)
end

function GuildData:_doKick(uid)
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_KICK_NOTICE, uid)
	if uid == G_UserData:getBase():getId() then
		G_SignalManager:dispatch(SignalConst.EVENT_GUILD_CAN_SNATCH_RED_PACKET_NUM_CHANGE,0)
	end
end

function GuildData:getUserGuildInfo()
	return self._userGuildInfo
end

--是否加入了军团
function GuildData:isInGuild()
	if self._userGuildInfo == nil then
		return false
	end
	local guildId = self._userGuildInfo:getGuild_id()
	return guildId ~= 0
end

--请求军团列表
function GuildData:c2sGetGuildList(num)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetGuildList, {
		num = num
	})
end

function GuildData:_s2cGetGuildList(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	if message.num == 1 then
		self._guildListData = GuildListData.new()
	end
	
	if self._guildListData then
		self._guildListData:addNewPage(message)
	end
	
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_GET_LIST)
end

function GuildData:getGuildListData()
	return self._guildListData
end


function GuildData:_createMyGuidData(guild)
	local unitData = GuildUnitData.new(guild)
	unitData:initTaskData(guild)
	self._myGuild = unitData

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_BASE_INFO_UPDATE)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_ARMY_GROUP)
end

--创建军团
function GuildData:c2sCreateGuild(guildName)
	G_NetworkManager:send(MessageIDConst.ID_C2S_CreateGuild, {
		guild_name = guildName,
	})
end

function GuildData:_s2cCreateGuild(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local guild = rawget(message, "guild")
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_CREATE_SUCCESS)
end

--进入军团大厅
function GuildData:c2sQueryGuildMall()
	G_NetworkManager:send(MessageIDConst.ID_C2S_QueryGuildMall, {
	})
end

function GuildData:_s2cQueryGuildMall(id, message)
	dump(message,"军团",6)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local guild = rawget(message, "guild")
	self:_createMyGuidData(guild)


	local members = rawget(message, "members") or {}
	self:updateMemberList(members)



	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_QUERY_MALL)
	
	if self._positionNotifyFlag  then
		self._positionNotifyFlag = false
		G_SignalManager:dispatch(SignalConst.EVENT_GUILD_USER_POSITION_CHANGE)
	end	
end

function GuildData:getMyGuild()
	return self._myGuild
end

function GuildData:getMyGuildLevel()
	if not self:isInGuild() then
		return 0
	end
	local level = 0 
	if self._myGuild then
		level = math.max(level,self._myGuild:getLevel())
	end
	return level
end

function GuildData:getMyGuildExp()
	if not self:isInGuild() then
		return 0
	end
	local exp = 0
	if self._myGuild then
		exp = math.max(exp,self._myGuild:getExp())
	end
	return exp
end

function GuildData:getMyGuildId()
	if not self:isInGuild() then
		return 0
	end
	return self._userGuildInfo:getGuild_id()
end

--申请/取消申请军团
--op 1申请 2取消申请
function GuildData:c2sGuildApplication(guildId, op)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GuildApplication, {
		guild_id = guildId,
		op = op,
	})
end

function GuildData:_s2cGuildApplication(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		if message.ret == MessageErrorConst.RET_GUILD_NOT_FOUND_APPLICATION then
			self:c2sGetGuildApplication()
		end
		return
	end

	local guildId = rawget(message, "guild_id") or 0
	local op = rawget(message, "op") or 0
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_APPLY_SUCCESS, guildId, op)
end

--审核入会申请
function GuildData:c2sGuildCheckApplication(applicationId, op)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GuildCheckApplication, {
		application_id = applicationId,
		op = op,
	})
end

function GuildData:_s2cGuildCheckApplication(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local op = rawget(message, "op") or 0
	local applicationId = rawget(message, "application_id") or 0


	G_UserData:getGuild():deleteApplicationDataWithId(applicationId)
	
	
	
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_CHECK_APPLICATION_SUCCESS, op, applicationId)
end

--获取军团申请列表
function GuildData:c2sGetGuildApplication()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetGuildApplication, {

	})
end

function GuildData:_s2cGetGuildApplication(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	self._guildApplicationList = {}
	local applications = rawget(message, "applications") or {}
	for i, data in ipairs(applications) do
		self:_setGuildApplicationData(data)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_GET_APPLICATION, applications)
end

function GuildData:_setGuildApplicationData(data)
	self._guildApplicationList["k_"..tostring(data.uid)] = nil
	local unitData = GuildApplicationData.new(data)
	self._guildApplicationList["k_"..tostring(data.uid)] = unitData
end

function GuildData:getGuildApplicationListBySort()
	local result = {}
	for k, data in pairs(self._guildApplicationList) do
		table.insert(result, data)
	end
	return result
end

function GuildData:deleteApplicationDataWithId(applicationId)
	if applicationId == nil then
		return
	end
	if applicationId == 0 then
		self._guildApplicationList = {}
	else
		self._guildApplicationList["k_"..tostring(applicationId)] = nil
	end

end


--解散军团
function GuildData:c2sGuildDismiss()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GuildDismiss, {

	})
end

function GuildData:_s2cGuildDismiss(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self._userGuildInfo:setGuild_id(0)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_ARMY_GROUP)
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_DISMISS_SUCCESS)
end

--退会
function GuildData:c2sGuildLeave()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GuildLeave, {

	})
end

function GuildData:_s2cGuildLeave(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_LEAVE_SUCCESS)
end

--修改军团公告\宣言
function GuildData:c2sSetGuildMessage(content, type)
	G_NetworkManager:send(MessageIDConst.ID_C2S_SetGuildMessage, {
		content = content,
		type = type,
	})
end

function GuildData:_s2cSetGuildMessage(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local type = rawget(message, "type") or 0
	local content = rawget(message, "content") or ""
	if type == GuildConst.GUILD_MESSAGE_TYPE_1 then
		G_UserData:getGuild():getMyGuild():setAnnouncement(content)
	elseif type == GuildConst.GUILD_MESSAGE_TYPE_2 then
		G_UserData:getGuild():getMyGuild():setDeclaration(content)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_SET_MESSAGE_SUCCESS, type)
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_BASE_INFO_UPDATE)
	
end

--获取军团成员列表
function GuildData:c2sGetGuildMember()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetGuildMember, {

	})
end

function GuildData:_s2cGetGuildMember(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	
	local members = rawget(message, "members") or {}
	self:updateMemberList(members)

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_GET_MEMBER_LIST)
end

function GuildData:updateMemberList(members)
	self._guildMemberList = {}
	for i, data in ipairs(members) do
		self:_setGuildMemberData(data)
	end

end

function GuildData:updateGuildMemberData(data)
	self:_setGuildMemberData(data)
end

function GuildData:_setGuildMemberData(data)
	self._guildMemberList["k_"..tostring(data.uid)] = nil
	local unitData = GuildMemberData.new(data)
	self._guildMemberList["k_"..tostring(data.uid)] = unitData

	local userId = G_UserData:getBase():getId()
	if userId == data.uid then
		self._myMemberData = unitData
	end
	self._memberListIsDirt = true
end

function GuildData:getGuildMemberList()
	self:_arrangeGuildMemberList()
	return self._guildMemberList
end

function GuildData:_arrangeGuildMemberList()
	if not self._memberListIsDirt then
		return
	end
	self._memberListIsDirt = false
	local result = {}
	for k, unit in pairs(self._guildMemberList) do
		table.insert(result, unit)
	end
	local sortFunc = function(obj1,obj2)
        if obj1:getPower() ~= obj2:getPower() then
            return  obj1:getPower() > obj2:getPower()
        end
        return obj1:getUid() < obj2:getUid()
    end
    table.sort(result,sortFunc)
	for k, unit in ipairs(result) do
		--logWarn(" ddd----------  "..k)
		unit:setRankPower(k)
	end
end

function GuildData:getMyMemberData()
	self:_arrangeGuildMemberList()
	return self._myMemberData
end

function GuildData:getGuildMemberListBySort()
	self:_arrangeGuildMemberList()
	local result = {}

	local function sortFun(a, b)
		local selfA = a:isSelf() and 1 or 0
		local selfB = b:isSelf() and 1 or 0
		if selfA ~= selfB then
			return selfA > selfB
		end

		if a:getPosition() ~= b:getPosition() then
			return a:getPosition() < b:getPosition()
		end
				
		local onlineA = a:isOnline() and 1 or 0
		local onlineB = b:isOnline() and 1 or 0
		if onlineA ~= onlineB then
			return onlineA > onlineB
		end
			
		return a:getOffline() > b:getOffline()
	end

	for k, unit in pairs(self._guildMemberList) do
		table.insert(result, unit)
	end

	table.sort(result, sortFun)
	return result
end

function GuildData:getGuildMemberDataWithId(id)
	if id ~= 0 then 
		self:_arrangeGuildMemberList()
		local unitData = self._guildMemberList["k_"..tostring(id)]
		--assert(unitData, string.format("GuildData:getGuildMemberDataWithId, id = %d", id))
		-- dump("~~~~~~~~~~~",unitData)
		return unitData
	end
	return nil
end


function GuildData:getGuildMemberCount()
	local count = 0
	for k,v in pairs(self._guildMemberList) do
		count = count + 1
	end
	return count
end

--获取长老数量
function GuildData:getElderCount()
	local count = 0
	for k, data in pairs(self._guildMemberList) do
		if data:getPosition() == GuildConst.GUILD_POSITION_3 then
			count = count + 1
		end
	end
	return count
end

--获取副团长数量
function GuildData:getMateCount()
	local count = 0
	for k, data in pairs(self._guildMemberList) do
		if data:getPosition() == GuildConst.GUILD_POSITION_2 then
			count = count + 1
		end
	end
	return count
end

--踢玩家
function GuildData:c2sGuildKick(uid)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GuildKick, {
		uid = uid,
	})
end

function GuildData:_s2cGuildKick(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local uid = rawget(message, "uid") or nil

	self:_doKick(uid)
end

--弹劾会长
function GuildData:c2sLeaderImpeachment()
	G_NetworkManager:send(MessageIDConst.ID_C2S_LeaderImpeachment, {
		
	})
end

function GuildData:_s2cLeaderImpeachment(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_IMPEACHMENT_LEADER_SUCCESS)
end

--转让会长
function GuildData:c2sGuildTransfer(uid)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GuildTransfer, {
		uid = uid,
	})
end

function GuildData:_s2cGuildTransfer(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local uid = rawget(message, "uid") or 0
	

	local data = self:getGuildMemberDataWithId(uid)
	local oldPosition = data:getPosition()
	data:setPosition(GuildConst.GUILD_POSITION_1)

	self._myMemberData:setPosition(oldPosition)

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_TRANSFER_LEADER_SUCCESS, uid)
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_USER_POSITION_CHANGE)
end

--军团升降职
function GuildData:c2sGuildPromote(uid, op)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GuildPromote, {
		uid = uid,
		op = op,
	})
end

function GuildData:_s2cGuildPromote(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local uid = rawget(message, "uid") or 0
	local op = rawget(message, "op") or 0


	local data = self:getGuildMemberDataWithId(uid)
	data:setPosition(op)


	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_PROMOTE_SUCCESS, uid, op)
end

--获取军团Log
function GuildData:c2sGetGuildSystemNotify()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetGuildSystemNotify, {
		
	})
end

function GuildData:_s2cGetGuildSystemNotify(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	self._guildNotifyList = {}
	local notifyDatas = rawget(message, "notify") or {}
	for i, data in ipairs(notifyDatas) do
		self:_setGuildSystemNotifyData(data)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_GET_SYSTEM_NOTIFY)
end

function GuildData:_setGuildSystemNotifyData(data)
	local unitData = GuildSystemNotifyData.new(data)
	table.insert(self._guildNotifyList, unitData)
end

function GuildData:getSystemNotifyData()
	return self._guildNotifyList
end

--获取军团援助
function GuildData:c2sGetGuildHelp()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetGuildHelp, {})
end

function GuildData:_s2cGetGuildHelp(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	
	self._myRequestHelp = GuildHelpData.new()
	self._guildHelpList = {}
	local members = rawget(message, "members") or {}
	for i, data in ipairs(members) do
		self:_setGuildHelpData(data)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_GET_HELP_LIST_SUCCESS)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_ARMY_GROUP)
end

function GuildData:_s2cBuyCommonCount(id, message)
	if message.ret ~= 1 then
		return
	end

	local funcId = message.id
	if funcId ==  BuyCountIDConst.GUILD_HELP then
		local userGuildInfo = G_UserData:getGuild():getUserGuildInfo()
		userGuildInfo:setAsk_help_cnt(message.cnt)   --剩余挑战次数
		userGuildInfo:setAsk_help_buy(message.buy_cnt)--购买挑战次数的次数
	end

	G_SignalManager:dispatch(SignalConst.EVENT_COMMON_COUNT_CHANGE,funcId)
end

function GuildData:_setGuildHelpData(data)
	local member = rawget(data, "member")
	local memberData = GuildMemberData.new(member)

	local uid = memberData:getUid()
	local userId = G_UserData:getBase():getId()
	if uid == userId then
		local unitData = GuildHelpData.new()
		unitData:setMember(memberData)
		local helpBaseTable = {}
		local helpBases = rawget(data, "help_base") or {}
		for i, helpBase in ipairs(helpBases) do
			local helpBaseData = GuildHelpBaseData.new(helpBase)
			local helpNo = helpBaseData:getHelp_no()
			helpBaseTable["k_"..helpNo] = helpBaseData
		end
		unitData:setHelp_base(helpBaseTable)

		self._myRequestHelp = unitData
	else
		local helpBases = rawget(data, "help_base") or {}
		for i, helpBase in ipairs(helpBases) do
			local unitData = GuildHelpData.new()
			unitData:setMember(memberData)
			local helpBaseData = GuildHelpBaseData.new(helpBase)
			unitData:setHelp_base(helpBaseData)
			-- table.insert(self._guildHelpList, unitData)
			local uid = memberData:getUid()
			local helpNo = helpBaseData:getHelp_no()
			if self._guildHelpList[uid] == nil then
				self._guildHelpList[uid] = {}
			end
			if self._guildHelpList[uid][helpNo] == nil then
				self._guildHelpList[uid][helpNo] = unitData
			end
		end
	end
end

function GuildData:getGuildHelpListBySort()
	local function sortFun(a, b)
		local timeA = a:getHelp_base():getTime()
		local timeB = b:getHelp_base():getTime()
		return timeA < timeB
	end
	local result = {}

	for k, member in pairs(self._guildHelpList) do
		for j, unit in pairs(member) do
			table.insert(result, unit)
		end
	end

	table.sort(result, sortFun)
	return result
end

function GuildData:getMyRequestHelp()
	return self._myRequestHelp
end

--根据求援位获取求援信息
function GuildData:getMyRequestHelpBaseDataWithPos(pos)
	local helpBases = self._myRequestHelp:getHelp_base()
	return helpBases["k_"..pos]
end

--申请军团援助
function GuildData:c2sAppGuildHelp(helpNo, helpId)
	    --判断是否过期
    if self:isExpired() == true then
        self:pullData()
        return
    end

	G_NetworkManager:send(MessageIDConst.ID_C2S_AppGuildHelp, {
		helpNo = helpNo,
		helpId = helpId,
	})
end

function GuildData:_s2cAppGuildHelp(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local helpNo = rawget(message, "helpNo")
	local helpId = rawget(message, "helpId")
	local helpBase = rawget(message, "help_base")

	local helpBaseData = GuildHelpBaseData.new(helpBase)
	self._myRequestHelp:getHelp_base()["k_"..helpNo] = helpBaseData

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_APP_HELP_SUCCESS)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_ARMY_GROUP)
end

--领取军团援助
function GuildData:c2sUseGuildHelp(helpNo)
	--判断是否过期
    if self:isExpired() == true then
        self:pullData()
        return
    end

	G_NetworkManager:send(MessageIDConst.ID_C2S_UseGuildHelp, {
		helpNo = helpNo,
	})
end

function GuildData:_s2cUseGuildHelp(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local helpNo = rawget(message, "helpNo")
	local helpBase = rawget(message, "help_base")
	local award = rawget(message, "award") or {}

	local helpBaseData = GuildHelpBaseData.new(helpBase)
	self._myRequestHelp:getHelp_base()["k_"..helpNo] = helpBaseData

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_RECEIVE_HELP_SUCCESS, award)

end

--支援军团援助
function GuildData:c2sSurGuildHelp(uid, helpNo)
	--判断是否过期
    if self:isExpired() == true then
        self:pullData()
        return
    end

	G_NetworkManager:send(MessageIDConst.ID_C2S_SurGuildHelp, {
		uid = uid,
		helpNo = helpNo,
	})
end

function GuildData:_s2cSurGuildHelp(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		if message.ret == MessageErrorConst.RET_GUILD_HELP_LIMIT then
			self:c2sGetGuildHelp()
		end
		return
	end

	local uid = rawget(message, "uid")
	local helpNo = rawget(message, "helpNo")
	local helpBase = rawget(message, "help_base")
	local award = rawget(message, "award") or {}

	local helpBaseData = GuildHelpBaseData.new(helpBase)
	local limitMax = helpBaseData:getLimit_max()
	local alreadyHelp = helpBaseData:getAlready_help()
	if alreadyHelp == limitMax then
		self._guildHelpList[uid][helpNo] = nil
	else
		self._guildHelpList[uid][helpNo]:setHelp_base(helpBaseData)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_SUR_HELP_SUCCESS, award)
end

--领取援助军团奖励
function GuildData:c2sGuildHelpReward()
	--判断是否过期
    if self:isExpired() == true then
        self:pullData()
        return
    end
	
	G_NetworkManager:send(MessageIDConst.ID_C2S_GuildHelpReward, {
		
	})
end

function GuildData:_s2cGuildHelpReward(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local award = rawget(message, "award") or {}

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_RECEIVE_HELP_REWARD_SUCCESS, award)
end

function GuildData:c2sBuyCommonCount()
    --判断是否过期
    if self:isExpired() == true then
        self:pullData()
        return
    end
	G_NetworkManager:send(MessageIDConst.ID_C2S_BuyCommonCount, {id =  BuyCountIDConst.GUILD_HELP })
end

function GuildData:_s2cGuildChangeState(id, message)
	local stateId = message.state_id
	if stateId == 1 then--1 职位改变 
		G_UserData:getGuild():c2sQueryGuildMall()
		self._positionNotifyFlag = true
	end
end

function GuildData:pullData()
	logWarn(" -------------- pullData")
	self:c2sGetGuildBase()
	self:c2sGetGuildHelp()
	self:c2sGetUserGuild()
end

--已解锁军团但尚未加入军团的玩家,如玩家已解锁军团功能但尚未加入军团，则在军团按钮上添加红点进行提示。
function GuildData:hasAddGuildRedPoint()
	return not self:isInGuild()
end

--有免费援助次数。
function GuildData:hasGiveHelpRedPoint()
	if not self:isInGuild() then
		return false
	end
	local count = G_UserData:getGuild():getUserGuildInfo():getAsk_help_cnt()
	local buyCount = G_UserData:getGuild():getUserGuildInfo():getAsk_help_buy()
	local showFreeCount = count > 0 and buyCount <= 0
	return showFreeCount
end


--所有军团成员,军团求援中，有可领取的军团求援全完成奖励时
function GuildData:hasHelpRewardRedPoint()
	if not self:isInGuild() then
		return false
	end
	local ParameterIDConst = require("app.const.ParameterIDConst")
	local count = G_UserData:getGuild():getUserGuildInfo():getFinish_help_cnt()
	local totalCount = tonumber(require("app.config.parameter").get(ParameterIDConst.GUILD_RECOURSE_TIMES_ID).content)
	local isReceived = G_UserData:getGuild():getUserGuildInfo():getGet_help_reward() ~= 0 --是否已经领取
	if not isReceived and count >= totalCount then
		return true
	end
	return false
end

--军团能否祭祀红点
function GuildData:hasCanContributionRedPoint()
	if not self:isInGuild() then
		return false
	end
	local donate = self:getUserGuildInfo():getDonate()
	if donate == 0 then
		return true
	end
	return false
end


--返回我的红包列表
function GuildData:getMyRedPacketList()
	local list = {}
	for k,v in pairs(self._guildRedPacketList) do
		if v:getUser_id() ==  G_UserData:getBase():getId() then
			table.insert( list,v )
		end
	end


	local orderValues = {
		[GuildConst.GUILD_RED_PACKET_NO_SEND] = 1,
		[GuildConst.GUILD_RED_PACKET_NO_RECEIVE] = 2,
		[GuildConst.GUILD_RED_PACKET_RECEIVED] = 3,
	 }

	local sortFunc = function(obj1,obj2)
		if obj1:getRed_bag_state() ~= obj2:getRed_bag_state() then
			return  orderValues[obj1:getRed_bag_state()] < orderValues[obj2:getRed_bag_state()]
		end
		if obj1:getConfig().index ~= obj2:getConfig().index then
			return obj1:getConfig().index < obj2:getConfig().index 
		end
		return obj1:getId() < obj2:getId()
	end
	table.sort( list, sortFunc )
	return list

end

--返回整个军团的红包数据
function GuildData:getAllGuildRedPacketList()
	local list = {}
	for k,v in pairs(self._guildRedPacketList) do
		table.insert( list,v )
	end
	--排序
	--已发放，还没抢的		
	--我的未发放的		
	--其他人未发放的		
	--我已经抢过，或者已经被抢完的红包	

	local orderValues = {
		[GuildConst.GUILD_RED_PACKET_NO_SEND] = 2,
		[GuildConst.GUILD_RED_PACKET_NO_RECEIVE] = 1,
		[GuildConst.GUILD_RED_PACKET_RECEIVED] = 3,
	 }

	local sortFunc = function(obj1,obj2)
		if obj1:getRed_bag_state() ~= obj2:getRed_bag_state() then
			return  orderValues[obj1:getRed_bag_state()] < orderValues[obj2:getRed_bag_state()]
		end
		
		if obj1:getRed_bag_state() == GuildConst.GUILD_RED_PACKET_NO_SEND  then
			if  obj1:getUser_id() ==  G_UserData:getBase():getId() and  
				obj2:getUser_id() ==  G_UserData:getBase():getId()  then	
					
			elseif  obj1:getUser_id() ==  G_UserData:getBase():getId() or  
				obj2:getUser_id() ==  G_UserData:getBase():getId()  then	
					return obj1:getUser_id() ==  G_UserData:getBase():getId()
			end
		end
		if obj1:getConfig().index ~= obj2:getConfig().index then
			return obj1:getConfig().index < obj2:getConfig().index 
		end
		return obj1:getId() < obj2:getId()
	end
	table.sort( list, sortFunc )
	return list
end

--返回当前可抢的红包
function GuildData:getCurrSnatchRedPacket()
--	logWarn("-----------------xxs")
	local inGuild = self:isInGuild()
	local list = {}
	for k,v in pairs(self._guildOnlineGetRedPacketList) do
		local redPacketData = self._guildRedPacketList[k]
	--	logWarn("-----------------xxe"..tostring(redPacketData:getRed_bag_id()))
		if redPacketData and  redPacketData:getRed_bag_state() ==  GuildConst.GUILD_RED_PACKET_NO_RECEIVE then
			local type = redPacketData:getConfig().type 
			if inGuild or GuildConst.RED_PACKET_TYPE_OF_NOT_GUILDS[type] then
				table.insert( list,redPacketData)
			end
		end
	end
	local sortFunc = function(obj1,obj2)
		return obj1:getId() > obj2:getId()
	end
	table.sort( list, sortFunc )
	return list[1]
end

--红包是否能发送
function GuildData:isCanGiveRedPacket(redPacketId)
	if  not self:isInGuild() then 
		return false
	end
	local redPacketUnitData = self:_getRedPacketUnitData(redPacketId)
	if redPacketUnitData and redPacketUnitData:getRed_bag_state() == GuildConst.GUILD_RED_PACKET_NO_SEND
		 and redPacketUnitData:isSelfRedPacket() then
		return true
	end
	return false
end

function GuildData:_getRedPacketUnitData(id)
	local redPacketData = self._guildRedPacketList[id]
	return redPacketData
end

function GuildData:_createRedPacketInfoData(v)
	local GuildRedPacketInfoData = require("app.data.GuildRedPacketInfoData")
	-- logWarn("GuildData:_createRedPacketInfoData")
	-- dump(v)
	local data = GuildRedPacketInfoData.new(v)
	self._guildRedPacketList[v.id] = data
	return data
end

function GuildData:_deleteRedPacketInfoData(id)
	local redPacketData = self._guildRedPacketList[id]
	if redPacketData then
		redPacketData:setRed_bag_state(GuildConst.GUILD_RED_PACKET_INVALID )
	end
	self._guildRedPacketList[id] = nil
	return redPacketData
end

--登陆后请求红包数据
function GuildData:c2sGetGuildRedBagList(id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetGuildRedBagList, {
	})
end

function GuildData:_s2cGetGuildRedBagList(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	--[[
	required uint32 ret = 1;
	repeated GuildRedBagInfo red_bag_list = 2;
	]]

	self._guildRedPacketList = {}
	local redBagList = rawget(message,"red_bag_list") or {}
	for k,v in ipairs(redBagList) do
		self:_createRedPacketInfoData(v)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_RED_PACKET_GET_LIST,self._guildRedPacketList)
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_CAN_SNATCH_RED_PACKET_NUM_CHANGE,0)
end

--红包唯一id
function GuildData:c2sOpenGuildRedBag(id)
	local UserDataHelper = require("app.utils.UserDataHelper")
	local num = UserDataHelper.getCanSnatchRedPacketNum()
	if num <=  1 then
		--self._lastCanSnatchRedPacketHintFlag = true
		self:setLastCanSnatchRedPacketHintFlag(true)
	end
	G_NetworkManager:send(MessageIDConst.ID_C2S_OpenGuildRedBag, {
		id = id
	})
end

function GuildData:c2sSeeGuildRedBag(id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_OpenGuildRedBag, {
		id = id
	})
end


function GuildData:_s2cOpenGuildRedBag(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--[[
	required uint32 ret = 1;
	required uint64 id = 2;//红包唯一id
	repeated OpenRedBagUser red_bag_list = 3;
	]]
	local myRedBagUser = nil
	local openRedBagUserList = {}
	local redPacketData = self._guildRedPacketList[message.id]

	local redBagList = rawget(message,"red_bag_list") or {}
	for k,v in ipairs(redBagList) do
		local GuildOpenRedBagUserData = require("app.data.GuildOpenRedBagUserData")
		local data = GuildOpenRedBagUserData.new(v)
		table.insert( openRedBagUserList, data )

		if data:getUser_id() == G_UserData:getBase():getId() then
			myRedBagUser = data
		end
	end

	local snatchSuccess = false
	if myRedBagUser then
		--说明自己抢到过此红包,更改红包状态
		if redPacketData then	
			if redPacketData:getRed_bag_state() == GuildConst.GUILD_RED_PACKET_NO_RECEIVE then
				snatchSuccess = true
			end
			redPacketData:setRed_bag_state(GuildConst.GUILD_RED_PACKET_RECEIVED)  
		end
	else
		--不管有没有抢到红包都显示已领取
		if redPacketData then redPacketData:setRed_bag_state(GuildConst.GUILD_RED_PACKET_RECEIVED) end
	end


	if redPacketData then
		G_SignalManager:dispatch(SignalConst.EVENT_GUILD_RED_PACKET_OPEN_NOTICE,redPacketData,openRedBagUserList,snatchSuccess)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_CAN_SNATCH_RED_PACKET_NUM_CHANGE,0)
end	


--红包唯一id
function GuildData:c2sPutGuildRedBag(id,multiple)
	G_NetworkManager:send(MessageIDConst.ID_C2S_PutGuildRedBag, {
		id = id,
		multiple = multiple or 1,
	})
end



function GuildData:_s2cPutGuildRedBag(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--[[
	required uint32 ret = 1;
	required uint64 id = 2;
	]]
end

--红包发送通知
function GuildData:_s2cGuildRedBagRespondNew(id, message)
	--[[
		required GuildRedBagInfo new_bag = 1;
	]]

	if not G_UserData:isFlush() then
		return
	end


	--变更红包数据
	local redPacketData = self:_createRedPacketInfoData(message.new_bag)
	self._guildOnlineGetRedPacketList[redPacketData:getId()] = true

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_RED_PACKET_SEND,redPacketData)

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_CAN_SNATCH_RED_PACKET_NUM_CHANGE,0)
end

--红包过期通知（指的已发的红包）
function GuildData:_s2cGuildRedBagRespondDel(id, message)
	--[[
		required uint64 id = 1;
	]]

	if not G_UserData:isFlush() then
		return
	end


	local redPacketData = self:_deleteRedPacketInfoData(message.id)
	--redPacketData 可能为nil
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_RED_PACKET_DELETE,redPacketData)


	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_CAN_SNATCH_RED_PACKET_NUM_CHANGE,0)
end



function GuildData:c2sGetGuildTaskReward(box_id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetGuildTaskReward, {
		box_id = box_id
	})
end


function GuildData:_s2cGetGuildTaskReward(id, message)
	--[[
	required uint32 ret = 1;
	optional uint32 box_id =2;
	repeated Award rewards = 3; //奖励
]]
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	
	if rawget(message,"box_id") then
		local userGuildInfo = G_UserData:getGuild():getUserGuildInfo()
		userGuildInfo:setBoxReceived(message.box_id)
	end
	

	local rewards = rawget(message,"rewards") or {}
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_BOX_REWARD,rewards)
end


function GuildData:c2sGuildDonate(id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GuildDonate, {
		id = id
	})
end


function GuildData:_s2cGuildDonate(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--[[ 服务器同步了
	if self._userGuildInfo then
		self._userGuildInfo:addContributionCount(1)
	end
]]

	local rewards = rawget(message,"award") or {}
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_CONTRIBUTION,rewards)
end

function GuildData:c2sGetGuildDonateReward(id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetGuildDonateReward, {
		id = id
	})
end

function GuildData:_s2cGetGuildDonateReward(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	--[[ 服务器同步了
	if self._userGuildInfo then
		self._userGuildInfo:setContributionBoxReceived(message.id)
	end
	]]
	local rewards = rawget(message,"award") or {}
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_CONTRIBUTION_BOX_REWARD,rewards)
end


function GuildData:c2sGetGuildBase()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetGuildBase, {})
end

function GuildData:_s2cGetGuildBase(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--[[
	required uint32 ret = 1;
	optional Guild guild = 2;//公会信息
	optional GuildMember self_member = 3;
	]]
	local myMember = rawget(message, "self_member")

	if myMember and self._guildMemberList["k_"..tostring(myMember.uid)] == nil then
		self:_setGuildMemberData(myMember)
	end
	
	local guild = rawget(message, "guild")
	if guild then
		self:_createMyGuidData(guild)
	end
end

function GuildData:c2sGuildChangeName(name)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GuildChangeName, {name = name})
end


function GuildData:_s2cGuildChangeName(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_NAME_CHANGE)
end


function GuildData:c2sChangeGuildIcon(iconId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ChangeGuildIcon, {icon_id = iconId})
end

function GuildData:_s2cChangeGuildIcon(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_FLAG_CHANGE)
end

function GuildData:_isDeputyAbovePosition( ... )
    -- body
    local userInfo = self:getMyMemberData()
    if not userInfo then
        return false
    end
    local selfPosition = userInfo:getPosition()
    return selfPosition <= GuildConst.GUILD_POSITION_2
end


return GuildData