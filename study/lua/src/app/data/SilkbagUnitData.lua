--
-- Author: Liangxu
-- Date: 2018-3-1 17:07:09
-- 锦囊单元数据
local BaseData = require("app.data.BaseData")
local SilkbagUnitData = class("SilkbagUnitData", BaseData)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local SilkbagConst = require("app.const.SilkbagConst")

local schema = {}
schema["id"] 			= {"number", 0}
schema["base_id"] 		= {"number", 0}
schema["type"]			= {"number", 0}
schema["config"]		= {"table", {}}
SilkbagUnitData.schema = schema

function SilkbagUnitData:ctor(properties)
	SilkbagUnitData.super.ctor(self, properties)
end

function SilkbagUnitData:clear()
	
end

function SilkbagUnitData:reset()
	
end

function SilkbagUnitData:updateData(data)
	self:setProperties(data)
	self:setType(TypeConvertHelper.TYPE_SILKBAG)
	local info = require("app.config.silkbag").get(data.base_id)
    assert(info,"silkbag config can't find id = "..tostring(data.base_id))
	self:setConfig(info)
end

function SilkbagUnitData:isWeared()
	local unitData = G_UserData:getSilkbagOnTeam():getUnitDataWithId(self:getId())
	local isWeared = unitData ~= nil
	return isWeared
end

--能否在某个pos位穿上
function SilkbagUnitData:isCanWearWithPos(pos)
	local onlyType = self:getConfig().only
	if onlyType == SilkbagConst.ONLY_TYPE_0 then
		return true
	elseif onlyType == SilkbagConst.ONLY_TYPE_1 then
		local ids = G_UserData:getSilkbagOnTeam():getIdsOnTeamWithPos(pos)
		for i, id in ipairs(ids) do
			local unitData = G_UserData:getSilkbag():getUnitDataWithId(id)
			if unitData:getBase_id() == self:getBase_id() then
				return false
			end
		end
	elseif onlyType == SilkbagConst.ONLY_TYPE_2 then
		for posIndex = 1, 6 do
			local ids = G_UserData:getSilkbagOnTeam():getIdsOnTeamWithPos(posIndex)
			for i, id in ipairs(ids) do
				local unitData = G_UserData:getSilkbag():getUnitDataWithId(id)
				if unitData:getBase_id() == self:getBase_id() then
					return false
				end
			end
		end
	end
	
	return true
end

--获取所穿戴的武将BaseId
function SilkbagUnitData:getHeroBaseIdOfWeared()
	local heroUnitData = self:getHeroDataOfWeared()
	local heroBaseId = 0
	if heroUnitData then
		heroBaseId = heroUnitData:getBase_id()
	end
	return heroBaseId
end

--获取所穿戴的武将的data
function SilkbagUnitData:getHeroDataOfWeared()
	local unitData = G_UserData:getSilkbagOnTeam():getUnitDataWithId(self:getId())
	if unitData then
		local pos = unitData:getPos()
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
		return heroUnitData
	end
	return nil
end

--是否已经穿在了某个pos位上
function SilkbagUnitData:isWearedInPos(pos)
	local unitData = G_UserData:getSilkbagOnTeam():getUnitDataWithId(self:getId())
	if unitData then
		if pos == unitData:getPos() then
			return true
		end
	end
	return false
end

--  是否可出售
function SilkbagUnitData:canBeSold( ... )
	if not self:isWeared() and self:getConfig().recycle_type ~= 0 and self:getConfig().recycle_value ~= 0 and 
	self:getConfig().recycle_size ~= 0 then 
		return true
	end
	return false
end



return SilkbagUnitData