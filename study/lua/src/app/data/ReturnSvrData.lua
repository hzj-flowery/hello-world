---------------------------------------------------------------------
-- Created by: liangxu
-- Date: 2020-02-17 17:42:42
-- 回归服领奖数据
---------------------------------------------------------------------
local BaseData = require("app.data.BaseData")
local ReturnSvrData = class("ReturnSvrData", BaseData)
local ReturnServerDataHelper = require("app.utils.data.ReturnServerDataHelper")

local schema = {}
schema["bonus"] = {"table", {}} --已领取的等级奖励id
schema["packs"] = {"table", {}} --已购买礼包id
schema["vip_max"] = {"number", 0} --回归后可领取的VIP总经验
schema["gold_max"] = {"number", 0} --回归后可领取的元宝总数
schema["cur_vip"] = {"number", 0} --剩余可领取vip经验
schema["cur_gold"] = {"number", 0} --剩余可领取gold数量
schema["commit"] = {"number", 0} --是否已确认回归 0 未 1 已确认 （此数据结构存在，即表明已确认回归，理论上commit肯定等于1）
schema["vip_level"] = {"number", 0} --vip等级
ReturnSvrData.schema = schema

function ReturnSvrData:ctor(properties)
	ReturnSvrData.super.ctor(self, properties)
end

function ReturnSvrData:clear()
end

function ReturnSvrData:reset()
end

function ReturnSvrData:updateData(data)
	self:setProperties(data)
end

--是否所有奖励都已领取
function ReturnSvrData:isAllReceived()
	if self:getCur_vip() == 0 and self:getCur_gold() == 0 then
		return true
	else
		return false
	end
end

--根据id判断是否领取过
function ReturnSvrData:isReceivedWithId(id)
	local bonus = self:getBonus()
	for i, v in ipairs(bonus) do
		if v == id then
			return true
		end
	end
	return false
end

--是否能领
function ReturnSvrData:isCanReceive(id)
	if self:getCur_vip() == 0 and self:getCur_gold() == 0 then --没有可领的了
		return false
	end
	if self:isReceivedWithId(id) then --如果已经领过了，不能领
		return false
	end
	local curLevel = G_UserData:getBase():getLevel()
	local info = ReturnServerDataHelper.getReturnAwardConfig(id)
	if curLevel >= info.level then
		return true
	else
		return false
	end
end

return ReturnSvrData