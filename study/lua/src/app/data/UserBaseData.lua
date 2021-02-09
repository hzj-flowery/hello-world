local BaseData = require("app.data.BaseData")
local UserBaseData = class("UserBaseData", BaseData)
local DataConst = require("app.const.DataConst")
local schema = {}
schema["id"] 					= {"number", 0}
schema["name"] 					= {"string", ""}
schema["level"] 				= {"number", 0}
schema["exp"]					= {"number", 0}
schema["create_time"] 			= {"number", 0}
schema["officer_level"] 		= {"number", 0}
schema["power"] 				= {"number", 0}
schema["guide_id"]				= {"number", 0}
schema["order_state"]           = {"number", 0} --公测预约
--schema["system_set"] 				= {"table", {}}
schema["server_name"]				= {"string", ""}
schema["change_name_count"]			= {"number", 0}
schema["recharge_total"]            = {"number", 0}
schema["recharge_fake_total"]            = {"number", 0}
schema["today_online_time"]            = {"number", 0}--在线时长
schema["online_time_update_time"]            = {"number", 0}--在线时长更新时间
schema["today_init_level"]			= {"number", 0}	--今天上线时等级
schema["server_open_time"]			= {"number", 0}	--开服时间
schema["avatar_base_id"]			= {"number", 0} --变身卡baseId
schema["avatar_id"]					= {"number", 0} --变身卡Id
schema["on_team_pet_id"]			= {"number", 0} --上阵神兽id
schema["camp"]						= {"number", 0}	--阵营
schema["recharge_today"]			= {"number", 0}	--今日充值数量
schema["noticeToday"]				= {"boolean", false}	--是否提示过防沉迷
schema["vip_qq"]					= {"number", 0}	--vip专属客服功能
schema["is_admit"]					= {"boolean", false}	--高级vip认证
schema["grave_left_sec"]			= {"number", 0}	--先秦皇陵剩余时间
schema["grave_begin_time"]			= {"number", 0}	--先秦皇陵开始时间
schema["grave_assist_sec"]			= {"number", 0} --先秦皇陵协助剩余时间
schema["grave_assist_begin_time"]	= {"number", 0} --先秦皇陵协助开始时间
schema["is_white_list"]	            = {"boolean", false} --是否是白名单
schema["head_frame_id"]				= {"number",0}-- 头像框id
schema["real_server_name"]			= {"string", ""} --服务器真实名称(合服的名字)
schema["is_regression"]             = {"boolean",false} -- 是否是老玩家回归
schema["brawlguilds_role"]			= {"number", 0} --跨服军团战权限:0 - 无 1 - 观战者 2 - 参与者
schema["recharge_jade_bi"]          = {"number", 0} --玉璧总充值
schema["vip_max"]					= {"number", 0} --回归服回归后可领取的元宝（vip经验1：1）
schema["vip_level"]					= {"number", 0} --回归服，之前账号的vip等级

UserBaseData.schema = schema

