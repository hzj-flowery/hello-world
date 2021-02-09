-- Author: nieming
-- Date:2017-12-25 17:27:09
-- Describle：

local BaseData = require("app.data.BaseData")
local FriendData = class("FriendData", BaseData)
local FriendConst = require("app.const.FriendConst")
local FriendUnitData = require("app.data.FriendUnitData")
local DataConst = require("app.const.DataConst")

local schema = {}
schema["suggestRefreshTime"] = {"number", 0}  --临时保存推荐好友数据
schema["suggestTempListData"] = {"table"} --临时保存推荐好友数据
--schema
FriendData.schema = schema

function FriendData:ctor(properties)
	FriendData.super.ctor(self, properties)
	self._blackList = {}  --黑名单  只保存userId 其他数据不保存
	self._friendList = {} --好友关系
	self._datas = nil
	self._isNeedRecord = nil

	self._signalRecvFriendRespond = G_NetworkManager:add(MessageIDConst.ID_S2C_FriendRespond, handler(self, self._s2cFriendRespond))

	self._signalRecvAddFriend = G_NetworkManager:add(MessageIDConst.ID_S2C_AddFriend, handler(self, self._s2cAddFriend))

	self._signalRecvGetFriendPresent = G_NetworkManager:add(MessageIDConst.ID_S2C_GetFriendPresent, handler(self, self._s2cGetFriendPresent))

	self._signalRecvDelFriend = G_NetworkManager:add(MessageIDConst.ID_S2C_DelFriend, handler(self, self._s2cDelFriend))

	self._signalRecvRecommandFriend = G_NetworkManager:add(MessageIDConst.ID_S2C_RecommandFriend, handler(self, self._s2cRecommandFriend))

	self._signalRecvFriendPresent = G_NetworkManager:add(MessageIDConst.ID_S2C_FriendPresent, handler(self, self._s2cFriendPresent))

	self._signalRecvConfirmAddFriend = G_NetworkManager:add(MessageIDConst.ID_S2C_ConfirmAddFriend, handler(self, self._s2cConfirmAddFriend))

	self._signalRecvGetFriendList = G_NetworkManager:add(MessageIDConst.ID_S2C_GetFriendList, handler(self, self._s2cGetFriendList))
	--监听精力变化
	self._signalRecvRecoverInfo = G_SignalManager:add(SignalConst.EVENT_RECV_RECOVER_INFO, handler(self, self._eventRecvRecoverInfo))
	-- --凌晨4点刷新数据
	self._signalCleanData = G_SignalManager:add(SignalConst.EVENT_CLEAN_DATA_CLOCK, handler(self, self._eventCleanData))


end

function FriendData:clear()
	self._signalRecvFriendRespond:remove()
	self._signalRecvFriendRespond = nil

	self._signalRecvAddFriend:remove()
	self._signalRecvAddFriend = nil

	self._signalRecvGetFriendPresent:remove()
	self._signalRecvGetFriendPresent = nil

	self._signalRecvDelFriend:remove()
	self._signalRecvDelFriend = nil

	self._signalRecvRecommandFriend:remove()
	self._signalRecvRecommandFriend = nil

	self._signalRecvFriendPresent:remove()
	self._signalRecvFriendPresent = nil

	self._signalRecvConfirmAddFriend:remove()
	self._signalRecvConfirmAddFriend = nil

	self._signalRecvGetFriendList:remove()
	self._signalRecvGetFriendList = nil


	self._signalRecvRecoverInfo:remove()
	self._signalRecvRecoverInfo = nil
	--
	self._signalCleanData:remove()
	self._signalCleanData = nil

end

function FriendData:reset()
	self._blackList = {}  --黑名单  只保存userId 其他数据不保存
	self._friendList = {} --好友关系
	self._datas = nil
	self._isNeedRecord = nil
end

function FriendData:requestFriendData(isForce)
	self._isNeedRecord = true
	if self._datas then
		if isForce then
			self:c2sGetFriendList()
		end
		return
	end
	self:c2sGetFriendList()
