--
-- Author: Liangxu
-- Date: 2017-06-20 16:53:43
-- 玩家军团信息
local BaseData = require("app.data.BaseData")
local GuildUserData = class("GuildUserData", BaseData)

local schema = {}
schema["leave_time"] = {"number", 0} --上次退会时间
schema["guild_id"] = {"number", 0} --军团id
schema["finish_help_cnt"] = {"number", 0} --军团援助完成次数
schema["get_help_reward"] = {"number", 0} --军团援助奖励领取
schema["ask_help_cnt"] = {"number", 0} --军团援助捐献剩余次数
schema["dungeon_cnt"] = {"number", 0} --副本打了几次
schema["dungeon_atk_time"] = {"number", 0} --副本攻击时间
schema["source_reward"] = {"number", 0} --积分奖励

schema["ask_help_time"] = {"number", 0} --军团援助捐献上次时间
schema["ask_help_buy"] = {"number", 0} --军团援助捐献购买次数

schema["ask_help_cd_sec"] = {"number", 0} --上次援助后的援助cd

schema["receivedBoxIndexList"] = {"table", {}}--军团任务奖励领取
schema["taskDataList"] = {"table", {} }--每个玩法的次数

schema["donate"] = {"number", 0} --捐献 0 还没有捐  非0 (捐献的类型)
schema["donate_reward"] = {"table", {} }--每日捐献奖励
schema["get_red_bag_cnt"] = {"number", 0} --已经抢到的红包数量
schema["create_guild_cnt"] = {"number", 0} --创建公会次数

GuildUserData.schema = schema

function GuildUserData:ctor(properties)
	GuildUserData.super.ctor(self, properties)
	self:_updateData(properties)
end

function GuildUserData:clear()
	
end

function GuildUserData:reset()
end

function GuildUserData:_updateData(message)
	local totalExpReward = rawget(message,"total_exp_reward") or {}
	local receivedBoxIndexList = {}--已领取宝箱的索引列表
	for k,v in ipairs(totalExpReward) do
		receivedBoxIndexList[v] = true
	end

	local taskDataList = {}
	local partCount = rawget(message,"part_count") or {}
	for k,v in ipairs(partCount) do
		taskDataList[v.Key] = v.Value
	end

	local donateRewardList = {}
	for k,v in ipairs(rawget(message,"donate_reward") or {}) do
		donateRewardList[v] = true
	end

	self:setReceivedBoxIndexList(receivedBoxIndexList)
	self:setTaskDataList(taskDataList)
	self:setDonate_reward(donateRewardList)
	
end

function GuildUserData:isBoxReceived(boxId)
	local boxIdList = self:getReceivedBoxIndexList()
	return boxIdList[boxId]
end

function GuildUserData:setBoxReceived(boxId)
	local boxIdList = self:getReceivedBoxIndexList()
	boxIdList[boxId] = true
end

function GuildUserData:isContributionBoxReceived(boxId)
	local boxIdList = self:getDonate_reward()
	return boxIdList[boxId]
end

function GuildUserData:setContributionBoxReceived(boxId)
	local boxIdList = self:getDonate_reward()
	boxIdList[boxId] = true
end

function GuildUserData:addContributionCount(count)
	--local newCount = self:getDonate() + count
	--self:setDonate(newCount)
end


return GuildUserData