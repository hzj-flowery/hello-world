--
-- Author: Wangyu
-- Date: 2020年2月10日18:13:41
-- 战法单元数据
local BaseData = require("app.data.BaseData")
local TacticsUnitData = class("TacticsUnitData", BaseData)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TacticsConst = require("app.const.TacticsConst")
local TacticsDataHelper = require("app.utils.data.TacticsDataHelper")


local schema = {}
schema["id"] 			= {"number", 0}
schema["base_id"] 		= {"number", 0}
schema["unlocked"] 		= {"boolean", false} 	-- 是否解锁
schema["proficiency"]	= {"number", 0} 		-- 研习的熟练度
schema["hero_id"]		= {"number", 0} 		-- 当前穿戴的英雄id
schema["pos"]			= {"number", 0} 		-- 当前穿戴英雄的槽位
schema["config"]		= {"table", {}} 		-- 配置
schema["studyConfig"]	= {"table", {}} 		-- 消耗的配置


TacticsUnitData.schema = schema

function TacticsUnitData:ctor(properties)
	TacticsUnitData.super.ctor(self, properties)
end

function TacticsUnitData:clear()
	
end

function TacticsUnitData:reset()
	
end

function TacticsUnitData:resetWithDefault(id)
	local data = {tactics_id=0, tactics_type=id, unlocked=false, proficiency=0, hero_id=0, pos=0}
	self:updateData(data)
end

-- 更新数据
function TacticsUnitData:updateData(data)
	self:setProperties(data)
	self:setId(data.tactics_id)
	self:setBase_id(data.tactics_type)

	if data.tactics_id and data.tactics_id>0 then
		self:setUnlocked(true)
	else
		self:setUnlocked(false)
	end
	local info = TacticsDataHelper.getTacticsConfig(data.tactics_type)
	self:setConfig(info)
	local sinfo = TacticsDataHelper.getTacticsStudyConfig(data.tactics_type)
	self:setStudyConfig(sinfo)
end

-- 是否已穿戴
function TacticsUnitData:isWeared()
	local isWeared = self:getHero_id()>0
	return isWeared
end

-- 是否可以装备给某武将，是否可以装备
-- 是否显示
function TacticsUnitData:isShow()
	return true
	-- local openServerDays = G_UserData:getBase():getOpenServerDayNum()
	-- local showDay = self:getConfig().show_day
	-- local res = openServerDays>=showDay
	-- return res
end

-- 是否可以装备
function TacticsUnitData:isCanWear()
	local isUnlocked = self:isUnlocked()
	local isStudied = self:isStudied()
	return isUnlocked and isStudied
end

-- 是否够材料解锁
function TacticsUnitData:isCanUnlock()
	local isUnlocked = self:isUnlocked()
	if isUnlocked then
		return false
	end
	local UserDataHelper = require("app.utils.UserDataHelper")
	-- 解锁材料
	local materials = TacticsDataHelper.getUnlockedMaterials(self)
	for i=1,3 do
		local info = materials[i]
		if info then
			local num = UserDataHelper.getSameCardCount(TypeConvertHelper.TYPE_HERO, info.value)
			if num<info.size then
				return false
			end
		end
	end
	return true
end

-- 是否研习满
function TacticsUnitData:isStudied()
	return self:getProficiency()>=TacticsConst.MAX_PROFICIENCY
end

-- 是否可以装备给某武将
function TacticsUnitData:isCanWearWithPos(pos, filterSlot)
	local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
	local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
	-- 已经装备在身上
	if self:getHero_id()==heroId then
		return false
	end

	local tacticsUnits = {}
	for i=1,3 do
		if i~=filterSlot then
			local id = G_UserData:getBattleResource():getResourceId(pos, 5, i)
			if id and id>0 then
				table.insert(tacticsUnits, G_UserData:getTactics():getUnitDataWithId(id))
			end
		end
	end
	local slotList = G_UserData:getTactics():getUnlockInfoByPos(pos)
	-- 战法位不足
	local num = #slotList+1
	if #tacticsUnits>=num then
		return false
	end

	-- 互斥
	for i,v in ipairs(tacticsUnits) do
		if self:isMutex(v:getBase_id()) then
			return false
		end
	end
	return true
end

-- 是否互斥
function TacticsUnitData:isMutex(id)
	local map1 = TacticsDataHelper.getMutexMap(self:getBase_id())
	local map2 = TacticsDataHelper.getMutexMap(id)
	if map1[id] or map2[self:getBase_id()] then
		return true
	else
		return false
	end
end

--获取所穿戴的武将的data
function TacticsUnitData:getHeroDataOfWeared()
	local heroId = self:getHero_id()
	if heroId>0 then
		local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
		return heroUnitData
	end
	return nil
end

-- 获取武将增加的熟练度
function TacticsUnitData:getStudyNumByHero(heroBaseId)
	local studyInfo = self:getStudyConfig()
	local heroInfo = require("app.utils.data.HeroDataHelper").getHeroConfig(heroBaseId)

	local res = 0
	if heroInfo.country==studyInfo.camp then
		for i=1,3 do
			local needColor = studyInfo["color"..i]
			local pro = studyInfo["proficiency"..i]
			if needColor==heroInfo.color then
				res = pro
				break
			end
		end
	end

	return res
end

return TacticsUnitData