-- Author: Conley
--  历代名将属性
local HeroDetailAttrModule = require("app.scene.view.heroDetail.HeroDetailAttrModule")
local HeroDetailSkillModule = require("app.scene.view.heroDetail.HeroDetailSkillModule")
local HeroDetailBriefModule = require("app.scene.view.heroDetail.HeroDetailBriefModule")


local UserDataHelper = require("app.utils.UserDataHelper")

local CommonHistoryHeroProperty = class("CommonHistoryHeroProperty")

local MODULE_KEY = {
	"_attrModule",
	"_skillModule",
	"_briefModule",
}

local EXPORTED_METHODS = {
    "updateUI",
}

function CommonHistoryHeroProperty:ctor()
	self._target = nil
end

function CommonHistoryHeroProperty:_init()
    self._listView = ccui.Helper:seekNodeByName(self._target, "ListView")
    self._listView:setScrollBarEnabled(false)
end

function CommonHistoryHeroProperty:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHistoryHeroProperty:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonHistoryHeroProperty:buildAttrModule()
	--基础属性
	local heroUnitData = self._heroUnitData
	self._attrModule = HeroDetailAttrModule.new(heroUnitData, self._rangeType)
	self._listView:pushBackCustomItem(self._attrModule)


end


function CommonHistoryHeroProperty:buildSkillModule()
	--技能
	local heroUnitData = self._heroUnitData

	local skillIds = {}
	local limitLevel = self._heroUnitData:getLimit_level()
	local limitRedLevel = self._heroUnitData:getLimit_rtg()
	local heroRankConfig = UserDataHelper.getHeroRankConfig(heroUnitData:getBase_id(), 0, limitLevel, limitRedLevel)
	for i = 1, 3 do
		local skillId = heroRankConfig["rank_skill_"..i]
		if skillId ~= 0 then
			table.insert(skillIds, skillId)
		end
	end

	if #skillIds > 0 then
		self._skillModule = HeroDetailSkillModule.new(skillIds)
		self._listView:pushBackCustomItem(self._skillModule)
	end
end


function CommonHistoryHeroProperty:buildBriefModule()
	local heroUnitData = self._heroUnitData
	self._briefModule = HeroDetailBriefModule.new(heroUnitData)
	self._listView:pushBackCustomItem(self._briefModule)
end

function CommonHistoryHeroProperty:_resetModules()
	self._modules = {}
	for i, key in ipairs(MODULE_KEY) do
		self[key] = nil
	end
end

function CommonHistoryHeroProperty:_updateListView()
    --详情List开始
	self._listView:removeAllChildren()
	self:_resetModules()

    self:buildAttrModule()

	--技能
	self:buildSkillModule()

	--简介
	self:buildBriefModule()
end


function CommonHistoryHeroProperty:updateUI(heroId, heroBaseId, rangeType, limitLevel)
	local rank = 0
	if heroId then
		self._heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
		rank = self._heroUnitData:getRank_lv()
	else
		local data = {baseId = heroBaseId}
		self._heroUnitData = G_UserData:getHero():createTempHeroUnitData(data)
	end
	self._rangeType = rangeType
	self._limitLevel = limitLevel

	local moduleKey = self:_getModuleKey()
    self:_updateListView()
    local index, isInBottom = self:_getLocationIndex(moduleKey)
    if isInBottom then
    	self._listView:jumpToBottom()
    else
    	self._listView:jumpToItem(index, cc.p(0, 1), cc.p(0, 1))
    end
  
end

function CommonHistoryHeroProperty:_getModuleKey()
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

function CommonHistoryHeroProperty:_getLocationIndex(moduleKey)
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

return CommonHistoryHeroProperty