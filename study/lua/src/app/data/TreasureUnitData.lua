--
-- Author: Liangxu
-- Date: 2017-05-05 15:33:37
-- 宝物单元数据
local BaseData = require("app.data.BaseData")
local TreasureUnitData = class("TreasureUnitData", BaseData)
local ParameterIDConst = require("app.const.ParameterIDConst")
local TreasureConst = require("app.const.TreasureConst")
local Parameter = require("app.config.parameter")
local TreasureDataHelper = require("app.utils.data.TreasureDataHelper")

local schema = {}
schema["id"] 			= {"number", 0} --唯一Id
schema["base_id"] 		= {"number", 0} --静态Id
schema["user_id"] 		= {"number", 0} --玩家Id
schema["level"] 		= {"number", 0} --当前等级
schema["exp"] 			= {"number", 0} --当前经验
schema["history_gold"]  = {"number", 0} --强化消耗银币
schema["refine_level"] 	= {"number", 0} --精炼等级
schema["limit_cost"]	= {"number", 0} --界限突破等级
schema["materials"]		= {"table", {}} --界限资源
schema["recycle_materials"] = {"table", {}} --界限回收材料
schema["config"] 		= {"table", {}} --配置表信息
schema["yokeRelation"] 	= {"boolean", false} --是否有羁绊关系
schema["jades"] 		= {"table", {}} -- 宝物玉石
TreasureUnitData.schema = schema

function TreasureUnitData:ctor(properties)
	TreasureUnitData.super.ctor(self, properties)
	self:_initLimitMaxLvMap()
end

function TreasureUnitData:clear()
	
end

function TreasureUnitData:reset()
	
end

function TreasureUnitData:_initLimitMaxLvMap()
	local tempMaxLvMap = {}
	local TreatureLevelup = require("app.config.treasure_levelup")
	local len = TreatureLevelup.length()
	for i=1,len do
		local item = TreatureLevelup.indexOf(i)
		if tempMaxLvMap[item.templet]==nil then
			tempMaxLvMap[item.templet] = item.level
		else
			tempMaxLvMap[item.templet] = math.max(tempMaxLvMap[item.templet], item.level)
		end
	end
	self._limitStrMaxLvMap = tempMaxLvMap
	
	local tempMaxLvMap = {}
	local TreatureRefine = require("app.config.treasure_refine")
	local len = TreatureRefine.length()
	for i=1,len do
		local item = TreatureRefine.indexOf(i)
		if tempMaxLvMap[item.templet]==nil then
			tempMaxLvMap[item.templet] = item.level
		else
			tempMaxLvMap[item.templet] = math.max(tempMaxLvMap[item.templet], item.level)
		end
	end
	self._limitRefineMaxLvMap = tempMaxLvMap
end

function TreasureUnitData:updateData(data)
	self:setProperties(data)
	local config = require("app.config.treasure").get(data.base_id)
	assert(config, "treasure config can not find id = "..tostring(data.base_id))
	self:setConfig(config)
end

function TreasureUnitData:getPos()
	local id = self:getId()
	local data = G_UserData:getBattleResource():getTreasureDataWithId(id)
	if data then
		return data:getPos()
	else
		return nil
	end
end

function TreasureUnitData:getSlot()
	local id = self:getId()
	local data = G_UserData:getBattleResource():getTreasureDataWithId(id)
	if data then
		return data:getSlot()
	else
		return nil
	end
end

function TreasureUnitData:isInBattle()
	local id = self:getId()
	local data = G_UserData:getBattleResource():getTreasureDataWithId(id)
	if data == nil then
		return false
	else
		return true
	end
end

function TreasureUnitData:getMaxStrLevel()
	local ratio = Parameter.get(ParameterIDConst.MAX_TREASURE_LEVEL).content / 1000
	local addLevel = 0
	local limitLevel = self:getLimit_cost()
	if limitLevel >= TreasureConst.TREASURE_LIMIT_UP_BASE_LEVEL then
		addLevel = self:getAddStrLevelByAllLimit()
	end
	local maxLevel = math.floor(G_UserData:getBase():getLevel() * ratio) + addLevel
	return maxLevel
end