function UserBaseData:c2sUpOfficerLevel()
	local message = {
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_UpOfficerLevel, message)
end
--
function UserBaseData:ctor(properties)
	UserBaseData.super.ctor(self, properties)

	self._lastCurrencys = {} --上次数据
	self._currencys = {}
	self._recovers = {}
	self._serverRecovers = {}
	self._returnSvr = nil --回归服领奖数据

	self._opCount = {} --操作次数
	self._isLevelUp = false --是否升级过
	self._oldPlayerLevel = 0
	self._isBindedWeChat = false --是否绑定了微信公众号
	self._bindCode = "" --绑定码

	self._recvGetUser = G_NetworkManager:add(MessageIDConst.ID_S2C_GetUser, handler(self, self._recvRoleInfo))
	self._recvGetCurrency = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCurrency, handler(self, self._recvGetCurrency))
	self._recvGetRecover = G_NetworkManager:add(MessageIDConst.ID_S2C_GetRecover, handler(self, self._recvGetRecover))
	self._recvOfficialRankUp = G_NetworkManager:add(MessageIDConst.ID_S2C_UpOfficerLevel, handler(self, self._s2cUpOfficerLevel))

	self._s2cGetGameGiftBagListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGameGiftBag, handler(self, self._s2cGetGameGiftBag))

	self._s2cGetUserBaseInfoListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetUserBaseInfo, handler(self, self._s2cGetUserBaseInfo))

	self._s2cOpBlackListListener = G_NetworkManager:add(MessageIDConst.ID_S2C_OpBlackList, handler(self, self._s2cOpBlackList))

	self._s2cPracticeListener = G_NetworkManager:add(MessageIDConst.ID_S2C_Practice, handler(self, self._s2cPractice))

	self._s2cGetUserDetailInfoListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetUserDetailInfo, handler(self, self._s2cGetUserDetailInfo))

	self._s2cGetOpCountListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetOpCount, handler(self,self._s2cGetOpCount))

	self._s2cGetWeChatBindInfoListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetWeChatBindInfo, handler(self,self._s2cGetWeChatBindInfo))
	self._s2cGetWeChatBindCodeListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetWeChatBindCode, handler(self,self._s2cGetWeChatBindCode))
	
	self._s2cGetTotalOnlineTimeListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetTotalOnlineTime, handler(self, self._s2cGetTotalOnlineTime))
	self._s2cGetReturnSvrListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetReturnSvr, handler(self, self._s2cGetReturnSvr))
	self._s2cCheckInListener = G_NetworkManager:add(MessageIDConst.ID_S2C_CheckIn, handler(self, self._s2cCheckIn))
	self._s2cRecvBonusListener = G_NetworkManager:add(MessageIDConst.ID_S2C_RecvBonus, handler(self, self._s2cRecvBonus))
end

--
function UserBaseData:clear()
	self:setNoticeToday(false)
	self._returnSvr = nil --回归服领奖数据

	self._recvGetUser:remove()
	self._recvGetUser = nil

	self._recvGetCurrency:remove()
	self._recvGetCurrency = nil

	self._recvGetRecover:remove()
	self._recvGetRecover = nil

	self._recvOfficialRankUp:remove()
	self._recvOfficialRankUp = nil

	self._s2cGetGameGiftBagListener:remove()
	self._s2cGetGameGiftBagListener = nil

	self._s2cGetUserBaseInfoListener:remove()
	self._s2cGetUserBaseInfoListener = nil

	self._s2cOpBlackListListener:remove()
	self._s2cOpBlackListListener = nil

	self._s2cPracticeListener:remove()
	self._s2cPracticeListener = nil

	self._s2cGetUserDetailInfoListener:remove()
	self._s2cGetUserDetailInfoListener = nil

	self._s2cGetOpCountListener:remove()
	self._s2cGetOpCountListener =nil

	self._s2cGetWeChatBindInfoListener:remove()
	self._s2cGetWeChatBindInfoListener = nil

	self._s2cGetWeChatBindCodeListener:remove()
	self._s2cGetWeChatBindCodeListener = nil

	self._s2cGetTotalOnlineTimeListener:remove()
	self._s2cGetTotalOnlineTimeListener = nil

	self._s2cGetReturnSvrListener:remove()
	self._s2cGetReturnSvrListener = nil
	
	self._s2cCheckInListener:remove()
	self._s2cCheckInListener = nil
	
	self._s2cRecvBonusListener:remove()
	self._s2cRecvBonusListener = nil
end

--
function UserBaseData:reset()

end


function UserBaseData:_s2cGetOpCount( id, message )

	self._opCount = {}
	local opCountList = rawget(message, "op_count") or {}
	for i, opCount in ipairs(opCountList) do
		if opCount.op_type then
			self._opCount["k"..opCount.op_type] = opCount.op_count or 0
		end
	end

end

function UserBaseData:_s2cGetGameGiftBag(id, message)
	if message.ret ~= 1 then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GIFT_CODE_REWARD, message)
end

--收到玩家基础信息
function UserBaseData:_recvRoleInfo(id, message)
    self:updateUserData(message.user)

    G_SignalManager:dispatch(SignalConst.EVENT_RECV_ROLE_INFO)
end

function UserBaseData:_s2cUpOfficerLevel(id, message)
	if message.ret ~= 1 then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_OFFICIAL_LEVEL_UP, message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_OFFICIAL)
end

