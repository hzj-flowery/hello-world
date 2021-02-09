--
-- Author: hedili
-- Date: 2018-01-25 15:09:42
-- 神兽详情
local ViewBase = require("app.ui.ViewBase")
local PetDetailBaseView = class("PetDetailBaseView",ViewBase)
local PetDetailAttrModule = require("app.scene.view.petDetail.PetDetailAttrModule")
local PetDetailSkillModule = require("app.scene.view.petDetail.PetDetailSkillModule")
local PetDetailTalentModule = require("app.scene.view.petDetail.PetDetailTalentModule")
local PetDetailBriefModule  = require("app.scene.view.petDetail.PetDetailBriefModule")
local PetDetailStarModule = require("app.scene.view.petDetail.PetDetailStarModule")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")

function PetDetailBaseView:ctor(petId, petBaseId, rangeType)
	dump(petId)
	dump(petBaseId)
	if petId then
		self._petUnitData = G_UserData:getPet():getUnitDataWithId(petId)
	else
		local data = {baseId = petBaseId}
		self._petUnitData = G_UserData:getPet():createTempPetUnitData(data)
	end
	self._rangeType = rangeType

	local resource = {
		file = Path.getCSB("PetDetailBaseView", "pet"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {

		}
	}

	PetDetailBaseView.super.ctor(self, resource)
end

function PetDetailBaseView:onCreate()
	self:_updateInfo()
end

function PetDetailBaseView:onEnter()

end

function PetDetailBaseView:onExit()

end

function PetDetailBaseView:buildAttrModule()
	--基础属性
	local petUnitData = self._petUnitData
	self._attrModule = PetDetailAttrModule.new(petUnitData, self._rangeType)
	self._attrModule:showButton(true)
	self._listView:pushBackCustomItem(self._attrModule)
end

function PetDetailBaseView:buildStarModule( ... )
	-- body
	local petUnitData = self._petUnitData
	self._attrModule = PetDetailStarModule.new(petUnitData, self._rangeType)
	self._listView:pushBackCustomItem(self._attrModule)
end

function PetDetailBaseView:buildSkillModule()
	--技能
	local petUnitData = self._petUnitData
	local skillIds = {}
	local PetDataHelper = require("app.utils.data.PetDataHelper")
	local rank = petUnitData:getStar()
	local showSkillIds = PetDataHelper.getPetSkillIds(petUnitData:getBase_id(),rank)
	--for i = 1, 3 do
	--	local skillId = showSkillIds[i]
	--	if skillId > 0 then
	--		table.insert(skillIds, skillId)
	--	end
	--end

	if #showSkillIds > 0 then
		local skillModule = PetDetailSkillModule.new(showSkillIds, true, petUnitData:getBase_id(),rank)
		self._listView:pushBackCustomItem(skillModule)
	end
end



function PetDetailBaseView:buildTalentModule()
	--天赋
	local petUnitData = self._petUnitData
	if petUnitData:isCanBreak() then
	self._talentModule = PetDetailTalentModule.new(petUnitData)
		self._listView:pushBackCustomItem(self._talentModule)
	end
end


function PetDetailBaseView:buildBriefModule()
	local petUnitData = self._petUnitData
	self._briefModule = PetDetailBriefModule.new(petUnitData)
	self._listView:pushBackCustomItem(self._briefModule)
end

function PetDetailBaseView:_updateInfo()
	local petUnitData = self._petUnitData
	local petBaseId = petUnitData:getBase_id()

	self._fileNodeHeroName:setConvertType(TypeConvertHelper.TYPE_PET)
	self._fileNodeHeroName2:setConvertType(TypeConvertHelper.TYPE_PET)
	self._fileNodeHeroName:setName(petBaseId, 0)
	
	self._fileNodeHeroName2:setName(petBaseId, 0)

	self._fileNodeStar:setCount(petUnitData:getStar())
	--国家
	--self._fileNodeCountry:updateUI(petBaseId)
	--武将定位
	--self._fileNodeFeature:setString(petUnitData:getConfig().feature)

	self:_updateListView()
end

function PetDetailBaseView:_updateListView()

	--详情List开始
	self._listView:removeAllChildren()
	--属性
	self:buildAttrModule()
	--星级
	--self:buildStarModule()
	--技能
	self:buildSkillModule()
	--天赋
	self:buildTalentModule()
	--简介
	self:buildBriefModule()

	self._listView:doLayout()
end

--


return PetDetailBaseView