function TreasureUnitData:getMaxRefineLevel()
	local ratio = Parameter.get(ParameterIDConst.MAX_TREASURE_REFINE).content / 1000
	local addLevel = 0
	local limitLevel = self:getLimit_cost()
	if limitLevel >= TreasureConst.TREASURE_LIMIT_UP_BASE_LEVEL then
		addLevel = self:getAddRefineLevelByAllLimit()
	end
	local maxLevel = math.floor(G_UserData:getBase():getLevel() * ratio) + addLevel
	return maxLevel
end

-- 判断宝物界限当前是否显示最高
function TreasureUnitData:isLimitShowTop()
	local limitLevel = self:getLimit_cost()
	local limitUpId = self:getConfig().limit_up_id
	if limitUpId>0 then
		local showLevel = TreasureDataHelper.getLimitShowLv(limitLevel)
		local gameUserLevel = G_UserData:getBase():getLevel()
		if showLevel>gameUserLevel then
			return true
		else
			return false
		end
	else
		return true
	end
end

-- 获取宝物本次界限突破增加的强化等级
-- 如果当前是界限突破最高级别，则返回上次界限突破增加的强化等级
function TreasureUnitData:getAddStrLevelByNextLimit()
	local limitLevel = self:getLimit_cost()
	local limitUpId = self:getConfig().limit_up_id
	local config1, config2
	if limitUpId>0 then
		config1 = self:getConfig()
		config2 = require("app.config.treasure").get(limitUpId)
		assert(config2, "treasure config can not find id = "..tostring(limitUpId))
	elseif limitLevel >= TreasureConst.TREASURE_LIMIT_UP_BASE_LEVEL and limitUpId<=0 then   -- 当前为最高界限级别
		local id = G_UserData:getTreasure():getLimitOrgSrcId(self:getBase_id())
		config1 = require("app.config.treasure").get(id)
		assert(config1, "treasure config can not find id = "..tostring(id))
		config2 = self:getConfig()
	else
		return 0
	end
	local lvTemplet = config1.levelup_templet 	-- 强化模板
	local lvTemplet2 = config2.levelup_templet 	-- 强化模板
	local lvDelta = self._limitStrMaxLvMap[lvTemplet2] - self._limitStrMaxLvMap[lvTemplet]
	return lvDelta
end

-- 获取宝物所有界限突破增加的强化等级
function TreasureUnitData:getAddStrLevelByAllLimit(param)
	local config1
	if self:getLimit_cost()<TreasureConst.TREASURE_LIMIT_UP_BASE_LEVEL then
		config1 = self:getConfig()
	else
		local id = G_UserData:getTreasure():getLimitSrcId(self:getBase_id())
		config1 = require("app.config.treasure").get(id)
		assert(config1, "treasure config can not find id = "..tostring(id))
	end
	local config2
	local limitUpId = self:getConfig().limit_up_id
	local limitLevel = self:getConfig().limit_level
	if param==1 and limitUpId>0 then 	-- 下一界限突破等级
		config2 = require("app.config.treasure").get(limitUpId)
		assert(config2, "treasure config can not find id = "..tostring(limitUpId))
	elseif param==-1 and limitLevel>0 then 		-- 上一界限突破等级
		local id = G_UserData:getTreasure():getLimitOrgSrcId(self:getBase_id())
		config2 = require("app.config.treasure").get(id)
		assert(config2, "treasure config can not find id = "..tostring(id))
	else
		config2 = self:getConfig()
	end

	local lvTemplet = config1.levelup_templet 	-- 强化模板
	local lvTemplet2 = config2.levelup_templet 	-- 强化模板
	local lvDelta = self._limitStrMaxLvMap[lvTemplet2] - self._limitStrMaxLvMap[lvTemplet]
	return lvDelta
end