end

--好友列表
function FriendData:getFriendsData()
	if self._datas then
		local friendList = self._datas.friendList
		self:sortFriendData(friendList, FriendConst.FRIEND_LIST)
		return friendList
	end
	return {}
end
--申请列表
function FriendData:getApplyData()
	if self._datas then
		return self._datas.applyList
	end
	return {}
end
-- 可以赠送精力列表
function FriendData:getEnergyData()
	if self._datas then
		local energyLists = {}
		for _, v in pairs(self._datas.friendList) do
			if v:isCanGetPresent() then
				table.insert(energyLists, v)
			end
		end
		self:sortFriendData(energyLists, FriendConst.FRIEND_ENERGY)
		return energyLists
	end
	return {}
end

function FriendData:getBlackData()
	if self._datas then
		return self._datas.blackList
	end
	return {}
end
--
function FriendData:getPresentNum()
	if self._datas then
		return self._datas.getPresentNum
	end
	return 0
end
-- 退出界面时调用清除数据 -- 主要是不想保存每次都会更新的数据
function FriendData:cleanDatas()
	self._datas = nil
	self._isNeedRecord = nil
end
-- 保证 在好友界面储存界面数据  不在就删除界面数据
--记录数据 -当进入界面的时候才记录数据  退出界面清除数据
function FriendData:_recordDatas(datas)
	if self._isNeedRecord then
		self._datas = datas
	end
end
--拒绝好友申请
function FriendData:_refuseApply(uid)
	if uid == nil or self._datas == nil or self._datas.applyList == nil then return end

	if uid == 0 then
		self._datas.applyList = {}
	else
		for k, v in pairs(self._datas.applyList) do
			if v:getId() == uid then
				table.remove(self._datas.applyList, k)
				break
			end
		end
	end
end
--更新 赠送好友精力
function FriendData:_updateFriendPresent(ids)
	if ids then
		local friendList = self:getFriendsData()
		for _, id in pairs(ids) do
			for k, v in pairs(friendList) do
				if v:getId() == id then
					v:setCanGivePresent(false)
					break
				end
			end
		end
	end
end

function FriendData:_updateDeleteFriend(uid)
	if uid then
		local friendList = self:getFriendsData()
		for k, v in pairs(friendList) do
			if v:getId() == uid then
				table.remove(friendList, k)
				break
			end
		end
	end
end
--更新删除列表
function FriendData:_updateDeleteBlack(uid)
	if uid then
		local blackList = self:getBlackData()
		for k, v in pairs(blackList) do
			if v:getId() == uid then
				table.remove(blackList, k)
				break
			end
		end
	end
end
--领取玩家精力
function FriendData:_updateGetPresent(ids)
	if ids then
		local getNum = 0
		local friendList = self:getFriendsData()
		for _, id in pairs(ids) do
			for k, v in pairs(friendList) do
				if v:getId() == id then
					v:setCanGetPresent(false)
					getNum = getNum + 1
					break
				end
			end
		end
		if self._datas then
			self._datas.getPresentNum = self._datas.getPresentNum + getNum
		end
		return getNum
	end
	return 0
end
--更新添加黑名单数据
function FriendData:_updateAddBlack(uid)
	if uid then
		local friendList = self:getFriendsData()
		local blackFriend = nil
		for k, v in pairs(friendList) do
			if v:getId() == uid then
				table.remove(friendList, k)
				blackFriend = v
				break
			end
		end
		if blackFriend then
			if self._datas and self._datas.blackList then
				table.insert(self._datas.blackList, blackFriend)
				self:sortFriendData(self._datas.blackList)
			end
		end
	end
end

function FriendData:_eventRecvRecoverInfo()
	--精力发生变化
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_FRIEND)
end

function FriendData:_eventCleanData()
	if self._datas then
		for _, v in pairs(self._datas.friendList) do
			v:setCanGetPresent(false)
			v:setCanGivePresent(true)
		end
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GET_FRIEND_LIST_SUCCESS)
end


