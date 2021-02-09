--
-- Author: Liangxu
-- Date: 2017-9-7 14:06:54
-- 神兵单元数据
local BaseData = require("app.data.BaseData")
local InstrumentUnitData = class("InstrumentUnitData", BaseData)
local InstrumentDataHelper = require("app.utils.data.InstrumentDataHelper")
local InstrumentConst = require("app.const.InstrumentConst")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")

local schema = {}
schema["id"] 			= {"number", 0} --唯一Id
schema["base_id"]		= {"number", 0} --静态Id
schema["level"]			= {"number", 0} --进阶等级
schema["limit_level"]	= {"number", 0} --界限突破等级
schema["limit_res"]		= {"table", {}} --界限资源
schema["config"] 		= {"table", {}} --配置表信息
InstrumentUnitData.schema = schema

function InstrumentUnitData:ctor(properties)
	InstrumentUnitData.super.ctor(self, properties)
end

function InstrumentUnitData:clear()
	
end

function InstrumentUnitData:reset()
	
end

function InstrumentUnitData:updateData(data)
	self:setProperties(data)
	local config = require("app.config.instrument").get(data.base_id)
	assert(config, "instrument config can not find id = "..tostring(data.base_id))
	self:setConfig(config)
end

function InstrumentUnitData:getPos()
	local id = self:getId()
	local data = G_UserData:getBattleResource():getInstrumentDataWithId(id)
	if data then
		return data:getPos()
	else
		return nil
	end
end

function InstrumentUnitData:getSlot()
	local id = self:getId()
	local data = G_UserData:getBattleResource():getInstrumentDataWithId(id)
	if data then
		return data:getSlot()
	else
		return nil
	end
end

function InstrumentUnitData:isInBattle()
	local id = self:getId()
	local data = G_UserData:getBattleResource():getInstrumentDataWithId(id)
	if data == nil then
		return false
	else
		return true
	end
end

--是否进阶过
function InstrumentUnitData:isAdvanced()
	return self:getLevel() >= 1
end

--是否界限过
function InstrumentUnitData:isDidLimit()
	if self:getLimit_level() > 0 then
		return true
	end
	for key = InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1, InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2 do
		local value = self:getLimitCostCountWithKey(key)
		if value > 0 then --有投入过任何材料都算养成过
			return true
		end
	end
	return false
end

--是否养成过
function InstrumentUnitData:isDidTrain()
	local isAdvanced = self:isAdvanced()
	if isAdvanced then
		return true
	else
		return false
	end
end

function InstrumentUnitData:isUser()
	return self:getId() ~= 0
end

--是否达到了最大级
function InstrumentUnitData:isLevelLimit()
	local maxLevel = self:getConfig().level_max
	local level = self:getLevel()
	return level >= maxLevel
end

--是否可以进阶
function InstrumentUnitData:isCanAdvanced()
	local level = self:getLevel()
	local templet = self:getAdvacneTemplateId()
	local config = require("app.config.instrument_level").get(level, templet)
	assert(config, string.format("instrument_level can't find level = %d, templet = %d", level, templet))
	local userLevel = G_UserData:getBase():getLevel()
	local isCan = userLevel >= config.limit_level
	return isCan, config.limit_level
end

--是否能界限突破
function InstrumentUnitData:isCanLimitBreak()
	local rank = self:getConfig().instrument_rank_1
	if rank > 0 then
		return true
	end
	return false
end

--是否解锁了第二个技能
function InstrumentUnitData:isUnlockSecond()
	local level = self:getLevel()
	local unlockLevel = self:getConfig().unlock_1
	if unlockLevel > 0 and level >= unlockLevel then
		return true
	end
	return false
end

--获取界限模板id
function InstrumentUnitData:getLimitTemplateId()
	local templateId = 0
	local info = self:getConfig()
	local templateId = info.instrument_rank_1
	return templateId
end

