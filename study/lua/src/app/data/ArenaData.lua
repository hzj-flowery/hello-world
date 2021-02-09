--竞技场数据
local BaseData = import(".BaseData")
local ArenaData =  class("ArenaData", BaseData)
local DataConst = require("app.const.DataConst")
--local ArenaReward = require("app.cfg.arena_reward")
ArenaData.RANK_BREAK_AWARD = 2 --排名突破奖励
---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------
--消息层
--更新奖励信息
function ArenaData:_s2cSendArenaRankRewardClient(id,message)
	if message.ret ~= 1 then
		return
	end
	
	self._myArenaData["maxRank"] = message.max_rank -- 历史最高排名
	self._myArenaData["arenaCount"] = message.arena_cnt
	local awardList = message.reward_id or {} --奖励列表
	self._myArenaData["rewardId"] = {}
	for i=1,#awardList do
		self._myArenaData["rewardId"]["k"..awardList[i] ] = awardList[i] --已经领取的奖励id
	end

	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ARENA)
end

--挑战后，挑战次数变更
function ArenaData:_s2cChallengeArena(id, message)
	if message.ret ~= 1 then
		return
	end

	local fightNum = message.arena_cnt
	local maxRankReward = rawget( message, "max_rank_reward") or {}
	self._myArenaData["arenaCount"] = fightNum --剩余挑战次数
	self._myArenaData["maxRankReward"] = maxRankReward --最大排名奖励
	--self._myArenaData["maxRank"] = rawget(message, "max_rank") or 0
	G_SignalManager:dispatch(SignalConst.EVENT_ARENA_FIGHT_COUNT, message)
end



function ArenaData:_s2cBuyCommonCount(id, message)
	if message.ret ~= 1 then
		return
	end
	
	local funcId = message.id
	if funcId == DataConst.VIP_FUNC_TYPE_ARENA_TIMES then
		self._myArenaData["arenaCount"] = message.cnt --剩余挑战次数
		self._myArenaData["buyCount"] = message.buy_cnt --购买挑战次数的次数
	end

	G_SignalManager:dispatch(SignalConst.EVENT_ARENA_BUY_COUNT,message)
end

function ArenaData:_s2cGetArenaRankReward(id, message)
	if message.ret ~= 1 then
		return
	end

	local awardId = message.reward_id

	self._myArenaData["rewardId"]["k"..awardId] = awardId

	G_SignalManager:dispatch(SignalConst.EVENT_ARENA_GET_REWARD,message)
end

function ArenaData:_s2cGetArenaInfo(id, message)
	if message.ret ~= 1 then
		return
	end
	self:resetTime()
	self:setArenaData(message)
	
	G_SignalManager:dispatch(SignalConst.EVENT_ARENA_GET_ARENA_INFO, message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ARENA)
end

function ArenaData:c2sGetArenaInfo()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetArenaInfo, {})
end

function ArenaData:c2sChallengeArena(message)
    --判断是否过期
    if self:isExpired() == true then
        self:c2sGetArenaInfo()
        return
    end

	G_NetworkManager:send(MessageIDConst.ID_C2S_ChallengeArena, message)
end

function ArenaData:c2sBuyCommonCount(funcId)
    --判断是否过期
    if self:isExpired() == true then
        self:c2sGetArenaInfo()
        return
    end

	local message = {
		id = funcId,
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_BuyCommonCount, message)
end

function ArenaData:c2sGetArenaTopTenReport()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetArenaTopTenReport, {})
end

function ArenaData:c2sGetArenaTopInfo()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetArenaTopInfo, {})
end

function ArenaData:c2sCommonGetReport(reportType)
	G_NetworkManager:send(MessageIDConst.ID_C2S_CommonGetReport, {report_type = reportType})
end

function ArenaData:_s2cGetArenaTopTenReport(id, message)
	if message.ret ~= 1 then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_ARENA_GET_ARENA_TOP_TEN_INFO, message)
end

function ArenaData:_s2cGetBattleReport(id, message)
	if message.ret ~= 1 then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GET_ARENA_BATTLE_REPORT, message)
end

function ArenaData:_s2cCommonGetReport(id, message)
	if message.ret ~= 1 then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GET_COMMON_REPORT_LIST, message)
end

function ArenaData:_s2cGetArenaTopInfo(id, message)
	if message.ret ~= 1 then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_ARENA_GET_ARENA_RANK_INFO, message)
