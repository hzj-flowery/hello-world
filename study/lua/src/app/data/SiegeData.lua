local BaseData = require("app.data.BaseData")
local SiegeData = class("SiegeData", BaseData)
local RebelDmgReward = require("app.config.rebel_dmg_reward")
local FunctionConst = require("app.const.FunctionConst")
local schema = {}
schema["total_hurt"] 			        = {"number", 0}
schema["hurtRewardIds"] 			    = {"table", {}}
schema["countRewardIds"]                = {"table", {}}
schema["userLevel"]                     = {"number", 0}
schema["userRank"]                      = {"number", 0}
schema["userGuildRank"]                 = {"number", 0}
schema["siegeEnemys"]                   = {"table", {}}
schema["hasEnemy"]                      = {"boolean", false}
SiegeData.schema = schema

SiegeData.REWARD_TYPE_DAMAGE = 1
SiegeData.REWARD_TYPE_COUNT = 2

function SiegeData:ctor(properties)
    SiegeData.super.ctor(self, properties)
    self._listenerSiegeData = G_NetworkManager:add(MessageIDConst.ID_S2C_GetRebelArmy, handler(self, self._s2cGetRebelArmy))
    self._listenerShare = G_NetworkManager:add(MessageIDConst.ID_S2C_RebArmyPublic, handler(self, self._s2cRebArmyPublic))
    self._listenerBoxReward = G_NetworkManager:add(MessageIDConst.ID_S2C_RebArmyKillReward, handler(self, self._s2cRebArmyKillReward))
    self._listenerBattle = G_NetworkManager:add(MessageIDConst.ID_S2C_RebelArmyBattle, handler(self, self._s2cRebelArmyBattle))
    self._listenerHurtReward = G_NetworkManager:add(MessageIDConst.ID_S2C_RebArmyHurtReward, handler(self, self._s2cRebArmyHurtReward))
    -- 一键分享
    self._listenerAllShare = G_NetworkManager:add(MessageIDConst.ID_S2C_RebArmyPublicMulti, handler(self, self._s2cRebArmyPublicMulti))
    -- 一键领取
    self._listenerAllTake = G_NetworkManager:add(MessageIDConst.ID_S2C_RebArmyKillRewardMulti, handler(self, self._s2cRebArmyKillRewardMulti))

	self._isClean = false
end

function SiegeData:clear()
    self._listenerSiegeData:remove()
    self._listenerSiegeData = nil
    self._listenerShare:remove()
    self._listenerShare = nil
    self._listenerBoxReward:remove()
    self._listenerBoxReward = nil
    self._listenerHurtReward:remove()
    self._listenerHurtReward = nil
    self._listenerBattle:remove()
    self._listenerBattle = nil
    self._listenerAllShare:remove()
    self._listenerAllShare = nil
    self._listenerAllTake:remove()
    self._listenerAllTake = nil
    
end

function SiegeData:reset()
	self._isClean = false
end

--刷新南蛮数据 isForce true 强制清除之前的数据
function SiegeData:refreshRebelArmy(isForce)
	self:c2sGetRebelArmy()
	self._isClean = isForce
end