function FriendData:hasApplyRedPoint()
	return G_UserData:getRedPoint():isHasFriendApplyRedPoint()

end

function FriendData:hasGetEnergyRedPoint()
	local redPoint = false
	local UserCheck = require("app.utils.logic.UserCheck")
	local isFull = UserCheck.isResReachMaxLimit(DataConst.RES_SPIRIT)
	if not isFull then
		redPoint = G_UserData:getRedPoint():isHasFriendGetEnergyRedPoint()
	end
	return redPoint
end


--判断是否在黑名单中
function FriendData:isUserIdInBlackList(userID)
	return self._blackList[userID]
end

--判断是否在好友名单里面
function FriendData:isUserIdInFriendList(userID)
	return self._friendList[userID]
end


-- Describle：好友界面变化通知
function FriendData:_s2cFriendRespond(id, message)
	self:c2sGetFriendList()
	G_SignalManager:dispatch(SignalConst.EVENT_FRIEND_RESPOND_SUCCESS)
end
-- Describle：添加好友
-- Param:
--	name  添加玩家的昵称
--	friend_type  好友或者黑名单
function FriendData:c2sAddFriend( name, friend_type)
	G_NetworkManager:send(MessageIDConst.ID_C2S_AddFriend, {
		name = name,
		friend_type = friend_type,
	})
end



-- Describle：
function FriendData:_s2cAddFriend(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local uid = rawget(message, "uid")
	local friend_type = rawget(message, "friend_type")
	if uid and friend_type and friend_type == FriendConst.FRIEND_ADD_BLACK_TYPE then
		self._blackList[uid] = true
		self._friendList[uid] = nil
		self:_updateAddBlack(uid)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_ADD_FRIEND_SUCCESS, message)
end
-- Describle：好友列表
function FriendData:c2sGetFriendList()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetFriendList, {
	})
end