--收到玩家基础信息
function UserBaseData:_recvGetCurrency(id, message)
    --self:updateUserData(message.user)
	local currencys = rawget(message,"currencys") or {}
	self:updateCurrencys(currencys)

    G_SignalManager:dispatch(SignalConst.EVENT_RECV_CURRENCYS_INFO)
end

--收到玩家基础信息
function UserBaseData:_recvGetRecover(id, message)
    --self:updateUserData(message.user)
	local recover = rawget(message,"recovers") or {}


	self:updateRecover(recover)

    G_SignalManager:dispatch(SignalConst.EVENT_RECV_RECOVER_INFO)
end

--
function UserBaseData:updateUserData(data)
	-- backup
	self:backupProperties()--备份1级 GM加到55级

	-- new
	self:setProperties(data)

	if self:getLastLevel() > 0 and self:getLastLevel() < self:getLevel() then
	   self._isLevelUp = true
	   self._oldPlayerLevel = self:getLastLevel()
	   -- 推送升级消息
       G_SignalManager:dispatch(SignalConst.EVENT_USER_LEVELUP)
	end
	--self:setGuide_id(7603)

	if self:getLastVip_qq() ~= self:getVip_qq() then
		G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SUPER_VIP)
	end

	if self:getHead_frame_id() ~= 0 then
		local frame = G_UserData:getHeadFrame():getFrameDataWithId(self:getHead_frame_id())
		G_UserData:getHeadFrame():setCurrentFrame(frame)
	end
end



-- 是否升过级
function UserBaseData:isLevelUp()
    return self._isLevelUp, self._oldPlayerLevel
end

function UserBaseData:getOldPlayerLevel()
	if self._oldPlayerLevel == 0 then
		self._oldPlayerLevel = self:getLevel()
	end
	return self._oldPlayerLevel
end
-- 清除升级后的标记
function UserBaseData:clearLevelUpFlag()
    self._isLevelUp = false
end

-- 更新货币资源
function UserBaseData:updateCurrencys(currencys)
	self._lastCurrencys = {}
	self._lastCurrencys = clone(self._currencys)

	for i, value in pairs(currencys) do
		local currValue = {
			id = value.id,
			num = value.num
		}
		self._currencys["_"..value.id] = value.num
	end
end

-- 更新恢复类资源,从服务器获取
function UserBaseData:updateRecover(recover)
	for i, value in pairs(recover) do
		local currValue = {
			id = value.recover_id,
			num = value.recover_num,
			time = value.refresh_time
		}
		logWarn( "updateRecover ..." )
		dump(currValue)
		logWarn( "updateRecover ...." )
		self._recovers["_"..value.recover_id] = currValue
		self._serverRecovers["_"..value.recover_id] = clone(currValue)
	end
end


--仅仅给客户端自己更新recover数据
function UserBaseData:setRecoverData(recoverId, recoverNum)
	local recoverItem = self._recovers["_"..recoverId]
	if recoverItem then
		recoverItem.num = recoverNum
		self._recovers["_"..recoverId] = recoverItem
	end
end


function UserBaseData:getServerRecoverData(recoverId)
	local recoverItem = self._serverRecovers["_"..recoverId]

	return recoverItem
end

function UserBaseData:getRecoverData(recoverId)
	local recoverItem = self._recovers["_"..recoverId]

	return recoverItem
end



function UserBaseData:getLastResValue(resId)
	local name = DataConst.getResName(resId)

	local size = checknumber(self._lastCurrencys["_"..resId])

	logDebug( string.format( name.." UserBaseData:getResValue:  %d", size) )

	return size
end


function UserBaseData:_isRecoverType(resId)
	local ResourceCfg = require("app.config.resource")
	local resData = ResourceCfg.get(resId)
	if resData and resData.is_recover == 1 then
		return true
	end

	return false
end

function UserBaseData:getResValue(resId)
	local name = DataConst.getResName(resId)

	if self:_isRecoverType(resId) then
		return self:_getRecoverValue(resId)
	end

	local size = checknumber(self._currencys["_"..resId])
	logDebug( string.format( name.." UserBaseData:getResValue:  %d", size) )
	return size
end


function UserBaseData:_getRecoverItem(recoverId)
	local recoverItem = self._recovers["_"..recoverId]
	return recoverItem
