
local BaseData = require("app.data.BaseData")
local HistoryHeroUnit = class("HistoryHeroUnit", BaseData)


local schema = {}
schema["id"]				= {"number", 0}
schema["system_id"] 		= {"number", 0} 
schema["break_through"] 	= {"number", 0} 
schema["materials"]         = {"table", {}} -- 当前穿戴装备
schema["config"]            = {"table", {}} --配置表信息

HistoryHeroUnit.schema = schema
function HistoryHeroUnit:ctor(properties)
    HistoryHeroUnit.super.ctor(self)
    if properties then
        self:initData(properties)
    end
end

function HistoryHeroUnit:clear()
end

function HistoryHeroUnit:reset()
end

function HistoryHeroUnit:initData(msg)
    self:setProperties(msg)
end

function HistoryHeroUnit:updateID(id)
    self:setId(id)
end

function HistoryHeroUnit:updateData(data)
    self:setProperties(data)
    local config = require("app.config.historical_hero").get(data.system_id)
    assert(config, "historical_hero can't find base_id = " .. tostring(data.system_id))
    self:setConfig(config)
end

function HistoryHeroUnit:updateSystemId(systemId)
    self:setSystem_id(systemId)

    local config = require("app.config.historical_hero").get(systemId)
	assert(config, "historical_hero can't find base_id = " .. tostring(systemId))
	self:setConfig(config)
end

function HistoryHeroUnit:updateBreakThrough(breakThrough)
    self:setBreak_through(breakThrough)
end

--是否能养成
function HistoryHeroUnit:isCanTrain()
	return true
end

function HistoryHeroUnit:isEquiping()
    local materials = self:getMaterials()
    return #materials > 0
end

function HistoryHeroUnit:createFakeUnit(configId)
    self:updateSystemId(configId)
    self:setId(-1)
    self:setBreak_through(1)
end

function HistoryHeroUnit:isEquiped()
    return G_UserData:getHistoryHero():isStarEquiped(self:getId())
end

--是否拥有武器
function HistoryHeroUnit:haveWeapon()
    local weaponId = self:getConfig().arm
    return G_UserData:getHistoryHero():haveWeapon(weaponId)
end

--是否上阵
function HistoryHeroUnit:isOnFormation()
    return G_UserData:getHistoryHero():isStarEquiped(self:getId())
end

function HistoryHeroUnit:existMaterial(i)
    local t = self:getMaterials()
    if #t == 0 then
        return false
    end
    local material = t[i]
    return material and type(material) == "table" and material.type > 0
end

function HistoryHeroUnit:getMaterialCount()
    local materialCount = 0 -- 肚子里的名将数
    for i = 1, 3 do
        local bExist = self:existMaterial(i)
        if bExist then
            materialCount = materialCount + 1
        end
    end
    return materialCount
end

--材料是否齐备（有一个就算有）
function HistoryHeroUnit:enoughMaterial()
    local HistoryHeroConst = require("app.const.HistoryHeroConst")
    if self:getBreak_through() == 1 then
        return self:haveWeapon()
    elseif self:getBreak_through() == 2 then
        if self:getConfig().color == HistoryHeroConst.QUALITY_PURPLE then
            return false
        elseif self:getConfig().color == HistoryHeroConst.QUALITY_ORANGE then
            return self:orangeEnoughMaterial()
        end
    elseif self:getBreak_through() == 3 then
        return false
    end
end

--橙色升2级材料是否齐备（有一个就算有）
function HistoryHeroUnit:orangeEnoughMaterial()
    local HistoryHeroDataHelper = require("app.utils.data.HistoryHeroDataHelper")
    local HistoryHeroConst = require("app.const.HistoryHeroConst")
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local stepConfig = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(self:getConfig().id, 2)
    local have = false
    for i = 1, HistoryHeroConst.MAX_STEP_MATERIAL do
        local bExist= self:existMaterial(i)
        if stepConfig["type_"..i] > 0 and not bExist then
            if stepConfig["type_"..i] == TypeConvertHelper.TYPE_HISTORY_HERO then
                local configId = stepConfig["value_"..i]
                have = have or G_UserData:getHistoryHero():existLevel2Hero(configId)--存在2级的紫色
            elseif stepConfig["type_"..i] == TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON then
                local configId = stepConfig["value_"..i]
                have = have or G_UserData:getHistoryHero():haveWeapon(configId)
            end
        end
    end
    return have
end

--材料是否齐备（全齐）
function HistoryHeroUnit:materialAllReady()
    local HistoryHeroConst = require("app.const.HistoryHeroConst")
    if self:getBreak_through() == 1 then
        return true
    elseif self:getBreak_through() == 2 then
        local have = true
        for i = 1, HistoryHeroConst.MAX_STEP_MATERIAL do
            local bExist= self:existMaterial(i)
            have = have and bExist
        end
        return have
    elseif self:getBreak_through() == 3 then
        return true
    end
end

-------------------------------------------------------------------------------
--是否存在未上阵的比自己战力高
function HistoryHeroUnit:existStronger()
    -- local list1 = G_UserData:getHistoryHero():getNotInFormationListExcludeSameName()--未上阵排除同名列表
    local list1 = G_UserData:getHistoryHero():getNotInFormationList()--未上阵列表
    -- local list2 = G_UserData:getHistoryHero():getNotInFormationList(self:getConfig().id)--给定configid的未上阵列表

    for _, underFormationData in pairs(list1) do
        if underFormationData:getConfig().color > self:getConfig().color then
            return true
        elseif underFormationData:getConfig().color == self:getConfig().color and
                underFormationData:getBreak_through() > self:getBreak_through() then
            return true
        end
    end
    -- for _, underFormationData in pairs(list2) do
    --     if underFormationData:getConfig().color > self:getConfig().color then
    --         return true
    --     elseif underFormationData:getBreak_through() > self:getBreak_through() then
    --         return true
    --     end
	-- end
	return false
end



return HistoryHeroUnit