--排序
function FriendData:sortFriendData(friendDatas, type)

	local sortGiveFunc = function(a, b)
		local aPresent = a:isCanGivePresent()
		local bPresent = b:isCanGivePresent()
		if aPresent == bPresent then
			local aGuildName = a:getGuild_name()
			local bGuildName = b:getGuild_name()
			local myGuildName = ""
			local myGuild= G_UserData:getGuild():getMyGuild()
			if myGuild then
				myGuildName = myGuild:getName()
			end
			local isASameGuild = false
			local isBSameGuidd = false
			if myGuildName ~= "" then
				isASameGuild = (aGuildName == myGuildName)
				isBSameGuidd = (bGuildName == myGuildName)
			end
			--同工会
			if isASameGuild and not isBSameGuidd then
				return true
			elseif isBSameGuidd and not isASameGuild then
				return false
			else
				local aOnline = a:getOnline()
				local bOnline = b:getOnline()
				if aOnline == 0 and bOnline ~= 0 then
					return true
				elseif aOnline ~= 0 and bOnline == 0 then
					return false
				else
					local aLevel = a:getLevel()
					local bLevel = b:getLevel()
					if aLevel == bLevel then
						local aPower = a:getPower()
						local bPower = b:getPower()
						if aPower == bPower then
							return a:getId() < b:getId()
						else
							return aPower > bPower
						end
					else
						return aLevel > bLevel
					end
				end
			end
		else
			if aPresent then
				return true
			else
				return false
			end
		end

	end
	local sortGetFunc = function(a, b)
		local aPresent = a:isCanGetPresent()
		local bPresent = b:isCanGetPresent()
		if aPresent == bPresent then
			local aGuildName = a:getGuild_name()
			local bGuildName = b:getGuild_name()
			local myGuildName = ""
			local myGuild= G_UserData:getGuild():getMyGuild()
			if myGuild then
				myGuildName = myGuild:getName()
			end
			local isASameGuild = false
			local isBSameGuidd = false
			if myGuildName ~= "" then
				isASameGuild = (aGuildName == myGuildName)
				isBSameGuidd = (bGuildName == myGuildName)
			end
			--同工会
			if isASameGuild and not isBSameGuidd then
				return true
			elseif isBSameGuidd and not isASameGuild then
				return false
			else
				local aOnline = a:getOnline()
				local bOnline = b:getOnline()
				if aOnline == 0 and bOnline ~= 0 then
					return true
				elseif aOnline ~= 0 and bOnline == 0 then
					return false
				else
					local aLevel = a:getLevel()
					local bLevel = b:getLevel()
					if aLevel == bLevel then
						local aPower = a:getPower()
						local bPower = b:getPower()
						if aPower == bPower then
							return a:getId() < b:getId()
						else
							return aPower > bPower
						end
					else
						return aLevel > bLevel
					end
				end
			end
		else
			if aPresent then
				return true
			else
				return false
			end
		end

	end
	local sortNormalFunc = function(a, b)
		local aGuildName = a:getGuild_name()
		local bGuildName = b:getGuild_name()
		local myGuildName = ""
		local myGuild= G_UserData:getGuild():getMyGuild()
		if myGuild then
			myGuildName = myGuild:getName()
		end
		local isASameGuild = false
		local isBSameGuidd = false
		if myGuildName ~= "" then
			isASameGuild = (aGuildName == myGuildName)
			isBSameGuidd = (bGuildName == myGuildName)
		end
		--同工会
		if isASameGuild and not isBSameGuidd then
			return true
		elseif isBSameGuidd and not isASameGuild then
			return false
		else
			local aOnline = a:getOnline()
			local bOnline = b:getOnline()
			if aOnline == 0 and bOnline ~= 0 then
				return true
			elseif aOnline ~= 0 and bOnline == 0 then
				return false
			else
				local aLevel = a:getLevel()
				local bLevel = b:getLevel()
				if aLevel == bLevel then
					local aPower = a:getPower()
					local bPower = b:getPower()
					if aPower == bPower then
						return a:getId() < b:getId()
					else
						return aPower > bPower
					end
				else
					return aLevel > bLevel
				end
			end
		end
	end
	if type == FriendConst.FRIEND_LIST then
		table.sort(friendDatas, sortGiveFunc)
	elseif type == FriendConst.FRIEND_ENERGY then
		table.sort(friendDatas, sortGetFunc)
	else
		table.sort(friendDatas, sortNormalFunc)
	end
end