end

function UserBaseData:_getRecoverValue(recoverId)
	local item = self:_getRecoverItem(recoverId)
	if item then
		return item.num
	end
	return 0
end

--获取玩家头像路径
function UserBaseData:getPlayerBaseId()
	local id = G_UserData:getHero():getRoleBaseId()
	local avatarBaseId = self:getAvatar_base_id()
	if avatarBaseId > 0 then
		id = require("app.utils.UserDataHelper").convertToBaseIdByAvatarBaseId(avatarBaseId, id)
	end
	return id
end

function UserBaseData:getPlayerShowInfo()
	local id = G_UserData:getHero():getRoleBaseId()
	local avatarBaseId = self:getAvatar_base_id()
	local convertId,playerShowInfo  = require("app.utils.UserDataHelper").convertAvatarId( {
		avatar_base_id = avatarBaseId,
		base_id = id,
	})
	return playerShowInfo
end

--主角是否是男人
function UserBaseData:isMale( ... )
	-- body
	local heroCfg = require("app.config.hero")
	local myHeroId = G_UserData:getHero():getRoleBaseId()
	if myHeroId then
		if heroCfg.get(myHeroId).gender == 2 then
			return false
		end
	end
	return true
end
function UserBaseData:getOfficialLevel()
	return self:getOfficer_level()
end

function UserBaseData:getOfficialInfo(level)
	local OfficialRank = require("app.config.official_rank")
	local officialLevel = self:getOfficialLevel()
	if level and level >= 0 then
		officialLevel = level
	end

	local officialInfo = OfficialRank.get(officialLevel)
	-- 这里找不到不需要 assert。。
	-- 外部访问时如果nil，则认为升级到顶部

	return officialInfo,officialLevel
end

--获取全名称，官衔+玩家名称
function UserBaseData:getOfficialName()
	local playerName = self:getName()
	local officialInfo = self:getOfficialInfo()
	local officialLevel = self:getOfficialLevel()
	if officialInfo then
		local returnName = officialInfo.name
		return officialLevel, returnName
	end
	return officialLevel
end

function UserBaseData:setOnlineTime(onlineTime)
	self:setToday_online_time(onlineTime)
	self:setOnline_time_update_time(G_ServerTime:getTime())
end

function UserBaseData:getOnlineTime()
	local time = self:getToday_online_time()
	local updateTime = self:getOnline_time_update_time()
	local elapsed = 0
	if updateTime > 0 then
		elapsed = G_ServerTime:getTime() -  updateTime
	end
	return time + elapsed
end

--是否装备了变身卡
function UserBaseData:isEquipAvatar()
	local avatarId = self:getAvatar_id()
	return avatarId > 0
end

--[[
function UserBaseData:setResValue(resId, value)
	local currencys = self:getCurrencys()
	local name = DataConst.getResName(resId)
	currencys[resId] = value
	self:setCurrencys(currencys)
	logDebug( string.format( name.." UserBaseData:setResValue:  %d", size) )
end
]]

function UserBaseData:c2sGetGameGiftBag(code)
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetGameGiftBag,  {code_id = code})
end

--[[
	// 查看玩家信息
	ID_C2S_GetUserBaseInfo = 31210;
	ID_S2C_GetUserBaseInfo = 31211;
	ID_C2S_OpBlackList = 31212;
	ID_S2C_OpBlackList = 31213;
	ID_S2C_GetBlackList = 31214;
	ID_C2S_Practice = 31215;
	ID_S2C_Practice = 31216;
	ID_C2S_GetUserDetailInfo = 31217;
	ID_S2C_GetUserDetailInfo = 31218;

]]

--获取玩家信息
function UserBaseData:c2sGetUserBaseInfo( userId )
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetUserBaseInfo,  {user_id = userId})
end

--拉黑
function UserBaseData:c2sOpBlackList( opType, userId ) --1 添加黑名单 2 解除黑名单
	G_NetworkManager:send(MessageIDConst.ID_C2S_OpBlackList,  {op_type = opType,user_id = userId})
end

--切磋
function UserBaseData:c2sPractice( userId )
	G_NetworkManager:send(MessageIDConst.ID_C2S_Practice,  {user_id = userId})