-- 获取宝物本次界限突破增加的精炼等级
-- 如果当前是界限突破最高级别，则返回上次界限突破增加的精炼等级
function TreasureUnitData:getAddRefineLevelByNextLimit()
	local limitLevel = self:getLimit_cost()
	local limitUpId = self:getConfig().limit_up_id
	local config1, config2
	if limitUpId>0 then
		config1 = self:getConfig()
		config2 = require("app.config.treasure").get(limitUpId)
		assert(config2, "treasure config can not find id = "..tostring(limitUpId))
	elseif limitLevel >= TreasureConst.TREASURE_LIMIT_UP_BASE_LEVEL and limitUpId<=0 then   -- 当前为最高界限级别
		local id = G_UserData:getTreasure():getLimitOrgSrcId(self:getBase_id())
		config1 = require("app.config.treasure").get(id)
		assert(config1, "treasure config can not find id = "..tostring(id))
		config2 = self:getConfig()
	else
		return 0
	end
	local reTemplet = config1.refine_templet 	-- 精炼模板
	local reTemplet2 = config2.refine_templet 	-- 精炼模板
	local reDelta = self._limitRefineMaxLvMap[reTemplet2] - self._limitRefineMaxLvMap[reTemplet]
	return reDelta
end

-- 获取宝物所有界限突破增加的强化等级
-- param -1 表示上一界限突破等级增加的强化等级
-- param 1 表示下一界限突破等级增加的强化等级
function TreasureUnitData:getAddRefineLevelByAllLimit(param)
	local config1
	if self:getLimit_cost()<TreasureConst.TREASURE_LIMIT_UP_BASE_LEVEL then
		config1 = self:getConfig()
	else
		local id = G_UserData:getTreasure():getLimitSrcId(self:getBase_id())
		config1 = require("app.config.treasure").get(id)
		assert(config1, "treasure config can not find id = "..tostring(id))
	end
	local config2
	local limitUpId = self:getConfig().limit_up_id
	local limitLevel = self:getConfig().limit_level
	if param==1 and limitUpId>0 then 	-- 下一界限突破等级
		config2 = require("app.config.treasure").get(limitUpId)
		assert(config2, "treasure config can not find id = "..tostring(limitUpId))
	elseif param==-1 and limitLevel>0 then 		-- 上一界限突破等级
		local id = G_UserData:getTreasure():getLimitOrgSrcId(self:getBase_id())
		config2 = require("app.config.treasure").get(id)
		assert(config2, "treasure config can not find id = "..tostring(id))
	else
		config2 = self:getConfig()
	end

	local reTemplet = config1.refine_templet 	-- 精炼模板
	local reTemplet2 = config2.refine_templet 	-- 精炼模板
	local reDelta = self._limitRefineMaxLvMap[reTemplet2] - self._limitRefineMaxLvMap[reTemplet]
	return reDelta
end

--获取同名卡Id
function TreasureUnitData:getSameCardId()
	local sameCardId = self:getBase_id()
	local limitLevel = self:getLimit_cost()
	if limitLevel >= TreasureConst.TREASURE_LIMIT_UP_BASE_LEVEL then --说明是橙升红宝物，要用橙色胚子
		sameCardId = G_UserData:getTreasure():getLimitSrcId(sameCardId)
	end
	return sameCardId
end

--是否能界限突破
function TreasureUnitData:isCanLimitBreak()
	return self:getConfig().limit_able == 1
end

--是否强化过
function TreasureUnitData:isDidStrengthen()
	return self:getLevel() > 1
end

--是否精炼过
function TreasureUnitData:isDidRefine()
	return self:getRefine_level() > 0
end

--是否界限过
function TreasureUnitData:isDidLimit()
	if self:getLimit_cost() > 0 then
		return true
	end
	for key = TreasureConst.TREASURE_LIMIT_COST_KEY_1, TreasureConst.TREASURE_LIMIT_COST_KEY_4 do
		local value = self:getLimitCostCountWithKey(key)
		if value > 0 then --有投入过任何材料都算养成过
			return true
		end
	end
	return false
end

--是否养成过
function TreasureUnitData:isDidTrain()
	local isDidStrengthen = self:isDidStrengthen()
	local isDidRefine = self:isDidRefine()
	local isDidLimit = self:isDidLimit()
	if isDidStrengthen or isDidRefine or isDidLimit then
		return true
	else
		return false
	end
end

--是否能培养
function TreasureUnitData:isCanTrain()
	local treasureType = self:getConfig().treasure_type
	if treasureType == 0 then --type为0的不能
		return false
	end

	return true
end

function TreasureUnitData:isUserTreasure()
	return self:getId() ~= 0 
end

