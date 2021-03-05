-- Author: Liangxu
-- Date: 2019-4-12
-- 红包雨数据
local BaseData = import(".BaseData")
local RedPacketRainData = class("RedPacketRainData", BaseData)
local RedPacketRainUnitData = require("app.data.RedPacketRainUnitData")
local SimpleUserData = require("app.data.SimpleUserData")
local RedPacketRainConst = require("app.const.RedPacketRainConst")
local RedPacketRainRankData = require("app.data.RedPacketRainRankData")

local schema = {}
schema["actId"] = {"number", 0}
schema["empty_big_num"] = {"number", 0}
schema["empty_small_num"] = {"number", 0}
schema["rob_big_num"] = {"number", 0}
schema["rob_small_num"] = {"number", 0}
schema["act_end_time"] = {"number", 0} --红包雨飘落结束时间，不是整个活动的结束时间
schema["act_start_time"] = {"number", 0} --红包雨飘落开始时间，不是整个活动的开始时间
RedPacketRainData.schema = schema

function RedPacketRainData:ctor(properties)
	RedPacketRainData.super.ctor(self, properties)

	self._actOpenTime = 0
	self._actEndTime = 0
	self._usrActEndTime = 0
	self._packetInfos = {}
	self._packetList = {}
	self._receivedPacketIds = {} --领取过的红包

	self._recvNewRedPacketStartNotify = G_NetworkManager:add(MessageIDConst.ID_S2C_NewRedPacketStartNotify, handler(self, self._s2cNewRedPacketStartNotify))
	self._recvEnterNewRedPacket = G_NetworkManager:add(MessageIDConst.ID_S2C_EnterNewRedPacket, handler(self, self._s2cEnterNewRedPacket))
	self._recvGetNewRedPacket = G_NetworkManager:add(MessageIDConst.ID_S2C_GetNewRedPacket, handler(self, self._s2cGetNewRedPacket))
	self._recvGetNewRedPacketNotifyMulti = G_NetworkManager:add(MessageIDConst.ID_S2C_GetNewRedPacketNotifyMulti, handler(self, self._s2cGetNewRedPacketNotifyMulti))
	self._recvGetRedPacketRank = G_NetworkManager:add(MessageIDConst.ID_S2C_GetRedPacketRank, handler(self, self._s2cGetRedPacketRank))
end

function RedPacketRainData:clear()
	self._recvNewRedPacketStartNotify:remove()
	self._recvNewRedPacketStartNotify = nil
	self._recvEnterNewRedPacket:remove()
	self._recvEnterNewRedPacket = nil
	self._recvGetNewRedPacket:remove()
	self._recvGetNewRedPacket = nil
	self._recvGetNewRedPacketNotifyMulti:remove()
	self._recvGetNewRedPacketNotifyMulti = nil
	self._recvGetRedPacketRank:remove()
	self._recvGetRedPacketRank = nil
end

function RedPacketRainData:reset()
	self._actOpenTime = 0
	self._actEndTime = 0
	self._usrActEndTime = 0
	self._packetInfos = {}
	self._packetList = {}
	self._receivedPacketIds = {} --领取过的红包
end

function RedPacketRainData:getActOpenTime()
	return self._actOpenTime
end

function RedPacketRainData:getActEndTime()
	return self._actEndTime
end

function RedPacketRainData:getUsrActEndTime()
	return self._usrActEndTime
end

--是否参加过了
function RedPacketRainData:isPlayed()
	return self._usrActEndTime > 0
end

function RedPacketRainData:getPacketList()
	return self._packetList
end

function RedPacketRainData:getUnitDataWithId(id)
	return self._packetInfos[id]
end

function RedPacketRainData:getReceivedPacketData()
	local bigNum = 0
	local smallNum = 0
	local money = 0
	for i, id in ipairs(self._receivedPacketIds) do
		local unitData = self:getUnitDataWithId(id)
		local type = unitData:getRedpacket_type()
		if type == RedPacketRainConst.TYPE_BIG then
			bigNum = bigNum + 1
		elseif type == RedPacketRainConst.TYPE_SMALL then
			smallNum = smallNum + 1
		end
		money = money + unitData:getMoney()
	end

	return {bigNum = bigNum, smallNum = smallNum, money = money}
end

function RedPacketRainData:_s2cNewRedPacketStartNotify(id, message)
	local actId = rawget(message, "actId") or 0
	local actOpenTime = rawget(message, "actOpenTime") or 0
	local actEndTime = rawget(message, "actEndTime") or 0
	local usrActEndTime = rawget(message, "usrActEndTime") or 0

	self:setActId(actId)
	self._actOpenTime = actOpenTime
	self._actEndTime = actEndTime
	self._usrActEndTime = usrActEndTime
	G_SignalManager:dispatch(SignalConst.EVENT_RED_PACKET_RAIN_START_NOTIFY)
end

function RedPacketRainData:c2sEnterNewRedPacket()
	local actId = self:getActId()
	G_NetworkManager:send(MessageIDConst.ID_C2S_EnterNewRedPacket, {
		actId = actId
    })
end