-- Describle：
function FriendData:_s2cGetFriendList(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	
	--check data
	local datas = {}
	datas.friendList = {}
	local friend = rawget(message, "friend")
	self._friendList = {}
	if friend then
		--更新可以获取精力数目
		for _, v in pairs(friend) do
			local friendData = FriendUnitData.new()
			friendData:updateData(v)
			table.insert(datas.friendList, friendData)
			self._friendList[v.id] = true
		end
	end

	datas.blackList = {}
	local blacklist = rawget(message, "blacklist")
	self._blackList = {} --重置黑名单
	if blacklist then
		for _, v in pairs(blacklist) do
			local friendData = FriendUnitData.new()
			friendData:updateData(v)
			self._blackList[v.id] = true  --
			table.insert(datas.blackList, friendData)
		end
		self:sortFriendData(datas.blackList)
	end

	local friend_req = rawget(message, "friend_req")
	datas.applyList = {}
	if friend_req then
		for _, v in pairs(friend_req) do
			local friendData = FriendUnitData.new()
			friendData:updateData(v)
			table.insert(datas.applyList, friendData)
		end
		--更新好友请求数
		self:sortFriendData(datas.applyList)
	end

	local get_present_num = rawget(message, "get_present_num")
	datas.getPresentNum = 0
	if get_present_num then
		datas.getPresentNum = get_present_num
	end
	self:_recordDatas(datas)
	G_SignalManager:dispatch(SignalConst.EVENT_GET_FRIEND_LIST_SUCCESS, datas)
end
-- Describle：领取好友禮物
-- Param:
--	id   好友ID  0 表示一键领取 > 0 领取某个玩家
function FriendData:c2sGetFriendPresent( id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetFriendPresent, {
		id = id,
	})
end


-- Describle：
function FriendData:_s2cGetFriendPresent(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local ids = rawget(message, "uid")
	if ids then
		local getPresentNum = self:_updateGetPresent(ids)
		G_SignalManager:dispatch(SignalConst.EVENT_GET_FRIEND_PRESENT_SUCCESS, getPresentNum)
	end
end
-- Describle：刪除好友
-- Param:
--	id  好友UID
--	friend_type  好友类型 1 好友 2 黑名单
function FriendData:c2sDelFriend( id, friend_type)
	G_NetworkManager:send(MessageIDConst.ID_C2S_DelFriend, {
		id = id,
		friend_type = friend_type,
	})
end

-- Describle：
function FriendData:_s2cDelFriend(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local uid = rawget(message, "id")
	local friend_type = rawget(message, "friend_type")
	if uid and friend_type then
		if friend_type == FriendConst.FRIEND_DEL_BLACK_TYPE then
			self._blackList[uid] = nil
			self:_updateDeleteBlack(uid)
		elseif friend_type == FriendConst.FRIEND_DEL_FRIEND_TYPE then
			self._friendList[uid] = nil
			self:_updateDeleteFriend(uid)
		end
	end
	G_SignalManager:dispatch(SignalConst.EVENT_DEL_FRIEND_SUCCESS, message)
end
-- Describle：推荐好友
-- Param:

function FriendData:c2sRecommandFriend()
	G_NetworkManager:send(MessageIDConst.ID_C2S_RecommandFriend, {

	})
end
-- Describle：
function FriendData:_s2cRecommandFriend(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local friends = rawget(message, "friends")
	local datas = {}
	if friends then
		for _, v in pairs(friends) do
			local friendData = FriendUnitData.new()
			friendData:updateData(v)
			table.insert(datas, friendData)
		end
		self:sortFriendData(datas)
	end

	self:setSuggestTempListData(datas)
	local curTime = G_ServerTime:getTime()
	self:setSuggestRefreshTime(curTime)
	--过期之后 清空当前推荐列表

	local Parameter = require("app.config.parameter")
	local config = Parameter.get(141)
	assert(config ~= nil, "can not find param 141 value")
	local suggestInterval = tonumber(config.content) or 10
	G_ServiceManager:registerOneAlarmClock("FRIEND_SUGGEST_TEMP_LIST", curTime + suggestInterval + 1, function()
		self:setSuggestTempListData(nil)
	end)
	G_SignalManager:dispatch(SignalConst.EVENT_RECOMMAND_FRIEND_SUCCESS, datas)
end
-- Describle：赠送好友礼物
-- Param:
--	id  好友ID
function FriendData:c2sFriendPresent( id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_FriendPresent, {
		id = id,
	})
end

-- Describle：
function FriendData:_s2cFriendPresent(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local ids = rawget(message, "id")
	if ids then
		self:_updateFriendPresent(ids)
		G_SignalManager:dispatch(SignalConst.EVENT_FRIEND_PRESENT_SUCCESS)
	end
end
-- Describle：接受或者拒绝好友请求
-- Param:
--	id  好友ID
--	accept  是否接受好友 true 同意  false 拒绝
function FriendData:c2sConfirmAddFriend( id, accept)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ConfirmAddFriend, {
		id = id,
		accept = accept,
	})
end


-- Describle：
function FriendData:_s2cConfirmAddFriend(id, message)
	--对方好友已满  后端删除掉了 好友申请 需要从新刷数据
	if message.ret == 8346 then
		self:c2sGetFriendList()
		return
	end

	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--加入好友列表
	local uid = rawget(message, "id")
	local accept = rawget(message, "accept")
	if uid ~= nil then
		if accept then
			self._friendList[uid] = true
			self:c2sGetFriendList()
		else
			self:_refuseApply(uid)
		end
	end
	G_SignalManager:dispatch(SignalConst.EVENT_CONFIRM_ADD_FRIEND_SUCCESS, message)
end

return FriendData