function SiegeData:_sortEnemys(enemyList)
	local sortedList = {}   --整理后数组
	local guildList = {}    --军团共享的数组
	local myId = G_UserData:getBase():getId()
	for i, v in pairs(enemyList) do
		if v:getUid() == myId then
			table.insert(sortedList, v)
		else
			table.insert(guildList, v)
		end
	end
	local RebelBase = require("app.config.rebel_base")

	local function sortFunc(a, b)
		local aConfigData = RebelBase.get(a:getId())
		local bConfigData = RebelBase.get(b:getId())
		if aConfigData.color == bConfigData.color then
			local aEndTime = a:getEnd_time()
			local bEndTime = b:getEnd_time()
			return aEndTime < bEndTime
		else
			return aConfigData.color > bConfigData.color
		end
	end

	table.sort(sortedList, sortFunc)
	table.sort(guildList, sortFunc)

	for i = 1, #guildList do
		sortedList[#sortedList + 1] = guildList[i]
	end
	return sortedList
end

function SiegeData:_updateSiegeEnemys(message)
	--清除南蛮数据
	local oldEnemys = self:getSiegeEnemys()

	if self._isClean then
		oldEnemys = {}
		self._isClean = false
	end

	local function makeKey(enemy)
		return string.format("%s_%s", enemy:getUid(), enemy:getId())
	end

	if rawget(message, "army_info") then
		local sieges = {}
		local RebelBase = require("app.config.rebel_base")
		for i, v in pairs(message.army_info) do
			local siegeBaseData = require("app.data.SiegeBaseData").new(v)
			local key = makeKey(siegeBaseData)
			sieges[key] = siegeBaseData
		end

		for k, v in pairs(oldEnemys) do
			local key = makeKey(v)
			local newData = sieges[key]
			if newData then
				oldEnemys[k] = newData
			end
			sieges[key] = nil
		end

		local newEnemys = {}
		for k, v in pairs(sieges) do
			table.insert(newEnemys, v)
		end

		newEnemys = self:_sortEnemys(newEnemys)
		for k ,v in ipairs(newEnemys)do
			table.insert(oldEnemys, v)
		end
		self:setSiegeEnemys(oldEnemys)
		self:setHasEnemy(true)
	else
		for k, v in pairs(oldEnemys) do
			v:setNotExist(true)
		end
		self:setSiegeEnemys(oldEnemys)
		self:setHasEnemy(false)
	end
end

function SiegeData:c2sGetRebelArmy()
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetRebelArmy, {})
end

function SiegeData:_s2cGetRebelArmy(id, message)
    local ret = message.ret
    if ret == 1 then
        self:resetTime()
        self:setTotal_hurt(message.army_user.total_hurt)
        self:setUserLevel(message.army_user.user_level)
        self:setUserRank(message.army_user.self_rank)
        self:setUserGuildRank(message.army_user.self_guild_rank)

        self:setHurtRewardIds({})
        if rawget(message.army_user, "hurt_reward") then
            local ids = {}
            for i, v in pairs(message.army_user.hurt_reward) do
                local id = v
                table.insert(ids, id)
            end
            self:setHurtRewardIds(ids)
        end

        self:setCountRewardIds({})
        if rawget(message.army_user, "cnt_reward") then
            local ids = {}
            for i, v in pairs(message.army_user.cnt_reward) do
                local id = v
                table.insert(ids, id)
            end
            self:setCountRewardIds(ids)
        end
		self:_updateSiegeEnemys(message)

        G_SignalManager:dispatch(SignalConst.EVENT_REBEL_ARMY)
    end
end

function SiegeData:getSiegeEnemyData(finderId, bossId)
    local enemyList = self:getSiegeEnemys()
    for i, v in pairs(enemyList) do
        if v:getUid() == finderId and v:getId() == bossId then
            return v
        end
    end
    return nil
end

function SiegeData:updateEnemyData(data)
    local siegeData = self:getSiegeEnemyData(data.uid, data.id)
    siegeData:updateData(data)
end

function SiegeData:updateData(data)
end

function SiegeData:getRewardCount()
    local ids = self:getHurtRewardIds()
    return #ids
end

function SiegeData:isHurtRewardGet(index)
    local rewards = self:getHurtRewardIds()
    for i, v in pairs(rewards) do
        if v == index then
            return true
        end
    end
    return false
end

function SiegeData:isCountRewardGet(index)
    local countRewards = self:getCountRewardIds()
    for i, v in pairs(countRewards) do
        if v == index then
            return true
        end
    end
    return false
end

function SiegeData:getMyEnemyById(id)
    local enemys = self:getSiegeEnemys()
    for i, v in pairs(enemys) do
        if v:getId() == id and v:getUid() == G_UserData:getBase():getId() then
            return v
        end
    end
end

--获得siegedata
function SiegeData:getDataById(id)
    local enemys = self:getSiegeEnemys()
    for i, v in pairs(enemys) do
        if v:getId() == id then
            return v
        end
    end
end

