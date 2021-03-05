-- Author: Conley
-- 英雄属性
local PetDetailAttrModule = require("app.scene.view.petDetail.PetDetailAttrModule")
local PetDetailSkillModule = require("app.scene.view.petDetail.PetDetailSkillModule")
local PetDetailTalentModule = require("app.scene.view.petDetail.PetDetailTalentModule")
local PetDetailBriefModule = require("app.scene.view.petDetail.PetDetailBriefModule")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

local CommonPetProperty = class("CommonPetProperty")

local MODULE_KEY = {
	"_attrModule",
	"_skillModule",
	"_talentModule",
	"_briefModule",
}

local EXPORTED_METHODS = {
    "updateUI",
}

function CommonPetProperty:ctor()
	self._target = nil
end

function CommonPetProperty:_init()
	self._heroName2 = ccui.Helper:seekNodeByName(self._target, "Name2")
    self._listView = ccui.Helper:seekNodeByName(self._target, "ListView")
    self._listView:setScrollBarEnabled(false)
    cc.bind(self._target, "CommonDetailWindow")
	
    if cc.isRegister("CommonHeroName") then
		cc.bind(self._heroName2, "CommonHeroName")
	end
	self._heroName2:setConvertType(TypeConvertHelper.TYPE_PET)
end

function CommonPetProperty:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPetProperty:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonPetProperty:buildAttrModule()
	--基础属性
	local petUnitData = self._petUnitData
	self._attrModule = PetDetailAttrModule.new(petUnitData, self._rangeType)
	self._attrModule:showButton(false)
	self._listView:pushBackCustomItem(self._attrModule)
end


function CommonPetProperty:buildSkillModule()
	--技能
	local petUnitData = self._petUnitData

	local star = 0
	if petUnitData:getConfig().potential_before > 0 then
		--如果是突破来的红神兽，显示1星的技能 ——周振甲
		star = 1
	else
		star = petUnitData:getInitial_star()
	end
	
	local skillIds = {}
	local petStarConfig = UserDataHelper.getPetStarConfig(petUnitData:getBase_id(), star)
	for i = 1, 2 do
		local skillId = petStarConfig["skill"..i]
		if skillId ~= 0 then
			table.insert(skillIds, skillId)
		end
	end

	if #skillIds > 0 then
		self._skillModule = PetDetailSkillModule.new(skillIds,false,petUnitData:getBase_id(), star)
		self._listView:pushBackCustomItem(self._skillModule)
	end
end

--天赋
function CommonPetProperty:buildTalentModule()
	local petUnitData = self._petUnitData
	self._talentModule = PetDetailTalentModule.new(petUnitData)
	self._listView:pushBackCustomItem(self._talentModule)
end


function CommonPetProperty:buildBriefModule()
	local petUnitData = self._petUnitData
	self._briefModule = PetDetailBriefModule.new(petUnitData)
	self._listView:pushBackCustomItem(self._briefModule)
end

function CommonPetProperty:_resetModules()
	self._modules = {}
	for i, key in ipairs(MODULE_KEY) do
		self[key] = nil
	end
end

function CommonPetProperty:_updateListView()
    --详情List开始
	self._listView:removeAllChildren()
	self:_resetModules()

	self:buildAttrModule()
	--技能
	self:buildSkillModule()
	--天赋
	self:buildTalentModule()
	--简介
	self:buildBriefModule()
end


function CommonPetProperty:updateUI(petId, petBaseId, rangeType)
	local star = 0
	if petId then
		self._petUnitData = G_UserData:getPet():getUnitDataWithId(petId)
		star = self._petUnitData:getStar()
	else
		local data = {baseId = petBaseId}
		self._petUnitData = G_UserData:getPet():createTempPetUnitData(data)
	end
	self._rangeType = rangeType

	local moduleKey = self:_getModuleKey()
    self:_updateListView()
    local index, isInBottom = self:_getLocationIndex(moduleKey)
    if isInBottom then
    	self._listView:jumpToBottom()
    else
    	self._listView:jumpToItem(index, cc.p(0, 1), cc.p(0, 1))
    end
  
	self._heroName2:setName(self._petUnitData:getBase_id(), star)
end

function CommonPetProperty:_getModuleKey()
	local offset = self._listView:getInnerContainerPosition()
	local posY = offset.y
	local targetHeight = 0 - posY + self._listView:getContentSize().height / 2

	local modules = {}
	for i, key in ipairs(MODULE_KEY) do
		if self[key] then
			table.insert(modules, key)
		end
	end

	local height = 0
	local index = 1
	for i = #modules, 1, -1 do
		local key = modules[i]
		height = height + self[key]:getContentSize().height
		if height > targetHeight then
			index = i
			break
		end
	end
	local moduleKey = modules[index]
	return moduleKey
end

function CommonPetProperty:_getLocationIndex(moduleKey)
	local index = 0
	local isInBottom = false --要定位的模块是否在底部s
	local modules = {}
	for i, key in ipairs(MODULE_KEY) do
		if self[key] then
			table.insert(modules, key) --存储显示的模块
		end
	end
	for i, key in ipairs(modules) do
		if key == moduleKey then
			index = math.max(0, i - 1) --保证是正数
			break
		end
	end

	--计算位置
	local height = 0
	for i = #modules, index+1, -1 do
		local key = modules[i]
		height = height + self[key]:getContentSize().height
	end
	if height < self._listView:getContentSize().height then
		isInBottom = true
	end

	return index, isInBottom
end

return CommonPetProperty