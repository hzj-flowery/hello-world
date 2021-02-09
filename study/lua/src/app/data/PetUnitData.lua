-- 玩家拥有的所有武将数据
-- Author: hedili
-- Date: 2018-01-23 15:35:23
--
local BaseData = require("app.data.BaseData")
local PetUnitData = class("PetUnitData", BaseData)
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local schema = {}

-- message Pet {
-- 	optional uint64 id 		= 1; //唯一ID
-- 	optional uint32 base_id = 2; //静态表ID
-- 	optional uint32 level 	= 3; //等级
-- 	optional uint32 exp 	= 4; //经验
-- 	optional uint32 star 	= 5; //星级
-- 	repeated uint32 materials = 6;//橙升红材料
-- 	repeated Award recycle_materials = 7; //橙升红回收材料
-- }

PetUnitData.schema = schema
schema["id"] = {"number", 0} --唯一ID
schema["base_id"] = {"number", 0} --静态表ID
schema["level"] = {"number", 0} --等级
schema["exp"] = {"number", 0} --经验
schema["inital_exp"] = {"number", 0} --初始经验
schema["star"] = {"number", 1} --星级
schema["config"] = {"table", {}} --配置表信息
schema["materials"] = {"table", {}}
schema["recycle_materials"] = {"table", {}}
schema["type"] = {"number", TypeConvertHelper.TYPE_PET}
function PetUnitData:ctor(properties)
	PetUnitData.super.ctor(self, properties)
	self._isUserPet = true
end

function PetUnitData:clear()
end

function PetUnitData:reset()
	self._petList = {}
end

function PetUnitData:updateData(data)
	self:backupProperties()

	self:setProperties(data)
	local config = require("app.config.pet").get(data.base_id)
	assert(config, "pet config can't find base_id = " .. tostring(data.base_id))
	self:setConfig(config)

	if config.initial_star > 0 then
		self:setInital_exp(UserDataHelper.getPetNeedExpWithLevel(config.level, config.color))
	else
		self:setInital_exp(0)
	end
end

function PetUnitData:getPos()
	local petIds = G_UserData:getTeam():getPetIdsInHelpWithZero()
	for i, id in ipairs(petIds) do
		if self:getId() == id then
			return i
		end
	end
	return nil
end

--是否在阵位上
function PetUnitData:isInBattle()
	--上阵
	local petIds = G_UserData:getTeam():getPetIdsInBattle()
	for i, value in ipairs(petIds) do
		if value == self:getId() then
			return true
		end
	end
	return false
end

--护佑
function PetUnitData:isPetBless(...)
	local pos = self:getPos()
	if pos and pos > 0 then
		return true
	else
		return false
	end
end

--是否能养成
function PetUnitData:isCanTrain()
	return true
end

--是否能升星
function PetUnitData:isCanBreak()
	local rankMax = self:getConfig().star_max
	if rankMax == 0 then
		return false
	end
	return true
end

--是否有过升级
function PetUnitData:isDidUpgrade()
	return self:getExp() > self:getInital_exp()
end

--是否有过突破
function PetUnitData:isDidBreak()
	return self:getStar() > self:getConfig().initial_star
end

function PetUnitData:getStarMax(...)
	-- body
	return self:getConfig().star_max
end

function PetUnitData:getInitial_star(...)
	-- body
	return self:getConfig().initial_star
end

function PetUnitData:getLvUpCost(...)
	-- body
	return self:getConfig().color
end

function PetUnitData:getIsRed(...)
	-- body
	return self:getConfig().is_red
end

--获取品质
function PetUnitData:getQuality(...)
	-- body
	return self:getConfig().color
end

function PetUnitData:getFragmentId(...)
	-- body
	return self:getConfig().fragment_id
end

function PetUnitData:isDidTrain()
	local isDidUpgrade = self:isDidUpgrade()
	local isDidBreak = self:isDidBreak()
	if isDidUpgrade or isDidBreak then
		return true
	else
		return false
	end
end

function PetUnitData:getLimitCostCountWithKey(key)
	local limitRes = self:getRecycle_materials()
	for i, info in ipairs(limitRes) do
		if info.Key == key then
			return info.Value
		end
	end
	return 0
end

function PetUnitData:getCurLimitCostCountWithKey(key)
	local limitRes = self:getMaterials()
	return limitRes[key]
end

--------------------------------------------------
---TODO：因该是通过ID==0来判断
function PetUnitData:setUserPet(userPet)
	self._isUserPet = userPet
end

function PetUnitData:isUserPet()
	return self._isUserPet
end

return PetUnitData
