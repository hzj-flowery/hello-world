
local BaseData = require("app.data.BaseData")
local BattleUserData = class("BattleUserData", BaseData)

local HeroUnitData = require("app.data.HeroUnitData")
local EquipmentUnitData = require("app.data.EquipmentUnitData")
local TreasureUnitData = require("app.data.TreasureUnitData")
local BattleResourceUnitData = require("app.data.BattleResourceUnitData")
local UserUnitData = require("app.data.UserUnitData")

local schema = {}
BattleUserData.schema = schema

function BattleUserData:ctor(properties)
	BattleUserData.super.ctor(self, properties)

	self._userUnitData = nil
	self._role = nil
	self._playerInfo = nil
	self._heroList = {}
	self._equipmentList = {}
	self._treasureList = {}
	self._embattle = {}
	self._battleResourceList = {}
end

function BattleUserData:clear()
end

function BattleUserData:reset()
	self._userUnitData = nil
	self._role = nil
	self._playerInfo = nil
	self._heroList = {}
	self._equipmentList = {}
	self._treasureList = {}
	self._embattle = {}
	self._battleResourceList = {}
end

function BattleUserData:updateData(message)
	
	local user = rawget(message, "user") 
	local heros = rawget(message, "heros") or {}
	local equipments = rawget(message, "equipments") or {}
	local treasures = rawget(message, "treasures") or {}
	local embattle = rawget(message, "embattle") or {}
	local battleResources = rawget(message, "battle_resources") or {}


	local unitData = UserUnitData.new()
	unitData:updateData(user)
	self._userUnitData = unitData

	self._heroList = {}
	for i, data in ipairs(heros) do
		local unitData = HeroUnitData.new()
		unitData:updateData(data)
		table.insert( self._heroList, unitData )
		if i == 1 then
			self._role = unitData
		end
	end


	self._equipmentList = {}
	for i, data in ipairs(equipments) do
		local unitData = EquipmentUnitData.new()
		unitData:updateData(data)
		self._equipmentList["k_"..tostring(data.id)] = unitData
	end

	self._treasureList = {}
	for i, data in ipairs(treasures) do
		local unitData = TreasureUnitData.new()
		unitData:updateData(data)
		self._treasureList["k_"..tostring(data.id)] = unitData
	end

	
	self._embattle = {}
	for i, data in ipairs(embattle) do
		table.insert( self._embattle, data)
	end
	

	self._battleResourceList = {}
	for i, data in ipairs(battleResources) do
		local unitData = BattleResourceUnitData.new()
		unitData:initData(data)
		self._battleResourceList["k_"..tostring(data.flag).."_"..tostring(data.id)] = unitData
	end

	local covertId,playerInfo = require("app.utils.UserDataHelper").convertAvatarId( 
			{ base_id = self._role:getBase_id(),avatar_base_id =  self._userUnitData:getAvatar_base_id()} )
	self._playerInfo = playerInfo
end

function BattleUserData:getUser()
	return self._userUnitData
end

function BattleUserData:getEmbattle()
	return self._embattle
end

function BattleUserData:getHeros()
	return self._heroList
end

function BattleUserData:getRole()
	return self._role
end


function BattleUserData:getPlayer_info()
	return self._playerInfo
end

return BattleUserData