--分享叛军
function SiegeData:c2sRebArmyPublic(id)
    G_NetworkManager:send(MessageIDConst.ID_C2S_RebArmyPublic, {
        boss_id = id,
    })
end

--接收分享消息
function SiegeData:_s2cRebArmyPublic(id, message)
    if message.ret ~= 1 then
        --这边错误号需要处理一下，主要是长时间停在该界面，后面的叛军已经走了
        self:refreshRebelArmy()
        return
    end
    local siegeData = self:getDataById(message.boss_id)
    siegeData:setPublic(true)
    G_SignalManager:dispatch(SignalConst.EVENT_SIEGE_SHARE)
end

function SiegeData:c2sRebArmyPublicMulti( ... )
    G_NetworkManager:send(MessageIDConst.ID_C2S_RebArmyPublicMulti, {})
end

function SiegeData:_s2cRebArmyPublicMulti( id,message )
    if message.ret ~= 1 then
        --这边错误号需要处理一下，主要是长时间停在该界面，后面的叛军已经走了
        self:refreshRebelArmy()
        return
    end
    if rawget(message,"boss_id") then 
        for k,v in pairs(message.boss_id) do
            local siegeData = self:getDataById(v)
            siegeData:setPublic(true)            
        end
    end 
    G_SignalManager:dispatch(SignalConst.EVENT_SIEGE_SHARE)
end

-- 判断是否有可以分享的叛军
function SiegeData:isThereArmyCanShare( ... )
    local enemyList = G_UserData:getSiegeData():getSiegeEnemys()
    for k,v in pairs(enemyList) do
        local siegeBaseData = self:getSiegeEnemyData(v:getUid(), v:getId())
        if not siegeBaseData:isPublic() and not siegeBaseData:isNotExist() and siegeBaseData:getKiller_id() == 0 then
            return true
        end
    end 
    return false 
end

--领取叛军宝箱
function SiegeData:c2sRebArmyKillReward(finderId, armyId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_RebArmyKillReward, {
        uid = finderId,
        boss_id = armyId,
    })
end

--接收叛军领取宝箱
function SiegeData:_s2cRebArmyKillReward(id, message)
	if message.ret ~= 1 then
		return
	end
	local rewards = {}
	if rawget(message, "reward") then
		for _, v in pairs(message.reward) do
			local reward =
			{
				type = v.type,
				value = v.value,
				size = v.size,
			}
			table.insert(rewards, reward)
		end
    end
    if rawget(message, "boss_id") and rawget(message, "user_id") then
        local siegeBaseData = self:getSiegeEnemyData(message.user_id, message.boss_id)
        siegeBaseData:setBoxEmpty(true)
    end
    G_SignalManager:dispatch(SignalConst.EVENT_SIEGE_BOX_REWARD, rewards)
end

-- c2s 一键领取
function SiegeData:c2sRebArmyKillRewardMulti( ... )
    local finderIds = {}
    local enemyList = G_UserData:getSiegeData():getSiegeEnemys()
    for k,v in pairs(enemyList) do
        local siegeBaseData = self:getSiegeEnemyData(v:getUid(), v:getId())
        if not siegeBaseData:isNotExist() and siegeBaseData:getKiller_id() ~= 0 and not siegeBaseData:isBoxEmpty()then
            local finderId = siegeBaseData:getUid()
            table.insert(finderIds,finderId)
        end
    end
    if #finderIds ~= 0 then 
        G_NetworkManager:send(MessageIDConst.ID_C2S_RebArmyKillRewardMulti,{uids=finderIds})
    end
end

-- s2c 一键领取
function SiegeData:_s2cRebArmyKillRewardMulti( id,message )
    if message.ret ~= 1 then
        return
    end
    local rewards = {}
    if rawget(message, "reward") then
        for _, v in pairs(message.reward) do
            local reward =
            {
                type = v.type,
                value = v.value,
                size = v.size,
            }
            table.insert(rewards, reward)
        end
    end

    if rawget(message,"boss_id") then 
        local enemyList = self:getSiegeEnemys()
        for k, v in pairs(enemyList) do
            for i=1,#message.boss_id do
                if  v:getId() == message.boss_id[i] then
                    v:setBoxEmpty(true)
                end
            end
        end
    end 
    G_SignalManager:dispatch(SignalConst.EVENT_SIEGE_BOX_REWARD, rewards)
