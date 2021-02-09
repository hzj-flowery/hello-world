--
-- Author: Liangxu
-- Date: 2018-8-27
-- 战马单元数据
local BaseData = require("app.data.BaseData")
local HorseUnitData = class("HorseUnitData", BaseData)
local HorseConst = require("app.const.HorseConst")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")

local schema = {}
schema["id"] 			= {"number", 0} --唯一Id
schema["base_id"]		= {"number", 0} --静态Id
schema["star"]			= {"number", 0} --升星等级
schema["config"] 		= {"table", {}} --配置表信息
schema["equip"]         = {"table", {}} --马具信息
HorseUnitData.schema = schema

function HorseUnitData:ctor(properties)
	HorseUnitData.super.ctor(self, properties)
end

function HorseUnitData:clear()
	
end

function HorseUnitData:reset()
	
end

function HorseUnitData:updateData(data)
	self:setProperties(data)
	local config = HorseDataHelper.getHorseConfig(data.base_id)
	self:setConfig(config)
end

function HorseUnitData:getPos()
	local id = self:getId()
	local data = G_UserData:getBattleResource():getHorseDataWithId(id)
	if data then
		return data:getPos()
	else
		return nil
	end
end

function HorseUnitData:getSlot()
	local id = self:getId()
	local data = G_UserData:getBattleResource():getHorseDataWithId(id)
	if data then
		return data:getSlot()
	else
		return nil
	end
end

function HorseUnitData:isInBattle()
	local id = self:getId()
	local data = G_UserData:getBattleResource():getHorseDataWithId(id)
	if data == nil then
		return false
	else
		return true
	end
end

--是否升星过
function HorseUnitData:isDidUpStar()
	return self:getStar() > 1
end

function HorseUnitData:isUser()
	return self:getId() ~= 0
end

--是否达到了最大星级
function HorseUnitData:isStarLimit()
	local maxStar = HorseConst.HORSE_STAR_MAX
	local star = self:getStar()
	return star >= maxStar
end

--是否可以升星
function HorseUnitData:isCanUpStar()
	
end

return HorseUnitData