function TreasureUnitData:getLimitCostCountWithKey(key)
	local limitRes = self:getMaterials()
	for i, value in ipairs(limitRes) do
		if i == key then
			return value
		end
	end
	return 0
end

-----------------------------玉石相关-------------------------------------
-- 是否镶嵌玉石
function TreasureUnitData:isInjectJadeStone()
    local jades = self:getJades()
    for i = 1, #jades do
        if jades[i] > 0 then
            return true
        end
    end
    return false
end

-- 获取相应槽位获取玉石系统id
function TreasureUnitData:getJadeSysIds()
    local jadeSysIds = {}
    local jades = self:getJades()
    for i = 1, #jades do
        if jades[i] > 0 then
            local unitData = G_UserData:getJade():getJadeDataById(jades[i])
            jadeSysIds[i] = unitData:getConfig().id
        else
            jadeSysIds[i] = 0
        end
    end
    return jadeSysIds
end

-- 判断是否已经镶嵌了两颗同玉石
function TreasureUnitData:isHaveTwoSameJade(jadeId)
    local jadeUnit = G_UserData:getJade():getJadeDataById(jadeId)
    local slots = {}
    if not jadeUnit then
        return false
    end
    local jades = self:getJades()
    local count = 0
    for i = 1, #jades do
        if jades[i] > 0 then
            local unitData = G_UserData:getJade():getJadeDataById(jades[i])
            if jadeUnit:getConfig().id == unitData:getConfig().id then
                count = count + 1
                slots[i] = true
            end
        end
    end
    return count >= 2, slots
end

-- 属性玉石是否镶嵌满
function TreasureUnitData:isFullAttrJade()
    local config = self:getConfig()
    local slotinfo = string.split(config.inlay_type, "|")
    local jades = self:getJades()
    for i = 2, #slotinfo do
        if tonumber(slotinfo[i]) > 0 then
            if jades[i] or jades[i] == 0 then
                return false
            else
                if not self:isActiveJade(jades[i]) then
                    return false
                end
            end
        end
    end
    return true
end

-- 玉石是否生效
function TreasureUnitData:isActiveJade(id)
    local unitData = G_UserData:getJade():getJadeDataById(id)
    local UserDataHelper = require("app.utils.UserDataHelper")
    local _, heroBaseId = UserDataHelper.getHeroBaseIdWithTreasureId(self:getId())
    local isSuitable = unitData:isSuitableHero(heroBaseId)
    return isSuitable
end

-- 所有玉石是否镶嵌满
function TreasureUnitData:isFullJade()
    local config = self:getConfig()
    local slotinfo = string.split(config.inlay_type, "|")
    if tonumber(slotinfo[1]) == 0 then
        return false
    end
    local jades = self:getJades()
    for i = 1, #slotinfo do
        if tonumber(slotinfo[i]) > 0 then
            if jades[i] == 0 then
                return false
            else
                if not self:isActiveJade(jades[i]) then
                    return false
                end
            end
        end
    end
    return true
end

-- 设置查看用户数据时的宝物玉石sys_id
function TreasureUnitData:setUserDetailJades(slot, sysId)
    self._userDetailJades = self._userDetailJades or {}
    self._userDetailJades[slot] = sysId
end

function TreasureUnitData:getUserDetailJades()
    return self._userDetailJades 
end

--获取宝物槽数
function TreasureUnitData:getJadeSlotNums()
    local config = self:getConfig()
    local count = 0
    local slotinfo = string.split(config.inlay_type, "|")
    for _, value in pairs(slotinfo) do
        if tonumber(value) > 0 then
            count = count + 1
        end
    end
    return count
end

-- 判断是否已经镶嵌了两颗同玉石
function TreasureUnitData:isHaveTwoSameJade(jadeId)
    local jadeUnit = G_UserData:getJade():getJadeDataById(jadeId)
    local slots = {}
    if not jadeUnit then
        return false
    end
    local jades = self:getJades()
    local count = 0
    for i = 1, #jades do
        if jades[i] > 0 then
            local unitData = G_UserData:getJade():getJadeDataById(jades[i])
            if jadeUnit:getConfig().id == unitData:getConfig().id then
                count = count + 1
                slots[i] = true
            end
        end
    end
    return count >= 2, slots
end


return TreasureUnitData