end

 --查看玩家阵容
function UserBaseData:c2sGetUserDetailInfo( userId )
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetUserDetailInfo,  {user_id = userId})
end


--收到玩家基础信息
function UserBaseData:_s2cGetUserBaseInfo(id, message)
	if message.ret ~= 1 then
		return
	end

	local simpleUser = {}
	simpleUser.userId = message.user_id
	simpleUser.name = message.name
	simpleUser.baseId = message.base_id
	simpleUser.avatarId = message.avatar_id
	simpleUser.avatarBaseId = message.avatar_base_id
	simpleUser.officeLevel = message.office_level or 0
	simpleUser.level = message.level
	simpleUser.power = message.power
	simpleUser.guildName = rawget(message, "guild_name")
	simpleUser.is_friend = message.is_friend
	simpleUser.head_frame_id = rawget(message,"head_frame_id")
	local covertId,playerInfo = require("app.utils.UserDataHelper").convertAvatarId(message)
	simpleUser.player_info = playerInfo
    G_SignalManager:dispatch(SignalConst.EVENT_GET_USER_BASE_INFO, simpleUser)
end



--拉黑玩家
function UserBaseData:_s2cOpBlackList(id, message)
	if message.ret ~= 1 then
		return
	end
    G_SignalManager:dispatch(SignalConst.EVENT_OP_BLACK_LIST, message)
end

--与玩家切磋
function UserBaseData:_s2cPractice(id, message)
	if message.ret ~= 1 then
		return
	end

    G_SignalManager:dispatch(SignalConst.EVENT_PRACTICE_PLAYER, message)
end

--查看阵容
function UserBaseData:_s2cGetUserDetailInfo(id, message)
	if message.ret ~= 1 then
		return
	end
	local userDetail = rawget(message, "user")
    G_SignalManager:dispatch(SignalConst.EVENT_GET_USER_DETAIL_INFO, userDetail)
end

function UserBaseData:getOpenServerDayNum(resetTime)
	if not resetTime then
		local TimeConst = require("app.const.TimeConst")
		resetTime = TimeConst.RESET_TIME_SECOND
	end
	local openServerTime =self:getServer_open_time()
	local currTime = G_ServerTime:getTime()
	local openZeroTime = G_ServerTime:secondsFromZero(openServerTime,resetTime)
	local currZeroTime = G_ServerTime:secondsFromZero(currTime,resetTime)


	local day = math.ceil( (currZeroTime - openZeroTime) / (3600*24) )
	day = day + 1

	--logWarn("  openServerTime "..(openServerTime))
	--logWarn("  currTime "..(currTime))
	--logWarn("  zeroOffset "..(currZeroTime - openZeroTime))
	--logWarn("  day "..day)

	day = math.max(day,1)
	return day
end

--获取武将回收次数
function UserBaseData:getOpCountReHero(  )
	return self:getOpCount(DataConst.USER_OP_TYPE_RE_HERO)
end
--获取南蛮入侵触发次数
function UserBaseData:getOpCountSiege( ... )
	-- body
	return self:getOpCount(DataConst.USER_OP_TYPE_SIEGE)
end

--获取某个某块使用次数
function UserBaseData:getOpCount( opType )
	-- body

	local obj = self._opCount["k"..opType]

	if obj and obj > 0 then
		return obj
	end
	return 0
end

function UserBaseData:isBindedWeChat()
	return self._isBindedWeChat
end

function UserBaseData:_s2cGetWeChatBindInfo(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local isBind = rawget(message, "is_bind") or 0
	if isBind == 1 then
		self._isBindedWeChat = true
	elseif isBind == 0 then
		self._isBindedWeChat = false
	end
end

function UserBaseData:c2sGetWeChatBindCode()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetWeChatBindCode, {

	})
end

function UserBaseData:_s2cGetWeChatBindCode(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local bindCode = rawget(message, "bind_code") or ""
	self._bindCode = bindCode
	G_SignalManager:dispatch(SignalConst.EVENT_GET_WECHAT_BIND_CODE)
end

function UserBaseData:getBindCode()
	return self._bindCode
end

function UserBaseData:c2sGetTotalOnlineTime()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetTotalOnlineTime, {

	})	