end
---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------
function ArenaData:ctor()
	ArenaData.super.ctor(self)
	self:_initAwardInfoList()

	self._myArenaData = {}
	self._myArenaData["rewardId"] = {}
	self._myArenaData["rank"] = 0
	self._myArenaData["maxRankReward"] = {}
	self._myArenaData["maxRank"] = 99999

	self._awardListCache = nil
	self._getArenaInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_GetArenaInfo, handler(self, self._s2cGetArenaInfo))
	self._getBuyArenaCount = G_NetworkManager:add(MessageIDConst.ID_S2C_BuyCommonCount, handler(self, self._s2cBuyCommonCount))
	self._getArenaReward = G_NetworkManager:add(MessageIDConst.ID_S2C_GetArenaRankReward, handler(self, self._s2cGetArenaRankReward))
	self._getChallengeArena = G_NetworkManager:add(MessageIDConst.ID_S2C_ChallengeArena, handler(self, self._s2cChallengeArena))
	self._getSendArenaRankRewardClient = G_NetworkManager:add(MessageIDConst.ID_S2C_SendArenaRankRewardClient, handler(self, self._s2cSendArenaRankRewardClient))

	self._getArenaTopTenReport = G_NetworkManager:add(MessageIDConst.ID_S2C_GetArenaTopTenReport, handler(self, self._s2cGetArenaTopTenReport))
	self._getBattleReport   = G_NetworkManager:add(MessageIDConst.ID_S2C_GetBattleReport, handler(self, self._s2cGetBattleReport))

	self._getCommonGetReport = G_NetworkManager:add(MessageIDConst.ID_S2C_CommonGetReport, handler(self, self._s2cCommonGetReport))

	self._getArenaTopInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_GetArenaTopInfo, handler(self, self._s2cGetArenaTopInfo))

end


-- 清除
function ArenaData:clear()
    self._getArenaReward:remove()
	self._getArenaReward = nil

    self._getArenaInfo:remove()
    self._getArenaInfo = nil

	self._getBuyArenaCount:remove()
	self._getBuyArenaCount = nil

	self._getChallengeArena:remove()
	self._getChallengeArena =nil

	self._getSendArenaRankRewardClient:remove()
	self._getSendArenaRankRewardClient = nil

	self._getArenaTopTenReport:remove()
	self._getArenaTopTenReport = nil

	self._getBattleReport:remove()
	self._getBattleReport = nil


	self._getCommonGetReport:remove()
	self._getCommonGetReport = nil

	self._getArenaTopInfo:remove()
	self._getArenaTopInfo = nil

	
end

-- 重置
function ArenaData:reset()

end

--获取最大排名奖励
function ArenaData:getMyMaxRankRewrd()
	local reward =  self._myArenaData["maxRankReward"] or {}
	self._myArenaData["maxRankReward"] = {}
	--有奖励则返回奖励1
	if #reward > 1 then
		return reward[1]
	end
	return nil
end
-------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------