function RedPacketRainData:_s2cEnterNewRedPacket(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	self:setProperties(message)
	local actEndTime = rawget(message, "act_end_time") or 0
	self._usrActEndTime = actEndTime

	local redPacketInfo = rawget(message, "redpacketInfo") or {}
	self._packetList = {}
	self._packetInfos = {}
	self._receivedPacketIds = {}

	for i, info in ipairs(redPacketInfo) do
		local id = rawget(info, "id")
		rawset(info, "id", tostring(id)) --转换为字符串Id
		local unit = RedPacketRainUnitData.new(info)
		table.insert(self._packetList, unit)
		self._packetInfos[unit:getId()] = unit
	end
	
	local emptyBigNum = self:getEmpty_big_num()
	local emptySmallNum = self:getEmpty_small_num()
	local robBigNum = self:getRob_big_num()
	local robSmallNum = self:getRob_small_num()
	for i = 1, emptyBigNum do
		local info = {id = "emptyBig_"..i, redpacket_type = RedPacketRainConst.TYPE_BIG}
		local unit = RedPacketRainUnitData.new(info)
		table.insert(self._packetList, unit)
		self._packetInfos[unit:getId()] = unit
	end
	for i = 1, emptySmallNum do
		local info = {id = "emptySmall_"..i, redpacket_type = RedPacketRainConst.TYPE_SMALL}
		local unit = RedPacketRainUnitData.new(info)
		table.insert(self._packetList, unit)
		self._packetInfos[unit:getId()] = unit
	end
	for i = 1, robBigNum do
		local info = {id = "robBig_"..i, redpacket_type = RedPacketRainConst.TYPE_BIG, rob = true}
		local unit = RedPacketRainUnitData.new(info)
		table.insert(self._packetList, unit)
		self._packetInfos[unit:getId()] = unit
	end
	for i = 1, robSmallNum do
		local info = {id = "robSmall_"..i, redpacket_type = RedPacketRainConst.TYPE_SMALL, rob = true}
		local unit = RedPacketRainUnitData.new(info)
		table.insert(self._packetList, unit)
		self._packetInfos[unit:getId()] = unit
	end

	--打乱数组顺序
    local tmp, index
    for i = 1, #self._packetList-1 do
        index = math.random(i, #self._packetList)
        if i ~= index then
            tmp = self._packetList[index]
            self._packetList[index] = self._packetList[i]
            self._packetList[i] = tmp
        end
    end

    G_SignalManager:dispatch(SignalConst.EVENT_RED_PACKET_RAIN_ENTER_SUCCESS)
end

function RedPacketRainData:c2sGetNewRedPacket(redPacketId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetNewRedPacket, {
		red_bag_id = tonumber(redPacketId)
    })
end

function RedPacketRainData:_s2cGetNewRedPacket(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		if message.ret == 10370 then
			G_SignalManager:dispatch(SignalConst.EVENT_RED_PACKET_RAIN_GET_TIMEOUT)
		end
		return
	end
	local redBagId = rawget(message, "red_bag_id") or 0
	table.insert(self._receivedPacketIds, tostring(redBagId))
	G_SignalManager:dispatch(SignalConst.EVENT_RED_PACKET_RAIN_GET_SUCCESS, tostring(redBagId))
end

function RedPacketRainData:_s2cGetNewRedPacketNotifyMulti(id, message)
	local messages = rawget(message, "messages") or {}
	local records = {}
	for i, message in ipairs(messages) do
		local user = rawget(message, "user")
		local redPacketInfo = rawget(message, "red_packet_info")
		local id = rawget(redPacketInfo, "id")
		rawset(redPacketInfo, "id", tostring(id))

		local simpleUserData = SimpleUserData.new(user)
		local unitPacket = RedPacketRainUnitData.new(redPacketInfo)
		local record = {
			user = simpleUserData,
			packet = unitPacket,
		}
		if simpleUserData:getUser_id() ~= G_UserData:getBase():getId() then --排除掉自己的信息
			table.insert(records, record)
		end
	end
	
	G_SignalManager:dispatch(SignalConst.EVENT_RED_PACKET_RAIN_GET_NOTIFY, records)
end

function RedPacketRainData:c2sGetRedPacketRank()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetRedPacketRank, {
		
    })
end

function RedPacketRainData:_s2cGetRedPacketRank(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	
	local rankLists = rawget(message, "rank_list") or {}
	local userBigNum = rawget(message, "user_big_num") or 0
	local userSmallNum = rawget(message, "user_small_num") or 0
	local userMoney = rawget(message, "user_money") or 0

	local listInfo = {}
	for i, rank in ipairs(rankLists) do
		local rankData = RedPacketRainRankData.new(rank)
		table.insert(listInfo, rankData)
	end
	local myRank = {
		user_id = G_UserData:getBase():getId(),
		money = userMoney,
		office_level = G_UserData:getBase():getOfficer_level(),
		name = G_UserData:getBase():getName(),
		big_red_packet = userBigNum,
		small_red_packet = userSmallNum,
	}
	local myInfo = RedPacketRainRankData.new(myRank)
	
	G_SignalManager:dispatch(SignalConst.EVENT_RED_PACKET_RAIN_GET_RANK, listInfo, myInfo)
end

return RedPacketRainData