end

--返回是否可以成功游玩
function UserBaseData:checkRealName()
	-- if not REAL_NAME then 
	-- 	return true
	-- end
	
	if G_GameAgent:isRealName() then 
		return true 
	end
	if G_TutorialManager:isDoingStep() or self:getLevel() <= 5 then
		return true
	end 

	local onlineTime = self:getOnlineTime()
	-- 是否开启防沉迷
	local isAvoid = G_ConfigManager:isAvoidHooked()
	-- 是否开启实名
	local isRealName = G_ConfigManager:isRealName()
	-- 防沉迷时间
	local avoidTime = G_ConfigManager:getAvoidOnlineTime()

	if isAvoid then 
		if onlineTime == math.ceil(avoidTime/3) then 
			G_SignalManager:dispatch(SignalConst.EVENT_AVOID_NOTICE, 1)
		elseif onlineTime == math.ceil(avoidTime/3*2) then 
			G_SignalManager:dispatch(SignalConst.EVENT_AVOID_NOTICE, 2)
		end
	end

	if onlineTime < avoidTime then 
		return true
	end

	if isAvoid then 
		G_SignalManager:dispatch(SignalConst.EVENT_AVOID_GAME)
	elseif isRealName then 
		G_SignalManager:dispatch(SignalConst.EVENT_OPEN_REAL_NAME)
	end
	return false
end

function UserBaseData:_s2cGetTotalOnlineTime(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:setOnlineTime(message.total_online_time)
	self:checkRealName()
end

--回归服相关-----------------------------------
--是否能进入回归服
function UserBaseData:isCanEnterReturnServer(serverData)
	local serverId = serverData:getServer()
	local roleList = G_RoleListManager:getList()
	local haveRole = false
	for i, v in ipairs(roleList) do
		if v:getServer_id() == serverId then
			haveRole = true
		end
	end
	if (haveRole == false) and (G_GameAgent:isCanReturnServer() == false) then --没角色，且没有资格
		return false
	end
	return true
end

--获取回归后可领取的元宝和vip经验
function UserBaseData:getReturnAward()
	local vipMax = 0
	local goldMax = 0
	if self._returnSvr then --回归后
		vipMax = self._returnSvr:getVip_max()
		goldMax = self._returnSvr:getGold_max()
	else --回归前用此数据
		vipMax = self:getVip_max()
		goldMax = self:getVip_max()
	end
	return vipMax, goldMax
end

--获取回归服vip等级
function UserBaseData:getReturnVipLevel()
	local vipLevel = 0
	if self._returnSvr then
		vipLevel = self._returnSvr:getVip_level()
	else
		vipLevel = self:getVip_level()
	end
	return vipLevel
end

function UserBaseData:_s2cGetReturnSvr(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	
	local rs = rawget(message, "rs")
	if self._returnSvr == nil then
		self._returnSvr = require("app.data.ReturnSvrData").new()
	end
	self._returnSvr:updateData(rs)
end

function UserBaseData:getReturnSvr()
	return self._returnSvr
end

--确认回归
function UserBaseData:c2sCheckIn()
	G_NetworkManager:send(MessageIDConst.ID_C2S_CheckIn,{

	})
end

function UserBaseData:_s2cCheckIn(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local rs = rawget(message, "rs")
	if self._returnSvr == nil then
		self._returnSvr = require("app.data.ReturnSvrData").new()
	end
	self._returnSvr:updateData(rs)
	
	G_SignalManager:dispatch(SignalConst.EVENT_RETURN_CHECK_IN_SUCCESS)
end

--领回归奖励
function UserBaseData:c2sRecvBonus(id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_RecvBonus,{
		id = id
	})
end

function UserBaseData:_s2cRecvBonus(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	
	local id = rawget(message, "id") or 0
	local awards = rawget(message, "awards") or {}
	local rs = rawget(message, "rs")
	if self._returnSvr == nil then
		self._returnSvr = require("app.data.ReturnSvrData").new()
	end
	self._returnSvr:updateData(rs)
	
	G_SignalManager:dispatch(SignalConst.EVENT_RETURN_RECV_BONUS_SUCCESS, id, awards)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_RETURN_AWARD)
end

return UserBaseData