function ArenaData:_initAwardInfoList( ... )

	self._awardInfoList = {} --排行榜突破奖励，领取
	self._awardInfoList2 = {}--排行榜奖励
	local arenaRewardInfo = require("app.config.arena_reward")
	local len = arenaRewardInfo.length()
	for i=1,len do
		local info = arenaRewardInfo.indexOf(i) 
		if info.type == ArenaData.RANK_BREAK_AWARD then --排名突破奖励
			self._awardInfoList[#self._awardInfoList + 1] = info
		else
			self._awardInfoList2[#self._awardInfoList2 + 1] = info
		end
	end

	table.sort(self._awardInfoList,function(a,b)
		if(a.rank_min ~= b.rank_min)then
			return a.rank_min > b.rank_min
		end
	end)

	table.sort(self._awardInfoList2,function(a,b)
		if(a.rank_min ~= b.rank_min)then
			return a.rank_min < b.rank_min
		end
	end)

end


--创建挑战单位
function ArenaData:_createChallengeUnit( value )
	-- body
	local t = {}
	t["uid"] = value.user_id
	t["rank"] = value.rank
	t["name"] = value.name
	local baseId,table = require("app.utils.UserDataHelper").convertAvatarId(value)
	t["baseId"] = baseId
	t["baseTable"] = table
	t["power"] = value.power
	--t["avatarBaseId"] = value.avatar_base_id
	t["officialLevel"] = rawget(value, "officer_level") or 1


	if t["uid"] == G_UserData:getBase():getId() then
		t["baseTable"] = G_UserData:getBase():getPlayerShowInfo()
	end
	return t
end

function ArenaData:getMyArenaData()
	local t = {}
	t["uid"] = G_UserData:getBase():getId()
	t["rank"] = self._myArenaData["rank"]
	t["name"] = G_UserData:getBase():getName()
	t["baseId"] = G_UserData:getBase():getPlayerBaseId()
	t["baseTable"] = G_UserData:getBase():getPlayerShowInfo()
	t["power"] =  G_UserData:getBase():getPower()
	t["maxRank"] = self._myArenaData["maxRank"]
	t["buyCount"] = self._myArenaData["buyCount"]
	t["arenaCount"] = self._myArenaData["arenaCount"]
	t["officialLevel"] = G_UserData:getBase():getOfficialLevel()
	--t["avatar"] = value.avatar
	return t
end

function ArenaData:setArenaData( message )
	self._myArenaData["uid"] = message.user_id
	self._myArenaData["rank"] = message.rank
	
	self._myArenaData["arenaCount"] = message.arena_cnt --剩余挑战次数
	self._myArenaData["maxRank"] = rawget(message, "max_rank") or 0 --最大排名
	self._myArenaData["buyCount"] = message.buy_arena_cnt --购买挑战次数的次数
	self._myArenaData["firstBattle"] = message.first_battle --是否是第一次 1:是第一次 0:不是
	self._myArenaData["challengeList"] = {}
	local list = rawget(message, "to_challenge_list") or {} --对手列表
	for i=1,#list do
		self._myArenaData["challengeList"][i] = self:_createChallengeUnit(list[i])
	end


	table.sort(self._myArenaData.challengeList, function(item1, item2)
		if item1.rank ~= item2.rank then
			return item1.rank < item2.rank
		end
	end)

end

function ArenaData:getArenaData( ... )
	return self._myArenaData
end

function ArenaData:getArenaFirstBattle( ... )
	return self._myArenaData.firstBattle
end
function ArenaData:getArenaRank( ... )
	return self._myArenaData.rank
end

function ArenaData:getArenaMaxRank( ... )
	return self._myArenaData.maxRank
end

function ArenaData:getArenaChallengeList( ... )
	return self._myArenaData.challengeList
end

function ArenaData:getRankAward(rank)
	if rank == nil then return nil end
	local realRank = rank < 1 and 1 or rank
	for i=1,#self._awardInfoList2 do
		local info = self._awardInfoList2[i]
		if self:_isRankReach(info, realRank) == true then
			return info
		end
	end
    return nil 
end

function ArenaData:getNextRankAward( currRank )
	-- body
	if currRank == nil then return nil end
	local index = 0
	local realRank = currRank < 1 and 1 or currRank
	local len = #self._awardInfoList2
	for i=1,len do
		local info = self._awardInfoList2[i]
		if self:_isRankReach(info, realRank) == true then
			index = i
			break
		end
	end

	local info = nil
	local target = index + 1
	if(target <= len)then
		info = self._awardInfoList2[target] 
	else
		info = self._awardInfoList2[index] 
	end

    return info
end


function ArenaData:_isTakenAward(awardId)
	for i, value in pairs(self._myArenaData["rewardId"]) do
		if value == awardId then
			return true
		end
	end
	return false
end

function ArenaData:_isRankReach(awardData,rank)
	local realRank = rank or self:getArenaRank()
	if realRank == 0 then
		return false
	end
	
	local minRank = awardData.rank_min
--	local maxRank = awardData.rank_max
	if realRank <= minRank then
		return true
	end
	return false
end

function ArenaData:getTakenAwardList()

	local awardList = {}
	local function merageAward(awardInfo)
		for i= 1, 3 do
			if awardInfo["award_type_"..i] > 0 then
				local award = {}
				award.type = awardInfo["award_type_"..i]
				award.value = awardInfo["award_value_"..i]
				award.size = awardInfo["award_size_"..i]
				table.insert(awardList, award)
			end
		end
	end

	local arenaRewardInfo = require("app.config.arena_reward")
	for i, value in pairs(self._myArenaData["rewardId"]) do
		local cfgData = arenaRewardInfo.get(value)
		if cfgData then
			merageAward(cfgData)
		end
	end
	local DropHelper = require("app.utils.DropHelper")
	--相同奖励合并
	local retList = DropHelper.merageAwardList(awardList)
	return retList
end

--是否有奖励可领取
function ArenaData:hasAwardReach()
	local awardList = self:getAwardList()
	for i, value in ipairs(awardList) do
		if value.isReach == true and value.isTaken == false then
			return true
		end
	end
	return false
end
function ArenaData:getAwardList()

	local retList = {}
	for key, value in ipairs(self._awardInfoList) do
		 local awardData = {}
		 awardData.cfg = value
		 awardData.isTaken = self:_isTakenAward(value.id)
		 awardData.isReach = self:_isRankReach(value,self:getArenaMaxRank())
		 table.insert( retList, awardData )
	end

	table.sort(retList, function(item1, item2)
		if item1.isTaken ~= item2.isTaken then
			return not item1.isTaken
		end

		if item1.isReach ~= item2.isReach then
			return item1.isReach 
		end
	
		if item1.cfg.id ~= item2.cfg.id then
			return item1.cfg.id > item2.cfg.id
		end
	end)

	self._awardListCache = retList
	return retList
end


return ArenaData