end

--叛军战斗
function SiegeData:c2sRebelArmyBattle(finderId, bossId, type)
    G_NetworkManager:send(MessageIDConst.ID_C2S_RebelArmyBattle, {
        uid = finderId,
        boss_id = bossId,
        battle_type = type,
    })
end

--接收叛军战斗
function SiegeData:_s2cRebelArmyBattle(id, message)
	if message.ret ~= 1 then
		return
    end
    if rawget(message, "army") then
        self:updateEnemyData(message.army)
    end
    self:setTotal_hurt(message.total_hurt)
    self:setUserRank(message.user_end_rank)
    self:setUserGuildRank(message.guild_end_rank)
    G_SignalManager:dispatch(SignalConst.EVENT_SIEGE_BATTLE, message)
end

--发送领奖
function SiegeData:c2sRebArmyHurtReward(rewardId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_RebArmyHurtReward, {
        reward_id = rewardId,
    })
end

--接收伤害奖励
function SiegeData:_s2cRebArmyHurtReward(id, message)
	if message.ret ~= 1 then
		return
	end
	local rewards = {}
	for _, v in pairs(message.reward) do
		local reward =
		{
			type = v.type,
			value = v.value,
			size = v.size,
		}
		table.insert(rewards, reward)
	end
    G_SignalManager:dispatch(SignalConst.EVENT_SIEGE_HURT_REWARD, rewards)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_SIEGE)
end

function SiegeData:hasRedPoint()
    local value1 = self:canGetRewards()
    local value2 = not self:isTakedAllAwards()
    return value1 or value2
    -- local army = self:getSiegeEnemys()
end

-- 奖励领完 或者 有怪在场
function SiegeData:isTakedAllAwards( ... )
    local enemyList = self:getSiegeEnemys()
    for i, v in pairs(enemyList) do
        local siegeBaseData = self:getSiegeEnemyData(v:getUid(), v:getId())
        if not siegeBaseData:isBoxEmpty() then
            return false
        end
    end
    return true
end

-- 有未领奖励 
--有未领的奖励返回true 没有返回false
function SiegeData:haveNotTakedAward( ... )
    local enemyList = self:getSiegeEnemys()
    for i, v in pairs(enemyList) do
        local siegeBaseData = self:getSiegeEnemyData(v:getUid(), v:getId())
        if not siegeBaseData:isNotExist() and siegeBaseData:getKiller_id() ~= 0 and not siegeBaseData:isBoxEmpty()then
            return true
        end
    end
    return false
end

function SiegeData:canGetRewards()
    local totalDamage = self:getTotal_hurt()

    local rewardList01 = self:_getRewardList(SiegeData.REWARD_TYPE_DAMAGE)
    local rewardList02 = self:_getRewardList(SiegeData.REWARD_TYPE_COUNT )
    local isCanGetRewards = false

    for k,v in ipairs(rewardList01) do
        if totalDamage >= v.target_size*10000 then
            if not self:isHurtRewardGet(v.id) then
                isCanGetRewards = true
                break
            end
        end
    end

    if isCanGetRewards then
        return isCanGetRewards
    end

    for k,v in ipairs(rewardList02) do
        if self:getRewardCount() >= v.target_size then
            if not self:isCountRewardGet(v.id) then
                isCanGetRewards = true
                break
            end
        end
    end

    return isCanGetRewards
end

function SiegeData:_getRewardList(type)
    local level = self:getUserLevel()
    local totalCount = RebelDmgReward.length()
    local rewardList = {}
    for i = 1, totalCount do
        local data = RebelDmgReward.indexOf(i)
        if level >= data.lv_min and level <= data.lv_max and data.type == type then
            table.insert(rewardList, data)
        end
    end
   return rewardList
end

return SiegeData