--获取进阶模板id
function InstrumentUnitData:getAdvacneTemplateId()
	local templateId = 0
	local info = self:getConfig()
	local rankId = info.instrument_rank_1
	local limitLevel = self:getLimit_level()
	if limitLevel > 0 and rankId > 0 then
		templateId = InstrumentDataHelper.getInstrumentRankConfig(rankId, limitLevel).rank_size
	else
		templateId = info.cost
	end
	return templateId
end

function InstrumentUnitData:getLimitCostCountWithKey(key)
	local limitRes = self:getLimit_res()
	for i, info in ipairs(limitRes) do
		if info.Key == key then
			return info.Value
		end
	end
	return 0
end

--获得当前可进阶的最大等级
function InstrumentUnitData:getAdvanceMaxLevel()
	local maxLevel = 0
	local info = self:getConfig()
	if self:isCanLimitBreak() then
		local limitLevel = self:getLimit_level()
		if limitLevel == self:getMaxLimitLevel() then
			maxLevel = info.level_max
		else
			local rankInfo = InstrumentDataHelper.getInstrumentRankConfig(info.instrument_rank_1, limitLevel)
			maxLevel = rankInfo.level
		end
	else
		maxLevel = info.level_max
	end
	return maxLevel
end

--获取神兵所属阵营
function InstrumentUnitData:getCountry()
	local instrumentBaseId = self:getBase_id()
	local heroBaseId = G_UserData:getInstrument():getHeroBaseId(instrumentBaseId)
	local info = HeroDataHelper.getHeroConfig(heroBaseId)
	return info.country
end

function InstrumentUnitData:getMaxLimitLevel()
	local info = self:getConfig()
	local level = 0
	if self:isCanLimitBreak() then
		local rankInfo = InstrumentDataHelper.getInstrumentRankConfig(info.instrument_rank_1, level)
		while rankInfo.cost_silver > 0 and rankInfo.value_1 > 0 and rankInfo.value_2 > 0 do
			level = level + 1
			rankInfo = InstrumentDataHelper.getInstrumentRankConfig(info.instrument_rank_1, level)
		end
	end
	return level
end

function InstrumentUnitData:getLimitFuncShow()
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local quality = self:getConfig().color
	local isShow = false
	if quality == 5 then
		-- if self:getLimit_level() == 0 then
			isShow = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2)
		-- elseif self:getLimit_level() == 1 then
		-- 	isShow = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2_RED)
		-- end
	elseif quality == 6 then
		isShow = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2_RED)
	end
	return isShow
end

function InstrumentUnitData:getLimitFuncOpened()
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local quality = self:getConfig().color
	local open = false
	if quality == 5 then
		if self:getLimit_level() == 0 then
			open = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2)
		elseif self:getLimit_level() == 1 then
			open = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2_RED)
		end
	elseif quality == 6 then
		--红的118级功能开放
		open = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2_RED)
	end
	return open
end

function InstrumentUnitData:getLimitFuncRealOpened()
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local quality = self:getConfig().color
	local open = false
	local comment = nil
	local info = nil
	if quality == 5 then
		if self:getLimit_level() == 0 then
			open, comment, info = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2)
		elseif self:getLimit_level() == 1 then
			open, comment, info = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2_RED)
		end
	elseif quality == 6 then
		open, comment, info = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2_RED)
	end
	return open, comment, info
end

--是否能成为置换者
function InstrumentUnitData:isCanBeTransformSrc()
	local changeType = self:getConfig().change_type
	if changeType == InstrumentConst.TRANSFORM_LIMIT_TYPE_1 or changeType == InstrumentConst.TRANSFORM_LIMIT_TYPE_3 then
		return false
	else
		return true
	end
end

--是否能成为目标者
function InstrumentUnitData:isCanBeTranformTar()
	local changeType = self:getConfig().change_type
	if changeType == InstrumentConst.TRANSFORM_LIMIT_TYPE_2 or changeType == InstrumentConst.TRANSFORM_LIMIT_TYPE_3 then
		return false
	else
		return true
	end
end

return InstrumentUnitData